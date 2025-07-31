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
  private callbacks: SocketCallbacks = {}
  private reconnectTimer: number | null = null
  private pingTimer: number | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  
  constructor() {
    this.namespace = 'default'
    this.chatName = 'default'
  }
  
  connect(namespace: string, callbacks: SocketCallbacks = {}) {
    this.namespace = namespace
    this.callbacks = callbacks
    this.reconnectAttempts = 0
    
    this.doConnect()
  }
  
  private doConnect() {
    if (this.ws) {
      this.ws.close()
    }
    
    const wsUrl = `ws://localhost:8080/ws/namespaces/${this.namespace}/chats/${this.chatName}`
    console.log('🔌 连接WebSocket:', wsUrl)
    
    this.ws = new WebSocket(wsUrl)
    
    this.ws.onopen = () => {
      console.log('✅ WebSocket连接成功')
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
        console.error('解析消息失败:', error)
      }
    }
  }
  
  private handleMessage(data: any) {
    switch (data.type) {
      case 'message':
        this.callbacks.onMessage?.(data.payload)
        break
        
      case 'history':
        console.log('📜 收到历史消息:', data.payload?.length || 0, '条')
        this.callbacks.onHistoryLoaded?.(data.payload || [])
        break
        
      case 'user_join':
        this.callbacks.onUserJoin?.(data.payload.user)
        break
        
      case 'user_leave':
        this.callbacks.onUserLeave?.(data.payload.user)
        break
        
      case 'typing':
        this.callbacks.onTyping?.(data.payload.user, data.payload.isTyping)
        break
        
      case 'pong':
        // 心跳响应
        break
        
      default:
        console.warn('未知的消息类型:', data.type)
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
    this.send({
      type: 'send_message',
      payload: {
        content,
        messageType,
        timestamp: new Date().toISOString()
      }
    })
  }
  
  sendTyping(isTyping: boolean) {
    this.send({
      type: 'typing',
      payload: { isTyping }
    })
  }
  
  private send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    } else {
      console.warn('WebSocket未连接，无法发送消息:', data)
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
      this.send({ type: 'ping' })
    }, 30000)
  }
  
  private stopPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer)
      this.pingTimer = null
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
