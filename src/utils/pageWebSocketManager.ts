// 页面级 WebSocket 管理器 - 每个主页共用一个连接
import { EventEmitter } from '@/utils/EventEmitter'
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
  | 'chat_history'
  | 'user_join'
  | 'user_leave'
  | 'typing'
  | 'log_initial'
  | 'log_append'
  | 'log_history'
  | 'raw_command_result'
  | 'agent_thinking'
  | 'agent_thinking_stream'

// 页面级 WebSocket 连接
class PageWebSocketConnection extends EventEmitter {
  private ws: WebSocket | null = null
  private config: ConnectionConfig
  private reconnectTimer: number | null = null
  private heartbeatTimer: number | null = null
  private reconnectAttempts = 0
  private isManualClose = false
  private componentSubscribers = new Set<string>() // 组件订阅者集合

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

        // 使用默认聊天室连接，支持所有消息类型
        const wsUrl = buildWsUrl(`/ws/namespaces/${this.config.namespace}/chat`) + `?token=${encodeURIComponent(token)}`

        console.log(`🔗 [页面级] 建立 WebSocket 连接 (namespace: ${this.config.namespace}):`, wsUrl.replace(token, '***TOKEN***'))

        this.ws = new WebSocket(wsUrl)

        this.ws.onopen = () => {
          console.log(`✅ [页面级] WebSocket 连接成功 (namespace: ${this.config.namespace})`)
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
            console.error(`❌ [页面级] 解析消息失败:`, error)
            this.emit('error', error)
          }
        }

        this.ws.onclose = (event) => {
          console.log(`🔌 [页面级] WebSocket 连接关闭:`, event.code, event.reason)
          this.stopHeartbeat()
          this.emit('disconnect', { code: event.code, reason: event.reason })
          
          if (!this.isManualClose && this.config.autoReconnect) {
            this.handleReconnect()
          }
        }

        this.ws.onerror = (error) => {
          console.error(`❌ [页面级] WebSocket 错误:`, error)
          this.emit('error', error)
          reject(error)
        }

      } catch (error) {
        console.error(`❌ [页面级] 创建连接失败:`, error)
        reject(error)
      }
    })
  }

  private handleMessage(message: WebSocketMessage) {
    console.log(`📨 [页面级] 收到消息:`, message.type, `订阅者数量: ${this.componentSubscribers.size}`)

    // 发射通用消息事件
    this.emit('message', message)

    // 发射特定类型的事件
    this.emit(message.type as ConnectionEventType, message.data, message)
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= (this.config.maxReconnectAttempts || 5)) {
      console.error(`❌ [页面级] 达到最大重连次数，停止重连`)
      this.emit('error', new Error('达到最大重连次数'))
      return
    }

    this.reconnectAttempts++
    const delay = (this.config.reconnectInterval || 1000) * this.reconnectAttempts

    console.log(`🔄 [页面级] 尝试重连 (${this.reconnectAttempts}/${this.config.maxReconnectAttempts}) 延迟: ${delay}ms`)
    
    this.emit('reconnect', this.reconnectAttempts)

    this.reconnectTimer = window.setTimeout(() => {
      this.connect().catch(error => {
        console.error(`❌ [页面级] 重连失败:`, error)
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
      console.warn(`⚠️ [页面级] WebSocket 未连接，无法发送消息`)
      return false
    }

    try {
      this.ws.send(JSON.stringify(message))
      console.log(`📤 [页面级] 发送消息:`, message.type)
      return true
    } catch (error) {
      console.error(`❌ [页面级] 发送消息失败:`, error)
      this.emit('error', error)
      return false
    }
  }

  disconnect() {
    console.log(`🔌 [页面级] 主动断开连接`)
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
    this.componentSubscribers.clear()
  }

  // 组件订阅管理
  addComponentSubscriber(componentId: string) {
    this.componentSubscribers.add(componentId)
    console.log(`📝 [页面级] 组件订阅: ${componentId}, 总订阅者: ${this.componentSubscribers.size}`)
  }

  removeComponentSubscriber(componentId: string) {
    this.componentSubscribers.delete(componentId)
    console.log(`🗑️ [页面级] 组件取消订阅: ${componentId}, 剩余订阅者: ${this.componentSubscribers.size}`)
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  get subscriberCount(): number {
    return this.componentSubscribers.size
  }

  get subscribers(): string[] {
    return Array.from(this.componentSubscribers)
  }
}

// 页面级 WebSocket 管理器
class PageWebSocketManager {
  private connection: PageWebSocketConnection | null = null
  private static instance: PageWebSocketManager | null = null
  private currentNamespace: string = 'default'

  private constructor() {
    // 页面卸载时清理连接
    window.addEventListener('beforeunload', () => {
      console.log('📄 页面卸载，清理 WebSocket 连接')
      this.disconnect()
    })

    // 页面可见性变化处理
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        console.log('📄 页面隐藏')
      } else {
        console.log('📄 页面显示')
        // 页面重新显示时检查连接状态
        if (this.connection && !this.connection.isConnected) {
          console.log('🔄 页面重新显示，检查连接状态')
          this.connect(this.currentNamespace).catch(error => {
            console.error('❌ 重新连接失败:', error)
          })
        }
      }
    })
  }

  static getInstance(): PageWebSocketManager {
    if (!PageWebSocketManager.instance) {
      PageWebSocketManager.instance = new PageWebSocketManager()
    }
    return PageWebSocketManager.instance
  }

  // 连接到指定 namespace
  async connect(namespace: string = 'default'): Promise<PageWebSocketConnection> {
    // 如果已有连接且 namespace 相同，直接返回
    if (this.connection && this.currentNamespace === namespace && this.connection.isConnected) {
      console.log(`♻️ [页面级] 复用现有连接 (namespace: ${namespace})`)
      return this.connection
    }

    // 如果 namespace 不同，先断开旧连接
    if (this.connection && this.currentNamespace !== namespace) {
      console.log(`🔄 [页面级] Namespace 变更 (${this.currentNamespace} -> ${namespace})，重新连接`)
      this.connection.disconnect()
      this.connection = null
    }

    this.currentNamespace = namespace

    // 创建新连接
    if (!this.connection) {
      console.log(`🆕 [页面级] 创建新连接 (namespace: ${namespace})`)
      this.connection = new PageWebSocketConnection({ namespace })
    }

    // 建立连接
    if (!this.connection.isConnected) {
      await this.connection.connect()
    }

    return this.connection
  }

  // 获取当前连接
  getConnection(): PageWebSocketConnection | null {
    return this.connection
  }

  // 断开连接
  disconnect() {
    if (this.connection) {
      console.log('🔌 [页面级] 断开连接')
      this.connection.disconnect()
      this.connection = null
    }
  }

  // 获取连接状态
  getStatus() {
    return {
      connected: this.connection?.isConnected || false,
      namespace: this.currentNamespace,
      subscribers: this.connection?.subscriberCount || 0,
      subscriberList: this.connection?.subscribers || []
    }
  }
}

