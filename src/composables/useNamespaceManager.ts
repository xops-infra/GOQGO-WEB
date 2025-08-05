import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useMessage } from 'naive-ui'
import { useNamespacesStore } from '@/stores/namespaces'
import { useAgentsStore } from '@/stores/agents'
import type { Namespace } from '@/types/api'

export function useNamespaceManager() {
  const message = useMessage()
  const namespacesStore = useNamespacesStore()
  const agentsStore = useAgentsStore()

  const { namespaces, currentNamespace } = storeToRefs(namespacesStore)
  const { agents } = storeToRefs(agentsStore)

  // 计算属性
  const agentCount = computed(() => {
    if (!currentNamespace.value) return 0
    return agents.value.filter(agent => 
      agent.namespace === currentNamespace.value
    ).length
  })

  // 方法
  const handleNamespaceSelect = async (namespaceName: string) => {
    try {
      await namespacesStore.switchNamespace(namespaceName)
      await agentsStore.fetchAgents(namespaceName)
      message.success(`已切换到命名空间: ${namespaceName}`)
    } catch (error: any) {
      console.error('切换命名空间失败:', error)
      message.error(`切换失败: ${error.message}`)
    }
  }

  const handleNamespaceCreated = async (namespace: Namespace) => {
    try {
      await namespacesStore.createNamespace(namespace)
      message.success(`命名空间 ${namespace.name} 创建成功`)
      await refreshNamespaces()
    } catch (error: any) {
      console.error('创建命名空间失败:', error)
      message.error(`创建失败: ${error.message}`)
    }
  }

  const handleNamespaceUpdated = async (namespace: Namespace) => {
    try {
      await namespacesStore.updateNamespace(namespace)
      message.success(`命名空间 ${namespace.name} 更新成功`)
      await refreshNamespaces()
    } catch (error: any) {
      console.error('更新命名空间失败:', error)
      message.error(`更新失败: ${error.message}`)
    }
  }

  const handleNamespaceDeleted = async (namespaceName: string) => {
    try {
      await namespacesStore.deleteNamespace(namespaceName)
      message.success(`命名空间 ${namespaceName} 删除成功`)
      
      // 如果删除的是当前命名空间，切换到默认命名空间
      if (currentNamespace.value === namespaceName) {
        await handleNamespaceSelect('default')
      }
      
      await refreshNamespaces()
    } catch (error: any) {
      console.error('删除命名空间失败:', error)
      message.error(`删除失败: ${error.message}`)
    }
  }

  const refreshNamespaces = async () => {
    try {
      await namespacesStore.fetchNamespaces()
    } catch (error: any) {
      console.error('刷新命名空间列表失败:', error)
      message.error('刷新失败')
    }
  }

  return {
    // 计算属性
    agentCount,
    
    // 方法
    handleNamespaceSelect,
    handleNamespaceCreated,
    handleNamespaceUpdated,
    handleNamespaceDeleted,
    refreshNamespaces
  }
}

export default useNamespaceManager
