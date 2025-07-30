<template>
  <div class="chat-room" 
       @dragover="handleDragOver" 
       @drop="handleDrop"
       @dragenter="handleDragEnter"
       @dragleave="handleDragLeave"
       :class="{ 'drag-active': isDragActive }">
    
    <!-- 拖拽覆盖层 -->
    <div v-if="isDragActive" class="drag-overlay">
      <div class="drag-content">
        <n-icon size="48" color="#07c160">
          <svg viewBox="0 0 24 24">
            <path fill="currentColor" d="M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19M21,19L16,10L11,17L7,13L3,19H21Z"/>
          </svg>
        </n-icon>
        <h3>释放文件以上传图片</h3>
        <p>支持 PNG, JPG, GIF 等图片格式</p>
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
          }]"
        >
          <MessageItem :message="message" />
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <ChatInput 
      :is-connected="isConnected" 
      @send="handleSend"
      @send-image="handleSendImage"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useChatStore } from '@/stores/chat'
import { useMessage } from 'naive-ui'
import MessageItem from './MessageItem.vue'
import ChatInput from './ChatInput.vue'

// Props
interface Props {
  namespace: string
}

const props = withDefaults(defineProps<Props>(), {
  namespace: 'default'
})

// 状态管理
const chatStore = useChatStore()
const { messages, onlineUsers, typingUsers, isConnected } = storeToRefs(chatStore)
const message = useMessage()

// 响应式数据
const messagesContainer = ref<HTMLElement>()
const isDragActive = ref(false)
const dragCounter = ref(0)

// 处理发送消息
const handleSend = async (text: string) => {
  try {
    await chatStore.sendMessage(text)
    scrollToBottom()
  } catch (error) {
    console.error('发送消息失败:', error)
    message.error('发送失败')
  }
}

// 处理发送图片
const handleSendImage = async (imageUrl: string) => {
  try {
    await chatStore.sendImageMessage(imageUrl)
    scrollToBottom()
  } catch (error) {
    console.error('发送图片失败:', error)
    message.error('发送图片失败')
  }
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 处理拖拽相关事件
const handleDragEnter = (e: DragEvent) => {
  e.preventDefault()
  dragCounter.value++
  if (dragCounter.value === 1) {
    isDragActive.value = true
  }
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  dragCounter.value--
  if (dragCounter.value === 0) {
    isDragActive.value = false
  }
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  e.dataTransfer!.dropEffect = 'copy'
}

const handleDrop = async (e: DragEvent) => {
  e.preventDefault()
  isDragActive.value = false
  dragCounter.value = 0
  
  if (!e.dataTransfer?.files.length) return
  
  const file = e.dataTransfer.files[0]
  if (!file.type.startsWith('image/')) {
    message.warning('请拖拽图片文件')
    return
  }
  
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch('http://localhost:8080/api/v1/upload', {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) throw new Error('上传失败')
    
    const data = await response.json()
    await handleSendImage(data.url)
  } catch (error) {
    console.error('处理拖拽图片失败:', error)
    message.error('上传失败')
  }
}

// 生命周期
onMounted(async () => {
  try {
    await chatStore.connect(props.namespace)
    scrollToBottom()
  } catch (error) {
    console.error('连接聊天室失败:', error)
    message.error('连接失败')
  }
})

onUnmounted(() => {
  chatStore.disconnect()
})
</script>

<style scoped lang="scss">
.chat-room {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f5f5;
  position: relative;
  
  &.drag-active {
    .drag-overlay {
      opacity: 1;
      visibility: visible;
    }
  }
}

.drag-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(7, 193, 96, 0.1);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  border: 3px dashed #07c160;
  border-radius: 8px;
  margin: 8px;
  
  .drag-content {
    text-align: center;
    color: #07c160;
    
    h3 {
      margin: 16px 0 8px 0;
      font-size: 20px;
      font-weight: 600;
    }
    
    p {
      margin: 0;
      font-size: 14px;
      opacity: 0.8;
    }
  }
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  
  .messages-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
}

.message-item {
  &.message-self {
    align-self: flex-end;
  }
  
  &.message-other {
    align-self: flex-start;
  }
}
</style>
