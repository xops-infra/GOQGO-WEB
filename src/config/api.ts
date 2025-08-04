// API配置文件 - 统一管理所有API地址
export interface ApiConfig {
  baseURL: string
  wsBaseURL: string
  timeout: number
}

// 根据环境变量或构建模式确定API地址
const getApiConfig = (): ApiConfig => {
  // 开发环境
  if (import.meta.env.DEV) {
    return {
      baseURL: 'http://localhost:8080',
      wsBaseURL: 'ws://localhost:8080',
      timeout: 10000
    }
  }
  
  // 生产环境 - 使用相对路径或环境变量
  const baseURL = import.meta.env.VITE_API_BASE_URL || window.location.origin
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const wsBaseURL = import.meta.env.VITE_WS_BASE_URL || `${wsProtocol}//${window.location.host}`
  
  return {
    baseURL,
    wsBaseURL,
    timeout: 10000
  }
}

// 导出配置实例
export const apiConfig = getApiConfig()

// 导出常用的API端点
export const API_ENDPOINTS = {
  // 认证相关
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    LOGOUT: '/api/v1/auth/logout',
    VERIFY: '/api/v1/auth/verify',
    USER_LOGIN: (username: string) => `/api/v1/users/${username}/login`,
    USER_LOGOUT: (username: string) => `/api/v1/users/${username}/logout`
  },
  
  // 命名空间相关
  NAMESPACES: {
    LIST: '/api/v1/namespaces',
    CREATE: '/api/v1/namespaces',
    DELETE: (namespace: string) => `/api/v1/namespaces/${namespace}`
  },
  
  // Agent相关
  AGENTS: {
    LIST: (namespace: string) => `/api/v1/namespaces/${namespace}/agents`,
    CREATE: (namespace: string) => `/api/v1/namespaces/${namespace}/agents`,
    DELETE: (namespace: string, name: string) => `/api/v1/namespaces/${namespace}/agents/${name}`,
    SEND: (namespace: string, name: string) => `/api/v1/namespaces/${namespace}/agents/${name}/send`,
    LOGS: (namespace: string, name: string) => `/api/v1/namespaces/${namespace}/agents/${name}/logs`
  },
  
  // 文件相关
  FILES: {
    UPLOAD: '/api/v1/files/upload',
    GET: (fileId: string) => `/api/v1/files/${fileId}`,
    DELETE: (fileId: string) => `/api/v1/files/${fileId}`
  },
  
  // 用户相关
  USERS: {
    LIST: '/api/v1/users',
    CREATE: '/api/v1/users',
    UPDATE: (userId: string) => `/api/v1/users/${userId}`,
    DELETE: (userId: string) => `/api/v1/users/${userId}`
  },
  
  // WebSocket端点
  WEBSOCKET: {
    CHAT: (namespace: string, token: string) => `/ws/namespaces/${namespace}/chat?token=${token}`,
    LOGS: (namespace: string, agentName: string, token: string) => `/ws/namespaces/${namespace}/agents/${agentName}/logs?token=${token}`
  }
} as const

// 构建完整的API URL
export const buildApiUrl = (endpoint: string): string => {
  return `${apiConfig.baseURL}${endpoint}`
}

// 构建完整的WebSocket URL
export const buildWsUrl = (endpoint: string): string => {
  return `${apiConfig.wsBaseURL}${endpoint}`
}

// 环境信息
export const ENV_INFO = {
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  mode: import.meta.env.MODE,
  baseUrl: import.meta.env.BASE_URL
} as const

console.log('🔧 API配置初始化:', {
  baseURL: apiConfig.baseURL,
  wsBaseURL: apiConfig.wsBaseURL,
  timeout: apiConfig.timeout,
  env: ENV_INFO
})
