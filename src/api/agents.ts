import { get, post, del } from '@/utils/request'
import { authManager } from '@/utils/auth'
import { API_ENDPOINTS, buildWsUrl } from '@/config/api'

export interface Agent {
  id?: string
  name: string
  namespace: string
  status: 'running' | 'idle' | 'error' | 'Creating' | 'Terminating'
  role: string
  age?: string
  workDir?: string
  sessionName?: string
  restartCount?: number
  env?: string[]
  context?: string
}

export interface CreateAgentRequest {
  name: string
  namespace: string
  role: string
  context?: string
  workDir?: string  // 使用后端支持的workDir字段
  env?: string[]
}

export interface LogEntry {
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  source?: string
}

export interface LogMessage {
  type: 'initial' | 'append' | 'history' | 'pong' | 'error'
  data?: LogEntry[]
  message?: string
  hasMore?: boolean
}

export const agentApi = {
  // 获取Agent列表
  getList: (namespace: string = 'default', signal?: AbortSignal) =>
    get<{ items: Agent[] }>(API_ENDPOINTS.AGENTS.LIST(namespace), { signal }),

  // 获取Agent详情
  getDetail: (namespace: string, name: string) =>
    get<Agent>(`${API_ENDPOINTS.AGENTS.LIST(namespace)}/${name}`),

  // 创建Agent
  create: (namespace: string, data: CreateAgentRequest) =>
    post<Agent>(API_ENDPOINTS.AGENTS.CREATE(namespace), data),

  // 删除Agent
  delete: (namespace: string, name: string) =>
    del(API_ENDPOINTS.AGENTS.DELETE(namespace, name)),

  // 重启Agent
  restart: (namespace: string, name: string) =>
    post(`${API_ENDPOINTS.AGENTS.LIST(namespace)}/${name}/restart`),

  // 发送消息
  send: (namespace: string, name: string, message: string) =>
    post(API_ENDPOINTS.AGENTS.SEND(namespace, name), { message }),

  // 获取Agent日志 - 支持实时流式传输
  getLogs: (
    namespace: string,
    name: string,
    options?: {
      lines?: number
      follow?: boolean
      since?: string
    }
  ) => {
    const params = new URLSearchParams()
    if (options?.lines) params.append('lines', options.lines.toString())
    if (options?.follow) params.append('follow', 'true')
    if (options?.since) params.append('since', options.since)

    return get<LogEntry[]>(`${API_ENDPOINTS.AGENTS.LOGS(namespace, name)}?${params}`)
  },

  // 创建日志流连接 - 用于实时日志（需要token认证）
  createLogStream: (
    namespace: string,
    name: string,
    options?: {
      lines?: number
      follow?: boolean
    }
  ) => {
    const params = new URLSearchParams()
    if (options?.lines) params.append('lines', options.lines.toString())
    if (options?.follow !== false) params.append('follow', 'true')

    // 添加token认证到WebSocket连接
    const token = authManager.getToken()
    if (token) {
      params.append('token', token)
    }

    const wsEndpoint = API_ENDPOINTS.WEBSOCKET.LOGS(namespace, name, token || '')
    const url = buildWsUrl(`${wsEndpoint.split('?')[0]}?${params}`)
    return new WebSocket(url)
  },

  // 广播消息
  broadcast: (namespace: string, message: string) =>
    post(`${API_ENDPOINTS.AGENTS.LIST(namespace)}/broadcast`, { message })
}
