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
          <n-icon size="18">
            <svg viewBox="0 0 24 24">
              <path fill="currentColor" d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21V20A2,2 0 0,1 19,22H5A2,2 0 0,1 3,20V19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2M7.5,13A2.5,2.5 0 0,0 5,15.5A2.5,2.5 0 0,0 7.5,18A2.5,2.5 0 0,0 10,15.5A2.5,2.5 0 0,0 7.5,13M16.5,13A2.5,2.5 0 0,0 14,15.5A2.5,2.5 0 0,0 16.5,18A2.5,2.5 0 0,0 19,15.5A2.5,2.5 0 0,0 16.5,13Z"/>
            </svg>
          </n-icon>
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
import { storeToRefs } from 'pinia'
import { useMessage } from 'naive-ui'

console.log('🚀 NamespaceManager 开始加载')

// Store
const namespacesStore = useNamespacesStore()
const { currentNamespace, namespaces } = storeToRefs(namespacesStore)
const message = useMessage()

// 本地状态
const loading = ref(false)

// 计算属性
const namespaceOptions = computed(() => {
  const namespaceList = namespaces.value || []
  const options = namespaceList.map(ns => ({
    label: `${ns.metadata.name} (${ns.status?.agentCount || 0} 个智能体)`,
    value: ns.metadata.name
  }))
  console.log('📊 Namespace选项:', options)
  return options
})

const currentNamespaceDisplay = computed(() => {
  const current = namespaces.value?.find(ns => ns.metadata.name === currentNamespace.value)
  return current?.metadata.name || currentNamespace.value || 'default'
})

const agentCount = computed(() => {
  const current = namespaces.value?.find(ns => ns.metadata.name === currentNamespace.value)
  return current?.status?.agentCount || 0
})

// 下拉菜单选项
const dropdownOptions = computed(() => {
  const namespaceItems = namespaces.value?.map(ns => ({
    label: ns.metadata.name,
    key: `namespace-${ns.metadata.name}`,
    icon: () => h('svg', { viewBox: '0 0 24 24', style: 'width: 16px; height: 16px;' }, [
      h('path', { fill: 'currentColor', d: 'M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21V20A2,2 0 0,1 19,22H5A2,2 0 0,1 3,20V19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2M7.5,13A2.5,2.5 0 0,0 5,15.5A2.5,2.5 0 0,0 7.5,18A2.5,2.5 0 0,0 10,15.5A2.5,2.5 0 0,0 7.5,13M16.5,13A2.5,2.5 0 0,0 14,15.5A2.5,2.5 0 0,0 16.5,18A2.5,2.5 0 0,0 19,15.5A2.5,2.5 0 0,0 16.5,13Z' })
    ]),
    children: [
      {
        label: `${ns.status?.agentCount || 0} 个智能体`,
        key: `info-${ns.metadata.name}`,
        disabled: true
      }
    ]
  })) || []

  return [
    ...namespaceItems,
    {
      type: 'divider'
    },
    {
      label: '刷新列表',
      key: 'refresh',
      icon: () => h(RefreshOutline)
    },
    {
      label: '创建命名空间',
      key: 'create',
      icon: () => h(AddOutline)
    },
    {
      label: '管理设置',
      key: 'settings',
      icon: () => h(SettingsOutline)
    }
  ]
})

// 方法
const handleMenuSelect = (key: string) => {
  console.log('🔄 菜单选择:', key)
  
  if (key.startsWith('namespace-')) {
    const namespaceName = key.replace('namespace-', '')
    handleNamespaceChange(namespaceName)
  } else {
    switch (key) {
      case 'refresh':
        handleRefresh()
        break
      case 'create':
        message.info('创建命名空间功能开发中...')
        break
      case 'settings':
        message.info('管理设置功能开发中...')
        break
    }
  }
}

