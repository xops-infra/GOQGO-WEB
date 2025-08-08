<template>
  <div class="logs-test-page">
    <n-card title="日志功能测试" class="test-card">
      <n-space vertical>
        <n-alert type="info" title="测试说明">
          这个页面用于测试新的 WebSocket 日志功能。请确保后端服务正在运行。
        </n-alert>

        <n-form inline>
          <n-form-item label="命名空间">
            <n-input v-model:value="testNamespace" placeholder="default" />
          </n-form-item>
          <n-form-item label="Agent名称">
            <n-input v-model:value="testAgentName" placeholder="default-sys" />
          </n-form-item>
          <n-form-item>
            <n-button type="primary" @click="openLogsModal">
              打开日志窗口
            </n-button>
          </n-form-item>
        </n-form>

        <n-divider />

        <div class="terminal-test">
          <n-card title="终端日志渲染测试" size="small">
            <n-space vertical>
              <div class="renderer-controls">
                <n-radio-group v-model:value="testRendererType" size="small">
                  <n-radio value="xterm">XTerm 渲染器</n-radio>
                  <n-radio value="ansi">ANSI 渲染器</n-radio>
                </n-radio-group>
              </div>
              
              <n-space>
                <n-button @click="addTestLog">添加测试日志</n-button>
                <n-button @click="addAnsiLog">添加 ANSI 彩色日志</n-button>
                <n-button @click="addComplexAnsiLog">添加复杂 ANSI 日志</n-button>
                <n-button @click="addThinkingLog">添加 Thinking 动画</n-button>
                <n-button @click="clearTestLogs">清空测试日志</n-button>
              </n-space>
            </n-space>
            
            <div class="terminal-container">
              <!-- XTerm 渲染器 -->
              <XTermLogRenderer
                v-if="testRendererType === 'xterm'"
                :logs="testLogs"
                :is-loading="false"
                :auto-scroll="true"
                :max-lines="1000"
              />
              
              <!-- ANSI 渲染器 -->
              <TerminalLogRenderer
                v-else
                :logs="testLogs"
                :is-loading="false"
                :auto-scroll="true"
                :max-lines="1000"
              />
            </div>
          </n-card>
        </div>

        <n-divider />

        <div class="test-buttons">
          <n-space>
            <n-button @click="testWebSocketConnection">
              测试 WebSocket 连接
            </n-button>
            <n-button @click="testLoadHistory">
              测试加载历史
            </n-button>
            <n-button @click="testToggleFollow">
              测试切换跟踪
            </n-button>
            <n-button @click="testRefresh">
              测试刷新
            </n-button>
          </n-space>
        </div>

        <n-card title="连接状态" size="small">
          <n-space vertical>
            <n-tag :type="connectionStatus.type">
              {{ connectionStatus.text }}
            </n-tag>
            <div v-if="lastMessage">
              <strong>最后消息:</strong> {{ lastMessage }}
            </div>
          </n-space>
        </n-card>
      </n-space>
    </n-card>

    <!-- 日志模态框 -->
    <AgentLogsModal
      v-model:show="showLogsModal"
      :agent="testAgent"
      @close="showLogsModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMessage } from 'naive-ui'
import { LogSocket } from '@/utils/logSocket'
import AgentLogsModal from '@/components/AgentLogsModal.vue'
import TerminalLogRenderer from '@/components/logs/TerminalLogRenderer.vue'
import XTermLogRenderer from '@/components/logs/XTermLogRenderer.vue'
import type { Agent, LogEntry } from '@/api/agents'

const message = useMessage()

// 测试参数
const testNamespace = ref('default')
const testAgentName = ref('default-sys')
const showLogsModal = ref(false)

// 连接状态
const isConnected = ref(false)
const lastMessage = ref('')

// 测试日志数据
const testLogs = ref<LogEntry[]>([])
const testRendererType = ref<'xterm' | 'ansi'>('xterm')

// 测试用的 LogSocket 实例
let testLogSocket: LogSocket | null = null

