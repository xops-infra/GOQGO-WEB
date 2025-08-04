/**
 * Agent对话状态管理
 */

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { ConversationState, MessageState, ExtendedChatMessage } from '@/types/conversation'

export const useConversationStore = defineStore('conversation', () => {
  // 对话状态映射
  const conversations = ref(new Map<string, ConversationState>())
  
  // 消息状态映射
  const messageStates = ref(new Map<string, MessageState>())
  
  // 超时配置（30秒）
  const CONVERSATION_TIMEOUT = 30000

  /**
   * 生成唯一的对话ID
   */
  const generateConversationId = (): string => {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 生成唯一的消息ID
   */
  const generateMessageId = (): string => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 开始新的对话
   */
  const startConversation = (agentName: string, namespace: string = 'default'): string => {
    const conversationId = generateConversationId()
    const now = Date.now()
    
    const conversation: ConversationState = {
      conversationId,
      agentName,
      namespace,
      status: 'thinking',
      createdAt: new Date().toISOString(),
      timeoutAt: new Date(now + CONVERSATION_TIMEOUT).toISOString(),
      thinkingContent: '',
      startTime: now
    }

    conversations.value.set(conversationId, conversation)

    // 设置超时处理
    setTimeout(() => {
      handleTimeout(conversationId)
    }, CONVERSATION_TIMEOUT)

    console.log('🤖 开始对话:', {
      conversationId,
      agentName,
      namespace,
      timeout: CONVERSATION_TIMEOUT / 1000 + 's'
    })

    return conversationId
  }

  /**
   * 创建思考中的消息
   */
  const createThinkingMessage = (conversationId: string, agentName: string, namespace: string = 'default'): string => {
    const messageId = generateMessageId()
    const conversation = conversations.value.get(conversationId)
    
    if (!conversation) {
      console.error('❌ 对话不存在:', conversationId)
      return messageId
    }

    // 更新对话状态
    conversation.messageId = messageId

    // 创建消息状态
    const messageState: MessageState = {
      messageId,
      status: 'thinking',
      thinkingContent: '',
      startTime: Date.now(),
      conversationId
    }

    messageStates.value.set(conversationId, messageState)

    console.log('💭 创建思考消息:', {
      messageId,
      conversationId,
      agentName,
      namespace
    })

    return messageId
  }

  /**
   * 更新思考内容
   */
  const updateThinkingContent = (conversationId: string, content: string): void => {
    const conversation = conversations.value.get(conversationId)
    const messageState = messageStates.value.get(conversationId)

    if (!conversation || !messageState) {
      console.warn('⚠️ 对话或消息状态不存在:', conversationId)
      return
    }

    if (conversation.status !== 'thinking') {
      console.warn('⚠️ 对话状态不是thinking:', conversationId, conversation.status)
      return
    }

    // 更新思考内容
    conversation.thinkingContent += content
    messageState.thinkingContent += content

    console.log('💭 更新思考内容:', {
      conversationId,
      contentLength: content.length,
      totalLength: conversation.thinkingContent.length
    })
  }

  /**
   * 完成对话
   */
  const completeConversation = (conversationId: string, finalContent: string): void => {
    const conversation = conversations.value.get(conversationId)
    const messageState = messageStates.value.get(conversationId)

    if (!conversation || !messageState) {
      console.warn('⚠️ 对话或消息状态不存在:', conversationId)
      return
    }

    const duration = Date.now() - conversation.startTime

    // 更新对话状态
    conversation.status = 'completed'
    conversation.finalContent = finalContent
    conversation.duration = duration

    // 更新消息状态
    messageState.status = 'completed'

    console.log('✅ 对话完成:', {
      conversationId,
      agentName: conversation.agentName,
      duration: duration + 'ms',
      contentLength: finalContent.length
    })
  }

  /**
   * 处理对话超时
   */
  const handleTimeout = (conversationId: string): void => {
    const conversation = conversations.value.get(conversationId)
    const messageState = messageStates.value.get(conversationId)

    if (!conversation || !messageState) {
      return
    }

    if (conversation.status !== 'thinking') {
      return // 已经完成或出错
    }

    const duration = Date.now() - conversation.startTime

    // 更新状态为超时
    conversation.status = 'timeout'
    conversation.duration = duration
    conversation.error = `Agent响应超时 (${CONVERSATION_TIMEOUT / 1000}s)`

    messageState.status = 'timeout'

    console.warn('⏰ 对话超时:', {
      conversationId,
      agentName: conversation.agentName,
      duration: duration + 'ms'
    })
  }

  /**
   * 处理对话错误
   */
  const handleError = (conversationId: string, error: string): void => {
    const conversation = conversations.value.get(conversationId)
    const messageState = messageStates.value.get(conversationId)

    if (!conversation || !messageState) {
      console.warn('⚠️ 对话或消息状态不存在:', conversationId)
      return
    }

    const duration = Date.now() - conversation.startTime

    // 更新状态为错误
    conversation.status = 'error'
    conversation.duration = duration
    conversation.error = error

    messageState.status = 'error'

    console.error('❌ 对话错误:', {
      conversationId,
      agentName: conversation.agentName,
      error,
      duration: duration + 'ms'
    })
  }

  /**
   * 获取对话状态
   */
  const getConversation = (conversationId: string): ConversationState | null => {
    return conversations.value.get(conversationId) || null
  }

  /**
   * 获取消息状态
   */
  const getMessageState = (conversationId: string): MessageState | null => {
    return messageStates.value.get(conversationId) || null
  }

  /**
   * 清理已完成的对话（避免内存泄漏）
   */
  const cleanupCompletedConversations = (): void => {
    const now = Date.now()
    const CLEANUP_THRESHOLD = 5 * 60 * 1000 // 5分钟

    for (const [conversationId, conversation] of conversations.value.entries()) {
      if (conversation.status !== 'thinking' && 
          now - conversation.startTime > CLEANUP_THRESHOLD) {
        conversations.value.delete(conversationId)
        messageStates.value.delete(conversationId)
        console.log('🧹 清理对话:', conversationId)
      }
    }
  }

  /**
   * 重试对话
   */
  const retryConversation = (conversationId: string): string => {
    const conversation = conversations.value.get(conversationId)
    if (!conversation) {
      console.error('❌ 对话不存在:', conversationId)
      return conversationId
    }

    // 创建新的对话ID
    const newConversationId = startConversation(conversation.agentName, conversation.namespace)
    
    // 清理旧对话
    conversations.value.delete(conversationId)
    messageStates.value.delete(conversationId)

    console.log('🔄 重试对话:', {
      oldConversationId: conversationId,
      newConversationId,
      agentName: conversation.agentName
    })

    return newConversationId
  }

  // 计算属性
  const activeConversations = computed(() => {
    return Array.from(conversations.value.values()).filter(
      conv => conv.status === 'thinking'
    )
  })

  const completedConversations = computed(() => {
    return Array.from(conversations.value.values()).filter(
      conv => conv.status === 'completed'
    )
  })

  const failedConversations = computed(() => {
    return Array.from(conversations.value.values()).filter(
      conv => conv.status === 'timeout' || conv.status === 'error'
    )
  })

  // 定期清理
  setInterval(cleanupCompletedConversations, 60000) // 每分钟清理一次

  return {
    // 状态
    conversations: computed(() => conversations.value),
    messageStates: computed(() => messageStates.value),
    
    // 计算属性
    activeConversations,
    completedConversations,
    failedConversations,
    
    // 方法
    startConversation,
    createThinkingMessage,
    updateThinkingContent,
    completeConversation,
    handleTimeout,
    handleError,
    getConversation,
    getMessageState,
    retryConversation,
    cleanupCompletedConversations
  }
})
