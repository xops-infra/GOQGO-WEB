<template>
  <div class="message-item" :data-message-id="message.id">
    <div class="message-content">
      <!-- 文本消息 -->
      <template v-if="message.type === 'text'">
        <div class="text-content">{{ message.content }}</div>
      </template>
      
      <!-- 图片消息 -->
      <template v-else-if="message.type === 'image'">
        <div class="image-content" @click="handleImageClick">
          <img :src="message.content" :alt="message.sender" />
        </div>
      </template>
    </div>
    <div class="message-meta">
      <span class="sender">{{ message.sender }}</span>
      <span class="time">{{ formatTime(message.timestamp) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMessage } from 'naive-ui'

interface Message {
  id: string
  type: 'text' | 'image'
  content: string
  sender: string
  senderId: string
  timestamp: number
}

const props = defineProps<{
  message: Message
}>()

const message = useMessage()

// 处理图片点击
const handleImageClick = () => {
  if (props.message.type === 'image') {
    // 在新窗口打开图片
    window.open(props.message.content, '_blank')
  }
}

// 格式化时间
const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
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
