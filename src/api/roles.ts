import { get } from '@/utils/request'
import { API_ENDPOINTS } from '@/config/api'
import type { Role, RolesResponse } from '@/types/api'
import { rolesApiWithMock } from './rolesWithMock'

/**
 * 角色相关API
 */
export const rolesApi = {
  /**
   * 获取所有角色列表
   */
  async getList(): Promise<RolesResponse> {
    console.log('🎭 获取角色列表...')
    
    try {
      const response = await get<RolesResponse>(API_ENDPOINTS.ROLES.LIST)
      
      console.log('✅ 角色列表获取成功:', {
        total: response.total,
        rolesCount: response.roles?.length || 0
      })
      
      return response
    } catch (error: any) {
      console.error('❌ 获取角色列表失败:', error)
      throw new Error(error.message || '获取角色列表失败')
    }
  },

  /**
   * 获取单个角色信息
   * @param roleName 角色名称
   */
  async getRole(roleName: string): Promise<Role> {
    console.log('🎭 获取角色信息:', roleName)
    
    if (!roleName || typeof roleName !== 'string') {
      throw new Error('角色名称不能为空')
    }

    try {
      const response = await get<Role>(API_ENDPOINTS.ROLES.DETAIL(roleName))
      
      console.log('✅ 角色信息获取成功:', {
        name: response.name,
        displayName: response.displayName
      })
      
      return response
    } catch (error: any) {
      console.error('❌ 获取角色信息失败:', error)
      throw new Error(error.message || `获取角色 ${roleName} 信息失败`)
    }
  },

  /**
   * 根据角色名称获取显示名称
   * @param roleName 角色名称
   */
  async getRoleDisplayName(roleName: string): Promise<string> {
    try {
      const role = await this.getRole(roleName)
      return role.displayName || roleName
    } catch (error) {
      console.warn('⚠️ 获取角色显示名称失败，使用原名称:', roleName)
      return roleName
    }
  },

  /**
   * 检查角色是否存在
   * @param roleName 角色名称
   */
  async checkRoleExists(roleName: string): Promise<boolean> {
    try {
      await this.getRole(roleName)
      return true
    } catch (error) {
      return false
    }
  }
}

// 导出便捷方法
export const getRoles = () => rolesApiWithMock.getList()
export const getRole = (roleName: string) => rolesApiWithMock.getRole(roleName)
export const getRoleDisplayName = (roleName: string) => rolesApiWithMock.getRoleDisplayName(roleName)
export const checkRoleExists = (roleName: string) => rolesApiWithMock.checkRoleExists(roleName)

export default rolesApi
