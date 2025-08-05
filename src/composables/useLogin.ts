import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { authApi } from '@/api/auth'
import type { User } from '@/types/api'

export function useLogin() {
  const userStore = useUserStore()
  
  // 响应式状态
  const loading = ref(false)
  const error = ref('')

  // 登录方法
  const handleLogin = async (credentials: { 
    username: string
    password: string 
  }): Promise<User> => {
    if (loading.value) {
      throw new Error('登录正在进行中')
    }

    // 验证输入
    if (!credentials.username.trim()) {
      error.value = '请输入用户名'
      throw new Error('用户名不能为空')
    }

    if (!credentials.password.trim()) {
      error.value = '请输入密码'
      throw new Error('密码不能为空')
    }

    loading.value = true
    error.value = ''

    try {
      // 调用登录API
      const loginResponse = await authApi.login({
        username: credentials.username.trim(),
        password: credentials.password
      })

      // 保存用户信息到store
      await userStore.setUser(loginResponse.user)
      
      // 保存token
      if (loginResponse.token) {
        userStore.setToken(loginResponse.token)
        localStorage.setItem('auth_token', loginResponse.token)
      }

      return loginResponse.user
    } catch (loginError: any) {
      // 处理不同类型的登录错误
      if (loginError.response?.status === 401) {
        error.value = '用户名或密码错误'
      } else if (loginError.response?.status === 403) {
        error.value = '账户已被禁用，请联系管理员'
      } else if (loginError.response?.status === 429) {
        error.value = '登录尝试过于频繁，请稍后再试'
      } else if (loginError.code === 'NETWORK_ERROR') {
        error.value = '网络连接失败，请检查网络设置'
      } else {
        error.value = loginError.message || '登录失败，请稍后重试'
      }
      
      throw loginError
    } finally {
      loading.value = false
    }
  }

  // 清除错误
  const clearError = () => {
    error.value = ''
  }

  // 自动登录（使用保存的token）
  const autoLogin = async (): Promise<boolean> => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      return false
    }

    try {
      loading.value = true
      
      // 验证token并获取用户信息
      const user = await authApi.verifyToken(token)
      await userStore.setUser(user)
      
      return true
    } catch (error) {
      // Token无效，清除本地存储
      localStorage.removeItem('auth_token')
      return false
    } finally {
      loading.value = false
    }
  }

  // 登出
  const logout = async () => {
    try {
      loading.value = true
      
      // 调用登出API
      await authApi.logout()
      
      // 清除本地状态
      userStore.clearUser()
      localStorage.removeItem('auth_token')
      
    } catch (error) {
      console.error('登出失败:', error)
      // 即使API调用失败，也要清除本地状态
      userStore.clearUser()
      localStorage.removeItem('auth_token')
    } finally {
      loading.value = false
    }
  }

  return {
    // 状态
    loading,
    error,
    
    // 方法
    handleLogin,
    clearError,
    autoLogin,
    logout
  }
}

export default useLogin
