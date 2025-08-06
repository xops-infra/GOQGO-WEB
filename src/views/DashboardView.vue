<template>
  <div class="dashboard-view" :class="{ 'terminal-mode': isTerminal }">
    <!-- Terminal风格的Header -->
    <div class="dashboard-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="dashboard-title">
            <span class="title-icon">📊</span>
            AGENTS DASHBOARD
          </h1>
          <p class="subtitle">实时监控和管理您的AI Agent集群</p>
        </div>
        <div class="header-stats">
          <div class="stat-item">
            <span class="stat-value">{{ totalAgents }}</span>
            <span class="stat-label">总数</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ runningAgents }}</span>
            <span class="stat-label">运行中</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ errorAgents }}</span>
            <span class="stat-label">异常</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 仪表板内容 -->
    <div class="dashboard-content">
      <!-- 状态概览卡片 -->
      <div class="overview-cards">
        <div class="overview-card" v-for="card in overviewCards" :key="card.key">
          <div class="card-icon" :class="card.iconClass">{{ card.icon }}</div>
          <div class="card-content">
            <h3>{{ card.title }}</h3>
            <div class="card-value">{{ card.value }}</div>
            <div class="card-trend" :class="card.trendClass">
              {{ card.trend }}
            </div>
          </div>
        </div>
      </div>

      <!-- Agent状态网格 -->
      <div class="agents-grid">
        <div class="grid-header">
          <h2>🤖 Agent状态矩阵</h2>
          <div class="grid-controls">
            <n-button size="small" @click="refreshData">刷新</n-button>
          </div>
        </div>
        
        <div class="status-grid">
          <div 
            v-for="agent in mockAgents" 
            :key="agent.id"
            class="agent-cell"
            :class="getAgentStatusClass(agent.status)"
            @click="showAgentDetails(agent)"
          >
            <div class="agent-name">{{ agent.name }}</div>
            <div class="agent-status">{{ agent.status }}</div>
            <div class="agent-metrics">
              <span>CPU: {{ agent.cpu }}%</span>
              <span>内存: {{ agent.memory }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 实时日志流 -->
      <div class="log-stream">
        <div class="log-header">
          <h2>📝 实时日志流</h2>
          <div class="log-controls">
            <n-button size="small" @click="clearLogs">清空</n-button>
            <n-button size="small" @click="pauseLogs">{{ logsPaused ? '继续' : '暂停' }}</n-button>
          </div>
        </div>
        
        <div class="log-content" ref="logContainer">
          <div 
            v-for="log in recentLogs" 
            :key="log.id"
            class="log-entry"
            :class="getLogLevelClass(log.level)"
          >
            <span class="log-time">{{ formatTime(log.timestamp) }}</span>
            <span class="log-agent">{{ log.agent }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { NButton } from 'naive-ui'

// 简单的主题检测
const isTerminal = computed(() => {
  return document.documentElement.getAttribute('data-theme') === 'terminal'
})

// Mock数据
const mockAgents = ref([
  { id: '1', name: 'web-crawler', status: 'running', cpu: 45, memory: 62 },
  { id: '2', name: 'data-processor', status: 'running', cpu: 78, memory: 34 },
  { id: '3', name: 'api-gateway', status: 'error', cpu: 12, memory: 89 },
  { id: '4', name: 'ml-trainer', status: 'idle', cpu: 5, memory: 23 },
  { id: '5', name: 'log-analyzer', status: 'running', cpu: 67, memory: 45 },
  { id: '6', name: 'backup-service', status: 'idle', cpu: 2, memory: 15 }
])

const recentLogs = ref([
  { id: 1, timestamp: Date.now(), agent: 'web-crawler', level: 'info', message: '成功抓取100条数据' },
  { id: 2, timestamp: Date.now() - 1000, agent: 'api-gateway', level: 'error', message: '连接超时，正在重试...' },
  { id: 3, timestamp: Date.now() - 2000, agent: 'data-processor', level: 'info', message: '数据处理完成' }
])

const logsPaused = ref(false)
const logContainer = ref<HTMLElement>()

// 计算属性
const totalAgents = computed(() => mockAgents.value.length)
const runningAgents = computed(() => mockAgents.value.filter(a => a.status === 'running').length)
const errorAgents = computed(() => mockAgents.value.filter(a => a.status === 'error').length)

const overviewCards = computed(() => [
  {
    key: 'performance',
    icon: '⚡',
    iconClass: 'performance',
    title: '系统性能',
    value: '92%',
    trend: '+5% 较昨日',
    trendClass: 'positive'
  },
  {
    key: 'uptime',
    icon: '⏱️',
    iconClass: 'uptime',
    title: '运行时间',
    value: '99.9%',
    trend: '连续72小时',
    trendClass: 'stable'
  },
  {
    key: 'tasks',
    icon: '📋',
    iconClass: 'tasks',
    title: '任务完成',
    value: '1,247',
    trend: '+12% 较昨日',
    trendClass: 'positive'
  },
  {
    key: 'errors',
    icon: '⚠️',
    iconClass: 'errors',
    title: '错误率',
    value: '0.1%',
    trend: '-0.05% 较昨日',
    trendClass: 'positive'
  }
])

// 方法
const getAgentStatusClass = (status: string) => {
  return `status-${status}`
}

const getLogLevelClass = (level: string) => {
  return `log-${level}`
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString()
}

const showAgentDetails = (agent: any) => {
  console.log('显示Agent详情:', agent)
}

const refreshData = () => {
  console.log('刷新数据')
}

const clearLogs = () => {
  recentLogs.value = []
}

const pauseLogs = () => {
  logsPaused.value = !logsPaused.value
}

// 模拟实时日志
let logInterval: number
onMounted(() => {
  logInterval = setInterval(() => {
    if (!logsPaused.value) {
      const agents = ['web-crawler', 'data-processor', 'api-gateway', 'ml-trainer']
      const levels = ['info', 'warn', 'error']
      const messages = [
        '任务执行完成',
        '数据同步中...',
        '连接已建立',
        '处理请求中',
        '缓存已更新'
      ]
      
      recentLogs.value.unshift({
        id: Date.now(),
        timestamp: Date.now(),
        agent: agents[Math.floor(Math.random() * agents.length)],
        level: levels[Math.floor(Math.random() * levels.length)],
        message: messages[Math.floor(Math.random() * messages.length)]
      })
      
      // 保持最多50条日志
      if (recentLogs.value.length > 50) {
        recentLogs.value = recentLogs.value.slice(0, 50)
      }
    }
  }, 2000)
})

onUnmounted(() => {
  if (logInterval) {
    clearInterval(logInterval)
  }
})
</script>

<style scoped lang="scss">
.dashboard-view {
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.dashboard-header {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
  padding: 30px 20px;
  margin-bottom: 30px;
  
  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .dashboard-title {
    font-size: 2.5rem;
    font-weight: bold;
    color: white;
    margin-bottom: 10px;
    
    .title-icon {
      margin-right: 15px;
    }
  }
  
  .subtitle {
    color: rgba(255, 255, 255, 0.9);
    font-size: 1.1rem;
  }
  
  .header-stats {
    display: flex;
    gap: 30px;
    
    .stat-item {
      text-align: center;
      color: white;
      
      .stat-value {
        display: block;
        font-size: 2rem;
        font-weight: bold;
      }
      
      .stat-label {
        font-size: 0.9rem;
        opacity: 0.9;
      }
    }
  }
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
  
  .overview-card {
    background: var(--bg-secondary);
    border-radius: 12px;
    padding: 25px;
    border: 1px solid var(--border-secondary);
    display: flex;
    align-items: center;
    gap: 20px;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }
    
    .card-icon {
      font-size: 3rem;
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: var(--bg-tertiary);
    }
    
    .card-content {
      flex: 1;
      
      h3 {
        margin-bottom: 10px;
        color: var(--text-secondary);
        font-size: 0.9rem;
        text-transform: uppercase;
      }
      
      .card-value {
        font-size: 2rem;
        font-weight: bold;
        color: var(--text-primary);
        margin-bottom: 5px;
      }
      
      .card-trend {
        font-size: 0.8rem;
        
        &.positive {
          color: var(--color-success);
        }
        
        &.stable {
          color: var(--color-info);
        }
      }
    }
  }
}

.agents-grid {
  margin-bottom: 40px;
  
  .grid-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h2 {
      font-size: 1.5rem;
      color: var(--text-primary);
    }
  }
  
  .status-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
    
    .agent-cell {
      background: var(--bg-secondary);
      border-radius: 8px;
      padding: 15px;
      border: 2px solid transparent;
      cursor: pointer;
      transition: all 0.2s ease;
      
      &:hover {
        transform: scale(1.02);
      }
      
      &.status-running {
        border-color: var(--color-success);
        box-shadow: 0 0 10px rgba(24, 160, 88, 0.2);
      }
      
      &.status-error {
        border-color: var(--color-error);
        box-shadow: 0 0 10px rgba(208, 48, 80, 0.2);
      }
      
      &.status-idle {
        border-color: var(--color-warning);
        box-shadow: 0 0 10px rgba(240, 138, 0, 0.2);
      }
      
      .agent-name {
        font-weight: bold;
        margin-bottom: 5px;
      }
      
      .agent-status {
        font-size: 0.8rem;
        text-transform: uppercase;
        margin-bottom: 10px;
        opacity: 0.8;
      }
      
      .agent-metrics {
        font-size: 0.7rem;
        display: flex;
        justify-content: space-between;
        opacity: 0.7;
      }
    }
  }
}

