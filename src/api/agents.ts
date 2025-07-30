import axios from '@/utils/axios'
import type { Agent, CreateAgentRequest } from '@/types/api'

export interface AgentList {
  items: Agent[]
}

export const agentApi = {
  // 获取Agent列表
  getList: (namespace: string = 'default') => 
    axios.get<AgentList>(`/v1/namespaces/${namespace}/agents`),
  
  // 创建Agent
  create: (namespace: string, data: CreateAgentRequest) =>
    axios.post<Agent>(`/v1/namespaces/${namespace}/agents`, {
      name: data.name,
      namespace: data.namespace,
      role: data.role,
      context: data.context,
      workDir: './',
      env: data.env || []
    }),
  
  // 删除Agent
  delete: (namespace: string, name: string) =>
    axios.delete(`/v1/namespaces/${namespace}/agents/${name}`),
  
  // 发送消息
  send: (namespace: string, name: string, message: string) =>
    axios.post(`/v1/namespaces/${namespace}/agents/${name}/send`, { message }),
  
  // 获取Agent详情
  getDetail: (namespace: string, name: string) =>
    axios.get<Agent>(`/v1/namespaces/${namespace}/agents/${name}`),
  
  // 获取Agent日志
  getLogs: (namespace: string, name: string, lines: number = 50) =>
    axios.get(`/v1/namespaces/${namespace}/agents/${name}/logs?lines=${lines}`),
  
  // 重启Agent
  restart: (namespace: string, name: string) =>
    axios.post(`/v1/namespaces/${namespace}/agents/${name}/restart`),
  
  // 广播消息
  broadcast: (namespace: string, message: string) =>
    axios.post(`/v1/namespaces/${namespace}/agents/broadcast`, { message })
}
