// Token Header测试工具
import { useUserStore } from '@/stores/user'
import { authManager } from '@/utils/auth'
import { get } from '@/utils/axios'

export class TokenHeaderTest {
  // 检查token存储状态
  static checkTokenStorage() {
    console.group('🔍 检查Token存储状态')
    
    try {
      const userStore = useUserStore()
      
      console.log('Store中的token:')
      console.log('- userStore.token:', userStore.token ? `${userStore.token.substring(0, 20)}...` : 'null')
      
      console.log('localStorage中的token:')
      console.log('- goqgo_token:', localStorage.getItem('goqgo_token') ? `${localStorage.getItem('goqgo_token')!.substring(0, 20)}...` : 'null')
      console.log('- auth_token:', localStorage.getItem('auth_token') ? `${localStorage.getItem('auth_token')!.substring(0, 20)}...` : 'null')
      
      console.log('authManager获取的token:')
      const authToken = authManager.getToken()
      console.log('- authManager.getToken():', authToken ? `${authToken.substring(0, 20)}...` : 'null')
      
      console.log('认证状态:')
      console.log('- userStore.isAuthenticated:', userStore.isAuthenticated)
      console.log('- authManager.isAuthenticated():', authManager.isAuthenticated())
      
    } catch (error) {
      console.error('❌ 检查token存储失败:', error)
    }
    
    console.groupEnd()
  }
  
  // 测试API请求是否包含Authorization header
  static async testApiRequestHeaders() {
    console.group('🧪 测试API请求Header')
    
    try {
      // 拦截fetch请求来检查headers
      const originalFetch = window.fetch
      let lastRequestHeaders: Headers | null = null
      
      window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
        console.log('🔗 拦截到fetch请求:', input)
        if (init?.headers) {
          lastRequestHeaders = new Headers(init.headers)
          console.log('请求headers:', Object.fromEntries(lastRequestHeaders.entries()))
        }
        return originalFetch.call(this, input, init)
      }
      
      // 发送一个测试API请求
      try {
        console.log('发送测试API请求...')
        await get('/ns')  // 获取namespace列表
        
        if (lastRequestHeaders) {
          const authHeader = lastRequestHeaders.get('Authorization')
          console.log('Authorization header:', authHeader ? `${authHeader.substring(0, 30)}...` : 'null')
          
          if (authHeader && authHeader.startsWith('Bearer ')) {
            console.log('✅ Authorization header格式正确')
          } else {
            console.log('❌ Authorization header格式错误或缺失')
          }
        } else {
          console.log('❌ 未检测到请求headers')
        }
        
      } catch (apiError) {
        console.log('API请求失败（这是正常的，我们只是测试header）:', apiError.message)
      }
      
      // 恢复原始fetch
      window.fetch = originalFetch
      
    } catch (error) {
      console.error('❌ 测试API请求header失败:', error)
    }
    
    console.groupEnd()
  }
  
  // 测试axios拦截器
  static async testAxiosInterceptor() {
    console.group('🧪 测试Axios拦截器')
    
    try {
      console.log('当前token状态:')
      const token = authManager.getToken()
      console.log('- token存在:', !!token)
      console.log('- token长度:', token?.length || 0)
      console.log('- token预览:', token ? `${token.substring(0, 20)}...` : 'null')
      
      // 测试不同的API端点
      const testEndpoints = [
        '/ns',
        '/ns/default/agents',
        '/ns/default/chats'
      ]
      
      for (const endpoint of testEndpoints) {
        try {
          console.log(`\n测试端点: ${endpoint}`)
          
          // 使用axios发送请求
          const response = await get(endpoint)
          console.log(`✅ 请求成功: ${endpoint}`)
          
        } catch (error: any) {
          console.log(`请求失败: ${endpoint}`)
          console.log('错误信息:', error.message)
          
          // 检查是否是认证相关错误
          if (error.response?.status === 401) {
            console.log('❌ 401错误 - 可能是token未正确添加到header')
          } else if (error.response?.status === 403) {
            console.log('⚠️ 403错误 - token存在但权限不足')
          } else {
            console.log('ℹ️ 其他错误 - 可能是网络或服务器问题')
          }
        }
      }
      
    } catch (error) {
      console.error('❌ 测试axios拦截器失败:', error)
    }
    
    console.groupEnd()
  }
  
  // 模拟登录并测试token
  static async simulateLoginAndTest() {
    console.group('🧪 模拟登录并测试Token')
    
    try {
      const userStore = useUserStore()
      
      // 模拟设置token
      const testToken = 'test-bearer-token-' + Date.now()
      console.log('设置测试token:', testToken.substring(0, 30) + '...')
      
      userStore.setToken(testToken)
      
      // 检查token是否正确保存
      setTimeout(() => {
        console.log('检查token保存结果:')
        this.checkTokenStorage()
        
        // 测试API请求
        setTimeout(() => {
          this.testAxiosInterceptor()
        }, 500)
      }, 100)
      
    } catch (error) {
      console.error('❌ 模拟登录测试失败:', error)
    }
    
    console.groupEnd()
  }
  
  // 检查axios配置
  static checkAxiosConfig() {
    console.group('🔍 检查Axios配置')
    
    try {
      // 检查axios实例配置
      import('@/utils/axios').then(({ default: axiosInstance }) => {
        console.log('Axios实例配置:')
        console.log('- baseURL:', axiosInstance.defaults.baseURL)
        console.log('- timeout:', axiosInstance.defaults.timeout)
        console.log('- headers:', axiosInstance.defaults.headers)
        
        console.log('请求拦截器数量:', axiosInstance.interceptors.request.handlers.length)
        console.log('响应拦截器数量:', axiosInstance.interceptors.response.handlers.length)
      })
      
    } catch (error) {
      console.error('❌ 检查axios配置失败:', error)
    }
    
    console.groupEnd()
  }
  
  // 完整的token header测试流程
  static async runFullTest() {
    console.group('🚀 完整Token Header测试')
    
    console.log('开始完整测试流程...')
    
    // 1. 检查当前token状态
    this.checkTokenStorage()
    
    // 2. 检查axios配置
    this.checkAxiosConfig()
    
    // 3. 测试API请求headers
    await new Promise(resolve => setTimeout(resolve, 500))
    await this.testApiRequestHeaders()
    
    // 4. 测试axios拦截器
    await new Promise(resolve => setTimeout(resolve, 500))
    await this.testAxiosInterceptor()
    
    console.log('✅ 完整测试流程结束')
    console.groupEnd()
  }
}

// 在开发环境下添加到window对象
if (import.meta.env.DEV) {
  ;(window as any).tokenHeaderTest = TokenHeaderTest
  console.log('🧪 Token Header测试工具已加载，使用 window.tokenHeaderTest 访问')
  console.log('📋 可用方法:')
  console.log('  - tokenHeaderTest.checkTokenStorage() - 检查token存储状态')
  console.log('  - tokenHeaderTest.testApiRequestHeaders() - 测试API请求header')
  console.log('  - tokenHeaderTest.testAxiosInterceptor() - 测试axios拦截器')
  console.log('  - tokenHeaderTest.simulateLoginAndTest() - 模拟登录并测试')
  console.log('  - tokenHeaderTest.checkAxiosConfig() - 检查axios配置')
  console.log('  - tokenHeaderTest.runFullTest() - 运行完整测试')
}
