// API 测试工具函数
import { logsApi } from '@/api/logs'
import axios from '@/utils/axios'

export const testLogsApi = async (namespace: string, agentName: string) => {
  console.log('🧪 开始测试日志API...')
  
  try {
    // 1. 测试基础连接
    console.log('1️⃣ 测试基础连接...')
    const healthResponse = await axios.get('/health')
    console.log('✅ 健康检查通过:', healthResponse.data)
    
    // 2. 测试认证
    console.log('2️⃣ 测试认证状态...')
    const token = localStorage.getItem('goqgo_token')
    console.log('🔑 当前token:', token ? '已设置' : '未设置')
    
    // 3. 测试日志API
    console.log('3️⃣ 测试日志API...')
    const url = `/api/v1/namespaces/${namespace}/agents/${agentName}/logs?lines=10`
    console.log('📡 请求URL:', url)
    
    // 直接使用axios测试
    const directResponse = await axios.get(url)
    console.log('✅ 直接axios请求成功:', directResponse)
    
    // 使用logsApi测试
    const apiResponse = await logsApi.getLogs(namespace, agentName, 10)
    console.log('✅ logsApi请求成功:', apiResponse)
    
    return {
      success: true,
      health: healthResponse.data,
      direct: directResponse.data,
      api: apiResponse.data
    }
  } catch (error: any) {
    console.error('❌ API测试失败:', error)
    console.error('❌ 错误详情:', {
      message: error?.message,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      headers: error?.response?.headers
    })
    
    return {
      success: false,
      error: error
    }
  }
}

// 在浏览器控制台中可以调用的全局测试函数
if (typeof window !== 'undefined') {
  (window as any).testLogsApi = testLogsApi
}
