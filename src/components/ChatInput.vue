<template>
  <div class="chat-input-container">
    <!-- @ 提及选择器 -->
    <div
      v-if="showMentionSelector"
      class="mention-selector"
      :style="mentionSelectorStyle"
    >
      <div class="mention-header">
        <n-icon size="16">
          <svg viewBox="0 0 24 24">
            <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M7,9A2,2 0 0,1 9,7A2,2 0 0,1 11,9A2,2 0 0,1 9,11A2,2 0 0,1 7,9M15,9A2,2 0 0,1 17,7A2,2 0 0,1 19,9A2,2 0 0,1 17,11A2,2 0 0,1 15,9M12,17.5C14.33,17.5 16.31,16.04 17.11,14H6.89C7.69,16.04 9.67,17.5 12,17.5Z"/>
          </svg>
        </n-icon>
        <span>选择要提及的实例</span>
      </div>
      <div class="mention-list">
        <div
          v-for="(agent, index) in filteredAgents"
          :key="agent.name"
          :class="[
            'mention-item',
            { 'mention-item-selected': index === selectedMentionIndex }
          ]"
          @click="selectMention(agent)"
          @mouseenter="selectedMentionIndex = index"
        >
          <div class="mention-avatar">
            <n-icon size="20">
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
              </svg>
            </n-icon>
          </div>
          <div class="mention-info">
            <div class="mention-name">{{ agent.name }}</div>
            <div class="mention-role">{{ agent.role }}</div>
          </div>
          <div class="mention-status">
            <div :class="['status-dot', `status-${agent.status}`]"></div>
            <span class="status-text">{{ getStatusText(agent.status) }}</span>
          </div>
        </div>
      </div>
      <div v-if="filteredAgents.length === 0" class="mention-empty">
        <n-icon size="24" color="var(--text-tertiary)">
          <svg viewBox="0 0 24 24">
            <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M11,9H13V7H11M11,17H13V11H11V17Z"/>
          </svg>
        </n-icon>
        <p>没有找到匹配的实例</p>
      </div>
    </div>

    <div
      class="chat-input"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
      :class="{ 'drag-over': isDragOver }"
    >
      <!-- 拖拽提示 -->
      <div v-if="isDragOver" class="drag-overlay">
        <n-icon size="48" :color="'var(--color-success)'">
          <svg viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
            />
          </svg>
        </n-icon>
        <p>释放文件以上传</p>
      </div>

      <!-- 附件预览区域 -->
      <div v-if="attachments.length > 0" class="attachments-preview">
        <div class="attachments-header">
          <span class="attachments-title">附件预览</span>
          <n-button
            text
            size="small"
            @click="clearAllAttachments"
            class="clear-all-btn"
          >
            <template #icon>
              <n-icon>
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
                  />
                </svg>
              </n-icon>
            </template>
            清空
          </n-button>
        </div>
        <div class="attachments-grid">
          <div
            v-for="(attachment, index) in attachments"
            :key="attachment.id"
            class="attachment-item"
          >
            <!-- 图片预览 -->
            <div v-if="attachment.type.startsWith('image/')" class="image-preview">
              <img
                :src="attachment.previewUrl"
                :alt="attachment.name"
                @click="previewImage(attachment)"
                class="preview-image"
              />
              <div class="image-overlay">
                <n-button
                  text
                  size="small"
                  @click="removeAttachment(index)"
                  class="remove-btn"
                >
                  <template #icon>
                    <n-icon>
                      <svg viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
                        />
                      </svg>
                    </n-icon>
                  </template>
                </n-button>
              </div>
            </div>
            
            <!-- 其他文件类型 -->
            <div v-else class="file-preview">
              <div class="file-icon">
                <n-icon size="32">
                  <svg viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
                    />
                  </svg>
                </n-icon>
              </div>
              <div class="file-info">
                <div class="file-name">{{ attachment.name }}</div>
                <div class="file-size">{{ formatFileSize(attachment.size) }}</div>
              </div>
              <n-button
                text
                size="small"
                @click="removeAttachment(index)"
                class="remove-btn"
              >
                <template #icon>
                  <n-icon>
                    <svg viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
                      />
                    </svg>
                  </n-icon>
                </template>
              </n-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="input-area">
        <!-- 工具栏 -->
        <div class="toolbar">
          <!-- 文件上传按钮 -->
          <n-button
            text
            @click="handleFileUpload"
            class="attachment-button"
            :disabled="!isConnected"
          >
            <template #icon>
              <n-icon>
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M16.5,6V17.5A4,4 0 0,1 12.5,21.5A4,4 0 0,1 8.5,17.5V5A2.5,2.5 0 0,1 11,2.5A2.5,2.5 0 0,1 13.5,5V15.5A1,1 0 0,1 12.5,16.5A1,1 0 0,1 11.5,15.5V6H10V15.5A2.5,2.5 0 0,0 12.5,18A2.5,2.5 0 0,0 15,15.5V5A4,4 0 0,0 11,1A4,4 0 0,0 7,5V17.5A5.5,5.5 0 0,0 12.5,23A5.5,2.5 0 0,0 18,17.5V6H16.5Z"
                  />
                </svg>
              </n-icon>
            </template>
          </n-button>
        </div>

        <!-- 输入框 -->
        <n-input
          ref="inputRef"
          v-model:value="inputMessage"
          type="textarea"
          :placeholder="placeholderText"
          :autosize="{ minRows: 1, maxRows: 6 }"
          :disabled="!isConnected"
          @keydown="handleKeyDown"
          @paste="handlePaste"
          @input="handleInputChange"
          class="message-input"
        />

        <!-- 发送按钮 -->
        <div class="send-area">
          <!-- 消息长度指示器 -->
          <div 
            v-if="messageLength > 0" 
            class="message-length-indicator"
            :class="{
              'warning': messageSizeInfo.warningLevel === 'warning',
              'error': messageSizeInfo.warningLevel === 'danger'
            }"
          >
            <span class="length-text">
              {{ messageSizeInfo.charCount }}/{{ MESSAGE_LIMITS.MAX_CHARS }}
            </span>
            <span v-if="messageSizeInfo.byteSize > 1024" class="size-text">
              ({{ Math.round(messageSizeInfo.byteSize / 1024) }}KB)
            </span>
            <span v-if="messageSizeInfo.byteSize > 2048" class="auto-upload-hint">
              ⚠️ 超过2K，将自动转为文件
            </span>
            <span v-if="!messageSizeInfo.isValid && messageSizeInfo.byteSize <= 2048" class="error-text">
              过大
            </span>
          </div>
          
          <n-button
            type="primary"
            @click="handleSendMessage"
            :disabled="!canSendMessage"
            class="send-button"
          >
            <template #icon>
              <n-icon>
                <svg viewBox="0 0 24 24">
                  <path fill="currentColor" d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
                </svg>
              </n-icon>
            </template>
            发送
          </n-button>
        </div>
      </div>
    </div>

    <!-- Agent自动补全 -->
    <AgentAutocomplete
      :agents="agents"
      :query="currentMentionQuery"
      :position="agentAutocompletePosition"
      :visible="showAgentAutocomplete"
      @select="selectAgent"
      @close="hideAgentAutocomplete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useMessage } from 'naive-ui'
