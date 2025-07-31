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
    <div class="messages-container" ref="messagesContainer" @scroll="handleScroll">
      <!-- 消息工具栏 -->
      <div class="messages-toolbar">
        <div class="toolbar-left">
          <span class="message-count">{{ messages.length }} 条消息</span>
        </div>
        <div class="toolbar-right">
          <MessageSearch 
            :messages="messages" 
            @scroll-to-message="scrollToMessage"
          />
        </div>
      </div>
      
      <div 
        ref="messagesContainer"
        class="messages-list"
        :class="{ 
          'has-history-status': isLoadingHistory || (!hasMoreHistory && messages.length > 0) 
        }"
        @scroll="handleScroll"
      >
        <!-- 历史消息加载提示 -->
        <div v-if="isLoadingHistory" class="loading-history">
          <n-spin size="small" />
          <span>加载历史消息...</span>
        </div>
        
        <template v-for="(message, index) in messages" :key="message.id">
          <div
            :class="['message-item', {
              'message-self': message.senderId === currentUser.username,
              'message-other': message.senderId !== currentUser.username,
            }]"
          >
            <MessageItem :message="message" />
          </div>
          
          <!-- 在历史消息的最后一条后面显示分割线 -->
          <div 
            v-if="!hasMoreHistory && messages.length > 0 && index === getHistoryMessageEndIndex()" 
            class="history-divider"
          >
            <span>已显示全部历史消息</span>
          </div>
        </template>
      </div>
    </div>

    <!-- 连接状态指示器 -->
    <div v-if="!isConnected" class="connection-status">
      <n-alert type="warning" :show-icon="false">
        <template #icon>
          <n-icon>
            <svg viewBox="0 0 24 24">
              <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M11,9H13V7H11M11,17H13V11H11V17Z"/>
            </svg>
          </n-icon>
        </template>
        连接已断开，正在尝试重连...
      </n-alert>
    </div>

    <!-- 统计面板 -->
    <div v-if="props.showStats" class="stats-panel">
      <MessageStats :namespace="props.namespace" />
    </div>

    <!-- 输入区域 -->
    <ChatInput 
      :is-connected="isConnected" 
      :namespace="props.namespace"
      @send="handleSend"
      @send-image="handleSendImage"
      ref="chatInputRef"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useChatStore } from '@/stores/chat'
import { useUserStore } from '@/stores/user'
import { useMessage } from 'naive-ui'
import MessageItem from './MessageItem.vue'
import ChatInput from './ChatInput.vue'
import MessageSearch from './MessageSearch.vue'
import MessageStats from './MessageStats.vue'

// Props
interface Props {
  namespace: string
  showStats?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  namespace: 'default',
  showStats: false
})

// 状态管理
const chatStore = useChatStore()
const userStore = useUserStore()
const { messages, onlineUsers, typingUsers, isConnected, isLoadingHistory, hasMoreHistory, sessionStartTime } = storeToRefs(chatStore)
const { currentUser } = storeToRefs(userStore)
const message = useMessage()

// 响应式数据
const messagesContainer = ref<HTMLElement>()
const chatInputRef = ref()
const isDragActive = ref(false)
const dragCounter = ref(0)
const isUserScrolling = ref(false)
const shouldAutoScroll = ref(true)
const showSearch = ref(false)
const showStats = ref(false)
const isInitialLoad = ref(true) // 标记是否为初始加载

// 查找历史消息的结束位置（最后一条历史消息的索引）
const getHistoryMessageEndIndex = () => {
  if (!sessionStartTime.value || messages.value.length === 0) {
    return -1
  }
  
  const sessionStart = new Date(sessionStartTime.value).getTime()
  
  // 找到第一条在会话开始时间之后的消息
  for (let i = 0; i < messages.value.length; i++) {
    const messageTime = new Date(messages.value[i].timestamp).getTime()
    if (messageTime >= sessionStart) {
      return i - 1 // 返回历史消息的最后一条索引
    }
  }
  
  // 如果所有消息都是历史消息，返回最后一条消息的索引
  return messages.value.length - 1
}

// 处理发送消息
const handleSend = async (text: string) => {
  try {
    await chatStore.sendMessage(text)
    // 发送消息后自动滚动到底部
    shouldAutoScroll.value = true
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
    // 发送图片后自动滚动到底部
    shouldAutoScroll.value = true
    scrollToBottom()
  } catch (error) {
    console.error('发送图片失败:', error)
    message.error('发送图片失败')
  }
}

