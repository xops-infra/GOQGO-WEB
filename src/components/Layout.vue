<template>
  <div class="main-layout">
    <!-- 顶部标题栏 -->
    <div class="header-bar">
      <div class="header-content">
        <div class="header-left">
          <img src="@/assets/Goqgo.svg" alt="GoQGo" class="header-logo" />
          <div class="header-title">
            <h1>Q Chat Manager</h1>
            <span class="subtitle">AI助手管理平台</span>
          </div>
        </div>
        <div class="header-right">
          <n-space>
            <NamespaceManager />
            <n-button size="small" quaternary @click="toggleTheme">
              <n-icon>
                <SunnyOutline v-if="appStore.theme === 'dark'" />
                <MoonOutline v-else />
              </n-icon>
            </n-button>
          </n-space>
        </div>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="content-area">
      <!-- 左侧实例列表 -->
      <div class="left-panel">
        <div class="panel-header">
          <h3>Q CLI 实例</h3>
          <n-button size="small" type="primary" @click="showCreateModal = true">
            <n-icon><AddOutline /></n-icon>
          </n-button>
        </div>
        
        <div class="instances-list">
          <div
            v-for="agent in agents"
            :key="agent.name"
            class="instance-item"
            :class="{ active: agentsStore.selectedAgent?.name === agent.name }"
            @click="selectAgent(agent)"
          >
            <div class="instance-info">
              <div class="instance-name">{{ agent.name }}</div>
              <div class="instance-role">{{ agent.role }}</div>
            </div>
            <div class="instance-status" :class="agent.status">
              <div class="status-dot"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间终端区域 -->
      <div class="center-panel">
        <div class="terminal-header">
          <span v-if="agentsStore.selectedAgent">{{ agentsStore.selectedAgent.name }} - 终端</span>
          <span v-else>选择一个实例</span>
        </div>
        <div class="terminal-container" ref="terminalRef">
          <div v-if="!agentsStore.selectedAgent" class="terminal-placeholder">
            <n-empty description="请从左侧选择一个Q CLI实例" />
          </div>
          <div v-else class="terminal-content">
            <div class="terminal-output" ref="outputRef">
              <div
                v-for="log in terminalLogs"
                :key="log.id"
                class="log-line"
                :class="log.type"
              >
                <span class="timestamp">{{ formatTime(log.timestamp) }}</span>
                <span class="content">{{ log.content }}</span>
              </div>
            </div>
            <div class="terminal-input">
              <span class="prompt">$ </span>
              <input
                v-model="commandInput"
                @keydown.enter="sendCommand"
                placeholder="输入命令..."
                class="command-input"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧聊天区域 -->
      <div class="right-panel">
        <div class="chat-header">
          <h3>聊天记录</h3>
          <n-button size="small" @click="clearChat">清空</n-button>
        </div>
        
        <div class="chat-messages" ref="messagesRef">
          <div
            v-for="message in chatMessages"
            :key="message.id"
            class="message-item"
            :class="message.type"
          >
            <div class="message-header">
              <span class="sender">{{ message.sender }}</span>
              <span class="time">{{ formatTime(message.timestamp) }}</span>
            </div>
            <div class="message-content">{{ message.content }}</div>
          </div>
        </div>
        
        <div class="chat-input">
          <n-input
            v-model:value="chatInput"
            type="textarea"
            placeholder="输入消息..."
            :autosize="{ minRows: 2, maxRows: 4 }"
            @keydown.enter.prevent="sendMessage"
          />
          <div class="input-actions">
            <n-button type="primary" size="small" @click="sendMessage">
              发送
            </n-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部状态栏 -->
    <div class="status-bar">
      <div class="status-left">
        <span>命名空间: {{ namespacesStore.currentNamespace }}</span>
        <span>实例数: {{ agents.length }}</span>
        <span>运行中: {{ runningCount }}</span>
      </div>
      <div class="status-right">
        <span>{{ new Date().toLocaleString('zh-CN') }}</span>
      </div>
    </div>

    <!-- 创建实例模态框 -->
    <n-modal v-model:show="showCreateModal" preset="dialog" title="创建Q CLI实例">
      <n-form
        ref="createFormRef"
        :model="createForm"
        :rules="createRules"
        label-placement="left"
        label-width="80px"
      >
        <n-form-item label="名称" path="name">
          <n-input v-model:value="createForm.name" placeholder="实例名称" />
        </n-form-item>
        
        <n-form-item label="角色" path="role">
          <n-select
            v-model:value="createForm.role"
            :options="roleOptions"
            placeholder="选择角色"
          />
        </n-form-item>
        
        <n-form-item label="上下文" path="context">
          <n-input
            v-model:value="createForm.context"
            type="textarea"
            placeholder="角色上下文描述"
            :autosize="{ minRows: 3, maxRows: 6 }"
          />
        </n-form-item>
      </n-form>
      
      <template #action>
        <n-space>
          <n-button @click="showCreateModal = false">取消</n-button>
          <n-button type="primary" @click="handleCreateAgent" :loading="creating">
            创建
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { 
  AddOutline,
  SunnyOutline,
  MoonOutline
} from '@vicons/ionicons5'
import { useAppStore } from '@/stores/app'
import { useAgentsStore } from '@/stores/agents'
import { useNamespacesStore } from '@/stores/namespaces'
import NamespaceManager from './NamespaceManager.vue'
import type { Agent, CreateAgentRequest } from '@/types/api'

