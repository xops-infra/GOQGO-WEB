// 用户信息显示修复脚本
import { useUserStore } from '@/stores/user'
import { autoFixUserData } from '@/utils/fixUserData'

export class UserDisplayFix {
  // 修复当前用户显示信息
  static fixCurrentUserDisplay() {
    console.group('🔧 修复用户显示信息')
    
    try {
      const userStore = useUserStore()
      
      console.log('修复前的用户信息:')
      console.log('- currentUser:', userStore.currentUser)
      console.log('- displayName:', userStore.displayName)
      
      // 检查localStorage中的用户数据
      const savedUser = localStorage.getItem('goqgo_user')
      if (!savedUser) {
        console.log('❌ 没有找到保存的用户数据')
        return
      }
      
      const userData = JSON.parse(savedUser)
      console.log('localStorage中的原始数据:', userData)
      
      // 如果用户名是admin但显示名不正确，进行修复
      if (userData.username === 'admin' && (!userData.displayName || userData.displayName === 'user')) {
        console.log('🔧 检测到admin用户显示名错误，进行修复...')
        
        // 修复用户数据
        const fixedUserData = {
          ...userData,
          displayName: userData.displayName || 'Administrator',
          username: 'admin'
        }
        
        console.log('修复后的数据:', fixedUserData)
        
        // 保存修复后的数据
        localStorage.setItem('goqgo_user', JSON.stringify(fixedUserData))
        
        // 更新store中的用户信息
        const fixedUser = autoFixUserData(fixedUserData)
        userStore.setUser(fixedUser)
        
        console.log('✅ 用户信息已修复')
        console.log('修复后的用户信息:')
        console.log('- currentUser:', userStore.currentUser)
        console.log('- displayName:', userStore.displayName)
        
        // 触发UI更新
        setTimeout(() => {
          console.log('🔄 触发UI更新...')
          window.dispatchEvent(new Event('user-info-updated'))
        }, 100)
        
      } else {
        console.log('✅ 用户信息正常，无需修复')
      }
      
    } catch (error) {
      console.error('❌ 修复用户信息失败:', error)
    }
    
    console.groupEnd()
  }
  
  // 强制刷新用户信息
  static forceRefreshUserInfo() {
    console.group('🔄 强制刷新用户信息')
    
    try {
      const userStore = useUserStore()
      
      // 重新从localStorage恢复用户状态
      userStore.restoreAuth()
      
      console.log('✅ 用户信息已刷新')
      console.log('当前用户信息:')
      console.log('- currentUser:', userStore.currentUser)
      console.log('- displayName:', userStore.displayName)
      
      // 检查DOM更新
      setTimeout(() => {
        const userNameElement = document.querySelector('.user-name')
        if (userNameElement) {
          console.log('DOM中显示的用户名:', userNameElement.textContent)
        }
      }, 200)
      
    } catch (error) {
      console.error('❌ 刷新用户信息失败:', error)
    }
    
    console.groupEnd()
  }
  
  // 检查并修复admin用户
  static checkAndFixAdminUser() {
    console.group('🔧 检查并修复Admin用户')
    
    const savedUser = localStorage.getItem('goqgo_user')
    if (!savedUser) {
      console.log('❌ 没有找到用户数据')
      return
    }
    
    const userData = JSON.parse(savedUser)
    console.log('当前用户数据:', userData)
    
    // 检查是否是admin用户但显示错误
    if (userData.username === 'admin') {
      console.log('✅ 检测到admin用户')
      
      // 确保有正确的displayName
      if (!userData.displayName || userData.displayName === 'user' || userData.displayName === userData.username) {
        console.log('🔧 修复admin用户的displayName...')
        
        userData.displayName = 'Administrator'
        userData.role = 'admin'
        
        // 保存修复后的数据
        localStorage.setItem('goqgo_user', JSON.stringify(userData))
        
        // 刷新用户状态
        this.forceRefreshUserInfo()
        
        console.log('✅ Admin用户信息已修复')
      } else {
        console.log('✅ Admin用户信息正常')
      }
    } else {
      console.log('ℹ️ 当前不是admin用户，用户名:', userData.username)
    }
    
    console.groupEnd()
  }
  
  // 一键修复所有用户显示问题
  static fixAllUserDisplayIssues() {
    console.group('🛠️ 一键修复所有用户显示问题')
    
    console.log('开始全面检查和修复...')
    
    // 1. 检查并修复admin用户
    this.checkAndFixAdminUser()
    
    // 2. 修复当前用户显示信息
    setTimeout(() => {
      this.fixCurrentUserDisplay()
    }, 100)
    
    // 3. 强制刷新用户信息
    setTimeout(() => {
      this.forceRefreshUserInfo()
    }, 200)
    
    console.log('✅ 修复流程完成')
    console.groupEnd()
  }
}

// 在开发环境下添加到window对象
if (import.meta.env.DEV) {
  ;(window as any).userDisplayFix = UserDisplayFix
  console.log('🔧 用户显示修复工具已加载，使用 window.userDisplayFix 访问')
  console.log('📋 可用方法:')
  console.log('  - userDisplayFix.checkAndFixAdminUser() - 检查并修复Admin用户')
  console.log('  - userDisplayFix.fixCurrentUserDisplay() - 修复当前用户显示')
  console.log('  - userDisplayFix.forceRefreshUserInfo() - 强制刷新用户信息')
  console.log('  - userDisplayFix.fixAllUserDisplayIssues() - 一键修复所有问题')
}