import { formatFileSize } from '@/utils/file'
import { filesApi } from '@/api/files'
import { useUserStore } from '@/stores/user'
import { useAgentsStore } from '@/stores/agents'
import type { Agent } from '@/types/api'
import { checkMessageSize, getMessageSizeWarningLevel, MESSAGE_LIMITS } from '@/utils/messageUtils'
import { AgentMentionParser } from '@/utils/agentMentionParser'
import AgentAutocomplete from './AgentAutocomplete.vue'

const props = defineProps<{
  isConnected: boolean
  namespace?: string
}>()

const emit = defineEmits<{
  send: [message: string, mentionedAgents?: string[]]
  'send-image': [url: string]
}>()

// 状态管理
const message = useMessage()
const userStore = useUserStore()
const agentsStore = useAgentsStore()
const { agents } = storeToRefs(agentsStore)

// 响应式数据
const inputMessage = ref('')
const inputRef = ref()
const isDragOver = ref(false)

// 附件管理
interface Attachment {
  id: string
  name: string
  type: string
  size: number
  file: File
  previewUrl?: string
}

const attachments = ref<Attachment[]>([])

// @ 功能相关状态
const showMentionSelector = ref(false)
const mentionQuery = ref('')
const selectedMentionIndex = ref(0)
const mentionStartPos = ref(0)
const mentionSelectorStyle = ref({})

// 计算属性
const canSendMessage = computed(() => {
  return inputMessage.value.trim() && props.isConnected
})

const placeholderText = computed(() => {
  if (!props.isConnected) {
    return '连接断开，无法发送消息...'
  }
  return '输入消息... (支持拖拽文件上传，输入@提及实例)'
})

// 消息长度统计
const messageLength = computed(() => {
  return inputMessage.value.length
})

const messageSizeInfo = computed(() => {
  const text = inputMessage.value
  const sizeCheck = checkMessageSize(text)
  const warningLevel = getMessageSizeWarningLevel(text)
  
  return {
    ...sizeCheck,
    warningLevel,
    charPercentage: (sizeCheck.charCount / MESSAGE_LIMITS.MAX_CHARS) * 100,
    bytePercentage: (sizeCheck.byteSize / MESSAGE_LIMITS.MAX_BYTES) * 100
  }
})

// 过滤的Agent列表
const filteredAgents = computed(() => {
  if (!mentionQuery.value) {
    return agents.value
  }
  
  const query = mentionQuery.value.toLowerCase()
  return agents.value.filter(agent => 
    agent.name.toLowerCase().includes(query) ||
    agent.role.toLowerCase().includes(query)
  )
})

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    running: '运行中',
    idle: '空闲',
    error: '错误',
    Creating: '创建中',
    Terminating: '终止中'
  }
  return statusMap[status] || status
}

// 检查@触发
const checkMentionTrigger = (value: string) => {
  console.log('🔍 checkMentionTrigger 被调用')
  console.log('📝 检查的值:', value)
  console.log('🤖 当前agents数量:', agents.value.length)
  
  const input = getInputElement()
  if (!input) {
    console.warn('⚠️ 未找到input元素')
    return
  }

  const cursorPos = input.selectionStart || 0
  const textBeforeCursor = value.substring(0, cursorPos)
  console.log('📍 光标前文本:', textBeforeCursor)
  
  // 查找最后一个@符号的位置
  const lastAtIndex = textBeforeCursor.lastIndexOf('@')
  console.log('📍 最后@符号位置:', lastAtIndex)
  
  if (lastAtIndex === -1) {
    console.log('❌ 未找到@符号，隐藏选择器')
    hideMentionSelector()
    return
  }
  
  // 检查@符号前是否为空格或行首
  const charBeforeAt = lastAtIndex > 0 ? textBeforeCursor[lastAtIndex - 1] : ' '
  console.log('📍 @符号前字符:', charBeforeAt)
  if (charBeforeAt !== ' ' && charBeforeAt !== '\n' && lastAtIndex !== 0) {
    console.log('❌ @符号前字符不符合条件，隐藏选择器')
    hideMentionSelector()
    return
  }
  
  // 获取@后的查询文本
  const queryText = textBeforeCursor.substring(lastAtIndex + 1)
  console.log('🔍 查询文本:', queryText)
  
  // 检查查询文本是否包含空格（如果包含空格，说明已经完成了一个@提及）
  if (queryText.includes(' ') || queryText.includes('\n')) {
    console.log('❌ 查询文本包含空格/换行，隐藏选择器')
    hideMentionSelector()
    return
  }
  
  // 如果只有一个实例，不显示选择器
  if (agents.value.length <= 1) {
    console.log('❌ agents数量不足，隐藏选择器')
    hideMentionSelector()
    return
  }
  
  console.log('✅ 显示提及选择器')
  // 显示提及选择器
  mentionStartPos.value = lastAtIndex
  mentionQuery.value = queryText
  selectedMentionIndex.value = 0
  showMentionSelector.value = true
  
  console.log('📊 选择器状态:', {
    mentionStartPos: mentionStartPos.value,
    mentionQuery: mentionQuery.value,
    showMentionSelector: showMentionSelector.value,
    filteredAgentsCount: filteredAgents.value.length
  })
  
  // 计算选择器位置
  nextTick(() => {
    updateMentionSelectorPosition()
  })
}

