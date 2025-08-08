<template>
  <div class="dashboard-view">
    <!-- 页面头部信息 -->
    <div class="page-header">
      <div class="page-info">
        <h1 class="page-title">{{ isTerminal ? 'SYSTEM_DASHBOARD' : '系统看板' }}</h1>
        <p class="page-description">{{ isTerminal ? 'REAL_TIME_SYSTEM_MONITORING' : '实时系统监控' }}</p>
      </div>
    </div>
    
    <!-- 页面内容 -->
    <div class="page-content">
      <div class="dashboard-content" :class="{ 'terminal-mode': isTerminal }">
        <!-- 统计卡片网格 -->
        <div class="stats-grid">
          <n-grid :cols="4" :x-gap="16" :y-gap="16">
            <n-grid-item>
              <div class="stat-card" :class="{ 'terminal-card': isTerminal }">
                <div class="stat-icon">
                  <n-icon size="32" :class="{ 'terminal-icon': isTerminal }">
                    <PersonOutline />
                  </n-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-value" :class="{ 'terminal-value': isTerminal }">
                    {{ totalAgents }}
                  </div>
                  <div class="stat-label" :class="{ 'terminal-label': isTerminal }">
                    {{ isTerminal ? 'TOTAL_AGENTS' : '总智能体数' }}
                  </div>
                </div>
              </div>
            </n-grid-item>
            
            <n-grid-item>
              <div class="stat-card" :class="{ 'terminal-card': isTerminal }">
                <div class="stat-icon">
                  <n-icon size="32" :class="{ 'terminal-icon': isTerminal }">
                    <PlayCircleOutline />
                  </n-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-value" :class="{ 'terminal-value': isTerminal }">
                    {{ runningAgents }}
                  </div>
                  <div class="stat-label" :class="{ 'terminal-label': isTerminal }">
                    {{ isTerminal ? 'RUNNING_AGENTS' : '运行中智能体' }}
                  </div>
                </div>
              </div>
            </n-grid-item>
            
            <n-grid-item>
              <div class="stat-card" :class="{ 'terminal-card': isTerminal }">
                <div class="stat-icon">
                  <n-icon size="32" :class="{ 'terminal-icon': isTerminal }">
                    <ChatbubbleOutline />
                  </n-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-value" :class="{ 'terminal-value': isTerminal }">
                    {{ totalMessages }}
                  </div>
                  <div class="stat-label" :class="{ 'terminal-label': isTerminal }">
                    {{ isTerminal ? 'TOTAL_MESSAGES' : '总消息数' }}
                  </div>
                </div>
              </div>
            </n-grid-item>
            
            <n-grid-item>
              <div class="stat-card" :class="{ 'terminal-card': isTerminal }">
                <div class="stat-icon">
                  <n-icon size="32" :class="{ 'terminal-icon': isTerminal }">
                    <PeopleOutline />
                  </n-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-value" :class="{ 'terminal-value': isTerminal }">
                    {{ activeUsers }}
                  </div>
                  <div class="stat-label" :class="{ 'terminal-label': isTerminal }">
                    {{ isTerminal ? 'ACTIVE_USERS' : '活跃用户' }}
                  </div>
                </div>
              </div>
            </n-grid-item>
          </n-grid>
        </div>

        <!-- 系统状态网格 -->
        <div class="status-grid">
          <n-grid :cols="2" :x-gap="16" :y-gap="16">
            <n-grid-item>
              <n-card :title="isTerminal ? 'AGENT_STATUS' : '智能体状态'" :class="{ 'terminal-window': isTerminal }">
                <div class="status-list">
                  <div 
                    v-for="agent in recentAgents" 
                    :key="agent.name"
                    class="status-item"
                    :class="{ 'terminal-item': isTerminal }"
                  >
                    <div class="status-info">
                      <span class="agent-name" :class="{ 'terminal-text': isTerminal }">
                        {{ agent.name }}
                      </span>
                      <span class="agent-namespace" :class="{ 'terminal-text-dim': isTerminal }">
                        {{ agent.namespace }}
                      </span>
                    </div>
                    <div class="status-badge">
                      <n-tag 
                        :type="getStatusType(agent.status)" 
                        size="small" 
                        round
                        :class="{ 'terminal-tag': isTerminal }"
                      >
                        {{ agent.status }}
                      </n-tag>
                    </div>
                  </div>
                </div>
              </n-card>
            </n-grid-item>
            
            <n-grid-item>
              <n-card :title="isTerminal ? 'SYSTEM_INFO' : '系统信息'" :class="{ 'terminal-window': isTerminal }">
                <div class="system-info">
                  <div class="info-item" :class="{ 'terminal-item': isTerminal }">
                    <span class="info-label" :class="{ 'terminal-text': isTerminal }">
                      {{ isTerminal ? 'VERSION' : '版本' }}:
                    </span>
                    <span class="info-value" :class="{ 'terminal-text': isTerminal }">
                      {{ versionInfo.version }}
                    </span>
                  </div>
                  <div class="info-item" :class="{ 'terminal-item': isTerminal }">
                    <span class="info-label" :class="{ 'terminal-text': isTerminal }">
                      {{ isTerminal ? 'BUILD_TIME' : '构建时间' }}:
                    </span>
                    <span class="info-value" :class="{ 'terminal-text': isTerminal }">
                      {{ formatBuildTime(versionInfo.buildTime) }}
                    </span>
                  </div>
                  <div class="info-item" :class="{ 'terminal-item': isTerminal }">
                    <span class="info-label" :class="{ 'terminal-text': isTerminal }">
                      {{ isTerminal ? 'UPTIME' : '运行时间' }}:
                    </span>
                    <span class="info-value" :class="{ 'terminal-text': isTerminal }">
                      {{ systemUptime }}
                    </span>
                  </div>
                </div>
              </n-card>
            </n-grid-item>
          </n-grid>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { NGrid, NGridItem, NIcon, NCard, NTag } from 'naive-ui'
