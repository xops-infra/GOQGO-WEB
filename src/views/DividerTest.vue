<template>
  <div class="divider-test">
    <n-card title="分割线功能测试" :bordered="false">
      <n-space vertical size="large">
        <!-- 控制面板 -->
        <div>
          <n-space>
            <n-button type="primary" @click="connectChat" :disabled="isConnected">
              连接聊天室
            </n-button>
            <n-button @click="disconnectChat" :disabled="!isConnected"> 断开连接 </n-button>
            <n-button @click="generateTestMessages" :disabled="!isConnected">
              生成100条测试消息
            </n-button>
            <n-button @click="clearMessages"> 清空消息 </n-button>
            <n-tag :type="isConnected ? 'success' : 'error'">
              {{ isConnected ? '已连接' : '未连接' }}
            </n-tag>
          </n-space>
        </div>

        <!-- 统计信息 -->
        <div>
          <n-space>
            <n-statistic label="总消息数" :value="messages.length" />
            <n-statistic label="可见消息数" :value="visibleMessages.length" />
            <n-statistic label="隐藏消息数" :value="hiddenCount" />
            <n-statistic label="是否显示分割线" :value="shouldShowDivider ? '是' : '否'" />
          </n-space>
        </div>

        <!-- 聊天室组件 -->
        <div style="height: 500px; border: 1px solid var(--border-primary); border-radius: 8px">
          <ChatRoom :namespace="'default'" />
        </div>

        <!-- 调试信息 -->
        <div>
          <n-text strong>调试信息：</n-text>
          <n-card size="small" style="margin-top: 8px">
            <div class="debug-info">
              <div><strong>DEFAULT_VISIBLE_MESSAGES:</strong> 50</div>
              <div><strong>总消息数:</strong> {{ messages.length }}</div>
              <div><strong>可见消息数:</strong> {{ visibleMessages.length }}</div>
              <div><strong>隐藏消息数:</strong> {{ hiddenCount }}</div>
              <div><strong>是否显示分割线:</strong> {{ shouldShowDivider }}</div>
              <div><strong>分割线文本:</strong> {{ dividerText }}</div>
              <div><strong>有更多历史:</strong> {{ hasMoreHistory }}</div>
              <div><strong>正在加载历史:</strong> {{ isLoadingHistory }}</div>
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
const { messages, isConnected, hasMoreHistory, isLoadingHistory } = storeToRefs(chatStore)
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

// 生成测试消息
const generateTestMessages = async () => {
  try {
    for (let i = 1; i <= 100; i++) {
      await chatStore.sendMessage(`测试消息 ${i}/100 - ${new Date().toLocaleTimeString()}`)
      // 每10条消息暂停一下，避免发送过快
      if (i % 10 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }
    message.success('生成100条测试消息完成')
  } catch (error) {
    message.error('生成测试消息失败')
  }
}

// 清空消息
const clearMessages = () => {
  chatStore.clearMessages()
  message.info('消息已清空')
}
</script>

<style scoped lang="scss">
.divider-test {
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
      width: 180px;
    }
  }
}
</style>