// 获取输入框元素
const getInputElement = () => {
  if (!inputRef.value) return null
  
  return (
    inputRef.value.inputElRef ||
    inputRef.value.textareaElRef ||
    inputRef.value.$el?.querySelector('textarea') ||
    inputRef.value.$el?.querySelector('input')
  )
}

// 更新选择器位置
const updateMentionSelectorPosition = () => {
  const input = getInputElement()
  if (!input) return
  
  // 简单的位置计算，将选择器放在输入框上方
  const inputRect = input.getBoundingClientRect()
  mentionSelectorStyle.value = {
    position: 'fixed',
    bottom: `${window.innerHeight - inputRect.top + 8}px`,
    left: `${inputRect.left}px`,
    width: `${Math.min(320, inputRect.width)}px`,
    zIndex: 1000
  }
}

// 选择提及
const selectMention = (agent: Agent) => {
  const currentValue = inputMessage.value
  const beforeMention = currentValue.substring(0, mentionStartPos.value)
  const afterMention = currentValue.substring(mentionStartPos.value + 1 + mentionQuery.value.length)
  
  // 插入@提及
  const newValue = `${beforeMention}@${agent.name} ${afterMention}`
  inputMessage.value = newValue
  
  // 设置光标位置
  nextTick(() => {
    const input = getInputElement()
    if (input) {
      const newCursorPos = mentionStartPos.value + agent.name.length + 2 // @name + space
      input.setSelectionRange(newCursorPos, newCursorPos)
      input.focus()
    }
  })
  
  hideMentionSelector()
}

// 隐藏提及选择器
const hideMentionSelector = () => {
  showMentionSelector.value = false
  mentionQuery.value = ''
  selectedMentionIndex.value = 0
}

// 处理键盘事件
const handleKeyDown = (e: KeyboardEvent) => {
  // 如果提及选择器显示，处理导航键
  if (showMentionSelector.value) {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault()
        selectedMentionIndex.value = Math.max(0, selectedMentionIndex.value - 1)
        break
      case 'ArrowDown':
        e.preventDefault()
        selectedMentionIndex.value = Math.min(
          filteredAgents.value.length - 1,
          selectedMentionIndex.value + 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (filteredAgents.value[selectedMentionIndex.value]) {
          selectMention(filteredAgents.value[selectedMentionIndex.value])
        }
        break
      case 'Escape':
        e.preventDefault()
        hideMentionSelector()
        break
      case 'Tab':
        e.preventDefault()
        if (filteredAgents.value[selectedMentionIndex.value]) {
          selectMention(filteredAgents.value[selectedMentionIndex.value])
        }
        break
      default:
        // 其他键继续正常处理
        break
    }
    return
  }
  
  // 正常的发送消息处理
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSendMessage()
  }
}

// 发送消息
const handleSendMessage = async () => {
  if (!canSendMessage.value) return

  const text = inputMessage.value.trim()
  if (!text) return

  try {
    // 检查消息大小，如果超过2K则自动转换为文件上传
    const messageSize = new Blob([text]).size
    if (messageSize > 2048) {
      console.log('📁 消息超过2K，自动转换为文件上传:', messageSize, 'bytes')
      
      // 创建文本文件
      const textFile = new File([text], `message_${Date.now()}.txt`, {
        type: 'text/plain',
        lastModified: Date.now()
      })
      
      // 添加到附件列表
      addAttachment(textFile)
      
      // 显示上传进度提示
      const loadingMessage = message.loading(`正在上传长消息文件...`, { duration: 0 })
      
      try {
        // 上传文件
        const result = await filesApi.uploadFile(userStore.currentUser?.username || 'unknown', textFile)
        console.log('✅ 长消息文件上传成功:', result)
        
        // 关闭加载提示
        loadingMessage.destroy()
        
        // 生成文件链接，格式类似 [图片] xxxx
        const fileLink = `[长消息文件]${result.url}`
        
        // 发送文件链接而不是原始文本
        const hasMentions = AgentMentionParser.hasAgentMentions(fileLink)
        let finalText = fileLink
        let mentionedAgentNames: string[] = []
        
        if (hasMentions) {
          const agentMentions = AgentMentionParser.extractUniqueAgents(fileLink)
          mentionedAgentNames = agentMentions.map(mention => `${mention.agentName}.${mention.namespace}`)
        } else {
          const defaultNamespace = props.namespace || 'default'
          finalText = `@${defaultNamespace}-sys ${fileLink}`
          mentionedAgentNames = [`${defaultNamespace}-sys.${defaultNamespace}`]
        }
        
        console.log('📤 发送文件链接消息:', {
          originalText: text,
          finalText: finalText,
          mentionedAgents: mentionedAgentNames,
          fileUrl: result.url
        })
        
        emit('send', finalText, mentionedAgentNames)
        message.success('长消息已自动转换为文件上传')
        
      } catch (uploadError) {
        loadingMessage.destroy()
        console.error('❌ 长消息文件上传失败:', uploadError)
        message.error('长消息文件上传失败，请重试')
        
        // 上传失败时从附件列表中移除
        const index = attachments.value.findIndex(att => att.file === textFile)
        if (index > -1) {
          removeAttachment(index)
        }
        return
      }
    } else {
      // 正常发送短消息
      const hasMentions = AgentMentionParser.hasAgentMentions(text)
      
      let finalText = text
      let mentionedAgentNames: string[] = []
      
      if (hasMentions) {
        // 如果已经有@提及，直接解析
        const agentMentions = AgentMentionParser.extractUniqueAgents(text)
        mentionedAgentNames = agentMentions.map(mention => `${mention.agentName}.${mention.namespace}`)
      } else {
        // 如果没有@提及，在消息前面自动添加@{namespace}-sys
        const defaultNamespace = props.namespace || 'default'
        finalText = `@${defaultNamespace}-sys ${text}`
        mentionedAgentNames = [`${defaultNamespace}-sys.${defaultNamespace}`]
        
        console.log(' 自动添加默认系统agent:', `@${defaultNamespace}-sys`)
      }

      console.log('📤 发送消息:', {
        originalText: text,
        finalText: finalText,
        mentionedAgents: mentionedAgentNames
      })

      // 发送修改后的消息文本，包含Agent提及信息
      emit('send', finalText, mentionedAgentNames)
    }
    
    // 清空输入框和状态
    inputMessage.value = ''
    hideMentionSelector()
    hideAgentAutocomplete()
    
  } catch (error) {
    console.error('❌ 发送过程中出错:', error)
  }
}

