<template>
  <div class="message-confirm-debug">
    <n-card title="消息确认调试" :bordered="false">
      <n-space vertical size="large">
        <!-- 连接状态 -->
        <div>
          <n-space>
            <n-button type="primary" @click="connectChat" :disabled="isConnected">
              连接聊天室
            </n-button>
            <n-button @click="disconnectChat" :disabled="!isConnected"> 断开连接 </n-button>
            <n-tag :type="isConnected ? 'success' : 'error'">
              {{ isConnected ? '已连接' : '未连接' }}
            </n-tag>
          </n-space>
        </div>

        <!-- 发送测试 -->
        <div>
          <n-space>
            <n-input
              v-model:value="testMessage"
              placeholder="测试消息"
              style="width: 300px"
              @keyup.enter="sendTestMessage"
            />
            <n-button type="primary" @click="sendTestMessage" :disabled="!isConnected">
              发送消息
            </n-button>
          </n-space>
        </div>

        <!-- 消息列表 -->
        <div>
          <n-text strong>消息列表：</n-text>
          <n-card size="small" style="margin-top: 8px">
            <div v-if="messages.length === 0" style="text-align: center; color: #999">暂无消息</div>
            <div v-else>
              <div
                v-for="message in sortedMessages"
                :key="message.id"
                class="debug-message-item"
                :class="message.status"
              >
                <div class="message-info">
                  <div><strong>ID:</strong> {{ message.id }}</div>
                  <div><strong>TempID:</strong> {{ message.tempId || '无' }}</div>
                  <div><strong>状态:</strong> {{ message.status }}</div>
                  <div><strong>内容:</strong> {{ message.content }}</div>
                  <div><strong>时间:</strong> {{ formatTime(message.timestamp) }}</div>
                </div>
              </div>
            </div>
          </n-card>
        </div>

        <!-- 调试日志 -->
        <div>
          <n-text strong>调试日志：</n-text>
          <n-card size="small" style="margin-top: 8px; max-height: 300px; overflow-y: auto">
            <div class="debug-logs">
              <div v-for="(log, index) in debugLogs" :key="index" class="debug-log-item">
                <span class="log-time">{{ log.time }}</span>
                <span class="log-message">{{ log.message }}</span>
              </div>
            </div>
          </n-card>
        </div>
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useChatStore } from '@/stores/chat'
import { useMessage } from 'naive-ui'

const chatStore = useChatStore()
const { messages, sortedMessages, isConnected } = storeToRefs(chatStore)
const message = useMessage()

const testMessage = ref('测试消息确认')
const debugLogs = ref<Array<{ time: string; message: string }>>([])

// 添加调试日志
const addDebugLog = (msg: string) => {
  debugLogs.value.push({
    time: new Date().toLocaleTimeString(),
    message: msg
  })

  // 限制日志数量
  if (debugLogs.value.length > 50) {
    debugLogs.value.shift()
  }
}

// 连接聊天室
const connectChat = async () => {
  try {
    addDebugLog('开始连接聊天室...')
    await chatStore.connect('default')
    addDebugLog('聊天室连接成功')
    message.success('连接成功')
  } catch (error) {
    addDebugLog(`连接失败: ${error}`)
    message.error('连接失败')
  }
}

// 断开连接
const disconnectChat = () => {
  chatStore.disconnect()
  addDebugLog('断开聊天室连接')
  message.info('已断开连接')
}

// 发送测试消息
const sendTestMessage = async () => {
  if (!testMessage.value.trim()) {
    message.error('请输入消息内容')
    return
  }

  try {
    addDebugLog(`准备发送消息: ${testMessage.value}`)
    await chatStore.sendMessage(testMessage.value)
    addDebugLog('消息发送请求完成')
    testMessage.value = ''
  } catch (error) {
    addDebugLog(`发送失败: ${error}`)
    message.error('发送失败')
  }
}

// 格式化时间
const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString()
}

// 监听控制台日志（如果可能的话）
const originalConsoleLog = console.log
const originalConsoleWarn = console.warn
const originalConsoleError = console.error

console.log = (...args) => {
  const message = args.join(' ')
  if (message.includes('消息') || message.includes('确认') || message.includes('tempId')) {
    addDebugLog(`[LOG] ${message}`)
  }
  originalConsoleLog.apply(console, args)
}

console.warn = (...args) => {
  const message = args.join(' ')
  if (message.includes('消息') || message.includes('确认') || message.includes('tempId')) {
    addDebugLog(`[WARN] ${message}`)
  }
  originalConsoleWarn.apply(console, args)
}

console.error = (...args) => {
  const message = args.join(' ')
  if (message.includes('消息') || message.includes('确认') || message.includes('tempId')) {
    addDebugLog(`[ERROR] ${message}`)
  }
  originalConsoleError.apply(console, args)
}
</script>

<style scoped lang="scss">
.message-confirm-debug {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.debug-message-item {
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  border: 1px solid var(--border-primary);
  font-family: monospace;
  font-size: 12px;

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

  .message-info {
    div {
      margin-bottom: 4px;

      strong {
        display: inline-block;
        width: 60px;
        color: var(--color-primary);
      }
    }
  }
}

.debug-logs {
  font-family: monospace;
  font-size: 11px;
  line-height: 1.4;
}

.debug-log-item {
  padding: 2px 0;
  border-bottom: 1px solid var(--border-secondary);

  .log-time {
    color: #666;
    margin-right: 8px;
  }

  .log-message {
    color: var(--text-primary);
  }
}
</style>
