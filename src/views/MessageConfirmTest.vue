<template>
  <div class="message-confirm-test">
    <n-card title="消息确认机制测试" :bordered="false">
      <n-space vertical size="large">
        <!-- 连接状态 -->
        <div>
          <n-space>
            <n-input 
              v-model:value="namespace" 
              placeholder="命名空间" 
              style="width: 150px;"
            />
            <n-input 
              v-model:value="username" 
              placeholder="用户名" 
              style="width: 150px;"
            />
            <n-button 
              type="primary" 
              @click="connect"
              :disabled="isConnected"
            >
              连接
            </n-button>
            <n-button @click="disconnect" :disabled="!isConnected">
              断开
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
                @click="simulateConfirm"
                :disabled="!lastTempId"
              >
                模拟确认
              </n-button>
              <n-button 
                @click="simulateError"
                :disabled="!lastTempId"
              >
                模拟错误
              </n-button>
              <n-button 
                @click="simulateDelivered"
                :disabled="!lastMessageId"
              >
                模拟送达
              </n-button>
            </n-space>
          </n-space>
        </div>

        <!-- 消息状态显示 -->
        <div>
          <n-text strong>消息状态 ({{ messages.length }} 条)：</n-text>
          <n-card size="small" style="margin-top: 8px; max-height: 300px; overflow-y: auto;">
            <div v-if="messages.length === 0" style="text-align: center; color: #999;">
              暂无消息
            </div>
            <div v-else>
              <div 
                v-for="message in messages" 
                :key="message.id"
                class="message-status-item"
                :class="message.status"
              >
                <div class="message-header">
                  <span class="message-id">{{ message.id }}</span>
                  <span class="temp-id" v-if="message.tempId">{{ message.tempId }}</span>
                  <n-tag 
                    :type="getStatusColor(message.status)" 
                    size="small"
                  >
                    {{ getStatusText(message.status) }}
                  </n-tag>
                </div>
                <div class="message-content">{{ message.content }}</div>
                <div class="message-time">{{ formatTime(message.timestamp) }}</div>
              </div>
            </div>
          </n-card>
        </div>

        <!-- 最后的ID -->
        <div>
          <n-space>
            <n-text>最后临时ID: {{ lastTempId || '无' }}</n-text>
            <n-text>最后消息ID: {{ lastMessageId || '无' }}</n-text>
          </n-space>
        </div>
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMessage } from 'naive-ui'
import type { ChatMessage } from '@/types/api'

const message = useMessage()
const namespace = ref('default')
const username = ref('xops')
const testMessage = ref('测试消息确认机制')
const isConnected = ref(false)
const messages = ref<ChatMessage[]>([])
const lastTempId = ref('')
const lastMessageId = ref('')

let ws: WebSocket | null = null

// 连接WebSocket
const connect = () => {
  if (ws) {
    ws.close()
  }

  // 获取token用于WebSocket认证
  const token = localStorage.getItem('goqgo_token')
  if (!token) {
    message.error('未找到认证token，请先登录')
    return
  }

  const wsUrl = `ws://localhost:8080/ws/namespaces/${namespace.value}/chat?token=${token}`
  console.log('🔗 连接WebSocket:', wsUrl.replace(token, '***TOKEN***'))
  
  ws = new WebSocket(wsUrl)
  
  ws.onopen = () => {
    isConnected.value = true
    message.success('连接成功')
    console.log('✅ WebSocket连接成功')
  }
  
  ws.onclose = () => {
    isConnected.value = false
    message.warning('连接关闭')
    console.log('⚠️ WebSocket连接关闭')
  }
  
  ws.onerror = (error) => {
    message.error('连接错误')
  }
  
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      handleMessage(data)
    } catch (error) {
      console.error('解析消息失败:', error)
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
}

