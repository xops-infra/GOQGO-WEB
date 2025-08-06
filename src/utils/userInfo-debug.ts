// 用户信息调试工具
import { useUserStore } from '@/stores/user'

export class UserInfoDebug {
  // 检查当前用户信息
  static checkCurrentUser() {
    console.group('🧪 检查当前用户信息')
    
    try {
      const userStore = useUserStore()
      
      console.log('UserStore状态:')
      console.log('- currentUser:', userStore.currentUser)
      console.log('- username:', userStore.username)
      console.log('- displayName:', userStore.displayName)
      console.log('- isAuthenticated:', userStore.isAuthenticated)
      console.log('- token:', userStore.token ? `${userStore.token.substring(0, 20)}...` : 'null')
      
      console.log('localStorage数据:')
      const savedUser = localStorage.getItem('goqgo_user')
      const savedToken = localStorage.getItem('goqgo_token')
      const authToken = localStorage.getItem('auth_token')
      
      console.log('- goqgo_user:', savedUser ? JSON.parse(savedUser) : null)
      console.log('- goqgo_token:', savedToken ? `${savedToken.substring(0, 20)}...` : null)
      console.log('- auth_token:', authToken ? `${authToken.substring(0, 20)}...` : null)
      
      // 检查用户数据结构
      if (savedUser) {
        const userData = JSON.parse(savedUser)
        console.log('用户数据字段检查:')
        console.log('- id:', userData.id)
        console.log('- username:', userData.username)
        console.log('- displayName:', userData.displayName)
        console.log('- email:', userData.email)
        console.log('- role:', userData.role)
        console.log('- avatar:', userData.avatar)
      }
      
    } catch (error) {
      console.error('❌ 检查用户信息失败:', error)
    }
    
    console.groupEnd()
  }
  
  // 模拟admin用户数据
  static setupAdminUser() {
    console.group('🧪 设置Admin用户数据')
    
    const adminUser = {
      id: 'admin',
      username: 'admin',
      displayName: 'Administrator',
      email: 'admin@example.com',
      role: 'admin',
      avatar: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    const testToken = 'admin-token-' + Date.now()
    
    // 保存到localStorage
    localStorage.setItem('goqgo_user', JSON.stringify(adminUser))
    localStorage.setItem('goqgo_token', testToken)
    localStorage.setItem('auth_token', testToken)
    
    console.log('✅ 已设置Admin用户数据:', adminUser)
    
    // 恢复用户状态
    try {
      const userStore = useUserStore()
      userStore.restoreAuth()
      console.log('✅ 用户状态已恢复')
      
      // 检查恢复后的状态
      setTimeout(() => {
        console.log('恢复后的用户信息:')
        console.log('- currentUser:', userStore.currentUser)
        console.log('- displayName:', userStore.displayName)
      }, 100)
      
    } catch (error) {
      console.error('❌ 用户状态恢复失败:', error)
    }
    
    console.groupEnd()
  }
  
  // 测试不同的用户数据格式
  static testUserDataFormats() {
    console.group('🧪 测试用户数据格式')
    
    const testCases = [
      {
        name: '完整用户数据',
        data: {
          id: 'test1',
          username: 'admin',
          displayName: 'Administrator',
          email: 'admin@test.com',
          role: 'admin'
        }
      },
      {
        name: '缺少displayName',
        data: {
          id: 'test2',
          username: 'admin',
          email: 'admin@test.com',
          role: 'admin'
        }
      },
      {
        name: '旧格式数据',
        data: {
          displayName: 'Administrator',
          email: 'admin@test.com'
        }
      }
    ]
    
    testCases.forEach(testCase => {
      console.log(`\n测试: ${testCase.name}`)
      console.log('原始数据:', testCase.data)
      
      // 导入并测试autoFixUserData
      import('@/utils/fixUserData').then(({ autoFixUserData }) => {
        const fixedData = autoFixUserData(testCase.data)
        console.log('修复后数据:', fixedData)
        console.log('displayName结果:', fixedData.displayName)
      })
    })
    
    console.groupEnd()
  }
  
  // 检查UserInfo组件显示逻辑
  static checkUserInfoDisplay() {
    console.group('🧪 检查UserInfo组件显示逻辑')
    
    try {
      const userStore = useUserStore()
      
      console.log('UserInfo组件显示逻辑检查:')
      console.log('- userStore.displayName:', userStore.displayName)
      console.log('- 显示文本:', userStore.displayName || '用户')
      
      // 检查DOM中的实际显示
      const userNameElement = document.querySelector('.user-name')
      if (userNameElement) {
        console.log('- DOM中显示的文本:', userNameElement.textContent)
      } else {
        console.log('- 未找到.user-name元素')
      }
      
      // 检查用户头像初始字母
      const userInitials = userStore.displayName ? 
        userStore.displayName.charAt(0).toUpperCase() : 
        userStore.username ? userStore.username.charAt(0).toUpperCase() : 'U'
      console.log('- 用户头像初始字母:', userInitials)
      
    } catch (error) {
      console.error('❌ 检查UserInfo显示逻辑失败:', error)
    }
    
    console.groupEnd()
  }
  
  // 清除用户数据
  static clearUserData() {
    console.group('🧪 清除用户数据')
    
    localStorage.removeItem('goqgo_user')
    localStorage.removeItem('goqgo_token')
    localStorage.removeItem('auth_token')
    
    try {
      const userStore = useUserStore()
      userStore.clearAuth()
      console.log('✅ 用户数据已清除')
    } catch (error) {
      console.error('❌ 清除用户数据失败:', error)
    }
    
    console.groupEnd()
  }
}

// 在开发环境下添加到window对象
if (import.meta.env.DEV) {
  ;(window as any).userInfoDebug = UserInfoDebug
  console.log('🧪 用户信息调试工具已加载，使用 window.userInfoDebug 访问')
  console.log('📋 可用方法:')
  console.log('  - userInfoDebug.checkCurrentUser() - 检查当前用户信息')
  console.log('  - userInfoDebug.setupAdminUser() - 设置Admin用户数据')
  console.log('  - userInfoDebug.testUserDataFormats() - 测试用户数据格式')
  console.log('  - userInfoDebug.checkUserInfoDisplay() - 检查UserInfo组件显示')
  console.log('  - userInfoDebug.clearUserData() - 清除用户数据')
}
