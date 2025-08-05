<template>
  <div class="input-toolbar">
    <!-- 文件上传按钮 -->
    <n-button
      text
      @click="$emit('file-upload')"
      class="toolbar-button"
      :disabled="!isConnected"
      :title="isConnected ? '上传文件' : '连接断开'"
    >
      <template #icon>
        <n-icon>
          <AttachmentIcon />
        </n-icon>
      </template>
    </n-button>

    <!-- 图片上传按钮 -->
    <n-button
      text
      @click="handleImageUpload"
      class="toolbar-button"
      :disabled="!isConnected"
      :title="isConnected ? '上传图片' : '连接断开'"
    >
      <template #icon>
        <n-icon>
          <ImageIcon />
        </n-icon>
      </template>
    </n-button>

    <!-- 表情按钮 -->
    <n-popover trigger="click" placement="top-start">
      <template #trigger>
        <n-button
          text
          class="toolbar-button"
          :disabled="!isConnected"
          :title="isConnected ? '插入表情' : '连接断开'"
        >
          <template #icon>
            <n-icon>
              <EmojiIcon />
            </n-icon>
          </template>
        </n-button>
      </template>
      <EmojiPicker @select="handleEmojiSelect" />
    </n-popover>
  </div>
</template>

<script setup lang="ts">
import { NButton, NIcon, NPopover } from 'naive-ui'
import AttachmentIcon from '@/components/icons/AttachmentIcon.vue'
import ImageIcon from '@/components/icons/ImageIcon.vue'
import EmojiIcon from '@/components/icons/EmojiIcon.vue'
import EmojiPicker from './EmojiPicker.vue'

interface Props {
  isConnected: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'file-upload': []
  'image-upload': []
  'emoji-select': [emoji: string]
}>()

// 方法
const handleImageUpload = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.multiple = true
  input.onchange = (e) => {
    emit('image-upload')
  }
  input.click()
}

const handleEmojiSelect = (emoji: string) => {
  emit('emoji-select', emoji)
}
</script>

<style scoped lang="scss">
.input-toolbar {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.toolbar-button {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  transition: all 0.2s ease;
  color: var(--text-secondary);

  &:hover:not(:disabled) {
    background-color: var(--bg-hover);
    color: var(--text-primary);
  }

  &:disabled {
    opacity: 0.5;
    color: var(--text-disabled);
    cursor: not-allowed;
  }
}

// Terminal主题样式
[data-theme='terminal'] .input-toolbar {
  .toolbar-button {
    color: var(--terminal-text-secondary);
    
    &:hover:not(:disabled) {
      background-color: var(--terminal-surface);
      color: var(--pixel-cyan);
    }
    
    &:disabled {
      color: var(--terminal-text-disabled);
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .toolbar-button {
    width: 32px;
    height: 32px;
  }
}
</style>
