import axios from 'axios'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import { authManager } from './auth'

// 创建axios实例
const instance = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 统一添加token
instance.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const url = config.url || ''
    
    // 检查是否需要跳过认证
    if (!authManager.shouldSkipAuth(url)) {
      const token = authManager.getToken()
      
      if (!token) {
        console.warn('🔑 请求需要token但未找到，将跳转到登录页:', url)
        // 延迟跳转，避免阻塞当前请求
        setTimeout(() => authManager.redirectToLogin('缺少认证token'), 100)
      } else if (!authManager.validateTokenFormat(token)) {
        console.warn('🔑 Token格式无效，将跳转到登录页:', url)
        setTimeout(() => authManager.redirectToLogin('Token格式无效'), 100)
      } else {
        // 添加Authorization header
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    
    console.log('🔗 API请求:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      hasAuth: !!config.headers?.Authorization,
      skipAuth: authManager.shouldSkipAuth(url)
    })
    
    return config
  },
  (error) => {
    console.error('❌ 请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器 - 统一处理认证错误
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('✅ API响应成功:', {
      url: response.config.url,
      status: response.status,
      hasData: !!response.data
    })
    return response.data
  },
  (error) => {
    const { config, response } = error
    const url = config?.url || ''
    
    console.error('❌ API响应错误:', {
      url,
      status: response?.status,
      data: response?.data
    })
    
    if (response) {
      const { status, data } = response
      
      switch (status) {
        case 401:
          // 未授权 - 统一处理认证错误
          console.error('🔒 未授权访问')
          
          // 如果不是登录相关的API，处理认证错误
          if (!authManager.shouldSkipAuth(url)) {
            authManager.handleAuthError(error)
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
      console.error('🌐 网络连接失败 - 请检查服务器是否运行')
    } else {
      console.error('⚙️ 请求配置错误:', error.message)
    }
    
    return Promise.reject(error)
  }
)

export default instance
