<template>
  <div class="chat-input-wrapper">
    <!-- @mention 选择框 - 显示在输入框上方 -->
    <div v-if="showMentionDropdown" class="mention-selector">
      <!-- 调试信息 -->
      <div style="background: #f0f0f0; padding: 4px 8px; font-size: 12px; border-bottom: 1px solid #ddd;">
        调试: 选中索引 {{ selectedMentionIndex }}, 总数 {{ filteredAgents.length }}
      </div>
      
      <div class="mention-list">
        <div 
          v-for="(agent, index) in filteredAgents" 
          :key="agent.name"
          class="mention-item"
          :class="{ 'mention-item-selected': index === selectedMentionIndex }"
          @click="selectMention(agent)"
          @mouseenter="selectedMentionIndex = index"
          :style="{ 
            backgroundColor: index === selectedMentionIndex ? '#1890ff' : 'transparent',
            color: index === selectedMentionIndex ? 'white' : 'inherit'
          }"
        >
          <div class="mention-info">
            <span class="mention-name">@{{ agent.name }}</span>
            <span class="mention-role">{{ agent.role }}</span>
          </div>
          <kbd v-if="index < 9" class="mention-key">{{ index + 1 }}</kbd>
          <span style="margin-left: 8px; font-size: 10px;">{{ index === selectedMentionIndex ? '✓' : '' }}</span>
        </div>
        
        <div v-if="filteredAgents.length === 0" class="mention-empty">
          没有找到匹配的 Agent
        </div>
      </div>
    </div>

    <div class="chat-input">
    <!-- 图片预览区域 -->
    <div v-if="imagePreviews.length > 0" class="image-preview-area">
      <div class="divider-line">
        <div class="line"></div>
      </div>
      <TransitionGroup name="image-list" tag="div" class="preview-list">
        <div 
          v-for="(preview, index) in imagePreviews" 
          :key="preview.url"
          class="image-preview-item"
        >
          <img :src="preview.url" @click="handlePreviewClick(preview)" />
          <div class="delete-btn" @click="removeImage(index)">
            <n-icon size="14">
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
              </svg>
            </n-icon>
          </div>
          <div class="image-size">{{ formatFileSize(preview.file.size) }}</div>
        </div>
      </TransitionGroup>
      <div class="divider-line">
        <div class="line"></div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div 
      class="input-container"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
      :class="{ 'drag-over': isDragOver }"
    >
      <n-input
        v-model:value="inputMessage"
        type="textarea"
        :placeholder="placeholderText"
        :disabled="!isConnected"
        :autosize="{ minRows: 1, maxRows: 4 }"
        @keydown="handleKeyDown"
        @keyup="handleKeyUp"
        @paste="handlePaste"
        @input="handleInput"
        @blur="handleInputBlur"
        @compositionstart="handleCompositionStart"
        @compositionend="handleCompositionEnd"
        class="message-input"
        ref="inputRef"
      />
      <div class="input-actions">
        <!-- 简化的附件上传按钮 -->
        <n-tooltip>
          <template #trigger>
            <n-button
              text
              @click="handleFileUpload"
              class="attachment-button"
              :disabled="!isConnected"
            >
              <template #icon>
                <n-icon size="18">
                  <svg viewBox="0 0 24 24">
                    <path fill="currentColor" d="M16.5,6V17.5A4,4 0 0,1 12.5,21.5A4,4 0 0,1 8.5,17.5V5A2.5,2.5 0 0,1 11,2.5A2.5,2.5 0 0,1 13.5,5V15.5A1,1 0 0,1 12.5,16.5A1,1 0 0,1 11.5,15.5V6H10V15.5A2.5,2.5 0 0,0 12.5,18A2.5,2.5 0 0,0 15,15.5V5A4,4 0 0,0 11,1A4,4 0 0,0 7,5V17.5A5.5,5.5 0 0,0 12.5,23A5.5,5.5 0 0,0 18,17.5V6H16.5Z"/>
                  </svg>
                </n-icon>
              </template>
            </n-button>
          </template>
          上传文件 (支持拖拽，限制5MB，不支持视频)
        </n-tooltip>
        
        <n-button
          type="primary"
          :disabled="!canSendMessage"
          @click="handleSendMessage"
          class="send-button"
          circle
        >
          <template #icon>
            <n-icon size="18">
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
              </svg>
            </n-icon>
          </template>
        </n-button>
      </div>
      
      <!-- 拖拽提示层 -->
      <div v-if="isDragOver" class="drag-overlay">
        <div class="drag-content">
          <n-icon size="48" color="#07c160">
            <svg viewBox="0 0 24 24">
              <path fill="currentColor" d="M16.5,6V17.5A4,4 0 0,1 12.5,21.5A4,4 0 0,1 8.5,17.5V5A2.5,2.5 0 0,1 11,2.5A2.5,2.5 0 0,1 13.5,5V15.5A1,1 0 0,1 12.5,16.5A1,1 0 0,1 11.5,15.5V6H10V15.5A2.5,2.5 0 0,0 12.5,18A2.5,2.5 0 0,0 15,15.5V5A4,4 0 0,0 11,1A4,4 0 0,0 7,5V17.5A5.5,5.5 0 0,0 12.5,23A5.5,5.5 0 0,0 18,17.5V6H16.5Z"/>
            </svg>
          </n-icon>
          <p>拖拽文件到这里上传</p>
          <p class="drag-hint">支持图片、文档等文件，限制5MB，不支持视频</p>
        </div>
      </div>
    </div>

    <!-- 图片预览弹窗 -->
    <n-modal
      v-model:show="showImagePreview"
      preset="card"
      style="width: auto; max-width: 90vw;"
      :mask-closable="true"
      :close-on-esc="true"
      transform-origin="center"
      class="image-preview-modal"
    >
      <div class="preview-container">
        <!-- 左箭头 -->
        <div 
          v-if="imagePreviews.length > 1" 
          class="nav-button prev"
          @click="prevImage"
        >
          <n-icon size="24">
            <svg viewBox="0 0 24 24">
              <path fill="currentColor" d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z"/>
            </svg>
          </n-icon>
        </div>

        <!-- 图片 -->
        <img :src="currentPreviewUrl" @click="closePreview" />

        <!-- 右箭头 -->
        <div 
          v-if="imagePreviews.length > 1" 
          class="nav-button next"
          @click="nextImage"
        >
          <n-icon size="24">
            <svg viewBox="0 0 24 24">
              <path fill="currentColor" d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"/>
            </svg>
          </n-icon>
        </div>

        <!-- 计数器 -->
        <div v-if="imagePreviews.length > 1" class="preview-counter">
          {{ currentPreviewIndex + 1 }} / {{ imagePreviews.length }}
        </div>
      </div>
    </n-modal>
  </div>
