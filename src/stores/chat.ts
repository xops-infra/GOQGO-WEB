import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ChatMessage } from '@/types/api'
import { ChatSocket } from '@/utils/chatSocket'
import { useUserStore } from './user'

export const useChatStore = defineStore('chat', () => {
  // 状态
  const messages = ref<ChatMessage[]>([])
  const onlineUsers = ref<string[]>([])
  const typingUsers = ref<Set<string>>(new Set())
  const isConnected = ref(false)
  const currentNamespace = ref('default')
  const currentChatName = ref('default')
  const isLoadingHistory = ref(false)
  const hasMoreHistory = ref(true)
  
  // WebSocket实例
  let chatSocket: ChatSocket | null = null
  
  // 获取用户store
  const userStore = useUserStore()

  // 计算属性
  const sortedMessages = computed(() => 
    [...messages.value].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
  )

  const typingUsersList = computed(() => Array.from(typingUsers.value))

  // 连接聊天室
  const connect = async (namespace: string, chatName: string = 'default') => {
    currentNamespace.value = namespace
    currentChatName.value = chatName
    
    console.log('🔌 连接聊天室:', { namespace, chatName, username: userStore.currentUser.username })
    
    // 清空之前的数据
    messages.value = []
    onlineUsers.value = []
    typingUsers.value.clear()
    hasMoreHistory.value = true
    
    // 断开现有连接
    if (chatSocket) {
      chatSocket.disconnect()
    }
    
    // 创建新的WebSocket连接，使用当前用户名
    chatSocket = new ChatSocket(userStore.currentUser.username)
    
    // 连接到指定的命名空间和聊天室
    chatSocket.connect(namespace, chatName, {
      onMessage: (message) => {
        console.log('📨 收到新消息:', message)
        addMessage(message)
      },
      
      onHistoryLoaded: (historyMessages) => {
        console.log('📜 加载历史消息:', historyMessages.length, '条')
        
        if (historyMessages.length === 0) {
          hasMoreHistory.value = false
          isLoadingHistory.value = false
          return
        }
        
        // 合并历史消息，避免重复
        const existingIds = new Set(messages.value.map(m => m.id))
        const newMessages = historyMessages.filter(m => !existingIds.has(m.id))
        
        if (newMessages.length > 0) {
          // 将历史消息添加到开头（保持时间顺序）
          messages.value = [...newMessages, ...messages.value]
          console.log('✅ 添加了', newMessages.length, '条新的历史消息')
        }
        
        isLoadingHistory.value = false
        
        // 如果返回的消息数量少于请求数量，说明没有更多了
        if (historyMessages.length < 20) {
          hasMoreHistory.value = false
        }
      },
      
      onUserJoin: (username) => {
        console.log('👤 用户加入:', username)
        if (!onlineUsers.value.includes(username)) {
          onlineUsers.value.push(username)
        }
        userStore.addOnlineUser({
          username,
          displayName: username,
          isOnline: true
        })
      },
      
      onUserLeave: (username) => {
        console.log('👤 用户离开:', username)
        const index = onlineUsers.value.indexOf(username)
        if (index !== -1) {
          onlineUsers.value.splice(index, 1)
        }
        userStore.removeOnlineUser(username)
      },
      
      onTyping: (username, isTyping) => {
        console.log('⌨️ 用户输入状态:', username, isTyping)
        if (username !== userStore.currentUser.username) {
          if (isTyping) {
            typingUsers.value.add(username)
          } else {
            typingUsers.value.delete(username)
          }
        }
      },
      
      onStatus: (connected) => {
        console.log('🔗 连接状态变化:', connected)
        isConnected.value = connected
        if (connected) {
          console.log('✅ 聊天室连接成功')
        } else {
          console.log('❌ 聊天室连接断开')
        }
      },
      
      onError: (error) => {
        console.error('❌ 聊天室连接错误:', error)
        isConnected.value = false
      }
    })
  }

  // 添加消息
  const addMessage = (message: ChatMessage) => {
    // 检查消息是否已存在
    const exists = messages.value.some(m => m.id === message.id)
    if (!exists) {
      messages.value.push(message)
      console.log('✅ 添加新消息:', message.content?.substring(0, 50) + '...')
    }
  }

  // 发送消息
  const sendMessage = async (content: string, messageType: string = 'text') => {
    if (!chatSocket || !chatSocket.isConnected) {
      console.error('❌ WebSocket未连接，无法发送消息')
      return false
    }

    try {
      chatSocket.sendMessage(content, messageType)
      console.log('📤 消息发送成功')
      return true
    } catch (error) {
      console.error('❌ 发送消息失败:', error)
      return false
    }
  }

  // 发送输入状态
  const sendTyping = (isTyping: boolean) => {
    if (chatSocket && chatSocket.isConnected) {
      chatSocket.sendTyping(isTyping)
    }
  }

  // 加载更多历史消息
  const loadMoreHistory = async () => {
    if (!hasMoreHistory.value || isLoadingHistory.value || !chatSocket) {
      return
    }

    isLoadingHistory.value = true
    
    // 获取最早的消息ID作为before参数
    const oldestMessage = messages.value[0]
    const beforeId = oldestMessage?.id

    console.log('📜 加载更多历史消息, before:', beforeId)
    chatSocket.loadMoreHistory(beforeId || '', 20)
  }

  // 断开连接
  const disconnect = () => {
    console.log('🔌 断开聊天室连接')
    
    if (chatSocket) {
      chatSocket.disconnect()
      chatSocket = null
    }
    
    isConnected.value = false
    messages.value = []
    onlineUsers.value = []
    typingUsers.value.clear()
  }

  // 清空消息
  const clearMessages = () => {
    messages.value = []
    console.log('🗑️ 清空聊天消息')
  }

  // 获取连接信息
  const getConnectionInfo = () => {
    return chatSocket?.getConnectionInfo() || {
      namespace: currentNamespace.value,
      chatName: currentChatName.value,
      username: userStore.currentUser.username,
      connected: false,
      wsUrl: ''
    }
  }

  return {
    // 状态
    messages,
    sortedMessages,
    onlineUsers,
    typingUsers,
    typingUsersList,
    isConnected,
    currentNamespace,
    currentChatName,
    isLoadingHistory,
    hasMoreHistory,
    
    // 方法
    connect,
    disconnect,
    sendMessage,
    sendTyping,
    addMessage,
    loadMoreHistory,
    clearMessages,
    getConnectionInfo
  }
})
