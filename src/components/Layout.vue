<template>
  <n-config-provider>
    <div class="main-layout">
      <!-- 顶部标题栏 -->
      <div class="header-bar">
        <div class="header-content">
          <div class="header-left">
            <img src="@/assets/Goqgo.svg" alt="GoQGo" class="header-logo" />
            <div class="header-title">
              <h1>Q Chat Manager</h1>
              <span class="subtitle">AI助手协助开发平台</span>
            </div>
          </div>
          <div class="header-right">
            <n-space>
              <NamespaceManager />
              <UserInfo />
              <div class="theme-toggle">
                <div class="theme-container" @click="toggleTheme">
                  <div class="theme-icon">
                    <n-icon size="18">
                      <SunIcon v-if="appStore.theme === 'dark'" />
                      <MoonIcon v-else />
                    </n-icon>
                  </div>
                  
                  <div class="theme-info">
                    <div class="theme-name">{{ appStore.theme === 'dark' ? '深色模式' : '浅色模式' }}</div>
                    <div class="theme-status">
                      <n-tag size="small" round :type="appStore.theme === 'dark' ? 'warning' : 'info'">
                        {{ appStore.theme === 'dark' ? '护眼模式' : '标准模式' }}
                      </n-tag>
                    </div>
                  </div>
                  
                  <n-icon class="dropdown-icon" size="16">
                    <svg viewBox="0 0 24 24">
                      <path fill="currentColor" d="M7,10L12,15L17,10H7Z"/>
                    </svg>
                  </n-icon>
                </div>
              </div>
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
              <template #icon>
                <n-icon><AddIcon /></n-icon>
              </template>
            </n-button>
          </div>
          
          <div class="instances-list">
            <div
              v-for="agent in agents"
              :key="agent.name"
              class="instance-item"
              :class="[
                { active: agentsStore.selectedAgent?.name === agent.name },
                `status-${agent.status.toLowerCase()}`
              ]"
              @click="selectAgent(agent)"
            >
              <div class="instance-info">
                <div class="instance-header">
                  <span class="instance-name">{{ agent.name }}</span>
                  <div class="instance-actions">
                    <n-tooltip>
                      <template #trigger>
                        <n-button 
                          text 
                          size="tiny" 
                          :type="isLogWindowOpen(agent) ? 'primary' : 'default'"
                          :class="{ 'log-button-active': isLogWindowOpen(agent) }"
                          @click.stop="showAgentLogs(agent)"
                        >
                          <template #icon>
                            <n-icon>
                              <svg viewBox="0 0 24 24">
                                <path fill="currentColor" d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,19H5V5H19V19Z"/>
                              </svg>
                            </n-icon>
                          </template>
                        </n-button>
                      </template>
                      {{ isLogWindowOpen(agent) ? '重置日志窗口' : '查看日志' }}
                    </n-tooltip>
                    <n-tooltip>
                      <template #trigger>
                        <n-button text size="tiny" @click.stop="showAgentDetails(agent)">
                          <template #icon>
                            <n-icon><InfoIcon /></n-icon>
                          </template>
                        </n-button>
                      </template>
                      查看详情
                    </n-tooltip>
                    <n-tooltip>
                      <template #trigger>
                        <n-button text size="tiny" @click.stop="restartAgent(agent)">
                          <template #icon>
                            <n-icon><RefreshIcon /></n-icon>
                          </template>
                        </n-button>
                      </template>
                      重启实例
                    </n-tooltip>
                    <n-popconfirm @positive-click="deleteAgent(agent)">
                      <template #trigger>
                        <n-button text size="tiny" @click.stop>
                          <template #icon>
                            <n-icon><DeleteIcon /></n-icon>
                          </template>
                        </n-button>
                      </template>
                      确定要删除实例 {{ agent.name }} 吗？
                    </n-popconfirm>
                  </div>
                </div>
                <div class="instance-meta">
                  <n-tag :type="getRoleType(agent.role)" size="small" round>
                    {{ agent.role }}
                  </n-tag>
                  <span class="instance-uptime">运行时间: {{ formatUptime(agent.age) }}</span>
                </div>
                <div class="instance-status">
                  <n-tag :type="getStatusType(agent.status)" size="small" round>
                    {{ agent.status }}
                  </n-tag>
                  <span class="restart-count" v-if="agent.restartCount">
                    重启次数: {{ agent.restartCount }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧聊天区域 -->
        <div class="right-panel">
          <ChatRoom :namespace="currentNamespace" />
        </div>
      </div>

      <!-- 实例详情弹窗 -->
      <n-modal
        v-model:show="showDetailsModal"
        preset="card"
        title="实例详情"
        style="width: 600px"
        :mask-closable="true"
      >
        <n-descriptions v-if="selectedDetails" bordered>
          <n-descriptions-item label="名称">
            {{ selectedDetails.name }}
          </n-descriptions-item>
          <n-descriptions-item label="命名空间">
            {{ selectedDetails.namespace }}
          </n-descriptions-item>
          <n-descriptions-item label="角色">
            <n-tag :type="getRoleType(selectedDetails.role)" size="small" round>
              {{ selectedDetails.role }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="状态">
            <n-tag :type="getStatusType(selectedDetails.status)" size="small" round>
              {{ selectedDetails.status }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="运行时间">
            {{ formatUptime(selectedDetails.age) }}
          </n-descriptions-item>
          <n-descriptions-item label="重启次数">
            {{ selectedDetails.restartCount || 0 }}
          </n-descriptions-item>
          <n-descriptions-item label="工作目录" span="3">
            {{ selectedDetails.workDir || '-' }}
          </n-descriptions-item>
          <n-descriptions-item label="会话名称">
            {{ selectedDetails.sessionName || '-' }}
          </n-descriptions-item>
        </n-descriptions>
      </n-modal>

      <!-- Agent日志模态框 - 使用Teleport渲染到body -->
      <Teleport to="body">
        <AgentLogsModal
          v-for="logWindow in openLogWindows"
          :key="`log-${logWindow.agent.namespace}-${logWindow.agent.name}`"
          :agent="logWindow.agent"
          v-model:show="logWindow.show"
          :reset-position="logWindow.resetPosition"
          :bring-to-front="logWindow.bringToFront"
          @close="closeLogWindow(logWindow.agent)"
        />
      </Teleport>
    </div>
  </n-config-provider>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, Teleport } from 'vue'
import { storeToRefs } from 'pinia'
import { 
  AddOutline as AddIcon,
  SunnyOutline as SunIcon,
  MoonOutline as MoonIcon,
  InformationCircleOutline as InfoIcon,
  RefreshOutline as RefreshIcon,
  TrashBinOutline as DeleteIcon
} from '@vicons/ionicons5'
import { useAppStore } from '@/stores/app'
import { useAgentsStore } from '@/stores/agents'
import { useNamespacesStore } from '@/stores/namespaces'
import { 
  useMessage,
  NConfigProvider,
  NButton,
  NIcon,
  NSpace,
  NTooltip,
  NPopconfirm,
  NModal,
  NDescriptions,
  NDescriptionsItem,
  NTag
} from 'naive-ui'
import NamespaceManager from './NamespaceManager.vue'
import UserInfo from './UserInfo.vue'
import ChatRoom from './ChatRoom.vue'
import AgentLogsModal from './AgentLogsModal.vue'
import type { Agent, CreateAgentRequest } from '@/types/api'

// 状态管理
const appStore = useAppStore()
const agentsStore = useAgentsStore()
const namespacesStore = useNamespacesStore()
const { currentNamespace } = storeToRefs(namespacesStore)
const message = useMessage()

// 日志窗口接口定义
interface LogWindow {
  agent: Agent
  show: boolean
  resetPosition?: number // 重置位置时间戳
  bringToFront?: number // 置顶时间戳
}

// 响应式数据
const showDetailsModal = ref(false)
const selectedDetails = ref<Agent | null>(null)
const openLogWindows = ref<LogWindow[]>([])
const showCreateModal = ref(false)
const creating = ref(false)
const createFormRef = ref()

const createForm = ref<CreateAgentRequest>({
  name: '',
  namespace: 'default',
  role: '',
  context: ''
})

// 计算属性
const agents = computed(() => agentsStore.agents)

// 方法
const selectAgent = (agent: Agent) => {
  console.log('🎯 选择Agent:', agent.name)
  agentsStore.selectAgent(agent)
}

const showAgentDetails = (agent: Agent) => {
  selectedDetails.value = agent
  showDetailsModal.value = true
}

const showAgentLogs = (agent: Agent) => {
  console.log('📋 打开日志窗口:', agent.name)
  
  // 检查是否已经有该实例的日志窗口
  const existingWindowIndex = openLogWindows.value.findIndex(
    window => window.agent.namespace === agent.namespace && window.agent.name === agent.name
  )
  
  if (existingWindowIndex !== -1) {
    // 如果已存在，触发窗口重置位置
    console.log('🔄 重置现有日志窗口位置:', agent.name)
    const existingWindow = openLogWindows.value[existingWindowIndex]
    
    // 触发窗口重置事件
    existingWindow.resetPosition = Date.now() // 使用时间戳触发重置
    
    // 将窗口置顶
    existingWindow.bringToFront = Date.now()
    
    console.log('✅ 日志窗口已重置:', agent.name)
    return
  }
  
  // 创建新的日志窗口（会初始化到默认位置）
  const newLogWindow: LogWindow = {
    agent: { ...agent }, // 创建副本避免引用问题
    show: true,
    resetPosition: 0,
    bringToFront: 0
  }
  
  openLogWindows.value.push(newLogWindow)
  console.log('✅ 创建新日志窗口:', agent.name, '当前窗口数:', openLogWindows.value.length)
}

// 检查Agent是否已有打开的日志窗口
const isLogWindowOpen = (agent: Agent) => {
  return openLogWindows.value.some(
    window => window.agent.namespace === agent.namespace && window.agent.name === agent.name && window.show
  )
}

// 关闭日志窗口
const closeLogWindow = (agent: Agent) => {
  console.log('❌ 关闭日志窗口:', agent.name)
  const windowIndex = openLogWindows.value.findIndex(
    window => window.agent.namespace === agent.namespace && window.agent.name === agent.name
  )
  
  if (windowIndex !== -1) {
    openLogWindows.value.splice(windowIndex, 1)
    console.log('✅ 日志窗口已关闭:', agent.name, '剩余窗口数:', openLogWindows.value.length)
  }
}

const restartAgent = async (agent: Agent) => {
  try {
    await agentsStore.restartAgent(agent.namespace, agent.name)
    message.success('重启成功')
  } catch (error) {
    message.error('重启失败')
  }
}

const deleteAgent = async (agent: Agent) => {
  try {
    await agentsStore.deleteAgent(agent.namespace, agent.name)
    message.success('删除成功')
  } catch (error) {
    message.error('删除失败')
  }
}

const toggleTheme = () => {
  appStore.toggleTheme()
}

// 工具函数
const getRoleType = (role: string): 'default' | 'info' | 'success' | 'warning' | 'error' => {
  const roleMap: Record<string, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
    'developer': 'success',
    'frontend': 'info',
    'backend': 'info',
    'devops': 'warning',
    'default': 'default'
  }
  return roleMap[role.toLowerCase()] || 'default'
}

const getStatusType = (status: string): 'default' | 'info' | 'success' | 'warning' | 'error' => {
  const statusMap: Record<string, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
    'running': 'success',
    'idle': 'info',
    'error': 'error',
    'creating': 'warning',
    'terminating': 'warning'
  }
  return statusMap[status.toLowerCase()] || 'default'
}

