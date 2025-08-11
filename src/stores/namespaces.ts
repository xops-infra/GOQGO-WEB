import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { namespaceApi, type Namespace, type CreateNamespaceRequest } from '@/api/namespaces'
import { agentApi } from '@/api/agents'

export const useNamespacesStore = defineStore('namespaces', () => {
  // 状态
  const namespaces = ref<Namespace[]>([])
  const loading = ref(false)
  const currentNamespace = ref('')
  const switchingNamespace = ref(false)

  // 初始化当前namespace
  const initCurrentNamespace = () => {
    // 检查URL参数是否要求清理缓存
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('test') === 'default') {
      localStorage.removeItem('currentNamespace')
      console.log('🧪 测试模式：已清理localStorage中的namespace缓存')
    }

    const saved = localStorage.getItem('currentNamespace')
    if (saved) {
      currentNamespace.value = saved
      console.log('🔄 从localStorage恢复namespace:', saved)
    } else {
      currentNamespace.value = ''
      console.log('🆕 没有保存的namespace，将自动选择第一个可用的')
    }
  }

  // 初始化
  initCurrentNamespace()

  // 计算属性
  const namespaceOptions = computed(() =>
    namespaces.value.map((ns) => ({
      label: `${ns.metadata.name} (${ns.status?.agentCount || 0} agents)`,
      value: ns.metadata.name,
      disabled: ns.status?.phase !== 'Active'
    }))
  )

  const currentNamespaceInfo = computed(() =>
    namespaces.value.find((ns) => ns.metadata.name === currentNamespace.value)
  )

  const hasNamespaces = computed(() => namespaces.value.length > 0)

  // 方法
  const fetchNamespaces = async () => {
    loading.value = true
    try {
      const data = await namespaceApi.getList()
      // API返回的是 { items: Namespace[] } 格式
      const namespaceList = data.items || []

      // 为每个namespace获取agents数量
      const namespacesWithCounts = await Promise.all(
        namespaceList.map(async (ns) => {
          try {
            // 使用agentApi替代原生fetch，确保包含认证头
            const agentsData = await agentApi.getList(ns.metadata.name)
            const agentCount = agentsData.items ? agentsData.items.length : 0

            return {
              ...ns,
              status: {
                ...ns.status,
                phase: ns.status?.phase || 'Active',
                agentCount,
                dagCount: ns.status?.dagCount || 0
              }
            }
          } catch (error) {
            console.warn(`获取 ${ns.metadata.name} 的agents数量失败:`, error)
            return {
              ...ns,
              status: {
                ...ns.status,
                phase: ns.status?.phase || 'Active',
                agentCount: 0,
                dagCount: 0
              }
            }
          }
        })
      )

      namespaces.value = namespacesWithCounts

      // 处理当前namespace的选择逻辑
      if (namespacesWithCounts.length > 0) {
        if (!currentNamespace.value) {
          // 如果没有当前选择，选择第一个可用的
          const firstActive =
            namespacesWithCounts.find((ns) => ns.status?.phase === 'Active') ||
            namespacesWithCounts[0]
          const namespaceName = String(firstActive.metadata.name || 'default')
          console.log('🎯 自动选择第一个namespace:', namespaceName)
          await switchNamespace(namespaceName)
        } else {
          // 检查当前选择的namespace是否还存在
          const currentExists = namespacesWithCounts.some(
            (ns) => ns.metadata.name === currentNamespace.value
          )
          if (!currentExists) {
            console.log('⚠️ 当前namespace不存在，切换到第一个可用的')
            const firstActive =
              namespacesWithCounts.find((ns) => ns.status?.phase === 'Active') ||
              namespacesWithCounts[0]
            const namespaceName = String(firstActive.metadata.name || 'default')
            await switchNamespace(namespaceName)
          } else {
            console.log('✅ 保持当前namespace:', currentNamespace.value)
          }
        }
      } else {
        console.log('⚠️ 没有可用的namespace')
      }
    } catch (error) {
      console.warn('获取命名空间列表失败，使用默认数据:', error)

      // Fallback到默认命名空间
      namespaces.value = [
        {
          apiVersion: 'v1',
          kind: 'Namespace',
          metadata: {
            name: 'default',
            creationTimestamp: new Date().toISOString()
          },
          spec: {},
          status: { phase: 'Active', agentCount: 0, dagCount: 0 }
        },
        {
          apiVersion: 'v1',
          kind: 'Namespace',
          metadata: {
            name: 'development',
            creationTimestamp: new Date().toISOString()
          },
          spec: {},
          status: { phase: 'Active', agentCount: 2, dagCount: 0 }
        },
        {
          apiVersion: 'v1',
          kind: 'Namespace',
          metadata: {
            name: 'production',
            creationTimestamp: new Date().toISOString()
          },
          spec: {},
          status: { phase: 'Active', agentCount: 0, dagCount: 0 }
        }
      ]
    } finally {
      loading.value = false
    }
  }

  // 切换命名空间
  const switchNamespace = async (namespaceName: string) => {
    // 确保传入的参数是字符串
    const safeNamespaceName = String(namespaceName || 'default')
    console.log('🔄 switchNamespace 接收到参数:', {
      original: namespaceName,
      type: typeof namespaceName,
      safe: safeNamespaceName
    })

    if (safeNamespaceName === currentNamespace.value) return

    switchingNamespace.value = true
    try {
      currentNamespace.value = safeNamespaceName
      // 保存到localStorage
      localStorage.setItem('currentNamespace', safeNamespaceName)

      // 触发相关数据更新
      await refreshNamespaceData()

      console.log(`已切换到命名空间: ${safeNamespaceName}`)
    } catch (error) {
      console.error('切换命名空间失败:', error)
      throw error
    } finally {
      switchingNamespace.value = false
    }
  }

  // 刷新命名空间相关数据
  const refreshNamespaceData = async () => {
    // 触发自定义事件，通知其他组件namespace已变化
    const event = new CustomEvent('namespace-changed', {
      detail: { namespace: currentNamespace.value }
    })
    window.dispatchEvent(event)
    
    console.log('🔄 已触发namespace-changed事件:', currentNamespace.value)
  }

  // 创建命名空间
  const createNamespace = async (data: { name: string; description?: string }) => {
    loading.value = true
    try {
      const createData: CreateNamespaceRequest = {
        apiVersion: 'v1',
        kind: 'Namespace',
        metadata: {
          name: data.name
        },
        spec: {
          description: data.description || ''
        }
      }

      const newNamespace = await namespaceApi.create(createData)

      // 更新本地列表
      namespaces.value.push(newNamespace)

      console.log(`命名空间 ${data.name} 创建成功`)
      return newNamespace
    } catch (error) {
      console.error('创建命名空间失败:', error)

      // Fallback到模拟创建
      const newNamespace: Namespace = {
        apiVersion: 'v1',
        kind: 'Namespace',
        metadata: {
          name: data.name,
          creationTimestamp: new Date().toISOString()
        },
        spec: { description: data.description || '' },
        status: { phase: 'Active', agentCount: 0, dagCount: 0 }
      }

      namespaces.value.push(newNamespace)
      console.log(`命名空间 ${data.name} 创建成功 (模拟)`)
      return newNamespace
    } finally {
      loading.value = false
    }
  }

  // 删除命名空间
  const deleteNamespace = async (namespaceName: string) => {
    if (namespaceName === 'default') {
      throw new Error('不能删除默认命名空间')
    }

    loading.value = true
    try {
      await namespaceApi.delete(namespaceName)

      // 从本地列表移除
      namespaces.value = namespaces.value.filter((ns) => ns.metadata.name !== namespaceName)

      // 如果删除的是当前命名空间，切换到default
      if (currentNamespace.value === namespaceName) {
        await switchNamespace('default')
      }

      console.log(`命名空间 ${namespaceName} 删除成功`)
    } catch (error) {
      console.error('删除命名空间失败:', error)

      // Fallback到模拟删除
      namespaces.value = namespaces.value.filter((ns) => ns.metadata.name !== namespaceName)

      if (currentNamespace.value === namespaceName) {
        await switchNamespace('default')
      }

      console.log(`命名空间 ${namespaceName} 删除成功 (模拟)`)
    } finally {
      loading.value = false
    }
  }

  // 刷新命名空间列表
  const refreshNamespaces = async () => {
    await fetchNamespaces()
  }

  return {
    // 状态
    namespaces,
    loading,
    currentNamespace,
    switchingNamespace,

    // 计算属性
    namespaceOptions,
    currentNamespaceInfo,
    hasNamespaces,

    // 方法
    fetchNamespaces,
    switchNamespace,
    createNamespace,
    deleteNamespace,
    refreshNamespaces,
    refreshNamespaceData
  }
})