// 处理收到的消息
const handleMessage = (data: any) => {
  console.log('收到消息:', data)
  
  switch (data.type) {
    case 'message_confirm':
      // 消息确认
      updateMessageStatus(data.data.tempId, 'sent', data.data.messageId)
      lastMessageId.value = data.data.messageId
      message.success('消息发送确认')
      break
      
    case 'error':
      // 错误消息
      if (data.data.tempId) {
        updateMessageStatus(data.data.tempId, 'error')
      }
      message.error(`发送失败: ${data.data.error}`)
      break
      
    case 'chat':
      // 聊天消息广播
      addMessage({
        id: data.data.id,
        senderId: data.data.username,
        senderName: data.data.username,
        content: data.data.content,
        timestamp: data.data.timestamp,
        type: data.data.type,
        status: 'delivered'
      })
      break
      
    case 'message_delivered':
      // 消息送达确认
      updateMessageStatusById(data.data.messageId, 'delivered')
      message.success('消息已送达')
      break
  }
}

// 发送消息
const sendMessage = () => {
  if (!ws || !isConnected.value) {
    message.error('WebSocket未连接')
    return
  }

  const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  lastTempId.value = tempId

  const messageData = {
    type: 'chat',
    data: {
      tempId,
      content: testMessage.value,
      type: 'text'
    }
  }

  // 乐观更新
  addMessage({
    id: tempId,
    tempId,
    senderId: username.value,
    senderName: username.value,
    content: testMessage.value,
    timestamp: new Date().toISOString(),
    type: 'user',
    status: 'sending'
  })

  ws.send(JSON.stringify(messageData))
  testMessage.value = ''
}

// 模拟后台确认
const simulateConfirm = () => {
  if (!lastTempId.value) return
  
  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  const confirmData = {
    type: 'message_confirm',
    data: {
      tempId: lastTempId.value,
      messageId
    }
  }
  
  handleMessage(confirmData)
}

// 模拟错误
const simulateError = () => {
  if (!lastTempId.value) return
  
  const errorData = {
    type: 'error',
    data: {
      tempId: lastTempId.value,
      error: '模拟的发送错误',
      code: 'SEND_FAILED'
    }
  }
  
  handleMessage(errorData)
}

// 模拟送达
const simulateDelivered = () => {
  if (!lastMessageId.value) return
  
  const deliveredData = {
    type: 'message_delivered',
    data: {
      messageId: lastMessageId.value
    }
  }
  
  handleMessage(deliveredData)
}

// 添加消息
const addMessage = (msg: Partial<ChatMessage>) => {
  const fullMessage: ChatMessage = {
    id: msg.id || '',
    senderId: msg.senderId || '',
    senderName: msg.senderName || '',
    content: msg.content || '',
    timestamp: msg.timestamp || new Date().toISOString(),
    type: msg.type || 'user',
    status: msg.status || 'sent',
    tempId: msg.tempId
  }
  
  messages.value.push(fullMessage)
}

// 更新消息状态
const updateMessageStatus = (tempId: string, status: ChatMessage['status'], realId?: string) => {
  const messageIndex = messages.value.findIndex(m => m.tempId === tempId)
  if (messageIndex !== -1) {
    messages.value[messageIndex] = {
      ...messages.value[messageIndex],
      status,
      ...(realId && { id: realId })
    }
  }
}

// 根据ID更新状态
const updateMessageStatusById = (messageId: string, status: ChatMessage['status']) => {
  const messageIndex = messages.value.findIndex(m => m.id === messageId)
  if (messageIndex !== -1) {
    messages.value[messageIndex] = {
      ...messages.value[messageIndex],
      status
    }
  }
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
    case 'sent': return '已发送'
    case 'delivered': return '已送达'
    case 'error': return '发送失败'
    default: return '未知'
  }
}

// 格式化时间
const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString()
}
</script>

<style scoped lang="scss">
.message-confirm-test {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.message-status-item {
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
    }

    .temp-id {
      color: var(--text-tertiary);
      font-family: monospace;
    }
  }

  .message-content {
    font-size: 14px;
    line-height: 1.5;
    color: var(--text-primary);
    margin-bottom: 4px;
  }

  .message-time {
    font-size: 11px;
    color: var(--text-tertiary);
  }
}
</style>