const formatUptime = (uptime: string | undefined): string => {
  if (!uptime) return '-'
  
  // 假设uptime格式为 "1d2h3m" 或 "2h3m" 或 "3m"
  const days = uptime.match(/(\d+)d/)?.[1]
  const hours = uptime.match(/(\d+)h/)?.[1]
  const minutes = uptime.match(/(\d+)m/)?.[1]
  
  const parts = []
  if (days) parts.push(`${days}天`)
  if (hours) parts.push(`${hours}小时`)
  if (minutes) parts.push(`${minutes}分钟`)
  
  return parts.join(' ') || '刚刚启动'
}

// 生命周期
onMounted(async () => {
  try {
    await agentsStore.fetchAgents()
  } catch (error) {
    console.error('获取实例列表失败:', error)
  }
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
  overflow: hidden;
  background: #f5f5f5;
  padding: 16px;
  gap: 16px;
}

.left-panel {
  width: 280px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  
  .panel-header {
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eee;
    
    h3 {
      margin: 0;
      font-size: 16px;
      color: #333;
    }
  }
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.instances-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.instance-item {
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 8px;
  border: 1px solid transparent;
  
  &:hover {
    background: #f5f5f5;
  }
  
  &.active {
    background: #e6f7ff;
    border-color: #1890ff;
  }
  
  &.status-running {
    background: rgba(82, 196, 26, 0.1);
    &.active {
      background: rgba(82, 196, 26, 0.2);
    }
  }
  
  &.status-error {
    background: rgba(245, 34, 45, 0.1);
    &.active {
      background: rgba(245, 34, 45, 0.2);
    }
  }
  
  &.status-idle {
    background: rgba(250, 173, 20, 0.1);
    &.active {
      background: rgba(250, 173, 20, 0.2);
    }
  }
  
  .instance-info {
    .instance-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      
      .instance-name {
        font-weight: 500;
        color: #333;
      }
      
      .instance-actions {
        display: flex;
        gap: 4px;
        opacity: 0.3;
        transition: opacity 0.2s;
      }
    }
    
    .instance-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      
      .instance-uptime {
        font-size: 12px;
        color: #666;
      }
    }
    
    .instance-status {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .restart-count {
        font-size: 12px;
        color: #666;
      }
    }
  }
  
  &:hover .instance-actions,
  &.active .instance-actions {
    opacity: 1;
  }
}

