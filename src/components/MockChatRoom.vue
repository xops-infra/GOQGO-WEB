<template>
  <div class="mock-chat-room">
    <!-- 8bit像素公仔背景动画 -->
    <ChatPixelCharacters />
    
    <!-- Mock模式指示器 -->
    <div class="mock-mode-indicator">
      <n-tag type="success" size="small">
        <template #icon>
          <n-icon>
            <MockIcon />
          </n-icon>
        </template>
        Mock模式演示
      </n-tag>
      <n-button 
        text 
        size="tiny" 
        @click="clearChat"
        title="清空聊天记录"
      >
        <template #icon>
          <n-icon>
            <ClearIcon />
          </n-icon>
        </template>
      </n-button>
    </div>

    <!-- 消息列表区域 -->
    <div class="messages-container" ref="messagesContainerRef">
      <div class="messages-list">
        <div
          v-for="message in messages"
          :key="message.id"
          class="message-item"
          :class="[
            `message-${message.type}`,
            { 'thinking-message': message.isThinking }
          ]"
        >
          <!-- 用户消息 -->
          <div v-if="message.type === 'user'" class="user-message">
            <div class="message-header">
              <span class="sender">👤 用户</span>
              <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
            </div>
            <div class="message-content" v-html="formatMessageContent(message.content)"></div>
          </div>

          <!-- 智能体消息 -->
          <div v-else-if="message.type === 'agent'" class="agent-message">
            <div class="message-header">
              <span class="sender">{{ getAgentInfo(message.sender).avatar }} {{ message.sender }}</span>
              <span class="role">{{ getAgentInfo(message.sender).role }}</span>
              <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
            </div>
            <div class="message-content" v-html="formatMessageContent(message.content)"></div>
          </div>

          <!-- 思考过程消息 -->
          <div v-else-if="message.type === 'thinking'" class="thinking-message">
            <div class="message-header">
              <span class="sender">🧠 {{ message.sender }} 正在思考...</span>
              <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
            </div>
            <div class="thinking-content">
              <div class="thinking-animation">
                <div class="thinking-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
              <div class="thinking-steps" v-if="message.thinkingSteps">
                <div 
                  v-for="(step, index) in message.thinkingSteps" 
                  :key="index"
                  class="thinking-step"
                  :style="{ animationDelay: `${index * 0.5}s` }"
                >
                  {{ step }}
                </div>
              </div>
            </div>
          </div>

          <!-- 系统消息 -->
          <div v-else-if="message.type === 'system'" class="system-message">
            <div class="message-content">
              <n-icon class="system-icon">
                <SystemIcon />
              </n-icon>
              {{ message.content }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="mock-input-area">
      <div class="input-container">
        <n-input
          v-model:value="inputMessage"
          type="textarea"
          placeholder="输入消息... (支持@智能体，如: @ai-architect 或 @code-reviewer)"
          :autosize="{ minRows: 1, maxRows: 4 }"
          @keydown="handleKeyDown"
          :disabled="!isConnected"
        />
        <n-button
          type="primary"
          @click="sendMessage"
          :disabled="!canSend"
          :loading="isSending"
        >
          发送
        </n-button>
      </div>
      
      <!-- 快捷@按钮 -->
      <div class="quick-mention-buttons">
        <n-button
          v-for="agent in onlineAgents"
          :key="agent.name"
          size="small"
          text
          @click="mentionAgent(agent.name)"
          class="mention-button"
        >
          {{ agent.avatar }} @{{ agent.name }}
        </n-button>
      </div>
    </div>

    <!-- 连接状态 -->
    <div v-if="!isConnected" class="connection-status">
      <n-alert type="warning" size="small">
        Mock服务未连接，请检查连接状态
      </n-alert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted, watch, h } from 'vue'
import { NTag, NButton, NIcon, NInput, NAlert, useMessage } from 'naive-ui'
import { useMockChatStore } from '@/stores/mockChat'
import ChatPixelCharacters from './ChatPixelCharacters.vue'
import { mockAgents } from '@/services/mockData'

// 图标组件
const MockIcon = () => h('svg', { viewBox: '0 0 24 24' }, [
  h('path', { 
    fill: 'currentColor', 
    d: 'M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z' 
  })
])

const ClearIcon = () => h('svg', { viewBox: '0 0 24 24' }, [
  h('path', { 
    fill: 'currentColor', 
    d: 'M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z' 
  })
])

const SystemIcon = () => h('svg', { viewBox: '0 0 24 24' }, [
  h('path', { 
    fill: 'currentColor', 
    d: 'M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,16.5L18,9.5L16.59,8.09L11,13.67L7.91,10.59L6.5,12L11,16.5Z' 
  })
])

// Store和状态
const mockChatStore = useMockChatStore()
const message = useMessage()

const inputMessage = ref('')
const isSending = ref(false)
const messagesContainerRef = ref<HTMLElement>()

// 计算属性
const messages = computed(() => mockChatStore.messages)
const isConnected = computed(() => mockChatStore.isConnected)
const onlineAgents = computed(() => mockChatStore.getOnlineAgents())

const canSend = computed(() => {
  return isConnected.value && inputMessage.value.trim().length > 0 && !isSending.value
})

