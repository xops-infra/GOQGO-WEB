import { io, Socket } from 'socket.io-client'
import type { ChatMessage } from '@/types/api'

export interface ChatSocketEvents {
  onMessage: (message: ChatMessage) => void
  onUserJoin: (user: string) => void
  onUserLeave: (user: string) => void
  onTyping: (user: string, isTyping: boolean) => void
  onError: (error: string) => void
}

export class ChatSocket {
  private socket: Socket | null = null
  private namespace: string = ''
  private events: Partial<ChatSocketEvents> = {}

  connect(namespace: string, events: Partial<ChatSocketEvents>) {
    this.namespace = namespace
    this.events = events
    
    // 连接到聊天室WebSocket
    this.socket = io(`ws://localhost:8080/ws/namespaces/${namespace}/chat`, {
      transports: ['websocket'],
      autoConnect: true
    })

    this.setupEventListeners()
    return this.socket
  }

  private setupEventListeners() {
    if (!this.socket) return

    // 接收新消息
    this.socket.on('message', (message: ChatMessage) => {
      this.events.onMessage?.(message)
    })

    // 用户加入
    this.socket.on('user_join', (user: string) => {
      this.events.onUserJoin?.(user)
    })

    // 用户离开
    this.socket.on('user_leave', (user: string) => {
      this.events.onUserLeave?.(user)
    })

    // 正在输入状态
    this.socket.on('typing', (data: { user: string; isTyping: boolean }) => {
      this.events.onTyping?.(data.user, data.isTyping)
    })

    // 连接错误
    this.socket.on('connect_error', (error) => {
      this.events.onError?.(`连接失败: ${error.message}`)
    })

    // 连接成功
    this.socket.on('connect', () => {
      console.log('聊天室连接成功')
    })

    // 断开连接
    this.socket.on('disconnect', (reason) => {
      console.log('聊天室连接断开:', reason)
    })
  }

  // 发送消息
  sendMessage(message: string) {
    if (this.socket?.connected) {
      this.socket.emit('send_message', { message })
    }
  }

  // 发送正在输入状态
  sendTyping(isTyping: boolean) {
    if (this.socket?.connected) {
      this.socket.emit('typing', { isTyping })
    }
  }

  // 断开连接
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  // 获取连接状态
  get isConnected() {
    return this.socket?.connected || false
  }
}
