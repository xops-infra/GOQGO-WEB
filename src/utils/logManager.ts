import { logsApi, type LogsResponse } from '@/api/logs'

export interface LogEntry {
  id: string
  timestamp: string
  level: string
  message: string
  source: string
}

export interface LogManagerCallbacks {
  onLogsUpdate?: (logs: LogEntry[], response: LogsResponse, rawContent?: string) => void
  onError?: (error: string) => void
  onRefresh?: () => void
}

export class LogManager {
  private namespace: string
  private agentName: string
  private callbacks: LogManagerCallbacks = {}
  private refreshTimer: number | null = null
  private isAutoRefreshEnabled: boolean = false
  private refreshInterval: number = 3000 // 3秒刷新间隔
  private lastTimestamp: string = ''
  private currentLines: number = 100

  constructor(namespace: string, agentName: string, callbacks: LogManagerCallbacks = {}) {
    // 立即输出调试信息，确保构造函数被调用
    console.log('🏗️ LogManager 构造函数被调用:', {
      namespace,
      agentName,
      timestamp: new Date().toISOString()
    })
    
    this.namespace = namespace
    this.agentName = agentName
    this.callbacks = callbacks
    
    console.log('✅ LogManager 初始化完成')
  }

  // 获取日志
  async fetchLogs(lines: number = this.currentLines): Promise<LogsResponse | null> {
    console.log('📡 开始获取日志:', {
      namespace: this.namespace,
      agentName: this.agentName,
      lines: lines,
      timestamp: new Date().toISOString()
    })
    
    try {
      this.currentLines = lines
      
      console.log('📡 调用 logsApi.getLogs...')
      const response = await logsApi.getLogs(this.namespace, this.agentName, lines)
      
      console.log('📡 API响应原始数据:', {
        response,
        type: typeof response,
        keys: response ? Object.keys(response) : 'null'
      })
      
      if (!response) {
        throw new Error('API响应为空')
      }
      
      // 直接使用API返回的数据，不做任何修改
      const data = response.data || response
      
      console.log('📋 处理后的数据:', {
        data,
        hasContent: !!data.content,
        contentLength: data.content?.length || 0,
        contentPreview: data.content ? data.content.substring(0, 100) + '...' : 'empty'
      })

      // 获取原始内容
      const rawContent = data.content || ''
      
      // 为了兼容性，仍然创建简单的日志条目（但主要使用原始内容）
      const logs = this.parseLogContent(rawContent, data.timestamp || new Date().toISOString())
      
      console.log('📋 解析后的日志条目:', {
        logsCount: logs.length,
        rawContentLength: rawContent.length
      })
      
      // 传递原始内容给回调，让xterm直接处理
      this.callbacks.onLogsUpdate?.(logs, data, rawContent)

      return data
    } catch (error: any) {
      console.error('❌ 获取日志失败:', {
        error,
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data
      })
      this.callbacks.onError?.('获取日志失败: ' + (error?.message || '未知错误'))
      return null
    }
  }

  // 解析日志内容为结构化条目
  private parseLogContent(content: string, timestamp: string): LogEntry[] {
    if (!content || typeof content !== 'string') {
      return []
    }

    // 直接按行分割，不做复杂处理
    const lines = content.split('\n')
    return lines.map((line, index) => ({
      id: `${timestamp}-${index}`,
      timestamp: new Date().toISOString(),
      level: 'info',
      message: line, // 保持原始内容，包括ANSI转义序列
      source: 'api'
    }))
  }

  // 启动自动刷新
  startAutoRefresh(interval: number = this.refreshInterval): void {
    this.stopAutoRefresh()
    this.isAutoRefreshEnabled = true
    this.refreshInterval = interval

    console.log(`🔄 启动日志自动刷新，间隔: ${interval}ms`)
    
    // 立即获取一次日志
    this.fetchLogs()

    // 设置定时刷新
    this.refreshTimer = window.setInterval(() => {
      if (this.isAutoRefreshEnabled) {
        this.fetchLogs()
        this.callbacks.onRefresh?.()
      }
    }, interval)
  }

  // 停止自动刷新
  stopAutoRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
      this.refreshTimer = null
    }
    this.isAutoRefreshEnabled = false
    console.log('⏹️ 停止日志自动刷新')
  }

  // 手动刷新
  async refresh(lines?: number): Promise<void> {
    console.log('🔄 手动刷新日志')
    await this.fetchLogs(lines)
  }

  // 清空日志（前端清空显示）
  clearLogs(): void {
    this.callbacks.onLogsUpdate?.([], {
      agent: this.agentName,
      namespace: this.namespace,
      content: '',
      lines: 0,
      total: 0,
      source: 'log_file',
      timestamp: new Date().toISOString()
    })
  }

  // 设置刷新间隔
  setRefreshInterval(interval: number): void {
    this.refreshInterval = interval
    if (this.isAutoRefreshEnabled) {
      this.startAutoRefresh(interval)
    }
  }

  // 获取状态
  get isRefreshing(): boolean {
    return this.isAutoRefreshEnabled
  }

  get currentRefreshInterval(): number {
    return this.refreshInterval
  }

  // 销毁管理器
  destroy(): void {
    this.stopAutoRefresh()
    this.callbacks = {}
    console.log('🗑️ LogManager 已销毁')
  }

  // 更新回调
  updateCallbacks(callbacks: LogManagerCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }
}
