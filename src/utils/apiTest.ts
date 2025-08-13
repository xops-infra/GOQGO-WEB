import { logsApi } from '@/api/logs'
import { buildApiUrl } from '@/config/api'

export const testLogsApi = async (namespace: string, agentName: string) => {
  console.log('🧪 开始测试日志API...')
  
  try {
    // 1. 测试基础连接
    console.log('🧪 测试1: 检查API服务器连接')
    const healthResponse = await fetch(buildApiUrl('/health'))
    console.log('🧪 健康检查响应:', {
      status: healthResponse.status,
      ok: healthResponse.ok
    })
    
    // 2. 测试日志API
    console.log('🧪 测试2: 调用日志API')
    const logsResponse = await logsApi.getLogs(namespace, agentName, 100)
    console.log('🧪 日志API响应:', {
      response: logsResponse,
      type: typeof logsResponse,
      hasContent: !!(logsResponse as any)?.content,
      contentLength: (logsResponse as any)?.content?.length || 0
    })
    
    return {
      success: true,
      healthCheck: healthResponse.ok,
      logsResponse
    }
  } catch (error) {
    console.error('🧪 API测试失败:', error)
    return {
      success: false,
      error: error
    }
  }
}

// 导出给全局使用
(window as any).testLogsApi = testLogsApi