// 导出单例实例
export const pageWsManager = PageWebSocketManager.getInstance()

// 组件级 Hook
export class ComponentWebSocketHook {
  private componentId: string
  private connection: PageWebSocketConnection | null = null
  private eventListeners = new Map<string, Function>()

  constructor(componentName: string) {
    this.componentId = `${componentName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  async connect(namespace: string = 'default'): Promise<PageWebSocketConnection> {
    this.connection = await pageWsManager.connect(namespace)
    this.connection.addComponentSubscriber(this.componentId)
    return this.connection
  }

  disconnect() {
    if (this.connection) {
      // 移除所有事件监听器
      this.eventListeners.forEach((listener, eventType) => {
        this.connection!.off(eventType, listener as any)
      })
      this.eventListeners.clear()

      // 取消组件订阅
      this.connection.removeComponentSubscriber(this.componentId)
      this.connection = null
    }
  }

  // 事件监听方法
  on(eventType: ConnectionEventType, listener: (...args: any[]) => void) {
    if (this.connection) {
      this.connection.on(eventType, listener)
      this.eventListeners.set(eventType, listener)
    }
  }

  off(eventType: ConnectionEventType, listener: (...args: any[]) => void) {
    if (this.connection) {
      this.connection.off(eventType, listener)
      this.eventListeners.delete(eventType)
    }
  }

  send(message: WebSocketMessage): boolean {
    return this.connection?.send(message) || false
  }

  get isConnected(): boolean {
    return this.connection?.isConnected || false
  }

  get componentId(): string {
    return this.componentId
  }
}

// Vue Composition API 风格的 Hook
export function usePageWebSocket(componentName: string) {
  const hook = new ComponentWebSocketHook(componentName)
  
  const connect = (namespace: string = 'default') => hook.connect(namespace)
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
    get componentId() { return hook.componentId }
  }
}

// 调试工具
export const pageWsDebug = {
  getStatus: () => pageWsManager.getStatus(),
  disconnect: () => pageWsManager.disconnect(),
  getConnection: () => pageWsManager.getConnection()
}

// 在开发环境下暴露调试工具到全局
if (process.env.NODE_ENV === 'development') {
  (window as any).pageWsDebug = pageWsDebug
}
