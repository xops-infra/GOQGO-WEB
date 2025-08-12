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
  
  // 控制自动滚动的状态
  const shouldPreventAutoScroll = ref(false)

  // WebSocket连接管理器
  let socketManager: ChatSocket | null = null

  // 获取用户store
  const userStore = useUserStore()

  // 计算属性
  const sortedMessages = computed(() =>
    [...messages.value].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
  )

  const typingUsersList = computed(() => Array.from(typingUsers.value))



  // 连接聊天室
  const connect = async (namespace: string) => {
    // 调试信息
    console.log('[WebSocket] 🔍 connect函数接收到的namespace:', {
      value: namespace,
      type: typeof namespace,
      isString: typeof namespace === 'string',
      stringified: String(namespace)
    })

    // 确保namespace是字符串类型
    const namespaceStr = typeof namespace === 'string' ? namespace : String(namespace)
    
    // 如果当前已连接到相同namespace，直接返回
    if (currentNamespace.value === namespaceStr && isConnected.value && socketManager) {
      console.log('[WebSocket] ♻️ 已连接到相同namespace，跳过重复连接:', namespaceStr)
      return
    }

    currentNamespace.value = namespaceStr

    console.log('[WebSocket] 🔌 连接聊天室:', {
      namespace: namespaceStr,
      username: userStore.username
    })

    // 清空之前的数据
    messages.value = []
    onlineUsers.value = []
    typingUsers.value.clear()
    hasMoreHistory.value = true
    sessionStartTime.value = new Date().toISOString() // 记录会话开始时间



    // 断开现有连接
    if (socketManager) {
      console.log('[WebSocket] 🔌 断开现有连接管理器')
      socketManager.disconnect()
      socketManager = null
    }

    // 创建新的ChatSocket连接
    socketManager = new ChatSocket()

    // 连接到指定的命名空间聊天室
    socketManager.connect(namespaceStr, {
      onMessage: (message) => {
        console.log('[WebSocket] 📨 收到新消息:', message)
        addMessage(message)
      },

      onMessageSent: (tempId, messageId, status = 'success') => {
        console.log('[WebSocket] ✅ 消息发送确认:', { tempId, messageId, status })
        if (status === 'success') {
          updateMessageStatus(tempId, 'sent', messageId)
        } else {
          updateMessageStatus(tempId, 'error')
        }
      },

      onMessageDelivered: (messageId) => {
        console.log('[WebSocket] 📬 消息处理确认:', messageId)
        updateMessageStatusById(messageId, 'delivered')
      },

      onHistoryInfo: (info) => {
        hasMoreHistory.value = info.hasMore
        console.log('[WebSocket] 📜 历史消息信息更新:', info)
      },

      onUserJoin: (username) => {
        console.log('[WebSocket] 👤 用户加入聊天室:', username)
        if (username && !onlineUsers.value.includes(username)) {
          onlineUsers.value.push(username)
        }
      },

      onUserLeave: (username) => {
        console.log('[WebSocket] 👤 用户离开聊天室:', username)
        if (username) {
          const index = onlineUsers.value.indexOf(username)
          if (index > -1) {
            onlineUsers.value.splice(index, 1)
          }
        }
      },

      onTyping: (username, isTyping) => {
        if (username) {
          if (isTyping) {
            typingUsers.value.add(username)
          } else {
            typingUsers.value.delete(username)
          }
        }
      },

      onStatus: (connected) => {
        isConnected.value = connected
        console.log('[WebSocket] 🔌 WebSocket连接状态:', connected ? '已连接' : '已断开')
      },

      onError: (error) => {
        console.error('[WebSocket] ❌ WebSocket连接错误:', error)
        
        // 处理特定类型的错误
        if (error?.type === 'MESSAGE_TOO_LARGE') {
          console.log('[WebSocket] 💡 消息过大，建议分段发送')
        }
      },

      onAgentThinking: (data) => {
        console.log('[WebSocket] 🤖 Agent思考状态:', data)
        handleAgentThinking(data)
      },

      onAgentThinkingStream: (data) => {
        console.log('[WebSocket] 🤖 Agent思考流式更新:', data)
        handleAgentThinkingStream(data)
      },

      onHistoryLoaded: (historyMessages) => {
        console.log('[WebSocket] 📜 加载历史消息:', historyMessages?.length || 0, '条')

        if (!Array.isArray(historyMessages) || historyMessages.length === 0) {
          console.log('[WebSocket] 📜 历史消息为空，设置hasMoreHistory为false')
          hasMoreHistory.value = false
          return
        }

        // 过滤掉当前会话的消息
        const currentSessionMessages = historyMessages.filter(msg => {
          const messageTime = new Date(msg.timestamp).getTime()
          const sessionStart = new Date(sessionStartTime.value).getTime()
          return messageTime < sessionStart
        })

        console.log('[WebSocket] 📜 过滤后的历史消息:', currentSessionMessages.length, '条')

        if (currentSessionMessages.length > 0) {
          // 添加历史消息到列表开头
          messages.value.unshift(...currentSessionMessages)
          
          // 更新hasMoreHistory状态
          hasMoreHistory.value = currentSessionMessages.length >= 50 // 假设每页50条
          
          console.log('[WebSocket] 📜 历史消息已添加到列表，当前总消息数:', messages.value.length)
        } else {
          hasMoreHistory.value = false
          console.log('[WebSocket] 📜 没有更多历史消息')
        }
      }
    })
  }

  // 添加消息
  const addMessage = (message: ChatMessage, options: { preventAutoScroll?: boolean } = {}) => {
    // 验证消息数据的完整性
    if (!message || (!message.id && !message.tempId)) {
      console.warn('⚠️ 消息缺少必要的ID字段，跳过添加:', message)
      return
    }

    if (!message.content && message.messageType !== 'image' && !message.isThinking) {
      console.warn('⚠️ 消息内容为空且非图片消息或思考消息，跳过添加:', message)
      return
    }

    if (!message.senderName) {
      console.warn('⚠️ 消息缺少发送者信息，跳过添加:', message)
      return
    }


    
    // 检查是否需要替换思考消息：
    // 1. 明确标记了replaceThinking为true（agent_reply消息类型）
    // 2. 或者是Agent消息且不是思考状态（兼容旧逻辑）
    const shouldReplaceThinking = message.replaceThinking || 
      ((message.type === 'agent' || message.type === 'agent_message') && !message.isThinking)
    
    if (shouldReplaceThinking) {
      let thinkingMessageIndex = -1
      let matchMethod = 'none'
      
      // 多种方式查找思考消息，提高匹配成功率
      
      // 方式1: 通过conversationId查找
      if (message.conversationId) {
        thinkingMessageIndex = messages.value.findIndex(
          msg => msg.conversationId === message.conversationId && msg.isThinking
        )
        if (thinkingMessageIndex !== -1) {
          matchMethod = 'conversationId'
        }
      }
      
      // 方式2: 通过tempId查找
      if (thinkingMessageIndex === -1 && message.tempId) {
        thinkingMessageIndex = messages.value.findIndex(
          msg => msg.tempId === message.tempId && msg.isThinking
        )
        if (thinkingMessageIndex !== -1) {
          matchMethod = 'tempId'
        }
      }
      
      // 方式3: 通过senderName查找最近的思考消息（兼容性处理）
      if (thinkingMessageIndex === -1 && message.senderName) {
        // 查找同一个Agent的最近思考消息
        for (let i = messages.value.length - 1; i >= 0; i--) {
          const msg = messages.value[i]
          if (msg.isThinking && 
              (msg.senderName === message.senderName || 
               msg.senderName?.split('.')[0] === message.senderName?.split('.')[0])) {
            thinkingMessageIndex = i
            matchMethod = 'senderName'
            break
          }
        }
      }
      
      // 方式4: 查找任何思考消息（最后的兜底方案）
      if (thinkingMessageIndex === -1) {
        thinkingMessageIndex = messages.value.findIndex(msg => msg.isThinking)
        if (thinkingMessageIndex !== -1) {
          matchMethod = 'anyThinking'
          console.warn('⚠️ 使用兜底方案匹配思考消息')
        }
      }
      
      if (thinkingMessageIndex !== -1) {
        const thinkingMessage = messages.value[thinkingMessageIndex]
        
        // 标记这是一个思考消息替换操作，不应该触发自动滚动
        shouldPreventAutoScroll.value = true
        
        // 移除思考消息
        messages.value.splice(thinkingMessageIndex, 1)
        
        console.log('✅ 思考消息已移除:', {
          matchMethod,
          removedMessage: {
            id: thinkingMessage.id,
            senderName: thinkingMessage.senderName,
            conversationId: thinkingMessage.conversationId,
            tempId: thinkingMessage.tempId
          },
          newMessage: {
            id: message.id,
            senderName: message.senderName,
            conversationId: message.conversationId,
            tempId: message.tempId
          },
          remainingMessages: messages.value.length
        })
        
        // 重置防止自动滚动标志（延迟重置，确保UI更新完成）
        setTimeout(() => {
          shouldPreventAutoScroll.value = false
        }, 100)
        
      } else {
        console.warn('⚠️ 未找到对应的思考消息进行替换')
        console.warn('🔍 详细调试信息:', {
          searchCriteria: { 
            conversationId: message.conversationId, 
            tempId: message.tempId,
            senderName: message.senderName,
            type: message.type
          },
          availableThinkingMessages: messages.value.filter(msg => msg.isThinking).map(msg => ({
            id: msg.id,
            senderName: msg.senderName,
            conversationId: msg.conversationId,
            tempId: msg.tempId,
            thinkingContent: msg.thinkingContent
          })),
          totalMessages: messages.value.length,
          recentMessages: messages.value.slice(-3).map(msg => ({
            id: msg.id,
            type: msg.type,
            senderName: msg.senderName,
            isThinking: msg.isThinking
          }))
        })
      }
    }

    console.log('📨 添加新消息详细信息:', {
      id: message.id,
      tempId: message.tempId,
      messageType: message.messageType,
      content: message.content?.substring(0, 50) + '...',
      senderName: message.senderName,
      type: message.type,
      timestamp: message.timestamp,
      status: message.status,
      conversationId: message.conversationId,
      isThinking: message.isThinking,
      thinkingContent: message.thinkingContent
    })

    // 特别标记思考消息
    if (message.isThinking) {
      console.log('🤖 [THINKING MESSAGE] 正在添加思考消息:', {
        id: message.id,
        senderName: message.senderName,
        thinkingContent: message.thinkingContent,
        conversationId: message.conversationId
      })
    }

    // 检查消息是否已存在（避免重复）
    // 注意：思考消息有特殊的ID格式，不应该与普通消息冲突
    const exists = messages.value.some((m) => {
      // 优先通过ID检查
      if (message.id && m.id === message.id) {
        return true
      }
      
      // 对于非思考消息，检查tempId
      if (message.tempId && m.tempId === message.tempId && !message.isThinking && !m.isThinking) {
        return true
      }
      
      return false
    })
    
    if (!exists) {
      const newMessage = {
        ...message,
        // 确保必要字段存在
        id: message.id || message.tempId || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        senderName: message.senderName || 'Unknown User',
        timestamp: message.timestamp || new Date().toISOString(),
        status: message.status || 'delivered', // 收到的消息默认为已处理
        content: message.content || ''
      }

      messages.value.push(newMessage)
      console.log('✅ 添加新消息成功:', {
        id: newMessage.id,
        tempId: newMessage.tempId,
        content: newMessage.content?.substring(0, 20) + '...',
        status: newMessage.status,
        isThinking: newMessage.isThinking
      })
      console.log('📋 当前消息总数:', messages.value.length)
      
      // 如果不是思考消息替换，则允许自动滚动
      if (!shouldPreventAutoScroll.value) {
        console.log('📜 允许自动滚动')
      } else {
        console.log('🚫 阻止自动滚动（思考消息替换）')
        // 重置状态，为下次消息做准备
        setTimeout(() => {
          shouldPreventAutoScroll.value = false
        }, 100)
      }
    } else {
      console.log('⚠️ 消息已存在，跳过添加:', message.id || message.tempId)
    }
  }

  // 根据临时ID更新消息状态
  const updateMessageStatus = (tempId: string, status: ChatMessage['status'], realId?: string) => {
    console.log('🔄 尝试更新消息状态:', { tempId, status, realId })
    console.log(
      '📋 当前消息列表:',
      messages.value.map((m) => ({
        id: m.id,
        tempId: m.tempId,
        content: m.content?.substring(0, 20) + '...',
        status: m.status
      }))
    )

    const messageIndex = messages.value.findIndex((m) => m.tempId === tempId)
    console.log('🔍 查找结果:', { messageIndex, tempId })

    if (messageIndex !== -1) {
      const oldMessage = messages.value[messageIndex]
      messages.value[messageIndex] = {
        ...oldMessage,
        status,
        ...(realId && { id: realId }) // 如果有真实ID，更新它
      }
      console.log('✅ 更新消息状态成功:', {
        tempId,
        status,
        realId,
        oldStatus: oldMessage.status,
        newStatus: messages.value[messageIndex].status
      })
    } else {
      console.warn('⚠️ 未找到临时ID对应的消息:', tempId)
      console.warn('⚠️ 可用的临时ID列表:', messages.value.map((m) => m.tempId).filter(Boolean))
    }
  }

  // 根据消息ID更新状态
  const updateMessageStatusById = (messageId: string, status: ChatMessage['status']) => {
    const messageIndex = messages.value.findIndex((m) => m.id === messageId)
    if (messageIndex !== -1) {
      messages.value[messageIndex] = {
        ...messages.value[messageIndex],
        status
      }
      console.log('✅ 更新消息状态:', { messageId, status })
    } else {
      console.warn('⚠️ 未找到ID对应的消息:', messageId)
    }
  }

  // 发送图片消息
  const sendImageMessage = async (imageUrl: string) => {
    try {
      const response = await chatApi.sendMessage(currentNamespace.value, {
        message: imageUrl,
        type: 'user',
        messageType: 'image'
      })
      return true
    } catch (error) {
      console.error('❌ 发送图片消息失败:', error)
      throw error
    }
  }

  // 发送消息
  const sendMessage = async (content: string, mentionedAgents?: string[], messageType: string = 'text') => {
    if (!content.trim()) {
      console.warn('⚠️ 消息内容为空，跳过发送')
      return false
    }

    if (!socketManager || !socketManager.isConnected) {
      console.error('❌ WebSocket未连接，无法发送消息')
      throw new Error('WebSocket未连接')
    }

    if (!userStore.username) {
      throw new Error('用户信息不完整，请重新登录')
    }

    try {
      const tempId = socketManager.sendMessage(content, messageType, mentionedAgents)
      
      const optimisticMessage: ChatMessage = {
        id: tempId,
        tempId: tempId,
        senderId: userStore.username,
        senderName: userStore.username,
        senderAvatar: userStore.currentUser?.avatar || '',
        content: content,
        timestamp: new Date().toISOString(),
        type: 'user',
        status: 'sending',
        messageType: messageType as any,
        imageUrl: messageType === 'image' ? content : undefined,
        mentionedAgents: mentionedAgents
      }

      addMessage(optimisticMessage)
      return true
    } catch (error) {
      console.error('❌ 发送消息失败:', error)
      throw error
    }
  }

  // 发送输入状态
  const sendTyping = (isTyping: boolean) => {
    if (socketManager?.isConnected) {
      socketManager.socketInstance?.sendTyping(isTyping)
    }
  }

  // 加载更多历史消息
  const loadMoreHistory = async () => {
    if (!hasMoreHistory.value || isLoadingHistory.value || !socketManager) {
      return
    }

    isLoadingHistory.value = true
    const oldestMessage = messages.value[0]
    const beforeId = oldestMessage?.id

    console.log('📜 加载更多历史消息, before:', beforeId)
    socketManager.socketInstance?.loadMoreHistory(beforeId || '', 20)
  }

  // 断开连接
  const disconnect = () => {
    console.log('🔌 断开聊天室连接')

    if (socketManager) {
      socketManager.disconnect()
      socketManager = null
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
    return {
      namespace: currentNamespace.value,
      username: userStore.username,
      connected: isConnected.value
    }
  }

  // 清理残留的思考消息（辅助方法）
  const cleanupThinkingMessages = (agentName?: string, maxAge: number = 30000) => {
    const now = Date.now()
    let cleanedCount = 0
    
    // 查找需要清理的思考消息
    const indicesToRemove: number[] = []
    
    messages.value.forEach((msg, index) => {
      if (!msg.isThinking) return
      
      // 检查消息年龄
      const messageAge = now - new Date(msg.timestamp).getTime()
      const shouldCleanByAge = messageAge > maxAge
      
      // 检查是否匹配指定的Agent
      const shouldCleanByAgent = !agentName || 
        msg.senderName === agentName || 
        msg.senderName?.split('.')[0] === agentName?.split('.')[0]
      
      if (shouldCleanByAge && shouldCleanByAgent) {
        indicesToRemove.push(index)
      }
    })
    
    // 从后往前删除，避免索引变化
    for (let i = indicesToRemove.length - 1; i >= 0; i--) {
      const index = indicesToRemove[i]
      const removedMsg = messages.value.splice(index, 1)[0]
      cleanedCount++
      
      console.log('🧹 清理过期思考消息:', {
        id: removedMsg.id,
        senderName: removedMsg.senderName,
        age: now - new Date(removedMsg.timestamp).getTime(),
        thinkingContent: removedMsg.thinkingContent
      })
    }
    
    if (cleanedCount > 0) {
      console.log(`🧹 已清理 ${cleanedCount} 条过期思考消息`)
    }
    
    return cleanedCount
  }

  // 处理Agent思考状态
  const handleAgentThinking = (data: { conversationId: string; agentName: string; status: 'start' | 'continue' | 'end'; tempId?: string }) => {
    const { conversationId, agentName, status, tempId } = data
    
    console.log('🤖 处理Agent思考状态:', { conversationId, agentName, status, tempId })
    
    if (status === 'start') {
      // 在开始新的思考前，清理该Agent的旧思考消息
      cleanupThinkingMessages(agentName, 5000) // 清理5秒前的思考消息
      
      // 确保Agent名称格式正确（应该包含namespace）
      let fullAgentName = agentName
      if (!agentName.includes('.')) {
        // 如果agentName不包含namespace，从conversationId中提取或使用默认值
        const namespaceMatch = conversationId.match(/_([^_]+)_[^_]+$/)
        const namespace = namespaceMatch ? namespaceMatch[1] : 'default'
        fullAgentName = `${agentName}.${namespace}`
      }
      
      // Agent开始思考，创建一个思考状态的消息
      const thinkingMessage: ChatMessage = {
        id: `thinking_${conversationId}`,
        senderId: fullAgentName,
        senderName: fullAgentName,
        content: '', // 思考消息内容为空，通过thinkingContent显示
        timestamp: new Date().toISOString(),
        type: 'agent',
        status: 'thinking',
        conversationId,
        isThinking: true,
        thinkingContent: '正在思考...',
        tempId: tempId // 关联原始消息的tempId
      }
      
      console.log('🤖 创建Agent思考消息:', thinkingMessage)
      addMessage(thinkingMessage)
    } else if (status === 'end') {
      // Agent思考结束，等待最终回复
      console.log('🤖 Agent思考结束，等待最终回复:', conversationId)
      
      // 设置一个定时器，如果5秒后还没有收到最终回复，就清理思考消息
      setTimeout(() => {
        const stillHasThinking = messages.value.some(
          msg => msg.conversationId === conversationId && msg.isThinking
        )
        
        if (stillHasThinking) {
          console.warn('⚠️ 思考结束后5秒仍有思考消息，执行清理')
          cleanupThinkingMessages(agentName, 0) // 立即清理该Agent的思考消息
        }
      }, 5000)
    }
  }

  // 处理Agent思考流式更新
  const handleAgentThinkingStream = (data: { conversationId: string; content?: string; progress?: number; tempId?: string }) => {
    const { conversationId, content, progress, tempId } = data
    
    console.log('🤖 处理思考流式更新:', { conversationId, content, progress, tempId })
    
    // 优先通过conversationId查找，如果没有则通过tempId查找
    let thinkingMessageIndex = -1
    let searchMethod = 'none'
    
    if (conversationId) {
      thinkingMessageIndex = messages.value.findIndex(
        msg => msg.conversationId === conversationId && msg.isThinking
      )
      if (thinkingMessageIndex !== -1) {
        searchMethod = 'conversationId'
      }
    }
    
    // 如果通过conversationId没找到，尝试通过tempId查找
    if (thinkingMessageIndex === -1 && tempId) {
      thinkingMessageIndex = messages.value.findIndex(
        msg => msg.tempId === tempId && msg.isThinking
      )
      if (thinkingMessageIndex !== -1) {
        searchMethod = 'tempId'
      }
    }
    
    // 如果还是没找到，尝试通过Agent名称查找最近的思考消息
    if (thinkingMessageIndex === -1) {
      // 从conversationId中提取agent名称（如果可能）
      let agentName = ''
      if (conversationId && conversationId.includes('_')) {
        const parts = conversationId.split('_')
        if (parts.length >= 4) {
          agentName = parts[3] // conv_timestamp_username_agentname_hash
        }
      }
      
      if (agentName) {
        thinkingMessageIndex = messages.value.findIndex(
          msg => msg.isThinking && (
            msg.senderName === agentName || 
            msg.senderName.startsWith(agentName + '.') ||
            msg.senderName.includes(agentName)
          )
        )
        if (thinkingMessageIndex !== -1) {
          searchMethod = 'agentName'
        }
      }
    }
    
    console.log('🔍 查找思考消息结果:', {
      conversationId,
      tempId,
      thinkingMessageIndex,
      searchMethod,
      totalMessages: messages.value.length,
      thinkingMessages: messages.value.filter(msg => msg.isThinking).map(msg => ({
        id: msg.id,
        conversationId: msg.conversationId,
        tempId: msg.tempId,
        senderName: msg.senderName,
        isThinking: msg.isThinking,
        thinkingContent: msg.thinkingContent
      })),
      allMessages: messages.value.map(msg => ({
        id: msg.id,
        type: msg.type,
        senderName: msg.senderName,
        isThinking: msg.isThinking,
        conversationId: msg.conversationId,
        tempId: msg.tempId
      }))
    })
    
    if (thinkingMessageIndex !== -1) {
      const thinkingMessage = messages.value[thinkingMessageIndex]
      
      // 更新思考内容
      if (content !== undefined) {
        // 如果有实际的思考内容，直接使用
        thinkingMessage.thinkingContent = content
      } else if (progress !== undefined) {
        // 只有在没有实际内容时才显示进度
        thinkingMessage.thinkingContent = `正在思考... (${Math.round(progress * 100)}%)`
      }
      
      console.log('🤖 更新Agent思考内容:', {
        searchMethod,
        conversationId,
        tempId,
        content: thinkingMessage.thinkingContent,
        progress,
        hasContent: content !== undefined,
        hasProgress: progress !== undefined
      })
      
      // 触发响应式更新
      messages.value[thinkingMessageIndex] = { ...thinkingMessage }
    } else {
      console.warn('⚠️ 未找到对应的思考消息进行更新')
      console.warn('🔍 调试信息:', {
        searchCriteria: { conversationId, tempId },
        availableThinkingMessages: messages.value.filter(msg => msg.isThinking),
        totalMessages: messages.value.length,
        recentMessages: messages.value.slice(-5).map(msg => ({
          id: msg.id,
          type: msg.type,
          senderName: msg.senderName,
          isThinking: msg.isThinking
        }))
      })
      
      // 尝试创建一个临时的思考消息（防护机制）
      if (conversationId && content) {
        console.log('🛡️ 创建临时思考消息作为防护机制')
        
        // 从conversationId中提取agent名称
        let agentName = 'unknown-agent'
        if (conversationId.includes('_')) {
          const parts = conversationId.split('_')
          if (parts.length >= 4) {
            agentName = parts[3] // conv_timestamp_username_agentname_hash
          }
        }
        
        const emergencyThinkingMessage: ChatMessage = {
          id: `emergency_thinking_${conversationId}`,
          senderId: agentName,
          senderName: agentName,
          content: '',
          timestamp: new Date().toISOString(),
          type: 'agent',
          status: 'thinking',
          conversationId,
          isThinking: true,
          thinkingContent: content || '正在思考...',
          tempId: tempId
        }
        
        console.log('🛡️ 添加紧急思考消息:', emergencyThinkingMessage)
        addMessage(emergencyThinkingMessage)
      }
    }
  }



  // 获取详细的连接状态
  const getDetailedConnectionStatus = () => {
    return {
      isConnected: isConnected.value,
      namespace: currentNamespace.value,
      status: isConnected.value ? 'connected' : 'disconnected',
      message: isConnected.value ? '连接正常' : '连接断开'
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
    shouldPreventAutoScroll,

    // 方法
    connect,
    disconnect,
    sendMessage,
    sendImageMessage,
    sendTyping,
    addMessage,
    loadMoreHistory,
    clearMessages,
    getConnectionInfo,
    getDetailedConnectionStatus,
    
    // 思考消息管理
    cleanupThinkingMessages,
  }
})
