<template>
  <div class="namespace-selector">
    <n-dropdown
      :options="dropdownOptions"
      @select="handleMenuSelect"
      placement="bottom-end"
      trigger="click"
      :show-arrow="true"
    >
      <div class="namespace-container" :class="{ loading }">
        <!-- 命名空间图标 -->
        <div class="namespace-icon">
          <n-icon size="18">
            <NamespaceIcon />
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
          <ChevronDownIcon />
        </n-icon>

        <!-- 加载指示器 -->
        <div v-if="loading" class="loading-indicator">
          <n-spin size="small" />
        </div>
      </div>
    </n-dropdown>
  </div>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'
import { NDropdown, NIcon, NTag, NSpin } from 'naive-ui'
import NamespaceIcon from '@/components/icons/NamespaceIcon.vue'
import ChevronDownIcon from '@/components/icons/ChevronDownIcon.vue'
import type { Namespace } from '@/types/api'

interface Props {
  currentNamespace: string
  namespaces: Namespace[]
  agentCount: number
  loading: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [namespaceName: string]
  create: []
  manage: [namespace: Namespace]
}>()

// 计算属性
const currentNamespaceDisplay = computed(() => {
  const ns = props.namespaces.find(n => n.name === props.currentNamespace)
  return ns?.displayName || ns?.name || props.currentNamespace || 'default'
})

const dropdownOptions = computed(() => {
  const options = []
  
  // 命名空间列表
  if (props.namespaces.length > 0) {
    options.push({
      type: 'group',
      label: '选择命名空间',
      key: 'namespaces-group',
      children: props.namespaces.map(ns => ({
        label: () => h('div', { class: 'namespace-option' }, [
          h('div', { class: 'namespace-option-name' }, ns.displayName || ns.name),
          h('div', { class: 'namespace-option-desc' }, ns.description || '无描述'),
          ns.name === props.currentNamespace ? h('div', { class: 'current-indicator' }, '当前') : null
        ]),
        key: `select-${ns.name}`,
        disabled: ns.name === props.currentNamespace
      }))
    })
  }
  
  // 分割线
  if (options.length > 0) {
    options.push({
      type: 'divider',
      key: 'divider1'
    })
  }
  
  // 管理选项
  options.push({
    label: '创建命名空间',
    key: 'create',
    icon: () => h(NIcon, null, { default: () => h('svg', { viewBox: '0 0 24 24' }, [
      h('path', { fill: 'currentColor', d: 'M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z' })
    ])})
  })
  
  if (props.namespaces.length > 0) {
    options.push({
      label: '管理命名空间',
      key: 'manage',
      icon: () => h(NIcon, null, { default: () => h('svg', { viewBox: '0 0 24 24' }, [
        h('path', { fill: 'currentColor', d: 'M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z' })
      ])})
    })
  }
  
  return options
})

// 方法
const handleMenuSelect = (key: string) => {
  if (key === 'create') {
    emit('create')
  } else if (key === 'manage') {
    const currentNs = props.namespaces.find(ns => ns.name === props.currentNamespace)
    if (currentNs) {
      emit('manage', currentNs)
    }
  } else if (key.startsWith('select-')) {
    const namespaceName = key.replace('select-', '')
    emit('select', namespaceName)
  }
}
</script>

<style scoped lang="scss">
.namespace-selector {
  width: 100%;
}

.namespace-container {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    border-color: var(--border-focus);
    background: var(--bg-hover);
  }
  
  &.loading {
    pointer-events: none;
    opacity: 0.7;
  }
}

.namespace-icon {
  color: var(--color-primary);
  flex-shrink: 0;
}

.namespace-info {
  flex: 1;
  min-width: 0;
  
  .namespace-name {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 14px;
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .namespace-stats {
    display: flex;
    align-items: center;
  }
}

.dropdown-icon {
  color: var(--text-tertiary);
  flex-shrink: 0;
  transition: transform 0.2s ease;
  
  .namespace-container:hover & {
    color: var(--text-secondary);
  }
}

.loading-indicator {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
}

// 下拉选项样式
:deep(.n-dropdown-option) {
  .namespace-option {
    display: flex;
    flex-direction: column;
    gap: 2px;
    
    .namespace-option-name {
      font-weight: 500;
      color: var(--text-primary);
    }
    
    .namespace-option-desc {
      font-size: 12px;
      color: var(--text-tertiary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .current-indicator {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 11px;
      color: var(--color-primary);
      font-weight: 600;
    }
  }
}

// Terminal主题样式
[data-theme='terminal'] .namespace-container {
  background: var(--terminal-bg-secondary);
  border-color: var(--terminal-border);
  
  &:hover {
    border-color: var(--terminal-border-active);
    background: var(--terminal-bg-tertiary);
  }
  
  .namespace-icon {
    color: var(--pixel-green);
  }
  
  .namespace-name {
    color: var(--terminal-text);
    font-family: var(--font-mono);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .dropdown-icon {
    color: var(--terminal-text-tertiary);
    
    &:hover {
      color: var(--pixel-cyan);
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .namespace-container {
    padding: 10px 12px;
    gap: 8px;
  }
  
  .namespace-name {
    font-size: 13px;
  }
}
</style>
