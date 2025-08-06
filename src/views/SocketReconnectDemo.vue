<template>
  <div class="socket-reconnect-demo">
    <n-card title="Socket断线重连功能演示">
      <div class="demo-section">
        <h3>连接状态</h3>
        <div class="status-info">
          <n-tag :type="connectionStatus.isConnected ? 'success' : 'error'">
            {{ connectionStatus.isConnected ? '已连接' : '未连接' }}
          </n-tag>
          <span class="status-text">{{ connectionStatus.message }}</span>
        </div>
        
        <div class="connection-details" v-if="connectionInfo">
          <n-descriptions :column="2" size="small">
            <n-descriptions-item label="命名空间">
              {{ connectionInfo.namespace }}
            </n-descriptions-item>
            <n-descriptions-item label="重连次数">
              {{ connectionInfo.reconnectAttempts }}
            </n-descriptions-item>
            <n-descriptions-item label="最后连接时间">
              {{ formatTime(connectionInfo.lastConnectedTime) }}
            </n-descriptions-item>
            <n-descriptions-item label="待发送消息">
              {{ connectionInfo.pendingMessagesCount }}
            </n-descriptions-item>
          </n-descriptions>
        </div>
      </div>

      <div class="demo-section">
        <h3>操作测试</h3>
        <n-space>
          <n-button 
            type="primary" 
            @click="handleConnect"
            :disabled="connectionStatus.isConnected"
          >
            连接
          </n-button>
          
          <n-button 
            type="warning" 
            @click="handleDisconnect"
            :disabled="!connectionStatus.isConnected"
          >
            断开连接
          </n-button>
          
          <n-button 
            type="info" 
            @click="handleReconnect"
          >
            强制重连
          </n-button>
          
          <n-button 
            type="default" 
            @click="handleRefreshStatus"
          >
            刷新状态
          </n-button>
        </n-space>
      </div>

      <div class="demo-section">
        <h3>消息测试</h3>
        <n-input-group>
          <n-input 
            v-model:value="testMessage" 
            placeholder="输入测试消息"
            @keyup.enter="handleSendMessage"
          />
          <n-button 
            type="primary" 
            @click="handleSendMessage"
            :disabled="!connectionStatus.isConnected || !testMessage.trim()"
          >
            发送
          </n-button>
        </n-input-group>
        
        <div class="message-log" v-if="messages.length > 0">
          <h4>消息记录</h4>
          <div class="message-item" v-for="msg in messages" :key="msg.id">
            <n-tag size="small" :type="getMessageStatusType(msg.status)">
              {{ msg.status }}
            </n-tag>
            <span class="message-content">{{ msg.content }}</span>
            <span class="message-time">{{ formatTime(msg.timestamp) }}</span>
          </div>
        </div>
      </div>

      <div class="demo-section">
        <h3>页面刷新测试</h3>
        <n-alert type="info">
          <template #header>测试说明</template>
          <p>1. 连接到聊天室并发送一些消息</p>
          <p>2. 刷新页面 (F5 或 Ctrl+R)</p>
          <p>3. 观察页面是否显示恢复提示</p>
          <p>4. 点击"恢复连接"测试状态恢复功能</p>
        </n-alert>
        
        <n-space style="margin-top: 12px;">
          <n-button @click="handleSaveState">
            手动保存状态
          </n-button>
          
          <n-button @click="handleClearState">
            清理保存状态
          </n-button>
          
          <n-button @click="handleCheckState">
            检查保存状态
          </n-button>
        </n-space>
        
        <div v-if="savedStateInfo" class="saved-state-info">
          <h4>保存的状态信息</h4>
          <n-descriptions :column="1" size="small">
            <n-descriptions-item label="命名空间">
              {{ savedStateInfo.namespace }}
            </n-descriptions-item>
            <n-descriptions-item label="保存时间">
              {{ savedStateInfo.ageText }}
            </n-descriptions-item>
            <n-descriptions-item label="消息数量">
              {{ savedStateInfo.messagesCount }}
            </n-descriptions-item>
            <n-descriptions-item label="是否过期">
              <n-tag :type="savedStateInfo.isExpired ? 'error' : 'success'">
                {{ savedStateInfo.isExpired ? '已过期' : '有效' }}
              </n-tag>
            </n-descriptions-item>
          </n-descriptions>
        </div>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { 
  NCard, NTag, NDescriptions, NDescriptionsItem, NSpace, NButton, 
  NInputGroup, NInput, NAlert, useMessage 
} from 'naive-ui'
import { useChatStore } from '@/stores/chat'
import { pageRefreshHandler } from '@/utils/pageRefreshHandler'

