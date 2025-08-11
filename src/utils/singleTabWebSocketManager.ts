// 单页签 WebSocket 管理器 - 简化版
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
  | 'user_join'
  | 'user_leave'
  | 'typing'

// WebSocket 连接实例
class WebSocketConnection extends EventEmitter {
  private ws: WebSocket | null = null
  private config: ConnectionConfig
  private reconnectTimer: number | null = null
  private heartbeatTimer: number | null = null
  private reconnectAttempts = 0
  private isManualClose = false
  private connectionKey: string

  constructor(config: ConnectionConfig, connectionKey: string) {
    super()
    this.config = {
      autoReconnect: true,
      maxReconnectAttempts: 5,
      reconnectInterval: 1000,
      heartbeatInterval: 30000,
      ...config
    }
    this.connectionKey = connectionKey
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
          // Agent 相关连接（日志 + 原始命令，复用聊天连接）
          wsUrl = buildWsUrl(`/ws/namespaces/${this.config.namespace}/chat`)
        } else if (this.config.chatName) {
          // 特定聊天连接
          wsUrl = buildWsUrl(`/ws/namespaces/${this.config.namespace}/chats/${this.config.chatName}`)
        } else {
          // 默认聊天室连接
          wsUrl = buildWsUrl(`/ws/namespaces/${this.config.namespace}/chat`)
        }

        // 添加认证参数
        wsUrl += `?token=${encodeURIComponent(token)}`

        console.log(`🔗 [${this.connectionKey}] 建立 WebSocket 连接:`, wsUrl.replace(token, '***TOKEN***'))

        this.ws = new WebSocket(wsUrl)

