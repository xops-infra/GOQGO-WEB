// Mock配置
export const mockConfig = {
  // 是否启用Mock模式 - 仅从环境变量读取
  enabled: import.meta.env.VITE_MOCK_ENABLED === 'true',
  
  // Mock延迟配置
  delays: {
    auth: 500,      // 认证延迟
    api: 300,       // 一般API延迟
    upload: 1000,   // 文件上传延迟
    logs: 400       // 日志获取延迟
  },
  
  // Mock数据配置
  data: {
    // 是否生成随机数据
    generateRandom: false,
    
    // 数据更新间隔（毫秒）
    updateInterval: 5000,
    
    // Agent状态变化概率
    agentStatusChangeRate: 0.1
  },
  
  // WebSocket Mock配置
  websocket: {
    enabled: import.meta.env.VITE_MOCK_ENABLED === 'true',
    reconnectDelay: 3000,
    heartbeatInterval: 30000
  },
  
  // 日志配置
  logging: {
    enabled: true,
    level: 'info' as 'debug' | 'info' | 'warn' | 'error'
  }
}

// Mock日志工具
export const mockLogger = {
  debug: (message: string, ...args: any[]) => {
    if (mockConfig.logging.enabled && mockConfig.logging.level === 'debug') {
      console.debug(`🎭 [Mock Debug] ${message}`, ...args)
    }
  },
  
  info: (message: string, ...args: any[]) => {
    if (mockConfig.logging.enabled && ['debug', 'info'].includes(mockConfig.logging.level)) {
      console.info(`🎭 [Mock Info] ${message}`, ...args)
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    if (mockConfig.logging.enabled && ['debug', 'info', 'warn'].includes(mockConfig.logging.level)) {
      console.warn(`🎭 [Mock Warn] ${message}`, ...args)
    }
  },
  
  error: (message: string, ...args: any[]) => {
    if (mockConfig.logging.enabled) {
      console.error(`🎭 [Mock Error] ${message}`, ...args)
    }
  }
}

// 环境检测 - 简化为直接读取配置
export const isMockMode = () => mockConfig.enabled

// Mock开发工具（仅在开发环境可用）
export const mockDevTools = {
  // 获取当前状态
  getState: () => ({
    enabled: mockConfig.enabled,
    config: mockConfig
  }),
  
  // 重置Mock数据
  resetData: () => {
    if (mockConfig.logging.enabled) {
      console.log('🎭 Mock数据已重置')
    }
    // 这里可以重置mock数据到初始状态
  },
  
  // 生成随机数据
  generateRandomData: () => {
    if (mockConfig.logging.enabled) {
      console.log('🎭 正在生成随机Mock数据...')
    }
    // 这里可以生成随机的mock数据
  }
}

// 在开发环境下暴露到全局
if (import.meta.env.DEV) {
  (window as any).mockDevTools = mockDevTools
  console.log(`🎭 Mock模式: ${mockConfig.enabled ? '启用' : '禁用'} (由环境变量 VITE_MOCK_ENABLED 控制)`)
  console.log('🎭 Mock开发工具已挂载到 window.mockDevTools')
}
