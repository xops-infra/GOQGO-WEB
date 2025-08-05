import type { ChatMessage } from '@/types/api'
import { authManager } from './auth'
import { buildWsUrl, API_ENDPOINTS } from '@/config/api'

export interface SocketCallbacks {
  onMessage?: (message: ChatMessage) => void
  onHistoryLoaded?: (messages: ChatMessage[]) => void
  onHistoryInfo?: (info: { hasMore: boolean; count: number }) => void
  onUserJoin?: (user: string) => void
  onUserLeave?: (user: string) => void
  onTyping?: (user: string, isTyping: boolean) => void
  onStatus?: (connected: boolean) => void
  onError?: (error: any) => void
  // 消息发送确认回调，支持错误状态
  onMessageSent?: (tempId: string, messageId: string, status?: 'success' | 'error') => void
  onMessageDelivered?: (messageId: string) => void
  // Agent思考状态回调，支持tempId关联
  onAgentThinking?: (data: { 
    conversationId: string; 
    agentName: string; 
    status: 'start' | 'continue' | 'end';
    tempId?: string;
  }) => void
  onAgentThinkingStream?: (data: { 
    conversationId: string; 
    content?: string; 
    progress?: number;
    tempId?: string;
  }) => void
}

export class ChatSocket {
  private ws: WebSocket | null = null
  private namespace: string
  private callbacks: SocketCallbacks = {}
  private reconnectTimer: number | null = null
  private pingTimer: number | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  // 消息确认超时管理
  private pendingMessages = new Map<string, NodeJS.Timeout>()

