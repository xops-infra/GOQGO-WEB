<template>
  <div class="websocket-auth-test">
    <n-card title="WebSocket认证测试" :bordered="false">
      <n-space vertical size="large">
        <!-- 认证状态 -->
        <div>
          <n-text strong>认证状态：</n-text>
          <n-space style="margin-top: 8px;">
            <n-statistic label="登录状态" :value="userStore.isAuthenticated ? '已登录' : '未登录'" />
            <n-statistic label="Token状态" :value="hasToken ? '有Token' : '无Token'" />
            <n-statistic label="Token长度" :value="tokenLength" />
          </n-space>
        </div>

        <!-- WebSocket连接测试 -->
        <div>
          <n-text strong>WebSocket连接测试：</n-text>
          <n-space style="margin-top: 8px;">
            <n-button @click="testChatWebSocket" :loading="isLoading" type="primary">
              测试聊天WebSocket
            </n-button>
            <n-button @click="testLogWebSocket" :loading="isLoading" type="info">
              测试日志WebSocket
            </n-button>
            <n-button @click="disconnectAll" :disabled="!hasActiveConnections">
              断开所有连接
            </n-button>
            <n-button @click="clearLogs" :disabled="testLogs.length === 0">
              清除日志
            </n-button>
          </n-space>
        </div>

        <!-- 连接状态 -->
        <div>
          <n-text strong>连接状态：</n-text>
          <n-space style="margin-top: 8px;">
            <n-tag :type="chatConnected ? 'success' : 'default'" size="small">
              聊天WebSocket: {{ chatConnected ? '已连接' : '未连接' }}
            </n-tag>
            <n-tag :type="logConnected ? 'success' : 'default'" size="small">
              日志WebSocket: {{ logConnected ? '已连接' : '未连接' }}
            </n-tag>
          </n-space>
        </div>

        <!-- 测试日志 -->
        <div>
          <n-text strong>测试日志：</n-text>
          <n-card size="small" style="margin-top: 8px; max-height: 400px; overflow-y: auto;">
            <div v-if="testLogs.length === 0" style="text-align: center; color: #999; padding: 20px;">
              暂无测试日志
            </div>
            <div v-else>
              <div 
                v-for="(log, index) in testLogs" 
                :key="index"
                class="log-item"
                :class="log.type"
              >
                <div class="log-header">
                  <span class="log-time">{{ log.time }}</span>
                  <span class="log-type">{{ log.type.toUpperCase() }}</span>
                  <span class="log-source">{{ log.source }}</span>
                </div>
                <div class="log-message">{{ log.message }}</div>
                <div v-if="log.details" class="log-details">
                  <pre>{{ JSON.stringify(log.details, null, 2) }}</pre>
                </div>
              </div>
            </div>
          </n-card>
        </div>

        <!-- WebSocket URL格式说明 -->
        <div>
          <n-text strong>WebSocket URL格式：</n-text>
          <n-card size="small" style="margin-top: 8px;">
            <div class="url-examples">
              <div class="url-example">
                <h4>聊天WebSocket:</h4>
                <pre>ws://localhost:8080/ws/namespaces/default/chat?token=$BEARER_TOKEN</pre>
              </div>
              <div class="url-example">
                <h4>日志WebSocket:</h4>
                <pre>ws://localhost:8080/ws/namespaces/default/agents/agent-name/logs?token=$BEARER_TOKEN&lines=100&follow=true</pre>
              </div>
              <div class="url-example">
                <h4>认证错误示例:</h4>
                <pre>{{ JSON.stringify(authErrorExample, null, 2) }}</pre>
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
import { useUserStore } from '@/stores/user'
import { useMessage } from 'naive-ui'
import { ChatSocket } from '@/utils/chatSocket'
import { LogSocket } from '@/utils/logSocket'

const userStore = useUserStore()
const message = useMessage()
const isLoading = ref(false)

// WebSocket实例
let chatSocket: ChatSocket | null = null
let logSocket: LogSocket | null = null

// 连接状态
const chatConnected = ref(false)
const logConnected = ref(false)

// 测试日志
const testLogs = ref<Array<{
  time: string
  type: 'info' | 'success' | 'error' | 'warning'
  source: string
  message: string
  details?: any
}>>([])

// Token相关计算属性
const hasToken = computed(() => !!userStore.token)
const tokenLength = computed(() => userStore.token?.length || 0)
const hasActiveConnections = computed(() => chatConnected.value || logConnected.value)

// 认证错误示例
const authErrorExample = {
  error: "unauthorized",
  message: "Invalid or missing token"
}

// 添加日志
const addLog = (type: 'info' | 'success' | 'error' | 'warning', source: string, message: string, details?: any) => {
  testLogs.value.unshift({
    time: new Date().toLocaleTimeString(),
    type,
    source,
    message,
    details
  })
  
  // 限制日志数量
  if (testLogs.value.length > 50) {
    testLogs.value = testLogs.value.slice(0, 50)
  }
}

