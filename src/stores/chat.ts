import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ChatMessage } from '@/types/api'
import { SocketReconnectManager } from '@/utils/socketReconnectManager'
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

  // WebSocket重连管理器
  let socketManager: SocketReconnectManager | null = null

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
    console.log('🔍 connect函数接收到的namespace:', {
      value: namespace,
      type: typeof namespace,
      isString: typeof namespace === 'string',
      stringified: String(namespace)
    })

    // 确保namespace是字符串类型
    const namespaceStr = typeof namespace === 'string' ? namespace : String(namespace)
    currentNamespace.value = namespaceStr

    console.log('🔌 连接聊天室:', {
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
      socketManager.disconnect()
    }

    // 创建新的Socket重连管理器
    socketManager = new SocketReconnectManager({
      maxAttempts: 10,
      baseDelay: 1000,
      maxDelay: 30000,
      backoffFactor: 2,
      enableHeartbeat: true,
      heartbeatInterval: 30000
    })

    // 连接到指定的命名空间聊天室
    socketManager.connect(namespaceStr, {
      onMessage: (message) => {
        console.log('📨 收到新消息:', message)
        addMessage(message)
      },

      onMessageSent: (tempId, messageId, status = 'success') => {
        console.log('✅ 消息发送确认:', { tempId, messageId, status })
        if (status === 'success') {
          updateMessageStatus(tempId, 'sent', messageId)
        } else {
          updateMessageStatus(tempId, 'error')
        }
      },

      onMessageDelivered: (messageId) => {
        console.log('📬 消息处理确认:', messageId)
        updateMessageStatusById(messageId, 'delivered')
      },

      onHistoryInfo: (info) => {
        hasMoreHistory.value = info.hasMore
        console.log('📜 历史消息信息更新:', info)
      },

      onUserJoin: (username) => {
        console.log('👤 用户加入聊天室:', username)
        if (username && !onlineUsers.value.includes(username)) {
          onlineUsers.value.push(username)
        }
      },

      onUserLeave: (username) => {
        console.log('👤 用户离开聊天室:', username)
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
        console.log('🔌 WebSocket连接状态:', connected ? '已连接' : '已断开')
      },

      onError: (error) => {
        console.error('❌ WebSocket连接错误:', error)
        
        // 处理特定类型的错误
        if (error?.type === 'MESSAGE_TOO_LARGE') {
          console.log('💡 消息过大，建议分段发送')
        }
      },

      onAgentThinking: (data) => {
        console.log('🤖 Agent思考状态:', data)
        handleAgentThinking(data)
      },

      onAgentThinkingStream: (data) => {
        console.log('🤖 Agent思考流式更新:', data)
        handleAgentThinkingStream(data)
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
        const existingIds = new Set(messages.value.map((m) => m.id))
        const newMessages = historyMessages.filter((m) => m && m.id && !existingIds.has(m.id))

        console.log('📜 消息去重结果:', {
          existing: messages.value.length,
          received: historyMessages.length,
          new: newMessages.length
        })

        if (newMessages.length > 0) {
          // 将历史消息添加到开头（保持时间顺序）
          messages.value = [...newMessages, ...messages.value]
          console.log(
            '✅ 添加了',
            newMessages.length,
            '条新的历史消息，总计:',
            messages.value.length,
            '条'
          )
        } else {
          console.log('⚠️ 没有新的历史消息需要添加')
        }

        isLoadingHistory.value = false

        // 如果返回的消息数量少于请求数量，说明没有更多了
        if (historyMessages.length < 20) {
          hasMoreHistory.value = false
          console.log('📜 历史消息数量少于20条，设置hasMoreHistory为false')
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

    // 特殊处理：如果是Agent的最终回复，需要替换对应的思考消息
    console.log('🔍 检查是否需要替换思考消息:', {
      hasConversationId: !!message.conversationId,
      conversationId: message.conversationId,
      hasTempId: !!message.tempId,
      tempId: message.tempId,
      messageType: message.type,
      isAgent: message.type === 'agent',
      isThinking: message.isThinking,
      replaceThinking: message.replaceThinking,
      senderName: message.senderName
    })
    
    // 检查是否需要替换思考消息：
    // 1. 明确标记了replaceThinking为true（agent_reply消息类型）
    // 2. 或者是Agent消息且不是思考状态（兼容旧逻辑）
    const shouldReplaceThinking = message.replaceThinking || 
      ((message.type === 'agent' || message.type === 'agent_message') && !message.isThinking)
    
    if (shouldReplaceThinking) {
      let thinkingMessageIndex = -1
      let matchMethod = 'none'
      
      // 方法1: 通过conversationId精确匹配（最优先）
      if (message.conversationId) {
        thinkingMessageIndex = messages.value.findIndex(
          msg => msg.conversationId === message.conversationId && msg.isThinking
        )
        if (thinkingMessageIndex !== -1) {
          matchMethod = 'conversationId'
        }
      }
      
      // 方法2: 通过tempId匹配（次优先）
      if (thinkingMessageIndex === -1 && message.tempId) {
        thinkingMessageIndex = messages.value.findIndex(
          msg => msg.tempId === message.tempId && msg.isThinking
        )
        if (thinkingMessageIndex !== -1) {
          matchMethod = 'tempId'
        }
      }
      
      // 方法3: 通过Agent名称匹配最近的思考消息（备用方案）
      if (thinkingMessageIndex === -1) {
        const agentName = message.senderName.split('.')[0]
        thinkingMessageIndex = messages.value.findIndex(
          msg => msg.isThinking && (
            msg.senderName === agentName ||
            msg.senderName === message.senderName ||
            msg.senderName.startsWith(agentName + '.')
          )
        )
        if (thinkingMessageIndex !== -1) {
          matchMethod = 'agentName'
        }
      }
      
      console.log('🔍 查找思考消息结果:', {
        thinkingMessageIndex,
        matchMethod,
        totalMessages: messages.value.length,
        thinkingMessages: messages.value.filter(msg => msg.isThinking).map(msg => ({
          id: msg.id,
          conversationId: msg.conversationId,
          tempId: msg.tempId,
          senderName: msg.senderName,
          isThinking: msg.isThinking
        }))
      })
      
      if (thinkingMessageIndex !== -1) {
        console.log('🤖 找到思考消息，进行替换:', {
          matchMethod,
          thinkingMessageId: messages.value[thinkingMessageIndex].id,
          replyMessageId: message.id,
          conversationId: message.conversationId
        })
        
        // 标记这是一个思考消息替换操作，不应该触发自动滚动
        shouldPreventAutoScroll.value = true
        
        // 移除思考消息
        messages.value.splice(thinkingMessageIndex, 1)
        console.log('✅ 思考消息已移除，当前消息总数:', messages.value.length)
        console.log('🎯 Agent思考流程结束，conversationId:', message.conversationId)
      } else {
        console.warn('⚠️ 未找到对应的思考消息进行替换')
        console.warn('🔍 调试信息:', {
          searchCriteria: { 
            conversationId: message.conversationId, 
            tempId: message.tempId,
            senderName: message.senderName
          },
          availableThinkingMessages: messages.value.filter(msg => msg.isThinking),
          totalMessages: messages.value.length
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
      console.log('📤 发送图片消息:', imageUrl)

      // 调用 HTTP API 发送图片消息
      const response = await chatApi.sendMessage(currentNamespace.value, {
        message: imageUrl,
        type: 'user',
        messageType: 'image'
      })

      console.log('✅ 图片消息发送成功:', response)
      return true
    } catch (error) {
      console.error('❌ 发送图片消息失败:', error)
      throw error
    }
  }

  // 发送消息 - 使用乐观更新 + 确认机制
  const sendMessage = async (content: string, mentionedAgents?: string[], messageType: string = 'text') => {
    if (!content.trim()) {
      console.warn('⚠️ 消息内容为空，跳过发送')
      return false
    }

    if (!socketManager || !socketManager.isConnected) {
      console.error('❌ WebSocket未连接，无法发送消息')
      throw new Error('WebSocket未连接')
    }

    try {
      console.log('📤 准备发送消息:', {
        namespace: currentNamespace.value,
        content: content.substring(0, 50) + '...',
        messageType,
        mentionedAgents,
        currentUser: userStore.currentUser
      })

      // 检查用户信息
      if (!userStore.username) {
        console.error('❌ 用户信息不完整，无法发送消息:', {
          currentUser: userStore.currentUser,
          username: userStore.username,
          displayName: userStore.displayName
        })
        throw new Error('用户信息不完整，请重新登录')
      }

      // 通过WebSocket发送消息，获取临时ID
      const tempId = socketManager.sendMessage(content, messageType, mentionedAgents)
      console.log('📤 生成临时ID:', tempId)

      // 乐观更新：立即在前端显示消息
      const optimisticMessage: ChatMessage = {
        id: tempId, // 先使用临时ID
        tempId: tempId, // 保存临时ID用于后续更新
        senderId: userStore.username,
        senderName: userStore.username,
        senderAvatar: userStore.currentUser?.avatar || '',
        content: content,
        timestamp: new Date().toISOString(),
        type: 'user',
        status: 'sending', // 发送中状态
        messageType: messageType as any,
        imageUrl: messageType === 'image' ? content : undefined,
        mentionedAgents: mentionedAgents // 添加Agent提及信息
      }

      console.log('📝 创建乐观更新消息:', {
        id: optimisticMessage.id,
        tempId: optimisticMessage.tempId,
        content: optimisticMessage.content?.substring(0, 20) + '...',
        status: optimisticMessage.status,
        mentionedAgents: optimisticMessage.mentionedAgents
      })

      // 立即添加到消息列表
      addMessage(optimisticMessage)
      console.log('✅ 乐观更新：立即显示消息，等待确认')

      return true
    } catch (error) {
      console.error('❌ 发送消息失败:', error)
      throw error
    }
  }

  // 发送输入状态
  const sendTyping = (isTyping: boolean) => {
    if (socketManager && socketManager.isConnected) {
      socketManager.socketInstance?.sendTyping(isTyping)
    }
  }

  // 加载更多历史消息
  const loadMoreHistory = async () => {
    if (!hasMoreHistory.value || isLoadingHistory.value || !socketManager) {
      return
    }

    isLoadingHistory.value = true

    // 获取最早的消息ID作为before参数
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
    return (
      socketManager?.getConnectionInfo() || {
        namespace: currentNamespace.value,
        username: userStore.username,
        connected: false,
        wsUrl: ''
      }
    )
  }

  // 处理Agent思考状态
  const handleAgentThinking = (data: { conversationId: string; agentName: string; status: 'start' | 'continue' | 'end'; tempId?: string }) => {
    const { conversationId, agentName, status, tempId } = data
    
    console.log('🤖 处理Agent思考状态:', { conversationId, agentName, status, tempId })
    
    if (status === 'start') {
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

  // 手动触发重连
  const forceReconnect = () => {
    console.log('🔄 手动触发Socket重连')
    if (socketManager) {
      socketManager.forceReconnect()
    } else {
      console.warn('⚠️ SocketManager未初始化，无法重连')
    }
  }

  // 获取详细的连接状态
  const getDetailedConnectionStatus = () => {
    if (!socketManager) {
      return {
        isConnected: false,
        status: 'not_initialized',
        message: 'Socket管理器未初始化'
      }
    }

    const info = socketManager.getConnectionInfo()
    return {
      isConnected: info.isConnected,
      namespace: info.namespace,
      reconnectAttempts: info.reconnectAttempts,
      lastConnectedTime: info.lastConnectedTime,
      lastDisconnectReason: info.lastDisconnectReason,
      pendingMessagesCount: info.pendingMessages?.length || 0,
      status: info.isConnected ? 'connected' : 'disconnected',
      message: info.isConnected ? '连接正常' : (info.lastDisconnectReason || '连接断开')
    }
  }

  // 清理待发送消息
  const clearPendingMessages = () => {
    if (socketManager) {
      // 这里可以添加清理逻辑，如果SocketReconnectManager提供相应方法
      console.log('🧹 清理待发送消息')
    }
  }

  // 检查连接健康状态
  const checkConnectionHealth = () => {
    const status = getDetailedConnectionStatus()
    console.log('🔍 连接健康检查:', status)
    return status
  }

  // 事件监听器引用
  let namespaceChangeHandler: ((event: CustomEvent) => void) | null = null
  let websocketReconnectHandler: ((event: CustomEvent) => void) | null = null

  // 设置事件监听器
  const setupEventListeners = () => {
    // 监听namespace变化事件
    namespaceChangeHandler = async (event: CustomEvent) => {
      const { namespace } = event.detail
      console.log('🔄 Chat store收到namespace变化事件:', namespace)

      try {
        // 重新连接到新的namespace聊天室
        await connect(namespace)
        console.log('✅ 已重新连接到新namespace的聊天室')
      } catch (error) {
        console.error('❌ 重新连接聊天室失败:', error)
      }
    }

    // 监听WebSocket重连事件
    websocketReconnectHandler = async (event: CustomEvent) => {
      const { timestamp, namespace: reconnectedNamespace } = event.detail
      console.log('🔄 Chat store收到WebSocket重连事件:', { timestamp, namespace: reconnectedNamespace })

      try {
        // 重连成功后，清理过期的思考消息状态
        await cleanupExpiredThinkingMessages()
        console.log('✅ 重连后状态清理完成')
      } catch (error) {
        console.error('❌ 重连后状态清理失败:', error)
      }
    }

    // 添加事件监听器
    window.addEventListener('namespace-changed', namespaceChangeHandler as EventListener)
    window.addEventListener('websocket-reconnected', websocketReconnectHandler as EventListener)
    console.log('✅ Chat store事件监听器已设置')
  }

  // 清理事件监听器
  const cleanupEventListeners = () => {
    if (namespaceChangeHandler) {
      window.removeEventListener('namespace-changed', namespaceChangeHandler as EventListener)
      namespaceChangeHandler = null
    }
    if (websocketReconnectHandler) {
      window.removeEventListener('websocket-reconnected', websocketReconnectHandler as EventListener)
      websocketReconnectHandler = null
    }
    console.log('🧹 Chat store事件监听器已清理')
  }

  /**
   * 清理过期的思考消息
   * 在WebSocket重连成功后调用，确保UI状态与服务器同步
   */
  const cleanupExpiredThinkingMessages = async () => {
    try {
      console.log('🧹 开始清理过期的思考消息...')
      
      const now = Date.now()
      const maxThinkingAge = 5 * 60 * 1000 // 5分钟
      let cleanedCount = 0
      
      // 查找并清理过期的思考消息
      const expiredThinkingMessages = messages.value.filter(msg => {
        if (msg.isThinking) {
          const messageTime = new Date(msg.timestamp).getTime()
          const age = now - messageTime
          return age > maxThinkingAge
        }
        return false
      })
      
      if (expiredThinkingMessages.length > 0) {
        console.log(`🔍 发现 ${expiredThinkingMessages.length} 条过期的思考消息:`, 
          expiredThinkingMessages.map(msg => ({
            id: msg.id,
            senderName: msg.senderName,
            age: Math.round((now - new Date(msg.timestamp).getTime()) / 1000) + 's'
          }))
        )
        
        // 从消息列表中移除过期的思考消息
        messages.value = messages.value.filter(msg => !expiredThinkingMessages.some(expired => expired.id === msg.id))
        cleanedCount = expiredThinkingMessages.length
        
        console.log(`✅ 已清理 ${cleanedCount} 条过期的思考消息，当前消息总数: ${messages.value.length}`)
      } else {
        console.log('✅ 没有发现过期的思考消息')
      }
      
      return cleanedCount
      
    } catch (error) {
      console.error('❌ 清理过期思考消息失败:', error)
      throw error
    }
  }

  // 初始化事件监听器
  setupEventListeners()

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
    forceReconnect,
    getDetailedConnectionStatus,
    clearPendingMessages,
    checkConnectionHealth,
    setupEventListeners,
    cleanupEventListeners
  }
})
