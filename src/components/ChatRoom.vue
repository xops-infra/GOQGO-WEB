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
    <!-- 聊天头部 -->
    <div class="chat-header">
      <div class="chat-title">
        <n-icon size="20" class="chat-icon">
          <svg viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3.04 1.05 4.35L1 22l5.65-2.05C8.96 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/>
          </svg>
        </n-icon>
        <span>{{ currentNamespace }} 聊天室</span>
      </div>
      <div class="online-status">
        <n-badge :value="onlineUsers.length" type="success">
          <n-icon size="18">
            <svg viewBox="0 0 24 24">
              <path fill="currentColor" d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.8 0-1.54.37-2.01 1.01L14 10l2 2v8h4zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm1.5 2h-2C3.57 8 2.46 9.04 2.07 10.39L1 15h2.5v7h4v-7H10l-1.07-4.61C8.54 9.04 7.43 8 6 8z"/>
            </svg>
          </n-icon>
        </n-badge>
      </div>
    </div>

    <!-- 消息列表 -->
    <div class="messages-container" ref="messagesContainer">
      <div class="messages-list">
        <div
          v-for="message in messages"
          :key="message.id"
          :class="['message-item', {
            'message-self': message.senderId === 'current-user',
            'message-other': message.senderId !== 'current-user',
            'message-system': message.type === 'system'
          }]"
        >
          <!-- 系统消息 -->
          <div v-if="message.type === 'system'" class="system-message">
            <span>{{ message.content }}</span>
          </div>
          
          <!-- 普通消息 -->
          <div v-else class="message-bubble-container">
            <!-- 头像 -->
            <div class="message-avatar">
              <n-avatar
                :size="36"
                :src="message.senderAvatar"
                :fallback-src="getDefaultAvatar(message.senderId)"
                round
              >
                {{ message.senderName.charAt(0) }}
              </n-avatar>
            </div>
            
            <!-- 消息内容 -->
            <div class="message-content">
              <!-- 发送者名称 -->
              <div v-if="message.senderId !== 'current-user'" class="sender-name">
                {{ message.senderName }}
              </div>
              
              <!-- 消息气泡 -->
              <div class="message-bubble">
                <!-- 图片消息 -->
                <div v-if="message.messageType === 'image' && message.imagePath" class="message-image-content">
                  <ImageMessage 
                    :image-path="message.imagePath"
                    :alt-text="`${message.senderName}发送的图片`"
                    :max-width="250"
                    :max-height="200"
                  />
                </div>
                <!-- 文本消息 -->
                <div v-else class="message-text">{{ message.content }}</div>
                
                <div class="message-time">
                  {{ formatTime(message.timestamp) }}
                  <n-icon
                    v-if="message.senderId === 'current-user'"
                    :size="12"
                    :class="['message-status', {
                      'status-sending': message.status === 'sending',
                      'status-sent': message.status === 'sent',
                      'status-error': message.status === 'error'
                    }]"
                  >
                    <svg v-if="message.status === 'sending'" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/>
                    </svg>
                    <svg v-else-if="message.status === 'sent'" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
                    </svg>
                    <svg v-else-if="message.status === 'error'" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                    </svg>
                  </n-icon>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 正在输入提示 -->
        <div v-if="typingUsers.length > 0" class="typing-indicator">
          <div class="typing-avatar">
            <n-avatar size="24" round>
              <n-icon size="12">
                <svg viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M7,9L12,14L17,9H7Z"/>
                </svg>
              </n-icon>
            </n-avatar>
          </div>
          <div class="typing-text">
            {{ typingUsers.join(', ') }} 正在输入...
            <div class="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <div class="input-container">
        <n-input
          v-model:value="inputMessage"
          type="textarea"
          :placeholder="isConnected ? '输入消息... (支持粘贴图片 Ctrl+V 或拖拽文件)' : '连接中...'"
          :disabled="!isConnected"
          :autosize="{ minRows: 1, maxRows: 4 }"
          @keydown="handleKeyDown"
          @input="handleInput"
          @blur="handleInputBlur"
          class="message-input"
          ref="inputRef"
        />
        <div class="input-actions">
          <n-button
            text
            @click="handleImageUpload"
            class="image-button"
            :disabled="!isConnected"
          >
            <n-icon size="20">
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19M21,19L16,10L11,17L7,13L3,19H21Z"/>
              </svg>
            </n-icon>
          </n-button>
          <n-button
            type="primary"
            :disabled="!inputMessage.trim() || !isConnected"
            @click="handleSendMessage"
            class="send-button"
            circle
          >
            <n-icon size="18">
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
              </svg>
            </n-icon>
          </n-button>
        </div>
      </div>
      
      <!-- 图片预览 -->
      <div v-if="imagePreview" class="image-preview">
        <div class="preview-container">
          <img :src="imagePreview.url" :alt="imagePreview.name" class="preview-image" />
          <div class="preview-info">
            <span class="preview-name">{{ imagePreview.name }}</span>
            <n-button text @click="clearImagePreview" class="preview-close">
              <n-icon size="16">
                <svg viewBox="0 0 24 24">
                  <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                </svg>
              </n-icon>
            </n-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { NIcon, NAvatar, NBadge, NInput, NButton, useMessage } from 'naive-ui'
