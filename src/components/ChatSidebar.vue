<template>
  <div class="chat-sidebar">
    <!-- Namespace 管理 -->
    <div class="namespace-section">
      <NamespaceManager />
    </div>

    <div class="panel-header">
      <h3>Q CLI 实例</h3>
      <n-button size="small" type="primary" @click="handleCreateClick">
        <template #icon>
          <n-icon><AddIcon /></n-icon>
        </template>
      </n-button>
    </div>

    <div class="instances-list">
      <!-- 实例列表 -->
      <div
        v-for="agent in agents"
        :key="agent.name"
        class="instance-item"
        :class="[
          { active: agentsStore.selectedAgent?.name === agent.name },
          `status-${agent.status.toLowerCase()}`
        ]"
        @click="selectAgent(agent)"
      >
        <div class="instance-info">
          <div class="instance-header">
            <span class="instance-name">{{ agent.name }}</span>
            <div class="instance-actions">
              <n-tooltip>
                <template #trigger>
                  <n-button
                    text
                    size="tiny"
                    :type="isLogWindowOpen(agent) ? 'primary' : 'default'"
                    :class="{ 'log-button-active': isLogWindowOpen(agent) }"
                    @click.stop="showAgentLogs(agent)"
                  >
                    <template #icon>
                      <n-icon>
                        <svg viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,19H5V5H19V19Z"
                          />
                        </svg>
                      </n-icon>
                    </template>
                  </n-button>
                </template>
                {{ isLogWindowOpen(agent) ? '重置日志窗口' : '查看日志' }}
              </n-tooltip>
              <n-tooltip>
                <template #trigger>
                  <n-button text size="tiny" @click.stop="showAgentDetails(agent)">
                    <template #icon>
                      <n-icon><InfoIcon /></n-icon>
                    </template>
                  </n-button>
                </template>
                查看详情
              </n-tooltip>
              <n-tooltip>
                <template #trigger>
                  <n-button text size="tiny" @click.stop="restartAgent(agent)">
                    <template #icon>
                      <n-icon><RefreshIcon /></n-icon>
                    </template>
                  </n-button>
                </template>
                重启实例
              </n-tooltip>
            </div>
          </div>
          <div class="instance-meta">
            <span class="instance-role">{{ agent.role || 'assistant' }}</span>
            <span class="instance-status" :class="`status-${agent.status.toLowerCase()}`">
              {{ getStatusText(agent.status) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Agent详情模态框 -->
    <n-modal v-model:show="showDetailsModal" preset="card" style="width: 600px" title="Agent详情">
      <div v-if="selectedAgentForDetails" class="agent-details">
        <n-descriptions :column="2" bordered>
          <n-descriptions-item label="名称">
            {{ selectedAgentForDetails.name }}
          </n-descriptions-item>
          <n-descriptions-item label="状态">
            <n-tag :type="getStatusTagType(selectedAgentForDetails.status)">
              {{ getStatusText(selectedAgentForDetails.status) }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="角色">
            {{ selectedAgentForDetails.role || 'assistant' }}
          </n-descriptions-item>
          <n-descriptions-item label="命名空间">
            {{ selectedAgentForDetails.namespace || 'default' }}
          </n-descriptions-item>
          <n-descriptions-item label="创建时间">
            {{ formatDate(selectedAgentForDetails.created_at) }}
          </n-descriptions-item>
          <n-descriptions-item label="最后活动">
            {{ formatDate(selectedAgentForDetails.updated_at) }}
          </n-descriptions-item>
        </n-descriptions>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, h } from 'vue'
import { storeToRefs } from 'pinia'
import { useAgentsStore } from '@/stores/agents'
import { useNamespacesStore } from '@/stores/namespaces'
import { useMessage } from 'naive-ui'
import NamespaceManager from '@/components/NamespaceManager.vue'
import type { Agent } from '@/types/api'
import {
  NButton,
  NIcon,
  NTooltip,
  NModal,
  NDescriptions,
  NDescriptionsItem,
  NTag
} from 'naive-ui'

// 图标组件
const AddIcon = () => h('svg', { viewBox: '0 0 24 24' }, [
  h('path', { 
    fill: 'currentColor', 
    d: 'M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z' 
  })
])

const InfoIcon = () => h('svg', { viewBox: '0 0 24 24' }, [
  h('path', { 
    fill: 'currentColor', 
    d: 'M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z' 
  })
])

const RefreshIcon = () => h('svg', { viewBox: '0 0 24 24' }, [
  h('path', { 
    fill: 'currentColor', 
    d: 'M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z' 
  })
])

// Store和状态
const message = useMessage()
const agentsStore = useAgentsStore()
const namespacesStore = useNamespacesStore()
const { agents } = storeToRefs(agentsStore)

// 模态框状态
const showDetailsModal = ref(false)
const selectedAgentForDetails = ref<Agent | null>(null)

// 日志窗口状态（这里简化处理）
const openLogWindows = ref(new Set<string>())

// 方法
const selectAgent = (agent: Agent) => {
  agentsStore.setSelectedAgent(agent)
  // 如果在聊天页面，可以触发聊天切换
  if (window.location.pathname === '/') {
    // 触发聊天切换逻辑
  }
}

const handleCreateClick = () => {
  message.info('创建新实例功能开发中...')
}

const showAgentLogs = (agent: Agent) => {
  const windowKey = `${agent.name}-${agent.namespace}`
  if (openLogWindows.value.has(windowKey)) {
    openLogWindows.value.delete(windowKey)
  } else {
    openLogWindows.value.add(windowKey)
  }
  message.info(`${isLogWindowOpen(agent) ? '打开' : '关闭'}日志窗口: ${agent.name}`)
}

const showAgentDetails = (agent: Agent) => {
  selectedAgentForDetails.value = agent
  showDetailsModal.value = true
}

const restartAgent = (agent: Agent) => {
  message.loading(`正在重启 ${agent.name}...`)
  // 模拟重启操作
  setTimeout(() => {
    message.success(`${agent.name} 重启成功`)
  }, 1500)
}

const isLogWindowOpen = (agent: Agent) => {
  return openLogWindows.value.has(`${agent.name}-${agent.namespace}`)
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    running: '运行中',
    stopped: '已停止',
    error: '错误',
    idle: '空闲'
  }
  return statusMap[status.toLowerCase()] || status
}

const getStatusTagType = (status: string) => {
  const typeMap: Record<string, string> = {
    running: 'success',
    stopped: 'default',
    error: 'error',
    idle: 'warning'
  }
  return typeMap[status.toLowerCase()] || 'default'
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString()
}
</script>

<style scoped lang="scss">
.chat-sidebar {
  width: 280px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-secondary);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.namespace-section {
  padding: 15px;
  border-bottom: 1px solid var(--border-secondary);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid var(--border-secondary);
  
  h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
  }
}

