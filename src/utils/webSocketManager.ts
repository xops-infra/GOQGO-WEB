// 统一的 WebSocket 连接管理器
import type { ChatMessage } from '@/types/api'
import type { LogEntry } from '@/api/agents'
import { buildWsUrl } from '@/config/api'

// 消息类型定义
export interface WebSocketMessage {
  type: string
  data: any
  timestamp: string
  from: string
  messageId?: string
}

// 回调函数类型
export interface WebSocketCallbacks {
  // 聊天相关
  onChatMessage?: (message: ChatMessage) => void
  onChatHistoryLoaded?: (messages: ChatMessage[]) => void
  onUserJoin?: (user: string) => void
  onUserLeave?: (user: string) => void
  onTyping?: (user: string, isTyping: boolean) => void
  
  // 日志相关
  onLogInitial?: (logs: LogEntry[]) => void
  onLogAppend?: (log: LogEntry) => void
  onLogHistory?: (logs: LogEntry[], hasMore: boolean) => void
  
  // 原始命令相关
  onRawCommandResult?: (result: any) => void
  
  // 通用回调
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: string) => void
  onReconnect?: (attempts: number) => void
}

// 连接配置
export interface ConnectionConfig {
  namespace: string
  agentName?: string
  chatName?: string
  autoReconnect?: boolean
  maxReconnectAttempts?: number
  reconnectInterval?: number
  heartbeatInterval?: number
}

// 连接实例
class WebSocketConnection {
  private ws: WebSocket | null = null
  private config: ConnectionConfig
  private callbacks: WebSocketCallbacks
  private reconnectTimer: number | null = null
  private heartbeatTimer: number | null = null
  private reconnectAttempts = 0
  private isManualClose = false
  private subscribers = new Set<string>() // 订阅者ID集合

  constructor(config: ConnectionConfig, callbacks: WebSocketCallbacks = {}) {
    this.config = {
      autoReconnect: true,
      maxReconnectAttempts: 5,
      reconnectInterval: 1000,
      heartbeatInterval: 30000,
      ...config
    }
    this.callbacks = callbacks
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.isManualClose = false
        
        const token = localStorage.getItem('goqgo_token')
        if (!token) {
          throw new Error('未找到认证token')
        }

        // 构建 WebSocket URL
        let wsUrl: string
        if (this.config.agentName) {
          // Agent 日志连接
          wsUrl = buildWsUrl(`/ws/namespaces/${this.config.namespace}/agents/${this.config.agentName}/logs`)
        } else if (this.config.chatName) {
          // 特定聊天连接
          wsUrl = buildWsUrl(`/ws/namespaces/${this.config.namespace}/chats/${this.config.chatName}`)
        } else {
          // 默认聊天室连接
          wsUrl = buildWsUrl(`/ws/namespaces/${this.config.namespace}/chat`)
        }

        // 添加认证参数
        wsUrl += `?token=${encodeURIComponent(token)}`

        console.log('[WebSocket] 🔗 建立 WebSocket 连接:', wsUrl.replace(token, '***TOKEN***'))

        this.ws = new WebSocket(wsUrl)

        this.ws.onopen = () => {
          console.log('[WebSocket] ✅ WebSocket连接成功')
          this.reconnectAttempts = 0
          this.startHeartbeat()
          this.callbacks.onConnect?.()
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data)
            this.handleMessage(message)
          } catch (error) {
            console.error('[WebSocket] ❌ 解析 WebSocket 消息失败:', error)
          }
        }

        this.ws.onclose = (event) => {
          console.log('[WebSocket] 🔌 WebSocket连接关闭:', event.code, event.reason)
          this.stopHeartbeat()
          this.callbacks.onDisconnect?.()
          
          if (!this.isManualClose && this.config.autoReconnect) {
            this.handleReconnect()
          }
        }

        this.ws.onerror = (error) => {
          console.error('[WebSocket] ❌ WebSocket错误:', error)
          this.callbacks.onError?.(error)
        }

      } catch (error) {
        console.error('❌ 创建 WebSocket 连接失败:', error)
        reject(error)
      }
    })
  }

  private handleMessage(message: WebSocketMessage) {
    console.log('📨 收到 WebSocket 消息:', message.type)

    switch (message.type) {
      // 聊天消息
      case 'chat_message':
        this.callbacks.onChatMessage?.(message.data)
        break
      case 'chat_history':
        this.callbacks.onChatHistoryLoaded?.(message.data.messages)
        break
      case 'user_join':
        this.callbacks.onUserJoin?.(message.data.user)
        break
      case 'user_leave':
        this.callbacks.onUserLeave?.(message.data.user)
        break
      case 'typing':
        this.callbacks.onTyping?.(message.data.user, message.data.isTyping)
        break

      // 日志消息
      case 'log_initial':
        this.callbacks.onLogInitial?.(message.data.logs)
        break
      case 'log_append':
        this.callbacks.onLogAppend?.(message.data)
        break
      case 'log_history':
        this.callbacks.onLogHistory?.(message.data.logs, message.data.hasMore)
        break

      // 原始命令结果
      case 'raw_command_result':
        this.callbacks.onRawCommandResult?.(message.data)
        break

      // 心跳响应
      case 'pong':
        // 心跳响应，无需处理
        break

      default:
        console.warn('⚠️ 未知的消息类型:', message.type)
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= (this.config.maxReconnectAttempts || 5)) {
      console.error('❌ 达到最大重连次数，停止重连')
      return
    }

    this.reconnectAttempts++
    const delay = (this.config.reconnectInterval || 1000) * this.reconnectAttempts

    console.log(`🔄 尝试重连 (${this.reconnectAttempts}/${this.config.maxReconnectAttempts}) 延迟: ${delay}ms`)
    
    this.callbacks.onReconnect?.(this.reconnectAttempts)

    this.reconnectTimer = window.setTimeout(() => {
      this.connect().catch(error => {
        console.error('❌ 重连失败:', error)
      })
    }, delay)
  }

  private startHeartbeat() {
    if (this.config.heartbeatInterval && this.config.heartbeatInterval > 0) {
      this.heartbeatTimer = window.setInterval(() => {
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.send({
            type: 'ping',
            data: {},
            timestamp: new Date().toISOString(),
            from: 'client'
          })
        }
      }, this.config.heartbeatInterval)
    }
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  send(message: WebSocketMessage): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('⚠️ WebSocket 未连接，无法发送消息')
      return false
    }

    try {
      this.ws.send(JSON.stringify(message))
      return true
    } catch (error) {
      console.error('❌ 发送 WebSocket 消息失败:', error)
      return false
    }
  }

  disconnect() {
    this.isManualClose = true
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    
    this.stopHeartbeat()
    
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  // 添加订阅者
  addSubscriber(subscriberId: string) {
    this.subscribers.add(subscriberId)
  }

  // 移除订阅者
  removeSubscriber(subscriberId: string) {
    this.subscribers.delete(subscriberId)
    
    // 如果没有订阅者了，可以考虑关闭连接
    if (this.subscribers.size === 0) {
      console.log('📝 没有订阅者，保持连接以备后用')
      // 这里可以选择是否关闭连接，或者设置一个延迟关闭
    }
  }

  get subscriberCount(): number {
    return this.subscribers.size
  }
}

