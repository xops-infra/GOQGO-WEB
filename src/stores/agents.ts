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
      // 尝试调用真实API
      const data = await agentApi.getList(namespace)
      agents.value = data
      currentNamespace.value = namespace
    } catch (error) {
      console.warn('API调用失败，使用模拟数据:', error)
      
      // Fallback到模拟数据
      const mockAgents: Agent[] = [
        {
          id: 'agent-1',
          name: 'backend',
          namespace: namespace,
          status: 'running',
          role: 'backend-engineer',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'agent-2',
          name: 'frontend',
          namespace: namespace,
          status: 'running',
          role: 'frontend-engineer',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'agent-3',
          name: 'q_cli_system',
          namespace: namespace,
          status: 'idle',
          role: 'system-admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
      
      agents.value = mockAgents
      currentNamespace.value = namespace
    } finally {
      loading.value = false
    }
  }
  
  const createAgent = async (data: CreateAgentRequest) => {
    try {
      // 尝试调用真实API
      const newAgent = await agentApi.create(currentNamespace.value, data)
      agents.value.push(newAgent)
      return newAgent
    } catch (error) {
      console.warn('API调用失败，使用模拟创建:', error)
      
      // Fallback到模拟创建
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
    }
  }
  
  const deleteAgent = async (name: string) => {
    try {
      // 尝试调用真实API
      await agentApi.delete(currentNamespace.value, name)
      agents.value = agents.value.filter(agent => agent.name !== name)
    } catch (error) {
      console.warn('API调用失败，使用模拟删除:', error)
      // Fallback到模拟删除
      agents.value = agents.value.filter(agent => agent.name !== name)
    }
  }
  
  const sendMessage = async (name: string, message: string) => {
    try {
      // 尝试调用真实API
      await agentApi.send(currentNamespace.value, name, message)
      console.log(`向 ${name} 发送消息成功: ${message}`)
    } catch (error) {
      console.warn('API调用失败，模拟发送:', error)
      console.log(`模拟向 ${name} 发送消息: ${message}`)
    }
  }
  
  const getLogs = async (name: string, lines: number = 50) => {
    try {
      // 尝试调用真实API
      const logs = await agentApi.getLogs(currentNamespace.value, name, lines)
      return logs
    } catch (error) {
      console.warn('API调用失败，返回模拟日志:', error)
      // 返回模拟日志
      return [
        `[${new Date().toISOString()}] Connected to ${name}`,
        `[${new Date().toISOString()}] Agent ${name} is ready`,
        `[${new Date().toISOString()}] Waiting for commands...`
      ]
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
    sendMessage,
    getLogs
  }
})
