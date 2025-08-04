import type { LogEntry, LogMessage } from '@/api/agents'
import { buildWsUrl, API_ENDPOINTS } from '@/config/api'

export interface LogSocketOptions {
  lines?: number
  follow?: boolean
}

export interface LogSocketCallbacks {
  onInitial?: (logs: LogEntry[]) => void
  onAppend?: (log: LogEntry) => void
  onError?: (error: string) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onFollowToggled?: (data: { enabled: boolean; websocketActive: boolean }) => void
}

export class LogSocket {
  private socket: WebSocket | null = null
  private callbacks: LogSocketCallbacks = {}
  private heartbeatTimer: number | null = null
  private reconnectTimer: number | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private isManualClose = false

  constructor(
    private namespace: string,
    private agentName: string,
    private options: LogSocketOptions = {},
    callbacks: LogSocketCallbacks = {}
  ) {
    this.callbacks = callbacks
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.isManualClose = false

        // 获取token用于WebSocket认证
        const token = localStorage.getItem('goqgo_token')
        if (!token) {
          const error = '未找到认证token，请先登录'
          console.error('❌', error)
          this.callbacks.onError?.(error)
          reject(new Error(error))
          return
        }

        const params = new URLSearchParams()
        params.append('token', token)

        if (this.options.lines) {
          params.append('lines', this.options.lines.toString())
        }
        if (this.options.follow !== false) {
          params.append('follow', 'true')
        }

        const wsEndpoint = API_ENDPOINTS.WEBSOCKET.AGENT_LOGS(this.namespace, this.agentName)
        const url = `${buildWsUrl(wsEndpoint)}?${params}`
        console.log('🔗 连接日志 WebSocket:', url.replace(token, '***TOKEN***'))

        this.socket = new WebSocket(url)

        this.socket.onopen = () => {
          console.log('✅ 日志 WebSocket 连接成功')
          this.reconnectAttempts = 0
          this.startHeartbeat()
          this.callbacks.onConnect?.()
          resolve()
        }

        this.socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data)
            this.handleMessage(message)
          } catch (error) {
            console.error('❌ 解析日志消息失败:', error, event.data)
            // 如果不是 JSON，尝试作为纯文本处理
            const logEntry: LogEntry = {
              timestamp: new Date().toISOString(),
              level: 'info',
              message: event.data,
              source: 'websocket'
            }
            this.callbacks.onAppend?.(logEntry)
          }
        }

        this.socket.onclose = (event) => {
          console.log('🔌 日志 WebSocket 连接关闭:', event.code, event.reason)
          this.stopHeartbeat()
          this.callbacks.onDisconnect?.()

          if (!this.isManualClose && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect()
          }
        }

        this.socket.onerror = (error) => {
          console.error('❌ 日志 WebSocket 错误:', error)
          this.callbacks.onError?.('WebSocket 连接错误')
          reject(error)
        }
      } catch (error) {
        console.error('❌ 创建日志 WebSocket 失败:', error)
        reject(error)
      }
    })
  }

  disconnect(): void {
    this.isManualClose = true
    this.stopHeartbeat()
    this.clearReconnectTimer()

    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
  }

  private handleMessage(message: LogMessage): void {
    console.log('🔄 处理消息:', message.type, message)

    switch (message.type) {
      case 'initial':
        if (message.data) {
          const logEntries = this.parseLogContent(message.data)
          this.callbacks.onInitial?.(logEntries)
        }
        break

      case 'append':
        if (message.data) {
          const logEntries = this.parseLogContent(message.data)
          logEntries.forEach((log) => {
            this.callbacks.onAppend?.(log)
          })
        }
        break

      case 'follow_toggled':
        console.log('🔄 实时跟踪状态切换:', message.data)
        if (message.data) {
          this.callbacks.onFollowToggled?.(message.data)
        }
        break

      case 'pong':
        console.log('💓 收到心跳响应')
        break

      case 'error':
        console.error('❌ 服务器日志错误:', message.message)
        this.callbacks.onError?.(message.message || '未知错误')
        break

      default:
        console.warn('⚠️ 未知日志消息类型:', message.type, message)
    }
  }

  private parseLogContent(data: any): LogEntry[] {
    console.log('🔄 解析日志内容:', data)

    // 如果 data 已经是 LogEntry 数组，直接返回
    if (Array.isArray(data)) {
      return data
    }

    // 处理后端返回的格式
    if (data.content !== undefined) {
      // 如果content为空字符串或null，返回空数组
      if (!data.content || data.content.trim() === '') {
        return []
      }

      const logLines = data.content.split('\n').filter((line) => line.trim())
      return logLines.map((line) => {
        // 尝试解析时间戳和消息
        const match = line.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}):\s*(.+)$/)
        if (match) {
          return {
            timestamp: new Date(match[1]).toISOString(),
            level: 'info',
            message: match[2],
            source: data.agent || data.source || 'unknown'
          }
        } else {
          return {
            timestamp: data.timestamp
              ? new Date(data.timestamp * 1000).toISOString()
              : new Date().toISOString(),
            level: 'info',
            message: line,
            source: data.agent || data.source || 'unknown'
          }
        }
      })
    }

    // 处理单条日志的情况
    if (data.message || data.content) {
      return [
        {
          timestamp: data.timestamp
            ? new Date(data.timestamp * 1000).toISOString()
            : new Date().toISOString(),
          level: data.level || 'info',
          message: data.message || data.content,
          source: data.agent || data.source || 'unknown'
        }
      ]
    }

    console.warn('⚠️ 无法解析日志内容或内容为空:', data)
    return []
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = window.setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30000) // 30秒心跳
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000) // 指数退避，最大30秒

    console.log(`🔄 ${delay}ms 后尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

    this.reconnectTimer = window.setTimeout(() => {
      this.connect().catch((error) => {
        console.error('❌ 重连失败:', error)
      })
    }, delay)
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  get isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN
  }
}
