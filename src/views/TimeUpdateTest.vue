<template>
  <div class="time-update-test">
    <n-card title="时间更新测试">
      <n-space vertical>
        <div>
          <strong>当前时间:</strong> {{ currentTime.toLocaleString() }}
        </div>
        
        <n-divider />
        
        <div>
          <strong>测试消息时间更新:</strong>
        </div>
        
        <div v-for="message in testMessages" :key="message.id" class="test-message">
          <div class="message-info">
            <span>消息ID: {{ message.id }}</span>
            <span>发送时间: {{ formatRelativeTime(message.timestamp, currentTime) }}</span>
          </div>
        </div>
        
        <n-divider />
        
        <div>
          <strong>测试Agent运行时间:</strong>
        </div>
        
        <div v-for="agent in testAgents" :key="agent.id" class="test-agent">
          <div class="agent-info">
            <span>{{ agent.name }}</span>
            <span>运行时间: {{ formatAgentUptime(agent.age) }}</span>
            <span>创建时间: {{ formatRelativeTime(agent.createdAt, currentTime) }}</span>
          </div>
        </div>
        
        <n-divider />
        
        <div>
          <strong>时间管理器状态:</strong>
        </div>
        <div>
          <n-tag type="success">每分钟自动更新</n-tag>
          <span style="margin-left: 8px;">下次更新: {{ nextUpdateTime }}</span>
        </div>
        
        <n-button @click="forceUpdate" type="primary">
          手动触发更新
        </n-button>
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { NCard, NSpace, NDivider, NTag, NButton } from 'naive-ui'
import { useTimeManager, formatRelativeTime, formatAgentUptime } from '@/utils/timeManager'

// 使用时间管理器
const { currentTime, cleanup } = useTimeManager()

// 测试数据
const testMessages = ref([
  {
    id: 'msg-1',
    timestamp: new Date(Date.now() - 30000).toISOString(), // 30秒前
    content: '测试消息1'
  },
  {
    id: 'msg-2', 
    timestamp: new Date(Date.now() - 120000).toISOString(), // 2分钟前
    content: '测试消息2'
  },
  {
    id: 'msg-3',
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1小时前
    content: '测试消息3'
  }
])

const testAgents = ref([
  {
    id: 'agent-1',
    name: 'Test Agent 1',
    age: '2h15m',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000 - 15 * 60 * 1000).toISOString()
  },
  {
    id: 'agent-2',
    name: 'Test Agent 2', 
    age: '45m',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
  }
])

// 计算下次更新时间
const nextUpdateTime = computed(() => {
  const now = currentTime.value
  const nextMinute = new Date(now.getTime() + (60 - now.getSeconds()) * 1000)
  return nextMinute.toLocaleTimeString()
})

// 手动触发更新
const forceUpdate = () => {
  // 这里可以手动触发时间更新，但实际上时间管理器会自动处理
  console.log('手动触发时间更新')
}

onMounted(() => {
  console.log('⏰ 时间更新测试页面已挂载')
})

onUnmounted(() => {
  cleanup()
  console.log('⏰ 时间更新测试页面已卸载')
})
</script>

<style scoped lang="scss">
.time-update-test {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.test-message, .test-agent {
  padding: 8px 12px;
  background-color: var(--bg-secondary);
  border-radius: 6px;
  margin-bottom: 8px;
}

.message-info, .agent-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  
  span {
    font-size: 14px;
    
    &:first-child {
      font-weight: 500;
    }
    
    &:not(:first-child) {
      color: var(--text-secondary);
    }
  }
}
</style>
