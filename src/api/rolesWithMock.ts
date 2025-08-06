import { rolesApi } from './roles'
import { mockRoleService } from '@/mock/services'
import { isMockMode, mockLogger } from '@/mock/config'
import type { Role, RolesResponse } from '@/types/api'

/**
 * 带Mock支持的角色API
 */
export const rolesApiWithMock = {
  /**
   * 获取所有角色列表
   */
  async getList(): Promise<RolesResponse> {
    if (isMockMode()) {
      mockLogger.info('使用Mock获取角色列表')
      return await mockRoleService.getList()
    }
    return await rolesApi.getList()
  },

  /**
   * 获取单个角色信息
   */
  async getRole(roleName: string): Promise<Role> {
    if (isMockMode()) {
      mockLogger.info('使用Mock获取角色信息', { roleName })
      return await mockRoleService.getRole(roleName)
    }
    return await rolesApi.getRole(roleName)
  },

  /**
   * 获取角色显示名称
   */
  async getRoleDisplayName(roleName: string): Promise<string> {
    if (isMockMode()) {
      mockLogger.info('使用Mock获取角色显示名称', { roleName })
      return await mockRoleService.getRoleDisplayName(roleName)
    }
    return await rolesApi.getRoleDisplayName(roleName)
  },

  /**
   * 检查角色是否存在
   */
  async checkRoleExists(roleName: string): Promise<boolean> {
    if (isMockMode()) {
      mockLogger.info('使用Mock检查角色是否存在', { roleName })
      return await mockRoleService.checkRoleExists(roleName)
    }
    return await rolesApi.checkRoleExists(roleName)
  }
}
