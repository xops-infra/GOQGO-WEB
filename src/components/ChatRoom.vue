<template>
  <div
    class="chat-room"
    @dragover="handleDragOver"
    @drop="handleDrop"
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
    :class="{ 'drag-active': isDragActive }"
  >
    <!-- 8bit像素公仔背景动画 -->
    <ChatPixelCharacters />
    
    <!-- 拖拽覆盖层 -->
    <ChatDragOverlay v-if="isDragActive" />

    <!-- 消息列表区域 -->
    <MessagesContainer
      ref="messagesContainerRef"
      :messages="visibleMessages"
      :loading-history="isLoadingHistory"
      :has-more-history="hasMoreHistory"
      :should-show-divider="shouldShowDivider"
      :is-initial-load="isInitialLoad"
      @scroll="handleScroll"
      @load-more="loadMoreHistory"
      @scroll-to-message="scrollToMessage"
    />

    <!-- 聊天输入区域 -->
    <ChatInputContainer
      ref="chatInputRef"
      :is-connected="isConnected"
      :namespace="namespace"
      @send="handleSendMessage"
      @send-image="handleSendImage"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useMessage } from 'naive-ui'
import { useChatStore } from '@/stores/chat'
import { useUserStore } from '@/stores/user'
import { useChatRoom } from '@/composables/useChatRoom'
import ChatDragOverlay from './chat-room/ChatDragOverlay.vue'
import MessagesContainer from './chat-room/MessagesContainer.vue'
import ChatInputContainer from './chat-room/ChatInputContainer.vue'
import ChatPixelCharacters from './ChatPixelCharacters.vue'
import type { Message } from '@/types/api'

interface Props {
  namespace?: string
  chatId?: string
  autoScroll?: boolean
  maxVisibleMessages?: number
}

const props = withDefaults(defineProps<Props>(), {
  namespace: 'default',
  chatId: 'default',
  autoScroll: true,
  maxVisibleMessages: 50
})

const emit = defineEmits<{
  'message-sent': [message: Message]
  'scroll-change': [isAtBottom: boolean]
}>()

const message = useMessage()
const chatStore = useChatStore()
const userStore = useUserStore()
const { currentUser } = storeToRefs(userStore)

// 组件引用
const messagesContainerRef = ref()
const chatInputRef = ref()

// 使用聊天室组合式函数
const {
  // 响应式数据
  isDragActive,
  isLoadingHistory,
  isInitialLoad,
  shouldAutoScroll,
  isUserScrolling,
  
  // 计算属性
  messages,
  visibleMessages,
  hasMoreHistory,
  shouldShowDivider,
  isConnected,
  
  // 方法
  handleDragOver,
  handleDrop,
  handleDragEnter,
  handleDragLeave,
  handleScroll,
  loadMoreHistory,
  scrollToMessage,
  handleSendMessage,
  handleSendImage,
  
  // 生命周期
  initializeChatRoom,
  cleanupChatRoom
} = useChatRoom(props, emit)

// 生命周期
onMounted(() => {
  initializeChatRoom()
})

onUnmounted(() => {
  cleanupChatRoom()
})

// 监听消息变化，自动滚动到底部
watch(() => messages.value.length, () => {
  if (shouldAutoScroll.value && !isUserScrolling.value) {
    nextTick(() => {
      messagesContainerRef.value?.scrollToBottom()
    })
  }
}, { flush: 'post' })
</script>

<style scoped lang="scss">
.chat-room {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  position: relative;
  overflow: hidden;
  z-index: 1; // 确保内容在像素公仔之上
  
  &.drag-active {
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(var(--color-success-rgb), 0.05);
      border: 2px dashed var(--color-success);
      border-radius: 8px;
      z-index: 10;
      pointer-events: none;
    }
  }
}

// Terminal主题样式
[data-theme='terminal'] .chat-room {
  background: var(--terminal-bg);
  
  &.drag-active {
    &::before {
      background: rgba(0, 255, 65, 0.05);
      border-color: var(--pixel-green);
    }
  }
}
</style>