// 滚动到底部
const scrollToBottom = () => {
  if (messagesContainer.value) {
    const container = messagesContainer.value
    container.scrollTop = container.scrollHeight
    console.log('📜 滚动到底部:', { 
      scrollTop: container.scrollTop, 
      scrollHeight: container.scrollHeight,
      clientHeight: container.clientHeight 
    })
  }
}

// 强制滚动到底部（用于初始化和重连）
const forceScrollToBottom = () => {
  // 立即滚动一次
  scrollToBottom()
  
  // 使用nextTick再滚动一次，确保DOM更新完成
  nextTick(() => {
    scrollToBottom()
    shouldAutoScroll.value = true // 重置自动滚动标志
    
    // 再用setTimeout确保完全渲染后滚动
    setTimeout(() => {
      scrollToBottom()
      console.log('🔄 强制滚动到底部完成')
    }, 50)
  })
}

// 调试方法：检查滚动状态
const checkScrollStatus = () => {
  console.log('🔍 开始检查滚动状态...')
  
  if (messagesContainer.value) {
    const container = messagesContainer.value
    const { scrollTop, scrollHeight, clientHeight } = container
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 10
    
    console.log('🔍 滚动状态检查:', {
      scrollTop,
      scrollHeight,
      clientHeight,
      差值: scrollHeight - scrollTop - clientHeight,
      是否在底部: isAtBottom,
      消息数量: messages.value.length,
      容器存在: !!container
    })
    
    return isAtBottom
  } else {
    console.log('❌ messagesContainer不存在，无法检查滚动状态')
    return false
  }
}

// 调试方法：测试组件状态
const testComponentStatus = () => {
  console.log('🧪 组件状态测试:')
  console.log('- messagesContainer:', messagesContainer.value)
  console.log('- messages.length:', messages.value.length)
  console.log('- isInitialLoad:', isInitialLoad.value)
  console.log('- shouldAutoScroll:', shouldAutoScroll.value)
  console.log('- isUserScrolling:', isUserScrolling.value)
  console.log('- currentUser:', currentUser.value.username)
  console.log('- namespace:', props.namespace)
  
  if (messagesContainer.value) {
    const container = messagesContainer.value
    console.log('- 容器尺寸:', {
      scrollTop: container.scrollTop,
      scrollHeight: container.scrollHeight,
      clientHeight: container.clientHeight,
      offsetHeight: container.offsetHeight
    })
  }
}

// 在开发环境下暴露测试方法到全局
if (import.meta.env.DEV) {
  (window as any).testChatRoom = {
    checkScrollStatus,
    testComponentStatus,
    scrollToBottom,
    forceScrollToBottom,
    messages: messages.value
  }
  console.log('🧪 开发模式：测试方法已暴露到 window.testChatRoom')
}

// 处理滚动事件
const handleScroll = () => {
  if (!messagesContainer.value) return
  
  const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value
  
  // 检查是否滚动到顶部，如果是则加载更多历史消息
  if (scrollTop === 0 && hasMoreHistory.value && !isLoadingHistory.value) {
    loadMoreHistory()
  }
  
  // 检查用户是否在底部附近（允许一些误差）
  const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
  shouldAutoScroll.value = isNearBottom
  
  // 标记用户正在滚动
  isUserScrolling.value = true
  setTimeout(() => {
    isUserScrolling.value = false
  }, 150)
}

// 加载更多历史消息
const loadMoreHistory = async () => {
  if (!messagesContainer.value) return
  
  const previousScrollHeight = messagesContainer.value.scrollHeight
  
  try {
    await chatStore.loadMoreHistory()
    
    // 加载完成后，保持滚动位置
    nextTick(() => {
      if (messagesContainer.value) {
        const newScrollHeight = messagesContainer.value.scrollHeight
        const scrollDiff = newScrollHeight - previousScrollHeight
        messagesContainer.value.scrollTop = scrollDiff
      }
    })
  } catch (error) {
    console.error('加载历史消息失败:', error)
    message.error('加载历史消息失败')
  }
}

