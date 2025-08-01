<template>
  <div class="empty-message-test">
    <n-card title="空消息状态测试" :bordered="false">
      <n-space vertical size="large">
        <!-- 控制面板 -->
        <div>
          <n-space>
            <n-button type="primary" @click="connectChat" :disabled="isConnected">
              连接聊天室
            </n-button>
            <n-button @click="disconnectChat" :disabled="!isConnected"> 断开连接 </n-button>
            <n-button @click="clearMessages"> 清空消息 </n-button>
            <n-button @click="addOneMessage" :disabled="!isConnected"> 添加1条消息 </n-button>
            <n-button @click="add49Messages" :disabled="!isConnected"> 添加49条消息 </n-button>
            <n-button @click="add51Messages" :disabled="!isConnected"> 添加51条消息 </n-button>
            <n-tag :type="isConnected ? 'success' : 'error'">
              {{ isConnected ? '已连接' : '未连接' }}
            </n-tag>
          </n-space>
        </div>

        <!-- 状态显示 -->
        <div>
          <n-space>
            <n-statistic label="消息总数" :value="messages.length" />
            <n-statistic label="可见消息数" :value="visibleMessages.length" />
            <n-statistic label="隐藏消息数" :value="hiddenCount" />
            <n-statistic label="是否显示分割线" :value="shouldShowDivider ? '是' : '否'" />
            <n-statistic label="分割线条件1" :value="messages.length > 50 ? '满足' : '不满足'" />
            <n-statistic label="分割线条件2" :value="hiddenCount > 0 ? '满足' : '不满足'" />
          </n-space>
        </div>

        <!-- 聊天室组件 -->
        <div style="height: 400px; border: 1px solid var(--border-primary); border-radius: 8px">
          <ChatRoom :namespace="'default'" />
        </div>

        <!-- 详细调试信息 -->
        <div>
          <n-text strong>详细调试信息：</n-text>
          <n-card size="small" style="margin-top: 8px">
            <div class="debug-info">
              <div><strong>DEFAULT_VISIBLE_MESSAGES:</strong> 50</div>
              <div><strong>messages.length:</strong> {{ messages.length }}</div>
              <div><strong>messages.length > 50:</strong> {{ messages.length > 50 }}</div>
              <div><strong>hiddenCount:</strong> {{ hiddenCount }}</div>
              <div><strong>hiddenCount > 0:</strong> {{ hiddenCount > 0 }}</div>
              <div><strong>shouldShowDivider:</strong> {{ shouldShowDivider }}</div>
              <div><strong>最终显示条件:</strong> {{ shouldShowDivider && hiddenCount > 0 }}</div>
              <div><strong>分割线文本:</strong> {{ dividerText }}</div>
            </div>
          </n-card>
        </div>

        <!-- 消息列表预览 -->
        <div>
          <n-text strong>消息列表预览（最新5条）：</n-text>
          <n-card size="small" style="margin-top: 8px; max-height: 200px; overflow-y: auto">
            <div
              v-if="messages.length === 0"
              style="text-align: center; color: #999; padding: 20px"
            >
              暂无消息
            </div>
            <div v-else>
              <div
                v-for="(message, index) in messages.slice(-5)"
                :key="message.id"
                class="message-preview"
              >
                <span class="message-index">{{ messages.length - 5 + index + 1 }}.</span>
                <span class="message-content">{{ message.content }}</span>
                <span class="message-time">{{ formatTime(message.timestamp) }}</span>
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
import ChatRoom from '@/components/ChatRoom.vue'

const chatStore = useChatStore()
const { messages, isConnected } = storeToRefs(chatStore)
const message = useMessage()

const DEFAULT_VISIBLE_MESSAGES = 50

// 计算属性
const visibleMessages = computed(() => {
  if (messages.value.length <= DEFAULT_VISIBLE_MESSAGES) {
    return messages.value
  }
  return messages.value.slice(-DEFAULT_VISIBLE_MESSAGES)
})

const hiddenCount = computed(() => {
  if (messages.value.length <= DEFAULT_VISIBLE_MESSAGES) {
    return 0
  }
  return messages.value.length - DEFAULT_VISIBLE_MESSAGES
})

const shouldShowDivider = computed(() => {
  return messages.value.length > DEFAULT_VISIBLE_MESSAGES
})

const dividerText = computed(() => {
  if (messages.value.length <= DEFAULT_VISIBLE_MESSAGES) {
    return '最近消息'
  }
  const historyCount = messages.value.length - DEFAULT_VISIBLE_MESSAGES
  return `${historyCount}条历史消息`
})

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

// 清空消息
const clearMessages = () => {
  chatStore.clearMessages()
  message.info('消息已清空')
}

// 添加1条消息
const addOneMessage = async () => {
  try {
    await chatStore.sendMessage(`测试消息 - ${new Date().toLocaleTimeString()}`)
  } catch (error) {
    message.error('发送失败')
  }
}

// 添加49条消息
const add49Messages = async () => {
  try {
    for (let i = 1; i <= 49; i++) {
      await chatStore.sendMessage(`测试消息 ${i}/49 - ${new Date().toLocaleTimeString()}`)
      if (i % 10 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }
    message.success('添加49条消息完成')
  } catch (error) {
    message.error('添加消息失败')
  }
}

// 添加51条消息
const add51Messages = async () => {
  try {
    for (let i = 1; i <= 51; i++) {
      await chatStore.sendMessage(`测试消息 ${i}/51 - ${new Date().toLocaleTimeString()}`)
      if (i % 10 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }
    message.success('添加51条消息完成')
  } catch (error) {
    message.error('添加消息失败')
  }
}

// 格式化时间
const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString()
}
</script>

<style scoped lang="scss">
.empty-message-test {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.debug-info {
  font-family: monospace;
  font-size: 12px;
  line-height: 1.6;

  div {
    padding: 2px 0;
    border-bottom: 1px solid var(--border-secondary);

    &:last-child {
      border-bottom: none;
    }

    strong {
      color: var(--color-primary);
      display: inline-block;
      width: 200px;
    }
  }
}

.message-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  border-bottom: 1px solid var(--border-secondary);
  font-size: 12px;

  &:last-child {
    border-bottom: none;
  }

  .message-index {
    color: var(--text-tertiary);
    min-width: 30px;
  }

  .message-content {
    flex: 1;
    color: var(--text-primary);
  }

  .message-time {
    color: var(--text-tertiary);
    font-size: 11px;
  }
}
</style>
