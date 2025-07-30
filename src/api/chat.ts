import axios from '@/utils/axios'
import type { ChatMessage, ChatSession } from '@/types/api'

export const chatApi = {
  // 获取聊天历史
  getHistory: (namespace: string, limit: number = 50) =>
    axios.get<ChatMessage[]>(`/api/v1/namespaces/${namespace}/chat/history?limit=${limit}`),
  
  // 发送消息
  sendMessage: (namespace: string, message: string) =>
    axios.post<ChatMessage>(`/api/v1/namespaces/${namespace}/chat/send`, { message }),
  
  // 获取在线用户
  getOnlineUsers: (namespace: string) =>
    axios.get<string[]>(`/api/v1/namespaces/${namespace}/chat/users`)
}
