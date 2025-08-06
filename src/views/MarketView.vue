<template>
  <div class="market-view">
    <div class="market-header">
      <h1>🛒 Agent市场</h1>
      <p>发现和安装优秀的AI Agent</p>
    </div>
    
    <div class="market-content">
      <div class="market-categories">
        <n-button-group>
          <n-button 
            v-for="category in categories"
            :key="category.key"
            :type="selectedCategory === category.key ? 'primary' : 'default'"
            @click="selectedCategory = category.key"
          >
            {{ category.label }}
          </n-button>
        </n-button-group>
      </div>
      
      <div class="agents-grid">
        <div 
          v-for="agent in filteredAgents"
          :key="agent.id"
          class="agent-card"
        >
          <div class="agent-icon">{{ agent.icon }}</div>
          <h3>{{ agent.name }}</h3>
          <p>{{ agent.description }}</p>
          <div class="agent-meta">
            <n-tag size="small" :type="agent.category === 'popular' ? 'success' : 'default'">
              {{ agent.category }}
            </n-tag>
            <span class="downloads">{{ agent.downloads }} 下载</span>
          </div>
          <n-button type="primary" block @click="installAgent(agent)">
            安装
          </n-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NButton, NButtonGroup, NTag, useMessage } from 'naive-ui'

const message = useMessage()
const selectedCategory = ref('all')

const categories = [
  { key: 'all', label: '全部' },
  { key: 'popular', label: '热门' },
  { key: 'development', label: '开发' },
  { key: 'design', label: '设计' },
  { key: 'business', label: '商务' }
]

const marketAgents = [
  {
    id: '1',
    name: 'Code Assistant',
    description: '智能代码助手，支持多种编程语言',
    icon: '💻',
    category: 'popular',
    downloads: 1200
  },
  {
    id: '2', 
    name: 'Design Helper',
    description: 'UI/UX设计助手，提供设计建议',
    icon: '🎨',
    category: 'design',
    downloads: 800
  },
  {
    id: '3',
    name: 'Data Analyst',
    description: '数据分析专家，生成图表和报告',
    icon: '📊',
    category: 'business',
    downloads: 950
  },
  {
    id: '4',
    name: 'DevOps Engineer',
    description: '运维专家，自动化部署和监控',
    icon: '⚙️',
    category: 'development',
    downloads: 600
  }
]

const filteredAgents = computed(() => {
  if (selectedCategory.value === 'all') {
    return marketAgents
  }
  return marketAgents.filter(agent => agent.category === selectedCategory.value)
})

const installAgent = (agent: any) => {
  message.success(`正在安装 ${agent.name}...`)
  // TODO: 实现安装逻辑
}
</script>

<style scoped lang="scss">
.market-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.market-header {
  text-align: center;
  margin-bottom: 30px;
  
  h1 {
    font-size: 2.5rem;
    margin-bottom: 10px;
    color: var(--text-primary);
  }
  
  p {
    color: var(--text-secondary);
    font-size: 1.1rem;
  }
}

.market-categories {
  margin-bottom: 30px;
  display: flex;
  justify-content: center;
}

.agents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.agent-card {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid var(--border-secondary);
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
  
  .agent-icon {
    font-size: 3rem;
    text-align: center;
    margin-bottom: 15px;
  }
  
  h3 {
    margin-bottom: 10px;
    color: var(--text-primary);
  }
  
  p {
    color: var(--text-secondary);
    margin-bottom: 15px;
    line-height: 1.5;
  }
  
  .agent-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    
    .downloads {
      font-size: 0.9rem;
      color: var(--text-tertiary);
    }
  }
}
</style>