// 监听消息变化，自动滚动到底部
watch(messages, (newMessages, oldMessages) => {
  console.log('📨 消息变化触发:', { 
    新消息数量: newMessages.length, 
    旧消息数量: oldMessages?.length || 0,
    是否初始加载: isInitialLoad.value,
    shouldAutoScroll: shouldAutoScroll.value,
    isUserScrolling: isUserScrolling.value
  })
  
  // 打印前几条消息内容用于调试
  if (newMessages.length > 0) {
    console.log('📋 消息列表预览:', newMessages.slice(0, 3).map(m => ({
      id: m.id,
      content: m.content?.substring(0, 50) + '...',
      timestamp: m.timestamp
    })))
  }
  
  if (isInitialLoad.value) {
    console.log('🔄 处理初始加载滚动...')
    // 初始加载，等待DOM渲染完成后滚动
    setTimeout(() => {
      console.log('🔄 开始初始滚动...')
      console.log('📦 messagesContainer状态:', messagesContainer.value ? '已绑定' : '未绑定')
      
      if (messagesContainer.value) {
        checkScrollStatus() // 滚动前检查状态
        forceScrollToBottom()
        
        // 滚动后再次检查
        setTimeout(() => {
          const isAtBottom = checkScrollStatus()
          if (!isAtBottom) {
            console.log('⚠️ 滚动后仍未到底部，再次尝试滚动')
            scrollToBottom()
          }
          isInitialLoad.value = false
          console.log('✅ 初始加载完成，已滚动到底部')
        }, 100)
      } else {
        console.log('❌ messagesContainer未绑定，无法滚动')
      }
    }, 300) // 增加延迟时间
  } else if (shouldAutoScroll.value && !isUserScrolling.value) {
    console.log('📨 处理新消息滚动...')
    // 新消息，立即滚动
    setTimeout(() => {
      scrollToBottom()
    }, 50)
  } else {
    console.log('⏸️ 跳过滚动:', { shouldAutoScroll: shouldAutoScroll.value, isUserScrolling: isUserScrolling.value })
  }
}, { deep: true, flush: 'post' }) // 使用post flush确保DOM更新后执行

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
  
  const files = Array.from(e.dataTransfer.files)
  
  // 将文件传递给ChatInput组件进行预览
  if (chatInputRef.value && chatInputRef.value.addFiles) {
    chatInputRef.value.addFiles(files)
  } else {
    // 如果没有预览功能，则直接上传
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        message.warning(`文件 ${file.name} 不是图片格式`)
        continue
      }
      
      // 检查文件大小限制 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        message.error(`图片 ${file.name} 超过5MB限制`)
        continue
      }
      
      try {
        // 上传文件到服务器
        const formData = new FormData()
        formData.append('file', file)
        
        const response = await fetch('http://localhost:8080/api/v1/upload', {
          method: 'POST',
          body: formData
        })
        
        if (!response.ok) throw new Error('上传失败')
        
        const data = await response.json()
        
        // 发送图片消息
        await handleSendImage(data.url)
      } catch (error) {
        console.error('处理拖拽图片失败:', error)
        message.error(`处理图片 ${file.name} 失败`)
      }
    }
  }
}

// 滚动到指定消息
const scrollToMessage = (messageId: string) => {
  const messageElement = document.querySelector(`[data-message-id="${messageId}"]`)
  if (messageElement && messagesContainer.value) {
    messageElement.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center' 
    })
    
    // 高亮显示目标消息
    messageElement.classList.add('message-highlight')
    setTimeout(() => {
      messageElement.classList.remove('message-highlight')
    }, 2000)
  }
}

// 监听namespace变化，重新连接聊天室
watch(() => props.namespace, async (newNamespace, oldNamespace) => {
  if (newNamespace !== oldNamespace && newNamespace) {
    console.log('🔄 Namespace变化，重新连接聊天室:', { from: oldNamespace, to: newNamespace })
    
    try {
      // 重置初始加载标志
      isInitialLoad.value = true
      
      // 断开当前连接
      chatStore.disconnect()
      
      // 等待一小段时间确保连接完全断开
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // 连接到新的namespace
      await chatStore.connect(newNamespace)
      
      // 连接成功后，等待消息加载完成再滚动
      // 消息变化的watch会处理滚动
      console.log('✅ 成功切换到新的聊天室:', newNamespace, '等待消息加载...')
    } catch (error) {
      console.error('❌ 切换聊天室失败:', error)
      message.error(`切换到 ${newNamespace} 聊天室失败`)
    }
  }
}, { immediate: false })

