<template>
  <n-modal
    :show="show"
    @update:show="$emit('update:show', $event)"
    preset="dialog"
    :title="modalTitle"
    :positive-text="confirmText"
    :negative-text="'取消'"
    @positive-click="$emit('confirm')"
  >
    <div class="batch-action-content">
      <div class="action-description">
        <n-icon size="24" :color="iconColor">
          <component :is="actionIcon" />
        </n-icon>
        <p>{{ actionDescription }}</p>
      </div>

      <div class="agents-list">
        <h4>将要操作的Agent ({{ agents.length }}个):</h4>
        <div class="agents-grid">
          <div
            v-for="agent in agents"
            :key="`${agent.namespace}-${agent.name}`"
            class="agent-item"
          >
            <div class="agent-info">
              <span class="agent-name">{{ agent.name }}</span>
              <span class="agent-namespace">{{ agent.namespace }}</span>
            </div>
            <div class="agent-status" :class="`status-${agent.status}`">
              {{ getStatusText(agent.status) }}
            </div>
          </div>
        </div>
      </div>

      <div v-if="action === 'delete'" class="warning-notice">
        <n-alert type="warning" :show-icon="false">
          <template #icon>
            <n-icon>
              <WarningIcon />
            </n-icon>
          </template>
          <strong>警告：</strong>删除操作不可撤销，请确认您要删除这些Agent。
        </n-alert>
      </div>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NModal, NIcon, NAlert } from 'naive-ui'
import RestartIcon from '@/components/icons/RestartIcon.vue'
import StopIcon from '@/components/icons/StopIcon.vue'
import DeleteIcon from '@/components/icons/DeleteIcon.vue'
import WarningIcon from '@/components/icons/WarningIcon.vue'
import type { Agent } from '@/types/api'

interface Props {
  show: boolean
  action: string
  agents: Agent[]
}

const props = defineProps<Props>()

defineEmits<{
  'update:show': [value: boolean]
  confirm: []
}>()

// 计算属性
const modalTitle = computed(() => {
  const actionMap = {
    restart: '批量重启Agent',
    stop: '批量停止Agent',
    delete: '批量删除Agent'
  }
  return actionMap[props.action] || '批量操作'
})

const confirmText = computed(() => {
  const actionMap = {
    restart: '确认重启',
    stop: '确认停止',
    delete: '确认删除'
  }
  return actionMap[props.action] || '确认'
})

const actionDescription = computed(() => {
  const actionMap = {
    restart: `您即将重启 ${props.agents.length} 个Agent，这将中断它们当前的任务。`,
    stop: `您即将停止 ${props.agents.length} 个Agent，它们将停止运行。`,
    delete: `您即将删除 ${props.agents.length} 个Agent，此操作不可撤销。`
  }
  return actionMap[props.action] || `您即将对 ${props.agents.length} 个Agent执行操作。`
})

const actionIcon = computed(() => {
  const iconMap = {
    restart: RestartIcon,
    stop: StopIcon,
    delete: DeleteIcon
  }
  return iconMap[props.action] || RestartIcon
})

const iconColor = computed(() => {
  const colorMap = {
    restart: 'var(--color-info)',
    stop: 'var(--color-warning)',
    delete: 'var(--color-error)'
  }
  return colorMap[props.action] || 'var(--color-info)'
})

// 方法
const getStatusText = (status: string) => {
  const statusMap = {
    running: '运行中',
    idle: '空闲',
    error: '错误',
    creating: '创建中',
    terminating: '终止中',
    stopped: '已停止'
  }
  return statusMap[status.toLowerCase()] || status
}
</script>

<style scoped lang="scss">
.batch-action-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.action-description {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 8px;
  
  p {
    margin: 0;
    color: var(--text-secondary);
    line-height: 1.5;
  }
}

.agents-list {
  h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
    color: var(--text-primary);
    font-weight: 600;
  }
}

.agents-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
  padding: 8px;
  background: var(--bg-tertiary);
  border-radius: 6px;
}

.agent-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--bg-primary);
  border-radius: 4px;
  border: 1px solid var(--border-primary);
}

.agent-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  
  .agent-name {
    font-weight: 500;
    color: var(--text-primary);
    font-size: 13px;
  }
  
  .agent-namespace {
    font-size: 11px;
    color: var(--text-tertiary);
  }
}

.agent-status {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: 500;
  
  &.status-running {
    background: rgba(var(--color-success-rgb), 0.2);
    color: var(--color-success);
  }
  
  &.status-idle {
    background: rgba(var(--color-warning-rgb), 0.2);
    color: var(--color-warning);
  }
  
  &.status-error,
  &.status-stopped {
    background: rgba(var(--color-error-rgb), 0.2);
    color: var(--color-error);
  }
  
  &.status-creating,
  &.status-terminating {
    background: rgba(var(--color-info-rgb), 0.2);
    color: var(--color-info);
  }
}

.warning-notice {
  margin-top: 8px;
}

// Terminal主题样式
[data-theme='terminal'] .batch-action-content {
  .action-description {
    background: var(--terminal-bg-secondary);
    border: 1px solid var(--terminal-border);
    
    p {
      color: var(--terminal-text-secondary);
      font-family: var(--font-mono);
    }
  }
  
  .agents-grid {
    background: var(--terminal-bg-tertiary);
    border: 1px solid var(--terminal-border);
  }
  
  .agent-item {
    background: var(--terminal-bg);
    border-color: var(--terminal-border);
    
    .agent-name {
      color: var(--terminal-text);
      font-family: var(--font-mono);
    }
    
    .agent-namespace {
      color: var(--terminal-text-tertiary);
      font-family: var(--font-mono);
    }
  }
  
  .agent-status {
    font-family: var(--font-mono);
    text-transform: uppercase;
    
    &.status-running {
      background: rgba(0, 255, 65, 0.2);
      color: var(--pixel-green);
    }
    
    &.status-idle {
      background: rgba(255, 255, 0, 0.2);
      color: var(--pixel-yellow);
    }
    
    &.status-error,
    &.status-stopped {
      background: rgba(255, 0, 0, 0.2);
      color: var(--pixel-red);
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .agents-grid {
    max-height: 150px;
  }
  
  .agent-item {
    padding: 6px 8px;
  }
  
  .agent-info {
    .agent-name {
      font-size: 12px;
    }
    
    .agent-namespace {
      font-size: 10px;
    }
  }
}
</style>
