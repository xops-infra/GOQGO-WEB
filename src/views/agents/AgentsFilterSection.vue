<template>
  <div class="agents-filter-section">
    <div class="filter-header">
      <h3>Agent管理</h3>
      <div class="header-actions">
        <n-button @click="$emit('refresh')" :loading="refreshing">
          <template #icon>
            <n-icon>
              <RefreshIcon />
            </n-icon>
          </template>
          刷新
        </n-button>
        
        <n-button type="primary" @click="$emit('create')">
          <template #icon>
            <n-icon>
              <AddIcon />
            </n-icon>
          </template>
          创建Agent
        </n-button>
      </div>
    </div>

    <div class="filter-controls">
      <n-space :size="16" align="center" wrap>
        <!-- 命名空间选择 -->
        <div class="filter-item">
          <label>命名空间:</label>
          <n-select
            :value="namespace"
            @update:value="$emit('update:namespace', $event)"
            :options="namespaceOptions"
            placeholder="选择命名空间"
            style="width: 160px"
          />
        </div>

        <!-- 用户名过滤 -->
        <div class="filter-item">
          <label>搜索:</label>
          <n-input
            :value="usernameFilter"
            @update:value="$emit('update:username-filter', $event)"
            placeholder="搜索Agent名称..."
            clearable
            style="width: 200px"
          >
            <template #prefix>
              <n-icon>
                <SearchIcon />
              </n-icon>
            </template>
          </n-input>
        </div>

        <!-- 角色过滤 -->
        <div class="filter-item">
          <label>角色:</label>
          <n-select
            :value="roleFilter"
            @update:value="$emit('update:role-filter', $event)"
            :options="roleOptions"
            placeholder="选择角色"
            clearable
            style="width: 140px"
          />
        </div>

        <!-- 状态过滤 -->
        <div class="filter-item">
          <label>状态:</label>
          <n-select
            :value="statusFilter"
            @update:value="$emit('update:status-filter', $event)"
            :options="statusOptions"
            placeholder="选择状态"
            clearable
            style="width: 120px"
          />
        </div>

        <!-- 清除所有过滤器 -->
        <n-button
          v-if="hasActiveFilters"
          text
          @click="clearAllFilters"
          class="clear-filters"
        >
          <template #icon>
            <n-icon>
              <ClearIcon />
            </n-icon>
          </template>
          清除过滤
        </n-button>
      </n-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NSpace, NButton, NIcon, NSelect, NInput } from 'naive-ui'
import RefreshIcon from '@/components/icons/RefreshIcon.vue'
import AddIcon from '@/components/icons/AddIcon.vue'
import SearchIcon from '@/components/icons/SearchIcon.vue'
import ClearIcon from '@/components/icons/ClearIcon.vue'

interface Props {
  namespace: string
  usernameFilter: string
  roleFilter: string
  statusFilter: string
  namespaces: any[]
  roles: any[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:namespace': [value: string]
  'update:username-filter': [value: string]
  'update:role-filter': [value: string]
  'update:status-filter': [value: string]
  refresh: []
  create: []
}>()

// 响应式数据
const refreshing = ref(false)

// 计算属性
const namespaceOptions = computed(() => [
  { label: '全部命名空间', value: 'all' },
  ...props.namespaces.map(ns => ({
    label: ns.name,
    value: ns.name
  }))
])

const roleOptions = computed(() => 
  props.roles.map(role => ({
    label: role.name,
    value: role.name
  }))
)

const statusOptions = [
  { label: '运行中', value: 'running' },
  { label: '空闲', value: 'idle' },
  { label: '错误', value: 'error' },
  { label: '创建中', value: 'creating' },
  { label: '终止中', value: 'terminating' }
]

const hasActiveFilters = computed(() => {
  return !!(
    props.usernameFilter.trim() ||
    props.roleFilter ||
    props.statusFilter ||
    (props.namespace && props.namespace !== 'all')
  )
})

// 方法
const clearAllFilters = () => {
  emit('update:namespace', 'all')
  emit('update:username-filter', '')
  emit('update:role-filter', '')
  emit('update:status-filter', '')
}
</script>

<style scoped lang="scss">
.agents-filter-section {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 20px;
}

.filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  
  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
  }
  
  .header-actions {
    display: flex;
    gap: 12px;
  }
}

.filter-controls {
  .filter-item {
    display: flex;
    align-items: center;
    gap: 8px;
    
    label {
      font-size: 13px;
      color: var(--text-secondary);
      font-weight: 500;
      white-space: nowrap;
    }
  }
  
  .clear-filters {
    color: var(--text-tertiary);
    
    &:hover {
      color: var(--color-primary);
    }
  }
}

// Terminal主题样式
[data-theme='terminal'] .agents-filter-section {
  background: var(--terminal-bg-secondary);
  border-color: var(--terminal-border);
  
  .filter-header h3 {
    color: var(--terminal-text);
    font-family: var(--font-display);
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  .filter-item label {
    color: var(--terminal-text-secondary);
    font-family: var(--font-mono);
    text-transform: uppercase;
    font-size: 11px;
  }
  
  .clear-filters {
    color: var(--terminal-text-tertiary);
    
    &:hover {
      color: var(--pixel-cyan);
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .filter-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    
    .header-actions {
      justify-content: flex-end;
    }
  }
  
  .filter-controls {
    :deep(.n-space) {
      flex-direction: column;
      align-items: stretch;
      gap: 12px !important;
    }
    
    .filter-item {
      flex-direction: column;
      align-items: stretch;
      gap: 4px;
      
      label {
        font-size: 12px;
      }
      
      .n-select,
      .n-input {
        width: 100% !important;
      }
    }
  }
}
</style>