import { useChatStore } from '@/stores/chat'
import { storeToRefs } from 'pinia'
import ImageMessage from './ImageMessage.vue'
import { handleImagePaste, isImagePath, extractImagePath, formatImagePath } from '@/utils/imageUtils'

// Props
interface Props {
  namespace?: string
}

const props = withDefaults(defineProps<Props>(), {
  namespace: 'default'
})

// 状态管理
const chatStore = useChatStore()
const { messages, onlineUsers, typingUsers, isConnected, currentNamespace } = storeToRefs(chatStore)
const message = useMessage()

// 响应式数据
const inputMessage = ref('')
const messagesContainer = ref<HTMLElement>()
const inputRef = ref()
const typingTimer = ref<NodeJS.Timeout>()
const imagePreview = ref<{ url: string; name: string; file: File } | null>(null)
const isDragActive = ref(false)
const dragCounter = ref(0)

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 格式化时间
const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) { // 1分钟内
    return '刚刚'
  } else if (diff < 3600000) { // 1小时内
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (date.toDateString() === now.toDateString()) { // 今天
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else {
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }
}

// 获取默认头像
const getDefaultAvatar = (senderId: string) => {
  const colors = ['#f56565', '#ed8936', '#ecc94b', '#48bb78', '#38b2ac', '#4299e1', '#667eea', '#9f7aea']
  const index = senderId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="36" fill="${colors[index]}" rx="18"/>
    </svg>
  `)}`
}

// 处理图片粘贴
const handlePaste = async (e: ClipboardEvent) => {
  console.log('=== 图片粘贴事件开始 ===')
  console.log('事件对象:', e)
  console.log('事件类型:', e.type)
  console.log('目标元素:', e.target)
  
  if (!e.clipboardData) {
    console.log('❌ 没有剪贴板数据')
    return
  }
  
  console.log('✅ 剪贴板数据存在')
  console.log('剪贴板数据类型:', e.clipboardData.constructor.name)
  
  const items = Array.from(e.clipboardData.items)
  console.log('剪贴板项目数量:', items.length)
  console.log('剪贴板项目详情:', items.map((item, index) => ({
    index,
    type: item.type,
    kind: item.kind,
    constructor: item.constructor.name
  })))
  
  // 检查所有类型
  const types = e.clipboardData.types
  console.log('剪贴板类型列表:', types)
  
  try {
    // 检查是否有图片数据
    const imageItem = items.find(item => item.type.startsWith('image/'))
    
    if (imageItem) {
      console.log('🖼️ 找到图片项目!')
      console.log('图片类型:', imageItem.type)
      console.log('图片种类:', imageItem.kind)
      
      e.preventDefault() // 阻止默认粘贴行为
      console.log('✅ 已阻止默认粘贴行为')
      
      const file = imageItem.getAsFile()
      console.log('获取文件结果:', file)
      
      if (file) {
        console.log('📁 成功获取图片文件!')
        console.log('文件名:', file.name)
        console.log('文件类型:', file.type)
        console.log('文件大小:', file.size, 'bytes')
        console.log('最后修改时间:', new Date(file.lastModified))
        
        // 生成图片路径
        const timestamp = Date.now()
        const randomId = Math.floor(Math.random() * 10000)
        const extension = getFileExtension(file.type)
        const fileName = `image_${timestamp}_${randomId}.${extension}`
        const imagePath = `/Users/mikas/Library/Application Support/cliExtra/temp_images/${fileName}`
        
        console.log('📝 生成的文件信息:')
        console.log('- 时间戳:', timestamp)
        console.log('- 随机ID:', randomId)
        console.log('- 扩展名:', extension)
        console.log('- 文件名:', fileName)
        console.log('- 完整路径:', imagePath)
        
        // 显示成功提示
        message.success(`图片已粘贴: ${fileName}`)
        console.log('✅ 显示成功提示')
        
        // 发送图片消息
        console.log('📤 开始发送图片消息...')
        await chatStore.sendImageMessage(imagePath)
        console.log('✅ 图片消息发送完成')
        
        scrollToBottom()
        console.log('✅ 滚动到底部完成')
      } else {
        console.log('❌ 无法获取图片文件')
        console.log('getAsFile() 返回:', file)
      }
    } else {
      console.log('❌ 剪贴板中没有图片数据')
      console.log('可用的类型:', items.map(item => item.type))
      
      // 尝试获取其他数据
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        console.log(`项目 ${i}:`, {
          type: item.type,
          kind: item.kind
        })
        
        if (item.kind === 'string') {
          item.getAsString((str) => {
            console.log(`项目 ${i} 字符串内容:`, str.substring(0, 100))
          })
        }
      }
    }
  } catch (error) {
    console.error('❌ 处理图片粘贴失败:', error)
    console.error('错误堆栈:', error.stack)
    message.error('图片粘贴失败')
  }
  
  console.log('=== 图片粘贴事件结束 ===')
}

