<template>
  <div class="chat-input-test">
    <n-card title="ChatInput @功能测试">
      <n-space vertical>
        <div>
          <strong>测试说明:</strong>
          <ul>
            <li>在输入框中输入 @ 符号应该触发实例列表</li>
            <li>输入 @agent_name 应该显示自动补全</li>
            <li>检查控制台日志了解详细执行过程</li>
          </ul>
        </div>
        
        <n-divider />
        
        <div>
          <strong>当前状态:</strong>
          <n-space>
            <n-tag type="info">连接状态: {{ isConnected ? '已连接' : '未连接' }}</n-tag>
            <n-tag type="success">命名空间: {{ namespace }}</n-tag>
            <n-tag type="warning">Agents数量: {{ agentCount }}</n-tag>
          </n-space>
        </div>
        
        <n-divider />
        
        <div class="test-input-area">
          <ChatInput 
            :is-connected="isConnected"
            :namespace="namespace"
            @send="handleSend"
            @send-image="handleSendImage"
          />
        </div>
        
        <n-divider />
        
        <div>
          <strong>发送的消息:</strong>
          <div v-for="(msg, index) in messages" :key="index" class="message-item">
            <div><strong>内容:</strong> {{ msg.content }}</div>
            <div v-if="msg.mentionedAgents && msg.mentionedAgents.length > 0">
              <strong>提及的Agents:</strong> {{ msg.mentionedAgents.join(', ') }}
            </div>
            <div><strong>时间:</strong> {{ msg.timestamp }}</div>
          </div>
        </div>
        
        <n-divider />
        
        <div>
          <strong>控制面板:</strong>
          <n-space>
            <n-button @click="toggleConnection">
              {{ isConnected ? '断开连接' : '连接' }}
            </n-button>
            <n-button @click="clearMessages">清空消息</n-button>
            <n-button @click="showDebugInfo">显示调试信息</n-button>
          </n-space>
        </div>
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NCard, NSpace, NTag, NDivider, NButton } from 'naive-ui'
import ChatInput from '@/components/ChatInput.vue'

// 测试状态
const isConnected = ref(true)
const namespace = ref('default')
const messages = ref<Array<{
  content: string
  mentionedAgents?: string[]
  timestamp: string
}>>([])

// 计算属性
const agentCount = computed(() => {
  // 这里可以从ChatInput组件获取agents数量，暂时用模拟数据
  return 3
})

// 方法
const handleSend = (content: string, mentionedAgents?: string[]) => {
  console.log('📤 收到发送消息事件:', { content, mentionedAgents })
  
  messages.value.push({
    content,
    mentionedAgents,
    timestamp: new Date().toLocaleTimeString()
  })
}

const handleSendImage = (url: string) => {
  console.log('🖼️ 收到发送图片事件:', url)
  
  messages.value.push({
    content: `[图片: ${url}]`,
    timestamp: new Date().toLocaleTimeString()
  })
}

const toggleConnection = () => {
  isConnected.value = !isConnected.value
  console.log('🔌 连接状态切换:', isConnected.value)
}

const clearMessages = () => {
  messages.value = []
  console.log('🧹 清空消息列表')
}

const showDebugInfo = () => {
  console.log('🔍 当前调试信息:')
  console.log('- 连接状态:', isConnected.value)
  console.log('- 命名空间:', namespace.value)
  console.log('- 消息数量:', messages.value.length)
  console.log('- 最近消息:', messages.value.slice(-3))
}
</script>

<style scoped lang="scss">
.chat-input-test {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.test-input-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 16px;
  background: #f9f9f9;
}

.message-item {
  background: #f0f0f0;
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 8px;
  font-size: 12px;
  
  div {
    margin-bottom: 4px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

ul {
  margin: 8px 0;
  padding-left: 20px;
  
  li {
    margin-bottom: 4px;
  }
}
</style>
