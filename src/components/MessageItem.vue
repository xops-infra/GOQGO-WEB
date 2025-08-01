<template>
  <div 
    v-if="isValidMessage"
    class="message-item" 
    :data-message-id="messageId" 
    :class="messageClasses"
  >
    <!-- 消息卡片 -->
    <div class="message-card">
      <!-- 用户信息头部 -->
      <div class="message-header">
        <div class="user-info">
          <div class="avatar-container">
            <n-avatar
              :size="28"
              :src="message.senderAvatar"
              :color="avatarColor"
              round
              class="user-avatar"
            >
              {{ avatarText }}
            </n-avatar>
            <!-- 在线状态指示器 -->
            <div
              v-if="showOnlineStatus"
              class="online-indicator"
              :class="{ online: isOnline, offline: !isOnline }"
              :title="isOnline ? '在线' : '离线'"
            >
              <svg viewBox="0 0 8 8" class="status-icon">
                <circle cx="4" cy="4" r="3" :fill="isOnline ? '#52c41a' : '#8c8c8c'" />
              </svg>
            </div>
          </div>
          <div class="user-details">
            <span class="sender-name" :class="senderNameClass">
              {{ displayName }}
            </span>
            <n-tag
              v-if="showTypeTag"
              :type="typeTagColor"
              size="small"
              round
            >
              {{ typeLabel }}
            </n-tag>
          </div>
        </div>
        <div class="time-info">
          <span class="message-time">{{ formattedTime }}</span>
          <!-- 消息状态图标 -->
          <n-icon v-if="statusIcon" :class="statusIconClass" :title="statusTitle">
            <component :is="statusIcon" />
          </n-icon>
        </div>
      </div>

      <!-- 消息内容框 -->
      <div class="message-content-box">
        <!-- 按顺序渲染内容块 -->
        <div v-if="parsedMessage.contentBlocks.length > 0" class="content-blocks">
          <div 
            v-for="(block, index) in parsedMessage.contentBlocks" 
            :key="index" 
            class="content-block"
            :class="`content-block-${block.type}`"
          >
            <!-- 文本内容 -->
            <div v-if="block.type === 'text'" class="text-content">
              {{ block.content }}
            </div>
            
            <!-- 图片内容 -->
            <div v-else-if="block.type === 'image'" class="image-content">
              <ImageMessage
                :image-path="block.url || ''"
                :alt-text="block.filename || '图片'"
                :max-width="280"
                :max-height="200"
              />
            </div>
            
            <!-- 文件内容 -->
            <div v-else-if="block.type === 'file'" class="file-content">
              <a :href="block.url || '#'" target="_blank" class="file-link">
                <span class="file-icon">{{ block.icon }}</span>
                <span class="file-name">{{ block.filename }}</span>
                <span class="file-type">({{ block.label }})</span>
              </a>
            </div>
          </div>
        </div>

        <!-- 纯文本消息（兼容旧逻辑） -->
        <div v-else-if="isTextMessage" class="text-content">
          <div v-html="formattedContent"></div>
        </div>

        <!-- 纯图片消息（兼容旧逻辑） -->
        <div v-else-if="isImageMessage" class="image-content">
          <ImageMessage
            :image-path="imageUrl"
            :alt-text="altText"
            :max-width="280"
            :max-height="200"
          />
          <!-- 显示图片后的文本内容 -->
          <div v-if="imageText" class="image-text-content">
            {{ imageText }}
          </div>
        </div>

        <!-- 其他类型消息 -->
        <div v-else class="text-content">
          {{ message.content || '[消息内容为空]' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'
import { storeToRefs } from 'pinia'
import { useChatStore } from '@/stores/chat'
import { formatRelativeTime } from '@/utils/timeManager'
import { formatMessageContent, parseMessage } from '@/utils/messageParser'
import ImageMessage from './ImageMessage.vue'
import type { ChatMessage } from '@/types/api'
import { useUserStore } from '@/stores/user'

// Props定义
interface Props {
  message: ChatMessage
}

const props = defineProps<Props>()

// 获取聊天store中的在线用户列表
const chatStore = useChatStore()
const { onlineUsers } = storeToRefs(chatStore)

// 获取用户store中的当前用户名
const userStore = useUserStore()

// 基础验证
const isValidMessage = computed(() => {
  return !!(
    props.message &&
    (props.message.id || props.message.tempId) &&
    props.message.senderName &&
    props.message.content !== undefined
  )
})

// 消息ID
const messageId = computed(() => {
  return props.message?.id || props.message?.tempId || 'unknown'
})

// 显示名称
const displayName = computed(() => {
  return props.message?.senderName || 'Unknown User'
})

// 消息类型检查
const messageType = computed(() => {
  return props.message?.type || 'user'
})

const isTextMessage = computed(() => {
  const type = props.message?.messageType
  return !type || type === 'text'
})

const isImageMessage = computed(() => {
  return props.message?.messageType === 'image'
})

// 解析消息内容
const parsedMessage = computed(() => {
  const content = props.message?.content || ''
  return parseMessage(content)
})

// 图片URL（用于纯图片消息）
const imageUrl = computed(() => {
  if (!isImageMessage.value) return ''
  
  const content = props.message?.imageUrl || props.message?.content || ''
  
  // 使用 parsedMessage 中的图片文件
  const imageFile = parsedMessage.value.files.find(file => file.type === 'image')
  if (imageFile) {
    return imageFile.url
  }
  
  return content
})

// 图片文本内容（去除URL后的文本）
const imageText = computed(() => {
  if (!isImageMessage.value) return ''
  
  return parsedMessage.value.text.trim()
})

const altText = computed(() => {
  return `${displayName.value}发送的图片`
})

// 头像相关
const avatarColor = computed(() => {
  const type = messageType.value
  if (type === 'system') return '#faad14'
  if (isOnline.value) {
    return type === 'user' ? '#1890ff' : '#52c41a'
  }
  return '#8c8c8c'
})

const avatarText = computed(() => {
  const name = displayName.value
  if (name.startsWith('agent_')) return 'AI'
  return name.charAt(0).toUpperCase()
})

// 在线状态
const isOnline = computed(() => {
  const senderName = props.message?.senderName
  return senderName ? onlineUsers.value.includes(senderName) : false
})

const showOnlineStatus = computed(() => {
  const type = messageType.value
  return type === 'user' || type === 'agent'
})

// 检查是否为当前用户的消息
const isCurrentUser = computed(() => {
  const currentUsername = userStore.username?.toLowerCase()
  const senderId = props.message?.senderId?.toLowerCase() || ''
  const senderName = props.message?.senderName?.toLowerCase() || ''
  
  return senderId === currentUsername || senderName === currentUsername
})

// 样式类
const messageClasses = computed(() => ({
  'message-user': messageType.value === 'user',
  'message-agent': messageType.value === 'agent',
  'message-system': messageType.value === 'system',
  'message-current-user': isCurrentUser.value
}))

const senderNameClass = computed(() => ({
  'sender-user': messageType.value === 'user',
  'sender-agent': messageType.value === 'agent',
  'sender-system': messageType.value === 'system'
}))

// 类型标签
const showTypeTag = computed(() => {
  const type = messageType.value
  return type && type !== 'user'
})

const typeTagColor = computed(() => {
  const type = messageType.value
  switch (type) {
    case 'agent': return 'info'
    case 'system': return 'warning'
    default: return 'default'
  }
})

const typeLabel = computed(() => {
  const type = messageType.value
  switch (type) {
    case 'agent': return 'AI'
    case 'system': return '系统'
    default: return ''
  }
})

// 时间格式化
const formattedTime = computed(() => {
  const timestamp = props.message?.timestamp
  if (!timestamp) return '未知时间'
  return formatRelativeTime(timestamp, new Date()) // 修复：传入Date对象而不是字符串
})

// 消息状态
const messageStatus = computed(() => {
  return props.message?.status || 'sent'
})

const statusIcon = computed(() => {
  const status = messageStatus.value
  switch (status) {
    case 'sending':
      return h('svg', { viewBox: '0 0 16 16' }, [
        h('path', { 
          fill: 'currentColor', 
          d: 'M8,2V4.5A5.5,5.5 0 0,0 2.5,10H0A8,8 0 0,1 8,2Z' 
        })
      ])
    case 'sent':
      return h('svg', { viewBox: '0 0 16 16' }, [
        h('path', { 
          fill: 'currentColor', 
          d: 'M0.41,13.41L6,7.83L10.59,12.41L15.41,7.59L16.83,9L10.59,15.24L6,10.66L1.83,14.83L0.41,13.41Z' 
        })
      ])
    case 'delivered':
      return h('svg', { viewBox: '0 0 16 16' }, [
        h('path', { 
          fill: 'currentColor', 
          d: 'M0.41,13.41L6,7.83L10.59,12.41L15.41,7.59L16.83,9L10.59,15.24L6,10.66L1.83,14.83L0.41,13.41Z' 
        }),
        h('path', { 
          fill: 'currentColor', 
          d: 'M2.41,13.41L8,7.83L12.59,12.41L17.41,7.59L18.83,9L12.59,15.24L8,10.66L3.83,14.83L2.41,13.41Z' 
        })
      ])
    case 'error':
      return h('svg', { viewBox: '0 0 16 16' }, [
        h('path', { 
          fill: 'currentColor', 
          d: 'M8,0L9.5,6L16,7L9.5,8L8,14L6.5,8L0,7L6.5,6L8,0Z' 
        })
      ])
    default:
      return null
  }
})

const statusIconClass = computed(() => {
  const status = messageStatus.value
  return {
    'status-icon': true,
    'sending': status === 'sending',
    'sent': status === 'sent',
    'delivered': status === 'delivered',
    'error': status === 'error'
  }
})

const statusTitle = computed(() => {
  const status = messageStatus.value
  switch (status) {
    case 'sending': return '发送中'
    case 'sent': return '已发送'
    case 'delivered': return '已送达'
    case 'error': return '发送失败'
    default: return ''
  }
})

// 内容格式化
const formattedContent = computed(() => {
  const content = props.message?.content
  if (!content) return ''
  
  try {
    return formatMessageContent(content)
  } catch (error) {
    console.warn('格式化消息内容失败:', error)
    return content
  }
})

// 事件处理
const handleImageClick = () => {
  const url = imageUrl.value
  if (url) {
    window.open(url, '_blank')
  }
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
  console.error('图片加载失败:', imageUrl.value)
}
</script>

<style scoped lang="scss">
.message-item {
  padding: 8px 16px;
  margin-bottom: 8px;

  // 用户消息样式
  &.message-user {
    .sender-name.sender-user {
      color: var(--color-primary);
      font-weight: 600;
    }
  }

  // Agent 消息样式
  &.message-agent {
    .message-card {
      background-color: rgba(82, 196, 26, 0.02);
    }
    .sender-name.sender-agent {
      color: var(--color-success);
      font-weight: 600;
    }
  }

  // 系统消息样式
  &.message-system {
    .message-card {
      background-color: rgba(250, 173, 20, 0.02);
    }
    .sender-name.sender-system {
      color: var(--color-warning);
      font-weight: 600;
    }
  }
}

.message-card {
  background-color: var(--bg-primary);
  border-radius: 12px;
  border: 1px solid var(--border-primary);
  box-shadow: var(--shadow-sm);
  color: var(--text-primary);
  transition: all 0.3s ease;
  overflow: hidden;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px 8px 16px;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-secondary);
  transition: all 0.3s ease;

  .user-info {
    display: flex;
    align-items: center;
    gap: 10px;

    .avatar-container {
      position: relative;
      flex-shrink: 0;

      .user-avatar {
        flex-shrink: 0;
      }

      .online-indicator {
        position: absolute;
        bottom: -1px;
        right: -1px;
        width: 12px;
        height: 12px;
        background-color: var(--bg-primary);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);

        .status-icon {
          width: 8px;
          height: 8px;
        }
      }
    }

    .user-details {
      display: flex;
      align-items: center;
      gap: 8px;

      .sender-name {
        font-size: 14px;
        font-weight: 500;
        line-height: 1;
      }
    }
  }

  .time-info {
    display: flex;
    align-items: center;
    gap: 6px;

    .message-time {
      font-size: 12px;
      color: var(--text-tertiary);
      white-space: nowrap;
    }

    .status-icon {
      font-size: 12px;

      &.sending {
        color: var(--color-warning);
        animation: spin 1s linear infinite;
      }

      &.sent {
        color: var(--color-info);
      }

      &.delivered {
        color: var(--color-success);
      }

      &.error {
        color: var(--color-error);
      }
    }
  }
}

