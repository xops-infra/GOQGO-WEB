<template>
  <div class="messages-container">
    <!-- 消息工具栏 -->
    <MessagesToolbar
      :message-count="messages.length"
      :messages="messages"
      @scroll-to-message="$emit('scroll-to-message', $event)"
    />

    <!-- 消息列表 -->
    <div
      ref="messagesListRef"
      class="messages-list"
      :class="{
        'has-history-status': loadingHistory || (!hasMoreHistory && messages.length > 0),
        'no-scroll-animation': isInitialLoad
      }"
      @scroll="$emit('scroll', $event)"
    >
      <!-- 历史消息加载提示 -->
      <div v-if="loadingHistory" class="loading-history">
        <n-spin size="small" />
        <span>加载历史消息...</span>
      </div>

      <!-- 历史消息分割线 -->
      <div v-else-if="shouldShowDivider" class="history-divider">
        <div class="divider-line"></div>
        <span class="divider-text">历史消息</span>
        <div class="divider-line"></div>
      </div>

      <!-- 无更多历史消息提示 -->
      <div v-else-if="!hasMoreHistory && messages.length > 0" class="no-more-history">
        <n-icon size="16" color="var(--text-tertiary)">
          <HistoryIcon />
        </n-icon>
        <span>已显示全部消息</span>
      </div>

      <!-- 消息列表 -->
      <div class="messages-content">
        <MessageItem
          v-for="(message, index) in messages"
          :key="message.id"
          :message="message"
          :previous-message="index > 0 ? messages[index - 1] : null"
          :next-message="index < messages.length - 1 ? messages[index + 1] : null"
          :show-avatar="shouldShowAvatar(message, index)"
          :show-timestamp="shouldShowTimestamp(message, index)"
          @retry="handleRetryMessage"
          @delete="handleDeleteMessage"
        />
      </div>

      <!-- 空状态 -->
      <div v-if="messages.length === 0 && !loadingHistory" class="empty-messages">
        <div class="empty-icon">
          <n-icon size="48" color="var(--text-tertiary)">
            <EmptyMessagesIcon />
          </n-icon>
        </div>
        <h3>暂无消息</h3>
        <p>开始对话吧！输入消息或拖拽图片到此处。</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { NSpin, NIcon, useMessage } from 'naive-ui'
import MessagesToolbar from './MessagesToolbar.vue'
import MessageItem from './MessageItem.vue'
import HistoryIcon from '@/components/icons/HistoryIcon.vue'
import EmptyMessagesIcon from '@/components/icons/EmptyMessagesIcon.vue'
import type { Message } from '@/types/api'

interface Props {
  messages: Message[]
  loadingHistory: boolean
  hasMoreHistory: boolean
  shouldShowDivider: boolean
  isInitialLoad: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  scroll: [event: Event]
  'load-more': []
  'scroll-to-message': [messageId: string]
}>()

const message = useMessage()
const messagesListRef = ref<HTMLElement>()

// 方法
const shouldShowAvatar = (currentMessage: Message, index: number) => {
  if (index === 0) return true
  
  const previousMessage = props.messages[index - 1]
  return previousMessage.sender !== currentMessage.sender
}

const shouldShowTimestamp = (currentMessage: Message, index: number) => {
  if (index === 0) return true
  
  const previousMessage = props.messages[index - 1]
  const timeDiff = new Date(currentMessage.timestamp).getTime() - 
                   new Date(previousMessage.timestamp).getTime()
  
  // 如果时间间隔超过5分钟，显示时间戳
  return timeDiff > 5 * 60 * 1000
}

const handleRetryMessage = async (messageId: string) => {
  try {
    // 重试发送消息的逻辑
    message.success('消息重发成功')
  } catch (error) {
    message.error('消息重发失败')
  }
}

const handleDeleteMessage = async (messageId: string) => {
  try {
    // 删除消息的逻辑
    message.success('消息已删除')
  } catch (error) {
    message.error('删除消息失败')
  }
}

const scrollToBottom = () => {
  if (messagesListRef.value) {
    messagesListRef.value.scrollTop = messagesListRef.value.scrollHeight
  }
}

// 暴露方法给父组件
defineExpose({
  scrollToBottom
})
</script>

<style scoped lang="scss">
.messages-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.messages-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px;
  scroll-behavior: smooth;
  
  &.no-scroll-animation {
    scroll-behavior: auto;
  }
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--bg-tertiary);
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border-secondary);
    border-radius: 4px;
    
    &:hover {
      background: var(--border-primary);
    }
  }
}

.loading-history {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  color: var(--text-secondary);
  font-size: 13px;
}

.history-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
  margin: 8px 0;
  
  .divider-line {
    flex: 1;
    height: 1px;
    background: var(--border-secondary);
  }
  
  .divider-text {
    font-size: 12px;
    color: var(--text-tertiary);
    font-weight: 500;
    padding: 0 8px;
    background: var(--bg-primary);
  }
}

.no-more-history {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px;
  color: var(--text-tertiary);
  font-size: 12px;
}

.messages-content {
  padding: 8px 0;
}

.empty-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  
  .empty-icon {
    margin-bottom: 24px;
  }
  
  h3 {
    margin: 0 0 12px 0;
    font-size: 18px;
    color: var(--text-primary);
  }
  
  p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 14px;
    line-height: 1.5;
    max-width: 300px;
  }
}

// Terminal主题样式
[data-theme='terminal'] .messages-list {
  &::-webkit-scrollbar-track {
    background: var(--terminal-bg-tertiary);
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--terminal-border);
    
    &:hover {
      background: var(--pixel-green);
    }
  }
}

[data-theme='terminal'] .loading-history,
[data-theme='terminal'] .no-more-history {
  color: var(--terminal-text-secondary);
  font-family: var(--font-mono);
}

[data-theme='terminal'] .history-divider {
  .divider-line {
    background: var(--terminal-border);
  }
  
  .divider-text {
    color: var(--terminal-text-tertiary);
    font-family: var(--font-mono);
    background: var(--terminal-bg);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
}

[data-theme='terminal'] .empty-messages {
  h3, p {
    color: var(--terminal-text);
    font-family: var(--font-mono);
  }
  
  h3 {
    text-transform: uppercase;
    letter-spacing: 1px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .messages-list {
    padding: 0 12px;
  }
  
  .empty-messages {
    padding: 60px 16px;
    
    h3 {
      font-size: 16px;
    }
    
    p {
      font-size: 13px;
    }
  }
}
</style>
