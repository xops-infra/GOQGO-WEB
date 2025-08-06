import { post, get } from '@/utils/request'
import { API_ENDPOINTS } from '@/config/api'
import { mockAuthService } from '@/mock/services'
import { isMockMode, mockLogger } from '@/mock/config'
import type { User } from '@/types/api'

// 根据最新swagger文档更新登录请求类型
export interface LoginRequest {
  username?: string  // 密码登录时需要
  password?: string  // 密码登录
  token?: string     // token登录（用户预设的token）
}

// 根据最新swagger文档更新登录响应类型
export interface LoginResponse {
  success: boolean
  message: string
  bearer_token: string  // 临时访问token
  displayName: string
  email: string
  user?: User  // 可选，用于调试
}

export const authApi = {
  // 主要登录接口 - 使用 /users/login
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const mockEnabled = isMockMode()
    console.log('🎭 [Auth API] Mock状态检查:', {
      mockEnabled,
      credentials: credentials.username || 'token登录'
    })
    
    if (mockEnabled) {
      mockLogger.info('使用Mock登录服务', credentials.username || 'token登录')
      // 适配Mock服务的返回格式
      const mockResult = await mockAuthService.login({
        username: credentials.username || '',
        password: credentials.password || ''
      })
      return {
        success: true,
        message: '登录成功',
        bearer_token: mockResult.token,
        displayName: mockResult.user.displayName || mockResult.user.username,
        email: mockResult.user.email || '',
        user: mockResult.user
      }
    }
    
    console.log('🌐 [Auth API] 使用真实API登录')
    // 使用新的统一登录接口
    const response = await post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials)
    return response
  },

  // 兼容性登录接口 - 使用 /users/{username}/login
  async loginWithUsername(username: string, credentials: LoginRequest): Promise<LoginResponse> {
    if (isMockMode()) {
      mockLogger.info('使用Mock用户名登录服务', username)
      return await this.login({ ...credentials, username })
    }
    
    const response = await post<LoginResponse>(API_ENDPOINTS.AUTH.USER_LOGIN(username), credentials)
    return response
  },

  // Token登录 - 直接使用token登录
  async loginWithToken(token: string): Promise<LoginResponse> {
    return await this.login({ token })
  },

  // 密码登录 - 使用用户名和密码登录
  async loginWithPassword(username: string, password: string): Promise<LoginResponse> {
    return await this.login({ username, password })
  },

  // 验证token - 使用/me接口
  async verifyToken(token: string): Promise<User> {
    if (isMockMode()) {
      mockLogger.info('使用Mock验证Token')
      return await mockAuthService.verifyToken(token)
    }
    
    const response = await get(API_ENDPOINTS.SYSTEM.ME, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return response.user || response
  },

  // 用户登出 - 根据swagger文档更新
  async logout(username: string): Promise<void> {
    if (isMockMode()) {
      mockLogger.info('使用Mock登出服务')
      await mockAuthService.logout()
      return
    }
    
    await post(API_ENDPOINTS.AUTH.USER_LOGOUT(username))
  },

  // 获取当前用户信息
  async getCurrentUser(): Promise<User> {
    if (isMockMode()) {
      mockLogger.info('使用Mock获取当前用户')
      return await mockAuthService.getCurrentUser()
    }
    
    const response = await get(API_ENDPOINTS.SYSTEM.ME)
    return response.user || response
  }
}

export default authApi