</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useMessage } from 'naive-ui'
import { formatFileSize, generateFileName } from '@/utils/file'
import { uploadFile } from '@/api/upload'
import { useAgentsStore } from '@/stores/agents'

const props = defineProps<{
  isConnected: boolean
  namespace?: string
}>()

const emit = defineEmits<{
  (e: 'send', message: string): void
  (e: 'send-image', url: string): void
}>()

// 状态管理
const message = useMessage()
const agentsStore = useAgentsStore()

// 响应式数据
const inputMessage = ref('')
const inputRef = ref()
const imagePreviews = ref<Array<{ url: string; name: string; file: File }>>([])
const showImagePreview = ref(false)

// @mention 相关数据
const showMentionDropdown = ref(false)
const mentionQuery = ref('')
const mentionStartPos = ref(0)
const selectedMentionIndex = ref(0)
const mentionAgents = ref<Array<{ name: string; role: string }>>([])

// 计算属性 - 过滤匹配的 agents
const filteredAgents = computed(() => {
  console.log('🔍 过滤 Agents:', {
    query: mentionQuery.value,
    allAgents: agentsStore.agents.length,
    showDropdown: showMentionDropdown.value
  })
  
  if (!mentionQuery.value) {
    const result = agentsStore.agents.slice(0, 5) // 显示前5个
    console.log('📋 无查询，返回前5个:', result.map(a => a.name))
    return result
  }
  
  const filtered = agentsStore.agents
    .filter(agent => 
      agent.name.toLowerCase().includes(mentionQuery.value.toLowerCase()) ||
      agent.role.toLowerCase().includes(mentionQuery.value.toLowerCase())
    )
    .slice(0, 5)
    
  console.log('🔎 过滤结果:', filtered.map(a => ({ name: a.name, role: a.role })))
  return filtered
})
const currentPreviewIndex = ref(0)

