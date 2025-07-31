<template>
  <div class="chat-input">
    <!-- 图片预览区域 -->
    <div v-if="imagePreviews.length > 0" class="image-preview-area">
      <div class="divider-line">
        <div class="line"></div>
      </div>
      <TransitionGroup name="image-list" tag="div" class="preview-list">
        <div 
          v-for="(preview, index) in imagePreviews" 
          :key="preview.url"
          class="image-preview-item"
        >
          <img :src="preview.url" @click="handlePreviewClick(preview)" />
          <div class="delete-btn" @click="removeImage(index)">
            <n-icon size="14">
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
              </svg>
            </n-icon>
          </div>
          <div class="image-size">{{ formatFileSize(preview.file.size) }}</div>
        </div>
      </TransitionGroup>
      <div class="divider-line">
        <div class="line"></div>
      </div>
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
        <n-tooltip>
          <template #trigger>
            <n-button
              text
              @click="handleImageUpload"
              class="image-button"
              :disabled="!isConnected"
            >
              <template #icon>
                <n-icon size="18">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M19.5 12c.277 0 .5.223.5.5v4c0 1.375-1.125 2.5-2.5 2.5h-11c-1.375 0-2.5-1.125-2.5-2.5v-4c0-.277.223-.5.5-.5s.5.223.5.5v4c0 .825.675 1.5 1.5 1.5h11c.825 0 1.5-.675 1.5-1.5v-4c0-.277.223-.5.5-.5zM12 4c.277 0 .5.223.5.5v7.793l3.146-3.147c.196-.195.512-.195.708 0s.195.512 0 .708l-4 4c-.196.195-.512.195-.708 0l-4-4c-.195-.196-.195-.512 0-.708s.512-.195.708 0l3.146 3.147V4.5c0-.277.223-.5.5-.5z"/>
                  </svg>
                </n-icon>
              </template>
            </n-button>
          </template>
          发送图片
        </n-tooltip>
        <n-button
          type="primary"
          :disabled="!canSendMessage"
          @click="handleSendMessage"
          class="send-button"
          circle
        >
          <template #icon>
            <n-icon size="18">
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
              </svg>
            </n-icon>
          </template>
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
      transform-origin="center"
      class="image-preview-modal"
    >
      <div class="preview-container">
        <!-- 左箭头 -->
        <div 
          v-if="imagePreviews.length > 1" 
          class="nav-button prev"
          @click="prevImage"
        >
          <n-icon size="24">
            <svg viewBox="0 0 24 24">
              <path fill="currentColor" d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z"/>
            </svg>
          </n-icon>
        </div>

        <!-- 图片 -->
        <img :src="currentPreviewUrl" @click="closePreview" />

        <!-- 右箭头 -->
        <div 
          v-if="imagePreviews.length > 1" 
          class="nav-button next"
          @click="nextImage"
        >
          <n-icon size="24">
            <svg viewBox="0 0 24 24">
              <path fill="currentColor" d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"/>
            </svg>
          </n-icon>
        </div>

        <!-- 计数器 -->
        <div v-if="imagePreviews.length > 1" class="preview-counter">
          {{ currentPreviewIndex + 1 }} / {{ imagePreviews.length }}
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMessage } from 'naive-ui'
import { formatFileSize, generateFileName } from '@/utils/file'
import { uploadFile } from '@/api/upload'

const props = defineProps<{
  isConnected: boolean
}>()

const emit = defineEmits<{
  (e: 'send', message: string): void
  (e: 'send-image', url: string): void
}>()

// 状态管理
const message = useMessage()

// 响应式数据
const inputMessage = ref('')
const inputRef = ref()
const imagePreviews = ref<Array<{ url: string; name: string; file: File }>>([])
const showImagePreview = ref(false)
const currentPreviewIndex = ref(0)

// 计算属性
const canSendMessage = computed(() => {
  return (inputMessage.value.trim() || imagePreviews.value.length > 0) && props.isConnected
})

