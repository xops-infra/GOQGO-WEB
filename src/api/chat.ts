import axios from '@/utils/axios'

export interface ChatMessage {
  id: string
  chatId: string
  senderId: string
  sender: string
  content: string
  type: 'text' | 'image' | 'file'
  timestamp: string // 改为string类型，匹配ISO格式
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
  // 获取聊天历史 - 匹配后端接口格式
  getHistory: (namespace: string, username: string, limit: number = 50) =>
    axios.get<ChatMessage[]>(`/api/v1/namespaces/${namespace}/chats/${namespace}-${username}/messages`, {
      params: { limit }
    }),
  
  // 发送消息 - 匹配后端接口格式
  sendMessage: (namespace: string, username: string, content: string, messageType: string = 'text') =>
    axios.post<ChatMessage>(`/api/v1/namespaces/${namespace}/chats/${namespace}-${username}/messages`, {
      content,
      type: messageType,
      timestamp: new Date().toISOString()
    }),
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