import { 
  PersonOutline, 
  PlayCircleOutline, 
  ChatbubbleOutline, 
  PeopleOutline,
  CheckmarkCircleOutline,
  CloseCircleOutline,
  TimeOutline
} from '@vicons/ionicons5'
import { useTheme } from '@/utils/theme'
import PageLayout from '@/components/PageLayout.vue'

const { isTerminal } = useTheme()

// 模拟数据
const totalAgents = ref(12)
const runningAgents = ref(8)
const totalMessages = ref(1247)
const activeUsers = ref(5)

const recentAgents = ref([
  { name: 'assistant-1', namespace: 'default', status: 'Running' },
  { name: 'backend-api', namespace: 'production', status: 'Running' },
  { name: 'frontend-dev', namespace: 'development', status: 'Stopped' },
  { name: 'qa-tester', namespace: 'testing', status: 'Running' },
  { name: 'data-processor', namespace: 'default', status: 'Error' }
])

const recentActivities = ref([
  { id: 1, timestamp: new Date(Date.now() - 5 * 60 * 1000), message: '智能体 assistant-1 已启动' },
  { id: 2, timestamp: new Date(Date.now() - 15 * 60 * 1000), message: '收到新消息 247 条' },
  { id: 3, timestamp: new Date(Date.now() - 30 * 60 * 1000), message: '用户 admin 登录系统' },
  { id: 4, timestamp: new Date(Date.now() - 45 * 60 * 1000), message: '智能体 backend-api 重启完成' },
  { id: 5, timestamp: new Date(Date.now() - 60 * 60 * 1000), message: '系统健康检查通过' }
])

// 方法
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    'Running': '#18a058',
    'Stopped': '#f0a020',
    'Error': '#d03050'
  }
  return colorMap[status] || '#909399'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'Running': '运行中',
    'Stopped': '已停止',
    'Error': '错误'
  }
  return textMap[status] || status
}

