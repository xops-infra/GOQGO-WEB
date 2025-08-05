<template>
  <LogsModalContainer
    v-if="visible"
    :agent="agent"
    :visible="visible"
    @close="handleClose"
  >
    <!-- 模态框头部 -->
    <template #header>
      <LogsModalHeader
        :agent="agent"
        :is-connected="isConnected"
        :is-real-time-enabled="isRealTimeEnabled"
        :is-auto-scroll-enabled="isAutoScrollEnabled"
        @toggle-real-time="toggleRealTime"
        @toggle-auto-scroll="toggleAutoScroll"
        @refresh="refreshLogs"
        @clear="clearLogs"
        @download="downloadLogs"
        @close="handleClose"
      />
    </template>

    <!-- 日志内容区域 -->
    <template #content>
      <LogsContent
        :logs="logs"
        :loading="isLoadingHistory"
        :connected="isConnected"
        :real-time-enabled="isRealTimeEnabled"
        :auto-scroll-enabled="isAutoScrollEnabled"
        @load-more="loadMoreLogs"
      />
    </template>

    <!-- 底部状态栏 -->
    <template #footer>
      <LogsModalFooter
        :logs-count="logs.length"
        :connection-status="connectionStatus"
        :last-update="lastUpdateTime"
        :filter-count="filteredLogsCount"
      />
    </template>
  </LogsModalContainer>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useMessage } from 'naive-ui'
import LogsModalContainer from './logs/LogsModalContainer.vue'
import LogsModalHeader from './logs/LogsModalHeader.vue'
import LogsContent from './logs/LogsContent.vue'
import LogsModalFooter from './logs/LogsModalFooter.vue'
import { useAgentLogs } from '@/composables/useAgentLogs'
import type { Agent, LogEntry } from '@/types/api'

interface Props {
  show: boolean
  agent: Agent | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:show': [value: boolean]
}>()

const message = useMessage()

// 计算属性
const visible = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
})

// 使用日志管理组合式函数
const {
  logs,
  isConnected,
  isRealTimeEnabled,
  isAutoScrollEnabled,
  isLoadingHistory,
  connectionStatus,
  lastUpdateTime,
  filteredLogsCount,
  
  // 方法
  toggleRealTime,
  toggleAutoScroll,
  refreshLogs,
  clearLogs,
  downloadLogs,
  loadMoreLogs,
  
  // 生命周期
  startLogsConnection,
  stopLogsConnection
} = useAgentLogs()

// 方法
const handleClose = () => {
  visible.value = false
}

// 监听agent变化
watch(() => props.agent, (newAgent) => {
  if (newAgent && visible.value) {
    startLogsConnection(newAgent)
  }
}, { immediate: true })

// 监听显示状态变化
watch(visible, (newVisible) => {
  if (newVisible && props.agent) {
    startLogsConnection(props.agent)
  } else {
    stopLogsConnection()
  }
})

// 生命周期
onMounted(() => {
  if (visible.value && props.agent) {
    startLogsConnection(props.agent)
  }
})

onUnmounted(() => {
  stopLogsConnection()
})
</script>

<style scoped lang="scss">
// 主组件样式在LogsModalContainer中定义
</style>
