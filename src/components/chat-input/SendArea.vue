<template>
  <div class="send-area">
    <!-- 消息长度指示器 -->
    <div 
      v-if="messageLength > 0" 
      class="message-length-indicator"
      :class="{
        'warning': messageSizeInfo.warningLevel === 'warning',
        'error': messageSizeInfo.warningLevel === 'danger'
      }"
    >
      <span class="length-text">
        {{ messageSizeInfo.charCount }}/{{ MESSAGE_LIMITS.MAX_CHARS }}
      </span>
      <span v-if="messageSizeInfo.byteSize > 1024" class="size-text">
        ({{ Math.round(messageSizeInfo.byteSize / 1024) }}KB)
      </span>
      <span v-if="!messageSizeInfo.isValid" class="error-text">
        过大
      </span>
    </div>
    
    <!-- 发送按钮 -->
    <n-button
      type="primary"
      @click="$emit('send')"
      :disabled="!canSend"
      class="send-button"
    >
      <template #icon>
        <n-icon>
          <SendIcon />
        </n-icon>
      </template>
      发送
    </n-button>
  </div>
</template>

<script setup lang="ts">
import { NButton, NIcon } from 'naive-ui'
import { MESSAGE_LIMITS } from '@/utils/messageUtils'
import SendIcon from '@/components/icons/SendIcon.vue'

interface Props {
  messageLength: number
  messageSizeInfo: {
    charCount: number
    byteSize: number
    isValid: boolean
    warningLevel: string
  }
  canSend: boolean
}

defineProps<Props>()

defineEmits<{
  send: []
}>()
</script>

<style scoped lang="scss">
.send-area {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.message-length-indicator {
  font-size: 11px;
  color: var(--text-tertiary);
  padding: 2px 6px;
  border-radius: 4px;
  background-color: var(--bg-tertiary);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;

  &.warning {
    color: var(--color-warning);
    background-color: rgba(var(--color-warning-rgb), 0.1);
  }

  &.error {
    color: var(--color-error);
    background-color: rgba(var(--color-error-rgb), 0.1);
  }

  .length-text {
    font-weight: 500;
  }

  .size-text {
    opacity: 0.8;
    font-size: 10px;
  }

  .error-text {
    color: var(--color-error);
    font-weight: 600;
    font-size: 10px;
    text-transform: uppercase;
  }
}

.send-button {
  height: 36px;
  padding: 0 16px;
  border-radius: 6px;
  font-weight: 500;
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: var(--color-primary-hover);
    border-color: var(--color-primary-hover);
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    background-color: var(--bg-tertiary);
    border-color: var(--border-primary);
    color: var(--text-disabled);
    cursor: not-allowed;
  }
}

// Terminal主题样式
[data-theme='terminal'] .send-area {
  .message-length-indicator {
    background-color: var(--terminal-bg-tertiary);
    color: var(--terminal-text-tertiary);
    font-family: var(--font-mono);
    
    &.warning {
      color: var(--pixel-yellow);
      background-color: rgba(255, 255, 0, 0.1);
    }

    &.error {
      color: var(--pixel-red);
      background-color: rgba(255, 0, 0, 0.1);
    }
  }
  
  .send-button {
    background-color: var(--pixel-green);
    border-color: var(--pixel-green);
    color: var(--terminal-bg);
    font-family: var(--font-display);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;

    &:hover:not(:disabled) {
      background-color: var(--pixel-cyan);
      border-color: var(--pixel-cyan);
      box-shadow: var(--neon-glow-cyan);
    }
    
    &:disabled {
      background-color: var(--terminal-bg-tertiary);
      border-color: var(--terminal-border);
      color: var(--terminal-text-disabled);
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .send-button {
    height: 32px;
    padding: 0 12px;
    font-size: 13px;
  }
  
  .message-length-indicator {
    font-size: 10px;
  }
}
</style>