const formatTime = (timestamp: Date) => {
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`
  
  const days = Math.floor(hours / 24)
  return `${days}天前`
}

const getStatusType = (status: string): 'success' | 'warning' | 'error' | 'info' => {
  const typeMap: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
    'Running': 'success',
    'Stopped': 'warning',
    'Error': 'error'
  }
  return typeMap[status] || 'info'
}

const formatBuildTime = (timestamp: string) => {
  const date = new Date(timestamp)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}

const systemUptime = computed(() => {
  const now = new Date()
  const startTime = new Date(process.env.VUE_APP_START_TIME || '2023-01-01T00:00:00Z') // 假设应用启动时间为环境变量
  const diff = now.getTime() - startTime.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return `${days}天 ${hours}小时 ${minutes}分钟`
})

const versionInfo = ref({
  version: '1.0.0',
  buildTime: '2023-10-27T10:00:00Z'
})

// 生命周期
onMounted(() => {
  // 这里可以加载真实数据
  console.log('Dashboard mounted')
})
</script>

<style scoped lang="scss">
.dashboard-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--page-bg);
}

.page-header {
  padding: 24px 32px;
  background: var(--header-bg);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;

  .page-info {
    flex: 1;
    min-width: 300px;
  }

  .page-title {
    font-size: 28px;
    font-weight: 600;
    color: var(--text-color-1);
    margin-bottom: 8px;
  }

  .page-description {
    font-size: 16px;
    color: var(--text-color-3);
  }
}

.page-content {
  flex: 1;
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;

  &.terminal-mode {
    background: var(--terminal-bg);
  }
}

.stats-grid {
  .stat-card {
    display: flex;
    align-items: center;
    padding: 24px;
    background: var(--card-color);
    border-radius: 8px;
    border: 1px solid var(--border-color);
    transition: all 0.2s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    &.terminal-card {
      background: var(--terminal-card-bg);
      border-color: var(--terminal-border);
      
      &:hover {
        background: var(--terminal-card-hover-bg);
        box-shadow: 0 0 20px rgba(0, 255, 65, 0.2);
      }
    }
    
    .stat-icon {
      margin-right: 16px;
      color: var(--primary-color);
      
      &.terminal-icon {
        color: var(--terminal-primary);
      }
    }
    
    .stat-content {
      .stat-value {
        font-size: 28px;
        font-weight: 600;
        color: var(--text-color-1);
        line-height: 1;
        margin-bottom: 4px;
        
        &.terminal-value {
          color: var(--terminal-text);
          font-family: 'Courier New', monospace;
        }
      }
      
      .stat-label {
        font-size: 14px;
        color: var(--text-color-3);
        
        &.terminal-label {
          color: var(--terminal-text-dim);
          font-family: 'Courier New', monospace;
        }
      }
    }
  }
}

.status-grid {
  flex: 1;
  
  :deep(.n-card) {
    height: 100%;
    
    &.terminal-window {
      background: var(--terminal-card-bg);
      border-color: var(--terminal-border);
      
      .n-card-header {
        background: var(--terminal-header-bg);
        color: var(--terminal-text);
        font-family: 'Courier New', monospace;
      }
    }
  }
}

.status-list, .activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
}

.status-item, .activity-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: var(--hover-color);
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--primary-color-hover);
  }
  
  &.terminal-item {
    background: var(--terminal-item-bg);
    border: 1px solid var(--terminal-border);
    
    &:hover {
      background: var(--terminal-item-hover-bg);
    }
  }
}

.status-info {
  display: flex;
  flex-direction: column;
  
  .agent-name {
    font-weight: 500;
    color: var(--text-color-1);
    
    &.terminal-text {
      color: var(--terminal-text);
      font-family: 'Courier New', monospace;
    }
  }
  
  .agent-namespace {
    font-size: 12px;
    color: var(--text-color-3);
    
    &.terminal-text-dim {
      color: var(--terminal-text-dim);
      font-family: 'Courier New', monospace;
    }
  }
}

.status-badge {
  margin-top: 8px;
}

.system-info {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .info-item {
    display: flex;
    align-items: center;
    gap: 12px;

    .info-label {
      font-size: 14px;
      color: var(--text-color-3);
      font-weight: 500;
      
      &.terminal-text {
        color: var(--terminal-text-dim);
        font-family: 'Courier New', monospace;
      }
    }

    .info-value {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-color-1);
      font-family: 'Courier New', monospace;
      
      &.terminal-text {
        color: var(--terminal-text);
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .stats-grid {
    :deep(.n-grid) {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}

@media (max-width: 768px) {
  .stats-grid {
    :deep(.n-grid) {
      grid-template-columns: 1fr;
    }
  }
  
  .stat-card {
    .stat-value {
      font-size: 24px;
    }
  }

  .status-grid {
    grid-template-columns: 1fr;
  }
}
</style>
