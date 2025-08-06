import { ref, computed, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import { useAgentsStore } from '@/stores/agents'
import { useNamespacesStore } from '@/stores/namespaces'
import { useUserStore } from '@/stores/user'
import { rolesApiWithMock as rolesApi } from '@/api/rolesWithMock'
import type { Agent } from '@/types/api'

export function useAgentsView() {
  const message = useMessage()
  const agentsStore = useAgentsStore()
  const namespacesStore = useNamespacesStore()
  const userStore = useUserStore()

  // 响应式数据
  const selectedNamespace = ref('default')
  const usernameFilter = ref('')
  const roleFilter = ref('')
  const statusFilter = ref('')
  const selectedAgents = ref<Agent[]>([])
  const showCreateModal = ref(false)
  const showDetailsModal = ref(false)
  const showBatchActionModal = ref(false)
  const selectedAgentForDetails = ref<Agent | null>(null)
  const batchAction = ref('')
  const roles = ref<any[]>([])

  // 计算属性
  const namespaces = computed(() => namespacesStore.namespaces)

  const filteredAgents = computed(() => {
    let agents = agentsStore.agents

    // 命名空间过滤
    if (selectedNamespace.value && selectedNamespace.value !== 'all') {
      agents = agents.filter(agent => agent.namespace === selectedNamespace.value)
    }

    // 用户名过滤
    if (usernameFilter.value.trim()) {
      const filter = usernameFilter.value.toLowerCase()
      agents = agents.filter(agent => 
        agent.name.toLowerCase().includes(filter) ||
        agent.username?.toLowerCase().includes(filter)
      )
    }

    // 角色过滤
    if (roleFilter.value) {
      agents = agents.filter(agent => agent.role === roleFilter.value)
    }

    // 状态过滤
    if (statusFilter.value) {
      agents = agents.filter(agent => agent.status === statusFilter.value)
    }

    return agents
  })

  // 方法
  const refreshAgents = async () => {
    try {
      await agentsStore.fetchAgents(selectedNamespace.value)
      message.success('Agent列表已刷新')
    } catch (error) {
      console.error('刷新Agent列表失败:', error)
      message.error('刷新失败')
    }
  }

  const loadRoles = async () => {
    try {
      const rolesData = await rolesApi.getList()
      roles.value = rolesData
    } catch (error) {
      console.error('加载角色列表失败:', error)
    }
  }

  const handleAgentSelect = (agent: Agent, selected: boolean) => {
    if (selected) {
      if (!selectedAgents.value.find(a => a.name === agent.name)) {
        selectedAgents.value.push(agent)
      }
    } else {
      selectedAgents.value = selectedAgents.value.filter(a => a.name !== agent.name)
    }
  }

  const handleBatchAction = (action: string) => {
    if (selectedAgents.value.length === 0) {
      message.warning('请先选择要操作的Agent')
      return
    }

    batchAction.value = action
    showBatchActionModal.value = true
  }

  const handleAgentAction = async (action: string, agent: Agent) => {
    try {
      switch (action) {
        case 'view-details':
          selectedAgentForDetails.value = agent
          showDetailsModal.value = true
          break
        case 'restart':
          await agentsStore.restartAgent(agent.namespace, agent.name)
          message.success(`Agent ${agent.name} 重启成功`)
          break
        case 'stop':
          await agentsStore.stopAgent(agent.namespace, agent.name)
          message.success(`Agent ${agent.name} 停止成功`)
          break
        case 'delete':
          await agentsStore.deleteAgent(agent.namespace, agent.name)
          message.success(`Agent ${agent.name} 删除成功`)
          break
        case 'view-logs':
          // 打开日志查看器
          break
        default:
          console.warn('未知的Agent操作:', action)
      }
    } catch (error: any) {
      console.error(`Agent操作失败:`, error)
      message.error(`操作失败: ${error.message}`)
    }
  }

  const handleAgentCreated = (agent: Agent) => {
    message.success(`Agent ${agent.name} 创建成功`)
    refreshAgents()
  }

  const executeBatchAction = async () => {
    if (selectedAgents.value.length === 0) return

    try {
      const promises = selectedAgents.value.map(agent => {
        switch (batchAction.value) {
          case 'restart':
            return agentsStore.restartAgent(agent.namespace, agent.name)
          case 'stop':
            return agentsStore.stopAgent(agent.namespace, agent.name)
          case 'delete':
            return agentsStore.deleteAgent(agent.namespace, agent.name)
          default:
            return Promise.resolve()
        }
      })

      await Promise.all(promises)
      
      const actionText = {
        restart: '重启',
        stop: '停止',
        delete: '删除'
      }[batchAction.value] || '操作'

      message.success(`批量${actionText}完成`)
      selectedAgents.value = []
      showBatchActionModal.value = false
      refreshAgents()
    } catch (error: any) {
      console.error('批量操作失败:', error)
      message.error(`批量操作失败: ${error.message}`)
    }
  }

  // 生命周期
  onMounted(() => {
    loadRoles()
  })

  return {
    // 响应式数据
    selectedNamespace,
    usernameFilter,
    roleFilter,
    statusFilter,
    selectedAgents,
    showCreateModal,
    showDetailsModal,
    showBatchActionModal,
    selectedAgentForDetails,
    batchAction,
    roles,
    namespaces,
    
    // 计算属性
    filteredAgents,
    
    // 方法
    refreshAgents,
    loadRoles,
    handleAgentSelect,
    handleBatchAction,
    handleAgentAction,
    handleAgentCreated,
    executeBatchAction
  }
}

export default useAgentsView
