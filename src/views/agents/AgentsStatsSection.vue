<template>
  <div class="agents-stats-section">
    <n-grid :cols="4" :x-gap="16" :y-gap="16" class="stats-grid">
      <n-grid-item>
        <TerminalStatsCard
          title="总数量"
          :value="totalCount"
          type="primary"
          icon="total"
          :progress="75"
          subtitle="TOTAL_AGENTS"
          :trend="totalTrend"
          trend-direction="up"
        />
      </n-grid-item>
      
      <n-grid-item>
        <TerminalStatsCard
          title="运行中"
          :value="runningCount"
          type="success"
          icon="running"
          :progress="runningProgress"
          subtitle="ACTIVE_INSTANCES"
          :trend="runningTrend"
          trend-direction="up"
        />
      </n-grid-item>
      
      <n-grid-item>
        <TerminalStatsCard
          title="空闲状态"
          :value="idleCount"
          type="warning"
          icon="idle"
          :progress="idleProgress"
          subtitle="IDLE_INSTANCES"
          :trend="idleTrend"
          trend-direction="stable"
        />
      </n-grid-item>
      
      <n-grid-item>
        <TerminalStatsCard
          title="错误状态"
          :value="errorCount"
          type="error"
          icon="error"
          :progress="errorProgress"
          subtitle="ERROR_INSTANCES"
          :trend="errorTrend"
          trend-direction="down"
        />
      </n-grid-item>
    </n-grid>

    <!-- 加载状态 -->
    <div v-if="loading" class="stats-loading">
      <n-spin size="large" />
      <p>正在加载统计数据...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NGrid, NGridItem, NSpin } from 'naive-ui'
import TerminalStatsCard from '@/components/TerminalStatsCard.vue'
import type { Agent } from '@/types/api'

interface Props {
  agents: Agent[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

// 计算属性
const totalCount = computed(() => props.agents.length)

const runningCount = computed(() => 
  props.agents.filter(agent => agent.status === 'running').length
)

const idleCount = computed(() => 
  props.agents.filter(agent => agent.status === 'idle').length
)

const errorCount = computed(() => 
  props.agents.filter(agent => 
    agent.status === 'error' || agent.status === 'failed'
  ).length
)

const runningProgress = computed(() => 
  totalCount.value > 0 ? Math.round((runningCount.value / totalCount.value) * 100) : 0
)

const idleProgress = computed(() => 
  totalCount.value > 0 ? Math.round((idleCount.value / totalCount.value) * 100) : 0
)

const errorProgress = computed(() => 
  totalCount.value > 0 ? Math.round((errorCount.value / totalCount.value) * 100) : 0
)

// 趋势计算（这里简化处理，实际应该基于历史数据）
const totalTrend = computed(() => '+12%')
const runningTrend = computed(() => '+8%')
const idleTrend = computed(() => '0%')
const errorTrend = computed(() => '-5%')
</script>

<style scoped lang="scss">
.agents-stats-section {
  position: relative;
}

.stats-grid {
  width: 100%;
}

.stats-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(var(--bg-primary-rgb), 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  
  p {
    margin-top: 16px;
    color: var(--text-secondary);
    font-size: 14px;
  }
}

// Terminal主题样式
[data-theme='terminal'] .stats-loading {
  background: rgba(var(--terminal-bg-rgb), 0.8);
  
  p {
    color: var(--terminal-text-secondary);
    font-family: var(--font-mono);
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .stats-grid {
    :deep(.n-grid) {
      grid-template-columns: repeat(2, 1fr) !important;
    }
  }
}

@media (max-width: 768px) {
  .stats-grid {
    :deep(.n-grid) {
      grid-template-columns: 1fr !important;
    }
  }
}
</style>
