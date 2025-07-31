import type { LogEntry, LogMessage } from '@/api/agents'

export interface LogSocketOptions {
  lines?: number
  follow?: boolean
}

export interface LogSocketCallbacks {
  onInitial?: (logs: LogEntry[]) => void
  onAppend?: (log: LogEntry) => void
  onHistory?: (logs: LogEntry[], hasMore: boolean) => void
  onError?: (error: string) => void
  onConnect?: () => void
  onDisconnect?: () => void
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
        const params = new URLSearchParams()
        
        if (this.options.lines) {
          params.append('lines', this.options.lines.toString())
        }
        if (this.options.follow !== false) {
          params.append('follow', 'true')
        }

        const url = `ws://localhost:8080/ws/namespaces/${this.namespace}/agents/${this.agentName}/logs?${params}`
        console.log('🔗 连接日志 WebSocket:', url)
        console.log('🔗 连接参数:', { namespace: this.namespace, agentName: this.agentName, options: this.options })
        
        this.socket = new WebSocket(url)

        this.socket.onopen = () => {
          console.log('✅ 日志 WebSocket 连接成功')
          this.reconnectAttempts = 0
          this.startHeartbeat()
          this.callbacks.onConnect?.()
          resolve()
        }

        this.socket.onmessage = (event) => {
          console.log('📨 收到 WebSocket 消息:', event.data)
          try {
            // 尝试解析为 JSON
            const message = JSON.parse(event.data)
            console.log('📨 解析后的消息:', message)
            
            // 检查是否是标准的 LogMessage 格式
            if (message.type) {
              this.handleMessage(message)
            } else {
              // 处理后端直接返回的日志格式
              this.handleBackendLogFormat(message)
            }
          } catch (error) {
            console.error('❌ 解析日志消息失败:', error, event.data)
            // 如果不是 JSON，尝试作为纯文本处理
            this.handleTextMessage(event.data)
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

  loadHistory(): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log('📜 请求加载历史日志')
      this.socket.send(JSON.stringify({ type: 'load_history' }))
    }
  }

  private handleMessage(message: LogMessage): void {
    console.log('🔄 处理消息:', message.type, message)
    
    switch (message.type) {
      case 'initial':
        if (message.data && Array.isArray(message.data)) {
          console.log('📋 收到初始日志:', message.data.length, '条')
          this.callbacks.onInitial?.(message.data)
        } else {
          console.warn('⚠️ 初始日志数据格式错误:', message.data)
        }
        break

      case 'append':
        if (message.data && Array.isArray(message.data)) {
          console.log('➕ 收到新日志:', message.data.length, '条')
          message.data.forEach(log => {
            this.callbacks.onAppend?.(log)
          })
        } else if (message.data && !Array.isArray(message.data)) {
          // 处理单条日志的情况
          console.log('➕ 收到新日志: 1 条')
          this.callbacks.onAppend?.(message.data as LogEntry)
        } else {
          console.warn('⚠️ 新日志数据格式错误:', message.data)
        }
        break

      case 'history':
        if (message.data && Array.isArray(message.data)) {
          console.log('📜 收到历史日志:', message.data.length, '条, hasMore:', message.hasMore)
          this.callbacks.onHistory?.(message.data, message.hasMore || false)
        } else {
          console.warn('⚠️ 历史日志数据格式错误:', message.data)
        }
        break

      case 'pong':
        console.log('💓 收到心跳响应')
        // 心跳响应，无需处理
        break

      case 'error':
        console.error('❌ 服务器日志错误:', message.message)
        this.callbacks.onError?.(message.message || '未知错误')
        break

      default:
        console.warn('⚠️ 未知日志消息类型:', message.type, message)
        // 尝试作为日志条目处理
        if (message.timestamp && message.level && message.message) {
          console.log('🔄 尝试作为日志条目处理')
          this.callbacks.onAppend?.(message as unknown as LogEntry)
        }
    }
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
      this.connect().catch(error => {
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

  private handleBackendLogFormat(data: any): void {
    console.log('🔄 处理后端日志格式:', data)
    
    // 处理后端返回的日志格式
    if (data.logs && typeof data.logs === 'string') {
      // 解析日志字符串为日志条目
      const logLines = data.logs.split('\n').filter(line => line.trim())
      const logEntries: LogEntry[] = logLines.map(line => {
        // 尝试解析时间戳和消息
        const match = line.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}):\s*(.+)$/)
        if (match) {
          return {
            timestamp: new Date(match[1]).toISOString(),
            level: 'info',
            message: match[2],
            source: data.agent || 'unknown'
          }
        } else {
          return {
            timestamp: new Date().toISOString(),
            level: 'info',
            message: line,
            source: data.agent || 'unknown'
          }
        }
      })
      
      console.log('📋 解析出日志条目:', logEntries.length, '条')
      
      // 根据是否是初始数据决定回调
      if (data.source === 'log_file' || logEntries.length > 1) {
        this.callbacks.onInitial?.(logEntries)
      } else {
        logEntries.forEach(entry => {
          this.callbacks.onAppend?.(entry)
        })
      }
    } else if (data.message) {
      // 处理单条消息
      const logEntry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: data.level || 'info',
        message: data.message,
        source: data.source || 'unknown'
      }
      this.callbacks.onAppend?.(logEntry)
    }
  }

  private handleTextMessage(text: string): void {
    console.log('🔄 处理文本消息:', text)
    
    // 处理纯文本消息
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message: text,
      source: 'websocket'
    }
    this.callbacks.onAppend?.(logEntry)
  }

  get isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN
  }
}
