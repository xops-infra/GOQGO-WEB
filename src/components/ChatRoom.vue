<template>
  <div class="chat-room">
    <!-- 聊天头部 -->
    <div class="chat-header">
      <div class="chat-title">
        <n-icon size="20" class="chat-icon">
          <svg viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3.04 1.05 4.35L1 22l5.65-2.05C8.96 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/>
          </svg>
        </n-icon>
        <span>{{ currentNamespace }} 聊天室</span>
      </div>
      <div class="online-status">
        <n-badge :value="onlineUsers.length" type="success">
          <n-icon size="18">
            <svg viewBox="0 0 24 24">
              <path fill="currentColor" d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.8 0-1.54.37-2.01 1.01L14 10l2 2v8h4zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm1.5 2h-2C3.57 8 2.46 9.04 2.07 10.39L1 15h2.5v7h4v-7H10l-1.07-4.61C8.54 9.04 7.43 8 6 8z"/>
            </svg>
          </n-icon>
        </n-badge>
      </div>
    </div>

    <!-- 消息列表 -->
    <div class="messages-container" ref="messagesContainer">
      <div class="messages-list">
        <div
          v-for="message in messages"
          :key="message.id"
          :class="['message-item', {
            'message-self': message.senderId === 'current-user',
            'message-other': message.senderId !== 'current-user',
            'message-system': message.type === 'system'
          }]"
        >
          <!-- 系统消息 -->
          <div v-if="message.type === 'system'" class="system-message">
            <span>{{ message.content }}</span>
          </div>
          
          <!-- 普通消息 -->
          <div v-else class="message-bubble-container">
            <!-- 头像 -->
            <div class="message-avatar">
              <n-avatar
                :size="36"
                :src="message.senderAvatar"
                :fallback-src="getDefaultAvatar(message.senderId)"
                round
              >
                {{ message.senderName.charAt(0) }}
              </n-avatar>
            </div>
            
            <!-- 消息内容 -->
            <div class="message-content">
              <!-- 发送者名称 -->
              <div v-if="message.senderId !== 'current-user'" class="sender-name">
                {{ message.senderName }}
              </div>
              
              <!-- 消息气泡 -->
              <div class="message-bubble">
                <div class="message-text">{{ message.content }}</div>
                <div class="message-time">
                  {{ formatTime(message.timestamp) }}
                  <n-icon
                    v-if="message.senderId === 'current-user'"
                    :size="12"
                    :class="['message-status', {
                      'status-sending': message.status === 'sending',
                      'status-sent': message.status === 'sent',
                      'status-error': message.status === 'error'
                    }]"
                  >
                    <svg v-if="message.status === 'sending'" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/>
                    </svg>
                    <svg v-else-if="message.status === 'sent'" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
                    </svg>
                    <svg v-else-if="message.status === 'error'" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                    </svg>
                  </n-icon>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 正在输入提示 -->
        <div v-if="typingUsers.length > 0" class="typing-indicator">
          <div class="typing-avatar">
            <n-avatar size="24" round>
              <n-icon size="12">
                <svg viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M7,9L12,14L17,9H7Z"/>
                </svg>
              </n-icon>
            </n-avatar>
          </div>
          <div class="typing-text">
            {{ typingUsers.join(', ') }} 正在输入...
            <div class="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <div class="input-container">
        <n-input
          v-model:value="inputMessage"
          type="textarea"
          :placeholder="isConnected ? '输入消息...' : '连接中...'"
          :disabled="!isConnected"
          :autosize="{ minRows: 1, maxRows: 4 }"
          @keydown="handleKeyDown"
          @input="handleInput"
          @blur="handleInputBlur"
          class="message-input"
        />
        <n-button
          type="primary"
          :disabled="!inputMessage.trim() || !isConnected"
          @click="handleSendMessage"
          class="send-button"
          circle
        >
          <n-icon size="18">
            <svg viewBox="0 0 24 24">
              <path fill="currentColor" d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
            </svg>
          </n-icon>
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { NIcon, NAvatar, NBadge, NInput, NButton } from 'naive-ui'
import { useChatStore } from '@/stores/chat'
import { storeToRefs } from 'pinia'

// Props
interface Props {
  namespace?: string
}

const props = withDefaults(defineProps<Props>(), {
  namespace: 'default'
})

// 状态管理
const chatStore = useChatStore()
const { messages, onlineUsers, typingUsers, isConnected, currentNamespace } = storeToRefs(chatStore)

// 响应式数据
const inputMessage = ref('')
const messagesContainer = ref<HTMLElement>()
const typingTimer = ref<NodeJS.Timeout>()

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
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
  } else if (date.toDateString() === now.toDateString()) { // 今天
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else {
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }
}