  constructor() {
    this.namespace = 'default'
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

    // 使用认证管理器获取token
    const token = authManager.getToken()
    if (!token) {
      console.error('❌ 未找到认证token，无法连接WebSocket')
      this.callbacks.onError?.({ message: '未找到认证token，请先登录' })
      // 跳转到登录页
      authManager.redirectToLogin('WebSocket连接需要认证')
      return
    }

    // 验证token格式
    if (!authManager.validateTokenFormat(token)) {
      console.error('❌ Token格式无效，无法连接WebSocket')
      this.callbacks.onError?.({ message: 'Token格式无效，请重新登录' })
      authManager.redirectToLogin('Token格式无效')
      return
    }

    // 使用token认证的WebSocket连接URL
    // 使用CHAT_ROOM端点，token作为查询参数传递
    const endpoint = API_ENDPOINTS.WEBSOCKET.CHAT_ROOM(this.namespace)
    const wsUrl = buildWsUrl(`${endpoint}?token=${token}`)
    console.log('🔌 连接WebSocket:', wsUrl.replace(token, '***TOKEN***'))

    this.ws = new WebSocket(wsUrl)

    this.ws.onopen = () => {
      console.log('✅ WebSocket连接成功, 命名空间:', this.namespace)
      this.reconnectAttempts = 0
      this.callbacks.onStatus?.(true)
      this.startPing()

      // 连接成功后请求历史消息
      this.requestHistory()
    }

    this.ws.onclose = (event) => {
      console.log('❌ WebSocket连接关闭:', event.code, event.reason)
      
      // 根据错误码提供更详细的错误信息
      let errorMessage = ''
      switch (event.code) {
        case 1000:
          errorMessage = '正常关闭'
          break
        case 1001:
          errorMessage = '端点离开'
          break
        case 1002:
          errorMessage = '协议错误'
          break
        case 1003:
          errorMessage = '不支持的数据类型'
          break
        case 1006:
          errorMessage = '连接异常关闭'
          break
        case 1009:
          errorMessage = '消息过大'
          // 特别处理消息过大的情况
          console.error('💥 WebSocket因消息过大而关闭，请检查发送的消息大小')
          this.callbacks.onError?.({ 
            code: event.code, 
            message: '发送的消息过大，请减少消息内容后重试',
            type: 'MESSAGE_TOO_LARGE'
          })
          break
        case 1011:
          errorMessage = '服务器错误'
          break
        case 1012:
          errorMessage = '服务重启'
          break
        case 1013:
          errorMessage = '稍后重试'
          break
        case 1014:
          errorMessage = '网关错误'
          break
        case 1015:
          errorMessage = 'TLS握手失败'
          break
        default:
          errorMessage = `未知错误 (${event.code})`
      }
      
      console.log('📋 关闭原因:', errorMessage)
      this.callbacks.onStatus?.(false)
      this.stopPing()

      // 如果不是主动关闭且不是消息过大错误，尝试重连
      if (event.code !== 1000 && event.code !== 1009 && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnect()
      } else if (event.code === 1009) {
        // 消息过大时不重连，等待用户处理
        console.log('🚫 因消息过大导致连接关闭，不进行自动重连')
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
      case 'chat': {
        // 处理聊天消息，转换字段格式
        console.log('📨 收到chat消息原始数据:', JSON.stringify(data.data, null, 2))
        const chatMessage = this.normalizeMessage(data.data)
        if (chatMessage) {
          this.callbacks.onMessage?.(chatMessage)
        } else {
          console.warn('⚠️ 消息格式化失败，跳过处理:', data.data)
        }
        break
      }
      case 'message_confirm': {
        // 消息发送成功确认 - 后台返回tempId
        console.log('✅ 收到消息发送确认:', data)

        const tempId = data.data?.tempId
        const messageId = data.data?.messageId

        if (tempId && messageId) {
          console.log('✅ 找到tempId和messageId，调用回调:', { tempId, messageId })

          // 清除超时定时器
          if (this.pendingMessages.has(tempId)) {
            clearTimeout(this.pendingMessages.get(tempId)!)
            this.pendingMessages.delete(tempId)
            console.log('✅ 清除消息超时定时器:', tempId)
          }

          this.callbacks.onMessageSent?.(tempId, messageId, 'success')
        } else {
          console.warn('⚠️ 消息确认数据格式不正确:', data)
        }
        break
      }

      case 'message_sent': {
        // 兼容旧格式的消息发送确认
        console.log('✅ 收到消息发送确认(旧格式):', data.data)
        this.callbacks.onMessageSent?.(data.data.tempId, data.data.messageId)
        break
      }
      case 'message_delivered': {
        // 消息处理完成确认
        console.log('📬  收到消息处理确认:', data.data)
        this.callbacks.onMessageDelivered?.(data.data.messageId)
        break
      }
      case 'error': {
        // 错误消息处理
        console.error('❌ 收到服务器错误:', data.data)
        this.callbacks.onError?.(data.data)

        // 如果错误包含tempId，可以标记对应消息为失败
        if (data.data.tempId && this.callbacks.onMessageSent) {
          this.callbacks.onMessageSent(data.data.tempId, '', 'error')
        }
        break
      }
      case 'history': {
        console.log('📜 收到历史消息原始数据:', data.data)
        // 服务器返回格式: {"data": {"messages": [...], "hasMore": false}}
        const historyData = data.data
        const rawMessages = historyData?.messages || []
        const hasMore = historyData?.hasMore || false

        // 转换消息格式，过滤掉无效消息
        const normalizedMessages = rawMessages
          .map((msg) => this.normalizeMessage(msg))
          .filter((msg) => msg !== null) as ChatMessage[]

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
      }
      case 'user_join': {
        console.log('👤 用户加入:', data.data?.username || data.data)
        this.callbacks.onUserJoin?.(data.data?.username || data.data)
        break
      }
      case 'user_leave': {
        console.log('👤 用户离开:', data.data?.username || data.data)
        this.callbacks.onUserLeave?.(data.data?.username || data.data)
        break
      }
      case 'typing': {
        this.callbacks.onTyping?.(data.data.username, data.data.isTyping)
        break
      }
      case 'pong': {
        // 心跳响应
        console.log('💓 收到心跳响应')
        break
      }
      case 'agent_thinking': {
        // Agent开始思考
        console.log('🤖 Agent开始思考:', data.data)
        const { conversationId, agentName, tempId } = data.data
        if (conversationId && agentName) {
          this.callbacks.onAgentThinking?.({
            conversationId,
            agentName,
            status: 'start',
            tempId // 传递tempId用于关联原始消息
          })
        }
        break
      }
      case 'agent_thinking_stream': {
        // Agent思考过程中的流式更新
        console.log('🤖 Agent思考流式更新:', data.data)
        const { conversationId, content, progress, tempId } = data.data
        if (conversationId) {
          this.callbacks.onAgentThinkingStream?.({
            conversationId,
            content,
            progress,
            tempId // 传递tempId用于关联
          })
        }
        break
      }

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

  sendMessage(content: string, messageType: string = 'text', mentionedAgents?: string[]): string {
    // 检查消息大小限制 (64KB)
    const maxMessageSize = 64 * 1024 // 64KB
    const messageSize = new Blob([content]).size
    
    if (messageSize > maxMessageSize) {
      console.error('❌ 消息过大:', {
        size: messageSize,
        maxSize: maxMessageSize,
        content: content.substring(0, 100) + '...'
      })
      
      // 触发错误回调
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      setTimeout(() => {
        this.callbacks.onMessageSent?.(tempId, '', 'error')
      }, 100)
      
      return tempId
    }

    // 生成临时ID用于消息确认
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const message = {
      type: 'chat',
      data: {
        tempId, // 添加临时ID
        content,
        type: messageType,
        mentionedAgents // 添加Agent提及信息
      }
    }

    console.log('📤 准备发送消息到WebSocket:', {
      tempId,
      content: content.substring(0, 50) + '...',
      messageType,
      mentionedAgents
    })

    // 检查序列化后的消息大小
    const serializedMessage = JSON.stringify(message)
    const serializedSize = new Blob([serializedMessage]).size
    
    if (serializedSize > maxMessageSize) {
      console.error('❌ 序列化后消息过大:', {
        size: serializedSize,
        maxSize: maxMessageSize,
        message: serializedMessage.substring(0, 100) + '...'
      })
      
      setTimeout(() => {
        this.callbacks.onMessageSent?.(tempId, '', 'error')
      }, 100)
      
      return tempId
    }

    console.log('📤 发送消息:', {
      tempId,
      contentLength: content.length,
      messageSize: serializedSize,
      type: messageType
    })
    
    this.send(message)

    // 设置10秒超时定时器
    const timeoutId = setTimeout(() => {
      console.warn('⏰ 消息确认超时:', tempId)
      this.pendingMessages.delete(tempId)
      // 调用回调标记消息为失败
      this.callbacks.onMessageSent?.(tempId, '', 'error')
    }, 10000) // 10秒超时

    // 保存超时定时器
    this.pendingMessages.set(tempId, timeoutId)
    console.log('⏰ 设置消息超时定时器:', tempId, '10秒')

    return tempId // 返回临时ID
  }

  sendTyping(isTyping: boolean) {
    this.send({
      type: 'typing',
      data: {
        isTyping
      }
    })
  }

  // 转换服务器消息格式为前端格式
  private normalizeMessage(serverMessage: any): ChatMessage | null {
    // 验证服务器消息的基本结构
    if (!serverMessage) {
      console.warn('⚠️ 服务器消息为空或undefined')
      return null
    }

    // 确保有有效的ID
    const messageId = serverMessage.id || serverMessage.tempId || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // 确保有发送者信息
    const senderName = serverMessage.username || serverMessage.senderName || serverMessage.senderId || 'Unknown User'
    
    // 处理图片消息的内容，移除可能的[图片]前缀
    let content = serverMessage.content || ''
    const messageType = serverMessage.messageType || this.detectMessageType(content)
    let imageUrl = serverMessage.imageUrl

    // 如果是图片消息，处理内容格式
    if (messageType === 'image') {
      // 移除[图片]前缀，提取真实的URL
      if (content.startsWith('[图片]')) {
        content = content.replace(/^\[图片\]/, '')
        imageUrl = content
      }
    }

    // 确保有时间戳
    const timestamp = serverMessage.timestamp || new Date().toISOString()

    const normalizedMessage: ChatMessage = {
      id: messageId,
      senderId: serverMessage.username || serverMessage.senderId || senderName,
      senderName: senderName,
      senderAvatar: serverMessage.senderAvatar,
      content: content,
      timestamp: timestamp,
      type: serverMessage.type || 'user',
      status: 'sent', // 服务器消息都标记为已发送
      messageType: messageType,
      imageUrl: imageUrl,
      imagePath: serverMessage.imagePath,
      tempId: serverMessage.tempId, // 保留临时ID用于消息确认
      conversationId: serverMessage.conversationId, // 添加对话ID支持
      mentionedAgents: serverMessage.mentionedAgents // 添加Agent提及信息
    }

    console.log('🔄 消息格式化完成:', {
      原始: {
        id: serverMessage.id,
        username: serverMessage.username,
        content: serverMessage.content?.substring(0, 30) + '...',
        conversationId: serverMessage.conversationId
      },
      格式化后: {
        id: normalizedMessage.id,
        senderName: normalizedMessage.senderName,
        content: normalizedMessage.content?.substring(0, 30) + '...',
        messageType: normalizedMessage.messageType,
        conversationId: normalizedMessage.conversationId
      }
    })

    return normalizedMessage
  }

  // 检测消息类型
  private detectMessageType(content: string): 'text' | 'image' | 'file' {
    // 检查是否为图片URL（包含图片扩展名或文件路径）
    if (content.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?.*)?$/i) || 
        (content.includes('/api/v1/files/') && content.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)/i))) {
      return 'image'
    }
    
    // 检查是否包含[图片]前缀（兼容旧格式）
    if (content.includes('[图片]')) {
      return 'image'
    }
    
    // 检查是否为文件
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

  // 获取连接信息
  getConnectionInfo() {
    const token = localStorage.getItem('goqgo_token')
    return {
      namespace: this.namespace,
      connected: this.isConnected,
      wsUrl: buildWsUrl(`${API_ENDPOINTS.WEBSOCKET.CHAT_ROOM(this.namespace)}?token=${token ? '***TOKEN***' : 'NO_TOKEN'}`)
    }
  }

  disconnect() {
    console.log('🔌 主动断开WebSocket连接')

    this.stopPing()

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    // 清理所有待确认的消息
    this.pendingMessages.forEach((timeoutId, tempId) => {
      clearTimeout(timeoutId)
      console.log('🧹 清理待确认消息:', tempId)
    })
    this.pendingMessages.clear()

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