// 获取文件扩展名
const getFileExtension = (mimeType: string): string => {
  const mimeMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg', 
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/bmp': 'bmp'
  }
  return mimeMap[mimeType] || 'png'
}

// 处理拖拽进入
const handleDragEnter = (e: DragEvent) => {
  e.preventDefault()
  dragCounter.value++
  console.log('🎯 拖拽进入，计数器:', dragCounter.value)
  
  if (dragCounter.value === 1) {
    isDragActive.value = true
    console.log('✅ 激活拖拽状态')
  }
}

// 处理拖拽离开
const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  dragCounter.value--
  console.log('🚪 拖拽离开，计数器:', dragCounter.value)
  
  if (dragCounter.value === 0) {
    isDragActive.value = false
    console.log('❌ 取消拖拽状态')
  }
}

// 处理拖拽悬停
const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  e.dataTransfer!.dropEffect = 'copy'
}

// 处理文件拖拽释放
const handleDrop = async (e: DragEvent) => {
  e.preventDefault()
  console.log('=== 文件拖拽释放 ===')
  
  // 重置拖拽状态
  isDragActive.value = false
  dragCounter.value = 0
  
  if (!e.dataTransfer) {
    console.log('❌ 没有拖拽数据')
    return
  }
  
  const files = Array.from(e.dataTransfer.files)
  console.log('📁 拖拽的文件数量:', files.length)
  
  if (files.length === 0) {
    console.log('❌ 没有文件')
    return
  }
  
  // 处理第一个图片文件
  const imageFile = files.find(file => file.type.startsWith('image/'))
  
  if (imageFile) {
    console.log('🖼️ 找到图片文件:', imageFile.name, imageFile.type, imageFile.size)
    
    try {
      // 生成图片路径
      const timestamp = Date.now()
      const randomId = Math.floor(Math.random() * 10000)
      const extension = getFileExtension(imageFile.type)
      const fileName = `image_${timestamp}_${randomId}.${extension}`
      const imagePath = `/Users/mikas/Library/Application Support/cliExtra/temp_images/${fileName}`
      
      console.log('📝 生成图片路径:', imagePath)
      
      // 显示成功提示
      message.success(`图片已拖拽上传: ${fileName}`)
      
      // 发送图片消息
      await chatStore.sendImageMessage(imagePath, imageFile)
      scrollToBottom()
      
    } catch (error) {
      console.error('❌ 处理拖拽图片失败:', error)
      message.error('图片上传失败')
    }
  } else {
    console.log('❌ 拖拽的文件中没有图片')
    message.warning('请拖拽图片文件 (PNG, JPG, GIF等)')
  }
}

// 处理图片上传按钮点击
const handleImageUpload = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      try {
        // 创建预览
        const url = URL.createObjectURL(file)
        imagePreview.value = { url, name: file.name, file }
      } catch (error) {
        console.error('处理图片上传失败:', error)
        message.error('图片上传失败')
      }
    }
  }
  input.click()
}

// 清除图片预览
const clearImagePreview = () => {
  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value.url)
    imagePreview.value = null
  }
}

