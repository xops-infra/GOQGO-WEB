<template>
  <div class="message-content">
    <!-- 文本消息 -->
    <div v-if="type === 'text'" class="text-content">
      {{ content }}
    </div>

    <!-- 图片消息 -->
    <div v-else-if="type === 'image'" class="image-content">
      <img 
        :src="getImageUrl(content)" 
        :alt="content"
        class="message-image"
        @load="onImageLoad"
        @error="onImageError"
      />
    </div>

    <!-- 文件消息 -->
    <div v-else-if="type === 'file'" class="file-content">
      <div class="file-info">
        <n-icon size="20">
          <FileIcon />
        </n-icon>
        <span class="file-name">{{ getFileName(content) }}</span>
      </div>
      <n-button size="small" text @click="downloadFile(content)">
        下载
      </n-button>
    </div>

    <!-- 系统消息 -->
    <div v-else-if="type === 'system'" class="system-content">
      <n-icon size="16">
        <InfoIcon />
      </n-icon>
      <span>{{ content }}</span>
    </div>

    <!-- 默认文本显示 -->
    <div v-else class="text-content">
      {{ content }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { NIcon, NButton } from 'naive-ui'
import FileIcon from '@/components/icons/FileIcon.vue'
import InfoIcon from '@/components/icons/InfoIcon.vue'

interface Props {
  content: string
  type?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text'
})

// 方法
const getImageUrl = (content: string) => {
  // 如果内容包含[图片]标记，提取URL
  if (content.startsWith('[图片]')) {
    return content.replace('[图片]', '')
  }
  return content
}

const getFileName = (content: string) => {
  // 如果内容包含[文件]标记，提取文件名
  if (content.startsWith('[文件]')) {
    const url = content.replace('[文件]', '')
    return url.split('/').pop() || 'unknown'
  }
  return content
}

const downloadFile = (content: string) => {
  const url = content.startsWith('[文件]') ? content.replace('[文件]', '') : content
  window.open(url, '_blank')
}

const onImageLoad = () => {
  // 图片加载完成，可以触发滚动调整
}

const onImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
  console.error('图片加载失败:', img.src)
}
</script>

<style scoped lang="scss">
.message-content {
  width: 100%;
}

.text-content {
  color: var(--text-primary);
  white-space: pre-wrap;
  word-break: break-word;
}

.image-content {
  .message-image {
    max-width: 300px;
    max-height: 200px;
    border-radius: 6px;
    cursor: pointer;
    transition: transform 0.2s ease;
    
    &:hover {
      transform: scale(1.02);
    }
  }
}

.file-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--bg-tertiary);
  border-radius: 6px;
  border: 1px solid var(--border-primary);
  
  .file-info {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .file-name {
      font-size: 13px;
      color: var(--text-primary);
      font-weight: 500;
    }
  }
}

.system-content {
  display: flex;
  align-items: center;
  gap: 6px;
  font-style: italic;
  color: var(--text-secondary);
  font-size: 13px;
}

// Terminal主题样式
[data-theme='terminal'] .message-content {
  .text-content {
    color: var(--terminal-text);
    font-family: var(--font-mono);
  }
  
  .file-content {
    background: var(--terminal-bg-tertiary);
    border-color: var(--terminal-border);
    
    .file-name {
      color: var(--terminal-text);
      font-family: var(--font-mono);
    }
  }
  
  .system-content {
    color: var(--terminal-text-secondary);
    font-family: var(--font-mono);
    text-transform: uppercase;
    font-size: 11px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .image-content .message-image {
    max-width: 250px;
    max-height: 150px;
  }
  
  .file-content {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
    
    .file-info {
      justify-content: center;
    }
  }
}
</style>
