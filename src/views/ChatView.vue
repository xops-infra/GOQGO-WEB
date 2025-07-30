<template>
  <div class="chat-view">
    <n-grid :cols="4" :x-gap="16">
      <!-- 聊天会话列表 -->
      <n-grid-item :span="1">
        <n-card title="聊天会话" :bordered="false">
          <template #header-extra>
            <n-button size="small" @click="createNewChat">
              <n-icon>
                <AddOutline />
              </n-icon>
            </n-button>
          </template>
          
          <n-space vertical>
            <div
              v-for="session in chatSessions"
              :key="session.id"
              class="chat-session-item"
              :class="{ active: currentSessionId === session.id }"
              @click="selectSession(session.id)"
            >
              <div class="session-title">{{ session.title }}</div>
              <div class="session-info">
                <span class="participant-count">{{ session.participants.length }}人</span>
                <span class="last-activity">{{ formatTime(session.lastActivity) }}</span>
              </div>
            </div>
          </n-space>
        </n-card>
      </n-grid-item>

      <!-- 聊天内容区 -->
      <n-grid-item :span="2">
        <n-card v-if="currentSession" :title="currentSession.title" :bordered="false">
          <template #header-extra>
            <n-space>
              <n-tag
                v-for="participant in currentSession.participants"
                :key="participant.id"
                size="small"
                :type="getAgentStatusType(participant.status)"
              >
                {{ participant.name }}
              </n-tag>
            </n-space>
          </template>

          <div class="chat-container">
            <div class="messages-area" ref="messagesRef">
              <div
                v-for="message in currentSession.messages"
                :key="message.id"
                class="message-item"
                :class="message.type"
              >
                <div class="message-header">
                  <span class="sender">{{ getMessageSender(message) }}</span>
                  <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
                </div>
                <div class="message-content">{{ message.content }}</div>
              </div>
            </div>

            <div class="input-area">
              <n-input
                v-model:value="messageInput"
                type="textarea"
                placeholder="输入消息..."
                :autosize="{ minRows: 2, maxRows: 4 }"
                @keydown.enter.prevent="sendMessage"
              />
              <div class="input-actions">
                <n-space justify="end">
                  <n-button type="primary" @click="sendMessage" :loading="sending">
                    发送
                  </n-button>
                </n-space>
              </div>
            </div>
          </div>
        </n-card>

        <n-empty v-else description="选择一个聊天会话开始对话" />
      </n-grid-item>

      <!-- 智能体列表 -->
      <n-grid-item :span="1">
        <n-card title="在线智能体" :bordered="false">
          <n-space vertical>
            <div
              v-for="agent in runningAgents"
              :key="agent.id"
              class="agent-item"
              @click="inviteAgent(agent)"
            >
              <div class="agent-info">
                <n-avatar size="small" :src="agent.avatar" />
                <div class="agent-details">
                  <div class="agent-name">{{ agent.name }}</div>
                  <div class="agent-role">{{ agent.role }}</div>
                </div>
              </div>
              <n-tag size="small" :type="getAgentStatusType(agent.status)">
                {{ agent.status }}
              </n-tag>
            </div>
          </n-space>
        </n-card>
      </n-grid-item>
    </n-grid>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, inject } from 'vue'
import { AddOutline } from '@vicons/ionicons5'
import { useAgentsStore } from '@/stores/agents'
import type { ChatSession, ChatMessage, Agent } from '@/types/api'

const agentsStore = useAgentsStore()
const message = inject('message', null)

// 响应式数据
const chatSessions = ref<ChatSession[]>([])
const currentSessionId = ref<string | null>(null)
const messageInput = ref('')
const sending = ref(false)
const messagesRef = ref<HTMLElement>()

// 计算属性
const currentSession = computed(() => 
  chatSessions.value.find(session => session.id === currentSessionId.value)
)

const runningAgents = computed(() => agentsStore.runningAgents)

