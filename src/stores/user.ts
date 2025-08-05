import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authManager } from '@/utils/auth'
import { autoFixUserData } from '@/utils/fixUserData'
import type { User } from '@/types/api'

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
    const user = currentUser.value
    if (!user) {
      console.log('🔍 [用户名获取] 无用户信息')
      return ''
    }
    
    const actualUsername = user.username || ''
    console.log('🔍 [用户名获取] 用户名:', actualUsername)
    return actualUsername
  })

  const displayName = computed(() => currentUser.value?.username || '')
  
  const isLoggedIn = computed(() => isAuthenticated.value && !!currentUser.value)
  
  const isAdmin = computed(() => {
    const user = currentUser.value
    if (!user) return false
    
    const isAdminByRole = user.role === 'admin'
    const isAdminByName = user.username === 'admin' || user.username === 'zhoushoujian'
    const result = isAdminByRole || isAdminByName
    
    console.log('🔍 [用户权限] 管理员检查:', {
      user: {
        username: user.username,
        role: user.role,
        email: user.email
      },
      isAdminByRole,
      isAdminByName,
      result
    })
    
    return result
  })

  const hasPermission = computed(() => (permission: string) => {
    // 管理员拥有所有权限
    if (isAdmin.value) return true
    
    // 这里可以根据实际需求实现权限检查逻辑
    return false
  })

  // 恢复认证状态
  const restoreAuth = async () => {
    try {
      const savedToken = localStorage.getItem('auth_token') || localStorage.getItem('goqgo_token')
      const savedUser = localStorage.getItem('goqgo_user')
      
      if (savedToken && savedUser) {
        const userData = JSON.parse(savedUser)
        const fixedUser = autoFixUserData(userData)
        
        currentUser.value = fixedUser
        token.value = savedToken
        isAuthenticated.value = true
        
        console.log('✅ 恢复登录状态:', currentUser.value?.username)
      }
    } catch (error) {
      console.error('❌ 恢复认证状态失败:', error)
      clearAuth()
    }
  }

  // 设置用户信息
  const setUser = async (user: User) => {
    console.log('👤 设置用户信息:', user)
    
    // 修复用户数据格式
    const fixedUser = autoFixUserData(user)
    
    currentUser.value = fixedUser
    isAuthenticated.value = true
    error.value = null
    
    // 保存到本地存储
    localStorage.setItem('goqgo_user', JSON.stringify(fixedUser))
    
    console.log('✅ 用户信息已设置:', fixedUser)
  }

  // 设置Token
  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('auth_token', newToken)
    console.log('🔑 Token已设置')
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
    localStorage.removeItem('auth_token')
    localStorage.removeItem('goqgo_token')
    localStorage.removeItem('goqgo_user')
    
    console.log('🧹 认证信息已清除')
  }

  // 兼容方法
  const loginWithToken = async (userToken: string) => {
    console.log('🔐 Token登录 (兼容模式)')
    setToken(userToken)
    return currentUser.value
  }

  const loginWithPassword = async (username: string, password: string) => {
    console.log('🔐 密码登录 (兼容模式)')
    // 这个方法主要用于兼容，实际登录逻辑在useLogin中处理
    return currentUser.value
  }

  const loginWithAD = async (username: string, password: string) => {
    console.log('🔐 AD登录 (兼容模式)')
    return currentUser.value
  }

  const fetchCurrentUser = async (username: string) => {
    console.log('👤 获取当前用户 (兼容模式)')
    return currentUser.value
  }

  const getUserDisplayName = (userId: string) => {
    return currentUser.value?.username || userId
  }

  const checkTokenExpiry = () => {
    return true
  }

  const refreshToken = async () => {
    console.log('🔄 刷新Token (兼容模式)')
  }

  // 初始化时恢复认证状态
  restoreAuth()

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
    isLoggedIn,
    isAdmin,
    hasPermission,

    // 方法
    restoreAuth,
    setUser,
    setToken,
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