// 草稿保存功能
const draftKey = computed(() => `chat-draft-${props.namespace || 'default'}`)
const draftSaveTimer = ref<NodeJS.Timeout>()

// 快捷键状态
const isCtrlPressed = ref(false)
const isShiftPressed = ref(false)

// 计算属性
const canSendMessage = computed(() => {
  return (inputMessage.value.trim() || imagePreviews.value.length > 0) && props.isConnected
})

const currentPreviewUrl = computed(() => {
  return imagePreviews.value[currentPreviewIndex.value]?.url || ''
})

const placeholderText = computed(() => {
  if (!props.isConnected) return '连接中...'
  return '输入消息... (Enter发送, Shift+Enter换行, Ctrl+Enter强制发送, Esc清空, 支持粘贴图片)'
})

// 处理图片粘贴
const handlePaste = async (e: ClipboardEvent) => {
  console.log('=== 文件粘贴事件开始 ===')
  
  if (!e.clipboardData) {
    console.log('❌ 没有剪贴板数据')
    return
  }
  
  const items = Array.from(e.clipboardData.items)
  console.log('📋 剪贴板项目:', items.map(item => ({ type: item.type, kind: item.kind })))
  
  try {
    // 检查是否有文件数据
    const fileItems = items.filter(item => item.kind === 'file')
    
    for (const fileItem of fileItems) {
      console.log('📎 找到文件项目:', fileItem.type)
      e.preventDefault() // 阻止默认粘贴行为
      
      const file = fileItem.getAsFile()
      if (file) {
        console.log('📄 获取到文件:', file.name, file.type, file.size)
        await addFile(file)
      }
    }
  } catch (error) {
    console.error('❌ 处理图片粘贴失败:', error)
    message.error('图片粘贴失败')
  }
}

// 处理拖拽进入
const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = true
}

// 处理拖拽离开
const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  // 只有当离开整个容器时才设置为false
  if (!(e.currentTarget as Element)?.contains(e.relatedTarget as Node)) {
    isDragOver.value = false
  }
}

// 处理文件拖拽放置
const handleDrop = async (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = false
  
  const files = Array.from(e.dataTransfer?.files || [])
  console.log('🗂️ 拖拽文件数量:', files.length)
  
  for (const file of files) {
    await addFile(file)
  }
}

// 处理文件上传按钮点击
const handleFileUpload = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '*'
  input.multiple = true
  input.onchange = async (e) => {
    const files = Array.from((e.target as HTMLInputElement).files || [])
    console.log('📁 选择文件数量:', files.length)
    
    for (const file of files) {
      await addFile(file)
    }
  }
  input.click()
}

// 处理图片上传按钮点击
const handleImageUpload = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.multiple = true
  input.onchange = async (e) => {
    const files = Array.from((e.target as HTMLInputElement).files || [])
    for (const file of files) {
      try {
        // 创建本地预览URL
        const url = URL.createObjectURL(file)
        const fileName = generateFileName(file)
        
        imagePreviews.value.push({
          url,
          name: fileName,
          file
        })
      } catch (error) {
        console.error('处理图片失败:', error)
        message.error('处理图片失败')
      }
    }
  }
  input.click()
}

// 发送消息
const handleSendMessage = async () => {
  if (!props.isConnected) return
  
  try {
    // 处理所有图片
    for (const preview of imagePreviews.value) {
      try {
        // 上传图片
        const url = await uploadFile(preview.file)
        emit('send-image', url)
        
        // 释放本地预览URL
        URL.revokeObjectURL(preview.url)
      } catch (error) {
        console.error('上传图片失败:', error)
        message.error('上传图片失败')
      }
    }
    
    // 清理所有预览
    imagePreviews.value = []
    
    // 发送文本消息
    if (inputMessage.value.trim()) {
      emit('send', inputMessage.value)
      inputMessage.value = ''
      clearDraft() // 发送成功后清除草稿
    }
  } catch (error) {
    console.error('发送消息失败:', error)
    message.error('发送失败')
  }
}

// 处理图片预览点击
const handlePreviewClick = (preview: { url: string }) => {
  const index = imagePreviews.value.findIndex(p => p.url === preview.url)
  if (index !== -1) {
    currentPreviewIndex.value = index
    showImagePreview.value = true
  }
}

// 关闭预览
const closePreview = () => {
  showImagePreview.value = false
}

