// 401错误测试工具
import { authManager } from './auth'
import { get } from './request'

export class AuthTest {
  // 测试401错误处理
  static async test401Handling() {
    console.group('🧪 测试401错误处理')
    
    try {
      // 清除token
      localStorage.removeItem('auth_token')
      localStorage.removeItem('goqgo_token')
      localStorage.removeItem('goqgo_user')
      
      console.log('1. 已清除所有认证信息')
      
      // 尝试访问需要认证的API
      console.log('2. 尝试访问需要认证的API...')
      
      const response = await get('/api/v1/roles')
      console.log('❌ 意外成功:', response)
      
    } catch (error: any) {
      console.log('3. 捕获到错误:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        url: error.config?.url
      })
      
      if (error.response?.status === 401) {
        console.log('✅ 401错误正确触发')
        
        // 检查是否调用了认证错误处理
        console.log('4. 检查认证错误处理...')
        
        // 手动触发认证错误处理
        authManager.handleAuthError(error)
        
        console.log('5. 已手动触发认证错误处理')
      } else {
        console.log('❌ 未收到预期的401错误')
      }
    }
    
    console.groupEnd()
  }
  
  // 测试跳转逻辑
  static testRedirectLogic() {
    console.group('🧪 测试跳转逻辑')
    
    console.log('当前路由:', window.location.pathname)
    console.log('当前认证状态:', {
      hasToken: !!localStorage.getItem('auth_token'),
      hasGoqgoToken: !!localStorage.getItem('goqgo_token'),
      hasUser: !!localStorage.getItem('goqgo_user')
    })
    
    // 手动触发跳转
    console.log('手动触发跳转到登录页...')
    authManager.redirectToLogin('测试跳转')
    
    console.groupEnd()
  }
  
  // 检查认证管理器状态
  static checkAuthManagerState() {
    console.group('🧪 检查认证管理器状态')
    
    console.log('认证管理器实例:', authManager)
    console.log('当前token:', authManager.getToken())
    console.log('token格式验证:', authManager.validateTokenFormat(authManager.getToken() || ''))
    
    // 测试shouldSkipAuth
    const testUrls = [
      '/api/v1/roles',
      '/api/v1/users/login',
      '/health',
      '/api/v1/namespaces'
    ]
    
    testUrls.forEach(url => {
      console.log(`shouldSkipAuth('${url}'):`, authManager.shouldSkipAuth(url))
    })
    
    console.groupEnd()
  }
}

// 在开发环境下添加到window对象
if (import.meta.env.DEV) {
  ;(window as any).authTest = AuthTest
  console.log('🧪 认证测试工具已加载，使用 window.authTest 访问')
}
