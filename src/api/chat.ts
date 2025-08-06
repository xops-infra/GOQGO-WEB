import { get, post } from '@/utils/request'
import { API_ENDPOINTS } from '@/config/api'
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

export const chatApi = {
  // 获取全局聊天列表
  getGlobalChats: async () => {
    return get(API_ENDPOINTS.CHATS.GLOBAL_LIST)
  },

  // 获取命名空间下的聊天列表
  getChats: async (namespace: string) => {
    return get(API_ENDPOINTS.CHATS.LIST(namespace))
  },

  // 发送消息到聊天室
  sendMessage: async (
    namespace: string,
    chatName: string,
    data: SendMessageRequest
  ): Promise<SendMessageResponse> => {
    const response = await post(API_ENDPOINTS.CHATS.SEND_MESSAGE(namespace, chatName), {
      content: data.message,
      type: data.type || 'user',
      messageType: data.messageType || 'text',
      timestamp: new Date().toISOString()
    })
    return response
  },

  // 获取聊天历史
  getChatHistory: async (
    namespace: string,
    chatName: string,
    limit?: number,
    before?: string
  ): Promise<ChatMessage[]> => {
    const params = new URLSearchParams()
    if (limit) params.append('limit', limit.toString())
    if (before) params.append('before', before)

    const response = await get(`${API_ENDPOINTS.CHATS.GET_HISTORY(namespace, chatName)}?${params}`)
    return response.items || []
  },

  // 搜索消息
  searchMessages: async (
    namespace: string,
    chatName: string,
    query: string,
    limit?: number
  ) => {
    const params = new URLSearchParams()
    params.append('q', query)
    if (limit) params.append('limit', limit.toString())

    return get(`${API_ENDPOINTS.CHATS.SEARCH_MESSAGES(namespace, chatName)}?${params}`)
  },

  // 编辑消息
  editMessage: async (
    namespace: string,
    chatName: string,
    messageId: string,
    content: string
  ) => {
    return post(API_ENDPOINTS.CHATS.EDIT_MESSAGE(namespace, chatName, messageId), {
      content
    })
  },

  // 删除消息
  deleteMessage: async (
    namespace: string,
    chatName: string,
    messageId: string
  ) => {
    return post(API_ENDPOINTS.CHATS.DELETE_MESSAGE(namespace, chatName, messageId))
  },

  // 获取聊天室信息
  getChatInfo: async (namespace: string, chatName: string) => {
    return get(API_ENDPOINTS.CHATS.GET(namespace, chatName))
  },

  // 创建聊天室
  createChat: async (namespace: string, chatName: string, title?: string) => {
    return post(API_ENDPOINTS.CHATS.CREATE(namespace), {
      name: chatName,
      title: title || chatName,
      type: 'group'
    })
  },

  // 更新聊天室
  updateChat: async (namespace: string, chatName: string, data: any) => {
    return post(API_ENDPOINTS.CHATS.UPDATE(namespace, chatName), data)
  },

  // 删除聊天室
  deleteChat: async (namespace: string, chatName: string) => {
    return post(API_ENDPOINTS.CHATS.DELETE(namespace, chatName))
  }
}
