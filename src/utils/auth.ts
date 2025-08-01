import { useUserStore } from '@/stores/user'
import router from '@/router'

/**
 * 全局认证管理工具
 */
export class AuthManager {
  private static instance: AuthManager
  
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
    
    // 清除store中的认证状态
    const userStore = useUserStore()
    userStore.clearAuth()
  }
  
  /**
   * 强制跳转到登录页
   */
  redirectToLogin(reason?: string): void {
    console.log('🔒 认证失败，跳转到登录页:', reason || '未知原因')
    
    // 清除认证信息
    this.clearAuth()
    
    // 如果当前不在登录页，则跳转
    if (router.currentRoute.value.path !== '/login') {
      router.push('/login').catch(err => {
        console.error('跳转到登录页失败:', err)
        // 如果路由跳转失败，使用原生跳转
        window.location.href = '/login'
      })
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
      
      if (data?.error === 'authorization header required' || 
          data?.message === 'authorization header required') {
        reason = '缺少认证头'
      } else if (data?.error === 'invalid token' || 
                 data?.message === 'invalid token') {
        reason = 'Token无效'
      } else if (data?.error === 'token expired' || 
                 data?.message === 'token expired') {
        reason = 'Token已过期'
      } else if (data?.message) {
        reason = data.message
      }
      
      this.redirectToLogin(reason)
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
      '/api/v1/users/login',
      '/api/v1/users/register',
      '/api/v1/health',
      '/api/v1/version'
    ]
    
    return skipAuthPaths.some(skipPath => path.includes(skipPath))
  }
}

// 导出单例实例
export const authManager = AuthManager.getInstance()

// 导出便捷方法
export const isAuthenticated = () => authManager.isAuthenticated()
export const getToken = () => authManager.getToken()
export const clearAuth = () => authManager.clearAuth()
export const redirectToLogin = (reason?: string) => authManager.redirectToLogin(reason)
export const handleAuthError = (error: any) => authManager.handleAuthError(error)
