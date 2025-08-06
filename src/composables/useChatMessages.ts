import { ref, computed, type Ref } from 'vue'
import type { ChatMessage } from '@/types/api'
import { chatApiWithMock as chatApi } from '@/api/chatWithMock'
import { useUserStore } from '@/stores/user'

export function useChatMessages(currentNamespace: Ref<string>, isConnected: Ref<boolean>) {
  const userStore = useUserStore()
  
  // 响应式状态
  const messages = ref<ChatMessage[]>([])
  const isLoadingHistory = ref(false)
  const hasMoreHistory = ref(true)
  const shouldPreventAutoScroll = ref(false)

  // 计算属性
  const sortedMessages = computed(() =>
    [...messages.value].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
  )

  const messageCount = computed(() => messages.value.length)

  // 添加消息
  const addMessage = (message: ChatMessage, options: { 
    preventAutoScroll?: boolean 
    prepend?: boolean 
  } = {}) => {
    if (!message || !message.id) {
      console.warn('尝试添加无效消息:', message)
      return
    }

    // 检查消息是否已存在
    const existingIndex = messages.value.findIndex(m => m.id === message.id)
    if (existingIndex !== -1) {
      // 更新现有消息
      messages.value[existingIndex] = message
      return
    }

    // 添加新消息
    if (options.prepend) {
      messages.value.unshift(message)
    } else {
      messages.value.push(message)
    }

    // 设置自动滚动控制
    if (options.preventAutoScroll) {
      shouldPreventAutoScroll.value = true
      setTimeout(() => {
        shouldPreventAutoScroll.value = false
      }, 100)
    }
  }

  // 批量添加消息
  const addMessages = (newMessages: ChatMessage[], options: { 
    preventAutoScroll?: boolean 
    prepend?: boolean 
  } = {}) => {
    if (!Array.isArray(newMessages) || newMessages.length === 0) {
      return
    }

    // 过滤掉已存在的消息
    const existingIds = new Set(messages.value.map(m => m.id))
    const uniqueMessages = newMessages.filter(m => m && m.id && !existingIds.has(m.id))

    if (uniqueMessages.length === 0) {
      return
    }

    // 批量添加
    if (options.prepend) {
      messages.value.unshift(...uniqueMessages)
    } else {
      messages.value.push(...uniqueMessages)
    }

    // 设置自动滚动控制
    if (options.preventAutoScroll) {
      shouldPreventAutoScroll.value = true
      setTimeout(() => {
        shouldPreventAutoScroll.value = false
      }, 100)
    }
  }

  // 加载历史消息
  const loadHistoryMessages = async (limit = 50) => {
    if (isLoadingHistory.value || !hasMoreHistory.value) {
      return
    }

    isLoadingHistory.value = true
    try {
      // 使用正确的API方法名和参数
      const historyMessages = await chatApi.getChatHistory(
        currentNamespace.value,
        'default', // 默认聊天室名称
        limit,
        messages.value.length > 0 ? messages.value[0].timestamp : undefined
      )

      if (historyMessages.length === 0) {
        hasMoreHistory.value = false
        return
      }

      // 添加历史消息到开头
      addMessages(historyMessages, { 
        prepend: true, 
        preventAutoScroll: true 
      })

      // 如果返回的消息数量少于请求数量，说明没有更多历史消息
      if (historyMessages.length < limit) {
        hasMoreHistory.value = false
      }

    } catch (error) {
      console.error('加载历史消息失败:', error)
      throw error
    } finally {
      isLoadingHistory.value = false
    }
  }

  // 发送消息
  const sendMessage = async (content: string, options: {
    mentionedAgents?: string[]
    type?: string
    sender?: string
    namespace?: string
  } = {}) => {
    if (!content.trim() || !isConnected.value) {
      throw new Error('无法发送消息：内容为空或未连接')
    }

    try {
      const messageData = {
        message: content.trim(),
        type: options.type || 'user',
        messageType: 'text'
      }

      // 使用正确的API方法调用
      const response = await chatApi.sendMessage(
        options.namespace || currentNamespace.value,
        'default', // 默认聊天室名称
        messageData
      )
      
      // 创建本地消息对象
      const newMessage: ChatMessage = {
        id: response.id,
        senderId: userStore.currentUser?.id || 'unknown',
        senderName: options.sender || userStore.currentUser?.username || 'Unknown',
        content: content.trim(),
        timestamp: new Date().toISOString(),
        type: options.type || 'user',
        status: 'sent',
        namespace: options.namespace || currentNamespace.value,
        mentionedAgents: options.mentionedAgents || []
      }
      
      // 添加到本地消息列表
      addMessage(newMessage)
      
      return newMessage
    } catch (error) {
      console.error('发送消息失败:', error)
      throw error
    }
  }

  // 更新消息
  const updateMessage = (messageId: string, updates: Partial<ChatMessage>) => {
    const index = messages.value.findIndex(m => m.id === messageId)
    if (index !== -1) {
      messages.value[index] = { ...messages.value[index], ...updates }
    }
  }

  // 删除消息
  const deleteMessage = async (messageId: string) => {
    try {
      await chatApi.deleteMessage(messageId)
      
      const index = messages.value.findIndex(m => m.id === messageId)
      if (index !== -1) {
        messages.value.splice(index, 1)
      }
    } catch (error) {
      console.error('删除消息失败:', error)
      throw error
    }
  }

  // 清空消息
  const clearMessages = () => {
    messages.value = []
    hasMoreHistory.value = true
    shouldPreventAutoScroll.value = false
  }

  // 获取消息
  const getMessage = (messageId: string) => {
    return messages.value.find(m => m.id === messageId)
  }

  // 搜索消息
  const searchMessages = (query: string) => {
    if (!query.trim()) {
      return []
    }

    const searchTerm = query.toLowerCase()
    return messages.value.filter(message =>
      message.content.toLowerCase().includes(searchTerm) ||
      message.sender.toLowerCase().includes(searchTerm)
    )
  }

  return {
    // 状态
    messages,
    sortedMessages,
    messageCount,
    isLoadingHistory,
    hasMoreHistory,
    shouldPreventAutoScroll,
    
    // 方法
    addMessage,
    addMessages,
    loadHistoryMessages,
    sendMessage,
    updateMessage,
    deleteMessage,
    clearMessages,
    getMessage,
    searchMessages
  }
}

export default useChatMessages
