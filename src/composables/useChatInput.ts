import { ref, computed, nextTick } from 'vue'
import { useMessage } from 'naive-ui'
import { formatFileSize } from '@/utils/file'
import { filesApi } from '@/api/files'
import { useUserStore } from '@/stores/user'
import { useAgentsStore } from '@/stores/agents'
import { checkMessageSize, getMessageSizeWarningLevel, MESSAGE_LIMITS } from '@/utils/messageUtils'
import { AgentMentionParser } from '@/utils/agentMentionParser'
import type { Agent } from '@/types/api'

export function useChatInput(props: any, emit: any) {
  const message = useMessage()
  const userStore = useUserStore()
  const agentsStore = useAgentsStore()

  // 响应式数据
  const inputMessage = ref('')
  const isDragOver = ref(false)
  const showMentionSelector = ref(false)
  const mentionQuery = ref('')
  const selectedMentionIndex = ref(0)
  const mentionStartPos = ref(0)
  const mentionSelectorStyle = ref({})
  const showAgentAutocomplete = ref(false)
  const agentAutocompletePosition = ref({ x: 0, y: 0 })
  const currentMentionQuery = ref('')

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

  const filteredAgents = computed(() => {
    if (!mentionQuery.value) {
      return agentsStore.agents
    }
    
    const query = mentionQuery.value.toLowerCase()
    return agentsStore.agents.filter(agent => 
      agent.name.toLowerCase().includes(query) ||
      agent.role.toLowerCase().includes(query)
    )
  })

  // 方法
  const handleKeyDown = (e: KeyboardEvent) => {
    // 处理@提及选择器导航
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
      }
      return
    }
    
    // 正常的发送消息处理
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleInputChange = () => {
    // 检查@提及触发
    checkMentionTrigger(inputMessage.value)
    
    // 检查Agent提及逻辑
    const currentMention = AgentMentionParser.getCurrentMention(inputMessage.value, 0)
    if (currentMention && currentMention.isInMention) {
      currentMentionQuery.value = currentMention.agentName
      showAgentAutocomplete.value = true
    } else {
      hideAgentAutocomplete()
    }
  }

  const checkMentionTrigger = (value: string) => {
    // @提及检测逻辑
    const lastAtIndex = value.lastIndexOf('@')
    if (lastAtIndex === -1) {
      hideMentionSelector()
      return
    }

    const queryText = value.substring(lastAtIndex + 1)
    if (queryText.includes(' ') || queryText.includes('\n')) {
      hideMentionSelector()
      return
    }

    if (agentsStore.agents.length === 0) {
      hideMentionSelector()
      return
    }

    // 如果只有一个agent，自动选择
    if (agentsStore.agents.length === 1) {
      const agent = agentsStore.agents[0]
      const newValue = value.substring(0, lastAtIndex) + `@${agent.name} ` + value.substring(lastAtIndex + 1 + queryText.length)
      inputMessage.value = newValue
      hideMentionSelector()
      return
    }

    // 显示选择器
    mentionStartPos.value = lastAtIndex
    mentionQuery.value = queryText
    selectedMentionIndex.value = 0
    showMentionSelector.value = true
  }

  const selectMention = (agent: Agent) => {
    const currentValue = inputMessage.value
    const beforeMention = currentValue.substring(0, mentionStartPos.value)
    const afterMention = currentValue.substring(mentionStartPos.value + 1 + mentionQuery.value.length)
    
    const newValue = `${beforeMention}@${agent.name} ${afterMention}`
    inputMessage.value = newValue
    
    hideMentionSelector()
  }

  const hideMentionSelector = () => {
    showMentionSelector.value = false
    mentionQuery.value = ''
    selectedMentionIndex.value = 0
  }

  const selectAgent = (agent: Agent) => {
    // Agent自动补全选择逻辑
    hideAgentAutocomplete()
  }

  const hideAgentAutocomplete = () => {
    showAgentAutocomplete.value = false
    currentMentionQuery.value = ''
  }

  const handleSendMessage = async () => {
    if (!canSendMessage.value) return

    let text = inputMessage.value.trim()
    if (!text) return

    try {
      // 自动添加@sys agent（如果消息中没有@提及）
      text = autoAddSysAgent(text)
      
      // 解析Agent提及
      const agentMentions = AgentMentionParser.extractUniqueAgents(text)
      const mentionedAgentNames = agentMentions.map(mention => `${mention.agentName}.${mention.namespace}`)

      // 发送消息
      emit('send', text, mentionedAgentNames)
      inputMessage.value = ''
      hideMentionSelector()
      hideAgentAutocomplete()
    } catch (error) {
      console.error('❌ 发送过程中出错:', error)
    }
  }

  const autoAddSysAgent = (messageText: string) => {
    // 检查消息是否已经包含@提及
    const hasAtMention = /@\w+/.test(messageText)
    if (hasAtMention) {
      return messageText
    }
    
    // 查找sys agent
    const sysAgent = findSysAgent()
    if (!sysAgent) {
      return messageText
    }
    
    return `@${sysAgent.name} ${messageText}`
  }

  const findSysAgent = () => {
    const sysAgents = agentsStore.agents.filter(agent => 
      agent.name.toLowerCase().includes('sys')
    )
    
    if (sysAgents.length === 0) return null
    
    // 优先选择default-sys
    const defaultSys = sysAgents.find(agent => 
      agent.name.toLowerCase() === 'default-sys'
    )
    if (defaultSys) return defaultSys
    
    return sysAgents[0]
  }

  // 文件处理方法
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
    for (const file of droppedFiles) {
      await uploadAndInsertFile(file)
    }
  }

  // 处理文件上传（新版本，接收FileList）
  const handleFileUpload = async (files: FileList) => {
    const selectedFiles = Array.from(files)
    for (const file of selectedFiles) {
      await uploadAndInsertFile(file)
    }
  }

  // 处理图片上传
  const handleImageUpload = async (files: FileList) => {
    const selectedFiles = Array.from(files)
    for (const file of selectedFiles) {
      // 验证是否为图片文件
      if (file.type.startsWith('image/')) {
        await uploadAndInsertFile(file)
      } else {
        message.error(`${file.name} 不是有效的图片文件`)
      }
    }
  }

  // 兼容旧版本的文件上传（保留原有功能）
  const handleLegacyFileUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '*'
    input.multiple = true
    input.onchange = async (e) => {
      const selectedFiles = Array.from((e.target as HTMLInputElement).files || [])
      for (const file of selectedFiles) {
        await uploadAndInsertFile(file)
      }
    }
    input.click()
  }

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

  const uploadAndInsertFile = async (file: File) => {
    try {
      const loadingMessage = message.loading(`正在上传 ${file.name}...`, { duration: 0 })
      const result = await filesApi.uploadFile(userStore.currentUser.username, file)
      loadingMessage.destroy()

      const fileLink = generateFileLink(file, result.url)
      insertTextAtCursor(fileLink)

      message.success(`文件 ${file.name} 上传成功`)
    } catch (error) {
      console.error('❌ 上传文件失败:', error)
      message.error(`上传文件 ${file.name} 失败`)
    }
  }

  const generateFileLink = (file: File, url: string) => {
    const fileType = file.type
    if (fileType.startsWith('image/')) {
      return `[图片]${url}`
    } else if (fileType.startsWith('video/')) {
      return `[视频]${url}`
    } else {
      return `[文件]${url}`
    }
  }

  const insertTextAtCursor = (text: string) => {
    const currentValue = inputMessage.value
    inputMessage.value = currentValue + (currentValue ? ' ' : '') + text
  }

  return {
    // 响应式数据
    inputMessage,
    isDragOver,
    showMentionSelector,
    mentionQuery,
    selectedMentionIndex,
    mentionStartPos,
    mentionSelectorStyle,
    showAgentAutocomplete,
    agentAutocompletePosition,
    currentMentionQuery,
    
    // 计算属性
    canSendMessage,
    placeholderText,
    messageLength,
    messageSizeInfo,
    filteredAgents,
    
    // 方法
    handleKeyDown,
    handleInputChange,
    handlePaste,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileUpload,
    handleImageUpload,
    handleLegacyFileUpload,
    selectMention,
    selectAgent,
    hideAgentAutocomplete,
    handleSendMessage
  }
}

export default useChatInput
