<template>
  <div class="chat-test">
    <n-card title="聊天功能测试" :bordered="false">
      <n-space vertical size="large">
        <!-- 连接状态 -->
        <div>
          <n-text strong>连接状态：</n-text>
          <n-tag :type="isConnected ? 'success' : 'error'">
            {{ isConnected ? '已连接' : '未连接' }}
          </n-tag>
          <n-text style="margin-left: 16px">命名空间：{{ currentNamespace }}</n-text>
        </div>

        <!-- 连接控制 -->
        <div>
          <n-space>
            <n-input
              v-model:value="testNamespace"
              placeholder="输入命名空间"
              style="width: 200px"
            />
            <n-button type="primary" @click="connectToChat" :loading="connecting">
              连接聊天室
            </n-button>
            <n-button @click="disconnectChat">断开连接</n-button>
          </n-space>
        </div>

        <!-- 消息发送 -->
        <div>
          <n-space vertical>
            <n-input
              v-model:value="testMessage"
              placeholder="输入测试消息..."
              @keyup.enter="sendTestMessage"
            />
            <n-space>
              <n-button
                type="primary"
                @click="sendTestMessage"
                :disabled="!isConnected"
                :loading="sending"
              >
                发送消息
              </n-button>
              <n-button @click="sendImageTest" :disabled="!isConnected"> 发送图片测试 </n-button>
              <n-button @click="clearMessages">清空消息</n-button>
            </n-space>
          </n-space>
        </div>

        <!-- 消息列表 -->
        <div>
          <n-text strong>消息列表 ({{ messages.length }} 条)：</n-text>
          <n-card size="small" style="margin-top: 8px; max-height: 400px; overflow-y: auto">
            <div v-if="messages.length === 0" style="text-align: center; color: #999">暂无消息</div>
            <div v-else>
              <div
                v-for="message in sortedMessages"
                :key="message.id"
                class="test-message-item"
                :class="{
                  sending: message.status === 'sending',
                  sent: message.status === 'sent',
                  error: message.status === 'error'
                }"
              >
                <div class="message-header">
                  <span class="sender">{{ message.senderName }}</span>
                  <span class="time">{{ formatTime(message.timestamp) }}</span>
                  <n-tag :type="getStatusColor(message.status)" size="small">
                    {{ getStatusText(message.status) }}
                  </n-tag>
                </div>
                <div class="message-content">{{ message.content }}</div>
              </div>
            </div>
          </n-card>
        </div>

        <!-- 在线用户 -->
        <div>
          <n-text strong>在线用户 ({{ onlineUsers.length }})：</n-text>
          <n-space style="margin-top: 8px">
            <n-tag v-for="user in onlineUsers" :key="user" type="info">
              {{ user }}
            </n-tag>
          </n-space>
        </div>
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useChatStore } from '@/stores/chat'
import { useMessage } from 'naive-ui'

const chatStore = useChatStore()
const { messages, sortedMessages, onlineUsers, isConnected, currentNamespace } =
  storeToRefs(chatStore)
const message = useMessage()

const testNamespace = ref('default')
const testMessage = ref('你好，这是一条测试消息！')
const connecting = ref(false)
const sending = ref(false)

// 连接聊天室
const connectToChat = async () => {
  if (!testNamespace.value.trim()) {
    message.error('请输入命名空间')
    return
  }

  connecting.value = true
  try {
    await chatStore.connect(testNamespace.value)
    message.success('连接成功')
  } catch (error) {
    console.error('连接失败:', error)
    message.error('连接失败')
  } finally {
    connecting.value = false
  }
}

// 断开连接
const disconnectChat = () => {
  chatStore.disconnect()
  message.info('已断开连接')
}

// 发送测试消息
const sendTestMessage = async () => {
  if (!testMessage.value.trim()) {
    message.error('请输入消息内容')
    return
  }

  sending.value = true
  try {
    await chatStore.sendMessage(testMessage.value)
    message.success('消息发送成功')
    testMessage.value = '' // 清空输入框
  } catch (error) {
    console.error('发送失败:', error)
    message.error('发送失败')
  } finally {
    sending.value = false
  }
}

// 发送图片测试
const sendImageTest = async () => {
  const imageUrl = 'http://localhost:8080/api/v1/files/image_20250731_223222.png'

  sending.value = true
  try {
    await chatStore.sendMessage(imageUrl, 'image')
    message.success('图片消息发送成功')
  } catch (error) {
    console.error('发送图片失败:', error)
    message.error('发送图片失败')
  } finally {
    sending.value = false
  }
}

// 清空消息
const clearMessages = () => {
  chatStore.clearMessages()
  message.info('消息已清空')
}

// 格式化时间
const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString()
}

// 获取状态颜色
const getStatusColor = (status?: string) => {
  switch (status) {
    case 'sending':
      return 'warning'
    case 'sent':
      return 'info'
    case 'delivered':
      return 'success'
    case 'error':
      return 'error'
    default:
      return 'default'
  }
}

// 获取状态文本
const getStatusText = (status?: string) => {
  switch (status) {
    case 'sending':
      return '发送中'
    case 'sent':
      return '已发送'
    case 'delivered':
      return '已送达'
    case 'error':
      return '发送失败'
    default:
      return '未知'
  }
}
</script>

<style scoped lang="scss">
.chat-test {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.test-message-item {
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

    .sender {
      font-weight: 600;
      color: var(--color-primary);
    }

    .time {
      color: var(--text-tertiary);
    }
  }

  .message-content {
    font-size: 14px;
    line-height: 1.5;
    color: var(--text-primary);
  }
}
</style>
