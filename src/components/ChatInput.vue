<template>
  <div class="chat-input-container">
    <div
      class="chat-input"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
      :class="{ 'drag-over': isDragOver }"
    >
      <!-- 拖拽提示 -->
      <div v-if="isDragOver" class="drag-overlay">
        <n-icon size="48" :color="'var(--color-success)'">
          <svg viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
            />
          </svg>
        </n-icon>
        <p>释放文件以上传</p>
      </div>

      <!-- 输入区域 -->
      <div class="input-area">
        <!-- 工具栏 -->
        <div class="toolbar">
          <!-- 文件上传按钮 -->
          <n-button
            text
            @click="handleFileUpload"
            class="attachment-button"
            :disabled="!isConnected"
          >
            <template #icon>
              <n-icon>
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M16.5,6V17.5A4,4 0 0,1 12.5,21.5A4,4 0 0,1 8.5,17.5V5A2.5,2.5 0 0,1 11,2.5A2.5,2.5 0 0,1 13.5,5V15.5A1,1 0 0,1 12.5,16.5A1,1 0 0,1 11.5,15.5V6H10V15.5A2.5,2.5 0 0,0 12.5,18A2.5,2.5 0 0,0 15,15.5V5A4,4 0 0,0 11,1A4,4 0 0,0 7,5V17.5A5.5,5.5 0 0,0 12.5,23A5.5,5.5 0 0,0 18,17.5V6H16.5Z"
                  />
                </svg>
              </n-icon>
            </template>
          </n-button>

          <!-- 图片上传按钮 -->
          <!-- <n-button
            text
            @click="handleImageUpload"
            class="image-button"
            :disabled="!isConnected"
          >
            <template #icon>
              <n-icon>
                <svg viewBox="0 0 24 24">
                  <path fill="currentColor" d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z"/>
                </svg>
              </n-icon>
            </template>
          </n-button> -->
        </div>

        <!-- 输入框 -->
        <n-input
          ref="inputRef"
          v-model:value="inputMessage"
          type="textarea"
          :placeholder="placeholderText"
          :autosize="{ minRows: 1, maxRows: 6 }"
          :disabled="!isConnected"
          @keydown="handleKeyDown"
          @paste="handlePaste"
          class="message-input"
        />

        <!-- 发送按钮 -->
        <n-button
          type="primary"
          @click="handleSendMessage"
          :disabled="!canSendMessage"
          class="send-button"
        >
          <template #icon>
            <n-icon>
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
              </svg>
            </n-icon>
          </template>
          发送
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useMessage } from 'naive-ui'
import { formatFileSize } from '@/utils/file'
import { filesApi } from '@/api/files'
import { useUserStore } from '@/stores/user'

const props = defineProps<{
  isConnected: boolean
  namespace?: string
}>()

const emit = defineEmits<{
  send: [message: string]
  'send-image': [url: string]
}>()

// 状态管理
const message = useMessage()
const userStore = useUserStore()

// 响应式数据
const inputMessage = ref('')
const inputRef = ref()
const isDragOver = ref(false)

// 计算属性
const canSendMessage = computed(() => {
  return inputMessage.value.trim() && props.isConnected
})

const placeholderText = computed(() => {
  if (!props.isConnected) {
    return '连接断开，无法发送消息...'
  }
  return '输入消息... (支持拖拽文件上传)'
})

// 发送消息
const handleSendMessage = () => {
  if (!canSendMessage.value) return

  const text = inputMessage.value.trim()
  if (text) {
    emit('send', text)
    inputMessage.value = ''
  }
}

// 处理键盘事件
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSendMessage()
  }
}

// 上传文件并插入链接到输入框
const uploadAndInsertFile = async (file: File) => {
  try {
    console.log('📤 开始上传文件:', file.name, file.type, formatFileSize(file.size))

    // 显示上传进度提示
    const loadingMessage = message.loading(`正在上传 ${file.name}...`, { duration: 0 })

    // 上传文件
    const result = await filesApi.uploadFile(userStore.currentUser.username, file)
    console.log('✅ 文件上传成功:', result)

    // 关闭加载提示
    loadingMessage.destroy()

    // 根据文件类型生成不同的链接格式
    const fileLink = generateFileLink(file, result.url)

    // 插入到输入框中
    insertTextAtCursor(fileLink)

    message.success(`文件 ${file.name} 上传成功`)
  } catch (error) {
    console.error('❌ 上传文件失败:', error)
    message.error(`上传文件 ${file.name} 失败: ${error.message}`)
  }
}

// 生成文件链接格式
const generateFileLink = (file: File, url: string) => {
  const fileName = file.name
  const fileType = file.type

  // 判断文件类型并生成相应格式
  if (fileType.startsWith('image/')) {
    return `[图片]${url}`
  } else if (fileType.startsWith('video/')) {
    return `[视频]${url}`
  } else if (fileType.startsWith('audio/')) {
    return `[音频]${url}`
  } else if (fileType.includes('pdf')) {
    return `[PDF]${url}`
  } else if (fileType.includes('word') || fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
    return `[文档]${url}`
  } else if (
    fileType.includes('excel') ||
    fileName.endsWith('.xls') ||
    fileName.endsWith('.xlsx')
  ) {
    return `[表格]${url}`
  } else if (
    fileType.includes('powerpoint') ||
    fileName.endsWith('.ppt') ||
    fileName.endsWith('.pptx')
  ) {
    return `[演示]${url}`
  } else if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z')) {
    return `[压缩包]${url}`
  } else {
    return `[文件]${url}`
  }
}

