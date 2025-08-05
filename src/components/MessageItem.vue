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
          <n-icon 
            v-if="statusIcon" 
            :class="statusIconClass" 
            :title="statusTitle"
            @click="handleStatusClick"
          >
            <component :is="statusIcon" />
          </n-icon>
        </div>
      </div>

      <!-- 消息内容框 -->
      <div class="message-content-box">
        <!-- 思考状态消息 -->
        <div v-if="message.isThinking" class="thinking-content">
          <div class="simple-thinking-display">
            <div class="thinking-header">
              <div class="agent-name">{{ message.senderName }}</div>
              <div class="thinking-animation">
                <span class="dot">●</span>
                <span class="dot">●</span>
                <span class="dot">●</span>
                <span class="thinking-text">{{ cleanThinkingContent(message.thinkingContent) || '正在思考...' }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 普通消息内容 -->
        <div v-else class="markdown-content">
          <MarkdownRenderer :content="message.content || ''" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useChatStore } from '@/stores/chat'
import { formatRelativeTime, useTimeManager } from '@/utils/timeManager'
import MarkdownRenderer from './MarkdownRenderer.vue'
import ThinkingMessage from './ThinkingMessage.vue'
import type { ChatMessage } from '@/types/api'
import { useUserStore } from '@/stores/user'

// Props定义
interface Props {
  message: ChatMessage
}

const props = defineProps<Props>()

// Emit定义
const emit = defineEmits<{
  resend: [message: ChatMessage]
}>()

// 获取聊天store中的在线用户列表
const chatStore = useChatStore()
const { onlineUsers } = storeToRefs(chatStore)

// 获取用户store中的当前用户名
const userStore = useUserStore()

// 使用时间管理器
const { currentTime, cleanup } = useTimeManager()

// 清理ANSI转义序列的方法
const cleanThinkingContent = (content: string | undefined): string => {
  if (!content) return '正在思考...'
  
  // 移除ANSI转义序列
  // \u001B 是ESC字符，[?25l 是隐藏光标，[?25h 是显示光标等
  return content
    .replace(/\u001B\[[?]?[0-9;]*[a-zA-Z]/g, '') // 移除ANSI转义序列
    .replace(/\u001B\[[?]?[0-9;]*[hlm]/g, '')    // 移除其他控制序列
    .replace(/[\u0000-\u001F\u007F]/g, '')           // 移除其他控制字符
    .trim() || '正在思考...'
}

// 生命周期
onMounted(() => {
  // 时间管理器已在useTimeManager中自动启动
})

onUnmounted(() => {
  // 清理时间管理器
  cleanup()
})

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

// 时间格式化 - 响应式更新
const formattedTime = computed(() => {
  const timestamp = props.message?.timestamp
  if (!timestamp) return '未知时间'
  
  // 使用currentTime.value来触发响应式更新
  return formatRelativeTime(timestamp, currentTime.value)
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
          d: 'M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z'
        }),
        h('path', { 
          fill: 'currentColor', 
          d: 'M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z'
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
    'error': status === 'error',
    'clickable': status === 'error'
  }
})

const statusTitle = computed(() => {
  const status = messageStatus.value
  switch (status) {
    case 'sending': return '发送中'
    case 'sent': return '已发送'
    case 'delivered': return '已送达'
    case 'error': return '发送失败，点击重新发送'
    default: return ''
  }
})

// 提取命名空间
const extractNamespace = (senderName: string): string => {
  // 如果senderName包含点号，提取命名空间部分
  const parts = senderName.split('.')
  return parts.length > 1 ? parts[parts.length - 1] : 'default'
}

// 处理状态图标点击
const handleStatusClick = () => {
  const status = messageStatus.value
  if (status === 'error') {
    // 发送失败时，触发重新发送
    emit('resend', props.message)
  }
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

  // 思考状态消息样式
  .thinking-content {
    padding: 8px 0;
    
    // 为思考消息添加特殊的背景色
    .message-card {
      background-color: rgba(24, 144, 255, 0.02);
      border-left: 3px solid var(--color-info);
    }
    
    .simple-thinking-display {
      padding: 12px 16px;
      background-color: rgba(24, 144, 255, 0.05);
      border-radius: 8px;
      border-left: 3px solid var(--color-info);
      
      .thinking-header {
        display: flex;
        flex-direction: column;
        gap: 8px;
        
        .agent-name {
          font-weight: 600;
          color: var(--color-info);
          font-size: 14px;
        }
        
        .thinking-animation {
          display: flex;
          align-items: center;
          gap: 4px;
          
          .dot {
            color: var(--color-info);
            animation: thinking-pulse 1.5s infinite;
            
            &:nth-child(1) { animation-delay: 0s; }
            &:nth-child(2) { animation-delay: 0.3s; }
            &:nth-child(3) { animation-delay: 0.6s; }
          }
          
          .thinking-text {
            margin-left: 8px;
            color: var(--text-secondary);
            font-style: italic;
            font-size: 13px;
          }
        }
      }
    }
  }
}

@keyframes thinking-pulse {
  0%, 60%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  30% {
    opacity: 1;
    transform: scale(1.2);
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
      transition: all 0.2s ease;

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

      &.clickable {
        cursor: pointer;
        padding: 2px;
        border-radius: 3px;
        
        &:hover {
          background-color: var(--bg-hover);
          transform: scale(1.1);
        }
        
        &:active {
          transform: scale(0.95);
        }
      }
    }
  }
}

.message-content-box {
  padding: 12px 16px 16px 16px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.3s ease;

  .markdown-content {
    font-size: 14px;
    line-height: 1.6;
    color: var(--text-primary);
    word-wrap: break-word;
    
    // 确保 Markdown 渲染器的样式正确应用
    :deep(.markdown-content) {
      margin: 0;
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

    .markdown-content {
      font-size: 13px;
      line-height: 1.5;
    }
  }
}
</style>
