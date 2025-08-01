import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { agentApi, type Agent, type CreateAgentRequest } from '@/api/agents'
import { useNamespacesStore } from './namespaces'
import { authManager } from '@/utils/auth'

export const useAgentsStore = defineStore('agents', () => {
  // 状态
  const agents = ref<Agent[]>([])
  const loading = ref(false)
  const selectedAgent = ref<Agent | null>(null)

  // 请求控制
  let fetchController: AbortController | null = null
  let fetchTimeout: NodeJS.Timeout | null = null

  // 获取namespaces store
  const namespacesStore = useNamespacesStore()

  // 计算属性
  const runningAgents = computed(() => agents.value.filter((agent) => agent.status === 'running'))

  const hasAgents = computed(() => agents.value.length > 0)

  const agentsByStatus = computed(() => {
    const groups = {
      running: [] as Agent[],
      idle: [] as Agent[],
      error: [] as Agent[],
      Creating: [] as Agent[],
      Terminating: [] as Agent[]
    }

    agents.value.forEach((agent) => {
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
    console.log('🔍 开始获取agents:', { targetNamespace, loading: loading.value })

    // 取消之前的请求
    if (fetchController) {
      fetchController.abort()
      console.log('🚫 取消之前的请求')
    }

    // 清除之前的防抖定时器
    if (fetchTimeout) {
      clearTimeout(fetchTimeout)
    }

    // 防抖处理：延迟300ms执行
    return new Promise<void>((resolve) => {
      fetchTimeout = setTimeout(async () => {
        await performFetch(targetNamespace)
        resolve()
      }, 300)
    })
  }

  const performFetch = async (targetNamespace: string) => {
    // 创建新的请求控制器
    fetchController = new AbortController()
    
    loading.value = true
    try {
      // 检查认证状态
      const isAuth = authManager.isAuthenticated()
      const token = authManager.getToken()
      console.log('🔐 认证状态检查:', {
        isAuthenticated: isAuth,
        hasToken: !!token,
        tokenLength: token?.length || 0
      })

      if (!isAuth) {
        console.warn('🔒 用户未认证，跳过agents获取')
        agents.value = []
        selectedAgent.value = null
        loading.value = false
        return
      }

      console.log('📡 发送API请求获取agents...')
      // 尝试调用真实API，传入AbortController信号
      const data = await agentApi.getList(targetNamespace, fetchController?.signal)
      // API返回的是 { items: Agent[] } 格式
      console.log('✅ agentApi.getList 成功:', data)
      agents.value = data.items || []
      console.log(`📊 获取到 ${targetNamespace} 命名空间下的 ${agents.value.length} 个agents`)

      // 自动选择第一个agent
      if (agents.value.length > 0) {
        const firstAgent = agents.value[0]
        selectedAgent.value = firstAgent
        console.log(`🎯 自动选择第一个agent: ${firstAgent.name}`)
      } else {
        selectedAgent.value = null
        console.log('📭 暂无可用的agents实例')
      }
    } catch (error: any) {
      // 如果是请求取消，不需要处理为错误
      if (error.name === 'CanceledError' || 
          error.code === 'ERR_CANCELED' || 
          error.name === 'AbortError') {
        console.log('🔄 请求被取消，可能是组件切换或重复请求')
        return
      }

      console.error('❌ 获取agents失败:', error)

      // 如果是认证错误，清空agents列表
      if (error.response?.status === 401) {
        console.warn('🔒 认证失败(401)，清空agents列表')
        agents.value = []
        selectedAgent.value = null
        loading.value = false
        return
      }

      // 其他错误也清空agents列表，不使用模拟数据
      console.error('💥 API调用失败，暂无agents实例')
      agents.value = []
      selectedAgent.value = null
    } finally {
      loading.value = false
      fetchController = null // 清理请求控制器
      console.log('🏁 performFetch 完成')
    }
  }
  const createAgent = async (namespace: string, data: any) => {
    loading.value = true
    try {
      console.log('🚀 创建Agent:', { namespace, data })

      // 构建创建请求数据，使用后端API格式
      const createRequest = {
        name: data.name || `agent-${Date.now()}`,
        role: data.role || 'general-assistant',
        workDir: data.workDir || './', // 使用后端支持的workDir字段
        namespace: namespace,
        context: data.context || undefined,
        env: data.env || undefined
      }

      // 调用真实API
      const newAgent = await agentApi.create(namespace, createRequest)
      agents.value.push(newAgent)

      // 自动选择新创建的agent
      selectedAgent.value = newAgent
      console.log(`🎯 自动选择新创建的agent: ${newAgent.name}`)

      // 刷新namespace数据以更新agent计数
      await namespacesStore.refreshNamespaces()

      return newAgent
    } catch (error) {
      console.error('创建Agent失败:', error)
      throw error // 直接抛出错误，不使用模拟数据
    } finally {
      loading.value = false
    }
  }

  const restartAgent = async (namespace: string, name: string) => {
    loading.value = true
    try {
      // 调用真实API
      await agentApi.restart(namespace, name)

      // 更新本地状态
      const agent = agents.value.find((a) => a.name === name)
      if (agent) {
        agent.status = 'Creating'
        agent.restartCount = (agent.restartCount || 0) + 1
      }

      // 等待一段时间后刷新状态
      setTimeout(async () => {
        await fetchAgents()
      }, 2000)

      console.log(`Agent ${name} 重启成功`)
    } catch (error) {
      console.error('重启Agent失败:', error)
      throw error // 直接抛出错误，不使用模拟数据
    } finally {
      loading.value = false
    }
  }

  const deleteAgent = async (namespace: string, name: string) => {
    loading.value = true
    try {
      await agentApi.delete(namespace, name)

      // 从本地列表移除
      agents.value = agents.value.filter((agent) => agent.name !== name)

      // 智能选择下一个agent
      if (selectedAgent.value?.name === name) {
        if (agents.value.length > 0) {
          selectedAgent.value = agents.value[0]
          console.log(`🎯 删除后自动选择第一个agent: ${agents.value[0].name}`)
        } else {
          selectedAgent.value = null
          console.log('📭 删除后暂无可用的agents实例')
        }
      }

      // 刷新namespace数据以更新agent计数
      await namespacesStore.refreshNamespaces()

      console.log(`Agent ${name} 删除成功`)
    } catch (error) {
      console.error('删除Agent失败:', error)
      throw error // 直接抛出错误，不使用模拟数据
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

  // 事件监听器引用
  let namespaceChangeHandler: ((event: CustomEvent) => void) | null = null

  // 设置事件监听器
  const setupEventListeners = () => {
    // 监听namespace变化事件
    namespaceChangeHandler = async (event: CustomEvent) => {
      const { namespace } = event.detail
      console.log('🔄 Agents store收到namespace变化事件:', namespace)

      try {
        // 清空当前agents列表
        agents.value = []
        selectedAgent.value = null

        // 重新获取新namespace下的agents
        await fetchAgents()
        console.log('✅ 已更新agents列表')
      } catch (error) {
        console.error('❌ 更新agents列表失败:', error)
      }
    }

    // 添加事件监听器
    window.addEventListener('namespace-changed', namespaceChangeHandler as EventListener)
    console.log('✅ Agents store事件监听器已设置')
  }

  // 清理事件监听器
  const cleanupEventListeners = () => {
    if (namespaceChangeHandler) {
      window.removeEventListener('namespace-changed', namespaceChangeHandler as EventListener)
      namespaceChangeHandler = null
      console.log('🧹 Agents store事件监听器已清理')
    }
  }

  const clearSelection = () => {
    selectedAgent.value = null
  }

  // 刷新agents列表
  const refreshAgents = async () => {
    await fetchAgents()
  }

  // 清理函数，用于组件卸载时调用
  const cleanup = () => {
    if (fetchController) {
      fetchController.abort()
      fetchController = null
    }
    if (fetchTimeout) {
      clearTimeout(fetchTimeout)
      fetchTimeout = null
    }
  }

  return {
    // 状态
    agents,
    loading,
    selectedAgent,

    // 计算属性
    runningAgents,
    hasAgents,
    agentsByStatus,

    // 方法
    fetchAgents,
    createAgent,
    deleteAgent,
    restartAgent,
    sendMessage,
    getLogs,
    selectAgent,
    clearSelection,
    refreshAgents,
    cleanup,
    setupEventListeners,
    cleanupEventListeners
  }
})