// 计算测试 Agent 对象
const testAgent = computed<Agent | null>(() => {
  if (!testNamespace.value || !testAgentName.value) {
    return null
  }
  
  return {
    name: testAgentName.value,
    namespace: testNamespace.value,
    role: 'test',
    status: 'running',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
})

// 连接状态
const connectionStatus = computed(() => {
  if (isConnected.value) {
    return { type: 'success' as const, text: '已连接' }
  } else {
    return { type: 'error' as const, text: '未连接' }
  }
})

// 打开日志模态框
const openLogsModal = () => {
  if (!testAgent.value) {
    message.error('请填写命名空间和Agent名称')
    return
  }
  
  showLogsModal.value = true
}

// 测试 WebSocket 连接
const testWebSocketConnection = async () => {
  if (!testAgent.value) {
    message.error('请填写命名空间和Agent名称')
    return
  }

  try {
    // 断开现有连接
    if (testLogSocket) {
      testLogSocket.disconnect()
    }

    // 创建新连接
    testLogSocket = new LogSocket(
      testAgent.value.namespace,
      testAgent.value.name,
      { lines: 100, follow: true },
      {
        onConnect: () => {
          isConnected.value = true
          lastMessage.value = 'WebSocket 连接成功'
          message.success('WebSocket 连接成功')
        },
        onDisconnect: () => {
          isConnected.value = false
          lastMessage.value = 'WebSocket 连接断开'
          message.info('WebSocket 连接断开')
        },
        onInitial: (logs) => {
          lastMessage.value = `收到初始日志: ${logs.length} 条`
          message.info(`收到初始日志: ${logs.length} 条`)
        },
        onAppend: (log) => {
          lastMessage.value = `新日志: ${log.message.substring(0, 50)}...`
        },
        onHistory: (logs, hasMore) => {
          lastMessage.value = `历史日志: ${logs.length} 条, hasMore: ${hasMore}`
          message.info(`历史日志: ${logs.length} 条`)
        },
        onRefreshed: (lines) => {
          lastMessage.value = `刷新完成: ${lines} 行`
          message.success(`刷新完成: ${lines} 行`)
        },
        onFollowToggled: (data) => {
          lastMessage.value = `跟踪状态: ${data.follow}`
          message.info(`跟踪状态: ${data.follow}`)
        },
        onSessionClosed: (msg) => {
          lastMessage.value = `会话关闭: ${msg}`
          message.warning(`会话关闭: ${msg}`)
        },
        onError: (error) => {
          lastMessage.value = `错误: ${error}`
          message.error(`错误: ${error}`)
        }
      }
    )

    await testLogSocket.connect()
  } catch (error) {
    console.error('连接失败:', error)
    message.error('连接失败: ' + (error as Error).message)
  }
}

// 测试加载历史
const testLoadHistory = () => {
  if (!testLogSocket || !testLogSocket.isConnected) {
    message.error('请先连接 WebSocket')
    return
  }

  testLogSocket.loadHistory(0, 50)
  message.info('已发送加载历史请求')
}

// 测试切换跟踪
const testToggleFollow = () => {
  if (!testLogSocket || !testLogSocket.isConnected) {
    message.error('请先连接 WebSocket')
    return
  }

  testLogSocket.toggleFollow(false) // 测试关闭跟踪
  message.info('已发送切换跟踪请求')
}

// 测试刷新
const testRefresh = () => {
  if (!testLogSocket || !testLogSocket.isConnected) {
    message.error('请先连接 WebSocket')
    return
  }

  testLogSocket.refresh(200)
  message.info('已发送刷新请求')
}

// 添加测试日志
const addTestLog = () => {
  const messages = [
    'System initialized successfully',
    'Loading configuration from /etc/goqgo/config.yaml',
    'Starting agent manager...',
    'Agent "default-sys" started with PID 12345',
    'WebSocket server listening on port 8080',
    'Database connection established',
    'Ready to accept connections'
  ]
  
  const randomMessage = messages[Math.floor(Math.random() * messages.length)]
  
  testLogs.value.push({
    timestamp: '', // 不使用时间戳
    level: 'info',
    message: `[${new Date().toLocaleTimeString()}] ${randomMessage}`,
    source: 'test'
  })
}

// 添加 ANSI 彩色日志
const addAnsiLog = () => {
  const ansiMessages = [
    '\x1b[32m✓ Success:\x1b[0m Operation completed successfully',
    '\x1b[31m✗ Error:\x1b[0m Failed to connect to database',
    '\x1b[33m⚠ Warning:\x1b[0m Configuration file not found, using defaults',
    '\x1b[36mℹ Info:\x1b[0m Processing request from \x1b[1m192.168.1.100\x1b[0m',
    '\x1b[35m[DEBUG]\x1b[0m Memory usage: \x1b[1m256MB\x1b[0m / \x1b[1m1GB\x1b[0m',
    '\x1b[92m[SYSTEM]\x1b[0m Agent \x1b[1m\x1b[94mdefault-sys\x1b[0m is \x1b[32mrunning\x1b[0m',
    '\x1b[41m\x1b[37m CRITICAL \x1b[0m System overload detected!'
  ]
  
  const randomMessage = ansiMessages[Math.floor(Math.random() * ansiMessages.length)]
  
  testLogs.value.push({
    timestamp: '', // 不使用时间戳
    level: 'info',
    message: randomMessage,
    source: 'ansi-test'
  })
}

// 添加复杂 ANSI 日志
const addComplexAnsiLog = () => {
  const complexMessages = [
    // 进度条
    '\x1b[32m████████████████████████████████\x1b[0m \x1b[1m100%\x1b[0m Complete',
    // 表格样式
    '\x1b[1m\x1b[4mID\x1b[0m    \x1b[1m\x1b[4mName\x1b[0m         \x1b[1m\x1b[4mStatus\x1b[0m',
    '\x1b[36m001\x1b[0m   \x1b[32mAgent-Alpha\x1b[0m  \x1b[42m\x1b[30m RUNNING \x1b[0m',
    '\x1b[36m002\x1b[0m   \x1b[33mAgent-Beta\x1b[0m   \x1b[43m\x1b[30m PENDING \x1b[0m',
    // 多色组合
    '\x1b[1m\x1b[31m[ERROR]\x1b[0m \x1b[4mConnection failed\x1b[0m to \x1b[1m\x1b[36mdb.example.com:5432\x1b[0m',
    // 带背景的警告
    '\x1b[41m\x1b[1m\x1b[37m ⚠ CRITICAL ALERT ⚠ \x1b[0m System overload detected!',
    // 彩虹文本
    '\x1b[31mR\x1b[33ma\x1b[32mi\x1b[36mn\x1b[34mb\x1b[35mo\x1b[31mw\x1b[0m text example',
    // 思考过程模拟
    '\x1b[90m<thinking>\x1b[0m\n\x1b[90mAnalyzing user request...\x1b[0m\n\x1b[90mProcessing data...\x1b[0m\n\x1b[90m</thinking>\x1b[0m'
  ]
  
  const randomMessage = complexMessages[Math.floor(Math.random() * complexMessages.length)]
  
  testLogs.value.push({
    timestamp: '',
    level: 'info',
    message: randomMessage,
    source: 'complex-test'
  })
}

// 添加 thinking 动画日志
const addThinkingLog = () => {
  const thinkingMessages = [
    // 模拟真实的 thinking 动画输出
    '[?25l⠋ Thinking...⠙ Thinking...⠹ Thinking...⠸ Thinking...⠼ Thinking...⠴ Thinking...⠦ Thinking...⠧ Thinking...⠇ Thinking...⠏ Thinking...[?25h',
    // 简化版本
    '⠋ Thinking...⠙ Thinking...⠹ Thinking...',
    // 带控制序列的版本
    '[?25l⠋ Thinking...[?25h',
    // 多行 thinking
    '[?25l⠋ Thinking...⠙ Thinking...⠹ Thinking...⠸ Thinking...⠼ Thinking...⠴ Thinking...⠦ Thinking...⠧ Thinking...⠇ Thinking...⠏ Thinking...⠋ Thinking...⠙ Thinking...⠹ Thinking...⠸ Thinking...⠼ Thinking...⠴ Thinking...⠦ Thinking...⠧ Thinking...⠇ Thinking...⠏ Thinking...[?25h'
  ]
  
  const randomMessage = thinkingMessages[Math.floor(Math.random() * thinkingMessages.length)]
  
  testLogs.value.push({
    timestamp: '',
    level: 'info',
    message: randomMessage,
    source: 'thinking-test'
  })
}

// 清空测试日志
const clearTestLogs = () => {
  testLogs.value = []
}

// 组件卸载时清理连接
import { onUnmounted } from 'vue'
onUnmounted(() => {
  if (testLogSocket) {
    testLogSocket.disconnect()
  }
})
</script>

<style scoped lang="scss">
.logs-test-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;

  .test-card {
    margin-bottom: 24px;
  }

  .test-buttons {
    margin: 16px 0;
  }

  .terminal-test {
    margin: 24px 0;

    .renderer-controls {
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;
      margin-bottom: 16px;
    }

    .terminal-container {
      margin-top: 16px;
      height: 400px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
      background: #0d1117;
    }
  }
}
</style>
