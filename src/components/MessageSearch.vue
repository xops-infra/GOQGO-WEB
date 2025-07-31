<template>
  <div class="message-search">
    <!-- 搜索触发按钮 -->
    <n-button
      quaternary
      circle
      size="small"
      @click="showSearch = !showSearch"
      :class="{ active: showSearch }"
    >
      <template #icon>
        <n-icon>
          <svg viewBox="0 0 24 24">
            <path fill="currentColor" d="M15.5,14H20.5L22,15.5V20.5L20.5,22H15.5L14,20.5V15.5L15.5,14M16,15V21H20V15H16M15.5,12H14L12.5,10.5V9.5L14,8H15.5L17,9.5V10.5L15.5,12M16,9V11H20V9H16M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
          </svg>
        </n-icon>
      </template>
    </n-button>

    <!-- 搜索面板 -->
    <Transition name="search-panel">
      <div v-if="showSearch" class="search-panel">
        <div class="search-header">
          <div class="search-title">
            <n-icon size="18">
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
              </svg>
            </n-icon>
            <span>搜索消息</span>
          </div>
          <n-button
            quaternary
            circle
            size="small"
            @click="showSearch = false"
          >
            <template #icon>
              <n-icon>
                <svg viewBox="0 0 24 24">
                  <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                </svg>
              </n-icon>
            </template>
          </n-button>
        </div>

        <div class="search-input-area">
          <n-input
            ref="searchInputRef"
            v-model:value="searchQuery"
            placeholder="输入关键词搜索消息..."
            clearable
            @input="handleSearchInput"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <n-icon>
                <svg viewBox="0 0 24 24">
                  <path fill="currentColor" d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
                </svg>
              </n-icon>
            </template>
            <template #suffix>
              <n-button
                text
                size="small"
                @click="handleSearch"
                :loading="searching"
              >
                搜索
              </n-button>
            </template>
          </n-input>
        </div>

        <div class="search-filters">
          <n-space size="small">
            <n-tag
              :type="searchType === 'all' ? 'primary' : 'default'"
              checkable
              :checked="searchType === 'all'"
              @update:checked="() => searchType = 'all'"
            >
              全部
            </n-tag>
            <n-tag
              :type="searchType === 'text' ? 'primary' : 'default'"
              checkable
              :checked="searchType === 'text'"
              @update:checked="() => searchType = 'text'"
            >
              文本
            </n-tag>
            <n-tag
              :type="searchType === 'image' ? 'primary' : 'default'"
              checkable
              :checked="searchType === 'image'"
              @update:checked="() => searchType = 'image'"
            >
              图片
            </n-tag>
            <n-tag
              :type="searchType === 'file' ? 'primary' : 'default'"
              checkable
              :checked="searchType === 'file'"
              @update:checked="() => searchType = 'file'"
            >
              文件
            </n-tag>
          </n-space>
        </div>

        <div class="search-results">
          <div v-if="searching" class="search-loading">
            <n-spin size="small" />
            <span>搜索中...</span>
          </div>
          
          <div v-else-if="searchResults.length === 0 && searchQuery" class="search-empty">
            <n-empty description="未找到相关消息" size="small">
              <template #icon>
                <n-icon>
                  <svg viewBox="0 0 24 24">
                    <path fill="currentColor" d="M15.5,12C18,12 20,14 20,16.5C20,17.38 19.75,18.21 19.31,18.9L22.39,22L21,23.39L17.88,20.32C17.19,20.75 16.37,21 15.5,21C13,21 11,19 11,16.5C11,14 13,12 15.5,12M15.5,14A2.5,2.5 0 0,0 13,16.5A2.5,2.5 0 0,0 15.5,19A2.5,2.5 0 0,0 18,16.5A2.5,2.5 0 0,0 15.5,14M6.5,2C8.43,2 10,3.57 10,5.5C10,6.38 9.75,7.21 9.31,7.9L10.39,9L9,10.39L7.88,9.32C7.19,9.75 6.37,10 5.5,10C3.57,10 2,8.43 2,6.5C2,4.57 3.57,3 5.5,3C6.38,3 7.21,3.25 7.9,3.69L9,2.61L10.39,4L9.32,5.12C9.75,5.81 10,6.63 10,7.5H8C8,6.67 7.33,6 6.5,6C5.67,6 5,6.67 5,7.5C5,8.33 5.67,9 6.5,9C7.33,9 8,8.33 8,7.5H10C10,9.43 8.43,11 6.5,11C4.57,11 3,9.43 3,7.5C3,5.57 4.57,4 6.5,4Z"/>
                  </svg>
                </n-icon>
              </template>
            </n-empty>
          </div>
          
          <div v-else-if="searchResults.length > 0" class="search-result-list">
            <div class="result-header">
              <span class="result-count">找到 {{ searchResults.length }} 条相关消息</span>
              <n-button text size="small" @click="clearSearch">
                清除搜索
              </n-button>
            </div>
            
            <div class="result-items">
              <div
                v-for="result in searchResults"
                :key="result.id"
                class="result-item"
                @click="scrollToMessage(result.id)"
              >
                <div class="result-avatar">
                  <n-avatar
                    :size="32"
                    round
                    :src="getUserAvatar(result.senderId)"
                    :fallback-src="getDefaultAvatar(result.senderId)"
                  >
                    {{ getUserInitials(result.senderId) }}
                  </n-avatar>
                </div>
                
                <div class="result-content">
                  <div class="result-header-info">
                    <span class="result-sender">{{ getUserDisplayName(result.senderId) }}</span>
                    <span class="result-time">{{ formatTime(result.timestamp) }}</span>
                  </div>
                  
                  <div class="result-message">
                    <div
                      v-if="result.type === 'text'"
                      class="result-text"
                      v-html="highlightSearchTerm(result.content, searchQuery)"
                    ></div>
                    <div v-else-if="result.type === 'image'" class="result-media">
                      <n-icon size="16">
                        <svg viewBox="0 0 24 24">
                          <path fill="currentColor" d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z"/>
                        </svg>
                      </n-icon>
                      <span>图片消息</span>
                    </div>
                    <div v-else-if="result.type === 'file'" class="result-media">
                      <n-icon size="16">
                        <svg viewBox="0 0 24 24">
                          <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                        </svg>
                      </n-icon>
                      <span>文件消息</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useChatStore } from '@/stores/chat'
