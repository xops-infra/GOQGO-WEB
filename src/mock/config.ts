// Mock配置
export const mockConfig = {
  // 是否启用Mock模式 - 强制启用用于测试
  enabled: true, // import.meta.env.VITE_MOCK_ENABLED === 'true' || import.meta.env.DEV,
  
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
    enabled: true,
    reconnectDelay: 3000,
    heartbeatInterval: 30000
  },
  
  // 日志配置
  logging: {
    enabled: true,
    level: 'info' as 'debug' | 'info' | 'warn' | 'error'
  }
}

// Mock状态管理
class MockState {
  private _enabled = mockConfig.enabled
  private _listeners: Array<(enabled: boolean) => void> = []

  get enabled() {
    return this._enabled
  }

  set enabled(value: boolean) {
    if (this._enabled !== value) {
      this._enabled = value
      this._listeners.forEach(listener => listener(value))
      
      // 保存到localStorage
      localStorage.setItem('mock-enabled', String(value))
      
      if (mockConfig.logging.enabled) {
        console.log(`🎭 Mock模式${value ? '已启用' : '已禁用'}`)
      }
    }
  }

  toggle() {
    this.enabled = !this.enabled
  }

  onStateChange(listener: (enabled: boolean) => void) {
    this._listeners.push(listener)
    
    // 返回取消监听的函数
    return () => {
      const index = this._listeners.indexOf(listener)
      if (index > -1) {
        this._listeners.splice(index, 1)
      }
    }
  }

  // 从localStorage恢复状态
  restore() {
    const saved = localStorage.getItem('mock-enabled')
    if (saved !== null) {
      this.enabled = saved === 'true'
    }
  }
}

export const mockState = new MockState()

// 初始化时恢复状态
mockState.restore()

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

// 环境检测
export const isMockMode = () => mockState.enabled

// Mock开发工具
export const mockDevTools = {
  // 切换Mock模式
  toggle: () => mockState.toggle(),
  
  // 获取当前状态
  getState: () => ({
    enabled: mockState.enabled,
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
  console.log('🎭 Mock开发工具已挂载到 window.mockDevTools')
}
