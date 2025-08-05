import { ref, computed } from 'vue'

export function useChatUsers() {
  // 响应式状态
  const onlineUsers = ref<string[]>([])
  const typingUsers = ref<Set<string>>(new Set())

  // 计算属性
  const typingUsersList = computed(() => Array.from(typingUsers.value))
  
  const onlineUserCount = computed(() => onlineUsers.value.length)
  
  const isUserOnline = computed(() => (username: string) => {
    return onlineUsers.value.includes(username)
  })

  const isUserTyping = computed(() => (username: string) => {
    return typingUsers.value.has(username)
  })

  // 在线用户管理
  const addOnlineUser = (username: string) => {
    if (!username || onlineUsers.value.includes(username)) {
      return
    }
    onlineUsers.value.push(username)
  }

  const removeOnlineUser = (username: string) => {
    const index = onlineUsers.value.indexOf(username)
    if (index !== -1) {
      onlineUsers.value.splice(index, 1)
    }
    // 同时移除打字状态
    typingUsers.value.delete(username)
  }

  const updateOnlineUsers = (users: string[]) => {
    onlineUsers.value = [...users]
    // 清理不在线用户的打字状态
    const onlineSet = new Set(users)
    for (const typingUser of typingUsers.value) {
      if (!onlineSet.has(typingUser)) {
        typingUsers.value.delete(typingUser)
      }
    }
  }

  // 打字状态管理
  const setTypingUser = (username: string, timeout = 3000) => {
    if (!username) return

    typingUsers.value.add(username)
    
    // 设置超时自动清除
    setTimeout(() => {
      typingUsers.value.delete(username)
    }, timeout)
  }

  const clearTypingUser = (username: string) => {
    typingUsers.value.delete(username)
  }

  const clearAllTypingUsers = () => {
    typingUsers.value.clear()
  }

  // 用户状态查询
  const getUserStatus = (username: string) => {
    return {
      isOnline: onlineUsers.value.includes(username),
      isTyping: typingUsers.value.has(username)
    }
  }

  // 获取用户列表（排序）
  const getSortedOnlineUsers = () => {
    return [...onlineUsers.value].sort((a, b) => a.localeCompare(b))
  }

  // 重置所有用户状态
  const resetUserStates = () => {
    onlineUsers.value = []
    typingUsers.value.clear()
  }

  return {
    // 状态
    onlineUsers,
    typingUsers,
    typingUsersList,
    onlineUserCount,
    isUserOnline,
    isUserTyping,
    
    // 方法
    addOnlineUser,
    removeOnlineUser,
    updateOnlineUsers,
    setTypingUser,
    clearTypingUser,
    clearAllTypingUsers,
    getUserStatus,
    getSortedOnlineUsers,
    resetUserStates
  }
}

export default useChatUsers
