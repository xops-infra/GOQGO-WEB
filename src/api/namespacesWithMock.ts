import { namespaceApi } from './namespaces'
import { mockNamespaceService } from '@/mock/services'
import { isMockMode, mockLogger } from '@/mock/config'
import type { Namespace, NamespaceList, CreateNamespaceRequest } from './namespaces'

// 重新导出类型
export type { Namespace, NamespaceList, CreateNamespaceRequest }

/**
 * 带Mock支持的命名空间API
 */
export const namespaceApiWithMock = {
  /**
   * 获取命名空间列表
   */
  async getList(): Promise<NamespaceList> {
    if (isMockMode()) {
      mockLogger.info('使用Mock获取命名空间列表')
      return await mockNamespaceService.getList()
    }
    return await namespaceApi.getList()
  },

  /**
   * 获取单个命名空间
   */
  async get(name: string): Promise<Namespace> {
    if (isMockMode()) {
      mockLogger.info('使用Mock获取命名空间', { name })
      return await mockNamespaceService.get(name)
    }
    return await namespaceApi.get(name)
  },

  /**
   * 创建命名空间
   */
  async create(data: any): Promise<Namespace> {
    if (isMockMode()) {
      mockLogger.info('使用Mock创建命名空间', { data })
      return await mockNamespaceService.create(data)
    }
    return await namespaceApi.create(data)
  },

  /**
   * 更新命名空间
   */
  async update(name: string, data: any): Promise<Namespace> {
    if (isMockMode()) {
      mockLogger.info('使用Mock更新命名空间', { name, data })
      return await mockNamespaceService.update(name, data)
    }
    return await namespaceApi.update(name, data)
  },

  /**
   * 删除命名空间
   */
  async delete(name: string): Promise<void> {
    if (isMockMode()) {
      mockLogger.info('使用Mock删除命名空间', { name })
      return await mockNamespaceService.delete(name)
    }
    return await namespaceApi.delete(name)
  }
}
