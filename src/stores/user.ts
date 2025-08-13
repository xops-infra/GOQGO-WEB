import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { buildApiUrl, API_ENDPOINTS } from '@/config/api'
import { authManager } from '@/utils/auth'
import { logoutManager } from '@/utils/logoutManager'
import axios from '@/utils/axios'

// 用户接口定义
export interface User {
  id?: string
  username?: string
  displayName: string
  email: string
  avatar?: string
  role?: 'admin' | 'developer' | 'viewer'
  status?: string
  createdAt?: string
}

// 注册请求接口
export interface RegisterRequest {
  username: string
  displayName: string
  email: string
  password: string
}

// 登录请求接口
export interface LoginRequest {
  username: string
  password: string
}

// 认证API响应接口（基于后端API文档）
export interface AuthResponse {
  success: boolean
  message: string
  token: string
  user: {
    username: string
    displayName: string
    email: string
    status: string
    createdAt: string
  }
}

// Token验证响应接口
export interface VerifyResponse {
  valid: boolean
  user?: {
    username: string
    displayName: string
    email: string
    status: string
    createdAt: string
  }
  error?: string
  message?: string
}

// 兼容旧接口
export interface LoginResponse {
  success: boolean
  message: string
  bearer_token: string
  displayName: string
  email: string
  role?: string
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
  const username = computed(() => {
    const name = currentUser.value?.displayName || ''
    return name
  })
  const displayName = computed(() => currentUser.value?.displayName || '')
  const email = computed(() => currentUser.value?.email || '')
  const avatar = computed(() => currentUser.value?.avatar || '')
  const isAdmin = computed(() => {
    // 临时管理员检查逻辑：如果用户名是 'zhoushoujian' 则认为是管理员
    // 或者检查role字段
    const user = currentUser.value
    if (!user) return false
    
    return user.role === 'admin' || user.displayName === 'zhoushoujian'
  })
  const hasPermission = computed(() => (permission: string) => {
    // 根据实际权限结构实现权限检查
    return true
  })

  // 用户注册
  const register = async (registerData: RegisterRequest) => {
    isLoading.value = true
    loading.value = true
    error.value = null

    try {
      // 创建超时控制器
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒超时

      // 调用注册API
      const response = await fetch(buildApiUrl(API_ENDPOINTS.AUTH.REGISTER), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registerData),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data: AuthResponse = await response.json()

      // 检查响应格式
      if (!data.success) {
        throw new Error(data.message || '注册失败')
      }

      if (!data.token || !data.user) {
        throw new Error('服务器响应格式错误')
      }

      // 保存认证信息
      const user: User = {
        username: data.user.username,
        displayName: data.user.displayName,
        email: data.user.email,
        status: data.user.status,
        createdAt: data.user.createdAt,
        role: 'developer' // 默认角色
      }

      token.value = data.token
      currentUser.value = user
      isAuthenticated.value = true

      // 持久化存储
      localStorage.setItem('goqgo_token', data.token)
      localStorage.setItem('goqgo_user', JSON.stringify(user))

      console.log('✅ 注册成功:', data.message)
    } catch (err: any) {
      console.error('❌ 注册失败:', err)

      if (err.name === 'AbortError') {
        error.value = '请求超时，请检查网络连接'
      } else if (err.message) {
        error.value = err.message
      } else {
        error.value = '注册失败，请检查输入信息'
      }

      clearAuth()
      throw new Error(error.value || '注册失败')
    } finally {
      isLoading.value = false
      loading.value = false
    }
  }

