<template>
  <div class="socket-status-monitor">
    <!-- 连接状态指示器 -->
    <div 
      class="status-indicator"
      :class="statusClass"
      @click="toggleDetails"
      :title="statusMessage"
    >
      <div class="status-dot" :class="statusClass"></div>
      <span class="status-text">{{ statusText }}</span>
      <n-icon v-if="showDetails" class="expand-icon">
        <ChevronUpIcon />
      </n-icon>
      <n-icon v-else class="expand-icon">
        <ChevronDownIcon />
      </n-icon>
    </div>

    <!-- 详细信息面板 -->
    <n-collapse-transition :show="showDetails">
      <div class="status-details">
        <div class="detail-row">
          <span class="label">命名空间:</span>
          <span class="value">{{ connectionStatus.namespace || 'N/A' }}</span>
        </div>
        
        <div class="detail-row">
          <span class="label">连接状态:</span>
          <span class="value" :class="statusClass">{{ connectionStatus.message }}</span>
        </div>
        
        <div class="detail-row" v-if="connectionStatus.reconnectAttempts > 0">
          <span class="label">重连次数:</span>
          <span class="value">{{ connectionStatus.reconnectAttempts }}</span>
        </div>
        
        <div class="detail-row" v-if="connectionStatus.lastConnectedTime">
          <span class="label">最后连接:</span>
          <span class="value">{{ formatTime(connectionStatus.lastConnectedTime) }}</span>
        </div>
        
        <div class="detail-row" v-if="connectionStatus.pendingMessagesCount > 0">
          <span class="label">待发送消息:</span>
          <span class="value warning">{{ connectionStatus.pendingMessagesCount }}</span>
        </div>

        <!-- 操作按钮 -->
        <div class="actions">
          <n-button 
            size="small" 
            type="primary" 
            @click="handleReconnect"
            :loading="isReconnecting"
            :disabled="connectionStatus.isConnected"
          >
            重新连接
          </n-button>
          
          <n-button 
            size="small" 
            type="default" 
            @click="handleRefresh"
          >
            刷新状态
          </n-button>
          
          <n-button 
            size="small" 
            type="warning" 
            @click="handleClearPending"
            v-if="connectionStatus.pendingMessagesCount > 0"
          >
            清理待发送
          </n-button>
        </div>
      </div>
    </n-collapse-transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, h } from 'vue'
import { NButton, NIcon, NCollapseTransition, useMessage } from 'naive-ui'
import { useChatStore } from '@/stores/chat'

// 图标组件（简单的SVG图标）
const ChevronUpIcon = {
  render: () => {
    return h('svg', { viewBox: '0 0 16 16', fill: 'currentColor' }, [
      h('path', { d: 'M8 4l-4 4h8l-4-4z' })
    ])
  }
}

const ChevronDownIcon = {
  render: () => {
    return h('svg', { viewBox: '0 0 16 16', fill: 'currentColor' }, [
      h('path', { d: 'M8 12l4-4H4l4 4z' })
    ])
  }
}

const chatStore = useChatStore()
const message = useMessage()

// 状态
const showDetails = ref(false)
const isReconnecting = ref(false)
const connectionStatus = ref({
  isConnected: false,
  status: 'disconnected',
  message: '未连接',
  namespace: '',
  reconnectAttempts: 0,
  lastConnectedTime: 0,
  lastDisconnectReason: '',
  pendingMessagesCount: 0
})

// 定时器
let statusUpdateTimer: number | null = null

// 计算属性
const statusClass = computed(() => {
  switch (connectionStatus.value.status) {
    case 'connected':
      return 'connected'
    case 'disconnected':
      return 'disconnected'
    case 'connecting':
      return 'connecting'
    case 'not_initialized':
      return 'error'
    default:
      return 'unknown'
  }
})