// 方法
const sendMessage = async () => {
  if (!canSend.value) return

  const content = inputMessage.value.trim()
  const mentionedAgents = extractMentions(content)

  isSending.value = true
  
  try {
    mockChatStore.sendMockMessage(content, mentionedAgents)
    inputMessage.value = ''
    
    // 滚动到底部
    await nextTick()
    scrollToBottom()
    
  } catch (error) {
    console.error('Failed to send message:', error)
    message.error('发送消息失败')
  } finally {
    isSending.value = false
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

const mentionAgent = (agentName: string) => {
  const mention = `@${agentName} `
  if (!inputMessage.value.includes(mention)) {
    inputMessage.value += mention
  }
}

const clearChat = () => {
  mockChatStore.manualClearChat()
  message.success('聊天记录已清空')
}

const extractMentions = (content: string): string[] => {
  const mentions = content.match(/@[\w-]+/g)
  return mentions ? mentions.map(m => m.substring(1)) : []
}

const formatTime = (timestamp: string): string => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const formatMessageContent = (content: string): string => {
  // 处理@提及
  return content.replace(/@([\w-]+)/g, '<span class="mention">@$1</span>')
}

const getAgentInfo = (agentName: string) => {
  const agent = mockAgents.find(a => a.name === agentName)
  return agent || { avatar: '🤖', role: 'assistant' }
}

const scrollToBottom = () => {
  if (messagesContainerRef.value) {
    messagesContainerRef.value.scrollTop = messagesContainerRef.value.scrollHeight
  }
}

// 监听消息变化，自动滚动
watch(messages, () => {
  nextTick(() => {
    scrollToBottom()
  })
}, { deep: true })

// 组件挂载时连接Mock服务
onMounted(() => {
  if (!isConnected.value) {
    mockChatStore.connectToMockChat()
  }
})
</script>

<style scoped lang="scss">
.mock-chat-room {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  position: relative;
  overflow: hidden;
}

.mock-mode-indicator {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 8px;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 60px 16px 16px;
  
  .messages-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
}

.message-item {
  .message-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
    font-size: 12px;
    opacity: 0.7;
    
    .sender {
      font-weight: bold;
    }
    
    .role {
      background: var(--color-primary-light);
      color: var(--color-primary);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
    }
    
    .timestamp {
      margin-left: auto;
      font-family: monospace;
    }
  }
  
  .message-content {
    background: var(--bg-secondary);
    padding: 12px;
    border-radius: 8px;
    line-height: 1.5;
    
    :deep(.mention) {
      color: var(--color-primary);
      font-weight: bold;
      background: var(--color-primary-light);
      padding: 2px 4px;
      border-radius: 4px;
    }
  }
}

.user-message {
  align-self: flex-end;
  max-width: 70%;
  
  .message-content {
    background: var(--color-primary);
    color: white;
  }
}

.agent-message {
  align-self: flex-start;
  max-width: 70%;
}

.thinking-message {
  align-self: flex-start;
  max-width: 80%;
  
  .thinking-content {
    background: rgba(var(--color-warning-rgb), 0.1);
    border: 1px solid rgba(var(--color-warning-rgb), 0.3);
    padding: 12px;
    border-radius: 8px;
    
    .thinking-animation {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      
      .thinking-dots {
        display: flex;
        gap: 4px;
        
        span {
          width: 6px;
          height: 6px;
          background: var(--color-warning);
          border-radius: 50%;
          animation: thinking-pulse 1.5s infinite;
          
          &:nth-child(2) { animation-delay: 0.2s; }
          &:nth-child(3) { animation-delay: 0.4s; }
        }
      }
    }
    
    .thinking-steps {
      .thinking-step {
        padding: 4px 0;
        opacity: 0;
        animation: fade-in 0.5s ease-in-out forwards;
        font-size: 14px;
        color: var(--text-secondary);
      }
    }
  }
}

.system-message {
  align-self: center;
  
  .message-content {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--bg-secondary);
    padding: 8px 12px;
    border-radius: 16px;
    font-size: 14px;
    color: var(--text-secondary);
    
    .system-icon {
      color: var(--color-success);
    }
  }
}

.mock-input-area {
  padding: 16px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  
  .input-container {
    display: flex;
    gap: 8px;
    align-items: flex-end;
  }
  
  .quick-mention-buttons {
    display: flex;
    gap: 8px;
    margin-top: 8px;
    flex-wrap: wrap;
    
    .mention-button {
      font-size: 12px;
      opacity: 0.7;
      
      &:hover {
        opacity: 1;
      }
    }
  }
}

.connection-status {
  padding: 8px 16px;
}

// 动画
@keyframes thinking-pulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

// Terminal主题适配
[data-theme='terminal'] .mock-chat-room {
  .message-content {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(0, 255, 0, 0.2);
    color: #00cc88;
  }
  
  .user-message .message-content {
    background: rgba(0, 255, 0, 0.2);
    border-color: #00ff00;
    color: #00ff00;
  }
  
  .thinking-content {
    background: rgba(255, 255, 0, 0.1);
    border-color: rgba(255, 255, 0, 0.3);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .messages-container {
    padding: 50px 12px 12px;
  }
  
  .message-item {
    max-width: 90%;
  }
  
  .mock-input-area {
    padding: 12px;
  }
}
</style>