// 方法
const createNewChat = () => {
  const newSession: ChatSession = {
    id: `session_${Date.now()}`,
    title: `新聊天 ${chatSessions.value.length + 1}`,
    participants: [],
    messages: [],
    createdAt: new Date().toISOString(),
    lastActivity: new Date().toISOString()
  }
  
  chatSessions.value.unshift(newSession)
  selectSession(newSession.id)
}

const selectSession = (sessionId: string) => {
  currentSessionId.value = sessionId
  nextTick(() => {
    scrollToBottom()
  })
}

const sendMessage = async () => {
  if (!messageInput.value.trim() || !currentSession.value) return
  
  sending.value = true
  try {
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      agentId: 'user',
      content: messageInput.value,
      timestamp: new Date().toISOString(),
      type: 'user',
      status: 'sent'
    }
    
    currentSession.value.messages.push(newMessage)
    currentSession.value.lastActivity = new Date().toISOString()
    
    messageInput.value = ''
    
    // 模拟AI回复
    setTimeout(() => {
      if (currentSession.value) {
        const aiReply: ChatMessage = {
          id: `msg_${Date.now() + 1}`,
          agentId: 'ai_assistant',
          content: '我收到了您的消息，正在处理中...',
          timestamp: new Date().toISOString(),
          type: 'agent'
        }
        currentSession.value.messages.push(aiReply)
        scrollToBottom()
      }
    }, 1000)
    
    scrollToBottom()
  } catch (error) {
    console.error('发送消息失败:', error)
  } finally {
    sending.value = false
  }
}

const inviteAgent = (agent: Agent) => {
  if (!currentSession.value) {
    console.warn('请先选择一个聊天会话')
    return
  }
  
  const isAlreadyInvited = currentSession.value.participants.some(p => p.id === agent.id)
  if (isAlreadyInvited) {
    console.warn('该智能体已在当前会话中')
    return
  }
  
  currentSession.value.participants.push(agent)
  console.log(`已邀请 ${agent.name} 加入会话`)
}

const getMessageSender = (msg: ChatMessage) => {
  if (msg.type === 'user') return '用户'
  if (msg.type === 'system') return '系统'
  
  const agent = currentSession.value?.participants.find(p => p.id === msg.agentId)
  return agent?.name || '智能体'
}

const getAgentStatusType = (status: string) => {
  const typeMap: Record<string, any> = {
    'running': 'success',
    'idle': 'warning',
    'error': 'error'
  }
  return typeMap[status] || 'default'
}

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })
}

// 生命周期
onMounted(async () => {
  await agentsStore.fetchAgents()
  
  // 创建默认聊天会话
  if (chatSessions.value.length === 0) {
    createNewChat()
  }
})
</script>

<style scoped lang="scss">
.chat-view {
  height: calc(100vh - 112px);
}

.chat-session-item {
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--n-color-hover);
  }
  
  &.active {
    background-color: var(--n-color-pressed);
  }
  
  .session-title {
    font-weight: 500;
    margin-bottom: 4px;
  }
  
  .session-info {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--n-text-color-disabled);
  }
}

.chat-container {
  height: calc(100vh - 200px);
  display: flex;
  flex-direction: column;
}

.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
  
  .message-item {
    margin-bottom: 16px;
    
    .message-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
      font-size: 12px;
      color: var(--n-text-color-disabled);
    }
    
    .message-content {
      padding: 8px 12px;
      border-radius: 8px;
      background-color: var(--n-color-hover);
    }
    
    &.user .message-content {
      background-color: var(--n-color-primary);
      color: white;
      margin-left: 20%;
    }
    
    &.agent .message-content {
      background-color: var(--n-color-info);
      color: white;
      margin-right: 20%;
    }
  }
}

.input-area {
  border-top: 1px solid var(--n-border-color);
  padding-top: 16px;
  
  .input-actions {
    margin-top: 8px;
  }
}

.agent-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--n-color-hover);
  }
  
  .agent-info {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .agent-details {
      .agent-name {
        font-size: 14px;
        font-weight: 500;
      }
      
      .agent-role {
        font-size: 12px;
        color: var(--n-text-color-disabled);
      }
    }
  }
}
</style>
