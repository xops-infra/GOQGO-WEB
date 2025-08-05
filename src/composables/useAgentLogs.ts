import { ref, computed, nextTick } from 'vue'
import { useMessage } from 'naive-ui'
import { agentApi } from '@/api/agents'
import type { Agent, LogEntry } from '@/types/api'

export function useAgentLogs() {
  const message = useMessage()
  
  // 响应式状态
  const logs = ref<LogEntry[]>([])
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const isRealTimeEnabled = ref(true)
  const isAutoScrollEnabled = ref(true)
  const isLoadingHistory = ref(false)
  const lastUpdateTime = ref<Date | null>(null)
  
  // WebSocket连接
  let websocket: WebSocket | null = null
  let reconnectTimer: NodeJS.Timeout | null = null
  let currentAgent: Agent | null = null
  
  // 计算属性
  const connectionStatus = computed(() => {
    if (isConnecting.value) return 'connecting'
    if (isConnected.value) return 'connected'
    return 'disconnected'
  })
  
  const filteredLogsCount = computed(() => logs.value.length)
  
  // WebSocket连接管理
  const connectWebSocket = (agent: Agent) => {
    if (websocket) {
      websocket.close()
    }
    
    isConnecting.value = true
    
    try {
      // 构建WebSocket URL
      const wsUrl = `ws://localhost:8080/api/v1/agents/${agent.namespace}/${agent.name}/logs/stream`
      websocket = new WebSocket(wsUrl)
      
      websocket.onopen = () => {
        console.log('📡 日志WebSocket连接已建立')
        isConnected.value = true
        isConnecting.value = false
        
        // 清除重连定时器
        if (reconnectTimer) {
          clearTimeout(reconnectTimer)
          reconnectTimer = null
        }
      }
      
      websocket.onmessage = (event) => {
        if (!isRealTimeEnabled.value) return
        
        try {
          const logData = JSON.parse(event.data)
          const logEntry: LogEntry = {
            id: Date.now() + Math.random(),
            timestamp: new Date(logData.timestamp || Date.now()),
            level: logData.level || 'info',
            message: logData.message || event.data,
            source: logData.source || 'agent'
          }
          
          logs.value.push(logEntry)
          lastUpdateTime.value = new Date()
          
          // 自动滚动到底部
          if (isAutoScrollEnabled.value) {
            nextTick(() => {
              scrollToBottom()
            })
          }
          
          // 限制日志数量，避免内存溢出
          if (logs.value.length > 10000) {
            logs.value = logs.value.slice(-5000)
          }
        } catch (error) {
          console.error('解析日志数据失败:', error)
        }
      }
      
      websocket.onclose = (event) => {
        console.log('📡 日志WebSocket连接已关闭', event.code, event.reason)
        isConnected.value = false
        isConnecting.value = false
        
        // 如果不是主动关闭，尝试重连
        if (event.code !== 1000 && currentAgent) {
          scheduleReconnect()
        }
      }
      
      websocket.onerror = (error) => {
        console.error('📡 日志WebSocket连接错误:', error)
        isConnected.value = false
        isConnecting.value = false
        
        if (currentAgent) {
          scheduleReconnect()
        }
      }
    } catch (error) {
      console.error('创建WebSocket连接失败:', error)
      isConnecting.value = false
      message.error('连接日志服务失败')
    }
  }
  
  // 重连调度
  const scheduleReconnect = () => {
    if (reconnectTimer) return
    
    reconnectTimer = setTimeout(() => {
      if (currentAgent) {
        console.log('🔄 尝试重连日志WebSocket...')
        connectWebSocket(currentAgent)
      }
    }, 3000)
  }
  
  // 滚动到底部
  const scrollToBottom = () => {
    const container = document.querySelector('.logs-content-container')
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  }
  
  // 方法
  const startLogsConnection = (agent: Agent) => {
    currentAgent = agent
    
    // 首先加载历史日志
    loadHistoryLogs(agent)
    
    // 然后建立WebSocket连接
    connectWebSocket(agent)
  }
  
  const stopLogsConnection = () => {
    currentAgent = null
    
    if (websocket) {
      websocket.close(1000, 'User closed')
      websocket = null
    }
    
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    
    isConnected.value = false
    isConnecting.value = false
  }
  
  const loadHistoryLogs = async (agent: Agent, lines = 1000) => {
    if (isLoadingHistory.value) return
    
    isLoadingHistory.value = true
    
    try {
      const historyLogs = await agentApi.getLogs(agent.namespace, agent.name, lines)
      
      // 转换为LogEntry格式
      const logEntries: LogEntry[] = historyLogs.map((logLine, index) => ({
        id: `history-${index}`,
        timestamp: extractTimestamp(logLine) || new Date(),
        level: extractLogLevel(logLine),
        message: logLine,
        source: 'history'
      }))
      
      logs.value = logEntries
      lastUpdateTime.value = new Date()
      
      // 滚动到底部
      nextTick(() => {
        if (isAutoScrollEnabled.value) {
          scrollToBottom()
        }
      })
    } catch (error) {
      console.error('加载历史日志失败:', error)
      message.error('加载历史日志失败')
    } finally {
      isLoadingHistory.value = false
    }
  }
  
  const loadMoreLogs = async () => {
    if (!currentAgent || isLoadingHistory.value) return
    
    const currentCount = logs.value.filter(log => log.source === 'history').length
    await loadHistoryLogs(currentAgent, currentCount + 1000)
  }
  
  const toggleRealTime = () => {
    isRealTimeEnabled.value = !isRealTimeEnabled.value
    
    if (isRealTimeEnabled.value) {
      message.success('实时日志已开启')
    } else {
      message.info('实时日志已暂停')
    }
  }
  
  const toggleAutoScroll = () => {
    isAutoScrollEnabled.value = !isAutoScrollEnabled.value
    
    if (isAutoScrollEnabled.value) {
      message.success('自动滚动已开启')
      nextTick(() => scrollToBottom())
    } else {
      message.info('自动滚动已关闭')
    }
  }
  
  const refreshLogs = async () => {
    if (!currentAgent) return
    
    logs.value = []
    await loadHistoryLogs(currentAgent)
    message.success('日志已刷新')
  }
  
  const clearLogs = () => {
    logs.value = []
    message.success('日志已清空')
  }
  
  const downloadLogs = () => {
    if (logs.value.length === 0) {
      message.warning('没有日志可下载')
      return
    }
    
    const logContent = logs.value
      .map(log => `[${log.timestamp.toISOString()}] [${log.level.toUpperCase()}] ${log.message}`)
      .join('\n')
    
    const blob = new Blob([logContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentAgent?.name || 'agent'}-logs-${new Date().toISOString().slice(0, 19)}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    
    URL.revokeObjectURL(url)
    message.success('日志下载已开始')
  }
  
  // 工具函数
  const extractTimestamp = (logLine: string): Date | null => {
    // 尝试从日志行中提取时间戳
    const timestampRegex = /\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}/
    const match = logLine.match(timestampRegex)
    return match ? new Date(match[0]) : null
  }
  
  const extractLogLevel = (logLine: string): string => {
    // 尝试从日志行中提取日志级别
    const levelRegex = /\[(DEBUG|INFO|WARN|ERROR|FATAL)\]/i
    const match = logLine.match(levelRegex)
    return match ? match[1].toLowerCase() : 'info'
  }
  
  return {
    // 状态
    logs,
    isConnected,
    isConnecting,
    isRealTimeEnabled,
    isAutoScrollEnabled,
    isLoadingHistory,
    connectionStatus,
    lastUpdateTime,
    filteredLogsCount,
    
    // 方法
    startLogsConnection,
    stopLogsConnection,
    loadMoreLogs,
    toggleRealTime,
    toggleAutoScroll,
    refreshLogs,
    clearLogs,
    downloadLogs,
    scrollToBottom
  }
}

export default useAgentLogs