// 上一张图片
const prevImage = () => {
  if (currentPreviewIndex.value > 0) {
    currentPreviewIndex.value--
  } else {
    currentPreviewIndex.value = imagePreviews.value.length - 1
  }
}

// 下一张图片
const nextImage = () => {
  if (currentPreviewIndex.value < imagePreviews.value.length - 1) {
    currentPreviewIndex.value++
  } else {
    currentPreviewIndex.value = 0
  }
}

// 移除图片
const removeImage = (index: number) => {
  const preview = imagePreviews.value[index]
  URL.revokeObjectURL(preview.url)
  imagePreviews.value.splice(index, 1)
}

// 处理输入事件
const handleInput = () => {
  // 检测 @mention
  checkMentionTrigger()
  
  // 保存草稿
  saveDraft()
}

// 获取 Agent 状态类型
const getAgentStatusType = (status: string) => {
  const statusMap: Record<string, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
    'idle': 'success',      // 空闲状态 - 绿色
    'busy': 'info',         // 忙碌状态 - 蓝色  
    'running': 'info',      // 运行状态 - 蓝色
    'stopped': 'default',   // 停止状态 - 灰色
    'creating': 'warning',  // 创建中状态 - 橙色
    'error': 'error',       // 错误状态 - 红色
    'terminating': 'warning' // 终止中状态 - 橙色
  }
  return statusMap[status.toLowerCase()] || 'default'
}

// 选择 mention
const selectMention = (agent: { name: string; role: string }) => {
  console.log('🎯 选择 Agent:', agent)
  
  const input = inputRef.value?.textareaElRef
  if (!input) {
    console.log('❌ 无法获取输入框引用')
    return
  }

  const text = inputMessage.value
  const beforeMention = text.substring(0, mentionStartPos.value)
  const afterMention = text.substring(input.selectionStart)
  
  console.log('📝 文本替换:', {
    original: text,
    beforeMention,
    afterMention,
    mentionStartPos: mentionStartPos.value,
    cursorPos: input.selectionStart
  })
  
  // 构建新的文本
  const newText = beforeMention + `@${agent.name} ` + afterMention
  inputMessage.value = newText
  
  console.log('✅ 新文本:', newText)
  
  // 设置光标位置
  const newCursorPos = mentionStartPos.value + agent.name.length + 2 // @ + name + space
  setTimeout(() => {
    input.focus()
    input.setSelectionRange(newCursorPos, newCursorPos)
    console.log('📍 光标位置设置为:', newCursorPos)
  }, 0)
  
  // 隐藏下拉框
  showMentionDropdown.value = false
  console.log('❌ 隐藏下拉框')
  
  // 保存草稿
  saveDraft()
}

// 隐藏 mention 下拉框
const hideMentionDropdown = () => {
  showMentionDropdown.value = false
}

// 检测 @mention 触发
const checkMentionTrigger = () => {
  console.log('🔍 检测 @mention 触发')
  
  const input = inputRef.value?.textareaElRef
  if (!input) {
    console.log('❌ 无法获取输入框引用')
    return
  }

  const cursorPos = input.selectionStart
  const text = inputMessage.value
  
  console.log('📝 当前输入:', { text, cursorPos })
  
  // 查找最近的 @ 符号
  let atPos = -1
  for (let i = cursorPos - 1; i >= 0; i--) {
    if (text[i] === '@') {
      atPos = i
      break
    }
    if (text[i] === ' ' || text[i] === '\n') {
      break
    }
  }
  
  console.log('🎯 @ 符号位置:', atPos)
  
  if (atPos !== -1) {
    // 提取 @ 后的查询文本
    const query = text.substring(atPos + 1, cursorPos)
    console.log('🔎 查询文本:', query)
    
    // 检查是否是有效的 mention（不包含空格和换行）
    if (!query.includes(' ') && !query.includes('\n')) {
      mentionStartPos.value = atPos
      mentionQuery.value = query
      selectedMentionIndex.value = 0
      showMentionDropdown.value = true
      
      console.log('✅ 显示 @mention 下拉框:', {
        startPos: atPos,
        query,
        agentsCount: filteredAgents.value.length,
        showDropdown: showMentionDropdown.value
      })
      return
    }
  }
  
  // 隐藏下拉框
  if (showMentionDropdown.value) {
    console.log('❌ 隐藏 @mention 下拉框')
    showMentionDropdown.value = false
  }
}

