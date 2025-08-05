import { ref, computed, type Ref } from 'vue'
import { ChatSocket } from '@/utils/chatSocket'
import { SocketReconnectManager } from '@/utils/socketReconnectManager'

export function useChatConnection(currentNamespace: Ref<string>) {
  // 响应式状态
  const isConnected = ref(false)
  const connectionStatus = ref<'disconnected' | 'connecting' | 'connected' | 'reconnecting'>('disconnected')
  
  // WebSocket管理器
  let socketManager: SocketReconnectManager | null = null
  let chatSocket: ChatSocket | null = null

  // 计算属性
  const canSendMessage = computed(() => isConnected.value)

  // 连接聊天室
  const connect = async (namespace: string) => {
    try {
      connectionStatus.value = 'connecting'
      
      // 如果已有连接，先断开
      if (socketManager) {
        disconnect()
      }

      // 创建WebSocket连接
      const wsUrl = `ws://localhost:8080/api/v1/chat/${namespace}/ws`
      chatSocket = new ChatSocket(wsUrl)
      
      // 创建重连管理器
      socketManager = new SocketReconnectManager(chatSocket, {
        maxRetries: 5,
        retryDelay: 3000,
        backoffMultiplier: 1.5
      })

      // 设置连接事件监听
      chatSocket.onConnect(() => {
        console.log('📡 聊天WebSocket连接已建立')
        isConnected.value = true
        connectionStatus.value = 'connected'
      })

      chatSocket.onDisconnect(() => {
        console.log('📡 聊天WebSocket连接已断开')
        isConnected.value = false
        connectionStatus.value = 'disconnected'
      })

      chatSocket.onReconnecting(() => {
        console.log('📡 聊天WebSocket重连中...')
        connectionStatus.value = 'reconnecting'
      })

      chatSocket.onError((error) => {
        console.error('📡 聊天WebSocket错误:', error)
        isConnected.value = false
        connectionStatus.value = 'disconnected'
      })

      // 开始连接
      await socketManager.connect()
      
    } catch (error) {
      console.error('连接聊天室失败:', error)
      connectionStatus.value = 'disconnected'
      throw error
    }
  }

  // 断开连接
  const disconnect = () => {
    if (socketManager) {
      socketManager.disconnect()
      socketManager = null
    }
    
    if (chatSocket) {
      chatSocket.close()
      chatSocket = null
    }
    
    isConnected.value = false
    connectionStatus.value = 'disconnected'
  }

  // 重连
  const reconnect = async () => {
    if (socketManager) {
      await socketManager.reconnect()
    } else {
      await connect(currentNamespace.value)
    }
  }

  // 发送消息到WebSocket
  const sendToSocket = (type: string, data: any) => {
    if (chatSocket && isConnected.value) {
      chatSocket.send(type, data)
    } else {
      console.warn('WebSocket未连接，无法发送消息')
    }
  }

  // 监听WebSocket消息
  const onSocketMessage = (type: string, handler: (data: any) => void) => {
    if (chatSocket) {
      chatSocket.on(type, handler)
    }
  }

  // 移除WebSocket消息监听
  const offSocketMessage = (type: string, handler?: (data: any) => void) => {
    if (chatSocket) {
      chatSocket.off(type, handler)
    }
  }

  return {
    // 状态
    isConnected,
    connectionStatus,
    canSendMessage,
    
    // 方法
    connect,
    disconnect,
    reconnect,
    sendToSocket,
    onSocketMessage,
    offSocketMessage
  }
}

export default useChatConnection
