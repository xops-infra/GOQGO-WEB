import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ChatMessage } from '@/types/api'
import { useChatConnection } from '@/composables/useChatConnection'
import { useChatMessages } from '@/composables/useChatMessages'
import { useChatUsers } from '@/composables/useChatUsers'
import { useUserStore } from './user'

export const useChatStore = defineStore('chat', () => {
  // 基础状态
  const currentNamespace = ref('default')
  const sessionStartTime = ref<string>('')
  
  // 获取用户store
  const userStore = useUserStore()

  // 使用聊天连接管理
  const {
    isConnected,
    connectionStatus,
    connect,
    disconnect,
    reconnect
  } = useChatConnection(currentNamespace)

  // 使用消息管理
  const {
    messages,
    isLoadingHistory,
    hasMoreHistory,
    shouldPreventAutoScroll,
    sortedMessages,
    addMessage,
    loadHistoryMessages,
    sendMessage,
    clearMessages,
    updateMessage,
    deleteMessage
  } = useChatMessages(currentNamespace, isConnected)

  // 使用用户管理
  const {
    onlineUsers,
    typingUsers,
    typingUsersList,
    addOnlineUser,
    removeOnlineUser,
    setTypingUser,
    clearTypingUser,
    updateOnlineUsers
  } = useChatUsers()

  // 主要方法
  const connectToChat = async (namespace: string) => {
    const namespaceStr = typeof namespace === 'string' ? namespace : String(namespace)
    currentNamespace.value = namespaceStr
    sessionStartTime.value = new Date().toISOString()
    
    await connect(namespaceStr)
    await loadHistoryMessages()
  }

  const disconnectFromChat = () => {
    disconnect()
    clearMessages()
    updateOnlineUsers([])
    typingUsers.value.clear()
  }

  const sendChatMessage = async (content: string, options: {
    mentionedAgents?: string[]
    type?: string
  } = {}) => {
    return await sendMessage(content, {
      ...options,
      sender: userStore.currentUser.username,
      namespace: currentNamespace.value
    })
  }

  // 重置store状态
  const resetStore = () => {
    disconnectFromChat()
    currentNamespace.value = 'default'
    sessionStartTime.value = ''
  }

  return {
    // 状态
    currentNamespace,
    sessionStartTime,
    isConnected,
    connectionStatus,
    messages,
    sortedMessages,
    onlineUsers,
    typingUsers,
    typingUsersList,
    isLoadingHistory,
    hasMoreHistory,
    shouldPreventAutoScroll,

    // 方法
    connectToChat,
    disconnectFromChat,
    sendChatMessage,
    addMessage,
    loadHistoryMessages,
    clearMessages,
    updateMessage,
    deleteMessage,
    addOnlineUser,
    removeOnlineUser,
    setTypingUser,
    clearTypingUser,
    updateOnlineUsers,
    reconnect,
    resetStore
  }
})

export default useChatStore
