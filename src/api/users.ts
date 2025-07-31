import axios from '@/utils/axios'

export interface UserMetadata {
  name: string
  creationTimestamp: string
  labels: {
    department?: string
    role?: string
    team?: string
  }
  annotations: {
    contact?: string
    description?: string
  }
}

export interface UserPermissions {
  namespaces: string[]
  agents: {
    create: boolean
    delete: boolean
    restart: boolean
    send: boolean
    logs: boolean
  }
  dags: {
    create: boolean
    run: boolean
    delete: boolean
  }
}

export interface UserPreferences {
  defaultNamespace: string
  outputFormat: string
  timezone: string
}

export interface UserQuotas {
  maxAgents: number
  maxNamespaces: number
  maxDags: number
}

export interface UserSpec {
  displayName: string
  email: string
  password: string
  token: string
  tokenExpiry: string
  roles: string[]
  permissions: UserPermissions
  preferences: UserPreferences
  quotas: UserQuotas
}

export interface UserStatus {
  phase: 'Active' | 'Inactive' | 'Suspended'
  lastLoginTime: string
  agentCount: number
  namespaceCount: number
  dagCount: number
}

export interface User {
  apiVersion: string
  kind: string
  metadata: UserMetadata
  spec: UserSpec
  status: UserStatus
}

export interface UserListResponse {
  items: User[]
}

export const userApi = {
  // 获取所有用户
  list: () => 
    axios.get<UserListResponse>('/api/v1/users'),
  
  // 获取指定用户详情
  get: (username: string) =>
    axios.get<User>(`/api/v1/users/${username}`),
  
  // 创建用户
  create: (userData: Partial<User>) =>
    axios.post<User>('/api/v1/users', userData),
  
  // 更新用户
  update: (username: string, userData: Partial<User>) =>
    axios.put<User>(`/api/v1/users/${username}`, userData),
  
  // 删除用户
  delete: (username: string) =>
    axios.delete(`/api/v1/users/${username}`),
  
  // 用户登录
  login: (username: string, password: string) =>
    axios.post(`/api/v1/users/${username}/login`, { password }),
  
  // 用户登出
  logout: (username: string) =>
    axios.post(`/api/v1/users/${username}/logout`),
  
  // 获取用户权限
  getPermissions: (username: string) =>
    axios.get<UserPermissions>(`/api/v1/users/${username}/permissions`),
  
  // 更新用户权限
  updatePermissions: (username: string, permissions: UserPermissions) =>
    axios.put<UserPermissions>(`/api/v1/users/${username}/permissions`, permissions),
  
  // 获取用户文件列表
  listFiles: (username: string) =>
    axios.get(`/api/v1/users/${username}/files`),
  
  // 上传用户文件
  uploadFile: (username: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return axios.post(`/api/v1/users/${username}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  
  // 获取用户文件
  getFile: (username: string, filename: string) =>
    axios.get(`/api/v1/users/${username}/files/${filename}`),
  
  // 删除用户文件
  deleteFile: (username: string, filename: string) =>
    axios.delete(`/api/v1/users/${username}/files/${filename}`)
}
