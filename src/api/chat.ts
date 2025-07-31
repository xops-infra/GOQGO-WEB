import axios from '@/utils/axios'

export interface ChatMessage {
  id: string
  chatId: string
  senderId: string
  sender: string
  content: string
  type: 'text' | 'image' | 'file'
  timestamp: number
  metadata?: Record<string, any>
}

export interface ChatSession {
  id: string
  name: string
  namespace: string
  members: string[]
  createdAt: string
  updatedAt: string
}

export const chatApi = {
  // 获取聊天历史
  getHistory: (namespace: string, chatName: string = 'default', limit: number = 50) =>
    axios.get<ChatMessage[]>(`/api/v1/namespaces/${namespace}/chats/${chatName}/messages`, {
      params: { limit }
    }),
  
  // 发送消息
  sendMessage: (namespace: string, chatName: string = 'default', message: string) =>
    axios.post<ChatMessage>(`/api/v1/namespaces/${namespace}/chats/${chatName}/messages`, { 
      content: message,
      type: 'text'
    }),
  
  // 发送图片消息
  sendImageMessage: (namespace: string, chatName: string = 'default', imageUrl: string) =>
    axios.post<ChatMessage>(`/api/v1/namespaces/${namespace}/chats/${chatName}/messages`, {
      content: imageUrl,
      type: 'image'
    }),
  
  // 删除消息
  deleteMessage: (namespace: string, chatName: string = 'default', messageId: string) =>
    axios.delete(`/api/v1/namespaces/${namespace}/chats/${chatName}/messages/${messageId}`),
  
  // 编辑消息
  editMessage: (namespace: string, chatName: string = 'default', messageId: string, content: string) =>
    axios.put(`/api/v1/namespaces/${namespace}/chats/${chatName}/messages/${messageId}`, {
      content
    }),
  
  // 搜索消息
  searchMessages: (namespace: string, chatName: string = 'default', query: string) =>
    axios.get<ChatMessage[]>(`/api/v1/namespaces/${namespace}/chats/${chatName}/messages/search`, {
      params: { query }
    })
}
