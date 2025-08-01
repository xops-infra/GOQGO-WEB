import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export interface User {
  apiVersion: string
  kind: string
  metadata: {
    name: string
    creationTimestamp: string
    labels: Record<string, string>
    annotations: Record<string, string>
  }
  spec: {
    displayName: string
    email: string
    roles: string[]
    permissions: {
      namespaces: Array<{
        name: string
        access: string
      }>
      agents: {
        create: boolean
        delete: boolean
        restart: boolean
        send: boolean
        logs: boolean
      }
      dags: {
        create: boolean
        run: boolean
        delete: boolean
      }
    }
    preferences: {
      defaultNamespace: string
      outputFormat: string
      timezone: string
    }
    quotas: {
      maxAgents: number
      maxNamespaces: number
      maxDags: number
    }
  }
  status: {
    phase: 'Active' | 'Inactive' | 'Suspended'
    lastLoginTime: string
    agentCount: number
    namespaceCount: number
    dagCount: number
  }
}

export interface LoginResponse {
  success: boolean
  message: string
  token: string
  user: User
}

export const useUserStore = defineStore('user', () => {
  // 状态
  const currentUser = ref<User | null>(null)
  const token = ref<string>('')
  const isAuthenticated = ref(false)
  const isLoading = ref(false)
  const loading = ref(false) // 兼容现有组件
  const error = ref<string | null>(null)

  // 计算属性
  const userInfo = computed(() => currentUser.value)
  const username = computed(() => currentUser.value?.metadata.name || '')
  const displayName = computed(() => currentUser.value?.spec.displayName || currentUser.value?.metadata.name || '')
  const hasPermission = computed(() => (permission: string) => {
    if (!currentUser.value) return false
    // 根据实际权限结构实现权限检查
    return true
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
        
        console.log('✅ 恢复登录状态:', currentUser.value?.metadata.name)
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
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`
  }

  // Token登录
  const loginWithToken = async (userToken: string, username?: string) => {
    isLoading.value = true
    loading.value = true
    error.value = null
    
    try {
      // 验证token格式
      if (!userToken || userToken.length < 10) {
        throw new Error('令牌格式不正确')
      }

      // 如果没有提供用户名，尝试从token中解析或使用默认值
      const loginUsername = username || 'xops'
      
      // 调用真实的登录API
      const response = await axios.post<LoginResponse>(
        `http://localhost:8080/api/v1/users/${loginUsername}/login`,
        { token: userToken },
        { headers: { 'Content-Type': 'application/json' } }
      )
      
      if (!response.data.success) {
        throw new Error(response.data.message || '登录失败')
      }
      
      // 保存认证信息
      token.value = response.data.token
      currentUser.value = response.data.user
      isAuthenticated.value = true
      
      // 持久化存储
      localStorage.setItem('goqgo_token', response.data.token)
      localStorage.setItem('goqgo_user', JSON.stringify(response.data.user))
      
      // 设置认证头
      setAuthHeader(response.data.token)
      
      console.log('✅ Token登录成功:', response.data.user.metadata.name)
      
    } catch (err: any) {
      console.error('❌ Token登录失败:', err)
      
      if (err.response?.data?.message) {
        error.value = err.response.data.message
      } else if (err.message) {
        error.value = err.message
      } else {
        error.value = '登录失败，请检查令牌是否正确'
      }
      
      clearAuth()
      throw new Error(error.value)
    } finally {
      isLoading.value = false
      loading.value = false
    }
  }

  // 密码登录
  const loginWithPassword = async (username: string, password: string) => {
    isLoading.value = true
    loading.value = true
    error.value = null
    
    try {
      // 调用真实的登录API
      const response = await axios.post<LoginResponse>(
        `http://localhost:8080/api/v1/users/${username}/login`,
        { password },
        { headers: { 'Content-Type': 'application/json' } }
      )
      
      if (!response.data.success) {
        throw new Error(response.data.message || '登录失败')
      }
      
      // 保存认证信息
      token.value = response.data.token
      currentUser.value = response.data.user
      isAuthenticated.value = true
      
      // 持久化存储
      localStorage.setItem('goqgo_token', response.data.token)
      localStorage.setItem('goqgo_user', JSON.stringify(response.data.user))
      
      // 设置认证头
      setAuthHeader(response.data.token)
      
      console.log('✅ 密码登录成功:', response.data.user.metadata.name)
      
    } catch (err: any) {
      console.error('❌ 密码登录失败:', err)
      
      if (err.response?.data?.message) {
        error.value = err.response.data.message
      } else if (err.message) {
        error.value = err.message
      } else {
        error.value = '登录失败，请检查用户名和密码'
      }
      
      clearAuth()
      throw new Error(error.value)
    } finally {
      isLoading.value = false
      loading.value = false
    }
  }

  // 获取当前用户信息（兼容现有组件）
  const fetchCurrentUser = async (username: string) => {
    // 如果已经有用户信息，直接返回
    if (currentUser.value && currentUser.value.metadata.name === username) {
      return
    }
    
    loading.value = true
    error.value = null
    
    try {
      // 这里可以调用获取用户详细信息的API
      // 目前直接使用已有的用户信息
      console.log('✅ 用户信息已存在:', username)
      
    } catch (err: any) {
      console.error('❌ 获取用户信息失败:', err)
      error.value = err.message || '获取用户信息失败'
    } finally {
      loading.value = false
    }
  }

  // 获取用户显示名称（兼容现有组件）
  const getUserDisplayName = (userId: string) => {
    if (userId === currentUser.value?.metadata.name) {
      return currentUser.value?.spec.displayName || currentUser.value?.metadata.name || userId
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
    token.value = ''
    isAuthenticated.value = false
    error.value = null
    
    // 清除本地存储
    localStorage.removeItem('goqgo_token')
    localStorage.removeItem('goqgo_user')
    
    // 清除认证头
    delete axios.defaults.headers.common['Authorization']
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
    token,
    isAuthenticated,
    isLoading,
    loading, // 兼容现有组件
    error,
    
    // 计算属性
    userInfo,
    username,
    displayName,
    hasPermission,
    
    // 方法
    restoreAuth,
    loginWithToken,
    loginWithPassword,
    loginWithAD,
    fetchCurrentUser, // 兼容现有组件
    getUserDisplayName, // 兼容现有组件
    logout,
    clearAuth,
    checkTokenExpiry,
    refreshToken
  }
})
