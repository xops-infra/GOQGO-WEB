<template>
  <div class="namespace-manager">
    <!-- 下拉菜单 -->
    <n-dropdown
      :options="dropdownOptions"
      @select="handleMenuSelect"
      placement="bottom-end"
      trigger="click"
      :show-arrow="true"
    >
      <div class="namespace-container">
        <!-- 命名空间图标 -->
        <div class="namespace-icon">
          <NamespaceIcon :size="18" />
        </div>
        
        <!-- 命名空间信息 -->
        <div class="namespace-info">
          <div class="namespace-name">{{ currentNamespaceDisplay }}</div>
          <div class="namespace-stats">
            <n-tag size="small" round type="info">
              {{ agentCount }} 个智能体
            </n-tag>
          </div>
        </div>
        
        <!-- 下拉箭头 -->
        <n-icon class="dropdown-icon" size="16">
          <svg viewBox="0 0 24 24">
            <path fill="currentColor" d="M7,10L12,15L17,10H7Z"/>
          </svg>
        </n-icon>
      </div>
    </n-dropdown>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, h, watch } from 'vue'
import { SettingsOutline, RefreshOutline, AddOutline } from '@vicons/ionicons5'
import { useNamespacesStore } from '@/stores/namespaces'
import { useAgentsStore } from '@/stores/agents'
import { storeToRefs } from 'pinia'
import { useMessage } from 'naive-ui'
import NamespaceIcon from './icons/NamespaceIcon.vue'

console.log('🚀 NamespaceManager 开始加载')

// 状态管理
const namespacesStore = useNamespacesStore()
const agentsStore = useAgentsStore()
const { namespaces, currentNamespace } = storeToRefs(namespacesStore)
const { agents } = storeToRefs(agentsStore)
const message = useMessage()

// 响应式数据
const loading = ref(false)

// 计算属性
const currentNamespaceDisplay = computed(() => {
  const ns = currentNamespace.value
  return typeof ns === 'string' ? ns : String(ns || 'default')
})

const agentCount = computed(() => {
  // 从agents store获取当前namespace的agent数量
  const currentNs = currentNamespace.value
  if (!currentNs || !agents.value) {
    return 0
  }
  
  // 过滤出当前namespace下的agents
  const currentNamespaceAgents = agents.value.filter(agent => 
    agent.namespace === currentNs
  )
  
  console.log(`📊 当前命名空间 ${currentNs} 下有 ${currentNamespaceAgents.length} 个智能体`)
  return currentNamespaceAgents.length
})

// 下拉菜单选项
const dropdownOptions = computed(() => {
  const options = []
  
  // 命名空间列表
  if (namespaces.value.length > 0) {
    namespaces.value.forEach(ns => {
      const namespaceName = String(ns.metadata?.name || ns.name || ns)
      options.push({
        key: `namespace-${namespaceName}`,
        label: namespaceName,
        icon: () => h(NamespaceIcon, { size: 16 })
      })
    })
  }
  
  // 分隔线
  if (options.length > 0) {
    options.push({
      key: 'divider-1',
      type: 'divider'
    })
  }
  
  // 管理选项
  options.push(
    {
      key: 'refresh',
      label: '刷新命名空间',
      icon: () => h(RefreshOutline)
    },
    {
      key: 'create',
      label: '创建命名空间',
      icon: () => h(AddOutline)
    },
    {
      key: 'settings',
      label: '命名空间设置',
      icon: () => h(SettingsOutline)
    }
  )
  
  return options
})

// 方法
const handleMenuSelect = async (key: string) => {
  console.log('🎯 选择菜单项:', key)
  
  if (key.startsWith('namespace-')) {
    const namespace = key.replace('namespace-', '')
    await switchNamespace(namespace)
  } else {
    switch (key) {
      case 'refresh':
        await refreshNamespaces()
        break
      case 'create':
        // TODO: 打开创建命名空间对话框
        message.info('创建命名空间功能开发中...')
        break
      case 'settings':
        // TODO: 打开命名空间设置
        message.info('命名空间设置功能开发中...')
        break
    }
  }
}

