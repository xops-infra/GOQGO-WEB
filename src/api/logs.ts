import axios from '@/utils/axios'

// 新的日志响应接口，匹配后端返回格式
export interface LogsResponse {
  agent: string
  namespace: string
  content: string
  lines: number
  total: number
  source: 'log_file' | 'tmux_capture'
  timestamp: string
}

// 保留旧接口用于兼容性（已废弃）
export interface LogControlRequest {
  action: 'follow'
  enabled: boolean
}

export interface LogControlResponse {
  message: string
  websocketActive: boolean
  timestamp: number
}

export const logsApi = {
  // 获取日志 - GET /namespaces/{ns}/agents/{name}/logs
  // 支持 lines 参数，类似 tail -n xx 功能
  getLogs: (namespace: string, agentName: string, lines: number = 100) => {
    const queryParams = new URLSearchParams()
    queryParams.append('lines', Math.min(lines, 1000).toString()) // 最大1000行限制
    
    const url = `/api/v1/namespaces/${namespace}/agents/${agentName}/logs?${queryParams.toString()}`
    
    console.log('📡 发起日志API请求:', {
      namespace,
      agentName,
      lines,
      url,
      fullUrl: `${window.location.origin}${url}`
    })
    
    return axios.get<LogsResponse>(url)
  },

  // 兼容性方法 - 重定向到新的 getLogs 方法
  getHistory: (namespace: string, agentName: string, params?: { lines?: number; offset?: number }) => {
    const lines = params?.lines || 100
    return logsApi.getLogs(namespace, agentName, lines)
  },

  // 已废弃 - WebSocket 控制方法（保留用于兼容性）
  controlRealtime: (namespace: string, agentName: string, data: LogControlRequest) => {
    console.warn('⚠️ controlRealtime 方法已废弃，WebSocket 日志功能已移除')
    return Promise.resolve({
      data: {
        message: 'WebSocket logs feature has been removed',
        websocketActive: false,
        timestamp: Date.now()
      }
    })
  }
}
