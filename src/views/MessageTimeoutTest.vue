<template>
  <div class="message-timeout-test">
    <n-card title="消息超时测试" :bordered="false">
      <n-space vertical size="large">
        <!-- 连接状态 -->
        <div>
          <n-space>
            <n-button 
              type="primary" 
              @click="connectChat"
              :disabled="isConnected"
            >
              连接聊天室
            </n-button>
            <n-button @click="disconnectChat" :disabled="!isConnected">
              断开连接
            </n-button>
            <n-tag :type="isConnected ? 'success' : 'error'">
              {{ isConnected ? '已连接' : '未连接' }}
            </n-tag>
          </n-space>
        </div>

        <!-- 发送测试 -->
        <div>
          <n-space vertical>
            <n-input 
              v-model:value="testMessage" 
              placeholder="测试消息" 
              style="width: 400px;"
              @keyup.enter="sendMessage"
            />
            <n-space>
              <n-button 
                type="primary" 
                @click="sendMessage"
                :disabled="!isConnected"
              >
                发送消息
              </n-button>
              <n-button 
                @click="sendMultipleMessages"
                :disabled="!isConnected"
              >
                发送5条消息
              </n-button>
              <n-button @click="clearMessages">
                清空消息
              </n-button>
            </n-space>
          </n-space>
        </div>

        <!-- 超时统计 -->
        <div>
          <n-space>
            <n-statistic label="发送中" :value="sendingCount" />
            <n-statistic label="已确认" :value="confirmedCount" />
            <n-statistic label="超时失败" :value="timeoutCount" />
            <n-statistic label="总消息" :value="messages.length" />
          </n-space>
        </div>

        <!-- 消息列表 -->
        <div>
          <n-text strong>消息列表：</n-text>
          <n-card size="small" style="margin-top: 8px; max-height: 400px; overflow-y: auto;">
            <div v-if="messages.length === 0" style="text-align: center; color: #999;">
              暂无消息
            </div>
            <div v-else>
              <div 
                v-for="message in sortedMessages" 
                :key="message.id"
                class="timeout-message-item"
                :class="message.status"
              >
                <div class="message-header">
                  <span class="message-id">{{ message.id.substring(0, 20) }}...</span>
                  <span class="temp-id" v-if="message.tempId">{{ message.tempId.substring(0, 15) }}...</span>
                  <n-tag 
                    :type="getStatusColor(message.status)" 
                    size="small"
                  >
                    {{ getStatusText(message.status) }}
                  </n-tag>
                  <span class="message-time">{{ formatTime(message.timestamp) }}</span>
                </div>
                <div class="message-content">{{ message.content }}</div>
                <!-- 超时倒计时 -->
                <div v-if="message.status === 'sending'" class="timeout-countdown">
                  <n-progress 
                    type="line" 
                    :percentage="getTimeoutProgress(message.timestamp)" 
                    :color="getProgressColor(getTimeoutProgress(message.timestamp))"
                    :show-indicator="false"
                    style="width: 200px;"
                  />
                  <span class="countdown-text">{{ getCountdownText(message.timestamp) }}</span>
                </div>
              </div>
            </div>
          </n-card>
        </div>
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useChatStore } from '@/stores/chat'
import { useMessage } from 'naive-ui'

const chatStore = useChatStore()
const { messages, sortedMessages, isConnected } = storeToRefs(chatStore)
const message = useMessage()

const testMessage = ref('测试消息超时机制')
const currentTime = ref(Date.now())
let timeUpdateInterval: number | null = null

// 统计数据
const sendingCount = computed(() => 
  messages.value.filter(m => m.status === 'sending').length
)

const confirmedCount = computed(() => 
  messages.value.filter(m => m.status === 'sent' || m.status === 'delivered').length
)

const timeoutCount = computed(() => 
  messages.value.filter(m => m.status === 'error').length
)

// 连接聊天室
const connectChat = async () => {
  try {
    await chatStore.connect('default')
    message.success('连接成功')
  } catch (error) {
    message.error('连接失败')
  }
}