// 草稿保存功能
const saveDraft = () => {
  if (draftSaveTimer.value) {
    clearTimeout(draftSaveTimer.value)
  }
  
  draftSaveTimer.value = setTimeout(() => {
    if (inputMessage.value.trim()) {
      localStorage.setItem(draftKey.value, inputMessage.value)
    } else {
      localStorage.removeItem(draftKey.value)
    }
  }, 500) // 500ms防抖
}

// 加载草稿
const loadDraft = () => {
  const draft = localStorage.getItem(draftKey.value)
  if (draft) {
    inputMessage.value = draft
  }
}

// 清除草稿
const clearDraft = () => {
  localStorage.removeItem(draftKey.value)
  if (draftSaveTimer.value) {
    clearTimeout(draftSaveTimer.value)
  }
}

// 增强的按键处理
const handleKeyDown = (e: KeyboardEvent) => {
  console.log('⌨️ 按键事件:', { key: e.key, showMentionDropdown: showMentionDropdown.value })
  
  // 处理 @mention 下拉框的键盘导航
  if (showMentionDropdown.value) {
    console.log('🎯 处理 @mention 键盘导航:', { 
      key: e.key, 
      selectedIndex: selectedMentionIndex.value,
      agentsCount: filteredAgents.value.length 
    })
    
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const newIndex = Math.min(selectedMentionIndex.value + 1, filteredAgents.value.length - 1)
      selectedMentionIndex.value = newIndex
      console.log('⬇️ 向下选择:', newIndex)
      console.log('🔄 响应式状态检查:', {
        selectedMentionIndex: selectedMentionIndex.value,
        filteredAgentsLength: filteredAgents.value.length,
        showDropdown: showMentionDropdown.value
      })
      return
    }
    
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const newIndex = Math.max(selectedMentionIndex.value - 1, 0)
      selectedMentionIndex.value = newIndex
      console.log('⬆️ 向上选择:', newIndex)
      console.log('🔄 响应式状态检查:', {
        selectedMentionIndex: selectedMentionIndex.value,
        filteredAgentsLength: filteredAgents.value.length,
        showDropdown: showMentionDropdown.value
      })
      return
    }
    
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault()
      const selectedAgent = filteredAgents.value[selectedMentionIndex.value]
      if (selectedAgent) {
        console.log('✅ 确认选择 Agent:', selectedAgent.name)
        selectMention(selectedAgent)
      } else {
        console.log('❌ 没有选中的 Agent')
      }
      return
    }
    
    // 数字键快速选择 (1-9)
    if (e.key >= '1' && e.key <= '9') {
      e.preventDefault()
      const index = parseInt(e.key) - 1
      const selectedAgent = filteredAgents.value[index]
      if (selectedAgent) {
        console.log('🔢 数字键选择 Agent:', { key: e.key, index, agent: selectedAgent.name })
        selectedMentionIndex.value = index
        selectMention(selectedAgent)
      } else {
        console.log('❌ 数字键选择无效:', { key: e.key, index, agentsCount: filteredAgents.value.length })
      }
      return
    }
    
    if (e.key === 'Escape') {
      e.preventDefault()
      console.log('🚫 Escape 取消选择')
      showMentionDropdown.value = false
      return
    }
  }
  
  // 更新快捷键状态
  isCtrlPressed.value = e.ctrlKey || e.metaKey
  isShiftPressed.value = e.shiftKey
  
  // Enter发送消息
  if (e.key === 'Enter' && !e.shiftKey && !isComposing.value) {
    e.preventDefault()
    handleSendMessage()
    return
  }
  
  // Ctrl/Cmd + Enter 强制发送（即使在输入法状态）
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault()
    handleSendMessage()
    return
  }
  
  // Escape 清空输入
  if (e.key === 'Escape') {
    e.preventDefault()
    inputMessage.value = ''
    clearDraft()
    return
  }
  
  // Ctrl/Cmd + A 全选
  if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
    // 让浏览器处理默认的全选行为
    return
  }
  
  // Ctrl/Cmd + V 粘贴（已有handlePaste处理）
  if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
    // 让浏览器处理默认的粘贴行为，handlePaste会处理图片
    return
  }
}

// 按键释放处理
const handleKeyUp = (e: KeyboardEvent) => {
  isCtrlPressed.value = e.ctrlKey || e.metaKey
  isShiftPressed.value = e.shiftKey
}

