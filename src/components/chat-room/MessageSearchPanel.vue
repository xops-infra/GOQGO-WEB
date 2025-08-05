<template>
  <div class="message-search-panel">
    <div class="search-header">
      <h4>搜索消息</h4>
    </div>
    
    <div class="search-input">
      <n-input
        v-model:value="searchQuery"
        placeholder="搜索消息内容..."
        clearable
        @input="handleSearch"
      >
        <template #prefix>
          <n-icon>
            <SearchIcon />
          </n-icon>
        </template>
      </n-input>
    </div>

    <div class="search-results">
      <div v-if="searchResults.length === 0 && searchQuery" class="no-results">
        <p>未找到匹配的消息</p>
      </div>
      
      <div v-else-if="searchResults.length > 0" class="results-list">
        <div
          v-for="message in searchResults"
          :key="message.id"
          class="result-item"
          @click="$emit('scroll-to-message', message.id)"
        >
          <div class="result-sender">{{ message.sender }}</div>
          <div class="result-content">{{ truncateContent(message.content) }}</div>
          <div class="result-time">{{ formatTime(message.timestamp) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NInput, NIcon } from 'naive-ui'
import SearchIcon from '@/components/icons/SearchIcon.vue'
import type { Message } from '@/types/api'

interface Props {
  messages: Message[]
}

const props = defineProps<Props>()

defineEmits<{
  'scroll-to-message': [messageId: string]
}>()

// 响应式数据
const searchQuery = ref('')

// 计算属性
const searchResults = computed(() => {
  if (!searchQuery.value.trim()) {
    return []
  }

  const query = searchQuery.value.toLowerCase()
  return props.messages.filter(message =>
    message.content.toLowerCase().includes(query) ||
    message.sender.toLowerCase().includes(query)
  ).slice(0, 20) // 限制结果数量
})

// 方法
const handleSearch = () => {
  // 搜索逻辑已在computed中处理
}

const truncateContent = (content: string, maxLength = 50) => {
  if (content.length <= maxLength) {
    return content
  }
  return content.substring(0, maxLength) + '...'
}

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped lang="scss">
.message-search-panel {
  width: 300px;
  max-height: 400px;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.search-header {
  padding: 12px 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
  
  h4 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
  }
}

.search-input {
  padding: 12px 16px;
}

.search-results {
  max-height: 280px;
  overflow-y: auto;
}

.no-results {
  padding: 20px;
  text-align: center;
  color: var(--text-tertiary);
  
  p {
    margin: 0;
    font-size: 13px;
  }
}

.results-list {
  padding: 8px 0;
}

.result-item {
  padding: 8px 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-secondary);
  transition: background-color 0.2s ease;
  
  &:hover {
    background: var(--bg-hover);
  }
  
  &:last-child {
    border-bottom: none;
  }
}

.result-sender {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 2px;
}

.result-content {
  font-size: 13px;
  color: var(--text-primary);
  margin-bottom: 2px;
  line-height: 1.3;
}

.result-time {
  font-size: 11px;
  color: var(--text-tertiary);
}

// Terminal主题样式
[data-theme='terminal'] .message-search-panel {
  background: var(--terminal-bg);
  border-color: var(--terminal-border);
  box-shadow: 0 0 20px rgba(0, 255, 65, 0.3);
  
  .search-header {
    background: var(--terminal-bg-secondary);
    border-bottom-color: var(--terminal-border);
    
    h4 {
      color: var(--pixel-green);
      font-family: var(--font-display);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }
  
  .no-results p {
    color: var(--terminal-text-tertiary);
    font-family: var(--font-mono);
    text-transform: uppercase;
  }
  
  .result-item {
    border-bottom-color: var(--terminal-border);
    
    &:hover {
      background: var(--terminal-surface);
    }
  }
  
  .result-sender {
    color: var(--pixel-cyan);
    font-family: var(--font-mono);
    text-transform: uppercase;
  }
  
  .result-content {
    color: var(--terminal-text);
    font-family: var(--font-mono);
  }
  
  .result-time {
    color: var(--terminal-text-tertiary);
    font-family: var(--font-mono);
  }
}

// 滚动条样式
.search-results {
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--bg-tertiary);
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border-secondary);
    border-radius: 3px;
    
    &:hover {
      background: var(--border-primary);
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .message-search-panel {
    width: 280px;
    max-height: 350px;
  }
  
  .search-results {
    max-height: 230px;
  }
}
</style>
