<template>
  <div
    class="chat-room"
    @dragover="handleDragOver"
    @drop="handleDrop"
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
    :class="{ 'drag-active': isDragActive }"
  >
    <!-- 拖拽覆盖层 -->
    <div v-if="isDragActive" class="drag-overlay">
      <div class="drag-content">
        <n-icon size="48" :color="'var(--color-success)'">
          <svg viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19M21,19L16,10L11,17L7,13L3,19H21Z"
            />
          </svg>
        </n-icon>
        <h3>释放文件以上传图片</h3>
        <p>支持 PNG, JPG, GIF 等图片格式</p>
      </div>
    </div>

    <!-- 消息列表 -->
    <div class="messages-container" @scroll="handleScroll">
      <!-- 消息工具栏 -->
      <div class="messages-toolbar">
        <div class="toolbar-left">
          <span class="message-count">{{ messages.length }} 条消息</span>
        </div>
        <div class="toolbar-right">
          <MessageSearch :messages="messages" @scroll-to-message="scrollToMessage" />
        </div>
      </div>

      <div
        ref="messagesListRef"
        class="messages-list"
        :class="{
          'has-history-status': isLoadingHistory || (!hasMoreHistory && messages.length > 0),
          'no-scroll-animation': isInitialLoad
        }"
        @scroll="handleScroll"
      >
        <!-- 历史消息加载提示 -->
        <div v-if="isLoadingHistory" class="loading-history">
          <n-spin size="small" />
          <span>加载历史消息...</span>
        </div>

        <!-- 历史消息分割线 -->
        <div
          v-if="shouldShowDivider"
          class="history-divider"
        >
          <div class="divider-content">
            <span class="divider-text">{{ hiddenHistoryCount }}条历史消息</span>
          </div>
        </div>

        <template v-for="(message, index) in visibleMessages" :key="message.id || message.tempId || `msg-${index}`">
          <div
            v-if="message && (message.content || message.isThinking)"
            :class="[
              'message-item',
              {
                'message-self': isOwnMessage(message),
                'message-other': !isOwnMessage(message)
              }
            ]"
          >
            <MessageItem :message="message" @resend="handleResendMessage" />
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
              <path
                fill="currentColor"
                d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M11,9H13V7H11M11,17H13V11H11V17Z"
              />
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
import { buildApiUrl, API_ENDPOINTS, apiConfig } from '@/config/api'

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
const {
  messages,
  // onlineUsers, // 暂未使用
  // typingUsers, // 暂未使用
  isConnected,
  isLoadingHistory,
  hasMoreHistory,
  shouldPreventAutoScroll
  // sessionStartTime // 暂未使用
} = storeToRefs(chatStore)
const { currentUser } = storeToRefs(userStore)
const message = useMessage()

// 响应式数据
const messagesListRef = ref<HTMLElement>()
const chatInputRef = ref()
const isDragActive = ref(false)
const dragCounter = ref(0)
const isUserScrolling = ref(false)
const shouldAutoScroll = ref(true)
// const showSearch = ref(false) // 暂未使用
const isInitialLoad = ref(true) // 标记是否为初始加载

// 默认显示的消息条数
const DEFAULT_VISIBLE_MESSAGES = 50

// 检查是否应该显示分割线
const shouldShowDivider = computed(() => {
  // 只有当消息数量大于默认显示数量且确实有消息时才显示分割线
  return messages.value.length > 0 && messages.value.length > DEFAULT_VISIBLE_MESSAGES
})

// 获取要显示的消息列表（默认显示最新50条）
const visibleMessages = computed(() => {
  // 过滤掉无效的消息
  const validMessages = messages.value.filter(msg => 
    msg && 
    (msg.id || msg.tempId) && 
    msg.content !== undefined &&
    msg.senderName
  )
  
  if (validMessages.length <= DEFAULT_VISIBLE_MESSAGES) {
    return validMessages
  }

  // 只显示最新的50条消息
  return validMessages.slice(-DEFAULT_VISIBLE_MESSAGES)
})

// 获取隐藏的历史消息数量
const hiddenHistoryCount = computed(() => {
  // 确保有消息且超过默认显示数量时才计算隐藏数量
  if (messages.value.length === 0 || messages.value.length <= DEFAULT_VISIBLE_MESSAGES) {
    return 0
  }

  return messages.value.length - DEFAULT_VISIBLE_MESSAGES
})

