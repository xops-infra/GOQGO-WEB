<template>
  <div class="chat-input-container">
    <!-- @ 提及选择器 -->
    <MentionSelector
      v-if="showMentionSelector"
      :agents="filteredAgents"
      :selected-index="selectedMentionIndex"
      :style="mentionSelectorStyle"
      @select="selectMention"
      @update-index="selectedMentionIndex = $event"
    />

    <!-- 主输入区域 -->
    <div
      class="chat-input"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
      :class="{ 'drag-over': isDragOver }"
    >
      <!-- 拖拽覆盖层 -->
      <DragOverlay v-if="isDragOver" />

      <!-- 输入区域 -->
      <div class="input-area">
        <!-- 工具栏 -->
        <InputToolbar
          :is-connected="isConnected"
          @file-upload="handleFileUpload"
          @image-upload="handleImageUpload"
        />

        <!-- 消息输入框 -->
        <MessageEditor
          ref="messageEditorRef"
          v-model:value="inputMessage"
          :placeholder="placeholderText"
          :disabled="!isConnected"
          @keydown="handleKeyDown"
          @paste="handlePaste"
          @input="handleInputChange"
        />

        <!-- 发送区域 -->
        <SendArea
          :message-length="messageLength"
          :message-size-info="messageSizeInfo"
          :can-send="canSendMessage"
          @send="handleSendMessage"
        />
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
import { ref, computed, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useMessage } from 'naive-ui'
import { useAgentsStore } from '@/stores/agents'
import { useChatInput } from '@/composables/useChatInput'
import MentionSelector from './chat-input/MentionSelector.vue'
import DragOverlay from './chat-input/DragOverlay.vue'
import InputToolbar from './chat-input/InputToolbar.vue'
import MessageEditor from './chat-input/MessageEditor.vue'
import SendArea from './chat-input/SendArea.vue'
import AgentAutocomplete from './AgentAutocomplete.vue'
import type { Agent } from '@/types/api'

const props = defineProps<{
  isConnected: boolean
  namespace?: string
}>()

const emit = defineEmits<{
  send: [message: string, mentionedAgents?: string[]]
  'send-image': [url: string]
}>()

const message = useMessage()
const agentsStore = useAgentsStore()
const { agents } = storeToRefs(agentsStore)

// 使用聊天输入组合式函数
const {
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
  selectMention,
  selectAgent,
  hideAgentAutocomplete,
  handleSendMessage: sendMessage
} = useChatInput(props, emit)

// 组件引用
const messageEditorRef = ref()

// 方法
const handleSendMessage = () => {
  sendMessage()
}
</script>

<style scoped lang="scss">
.chat-input-container {
  position: relative;
}

.chat-input {
  background-color: var(--bg-primary);
  border-top: 1px solid var(--border-primary);
  color: var(--text-primary);
  position: relative;
  transition: all 0.3s ease;

  &.drag-over {
    background-color: rgba(16, 185, 129, 0.05);
    border-color: var(--color-success);
  }
}

.input-area {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  padding: 12px 16px;
  background-color: var(--bg-primary);
}

// Terminal主题样式
[data-theme='terminal'] .chat-input {
  background-color: var(--terminal-bg);
  border-top-color: var(--terminal-border);
  
  .input-area {
    background-color: var(--terminal-bg);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .input-area {
    padding: 8px 12px;
    gap: 8px;
  }
}
</style>