  // 用户登录（使用新的认证API）
  const login = async (loginData: LoginRequest) => {
    isLoading.value = true
    loading.value = true
    error.value = null

    try {
      // 调用登录API
      const response = await fetch(buildApiUrl(API_ENDPOINTS.AUTH.LOGIN), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data: AuthResponse = await response.json()

      // 检查响应格式
      if (!data.success) {
        throw new Error(data.message || '登录失败')
      }

      if (!data.token || !data.user) {
        throw new Error('服务器响应格式错误')
      }

      // 保存认证信息
      const user: User = {
        username: data.user.username,
        displayName: data.user.displayName,
        email: data.user.email,
        status: data.user.status,
        createdAt: data.user.createdAt,
        role: 'developer' // 默认角色
      }

      token.value = data.token
      currentUser.value = user
      isAuthenticated.value = true

      // 持久化存储
      localStorage.setItem('goqgo_token', data.token)
      localStorage.setItem('goqgo_user', JSON.stringify(user))

      console.log('✅ 登录成功:', data.message)
    } catch (err: any) {
      console.error('❌ 登录失败:', err)

      if (err.message) {
        error.value = err.message
      } else {
        error.value = '登录失败，请检查用户名和密码'
      }

      clearAuth()
      throw new Error(error.value || '登录失败')
    } finally {
      isLoading.value = false
      loading.value = false
    }
  }

  // Token验证
  const verifyToken = async (tokenToVerify?: string) => {
    const verifyToken = tokenToVerify || token.value
    if (!verifyToken) {
      throw new Error('没有可验证的token')
    }

    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.AUTH.VERIFY), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${verifyToken}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.error || 'Token验证失败')
      }

      const data: VerifyResponse = await response.json()

      if (!data.valid) {
        throw new Error(data.message || data.error || 'Token无效')
      }

      // 如果验证成功且有用户信息，更新用户信息
      if (data.user) {
        const user: User = {
          username: data.user.username,
          displayName: data.user.displayName,
          email: data.user.email,
          status: data.user.status,
          createdAt: data.user.createdAt,
          role: currentUser.value?.role || 'developer'
        }

        currentUser.value = user
        localStorage.setItem('goqgo_user', JSON.stringify(user))
      }

      return true
    } catch (err: any) {
      console.error('❌ Token验证失败:', err)
      throw err
    }
  }
  const restoreAuth = async () => {
    try {
      const savedToken = localStorage.getItem('goqgo_token')
      const savedUser = localStorage.getItem('goqgo_user')

      if (savedToken && savedUser) {
        // 验证token是否仍然有效
        try {
          await verifyToken(savedToken)
          
          // Token有效，恢复状态
          token.value = savedToken
          currentUser.value = JSON.parse(savedUser)
          isAuthenticated.value = true

          console.log('✅ 登录状态恢复成功')
          return true
        } catch (verifyError) {
          console.warn('🔑 Token验证失败，清除认证信息:', verifyError)
          clearAuth()
          return false
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
        buildApiUrl('/api/v1/users/login'),
        { token: userToken },
        { headers: { 'Content-Type': 'application/json' } }
      )

      // 检查响应数据是否存在
      if (!response) {
        throw new Error('服务器响应数据为空')
      }

      // 检查响应数据结构
      if (typeof response !== 'object') {
        throw new Error(`服务器响应格式错误: 期望object，实际${typeof response}`)
      }

      // 检查success属性
      if (response.success === false) {
        throw new Error(response.message || '登录失败')
      }

      if (response.success !== true) {
        throw new Error(`服务器响应格式不正确: success=${response.success}`)
      }

      // 检查必要字段
      if (!response.bearer_token) {
        throw new Error('服务器未返回认证令牌')
      }

      if (!response.displayName) {
        throw new Error('服务器未返回用户信息')
      }

      // 保存认证信息
      const user: User = {
        displayName: response.displayName,
        email: response.email || '',
        role: response.role as 'admin' | 'developer' | 'viewer' || 'developer'
      }

      token.value = response.bearer_token
      currentUser.value = user
      isAuthenticated.value = true

      // 持久化存储
      localStorage.setItem('goqgo_token', response.bearer_token)
      localStorage.setItem('goqgo_user', JSON.stringify(user))
    } catch (err: any) {
      console.error('❌ Token登录失败:', err)

      // 处理不同类型的错误
      if (err.response) {
        // 服务器响应了错误状态码
        console.log('🔍 错误响应详情:', {
          status: err.response.status,
          statusText: err.response.statusText,
          data: err.response.data
        })
        
        if (err.response.data && typeof err.response.data === 'object') {
          if (err.response.data.message) {
            error.value = err.response.data.message
          } else if (err.response.data.error) {
            error.value = err.response.data.error
          } else {
            error.value = `服务器错误: ${err.response.status}`
          }
        } else if (typeof err.response.data === 'string') {
          error.value = err.response.data
        } else {
          error.value = `服务器错误: ${err.response.status}`
        }
      } else if (err.request) {
        // 请求已发出但没有收到响应
        error.value = '无法连接到服务器，请检查网络连接'
      } else if (err.message) {
        // 其他错误
        error.value = err.message
      } else {
        error.value = '登录失败，请检查令牌是否正确'
      }

      clearAuth()
      throw new Error(error.value || '登录失败')
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
        buildApiUrl(API_ENDPOINTS.AUTH.USER_LOGIN(username)),
        { password },
        { headers: { 'Content-Type': 'application/json' } }
      )

      // 检查响应数据是否存在
      if (!response) {
        throw new Error('服务器响应数据为空')
      }

      // 检查响应数据结构
      if (typeof response !== 'object') {
        throw new Error(`服务器响应格式错误: 期望object，实际${typeof response}`)
      }

      // 检查success属性
      if (response.success === false) {
        throw new Error(response.message || '登录失败')
      }

      if (response.success !== true) {
        throw new Error(`服务器响应格式不正确: success=${response.success}`)
      }

      // 检查必要字段
      if (!response.bearer_token) {
        throw new Error('服务器未返回认证令牌')
      }

      if (!response.displayName) {
        throw new Error('服务器未返回用户信息')
      }

      // 保存认证信息
      const user: User = {
        displayName: response.displayName,
        email: response.email || '',
        role: response.role as 'admin' | 'developer' | 'viewer' || 'developer'
      }

      token.value = response.bearer_token
      currentUser.value = user
      isAuthenticated.value = true

      // 持久化存储
      localStorage.setItem('goqgo_token', response.bearer_token)
      localStorage.setItem('goqgo_user', JSON.stringify(user))
    } catch (err: any) {
      console.error('❌ 密码登录失败:', err)

      // 处理不同类型的错误
      if (err.response) {
        // 服务器响应了错误状态码
        console.log('🔍 错误响应详情:', {
          status: err.response.status,
          statusText: err.response.statusText,
          data: err.response.data
        })
        
        if (err.response.data && typeof err.response.data === 'object') {
          if (err.response.data.message) {
            // 特殊处理常见错误消息
            if (err.response.data.message === 'user not found') {
              error.value = `用户 "${username}" 不存在。请联系管理员创建用户账号。`
            } else if (err.response.data.message === 'invalid credentials') {
              error.value = `用户名或密码错误。请检查您的登录凭据。`
            } else {
              error.value = err.response.data.message
            }
          } else if (err.response.data.error) {
            error.value = err.response.data.error
          } else {
            error.value = `服务器错误: ${err.response.status}`
          }
        } else if (typeof err.response.data === 'string') {
          error.value = err.response.data
        } else {
          error.value = `服务器错误: ${err.response.status}`
        }
      } else if (err.request) {
        // 请求已发出但没有收到响应
        error.value = '无法连接到服务器，请检查网络连接'
      } else if (err.message) {
        // 其他错误
        error.value = err.message
      } else {
        error.value = '登录失败，请检查用户名和密码'
      }

      clearAuth()
      throw new Error(error.value || '登录失败')
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
  const logout = async () => {
    try {
      // 使用统一的退出登录管理器
      await logoutManager.logout()
    } catch (error) {
      console.error('❌ 用户Store登出失败:', error)
      // 如果统一管理器失败，执行基本清理
      clearAuth()
      throw error
    }
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

  const updateUserInfo = (userData: Partial<User>) => {
    if (currentUser.value) {
      currentUser.value = { ...currentUser.value, ...userData }
      // 更新localStorage
      localStorage.setItem('goqgo_user', JSON.stringify(currentUser.value))
    }
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
    email,
    avatar,
    isAdmin,
    hasPermission,

    // 方法
    register,
    login,
    verifyToken,
    restoreAuth,
    loginWithToken,
    loginWithPassword,
    loginWithAD,
    fetchCurrentUser, // 兼容现有组件
    getUserDisplayName, // 兼容现有组件
    logout,
    clearAuth,
    checkTokenExpiry,
    refreshToken,
    updateUserInfo
  }
})