// Agent自动补全相关
const showAgentAutocomplete = ref(false)
const agentAutocompletePosition = ref({ x: 0, y: 0 })
const currentMentionQuery = ref('')
const currentMentionStart = ref(-1)

// 处理输入变化，统一的@agent语法检测
const handleInputChange = () => {
  console.log('🔍 handleInputChange 被调用')
  console.log('📝 当前输入内容:', inputMessage.value)
  
  const textarea = inputRef.value?.$el?.querySelector('textarea')
  if (!textarea) {
    console.warn('⚠️ 未找到textarea元素')
    return
  }

  const cursorPosition = textarea.selectionStart
  console.log('📍 光标位置:', cursorPosition)
  
  // 首先检查旧的@提及逻辑
  checkMentionTrigger(inputMessage.value)
  
  // 然后检查新的Agent提及逻辑
  const currentMention = AgentMentionParser.getCurrentMention(inputMessage.value, cursorPosition)
  console.log('🤖 Agent提及检测结果:', currentMention)

  if (currentMention && currentMention.isInMention) {
    console.log('✅ 检测到Agent提及，显示自动补全')
    // 显示自动补全
    currentMentionQuery.value = currentMention.agentName
    currentMentionStart.value = currentMention.mentionStart
    showAgentAutocomplete.value = true
    
    // 计算下拉框位置
    updateAutocompletePosition(textarea, currentMention.mentionStart)
  } else {
    console.log('❌ 未检测到Agent提及，隐藏自动补全')
    // 隐藏自动补全
    hideAgentAutocomplete()
  }
}

// 更新自动补全位置
const updateAutocompletePosition = (textarea: HTMLTextAreaElement, mentionStart: number) => {
  const rect = textarea.getBoundingClientRect()
  const textBeforeMention = inputMessage.value.substring(0, mentionStart)
  
  // 简单估算位置（实际项目中可能需要更精确的计算）
  const lines = textBeforeMention.split('\n')
  const lineHeight = 20
  const charWidth = 8
  
  const x = rect.left + (lines[lines.length - 1].length * charWidth)
  const y = rect.top + (lines.length - 1) * lineHeight + lineHeight
  
  agentAutocompletePosition.value = { x, y }
}

// 隐藏Agent自动补全
const hideAgentAutocomplete = () => {
  showAgentAutocomplete.value = false
  currentMentionQuery.value = ''
  currentMentionStart.value = -1
}

// 选择Agent
const selectAgent = (agent: Agent) => {
  const textarea = inputRef.value?.$el?.querySelector('textarea')
  if (!textarea) return

  const cursorPosition = textarea.selectionStart
  const replacement = AgentMentionParser.replaceMention(
    inputMessage.value,
    currentMentionStart.value,
    cursorPosition,
    agent.name,
    agent.namespace
  )

  inputMessage.value = replacement.content
  hideAgentAutocomplete()

  // 设置新的光标位置
  nextTick(() => {
    textarea.focus()
    textarea.setSelectionRange(replacement.cursorPosition, replacement.cursorPosition)
  })
}
watch(
  () => props.namespace,
  (newNamespace) => {
    if (newNamespace) {
      // agents store 会自动监听 namespace 变化并更新数据
      console.log('🔄 namespace 变化，agents store 将自动更新:', newNamespace)
    }
  },
  { immediate: true }
)