// 测试聊天WebSocket
const testChatWebSocket = async () => {
  isLoading.value = true
  addLog('info', 'Chat WebSocket', '开始测试聊天WebSocket连接')
  
  try {
    // 断开现有连接
    if (chatSocket) {
      chatSocket.disconnect()
    }
    
    // 创建新连接
    chatSocket = new ChatSocket()
    
    // 设置回调
    chatSocket.connect('default', {
      onStatus: (connected) => {
        chatConnected.value = connected
        if (connected) {
          addLog('success', 'Chat WebSocket', '聊天WebSocket连接成功')
          message.success('聊天WebSocket连接成功')
        } else {
          addLog('warning', 'Chat WebSocket', '聊天WebSocket连接断开')
        }
      },
      onError: (error) => {
        addLog('error', 'Chat WebSocket', `连接错误: ${error.message || error}`, error)
        message.error(`聊天WebSocket连接失败: ${error.message || error}`)
      },
      onMessage: (message) => {
        addLog('info', 'Chat WebSocket', `收到消息: ${message.content}`, message)
      },
      onHistoryLoaded: (messages) => {
        addLog('info', 'Chat WebSocket', `加载历史消息: ${messages.length} 条`, { count: messages.length })
      }
    })
    
  } catch (error: any) {
    addLog('error', 'Chat WebSocket', `测试失败: ${error.message}`, error)
    message.error(`聊天WebSocket测试失败: ${error.message}`)
  } finally {
    isLoading.value = false
  }
}

// 测试日志WebSocket
const testLogWebSocket = async () => {
  isLoading.value = true
  addLog('info', 'Log WebSocket', '开始测试日志WebSocket连接')
  
  try {
    // 断开现有连接
    if (logSocket) {
      logSocket.disconnect()
    }
    
    // 创建新连接（使用测试agent）
    logSocket = new LogSocket('default', 'test-agent', { lines: 10, follow: true }, {
      onConnect: () => {
        logConnected.value = true
        addLog('success', 'Log WebSocket', '日志WebSocket连接成功')
        message.success('日志WebSocket连接成功')
      },
      onDisconnect: () => {
        logConnected.value = false
        addLog('warning', 'Log WebSocket', '日志WebSocket连接断开')
      },
      onError: (error) => {
        addLog('error', 'Log WebSocket', `连接错误: ${error}`, { error })
        message.error(`日志WebSocket连接失败: ${error}`)
      },
      onInitial: (logs) => {
        addLog('info', 'Log WebSocket', `收到初始日志: ${logs.length} 条`, { count: logs.length })
      },
      onAppend: (log) => {
        addLog('info', 'Log WebSocket', `收到新日志: ${log.message}`, log)
      }
    })
    
    // 尝试连接
    await logSocket.connect()
    
  } catch (error: any) {
    addLog('error', 'Log WebSocket', `测试失败: ${error.message}`, error)
    message.error(`日志WebSocket测试失败: ${error.message}`)
  } finally {
    isLoading.value = false
  }
}

// 断开所有连接
const disconnectAll = () => {
  if (chatSocket) {
    chatSocket.disconnect()
    chatSocket = null
    chatConnected.value = false
    addLog('info', 'Chat WebSocket', '已断开聊天WebSocket连接')
  }
  
  if (logSocket) {
    logSocket.disconnect()
    logSocket = null
    logConnected.value = false
    addLog('info', 'Log WebSocket', '已断开日志WebSocket连接')
  }
  
  message.success('已断开所有WebSocket连接')
}

// 清除日志
const clearLogs = () => {
  testLogs.value = []
  addLog('info', 'System', '已清除所有测试日志')
}

// 组件卸载时清理连接
import { onUnmounted } from 'vue'
onUnmounted(() => {
  disconnectAll()
})
</script>

<style scoped lang="scss">
.websocket-auth-test {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.log-item {
  padding: 12px 0;
  border-bottom: 1px solid var(--border-secondary);
  
  &:last-child {
    border-bottom: none;
  }
  
  .log-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 4px;
    
    .log-time {
      color: var(--text-tertiary);
      font-size: 11px;
      font-family: monospace;
      min-width: 80px;
    }
    
    .log-type {
      font-size: 11px;
      font-weight: bold;
      font-family: monospace;
      min-width: 60px;
    }
    
    .log-source {
      font-size: 12px;
      font-weight: 500;
      color: var(--text-secondary);
      min-width: 120px;
    }
  }
  
  .log-message {
    color: var(--text-primary);
    font-size: 13px;
    margin-bottom: 8px;
  }
  
  .log-details {
    background: var(--bg-tertiary);
    border-radius: 4px;
    padding: 8px;
    margin-top: 8px;
    
    pre {
      margin: 0;
      font-size: 11px;
      line-height: 1.4;
      color: var(--text-secondary);
      max-height: 200px;
      overflow-y: auto;
    }
  }
  
  &.info .log-type {
    color: var(--color-info);
  }
  
  &.success .log-type {
    color: var(--color-success);
  }
  
  &.error .log-type {
    color: var(--color-error);
  }
  
  &.warning .log-type {
    color: var(--color-warning);
  }
}

.url-examples {
  display: grid;
  gap: 16px;
  
  .url-example {
    h4 {
      margin: 0 0 8px 0;
      color: var(--text-primary);
      font-size: 14px;
    }
    
    pre {
      background: var(--bg-tertiary);
      padding: 12px;
      border-radius: 6px;
      font-size: 11px;
      line-height: 1.4;
      overflow-x: auto;
      margin: 0;
      color: var(--text-primary);
      border: 1px solid var(--border-primary);
      word-break: break-all;
    }
  }
}

@media (min-width: 768px) {
  .url-examples {
    grid-template-columns: 1fr;
  }
}
</style>
