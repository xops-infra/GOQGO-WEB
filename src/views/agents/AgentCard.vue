<template>
  <div 
    class="agent-card" 
    :class="[
      `status-${agent.status.toLowerCase()}`,
      { 'selected': selected }
    ]"
  >
    <!-- 选择框 -->
    <div class="card-header">
      <n-checkbox
        :checked="selected"
        @update:checked="$emit('select', agent, $event)"
        class="select-checkbox"
      />
      
      <div class="agent-status">
        <div class="status-dot" :class="`status-${agent.status.toLowerCase()}`"></div>
        <span class="status-text">{{ getStatusText(agent.status) }}</span>
      </div>
    </div>

    <!-- Agent信息 -->
    <div class="card-content">
      <div class="agent-info">
        <div class="agent-avatar">
          <n-icon size="24">
            <AgentIcon />
          </n-icon>
        </div>
        
        <div class="agent-details">
          <h4 class="agent-name">{{ agent.name }}</h4>
          <div class="agent-meta">
            <span class="agent-namespace">{{ agent.namespace }}</span>
            <span class="separator">•</span>
            <span class="agent-role">{{ agent.role }}</span>
          </div>
        </div>
      </div>

      <!-- 运行信息 -->
      <div class="runtime-info">
        <div class="info-item">
          <span class="label">运行时间:</span>
          <span class="value">{{ formatUptime(agent.age) }}</span>
        </div>
        
        <div v-if="agent.restartCount" class="info-item">
          <span class="label">重启次数:</span>
          <span class="value">{{ agent.restartCount }}</span>
        </div>
        
        <div v-if="agent.username" class="info-item">
          <span class="label">用户:</span>
          <span class="value">{{ agent.username }}</span>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="card-actions">
      <n-button size="small" @click="$emit('action', 'view-details', agent)">
        <template #icon>
          <n-icon>
            <InfoIcon />
          </n-icon>
        </template>
        详情
      </n-button>
      
      <n-button size="small" @click="$emit('action', 'view-logs', agent)">
        <template #icon>
          <n-icon>
            <LogIcon />
          </n-icon>
        </template>
        日志
      </n-button>
      
      <n-dropdown :options="actionOptions" @select="handleActionSelect">
        <n-button size="small">
          <template #icon>
            <n-icon>
              <MoreIcon />
            </n-icon>
          </template>
        </n-button>
      </n-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NCheckbox, NButton, NIcon, NDropdown } from 'naive-ui'
import AgentIcon from '@/components/icons/AgentIcon.vue'
import InfoIcon from '@/components/icons/InfoIcon.vue'
import LogIcon from '@/components/icons/LogIcon.vue'
import MoreIcon from '@/components/icons/MoreIcon.vue'
import type { Agent } from '@/types/api'

interface Props {
  agent: Agent
  selected: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [agent: Agent, selected: boolean]
  action: [action: string, agent: Agent]
}>()

// 计算属性
const actionOptions = computed(() => [
  {
    label: '重启',
    key: 'restart',
    disabled: props.agent.status === 'creating' || props.agent.status === 'terminating'
  },
  {
    label: '停止',
    key: 'stop',
    disabled: props.agent.status !== 'running'
  },
  {
    type: 'divider',
    key: 'divider1'
  },
  {
    label: '删除',
    key: 'delete',
    props: {
      style: 'color: var(--color-error);'
    }
  }
])

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

const formatUptime = (age: string) => {
  if (!age) return '未知'
  
  // 简单的时间格式化
  if (age.includes('m') && !age.includes('h')) {
    return age.replace('m', '分钟')
  }
  if (age.includes('h')) {
    return age.replace('h', '小时').replace('m', '分钟')
  }
  if (age.includes('d')) {
    return age.replace('d', '天').replace('h', '小时')
  }
  
  return age
}

const handleActionSelect = (key: string) => {
  emit('action', key, props.agent)
}
</script>

<style scoped lang="scss">
.agent-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    border-color: var(--border-focus);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  &.selected {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 1px rgba(var(--color-primary-rgb), 0.2);
  }
  
  // 状态指示
  &.status-running {
    border-left: 4px solid var(--color-success);
  }
  
  &.status-idle {
    border-left: 4px solid var(--color-warning);
  }
  
  &.status-error,
  &.status-stopped {
    border-left: 4px solid var(--color-error);
  }
  
  &.status-creating,
  &.status-terminating {
    border-left: 4px solid var(--color-info);
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.agent-status {
  display: flex;
  align-items: center;
  gap: 6px;
  
  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    
    &.status-running {
      background: var(--color-success);
      box-shadow: 0 0 4px rgba(var(--color-success-rgb), 0.4);
    }
    
    &.status-idle {
      background: var(--color-warning);
    }
    
    &.status-error,
    &.status-stopped {
      background: var(--color-error);
    }
    
    &.status-creating,
    &.status-terminating {
      background: var(--color-info);
      animation: pulse 1.5s infinite;
    }
  }
  
  .status-text {
    font-size: 12px;
    color: var(--text-secondary);
    font-weight: 500;
  }
}

.card-content {
  margin-bottom: 16px;
}

.agent-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  
  .agent-avatar {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: var(--bg-tertiary);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    flex-shrink: 0;
  }
  
  .agent-details {
    flex: 1;
    min-width: 0;
    
    .agent-name {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .agent-meta {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--text-tertiary);
      
      .separator {
        opacity: 0.5;
      }
    }
  }
}

.runtime-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    
    .label {
      color: var(--text-secondary);
    }
    
    .value {
      color: var(--text-primary);
      font-weight: 500;
      font-family: var(--font-mono);
    }
  }
}

.card-actions {
  display: flex;
  gap: 8px;
  
  .n-button {
    flex: 1;
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

// Terminal主题样式
[data-theme='terminal'] .agent-card {
  background: var(--terminal-bg);
  border-color: var(--terminal-border);
  
  &:hover {
    border-color: var(--terminal-border-active);
    box-shadow: 0 0 8px rgba(0, 255, 65, 0.2);
  }
  
  &.selected {
    border-color: var(--pixel-green);
    box-shadow: 0 0 0 1px rgba(0, 255, 65, 0.3);
  }
  
  // Terminal状态颜色
  &.status-running {
    border-left-color: var(--pixel-green);
  }
  
  &.status-idle {
    border-left-color: var(--pixel-yellow);
  }
  
  &.status-error,
  &.status-stopped {
    border-left-color: var(--pixel-red);
  }
  
  .agent-name {
    color: var(--terminal-text);
    font-family: var(--font-mono);
  }
  
  .agent-meta {
    color: var(--terminal-text-tertiary);
    font-family: var(--font-mono);
  }
  
  .status-dot {
    &.status-running {
      background: var(--pixel-green);
      box-shadow: 0 0 6px var(--pixel-green);
    }
    
    &.status-idle {
      background: var(--pixel-yellow);
    }
    
    &.status-error,
    &.status-stopped {
      background: var(--pixel-red);
    }
  }
  
  .info-item {
    .label {
      color: var(--terminal-text-secondary);
      font-family: var(--font-mono);
    }
    
    .value {
      color: var(--terminal-text);
      font-family: var(--font-mono);
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .agent-card {
    padding: 12px;
  }
  
  .agent-info {
    .agent-avatar {
      width: 36px;
      height: 36px;
    }
    
    .agent-name {
      font-size: 15px;
    }
  }
  
  .card-actions {
    flex-wrap: wrap;
    
    .n-button {
      flex: none;
      min-width: 80px;
    }
  }
}
</style>
