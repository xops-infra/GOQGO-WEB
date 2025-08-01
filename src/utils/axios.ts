import axios from 'axios'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import { authManager } from './auth'

// 请求去重Map
const pendingRequests = new Map<string, AbortController>()

// 生成请求唯一标识
const generateRequestKey = (config: AxiosRequestConfig): string => {
  const { method, url, params, data } = config
  return `${method}:${url}:${JSON.stringify(params)}:${JSON.stringify(data)}`
}

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

    // 生成请求标识
    const requestKey = generateRequestKey(config)

    // 检查是否有相同的请求正在进行
    if (pendingRequests.has(requestKey)) {
      console.log('🔄 检测到重复请求，取消前一个:', url)
      const controller = pendingRequests.get(requestKey)!
      controller.abort()
    }

    // 创建新的AbortController
    const controller = new AbortController()
    config.signal = controller.signal
    pendingRequests.set(requestKey, controller)

    // 检查是否需要跳过认证
    if (!authManager.shouldSkipAuth(url)) {
      const token = authManager.getToken()

      console.log('🔐 axios拦截器认证检查:', {
        url,
        hasToken: !!token,
        tokenLength: token?.length || 0,
        tokenPreview: token ? `${token.substring(0, 10)}...` : 'null'
      })

      if (!token) {
        console.warn('🔑 请求需要token但未找到，将跳转到登录页:', url)
        // 清理请求记录
        pendingRequests.delete(requestKey)
        // 直接拒绝请求，避免发送无效请求
        authManager.redirectToLogin('缺少认证token')
        return Promise.reject(new Error('缺少认证token'))
      } else if (!authManager.validateTokenFormat(token)) {
        console.warn('🔑 Token格式无效，将跳转到登录页:', url)
        // 清理请求记录
        pendingRequests.delete(requestKey)
        // 直接拒绝请求，避免发送无效请求
        authManager.redirectToLogin('Token格式无效')
        return Promise.reject(new Error('Token格式无效'))
      } else {
        // 添加Authorization header
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
        console.log('✅ 已添加Authorization header到请求:', url)
      }
    } else {
      console.log('⏭️ 跳过认证检查:', url)
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
    // 清理请求记录
    const requestKey = generateRequestKey(response.config)
    pendingRequests.delete(requestKey)

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

    // 清理请求记录
    if (config) {
      const requestKey = generateRequestKey(config)
      pendingRequests.delete(requestKey)
    }

    // 如果是取消的请求，不打印错误日志
    if (axios.isCancel(error)) {
      console.log('🚫 请求已取消:', url)
      return Promise.reject(error)
    }

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
