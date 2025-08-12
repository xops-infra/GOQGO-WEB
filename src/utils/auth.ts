import { useUserStore } from '@/stores/user'
import router from '@/router'
import { logoutManager } from './logoutManager'

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
    const token = localStorage.getItem('goqgo_token')
    const user = localStorage.getItem('goqgo_user')
    return !!(token && user)
  }

  /**
   * 获取当前token
   */
  getToken(): string | null {
    return localStorage.getItem('goqgo_token')
  }

  /**
   * 清除认证信息
   */
  clearAuth(): void {
    localStorage.removeItem('goqgo_token')
    localStorage.removeItem('goqgo_user')
    // 注意：不再调用userStore.clearAuth()以避免循环调用
    // userStore的状态应该通过其他方式同步
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
    // 特殊处理用户登录端点：/api/v1/users/{username}/login
    if (path.match(/\/api\/v1\/users\/[^\/]+\/login$/)) {
      return true
    }

    // 其他不需要认证的端点
    const skipAuthPaths = [
      '/api/v1/auth/login',
      '/api/v1/auth/register',
      '/api/v1/health',
      '/api/v1/version'
    ]

    return skipAuthPaths.some((skipPath) => path.includes(skipPath))
  }

  /**
   * 执行退出登录
   */
  async logout(reason?: string): Promise<void> {
    console.log('🔒 认证管理器开始退出登录')
    
    try {
      // 使用统一的退出登录管理器
      await logoutManager.logout(reason)
    } catch (error) {
      console.error('❌ 认证管理器退出登录失败:', error)
      // 如果统一管理器失败，尝试基本清理
      this.clearAuth()
      throw error
    }
  }
}

// 导出单例实例
export const authManager = AuthManager.getInstance()

// 导出便捷方法
export const isAuthenticated = () => authManager.isAuthenticated()
export const getToken = () => authManager.getToken()
export const clearAuth = () => {
  // 只清除本地存储
  localStorage.removeItem('goqgo_token')
  localStorage.removeItem('goqgo_user')
}
export const redirectToLogin = (reason?: string) => authManager.redirectToLogin(reason)
export const handleAuthError = (error: any) => authManager.handleAuthError(error)
