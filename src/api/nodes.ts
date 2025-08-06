import { get } from '@/utils/request'
import { API_ENDPOINTS } from '@/config/api'

export interface Node {
  name: string
  status: 'Ready' | 'NotReady' | 'Unknown'
  roles: string[]
  age: string
  version: string
  internalIP?: string
  externalIP?: string
  osImage?: string
  kernelVersion?: string
  containerRuntime?: string
}

export interface NodeList {
  items: Node[]
}

export const nodeApi = {
  // 获取所有节点列表
  getList: () => get<NodeList>(API_ENDPOINTS.NODES.LIST),

  // 获取单个节点详情
  get: (name: string) => get<Node>(API_ENDPOINTS.NODES.GET(name))
}

export default nodeApi
