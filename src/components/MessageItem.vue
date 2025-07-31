<template>
  <div class="message-item" :data-message-id="message.id" :class="messageClasses">
    <!-- 消息卡片 -->
    <div class="message-card">
      <!-- 用户信息头部 -->
      <div class="message-header">
        <div class="user-info">
          <div class="avatar-container">
            <n-avatar 
              :size="28" 
              :src="message.senderAvatar" 
              :fallback-src="getDefaultAvatar(message.type)"
              :color="getAvatarColor(message.senderName, message.type)"
              round
              class="user-avatar"
            >
              {{ getAvatarText(message.senderName) }}
            </n-avatar>
            <!-- 在线状态指示器 -->
            <div 
              v-if="message.type === 'user' || message.type === 'agent'" 
              class="online-indicator"
              :class="{ 
                'online': isUserOnline(message.senderName),
                'offline': !isUserOnline(message.senderName)
              }"
              :title="isUserOnline(message.senderName) ? '在线' : '离线'"
            >
              <!-- 在线状态图标 -->
              <svg v-if="isUserOnline(message.senderName)" viewBox="0 0 8 8" class="status-icon">
                <circle cx="4" cy="4" r="3" fill="#52c41a"/>
              </svg>
              <!-- 离线状态图标 -->
              <svg v-else viewBox="0 0 8 8" class="status-icon">
                <circle cx="4" cy="4" r="3" fill="#8c8c8c"/>
              </svg>
            </div>
          </div>
          <div class="user-details">
            <span class="sender-name" :class="getSenderClass(message.type)">
              {{ message.senderName }}
            </span>
            <n-tag v-if="message.type !== 'user'" :type="getTypeTagColor(message.type)" size="small" round>
              {{ getTypeLabel(message.type) }}
            </n-tag>
          </div>
        </div>
        <div class="time-info">
          <span class="message-time">{{ formatTime }}</span>
          <!-- 消息状态 -->
          <n-icon v-if="message.status === 'sending'" class="status-icon sending">
            <svg viewBox="0 0 16 16">
              <path fill="currentColor" d="M8,2V4.5A5.5,5.5 0 0,0 2.5,10H0A8,8 0 0,1 8,2Z"/>
            </svg>
          </n-icon>
          <n-icon v-else-if="message.status === 'error'" class="status-icon error">
            <svg viewBox="0 0 16 16">
              <path fill="currentColor" d="M8,0L9.5,6L16,7L9.5,8L8,14L6.5,8L0,7L6.5,6L8,0Z"/>
            </svg>
          </n-icon>
        </div>
      </div>

      <!-- 消息内容框 -->
      <div class="message-content-box">
        <!-- 调试信息 -->
        <div v-if="false" style="background: #f0f0f0; padding: 4px; font-size: 12px; margin-bottom: 8px;">
          调试: messageType={{ message.messageType }}, content={{ message.content }}
        </div>
        
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useChatStore } from '@/stores/chat'
import { useTimeManager, formatRelativeTime } from '@/utils/timeManager'
import type { ChatMessage } from '@/types/api'

const props = defineProps<{
  message: ChatMessage
}>()

// 调试日志
console.log('📨 MessageItem 渲染消息:', {
  id: props.message.id,
  messageType: props.message.messageType,
  content: props.message.content,
  imageUrl: props.message.imageUrl
})

// 获取聊天store中的在线用户列表
const chatStore = useChatStore()
const { onlineUsers } = storeToRefs(chatStore)

// 使用全局时间管理器
const { currentTime, cleanup } = useTimeManager()

// 消息样式类
const messageClasses = computed(() => ({
  'message-user': props.message.type === 'user',
  'message-agent': props.message.type === 'agent', 
  'message-system': props.message.type === 'system'
}))

// 判断用户是否在线
const isUserOnline = (senderName: string) => {
  return onlineUsers.value.includes(senderName)
}

// 获取头像颜色
const getAvatarColor = (senderName: string, type: string) => {
  // 系统消息始终使用默认颜色
  if (type === 'system') {
    return '#faad14'
  }
  
  // 根据在线状态设置颜色
  if (isUserOnline(senderName)) {
    // 在线用户使用彩色
    if (type === 'user') {
      return '#1890ff'
    } else if (type === 'agent') {
      return '#52c41a'
    }
  } else {
    // 离线用户使用灰色
    return '#8c8c8c'
  }
  
  return undefined
}

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

