import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userApi, type User } from '@/api/users'

export interface SimpleUser {
  username: string
  displayName: string
  avatar?: string
  role?: string
  isOnline: boolean
  lastSeen?: string
}

export const useUserStore = defineStore('user', () => {
  // 当前用户完整信息
  const currentUserData = ref<User | null>(null)
  
  // 当前用户简化信息（向后兼容）
  const currentUser = computed(() => {
    if (!currentUserData.value) {
      return {
        username: 'xops',
        displayName: 'XOps',
        avatar: '',
        role: 'developer',
        isOnline: true
      }
    }
    
    const user = currentUserData.value
    return {
      username: user.metadata.name,
      displayName: user.spec.displayName,
      avatar: '', // 可以从annotations或其他地方获取
      role: user.metadata.labels.role || 'user',
      isOnline: user.status.phase === 'Active'
    }
  })
  
  // 在线用户列表
  const onlineUsers = ref<SimpleUser[]>([])
  
  // 所有用户列表
  const allUsers = ref<User[]>([])
  
  // 加载状态
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // 创建模拟用户数据
  const createMockUserData = (username: string): User => {
    return {
      apiVersion: "v1",
      kind: "User",
      metadata: {
        name: username,
        creationTimestamp: new Date().toISOString(),
        labels: {
          department: "development",
          role: "developer",
          team: "frontend"
        },
        annotations: {
          contact: `${username}@example.com`,
          description: "前端开发工程师，专注于Vue.js和现代化Web应用开发"
        }
      },
      spec: {
        displayName: username === 'xops' ? 'XOps' : username.charAt(0).toUpperCase() + username.slice(1),
        email: `${username}@example.com`,
        password: "",
        token: "",
        tokenExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30天后过期
        roles: [],
        permissions: {
          namespaces: [],
          agents: {
            create: true,
            delete: false,
            restart: true,
            send: true,
            logs: true
          },
          dags: {
            create: true,
            run: true,
            delete: false
          }
        },
        preferences: {
          defaultNamespace: "default",
          outputFormat: "json",
          timezone: "Asia/Shanghai"
        },
        quotas: {
          maxAgents: 10,
          maxNamespaces: 3,
          maxDags: 20
        }
      },
      status: {
        phase: "Active",
        lastLoginTime: new Date().toISOString(),
        agentCount: 0,
        namespaceCount: 1,
        dagCount: 0
      }
    }
  }
  
  // 获取当前用户信息
  const fetchCurrentUser = async (username: string = 'xops') => {
    loading.value = true
    error.value = null
    
    try {
      console.log('👤 获取用户信息:', username)
      const userData = await userApi.get(username)
      
      // 检查用户数据是否有效（axios拦截器已经返回了data）
      if (userData && userData.spec) {
        currentUserData.value = userData
        console.log('✅ 用户信息获取成功:', userData.spec.displayName)
      } else {
        console.warn('⚠️ 用户数据格式不正确:', userData)
        throw new Error('用户数据格式不正确')
      }
    } catch (err: any) {
      console.error('❌ 获取用户信息失败:', err)
      error.value = err.message || '获取用户信息失败'
      
      // 如果是网络错误或API不可用，创建一个模拟的用户数据
      if (err.code === 'ECONNREFUSED' || err.response?.status === 404 || !err.response) {
        console.log('🔄 使用模拟用户数据作为fallback')
        currentUserData.value = createMockUserData(username)
        error.value = null // 清除错误，因为我们有fallback数据
      } else {
        // 使用默认用户信息作为fallback
        currentUserData.value = null
      }
    } finally {
      loading.value = false
    }
  }
  
  // 获取所有用户列表
  const fetchAllUsers = async () => {
    loading.value = true
    error.value = null
    
    try {
      console.log('👥 获取用户列表')
      const userListData = await userApi.list()
      
      // 检查数据格式（axios拦截器已经返回了data）
      if (userListData && userListData.items) {
        allUsers.value = userListData.items
        console.log('✅ 用户列表获取成功:', userListData.items.length, '个用户')
      } else {
        console.warn('⚠️ 用户列表数据格式不正确:', userListData)
        allUsers.value = []
      }
    } catch (err: any) {
      console.error('❌ 获取用户列表失败:', err)
      error.value = err.message || '获取用户列表失败'
      allUsers.value = []
    } finally {
      loading.value = false
    }
  }
  
  // 设置当前用户（向后兼容）
  const setCurrentUser = (user: Partial<SimpleUser>) => {
    if (currentUserData.value) {
      // 如果有完整用户数据，更新相应字段
      if (user.displayName) {
        currentUserData.value.spec.displayName = user.displayName
      }
    }
    console.log('👤 设置当前用户:', user)
  }
  
  // 更新在线用户列表
  const updateOnlineUsers = (users: SimpleUser[]) => {
    onlineUsers.value = users
    console.log('👥 更新在线用户列表:', users.length, '人')
  }
  
  // 添加在线用户
  const addOnlineUser = (user: SimpleUser) => {
    const existingIndex = onlineUsers.value.findIndex(u => u.username === user.username)
    if (existingIndex !== -1) {
      onlineUsers.value[existingIndex] = user
    } else {
      onlineUsers.value.push(user)
    }
    console.log('👤 用户上线:', user.username)
  }
  
  // 移除在线用户
  const removeOnlineUser = (username: string) => {
    const index = onlineUsers.value.findIndex(u => u.username === username)
    if (index !== -1) {
      onlineUsers.value.splice(index, 1)
      console.log('👤 用户下线:', username)
    }
  }
  
  // 获取用户显示名称
  const getUserDisplayName = (username: string) => {
    if (username === currentUser.value.username) {
      return currentUser.value.displayName
    }
    
    // 先从在线用户中查找
    const onlineUser = onlineUsers.value.find(u => u.username === username)
    if (onlineUser) {
      return onlineUser.displayName
    }
    
    // 再从所有用户中查找
    const allUser = allUsers.value.find(u => u.metadata.name === username)
    if (allUser) {
      return allUser.spec.displayName
    }
    
    return username
  }
  
  // 检查是否为当前用户
  const isCurrentUser = (username: string) => {
    return username === currentUser.value.username
  }
  
  // 获取用户详细信息
  const getUserDetails = (username: string) => {
    return allUsers.value.find(u => u.metadata.name === username)
  }
  
  // 获取用户权限信息
  const getUserPermissions = (username: string) => {
    const user = getUserDetails(username)
    return user?.spec.permissions
  }
  
  // 获取用户配额信息
  const getUserQuotas = (username: string) => {
    const user = getUserDetails(username)
    return user?.spec.quotas
  }
  
  // 获取用户状态统计
  const getUserStats = (username: string) => {
    const user = getUserDetails(username)
    return user?.status
  }
  
  return {
    // 状态
    currentUser,
    currentUserData,
    onlineUsers,
    allUsers,
    loading,
    error,
    
    // 方法
    fetchCurrentUser,
    fetchAllUsers,
    setCurrentUser,
    updateOnlineUsers,
    addOnlineUser,
    removeOnlineUser,
    getUserDisplayName,
    isCurrentUser,
    getUserDetails,
    getUserPermissions,
    getUserQuotas,
    getUserStats
  }
})
