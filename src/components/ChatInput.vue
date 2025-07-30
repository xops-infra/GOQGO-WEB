<template>
  <div class="chat-input">
    <!-- 图片预览区域 -->
    <div v-if="imagePreviews.length > 0" class="image-preview-area">
      <TransitionGroup name="image-list">
        <div 
          v-for="(preview, index) in imagePreviews" 
          :key="preview.url"
          class="image-preview-item"
          @mouseenter="hoveredIndex = index"
          @mouseleave="hoveredIndex = -1"
        >
          <img :src="preview.url" @click="handlePreviewClick(preview)" />
          <div v-show="hoveredIndex === index" class="image-actions">
            <div class="delete-btn" @click="removeImage(index)">
              <n-icon size="16">
                <svg viewBox="0 0 24 24">
                  <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                </svg>
              </n-icon>
            </div>
          </div>
          <div class="image-size">{{ formatFileSize(preview.file.size) }}</div>
        </div>
      </TransitionGroup>
    </div>

    <!-- 输入区域 -->
    <div class="input-container">
      <n-input
        v-model:value="inputMessage"
        type="textarea"
        :placeholder="isConnected ? '输入消息... (支持粘贴图片 Ctrl+V 或拖拽文件)' : '连接中...'"
        :disabled="!isConnected"
        :autosize="{ minRows: 1, maxRows: 4 }"
        @keydown="handleKeyDown"
        @paste="handlePaste"
        @input="handleInput"
        @blur="handleInputBlur"
        class="message-input"
        ref="inputRef"
      />
      <div class="input-actions">
        <n-button
          text
          @click="handleImageUpload"
          class="image-button"
          :disabled="!isConnected"
          v-tooltip="'发送图片'"
        >
          <n-icon size="18">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path fill="currentColor" d="M19.5 12c.277 0 .5.223.5.5v4c0 1.375-1.125 2.5-2.5 2.5h-11c-1.375 0-2.5-1.125-2.5-2.5v-4c0-.277.223-.5.5-.5s.5.223.5.5v4c0 .825.675 1.5 1.5 1.5h11c.825 0 1.5-.675 1.5-1.5v-4c0-.277.223-.5.5-.5zM12 4c.277 0 .5.223.5.5v7.793l3.146-3.147c.196-.195.512-.195.708 0s.195.512 0 .708l-4 4c-.196.195-.512.195-.708 0l-4-4c-.195-.196-.195-.512 0-.708s.512-.195.708 0l3.146 3.147V4.5c0-.277.223-.5.5-.5z"/>
            </svg>
          </n-icon>
        </n-button>
        <n-button
          type="primary"
          :disabled="!canSendMessage"
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

    <!-- 图片预览弹窗 -->
    <n-modal
      v-model:show="showImagePreview"
      preset="card"
      style="width: auto; max-width: 90vw;"
      :mask-closable="true"
      :close-on-esc="true"
    >
      <img :src="previewImageUrl" style="max-width: 100%; max-height: 80vh;" />
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useChatStore } from '@/stores/chat'
import { storeToRefs } from 'pinia'
import { useMessage, useTooltip } from 'naive-ui'

const props = defineProps<{
  isConnected: boolean
}>()

const emit = defineEmits<{
  (e: 'send', message: string): void
  (e: 'send-image', url: string): void
}>()

// 状态管理
const chatStore = useChatStore()
const message = useMessage()

// 响应式数据
const inputMessage = ref('')
const inputRef = ref()
const imagePreviews = ref<Array<{ url: string; name: string; file: File }>>([])
const hoveredIndex = ref(-1)
const showImagePreview = ref(false)
const previewImageUrl = ref('')

// 计算属性
const canSendMessage = computed(() => {
  return (inputMessage.value.trim() || imagePreviews.value.length > 0) && props.isConnected
})

// 处理图片预览点击
const handlePreviewClick = (preview: { url: string }) => {
  previewImageUrl.value = preview.url
  showImagePreview.value = true
}

// 移除图片
const removeImage = (index: number) => {
  const preview = imagePreviews.value[index]
  URL.revokeObjectURL(preview.url)
  imagePreviews.value.splice(index, 1)
}