const statusText = computed(() => {
  switch (connectionStatus.value.status) {
    case 'connected':
      return '已连接'
    case 'disconnected':
      return '已断开'
    case 'connecting':
      return '连接中'
    case 'not_initialized':
      return '未初始化'
    default:
      return '未知状态'
  }
})

const statusMessage = computed(() => {
  return connectionStatus.value.message || statusText.value
})

// 方法
const toggleDetails = () => {
  showDetails.value = !showDetails.value
}

const updateStatus = () => {
  const status = chatStore.getDetailedConnectionStatus()
  connectionStatus.value = { ...status }
}

const handleReconnect = async () => {
  if (isReconnecting.value) return
  
  isReconnecting.value = true
  try {
    message.info('正在重新连接...')
    chatStore.forceReconnect()
    
    // 等待一段时间后检查连接状态
    setTimeout(() => {
      updateStatus()
      if (connectionStatus.value.isConnected) {
        message.success('重连成功')
      } else {
        message.warning('重连可能需要更多时间，请稍候')
      }
      isReconnecting.value = false
    }, 3000)
  } catch (error) {
    console.error('重连失败:', error)
    message.error('重连失败')
    isReconnecting.value = false
  }
}

const handleRefresh = () => {
  updateStatus()
  message.info('状态已刷新')
}

const handleClearPending = () => {
  chatStore.clearPendingMessages()
  updateStatus()
  message.success('已清理待发送消息')
}

const formatTime = (timestamp: number) => {
  if (!timestamp) return 'N/A'
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 生命周期
onMounted(() => {
  updateStatus()
  // 每5秒更新一次状态
  statusUpdateTimer = window.setInterval(updateStatus, 5000)
})

onUnmounted(() => {
  if (statusUpdateTimer) {
    clearInterval(statusUpdateTimer)
  }
})
</script>

<style scoped>
.socket-status-monitor {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  background: var(--n-color);
  border: 1px solid var(--n-border-color);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  max-width: 300px;
}

.status-indicator {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

.status-indicator:hover {
  background: var(--n-color-hover);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
  transition: background-color 0.3s;
}

.status-dot.connected {
  background: #52c41a;
  box-shadow: 0 0 4px rgba(82, 196, 26, 0.5);
}

.status-dot.disconnected {
  background: #ff4d4f;
  box-shadow: 0 0 4px rgba(255, 77, 79, 0.5);
}

.status-dot.connecting {
  background: #faad14;
  box-shadow: 0 0 4px rgba(250, 173, 20, 0.5);
  animation: pulse 1.5s infinite;
}

.status-dot.error {
  background: #722ed1;
  box-shadow: 0 0 4px rgba(114, 46, 209, 0.5);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.status-text {
  flex: 1;
  font-size: 12px;
  font-weight: 500;
}

.status-text.connected {
  color: #52c41a;
}

.status-text.disconnected {
  color: #ff4d4f;
}

.status-text.connecting {
  color: #faad14;
}

.status-text.error {
  color: #722ed1;
}

.expand-icon {
  width: 14px;
  height: 14px;
  color: var(--n-text-color-3);
  transition: transform 0.2s;
}

.status-details {
  border-top: 1px solid var(--n-border-color);
  padding: 12px;
  background: var(--n-color-hover);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: 12px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.label {
  color: var(--n-text-color-2);
  font-weight: 500;
}

.value {
  color: var(--n-text-color-1);
  font-family: 'Monaco', 'Menlo', monospace;
}

.value.connected {
  color: #52c41a;
}

.value.disconnected {
  color: #ff4d4f;
}

.value.warning {
  color: #faad14;
  font-weight: 600;
}

.actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.actions .n-button {
  flex: 1;
  min-width: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .socket-status-monitor {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
  
  .actions {
    flex-direction: column;
  }
  
  .actions .n-button {
    flex: none;
  }
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
  .socket-status-monitor {
    background: #1a1a1a;
    border-color: #333;
  }
  
  .status-details {
    background: #2a2a2a;
  }
}
</style>
