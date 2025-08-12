import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { agentApi, type Agent, type CreateAgentRequest } from '@/api/agents'
import { webSocketAgentStatusService, initializeAgentStatusService, type AgentStatusCallbacks } from '@/services/webSocketAgentService'
import { useNamespacesStore } from './namespaces'
import { authManager } from '@/utils/auth'
import { useUserStore } from './user'

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
  const userStore = useUserStore()

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

  // 初始化 WebSocket Agent 服务
  const initializeWebSocketService = async (namespace: string) => {
    if (!useWebSocket.value) return

    const callbacks: AgentOperationCallbacks = {
      onAgentCreated: (agent: Agent) => {
        console.log('🎉 Agent 创建成功:', agent)
        agents.value.push(agent)
      },
      
      onAgentUpdated: (agent: Agent) => {
        console.log('🔄 Agent 更新:', agent)
        const index = agents.value.findIndex(a => a.name === agent.name)
        if (index !== -1) {
          agents.value[index] = agent
        }
      },
      
      onAgentDeleted: (agentName: string) => {
        console.log('🗑️ Agent 删除:', agentName)
        const index = agents.value.findIndex(a => a.name === agentName)
        if (index !== -1) {
          agents.value.splice(index, 1)
        }
      },
      
      onAgentRestarted: (agent: Agent) => {
        console.log('🔄 Agent 重启:', agent)
        const index = agents.value.findIndex(a => a.name === agent.name)
        if (index !== -1) {
          agents.value[index] = agent
        }
      },
      
      onAgentStatusChanged: (agentName: string, status: string) => {
        console.log('📊 Agent 状态变更:', agentName, status)
        const agent = agents.value.find(a => a.name === agentName)
        if (agent) {
          agent.status = status as any
        }
      },
      
      onAgentListUpdated: (updatedAgents: Agent[]) => {
        console.log('📋 Agent 列表更新:', updatedAgents.length)
        // 只在WebSocket可用且数据有效时更新整个列表
        if (useWebSocket.value && Array.isArray(updatedAgents)) {
          agents.value = updatedAgents
        }
      },
      
      onError: (error: string) => {
        console.error('❌ WebSocket Agent 操作错误:', error)
        // WebSocket错误时回退到REST API模式
        useWebSocket.value = false
      }
    }

    try {
      await initializeWebSocketAgentService(namespace, callbacks)
      console.log('✅ WebSocket Agent 服务初始化完成，将用于状态更新')
    } catch (error) {
      console.error('❌ WebSocket Agent 服务初始化失败，回退到 REST API:', error)
      useWebSocket.value = false
    }
  }

  // 监听namespace变化的处理函数
  const handleNamespaceChange = async (event: CustomEvent) => {
    const { namespace } = event.detail
    console.log(`Agents store: 检测到namespace变化为 ${namespace}`)
    
    // 初始化 WebSocket 服务
    await initializeWebSocketService(namespace)
    
    // 获取 agents 列表
    await fetchAgents(namespace)
  }

  // 方法
  const fetchAgents = async (namespace?: string) => {
    const targetNamespace = namespace || namespacesStore.currentNamespace
    console.log('🔍 开始获取agents:', { targetNamespace, loading: loading.value })

    // 如果正在加载中，直接返回，避免重复请求
    if (loading.value) {
      console.log('⏳ 已有请求正在进行中，跳过重复请求')
      return Promise.resolve()
    }

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
    loading.value = true
    fetchController = new AbortController()

    try {
      // 检查用户认证状态
      const isAuth = userStore.isAuthenticated
      if (!isAuth) {
        console.warn('🔒 用户未认证，跳过agents获取')
        agents.value = []
        selectedAgent.value = null
        loading.value = false
        return
      }

      console.log(`📡 获取agents (namespace: ${targetNamespace})`)

      // 只使用 REST API 获取数据，WebSocket 仅用于状态通知
      const apiResponse = await agentApi.getList(targetNamespace, fetchController?.signal)
      const data = apiResponse.items || []
      console.log('✅ REST API 获取 agents 成功:', data)

      // 确保data是数组
      if (!Array.isArray(data)) {
        console.warn('⚠️ API返回的数据不是数组格式，转换为空数组:', data)
        data = []
      }

      // 获取当前用户名
      const currentUsername = userStore.username
      const isAdminUser = userStore.isAdmin
      
      // 过滤agents：如果不是管理员，只显示当前用户的agents
      let filteredAgents = data
      if (!isAdminUser && currentUsername) {
        filteredAgents = filteredAgents.filter(agent => 
          agent.username && agent.username.toLowerCase() === currentUsername.toLowerCase()
        )
        console.log(`🔍 非管理员用户，过滤后剩余 ${filteredAgents.length} 个agents`)
      }
      
      // 替换agents数据，确保只显示当前namespace的agents
      agents.value = filteredAgents
      
      console.log(`📊 获取到 ${targetNamespace} 命名空间下的 ${filteredAgents.length} 个agents`)

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
        workDir: data.workDir || data.workingDir || './', // 支持两种格式，优先使用workDir
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
      const logs = await agentApi.getLogs(namespacesStore.currentNamespace, name, { lines })
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

  // 刷新agents列表 - 强制使用API刷新
  const refreshAgents = async () => {
    console.log('🔄 强制刷新agents列表，使用API')
    // 临时禁用WebSocket，强制使用API刷新
    const wasWebSocketEnabled = useWebSocket.value
    useWebSocket.value = false
    
    try {
      await fetchAgents()
    } finally {
      // 恢复WebSocket状态
      useWebSocket.value = wasWebSocketEnabled
    }
  }

  // 使用WebSocket进行实时更新
  const enableWebSocketUpdates = async () => {
    if (!useWebSocket.value) {
      console.log('🔄 启用WebSocket实时更新')
      useWebSocket.value = true
      await initializeWebSocketService(namespacesStore.currentNamespace)
    }
  }

  // 禁用WebSocket，仅使用API
  const disableWebSocketUpdates = () => {
    console.log('🔄 禁用WebSocket，仅使用API')
    useWebSocket.value = false
  }

  const clearAllAgents = () => {
    agents.value = []
    selectedAgent.value = null
    console.log('🧹 已清空所有agents数据')
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
    enableWebSocketUpdates,
    disableWebSocketUpdates,
    cleanup,
    setupEventListeners,
    cleanupEventListeners
  }
})