const appStore = useAppStore()
const agentsStore = useAgentsStore()
const namespacesStore = useNamespacesStore()

// 响应式数据
const commandInput = ref('')
const chatInput = ref('')
const showCreateModal = ref(false)
const creating = ref(false)
const createFormRef = ref()

const createForm = ref<CreateAgentRequest>({
  name: '',
  namespace: 'default',
  role: '',
  context: ''
})

const createRules = {
  name: [{ required: true, message: '请输入实例名称', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

// 模拟数据
const terminalLogs = ref([
  {
    id: '1',
    timestamp: new Date().toISOString(),
    content: 'Welcome to Q CLI Terminal',
    type: 'info'
  },
  {
    id: '2',
    timestamp: new Date().toISOString(),
    content: 'Type "help" for available commands',
    type: 'info'
  }
])

const chatMessages = ref([
  {
    id: '1',
    sender: 'System',
    content: '欢迎使用Q Chat Manager',
    timestamp: new Date().toISOString(),
    type: 'system'
  }
])

// 计算属性
const agents = computed(() => agentsStore.agents)
const runningCount = computed(() => 
  agents.value.filter(agent => agent.status === 'running').length
)

const roleOptions = [
  { label: '前端工程师', value: 'frontend-engineer' },
  { label: '后端工程师', value: 'backend-engineer' },
  { label: '产品经理', value: 'product-manager' },
  { label: '测试工程师', value: 'test-engineer' },
  { label: '系统管理员', value: 'system-admin' }
]

// 方法
const selectAgent = async (agent: Agent) => {
  agentsStore.selectAgent(agent)
  
  try {
    // 获取真实日志
    const logs = await agentsStore.getLogs(agent.name)
    terminalLogs.value = logs.map((log, index) => ({
      id: `${agent.name}-${index}`,
      timestamp: new Date().toISOString(),
      content: log,
      type: 'info'
    }))
  } catch (error) {
    // Fallback到模拟日志
    terminalLogs.value = [
      {
        id: `${agent.name}-1`,
        timestamp: new Date().toISOString(),
        content: `Connected to ${agent.name}`,
        type: 'success'
      },
      {
        id: `${agent.name}-2`,
        timestamp: new Date().toISOString(),
        content: `Role: ${agent.role}`,
        type: 'info'
      }
    ]
  }
}

const sendCommand = async () => {
  if (!commandInput.value.trim() || !agentsStore.selectedAgent) return
  
  // 添加用户输入的命令
  terminalLogs.value.push({
    id: `cmd-${Date.now()}`,
    timestamp: new Date().toISOString(),
    content: `$ ${commandInput.value}`,
    type: 'command'
  })
  
  try {
    // 发送命令到Agent
    await agentsStore.sendMessage(namespacesStore.currentNamespace, agentsStore.selectedAgent.name, commandInput.value)
    
    // 模拟命令执行结果
    setTimeout(() => {
      terminalLogs.value.push({
        id: `result-${Date.now()}`,
        timestamp: new Date().toISOString(),
        content: `Command sent to ${agentsStore.selectedAgent?.name}: ${commandInput.value}`,
        type: 'success'
      })
    }, 500)
  } catch (error) {
    terminalLogs.value.push({
      id: `error-${Date.now()}`,
      timestamp: new Date().toISOString(),
      content: `Error: ${error}`,
      type: 'error'
    })
  }
  
  commandInput.value = ''
}

const sendMessage = async () => {
  if (!chatInput.value.trim()) return
  
  chatMessages.value.push({
    id: `msg-${Date.now()}`,
    sender: 'User',
    content: chatInput.value,
    timestamp: new Date().toISOString(),
    type: 'user'
  })
  
  const messageContent = chatInput.value
  chatInput.value = ''
  
  try {
    if (agentsStore.selectedAgent) {
      // 发送消息到选中的Agent
      await agentsStore.sendMessage(namespacesStore.currentNamespace, agentsStore.selectedAgent.name, messageContent)
      
      // 模拟AI回复
      setTimeout(() => {
        chatMessages.value.push({
          id: `reply-${Date.now()}`,
          sender: agentsStore.selectedAgent?.name || 'Assistant',
          content: `收到消息: ${messageContent}`,
          timestamp: new Date().toISOString(),
          type: 'agent'
        })
      }, 1000)
    } else {
      // 广播消息
      await agentsStore.sendMessage('broadcast', messageContent)
      
      setTimeout(() => {
        chatMessages.value.push({
          id: `broadcast-${Date.now()}`,
          sender: 'System',
          content: '消息已广播到所有Agent',
          timestamp: new Date().toISOString(),
          type: 'system'
        })
      }, 500)
    }
  } catch (error) {
    chatMessages.value.push({
      id: `error-${Date.now()}`,
      sender: 'System',
      content: `发送失败: ${error}`,
      timestamp: new Date().toISOString(),
      type: 'system'
    })
  }
}

const clearChat = () => {
  chatMessages.value = []
}

const handleCreateAgent = async () => {
  try {
    await createFormRef.value?.validate()
    creating.value = true
    
    createForm.value.namespace = namespacesStore.currentNamespace
    await agentsStore.createAgent(createForm.value)
    
    showCreateModal.value = false
    createForm.value = {
      name: '',
      namespace: 'default',
      role: '',
      context: ''
    }
  } catch (error) {
    console.error('创建失败:', error)
  } finally {
    creating.value = false
  }
}

const toggleTheme = () => {
  appStore.toggleTheme()
}

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 生命周期
onMounted(async () => {
  // 设置agents store的事件监听器
  agentsStore.setupEventListeners()
  
  // 初始化数据
  await namespacesStore.fetchNamespaces()
  await agentsStore.fetchAgents()
})

onUnmounted(() => {
  // 清理事件监听器
  agentsStore.cleanupEventListeners()
})
</script>

<style scoped lang="scss">
.main-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.header-bar {
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  
  .header-content {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .header-logo {
      width: 40px;
      height: 40px;
    }
    
    .header-title {
      h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
      }
      
      .subtitle {
        font-size: 14px;
        opacity: 0.9;
      }
    }
  }
}

.content-area {
  flex: 1;
  display: flex;
  min-height: 0;
}

.left-panel {
  width: 280px;
  background: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  
  .panel-header {
    padding: 16px;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
  }
  
  .instances-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
  }
  
  .instance-item {
    padding: 12px;
    margin-bottom: 4px;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.2s;
    
    &:hover {
      background: #f0f0f0;
    }
    
    &.active {
      background: #e6f7ff;
      border: 1px solid #1890ff;
    }
    
    .instance-info {
      .instance-name {
        font-weight: 500;
        margin-bottom: 4px;
      }
      
      .instance-role {
        font-size: 12px;
        color: #666;
      }
    }
    
    .instance-status {
      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #ccc;
      }
      
      &.running .status-dot {
        background: #52c41a;
      }
      
      &.idle .status-dot {
        background: #faad14;
      }
      
      &.error .status-dot {
        background: #ff4d4f;
      }
    }
  }
}

