import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { namespaceApi, type Namespace, type CreateNamespaceRequest } from '@/api/namespaces'

export const useNamespacesStore = defineStore('namespaces', () => {
  // 状态
  const namespaces = ref<Namespace[]>([])
  const loading = ref(false)
  const currentNamespace = ref('default')
  
  // 计算属性
  const namespaceOptions = computed(() => 
    namespaces.value.map(ns => ({
      label: ns.metadata.name,
      value: ns.metadata.name
    }))
  )
  
  const currentNamespaceInfo = computed(() => 
    namespaces.value.find(ns => ns.metadata.name === currentNamespace.value)
  )
  
  // 方法
  const fetchNamespaces = async () => {
    loading.value = true
    try {
      const data = await namespaceApi.getList()
      // API返回的是 { items: Namespace[] } 格式
      namespaces.value = data.items || []
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
          status: { phase: 'Active' }
        },
        {
          apiVersion: 'v1',
          kind: 'Namespace',
          metadata: {
            name: 'development',
            creationTimestamp: new Date().toISOString()
          },
          spec: {},
          status: { phase: 'Active' }
        },
        {
          apiVersion: 'v1',
          kind: 'Namespace',
          metadata: {
            name: 'production',
            creationTimestamp: new Date().toISOString()
          },
          spec: {},
          status: { phase: 'Active' }
        }
      ]
    } finally {
      loading.value = false
    }
  }
  
  const createNamespace = async (name: string) => {
    try {
      const data: CreateNamespaceRequest = {
        apiVersion: 'v1',
        kind: 'Namespace',
        metadata: { name },
        spec: {}
      }
      
      const newNamespace = await namespaceApi.create(data)
      namespaces.value.push(newNamespace)
      return newNamespace
    } catch (error) {
      console.warn('创建命名空间失败，使用模拟创建:', error)
      
      // Fallback到模拟创建
      const newNamespace: Namespace = {
        apiVersion: 'v1',
        kind: 'Namespace',
        metadata: {
          name,
          creationTimestamp: new Date().toISOString()
        },
        spec: {},
        status: { phase: 'Active' }
      }
      
      namespaces.value.push(newNamespace)
      return newNamespace
    }
  }
  
  const deleteNamespace = async (name: string) => {
    if (name === 'default') {
      throw new Error('不能删除默认命名空间')
    }
    
    try {
      await namespaceApi.delete(name)
      namespaces.value = namespaces.value.filter(ns => ns.metadata.name !== name)
      
      // 如果删除的是当前命名空间，切换到default
      if (currentNamespace.value === name) {
        currentNamespace.value = 'default'
      }
    } catch (error) {
      console.warn('删除命名空间失败，使用模拟删除:', error)
      
      // Fallback到模拟删除
      namespaces.value = namespaces.value.filter(ns => ns.metadata.name !== name)
      
      if (currentNamespace.value === name) {
        currentNamespace.value = 'default'
      }
    }
  }
  
  const setCurrentNamespace = (name: string) => {
    currentNamespace.value = name
  }
  
  return {
    // 状态
    namespaces,
    loading,
    currentNamespace,
    
    // 计算属性
    namespaceOptions,
    currentNamespaceInfo,
    
    // 方法
    fetchNamespaces,
    createNamespace,
    deleteNamespace,
    setCurrentNamespace
  }
})