// 日志按钮激活状态样式
.log-button-active {
  background: rgba(24, 144, 255, 0.1) !important;
  border: 1px solid rgba(24, 144, 255, 0.3) !important;
  border-radius: 4px !important;
  
  &:hover {
    background: rgba(24, 144, 255, 0.2) !important;
    border-color: rgba(24, 144, 255, 0.5) !important;
  }
}

// 主题切换组件样式
.theme-toggle {
  .theme-container {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.12);
    }
  }
  
  .theme-icon {
    flex-shrink: 0;
    color: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.1);
    transition: all 0.2s ease;
    
    .theme-container:hover & {
      background: rgba(255, 255, 255, 0.15);
      border-color: rgba(255, 255, 255, 0.2);
      color: rgba(255, 255, 255, 0.9);
    }
  }
  
  .theme-info {
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
    flex: 1;
    
    .theme-name {
      font-size: 14px;
      font-weight: 600;
      color: #ffffff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.2;
    }
    
    .theme-status {
      display: flex;
      align-items: center;
      
      :deep(.n-tag) {
        font-size: 11px;
        height: 18px;
        padding: 0 6px;
        font-weight: 500;
        
        &.n-tag--info {
          background-color: rgba(24, 144, 255, 0.15);
          color: #1890ff;
          border: 1px solid rgba(24, 144, 255, 0.3);
        }
        
        &.n-tag--warning {
          background-color: rgba(250, 173, 20, 0.15);
          color: #faad14;
          border: 1px solid rgba(250, 173, 20, 0.3);
        }
      }
    }
  }
  
  .dropdown-icon {
    flex-shrink: 0;
    color: rgba(255, 255, 255, 0.5);
    transition: all 0.2s ease;
    
    .theme-container:hover & {
      color: rgba(255, 255, 255, 0.8);
      transform: rotate(180deg);
    }
  }
}
</style>
