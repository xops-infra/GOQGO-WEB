// Logout功能测试工具
import { logout } from './auth'
import { useUserStore } from '@/stores/user'

export class LogoutTest {
  // 测试logout路由
  static testLogoutRoute() {
    console.group('🧪 测试logout路由')
    
    console.log('当前路径:', window.location.pathname)
    console.log('当前认证状态:', {
      hasToken: !!localStorage.getItem('auth_token'),
      hasGoqgoToken: !!localStorage.getItem('goqgo_token'),
      hasUser: !!localStorage.getItem('goqgo_user')
    })
    
    // 跳转到logout路由
    console.log('跳转到 /logout 路由...')
    window.location.href = '/logout'
    
    console.groupEnd()
  }
  
  // 测试程序化logout
  static testProgrammaticLogout() {
    console.group('🧪 测试程序化logout')
    
    console.log('调用logout方法前的状态:')
    console.log('- localStorage tokens:', {
      auth_token: !!localStorage.getItem('auth_token'),
      goqgo_token: !!localStorage.getItem('goqgo_token'),
      goqgo_user: !!localStorage.getItem('goqgo_user')
    })
    
    try {
      const userStore = useUserStore()
      console.log('- userStore状态:', {
        isAuthenticated: userStore.isAuthenticated,
        currentUser: userStore.currentUser,
        token: !!userStore.token
      })
    } catch (error) {
      console.log('- userStore获取失败:', error)
    }
    
    // 执行logout
    console.log('执行logout...')
    logout()
    
    // 检查logout后的状态
    setTimeout(() => {
      console.log('logout后的状态:')
      console.log('- localStorage tokens:', {
        auth_token: !!localStorage.getItem('auth_token'),
        goqgo_token: !!localStorage.getItem('goqgo_token'),
        goqgo_user: !!localStorage.getItem('goqgo_user')
      })
      
      try {
        const userStore = useUserStore()
        console.log('- userStore状态:', {
          isAuthenticated: userStore.isAuthenticated,
          currentUser: userStore.currentUser,
          token: !!userStore.token
        })
      } catch (error) {
        console.log('- userStore获取失败:', error)
      }
      
      console.groupEnd()
    }, 100)
  }
  
  // 测试UserInfo组件的logout
  static testUserInfoLogout() {
    console.group('🧪 测试UserInfo组件logout')
    
    // 查找UserInfo组件中的logout按钮
    const userInfoElement = document.querySelector('.user-info')
    if (userInfoElement) {
      console.log('✅ 找到UserInfo组件')
      
      // 尝试触发下拉菜单
      const avatarContainer = userInfoElement.querySelector('.user-avatar-container')
      if (avatarContainer) {
        console.log('✅ 找到用户头像容器，尝试点击...')
        ;(avatarContainer as HTMLElement).click()
        
        setTimeout(() => {
          // 查找logout选项
          const logoutOption = document.querySelector('[data-key="logout"]')
          if (logoutOption) {
            console.log('✅ 找到logout选项')
          } else {
            console.log('❌ 未找到logout选项')
          }
        }, 500)
      } else {
        console.log('❌ 未找到用户头像容器')
      }
    } else {
      console.log('❌ 未找到UserInfo组件')
    }
    
    console.groupEnd()
  }
  
  // 模拟设置认证信息（用于测试）
  static setupTestAuth() {
    console.group('🧪 设置测试认证信息')
    
    const testToken = 'test-token-' + Date.now()
    const testUser = {
      id: 'test-user',
      username: 'testuser',
      displayName: '测试用户',
      email: 'test@example.com'
    }
    
    localStorage.setItem('goqgo_token', testToken)
    localStorage.setItem('goqgo_user', JSON.stringify(testUser))
    
    console.log('✅ 已设置测试认证信息:', {
      token: testToken,
      user: testUser
    })
    
    console.log('💡 现在可以测试logout功能了')
    console.groupEnd()
  }
}

// 在开发环境下添加到window对象
if (import.meta.env.DEV) {
  ;(window as any).logoutTest = LogoutTest
  console.log('🧪 Logout测试工具已加载，使用 window.logoutTest 访问')
  console.log('📋 可用方法:')
  console.log('  - logoutTest.testLogoutRoute() - 测试logout路由')
  console.log('  - logoutTest.testProgrammaticLogout() - 测试程序化logout')
  console.log('  - logoutTest.testUserInfoLogout() - 测试UserInfo组件logout')
  console.log('  - logoutTest.setupTestAuth() - 设置测试认证信息')
}
