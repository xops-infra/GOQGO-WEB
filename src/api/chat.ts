import axios from '@/utils/axios'
import type { ChatMessage } from '@/types/api'

const API_BASE = '/api/v1'

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
  // 发送消息到聊天室
  sendMessage: async (
    namespace: string,
    data: SendMessageRequest
  ): Promise<SendMessageResponse> => {
    const response = await axios.post(`${API_BASE}/namespaces/${namespace}/chat/messages`, {
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
    limit?: number,
    before?: string
  ): Promise<ChatMessage[]> => {
    const params = new URLSearchParams()
    if (limit) params.append('limit', limit.toString())
    if (before) params.append('before', before)

    const response = await axios.get(`${API_BASE}/namespaces/${namespace}/chat/messages?${params}`)
    return response.items || []
  },

  // 获取聊天室信息
  getChatInfo: async (namespace: string, chatName: string) => {
    const response = await axios.get(`${API_BASE}/namespaces/${namespace}/chats/${chatName}`)
    return response
  },

  // 创建聊天室
  createChat: async (namespace: string, chatName: string, title?: string) => {
    const response = await axios.post(`${API_BASE}/namespaces/${namespace}/chats`, {
      name: chatName,
      title: title || chatName,
      type: 'group'
    })
    return response
  }
}
