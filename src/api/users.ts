import { get, post, put, del } from '@/utils/request'
import { API_ENDPOINTS } from '@/config/api'

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

export interface UserRegisterRequest {
  username: string
  password: string
  email?: string
  displayName?: string
}

export interface UserListResponse {
  items: User[]
}

export const userApi = {
  // 获取所有用户
  list: () => get<UserListResponse>(API_ENDPOINTS.USERS.LIST),

  // 获取指定用户详情
  get: (username: string) => get<User>(API_ENDPOINTS.USERS.GET(username)),

  // 创建用户 - 根据swagger文档更新
  create: (userData: UserRegisterRequest) => post<User>(API_ENDPOINTS.USERS.CREATE, userData),

  // 更新用户
  update: (username: string, userData: Partial<User>) =>
    put<User>(API_ENDPOINTS.USERS.UPDATE(username), userData),

  // 删除用户
  delete: (username: string) => del(API_ENDPOINTS.USERS.DELETE(username)),

  // 用户登录 - 根据swagger文档更新
  login: (username: string, password: string) =>
    post(API_ENDPOINTS.AUTH.USER_LOGIN(username), { password }),

  // 用户登出 - 根据swagger文档更新
  logout: (username: string) => post(API_ENDPOINTS.AUTH.USER_LOGOUT(username)),

  // 获取用户权限
  getPermissions: (username: string) =>
    get<UserPermissions>(API_ENDPOINTS.USERS.GET_PERMISSIONS(username)),

  // 更新用户权限
  updatePermissions: (username: string, permissions: UserPermissions) =>
    put<UserPermissions>(API_ENDPOINTS.USERS.UPDATE_PERMISSIONS(username), permissions),

  // 获取用户文件列表
  listFiles: (username: string) => get(API_ENDPOINTS.FILES.LIST),

  // 上传用户文件
  uploadFile: (username: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return post(API_ENDPOINTS.FILES.UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 获取用户文件
  getFile: (username: string, filename: string) => 
    get(API_ENDPOINTS.FILES.GET(username, filename)),

  // 删除用户文件
  deleteFile: (filename: string) => del(API_ENDPOINTS.FILES.DELETE(filename))
}
