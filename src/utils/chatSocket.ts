import type { ChatMessage } from '@/types/api'

export interface SocketCallbacks {
  onMessage?: (message: ChatMessage) => void
  onHistoryLoaded?: (messages: ChatMessage[]) => void
  onUserJoin?: (user: string) => void
  onUserLeave?: (user: string) => void
  onTyping?: (user: string, isTyping: boolean) => void
  onStatus?: (connected: boolean) => void
  onError?: (error: any) => void
}

export class ChatSocket {
  private ws: WebSocket | null = null
  private namespace: string
  private chatName: string
  private username: string
  private callbacks: SocketCallbacks = {}
  private reconnectTimer: number | null = null
  private pingTimer: number | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  
  constructor(username: string = 'xops') {
    this.namespace = 'default'
    this.chatName = 'default'
    this.username = username
  }
  
  connect(namespace: string, chatName: string = 'default', callbacks: SocketCallbacks = {}) {
    this.namespace = namespace
    this.chatName = chatName
    this.callbacks = callbacks
    this.reconnectAttempts = 0
    
    this.doConnect()
  }
  
  private doConnect() {
    if (this.ws) {
      this.ws.close()
    }
    
    // 修复WebSocket连接URL，添加用户名参数
    const wsUrl = `ws://localhost:8080/ws/namespaces/${this.namespace}/chat?username=${this.username}`
    console.log('🔌 连接WebSocket:', wsUrl)
    
    this.ws = new WebSocket(wsUrl)
    
    this.ws.onopen = () => {
      console.log('✅ WebSocket连接成功, 用户:', this.username, '命名空间:', this.namespace)
      this.reconnectAttempts = 0
      this.callbacks.onStatus?.(true)
      this.startPing()
      
      // 连接成功后请求历史消息
      this.requestHistory()
    }
    
    this.ws.onclose = (event) => {
      console.log('❌ WebSocket连接关闭:', event.code, event.reason)
      this.callbacks.onStatus?.(false)
      this.stopPing()
      
      // 如果不是主动关闭，尝试重连
      if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnect()
      }
    }
    
    this.ws.onerror = (error) => {
      console.error('❌ WebSocket错误:', error)
      this.callbacks.onError?.(error)
    }
    
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        this.handleMessage(data)
      } catch (error) {
        console.error('解析消息失败:', error, 'Raw data:', event.data)
      }
    }
  }
  
  private handleMessage(data: any) {
    console.log('📨 收到WebSocket消息:', data.type, data)
    
    switch (data.type) {
      case 'message':
        this.callbacks.onMessage?.(data.payload)
        break
        
      case 'history':
        console.log('📜 收到历史消息:', data.payload?.length || 0, '条')
        this.callbacks.onHistoryLoaded?.(data.payload || [])
        break
        
      case 'user_join':
        console.log('👤 用户加入:', data.payload?.user || data.payload)
        this.callbacks.onUserJoin?.(data.payload?.user || data.payload)
        break
        
      case 'user_leave':
        console.log('👤 用户离开:', data.payload?.user || data.payload)
        this.callbacks.onUserLeave?.(data.payload?.user || data.payload)
        break
        
      case 'typing':
        this.callbacks.onTyping?.(data.payload.user, data.payload.isTyping)
        break
        
      case 'pong':
        // 心跳响应
        console.log('💓 收到心跳响应')
        break
        
      case 'error':
        console.error('❌ 服务器错误:', data.payload)
        this.callbacks.onError?.(data.payload)
        break
        
      default:
        console.warn('未知的消息类型:', data.type, data)
    }
  }
  
  private requestHistory(limit: number = 50, before?: string) {
    console.log('📜 请求历史消息, limit:', limit, 'before:', before)
    this.send({
      type: 'get_history',
      payload: { limit, before }
    })
  }
  
  // 加载更多历史消息（用于滚动加载）
  loadMoreHistory(beforeMessageId: string, limit: number = 20) {
    this.requestHistory(limit, beforeMessageId)
  }
  
  sendMessage(content: string, messageType: string = 'text') {
    const message = {
      type: 'send_message',
      payload: {
        content,
        messageType,
        timestamp: new Date().toISOString(),
        username: this.username
      }
    }
    
    console.log('📤 发送消息:', message)
    this.send(message)
  }
  
  sendTyping(isTyping: boolean) {
    this.send({
      type: 'typing',
      payload: { 
        isTyping,
        username: this.username
      }
    })
  }
  
  private send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    } else {
      console.warn('WebSocket未连接，无法发送消息:', data)
      // 尝试重连
      if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
        this.doConnect()
      }
    }
  }
  
  private reconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }
    
    this.reconnectAttempts++
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
    
    console.log(`🔄 ${delay}ms后尝试第${this.reconnectAttempts}次重连...`)
    
    this.reconnectTimer = window.setTimeout(() => {
      this.doConnect()
    }, delay)
  }
  
  private startPing() {
    this.stopPing()
    this.pingTimer = window.setInterval(() => {
      console.log('💓 发送心跳')
      this.send({ type: 'ping' })
    }, 30000)
  }
  
  private stopPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer)
      this.pingTimer = null
    }
  }
  
  // 设置用户名
  setUsername(username: string) {
    this.username = username
    console.log('👤 设置用户名:', username)
  }
  
  // 获取当前用户名
  getUsername(): string {
    return this.username
  }
  
  // 获取连接信息
  getConnectionInfo() {
    return {
      namespace: this.namespace,
      chatName: this.chatName,
      username: this.username,
      connected: this.isConnected,
      wsUrl: `ws://localhost:8080/ws/namespaces/${this.namespace}/chat?username=${this.username}`
    }
  }
  
  disconnect() {
    console.log('🔌 主动断开WebSocket连接')
    
    this.stopPing()
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }
    
    this.callbacks = {}
  }
  
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}
