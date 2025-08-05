<template>
  <div class="connection-status">
    <n-tooltip :show-arrow="false">
      <template #trigger>
        <div 
          class="connection-dot" 
          :class="connectionStatusClass"
        ></div>
      </template>
      {{ connectionStatusText }}
    </n-tooltip>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NTooltip } from 'naive-ui'
import { useChatStore } from '@/stores/chat'

const chatStore = useChatStore()

// 计算属性
const connectionStatusClass = computed(() => {
  const status = chatStore.connectionStatus || 'disconnected'
  return {
    'connection-connected': status === 'connected',
    'connection-disconnected': status === 'disconnected',
    'connection-connecting': status === 'connecting'
  }
})

const connectionStatusText = computed(() => {
  const statusMap = {
    connected: '已连接',
    disconnected: '连接断开',
    connecting: '连接中...'
  }
  return statusMap[chatStore.connectionStatus] || '未知状态'
})
</script>

<style scoped lang="scss">
.connection-status {
  display: flex;
  align-items: center;
  
  .connection-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    transition: all 0.3s ease;
    
    &.connection-connected {
      background: var(--color-success);
      box-shadow: 0 0 4px rgba(var(--color-success-rgb), 0.5);
    }
    
    &.connection-disconnected {
      background: var(--color-error);
      box-shadow: 0 0 4px rgba(var(--color-error-rgb), 0.5);
    }
    
    &.connection-connecting {
      background: var(--color-warning);
      box-shadow: 0 0 4px rgba(var(--color-warning-rgb), 0.5);
      animation: pulse 1.5s infinite;
    }
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

// Terminal主题样式
[data-theme='terminal'] .connection-status {
  .connection-dot {
    &.connection-connected {
      background: var(--pixel-green);
      box-shadow: 0 0 6px var(--pixel-green);
    }
    
    &.connection-disconnected {
      background: var(--pixel-red);
      box-shadow: 0 0 6px var(--pixel-red);
    }
    
    &.connection-connecting {
      background: var(--pixel-yellow);
      box-shadow: 0 0 6px var(--pixel-yellow);
    }
  }
}
</style>
