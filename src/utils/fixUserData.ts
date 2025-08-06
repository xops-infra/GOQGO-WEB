/**
 * 用户数据修复工具
 * 用于修复localStorage中缺少username字段的用户数据
 */

import type { User } from '@/types/api'

export interface OldUser {
  displayName: string
  email: string
  role?: string
}

export interface NewUser {
  username?: string
  displayName: string
  email: string
  role?: string
}

/**
 * 转换用户对象格式，确保兼容性
 */
export const autoFixUserData = (user: any): User => {
  // 如果已经是正确格式，直接返回
  if (user.id && user.username && user.email) {
    return user as User
  }

  // 处理旧格式或不完整的用户数据
  return {
    id: user.id || '1',
    username: user.username || user.name || 'user',
    displayName: user.displayName || user.username || user.name || '',
    email: user.email || 'user@example.com',
    role: user.role || 'user',
    avatar: user.avatar || '',
    createdAt: user.createdAt || new Date().toISOString(),
    updatedAt: user.updatedAt || new Date().toISOString()
  } as User
}

/**
 * 修复localStorage中的用户数据
 */
export const fixUserDataInStorage = (): boolean => {
  try {
    const savedUser = localStorage.getItem('goqgo_user')
    if (!savedUser) {
      console.log('🔧 [用户数据修复] 没有找到用户数据')
      return false
    }

    const userData = JSON.parse(savedUser) as OldUser
    console.log('🔧 [用户数据修复] 原始用户数据:', userData)

    // 检查是否已经有username字段
    if ((userData as NewUser).username) {
      console.log('🔧 [用户数据修复] 用户数据已包含username字段，无需修复')
      return false
    }

    // 添加username字段
    const fixedUserData: NewUser = {
      ...userData,
      username: userData.displayName?.toLowerCase() || ''
    }

    // 保存修复后的数据
    localStorage.setItem('goqgo_user', JSON.stringify(fixedUserData))
    
    console.log('🔧 [用户数据修复] 修复完成:', {
      原始数据: userData,
      修复后数据: fixedUserData
    })

    return true
  } catch (error) {
    console.error('🔧 [用户数据修复] 修复失败:', error)
    return false
  }
}

/**
 * 检查用户数据是否需要修复
 */
export const checkUserDataNeedsFix = (): boolean => {
  try {
    const savedUser = localStorage.getItem('goqgo_user')
    if (!savedUser) return false

    const userData = JSON.parse(savedUser)
    return !userData.username && userData.displayName
  } catch (error) {
    console.error('🔧 [用户数据检查] 检查失败:', error)
    return false
  }
}

/**
 * 自动修复localStorage中的用户数据（如果需要）
 */
export const autoFixUserDataInStorage = (): void => {
  if (checkUserDataNeedsFix()) {
    console.log('🔧 [用户数据修复] 检测到需要修复的用户数据，开始自动修复...')
    const fixed = fixUserDataInStorage()
    if (fixed) {
      console.log('🔧 [用户数据修复] 自动修复完成，请刷新页面')
      // 可以选择自动刷新页面
      // window.location.reload()
    }
  }
}