const chatStore = useChatStore()
const message = useMessage()

// 状态
const testMessage = ref('')
const messages = ref<any[]>([])
const connectionStatus = ref({
  isConnected: false,
  message: '未连接'
})
const connectionInfo = ref<any>(null)
const savedStateInfo = ref<any>(null)

// 定时器
let statusTimer: number | null = null

// 方法
const updateStatus = () => {
  connectionStatus.value = chatStore.getDetailedConnectionStatus()
  connectionInfo.value = chatStore.getConnectionInfo()
}

const handleConnect = async () => {
  try {
    await chatStore.connect('demo')
    message.success('连接成功')
    updateStatus()
  } catch (error) {
    message.error('连接失败')
    console.error('连接失败:', error)
  }
}

const handleDisconnect = () => {
  chatStore.disconnect()
  message.info('已断开连接')
  updateStatus()
}

const handleReconnect = () => {
  chatStore.forceReconnect()
  message.info('正在重连...')
  updateStatus()
}

const handleRefreshStatus = () => {
  updateStatus()
  message.success('状态已刷新')
}

const handleSendMessage = async () => {
  if (!testMessage.value.trim()) return
  
  try {
    const newMessage = await chatStore.sendChatMessage(testMessage.value)
    
    // 添加到本地消息记录
    messages.value.push({
      id: newMessage.id,
      content: testMessage.value,
      status: 'sent',
      timestamp: Date.now()
    })
    
    testMessage.value = ''
    message.success('消息发送成功')
  } catch (error: any) {
    console.error('发送消息失败:', error)
    message.error(`发送失败: ${error.message}`)
  }
}

const handleSaveState = () => {
  pageRefreshHandler.savePageState()
  message.success('状态已保存')
  handleCheckState()
}

const handleClearState = () => {
  pageRefreshHandler.clearPageState()
  savedStateInfo.value = null
  message.success('状态已清理')
}

const handleCheckState = () => {
  savedStateInfo.value = pageRefreshHandler.getSavedStateInfo()
  if (savedStateInfo.value) {
    message.info('找到保存的状态')
  } else {
    message.warning('没有保存的状态')
  }
}

const getMessageStatusType = (status: string) => {
  switch (status) {
    case 'sent': return 'success'
    case 'sending': return 'warning'
    case 'error': return 'error'
    default: return 'default'
  }
}

const formatTime = (timestamp: number) => {
  if (!timestamp) return 'N/A'
  return new Date(timestamp).toLocaleTimeString('zh-CN')
}

// 生命周期
onMounted(() => {
  updateStatus()
  handleCheckState()
  
  // 每2秒更新一次状态
  statusTimer = window.setInterval(updateStatus, 2000)
})

onUnmounted(() => {
  if (statusTimer) {
    clearInterval(statusTimer)
  }
})
</script>

<style scoped>
.socket-reconnect-demo {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.demo-section {
  margin-bottom: 24px;
}

.demo-section h3 {
  margin: 0 0 12px 0;
  color: var(--n-text-color-1);
  font-size: 16px;
  font-weight: 600;
}

.demo-section h4 {
  margin: 12px 0 8px 0;
  color: var(--n-text-color-2);
  font-size: 14px;
  font-weight: 500;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.status-text {
  color: var(--n-text-color-2);
  font-size: 14px;
}

.connection-details {
  margin-top: 12px;
}

.message-log {
  margin-top: 16px;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--n-border-color);
  border-radius: 6px;
  padding: 8px;
}

.message-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  border-bottom: 1px solid var(--n-border-color);
  font-size: 12px;
}

.message-item:last-child {
  border-bottom: none;
}

.message-content {
  flex: 1;
  color: var(--n-text-color-1);
}

.message-time {
  color: var(--n-text-color-3);
  font-family: monospace;
}

.saved-state-info {
  margin-top: 12px;
  padding: 12px;
  background: var(--n-color-hover);
  border-radius: 6px;
}
</style>
