import { ChatSocket } from './chatSocket'
import type { SocketCallbacks } from './chatSocket'

export interface ReconnectConfig {
  maxAttempts: number
  baseDelay: number
  maxDelay: number
  backoffFactor: number
  enableHeartbeat: boolean
  heartbeatInterval: number
}

export interface ConnectionState {
  namespace: string
  isConnected: boolean
  reconnectAttempts: number
  lastConnectedTime: number
  lastDisconnectReason?: string
  pendingMessages: Array<{
    tempId: string
    content: string
    timestamp: number
    retryCount: number
  }>
}

export class SocketReconnectManager {
  private socket: ChatSocket | null = null
  private callbacks: SocketCallbacks = {}
  private config: ReconnectConfig
  private state: ConnectionState
  private reconnectTimer: number | null = null
  private heartbeatTimer: number | null = null
  private visibilityChangeHandler: (() => void) | null = null
  private beforeUnloadHandler: (() => void) | null = null
  
  // 状态持久化key
  private readonly STORAGE_KEY = 'goqgo_socket_state'
  
  constructor(config: Partial<ReconnectConfig> = {}) {
    this.config = {
      maxAttempts: 10,
      baseDelay: 1000,
      maxDelay: 30000,
      backoffFactor: 2,
      enableHeartbeat: true,
      heartbeatInterval: 30000,
      ...config
    }
    
    this.state = {
      namespace: 'default',
      isConnected: false,
      reconnectAttempts: 0,
      lastConnectedTime: 0,
      pendingMessages: []
    }
    
    this.setupEventListeners()
    this.restoreState()
  }

  /**
   * 连接到聊天室
   */
  connect(namespace: string, callbacks: SocketCallbacks = {}) {
    console.log('🔌 SocketReconnectManager 开始连接:', namespace)
    
    this.state.namespace = namespace
    this.callbacks = callbacks
    this.state.reconnectAttempts = 0
    
    this.doConnect()
    this.saveState()
  }

  /**
   * 执行实际连接
   */
  private doConnect() {
    if (this.socket) {
      this.socket.disconnect()
    }

    this.socket = new ChatSocket()
    
    // 包装回调函数以添加重连逻辑
    const wrappedCallbacks: SocketCallbacks = {
      ...this.callbacks,
      
      onStatus: (connected) => {
        this.state.isConnected = connected
        
        if (connected) {
          console.log('✅ Socket连接成功')
          this.state.lastConnectedTime = Date.now()
          this.state.reconnectAttempts = 0
          this.startHeartbeat()
          this.resendPendingMessages()
        } else {
          console.log('❌ Socket连接断开')
          this.stopHeartbeat()
          this.scheduleReconnect()
        }
        
        this.saveState()
        this.callbacks.onStatus?.(connected)
      },
      
      onError: (error) => {
        console.error('❌ Socket错误:', error)
        this.state.lastDisconnectReason = error.message || 'Unknown error'
        this.saveState()
        this.callbacks.onError?.(error)
      },
      
      onMessageSent: (tempId, messageId, status) => {
        if (status === 'success') {
          // 移除已成功发送的消息
          this.removePendingMessage(tempId)
        } else if (status === 'error') {
          // 标记消息为需要重发
          this.markMessageForRetry(tempId)
        }
        
        this.callbacks.onMessageSent?.(tempId, messageId, status)
      }
    }

    this.socket.connect(this.state.namespace, wrappedCallbacks)
  }

  /**
   * 发送消息（带重连保护）
   */
  sendMessage(content: string, messageType: string = 'text', mentionedAgents?: string[]): string {
    if (!this.socket) {
      console.warn('⚠️ Socket未初始化，无法发送消息')
      return ''
    }

    const tempId = this.socket.sendMessage(content, messageType, mentionedAgents)
    
    // 将消息添加到待确认队列
    this.addPendingMessage({
      tempId,
      content,
      timestamp: Date.now(),
      retryCount: 0
    })
    
    return tempId
  }

  /**
   * 安排重连
   */
  private scheduleReconnect() {
    if (this.state.reconnectAttempts >= this.config.maxAttempts) {
      console.error('❌ 达到最大重连次数，停止重连')
      return
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }

    const delay = Math.min(
      this.config.baseDelay * Math.pow(this.config.backoffFactor, this.state.reconnectAttempts),
      this.config.maxDelay
    )

    this.state.reconnectAttempts++
    
    console.log(`🔄 ${delay}ms后尝试第${this.state.reconnectAttempts}次重连...`)

    this.reconnectTimer = window.setTimeout(() => {
      console.log('🔄 执行重连...')
      this.doConnect()
    }, delay)
    
    this.saveState()
  }

  /**
   * 开始心跳检测
   */
  private startHeartbeat() {
    if (!this.config.enableHeartbeat) return
    
    this.stopHeartbeat()
    
    this.heartbeatTimer = window.setInterval(() => {
      if (this.socket?.isConnected) {
        console.log('💓 发送心跳检测')
        // 这里可以发送ping消息或检查连接状态
      } else {
        console.warn('💔 心跳检测失败，连接已断开')
        this.scheduleReconnect()
      }
    }, this.config.heartbeatInterval)
  }