// 在光标位置插入文本
const insertTextAtCursor = (text: string) => {
  console.log('🔧 尝试插入文本:', text)

  try {
    // 尝试多种方式访问input元素
    let input = null

    if (inputRef.value) {
      console.log('📝 inputRef存在，尝试获取DOM元素')
      // 尝试不同的访问路径
      input =
        inputRef.value.inputElRef ||
        inputRef.value.textareaElRef ||
        inputRef.value.$el?.querySelector('textarea') ||
        inputRef.value.$el?.querySelector('input')

      console.log('📝 获取到的input元素:', input)
    }

    if (input && typeof input.selectionStart === 'number') {
      console.log('✅ 找到有效的input元素，使用光标位置插入')
      const start = input.selectionStart
      const end = input.selectionEnd
      const currentValue = inputMessage.value

      // 在光标位置插入文本
      const newValue = currentValue.substring(0, start) + text + currentValue.substring(end)
      inputMessage.value = newValue

      // 设置新的光标位置
      nextTick(() => {
        try {
          const newCursorPos = start + text.length
          input.setSelectionRange(newCursorPos, newCursorPos)
          input.focus()
          console.log('✅ 文本已插入到光标位置，新位置:', newCursorPos)
        } catch (error) {
          console.warn('设置光标位置失败:', error)
        }
      })
      return
    }

    // 备用方案：追加到末尾
    console.log('⚠️ 无法获取光标位置，使用追加方案')
    appendTextToEnd(text)
  } catch (error) {
    console.error('插入文本失败:', error)
    // 最后的备用方案
    appendTextToEnd(text)
  }
}

// 追加文本到末尾的辅助函数
const appendTextToEnd = (text: string) => {
  console.log('📝 追加文本到末尾:', text)

  // 确保有适当的分隔符
  if (inputMessage.value) {
    const lastChar = inputMessage.value.slice(-1)
    if (lastChar !== ' ' && lastChar !== '\n') {
      inputMessage.value += ' '
    }
  }

  inputMessage.value += text

  // 尝试聚焦输入框
  nextTick(() => {
    try {
      if (inputRef.value) {
        if (typeof inputRef.value.focus === 'function') {
          inputRef.value.focus()
        }
      }
      console.log('✅ 文本已追加到末尾')
    } catch (error) {
      console.warn('聚焦输入框失败:', error)
    }
  })
}

// 处理文件上传按钮点击
const handleFileUpload = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '*'
  input.multiple = true
  input.onchange = async (e) => {
    const selectedFiles = Array.from((e.target as HTMLInputElement).files || [])
    console.log('📁 选择文件数量:', selectedFiles.length)

    for (const file of selectedFiles) {
      await uploadAndInsertFile(file)
    }
  }
  input.click()
}

// 处理图片上传按钮点击 (暂未使用)
// const handleImageUpload = () => {
//   const input = document.createElement('input')
//   input.type = 'file'
//   input.accept = 'image/*'
//   input.multiple = true
//   input.onchange = async (e) => {
//     const selectedImages = Array.from((e.target as HTMLInputElement).files || [])
//     console.log('🖼️ 选择图片数量:', selectedImages.length)

//     for (const file of selectedImages) {
//       await uploadAndInsertFile(file)
//     }
//   }
//   input.click()
// }

// 处理粘贴事件
const handlePaste = async (e: ClipboardEvent) => {
  if (!e.clipboardData) return

  const items = Array.from(e.clipboardData.items)
  const fileItems = items.filter((item) => item.kind === 'file')

  for (const fileItem of fileItems) {
    e.preventDefault()
    const file = fileItem.getAsFile()
    if (file) {
      await uploadAndInsertFile(file)
    }
  }
}

// 处理拖拽事件
const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  if (!(e.currentTarget as Element)?.contains(e.relatedTarget as Node)) {
    isDragOver.value = false
  }
}

const handleDrop = async (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = false

  const droppedFiles = Array.from(e.dataTransfer?.files || [])
  console.log('🗂️ 拖拽文件数量:', droppedFiles.length)

  for (const file of droppedFiles) {
    await uploadAndInsertFile(file)
  }
}
</script>

<style scoped lang="scss">
.chat-input-container {
  position: relative;
}

