<template>
  <div class="chat-debugger">
    <n-card title="聊天室WebSocket调试工具" :bordered="false">
      <n-space vertical size="large">
        <!-- 连接状态 -->
        <div class="connection-status">
          <n-space align="center">
            <n-tag :type="isConnected ? 'success' : 'error'">
              {{ isConnected ? '已连接' : '未连接' }}
            </n-tag>
            <span class="status-text">
              {{ connectionInfo.wsUrl }}
            </span>
          </n-space>
        </div>

        <!-- 连接配置 -->
        <n-space>
          <n-input
            v-model:value="namespace"
            placeholder="命名空间"
            style="width: 150px"
          />
          <n-input
            v-model:value="chatName"
            placeholder="聊天室名称"
            style="width: 150px"
          />
          <n-input
            v-model:value="username"
            placeholder="用户名"
            style="width: 150px"
          />
          <n-button
            type="primary"
            :loading="connecting"
            @click="handleConnect"
          >
            {{ isConnected ? '重新连接' : '连接' }}
          </n-button>
          <n-button
            type="error"
            :disabled="!isConnected"
            @click="handleDisconnect"
          >
            断开连接
          </n-button>
        </n-space>

        <!-- 消息发送测试 -->
        <n-space>
          <n-input
            v-model:value="testMessage"
            placeholder="测试消息内容"
            style="width: 300px"
            @keyup.enter="sendTestMessage"
          />
          <n-button
            type="primary"
            :disabled="!isConnected"
            @click="sendTestMessage"
          >
            发送消息
          </n-button>
          <n-button
            type="info"
            :disabled="!isConnected"
            @click="requestHistory"
          >
            请求历史
          </n-button>
        </n-space>

        <!-- 实时日志 -->
        <div class="debug-logs">
          <div class="logs-header">
            <span>实时日志</span>
            <n-button size="small" @click="clearLogs">清空日志</n-button>
          </div>
          <div class="logs-content" ref="logsContainer">
            <div
              v-for="(log, index) in logs"
              :key="index"
              :class="['log-item', `log-${log.type}`]"
            >
              <span class="log-time">{{ log.time }}</span>
              <span class="log-type">{{ log.type.toUpperCase() }}</span>
              <span class="log-message">{{ log.message }}</span>
              <pre v-if="log.data" class="log-data">{{ JSON.stringify(log.data, null, 2) }}</pre>
            </div>
          </div>
        </div>

        <!-- 消息列表 -->
        <div class="messages-section">
          <div class="section-header">
            <span>收到的消息 ({{ messages.length }})</span>
            <n-button size="small" @click="clearMessages">清空消息</n-button>
          </div>
          <div class="messages-list">
            <div
              v-for="message in messages"
              :key="message.id"
              class="message-debug-item"
            >
              <div class="message-header">
                <span class="message-sender">{{ message.senderId }}</span>
                <span class="message-time">{{ formatTime(message.timestamp) }}</span>
                <span class="message-type">{{ message.type }}</span>
              </div>
              <div class="message-content">{{ message.content }}</div>
            </div>
          </div>
        </div>

        <!-- 在线用户 -->
        <div class="users-section">
          <div class="section-header">
            <span>在线用户 ({{ onlineUsers.length }})</span>
          </div>
          <n-space>
            <n-tag
              v-for="user in onlineUsers"
              :key="user"
              type="success"
            >
              {{ user }}
            </n-tag>
          </n-space>
        </div>
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useMessage } from 'naive-ui'
import { ChatSocket } from '@/utils/chatSocket'
import type { ChatMessage } from '@/types/api'

interface DebugLog {
  time: string
  type: 'info' | 'success' | 'warning' | 'error'
  message: string
  data?: any
}

// 响应式数据
const namespace = ref('default')
const chatName = ref('default')
const username = ref('testuser')
const testMessage = ref('')
const connecting = ref(false)
const isConnected = ref(false)
const logs = ref<DebugLog[]>([])
const messages = ref<ChatMessage[]>([])
const onlineUsers = ref<string[]>([])
const logsContainer = ref<HTMLElement>()

// WebSocket实例
let chatSocket: ChatSocket | null = null
const message = useMessage()

// 连接信息
const connectionInfo = ref({
  namespace: '',
  chatName: '',
  username: '',
  connected: false,
  wsUrl: ''
})

// 添加日志
const addLog = (type: DebugLog['type'], msg: string, data?: any) => {
  const log: DebugLog = {
    time: new Date().toLocaleTimeString(),
    type,
    message: msg,
    data
  }
  logs.value.push(log)
  
  // 自动滚动到底部
  nextTick(() => {
    if (logsContainer.value) {
      logsContainer.value.scrollTop = logsContainer.value.scrollHeight
    }
  })
  
  // 限制日志数量
  if (logs.value.length > 100) {
    logs.value.splice(0, 10)
  }
}

