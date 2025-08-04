<template>
  <div class="thinking-test-page">
    <h1>思考消息测试页面</h1>
    
    <div class="test-controls">
      <n-button @click="addThinkingMessage" type="primary">
        添加思考消息
      </n-button>
      <n-button @click="addNormalMessage" type="default">
        添加普通消息
      </n-button>
      <n-button @click="clearMessages" type="error">
        清空消息
      </n-button>
    </div>

    <div class="messages-container">
      <div v-for="message in testMessages" :key="message.id" class="message-wrapper">
        <MessageItem :message="message" />
      </div>
    </div>

    <div class="debug-info">
      <h3>调试信息</h3>
      <pre>{{ JSON.stringify(testMessages, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NButton } from 'naive-ui'
import MessageItem from '@/components/MessageItem.vue'
import type { ChatMessage } from '@/types/api'

const testMessages = ref<ChatMessage[]>([])

let messageCounter = 0

const addThinkingMessage = () => {
  messageCounter++
  const thinkingMessage: ChatMessage = {
    id: `thinking_test_${messageCounter}`,
    senderId: 'default-sys.default',
    senderName: 'default-sys.default',
    content: '',
    timestamp: new Date().toISOString(),
    type: 'agent',
    status: 'thinking',
    conversationId: `conv_test_${messageCounter}`,
    isThinking: true,
    thinkingContent: '正在思考测试消息...',
    tempId: `temp_test_${messageCounter}`
  }
  
  console.log('🧪 添加测试思考消息:', thinkingMessage)
  testMessages.value.push(thinkingMessage)
}

const addNormalMessage = () => {
  messageCounter++
  const normalMessage: ChatMessage = {
    id: `normal_test_${messageCounter}`,
    senderId: 'test-user',
    senderName: 'Test User',
    content: `这是第 ${messageCounter} 条测试消息`,
    timestamp: new Date().toISOString(),
    type: 'user',
    status: 'sent'
  }
  
  console.log('🧪 添加测试普通消息:', normalMessage)
  testMessages.value.push(normalMessage)
}

const clearMessages = () => {
  testMessages.value = []
  messageCounter = 0
  console.log('🧪 清空测试消息')
}

// 初始化时添加一条思考消息
addThinkingMessage()
</script>

<style scoped lang="scss">
.thinking-test-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;

  h1 {
    color: var(--text-primary);
    margin-bottom: 20px;
  }

  .test-controls {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
    padding: 16px;
    background: var(--bg-secondary);
    border-radius: 8px;
  }

  .messages-container {
    background: var(--bg-primary);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 20px;
    min-height: 200px;

    .message-wrapper {
      margin-bottom: 12px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .debug-info {
    background: var(--bg-secondary);
    padding: 16px;
    border-radius: 8px;
    
    h3 {
      margin-top: 0;
      margin-bottom: 12px;
      color: var(--text-primary);
    }
    
    pre {
      background: var(--bg-primary);
      padding: 12px;
      border-radius: 4px;
      overflow-x: auto;
      font-size: 12px;
      color: var(--text-secondary);
      max-height: 300px;
      overflow-y: auto;
    }
  }
}
</style>
