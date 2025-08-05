import { mockMessages, mockAgents } from './data'
import { mockLogger } from './config'
import type { Message } from '@/types/api'

// Mock WebSocket类
export class MockWebSocket {
  private listeners: { [key: string]: Function[] } = {}
  private connected = false
  private reconnectTimer: number | null = null
  private heartbeatTimer: number | null = null
  
  constructor(private url: string) {
    mockLogger.info('创建Mock WebSocket连接', { url })
    
    // 模拟连接延迟
    setTimeout(() => {
      this.connected = true
      this.emit('open')
      this.startHeartbeat()
      mockLogger.info('Mock WebSocket连接已建立')
    }, 500)
  }

  // 添加事件监听
  addEventListener(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }

  // 移除事件监听
  removeEventListener(event: string, callback: Function) {
    if (this.listeners[event]) {
      const index = this.listeners[event].indexOf(callback)
      if (index > -1) {
        this.listeners[event].splice(index, 1)
      }
    }
  }

  // 发送消息
  send(data: string) {
    if (!this.connected) {
      mockLogger.warn('WebSocket未连接，无法发送消息')
      return
    }

    try {
      const message = JSON.parse(data)
      mockLogger.info('发送Mock WebSocket消息', message)
      
      // 模拟消息处理
      this.handleMessage(message)
    } catch (error) {
      mockLogger.error('解析WebSocket消息失败', error)
    }
  }

  // 关闭连接
  close() {
    this.connected = false
    this.stopHeartbeat()
    this.stopReconnect()
    this.emit('close')
    mockLogger.info('Mock WebSocket连接已关闭')
  }

  // 触发事件
  private emit(event: string, data?: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          if (event === 'message') {
            callback({ data: JSON.stringify(data) })
          } else {
            callback(data)
          }
        } catch (error) {
          mockLogger.error('WebSocket事件回调错误', error)
        }
      })
    }
  }

  // 处理消息
  private handleMessage(message: any) {
    switch (message.type) {
      case 'chat_message':
        this.handleChatMessage(message)
        break
      case 'agent_status':
        this.handleAgentStatus(message)
        break
      case 'ping':
        this.handlePing()
        break
      default:
        mockLogger.warn('未知的WebSocket消息类型', message.type)
    }
  }

  // 处理聊天消息
  private handleChatMessage(message: any) {
    // 模拟消息广播
    setTimeout(() => {
      const response = {
        type: 'message_received',
        data: {
          id: `msg-${Date.now()}`,
          content: message.content,
          sender: message.sender,
          namespace: message.namespace,
          timestamp: new Date().toISOString(),
          type: 'text',
          status: 'sent'
        }
      }
      
      this.emit('message', response)
    }, 200)
  }

  // 处理Agent状态
  private handleAgentStatus(message: any) {
    // 模拟Agent状态更新
    setTimeout(() => {
      const response = {
        type: 'agent_status_update',
        data: {
          agentId: message.agentId,
          status: message.status,
          timestamp: new Date().toISOString()
        }
      }
      
      this.emit('message', response)
    }, 100)
  }

  // 处理ping
  private handlePing() {
    setTimeout(() => {
      this.emit('message', { type: 'pong', timestamp: new Date().toISOString() })
    }, 50)
  }

  // 开始心跳
  private startHeartbeat() {
    this.heartbeatTimer = window.setInterval(() => {
      if (this.connected) {
        this.emit('message', { 
          type: 'heartbeat', 
          timestamp: new Date().toISOString() 
        })
      }
    }, 30000)
  }

  // 停止心跳
  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  // 开始重连
  private startReconnect() {
    this.stopReconnect()
    this.reconnectTimer = window.setTimeout(() => {
      if (!this.connected) {
        mockLogger.info('尝试重连Mock WebSocket')
        this.connected = true
        this.emit('open')
        this.startHeartbeat()
      }
    }, 3000)
  }

  // 停止重连
  private stopReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  // 模拟连接断开
  simulateDisconnect() {
    if (this.connected) {
      this.connected = false
      this.stopHeartbeat()
      this.emit('close')
      mockLogger.info('模拟WebSocket连接断开')
      
      // 自动重连
      this.startReconnect()
    }
  }

  // 模拟接收消息
  simulateMessage(message: any) {
    if (this.connected) {
      this.emit('message', message)
    }
  }
}

// Mock WebSocket管理器
export class MockWebSocketManager {
  private connections: Map<string, MockWebSocket> = new Map()
  private messageInterval: number | null = null

  constructor() {
    this.startRandomMessages()
  }

  // 创建WebSocket连接
  createConnection(url: string): MockWebSocket {
    const ws = new MockWebSocket(url)
    this.connections.set(url, ws)
    
    // 监听连接关闭
    ws.addEventListener('close', () => {
      this.connections.delete(url)
    })
    
    return ws
  }

  // 获取连接
  getConnection(url: string): MockWebSocket | undefined {
    return this.connections.get(url)
  }

  // 广播消息到所有连接
  broadcast(message: any) {
    this.connections.forEach(ws => {
      ws.simulateMessage(message)
    })
  }

  // 开始发送随机消息
  private startRandomMessages() {
    this.messageInterval = window.setInterval(() => {
      if (this.connections.size > 0) {
        this.sendRandomMessage()
      }
    }, 10000) // 每10秒发送一条随机消息
  }

  // 发送随机消息
  private sendRandomMessage() {
    const randomMessages = [
      {
        type: 'agent_status_update',
        data: {
          agentId: 'agent-1',
          status: 'running',
          timestamp: new Date().toISOString()
        }
      },
      {
        type: 'system_notification',
        data: {
          message: '系统运行正常',
          level: 'info',
          timestamp: new Date().toISOString()
        }
      },
      {
        type: 'new_message',
        data: {
          id: `msg-${Date.now()}`,
          content: '这是一条模拟的实时消息',
          sender: 'system',
          namespace: 'default',
          timestamp: new Date().toISOString(),
          type: 'system'
        }
      }
    ]

    const randomMessage = randomMessages[Math.floor(Math.random() * randomMessages.length)]
    this.broadcast(randomMessage)
  }

  // 停止随机消息
  stopRandomMessages() {
    if (this.messageInterval) {
      clearInterval(this.messageInterval)
      this.messageInterval = null
    }
  }

  // 清理所有连接
  cleanup() {
    this.stopRandomMessages()
    this.connections.forEach(ws => ws.close())
    this.connections.clear()
  }
}

// 全局Mock WebSocket管理器实例
export const mockWebSocketManager = new MockWebSocketManager()

// 替换全局WebSocket
export function enableMockWebSocket() {
  if (typeof window !== 'undefined') {
    (window as any).WebSocket = MockWebSocket
    mockLogger.info('Mock WebSocket已启用')
  }
}

// 恢复原生WebSocket
export function disableMockWebSocket() {
  if (typeof window !== 'undefined' && (window as any).OriginalWebSocket) {
    (window as any).WebSocket = (window as any).OriginalWebSocket
    mockLogger.info('Mock WebSocket已禁用')
  }
}

// 保存原生WebSocket
if (typeof window !== 'undefined') {
  (window as any).OriginalWebSocket = (window as any).WebSocket
}
