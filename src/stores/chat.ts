import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ChatMessage } from '@/types/api'
import { ChatSocket } from '@/utils/chatSocket'
import { chatApi } from '@/api/chat'
import { useUserStore } from './user'

export const useChatStore = defineStore('chat', () => {
  // 状态
  const messages = ref<ChatMessage[]>([])
  const onlineUsers = ref<string[]>([])
  const typingUsers = ref<Set<string>>(new Set())
  const isConnected = ref(false)
  const currentNamespace = ref('default')
  const isLoadingHistory = ref(false)
  const hasMoreHistory = ref(true)
  const sessionStartTime = ref<string>('') // 会话开始时间，用于区分历史消息和当前消息
  
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
  const connect = async (namespace: string) => {
    // 调试信息
    console.log('🔍 connect函数接收到的namespace:', { 
      value: namespace, 
      type: typeof namespace, 
      isString: typeof namespace === 'string',
      stringified: String(namespace)
    })
    
    // 确保namespace是字符串类型
    const namespaceStr = typeof namespace === 'string' ? namespace : String(namespace)
    currentNamespace.value = namespaceStr
    
    console.log('🔌 连接聊天室:', { namespace: namespaceStr, username: userStore.currentUser.username })
    
    // 清空之前的数据
    messages.value = []
    onlineUsers.value = []
    typingUsers.value.clear()
    hasMoreHistory.value = true
    sessionStartTime.value = new Date().toISOString() // 记录会话开始时间
    
    // 断开现有连接
    if (chatSocket) {
      chatSocket.disconnect()
    }
    
    // 创建新的WebSocket连接，使用当前用户名
    chatSocket = new ChatSocket(userStore.currentUser.username)
    
    // 连接到指定的命名空间聊天室
    chatSocket.connect(namespaceStr, {
      onMessage: (message) => {
        console.log('📨 收到新消息:', message)
        addMessage(message)
      },
      
      onHistoryLoaded: (historyMessages) => {
        console.log('📜 加载历史消息:', historyMessages?.length || 0, '条')
        
        if (!Array.isArray(historyMessages) || historyMessages.length === 0) {
          console.log('📜 历史消息为空，设置hasMoreHistory为false')
          hasMoreHistory.value = false
          isLoadingHistory.value = false
          return
        }
        
        // 合并历史消息，避免重复
        const existingIds = new Set(messages.value.map(m => m.id))
        const newMessages = historyMessages.filter(m => m && m.id && !existingIds.has(m.id))
        
        console.log('📜 消息去重结果:', {
          existing: messages.value.length,
          received: historyMessages.length,
          new: newMessages.length
        })
        
        if (newMessages.length > 0) {
          // 将历史消息添加到开头（保持时间顺序）
          messages.value = [...newMessages, ...messages.value]
          console.log('✅ 添加了', newMessages.length, '条新的历史消息，总计:', messages.value.length, '条')
        } else {
          console.log('⚠️ 没有新的历史消息需要添加')
        }
        
        isLoadingHistory.value = false
        
        // 如果返回的消息数量少于请求数量，说明没有更多了
        if (historyMessages.length < 20) {
          hasMoreHistory.value = false
          console.log('📜 历史消息数量少于20条，设置hasMoreHistory为false')
        }
      },
      
      onHistoryInfo: (info) => {
        console.log('📜 收到历史消息元信息:', info)
        hasMoreHistory.value = info.hasMore
        isLoadingHistory.value = false
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
      console.log('📨 添加新消息详细信息:', {
        id: message.id,
        messageType: message.messageType,
        content: message.content,
        imageUrl: message.imageUrl,
        senderName: message.senderName,
        type: message.type
      })
      messages.value.push(message)
      console.log('✅ 添加新消息:', message.content?.substring(0, 50) + '...')
    }
  }

  // 发送图片消息
  const sendImageMessage = async (imageUrl: string) => {
    try {
      console.log('📤 发送图片消息:', imageUrl)

      // 调用 HTTP API 发送图片消息
      const response = await chatApi.sendMessage(currentNamespace.value, {
        message: `[图片] ${imageUrl}`,
        type: 'user'
      })

      console.log('✅ 图片消息发送成功:', response)
      return true
    } catch (error) {
      console.error('❌ 发送图片消息失败:', error)
      throw error
    }
  }

  // 发送消息 - 使用WebSocket直接发送
  const sendMessage = async (content: string, messageType: string = 'text') => {
    if (!content.trim()) {
      console.warn('⚠️ 消息内容为空，跳过发送')
      return false
    }

    if (!chatSocket || !chatSocket.isConnected) {
      console.error('❌ WebSocket未连接，无法发送消息')
      throw new Error('WebSocket未连接')
    }

    try {
      console.log('📤 通过WebSocket发送消息:', { 
        namespace: currentNamespace.value, 
        content: content.substring(0, 50) + '...' 
      })

      // 直接通过WebSocket发送消息
      chatSocket.sendMessage(content, messageType)
      console.log('✅ 消息发送成功')
      return true
    } catch (error) {
      console.error('❌ 发送消息失败:', error)
      throw error
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
    isLoadingHistory,
    hasMoreHistory,
    sessionStartTime,
    
    // 方法
    connect,
    disconnect,
    sendMessage,
    sendImageMessage,
    sendTyping,
    addMessage,
    loadMoreHistory,
    clearMessages,
    getConnectionInfo
  }
})