const switchNamespace = async (namespace: string) => {
  if (namespace === currentNamespace.value) {
    return
  }
  
  loading.value = true
  try {
    await namespacesStore.switchNamespace(namespace)
    message.success(`已切换到命名空间: ${namespace}`)
  } catch (error) {
    console.error('❌ 切换命名空间失败:', error)
    message.error('切换命名空间失败')
  } finally {
    loading.value = false
  }
}

const refreshNamespaces = async () => {
  loading.value = true
  try {
    await namespacesStore.fetchNamespaces()
    message.success('命名空间列表已刷新')
  } catch (error) {
    console.error('❌ 刷新命名空间失败:', error)
    message.error('刷新命名空间失败')
  } finally {
    loading.value = false
  }
}

// 生命周期
onMounted(async () => {
  console.log('🔧 NamespaceManager 组件挂载')
  
  // 初始化命名空间列表
  if (namespaces.value.length === 0) {
    await refreshNamespaces()
  }
})

// 监听store变化
const unwatchCurrentNamespace = namespacesStore.$subscribe((mutation, state) => {
  if (currentNamespace.value !== state.currentNamespace) {
    currentNamespace.value = state.currentNamespace
    console.log('🔄 同步namespace变化:', state.currentNamespace)
  }
})

// 清理订阅
onUnmounted(() => {
  unwatchCurrentNamespace()
})
</script>

<style scoped lang="scss">
.namespace-manager {
  .namespace-container {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid var(--border-primary);
    min-width: 180px;
    white-space: nowrap;
    background: var(--bg-primary);
    box-shadow: var(--shadow-sm);
    
    &:hover {
      background: var(--bg-hover);
      border-color: var(--color-primary-hover);
      box-shadow: var(--shadow-md);
    }
    
    &.loading {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }
  
  .namespace-icon {
    flex-shrink: 0;
    color: var(--color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(59, 130, 246, 0.1);
    transition: all 0.2s ease;
    
    .namespace-container:hover & {
      background: var(--color-primary-hover);
      color: #ffffff;
    }
  }
  
  .namespace-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    flex: 1;
    
    .namespace-name {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.2;
    }
    
    .namespace-stats {
      display: flex;
      align-items: center;
    }
  }
  
  .dropdown-icon {
    flex-shrink: 0;
    color: var(--text-tertiary);
    transition: all 0.2s ease;
    
    .namespace-container:hover & {
      color: var(--text-secondary);
      transform: rotate(180deg);
    }
  }
}

// 优化下拉菜单样式
:deep(.n-dropdown-menu) {
  background: var(--bg-primary);
  border-radius: 8px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-primary);
  padding: 6px;
  min-width: 220px;
  
  .n-dropdown-option {
    border-radius: 6px;
    margin: 2px 0;
    padding: 10px 12px;
    transition: all 0.2s ease;
    
    &:hover {
      background-color: var(--bg-hover);
    }
    
    .n-dropdown-option-body {
      display: flex;
      align-items: center;
      gap: 10px;
      
      .n-dropdown-option-body__prefix {
        color: var(--text-secondary);
        flex-shrink: 0;
        
        svg {
          width: 16px;
          height: 16px;
        }
      }
      
      .n-dropdown-option-body__label {
        font-size: 14px;
        font-weight: 500;
        color: var(--text-primary);
        line-height: 1.4;
      }
    }
    
    &.n-dropdown-option--show-arrow {
      &:hover {
        background-color: rgba(59, 130, 246, 0.1);
        
        .n-dropdown-option-body__prefix {
          color: var(--color-primary);
        }
        
        .n-dropdown-option-body__label {
          color: var(--color-primary);
        }
      }
    }
    
    &.n-dropdown-option--disabled {
      opacity: 0.5;
      
      .n-dropdown-option-body__label {
        color: var(--text-disabled);
        font-size: 12px;
        font-weight: 400;
      }
    }
  }
  
  .n-dropdown-divider {
    margin: 6px 0;
    height: 1px;
    background-color: var(--border-primary);
  }
}
</style>