// 处理图片粘贴
const handlePaste = async (e: ClipboardEvent) => {
  console.log('=== 图片粘贴事件开始 ===')
  
  if (!e.clipboardData) {
    console.log('❌ 没有剪贴板数据')
    return
  }
  
  const items = Array.from(e.clipboardData.items)
  console.log('📋 剪贴板项目:', items.map(item => ({ type: item.type, kind: item.kind })))
  
  try {
    // 检查是否有图片数据
    const imageItems = items.filter(item => item.type.startsWith('image/'))
    
    for (const imageItem of imageItems) {
      console.log('🖼️ 找到图片项目:', imageItem.type)
      e.preventDefault() // 阻止默认粘贴行为
      
      const file = imageItem.getAsFile()
      if (file) {
        console.log('📄 获取到图片文件:', file.name, file.type, file.size)
        
        // 创建预览URL
        const url = URL.createObjectURL(file)
        imagePreviews.value.push({
          url,
          name: file.name || `image_${Date.now()}.${getFileExtension(file.type)}`,
          file
        })
        
        console.log('✅ 创建图片预览:', imagePreviews.value)
      }
    }
  } catch (error) {
    console.error('❌ 处理图片粘贴失败:', error)
    message.error('图片粘贴失败')
  }
}

// 发送消息
const handleSendMessage = async () => {
  if (!props.isConnected) return
  
  try {
    // 处理所有图片
    for (const preview of imagePreviews.value) {
      const formData = new FormData()
      formData.append('file', preview.file)
      
      const response = await fetch('http://localhost:8080/api/v1/upload', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('上传失败')
      }
      
      const data = await response.json()
      emit('send-image', data.url)
    }
    
    // 清理所有预览
    imagePreviews.value.forEach(preview => {
      URL.revokeObjectURL(preview.url)
    })
    imagePreviews.value = []
    
    // 发送文本消息
    if (inputMessage.value.trim()) {
      emit('send', inputMessage.value)
      inputMessage.value = ''
    }
  } catch (error) {
    console.error('发送消息失败:', error)
    message.error('发送失败')
  }
}

// 处理按键事件
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSendMessage()
  }
}

// 处理输入事件
const handleInput = () => {
  // 可以添加输入时的处理逻辑
}

// 处理失焦事件
const handleInputBlur = () => {
  // 可以添加失焦时的处理逻辑
}

// 处理图片上传按钮点击
const handleImageUpload = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.multiple = true
  input.onchange = async (e) => {
    const files = Array.from((e.target as HTMLInputElement).files || [])
    files.forEach(file => {
      const url = URL.createObjectURL(file)
      imagePreviews.value.push({
        url,
        name: file.name,
        file
      })
    })
  }
  input.click()
}

// 获取文件扩展名
const getFileExtension = (mimeType: string): string => {
  const mimeMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg', 
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/bmp': 'bmp'
  }
  return mimeMap[mimeType] || 'png'
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
</script>

<style scoped lang="scss">
.chat-input {
  border-top: 1px solid #eee;
  background: white;
}

.image-preview-area {
  padding: 12px;
  border-bottom: 1px solid #eee;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.image-preview-item {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  background: #f5f5f5;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.2s;
    cursor: pointer;
    
    &:hover {
      transform: scale(1.05);
    }
  }
  
  .image-actions {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s;
    
    &:hover {
      opacity: 1;
    }
    
    .delete-btn {
      width: 24px;
      height: 24px;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ff4d4f;
      cursor: pointer;
      transition: all 0.2s;
      
      &:hover {
        transform: scale(1.1);
        background: white;
      }
    }
  }
  
  .image-size {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 4px;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    font-size: 10px;
    text-align: center;
  }
}

.input-container {
  display: flex;
  gap: 8px;
  padding: 16px;
  
  .message-input {
    flex: 1;
  }
  
  .input-actions {
    display: flex;
    align-items: flex-end;
    gap: 12px;
    padding-bottom: 6px;

    .image-button {
      color: #8f959e;
      padding: 4px;
      height: 32px;
      width: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      border-radius: 4px;
      
      &:hover {
        color: #07c160;
        background: rgba(7, 193, 96, 0.1);
      }
      
      &:active {
        transform: scale(0.95);
      }
      
      &:disabled {
        color: #d9d9d9;
        cursor: not-allowed;
        
        &:hover {
          background: none;
        }
      }
    }
    
    .send-button {
      width: 32px;
      height: 32px;
      padding: 0;
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      
      &:active {
        transform: scale(0.95);
      }
    }
  }
}

// 图片列表动画
.image-list-enter-active,
.image-list-leave-active {
  transition: all 0.3s ease;
}

.image-list-enter-from,
.image-list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.image-list-move {
  transition: transform 0.3s ease;
}
</style>