.instances-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.instance-item {
  padding: 12px;
  margin-bottom: 4px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  
  &:hover {
    background: var(--bg-tertiary);
  }
  
  &.active {
    background: var(--color-primary-light);
    border-color: var(--color-primary);
    
    .instance-name {
      color: var(--color-primary);
      font-weight: 600;
    }
  }
  
  &.status-running {
    border-left: 3px solid var(--color-success);
  }
  
  &.status-error {
    border-left: 3px solid var(--color-error);
  }
  
  &.status-idle {
    border-left: 3px solid var(--color-warning);
  }
  
  &.status-stopped {
    border-left: 3px solid var(--color-info);
  }
}

.instance-info {
  .instance-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
    
    .instance-name {
      font-weight: 500;
      color: var(--text-primary);
      font-size: 13px;
    }
    
    .instance-actions {
      display: flex;
      gap: 2px;
      opacity: 0;
      transition: opacity 0.2s ease;
    }
  }
  
  .instance-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
    
    .instance-role {
      color: var(--text-secondary);
      background: var(--bg-tertiary);
      padding: 2px 6px;
      border-radius: 4px;
    }
    
    .instance-status {
      font-weight: 500;
      
      &.status-running {
        color: var(--color-success);
      }
      
      &.status-error {
        color: var(--color-error);
      }
      
      &.status-idle {
        color: var(--color-warning);
      }
      
      &.status-stopped {
        color: var(--color-info);
      }
    }
  }
}

.instance-item:hover .instance-actions {
  opacity: 1;
}

.log-button-active {
  background: var(--color-primary-light) !important;
  color: var(--color-primary) !important;
}

.agent-details {
  .n-descriptions {
    margin-top: 16px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .chat-sidebar {
    width: 240px;
  }
  
  .instance-item {
    padding: 10px;
  }
  
  .instance-name {
    font-size: 12px;
  }
}
</style>
