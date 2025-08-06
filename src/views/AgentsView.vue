<template>
  <div class="agents-view" :class="{ 'terminal-mode': isTerminal }">
    <div class="view-content">
      <!-- 统计卡片区域 -->
      <AgentsStatsSection 
        :agents="filteredAgents"
        :loading="agentsStore.loading"
      />

      <!-- 过滤和操作区域 -->
      <AgentsFilterSection
        v-model:namespace="selectedNamespace"
        v-model:username-filter="usernameFilter"
        v-model:role-filter="roleFilter"
        v-model:status-filter="statusFilter"
        :namespaces="namespaces"
        :roles="roles"
        @refresh="refreshAgents"
        @create="showCreateModal = true"
      />

      <!-- Agent列表区域 -->
      <AgentsListSection
        :agents="filteredAgents"
        :loading="agentsStore.loading"
        :selected-agents="selectedAgents"
        @select="handleAgentSelect"
        @batch-action="handleBatchAction"
        @agent-action="handleAgentAction"
      />

      <!-- Agent创建模态框 -->
      <AgentCreateModal
        v-model:show="showCreateModal"
        :namespace="selectedNamespace"
        :roles="roles"
        @created="handleAgentCreated"
      />

      <!-- Agent详情模态框 -->
      <AgentDetailsModal
        v-model:show="showDetailsModal"
        :agent="selectedAgentForDetails"
      />

      <!-- 批量操作确认模态框 -->
      <BatchActionModal
        v-model:show="showBatchActionModal"
        :action="batchAction"
        :agents="selectedAgents"
        @confirm="executeBatchAction"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useMessage } from 'naive-ui'
import { useTheme } from '@/utils/theme'
import { useAgentsStore } from '@/stores/agents'
import { useNamespacesStore } from '@/stores/namespaces'
import { useAgentsView } from '@/composables/useAgentsView'
import AgentsStatsSection from './agents/AgentsStatsSection.vue'
import AgentsFilterSection from './agents/AgentsFilterSection.vue'
import AgentsListSection from './agents/AgentsListSection.vue'
import AgentCreateModal from '@/components/AgentCreateModal.vue'
import AgentDetailsModal from '@/components/AgentDetailsModal.vue'
import BatchActionModal from './agents/BatchActionModal.vue'
import type { Agent } from '@/types/api'

const { isTerminal } = useTheme()
const message = useMessage()
const agentsStore = useAgentsStore()
const namespacesStore = useNamespacesStore()

// 使用AgentsView组合式函数
const {
  // 响应式数据
  selectedNamespace,
  usernameFilter,
  roleFilter,
  statusFilter,
  selectedAgents,
  showCreateModal,
  showDetailsModal,
  showBatchActionModal,
  selectedAgentForDetails,
  batchAction,
  roles,
  namespaces,
  
  // 计算属性
  filteredAgents,
  
  // 方法
  refreshAgents,
  handleAgentSelect,
  handleBatchAction,
  handleAgentAction,
  handleAgentCreated,
  executeBatchAction
} = useAgentsView()

// 生命周期
onMounted(() => {
  refreshAgents()
})

onUnmounted(() => {
  // 清理工作
})
</script>

<style scoped lang="scss">
.agents-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  
  &.terminal-mode {
    background: var(--terminal-bg);
  }
}

.view-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--bg-tertiary);
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border-secondary);
    border-radius: 4px;
    
    &:hover {
      background: var(--border-primary);
    }
  }
}

// Terminal主题样式
[data-theme='terminal'] .view-content {
  &::-webkit-scrollbar-track {
    background: var(--terminal-bg-tertiary);
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--terminal-border);
    
    &:hover {
      background: var(--pixel-green);
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .view-content {
    padding: 16px;
    gap: 16px;
  }
}
</style>
