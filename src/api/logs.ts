import axios from '@/utils/axios'

export interface LogsResponse {
  content: string
  offset: number
  lines: number
  total: number
  hasMore: boolean
  source: 'log_file' | 'tmux_capture'
  timestamp: number
}

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
  // 获取历史日志 - GET /ns/{ns}/agents/{name}/logs
  getHistory: (namespace: string, agentName: string, params?: { lines?: number; offset?: number }) => {
    const queryParams = new URLSearchParams()
    if (params?.lines) queryParams.append('lines', params.lines.toString())
    if (params?.offset) queryParams.append('offset', params.offset.toString())
    
    const url = `/api/v1/ns/${namespace}/agents/${agentName}/logs${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    return axios.get<LogsResponse>(url)
  },

  // 控制实时跟踪 - POST /ns/{ns}/agents/{name}/logs
  controlRealtime: (namespace: string, agentName: string, data: LogControlRequest) =>
    axios.post<LogControlResponse>(`/api/v1/ns/${namespace}/agents/${agentName}/logs`, data)
}
