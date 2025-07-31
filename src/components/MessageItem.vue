<template>
  <div class="message-item" :data-message-id="message.id" :class="messageClasses">
    <!-- 发送者头像 -->
    <div class="message-avatar">
      <n-avatar 
        :size="32" 
        :src="message.senderAvatar" 
        :fallback-src="getDefaultAvatar(message.type)"
        round
      >
        {{ getAvatarText(message.senderName) }}
      </n-avatar>
    </div>

    <!-- 消息内容区域 -->
    <div class="message-content">
      <!-- 发送者信息 -->
      <div class="message-header">
        <span class="sender-name" :class="getSenderClass(message.type)">
          {{ message.senderName }}
        </span>
        <span class="message-time">{{ formatTime(message.timestamp) }}</span>
        <n-tag v-if="message.type !== 'user'" :type="getTypeTagColor(message.type)" size="small" round>
          {{ getTypeLabel(message.type) }}
        </n-tag>
      </div>

      <!-- 消息正文 -->
      <div class="message-body">
        <!-- 文本消息 -->
        <template v-if="message.messageType === 'text' || !message.messageType">
          <div class="text-content" v-html="formatMessageContent(message.content)"></div>
        </template>
        
        <!-- 图片消息 -->
        <template v-else-if="message.messageType === 'image'">
          <div class="image-content" @click="handleImageClick">
            <img :src="message.imageUrl || message.content" :alt="message.senderName" />
          </div>
        </template>
      </div>

      <!-- 消息状态 -->
      <div v-if="message.status && message.status !== 'sent'" class="message-status">
        <n-icon v-if="message.status === 'sending'" class="status-icon sending">
          <svg viewBox="0 0 24 24">
            <path fill="currentColor" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/>
          </svg>
        </n-icon>
        <n-icon v-else-if="message.status === 'error'" class="status-icon error">
          <svg viewBox="0 0 24 24">
            <path fill="currentColor" d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2Z"/>
          </svg>
        </n-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ChatMessage } from '@/types/api'

const props = defineProps<{
  message: ChatMessage
}>()

// 消息样式类
const messageClasses = computed(() => ({
  'message-user': props.message.type === 'user',
  'message-agent': props.message.type === 'agent', 
  'message-system': props.message.type === 'system'
}))

// 获取发送者样式类
const getSenderClass = (type: string) => ({
  'sender-user': type === 'user',
  'sender-agent': type === 'agent',
  'sender-system': type === 'system'
})

// 获取类型标签颜色
const getTypeTagColor = (type: string) => {
  switch (type) {
    case 'agent': return 'info'
    case 'system': return 'warning'
    default: return 'default'
  }
}

// 获取类型标签文本
const getTypeLabel = (type: string) => {
  switch (type) {
    case 'agent': return 'AI'
    case 'system': return '系统'
    default: return ''
  }
}

// 获取默认头像
const getDefaultAvatar = (type: string) => {
  switch (type) {
    case 'agent': return '/avatars/agent-default.png'
    case 'system': return '/avatars/system-default.png'
    default: return '/avatars/user-default.png'
  }
}

// 获取头像文字
const getAvatarText = (senderName: string) => {
  if (senderName.startsWith('agent_')) {
    return 'AI'
  }
  return senderName.charAt(0).toUpperCase()
}

// 格式化消息内容，处理 @mention
const formatMessageContent = (content: string) => {
  return content
    .replace(/@(\w+)/g, '<span class="mention">@$1</span>')
    .replace(/\n/g, '<br>')
}

// 处理图片点击
const handleImageClick = () => {
  if (props.message.messageType === 'image') {
    window.open(props.message.imageUrl || props.message.content, '_blank')
  }
}

// 格式化时间
const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) { // 1分钟内
    return '刚刚'
  } else if (diff < 3600000) { // 1小时内
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) { // 24小时内
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else {
    return date.toLocaleString('zh-CN', { 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }
}
</script>

<style scoped lang="scss">
.message-item {
  max-width: 70%;
  
  .message-content {
    background: white;
    padding: 12px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    margin-bottom: 4px;
    
    .text-content {
      word-break: break-word;
      line-height: 1.5;
      white-space: pre-wrap;
    }
    
    .image-content {
      cursor: pointer;
      
      img {
        max-width: 100%;
        max-height: 300px;
        border-radius: 4px;
        transition: transform 0.2s;
        
        &:hover {
          transform: scale(1.02);
        }
      }
    }
  }
  
  .message-meta {
    font-size: 12px;
    color: #999;
    display: flex;
    gap: 8px;
    padding: 0 4px;
    
    .sender {
      font-weight: 500;
    }
    
    .time {
      opacity: 0.8;
    }
  }
}

:deep(.message-self) {
  .message-content {
    background: #07c160;
    color: white;
  }
  
  .message-meta {
    flex-direction: row-reverse;
  }
}
</style>
<style scoped lang="scss">
.message-item {
  display: flex;
  gap: 12px;
  padding: 8px 16px;
  margin-bottom: 4px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }

  // 用户消息样式
  &.message-user {
    .sender-name.sender-user {
      color: #1890ff;
      font-weight: 600;
    }
  }

  // Agent 消息样式
  &.message-agent {
    background-color: rgba(24, 144, 255, 0.02);
    
    .sender-name.sender-agent {
      color: #52c41a;
      font-weight: 600;
    }
  }

  // 系统消息样式
  &.message-system {
    background-color: rgba(250, 173, 20, 0.02);
    
    .sender-name.sender-system {
      color: #faad14;
      font-weight: 600;
    }
  }
}

.message-avatar {
  flex-shrink: 0;
  margin-top: 2px;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;

  .sender-name {
    font-size: 14px;
    font-weight: 500;
  }

  .message-time {
    font-size: 12px;
    color: #8c8c8c;
  }
}

.message-body {
  .text-content {
    font-size: 14px;
    line-height: 1.5;
    word-wrap: break-word;
    white-space: pre-wrap;

    // @mention 样式
    :deep(.mention) {
      color: #1890ff;
      background-color: rgba(24, 144, 255, 0.1);
      padding: 2px 4px;
      border-radius: 3px;
      font-weight: 500;
    }
  }

  .image-content {
    margin-top: 4px;
    cursor: pointer;
    
    img {
      max-width: 300px;
      max-height: 200px;
      border-radius: 6px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease;

      &:hover {
        transform: scale(1.02);
      }
    }
  }
}

.message-status {
  margin-top: 4px;
  
  .status-icon {
    font-size: 12px;
    
    &.sending {
      color: #1890ff;
      animation: spin 1s linear infinite;
    }
    
    &.error {
      color: #f5222d;
    }
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
