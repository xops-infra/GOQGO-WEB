// SendMessage功能测试工具
import { useChatStore } from '@/stores/chat'
import { useUserStore } from '@/stores/user'

export class SendMessageTest {
  // 测试chatStore.sendChatMessage方法
  static async testChatStoreSendMessage() {
    console.group('🧪 测试chatStore.sendChatMessage')
    
    try {
      const chatStore = useChatStore()
      const userStore = useUserStore()
      
      console.log('当前用户信息:', {
        currentUser: userStore.currentUser,
        username: userStore.username,
        isAuthenticated: userStore.isAuthenticated
      })
      
      console.log('聊天连接状态:', {
        isConnected: chatStore.isConnected,
        connectionStatus: chatStore.connectionStatus,
        currentNamespace: chatStore.currentNamespace
      })
      
      // 检查sendChatMessage方法是否存在
      console.log('sendChatMessage方法:', typeof chatStore.sendChatMessage)
      
      if (typeof chatStore.sendChatMessage !== 'function') {
        console.error('❌ sendChatMessage方法不存在')
        return
      }
      
      // 尝试发送测试消息
      console.log('发送测试消息...')
      const testMessage = `测试消息 - ${new Date().toLocaleTimeString()}`
      
      const result = await chatStore.sendChatMessage(testMessage, {
        mentionedAgents: [],
        type: 'user'
      })
      
      console.log('✅ 消息发送成功:', result)
      
    } catch (error) {
      console.error('❌ 消息发送失败:', error)
      console.error('错误详情:', {
        message: error.message,
        stack: error.stack
      })
    }
    
    console.groupEnd()
  }
  
  // 测试API连接
  static async testApiConnection() {
    console.group('🧪 测试API连接')
    
    try {
      // 测试聊天API端点
      const response = await fetch('/api/v1/ns/default/chats/default/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('goqgo_token')}`
        },
        body: JSON.stringify({
          content: '测试消息',
          type: 'user',
          messageType: 'text',
          timestamp: new Date().toISOString()
        })
      })
      
      console.log('API响应状态:', response.status)
      console.log('API响应头:', Object.fromEntries(response.headers.entries()))
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ API调用成功:', data)
      } else {
        const errorText = await response.text()
        console.error('❌ API调用失败:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        })
      }
      
    } catch (error) {
      console.error('❌ API连接失败:', error)
    }
    
    console.groupEnd()
  }
  
  // 检查依赖项
  static checkDependencies() {
    console.group('🧪 检查依赖项')
    
    try {
      const chatStore = useChatStore()
      const userStore = useUserStore()
      
      console.log('Store状态检查:')
      console.log('- chatStore:', !!chatStore)
      console.log('- userStore:', !!userStore)
      console.log('- chatStore.sendChatMessage:', typeof chatStore.sendChatMessage)
      
      console.log('用户认证状态:')
      console.log('- isAuthenticated:', userStore.isAuthenticated)
      console.log('- currentUser:', userStore.currentUser)
      console.log('- token:', !!userStore.token)
      
      console.log('聊天连接状态:')
      console.log('- isConnected:', chatStore.isConnected)
      console.log('- connectionStatus:', chatStore.connectionStatus)
      console.log('- currentNamespace:', chatStore.currentNamespace)
      
      // 检查localStorage
      console.log('localStorage状态:')
      console.log('- goqgo_token:', !!localStorage.getItem('goqgo_token'))
      console.log('- goqgo_user:', !!localStorage.getItem('goqgo_user'))
      
    } catch (error) {
      console.error('❌ 依赖项检查失败:', error)
    }
    
    console.groupEnd()
  }
  
  // 模拟用户登录状态
  static setupTestUser() {
    console.group('🧪 设置测试用户')
    
    const testUser = {
      id: 'test-user-' + Date.now(),
      username: 'testuser',
      displayName: '测试用户',
      email: 'test@example.com'
    }
    
    const testToken = 'test-token-' + Date.now()
    
    // 设置localStorage
    localStorage.setItem('goqgo_token', testToken)
    localStorage.setItem('goqgo_user', JSON.stringify(testUser))
    
    console.log('✅ 已设置测试用户:', testUser)
    console.log('✅ 已设置测试token:', testToken)
    
    // 尝试恢复用户状态
    try {
      const userStore = useUserStore()
      userStore.restoreAuth()
      console.log('✅ 用户状态已恢复')
    } catch (error) {
      console.error('❌ 用户状态恢复失败:', error)
    }
    
    console.groupEnd()
  }
}

// 在开发环境下添加到window对象
if (import.meta.env.DEV) {
  ;(window as any).sendMessageTest = SendMessageTest
  console.log('🧪 SendMessage测试工具已加载，使用 window.sendMessageTest 访问')
  console.log('📋 可用方法:')
  console.log('  - sendMessageTest.checkDependencies() - 检查依赖项')
  console.log('  - sendMessageTest.setupTestUser() - 设置测试用户')
  console.log('  - sendMessageTest.testApiConnection() - 测试API连接')
  console.log('  - sendMessageTest.testChatStoreSendMessage() - 测试消息发送')
}
