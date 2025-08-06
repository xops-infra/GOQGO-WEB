/**
 * 登录功能测试工具
 */
import { authApi } from '@/api/auth'

export const testLoginApis = async () => {
  console.log('🧪 开始测试登录API...')
  
  const results: { [key: string]: any } = {}
  
  // 测试密码登录接口
  try {
    console.log('🔐 测试密码登录...')
    const passwordResult = await authApi.loginWithPassword('demo', 'demo123')
    results.passwordLogin = { success: true, data: passwordResult }
    console.log('✅ 密码登录测试成功:', passwordResult)
  } catch (error: any) {
    results.passwordLogin = { success: false, error: error.message }
    console.log('❌ 密码登录测试失败:', error.message)
  }
  
  // 测试Token登录接口
  try {
    console.log('🔑 测试Token登录...')
    const tokenResult = await authApi.loginWithToken('demo-token-123')
    results.tokenLogin = { success: true, data: tokenResult }
    console.log('✅ Token登录测试成功:', tokenResult)
  } catch (error: any) {
    results.tokenLogin = { success: false, error: error.message }
    console.log('❌ Token登录测试失败:', error.message)
  }
  
  // 测试统一登录接口
  try {
    console.log('🌐 测试统一登录接口...')
    const unifiedResult = await authApi.login({ username: 'demo', password: 'demo123' })
    results.unifiedLogin = { success: true, data: unifiedResult }
    console.log('✅ 统一登录测试成功:', unifiedResult)
  } catch (error: any) {
    results.unifiedLogin = { success: false, error: error.message }
    console.log('❌ 统一登录测试失败:', error.message)
  }
  
  console.log('📊 登录API测试结果汇总:', results)
  return results
}

// 在开发环境下自动运行测试
if (import.meta.env.DEV) {
  setTimeout(() => {
    console.log('🔧 开发环境检测到，准备运行登录API测试...')
    ;(window as any).testLoginApis = testLoginApis
    console.log('💡 提示: 在控制台运行 window.testLoginApis() 来测试登录API')
  }, 5000)
}

export default testLoginApis
