import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { agentApi } from '@/api/agents'
import type { Agent, CreateAgentRequest } from '@/types/api'

export const useAgentsStore = defineStore('agents', () => {
  // 状态
  const agents = ref<Agent[]>([])
  const loading = ref(false)
  const currentNamespace = ref('default')
  
  // 计算属性
  const runningAgents = computed(() => 
    agents.value.filter(agent => agent.status === 'running')
  )
  
  const agentsByRole = computed(() => {
    const grouped: Record<string, Agent[]> = {}
    agents.value.forEach(agent => {
      if (!grouped[agent.role]) {
        grouped[agent.role] = []
      }
      grouped[agent.role].push(agent)
    })
    return grouped
  })
  
  // 方法
  const fetchAgents = async (namespace: string = currentNamespace.value) => {
    loading.value = true
    try {
      // 模拟API调用，返回模拟数据
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockAgents: Agent[] = [
        {
          id: 'agent-1',
          name: 'frontend-dev',
          namespace: namespace,
          status: 'running',
          role: 'frontend-engineer',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'agent-2',
          name: 'backend-dev',
          namespace: namespace,
          status: 'idle',
          role: 'backend-engineer',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'agent-3',
          name: 'product-manager',
          namespace: namespace,
          status: 'running',
          role: 'product-manager',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
      
      agents.value = mockAgents
      currentNamespace.value = namespace
    } catch (error) {
      console.error('获取Agent列表失败:', error)
    } finally {
      loading.value = false
    }
  }
  
  const createAgent = async (data: CreateAgentRequest) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newAgent: Agent = {
        id: `agent-${Date.now()}`,
        name: data.name,
        namespace: data.namespace,
        status: 'running',
        role: data.role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      agents.value.push(newAgent)
      return newAgent
    } catch (error) {
      console.error('创建Agent失败:', error)
      throw error
    }
  }
  
  const deleteAgent = async (name: string) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      agents.value = agents.value.filter(agent => agent.name !== name)
    } catch (error) {
      console.error('删除Agent失败:', error)
      throw error
    }
  }
  
  const sendMessage = async (name: string, message: string) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      console.log(`向 ${name} 发送消息: ${message}`)
    } catch (error) {
      console.error('发送消息失败:', error)
      throw error
    }
  }
  
  return {
    // 状态
    agents,
    loading,
    currentNamespace,
    
    // 计算属性
    runningAgents,
    agentsByRole,
    
    // 方法
    fetchAgents,
    createAgent,
    deleteAgent,
    sendMessage
  }
})
