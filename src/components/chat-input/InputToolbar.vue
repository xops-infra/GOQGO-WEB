<template>
  <div class="input-toolbar">
    <!-- 统一附件上传按钮 -->
    <n-dropdown
      :options="attachmentOptions"
      @select="handleAttachmentSelect"
      placement="top-start"
      :disabled="!isConnected"
    >
      <n-button
        text
        class="toolbar-button attachment-button"
        :disabled="!isConnected"
        :title="isConnected ? '添加附件' : '连接断开'"
      >
        <template #icon>
          <n-icon>
            <AttachmentIcon />
          </n-icon>
        </template>
      </n-button>
    </n-dropdown>

    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInputRef"
      type="file"
      style="display: none"
      multiple
      @change="handleFileChange"
    />

    <!-- 隐藏的图片输入 -->
    <input
      ref="imageInputRef"
      type="file"
      accept="image/*"
      style="display: none"
      multiple
      @change="handleImageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import { NButton, NIcon, NDropdown } from 'naive-ui'

// 图标组件
const AttachmentIcon = () => h('svg', { viewBox: '0 0 24 24' }, [
  h('path', { 
    fill: 'currentColor', 
    d: 'M7.5,18A5.5,5.5 0 0,1 2,12.5A5.5,5.5 0 0,1 7.5,7H18A4,4 0 0,1 22,11A4,4 0 0,1 18,15H9.5A2.5,2.5 0 0,1 7,12.5A2.5,2.5 0 0,1 9.5,10H17V11.5H9.5A1,1 0 0,0 8.5,12.5A1,1 0 0,0 9.5,13.5H18A2.5,2.5 0 0,0 20.5,11A2.5,2.5 0 0,0 18,8.5H7.5A4,4 0 0,0 3.5,12.5A4,4 0 0,0 7.5,16.5H17V18H7.5Z' 
  })
])

const ImageIcon = () => h('svg', { viewBox: '0 0 24 24' }, [
  h('path', { 
    fill: 'currentColor', 
    d: 'M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z' 
  })
])

const FileIcon = () => h('svg', { viewBox: '0 0 24 24' }, [
  h('path', { 
    fill: 'currentColor', 
    d: 'M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z' 
  })
])

interface Props {
  isConnected: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'file-upload': [files: FileList]
  'image-upload': [files: FileList]
}>()

// 文件输入引用
const fileInputRef = ref<HTMLInputElement>()
const imageInputRef = ref<HTMLInputElement>()

// 附件选项
const attachmentOptions = [
  {
    label: '上传图片',
    key: 'image',
    icon: () => h(NIcon, null, { default: () => h(ImageIcon) })
  },
  {
    label: '上传文件',
    key: 'file',
    icon: () => h(NIcon, null, { default: () => h(FileIcon) })
  }
]

// 处理附件选择
const handleAttachmentSelect = (key: string) => {
  if (key === 'image') {
    imageInputRef.value?.click()
  } else if (key === 'file') {
    fileInputRef.value?.click()
  }
}

// 处理文件选择
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    emit('file-upload', target.files)
    target.value = '' // 清空输入，允许重复选择同一文件
  }
}

// 处理图片选择
const handleImageChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    emit('image-upload', target.files)
    target.value = '' // 清空输入，允许重复选择同一文件
  }
}
</script>

<style scoped lang="scss">
.input-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 8px;
}

.toolbar-button {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    color: var(--color-primary);
    background: var(--color-primary-light);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &.attachment-button {
    position: relative;
    
    &:hover:not(:disabled) {
      transform: scale(1.05);
      box-shadow: 0 2px 8px rgba(var(--color-primary-rgb), 0.2);
    }
  }
}

// Terminal主题适配
[data-theme='terminal'] .toolbar-button {
  color: #00cc88;
  
  &:hover:not(:disabled) {
    color: #00ff00;
    background: rgba(0, 255, 0, 0.1);
    text-shadow: 0 0 8px rgba(0, 255, 0, 0.6);
    box-shadow: 0 0 12px rgba(0, 255, 0, 0.3);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .toolbar-button {
    width: 28px;
    height: 28px;
  }
}
</style>