// 获取默认头像
const getDefaultAvatar = (senderId: string) => {
  const colors = ['#f56565', '#ed8936', '#ecc94b', '#48bb78', '#38b2ac', '#4299e1', '#667eea', '#9f7aea']
  const index = senderId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="36" fill="${colors[index]}" rx="18"/>
    </svg>
  `)}`
}

// 发送消息
const handleSendMessage = async () => {
  if (!inputMessage.value.trim()) return
  
  try {
    await chatStore.sendMessage(inputMessage.value)
    inputMessage.value = ''
    scrollToBottom()
  } catch (error) {
    message.error('发送消息失败')
  }
}

// 处理键盘事件
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSendMessage()
  }
}

// 处理输入事件（正在输入状态）
const handleInput = () => {
  chatStore.sendTyping(true)
  
  // 清除之前的定时器
  if (typingTimer.value) {
    clearTimeout(typingTimer.value)
  }
  
  // 设置新的定时器，1秒后停止输入状态
  typingTimer.value = setTimeout(() => {
    chatStore.sendTyping(false)
  }, 1000)
}

// 输入框失焦
const handleInputBlur = () => {
  chatStore.sendTyping(false)
  if (typingTimer.value) {
    clearTimeout(typingTimer.value)
  }
}

// 监听消息变化，自动滚动
watch(messages, () => {
  scrollToBottom()
}, { deep: true })

// 生命周期
onMounted(async () => {
  try {
    await chatStore.connect(props.namespace)
    scrollToBottom()
  } catch (error) {
    message.error('连接聊天室失败')
  }
})

onUnmounted(() => {
  chatStore.disconnect()
  if (typingTimer.value) {
    clearTimeout(typingTimer.value)
  }
})
</script>

<style scoped lang="scss">
.chat-room {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f5f5;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e5e5e5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  .chat-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: #333;

    .chat-icon {
      color: #07c160;
    }
  }

  .online-status {
    display: flex;
    align-items: center;
    color: #666;
  }
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 2px;
  }
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-item {
  &.message-system {
    display: flex;
    justify-content: center;
    
    .system-message {
      background: rgba(0, 0, 0, 0.1);
      color: #666;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
    }
  }

  &.message-self {
    .message-bubble-container {
      flex-direction: row-reverse;
      
      .message-content {
        align-items: flex-end;
        
        .message-bubble {
          background: #07c160;
          color: white;
          
          &::before {
            right: -6px;
            border-left-color: #07c160;
            border-right: none;
          }
        }
      }
    }
  }

  &.message-other {
    .message-bubble {
      background: white;
      color: #333;
      
      &::before {
        left: -6px;
        border-right-color: white;
        border-left: none;
      }
    }
  }
}

.message-bubble-container {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.message-avatar {
  flex-shrink: 0;
}

.message-content {
  display: flex;
  flex-direction: column;
  max-width: 70%;
  gap: 4px;
}

.sender-name {
  font-size: 12px;
  color: #666;
  padding: 0 12px;
}

.message-bubble {
  position: relative;
  padding: 8px 12px;
  border-radius: 18px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  word-wrap: break-word;
  
  &::before {
    content: '';
    position: absolute;
    top: 12px;
    width: 0;
    height: 0;
    border: 6px solid transparent;
  }
}

.message-text {
  line-height: 1.4;
  white-space: pre-wrap;
}

.message-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 4px;
  
  .message-item.message-other & {
    color: #999;
  }
}

.message-status {
  &.status-sending {
    color: rgba(255, 255, 255, 0.5);
    animation: spin 1s linear infinite;
  }
  
  &.status-sent {
    color: rgba(255, 255, 255, 0.7);
  }
  
  &.status-error {
    color: #ff4757;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  
  .typing-text {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #666;
  }
}

.typing-dots {
  display: flex;
  gap: 2px;
  
  span {
    width: 4px;
    height: 4px;
    background: #666;
    border-radius: 50%;
    animation: typing 1.4s infinite ease-in-out;
    
    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
  }
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.input-area {
  background: white;
  border-top: 1px solid #e5e5e5;
  padding: 12px 16px;
}

.input-container {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.message-input {
  flex: 1;
  
  :deep(.n-input__textarea) {
    border-radius: 20px;
    padding: 8px 16px;
    resize: none;
  }
}

.send-button {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  background: #07c160;
  
  &:hover {
    background: #06ad56;
  }
  
  &:disabled {
    background: #ccc;
  }
}
</style>