// 输入法状态
const isComposing = ref(false)

// 拖拽状态
const isDragOver = ref(false)

// 文件大小限制 (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024

// 不支持的文件类型
const UNSUPPORTED_TYPES = ['video/']

// 检查文件是否有效
const isValidFile = (file: File) => {
  // 检查文件大小
  if (file.size > MAX_FILE_SIZE) {
    message.error(`文件 ${file.name} 超过5MB限制`)
    return false
  }
  
  // 检查是否为视频文件
  if (UNSUPPORTED_TYPES.some(type => file.type.startsWith(type))) {
    message.error(`不支持视频文件: ${file.name}`)
    return false
  }
  
  return true
}

// 处理文件添加
const addFile = async (file: File) => {
  if (!isValidFile(file)) return
  
  try {
    // 创建本地预览URL
    const url = URL.createObjectURL(file)
    const fileName = generateFileName(file)
    
    imagePreviews.value.push({
      url,
      name: fileName,
      file
    })
    
    console.log('📎 添加文件:', fileName, `(${formatFileSize(file.size)})`)
  } catch (error) {
    console.error('处理文件失败:', error)
    message.error(`处理文件 ${file.name} 失败`)
  }
}

// 处理多个文件添加（供外部调用）
const addFiles = async (files: File[]) => {
  for (const file of files) {
    await addFile(file)
  }
}

// 暴露方法给父组件
defineExpose({
  addFiles
})

// 输入法状态处理
const handleCompositionStart = () => {
  isComposing.value = true
}

const handleCompositionEnd = () => {
  isComposing.value = false
}

// 处理失焦事件
const handleInputBlur = () => {
  // 延迟隐藏 mention 下拉框，允许点击选项
  setTimeout(() => {
    showMentionDropdown.value = false
  }, 150)
  
  // 失焦时保存草稿
  saveDraft()
}

// 生命周期
onMounted(() => {
  console.log('🚀 ChatInput 组件挂载')
  console.log('📊 Agents Store 状态:', {
    agentsCount: agentsStore.agents.length,
    agents: agentsStore.agents.map(a => ({ name: a.name, role: a.role }))
  })
  
  // 组件挂载时加载草稿
  loadDraft()
})

onUnmounted(() => {
  // 组件卸载时清理定时器
  if (draftSaveTimer.value) {
    clearTimeout(draftSaveTimer.value)
  }
})
</script>

<style scoped lang="scss">
.chat-input {
  border-top: 1px solid #eee;
  background: white;
  position: sticky;
  bottom: 0;
  z-index: 10;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

.image-preview-area {
  padding: 12px 16px;
  position: relative;
  
  .divider-line {
    position: absolute;
    left: 0;
    right: 0;
    height: 1px;
    padding: 0 16px;
    
    &:first-child {
      top: 0;
    }
    
    &:last-child {
      bottom: 0;
    }
    
    .line {
      height: 100%;
      background: linear-gradient(
        to right,
        transparent,
        rgba(0, 0, 0, 0.1) 20%,
        rgba(0, 0, 0, 0.1) 80%,
        transparent
      );
    }
  }
  
  .preview-list {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    padding: 12px 0;
  }
}

.image-preview-item {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  background: #f5f5f5;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.2s;
    cursor: zoom-in;
    
    &:hover {
      transform: scale(1.05);
    }
  }
  
  .delete-btn {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 20px;
    height: 20px;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    transition: all 0.2s;
    opacity: 0;
    
    &:hover {
      background: rgba(0, 0, 0, 0.7);
      transform: scale(1.1);
    }
  }
  
  &:hover .delete-btn {
    opacity: 1;
  }
  
  .image-size {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 4px;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    font-size: 12px;
    text-align: center;
    backdrop-filter: blur(4px);
  }
}

