<template>
  <div class="agents-list-section">
    <!-- 批量操作栏 -->
    <div v-if="selectedAgents.length > 0" class="batch-actions-bar">
      <div class="selected-info">
        已选择 {{ selectedAgents.length }} 个Agent
      </div>
      <div class="batch-actions">
        <n-button size="small" @click="$emit('batch-action', 'restart')">
          <template #icon>
            <n-icon>
              <RestartIcon />
            </n-icon>
          </template>
          批量重启
        </n-button>
        
        <n-button size="small" @click="$emit('batch-action', 'stop')">
          <template #icon>
            <n-icon>
              <StopIcon />
            </n-icon>
          </template>
          批量停止
        </n-button>
        
        <n-button size="small" type="error" @click="$emit('batch-action', 'delete')">
          <template #icon>
            <n-icon>
              <DeleteIcon />
            </n-icon>
          </template>
          批量删除
        </n-button>
      </div>
    </div>

    <!-- Agent列表 -->
    <div class="agents-list">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <n-spin size="large" />
        <p>正在加载Agent列表...</p>
      </div>

      <!-- Agent网格 -->
      <div v-else-if="agents.length > 0" class="agents-grid">
        <AgentCard
          v-for="agent in agents"
          :key="`${agent.namespace}-${agent.name}`"
          :agent="agent"
          :selected="isAgentSelected(agent)"
          @select="handleAgentSelect"
          @action="handleAgentAction"
        />
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <div class="empty-icon">
          <n-icon size="64" color="var(--text-tertiary)">
            <EmptyAgentsIcon />
          </n-icon>
        </div>
        <h3>暂无Agent</h3>
        <p>当前筛选条件下没有找到Agent，请尝试调整筛选条件或创建新的Agent。</p>
        <n-button type="primary" @click="$emit('create')">
          <template #icon>
            <n-icon>
              <AddIcon />
            </n-icon>
          </template>
          创建Agent
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NButton, NIcon, NSpin } from 'naive-ui'
import AgentCard from './AgentCard.vue'
import RestartIcon from '@/components/icons/RestartIcon.vue'
import StopIcon from '@/components/icons/StopIcon.vue'
import DeleteIcon from '@/components/icons/DeleteIcon.vue'
import EmptyAgentsIcon from '@/components/icons/EmptyAgentsIcon.vue'
import AddIcon from '@/components/icons/AddIcon.vue'
import type { Agent } from '@/types/api'

interface Props {
  agents: Agent[]
  loading: boolean
  selectedAgents: Agent[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [agent: Agent, selected: boolean]
  'batch-action': [action: string]
  'agent-action': [action: string, agent: Agent]
}>()

// 方法
const isAgentSelected = (agent: Agent) => {
  return props.selectedAgents.some(a => 
    a.namespace === agent.namespace && a.name === agent.name
  )
}

const handleAgentSelect = (agent: Agent, selected: boolean) => {
  emit('select', agent, selected)
}

const handleAgentAction = (action: string, agent: Agent) => {
  emit('agent-action', action, agent)
}
</script>

<style scoped lang="scss">
.agents-list-section {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  overflow: hidden;
}

.batch-actions-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-primary);
  
  .selected-info {
    font-size: 14px;
    color: var(--text-secondary);
    font-weight: 500;
  }
  
  .batch-actions {
    display: flex;
    gap: 8px;
  }
}

.agents-list {
  min-height: 400px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  
  p {
    margin-top: 16px;
    color: var(--text-secondary);
    font-size: 14px;
  }
}

.agents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
  padding: 20px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  
  .empty-icon {
    margin-bottom: 24px;
  }
  
  h3 {
    margin: 0 0 12px 0;
    font-size: 18px;
    color: var(--text-primary);
  }
  
  p {
    margin: 0 0 24px 0;
    color: var(--text-secondary);
    font-size: 14px;
    line-height: 1.5;
    max-width: 400px;
  }
}

// Terminal主题样式
[data-theme='terminal'] .agents-list-section {
  background: var(--terminal-bg-secondary);
  border-color: var(--terminal-border);
  
  .batch-actions-bar {
    background: var(--terminal-bg);
    border-bottom-color: var(--terminal-border);
    
    .selected-info {
      color: var(--terminal-text-secondary);
      font-family: var(--font-mono);
    }
  }
  
  .loading-state p,
  .empty-state h3,
  .empty-state p {
    color: var(--terminal-text);
    font-family: var(--font-mono);
  }
  
  .empty-state h3 {
    text-transform: uppercase;
    letter-spacing: 1px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .agents-grid {
    grid-template-columns: 1fr;
    padding: 16px;
    gap: 12px;
  }
  
  .batch-actions-bar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
    
    .batch-actions {
      justify-content: center;
    }
  }
  
  .empty-state {
    padding: 60px 16px;
    
    h3 {
      font-size: 16px;
    }
    
    p {
      font-size: 13px;
    }
  }
}

@media (max-width: 480px) {
  .agents-grid {
    grid-template-columns: 1fr;
  }
}
</style>