.message-content-box {
  padding: 12px 16px 16px 16px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.3s ease;

  .content-blocks {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .content-block {
    display: flex;
    flex-direction: column;
    gap: 8px;

    &.content-block-text {
      .text-content {
        font-size: 14px;
        line-height: 1.6;
        color: var(--text-primary);
        word-wrap: break-word;
        white-space: pre-wrap;
        margin: 0;

        // @mention 样式
        :deep(.mention) {
          color: var(--color-primary);
          background-color: rgba(59, 130, 246, 0.1);
          padding: 2px 4px;
          margin-right: 4px;
          border-radius: 4px;
          font-weight: 500;
          text-decoration: none;
          display: inline-block;
        }

        // 代码块样式
        :deep(code) {
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
          padding: 2px 4px;
          border-radius: 3px;
          font-family: 'JetBrains Mono', 'Consolas', monospace;
          font-size: 13px;
        }

        :deep(pre) {
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
          padding: 12px;
          border-radius: 6px;
          overflow-x: auto;
          margin: 8px 0;

          code {
            background: none;
            padding: 0;
          }
        }
      }
    }

    &.content-block-image {
      .image-content {
        margin-top: 0; // Remove top margin for image blocks
        display: flex;
        justify-content: flex-start;
        
        // 确保ImageMessage组件有合适的最大宽度
        :deep(.image-message) {
          max-width: 100%;
        }
      }
    }

    &.content-block-file {
      .file-content {
        .file-link {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-secondary);
          border-radius: 8px;
          text-decoration: none;
          color: var(--text-primary);
          transition: all 0.2s ease;
          
          &:hover {
            background: var(--bg-tertiary);
            border-color: var(--color-primary);
          }
          
          .file-icon {
            font-size: 16px;
          }
          
          .file-name {
            font-weight: 500;
            flex: 1;
          }
          
          .file-type {
            color: var(--text-secondary);
            font-size: 12px;
          }
        }
      }
    }
  }

  .text-content {
    font-size: 14px;
    line-height: 1.6;
    color: var(--text-primary);
    word-wrap: break-word;
    white-space: pre-wrap;
    margin: 0;

    // @mention 样式
    :deep(.mention) {
      color: var(--color-primary);
      background-color: rgba(59, 130, 246, 0.1);
      padding: 2px 4px;
      margin-right: 4px;
      border-radius: 4px;
      font-weight: 500;
      text-decoration: none;
      display: inline-block;
    }

    // 代码块样式
    :deep(code) {
      background-color: var(--bg-tertiary);
      color: var(--text-primary);
      padding: 2px 4px;
      border-radius: 3px;
      font-family: 'JetBrains Mono', 'Consolas', monospace;
      font-size: 13px;
    }

    :deep(pre) {
      background-color: var(--bg-tertiary);
      color: var(--text-primary);
      padding: 12px;
      border-radius: 6px;
      overflow-x: auto;
      margin: 8px 0;

      code {
        background: none;
        padding: 0;
      }
    }
  }

  .image-content {
    margin-top: 8px;
    display: flex;
    justify-content: flex-start;
    
    // 确保ImageMessage组件有合适的最大宽度
    :deep(.image-message) {
      max-width: 100%;
    }
    
    // 移除旧的message-image样式，因为现在使用ImageMessage组件
  }
}

