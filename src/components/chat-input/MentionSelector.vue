<template>
  <div class="mention-selector">
    <div class="mention-header">
      <n-icon size="16">
        <MentionIcon />
      </n-icon>
      <span>选择要提及的实例</span>
    </div>
    
    <div class="mention-list">
      <div
        v-for="(agent, index) in agents"
        :key="agent.name"
        :class="[
          'mention-item',
          { 'mention-item-selected': index === selectedIndex }
        ]"
        @click="$emit('select', agent)"
        @mouseenter="$emit('update-index', index)"
      >
        <div class="mention-avatar">
          <n-icon size="20">
            <AgentIcon />
          </n-icon>
        </div>
        <div class="mention-info">
          <div class="mention-name">{{ agent.name }}</div>
          <div class="mention-role">{{ agent.role }}</div>
        </div>
        <div class="mention-status">
          <div :class="['status-dot', `status-${agent.status}`]"></div>
          <span class="status-text">{{ getStatusText(agent.status) }}</span>
        </div>
      </div>
    </div>
    
    <div v-if="agents.length === 0" class="mention-empty">
      <n-icon size="24" color="var(--text-tertiary)">
        <EmptyIcon />
      </n-icon>
      <p>没有找到匹配的实例</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NIcon } from 'naive-ui'
import type { Agent } from '@/types/api'
import MentionIcon from '@/components/icons/MentionIcon.vue'
import AgentIcon from '@/components/icons/AgentIcon.vue'
import EmptyIcon from '@/components/icons/EmptyIcon.vue'

interface Props {
  agents: Agent[]
  selectedIndex: number
}

defineProps<Props>()

defineEmits<{
  select: [agent: Agent]
  'update-index': [index: number]
}>()

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap = {
    running: '运行中',
    idle: '空闲',
    error: '错误',
    Creating: '创建中',
    Terminating: '终止中'
  }
  return statusMap[status] || status
}
</script>

<style scoped lang="scss">
.mention-selector {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(8px);
  max-height: 280px;
  overflow: hidden;
  animation: mentionFadeIn 0.2s ease-out;
}

.mention-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
}

.mention-list {
  max-height: 200px;
  overflow-y: auto;
  padding: 4px 0;
}

.mention-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;

  &:hover,
  &.mention-item-selected {
    background-color: var(--bg-hover);
    border-left-color: var(--color-primary);
  }
}

.mention-avatar {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background-color: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.mention-info {
  flex: 1;
  min-width: 0;
}

.mention-name {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 14px;
  margin-bottom: 2px;
}

.mention-role {
  font-size: 12px;
  color: var(--text-tertiary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mention-status {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  
  &.status-running {
    background-color: var(--color-success);
    box-shadow: 0 0 4px rgba(var(--color-success-rgb), 0.4);
  }
  
  &.status-idle {
    background-color: var(--color-warning);
  }
  
  &.status-error {
    background-color: var(--color-error);
  }
  
  &.status-Creating,
  &.status-Terminating {
    background-color: var(--color-info);
    animation: pulse 1.5s infinite;
  }
}

.status-text {
  font-size: 11px;
  color: var(--text-tertiary);
  font-weight: 500;
}

.mention-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  color: var(--text-tertiary);

  p {
    margin: 8px 0 0 0;
    font-size: 14px;
  }
}

@keyframes mentionFadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

// Terminal主题样式
[data-theme='terminal'] .mention-selector {
  background: var(--terminal-bg);
  border-color: var(--terminal-border);
  box-shadow: 0 0 20px rgba(0, 255, 65, 0.3);
  
  .mention-header {
    background: var(--terminal-bg-secondary);
    border-bottom-color: var(--terminal-border);
    color: var(--terminal-text-secondary);
  }
  
  .mention-item {
    &:hover,
    &.mention-item-selected {
      background: var(--terminal-surface);
      border-left-color: var(--pixel-green);
    }
  }
  
  .mention-name {
    color: var(--terminal-text);
    font-family: var(--font-mono);
  }
  
  .mention-role {
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
    
    &.status-error {
      background: var(--pixel-red);
    }
  }
}
</style>