import { useUserStore } from '@/stores/user'
import { formatRelativeTime } from '@/utils/timeManager'
import type { ChatMessage } from '@/types/api'

// Props
interface Props {
  messages: ChatMessage[]
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  scrollToMessage: [messageId: string]
}>()

// 状态管理
const chatStore = useChatStore()
const userStore = useUserStore()

// 响应式数据
const showSearch = ref(false)
const searchQuery = ref('')
const searchType = ref<'all' | 'text' | 'image' | 'file'>('all')
const searching = ref(false)
const searchInputRef = ref()

// 搜索结果
const searchResults = ref<ChatMessage[]>([])

// 计算属性
const filteredMessages = computed(() => {
  try {
    if (!props.messages || !Array.isArray(props.messages)) {
      console.warn('MessageSearch: messages prop is not a valid array:', props.messages)
      return []
    }
    
    if (searchType.value === 'all') {
      return props.messages
    }
    return props.messages.filter(msg => msg && msg.type === searchType.value)
  } catch (error) {
    console.error('MessageSearch: filteredMessages计算失败:', error)
    return []
  }
})

// 方法
const handleSearchInput = () => {
  if (searchQuery.value.trim()) {
    performSearch()
  } else {
    searchResults.value = []
  }
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    performSearch()
  }
}

