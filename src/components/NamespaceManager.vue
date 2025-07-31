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

// 状态管理
const namespacesStore = useNamespacesStore()
const { namespaces, currentNamespace } = storeToRefs(namespacesStore)
const message = useMessage()

// 响应式数据
const loading = ref(false)

// 计算属性
const currentNamespaceDisplay = computed(() => {
  return currentNamespace.value || 'default'
})

const agentCount = computed(() => {
  // 这里应该从agents store获取当前namespace的agent数量
  // 暂时返回0
  return 0
})

// 下拉菜单选项
const dropdownOptions = computed(() => {
  const options = []
  
  // 命名空间列表
  if (namespaces.value.length > 0) {
    namespaces.value.forEach(ns => {
      options.push({
        key: `namespace-${ns}`,
        label: ns,
        icon: () => h('div', { class: 'option-icon' }, [
          h('svg', { viewBox: '0 0 24 24' }, [
            h('path', { 
              fill: 'currentColor', 
              d: 'M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21V20A2,2 0 0,1 19,22H5A2,2 0 0,1 3,20V19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2M7.5,13A2.5,2.5 0 0,0 5,15.5A2.5,2.5 0 0,0 7.5,18A2.5,2.5 0 0,0 10,15.5A2.5,2.5 0 0,0 7.5,13M16.5,13A2.5,2.5 0 0,0 14,15.5A2.5,2.5 0 0,0 16.5,18A2.5,2.5 0 0,0 19,15.5A2.5,2.5 0 0,0 16.5,13Z'
            })
          ])
        ])
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
    border: 1px solid var(--border-color);
    min-width: 180px;
    white-space: nowrap;
    background: var(--card-color);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    
    &:hover {
      background: var(--hover-color);
      border-color: var(--primary-color-hover);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    }
    
    &.loading {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }
  
  .namespace-icon {
    flex-shrink: 0;
    color: var(--primary-color);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--primary-color-suppl);
    transition: all 0.2s ease;
    
    .namespace-container:hover & {
      background: var(--primary-color-hover);
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
      color: var(--text-color-base);
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
    color: var(--text-color-3);
    transition: all 0.2s ease;
    
    .namespace-container:hover & {
      color: var(--text-color-2);
      transform: rotate(180deg);
    }
  }
}

// 优化下拉菜单样式
:deep(.n-dropdown-menu) {
  background: var(--popover-color);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border: 1px solid var(--border-color);
  padding: 6px;
  min-width: 220px;
  
  .n-dropdown-option {
    border-radius: 6px;
    margin: 2px 0;
    padding: 10px 12px;
    transition: all 0.2s ease;
    
    &:hover {
      background-color: var(--hover-color);
    }
    
    .n-dropdown-option-body {
      display: flex;
      align-items: center;
      gap: 10px;
      
      .n-dropdown-option-body__prefix {
        color: var(--text-color-2);
        flex-shrink: 0;
        
        svg {
          width: 16px;
          height: 16px;
        }
      }
      
      .n-dropdown-option-body__label {
        font-size: 14px;
        font-weight: 500;
        color: var(--text-color-base);
        line-height: 1.4;
      }
    }
    
    &.n-dropdown-option--show-arrow {
      &:hover {
        background-color: var(--primary-color-suppl);
        
        .n-dropdown-option-body__prefix {
          color: var(--primary-color);
        }
        
        .n-dropdown-option-body__label {
          color: var(--primary-color);
        }
      }
    }
    
    &.n-dropdown-option--disabled {
      opacity: 0.5;
      
      .n-dropdown-option-body__label {
        color: var(--text-color-disabled);
        font-size: 12px;
        font-weight: 400;
      }
    }
  }
  
  .n-dropdown-divider {
    margin: 6px 0;
    height: 1px;
    background-color: var(--border-color);
  }
}
</style>
