import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { agentApi, type Agent, type CreateAgentRequest } from '@/api/agents'
import { useNamespacesStore } from './namespaces'

export const useAgentsStore = defineStore('agents', () => {
  // 状态
  const agents = ref<Agent[]>([])
  const loading = ref(false)
  const selectedAgent = ref<Agent | null>(null)
  
  // 获取namespaces store
  const namespacesStore = useNamespacesStore()
  
  // 计算属性
  const runningAgents = computed(() => 
    agents.value.filter(agent => agent.status === 'running')
  )
  
  const agentsByStatus = computed(() => {
    const groups = {
      running: [] as Agent[],
      idle: [] as Agent[],
      error: [] as Agent[],
      Creating: [] as Agent[],
      Terminating: [] as Agent[]
    }
    
    agents.value.forEach(agent => {
      if (groups[agent.status as keyof typeof groups]) {
        groups[agent.status as keyof typeof groups].push(agent)
      }
    })
    
    return groups
  })

  // 监听namespace变化的处理函数
  const handleNamespaceChange = async (event: CustomEvent) => {
    const { namespace } = event.detail
    console.log(`Agents store: 检测到namespace变化为 ${namespace}`)
    await fetchAgents(namespace)
  }
  
  // 方法
  const fetchAgents = async (namespace?: string) => {
    const targetNamespace = namespace || namespacesStore.currentNamespace
    loading.value = true
    try {
      // 尝试调用真实API
      const data = await agentApi.getList(targetNamespace)
      // API返回的是 { items: Agent[] } 格式
      agents.value = data.items || []
      console.log(`获取到 ${targetNamespace} 命名空间下的 ${agents.value.length} 个agents`)
      
      // 自动选择第一个agent
      if (agents.value.length > 0) {
        const firstAgent = agents.value[0]
        selectedAgent.value = firstAgent
        console.log(`🎯 自动选择第一个agent: ${firstAgent.name}`)
      } else {
        selectedAgent.value = null
        console.log('📭 没有可用的agents')
      }
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
      
      // 自动选择第一个模拟agent
      if (mockAgents.length > 0) {
        selectedAgent.value = mockAgents[0]
        console.log(`🎯 自动选择第一个模拟agent: ${mockAgents[0].name}`)
      }
    } finally {
      loading.value = false
    }
  }

  const createAgent = async (data: CreateAgentRequest) => {
    loading.value = true
    try {
      // 尝试调用真实API
      const newAgent = await agentApi.create(data.namespace, data)
      agents.value.push(newAgent)
      
      // 自动选择新创建的agent
      selectedAgent.value = newAgent
      console.log(`🎯 自动选择新创建的agent: ${newAgent.name}`)
      
      // 刷新namespace数据以更新agent计数
      await namespacesStore.refreshNamespaces()
      
      return newAgent
    } catch (error) {
      console.error('创建Agent失败:', error)
      
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
      
      // 自动选择新创建的模拟agent
      selectedAgent.value = newAgent
      console.log(`🎯 自动选择新创建的模拟agent: ${newAgent.name}`)
      
      return newAgent
    } finally {
      loading.value = false
    }
  }

  const deleteAgent = async (namespace: string, name: string) => {
    loading.value = true
    try {
      await agentApi.delete(namespace, name)
      
      // 从本地列表移除
      agents.value = agents.value.filter(agent => agent.name !== name)
      
      // 智能选择下一个agent
      if (selectedAgent.value?.name === name) {
        if (agents.value.length > 0) {
          selectedAgent.value = agents.value[0]
          console.log(`🎯 删除后自动选择第一个agent: ${agents.value[0].name}`)
        } else {
          selectedAgent.value = null
          console.log('📭 删除后没有可用的agents')
        }
      }
      
      // 刷新namespace数据以更新agent计数
      await namespacesStore.refreshNamespaces()
      
      console.log(`Agent ${name} 删除成功`)
    } catch (error) {
      console.error('删除Agent失败:', error)
      
      // Fallback到模拟删除
      agents.value = agents.value.filter(agent => agent.name !== name)
      
      // 智能选择下一个agent
      if (selectedAgent.value?.name === name) {
        if (agents.value.length > 0) {
          selectedAgent.value = agents.value[0]
          console.log(`🎯 删除后自动选择第一个模拟agent: ${agents.value[0].name}`)
        } else {
          selectedAgent.value = null
          console.log('📭 删除后没有可用的agents')
        }
      }
      
      console.log(`Agent ${name} 删除成功 (模拟)`)
    } finally {
      loading.value = false
    }
  }

  const sendMessage = async (namespace: string, name: string, message: string) => {
    try {
      await agentApi.send(namespace, name, message)
      console.log(`消息已发送给 ${name}: ${message}`)
    } catch (error) {
      console.error('发送消息失败:', error)
      throw error
    }
  }

  const getLogs = async (name: string, lines: number = 50) => {
    try {
      const logs = await agentApi.getLogs(namespacesStore.currentNamespace, name, lines)
      return logs
    } catch (error) {
      console.error('获取日志失败:', error)
      // 返回模拟日志
      return [
        `[${new Date().toISOString()}] Agent ${name} started`,
        `[${new Date().toISOString()}] Role: ${selectedAgent.value?.role || 'unknown'}`,
        `[${new Date().toISOString()}] Status: ${selectedAgent.value?.status || 'unknown'}`
      ]
    }
  }

  const selectAgent = (agent: Agent) => {
    selectedAgent.value = agent
  }

  const clearSelection = () => {
    selectedAgent.value = null
  }

  // 刷新agents列表
  const refreshAgents = async () => {
    await fetchAgents()
  }

  // 设置事件监听器
  const setupEventListeners = () => {
    window.addEventListener('namespace-changed', handleNamespaceChange as EventListener)
  }

  // 清理事件监听器
  const cleanupEventListeners = () => {
    window.removeEventListener('namespace-changed', handleNamespaceChange as EventListener)
  }

  return {
    // 状态
    agents,
    loading,
    selectedAgent,
    
    // 计算属性
    runningAgents,
    agentsByStatus,
    
    // 方法
    fetchAgents,
    createAgent,
    deleteAgent,
    sendMessage,
    getLogs,
    selectAgent,
    clearSelection,
    refreshAgents,
    setupEventListeners,
    cleanupEventListeners
  }
})