// 点击外部隐藏选择器
const handleClickOutside = (e: Event) => {
  if (showMentionSelector.value) {
    const target = e.target as Element
    const selector = document.querySelector('.mention-selector')
    const input = getInputElement()
    
    if (selector && !selector.contains(target) && input && !input.contains(target)) {
      hideMentionSelector()
    }
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  // agents store 会自动加载数据，不需要手动调用
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 上传文件并插入链接到输入框
const uploadAndInsertFile = async (file: File) => {
  try {
    console.log('📤 开始上传文件:', file.name, file.type, formatFileSize(file.size))

    // 先添加到附件预览
    addAttachment(file)

    // 显示上传进度提示
    const loadingMessage = message.loading(`正在上传 ${file.name}...`, { duration: 0 })

    // 上传文件
    const result = await filesApi.uploadFile(userStore.currentUser?.username || 'unknown', file)
    console.log('✅ 文件上传成功:', result)

    // 关闭加载提示
    loadingMessage.destroy()

    // 根据文件类型生成不同的链接格式
    const fileLink = generateFileLink(file, result.url)

    // 插入到输入框中
    insertTextAtCursor(fileLink)

    message.success(`文件 ${file.name} 上传成功`)
  } catch (error) {
    console.error('❌ 上传文件失败:', error)
    message.error(`上传文件 ${file.name} 失败: ${(error as Error).message}`)
    
    // 上传失败时从附件列表中移除
    const index = attachments.value.findIndex(att => att.file === file)
    if (index > -1) {
      removeAttachment(index)
    }
  }
}

// 生成文件链接格式
const generateFileLink = (file: File, url: string) => {
  const fileName = file.name
  const fileType = file.type

  // 判断文件类型并生成相应格式
  if (fileType.startsWith('image/')) {
    return `[图片]${url}`
  } else if (fileType.startsWith('video/')) {
    return `[视频]${url}`
  } else if (fileType.startsWith('audio/')) {
    return `[音频]${url}`
  } else if (fileType.includes('pdf')) {
    return `[PDF]${url}`
  } else if (fileType.includes('word') || fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
    return `[文档]${url}`
  } else if (
    fileType.includes('excel') ||
    fileName.endsWith('.xls') ||
    fileName.endsWith('.xlsx')
  ) {
    return `[表格]${url}`
  } else if (
    fileType.includes('powerpoint') ||
    fileName.endsWith('.ppt') ||
    fileName.endsWith('.pptx')
  ) {
    return `[演示]${url}`
  } else if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z')) {
    return `[压缩包]${url}`
  } else {
    return `[文件]${url}`
  }
}

// 在光标位置插入文本
const insertTextAtCursor = (text: string) => {
  console.log('🔧 尝试插入文本:', text)

  try {
    // 尝试多种方式访问input元素
    let input = null

    if (inputRef.value) {
      console.log('📝 inputRef存在，尝试获取DOM元素')
      // 尝试不同的访问路径
      input =
        inputRef.value.inputElRef ||
        inputRef.value.textareaElRef ||
        inputRef.value.$el?.querySelector('textarea') ||
        inputRef.value.$el?.querySelector('input')

      console.log('📝 获取到的input元素:', input)
    }

    if (input && typeof input.selectionStart === 'number') {
      console.log('✅ 找到有效的input元素，使用光标位置插入')
      const start = input.selectionStart
      const end = input.selectionEnd
      const currentValue = inputMessage.value

      // 在光标位置插入文本
      const newValue = currentValue.substring(0, start) + text + currentValue.substring(end)
      inputMessage.value = newValue

      // 设置新的光标位置
      nextTick(() => {
        try {
          const newCursorPos = start + text.length
          input.setSelectionRange(newCursorPos, newCursorPos)
          input.focus()
          console.log('✅ 文本已插入到光标位置，新位置:', newCursorPos)
        } catch (error) {
          console.warn('设置光标位置失败:', error)
        }
      })
      return
    }

    // 备用方案：追加到末尾
    console.log('⚠️ 无法获取光标位置，使用追加方案')
    appendTextToEnd(text)
  } catch (error) {
    console.error('插入文本失败:', error)
    // 最后的备用方案
    appendTextToEnd(text)
  }
}

// 追加文本到末尾的辅助函数
const appendTextToEnd = (text: string) => {
  console.log('📝 追加文本到末尾:', text)

  // 确保有适当的分隔符
  if (inputMessage.value) {
    const lastChar = inputMessage.value.slice(-1)
    if (lastChar !== ' ' && lastChar !== '\n') {
      inputMessage.value += ' '
    }
  }

  inputMessage.value += text

  // 尝试聚焦输入框
  nextTick(() => {
    try {
      if (inputRef.value) {
        if (typeof inputRef.value.focus === 'function') {
          inputRef.value.focus()
        }
      }
      console.log('✅ 文本已追加到末尾')
    } catch (error) {
      console.warn('聚焦输入框失败:', error)
    }
  })
}

// 处理文件上传按钮点击
const handleFileUpload = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '*'
  input.multiple = true
  input.onchange = async (e) => {
    const selectedFiles = Array.from((e.target as HTMLInputElement).files || [])
    console.log('📁 选择文件数量:', selectedFiles.length)

    for (const file of selectedFiles) {
      await uploadAndInsertFile(file)
    }
  }
  input.click()
}

// 处理图片上传按钮点击 (暂未使用)
// const handleImageUpload = () => {
//   const input = document.createElement('input')
//   input.type = 'file'
//   input.accept = 'image/*'
//   input.multiple = true
//   input.onchange = async (e) => {
//     const selectedImages = Array.from((e.target as HTMLInputElement).files || [])
//     console.log('🖼️ 选择图片数量:', selectedImages.length)

//     for (const file of selectedImages) {
//       await uploadAndInsertFile(file)
//     }
//   }
//   input.click()
// }

// 处理粘贴事件
const handlePaste = async (e: ClipboardEvent) => {
  if (!e.clipboardData) return

  const items = Array.from(e.clipboardData.items)
  const fileItems = items.filter((item) => item.kind === 'file')

  for (const fileItem of fileItems) {
    e.preventDefault()
    const file = fileItem.getAsFile()
    if (file) {
      await uploadAndInsertFile(file)
    }
  }
}

// 附件管理方法
const addAttachment = (file: File) => {
  const attachment: Attachment = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    name: file.name,
    type: file.type,
    size: file.size,
    file: file,
    previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
  }
  attachments.value.push(attachment)
}

