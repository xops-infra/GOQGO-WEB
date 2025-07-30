import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { agentApi } from '@/api/agents'
import { useNamespacesStore } from './namespaces'
import type { Agent, CreateAgentRequest } from '@/types/api'

export const useAgentsStore = defineStore('agents', () => {
  // 状态
  const agents = ref<Agent[]>([])
  const loading = ref(false)
  
  // 获取namespaces store
  const namespacesStore = useNamespacesStore()
  
  // 监听namespace变化，自动重新加载agents
  watch(
    () => namespacesStore.currentNamespace,
    (newNamespace) => {
      if (newNamespace) {
        fetchAgents(newNamespace)
      }
    }
  )
  
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
  const fetchAgents = async (namespace?: string) => {
    const targetNamespace = namespace || namespacesStore.currentNamespace
    loading.value = true
    try {
      // 尝试调用真实API
      const data = await agentApi.getList(targetNamespace)
      // API返回的是 { items: Agent[] } 格式
      agents.value = data.items || []
    } catch (error) {
      console.warn('API调用失败，使用模拟数据:', error)
      
      // Fallback到模拟数据
      const mockAgents: Agent[] = [
        {
          name: 'backend',
          namespace: targetNamespace,
          status: 'running',
          role: 'backend-engineer',
          age: '2h',
          workDir: './',
          sessionName: '',
          restartCount: 0
        },
        {
          name: 'frontend',
          namespace: targetNamespace,
          status: 'running',
          role: 'frontend-engineer',
          age: '1h',
          workDir: './',
          sessionName: '',
          restartCount: 0
        },
        {
          name: 'q_cli_system',
          namespace: targetNamespace,
          status: 'idle',
          role: 'system-admin',
          age: '30m',
          workDir: './',
          sessionName: '',
          restartCount: 0
        }
      ]
      
      agents.value = mockAgents
    } finally {
      loading.value = false
    }
  }
  
  const createAgent = async (data: CreateAgentRequest) => {
    try {
      // 尝试调用真实API
      const newAgent = await agentApi.create(namespacesStore.currentNamespace, data)
      agents.value.push(newAgent)
      return newAgent
    } catch (error) {
      console.warn('API调用失败，使用模拟创建:', error)
      
      // Fallback到模拟创建
      const newAgent: Agent = {
        name: data.name,
        namespace: data.namespace,
        status: 'running',
        role: data.role,
        age: '0s',
        workDir: data.workDir || './',
        sessionName: '',
        restartCount: 0
      }
      
      agents.value.push(newAgent)
      return newAgent
    }
  }
  
  const deleteAgent = async (name: string) => {
    try {
      // 尝试调用真实API
      await agentApi.delete(namespacesStore.currentNamespace, name)
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
      await agentApi.send(namespacesStore.currentNamespace, name, message)
      console.log(`向 ${name} 发送消息成功: ${message}`)
    } catch (error) {
      console.warn('API调用失败，模拟发送:', error)
      console.log(`模拟向 ${name} 发送消息: ${message}`)
    }
  }
  
  const getLogs = async (name: string, lines: number = 50) => {
    try {
      // 尝试调用真实API
      const logs = await agentApi.getLogs(namespacesStore.currentNamespace, name, lines)
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
