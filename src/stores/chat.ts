import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ChatMessage } from '@/types/api'
import { ChatSocket } from '@/utils/chatSocket'
import { chatApi } from '@/api/chat'

export const useChatStore = defineStore('chat', () => {
  // 状态
  const messages = ref<ChatMessage[]>([])
  const onlineUsers = ref<string[]>([])
  const typingUsers = ref<Set<string>>(new Set())
  const isConnected = ref(false)
  const currentNamespace = ref('default')
  
  // WebSocket实例
  const chatSocket = new ChatSocket()

  // 计算属性
  const sortedMessages = computed(() => 
    [...messages.value].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
  )

  const typingUsersList = computed(() => Array.from(typingUsers.value))

  // 连接聊天室
  const connect = async (namespace: string) => {
    currentNamespace.value = namespace
    
    try {
      // 获取历史消息
      const { data: history } = await chatApi.getHistory(namespace)
      messages.value = history

      // 连接WebSocket
      chatSocket.connect(namespace, {
        onMessage: (message) => {
          messages.value.push(message)
        },
        onUserJoin: (user) => {
          if (!onlineUsers.value.includes(user)) {
            onlineUsers.value.push(user)
          }
        },
        onUserLeave: (user) => {
          onlineUsers.value = onlineUsers.value.filter(u => u !== user)
        },
        onTyping: (user, isTyping) => {
          if (isTyping) {
            typingUsers.value.add(user)
          } else {
            typingUsers.value.delete(user)
          }
        },
        onError: (error) => {
          console.error('聊天连接错误:', error)
        }
      })

      isConnected.value = true
    } catch (error) {
      console.error('连接聊天室失败:', error)
    }
  }

  // 发送消息
  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    const tempMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'current-user',
      senderName: '我',
      content: content.trim(),
      timestamp: new Date().toISOString(),
      type: 'user',
      status: 'sending'
    }

    // 立即显示消息
    messages.value.push(tempMessage)

    try {
      // 通过WebSocket发送
      chatSocket.sendMessage(content.trim())
      
      // 更新消息状态
      const messageIndex = messages.value.findIndex(m => m.id === tempMessage.id)
      if (messageIndex !== -1) {
        messages.value[messageIndex].status = 'sent'
      }
    } catch (error) {
      // 发送失败，更新状态
      const messageIndex = messages.value.findIndex(m => m.id === tempMessage.id)
      if (messageIndex !== -1) {
        messages.value[messageIndex].status = 'error'
      }
      console.error('发送消息失败:', error)
    }
  }

  // 发送正在输入状态
  const sendTyping = (isTyping: boolean) => {
    chatSocket.sendTyping(isTyping)
  }

  // 断开连接
  const disconnect = () => {
    chatSocket.disconnect()
    isConnected.value = false
    messages.value = []
    onlineUsers.value = []
    typingUsers.value.clear()
  }

  // 清空消息
  const clearMessages = () => {
    messages.value = []
  }

  return {
    // 状态
    messages: sortedMessages,
    onlineUsers,
    typingUsers: typingUsersList,
    isConnected,
    currentNamespace,
    
    // 方法
    connect,
    disconnect,
    sendMessage,
    sendTyping,
    clearMessages
  }
})