.chat-input {
  background-color: var(--bg-primary);
  border-top: 1px solid var(--border-primary);
  color: var(--text-primary);
  position: relative;
  transition: all 0.3s ease;

  &.drag-over {
    background-color: rgba(16, 185, 129, 0.05);
    border-color: var(--color-success);
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
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border: 2px dashed var(--color-success);
  border-radius: 8px;
  margin: 8px;

  p {
    margin: 12px 0 0 0;
    color: var(--color-success);
    font-weight: 500;
    font-size: 16px;
  }
}

.input-area {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  padding: 12px 16px;
  background-color: var(--bg-primary);
}

.toolbar {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .attachment-button,
  .image-button {
    width: 36px;
    height: 36px;
    border-radius: 6px;
    transition: all 0.2s ease;
    color: var(--text-secondary);

    &:hover {
      background-color: var(--bg-hover);
      color: var(--text-primary);
    }

    &:disabled {
      opacity: 0.5;
      color: var(--text-disabled);
    }
  }
}

.message-input {
  flex: 1;

  // 重写Naive UI输入框样式以适配主题
  :deep(.n-input) {
    background-color: var(--bg-secondary) !important;
    border: 1px solid var(--border-primary) !important;
    border-radius: 8px !important;
    transition: all 0.3s ease !important;

    // 输入框内部元素
    .n-input__input-el,
    .n-input__textarea-el {
      background-color: transparent !important;
      color: var(--text-primary) !important;
      border: none !important;
      font-size: 14px !important;
      line-height: 1.5 !important;
      padding: 8px 12px !important;

      &::placeholder {
        color: var(--text-tertiary) !important;
        opacity: 1 !important;
      }

      &:focus {
        outline: none !important;
      }
    }

    // 边框状态
    .n-input__border,
    .n-input__state-border {
      border: none !important;
    }

    // 悬停状态
    &:hover {
      border-color: var(--border-focus) !important;
      background-color: var(--bg-hover) !important;
    }

    // 聚焦状态
    &.n-input--focus {
      border-color: var(--color-primary) !important;
      background-color: var(--bg-secondary) !important;
      box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.1) !important;
    }

    // 禁用状态
    &.n-input--disabled {
      background-color: var(--bg-tertiary) !important;
      border-color: var(--border-secondary) !important;
      opacity: 0.6 !important;

      .n-input__input-el,
      .n-input__textarea-el {
        color: var(--text-disabled) !important;
      }
    }
  }

  // textarea特殊处理
  :deep(.n-input__textarea-el) {
    resize: none !important;
    min-height: 36px !important;
    max-height: 144px !important;
  }
}

.send-button {
  height: 36px;
  padding: 0 16px;
  border-radius: 6px;
  font-weight: 500;
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: var(--color-primary-hover);
    border-color: var(--color-primary-hover);
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    background-color: var(--bg-tertiary);
    border-color: var(--border-primary);
    color: var(--text-disabled);
    cursor: not-allowed;
  }
}

// Terminal主题特殊样式
[data-theme='terminal'] {
  .chat-input {
    background-color: var(--terminal-bg);
    border-top-color: var(--terminal-border);
  }

  .input-area {
    background-color: var(--terminal-bg);
  }

  .message-input {
    :deep(.n-input) {
      background-color: var(--terminal-bg-secondary) !important;
      border-color: var(--terminal-border) !important;
      
      .n-input__input-el,
      .n-input__textarea-el {
        color: var(--terminal-text) !important;
        font-family: var(--font-mono) !important;
        
        &::placeholder {
          color: var(--terminal-text-tertiary) !important;
        }
      }

      &:hover {
        border-color: var(--terminal-border-active) !important;
        background-color: var(--terminal-bg-tertiary) !important;
      }

      &.n-input--focus {
        border-color: var(--pixel-green) !important;
        box-shadow: 0 0 0 2px rgba(0, 255, 65, 0.1) !important;
      }
    }
  }

  .send-button {
    background-color: var(--pixel-green);
    border-color: var(--pixel-green);
    color: var(--terminal-bg);
    font-family: var(--font-display);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;

    &:hover:not(:disabled) {
      background-color: var(--pixel-cyan);
      border-color: var(--pixel-cyan);
      box-shadow: var(--neon-glow-cyan);
    }
  }

  .toolbar {
    .attachment-button,
    .image-button {
      color: var(--terminal-text-secondary);
      
      &:hover {
        background-color: var(--terminal-surface);
        color: var(--pixel-green);
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .input-area {
    padding: 8px 12px;
    gap: 8px;
  }

  .toolbar {
    .attachment-button,
    .image-button {
      width: 32px;
      height: 32px;
    }
  }

  .send-button {
    height: 32px;
    padding: 0 12px;
    font-size: 13px;
  }

  .message-input {
    :deep(.n-input) {
      .n-input__input-el,
      .n-input__textarea-el {
        font-size: 13px !important;
        padding: 6px 10px !important;
      }
    }

    :deep(.n-input__textarea-el) {
      min-height: 32px !important;
      max-height: 120px !important;
    }
  }
}

// 暗色主题特殊处理
@media (prefers-color-scheme: dark) {
  .message-input {
    :deep(.n-input) {
      // 确保在系统暗色模式下也有正确的样式
      background-color: var(--bg-secondary) !important;
      
      .n-input__input-el,
      .n-input__textarea-el {
        color: var(--text-primary) !important;
        
        &::placeholder {
          color: var(--text-tertiary) !important;
        }
      }
    }
  }
}
</style>
