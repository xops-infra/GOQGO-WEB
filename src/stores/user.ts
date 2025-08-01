import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { authManager } from '@/utils/auth'

export interface User {
  displayName: string
  email: string
  // 可以根据实际API响应添加更多字段
}

export interface LoginResponse {
  success: boolean
  message: string
  bearer_token: string
  displayName: string
  email: string
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
  const username = computed(() => currentUser.value?.displayName || '')
  const displayName = computed(() => currentUser.value?.displayName || '')
  const hasPermission = computed(() => (permission: string) => {
    // 根据实际权限结构实现权限检查
    return true
  })

  // 从localStorage恢复登录状态
  const restoreAuth = () => {
    try {
      const savedToken = localStorage.getItem('goqgo_token')
      const savedUser = localStorage.getItem('goqgo_user')

      if (savedToken && savedUser && authManager.validateTokenFormat(savedToken)) {
        token.value = savedToken
        currentUser.value = JSON.parse(savedUser)
        isAuthenticated.value = true

        console.log('✅ 恢复登录状态:', currentUser.value?.displayName)
        return true
      } else {
        // Token格式无效，清除认证信息
        if (savedToken && !authManager.validateTokenFormat(savedToken)) {
          console.warn('🔑 Token格式无效，清除认证信息')
          clearAuth()
        }
      }
    } catch (error) {
      console.error('恢复登录状态失败:', error)
      clearAuth()
    }
    return false
  }

  // Token登录
  const loginWithToken = async (userToken: string) => {
    isLoading.value = true
    loading.value = true
    error.value = null

    try {
      // 验证token格式
      if (!authManager.validateTokenFormat(userToken)) {
        throw new Error('令牌格式不正确')
      }

      // 调用真实的登录API
      const response = await axios.post<LoginResponse>(
        'http://localhost:8080/api/v1/users/login',
        { token: userToken },
        { headers: { 'Content-Type': 'application/json' } }
      )

      if (!response.data.success) {
        throw new Error(response.data.message || '登录失败')
      }

      // 保存认证信息
      const user: User = {
        displayName: response.data.displayName,
        email: response.data.email
      }

      token.value = response.data.bearer_token
      currentUser.value = user
      isAuthenticated.value = true

      // 持久化存储
      localStorage.setItem('goqgo_token', response.data.bearer_token)
      localStorage.setItem('goqgo_user', JSON.stringify(user))

      console.log('✅ Token登录成功:', response.data.displayName)
    } catch (err: any) {
      console.error('❌ Token登录失败:', err)

      // 处理API返回的错误格式 {"message":"invalid token","success":false}
      if (err.response?.data?.message) {
        error.value = err.response.data.message
      } else if (err.response?.data) {
        // 如果有data但没有message字段，尝试使用整个data作为错误信息
        error.value = typeof err.response.data === 'string' ? err.response.data : '登录失败'
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

  // 密码登录（如果支持的话）
  const loginWithPassword = async (username: string, password: string) => {
    isLoading.value = true
    loading.value = true
    error.value = null

    try {
      // 调用密码登录API（如果后台支持）
      const response = await axios.post<LoginResponse>(
        'http://localhost:8080/api/v1/users/login',
        { username, password },
        { headers: { 'Content-Type': 'application/json' } }
      )

      if (!response.data.success) {
        throw new Error(response.data.message || '登录失败')
      }

      // 保存认证信息
      const user: User = {
        displayName: response.data.displayName,
        email: response.data.email
      }

      token.value = response.data.bearer_token
      currentUser.value = user
      isAuthenticated.value = true

      // 持久化存储
      localStorage.setItem('goqgo_token', response.data.bearer_token)
      localStorage.setItem('goqgo_user', JSON.stringify(user))

      console.log('✅ 密码登录成功:', response.data.displayName)
    } catch (err: any) {
      console.error('❌ 密码登录失败:', err)

      // 处理API返回的错误格式 {"message":"invalid credentials","success":false}
      if (err.response?.data?.message) {
        error.value = err.response.data.message
      } else if (err.response?.data) {
        // 如果有data但没有message字段，尝试使用整个data作为错误信息
        error.value = typeof err.response.data === 'string' ? err.response.data : '登录失败'
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
    if (currentUser.value) {
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
    return currentUser.value?.displayName || userId
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

    // 直接清除本地存储，避免循环调用
    localStorage.removeItem('goqgo_token')
    localStorage.removeItem('goqgo_user')
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
