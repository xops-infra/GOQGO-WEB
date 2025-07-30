import axios from '@/utils/axios'
import type { Agent, CreateAgentRequest } from '@/types/api'

export const agentApi = {
  // 获取Agent列表
  getList: (namespace: string = 'default') => 
    axios.get<Agent[]>(`/v1/namespaces/${namespace}/agents`),
  
  // 创建Agent
  create: (namespace: string, data: CreateAgentRequest) =>
    axios.post<Agent>(`/v1/namespaces/${namespace}/agents`, data),
  
  // 删除Agent
  delete: (namespace: string, name: string) =>
    axios.delete(`/v1/namespaces/${namespace}/agents/${name}`),
  
  // 发送消息
  send: (namespace: string, name: string, message: string) =>
    axios.post(`/v1/namespaces/${namespace}/agents/${name}/send`, { message }),
  
  // 获取Agent详情
  getDetail: (namespace: string, name: string) =>
    axios.get<Agent>(`/v1/namespaces/${namespace}/agents/${name}`)
}
