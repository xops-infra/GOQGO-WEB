import axios from 'axios'

const instance = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 自动添加Authorization header
    const token = localStorage.getItem('goqgo_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    console.log('🔗 API请求:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      hasAuth: !!token,
      headers: config.headers
    })
    
    return config
  },
  (error) => {
    console.error('❌ 请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    console.log('✅ API响应成功:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    })
    return response.data
  },
  (error) => {
    console.error('❌ API响应错误:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    })
    
    if (error.response) {
      const { status, data } = error.response
      switch (status) {
        case 401:
          console.error('🔒 未授权，请重新登录')
          // 可以在这里触发登出逻辑
          if (data?.error === 'authorization header required') {
            console.error('🔑 需要Authorization header')
          }
          break
        case 403:
          console.error('🚫 权限不足')
          break
        case 404:
          console.error('🔍 请求的资源不存在')
          break
        case 500:
          console.error('💥 服务器内部错误')
          break
        default:
          console.error('⚠️ 请求失败:', data?.message || data?.error || '未知错误')
      }
    } else if (error.request) {
      console.error('🌐 网络连接失败')
    } else {
      console.error('⚙️ 请求配置错误:', error.message)
    }
    
    return Promise.reject(error)
  }
)

export default instance