const removeAttachment = (index: number) => {
  const attachment = attachments.value[index]
  if (attachment.previewUrl) {
    URL.revokeObjectURL(attachment.previewUrl)
  }
  attachments.value.splice(index, 1)
}

const clearAllAttachments = () => {
  attachments.value.forEach(attachment => {
    if (attachment.previewUrl) {
      URL.revokeObjectURL(attachment.previewUrl)
    }
  })
  attachments.value = []
}

const previewImage = (attachment: Attachment) => {
  if (attachment.previewUrl) {
    // 可以在这里实现图片预览功能，比如打开模态框
    console.log('预览图片:', attachment.name)
  }
}

// 将长消息转换为文件
const convertMessageToFile = async () => {
  const text = inputMessage.value.trim()
  if (!text) return
  
  try {
    console.log('📁 用户选择将长消息转换为文件:', text.length, 'characters')
    
    // 创建文本文件
    const textFile = new File([text], `message_${Date.now()}.txt`, {
      type: 'text/plain',
      lastModified: Date.now()
    })
    
    // 添加到附件列表
    addAttachment(textFile)
    
    // 显示上传进度提示
    const loadingMessage = message.loading(`正在上传长消息文件...`, { duration: 0 })
    
    try {
      // 上传文件
      const result = await filesApi.uploadFile(userStore.currentUser?.username || 'unknown', textFile)
      console.log('✅ 长消息文件上传成功:', result)
      
      // 关闭加载提示
      loadingMessage.destroy()
      
      // 生成文件链接，格式类似 [图片] xxxx
      const fileLink = `[长消息文件]${result.url}`
      
      // 将输入框内容替换为文件链接
      inputMessage.value = fileLink
      
      message.success('长消息已转换为文件，聊天内容变为文件链接')
      
    } catch (uploadError) {
      loadingMessage.destroy()
      console.error('❌ 长消息文件上传失败:', uploadError)
      message.error('长消息文件上传失败，请重试')
      
      // 上传失败时从附件列表中移除
      const index = attachments.value.findIndex(att => att.file === textFile)
      if (index > -1) {
        removeAttachment(index)
      }
    }
    
  } catch (error) {
    console.error('❌ 转换长消息为文件时出错:', error)
    message.error('转换失败，请重试')
  }
}

// 处理拖拽事件
const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  if (!(e.currentTarget as Element)?.contains(e.relatedTarget as Node)) {
    isDragOver.value = false
  }
}

const handleDrop = async (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = false

  const droppedFiles = Array.from(e.dataTransfer?.files || [])
  console.log('��️ 拖拽文件数量:', droppedFiles.length)

  for (const file of droppedFiles) {
    await uploadAndInsertFile(file)
  }
}

// 版本信息
const versionInfo = computed(() => ({
  version: versionData.version || 'v0.2.0',
  buildTime: versionData.buildTime || new Date().toISOString(),
  commit: versionData.commit || 'unknown'
}))

// 格式化构建时间
const formatBuildTime = (buildTime: string) => {
  try {
    const date = new Date(buildTime)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return buildTime
  }
}
</script>

<style scoped lang="scss">
.chat-input-container {
  position: relative;
}

// @ 提及选择器样式
.mention-selector {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(8px);
  max-height: 280px;
  overflow: hidden;
  animation: mentionFadeIn 0.2s ease-out;

  .mention-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background-color: var(--bg-secondary);
    border-bottom: 1px solid var(--border-primary);
    color: var(--text-secondary);
    font-size: 13px;
    font-weight: 500;
  }

  .mention-list {
    max-height: 200px;
    overflow-y: auto;
    padding: 4px 0;

    .mention-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 16px;
      cursor: pointer;
      transition: all 0.2s ease;
      border-left: 3px solid transparent;

      &:hover,
      &.mention-item-selected {
        background-color: var(--bg-hover);
        border-left-color: var(--color-primary);
      }

      .mention-avatar {
        width: 32px;
        height: 32px;
        border-radius: 6px;
        background-color: var(--bg-tertiary);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-secondary);
        flex-shrink: 0;
      }

      .mention-info {
        flex: 1;
        min-width: 0;

        .mention-name {
          font-weight: 500;
          color: var(--text-primary);
          font-size: 14px;
          margin-bottom: 2px;
        }

        .mention-role {
          font-size: 12px;
          color: var(--text-tertiary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      .mention-status {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          
          &.status-running {
            background-color: var(--color-success);
            box-shadow: 0 0 4px rgba(var(--color-success-rgb), 0.4);
          }
          
          &.status-idle {
            background-color: var(--color-warning);
          }
          
          &.status-error {
            background-color: var(--color-error);
          }
          
          &.status-Creating,
          &.status-Terminating {
            background-color: var(--color-info);
            animation: pulse 1.5s infinite;
          }
        }

        .status-text {
          font-size: 11px;
          color: var(--text-tertiary);
          font-weight: 500;
        }
      }
    }
  }

  .mention-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px 16px;
    color: var(--text-tertiary);

    p {
      margin: 8px 0 0 0;
      font-size: 14px;
    }
  }
}