// 全局 WebSocket 管理器
class WebSocketManager {
  private connections = new Map<string, WebSocketConnection>()
  private static instance: WebSocketManager | null = null

  private constructor() {}

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager()
    }
    return WebSocketManager.instance
  }

  // 生成连接键
  private generateConnectionKey(config: ConnectionConfig): string {
    const parts = [config.namespace]
    if (config.agentName) parts.push('agent', config.agentName)
    if (config.chatName) parts.push('chat', config.chatName)
    return parts.join(':')
  }

  // 获取或创建连接
  async getConnection(
    config: ConnectionConfig, 
    callbacks: WebSocketCallbacks = {},
    subscriberId: string
  ): Promise<WebSocketConnection> {
    const key = this.generateConnectionKey(config)
    
    let connection = this.connections.get(key)
    
    if (!connection) {
      console.log('[WebSocket] 🆕 创建新的 WebSocket 连接:', key)
      connection = new WebSocketConnection(config, callbacks)
      this.connections.set(key, connection)
      await connection.connect()
    } else {
      console.log('[WebSocket] ♻️ 复用现有的 WebSocket 连接:', key)
      // 合并回调函数
      this.mergeCallbacks(connection, callbacks)
    }

    // 添加订阅者
    connection.addSubscriber(subscriberId)
    
    return connection
  }

  // 合并回调函数
  private mergeCallbacks(connection: WebSocketConnection, newCallbacks: WebSocketCallbacks) {
    // 这里需要实现回调函数的合并逻辑
    // 可以使用事件发射器模式或者回调函数数组
    console.log('[WebSocket] 🔄 合并回调函数 (待实现)')
  }

  // 释放连接
  releaseConnection(config: ConnectionConfig, subscriberId: string) {
    const key = this.generateConnectionKey(config)
    const connection = this.connections.get(key)
    
    if (connection) {
      connection.removeSubscriber(subscriberId)
      
      // 如果没有订阅者了，延迟关闭连接
      if (connection.subscriberCount === 0) {
        console.log('[WebSocket] ⏰ 设置延迟关闭连接:', key)
        setTimeout(() => {
          if (connection.subscriberCount === 0) {
            console.log('[WebSocket] 🗑️ 关闭无订阅者的连接:', key)
            connection.disconnect()
            this.connections.delete(key)
          }
        }, 30000) // 30秒后关闭
      }
    }
  }

  // 获取连接状态
  getConnectionStatus(): { [key: string]: { connected: boolean; subscribers: number } } {
    const status: { [key: string]: { connected: boolean; subscribers: number } } = {}
    
    this.connections.forEach((connection, key) => {
      status[key] = {
        connected: connection.isConnected,
        subscribers: connection.subscriberCount
      }
    })
    
    return status
  }

  // 关闭所有连接
  disconnectAll() {
    console.log('[WebSocket] 🔌 关闭所有 WebSocket 连接')
    this.connections.forEach((connection, key) => {
      console.log('[WebSocket] 🔌 关闭连接:', key)
      connection.disconnect()
    })
    this.connections.clear()
  }
}

// 导出单例实例
export const webSocketManager = WebSocketManager.getInstance()

// 便捷函数
export async function createChatConnection(
  namespace: string, 
  callbacks: WebSocketCallbacks,
  subscriberId: string,
  chatName?: string
): Promise<WebSocketConnection> {
  return webSocketManager.getConnection(
    { namespace, chatName },
    callbacks,
    subscriberId
  )
}

export async function createLogConnection(
  namespace: string,
  agentName: string,
  callbacks: WebSocketCallbacks,
  subscriberId: string
): Promise<WebSocketConnection> {
  return webSocketManager.getConnection(
    { namespace, agentName },
    callbacks,
    subscriberId
  )
}

export function releaseConnection(
  namespace: string,
  subscriberId: string,
  agentName?: string,
  chatName?: string
) {
  webSocketManager.releaseConnection(
    { namespace, agentName, chatName },
    subscriberId
  )
}
