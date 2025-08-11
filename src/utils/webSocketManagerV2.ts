// 事件驱动的统一 WebSocket 管理器 V2
import { EventEmitter } from './EventEmitter'
import { buildWsUrl } from '@/config/api'

// 消息类型定义
export interface WebSocketMessage {
  type: string
  data: any
  timestamp: string
  from: string
  messageId?: string
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

// 连接事件类型
export type ConnectionEventType = 
  | 'connect' 
  | 'disconnect' 
  | 'error' 
  | 'reconnect'
  | 'message'
  | 'chat_message'
  | 'log_initial'
  | 'log_append'
  | 'raw_command_result'

// 事件驱动的连接实例
class EventDrivenWebSocketConnection extends EventEmitter {
  private ws: WebSocket | null = null
  private config: ConnectionConfig
  private reconnectTimer: number | null = null
  private heartbeatTimer: number | null = null
  private reconnectAttempts = 0
  private isManualClose = false
  private subscribers = new Map<string, Set<string>>() // subscriberId -> eventTypes

  constructor(config: ConnectionConfig) {
    super()
    this.config = {
      autoReconnect: true,
      maxReconnectAttempts: 5,
      reconnectInterval: 1000,
      heartbeatInterval: 30000,
      ...config
    }
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
          // Agent 相关连接（支持日志和原始命令）
          wsUrl = buildWsUrl(`/ws/namespaces/${this.config.namespace}/agents/${this.config.agentName}/logs`)
        } else if (this.config.chatName) {
          // 特定聊天连接
          wsUrl = buildWsUrl(`/ws/namespaces/${this.config.namespace}/chats/${this.config.chatName}`)
        } else {
          // 默认聊天室连接（也支持原始命令）
          wsUrl = buildWsUrl(`/ws/namespaces/${this.config.namespace}/chat`)
        }

        // 添加认证参数
        wsUrl += `?token=${encodeURIComponent(token)}`

        console.log('🔗 建立 WebSocket 连接:', wsUrl.replace(token, '***TOKEN***'))

        this.ws = new WebSocket(wsUrl)

        this.ws.onopen = () => {
          console.log('✅ WebSocket 连接成功')
          this.reconnectAttempts = 0
          this.startHeartbeat()
          this.emit('connect')
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data)
            this.handleMessage(message)
          } catch (error) {
            console.error('❌ 解析 WebSocket 消息失败:', error)
            this.emit('error', error)
          }
        }

        this.ws.onclose = (event) => {
          console.log('🔌 WebSocket 连接关闭:', event.code, event.reason)
          this.stopHeartbeat()
          this.emit('disconnect', { code: event.code, reason: event.reason })
          
          if (!this.isManualClose && this.config.autoReconnect) {
            this.handleReconnect()
          }
        }

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket 错误:', error)
          this.emit('error', error)
          reject(error)
        }

      } catch (error) {
        console.error('❌ 创建 WebSocket 连接失败:', error)
        reject(error)
      }
    })
  }

  private handleMessage(message: WebSocketMessage) {
    console.log('📨 收到 WebSocket 消息:', message.type)

    // 发射通用消息事件
    this.emit('message', message)

    // 发射特定类型的事件
    this.emit(message.type as ConnectionEventType, message.data, message)

    // 兼容旧的事件名称
    switch (message.type) {
      case 'chat_message':
        this.emit('chat_message', message.data)
        break
      case 'log_initial':
        this.emit('log_initial', message.data.logs)
        break
      case 'log_append':
        this.emit('log_append', message.data)
        break
      case 'raw_command_result':
        this.emit('raw_command_result', message.data)
        break
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= (this.config.maxReconnectAttempts || 5)) {
      console.error('❌ 达到最大重连次数，停止重连')
      this.emit('error', new Error('达到最大重连次数'))
      return
    }

    this.reconnectAttempts++
    const delay = (this.config.reconnectInterval || 1000) * this.reconnectAttempts

    console.log(`🔄 尝试重连 (${this.reconnectAttempts}/${this.config.maxReconnectAttempts}) 延迟: ${delay}ms`)
    
    this.emit('reconnect', this.reconnectAttempts)

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
      this.emit('error', error)
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

    // 清理所有事件监听器
    this.removeAllListeners()
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  // 添加订阅者
  addSubscriber(subscriberId: string, eventTypes: string[] = ['message']) {
    if (!this.subscribers.has(subscriberId)) {
      this.subscribers.set(subscriberId, new Set())
    }
    const subscriberEvents = this.subscribers.get(subscriberId)!
    eventTypes.forEach(eventType => subscriberEvents.add(eventType))
    
    console.log(`📝 添加订阅者 ${subscriberId}, 事件: ${eventTypes.join(', ')}`)
  }

  // 移除订阅者
  removeSubscriber(subscriberId: string) {
    this.subscribers.delete(subscriberId)
    console.log(`🗑️ 移除订阅者 ${subscriberId}`)
  }

  get subscriberCount(): number {
    return this.subscribers.size
  }

  getSubscribers(): string[] {
    return Array.from(this.subscribers.keys())
  }
}

// 全局 WebSocket 管理器
class WebSocketManagerV2 {
  private connections = new Map<string, EventDrivenWebSocketConnection>()
  private static instance: WebSocketManagerV2 | null = null

