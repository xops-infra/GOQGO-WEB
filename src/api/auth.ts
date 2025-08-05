import { post, get } from '@/utils/request'
import { mockAuthService } from '@/mock/services'
import { isMockMode, mockLogger } from '@/mock/config'
import type { User } from '@/types/api'

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  user: User
  token: string
}

export const authApi = {
  // 用户登录
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const mockEnabled = isMockMode()
    console.log('🎭 [Auth API] Mock状态检查:', {
      mockEnabled,
      credentials: credentials.username
    })
    
    if (mockEnabled) {
      mockLogger.info('使用Mock登录服务', credentials.username)
      return await mockAuthService.login(credentials)
    }
    
    console.log('🌐 [Auth API] 使用真实API登录')
    const response = await post('/auth/login', credentials)
    return response.data
  },

  // 验证token
  async verifyToken(token: string): Promise<User> {
    if (isMockMode()) {
      mockLogger.info('使用Mock验证Token')
      return await mockAuthService.verifyToken(token)
    }
    
    const response = await get('/auth/verify', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return response.data.user
  },

  // 用户登出
  async logout(): Promise<void> {
    if (isMockMode()) {
      mockLogger.info('使用Mock登出服务')
      await mockAuthService.logout()
      return
    }
    
    await post('/auth/logout', {})
  },

  // 刷新token
  async refreshToken(): Promise<{ token: string }> {
    if (isMockMode()) {
      mockLogger.info('使用Mock刷新Token')
      // Mock模式下返回新token
      return { token: `mock-token-refresh-${Date.now()}` }
    }
    
    const response = await post('/auth/refresh', {})
    return response.data
  },

  // 获取当前用户信息
  async getCurrentUser(): Promise<User> {
    if (isMockMode()) {
      mockLogger.info('使用Mock获取当前用户')
      return await mockAuthService.getCurrentUser()
    }
    
    const response = await get('/auth/me')
    return response.data.user
  }
}

export default authApi