.input-container {
  display: flex;
  gap: 8px;
  padding: 16px;
  position: relative;
  transition: all 0.3s ease;
  
  &.drag-over {
    background: rgba(7, 193, 96, 0.05);
    border-radius: 8px;
    transform: scale(1.02);
  }
  
  .message-input {
    flex: 1;
  }
  
  .input-actions {
    display: flex;
    align-items: flex-end;
    gap: 12px;
    padding-bottom: 6px;

    .attachment-button {
      color: #8f959e;
      padding: 4px;
      height: 32px;
      width: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      border-radius: 6px;
      position: relative;
      
      &:hover {
        color: #07c160;
        background: rgba(7, 193, 96, 0.1);
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(7, 193, 96, 0.2);
      }
      
      &:active {
        transform: translateY(0) scale(0.95);
      }
      
      &:disabled {
        color: #d9d9d9;
        cursor: not-allowed;
        
        &:hover {
          background: none;
          transform: none;
          box-shadow: none;
        }
      }
    }
    
    .send-button {
      width: 32px;
      height: 32px;
      padding: 0;
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      
      &:active {
        transform: scale(0.95);
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
    border: 2px dashed #07c160;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    backdrop-filter: blur(2px);
    
    .drag-content {
      text-align: center;
      color: #07c160;
      
      p {
        margin: 8px 0;
        font-size: 16px;
        font-weight: 500;
        
        &.drag-hint {
          font-size: 12px;
          color: #666;
          font-weight: normal;
        }
      }
    }
  }
}

// 图片列表动画
.image-list-enter-active,
.image-list-leave-active {
  transition: all 0.3s ease;
}

.image-list-enter-from,
.image-list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.image-list-move {
  transition: transform 0.3s ease;
}

// 图片预览弹窗
.image-preview-modal {
  :deep(.n-card) {
    background: transparent;
    border: none;
    
    .n-card__content {
      padding: 0;
    }
  }
}

.preview-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    max-width: 100%;
    max-height: 80vh;
    cursor: zoom-out;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .nav-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 40px;
    height: 40px;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    transition: all 0.2s;
    backdrop-filter: blur(4px);
    
    &:hover {
      background: rgba(0, 0, 0, 0.7);
      transform: translateY(-50%) scale(1.1);
    }
    
    &:active {
      transform: translateY(-50%) scale(0.95);
    }
    
    &.prev {
      left: -60px;
    }
    
    &.next {
      right: -60px;
    }
  }
  
  .preview-counter {
    position: absolute;
    bottom: -40px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.5);
    color: white;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 14px;
    backdrop-filter: blur(4px);
  }
}
</style>
/* 简化的 @mention 样式 - 确保基本功能 */
.chat-input-wrapper {
  position: relative;
}

.mention-selector {
  position: absolute !important;
  bottom: 100% !important;
  left: 0 !important;
  right: 0 !important;
  background: white !important;
  border: 2px solid #1890ff !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
  z-index: 9999 !important;
  margin-bottom: 8px !important;
  max-height: 300px !important;
  overflow: hidden !important;
}

.mention-list {
  max-height: 240px !important;
  overflow-y: auto !important;
  padding: 4px !important;
}

.mention-item {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 12px !important;
  cursor: pointer !important;
  border-radius: 4px !important;
  margin: 2px 0 !important;
  transition: all 0.2s ease !important;
  border: 1px solid transparent !important;
}

.mention-item:hover {
  background-color: #f0f8ff !important;
  border-color: #1890ff !important;
}

.mention-item.mention-item-selected {
  background-color: #1890ff !important;
  color: white !important;
  border-color: #1890ff !important;
}

.mention-item.mention-item-selected .mention-name {
  color: white !important;
  font-weight: bold !important;
}

.mention-item.mention-item-selected .mention-role {
  color: rgba(255, 255, 255, 0.8) !important;
}

.mention-item.mention-item-selected .mention-key {
  background: rgba(255, 255, 255, 0.2) !important;
  color: white !important;
  border-color: rgba(255, 255, 255, 0.3) !important;
}

.mention-info {
  flex: 1 !important;
  min-width: 0 !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
}

.mention-name {
  font-size: 14px !important;
  font-weight: 500 !important;
  color: #1890ff !important;
}

.mention-role {
  font-size: 12px !important;
  color: #666 !important;
  background: #f5f5f5 !important;
  padding: 2px 6px !important;
  border-radius: 4px !important;
}

.mention-key {
  background: #f5f5f5 !important;
  border: 1px solid #ddd !important;
  border-radius: 4px !important;
  padding: 4px 8px !important;
  font-size: 12px !important;
  color: #666 !important;
  font-family: monospace !important;
  min-width: 24px !important;
  text-align: center !important;
}

.mention-empty {
  padding: 20px !important;
  text-align: center !important;
  color: #999 !important;
  font-size: 14px !important;
}

/* 原有的 chat-input 样式保持不变 */
.chat-input {