  private constructor() {
    // 页面卸载时清理所有连接
    window.addEventListener('beforeunload', () => {
      this.disconnectAll()
    })
  }

  static getInstance(): WebSocketManagerV2 {
    if (!WebSocketManagerV2.instance) {
      WebSocketManagerV2.instance = new WebSocketManagerV2()
    }
    return WebSocketManagerV2.instance
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
    subscriberId: string,
    eventTypes: string[] = ['message']
  ): Promise<EventDrivenWebSocketConnection> {
    const key = this.generateConnectionKey(config)
    
    let connection = this.connections.get(key)
    
    if (!connection) {
      console.log('🆕 创建新的 WebSocket 连接:', key)
      connection = new EventDrivenWebSocketConnection(config)
      this.connections.set(key, connection)
      await connection.connect()
    } else {
      console.log('♻️ 复用现有的 WebSocket 连接:', key, '订阅者数量:', connection.subscriberCount)
    }

    // 添加订阅者
    connection.addSubscriber(subscriberId, eventTypes)
    
    return connection
  }

  // 释放连接
  releaseConnection(config: ConnectionConfig, subscriberId: string) {
    const key = this.generateConnectionKey(config)
    const connection = this.connections.get(key)
    
    if (connection) {
      connection.removeSubscriber(subscriberId)
      
      // 如果没有订阅者了，延迟关闭连接
      if (connection.subscriberCount === 0) {
        console.log('⏰ 设置延迟关闭连接:', key)
        setTimeout(() => {
          if (connection.subscriberCount === 0) {
            console.log('🗑️ 关闭无订阅者的连接:', key)
            connection.disconnect()
            this.connections.delete(key)
          }
        }, 30000) // 30秒后关闭
      }
    }
  }

  // 获取连接状态
  getConnectionStatus(): { [key: string]: { connected: boolean; subscribers: number; subscriberList: string[] } } {
    const status: { [key: string]: { connected: boolean; subscribers: number; subscriberList: string[] } } = {}
    
    this.connections.forEach((connection, key) => {
      status[key] = {
        connected: connection.isConnected,
        subscribers: connection.subscriberCount,
        subscriberList: connection.getSubscribers()
      }
    })
    
    return status
  }

  // 关闭所有连接
  disconnectAll() {
    console.log('🔌 关闭所有 WebSocket 连接')
    this.connections.forEach((connection, key) => {
      console.log('🔌 关闭连接:', key)
      connection.disconnect()
    })
    this.connections.clear()
  }

  // 获取连接数量
  get connectionCount(): number {
    return this.connections.size
  }

  // 获取总订阅者数量
  get totalSubscribers(): number {
    let total = 0
    this.connections.forEach(connection => {
      total += connection.subscriberCount
    })
    return total
  }
}

// 导出单例实例
export const wsManager = WebSocketManagerV2.getInstance()

// 便捷的 Hook 风格 API
export class WebSocketHook {
  private connection: EventDrivenWebSocketConnection | null = null
  private subscriberId: string
  private config: ConnectionConfig

  constructor(config: ConnectionConfig, subscriberId?: string) {
    this.config = config
    this.subscriberId = subscriberId || `hook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  async connect(eventTypes: string[] = ['message']): Promise<EventDrivenWebSocketConnection> {
    if (!this.connection) {
      this.connection = await wsManager.getConnection(this.config, this.subscriberId, eventTypes)
    }
    return this.connection
  }

  disconnect() {
    if (this.connection) {
      wsManager.releaseConnection(this.config, this.subscriberId)
      this.connection = null
    }
  }

  // 便捷的事件监听方法
  on(eventType: ConnectionEventType, listener: (...args: any[]) => void) {
    if (this.connection) {
      this.connection.on(eventType, listener)
    }
  }

  off(eventType: ConnectionEventType, listener: (...args: any[]) => void) {
    if (this.connection) {
      this.connection.off(eventType, listener)
    }
  }

  send(message: WebSocketMessage): boolean {
    return this.connection?.send(message) || false
  }

  get isConnected(): boolean {
    return this.connection?.isConnected || false
  }
}

// Vue Composition API 风格的 Hook
export function useWebSocket(config: ConnectionConfig, eventTypes: string[] = ['message']) {
  const hook = new WebSocketHook(config)
  
  const connect = () => hook.connect(eventTypes)
  const disconnect = () => hook.disconnect()
  const send = (message: WebSocketMessage) => hook.send(message)
  const on = (eventType: ConnectionEventType, listener: (...args: any[]) => void) => hook.on(eventType, listener)
  const off = (eventType: ConnectionEventType, listener: (...args: any[]) => void) => hook.off(eventType, listener)
  
  return {
    connect,
    disconnect,
    send,
    on,
    off,
    get isConnected() { return hook.isConnected }
  }
}

// 调试工具
export const wsDebug = {
  getStatus: () => wsManager.getConnectionStatus(),
  getConnectionCount: () => wsManager.connectionCount,
  getTotalSubscribers: () => wsManager.totalSubscribers,
  disconnectAll: () => wsManager.disconnectAll()
}

// 在开发环境下暴露调试工具到全局
if (process.env.NODE_ENV === 'development') {
  (window as any).wsDebug = wsDebug
}