// 连接WebSocket
const handleConnect = async () => {
  if (!namespace.value) {
    message.error('请填写命名空间')
    return
  }

  connecting.value = true
  addLog('info', `开始连接到 ${namespace.value}/${chatName.value}`)

  try {
    // 断开现有连接
    if (chatSocket) {
      chatSocket.disconnect()
    }

    // 创建新连接（不再需要username参数）
    chatSocket = new ChatSocket()
    
    // 连接到聊天室
    chatSocket.connect(namespace.value, chatName.value, {
      onMessage: (msg) => {
        addLog('success', '收到新消息', msg)
        messages.value.push(msg)
      },
      
      onHistoryLoaded: (historyMessages) => {
        addLog('info', `收到历史消息回调: ${historyMessages?.length || 0} 条`)
        
        // 详细调试历史消息数据
        if (historyMessages && historyMessages.length > 0) {
          addLog('info', '历史消息数组类型检查:', {
            isArray: Array.isArray(historyMessages),
            length: historyMessages.length,
            firstMessage: historyMessages[0]
          })
          
          // 合并历史消息，避免重复
          const existingIds = new Set(messages.value.map(m => m.id))
          const newMessages = historyMessages.filter(m => m && m.id && !existingIds.has(m.id))
          
          addLog('info', `消息去重结果: 现有${messages.value.length}条，新增${newMessages.length}条`)
          
          if (newMessages.length > 0) {
            messages.value.unshift(...newMessages)
            addLog('success', `成功添加 ${newMessages.length} 条历史消息到列表`)
          } else {
            addLog('warning', '没有新的历史消息需要添加（可能已存在或数据无效）')
          }
        } else {
          addLog('warning', '历史消息为空或无效', historyMessages)
        }
      },
      
      onHistoryInfo: (info) => {
        addLog('info', `历史消息元信息: hasMore=${info.hasMore}, count=${info.count}`)
      },
      
      onUserJoin: (user) => {
        addLog('info', `用户加入: ${user}`)
        if (!onlineUsers.value.includes(user)) {
          onlineUsers.value.push(user)
        }
      },
      
      onUserLeave: (user) => {
        addLog('info', `用户离开: ${user}`)
        const index = onlineUsers.value.indexOf(user)
        if (index !== -1) {
          onlineUsers.value.splice(index, 1)
        }
      },
      
      onTyping: (user, typing) => {
        addLog('info', `${user} ${typing ? '正在输入' : '停止输入'}`)
      },
      
      onStatus: (connected) => {
        isConnected.value = connected
        connectionInfo.value = chatSocket?.getConnectionInfo() || connectionInfo.value
        
        if (connected) {
          addLog('success', 'WebSocket连接成功')
          message.success('连接成功')
        } else {
          addLog('error', 'WebSocket连接断开')
          message.error('连接断开')
        }
      },
      
      onError: (error) => {
        addLog('error', 'WebSocket错误', error)
        message.error('连接错误')
      }
    })

  } catch (error) {
    addLog('error', '连接失败', error)
    message.error('连接失败')
  } finally {
    connecting.value = false
  }
}

// 断开连接
const handleDisconnect = () => {
  if (chatSocket) {
    chatSocket.disconnect()
    chatSocket = null
  }
  isConnected.value = false
  addLog('info', '主动断开连接')
  message.info('已断开连接')
}

// 发送测试消息
const sendTestMessage = () => {
  if (!testMessage.value.trim()) {
    message.warning('请输入消息内容')
    return
  }

  if (!chatSocket || !isConnected.value) {
    message.error('WebSocket未连接')
    return
  }

  addLog('info', `发送消息: ${testMessage.value}`)
  chatSocket.sendMessage(testMessage.value)
  testMessage.value = ''
}

// 请求历史消息
const requestHistory = () => {
  if (!chatSocket || !isConnected.value) {
    message.error('WebSocket未连接')
    return
  }

  addLog('info', '请求历史消息')
  chatSocket.loadMoreHistory('', 20)
}

// 清空日志
const clearLogs = () => {
  logs.value = []
  addLog('info', '日志已清空')
}

// 清空消息
const clearMessages = () => {
  messages.value = []
  addLog('info', '消息列表已清空')
}

// 格式化时间
const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleString()
}

// 生命周期
onMounted(() => {
  addLog('info', '调试工具已启动')
})

onUnmounted(() => {
  if (chatSocket) {
    chatSocket.disconnect()
  }
})
</script>

<style scoped lang="scss">
.chat-debugger {
  padding: 16px;
  
  .connection-status {
    padding: 12px;
    background: #f8f9fa;
    border-radius: 6px;
    
    .status-text {
      font-family: monospace;
      font-size: 12px;
      color: #666;
    }
  }
  
  .debug-logs {
    .logs-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-weight: 600;
    }
    
    .logs-content {
      max-height: 400px;
      overflow-y: auto;
      background: #1e1e1e;
      border-radius: 6px;
      padding: 12px;
      font-family: monospace;
      font-size: 12px;
      
      .log-item {
        margin-bottom: 8px;
        display: flex;
        gap: 8px;
        
        .log-time {
          color: #888;
          min-width: 80px;
        }
        
        .log-type {
          min-width: 60px;
          font-weight: bold;
        }
        
        .log-message {
          flex: 1;
        }
        
        .log-data {
          margin-top: 4px;
          padding: 8px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
          font-size: 11px;
          overflow-x: auto;
        }
        
        &.log-info {
          .log-type { color: #17a2b8; }
          .log-message { color: #fff; }
        }
        
        &.log-success {
          .log-type { color: #28a745; }
          .log-message { color: #90ee90; }
        }
        
        &.log-warning {
          .log-type { color: #ffc107; }
          .log-message { color: #ffeb3b; }
        }
        
        &.log-error {
          .log-type { color: #dc3545; }
          .log-message { color: #ff6b6b; }
        }
      }
    }
  }
  
  .messages-section,
  .users-section {
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-weight: 600;
    }
    
    .messages-list {
      max-height: 300px;
      overflow-y: auto;
      
      .message-debug-item {
        padding: 8px;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        margin-bottom: 8px;
        
        .message-header {
          display: flex;
          gap: 12px;
          margin-bottom: 4px;
          font-size: 12px;
          color: #666;
          
          .message-sender {
            font-weight: 600;
            color: #007bff;
          }
          
          .message-type {
            background: #f8f9fa;
            padding: 2px 6px;
            border-radius: 3px;
          }
        }
        
        .message-content {
          font-size: 14px;
          word-break: break-word;
        }
      }
    }
  }
}
</style>
