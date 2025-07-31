import type { ChatMessage } from '@/types/api'

export interface SocketCallbacks {
  onMessage?: (message: ChatMessage) => void
  onHistoryLoaded?: (messages: ChatMessage[]) => void
  onHistoryInfo?: (info: { hasMore: boolean; count: number }) => void
  onUserJoin?: (user: string) => void
  onUserLeave?: (user: string) => void
  onTyping?: (user: string, isTyping: boolean) => void
  onStatus?: (connected: boolean) => void
  onError?: (error: any) => void
}

export class ChatSocket {
  private ws: WebSocket | null = null
  private namespace: string
  private username: string
  private callbacks: SocketCallbacks = {}
  private reconnectTimer: number | null = null
  private pingTimer: number | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  
  constructor(username: string = 'xops') {
    this.namespace = 'default'
    this.username = username
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
    
    // 使用新的WebSocket连接URL格式（移除chatName）
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
      case 'chat':
        // 处理聊天消息，转换字段格式
        const chatMessage = this.normalizeMessage(data.data)
        this.callbacks.onMessage?.(chatMessage)
        break
        
      case 'history':
        console.log('📜 收到历史消息原始数据:', data.data)
        // 服务器返回格式: {"data": {"messages": [...], "hasMore": false}}
        const historyData = data.data
        const rawMessages = historyData?.messages || []
        const hasMore = historyData?.hasMore || false
        
        // 转换消息格式
        const normalizedMessages = rawMessages.map(msg => this.normalizeMessage(msg))
        
        console.log('📜 解析历史消息:', {
          messagesCount: normalizedMessages.length,
          hasMore: hasMore,
          firstMessage: normalizedMessages[0] || null
        })
        
        // 传递消息数组给回调
        this.callbacks.onHistoryLoaded?.(normalizedMessages)
        
        // 如果有hasMore信息，也可以传递给回调（需要扩展接口）
        if (this.callbacks.onHistoryInfo) {
          this.callbacks.onHistoryInfo({ hasMore, count: normalizedMessages.length })
        }
        break
        
      case 'user_join':
        console.log('👤 用户加入:', data.data?.username || data.data)
        this.callbacks.onUserJoin?.(data.data?.username || data.data)
        break
        
      case 'user_leave':
        console.log('👤 用户离开:', data.data?.username || data.data)
        this.callbacks.onUserLeave?.(data.data?.username || data.data)
        break
        
      case 'typing':
        this.callbacks.onTyping?.(data.data.username, data.data.isTyping)
        break
        
      case 'pong':
        // 心跳响应
        console.log('💓 收到心跳响应')
        break
        
      case 'error':
        console.error('❌ 服务器错误:', data.data)
        this.callbacks.onError?.(data.data)
        break
        
      default:
        console.warn('未知的消息类型:', data.type, data)
    }
  }
  
  private requestHistory(limit: number = 50, before?: string) {
    console.log('📜 请求历史消息, limit:', limit, 'before:', before)
    this.send({
      type: 'history_request',
      data: { limit, before }
    })
  }
  
  // 加载更多历史消息（用于滚动加载）
  loadMoreHistory(beforeMessageId: string, limit: number = 20) {
    this.requestHistory(limit, beforeMessageId)
  }
  
  sendMessage(content: string, messageType: string = 'text') {
    const message = {
      type: 'chat',
      data: {
        content,
        type: messageType
      }
    }
    
    console.log('📤 发送消息:', message)
    this.send(message)
  }
  
  sendTyping(isTyping: boolean) {
    this.send({
      type: 'typing',
      data: { 
        isTyping,
        username: this.username
      }
    })
  }
  
  // 转换服务器消息格式为前端格式
  private normalizeMessage(serverMessage: any): ChatMessage {
    return {
      id: serverMessage.id,
      senderId: serverMessage.username || serverMessage.senderId || 'unknown',
      senderName: serverMessage.username || serverMessage.senderName || 'Unknown User',
      senderAvatar: serverMessage.senderAvatar,
      content: serverMessage.content || '',
      timestamp: serverMessage.timestamp || new Date().toISOString(),
      type: serverMessage.type || 'user',
      status: 'sent',
      messageType: this.detectMessageType(serverMessage.content || ''),
      imageUrl: serverMessage.imageUrl,
      imagePath: serverMessage.imagePath
    }
  }
  
  // 检测消息类型
  private detectMessageType(content: string): 'text' | 'image' | 'file' {
    if (content.includes('[图片]') || content.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return 'image'
    }
    if (content.includes('[文件]') || content.match(/\.(pdf|doc|docx|txt|zip|rar)$/i)) {
      return 'file'
    }
    return 'text'
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
