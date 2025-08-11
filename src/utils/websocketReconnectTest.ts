/**
 * WebSocket重连状态清理测试
 * 用于验证重连后过期思考状态的清理功能
 */

import { SocketReconnectManager } from './socketReconnectManager'

/**
 * 模拟测试WebSocket重连后的状态清理
 */
export class WebSocketReconnectTest {
  private reconnectManager: SocketReconnectManager

  constructor() {
    this.reconnectManager = new SocketReconnectManager({
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 5000,
      enableHeartbeat: false
    })
  }

  /**
   * 测试过期思考状态的清理
   */
  async testExpiredThinkingStateCleanup() {
    console.log('🧪 开始测试过期思考状态清理...')

    try {
      // 模拟创建过期的思考状态
      await this.createExpiredThinkingStates()

      // 模拟重连成功
      await this.simulateReconnection()

      // 验证清理结果
      await this.verifyCleanupResult()

      console.log('✅ 测试完成')
    } catch (error) {
      console.error('❌ 测试失败:', error)
    }
  }

  /**
   * 创建过期的思考状态
   */
  private async createExpiredThinkingStates() {
    console.log('📝 创建过期的思考状态...')

    // 模拟过期的聊天消息状态
    const expiredChatState = {
      messages: [
        {
          id: 'thinking_1',
          senderName: 'test-agent.default',
          content: '',
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10分钟前
          isThinking: true,
          conversationId: 'conv_1'
        },
        {
          id: 'thinking_2',
          senderName: 'test-agent.default',
          content: '',
          timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(), // 8分钟前
          isThinking: true,
          conversationId: 'conv_2'
        }
      ]
    }

    localStorage.setItem('goqgo_chat_state', JSON.stringify(expiredChatState))

    // 模拟过期的对话状态
    const expiredConversationState = {
      conversations: {
        'conv_1': {
          conversationId: 'conv_1',
          agentName: 'test-agent',
          status: 'thinking',
          createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          timeoutAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          thinkingContent: '正在思考...',
          startTime: Date.now() - 10 * 60 * 1000
        },
        'conv_2': {
          conversationId: 'conv_2',
          agentName: 'test-agent',
          status: 'thinking',
          createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
          timeoutAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          thinkingContent: '正在思考...',
          startTime: Date.now() - 8 * 60 * 1000
        }
      }
    }

    localStorage.setItem('goqgo_conversation_state', JSON.stringify(expiredConversationState))

    console.log('✅ 过期思考状态创建完成')
  }

  /**
   * 模拟重连成功
   */
  private async simulateReconnection() {
    console.log('🔄 模拟WebSocket重连成功...')

    // 模拟重连成功事件
    const event = new CustomEvent('websocket-reconnected', {
      detail: {
        timestamp: Date.now(),
        namespace: 'default'
      }
    })

    window.dispatchEvent(event)

    // 等待事件处理完成
    await new Promise(resolve => setTimeout(resolve, 100))

    console.log('✅ 重连模拟完成')
  }

  /**
   * 验证清理结果
   */
  private async verifyCleanupResult() {
    console.log('🔍 验证清理结果...')

    // 检查聊天消息状态
    const chatState = localStorage.getItem('goqgo_chat_state')
    if (chatState) {
      const parsed = JSON.parse(chatState)
      const thinkingMessages = parsed.messages?.filter((msg: any) => msg.isThinking) || []
      console.log(`📊 剩余思考消息数量: ${thinkingMessages.length}`)
      
      if (thinkingMessages.length === 0) {
        console.log('✅ 过期思考消息清理成功')
      } else {
        console.log('⚠️ 仍有思考消息未清理:', thinkingMessages)
      }
    }

    // 检查对话状态
    const conversationState = localStorage.getItem('goqgo_conversation_state')
    if (conversationState) {
      const parsed = JSON.parse(conversationState)
      const thinkingConversations = Object.values(parsed.conversations || {}).filter((conv: any) => conv.status === 'thinking')
      console.log(`📊 剩余思考对话数量: ${thinkingConversations.length}`)
      
      if (thinkingConversations.length === 0) {
        console.log('✅ 过期对话状态清理成功')
      } else {
        console.log('⚠️ 仍有对话状态未清理:', thinkingConversations)
      }
    }
  }

  /**
   * 清理测试数据
   */
  cleanup() {
    localStorage.removeItem('goqgo_chat_state')
    localStorage.removeItem('goqgo_conversation_state')
    console.log('🧹 测试数据已清理')
  }
}

/**
 * 运行测试
 */
export function runWebSocketReconnectTest() {
  const test = new WebSocketReconnectTest()
  test.testExpiredThinkingStateCleanup().finally(() => {
    test.cleanup()
  })
}