// 生命周期
onMounted(async () => {
  console.log('🚀 ChatRoom组件开始挂载')
  console.log('📋 Props:', { namespace: props.namespace, showStats: props.showStats })
  console.log('👤 当前用户:', currentUser.value.username)
  
  try {
    console.log('🚀 ChatRoom挂载，连接聊天室:', props.namespace, '用户:', currentUser.value.username)
    
    // 确保初始加载标志为true
    isInitialLoad.value = true
    console.log('🔄 设置初始加载标志为true')
    
    // 检查messagesContainer是否正确绑定
    console.log('📦 messagesContainer引用:', messagesContainer.value)
    
    await chatStore.connect(props.namespace)
    
    // 连接成功后，等待消息加载完成再滚动
    // 消息变化的watch会处理滚动
    console.log('✅ 聊天室连接成功，等待消息加载...')
    console.log('📨 当前消息数量:', messages.value.length)
    
    // 额外的保险措施：延迟检查并滚动
    setTimeout(() => {
      console.log('🔍 延迟检查滚动状态...')
      console.log('📦 messagesContainer引用检查:', messagesContainer.value)
      console.log('📨 消息数量检查:', messages.value.length)
      
      if (messagesContainer.value && messages.value.length > 0) {
        const isAtBottom = checkScrollStatus()
        if (!isAtBottom) {
          console.log('⚠️ 发现未在底部，强制滚动')
          forceScrollToBottom()
        }
      } else {
        console.log('⚠️ messagesContainer或消息为空')
        console.log('messagesContainer:', messagesContainer.value)
        console.log('messages.length:', messages.value.length)
      }
    }, 1000) // 1秒后检查
    
  } catch (error) {
    console.error('❌ 连接聊天室失败:', error)
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
  height: 100%; // 填充父容器高度
  background: #f5f5f5;
  position: relative;
  overflow: hidden; // 防止整体滚动
  
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
  display: flex;
  flex-direction: column;
  overflow: hidden; // 防止容器本身滚动
  min-height: 0; // 允许flex子项收缩
  
  .messages-toolbar {
    flex-shrink: 0; // 工具栏不收缩
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    padding: 8px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 10;
    
    .toolbar-left {
      .message-count {
        font-size: 12px;
        color: #6c757d;
        font-weight: 500;
      }
    }
    
    .toolbar-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
  
  .messages-list {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    scroll-behavior: smooth;
    
    // 历史消息加载提示
    .loading-history {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 16px;
      margin: 0 -16px; // 扩展到容器边缘
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid rgba(0, 0, 0, 0.06);
      border-radius: 8px;
      color: #666;
      font-size: 14px;
      backdrop-filter: blur(4px);
    }
    
    // 历史消息分割线
    .history-divider {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px 0;
      margin: 8px 0;
      position: relative;
      
      span {
        position: relative;
        padding: 8px 20px;
        background: #f5f5f5;
        color: #999;
        font-size: 12px;
        border-radius: 16px;
        border: 1px solid rgba(0, 0, 0, 0.06);
        z-index: 2;
        
        // 分割线效果
        &::before {
          content: '';
          position: absolute;
          top: 50%;
          left: -200px;
          right: -200px;
          height: 1px;
          background: linear-gradient(
            to right,
            transparent,
            rgba(0, 0, 0, 0.1) 20%,
            rgba(0, 0, 0, 0.1) 80%,
            transparent
          );
          z-index: 1;
        }
      }
    }
  }
  
  // 移除之前的悬浮样式
  .messages-list.has-history-status {
    // 不再需要额外的padding
  }
}

// 消息高亮效果
:deep(.message-highlight) {
  animation: messageHighlight 2s ease-in-out;
  
  @keyframes messageHighlight {
    0% {
      background-color: rgba(24, 144, 255, 0.2);
      transform: scale(1.02);
    }
    50% {
      background-color: rgba(24, 144, 255, 0.1);
    }
    100% {
      background-color: transparent;
      transform: scale(1);
    }
  }
}

.connection-status {
  flex-shrink: 0; // 连接状态不收缩
  padding: 8px 16px;
  background: #fff;
  border-top: 1px solid #e0e0e0;
}

.message-item {
  &.message-self {
    align-self: flex-end;
  }
  
  &.message-other {
    align-self: flex-start;
  }
}

.stats-panel {
  flex-shrink: 0; // 统计面板不收缩
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
  max-height: 400px;
  overflow-y: auto;
}

// 输入区域固定在底部
:deep(.chat-input) {
  flex-shrink: 0; // 输入框不收缩
  position: sticky;
  bottom: 0;
  background: #fff;
  border-top: 1px solid #e0e0e0;
  z-index: 10;
}
</style>
