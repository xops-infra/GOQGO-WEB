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
      baseURL: '/api/v1',  // 根据服务器响应，API基础路径是/api/v1
      wsBaseURL: `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`,
      timeout: 10000
    }
  }
  
  // 生产环境 - 使用相对路径或环境变量
  const baseURL = import.meta.env.VITE_API_BASE_URL || `${window.location.origin}/api/v1`
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

// 导出常用的API端点 - 根据最新swagger文档更新（不包含/api/v1前缀，因为baseURL已包含）
export const API_ENDPOINTS = {
  // 系统相关
  SYSTEM: {
    HEALTH: '/health',
    INFO: '/',  // API基础信息
    ME: '/me'  // 获取当前用户信息
  },
  
  // 认证相关 - 根据swagger更新
  AUTH: {
    LOGIN: '/users/login',  // 主要登录接口
    USER_LOGIN: (username: string) => `/users/${username}/login`,  // 兼容性登录接口
    USER_LOGOUT: (username: string) => `/users/${username}/logout`
  },
  
  // 命名空间相关 - 根据swagger更新，使用ns路径
  NAMESPACES: {
    LIST: '/ns',
    CREATE: '/ns',
    GET: (namespace: string) => `/ns/${namespace}`,
    UPDATE: (namespace: string) => `/ns/${namespace}`,
    DELETE: (namespace: string) => `/ns/${namespace}`
  },
  
  // Agent相关 - 根据swagger更新
  AGENTS: {
    // 全局agent接口
    GLOBAL_LIST: '/agents',
    GLOBAL_GET: (name: string) => `/agents/${name}`,
    GLOBAL_STATUS: (name: string) => `/agents/${name}/status`,
    
    // 命名空间级别的agent接口，使用ns路径
    LIST: (namespace: string) => `/ns/${namespace}/agents`,
    CREATE: (namespace: string) => `/ns/${namespace}/agents`,
    GET: (namespace: string, name: string) => `/ns/${namespace}/agents/${name}`,
    STATUS: (namespace: string, name: string) => `/ns/${namespace}/agents/${name}/status`,
    DELETE: (namespace: string, name: string) => `/ns/${namespace}/agents/${name}`,
    SEND: (namespace: string, name: string) => `/ns/${namespace}/agents/${name}/send`,
    RESTART: (namespace: string, name: string) => `/ns/${namespace}/agents/${name}/restart`,
    BROADCAST: (namespace: string) => `/ns/${namespace}/agents/broadcast`,
    
    // 日志相关接口
    LOGS: (namespace: string, name: string) => `/ns/${namespace}/agents/${name}/logs`,
    LOGS_FOLLOW: (namespace: string, name: string) => `/ns/${namespace}/agents/${name}/logs/follow`,
    LOGS_HISTORY: (namespace: string, name: string) => `/ns/${namespace}/agents/${name}/logs/history`,
    LOGS_REFRESH: (namespace: string, name: string) => `/ns/${namespace}/agents/${name}/logs/refresh`,
    LOGS_STATUS: (namespace: string, name: string) => `/ns/${namespace}/agents/${name}/logs/status`
  },
  
  // 角色相关 - 保持完整路径，因为这个接口有特殊前缀
  ROLES: {
    LIST: '/roles',  // 移除/api/v1前缀
    DETAIL: (roleName: string) => `/roles/${roleName}`
  },
  
  // 聊天相关 - 根据swagger更新
  CHATS: {
    // 全局聊天接口
    GLOBAL_LIST: '/chats',
    
    // 命名空间级别的聊天接口，使用ns路径
    LIST: (namespace: string) => `/ns/${namespace}/chats`,
    CREATE: (namespace: string) => `/ns/${namespace}/chats`,
    GET: (namespace: string, chatName: string) => `/ns/${namespace}/chats/${chatName}`,
    UPDATE: (namespace: string, chatName: string) => `/ns/${namespace}/chats/${chatName}`,
    DELETE: (namespace: string, chatName: string) => `/ns/${namespace}/chats/${chatName}`,
    
    // 消息相关接口 - 这些接口在swagger中有完整路径
    SEND_MESSAGE: (namespace: string, chatName: string) => `/ns/${namespace}/chats/${chatName}/messages`,
    GET_HISTORY: (namespace: string, chatName: string) => `/ns/${namespace}/chats/${chatName}/history`,
    SEARCH_MESSAGES: (namespace: string, chatName: string) => `/ns/${namespace}/chats/${chatName}/messages/search`,
    EDIT_MESSAGE: (namespace: string, chatName: string, messageId: string) => `/ns/${namespace}/chats/${chatName}/messages/${messageId}`,
    DELETE_MESSAGE: (namespace: string, chatName: string, messageId: string) => `/ns/${namespace}/chats/${chatName}/messages/${messageId}`
  },
  
  // 文件相关 - 根据swagger更新
  FILES: {
    LIST: '/files',
    UPLOAD: '/files',
    GET: (username: string, filename: string) => `/files/${username}/${filename}`,
    DELETE: (filename: string) => `/files/${filename}`
  },
  
  // 用户相关 - 根据swagger更新
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    GET: (username: string) => `/users/${username}`,
    UPDATE: (username: string) => `/users/${username}`,
    DELETE: (username: string) => `/users/${username}`,
    GET_PERMISSIONS: (username: string) => `/users/${username}/permissions`,
    UPDATE_PERMISSIONS: (username: string) => `/users/${username}/permissions`
  },
  
  // 节点相关 - 新增
  NODES: {
    LIST: '/nodes',
    GET: (name: string) => `/nodes/${name}`
  },
  
  // 工作流相关 - 根据swagger更新，使用ns路径
  DAGS: {
    LIST: (namespace: string) => `/ns/${namespace}/dags`,
    CREATE: (namespace: string) => `/ns/${namespace}/dags`,
    GET: (namespace: string, dagName: string) => `/ns/${namespace}/dags/${dagName}`,
    UPDATE: (namespace: string, dagName: string) => `/ns/${namespace}/dags/${dagName}`,
    DELETE: (namespace: string, dagName: string) => `/ns/${namespace}/dags/${dagName}`
  },
  
  // 执行记录相关 - 根据swagger更新，使用ns路径
  RECORDS: {
    LIST: (namespace: string) => `/ns/${namespace}/records`,
    CREATE: (namespace: string) => `/ns/${namespace}/records`,
    GET: (namespace: string, recordName: string) => `/ns/${namespace}/records/${recordName}`,
    UPDATE: (namespace: string, recordName: string) => `/ns/${namespace}/records/${recordName}`,
    DELETE: (namespace: string, recordName: string) => `/ns/${namespace}/records/${recordName}`
  },
  
  // WebSocket端点 - 根据swagger更新，使用ns路径
  WEBSOCKET: {
    CHAT_ROOM: (namespace: string) => `/ws/ns/${namespace}/chat`,
    CHAT: (namespace: string, chatName: string) => `/ws/ns/${namespace}/chats/${chatName}`,
    AGENT_LOGS: (namespace: string, agentName: string) => `/ws/ns/${namespace}/agents/${agentName}/logs`
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