// 发送消息
const handleSendMessage = async () => {
  if (imagePreview.value) {
    // 发送图片消息
    try {
      await chatStore.sendImageMessage('', imagePreview.value.file)
      clearImagePreview()
      scrollToBottom()
    } catch (error) {
      message.error('发送图片失败')
    }
    return
  }

  if (!inputMessage.value.trim()) return
  
  try {
    // 检查是否为图片路径格式
    if (isImagePath(inputMessage.value)) {
      const imagePath = extractImagePath(inputMessage.value)
      if (imagePath) {
        await chatStore.sendImageMessage(imagePath)
      }
    } else {
      await chatStore.sendMessage(inputMessage.value)
    }
    
    inputMessage.value = ''
    scrollToBottom()
  } catch (error) {
    message.error('发送消息失败')
  }
}

// 处理键盘事件
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSendMessage()
  }
}

// 处理输入事件（正在输入状态）
const handleInput = () => {
  chatStore.sendTyping(true)
  
  // 清除之前的定时器
  if (typingTimer.value) {
    clearTimeout(typingTimer.value)
  }
  
  // 设置新的定时器，1秒后停止输入状态
  typingTimer.value = setTimeout(() => {
    chatStore.sendTyping(false)
  }, 1000)
}

// 输入框失焦
const handleInputBlur = () => {
  chatStore.sendTyping(false)
  if (typingTimer.value) {
    clearTimeout(typingTimer.value)
  }
}

// 监听消息变化，自动滚动
watch(messages, () => {
  scrollToBottom()
}, { deep: true })

// 生命周期
onMounted(async () => {
  console.log('=== ChatRoom组件挂载 ===')
  console.log('命名空间:', props.namespace)
  
  try {
    console.log('🔗 开始连接聊天室...')
    await chatStore.connect(props.namespace)
    console.log('✅ 聊天室连接成功')
    
    scrollToBottom()
    console.log('✅ 滚动到底部完成')
    
    // 等待DOM更新
    await nextTick()
    
    // 使用多种方式添加粘贴事件监听器
    setTimeout(() => {
      console.log('🔍 开始绑定粘贴事件...')
      
      // 方法1: 通过inputRef访问Naive UI组件
      if (inputRef.value) {
        console.log('✅ 找到inputRef组件')
        
        // 获取Naive UI内部的textarea元素
        const textareaEl = inputRef.value.$el?.querySelector('textarea')
        if (textareaEl) {
          console.log('✅ 通过ref找到textarea，绑定粘贴事件')
          textareaEl.addEventListener('paste', handlePaste)
        }
      }
      
      // 方法2: 查找所有textarea元素
      const textareas = document.querySelectorAll('textarea')
      console.log('🔍 找到的textarea元素数量:', textareas.length)
      
      textareas.forEach((textarea, index) => {
        if (textarea.placeholder && textarea.placeholder.includes('输入消息')) {
          console.log(`✅ 找到聊天输入框 ${index}，添加粘贴事件`)
          textarea.addEventListener('paste', handlePaste)
        }
      })
      
      // 方法3: 通过类名查找
      const messageInputs = document.querySelectorAll('.message-input textarea')
      console.log('🔍 通过类名找到的输入框数量:', messageInputs.length)
      
      messageInputs.forEach((input, index) => {
        console.log(`✅ 为输入框 ${index} 添加粘贴事件`)
        input.addEventListener('paste', handlePaste)
      })
      
      // 方法4: 全局粘贴事件作为备用
      console.log('👂 添加全局粘贴事件监听器')
      document.addEventListener('paste', handleGlobalPaste)
      
    }, 1000) // 延迟1秒确保DOM完全渲染
    
    // 测试环境信息
    console.log('🧪 测试环境信息:')
    console.log('- User Agent:', navigator.userAgent)
    console.log('- 是否为安全上下文:', window.isSecureContext)
    console.log('- 协议:', window.location.protocol)
    
  } catch (error) {
    console.error('❌ 连接聊天室失败:', error)
    message.error('连接聊天室失败')
  }
})

onUnmounted(() => {
  console.log('=== ChatRoom组件卸载 ===')
  
  chatStore.disconnect()
  if (typingTimer.value) {
    clearTimeout(typingTimer.value)
  }
  clearImagePreview()
  
  // 移除输入框粘贴事件监听器
  const inputElement = document.querySelector('.message-input textarea') as HTMLTextAreaElement
  if (inputElement) {
    inputElement.removeEventListener('paste', handlePaste)
    console.log('✅ 输入框粘贴事件监听器已移除')
  }
  
  // 移除全局粘贴事件监听器
  document.removeEventListener('paste', handleGlobalPaste)
  console.log('✅ 全局粘贴事件监听器已移除')
})