  /**
   * 停止心跳检测
   */
  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  /**
   * 添加待确认消息
   */
  private addPendingMessage(message: ConnectionState['pendingMessages'][0]) {
    this.state.pendingMessages.push(message)
    this.saveState()
  }

  /**
   * 移除待确认消息
   */
  private removePendingMessage(tempId: string) {
    this.state.pendingMessages = this.state.pendingMessages.filter(
      msg => msg.tempId !== tempId
    )
    this.saveState()
  }

  /**
   * 标记消息需要重试
   */
  private markMessageForRetry(tempId: string) {
    const message = this.state.pendingMessages.find(msg => msg.tempId === tempId)
    if (message) {
      message.retryCount++
      this.saveState()
    }
  }

  /**
   * 重发待确认的消息
   */
  private resendPendingMessages() {
    const now = Date.now()
    const maxAge = 5 * 60 * 1000 // 5分钟
    
    // 过滤掉过期的消息
    this.state.pendingMessages = this.state.pendingMessages.filter(
      msg => now - msg.timestamp < maxAge && msg.retryCount < 3
    )
    
    // 重发剩余消息
    for (const message of this.state.pendingMessages) {
      if (message.retryCount < 3) {
        console.log('🔄 重发消息:', message.tempId)
        setTimeout(() => {
          this.socket?.sendMessage(message.content)
        }, 1000 * message.retryCount) // 递增延迟
      }
    }
    
    this.saveState()
  }

  /**
   * 设置页面可见性和卸载事件监听
   */
  private setupEventListeners() {
    // 页面可见性变化处理
    this.visibilityChangeHandler = () => {
      if (document.hidden) {
        console.log('📱 页面隐藏，保存状态')
        this.saveState()
      } else {
        console.log('📱 页面显示，检查连接状态')
        this.checkConnectionHealth()
      }
    }
    
    // 页面卸载前保存状态
    this.beforeUnloadHandler = () => {
      console.log('📱 页面即将卸载，保存状态')
      this.saveState()
    }
    
    document.addEventListener('visibilitychange', this.visibilityChangeHandler)
    window.addEventListener('beforeunload', this.beforeUnloadHandler)
  }

  /**
   * 检查连接健康状态
   */
  private checkConnectionHealth() {
    const now = Date.now()
    const timeSinceLastConnect = now - this.state.lastConnectedTime
    
    // 如果超过1分钟没有连接，或者连接状态不正确，尝试重连
    if (!this.state.isConnected || timeSinceLastConnect > 60000) {
      console.log('🔍 检测到连接异常，尝试重连')
      this.doConnect()
    }
  }

  /**
   * 保存状态到localStorage
   */
  private saveState() {
    try {
      const stateToSave = {
        ...this.state,
        // 只保存最近的待确认消息
        pendingMessages: this.state.pendingMessages.slice(-10)
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stateToSave))
    } catch (error) {
      console.warn('⚠️ 保存Socket状态失败:', error)
    }
  }

  /**
   * 从localStorage恢复状态
   */
  private restoreState() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY)
      if (saved) {
        const restoredState = JSON.parse(saved)
        this.state = {
          ...this.state,
          ...restoredState,
          isConnected: false, // 重置连接状态
          reconnectAttempts: 0 // 重置重连次数
        }
        console.log('📦 恢复Socket状态:', this.state)
      }
    } catch (error) {
      console.warn('⚠️ 恢复Socket状态失败:', error)
    }
  }

  /**
   * 获取连接状态信息
   */
  getConnectionInfo() {
    return {
      ...this.state,
      config: this.config,
      socketInfo: this.socket?.getConnectionInfo()
    }
  }

  /**
   * 手动触发重连
   */
  forceReconnect() {
    console.log('🔄 手动触发重连')
    this.state.reconnectAttempts = 0
    this.doConnect()
  }

  /**
   * 断开连接并清理
   */
  disconnect() {
    console.log('🔌 断开Socket连接')
    
    // 清理定时器
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    
    this.stopHeartbeat()
    
    // 移除事件监听器
    if (this.visibilityChangeHandler) {
      document.removeEventListener('visibilitychange', this.visibilityChangeHandler)
    }
    if (this.beforeUnloadHandler) {
      window.removeEventListener('beforeunload', this.beforeUnloadHandler)
    }
    
    // 断开socket连接
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    
    // 清理状态
    this.state.isConnected = false
    this.state.pendingMessages = []
    this.saveState()
    
    // 清理localStorage
    localStorage.removeItem(this.STORAGE_KEY)
  }

  /**
   * 获取当前socket实例（用于兼容现有代码）
   */
  get socketInstance() {
    return this.socket
  }

  /**
   * 检查是否已连接
   */
  get isConnected() {
    return this.state.isConnected && this.socket?.isConnected
  }
}
