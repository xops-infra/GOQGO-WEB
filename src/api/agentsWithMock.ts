import { get, post, del } from '@/utils/request'
import { API_ENDPOINTS, buildWsUrl } from '@/config/api'
import { mockAgentService } from '@/mock/services'
import { isMockMode, mockLogger } from '@/mock/config'
import type { Agent } from '@/types/api'

export interface CreateAgentRequest {
  name: string
  namespace: string
  role: string
  config?: any
}

export const agentsApi = {
  // 获取Agent列表
  async getAgents(namespace?: string): Promise<Agent[]> {
    if (isMockMode()) {
      mockLogger.info('使用Mock获取Agent列表', { namespace })
      return await mockAgentService.getAgents(namespace)
    }

    try {
      const params = namespace ? { namespace } : {}
      const response = await get('/api/v1/agents', { params })
      
      // 处理响应数据格式
      if (response.data && Array.isArray(response.data.agents)) {
        return response.data.agents
      } else if (Array.isArray(response.data)) {
        return response.data
      } else {
        console.warn('Unexpected agents response format:', response.data)
        return []
      }
    } catch (error) {
      console.error('获取Agent列表失败:', error)
      throw error
    }
  },

  // 获取单个Agent详情
  async getAgent(id: string): Promise<Agent> {
    if (isMockMode()) {
      mockLogger.info('使用Mock获取Agent详情', { id })
      return await mockAgentService.getAgent(id)
    }

    try {
      const response = await get(`/api/v1/agents/${id}`)
      return response.data
    } catch (error) {
      console.error('获取Agent详情失败:', error)
      throw error
    }
  },

  // 创建Agent
  async createAgent(agentData: CreateAgentRequest): Promise<Agent> {
    if (isMockMode()) {
      mockLogger.info('使用Mock创建Agent', agentData)
      return await mockAgentService.createAgent(agentData)
    }

    try {
      const response = await post('/api/v1/agents', agentData)
      return response.data
    } catch (error) {
      console.error('创建Agent失败:', error)
      throw error
    }
  },

  // 更新Agent
  async updateAgent(id: string, updates: Partial<Agent>): Promise<Agent> {
    if (isMockMode()) {
      mockLogger.info('使用Mock更新Agent', { id, updates })
      return await mockAgentService.updateAgent(id, updates)
    }

    try {
      const response = await post(`/api/v1/agents/${id}`, updates)
      return response.data
    } catch (error) {
      console.error('更新Agent失败:', error)
      throw error
    }
  },

  // 删除Agent
  async deleteAgent(id: string): Promise<void> {
    if (isMockMode()) {
      mockLogger.info('使用Mock删除Agent', { id })
      await mockAgentService.deleteAgent(id)
      return
    }

    try {
      await del(`/api/v1/agents/${id}`)
    } catch (error) {
      console.error('删除Agent失败:', error)
      throw error
    }
  },

  // 重启Agent
  async restartAgent(id: string): Promise<Agent> {
    if (isMockMode()) {
      mockLogger.info('使用Mock重启Agent', { id })
      return await mockAgentService.restartAgent(id)
    }

    try {
      const response = await post(`/api/v1/agents/${id}/restart`, {})
      return response.data
    } catch (error) {
      console.error('重启Agent失败:', error)
      throw error
    }
  },

  // 停止Agent
  async stopAgent(id: string): Promise<Agent> {
    if (isMockMode()) {
      mockLogger.info('使用Mock停止Agent', { id })
      return await mockAgentService.stopAgent(id)
    }

    try {
      const response = await post(`/api/v1/agents/${id}/stop`, {})
      return response.data
    } catch (error) {
      console.error('停止Agent失败:', error)
      throw error
    }
  },

  // 批量操作Agent
  async batchOperation(operation: string, agentIds: string[]): Promise<void> {
    if (isMockMode()) {
      mockLogger.info('使用Mock批量操作Agent', { operation, agentIds })
      
      // 模拟批量操作
      for (const id of agentIds) {
        switch (operation) {
          case 'restart':
            await mockAgentService.restartAgent(id)
            break
          case 'stop':
            await mockAgentService.stopAgent(id)
            break
          case 'delete':
            await mockAgentService.deleteAgent(id)
            break
        }
      }
      return
    }

    try {
      await post('/api/v1/agents/batch', {
        operation,
        agent_ids: agentIds
      })
    } catch (error) {
      console.error('批量操作Agent失败:', error)
      throw error
    }
  }
}

export default agentsApi