@keyframes mentionFadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.chat-input {
  position: relative;
  background: var(--bg-primary, #fff);
  border-top: 1px solid var(--border-primary, #e0e0e0);
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 10;
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
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border: 2px dashed var(--color-success);
  border-radius: 8px;
  margin: 8px;

  p {
    margin: 12px 0 0 0;
    color: var(--color-success);
    font-weight: 500;
    font-size: 16px;
  }
}

.input-area {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  padding: 8px 16px; // 减少上下padding，让输入框更紧凑
  background-color: var(--bg-primary);
}

// 附件预览样式
.attachments-preview {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  margin: 8px 0;
  padding: 12px;
  
  .attachments-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    
    .attachments-title {
      color: var(--text-primary);
      font-size: 14px;
      font-weight: 600;
    }
    
    .clear-all-btn {
      color: var(--text-secondary);
      font-size: 12px;
      padding: 4px 8px;
      
      &:hover {
        color: var(--text-primary);
        background: var(--bg-hover);
      }
    }
  }
  
  .attachments-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 8px;
    
    .attachment-item {
      .image-preview {
        position: relative;
        border-radius: 6px;
        overflow: hidden;
        border: 1px solid var(--border-primary);
        
        .preview-image {
          width: 100%;
          height: 80px;
          object-fit: cover;
          cursor: pointer;
          transition: transform 0.2s ease;
          
          &:hover {
            transform: scale(1.05);
          }
        }
        
        .image-overlay {
          position: absolute;
          top: 4px;
          right: 4px;
          
          .remove-btn {
            color: var(--text-primary);
            background: rgba(0, 0, 0, 0.7);
            border-radius: 50%;
            width: 20px;
            height: 20px;
            padding: 0;
            
            &:hover {
              background: rgba(220, 53, 69, 0.8);
            }
          }
        }
      }
      
      .file-preview {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 12px 8px;
        background: var(--bg-secondary);
        border: 1px solid var(--border-primary);
        border-radius: 6px;
        position: relative;
        
        .file-icon {
          color: var(--text-secondary);
          margin-bottom: 8px;
        }
        
        .file-info {
          text-align: center;
          
          .file-name {
            color: var(--text-primary);
            font-size: 11px;
            margin-bottom: 4px;
            word-break: break-all;
            line-height: 1.2;
          }
          
          .file-size {
            color: var(--text-tertiary);
            font-size: 10px;
          }
        }
        
        .remove-btn {
          position: absolute;
          top: 4px;
          right: 4px;
          color: var(--text-primary);
          background: rgba(0, 0, 0, 0.7);
          border-radius: 50%;
          width: 20px;
          height: 20px;
          padding: 0;
          
          &:hover {
            background: rgba(220, 53, 69, 0.8);
          }
        }
      }
    }
  }
}

.toolbar {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .attachment-button,
  .image-button {
    width: 36px;
    height: 36px;
    border-radius: 6px;
    transition: all 0.2s ease;
    color: var(--text-secondary);

    &:hover {
      background-color: var(--bg-hover);
      color: var(--text-primary);
    }

    &:disabled {
      opacity: 0.5;
      color: var(--text-disabled);
    }
  }
}

.message-input {
  flex: 1;

  // 重写Naive UI输入框样式以适配主题
  :deep(.n-input) {
    background-color: var(--bg-secondary) !important;
    border: 1px solid var(--border-primary) !important;
    border-radius: 8px !important;
    transition: all 0.3s ease !important;

    // 输入框内部元素
    .n-input__input-el,
    .n-input__textarea-el {
      background-color: transparent !important;
      color: var(--text-primary) !important;
      border: none !important;
      font-size: 14px !important;
      line-height: 1.5 !important;
      padding: 8px 12px !important;

      &::placeholder {
        color: var(--text-tertiary) !important;
        opacity: 1 !important;
      }

      &:focus {
        outline: none !important;
      }
    }

    // 边框状态
    .n-input__border,
    .n-input__state-border {
      border: none !important;
    }

    // 悬停状态
    &:hover {
      border-color: var(--border-focus) !important;
      background-color: var(--bg-hover) !important;
    }

    // 聚焦状态
    &.n-input--focus {
      border-color: var(--color-primary) !important;
      background-color: var(--bg-secondary) !important;
      box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.1) !important;
    }

    // 禁用状态
    &.n-input--disabled {
      background-color: var(--bg-tertiary) !important;
      border-color: var(--border-secondary) !important;
      opacity: 0.6 !important;

      .n-input__input-el,
      .n-input__textarea-el {
        color: var(--text-disabled) !important;
      }
    }
  }

  // textarea特殊处理
  :deep(.n-input__textarea-el) {
    resize: none !important;
    min-height: 32px !important; // 减少最小高度
    max-height: 144px !important;
  }
}

.send-area {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;

  .message-length-indicator {
    font-size: 11px;
    color: var(--text-tertiary);
    padding: 2px 6px;
    border-radius: 4px;
    background-color: var(--bg-tertiary);
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 4px;

    &.warning {
      color: var(--color-warning);
      background-color: rgba(var(--color-warning-rgb), 0.1);
    }

    &.error {
      color: var(--color-error);
      background-color: rgba(var(--color-error-rgb), 0.1);
    }

    .length-text {
      font-weight: 500;
    }

    .size-text {
      opacity: 0.8;
      font-size: 10px;
    }

    .error-text {
      color: var(--color-error);
      font-weight: 600;
      font-size: 10px;
      text-transform: uppercase;
    }
    
    .auto-upload-hint {
      color: var(--color-warning);
      font-weight: 600;
      font-size: 10px;
      text-transform: uppercase;
      animation: pulse 2s infinite;
    }
    
    .convert-to-file-section {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
      padding: 8px;
      background: rgba(250, 173, 20, 0.1);
      border: 1px solid rgba(250, 173, 20, 0.3);
      border-radius: 6px;
      
      .convert-to-file-btn {
        flex-shrink: 0;
        font-size: 11px;
        padding: 4px 8px;
        height: 24px;
        
        &:hover {
          background: rgba(250, 173, 20, 0.2);
          border-color: rgba(250, 173, 20, 0.5);
        }
      }
      
      .convert-hint {
        color: var(--text-secondary);
        font-size: 10px;
        line-height: 1.3;
      }
    }
  }
}

