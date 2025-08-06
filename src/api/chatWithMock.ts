import { chatApi } from './chat'
import { mockChatService } from '@/mock/services'
import { isMockMode, mockLogger } from '@/mock/config'
import type { ChatMessage } from '@/types/api'

export interface SendMessageRequest {
  message: string
  type?: 'user' | 'agent' | 'system'
  messageType?: 'text' | 'image' | 'file'
}

export interface SendMessageResponse {
  id: string
  success: boolean
  message?: string
}

export const chatApiWithMock = {
  // 获取全局聊天列表
  async getGlobalChats() {
    if (isMockMode()) {
      mockLogger.info('使用Mock获取全局聊天列表')
      // Mock 实现
      return []
    }
    return await chatApi.getGlobalChats()
  },

  // 获取命名空间下的聊天列表
  async getChats(namespace: string) {
    if (isMockMode()) {
      mockLogger.info('使用Mock获取聊天列表', { namespace })
      // Mock 实现
      return []
    }
    return await chatApi.getChats(namespace)
  },

  // 发送消息到聊天室
  async sendMessage(
    namespace: string,
    chatName: string,
    data: SendMessageRequest
  ): Promise<SendMessageResponse> {
    if (isMockMode()) {
      mockLogger.info('使用Mock发送消息', { namespace, chatName, data })
      // Mock 实现
      return {
        id: `mock-${Date.now()}`,
        success: true,
        message: 'Mock message sent'
      }
    }
    return await chatApi.sendMessage(namespace, chatName, data)
  },

  // 获取聊天历史
  async getChatHistory(
    namespace: string,
    chatName: string,
    limit?: number,
    before?: string
  ): Promise<ChatMessage[]> {
    if (isMockMode()) {
      mockLogger.info('使用Mock获取聊天历史', { namespace, chatName, limit, before })
      return await mockChatService.getChatHistory(namespace, chatName, limit, before)
    }
    return await chatApi.getChatHistory(namespace, chatName, limit, before)
  },

  // 搜索消息
  async searchMessages(
    namespace: string,
    chatName: string,
    query: string,
    limit?: number
  ) {
    if (isMockMode()) {
      mockLogger.info('使用Mock搜索消息', { namespace, chatName, query, limit })
      // Mock 实现
      return { items: [] }
    }
    return await chatApi.searchMessages(namespace, chatName, query, limit)
  },

  // 编辑消息
  async editMessage(
    namespace: string,
    chatName: string,
    messageId: string,
    content: string
  ) {
    if (isMockMode()) {
      mockLogger.info('使用Mock编辑消息', { namespace, chatName, messageId, content })
      // Mock 实现
      return { success: true }
    }
    return await chatApi.editMessage(namespace, chatName, messageId, content)
  },

  // 删除消息
  async deleteMessage(
    namespace: string,
    chatName: string,
    messageId: string
  ) {
    if (isMockMode()) {
      mockLogger.info('使用Mock删除消息', { namespace, chatName, messageId })
      // Mock 实现
      return { success: true }
    }
    return await chatApi.deleteMessage(namespace, chatName, messageId)
  },

  // 获取聊天室信息
  async getChatInfo(namespace: string, chatName: string) {
    if (isMockMode()) {
      mockLogger.info('使用Mock获取聊天室信息', { namespace, chatName })
      // Mock 实现
      return {
        name: chatName,
        namespace,
        title: `Mock Chat ${chatName}`,
        type: 'group'
      }
    }
    return await chatApi.getChatInfo(namespace, chatName)
  },

  // 创建聊天室
  async createChat(namespace: string, chatName: string, title?: string) {
    if (isMockMode()) {
      mockLogger.info('使用Mock创建聊天室', { namespace, chatName, title })
      // Mock 实现
      return { success: true, name: chatName }
    }
    return await chatApi.createChat(namespace, chatName, title)
  },

  // 更新聊天室
  async updateChat(namespace: string, chatName: string, data: any) {
    if (isMockMode()) {
      mockLogger.info('使用Mock更新聊天室', { namespace, chatName, data })
      // Mock 实现
      return { success: true }
    }
    return await chatApi.updateChat(namespace, chatName, data)
  },

  // 删除聊天室
  async deleteChat(namespace: string, chatName: string) {
    if (isMockMode()) {
      mockLogger.info('使用Mock删除聊天室', { namespace, chatName })
      // Mock 实现
      return { success: true }
    }
    return await chatApi.deleteChat(namespace, chatName)
  }
}
