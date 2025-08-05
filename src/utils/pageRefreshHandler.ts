/**
 * 页面刷新状态恢复处理器
 * 处理页面刷新后的Socket重连和状态恢复
 */

import { useChatStore } from '@/stores/chat'
import { useUserStore } from '@/stores/user'
import { useNamespacesStore } from '@/stores/namespaces'

export interface PageState {
  currentNamespace: string
  lastActiveTime: number
  chatMessages: any[]
  userInfo: any
  connectionInfo: any
}

export class PageRefreshHandler {
  private readonly STORAGE_KEY = 'goqgo_page_state'
  private readonly MAX_RESTORE_AGE = 30 * 60 * 1000 // 30分钟

  /**
   * 保存页面状态
   */
  savePageState() {
    try {
      // 检查store是否可用
      let chatStore, userStore, namespacesStore
      try {
        chatStore = useChatStore()
        userStore = useUserStore()
        namespacesStore = useNamespacesStore()
      } catch (error) {
        console.warn('⚠️ Store未初始化，跳过状态保存')
        return
      }

      const state: PageState = {
        currentNamespace: chatStore.currentNamespace,
        lastActiveTime: Date.now(),
        chatMessages: chatStore.messages.slice(-50), // 只保存最近50条消息
        userInfo: {
          username: userStore.username,
          isLoggedIn: userStore.isLoggedIn
        },
        connectionInfo: chatStore.getConnectionInfo()
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state))
      console.log('💾 页面状态已保存:', state.currentNamespace)
    } catch (error) {
      console.warn('⚠️ 保存页面状态失败:', error)
    }
  }

  /**
   * 恢复页面状态
   */
  async restorePageState(): Promise<boolean> {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY)
      if (!saved) {
        console.log('📦 没有找到保存的页面状态')
        return false
      }

      const state: PageState = JSON.parse(saved)
      const now = Date.now()
      const age = now - state.lastActiveTime

      // 检查状态是否过期
      if (age > this.MAX_RESTORE_AGE) {
        console.log('⏰ 页面状态已过期，清理旧状态')
        this.clearPageState()
        return false
      }

      console.log('📦 开始恢复页面状态:', {
        namespace: state.currentNamespace,
        age: Math.round(age / 1000) + 's',
        messagesCount: state.chatMessages?.length || 0
      })

      // 恢复用户状态
      let userStore, chatStore
      try {
        userStore = useUserStore()
        chatStore = useChatStore()
      } catch (error) {
        console.warn('⚠️ Store未初始化，无法恢复状态')
        return false
      }

      if (state.userInfo && !userStore.isLoggedIn) {
        // 这里可能需要重新验证用户身份
        console.log('👤 需要重新验证用户身份')
      }

      // 恢复聊天状态
      if (state.currentNamespace) {
        // 重新连接到之前的命名空间
        await chatStore.connect(state.currentNamespace)
        
        // 等待连接建立
        await this.waitForConnection(chatStore, 5000)
        
        console.log('✅ 页面状态恢复完成')
        return true
      }

      return false
    } catch (error) {
      console.error('❌ 恢复页面状态失败:', error)
      this.clearPageState()
      return false
    }
  }

  /**
   * 等待连接建立
   */
  private waitForConnection(chatStore: any, timeout: number = 5000): Promise<boolean> {
    return new Promise((resolve) => {
      const startTime = Date.now()
      
      const checkConnection = () => {
        if (chatStore.isConnected) {
          console.log('✅ Socket连接已建立')
          resolve(true)
          return
        }
        
        if (Date.now() - startTime > timeout) {
          console.warn('⏰ 等待连接超时')
          resolve(false)
          return
        }
        
        setTimeout(checkConnection, 100)
      }
      
      checkConnection()
    })
  }

  /**
   * 清理页面状态
   */
  clearPageState() {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
      console.log('🧹 页面状态已清理')
    } catch (error) {
      console.warn('⚠️ 清理页面状态失败:', error)
    }
  }

  /**
   * 检查是否有可恢复的状态
   */
  hasRestorableState(): boolean {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY)
      if (!saved) return false

      const state: PageState = JSON.parse(saved)
      const age = Date.now() - state.lastActiveTime
      
      return age <= this.MAX_RESTORE_AGE && !!state.currentNamespace
    } catch {
      return false
    }
  }

  /**
   * 获取保存的状态信息
   */
  getSavedStateInfo() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY)
      if (!saved) return null

      const state: PageState = JSON.parse(saved)
      const age = Date.now() - state.lastActiveTime
      
      return {
        namespace: state.currentNamespace,
        age: age,
        ageText: this.formatAge(age),
        messagesCount: state.chatMessages?.length || 0,
        isExpired: age > this.MAX_RESTORE_AGE
      }
    } catch {
      return null
    }
  }

  /**
   * 格式化时间差
   */
  private formatAge(age: number): string {
    const seconds = Math.floor(age / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}小时${minutes % 60}分钟前`
    } else if (minutes > 0) {
      return `${minutes}分钟前`
    } else {
      return `${seconds}秒前`
    }
  }

  /**
   * 设置页面事件监听器
   */
  setupEventListeners() {
    // 页面卸载前保存状态
    const handleBeforeUnload = () => {
      this.savePageState()
    }

    // 页面可见性变化时保存状态
    const handleVisibilityChange = () => {
      if (document.hidden) {
        this.savePageState()
      }
    }

    // 定期保存状态
    const autoSaveInterval = setInterval(() => {
      this.savePageState()
    }, 60000) // 每分钟保存一次

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // 返回清理函数
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(autoSaveInterval)
    }
  }
}

// 创建全局实例
export const pageRefreshHandler = new PageRefreshHandler()

// 自动初始化
let cleanupListeners: (() => void) | null = null

export const initPageRefreshHandler = () => {
  if (cleanupListeners) {
    cleanupListeners()
  }
  cleanupListeners = pageRefreshHandler.setupEventListeners()
  console.log('📱 页面刷新处理器已初始化')
}

export const cleanupPageRefreshHandler = () => {
  if (cleanupListeners) {
    cleanupListeners()
    cleanupListeners = null
  }
  console.log('🧹 页面刷新处理器已清理')
}