// 断开连接
const disconnectChat = () => {
  chatStore.disconnect()
  message.info('已断开连接')
}

// 发送消息
const sendMessage = async () => {
  if (!testMessage.value.trim()) {
    message.error('请输入消息内容')
    return
  }

  try {
    await chatStore.sendMessage(testMessage.value)
    testMessage.value = `测试消息 ${new Date().toLocaleTimeString()}`
  } catch (error) {
    message.error('发送失败')
  }
}

// 发送多条消息
const sendMultipleMessages = async () => {
  for (let i = 1; i <= 5; i++) {
    try {
      await chatStore.sendMessage(`批量测试消息 ${i}/5 - ${new Date().toLocaleTimeString()}`)
      // 间隔100ms发送
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (error) {
      console.error(`发送第${i}条消息失败:`, error)
    }
  }
}

// 清空消息
const clearMessages = () => {
  chatStore.clearMessages()
}

// 获取超时进度 (0-100)
const getTimeoutProgress = (timestamp: string) => {
  const messageTime = new Date(timestamp).getTime()
  const elapsed = currentTime.value - messageTime
  const progress = Math.min((elapsed / 10000) * 100, 100) // 10秒 = 100%
  return progress
}

// 获取进度条颜色
const getProgressColor = (progress: number) => {
  if (progress < 50) return '#52c41a' // 绿色
  if (progress < 80) return '#faad14' // 黄色
  return '#ff4d4f' // 红色
}

// 获取倒计时文本
const getCountdownText = (timestamp: string) => {
  const messageTime = new Date(timestamp).getTime()
  const elapsed = currentTime.value - messageTime
  const remaining = Math.max(10000 - elapsed, 0) // 10秒倒计时
  return `${Math.ceil(remaining / 1000)}s`
}

// 获取状态颜色
const getStatusColor = (status?: string) => {
  switch (status) {
    case 'sending': return 'warning'
    case 'sent': return 'info'
    case 'delivered': return 'success'
    case 'error': return 'error'
    default: return 'default'
  }
}

// 获取状态文本
const getStatusText = (status?: string) => {
  switch (status) {
    case 'sending': return '发送中'
    case 'sent': return '已确认'
    case 'delivered': return '已送达'
    case 'error': return '超时失败'
    default: return '未知'
  }
}

// 格式化时间
const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString()
}

// 启动时间更新
onMounted(() => {
  timeUpdateInterval = window.setInterval(() => {
    currentTime.value = Date.now()
  }, 100) // 每100ms更新一次
})

// 清理定时器
onUnmounted(() => {
  if (timeUpdateInterval) {
    clearInterval(timeUpdateInterval)
  }
})
</script>

<style scoped lang="scss">
.message-timeout-test {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.timeout-message-item {
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  border: 1px solid var(--border-primary);
  transition: all 0.3s ease;

  &.sending {
    background-color: rgba(250, 173, 20, 0.1);
    border-color: #faad14;
  }

  &.sent {
    background-color: rgba(24, 144, 255, 0.1);
    border-color: #1890ff;
  }

  &.delivered {
    background-color: rgba(82, 196, 26, 0.1);
    border-color: #52c41a;
  }

  &.error {
    background-color: rgba(255, 77, 79, 0.1);
    border-color: #ff4d4f;
  }

  .message-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
    font-size: 12px;

    .message-id {
      font-weight: 600;
      color: var(--color-primary);
      font-family: monospace;
    }

    .temp-id {
      color: var(--text-tertiary);
      font-family: monospace;
    }

    .message-time {
      color: var(--text-tertiary);
      margin-left: auto;
    }
  }

  .message-content {
    font-size: 14px;
    line-height: 1.5;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  .timeout-countdown {
    display: flex;
    align-items: center;
    gap: 12px;

    .countdown-text {
      font-size: 12px;
      font-weight: 600;
      color: var(--color-warning);
      min-width: 30px;
    }
  }
}
</style>