const currentPreviewUrl = computed(() => {
  return imagePreviews.value[currentPreviewIndex.value]?.url || ''
})

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
        
        // 创建本地预览URL
        const url = URL.createObjectURL(file)
        const fileName = generateFileName(file)
        
        imagePreviews.value.push({
          url,
          name: fileName,
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

// 处理图片上传按钮点击
const handleImageUpload = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.multiple = true
  input.onchange = async (e) => {
    const files = Array.from((e.target as HTMLInputElement).files || [])
    for (const file of files) {
      try {
        // 创建本地预览URL
        const url = URL.createObjectURL(file)
        const fileName = generateFileName(file)
        
        imagePreviews.value.push({
          url,
          name: fileName,
          file
        })
      } catch (error) {
        console.error('处理图片失败:', error)
        message.error('处理图片失败')
      }
    }
  }
  input.click()
}

// 发送消息
const handleSendMessage = async () => {
  if (!props.isConnected) return
  
  try {
    // 处理所有图片
    for (const preview of imagePreviews.value) {
      try {
        // 上传图片
        const url = await uploadFile(preview.file)
        emit('send-image', url)
        
        // 释放本地预览URL
        URL.revokeObjectURL(preview.url)
      } catch (error) {
        console.error('上传图片失败:', error)
        message.error('上传图片失败')
      }
    }
    
    // 清理所有预览
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

// 处理图片预览点击
const handlePreviewClick = (preview: { url: string }) => {
  const index = imagePreviews.value.findIndex(p => p.url === preview.url)
  if (index !== -1) {
    currentPreviewIndex.value = index
    showImagePreview.value = true
  }
}

// 关闭预览
const closePreview = () => {
  showImagePreview.value = false
}

// 上一张图片
const prevImage = () => {
  if (currentPreviewIndex.value > 0) {
    currentPreviewIndex.value--
  } else {
    currentPreviewIndex.value = imagePreviews.value.length - 1
  }
}

// 下一张图片
const nextImage = () => {
  if (currentPreviewIndex.value < imagePreviews.value.length - 1) {
    currentPreviewIndex.value++
  } else {
    currentPreviewIndex.value = 0
  }
}

// 移除图片
const removeImage = (index: number) => {
  const preview = imagePreviews.value[index]
  URL.revokeObjectURL(preview.url)
  imagePreviews.value.splice(index, 1)
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
</script>

<style scoped lang="scss">
.chat-input {
  border-top: 1px solid #eee;
  background: white;
}

.image-preview-area {
  padding: 12px 16px;
  position: relative;
  
  .divider-line {
    position: absolute;
    left: 0;
    right: 0;
    height: 1px;
    padding: 0 16px;
    
    &:first-child {
      top: 0;
    }
    
    &:last-child {
      bottom: 0;
    }
    
    .line {
      height: 100%;
      background: linear-gradient(
        to right,
        transparent,
        rgba(0, 0, 0, 0.1) 20%,
        rgba(0, 0, 0, 0.1) 80%,
        transparent
      );
    }
  }
  
  .preview-list {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    padding: 12px 0;
  }
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
    cursor: zoom-in;
    
    &:hover {
      transform: scale(1.05);
    }
  }
  
  .delete-btn {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 20px;
    height: 20px;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    transition: all 0.2s;
    opacity: 0;
    
    &:hover {
      background: rgba(0, 0, 0, 0.7);
      transform: scale(1.1);
    }
  }
  
  &:hover .delete-btn {
    opacity: 1;
  }
  
  .image-size {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 4px;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    font-size: 12px;
    text-align: center;
    backdrop-filter: blur(4px);
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

// 图片预览弹窗
.image-preview-modal {
  :deep(.n-card) {
    background: transparent;
    border: none;
    
    .n-card__content {
      padding: 0;
    }
  }
}

.preview-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    max-width: 100%;
    max-height: 80vh;
    cursor: zoom-out;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .nav-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 40px;
    height: 40px;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    transition: all 0.2s;
    backdrop-filter: blur(4px);
    
    &:hover {
      background: rgba(0, 0, 0, 0.7);
      transform: translateY(-50%) scale(1.1);
    }
    
    &:active {
      transform: translateY(-50%) scale(0.95);
    }
    
    &.prev {
      left: -60px;
    }
    
    &.next {
      right: -60px;
    }
  }
  
  .preview-counter {
    position: absolute;
    bottom: -40px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.5);
    color: white;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 14px;
    backdrop-filter: blur(4px);
  }
}
</style>