// 全局粘贴事件处理
const handleGlobalPaste = (e: ClipboardEvent) => {
  console.log('=== 全局粘贴事件触发 ===')
  console.log('当前活动元素:', document.activeElement)
  console.log('活动元素标签:', document.activeElement?.tagName)
  console.log('活动元素类名:', document.activeElement?.className)
  
  // 检查是否在聊天室组件内
  const chatRoom = document.querySelector('.chat-room')
  const isInChatRoom = chatRoom && chatRoom.contains(document.activeElement)
  
  console.log('是否在聊天室内:', !!isInChatRoom)
  
  // 如果在聊天室内，就处理粘贴事件
  if (isInChatRoom) {
    console.log('✅ 在聊天室内，调用handlePaste')
    handlePaste(e)
  } else {
    console.log('❌ 不在聊天室内，忽略粘贴事件')
  }
}
</script>

<style scoped lang="scss">
.chat-room {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f5f5;
  position: relative;
  
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
}

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

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e5e5e5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  .chat-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: #333;

    .chat-icon {
      color: #07c160;
    }
  }

  .online-status {
    display: flex;
    align-items: center;
    color: #666;
  }
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 2px;
  }
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-item {
  &.message-system {
    display: flex;
    justify-content: center;
    
    .system-message {
      background: rgba(0, 0, 0, 0.1);
      color: #666;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
    }
  }

  &.message-self {
    .message-bubble-container {
      flex-direction: row-reverse;
      
      .message-content {
        align-items: flex-end;
        
        .message-bubble {
          background: #07c160;
          color: white;
          
          &::before {
            right: -6px;
            border-left-color: #07c160;
            border-right: none;
          }
        }
      }
    }
  }

  &.message-other {
    .message-bubble {
      background: white;
      color: #333;
      
      &::before {
        left: -6px;
        border-right-color: white;
        border-left: none;
      }
    }
  }
}

.message-bubble-container {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.message-avatar {
  flex-shrink: 0;
}

.message-content {
  display: flex;
  flex-direction: column;
  max-width: 70%;
  gap: 4px;
}

.sender-name {
  font-size: 12px;
  color: #666;
  padding: 0 12px;
}

.message-bubble {
  position: relative;
  padding: 8px 12px;
  border-radius: 18px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  word-wrap: break-word;
  
  &::before {
    content: '';
    position: absolute;
    top: 12px;
    width: 0;
    height: 0;
    border: 6px solid transparent;
  }
}

.message-text {
  line-height: 1.4;
  white-space: pre-wrap;
}

.message-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 4px;
  
  .message-item.message-other & {
    color: #999;
  }
}

.message-status {
  &.status-sending {
    color: rgba(255, 255, 255, 0.5);
    animation: spin 1s linear infinite;
  }
  
  &.status-sent {
    color: rgba(255, 255, 255, 0.7);
  }
  
  &.status-error {
    color: #ff4757;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  
  .typing-text {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #666;
  }
}

.typing-dots {
  display: flex;
  gap: 2px;
  
  span {
    width: 4px;
    height: 4px;
    background: #666;
    border-radius: 50%;
    animation: typing 1.4s infinite ease-in-out;
    
    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
  }
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.input-area {
  background: white;
  border-top: 1px solid #e5e5e5;
  padding: 12px 16px;
}

.input-container {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.message-input {
  flex: 1;
  
  :deep(.n-input__textarea) {
    border-radius: 20px;
    padding: 8px 16px;
    resize: none;
  }
}

.input-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.image-button {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: #666;
  
  &:hover {
    background: #f0f0f0;
    color: #333;
  }
  
  &:disabled {
    color: #ccc;
  }
}

.send-button {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  background: #07c160;
  
  &:hover {
    background: #06ad56;
  }
  
  &:disabled {
    background: #ccc;
  }
}

.message-image-content {
  padding: 0;
  
  .message-bubble.message-self & {
    background: transparent;
  }
  
  .message-bubble.message-other & {
    background: transparent;
  }
}

.image-preview {
  margin-top: 8px;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
}

.preview-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.preview-image {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.preview-info {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.preview-name {
  font-size: 12px;
  color: #666;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-close {
  color: #999;
  
  &:hover {
    color: #666;
  }
}
</style>
