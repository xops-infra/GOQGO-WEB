import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface User {
  id: string
  username: string
  displayName?: string
  email?: string
  avatar?: string
  role?: string
  permissions?: string[]
}

export interface UserData {
  metadata: {
    name: string
    namespace: string
    annotations: {
      description: string
    }
  }
  spec: {
    tokenExpiry: string
  }
}

export interface LoginResponse {
  user: User
  token: string
  expiresAt: string
}

export const useUserStore = defineStore('user', () => {
  // 状态
  const currentUser = ref<User | null>(null)
  const currentUserData = ref<UserData | null>(null)
  const token = ref<string>('')
  const isAuthenticated = ref(false)
  const isLoading = ref(false)
  const loading = ref(false) // 兼容现有组件
  const error = ref<string | null>(null)

  // 计算属性
  const userInfo = computed(() => currentUser.value)
  const hasPermission = computed(() => (permission: string) => {
    return currentUser.value?.permissions?.includes(permission) || false
  })

  // 从localStorage恢复登录状态
  const restoreAuth = () => {
    try {
      const savedToken = localStorage.getItem('goqgo_token')
      const savedUser = localStorage.getItem('goqgo_user')
      
      if (savedToken && savedUser) {
        token.value = savedToken
        currentUser.value = JSON.parse(savedUser)
        isAuthenticated.value = true
        
        // 设置axios默认header
        setAuthHeader(savedToken)
        
        console.log('✅ 恢复登录状态:', currentUser.value?.username)
        return true
      }
    } catch (error) {
      console.error('恢复登录状态失败:', error)
      clearAuth()
    }
    return false
  }

  // 设置认证头
  const setAuthHeader = (authToken: string) => {
    // 这里可以设置axios的默认header
    // axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`
  }

  // Token登录
  const loginWithToken = async (userToken: string) => {
    isLoading.value = true
    loading.value = true
    error.value = null
    
    try {
      // 验证token格式
      if (!userToken || userToken.length < 10) {
        throw new Error('令牌格式不正确')
      }

      // 这里应该调用后台API验证token
      // 目前先模拟验证逻辑
      const response = await validateToken(userToken)
      
      // 保存认证信息
      token.value = userToken
      currentUser.value = response.user
      isAuthenticated.value = true
      
      // 持久化存储
      localStorage.setItem('goqgo_token', userToken)
      localStorage.setItem('goqgo_user', JSON.stringify(response.user))
      
      // 设置认证头
      setAuthHeader(userToken)
      
      console.log('✅ Token登录成功:', response.user.username)
      
    } catch (err: any) {
      console.error('❌ Token登录失败:', err)
      error.value = err.message || '登录失败'
      clearAuth()
      throw err
    } finally {
      isLoading.value = false
      loading.value = false
    }
  }

  // 验证Token（模拟API调用）
  const validateToken = async (userToken: string): Promise<LoginResponse> => {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 简单的token验证逻辑（实际应该调用后台API）
    if (userToken.startsWith('goqgo_') || userToken.length >= 20) {
      // 从token中解析用户信息（实际应该由后台返回）
      const mockUser: User = {
        id: 'user_' + Date.now(),
        username: 'xops', // 可以从token中解析
        displayName: 'xops',
        email: 'user@goqgo.com',
        avatar: '',
        role: 'developer',
        permissions: ['chat:read', 'chat:write', 'project:read']
      }
      
      return {
        user: mockUser,
        token: userToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24小时后过期
      }
    } else {
      throw new Error('无效的访问令牌，请检查令牌是否正确')
    }
  }

  // 获取当前用户信息（兼容现有组件）
  const fetchCurrentUser = async (username: string) => {
    loading.value = true
    error.value = null
    
    try {
      // 模拟API调用获取用户详细信息
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 模拟用户数据
      currentUserData.value = {
        metadata: {
          name: username,
          namespace: 'default',
          annotations: {
            description: 'GoQGo开发者，专注于AI智能体协助开发'
          }
        },
        spec: {
          tokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }
      }
      
      console.log('✅ 获取用户信息成功:', username)
      
    } catch (err: any) {
      console.error('❌ 获取用户信息失败:', err)
      error.value = err.message || '获取用户信息失败'
      
      // 提供fallback数据
      currentUserData.value = {
        metadata: {
          name: username,
          namespace: 'default',
          annotations: {
            description: '用户信息加载中...'
          }
        },
        spec: {
          tokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }
      }
    } finally {
      loading.value = false
    }
  }

  // 获取用户显示名称（兼容现有组件）
  const getUserDisplayName = (userId: string) => {
    if (userId === currentUser.value?.username) {
      return currentUser.value?.displayName || currentUser.value?.username || userId
    }
    return userId
  }

  // AD登录（预留）
  const loginWithAD = async (username: string, password: string) => {
    isLoading.value = true
    loading.value = true
    error.value = null
    
    try {
      // TODO: 实现AD登录逻辑
      throw new Error('AD登录功能暂未实现')
    } catch (err: any) {
      console.error('❌ AD登录失败:', err)
      error.value = err.message || 'AD登录失败'
      throw err
    } finally {
      isLoading.value = false
      loading.value = false
    }
  }

  // 登出
  const logout = () => {
    clearAuth()
    console.log('✅ 用户已登出')
  }

  // 清除认证信息
  const clearAuth = () => {
    currentUser.value = null
    currentUserData.value = null
    token.value = ''
    isAuthenticated.value = false
    error.value = null
    
    // 清除本地存储
    localStorage.removeItem('goqgo_token')
    localStorage.removeItem('goqgo_user')
    
    // 清除认证头
    // delete axios.defaults.headers.common['Authorization']
  }

  // 检查token是否过期
  const checkTokenExpiry = () => {
    // TODO: 实现token过期检查
    return true
  }

  // 刷新token
  const refreshToken = async () => {
    // TODO: 实现token刷新逻辑
  }

  return {
    // 状态
    currentUser,
    currentUserData,
    token,
    isAuthenticated,
    isLoading,
    loading, // 兼容现有组件
    error,
    
    // 计算属性
    userInfo,
    hasPermission,
    
    // 方法
    restoreAuth,
    loginWithToken,
    loginWithAD,
    fetchCurrentUser, // 兼容现有组件
    getUserDisplayName, // 兼容现有组件
    logout,
    clearAuth,
    checkTokenExpiry,
    refreshToken
  }
})
