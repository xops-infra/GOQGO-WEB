import { ref, computed, nextTick } from 'vue'
import { useMessage } from 'naive-ui'
import { useChatStore } from '@/stores/chat'
import { useUserStore } from '@/stores/user'
import { filesApi } from '@/api/files'
import type { Message } from '@/types/api'

export function useChatRoom(props: any, emit: any) {
  const message = useMessage()
  const chatStore = useChatStore()
  const userStore = useUserStore()

  // 响应式数据
  const isDragActive = ref(false)
  const dragCounter = ref(0)
  const isLoadingHistory = ref(false)
  const isInitialLoad = ref(true)
  const shouldAutoScroll = ref(true)
  const isUserScrolling = ref(false)
  const scrollTimeout = ref<NodeJS.Timeout | null>(null)

  // 计算属性
  const messages = computed(() => chatStore.messages)

  const visibleMessages = computed(() => {
    const allMessages = messages.value
    if (props.maxVisibleMessages && allMessages.length > props.maxVisibleMessages) {
      return allMessages.slice(-props.maxVisibleMessages)
    }
    return allMessages
  })

  const hasMoreHistory = computed(() => {
    return messages.value.length >= props.maxVisibleMessages
  })

  const shouldShowDivider = computed(() => {
    return hasMoreHistory.value && visibleMessages.value.length > 0
  })

  const isConnected = computed(() => chatStore.isConnected)

  // 拖拽处理方法
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    e.dataTransfer!.dropEffect = 'copy'
  }

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

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault()
    isDragActive.value = false
    dragCounter.value = 0

    const files = Array.from(e.dataTransfer?.files || [])
    const imageFiles = files.filter(file => file.type.startsWith('image/'))

    if (imageFiles.length === 0) {
      message.warning('请拖拽图片文件')
      return
    }

    for (const file of imageFiles) {
      await uploadAndSendImage(file)
    }
  }

  // 滚动处理方法
  const handleScroll = (e: Event) => {
    const target = e.target as HTMLElement
    const { scrollTop, scrollHeight, clientHeight } = target

    // 检测用户是否在滚动
    isUserScrolling.value = true
    if (scrollTimeout.value) {
      clearTimeout(scrollTimeout.value)
    }
    scrollTimeout.value = setTimeout(() => {
      isUserScrolling.value = false
    }, 150)

    // 检测是否在底部
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50
    shouldAutoScroll.value = isAtBottom

    // 发射滚动状态变化事件
    emit('scroll-change', isAtBottom)

    // 检测是否需要加载更多历史消息
    if (scrollTop < 100 && hasMoreHistory.value && !isLoadingHistory.value) {
      loadMoreHistory()
    }
  }

  const loadMoreHistory = async () => {
    if (isLoadingHistory.value || !hasMoreHistory.value) return

    isLoadingHistory.value = true
    try {
      await chatStore.loadMoreMessages(props.chatId, 20)
    } catch (error) {
      console.error('加载历史消息失败:', error)
      message.error('加载历史消息失败')
    } finally {
      isLoadingHistory.value = false
    }
  }

  const scrollToMessage = (messageId: string) => {
    // 滚动到指定消息
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`)
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  // 消息发送方法
  const handleSendMessage = async (text: string, mentionedAgents?: string[]) => {
    if (!text.trim()) return

    try {
      const newMessage = await chatStore.sendMessage({
        content: text,
        chatId: props.chatId,
        namespace: props.namespace,
        mentionedAgents
      })

      emit('message-sent', newMessage)
      
      // 发送后自动滚动到底部
      shouldAutoScroll.value = true
      nextTick(() => {
        scrollToBottom()
      })
    } catch (error: any) {
      console.error('发送消息失败:', error)
      message.error(`发送失败: ${error.message}`)
    }
  }

  const handleSendImage = async (imageUrl: string) => {
    try {
      const newMessage = await chatStore.sendMessage({
        content: `[图片]${imageUrl}`,
        chatId: props.chatId,
        namespace: props.namespace,
        type: 'image'
      })

      emit('message-sent', newMessage)
      
      // 发送后自动滚动到底部
      shouldAutoScroll.value = true
      nextTick(() => {
        scrollToBottom()
      })
    } catch (error: any) {
      console.error('发送图片失败:', error)
      message.error(`发送图片失败: ${error.message}`)
    }
  }

  const uploadAndSendImage = async (file: File) => {
    try {
      const loadingMessage = message.loading(`正在上传 ${file.name}...`, { duration: 0 })
      
      const result = await filesApi.uploadFile(userStore.currentUser.username, file)
      loadingMessage.destroy()

      await handleSendImage(result.url)
      message.success(`图片 ${file.name} 上传成功`)
    } catch (error: any) {
      console.error('上传图片失败:', error)
      message.error(`上传图片失败: ${error.message}`)
    }
  }

  const scrollToBottom = () => {
    // 这个方法会被MessagesContainer组件调用
    nextTick(() => {
      const container = document.querySelector('.messages-list')
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    })
  }

  // 生命周期方法
  const initializeChatRoom = async () => {
    try {
      // 连接聊天室
      await chatStore.connectToChat(props.chatId, props.namespace)
      
      // 加载初始消息
      await chatStore.loadMessages(props.chatId, props.maxVisibleMessages)
      
      // 初始加载完成后滚动到底部
      nextTick(() => {
        scrollToBottom()
        isInitialLoad.value = false
      })
    } catch (error) {
      console.error('初始化聊天室失败:', error)
      message.error('连接聊天室失败')
    }
  }

  const cleanupChatRoom = () => {
    // 清理定时器
    if (scrollTimeout.value) {
      clearTimeout(scrollTimeout.value)
    }
    
    // 断开聊天室连接
    chatStore.disconnectFromChat(props.chatId)
  }

  return {
    // 响应式数据
    isDragActive,
    isLoadingHistory,
    isInitialLoad,
    shouldAutoScroll,
    isUserScrolling,
    
    // 计算属性
    messages,
    visibleMessages,
    hasMoreHistory,
    shouldShowDivider,
    isConnected,
    
    // 方法
    handleDragOver,
    handleDrop,
    handleDragEnter,
    handleDragLeave,
    handleScroll,
    loadMoreHistory,
    scrollToMessage,
    handleSendMessage,
    handleSendImage,
    scrollToBottom,
    
    // 生命周期
    initializeChatRoom,
    cleanupChatRoom
  }
}

export default useChatRoom