.mixed-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  
  .text-content {
    padding: 8px 0;
    line-height: 1.5;
    word-wrap: break-word;
    white-space: pre-wrap;
  }
  
  .images-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
    
    .image-item {
      display: inline-block;
    }
  }
  
  .files-content {
    display: flex;
    flex-direction: column;
    gap: 6px;
    
    .file-item {
      .file-link {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: var(--bg-secondary);
        border: 1px solid var(--border-secondary);
        border-radius: 8px;
        text-decoration: none;
        color: var(--text-primary);
        transition: all 0.2s ease;
        
        &:hover {
          background: var(--bg-tertiary);
          border-color: var(--color-primary);
        }
        
        .file-icon {
          font-size: 16px;
        }
        
        .file-name {
          font-weight: 500;
          flex: 1;
        }
        
        .file-type {
          color: var(--text-secondary);
          font-size: 12px;
        }
      }
    }
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .message-item {
    padding: 6px 12px;
    margin-bottom: 6px;
  }

  .message-header {
    padding: 10px 12px 6px 12px;

    .user-info {
      gap: 8px;

      .user-details {
        gap: 6px;

        .sender-name {
          font-size: 13px;
        }
      }
    }

    .time-info {
      .message-time {
        font-size: 11px;
      }
    }
  }

  .message-content-box {
    padding: 10px 12px 12px 12px;

    .text-content {
      font-size: 13px;
      line-height: 1.5;
    }
  }
}
</style>
