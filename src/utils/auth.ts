import { useUserStore } from '@/stores/user'
import router from '@/router'
import { createDiscreteApi } from 'naive-ui'

// 创建独立的消息API实例
const { message } = createDiscreteApi(['message'])

/**
 * 全局认证管理工具
 */
export class AuthManager {
  private static instance: AuthManager
  private isRedirecting = false // 防止重复跳转

  private constructor() {}

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager()
    }
    return AuthManager.instance
  }

  /**
   * 检查用户是否已登录
   */
  isAuthenticated(): boolean {
    const token = this.getToken() // 使用统一的getToken方法
    const user = localStorage.getItem('goqgo_user')
    return !!(token && user)
  }

  /**
   * 获取当前token
   */
  getToken(): string | null {
    // 优先使用goqgo_token，然后是auth_token作为备选
    return localStorage.getItem('goqgo_token') || 
           localStorage.getItem('auth_token') || 
           null
  }

  /**
   * 清除认证信息
   */
  clearAuth(): void {
    // 清除所有可能的token key
    localStorage.removeItem('auth_token')
    localStorage.removeItem('goqgo_token')
    localStorage.removeItem('goqgo_user')
    // 注意：不再调用userStore.clearAuth()以避免循环调用
    // userStore的状态应该通过其他方式同步
  }

  /**
   * 用户主动登出
   */
  logout(): void {
    console.log('🚪 用户主动登出')
    
    // 显示登出提示
    message.success('已成功登出')
    
    // 清除认证信息
    this.clearAuth()
    
    // 清除用户store状态
    try {
      const userStore = useUserStore()
      userStore.clearAuth()
    } catch (error) {
      console.warn('清除用户store状态失败:', error)
    }
    
    // 重置跳转状态
    this.isRedirecting = false
    
    console.log('✅ 登出完成')
  }

  /**
   * 强制跳转到登录页
   */
  redirectToLogin(reason?: string): void {
    // 防止重复跳转
    if (this.isRedirecting) {
      console.log('🔒 已在跳转中，忽略重复请求')
      return
    }

    this.isRedirecting = true
    const errorMessage = reason || '认证失败'
    console.log('🔒 认证失败，跳转到登录页:', errorMessage)

    // 显示用户友好的错误提示
    message.error(`${errorMessage}，请重新登录`)

    // 清除认证信息
    this.clearAuth()

    // 如果当前不在登录页，则跳转
    if (router.currentRoute.value.path !== '/login') {
      // 保存当前路径，登录后可以回到原页面
      const currentPath = router.currentRoute.value.fullPath
      const redirectPath = currentPath !== '/' ? `?redirect=${encodeURIComponent(currentPath)}` : ''
      
      router.push(`/login${redirectPath}`).catch((err) => {
        console.error('跳转到登录页失败:', err)
        // 如果路由跳转失败，使用原生跳转
        window.location.href = `/login${redirectPath}`
      }).finally(() => {
        // 重置跳转状态
        setTimeout(() => {
          this.isRedirecting = false
        }, 1000)
      })
    } else {
      // 如果已经在登录页，重置跳转状态
      this.isRedirecting = false
    }
  }

  /**
   * 处理认证错误
   */
  handleAuthError(error: any): void {
    const { response } = error

    if (response?.status === 401) {
      const data = response.data
      let reason = '认证失败'

      // 根据不同的错误类型提供具体的错误信息
      if (
        data?.error === 'authorization header required' ||
        data?.message === 'authorization header required'
      ) {
        reason = '缺少认证信息'
      } else if (data?.error === 'invalid token' || data?.message === 'invalid token') {
        reason = '认证信息无效'
      } else if (data?.error === 'token expired' || data?.message === 'token expired') {
        reason = '登录已过期'
      } else if (data?.error === 'unauthorized' || data?.message === 'unauthorized') {
        reason = '未授权访问'
      } else if (data?.message) {
        reason = data.message
      } else if (data?.error) {
        reason = data.error
      }

      // 延迟执行跳转，确保当前请求处理完成
      setTimeout(() => {
        this.redirectToLogin(reason)
      }, 100)
    }
  }

  /**
   * 验证token格式
   */
  validateTokenFormat(token: string): boolean {
    if (!token || typeof token !== 'string') {
      return false
    }

    // 基本长度检查
    if (token.length < 10) {
      return false
    }

    // 可以添加更多的token格式验证逻辑
    return true
  }

  /**
   * 检查是否需要跳过认证的路径
   */
  shouldSkipAuth(path: string): boolean {
    const skipAuthPaths = [
      '/users/login',        // 主要登录接口
      '/users/register',     // 注册接口
      '/health',            // 健康检查
      '/version',           // 版本信息
      '/',                  // API基础信息
      '/api/v1/users/login', // 兼容旧路径
      '/api/v1/users/register',
      '/api/v1/health',
      '/api/v1/version'
    ]

    return skipAuthPaths.some((skipPath) => {
      // 精确匹配或包含匹配
      return path === skipPath || path.includes(skipPath)
    })
  }
}

// 导出单例实例
export const authManager = AuthManager.getInstance()

// 导出便捷方法
export const isAuthenticated = () => authManager.isAuthenticated()
export const getToken = () => authManager.getToken()
export const logout = () => authManager.logout()
export const clearAuth = () => {
  // 只清除本地存储
  localStorage.removeItem('goqgo_token')
  localStorage.removeItem('goqgo_user')
}
export const redirectToLogin = (reason?: string) => authManager.redirectToLogin(reason)
export const handleAuthError = (error: any) => authManager.handleAuthError(error)
