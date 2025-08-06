import { get, post, put, del } from '@/utils/request'
import { API_ENDPOINTS } from '@/config/api'

export interface Namespace {
  apiVersion: string
  kind: string
  metadata: {
    name: string
    creationTimestamp?: string
  }
  spec: Record<string, any>
  status?: {
    phase: string
    agentCount?: number
    dagCount?: number
  }
}

export interface NamespaceList {
  items: Namespace[]
}

export interface CreateNamespaceRequest {
  apiVersion: string
  kind: string
  metadata: {
    name: string
  }
  spec: Record<string, any>
}

export const namespaceApi = {
  // 获取所有命名空间
  getList: () => get<NamespaceList>(API_ENDPOINTS.NAMESPACES.LIST),

  // 获取单个命名空间详情
  get: (name: string) => get<Namespace>(API_ENDPOINTS.NAMESPACES.GET(name)),

  // 创建命名空间
  create: (data: CreateNamespaceRequest) => post<Namespace>(API_ENDPOINTS.NAMESPACES.CREATE, data),

  // 更新命名空间
  update: (name: string, data: Partial<CreateNamespaceRequest>) =>
    put<Namespace>(API_ENDPOINTS.NAMESPACES.UPDATE(name), data),

  // 删除命名空间
  delete: (name: string) => del(API_ENDPOINTS.NAMESPACES.DELETE(name))
}