// 处理发送消息
const handleSend = async (text: string, mentionedAgents?: string[]) => {
  try {
    console.log('📤 发送消息:', { text, mentionedAgents })
    await chatStore.sendMessage(text, mentionedAgents)
    // 发送消息后立即滚动到底部
    nextTick(() => {
      scrollToBottom()
    })
  } catch (error) {
    console.error('发送消息失败:', error)
    message.error('发送失败')
  }
}

// 处理发送图片
const handleSendImage = async (imageUrl: string) => {
  try {
    await chatStore.sendImageMessage(imageUrl)
    // 发送图片后立即滚动到底部
    nextTick(() => {
      scrollToBottom()
    })
  } catch (error) {
    console.error('发送图片失败:', error)
    message.error('发送图片失败')
  }
}

// 处理重新发送消息
const handleResendMessage = async (failedMessage: any) => {
  try {
    // 显示重新发送提示
    message.info('正在重新发送消息...')
    
    // 如果消息有tempId，先将状态设置为发送中
    if (failedMessage.tempId) {
      // 这里我们可以通过chatStore的方法来更新状态
      // 但由于updateMessageStatus不是导出的，我们直接重新发送
    }
    
    // 根据消息类型重新发送
    if (failedMessage.messageType === 'image' || failedMessage.imageUrl) {
      // 重新发送图片消息
      const imageUrl = failedMessage.imageUrl || failedMessage.content
      await chatStore.sendImageMessage(imageUrl)
    } else {
      // 重新发送文本消息
      await chatStore.sendMessage(failedMessage.content)
    }
    
    // 发送成功后滚动到底部
    nextTick(() => {
      scrollToBottom()
    })
    
    message.success('消息重新发送成功')
  } catch (error) {
    console.error('重新发送消息失败:', error)
    message.error('重新发送失败，请稍后再试')
  }
}

// 滚动到底部
const scrollToBottom = () => {
  if (!messagesListRef.value) return

  try {
    const container = messagesListRef.value
    container.scrollTop = container.scrollHeight
  } catch (error) {
    console.error('滚动到底部时发生错误:', error)
  }
}

// 强制滚动到底部（用于初始化和重连）
const forceScrollToBottom = () => {
  if (!messagesListRef.value) return

  try {
    // 立即滚动一次
    scrollToBottom()

    // 使用nextTick再滚动一次，确保DOM更新完成
    nextTick(() => {
      try {
        if (!messagesListRef.value) return

        scrollToBottom()
        shouldAutoScroll.value = true // 重置自动滚动标志

        // 再用setTimeout确保完全渲染后滚动
        setTimeout(() => {
          try {
            if (!messagesListRef.value) return
            scrollToBottom()
          } catch (error) {
            console.error('强制滚动到底部时发生错误:', error)
          }
        }, 50)
      } catch (error) {
        console.error('强制滚动到底部时发生错误:', error)
      }
    })
  } catch (error) {
    console.error('强制滚动到底部时发生错误:', error)
  }
}

// 检查滚动状态
const checkScrollStatus = () => {
  if (!messagesListRef.value) return false

  try {
    const container = messagesListRef.value
    const { scrollTop, scrollHeight, clientHeight } = container
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 10
    return isAtBottom
  } catch (error) {
    console.error('检查滚动状态时发生错误:', error)
    return false
  }
}



