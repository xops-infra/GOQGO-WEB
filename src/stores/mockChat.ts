// Mock Chat Store - 用于演示和开发
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getMockSocket } from '@/services/mockSocket'
import type { MockMessage } from '@/services/mockData'
import { mockAgents } from '@/services/mockData'

export const useMockChatStore = defineStore('mockChat', () => {
  // 基础状态
  const currentNamespace = ref('default')
  const messages = ref<MockMessage[]>([])
  const isConnected = ref(false)
  const onlineAgents = ref(mockAgents)
  const typingUsers = ref<string[]>([])
  
  // Mock Socket实例
  const mockSocket = getMockSocket()
  
  // 计算属性
  const connectionStatus = computed(() => {
    return isConnected.value ? 'connected' : 'disconnected'
  })
  
  const sortedMessages = computed(() => {
    return [...messages.value].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
  })
  
  const agentCount = computed(() => {
    return onlineAgents.value.filter(agent => agent.status === 'Running').length
  })

  // 连接到Mock聊天
  const connectToMockChat = async () => {
    try {
      console.log('🚀 Connecting to Mock Chat...')
      
      // 设置事件监听器
      setupSocketListeners()
      
      // 连接Mock Socket
      mockSocket.connect()
      
      console.log('✅ Mock Chat connected successfully')
    } catch (error) {
      console.error('❌ Failed to connect to Mock Chat:', error)
    }
  }

  // 断开Mock聊天连接
  const disconnectFromMockChat = () => {
    try {
      console.log('🔌 Disconnecting from Mock Chat...')
      
      // 移除事件监听器
      removeSocketListeners()
      
      // 断开Mock Socket
      mockSocket.disconnect()
      
      isConnected.value = false
      console.log('✅ Mock Chat disconnected')
    } catch (error) {
      console.error('❌ Failed to disconnect from Mock Chat:', error)
    }
  }

  // 发送消息
  const sendMockMessage = (content: string, mentionedAgents?: string[]) => {
    if (!isConnected.value) {
      console.warn('⚠️ Mock Chat not connected')
      return
    }

    try {
      mockSocket.sendMessage(content, mentionedAgents)
      console.log('📤 Mock message sent:', content)
    } catch (error) {
      console.error('❌ Failed to send mock message:', error)
    }
  }

  // 添加消息
  const addMockMessage = (message: MockMessage) => {
    messages.value.push(message)
    
    // 如果是思考消息，模拟思考过程
    if (message.isThinking && message.thinkingSteps) {
      simulateThinkingProcess(message)
    }
  }

  // 清空消息
  const clearMockMessages = () => {
    messages.value = []
    console.log('🧹 Mock messages cleared')
  }

  // 模拟思考过程
  const simulateThinkingProcess = (thinkingMessage: MockMessage) => {
    if (!thinkingMessage.thinkingSteps) return

    thinkingMessage.thinkingSteps.forEach((step, index) => {
      setTimeout(() => {
        // 更新思考消息的内容
        const messageIndex = messages.value.findIndex(m => m.id === thinkingMessage.id)
        if (messageIndex !== -1) {
          const updatedSteps = thinkingMessage.thinkingSteps!.slice(0, index + 1)
          messages.value[messageIndex] = {
            ...thinkingMessage,
            content: `正在思考中...\n\n${updatedSteps.join('\n')}`
          }
        }
      }, (index + 1) * 1000) // 每秒显示一个思考步骤
    })
  }

  // 设置Socket事件监听器
  const setupSocketListeners = () => {
    // 连接成功
    mockSocket.on('connect', () => {
      isConnected.value = true
      console.log('🔗 Mock Socket connected')
    })

    // 连接断开
    mockSocket.on('disconnect', () => {
      isConnected.value = false
      console.log('🔌 Mock Socket disconnected')
    })

    // 接收消息
    mockSocket.on('message', (message: MockMessage) => {
      addMockMessage(message)
      console.log('📨 Mock message received:', message.type, message.sender)
    })

    // 智能体状态更新
    mockSocket.on('agent_status', (data: any) => {
      console.log('🤖 Agent status updated:', data)
      // 更新智能体状态
      data.agents.forEach((agentData: any) => {
        const agent = onlineAgents.value.find(a => a.name === agentData.name)
        if (agent) {
          agent.status = agentData.status
        }
      })
    })

    // 智能体状态变化
    mockSocket.on('agent_status_change', (data: any) => {
      console.log('🔄 Agent status changed:', data.agent, data.status)
      const agent = onlineAgents.value.find(a => a.name === data.agent)
      if (agent) {
        agent.status = data.status
      }
    })

    // 聊天清空
    mockSocket.on('chat_cleared', () => {
      clearMockMessages()
      console.log('🧹 Chat cleared by system')
    })
  }

  // 移除Socket事件监听器
  const removeSocketListeners = () => {
    mockSocket.removeAllListeners('connect')
    mockSocket.removeAllListeners('disconnect')
    mockSocket.removeAllListeners('message')
    mockSocket.removeAllListeners('agent_status')
    mockSocket.removeAllListeners('agent_status_change')
    mockSocket.removeAllListeners('chat_cleared')
  }

  // 获取在线智能体
  const getOnlineAgents = () => {
    return onlineAgents.value.filter(agent => agent.status === 'Running')
  }

  // 手动清空聊天
  const manualClearChat = () => {
    mockSocket.clearChat()
  }

  // 重置Store
  const resetMockStore = () => {
    disconnectFromMockChat()
    clearMockMessages()
    onlineAgents.value = [...mockAgents]
    typingUsers.value = []
    currentNamespace.value = 'default'
  }

  // 获取消息统计
  const getMessageStats = () => {
    const stats = {
      total: messages.value.length,
      user: messages.value.filter(m => m.type === 'user').length,
      agent: messages.value.filter(m => m.type === 'agent').length,
      thinking: messages.value.filter(m => m.type === 'thinking').length,
      system: messages.value.filter(m => m.type === 'system').length
    }
    return stats
  }

  return {
    // 状态
    currentNamespace,
    messages: sortedMessages,
    isConnected,
    onlineAgents,
    typingUsers,
    
    // 计算属性
    connectionStatus,
    agentCount,
    
    // 方法
    connectToMockChat,
    disconnectFromMockChat,
    sendMockMessage,
    addMockMessage,
    clearMockMessages,
    getOnlineAgents,
    manualClearChat,
    resetMockStore,
    getMessageStats
  }
})

export default useMockChatStore