.log-stream {
  .log-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h2 {
      font-size: 1.5rem;
      color: var(--text-primary);
    }
    
    .log-controls {
      display: flex;
      gap: 10px;
    }
  }
  
  .log-content {
    background: var(--bg-secondary);
    border-radius: 8px;
    padding: 20px;
    height: 300px;
    overflow-y: auto;
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.8rem;
    
    .log-entry {
      display: flex;
      gap: 15px;
      padding: 5px 0;
      border-bottom: 1px solid var(--border-tertiary);
      
      &.log-error {
        color: var(--color-error);
      }
      
      &.log-warn {
        color: var(--color-warning);
      }
      
      &.log-info {
        color: var(--text-secondary);
      }
      
      .log-time {
        min-width: 80px;
        opacity: 0.7;
      }
      
      .log-agent {
        min-width: 120px;
        font-weight: bold;
      }
      
      .log-message {
        flex: 1;
      }
    }
  }
}

// Terminal主题样式
.terminal-mode {
  background: var(--terminal-bg);
  
  .dashboard-header {
    background: linear-gradient(135deg, var(--pixel-green), var(--pixel-cyan));
    
    .dashboard-title {
      font-family: var(--font-display);
      text-shadow: 0 0 20px var(--pixel-green);
      letter-spacing: 2px;
    }
  }
  
  .overview-card {
    background: var(--terminal-bg-secondary);
    border: 1px solid var(--terminal-border);
    
    &:hover {
      box-shadow: 0 0 20px rgba(0, 255, 0, 0.2);
    }
    
    .card-icon {
      background: var(--terminal-bg-tertiary);
      border: 1px solid var(--pixel-green);
    }
  }
  
  .agent-cell {
    background: var(--terminal-bg-secondary);
    border: 1px solid var(--terminal-border);
    font-family: var(--font-mono);
    
    &.status-running {
      border-color: var(--pixel-green);
      box-shadow: 0 0 15px rgba(0, 255, 0, 0.3);
    }
    
    &.status-error {
      border-color: var(--pixel-red);
      box-shadow: 0 0 15px rgba(255, 0, 0, 0.3);
    }
  }
  
  .log-content {
    background: var(--terminal-bg-secondary);
    border: 1px solid var(--terminal-border);
    color: var(--terminal-text);
  }
}
</style>
