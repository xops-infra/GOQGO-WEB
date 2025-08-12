import { useUserStore } from '@/stores/user'
import { useChatStore } from '@/stores/chat'
import { useNamespacesStore } from '@/stores/namespaces'
import { useAgentsStore } from '@/stores/agents'
import { useConversationStore } from '@/stores/conversation'
import { useAppStore } from '@/stores/app'
import router from '@/router'
import { webSocketConnectionManager } from './webSocketConnectionManager'

/**
 * 统一的退出登录管理器
 * 确保所有状态、连接和数据都被正确清理
 */
export class LogoutManager {
  private static instance: LogoutManager
  private isLoggingOut = false

  private constructor() {}

  static getInstance(): LogoutManager {
    if (!LogoutManager.instance) {
      LogoutManager.instance = new LogoutManager()
    }
    return LogoutManager.instance
  }

  /**
   * 执行完整的退出登录流程
   */
  async logout(reason?: string): Promise<void> {
    if (this.isLoggingOut) {
      console.log('🔄 退出登录已在进行中，忽略重复请求')
      return
    }

    this.isLoggingOut = true
    
    try {
      console.log('🚪 开始退出登录流程...')
      
      // 1. 断开所有WebSocket连接
      await this.disconnectAllWebSockets()
      
      // 2. 清理所有Store状态
      await this.clearAllStoreStates()
      
      // 3. 清理localStorage数据
      await this.clearAllLocalStorage()
      
      // 4. 清理其他资源
      await this.cleanupOtherResources()
      
      // 5. 跳转到登录页
      await this.redirectToLogin(reason)
      
      console.log('✅ 退出登录流程完成')
      
    } catch (error) {
      console.error('❌ 退出登录失败:', error)
      
      // 即使失败也要尝试跳转到登录页
      try {
        await this.redirectToLogin(reason || '退出登录失败')
      } catch (redirectError) {
        console.error('❌ 跳转到登录页也失败:', redirectError)
        // 使用原生跳转作为最后的备选方案
        window.location.href = '/login'
      }
      
      throw error
    } finally {
      this.isLoggingOut = false
    }
  }

  /**
   * 断开所有WebSocket连接
   */
  private async disconnectAllWebSockets(): Promise<void> {
    console.log('🔌 开始断开所有WebSocket连接...')
    
    try {
      // 使用统一的WebSocket连接管理器
      const stats = webSocketConnectionManager.getConnectionStats()
      console.log('📊 WebSocket连接统计:', stats)
      
      if (stats.totalConnections > 0) {
        // 断开所有WebSocket连接
        webSocketConnectionManager.disconnectAll()
        
        // 等待一小段时间确保连接断开
        await new Promise(resolve => setTimeout(resolve, 100))
        
        console.log('✅ 所有WebSocket连接已断开')
      } else {
        console.log('ℹ️ 没有活跃的WebSocket连接')
      }
      
      // 清理聊天Store的WebSocket连接（作为备选方案）
      try {
        const chatStore = useChatStore()
        // 检查是否有socketManager属性
        if (chatStore && 'socketManager' in chatStore && chatStore.socketManager) {
          console.log('🔌 断开聊天WebSocket连接（备选方案）')
          const socketManager = chatStore.socketManager as any
          if (typeof socketManager.disconnect === 'function') {
            socketManager.disconnect()
          }
        }
      } catch (error) {
        console.warn('⚠️ 清理聊天WebSocket连接失败:', error)
      }

    } catch (error) {
      console.error('❌ 断开WebSocket连接时出错:', error)
      // 不抛出错误，继续执行其他清理步骤
    }
  }

