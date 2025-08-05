<template>
  <div class="main-sidebar">
    <!-- Namespace 管理区域 -->
    <div class="namespace-section">
      <NamespaceManager />
    </div>

    <!-- Agent实例列表 -->
    <div class="agents-section">
      <div class="section-header">
        <h3>Q CLI 实例</h3>
        <n-button size="small" type="primary" @click="handleCreateClick">
          <template #icon>
            <n-icon><AddIcon /></n-icon>
          </template>
        </n-button>
      </div>

      <div class="agents-list">
        <!-- 加载状态 -->
        <div v-if="agentsStore.loading" class="loading-state">
          <n-spin size="small" />
          <span>加载中...</span>
        </div>

        <!-- Agent列表 -->
        <AgentListItem
          v-for="agent in agents"
          :key="agent.name"
          :agent="agent"
          :selected="agentsStore.selectedAgent?.name === agent.name"
          @select="selectAgent"
          @show-logs="showAgentLogs"
          @show-details="showAgentDetails"
          @restart="restartAgent"
          @delete="deleteAgent"
        />

        <!-- 空状态 -->
        <div v-if="!agentsStore.hasAgents && !agentsStore.loading" class="empty-state">
          <div class="empty-icon">
            <n-icon size="48" color="var(--text-tertiary)">
              <EmptyIcon />
            </n-icon>
          </div>
          <p class="empty-text">暂无实例</p>
          <n-button type="primary" @click="handleCreateClick">
            创建实例
          </n-button>
        </div>
      </div>
    </div>

    <!-- Agent创建模态框 -->
    <AgentCreateModal
      v-model:show="showCreateModal"
      @created="handleAgentCreated"
    />

    <!-- Agent详情模态框 -->
    <AgentDetailsModal
      v-model:show="showDetailsModal"
      :agent="selectedAgentForDetails"
    />

    <!-- Agent日志模态框 -->
    <AgentLogsModal
      v-model:show="showLogsModal"
      :agent="selectedAgentForLogs"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NButton, NIcon, NSpin, useMessage } from 'naive-ui'
import { useAgentsStore } from '@/stores/agents'
import { useNamespacesStore } from '@/stores/namespaces'
import NamespaceManager from '@/components/NamespaceManager.vue'
import AgentListItem from '@/components/AgentListItem.vue'
import AgentCreateModal from '@/components/AgentCreateModal.vue'
import AgentDetailsModal from '@/components/AgentDetailsModal.vue'
import AgentLogsModal from '@/components/AgentLogsModal.vue'
import AddIcon from '@/components/icons/AddIcon.vue'
import EmptyIcon from '@/components/icons/EmptyIcon.vue'
import type { Agent } from '@/types/api'

const message = useMessage()
const agentsStore = useAgentsStore()
const namespacesStore = useNamespacesStore()

// 响应式数据
const showCreateModal = ref(false)
const showDetailsModal = ref(false)
const showLogsModal = ref(false)
const selectedAgentForDetails = ref<Agent | null>(null)
const selectedAgentForLogs = ref<Agent | null>(null)

// 计算属性
const agents = computed(() => agentsStore.agents)

// 方法
const handleCreateClick = () => {
  showCreateModal.value = true
}

const selectAgent = (agent: Agent) => {
  agentsStore.selectAgent(agent)
}

const showAgentLogs = (agent: Agent) => {
  selectedAgentForLogs.value = agent
  showLogsModal.value = true
}

const showAgentDetails = (agent: Agent) => {
  selectedAgentForDetails.value = agent
  showDetailsModal.value = true
}

const restartAgent = async (agent: Agent) => {
  try {
    await agentsStore.restartAgent(namespacesStore.currentNamespace, agent.name)
    message.success(`实例 ${agent.name} 重启成功`)
  } catch (error: any) {
    message.error(`重启失败: ${error.message}`)
  }
}

const deleteAgent = async (agent: Agent) => {
  try {
    await agentsStore.deleteAgent(namespacesStore.currentNamespace, agent.name)
    message.success(`实例 ${agent.name} 删除成功`)
  } catch (error: any) {
    message.error(`删除失败: ${error.message}`)
  }
}

const handleAgentCreated = (agent: Agent) => {
  message.success(`实例 ${agent.name} 创建成功`)
  agentsStore.selectAgent(agent)
}
</script>

<style scoped lang="scss">
.main-sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-primary);
}

.namespace-section {
  flex-shrink: 0;
  border-bottom: 1px solid var(--border-primary);
}

.agents-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--border-primary);
  
  h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
  }
}

.agents-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--bg-tertiary);
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border-secondary);
    border-radius: 3px;
    
    &:hover {
      background: var(--border-primary);
    }
  }
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  color: var(--text-secondary);
  
  span {
    margin-top: 8px;
    font-size: 12px;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  text-align: center;
  
  .empty-icon {
    margin-bottom: 16px;
  }
  
  .empty-text {
    margin: 0 0 16px 0;
    color: var(--text-secondary);
    font-size: 14px;
  }
}

// Terminal主题样式
[data-theme='terminal'] .main-sidebar {
  background: var(--terminal-bg-tertiary);
  border-right-color: var(--terminal-border);
  
  .section-header {
    border-bottom-color: var(--terminal-border);
    
    h3 {
      color: var(--terminal-text);
      font-family: var(--font-mono);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }
  
  .namespace-section {
    border-bottom-color: var(--terminal-border);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .main-sidebar {
    position: fixed;
    top: 64px;
    left: 0;
    bottom: 0;
    width: 100%;
    max-width: 320px;
    z-index: 90;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    
    &.sidebar-open {
      transform: translateX(0);
    }
  }
}
</style>