const handleNamespaceChange = async (value: string) => {
  console.log('🔄 切换到namespace:', value)
  if (!value || value === currentNamespace.value) return
  
  try {
    await namespacesStore.switchNamespace(value)
    console.log('✅ 切换成功')
    message.success(`已切换到命名空间: ${value}`)
  } catch (error) {
    console.error('❌ 切换失败:', error)
    message.error('切换命名空间失败')
  }
}

const handleRefresh = async () => {
  console.log('🔄 刷新namespace列表')
  loading.value = true
  try {
    await namespacesStore.fetchNamespaces()
    console.log('✅ 刷新完成')
    message.success('命名空间列表已刷新')
  } catch (error) {
    console.error('❌ 刷新失败:', error)
    message.error('刷新失败')
  } finally {
    loading.value = false
  }
}

// 监听currentNamespace变化
watch(currentNamespace, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    console.log('📍 Namespace变化:', oldValue, '->', newValue)
  }
}, { immediate: true })

// 生命周期
onMounted(async () => {
  console.log('🎬 NamespaceManager mounted')
  
  loading.value = true
  try {
    await namespacesStore.fetchNamespaces()
    
    console.log('✅ 初始化完成，当前namespace:', currentNamespace.value)
    console.log('📊 可用namespaces:', namespaces.value.map(ns => `${ns.metadata.name}(${ns.status?.agentCount || 0})`))
  } catch (error) {
    console.error('❌ 初始化失败:', error)
    message.error('初始化命名空间失败')
  } finally {
    loading.value = false
  }
})

// 监听store中currentNamespace的变化
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
    padding: 6px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;
    min-width: 180px;
    white-space: nowrap;
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.12);
    }
    
    &.loading {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }
  
  .namespace-icon {
    flex-shrink: 0;
    color: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.1);
    transition: all 0.2s ease;
    
    .namespace-container:hover & {
      background: rgba(255, 255, 255, 0.15);
      border-color: rgba(255, 255, 255, 0.2);
      color: rgba(255, 255, 255, 0.9);
    }
  }
  
  .namespace-info {
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
    flex: 1;
    
    .namespace-name {
      font-size: 14px;
      font-weight: 600;
      color: #ffffff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.2;
    }
    
    .namespace-stats {
      display: flex;
      align-items: center;
      
      :deep(.n-tag) {
        font-size: 11px;
        height: 18px;
        padding: 0 6px;
        font-weight: 500;
        
        &.n-tag--info {
          background-color: rgba(24, 144, 255, 0.15);
          color: #1890ff;
          border: 1px solid rgba(24, 144, 255, 0.3);
        }
      }
    }
  }
  
  .dropdown-icon {
    flex-shrink: 0;
    color: rgba(255, 255, 255, 0.5);
    transition: all 0.2s ease;
    
    .namespace-container:hover & {
      color: rgba(255, 255, 255, 0.8);
      transform: rotate(180deg);
    }
  }
}

// 优化下拉菜单样式
:deep(.n-dropdown-menu) {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(0, 0, 0, 0.08);
  padding: 4px;
  min-width: 200px;
  
  .n-dropdown-option {
    border-radius: 6px;
    margin: 2px 0;
    padding: 8px 12px;
    transition: all 0.2s ease;
    
    &:hover {
      background-color: #f8f9fa;
    }
    
    .n-dropdown-option-body {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .n-dropdown-option-body__prefix {
        color: #6c757d;
        
        svg {
          width: 16px;
          height: 16px;
        }
      }
      
      .n-dropdown-option-body__label {
        font-size: 14px;
        font-weight: 500;
        color: #212529;
      }
    }
    
    &.n-dropdown-option--show-arrow {
      &:hover {
        background-color: #e3f2fd;
        
        .n-dropdown-option-body__prefix {
          color: #1976d2;
        }
      }
    }
    
    &.n-dropdown-option--disabled {
      .n-dropdown-option-body__label {
        color: #6c757d;
        font-size: 12px;
        font-weight: 400;
      }
    }
  }
  
  .n-dropdown-divider {
    margin: 4px 0;
    background-color: rgba(0, 0, 0, 0.06);
  }
}
</style>
