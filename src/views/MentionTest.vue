<template>
  <div class="mention-test-page">
    <n-card title="@ 功能测试" :bordered="false">
      <n-space vertical :size="20">
        <!-- 当前实例列表 -->
        <n-card title="当前实例列表" size="small">
          <div v-if="agents.length === 0" class="empty-state">
            <n-empty description="暂无实例">
              <template #extra>
                <n-button @click="refreshAgents">刷新实例列表</n-button>
              </template>
            </n-empty>
          </div>
          <div v-else class="agents-list">
            <div
              v-for="agent in agents"
              :key="agent.name"
              class="agent-item"
            >
              <n-tag :type="getStatusTagType(agent.status)" size="small">
                {{ agent.status }}
              </n-tag>
              <span class="agent-name">{{ agent.name }}</span>
              <span class="agent-role">{{ agent.role }}</span>
            </div>
          </div>
        </n-card>

        <!-- 聊天输入测试 -->
        <n-card title="聊天输入测试" size="small">
          <n-space vertical>
            <p>在下面的输入框中输入 @ 来测试实例提及功能：</p>
            <ChatInput
              :is-connected="true"
              :namespace="currentNamespace"
              @send="handleSend"
            />
          </n-space>
        </n-card>

        <!-- 发送的消息 -->
        <n-card v-if="sentMessages.length > 0" title="发送的消息" size="small">
          <div class="sent-messages">
            <div
              v-for="(msg, index) in sentMessages"
              :key="index"
              class="sent-message"
            >
              <div class="message-content">{{ msg.content }}</div>
              <div v-if="msg.mentionedAgents && msg.mentionedAgents.length > 0" class="mentioned-agents">
                <n-tag
                  v-for="agent in msg.mentionedAgents"
                  :key="agent"
                  type="info"
                  size="small"
                >
                  @{{ agent }}
                </n-tag>
              </div>
            </div>
          </div>
        </n-card>

        <!-- 调试信息 -->
        <n-card title="调试信息" size="small">
          <n-space vertical>
            <div>当前 Namespace: <n-tag>{{ currentNamespace }}</n-tag></div>
            <div>实例数量: <n-tag>{{ agents.length }}</n-tag></div>
            <div>Store 状态: <n-tag :type="loading ? 'warning' : 'success'">{{ loading ? '加载中' : '就绪' }}</n-tag></div>
          </n-space>
        </n-card>
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useAgentsStore } from '@/stores/agents'
import { useNamespacesStore } from '@/stores/namespaces'
import ChatInput from '@/components/ChatInput.vue'

// Store
const agentsStore = useAgentsStore()
const namespacesStore = useNamespacesStore()
const { agents, loading } = storeToRefs(agentsStore)
const { currentNamespace } = storeToRefs(namespacesStore)

// 发送的消息记录
const sentMessages = ref<Array<{ content: string; mentionedAgents?: string[] }>>([])

// 获取状态标签类型
const getStatusTagType = (status: string) => {
  switch (status) {
    case 'running': return 'success'
    case 'idle': return 'info'
    case 'error': return 'error'
    case 'Creating': return 'warning'
    case 'Terminating': return 'warning'
    default: return 'default'
  }
}

// 处理消息发送
const handleSend = (message: string, mentionedAgents?: string[]) => {
  console.log('📤 发送消息:', { message, mentionedAgents })
  sentMessages.value.push({
    content: message,
    mentionedAgents
  })
}

// 刷新实例列表
const refreshAgents = async () => {
  try {
    await agentsStore.fetchAgents()
  } catch (error) {
    console.error('刷新实例列表失败:', error)
  }
}
</script>

<style scoped lang="scss">
.mention-test-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.empty-state {
  text-align: center;
  padding: 20px;
}

.agents-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.agent-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: var(--bg-secondary);
  border-radius: 6px;
  
  .agent-name {
    font-weight: 500;
    color: var(--text-primary);
  }
  
  .agent-role {
    color: var(--text-secondary);
    font-size: 12px;
  }
}

.sent-messages {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sent-message {
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
  
  .message-content {
    margin-bottom: 8px;
    font-size: 14px;
    line-height: 1.5;
  }
  
  .mentioned-agents {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }
}
</style>
