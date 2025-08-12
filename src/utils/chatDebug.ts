/**
 * 聊天调试工具
 * 用于调试和手动处理聊天相关问题
 */

import { useChatStore } from '@/stores/chat'

export class ChatDebugTools {
  private chatStore = useChatStore()

  /**
   * 获取当前思考消息的详细信息
   */
  getThinkingMessages() {
    const thinkingMessages = this.chatStore.messages.filter(msg => msg.isThinking)
    
    console.log('🔍 当前思考消息详情:', {
      count: thinkingMessages.length,
      messages: thinkingMessages.map(msg => ({
        id: msg.id,
        senderName: msg.senderName,
        conversationId: msg.conversationId,
        tempId: msg.tempId,
        timestamp: msg.timestamp,
        age: Date.now() - new Date(msg.timestamp).getTime(),
        thinkingContent: msg.thinkingContent
      }))
    })
    
    return thinkingMessages
  }

  /**
   * 强制清理所有思考消息
   */
  forceCleanAllThinking() {
    const thinkingMessages = this.getThinkingMessages()
    
    if (thinkingMessages.length === 0) {
      console.log('✅ 没有发现思考消息需要清理')
      return 0
    }

    const cleanedCount = this.chatStore.cleanupThinkingMessages(undefined, 0)
    console.log(`🧹 强制清理完成，清理了 ${cleanedCount} 条思考消息`)
    
    return cleanedCount
  }

  /**
   * 清理指定Agent的思考消息
   */
  cleanAgentThinking(agentName: string) {
    console.log(`🧹 清理Agent ${agentName} 的思考消息`)
    const cleanedCount = this.chatStore.cleanupThinkingMessages(agentName, 0)
    console.log(`✅ 清理完成，清理了 ${cleanedCount} 条消息`)
    
    return cleanedCount
  }

  /**
   * 分析消息状态，帮助诊断问题
   */
  analyzeMessages() {
    const messages = this.chatStore.messages
    const analysis = {
      total: messages.length,
      byType: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      thinking: 0,
      withConversationId: 0,
      withTempId: 0,
      recent: messages.slice(-5).map(msg => ({
        id: msg.id,
        type: msg.type,
        senderName: msg.senderName,
        isThinking: msg.isThinking,
        status: msg.status,
        timestamp: msg.timestamp
      }))
    }

    messages.forEach(msg => {
      // 按类型统计
      analysis.byType[msg.type || 'unknown'] = (analysis.byType[msg.type || 'unknown'] || 0) + 1
      
      // 按状态统计
      analysis.byStatus[msg.status || 'unknown'] = (analysis.byStatus[msg.status || 'unknown'] || 0) + 1
      
      // 思考消息计数
      if (msg.isThinking) analysis.thinking++
      
      // ID统计
      if (msg.conversationId) analysis.withConversationId++
      if (msg.tempId) analysis.withTempId++
    })

    console.log('📊 消息分析结果:', analysis)
    return analysis
  }

  /**
   * 检查是否有异常的思考消息
   */
  checkAnomalousThinking() {
    const thinkingMessages = this.getThinkingMessages()
    const now = Date.now()
    const anomalous = []

    for (const msg of thinkingMessages) {
      const age = now - new Date(msg.timestamp).getTime()
      const isOld = age > 30000 // 超过30秒
      const hasNoConversationId = !msg.conversationId
      const hasNoTempId = !msg.tempId

      if (isOld || hasNoConversationId || hasNoTempId) {
        anomalous.push({
          message: msg,
          issues: {
            tooOld: isOld,
            noConversationId: hasNoConversationId,
            noTempId: hasNoTempId,
            age: age
          }
        })
      }
    }

    if (anomalous.length > 0) {
      console.warn('⚠️ 发现异常思考消息:', anomalous)
    } else {
      console.log('✅ 没有发现异常思考消息')
    }

    return anomalous
  }

  /**
   * 修复异常思考消息
   */
  fixAnomalousThinking() {
    const anomalous = this.checkAnomalousThinking()
    
    if (anomalous.length === 0) {
      return 0
    }

    console.log(`🔧 开始修复 ${anomalous.length} 条异常思考消息`)
    
    // 清理所有异常思考消息
    const cleanedCount = this.chatStore.cleanupThinkingMessages(undefined, 0)
    
    console.log(`✅ 修复完成，清理了 ${cleanedCount} 条异常消息`)
    return cleanedCount
  }
}

// 创建全局实例
export const chatDebugTools = new ChatDebugTools()

// 在开发环境下将调试工具挂载到window对象
if (import.meta.env.DEV) {
  (window as any).chatDebugTools = chatDebugTools
  console.log('🛠️ 聊天调试工具已挂载到 window.chatDebugTools')
  console.log('可用方法:')
  console.log('- chatDebugTools.getThinkingMessages() - 查看思考消息')
  console.log('- chatDebugTools.forceCleanAllThinking() - 强制清理所有思考消息')
  console.log('- chatDebugTools.cleanAgentThinking(agentName) - 清理指定Agent思考消息')
  console.log('- chatDebugTools.analyzeMessages() - 分析消息状态')
  console.log('- chatDebugTools.checkAnomalousThinking() - 检查异常思考消息')
  console.log('- chatDebugTools.fixAnomalousThinking() - 修复异常思考消息')
}