        this.ws.onopen = () => {
          console.log(`✅ [${this.connectionKey}] WebSocket 连接成功`)
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
            console.error(`❌ [${this.connectionKey}] 解析消息失败:`, error)
            this.emit('error', error)
          }
        }

        this.ws.onclose = (event) => {
          console.log(`🔌 [${this.connectionKey}] WebSocket 连接关闭:`, event.code, event.reason)
          this.stopHeartbeat()
          this.emit('disconnect', { code: event.code, reason: event.reason })
          
          if (!this.isManualClose && this.config.autoReconnect) {
            this.handleReconnect()
          }
        }

        this.ws.onerror = (error) => {
          console.error(`❌ [${this.connectionKey}] WebSocket 错误:`, error)
          this.emit('error', error)
          reject(error)
        }

      } catch (error) {
        console.error(`❌ [${this.connectionKey}] 创建连接失败:`, error)
        reject(error)
      }
    })
  }

  private handleMessage(message: WebSocketMessage) {
    console.log(`📨 [${this.connectionKey}] 收到消息:`, message.type)

    // 发射通用消息事件
    this.emit('message', message)

    // 发射特定类型的事件
    this.emit(message.type as ConnectionEventType, message.data, message)
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= (this.config.maxReconnectAttempts || 5)) {
      console.error(`❌ [${this.connectionKey}] 达到最大重连次数，停止重连`)
      this.emit('error', new Error('达到最大重连次数'))
      return
    }

    this.reconnectAttempts++
    const delay = (this.config.reconnectInterval || 1000) * this.reconnectAttempts

    console.log(`🔄 [${this.connectionKey}] 尝试重连 (${this.reconnectAttempts}/${this.config.maxReconnectAttempts}) 延迟: ${delay}ms`)
    
    this.emit('reconnect', this.reconnectAttempts)

    this.reconnectTimer = window.setTimeout(() => {
      this.connect().catch(error => {
        console.error(`❌ [${this.connectionKey}] 重连失败:`, error)
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
      console.warn(`⚠️ [${this.connectionKey}] WebSocket 未连接，无法发送消息`)
      return false
    }

    try {
      this.ws.send(JSON.stringify(message))
      console.log(`📤 [${this.connectionKey}] 发送消息:`, message.type)
      return true
    } catch (error) {
      console.error(`❌ [${this.connectionKey}] 发送消息失败:`, error)
      this.emit('error', error)
      return false
    }
  }

  disconnect() {
    console.log(`🔌 [${this.connectionKey}] 主动断开连接`)
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

  get key(): string {
    return this.connectionKey
  }
}

// 单页签 WebSocket 管理器
class SingleTabWebSocketManager {
  private connections = new Map<string, WebSocketConnection>()
  private static instance: SingleTabWebSocketManager | null = null

  private constructor() {
    // 页面卸载时清理所有连接
    window.addEventListener('beforeunload', () => {
      console.log('📄 页面卸载，清理所有 WebSocket 连接')
      this.disconnectAll()
    })

    // 页面隐藏时暂停心跳（可选）
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        console.log('📄 页面隐藏')
      } else {
        console.log('📄 页面显示')
      }
    })
  }

  static getInstance(): SingleTabWebSocketManager {
    if (!SingleTabWebSocketManager.instance) {
      SingleTabWebSocketManager.instance = new SingleTabWebSocketManager()
    }
    return SingleTabWebSocketManager.instance
  }

  // 生成连接键
  private generateConnectionKey(config: ConnectionConfig): string {
    const parts = [config.namespace]
    if (config.agentName) parts.push('agent', config.agentName)
    if (config.chatName) parts.push('chat', config.chatName)
    return parts.join(':')
  }

  // 获取或创建连接
  async getConnection(config: ConnectionConfig): Promise<WebSocketConnection> {
    const key = this.generateConnectionKey(config)
    
    let connection = this.connections.get(key)
    
    if (!connection) {
      console.log('🆕 创建新的 WebSocket 连接:', key)
      connection = new WebSocketConnection(config, key)
      this.connections.set(key, connection)
      await connection.connect()
    } else if (!connection.isConnected) {
      console.log('🔄 重新连接现有的 WebSocket:', key)
      await connection.connect()
    } else {
      console.log('♻️ 复用现有的 WebSocket 连接:', key)
    }
    
    return connection
  }

  // 断开指定连接
  disconnectConnection(config: ConnectionConfig) {
    const key = this.generateConnectionKey(config)
    const connection = this.connections.get(key)
    
    if (connection) {
      console.log('🔌 断开指定连接:', key)
      connection.disconnect()
      this.connections.delete(key)
    }
  }

  // 获取连接状态
  getConnectionStatus(): { [key: string]: { connected: boolean; key: string } } {
    const status: { [key: string]: { connected: boolean; key: string } } = {}
    
    this.connections.forEach((connection, key) => {
      status[key] = {
        connected: connection.isConnected,
        key: connection.key
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

  // 获取所有连接键
  getConnectionKeys(): string[] {
    return Array.from(this.connections.keys())
  }
}

// 导出单例实例
export const singleTabWsManager = SingleTabWebSocketManager.getInstance()

// 便捷的 Hook 风格 API
export class WebSocketHook {
  private connection: WebSocketConnection | null = null
  private config: ConnectionConfig

  constructor(config: ConnectionConfig) {
    this.config = config
  }

  async connect(): Promise<WebSocketConnection> {
    this.connection = await singleTabWsManager.getConnection(this.config)
    return this.connection
  }

  disconnect() {
    if (this.connection) {
      singleTabWsManager.disconnectConnection(this.config)
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

  get connectionKey(): string {
    return this.connection?.key || ''
  }
}

// Vue Composition API 风格的 Hook
export function useWebSocket(config: ConnectionConfig) {
  const hook = new WebSocketHook(config)
  
  const connect = () => hook.connect()
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
    get isConnected() { return hook.isConnected },
    get connectionKey() { return hook.connectionKey }
  }
}

// 调试工具
export const wsDebug = {
  getStatus: () => singleTabWsManager.getConnectionStatus(),
  getConnectionCount: () => singleTabWsManager.connectionCount,
  getConnectionKeys: () => singleTabWsManager.getConnectionKeys(),
  disconnectAll: () => singleTabWsManager.disconnectAll()
}

// 在开发环境下暴露调试工具到全局
if (process.env.NODE_ENV === 'development') {
  (window as any).wsDebug = wsDebug
}