.send-button {
  height: 36px;
  padding: 0 16px;
  border-radius: 6px;
  font-weight: 500;
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: var(--color-primary-hover);
    border-color: var(--color-primary-hover);
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    background-color: var(--bg-tertiary);
    border-color: var(--border-primary);
    color: var(--text-disabled);
    cursor: not-allowed;
  }
}

// Terminal主题特殊样式
[data-theme='terminal'] {
  .chat-input {
    background-color: var(--terminal-bg);
    border-top-color: var(--terminal-border);
  }

  .input-area {
    background-color: var(--terminal-bg);
  }

  .message-input {
    :deep(.n-input) {
      background-color: var(--terminal-bg-secondary) !important;
      border-color: var(--terminal-border) !important;
      
      .n-input__input-el,
      .n-input__textarea-el {
        color: var(--terminal-text) !important;
        font-family: var(--font-mono) !important;
        
        &::placeholder {
          color: var(--terminal-text-tertiary) !important;
        }
      }

      &:hover {
        border-color: var(--terminal-border-active) !important;
        background-color: var(--terminal-bg-tertiary) !important;
      }

      &.n-input--focus {
        border-color: var(--pixel-green) !important;
        box-shadow: 0 0 0 2px rgba(0, 255, 65, 0.1) !important;
      }
    }
  }

  .send-button {
    background-color: var(--pixel-green);
    border-color: var(--pixel-green);
    color: var(--terminal-bg);
    font-family: var(--font-display);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;

    &:hover:not(:disabled) {
      background-color: var(--pixel-cyan);
      border-color: var(--pixel-cyan);
      box-shadow: var(--neon-glow-cyan);
    }
  }

  .toolbar {
    .attachment-button,
    .image-button {
      color: var(--terminal-text-secondary);
      
      &:hover {
        background-color: var(--terminal-surface);
        color: var(--pixel-green);
      }
    }
  }

  // 附件预览样式
  .attachments-preview {
    background: var(--terminal-card-bg, #0a0a0a);
    border: 1px solid var(--terminal-border-subtle, rgba(0, 255, 65, 0.15));
    border-radius: 8px;
    margin: 8px 0;
    padding: 12px;
    
    .attachments-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      
      .attachments-title {
        color: var(--terminal-text-primary, #ffffff);
        font-family: 'Courier New', monospace;
        font-size: 12px;
        text-transform: uppercase;
        font-weight: 600;
      }
      
      .clear-all-btn {
        color: var(--terminal-text-secondary, #cccccc);
        font-size: 10px;
        padding: 2px 6px;
        
        &:hover {
          color: var(--terminal-text-primary, #ffffff);
          background: rgba(255, 255, 255, 0.1);
        }
      }
    }
    
    .attachments-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 8px;
      
      .attachment-item {
        .image-preview {
          position: relative;
          border-radius: 6px;
          overflow: hidden;
          border: 1px solid var(--terminal-border, rgba(0, 255, 65, 0.3));
          
          .preview-image {
            width: 100%;
            height: 80px;
            object-fit: cover;
            cursor: pointer;
            transition: transform 0.2s ease;
            
            &:hover {
              transform: scale(1.05);
            }
          }
          
          .image-overlay {
            position: absolute;
            top: 4px;
            right: 4px;
            
            .remove-btn {
              color: var(--terminal-text-primary, #ffffff);
              background: rgba(0, 0, 0, 0.7);
              border-radius: 50%;
              width: 20px;
              height: 20px;
              padding: 0;
              
              &:hover {
                background: rgba(220, 53, 69, 0.8);
              }
            }
          }
        }
        
        .file-preview {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 12px 8px;
          background: var(--terminal-panel-bg, #111111);
          border: 1px solid var(--terminal-border, rgba(0, 255, 65, 0.3));
          border-radius: 6px;
          position: relative;
          
          .file-icon {
            color: var(--terminal-text-secondary, #cccccc);
            margin-bottom: 8px;
          }
          
          .file-info {
            text-align: center;
            
            .file-name {
              color: var(--terminal-text-primary, #ffffff);
              font-size: 10px;
              font-family: 'Courier New', monospace;
              margin-bottom: 4px;
              word-break: break-all;
              line-height: 1.2;
            }
            
            .file-size {
              color: var(--terminal-text-tertiary, #999999);
              font-size: 9px;
              font-family: 'Courier New', monospace;
            }
          }
          
          .remove-btn {
            position: absolute;
            top: 4px;
            right: 4px;
            color: var(--terminal-text-primary, #ffffff);
            background: rgba(0, 0, 0, 0.7);
            border-radius: 50%;
            width: 20px;
            height: 20px;
            padding: 0;
            
            &:hover {
              background: rgba(220, 53, 69, 0.8);
            }
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .input-area {
    padding: 8px 12px;
    gap: 8px;
  }

  .toolbar {
    .attachment-button,
    .image-button {
      width: 32px;
      height: 32px;
    }
  }

  .send-button {
    height: 32px;
    padding: 0 12px;
    font-size: 13px;
  }

  .message-input {
    :deep(.n-input) {
      .n-input__input-el,
      .n-input__textarea-el {
        font-size: 13px !important;
        padding: 6px 10px !important;
      }
    }

    :deep(.n-input__textarea-el) {
      min-height: 32px !important;
      max-height: 120px !important;
    }
  }
}

// 暗色主题特殊处理
@media (prefers-color-scheme: dark) {
  .message-input {
    :deep(.n-input) {
      // 确保在系统暗色模式下也有正确的样式
      background-color: var(--bg-secondary) !important;
      
      .n-input__input-el,
      .n-input__textarea-el {
        color: var(--text-primary) !important;
        
        &::placeholder {
          color: var(--text-tertiary) !important;
        }
      }
    }
  }
}
</style>