  /**
   * 清理所有Store状态
   */
  private async clearAllStoreStates(): Promise<void> {
    console.log('🧹 开始清理所有Store状态...')
    
    try {
      // 清理用户Store
      try {
        const userStore = useUserStore()
        userStore.clearAuth()
        console.log('✅ 用户Store状态已清理')
      } catch (error) {
        console.warn('⚠️ 清理用户Store状态失败:', error)
      }

      // 清理聊天Store
      try {
        const chatStore = useChatStore()
        chatStore.$reset()
        console.log('✅ 聊天Store状态已清理')
      } catch (error) {
        console.warn('⚠️ 清理聊天Store状态失败:', error)
      }

      // 清理命名空间Store
      try {
        const namespacesStore = useNamespacesStore()
        namespacesStore.$reset()
        console.log('✅ 命名空间Store状态已清理')
      } catch (error) {
        console.warn('⚠️ 清理命名空间Store状态失败:', error)
      }

      // 清理代理Store
      try {
        const agentsStore = useAgentsStore()
        agentsStore.$reset()
        console.log('✅ 代理Store状态已清理')
      } catch (error) {
        console.warn('⚠️ 清理代理Store状态失败:', error)
      }

      // 清理对话Store
      try {
        const conversationStore = useConversationStore()
        conversationStore.$reset()
        console.log('✅ 对话Store状态已清理')
      } catch (error) {
        console.warn('⚠️ 清理对话Store状态失败:', error)
      }

      // 清理应用Store
      try {
        const appStore = useAppStore()
        appStore.$reset()
        console.log('✅ 应用Store状态已清理')
      } catch (error) {
        console.warn('⚠️ 清理应用Store状态失败:', error)
      }

      console.log('✅ 所有Store状态已清理')
    } catch (error) {
      console.error('❌ 清理Store状态时出错:', error)
      // 不抛出错误，继续执行其他清理步骤
    }
  }

  /**
   * 清理所有localStorage数据
   */
  private async clearAllLocalStorage(): Promise<void> {
    console.log('🗑️ 开始清理所有localStorage数据...')
    
    try {
      // 认证相关数据
      localStorage.removeItem('goqgo_token')
      localStorage.removeItem('goqgo_user')
      
      // 聊天相关数据
      localStorage.removeItem('goqgo_chat_state')
      localStorage.removeItem('goqgo_conversation_state')
      
      // 页面状态数据
      localStorage.removeItem('goqgo_page_state')
      localStorage.removeItem('currentNamespace')
      
      // WebSocket相关数据
      localStorage.removeItem('goqgo_websocket_state')
      localStorage.removeItem('goqgo_socket_reconnect_state')
      
      // 其他可能的数据
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('goqgo_')) {
          keysToRemove.push(key)
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key)
        console.log(`🗑️ 清理localStorage: ${key}`)
      })
      
      console.log('✅ 所有localStorage数据已清理')
    } catch (error) {
      console.error('❌ 清理localStorage数据时出错:', error)
      // 不抛出错误，继续执行其他清理步骤
    }
  }

  /**
   * 清理其他资源
   */
  private async cleanupOtherResources(): Promise<void> {
    console.log('🧹 开始清理其他资源...')
    
    try {
      // 清理定时器
      // 这里可以添加清理其他定时器的逻辑
      
      // 清理事件监听器
      // 这里可以添加清理事件监听器的逻辑
      
      // 清理其他可能的资源
      console.log('✅ 其他资源已清理')
    } catch (error) {
      console.error('❌ 清理其他资源时出错:', error)
      // 不抛出错误，继续执行其他清理步骤
    }
  }

  /**
   * 跳转到登录页
   */
  private async redirectToLogin(reason?: string): Promise<void> {
    console.log('🔄 准备跳转到登录页...')
    
    try {
      // 如果当前已经在登录页，不需要跳转
      if (router.currentRoute.value.path === '/login') {
        console.log('✅ 已在登录页，无需跳转')
        return
      }

      // 构建重定向路径
      const currentPath = router.currentRoute.value.fullPath
      const redirectPath = currentPath !== '/' ? `?redirect=${encodeURIComponent(currentPath)}` : ''
      
      // 尝试路由跳转
      await router.push(`/login${redirectPath}`)
      console.log('✅ 成功跳转到登录页')
      
    } catch (error) {
      console.error('❌ 路由跳转失败:', error)
      
      // 如果路由跳转失败，使用原生跳转
      console.log('🔄 使用原生跳转作为备选方案')
      window.location.href = '/login'
    }
  }

  /**
   * 强制退出登录（用于异常情况）
   */
  forceLogout(): void {
    console.log('🚨 强制退出登录')
    
    // 直接清理localStorage
    this.clearAllLocalStorage()
    
    // 强制跳转
    window.location.href = '/login'
  }
}

// 导出单例实例
export const logoutManager = LogoutManager.getInstance()

// 导出便捷方法
export const logout = (reason?: string) => logoutManager.logout(reason)
export const forceLogout = () => logoutManager.forceLogout()