// 格式化消息内容，处理 @mention 和文件链接
const formatMessageContent = (content: string) => {
  console.log('🔧 formatMessageContent 输入:', content)
  
  const result = content
    // 处理文件链接格式：[图片]URL, [视频]URL, [文件]URL 等
    .replace(/\[([^\]]+)\](https?:\/\/[^\s]+)/g, (match, type, url) => {
      console.log('🔍 匹配到文件链接:', { match, type, url })
      const decodedType = decodeURIComponent(type)
      const cleanUrl = url.trim()
      
      console.log('📝 处理文件:', { decodedType, cleanUrl })
      
      // 根据文件类型生成不同的HTML
      if (decodedType === '图片') {
        const imageHtml = `<div class="inline-image-container">
          <img src="${cleanUrl}" alt="图片" class="inline-image" onclick="window.open('${cleanUrl}', '_blank')" />
          <div class="image-overlay">
            <span class="image-label">${decodedType}</span>
          </div>
        </div>`
        console.log('🖼️ 生成图片HTML:', imageHtml)
        return imageHtml
      } else {
        // 其他文件类型保持原有处理
        const fileIcons = {
          '视频': '🎥',
          '音频': '🎵',
          'PDF': '📄',
          '文档': '📝',
          '表格': '📊',
          '演示': '📽️',
          '压缩包': '📦',
          '文件': '📎'
        }
        const icon = fileIcons[decodedType] || '📎'
        
        const fileHtml = `<div class="file-link generic-file">
          <a href="${cleanUrl}" target="_blank" class="file-link-content">
            <span class="file-icon">${icon}</span>
            <span class="file-type">${decodedType}</span>
            <span class="file-url">${cleanUrl}</span>
          </a>
        </div>`
        console.log('📎 生成文件HTML:', fileHtml)
        return fileHtml
      }
    })
    // 处理 @mention，只匹配 @ 后面的单词字符，保持原有空格
    .replace(/@(\w+)(\s|$)/g, '<span class="mention">@$1</span>$2')
    // 处理换行
    .replace(/\n/g, '<br>')
  
  console.log('✅ formatMessageContent 输出:', result)
  return result
}

// 处理图片点击
const handleImageClick = () => {
  if (props.message.messageType === 'image') {
    window.open(props.message.imageUrl || props.message.content, '_blank')
  }
}

// 响应式的时间格式化函数
const formatTime = computed(() => {
  return formatRelativeTime(props.message.timestamp, currentTime.value)
})

// 生命周期
onUnmounted(() => {
  cleanup()
})
</script>

<style scoped lang="scss">
.message-item {
  padding: 8px 16px;
  margin-bottom: 8px;

  // 用户消息样式
  &.message-user {
    .sender-name.sender-user {
      color: #1890ff;
      font-weight: 600;
    }
  }

  // Agent 消息样式
  &.message-agent {
    .message-card {
      background-color: rgba(82, 196, 26, 0.02);
    }
    .sender-name.sender-agent {
      color: #52c41a;
      font-weight: 600;
    }
  }

  // 系统消息样式
  &.message-system {
    .message-card {
      background-color: rgba(250, 173, 20, 0.02);
    }
    .sender-name.sender-system {
      color: #faad14;
      font-weight: 600;
    }
  }
}

.message-card {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
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
  background: rgba(0, 0, 0, 0.01);
  border-bottom: 1px solid #f5f5f5;

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
        background: #ffffff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        
        .status-icon {
          width: 8px;
          height: 8px;
        }
        
        &.online {
          .status-icon circle {
            fill: #52c41a;
          }
        }
        
        &.offline {
          .status-icon circle {
            fill: #8c8c8c;
          }
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
      color: #8c8c8c;
      white-space: nowrap;
    }

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
}

.message-content-box {
  padding: 12px 16px 16px 16px;
  background: #ffffff;

  .text-content {
    font-size: 14px;
    line-height: 1.6;
    color: #262626;
    word-wrap: break-word;
    white-space: pre-wrap;
    margin: 0;

    // @mention 样式
    :deep(.mention) {
      color: #1890ff;
      background-color: rgba(24, 144, 255, 0.1);
      padding: 2px 4px;
      margin-right: 4px;
      border-radius: 4px;
      font-weight: 500;
      text-decoration: none;
      display: inline-block;
    }

    // 代码块样式
    :deep(code) {
      background-color: #f6f8fa;
      padding: 2px 4px;
      border-radius: 3px;
      font-family: 'JetBrains Mono', 'Consolas', monospace;
      font-size: 13px;
    }

    :deep(pre) {
      background-color: #f6f8fa;
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
    margin-top: 4px;
    cursor: pointer;
    
    img {
      max-width: 100%;
      max-height: 300px;
      border-radius: 8px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;

      &:hover {
        transform: scale(1.02);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      }
    }
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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

// 文件链接样式
:deep(.file-link) {
  display: inline-block;
  margin: 8px 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  max-width: 100%;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  .file-link-content {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    text-decoration: none;
    color: inherit;
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    gap: 12px;
    min-width: 0;

    .file-icon {
      font-size: 20px;
      flex-shrink: 0;
    }

    .file-type {
      font-weight: 600;
      color: #495057;
      flex-shrink: 0;
    }

    .file-url {
      font-size: 12px;
      color: #6c757d;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      min-width: 0;
    }
  }

  &.video-link .file-link-content {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;

    .file-type, .file-url {
      color: rgba(255, 255, 255, 0.9);
    }
  }

  &.audio-link .file-link-content {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
    border: none;

    .file-type, .file-url {
      color: rgba(255, 255, 255, 0.9);
    }
  }

  &.generic-file .file-link-content {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    color: white;
    border: none;

    .file-type, .file-url {
      color: rgba(255, 255, 255, 0.9);
    }
  }
}

// 内联图片样式
:deep(.inline-image-container) {
  position: relative;
  display: inline-block;
  margin: 8px 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);

    .image-overlay {
      opacity: 1;
    }
  }

  .inline-image {
    max-width: 300px;
    max-height: 200px;
    width: auto;
    height: auto;
    display: block;
    border-radius: 12px;
  }

  .image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.1));
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;

    .image-label {
      background: rgba(255, 255, 255, 0.9);
      color: #333;
      padding: 4px 8px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 600;
      backdrop-filter: blur(4px);
    }
  }
}
</style>
