// API配置文件 - 统一管理所有API地址
export interface ApiConfig {
  baseURL: string
  wsBaseURL: string
  timeout: number
}

// 根据环境变量或构建模式确定API地址
const getApiConfig = (): ApiConfig => {
  // 开发环境 - 使用相对路径，让vite代理接管
  if (import.meta.env.DEV) {
    return {
      baseURL: '',  // 使用相对路径，vite代理会处理
      wsBaseURL: `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`,
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
  // 系统相关
  SYSTEM: {
    HEALTH: '/health',
    INFO: '/'
  },
  
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
    GET: (namespace: string) => `/api/v1/namespace/${namespace}`,
    UPDATE: (namespace: string) => `/api/v1/namespace/${namespace}`,
    DELETE: (namespace: string) => `/api/v1/namespace/${namespace}`
  },
  
  // Agent相关
  AGENTS: {
    LIST: (namespace: string) => `/api/v1/namespaces/${namespace}/agents`,
    CREATE: (namespace: string) => `/api/v1/namespaces/${namespace}/agents`,
    GET: (namespace: string, name: string) => `/api/v1/namespaces/${namespace}/agents/${name}`,
    UPDATE: (namespace: string, name: string) => `/api/v1/namespaces/${namespace}/agents/${name}`,
    DELETE: (namespace: string, name: string) => `/api/v1/namespaces/${namespace}/agents/${name}`,
    SEND: (namespace: string, name: string) => `/api/v1/namespaces/${namespace}/agents/${name}/send`,
    LOGS: (namespace: string, name: string) => `/api/v1/namespaces/${namespace}/agents/${name}/logs`,
    RESTART: (namespace: string, name: string) => `/api/v1/namespaces/${namespace}/agents/${name}/restart`,
    BROADCAST: (namespace: string) => `/api/v1/namespaces/${namespace}/agents/broadcast`,
    RAW_COMMAND: (namespace: string, name: string) => `/api/v1/namespaces/${namespace}/agents/${name}/raw-command`
  },
  
  // 角色相关
  ROLES: {
    LIST: '/api/v1/roles',
    DETAIL: (roleName: string) => `/api/v1/roles/${roleName}`
  },
  
  // 聊天相关
  CHATS: {
    LIST: (namespace: string) => `/api/v1/namespaces/${namespace}/chats`,
    CREATE: (namespace: string) => `/api/v1/namespaces/${namespace}/chats`,
    GET: (namespace: string, chatName: string) => `/api/v1/namespaces/${namespace}/chats/${chatName}`,
    UPDATE: (namespace: string, chatName: string) => `/api/v1/namespaces/${namespace}/chats/${chatName}`,
    DELETE: (namespace: string, chatName: string) => `/api/v1/namespaces/${namespace}/chats/${chatName}`,
    SEND_MESSAGE: (namespace: string, chatName: string) => `/api/v1/namespaces/${namespace}/chats/${chatName}/messages`,
    GET_HISTORY: (namespace: string, chatName: string) => `/api/v1/namespaces/${namespace}/chats/${chatName}/history`,
    SEARCH_MESSAGES: (namespace: string, chatName: string) => `/api/v1/namespaces/${namespace}/chats/${chatName}/messages/search`,
    EDIT_MESSAGE: (namespace: string, chatName: string, messageId: string) => `/api/v1/namespaces/${namespace}/chats/${chatName}/messages/${messageId}`,
    DELETE_MESSAGE: (namespace: string, chatName: string, messageId: string) => `/api/v1/namespaces/${namespace}/chats/${chatName}/messages/${messageId}`,
    ADD_MEMBER: (namespace: string, chatName: string) => `/api/v1/namespaces/${namespace}/chats/${chatName}/members`,
    REMOVE_MEMBER: (namespace: string, chatName: string, username: string) => `/api/v1/namespaces/${namespace}/chats/${chatName}/members/${username}`,
    UPDATE_MEMBER: (namespace: string, chatName: string, username: string) => `/api/v1/namespaces/${namespace}/chats/${chatName}/members/${username}`
  },
  
  // 文件相关
  FILES: {
    LIST: '/api/v1/files',
    UPLOAD: '/api/v1/files',
    GET: (username: string, filename: string) => `/api/v1/files/${username}/${filename}`,
    DELETE: (filename: string) => `/api/v1/files/${filename}`
  },
  
  // 用户相关
  USERS: {
    LIST: '/api/v1/users',
    CREATE: '/api/v1/users',
    GET: (username: string) => `/api/v1/users/${username}`,
    UPDATE: (username: string) => `/api/v1/users/${username}`,
    DELETE: (username: string) => `/api/v1/users/${username}`,
    GET_PERMISSIONS: (username: string) => `/api/v1/users/${username}/permissions`,
    UPDATE_PERMISSIONS: (username: string) => `/api/v1/users/${username}/permissions`
  },
  
  // 工作流相关
  DAGS: {
    LIST: (namespace: string) => `/api/v1/namespaces/${namespace}/dags`,
    CREATE: (namespace: string) => `/api/v1/namespaces/${namespace}/dags`,
    GET: (namespace: string, dagName: string) => `/api/v1/namespaces/${namespace}/dags/${dagName}`,
    UPDATE: (namespace: string, dagName: string) => `/api/v1/namespaces/${namespace}/dags/${dagName}`,
    DELETE: (namespace: string, dagName: string) => `/api/v1/namespaces/${namespace}/dags/${dagName}`
  },
  
  // 执行记录相关
  RECORDS: {
    LIST: (namespace: string) => `/api/v1/namespaces/${namespace}/records`,
    CREATE: (namespace: string) => `/api/v1/namespaces/${namespace}/records`,
    GET: (namespace: string, recordName: string) => `/api/v1/namespaces/${namespace}/records/${recordName}`,
    UPDATE: (namespace: string, recordName: string) => `/api/v1/namespaces/${namespace}/records/${recordName}`,
    DELETE: (namespace: string, recordName: string) => `/api/v1/namespaces/${namespace}/records/${recordName}`
  },
  
  // WebSocket端点
  WEBSOCKET: {
    CHAT_ROOM: (namespace: string) => `/ws/namespaces/${namespace}/chat`,
    CHAT: (namespace: string, chatName: string) => `/ws/namespaces/${namespace}/chats/${chatName}`,
    AGENT_LOGS: (namespace: string, agentName: string) => `/ws/namespaces/${namespace}/agents/${agentName}/logs`
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