.center-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #1e1e1e;
  
  .terminal-header {
    height: 40px;
    background: #2d2d2d;
    color: white;
    display: flex;
    align-items: center;
    padding: 0 16px;
    font-size: 14px;
    border-bottom: 1px solid #404040;
  }
  
  .terminal-container {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  .terminal-placeholder {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .terminal-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    color: #f0f0f0;
    font-family: 'JetBrains Mono', 'Consolas', monospace;
    font-size: 14px;
  }
  
  .terminal-output {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    
    .log-line {
      margin-bottom: 4px;
      display: flex;
      gap: 8px;
      
      .timestamp {
        color: #666;
        font-size: 12px;
        min-width: 80px;
      }
      
      &.command .content {
        color: #4fc3f7;
      }
      
      &.success .content {
        color: #4caf50;
      }
      
      &.error .content {
        color: #f44336;
      }
      
      &.info .content {
        color: #ff9800;
      }
    }
  }
  
  .terminal-input {
    padding: 16px;
    border-top: 1px solid #404040;
    display: flex;
    align-items: center;
    gap: 8px;
    
    .prompt {
      color: #4fc3f7;
      font-weight: bold;
    }
    
    .command-input {
      flex: 1;
      background: transparent;
      border: none;
      color: white;
      font-family: inherit;
      font-size: inherit;
      outline: none;
      
      &::placeholder {
        color: #666;
      }
    }
  }
}

.right-panel {
  width: 320px;
  background: white;
  border-left: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  
  .chat-header {
    padding: 16px;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
  }
  
  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    
    .message-item {
      margin-bottom: 16px;
      
      .message-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;
        font-size: 12px;
        color: #666;
      }
      
      .message-content {
        padding: 8px 12px;
        border-radius: 8px;
        background: #f0f0f0;
        
        .message-item.user & {
          background: #1890ff;
          color: white;
          margin-left: 20%;
        }
        
        .message-item.agent & {
          background: #52c41a;
          color: white;
          margin-right: 20%;
        }
        
        .message-item.system & {
          background: #faad14;
          color: white;
          text-align: center;
        }
      }
    }
  }
  
  .chat-input {
    padding: 16px;
    border-top: 1px solid #e0e0e0;
    
    .input-actions {
      margin-top: 8px;
      display: flex;
      justify-content: flex-end;
    }
  }
}

.status-bar {
  height: 32px;
  background: #f0f0f0;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  font-size: 12px;
  color: #666;
  
  .status-left {
    display: flex;
    gap: 20px;
  }
}
</style>