const performSearch = async () => {
  searching.value = true
  
  try {
    // 模拟搜索延迟
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const query = searchQuery.value.toLowerCase().trim()
    if (!query) {
      searchResults.value = []
      return
    }
    
    const messages = filteredMessages.value
    if (!Array.isArray(messages)) {
      console.warn('MessageSearch: filteredMessages is not an array:', messages)
      searchResults.value = []
      return
    }
    
    const results = messages.filter(message => {
      try {
        if (!message) return false
        
        if (message.type === 'text') {
          return message.content && message.content.toLowerCase().includes(query)
        } else if (message.type === 'image' || message.type === 'file') {
          // 对于媒体消息，可以搜索文件名或描述
          return (message.metadata?.filename?.toLowerCase().includes(query)) ||
                 (message.metadata?.description?.toLowerCase().includes(query))
        }
        return false
      } catch (error) {
        console.error('MessageSearch: 过滤消息时出错:', error, 'message:', message)
        return false
      }
    })
    
    // 按时间倒序排列
    searchResults.value = results.sort((a, b) => {
      try {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      } catch (error) {
        console.error('MessageSearch: 排序时出错:', error, 'a:', a, 'b:', b)
        return 0
      }
    })
  } catch (error) {
    console.error('MessageSearch: 搜索失败:', error)
    searchResults.value = []
  } finally {
    searching.value = false
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
}

const scrollToMessage = (messageId: string) => {
  emit('scrollToMessage', messageId)
  showSearch.value = false
}

const highlightSearchTerm = (text: string, term: string) => {
  if (!term) return text
  
  const regex = new RegExp(`(${term})`, 'gi')
  return text.replace(regex, '<mark class="search-highlight">$1</mark>')
}

const getUserAvatar = (userId: string) => {
  // 获取用户头像
  return ''
}

const getDefaultAvatar = (userId: string) => {
  const displayName = getUserDisplayName(userId)
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&size=64&background=007bff&color=ffffff&bold=true&format=svg`
}

const getUserInitials = (userId: string) => {
  const displayName = getUserDisplayName(userId)
  return displayName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
}

const getUserDisplayName = (userId: string) => {
  try {
    return userStore.getUserDisplayName(userId)
  } catch (error) {
    console.error('获取用户显示名称失败:', error, 'userId:', userId)
    return userId || '未知用户'
  }
}

const formatTime = (timestamp: string) => {
  try {
    return formatRelativeTime(timestamp)
  } catch (error) {
    console.error('格式化时间失败:', error, 'timestamp:', timestamp)
    return '未知时间'
  }
}

// 监听搜索面板显示状态
watch(showSearch, (newVal) => {
  if (newVal) {
    nextTick(() => {
      searchInputRef.value?.focus()
    })
  } else {
    clearSearch()
  }
})
</script>

<style scoped lang="scss">
.message-search {
  position: relative;
  
  .active {
    background-color: rgba(24, 144, 255, 0.1);
    color: #1890ff;
  }
}

.search-panel {
  position: absolute;
  top: 40px;
  right: 0;
  width: 400px;
  max-width: 90vw;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(0, 0, 0, 0.08);
  z-index: 1000;
  max-height: 500px;
  display: flex;
  flex-direction: column;
}

.search-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  
  .search-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: #212529;
  }
}

.search-input-area {
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.search-filters {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.search-results {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.search-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px;
  color: #6c757d;
}

.search-empty {
  padding: 40px 20px;
}

.search-result-list {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  
  .result-count {
    font-size: 14px;
    color: #6c757d;
  }
}

.result-items {
  flex: 1;
  overflow-y: auto;
}

.result-item {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #f8f9fa;
  }
  
  .result-avatar {
    flex-shrink: 0;
  }
  
  .result-content {
    flex: 1;
    min-width: 0;
  }
  
  .result-header-info {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
    
    .result-sender {
      font-size: 14px;
      font-weight: 500;
      color: #212529;
    }
    
    .result-time {
      font-size: 12px;
      color: #6c757d;
    }
  }
  
  .result-message {
    .result-text {
      font-size: 14px;
      color: #495057;
      line-height: 1.4;
      
      :deep(.search-highlight) {
        background-color: #fff3cd;
        color: #856404;
        padding: 1px 2px;
        border-radius: 2px;
      }
    }
    
    .result-media {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      color: #6c757d;
      font-style: italic;
    }
  }
}

// 过渡动画
.search-panel-enter-active,
.search-panel-leave-active {
  transition: all 0.2s ease;
}

.search-panel-enter-from,
.search-panel-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
