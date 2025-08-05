<template>
  <n-modal
    :show="show"
    @update:show="$emit('update:show', $event)"
    preset="card"
    :title="`Agent详情 - ${agent?.name || ''}`"
    style="width: 600px"
    :mask-closable="true"
  >
    <div v-if="agent" class="agent-details">
      <!-- 基本信息 -->
      <div class="details-section">
        <h3>基本信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>名称:</label>
            <span>{{ agent.name }}</span>
          </div>
          <div class="info-item">
            <label>命名空间:</label>
            <span>{{ agent.namespace }}</span>
          </div>
          <div class="info-item">
            <label>角色:</label>
            <span>{{ agent.role }}</span>
          </div>
          <div class="info-item">
            <label>状态:</label>
            <n-tag :type="getStatusType(agent.status)" size="small">
              {{ getStatusText(agent.status) }}
            </n-tag>
          </div>
          <div class="info-item">
            <label>用户:</label>
            <span>{{ agent.username || '未知' }}</span>
          </div>
          <div class="info-item">
            <label>运行时间:</label>
            <span>{{ formatUptime(agent.age) }}</span>
          </div>
        </div>
      </div>

      <!-- 运行信息 -->
      <div class="details-section">
        <h3>运行信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>重启次数:</label>
            <span>{{ agent.restartCount || 0 }}</span>
          </div>
          <div class="info-item">
            <label>创建时间:</label>
            <span>{{ formatDate(agent.createdAt) }}</span>
          </div>
          <div class="info-item">
            <label>最后更新:</label>
            <span>{{ formatDate(agent.updatedAt) }}</span>
          </div>
        </div>
      </div>

      <!-- 配置信息 -->
      <div v-if="agent.config" class="details-section">
        <h3>配置信息</h3>
        <div class="config-content">
          <pre>{{ JSON.stringify(agent.config, null, 2) }}</pre>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="actions-section">
        <n-space>
          <n-button @click="$emit('action', 'view-logs', agent)">
            <template #icon>
              <n-icon>
                <LogIcon />
              </n-icon>
            </template>
            查看日志
          </n-button>
          
          <n-button 
            @click="$emit('action', 'restart', agent)"
            :disabled="agent.status === 'creating' || agent.status === 'terminating'"
          >
            <template #icon>
              <n-icon>
                <RestartIcon />
              </n-icon>
            </template>
            重启
          </n-button>
          
          <n-button 
            @click="$emit('action', 'stop', agent)"
            :disabled="agent.status !== 'running'"
          >
            <template #icon>
              <n-icon>
                <StopIcon />
              </n-icon>
            </template>
            停止
          </n-button>
          
          <n-button 
            type="error"
            @click="$emit('action', 'delete', agent)"
          >
            <template #icon>
              <n-icon>
                <DeleteIcon />
              </n-icon>
            </template>
            删除
          </n-button>
        </n-space>
      </div>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { NModal, NTag, NButton, NIcon, NSpace } from 'naive-ui'
import LogIcon from '@/components/icons/LogIcon.vue'
import RestartIcon from '@/components/icons/RestartIcon.vue'
import StopIcon from '@/components/icons/StopIcon.vue'
import DeleteIcon from '@/components/icons/DeleteIcon.vue'
import type { Agent } from '@/types/api'

interface Props {
  show: boolean
  agent: Agent | null
}

defineProps<Props>()

defineEmits<{
  'update:show': [value: boolean]
  action: [action: string, agent: Agent]
}>()

// 方法
const getStatusType = (status: string) => {
  const typeMap = {
    running: 'success',
    idle: 'warning',
    error: 'error',
    creating: 'info',
    terminating: 'info',
    stopped: 'default'
  }
  return typeMap[status.toLowerCase()] || 'default'
}

const getStatusText = (status: string) => {
  const statusMap = {
    running: '运行中',
    idle: '空闲',
    error: '错误',
    creating: '创建中',
    terminating: '终止中',
    stopped: '已停止'
  }
  return statusMap[status.toLowerCase()] || status
}

const formatUptime = (age: string) => {
  if (!age) return '未知'
  
  if (age.includes('m') && !age.includes('h')) {
    return age.replace('m', '分钟')
  }
  if (age.includes('h')) {
    return age.replace('h', '小时').replace('m', '分钟')
  }
  if (age.includes('d')) {
    return age.replace('d', '天').replace('h', '小时')
  }
  
  return age
}

const formatDate = (dateString: string) => {
  if (!dateString) return '未知'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN')
  } catch {
    return dateString
  }
}
</script>

<style scoped lang="scss">
.agent-details {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.details-section {
  h3 {
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    border-bottom: 1px solid var(--border-primary);
    padding-bottom: 8px;
  }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  label {
    font-size: 12px;
    color: var(--text-secondary);
    font-weight: 500;
  }
  
  span {
    font-size: 14px;
    color: var(--text-primary);
    font-family: var(--font-mono);
  }
}

.config-content {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  padding: 12px;
  max-height: 200px;
  overflow-y: auto;
  
  pre {
    margin: 0;
    font-size: 12px;
    color: var(--text-primary);
    font-family: var(--font-mono);
    white-space: pre-wrap;
    word-break: break-all;
  }
}

.actions-section {
  border-top: 1px solid var(--border-primary);
  padding-top: 16px;
}

// Terminal主题样式
[data-theme='terminal'] .agent-details {
  .details-section h3 {
    color: var(--pixel-green);
    font-family: var(--font-display);
    text-transform: uppercase;
    letter-spacing: 1px;
    border-bottom-color: var(--terminal-border);
  }
  
  .info-item {
    label {
      color: var(--terminal-text-secondary);
      font-family: var(--font-mono);
      text-transform: uppercase;
      font-size: 11px;
    }
    
    span {
      color: var(--terminal-text);
      font-family: var(--font-mono);
    }
  }
  
  .config-content {
    background: var(--terminal-bg-secondary);
    border-color: var(--terminal-border);
    
    pre {
      color: var(--terminal-text);
    }
  }
  
  .actions-section {
    border-top-color: var(--terminal-border);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .actions-section {
    :deep(.n-space) {
      flex-wrap: wrap;
      gap: 8px !important;
    }
    
    .n-button {
      flex: 1;
      min-width: 120px;
    }
  }
}
</style>
