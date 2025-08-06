import { get, post, del } from '@/utils/request'
import { authManager } from '@/utils/auth'
import { API_ENDPOINTS, buildWsUrl } from '@/config/api'
import { mockAgentService } from '@/mock/services'
import { isMockMode, mockLogger } from '@/mock/config'

export interface Agent {
  id?: string
  name: string
  user?: string // 添加用户字段，对应goqgo agent list中的USER列
  username?: string // 兼容字段，与user字段含义相同
  namespace: string
  status: 'running' | 'idle' | 'error' | 'Creating' | 'Terminating' | 'Stopped'
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
  // 获取全局Agent列表（不限制命名空间）
  getGlobalList: (params?: {
    labelSelector?: string
    fieldSelector?: string
    watch?: boolean
  }, signal?: AbortSignal) => {
    const searchParams = new URLSearchParams()
    if (params?.labelSelector) searchParams.append('labelSelector', params.labelSelector)
    if (params?.fieldSelector) searchParams.append('fieldSelector', params.fieldSelector)
    if (params?.watch) searchParams.append('watch', 'true')
    
    const url = `${API_ENDPOINTS.AGENTS.GLOBAL_LIST}${searchParams.toString() ? '?' + searchParams.toString() : ''}`
    return get<{ items: Agent[] }>(url, { signal })
  },

  // 获取指定命名空间的Agent列表
  getList: (namespace: string = 'default', signal?: AbortSignal) =>
    get<{ items: Agent[] }>(API_ENDPOINTS.AGENTS.LIST(namespace), { signal }),

  // 获取全局Agent详情
  getGlobalDetail: (name: string) =>
    get<Agent>(API_ENDPOINTS.AGENTS.GLOBAL_GET(name)),

  // 获取Agent详情
  getDetail: (namespace: string, name: string) =>
    get<Agent>(API_ENDPOINTS.AGENTS.GET(namespace, name)),

  // 获取全局Agent状态
  getGlobalStatus: (name: string) =>
    get<{ status: string }>(API_ENDPOINTS.AGENTS.GLOBAL_STATUS(name)),

  // 获取Agent状态
  getStatus: (namespace: string, name: string) =>
    get<{ status: string }>(API_ENDPOINTS.AGENTS.STATUS(namespace, name)),

  // 创建Agent
  create: (namespace: string, data: CreateAgentRequest) =>
    post<Agent>(API_ENDPOINTS.AGENTS.CREATE(namespace), data),

  // 删除Agent
  delete: (namespace: string, name: string) =>
    del(API_ENDPOINTS.AGENTS.DELETE(namespace, name)),

  // 重启Agent
  restart: (namespace: string, name: string) =>
    post(API_ENDPOINTS.AGENTS.RESTART(namespace, name)),

  // 发送消息
  send: (namespace: string, name: string, message: string) =>
    post(API_ENDPOINTS.AGENTS.SEND(namespace, name), { message }),

  // 获取Agent日志
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

  // 获取Agent日志历史
  getLogsHistory: (
    namespace: string,
    name: string,
    options?: {
      lines?: number
      since?: string
    }
  ) => {
    const params = new URLSearchParams()
    if (options?.lines) params.append('lines', options.lines.toString())
    if (options?.since) params.append('since', options.since)

    return get<LogEntry[]>(`${API_ENDPOINTS.AGENTS.LOGS_HISTORY(namespace, name)}?${params}`)
  },

  // 刷新Agent日志
  refreshLogs: (namespace: string, name: string) =>
    post(API_ENDPOINTS.AGENTS.LOGS_REFRESH(namespace, name)),

  // 获取Agent日志状态
  getLogsStatus: (namespace: string, name: string) =>
    get<{ status: string }>(API_ENDPOINTS.AGENTS.LOGS_STATUS(namespace, name)),

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

    const wsEndpoint = API_ENDPOINTS.WEBSOCKET.AGENT_LOGS(namespace, name)
    const url = buildWsUrl(`${wsEndpoint}?${params}`)
    return new WebSocket(url)
  },

  // 广播消息
  broadcast: (namespace: string, message: string) =>
    post(API_ENDPOINTS.AGENTS.BROADCAST(namespace), { message })
}
