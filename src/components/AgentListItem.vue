<template>
  <div
    class="agent-list-item"
    :class="[
      { active: selected },
      `status-${agent.status.toLowerCase()}`
    ]"
    @click="$emit('select', agent)"
  >
    <div class="agent-info">
      <!-- 头部信息 -->
      <div class="agent-header">
        <span class="agent-name">{{ agent.name }}</span>
        <div class="agent-actions">
          <n-tooltip>
            <template #trigger>
              <n-button
                text
                size="tiny"
                :type="isLogWindowOpen ? 'primary' : 'default'"
                :class="{ 'log-button-active': isLogWindowOpen }"
                @click.stop="$emit('show-logs', agent)"
              >
                <template #icon>
                  <n-icon>
                    <LogIcon />
                  </n-icon>
                </template>
              </n-button>
            </template>
            {{ isLogWindowOpen ? '重置日志窗口' : '查看日志' }}
          </n-tooltip>

          <n-tooltip>
            <template #trigger>
              <n-button text size="tiny" @click.stop="$emit('show-details', agent)">
                <template #icon>
                  <n-icon><InfoIcon /></n-icon>
                </template>
              </n-button>
            </template>
            查看详情
          </n-tooltip>

          <n-tooltip>
            <template #trigger>
              <n-button text size="tiny" @click.stop="$emit('restart', agent)">
                <template #icon>
                  <n-icon><RefreshIcon /></n-icon>
                </template>
              </n-button>
            </template>
            重启实例
          </n-tooltip>

          <n-popconfirm @positive-click="$emit('delete', agent)">
            <template #trigger>
              <n-button text size="tiny" @click.stop>
                <template #icon>
                  <n-icon><DeleteIcon /></n-icon>
                </template>
              </n-button>
            </template>
            确定要删除实例 {{ agent.name }} 吗？
          </n-popconfirm>
        </div>
      </div>

      <!-- 元信息 -->
      <div class="agent-meta">
        <n-tag :type="getRoleType(agent.role)" size="small" round>
          {{ agent.role }}
        </n-tag>
        <span class="agent-uptime">运行时间: {{ formatUptime(agent.age) }}</span>
      </div>

      <!-- 状态信息 -->
      <div class="agent-status">
        <n-tag :type="getStatusType(agent.status)" size="small" round>
          {{ agent.status }}
        </n-tag>
        <span v-if="agent.restartCount" class="restart-count">
          重启次数: {{ agent.restartCount }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NIcon, NTooltip, NTag, NPopconfirm } from 'naive-ui'
import type { Agent } from '@/types/api'
import LogIcon from '@/components/icons/LogIcon.vue'
import InfoIcon from '@/components/icons/InfoIcon.vue'
import RefreshIcon from '@/components/icons/RefreshIcon.vue'
import DeleteIcon from '@/components/icons/DeleteIcon.vue'

interface Props {
  agent: Agent
  selected?: boolean
  logWindowOpen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
  logWindowOpen: false
})

defineEmits<{
  select: [agent: Agent]
  'show-logs': [agent: Agent]
  'show-details': [agent: Agent]
  restart: [agent: Agent]
  delete: [agent: Agent]
}>()

// 计算属性
const isLogWindowOpen = computed(() => props.logWindowOpen)

// 工具函数
const getRoleType = (role: string) => {
  const roleTypeMap: Record<string, string> = {
    'system': 'info',
    'architect': 'success',
    'assistant': 'warning',
    'coder': 'primary',
    'default': 'default'
  }
  return roleTypeMap[role] || 'default'
}

const getStatusType = (status: string) => {
  const statusTypeMap: Record<string, string> = {
    'running': 'success',
    'idle': 'warning',
    'stopped': 'error',
    'creating': 'info',
    'terminating': 'error'
  }
  return statusTypeMap[status.toLowerCase()] || 'default'
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
</script>

<style scoped lang="scss">
.agent-list-item {
  margin-bottom: 8px;
  padding: 12px;
  border-radius: 8px;
  background: var(--bg-primary);
  border: 1px solid var(--border-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--bg-hover);
    border-color: var(--border-primary);
  }
  
  &.active {
    background: var(--bg-active);
    border-color: var(--color-primary);
    box-shadow: 0 0 0 1px rgba(var(--color-primary-rgb), 0.2);
  }
  
  // 状态指示
  &.status-running {
    border-left: 3px solid var(--color-success);
  }
  
  &.status-idle {
    border-left: 3px solid var(--color-warning);
  }
  
  &.status-stopped,
  &.status-error {
    border-left: 3px solid var(--color-error);
  }
  
  &.status-creating {
    border-left: 3px solid var(--color-info);
  }
}

.agent-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.agent-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  .agent-name {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 14px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    margin-right: 8px;
  }
  
  .agent-actions {
    display: flex;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.2s ease;
    
    .n-button {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      
      &:hover {
        background: var(--bg-hover);
      }
      
      &.log-button-active {
        background: var(--color-primary);
        color: white;
      }
    }
  }
}

.agent-list-item:hover .agent-actions {
  opacity: 1;
}

.agent-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .agent-uptime {
    font-size: 11px;
    color: var(--text-tertiary);
  }
}

.agent-status {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .restart-count {
    font-size: 11px;
    color: var(--text-tertiary);
  }
}

// Terminal主题样式
[data-theme='terminal'] .agent-list-item {
  background: var(--terminal-bg);
  border-color: var(--terminal-border);
  
  &:hover {
    background: var(--terminal-bg-secondary);
    border-color: var(--terminal-border-active);
  }
  
  &.active {
    background: var(--terminal-surface);
    border-color: var(--pixel-green);
    box-shadow: 0 0 0 1px rgba(0, 255, 65, 0.3);
  }
  
  .agent-name {
    color: var(--terminal-text);
    font-family: var(--font-mono);
  }
  
  .agent-actions .n-button {
    &:hover {
      background: var(--terminal-surface);
      color: var(--pixel-cyan);
    }
    
    &.log-button-active {
      background: var(--pixel-green);
      color: var(--terminal-bg);
    }
  }
  
  // 状态指示颜色
  &.status-running {
    border-left-color: var(--pixel-green);
  }
  
  &.status-idle {
    border-left-color: var(--pixel-yellow);
  }
  
  &.status-stopped,
  &.status-error {
    border-left-color: var(--pixel-red);
  }
  
  &.status-creating {
    border-left-color: var(--pixel-cyan);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .agent-list-item {
    padding: 10px;
    margin-bottom: 6px;
  }
  
  .agent-header {
    .agent-name {
      font-size: 13px;
    }
  }
  
  .agent-actions {
    opacity: 1; // 移动端始终显示操作按钮
  }
}
</style>