// 处理滚动事件
const handleScroll = () => {
  if (!messagesListRef.value) return

  const { scrollTop, scrollHeight, clientHeight } = messagesListRef.value

  // 检查是否滚动到顶部
  if (scrollTop === 0) {
    // 如果还有更多历史消息，自动加载
    if (hasMoreHistory.value && !isLoadingHistory.value) {
      loadMoreHistory()
    }
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
  if (!messagesListRef.value) return

  const previousScrollHeight = messagesListRef.value.scrollHeight

  try {
    await chatStore.loadMoreHistory()

    // 加载完成后，保持滚动位置
    nextTick(() => {
      if (messagesListRef.value) {
        const newScrollHeight = messagesListRef.value.scrollHeight
        const scrollDiff = newScrollHeight - previousScrollHeight
        messagesListRef.value.scrollTop = scrollDiff
      }
    })
  } catch (error) {
    console.error('加载历史消息失败:', error)
    message.error('加载历史消息失败')
  }
}

// 监听消息变化，自动滚动到底部
watch(
  messages,
  (newMessages, oldMessages) => {
    // 防御性检查：确保组件仍然挂载
    if (!messagesListRef.value) return

    if (isInitialLoad.value) {
      // 初始加载，等待DOM渲染完成后滚动
      setTimeout(() => {
        try {
          // 再次检查组件是否仍然挂载
          if (!messagesListRef.value) {
            isInitialLoad.value = false
            return
          }

          if (messagesListRef.value) {
            checkScrollStatus() // 滚动前检查状态
            forceScrollToBottom()

            // 滚动后再次检查
            setTimeout(() => {
              try {
                // 第三次检查组件状态
                if (!messagesListRef.value) {
                  isInitialLoad.value = false
                  return
                }

                const isAtBottom = checkScrollStatus()
                if (!isAtBottom) {
                  scrollToBottom()
                }

                // 完成初始加载，重新启用滚动动画
                isInitialLoad.value = false
              } catch (error) {
                console.error('滚动检查时发生错误:', error)
                isInitialLoad.value = false
              }
            }, 100)
          } else {
            // 即使失败也要重置状态
            isInitialLoad.value = false
          }
        } catch (error) {
          console.error('初始滚动时发生错误:', error)
          isInitialLoad.value = false
        }
      }, 300) // 增加延迟时间
    } else if (shouldAutoScroll.value && !isUserScrolling.value && !shouldPreventAutoScroll.value) {
      // 新消息，但不是思考消息替换时才滚动
      console.log('📜 新消息触发自动滚动')
      setTimeout(() => {
        try {
          // 检查组件是否仍然挂载
          if (messagesListRef.value) {
            scrollToBottom()
          }
        } catch (error) {
          console.error('新消息滚动时发生错误:', error)
        }
      }, 50)
    } else if (shouldPreventAutoScroll.value) {
      console.log('🚫 思考消息替换，保持当前滚动位置')
    }
  },
  { deep: true, flush: 'post' }
) // 使用post flush确保DOM更新后执行

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

  const droppedFiles = Array.from(e.dataTransfer.files)

  // 直接上传文件
  for (const file of droppedFiles) {
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

      const response = await fetch(buildApiUrl(API_ENDPOINTS.FILES.UPLOAD), {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('上传失败')

      const data = await response.json()

      // 处理后端返回的数据结构
      if (data.success && data.files && data.files.length > 0) {
        const uploadedFile = data.files[0]
        const imageUrl = `${apiConfig.baseURL}${uploadedFile.downloadUrl}`
        await handleSendImage(imageUrl)
      } else {
        throw new Error(data.message || '上传失败')
      }
    } catch (error) {
      console.error('处理拖拽图片失败:', error)
      message.error(`处理图片 ${file.name} 失败`)
    }
  }
}

// 判断是否为自己的消息（忽略大小写）
const isOwnMessage = (message: any) => {
  const currentUsername = userStore.username.toLowerCase()
  const senderId = message.senderId?.toLowerCase() || ''
  const senderName = message.senderName?.toLowerCase() || ''
  
  return senderId === currentUsername || senderName === currentUsername
}

// 滚动到指定消息
const scrollToMessage = (messageId: string) => {
  const messageElement = document.querySelector(`[data-message-id="${messageId}"]`)
  if (messageElement && messagesListRef.value) {
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
watch(
  () => props.namespace,
  async (newNamespace, oldNamespace) => {
    if (newNamespace !== oldNamespace && newNamespace) {
      try {
        // 重置初始加载标志
        isInitialLoad.value = true

        // 断开当前连接
        chatStore.disconnect()

        // 等待一小段时间确保连接完全断开
        await new Promise((resolve) => setTimeout(resolve, 100))

        // 连接到新的namespace
        await chatStore.connect(newNamespace)

        // 连接成功后，等待消息加载完成再滚动
        // 消息变化的watch会处理滚动
      } catch (error) {
        console.error('切换聊天室失败:', error)
        message.error(`切换到 ${newNamespace} 聊天室失败`)
      }
    }
  },
  { immediate: false }
)

// 生命周期
onMounted(async () => {
  try {
    // 确保初始加载标志为true
    isInitialLoad.value = true

    await chatStore.connect(props.namespace)

    // 连接成功后，等待消息加载完成再滚动
    // 消息变化的watch会处理滚动

    // 额外的保险措施：延迟检查并滚动
    setTimeout(() => {
      if (messagesListRef.value && messages.value.length > 0) {
        const isAtBottom = checkScrollStatus()
        if (!isAtBottom) {
          forceScrollToBottom()
        }
      }
    }, 1000) // 1秒后检查
  } catch (error) {
    console.error('连接聊天室失败:', error)
    message.error('连接失败')
  }
})

onUnmounted(() => {
  try {
    // 断开聊天连接
    chatStore.disconnect()
    
    // 清理所有定时器和引用
    isInitialLoad.value = false
    shouldAutoScroll.value = false
    isUserScrolling.value = false
  } catch (error) {
    console.error('ChatRoom组件卸载时发生错误:', error)
  }
})
</script>

<style scoped lang="scss">
.chat-room {
  display: flex;
  flex-direction: column;
  height: 100%; // 填充父容器高度
  min-height: 0; // 关键：允许flex子元素收缩
  background-color: var(--bg-primary, #ffffff);
  color: var(--text-primary, #1f2937);
  position: relative;
  overflow: hidden; // 防止整体滚动
  width: 100%; /* 确保聊天室占满父容器宽度 */
  box-sizing: border-box; /* 确保padding不会增加总宽度 */
  transition:
    background-color 0.3s ease,
    color 0.3s ease;

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
  border: 3px dashed var(--color-success);
  border-radius: 8px;
  margin: 8px;

  .drag-content {
    text-align: center;
    color: var(--color-success);

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
  // 动态高度：当统计面板显示时留出空间，否则占满可用空间
  max-height: v-bind('props.showStats ? "calc(100% - 250px)" : "100%"');
  width: 100%; /* 确保容器占满父容器宽度 */
  box-sizing: border-box; /* 确保padding不会增加总宽度 */

  .messages-toolbar {
    flex-shrink: 0; // 工具栏不收缩
    background-color: var(--bg-secondary);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid var(--border-primary);
    padding: 8px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 10;
    width: 100%; /* 确保工具栏占满容器宽度 */
    box-sizing: border-box; /* 确保padding不会增加总宽度 */
    transition:
      background-color 0.3s ease,
      border-color 0.3s ease;

    .toolbar-left {
      flex-shrink: 0; /* 防止收缩 */
      .message-count {
        font-size: 12px;
        color: var(--text-tertiary);
        font-weight: 500;
        white-space: nowrap; /* 防止换行 */
      }
    }

    .toolbar-right {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0; /* 防止收缩 */
    }
  }

  .messages-list {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden; /* 禁止水平滚动 */
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    scroll-behavior: smooth;
    min-height: 0; /* 关键：允许flex子元素收缩 */
    box-sizing: border-box; /* 确保padding不会增加总宽度 */

    // 禁用滚动动画的类
    &.no-scroll-animation {
      scroll-behavior: auto !important;
    }

    // 历史消息加载提示
    .loading-history {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 16px;
      margin: 0 -16px; // 扩展到容器边缘
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-primary);
      border-radius: 8px;
      color: var(--text-secondary);
      font-size: 14px;
      backdrop-filter: blur(4px);
      transition: all 0.3s ease;
    }

    // 历史消息分割线
    .history-divider {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px 0;
      margin: 16px 0;
      position: relative;

      .divider-content {
        display: flex;
        align-items: center;
        gap: 8px;
        position: relative;
        padding: 6px 16px;
        background-color: var(--bg-secondary);
        color: var(--text-tertiary);
        border: 1px solid var(--border-primary);
        border-radius: 16px;
        font-size: 12px;
        font-weight: 500;
        z-index: 2;
        backdrop-filter: blur(8px);
        transition: all 0.3s ease;

        .divider-text {
          white-space: nowrap;
          overflow: hidden; /* 防止文本溢出 */
          text-overflow: ellipsis; /* 超出时显示省略号 */
        }

        &:hover {
          background-color: var(--bg-tertiary);
          color: var(--text-secondary);
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
      }

      // 分割线效果
      &::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(
          90deg,
          transparent 0%,
          var(--border-primary) 20%,
          var(--border-primary) 80%,
          transparent 100%
        );
        z-index: 1;
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
}

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

.connection-status {
  flex-shrink: 0; // 连接状态不收缩
  padding: 8px 16px;
  background: #fff;
  border-top: 1px solid #e0e0e0;
  width: 100%; /* 确保连接状态占满容器宽度 */
  box-sizing: border-box; /* 确保padding不会增加总宽度 */
}

.message-item {
  max-width: 100%; /* 确保消息项不会超出容器宽度 */
  word-wrap: break-word; /* 确保长单词换行 */
  overflow-wrap: break-word; /* 现代浏览器的换行属性 */
  display: flex; /* 使用flexbox布局 */
  
  &.message-self {
    justify-content: flex-end; /* 自己的消息靠右 */
    
    .message-card {
      width: 83.333%; /* 5/6宽度 */
      max-width: 600px; /* 最大宽度限制 */
      min-width: 400px; /* 最小宽度确保可读性 */
    }
  }

  &.message-other {
    justify-content: flex-start; /* 其他人的消息靠左 */
    
    .message-card {
      width: 83.333%; /* 5/6宽度 */
      max-width: 600px; /* 最大宽度限制 */
      min-width: 400px; /* 最小宽度确保可读性 */
    }
  }
}

.stats-panel {
  flex-shrink: 0; // 统计面板不收缩
  border-top: 1px solid var(--border-primary, #e0e0e0);
  background: var(--bg-secondary, #fafafa);
  max-height: 250px; // 减少最大高度，给聊天输入框留更多空间
  overflow-y: auto;
  overflow-x: hidden; /* 禁止水平滚动 */
  z-index: 5; // 确保在聊天内容之上，但在输入框之下
  position: relative; // 确保正确的定位
  width: 100%; /* 确保统计面板占满容器宽度 */
  box-sizing: border-box; /* 确保padding不会增加总宽度 */
}

// 输入区域固定在底部
:deep(.chat-input) {
  flex-shrink: 0; // 输入框不收缩
  position: sticky;
  bottom: 0;
  background: var(--bg-primary, #fff);
  border-top: 1px solid var(--border-primary, #e0e0e0);
  z-index: 10; // 确保在统计面板之上
  width: 100%; /* 确保输入框占满容器宽度 */
  box-sizing: border-box; /* 确保padding不会增加总宽度 */
}

// 终端模式适配
.terminal-mode {
  .chat-room {
    background: var(--terminal-bg, #000000);
    color: var(--terminal-text-primary, #ffffff);
  }

  .messages-toolbar {
    background: var(--terminal-panel-bg, #111111);
    border-bottom: 1px solid var(--terminal-border-subtle, rgba(0, 255, 65, 0.15));
    
    .message-count {
      color: var(--terminal-text-primary, #ffffff);
      font-family: 'Courier New', monospace;
      text-transform: uppercase;
    }
  }

  .message-item {
    &.message-self {
      justify-content: flex-end; /* 自己的消息靠右 */
      
      .message-card {
        width: 83.333%; /* 5/6宽度 */
        max-width: 600px; /* 最大宽度限制 */
        min-width: 400px; /* 最小宽度确保可读性 */
      }
    }

    &.message-other {
      justify-content: flex-start; /* 其他人的消息靠左 */
      
      .message-card {
        width: 83.333%; /* 5/6宽度 */
        max-width: 600px; /* 最大宽度限制 */
        min-width: 400px; /* 最小宽度确保可读性 */
      }
    }
    
    .message-bubble {
      background: var(--terminal-card-bg, #0a0a0a);
      border: 1px solid var(--terminal-border-subtle, rgba(0, 255, 65, 0.15));
      color: var(--terminal-text-primary, #ffffff);
      
      &:hover {
        border-color: var(--terminal-border-hover, rgba(0, 255, 65, 0.5));
        box-shadow: 0 0 8px rgba(0, 255, 65, 0.2);
      }
    }
  }

  .connection-status {
    background: var(--terminal-card-bg, #0a0a0a);
    border-top: 1px solid var(--terminal-border-subtle, rgba(0, 255, 65, 0.15));
    color: var(--terminal-text-primary, #ffffff);
  }

  .stats-panel {
    background: var(--terminal-panel-bg, #111111);
    border-top: 1px solid var(--terminal-border-subtle, rgba(0, 255, 65, 0.15));
    color: var(--terminal-text-primary, #ffffff);
  }

  .drag-overlay {
    background: rgba(0, 0, 0, 0.8);
    color: var(--terminal-text-primary, #ffffff);
    
    .drag-content {
      h3, p {
        color: var(--terminal-text-primary, #ffffff);
      }
    }
  }

  .loading-history {
    color: var(--terminal-text-primary, #ffffff);
  }

  .history-divider {
    .divider-content {
      .divider-text {
        color: var(--terminal-text-primary, #ffffff);
        font-family: 'Courier New', monospace;
        text-transform: uppercase;
      }
    }
  }
}
</style>
