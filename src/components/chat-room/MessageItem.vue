<template>
  <div 
    class="message-item"
    :class="{
      'show-avatar': showAvatar,
      'show-timestamp': showTimestamp,
      'message-failed': message.status === 'failed'
    }"
    :data-message-id="message.id"
  >
    <!-- 时间戳 -->
    <div v-if="showTimestamp" class="message-timestamp">
      {{ formatTimestamp(message.timestamp) }}
    </div>

    <div class="message-content">
      <!-- 头像 -->
      <div v-if="showAvatar" class="message-avatar">
        <div class="avatar-circle">
          {{ getAvatarText(message.sender) }}
        </div>
      </div>

      <!-- 消息主体 -->
      <div class="message-body">
        <!-- 发送者信息 -->
        <div v-if="showAvatar" class="message-sender">
          {{ message.sender }}
        </div>

        <!-- 消息内容 -->
        <div class="message-text">
          <MessageContent :content="message.content" :type="message.type" />
        </div>

        <!-- 消息状态 -->
        <div v-if="message.status === 'failed'" class="message-actions">
          <n-button size="tiny" text @click="$emit('retry', message.id)">
            重试
          </n-button>
          <n-button size="tiny" text @click="$emit('delete', message.id)">
            删除
          </n-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NButton } from 'naive-ui'
import MessageContent from './MessageContent.vue'
import type { Message } from '@/types/api'

interface Props {
  message: Message
  previousMessage: Message | null
  nextMessage: Message | null
  showAvatar: boolean
  showTimestamp: boolean
}

defineProps<Props>()

defineEmits<{
  retry: [messageId: string]
  delete: [messageId: string]
}>()

// 方法
const getAvatarText = (sender: string) => {
  return sender.charAt(0).toUpperCase()
}

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) {
    return '刚刚'
  } else if (diffMins < 60) {
    return `${diffMins}分钟前`
  } else if (diffHours < 24) {
    return `${diffHours}小时前`
  } else if (diffDays < 7) {
    return `${diffDays}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}
</script>

<style scoped lang="scss">
.message-item {
  margin-bottom: 8px;
  
  &.show-timestamp {
    margin-top: 16px;
  }
  
  &.message-failed {
    opacity: 0.7;
    
    .message-text {
      background: rgba(var(--color-error-rgb), 0.1);
      border-left: 3px solid var(--color-error);
    }
  }
}

.message-timestamp {
  text-align: center;
  margin-bottom: 12px;
  font-size: 12px;
  color: var(--text-tertiary);
  padding: 4px 8px;
  background: var(--bg-tertiary);
  border-radius: 12px;
  display: inline-block;
  margin-left: 50%;
  transform: translateX(-50%);
}

.message-content {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.message-avatar {
  flex-shrink: 0;
  
  .avatar-circle {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--color-primary);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 14px;
  }
}

.message-body {
  flex: 1;
  min-width: 0;
}

.message-sender {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.message-text {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 8px 12px;
  word-wrap: break-word;
  line-height: 1.4;
  
  &:hover {
    background: var(--bg-hover);
  }
}

.message-actions {
  margin-top: 4px;
  display: flex;
  gap: 8px;
}

// Terminal主题样式
[data-theme='terminal'] .message-item {
  .message-timestamp {
    background: var(--terminal-bg-tertiary);
    color: var(--terminal-text-tertiary);
    font-family: var(--font-mono);
    text-transform: uppercase;
    font-size: 10px;
  }
  
  .avatar-circle {
    background: var(--pixel-green);
    color: var(--terminal-bg);
    font-family: var(--font-mono);
    border: 1px solid var(--pixel-green);
  }
  
  .message-sender {
    color: var(--pixel-cyan);
    font-family: var(--font-mono);
    text-transform: uppercase;
    font-size: 11px;
  }
  
  .message-text {
    background: var(--terminal-bg-secondary);
    border: 1px solid var(--terminal-border);
    color: var(--terminal-text);
    font-family: var(--font-mono);
    
    &:hover {
      background: var(--terminal-bg-tertiary);
      border-color: var(--pixel-green);
    }
  }
  
  &.message-failed .message-text {
    background: rgba(255, 0, 0, 0.1);
    border-left-color: var(--pixel-red);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .message-content {
    gap: 8px;
  }
  
  .message-avatar .avatar-circle {
    width: 32px;
    height: 32px;
    font-size: 13px;
  }
  
  .message-text {
    padding: 6px 10px;
    font-size: 14px;
  }
  
  .message-sender {
    font-size: 12px;
  }
}
</style>
