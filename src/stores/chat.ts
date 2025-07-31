import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ChatMessage } from '@/types/api'
import { ChatSocket } from '@/utils/chatSocket'

export const useChatStore = defineStore('chat', () => {
  // 状态
  const messages = ref<ChatMessage[]>([])
  const onlineUsers = ref<string[]>([])
  const typingUsers = ref<Set<string>>(new Set())
  const isConnected = ref(false)
  const currentNamespace = ref('default')
  const isLoadingHistory = ref(false)
  const hasMoreHistory = ref(true)
  
  // WebSocket实例
  let chatSocket: ChatSocket | null = null

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
    
    // 清空之前的数据
    messages.value = []
    onlineUsers.value = []
    typingUsers.value.clear()
    hasMoreHistory.value = true
    
    // 断开之前的连接
    if (chatSocket) {
      chatSocket.disconnect()
    }
    
    // 创建新的socket连接
    chatSocket = new ChatSocket()
    
    try {
      chatSocket.connect(namespace, {
        onHistoryLoaded: (historyMessages) => {
          console.log('📜 历史消息加载完成:', historyMessages.length, '条')
          
          if (historyMessages.length === 0) {
            hasMoreHistory.value = false
            return
          }
          
          // 将历史消息添加到开头（保持时间顺序）
          const existingIds = new Set(messages.value.map(m => m.id))
          const newMessages = historyMessages.filter(msg => !existingIds.has(msg.id))
          
          messages.value = [...newMessages, ...messages.value]
          isLoadingHistory.value = false
          
          // 如果返回的消息数量少于请求数量，说明没有更多历史了
          if (historyMessages.length < 50) {
            hasMoreHistory.value = false
          }
        },
        
        onMessage: (message) => {
          console.log('📨 收到新消息:', message)
          // 检查消息是否已存在（避免重复）
          if (!messages.value.find(m => m.id === message.id)) {
            messages.value.push(message)
          }
        },
        
        onUserJoin: (user) => {
          console.log('👋 用户加入:', user)
          if (!onlineUsers.value.includes(user)) {
            onlineUsers.value.push(user)
          }
        },
        
        onUserLeave: (user) => {
          console.log('👋 用户离开:', user)
          onlineUsers.value = onlineUsers.value.filter(u => u !== user)
        },
        
        onTyping: (user, isTyping) => {
          if (isTyping) {
            typingUsers.value.add(user)
          } else {
            typingUsers.value.delete(user)
          }
        },
        
        onStatus: (connected) => {
          console.log('🔌 连接状态变化:', connected)
          isConnected.value = connected
        },
        
        onError: (error) => {
          console.error('❌ Socket错误:', error)
          isConnected.value = false
        }
      })
      
      console.log('✅ 聊天室连接初始化完成')
    } catch (error) {
      console.error('❌ 连接聊天室失败:', error)
      isConnected.value = false
      
      // 提供fallback数据
      messages.value = [
        {
          id: '1',
          senderId: 'system',
          senderName: '系统',
          content: `欢迎来到 ${namespace} 命名空间聊天室！`,
          timestamp: new Date(Date.now() - 60000).toISOString(),
          type: 'system'
        }
      ]
    }
  }

  // 加载更多历史消息
  const loadMoreHistory = async () => {
    if (!chatSocket || isLoadingHistory.value || !hasMoreHistory.value) {
      return
    }
    
    isLoadingHistory.value = true
    
    // 获取最早的消息ID作为before参数
    const oldestMessage = messages.value[0]
    if (oldestMessage) {
      console.log('📜 加载更多历史消息，before:', oldestMessage.id)
      chatSocket.loadMoreHistory(oldestMessage.id, 20)
    } else {
      isLoadingHistory.value = false
    }
  }

  // 发送消息
  const sendMessage = async (content: string) => {
    if (!content.trim() || !chatSocket) return

    const tempMessage: ChatMessage = {
      id: `temp_${Date.now()}`,
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
      chatSocket.sendMessage(content.trim(), 'text')
      
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
      throw error
    }
  }

  // 发送图片消息
  const sendImageMessage = async (imagePath: string, file?: File) => {
    if (!chatSocket) return
    
    console.log('=== 发送图片消息开始 ===')
    console.log('图片路径:', imagePath)
    
    let finalImagePath = imagePath

    // 如果提供了文件，先上传文件
    if (file) {
      console.log('📁 处理文件上传...')
      try {
        // TODO: 实际实现需要调用后端API上传文件
        const timestamp = Date.now()
        const randomId = Math.floor(Math.random() * 10000)
        const extension = file.name.split('.').pop() || 'png'
        finalImagePath = `/Users/mikas/Library/Application Support/cliExtra/temp_images/image_${timestamp}_${randomId}.${extension}`
        
        console.log('✅ 生成最终图片路径:', finalImagePath)
      } catch (error) {
        console.error('❌ 上传图片失败:', error)
        throw error
      }
    }

    const tempMessage: ChatMessage = {
      id: `temp_${Date.now()}`,
      senderId: 'current-user',
      senderName: '我',
      content: `[图片](${finalImagePath})`,
      timestamp: new Date().toISOString(),
      type: 'user',
      messageType: 'image',
      imagePath: finalImagePath,
      status: 'sending'
    }

    console.log('📝 创建临时消息:', tempMessage)

    // 立即显示消息
    messages.value.push(tempMessage)

    try {
      console.log('📡 通过WebSocket发送图片消息...')
      // 通过WebSocket发送图片消息
      chatSocket.sendMessage(tempMessage.content, 'image')
      
      // 更新消息状态
      const messageIndex = messages.value.findIndex(m => m.id === tempMessage.id)
      if (messageIndex !== -1) {
        messages.value[messageIndex].status = 'sent'
        console.log('✅ 消息状态更新为已发送')
      }
    } catch (error) {
      console.error('❌ 发送图片消息失败:', error)
      
      // 发送失败，更新状态
      const messageIndex = messages.value.findIndex(m => m.id === tempMessage.id)
      if (messageIndex !== -1) {
        messages.value[messageIndex].status = 'error'
      }
      throw error
    }
    
    console.log('=== 发送图片消息结束 ===')
  }

  // 发送正在输入状态
  const sendTyping = (isTyping: boolean) => {
    if (chatSocket) {
      chatSocket.sendTyping(isTyping)
    }
  }

  // 断开连接
  const disconnect = () => {
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
  }

  return {
    // 状态
    messages: sortedMessages,
    onlineUsers,
    typingUsers: typingUsersList,
    isConnected,
    currentNamespace,
    isLoadingHistory,
    hasMoreHistory,
    
    // 方法
    connect,
    disconnect,
    sendMessage,
    sendImageMessage,
    sendTyping,
    clearMessages,
    loadMoreHistory
  }
})
