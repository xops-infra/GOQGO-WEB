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
      // 尝试获取历史消息
      try {
        const history = await chatApi.getHistory(namespace)
        messages.value = history
      } catch (error) {
        console.warn('获取聊天历史失败，使用模拟数据:', error)
        // Fallback到模拟聊天历史
        messages.value = [
          {
            id: '1',
            senderId: 'system',
            senderName: '系统',
            content: `欢迎来到 ${namespace} 命名空间聊天室！`,
            timestamp: new Date(Date.now() - 60000).toISOString(),
            type: 'system'
          },
          {
            id: '2',
            senderId: 'backend',
            senderName: 'Backend Agent',
            content: '后端服务已就绪，可以开始协作开发了。',
            timestamp: new Date(Date.now() - 30000).toISOString(),
            type: 'agent'
          },
          {
            id: '3',
            senderId: 'frontend',
            senderName: 'Frontend Agent',
            content: '[图片](/Users/mikas/Library/Application Support/cliExtra/temp_images/image_1753869550527_4.png)',
            timestamp: new Date(Date.now() - 15000).toISOString(),
            type: 'agent',
            messageType: 'image',
            imagePath: '/Users/mikas/Library/Application Support/cliExtra/temp_images/image_1753869550527_4.png'
          }
        ]
      }

      // 尝试连接WebSocket
      try {
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
      } catch (error) {
        console.warn('WebSocket连接失败，使用模拟在线用户:', error)
        // Fallback到模拟在线用户
        onlineUsers.value = ['backend', 'frontend', 'system']
      }

      isConnected.value = true
    } catch (error) {
      console.error('连接聊天室失败:', error)
      // 即使连接失败，也提供基本的聊天功能
      isConnected.value = false
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

  // 发送图片消息
  const sendImageMessage = async (imagePath: string, file?: File) => {
    console.log('=== 发送图片消息开始 ===')
    console.log('图片路径:', imagePath)
    console.log('文件对象:', file)
    
    let finalImagePath = imagePath

    // 如果提供了文件，先上传文件
    if (file) {
      console.log('📁 处理文件上传...')
      try {
        // 这里需要调用API上传文件并获取路径
        // 暂时生成模拟路径
        const timestamp = Date.now()
        const randomId = Math.floor(Math.random() * 10000)
        const extension = file.name.split('.').pop() || 'png'
        finalImagePath = `/Users/mikas/Library/Application Support/cliExtra/temp_images/image_${timestamp}_${randomId}.${extension}`
        
        console.log('✅ 生成最终图片路径:', finalImagePath)
        
        // TODO: 实际实现需要调用后端API上传文件
        console.log('📤 上传文件到:', finalImagePath)
      } catch (error) {
        console.error('❌ 上传图片失败:', error)
        throw error
      }
    }

    const tempMessage: ChatMessage = {
      id: Date.now().toString(),
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
    console.log('✅ 消息已添加到列表，当前消息数量:', messages.value.length)

    try {
      console.log('📡 通过WebSocket发送图片消息...')
      // 通过WebSocket发送图片消息
      chatSocket.sendMessage(tempMessage.content, 'image')
      console.log('✅ WebSocket发送完成')
      
      // 更新消息状态
      const messageIndex = messages.value.findIndex(m => m.id === tempMessage.id)
      console.log('🔍 查找消息索引:', messageIndex)
      
      if (messageIndex !== -1) {
        messages.value[messageIndex].status = 'sent'
        console.log('✅ 消息状态更新为已发送')
      } else {
        console.log('❌ 未找到消息，无法更新状态')
      }
    } catch (error) {
      console.error('❌ 发送图片消息失败:', error)
      
      // 发送失败，更新状态
      const messageIndex = messages.value.findIndex(m => m.id === tempMessage.id)
      if (messageIndex !== -1) {
        messages.value[messageIndex].status = 'error'
        console.log('❌ 消息状态更新为错误')
      }
      throw error
    }
    
    console.log('=== 发送图片消息结束 ===')
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
    sendImageMessage,
    sendTyping,
    clearMessages
  }
})
