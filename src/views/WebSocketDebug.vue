<template>
  <div class="websocket-debug">
    <n-card title="WebSocket 消息调试" :bordered="false">
      <n-space vertical size="large">
        <!-- 连接控制 -->
        <div>
          <n-space>
            <n-input v-model:value="namespace" placeholder="命名空间" style="width: 150px" />
            <n-input v-model:value="username" placeholder="用户名" style="width: 150px" />
            <n-button type="primary" @click="connect" :disabled="isConnected"> 连接 </n-button>
            <n-button @click="disconnect" :disabled="!isConnected"> 断开 </n-button>
            <n-tag :type="isConnected ? 'success' : 'error'">
              {{ isConnected ? '已连接' : '未连接' }}
            </n-tag>
          </n-space>
        </div>

        <!-- 发送消息 -->
        <div>
          <n-space>
            <n-input
              v-model:value="testMessage"
              placeholder="测试消息"
              style="width: 300px"
              @keyup.enter="sendMessage"
            />
            <n-button type="primary" @click="sendMessage" :disabled="!isConnected">
              发送消息
            </n-button>
            <n-button @click="clearLogs">清空日志</n-button>
          </n-space>
        </div>

        <!-- 消息日志 -->
        <div>
          <n-text strong>WebSocket 消息日志：</n-text>
          <n-card size="small" style="margin-top: 8px">
            <div class="log-container">
              <div v-for="(log, index) in logs" :key="index" class="log-item" :class="log.type">
                <span class="timestamp">{{ log.timestamp }}</span>
                <span class="direction">{{ log.direction }}</span>
                <span class="message">{{ log.message }}</span>
              </div>
              <div v-if="logs.length === 0" class="no-logs">暂无消息日志</div>
            </div>
          </n-card>
        </div>
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useMessage } from 'naive-ui'

interface LogItem {
  timestamp: string
  direction: 'send' | 'receive' | 'system'
  type: 'info' | 'success' | 'warning' | 'error'
  message: string
}

const message = useMessage()
const namespace = ref('default')
const username = ref('xops')
const testMessage = ref('你好，这是测试消息')
const isConnected = ref(false)
const logs = ref<LogItem[]>([])

let ws: WebSocket | null = null

// 添加日志
const addLog = (direction: LogItem['direction'], type: LogItem['type'], msg: string) => {
  logs.value.push({
    timestamp: new Date().toLocaleTimeString(),
    direction,
    type,
    message: msg
  })

  // 限制日志数量
  if (logs.value.length > 100) {
    logs.value.shift()
  }
}

// 连接WebSocket
const connect = () => {
  if (ws) {
    ws.close()
  }

  // 获取token用于WebSocket认证
  const token = localStorage.getItem('goqgo_token')
  if (!token) {
    addLog('system', 'error', '未找到认证token，请先登录')
    message.error('未找到认证token，请先登录')
    return
  }

  const wsUrl = `ws://localhost:8080/ws/namespaces/${namespace.value}/chat?token=${token}`
  addLog('system', 'info', `连接到: ${wsUrl.replace(token, '***TOKEN***')}`)

  ws = new WebSocket(wsUrl)

  ws.onopen = () => {
    isConnected.value = true
    addLog('system', 'success', '连接成功')
    message.success('WebSocket连接成功')
  }

  ws.onclose = (event) => {
    isConnected.value = false
    addLog('system', 'warning', `连接关闭: ${event.code} ${event.reason}`)
    message.warning('WebSocket连接关闭')
  }

  ws.onerror = (error) => {
    addLog('system', 'error', `连接错误: ${error}`)
    message.error('WebSocket连接错误')
  }

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      addLog('receive', 'info', JSON.stringify(data, null, 2))

      // 特别标记不同类型的消息
      if (data.type === 'chat') {
        addLog('receive', 'success', `📨 收到聊天消息: ${data.data?.content || ''}`)
      } else if (data.type === 'message_confirm') {
        addLog('receive', 'success', `✅ 消息发送确认: ${data.data?.messageId || ''}`)
      } else if (data.type === 'error') {
        addLog('receive', 'error', `❌ 服务器错误: ${data.data?.error || data.data?.message || ''}`)
      } else if (data.type === 'user_join') {
        addLog('receive', 'info', `👤 用户加入: ${data.data?.username || data.data}`)
      } else if (data.type === 'user_leave') {
        addLog('receive', 'info', `👤 用户离开: ${data.data?.username || data.data}`)
      }
    } catch (error) {
      addLog('receive', 'error', `解析消息失败: ${event.data}`)
    }
  }
}

// 断开连接
const disconnect = () => {
  if (ws) {
    ws.close()
    ws = null
  }
  isConnected.value = false
  addLog('system', 'info', '主动断开连接')
}

// 发送消息
const sendMessage = () => {
  if (!ws || !isConnected.value) {
    message.error('WebSocket未连接')
    return
  }

  const messageData = {
    type: 'chat',
    data: {
      content: testMessage.value,
      type: 'text'
    }
  }

  try {
    ws.send(JSON.stringify(messageData))
    addLog('send', 'info', JSON.stringify(messageData, null, 2))
    addLog('send', 'success', `发送消息: ${testMessage.value}`)
    testMessage.value = ''
  } catch (error) {
    addLog('send', 'error', `发送失败: ${error}`)
    message.error('发送消息失败')
  }
}

// 清空日志
const clearLogs = () => {
  logs.value = []
}

// 组件卸载时断开连接
onUnmounted(() => {
  disconnect()
})
</script>

<style scoped lang="scss">
.websocket-debug {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.log-container {
  max-height: 500px;
  overflow-y: auto;
  font-family: 'JetBrains Mono', 'Consolas', monospace;
  font-size: 12px;
  line-height: 1.4;
}

.log-item {
  padding: 4px 8px;
  margin-bottom: 2px;
  border-radius: 4px;
  display: flex;
  gap: 12px;

  .timestamp {
    color: #666;
    min-width: 80px;
  }

  .direction {
    min-width: 60px;
    font-weight: 600;
  }

  .message {
    flex: 1;
    white-space: pre-wrap;
    word-break: break-all;
  }

  &.info {
    background-color: rgba(24, 144, 255, 0.1);

    .direction {
      color: #1890ff;
    }
  }

  &.success {
    background-color: rgba(82, 196, 26, 0.1);

    .direction {
      color: #52c41a;
    }
  }

  &.warning {
    background-color: rgba(250, 173, 20, 0.1);

    .direction {
      color: #faad14;
    }
  }

  &.error {
    background-color: rgba(255, 77, 79, 0.1);

    .direction {
      color: #ff4d4f;
    }
  }
}

.no-logs {
  text-align: center;
  color: #999;
  padding: 20px;
}
</style>
