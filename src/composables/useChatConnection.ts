import { ref, computed, type Ref } from 'vue'
import { ChatSocket } from '@/utils/chatSocket'
import { isMockMode, mockLogger } from '@/mock/config'

export function useChatConnection(currentNamespace: Ref<string>) {
  // 响应式状态
  const isConnected = ref(false)
  const connectionStatus = ref<'disconnected' | 'connecting' | 'connected' | 'reconnecting'>('disconnected')
  
  // WebSocket实例
  let chatSocket: ChatSocket | null = null

  // 计算属性
  const canSendMessage = computed(() => isConnected.value)

  // 连接聊天室
  const connect = async (namespace: string) => {
    try {
      // 检查是否为Mock模式
      if (isMockMode()) {
        mockLogger.info('Mock模式下跳过WebSocket连接', { namespace })
        connectionStatus.value = 'connected'
        isConnected.value = true
        console.log('🎭 Mock模式：模拟WebSocket连接成功')
        return
      }

      connectionStatus.value = 'connecting'
      
      // 如果已有连接，先断开
      if (chatSocket) {
        disconnect()
      }

      // 创建WebSocket连接
      chatSocket = new ChatSocket()
      
      // 连接到指定命名空间
      chatSocket.connect(namespace, {
        onStatus: (connected: boolean) => {
          isConnected.value = connected
          connectionStatus.value = connected ? 'connected' : 'disconnected'
          
          if (connected) {
            console.log('📡 聊天WebSocket连接已建立')
          } else {
            console.log('📡 聊天WebSocket连接已断开')
          }
        },
        onError: (error: any) => {
          console.error('📡 聊天WebSocket错误:', error)
          isConnected.value = false
          connectionStatus.value = 'disconnected'
        }
      })
      
    } catch (error) {
      console.error('连接聊天室失败:', error)
      connectionStatus.value = 'disconnected'
      throw error
    }
  }

  // 断开连接
  const disconnect = () => {
    if (isMockMode()) {
      mockLogger.info('Mock模式下断开WebSocket连接')
      isConnected.value = false
      connectionStatus.value = 'disconnected'
      console.log('🎭 Mock模式：模拟WebSocket断开连接')
      return
    }

    if (chatSocket) {
      chatSocket.disconnect()
      chatSocket = null
    }
    isConnected.value = false
    connectionStatus.value = 'disconnected'
  }

  // 重连
  const reconnect = async () => {
    await connect(currentNamespace.value)
  }

  // 发送消息
  const sendMessage = (content: string, messageType: string = 'text', mentionedAgents?: string[]): string | null => {
    if (isMockMode()) {
      mockLogger.info('Mock模式下发送消息', { content, messageType, mentionedAgents })
      console.log('🎭 Mock模式：模拟发送消息', content)
      // 返回一个模拟的消息ID
      return `mock-${Date.now()}`
    }

    if (!chatSocket || !isConnected.value) {
      console.warn('WebSocket未连接，无法发送消息')
      return null
    }
    
    return chatSocket.sendMessage(content, messageType, mentionedAgents)
  }

  // 发送打字状态
  const sendTyping = (isTyping: boolean) => {
    if (isMockMode()) {
      mockLogger.info('Mock模式下发送打字状态', { isTyping })
      return
    }

    if (chatSocket && isConnected.value) {
      chatSocket.sendTyping(isTyping)
    }
  }

  // 加载更多历史消息
  const loadMoreHistory = (beforeMessageId: string, limit: number = 20) => {
    if (chatSocket && isConnected.value) {
      chatSocket.loadMoreHistory(beforeMessageId, limit)
    }
  }

  // 获取连接信息
  const getConnectionInfo = () => {
    return chatSocket?.getConnectionInfo() || {
      namespace: currentNamespace.value,
      connected: false,
      wsUrl: 'Not connected'
    }
  }

  // 发送消息到WebSocket
  const sendToSocket = (type: string, data: any) => {
    if (chatSocket && isConnected.value) {
      // ChatSocket的send方法是私有的，这里需要通过其他方式发送
      console.warn('sendToSocket方法需要重新实现')
    } else {
      console.warn('WebSocket未连接，无法发送消息')
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
    sendMessage,
    sendTyping,
    loadMoreHistory,
    getConnectionInfo,
    sendToSocket,
    
    // 获取socket实例（用于设置回调）
    getSocket: () => chatSocket
  }
}

export default useChatConnection
