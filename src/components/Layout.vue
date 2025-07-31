<template>
  <n-config-provider>
    <div class="main-layout">
      <!-- 顶部标题栏 -->
      <div class="header-bar">
        <div class="header-content">
          <div class="header-left">
            <img src="@/assets/Goqgo.svg" alt="GoQGo" class="header-logo" />
            <div class="header-title">
              <h1>GoQGo</h1>
            </div>
            <VersionInfo />
              <n-tooltip>
                <template #trigger>
                  <n-button 
                    text 
                    size="small" 
                    @click="openGitHub"
                    class="github-button"
                  >
                    <template #icon>
                      <n-icon size="16">
                        <svg viewBox="0 0 24 24">
                          <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z"/>
                        </svg>
                      </n-icon>
                    </template>
                  </n-button>
                </template>
                <span>访问GitHub仓库</span>
              </n-tooltip>
          </div>
          <div class="header-right">
            <n-space :size="12" align="center">
              
              <n-tooltip>
                <template #trigger>
                  <n-button 
                    text 
                    size="small" 
                    @click="toggleTheme"
                    class="theme-button"
                  >
                    <template #icon>
                      <n-icon size="16">
                        <SunIcon v-if="appStore.theme === 'dark'" />
                        <MoonIcon v-else />
                      </n-icon>
                    </template>
                  </n-button>
                </template>
                <span>{{ appStore.theme === 'dark' ? '切换到浅色主题' : '切换到深色主题' }}</span>
              </n-tooltip>
              <UserInfo />
            </n-space>
          </div>
        </div>
      </div>

      <!-- 主内容区域 -->
      <div class="content-area">
        <!-- 左侧实例列表 -->
        <div class="left-panel">
          <!-- Namespace 管理 -->
          <div class="namespace-section">
            <NamespaceManager />
          </div>
          
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
          <div class="chat-header">
            <h3>{{ currentNamespace }} 聊天室</h3>
            <n-button 
              size="small" 
              :type="showStatsPanel ? 'primary' : 'default'"
              @click="showStatsPanel = !showStatsPanel"
            >
              <template #icon>
                <n-icon>
                  <svg viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22,21H2V3H4V19H6V17H10V19H12V16H16V19H18V17H22V21Z"/>
                  </svg>
                </n-icon>
              </template>
              统计
            </n-button>
          </div>
          <ChatRoom 
            :namespace="currentNamespace" 
            :show-stats="showStatsPanel" 
            class="chat-room-container"
          />
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
        <!-- 调试信息 -->
        <div v-if="openLogWindows.length > 0" style="display: none;">
          {{ console.log('🔍 渲染日志窗口:', openLogWindows.length, '个窗口', openLogWindows.map(w => ({ name: w.agent.name, show: w.show }))) }}
        </div>
        
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
import { ref, computed, onMounted, onUnmounted, Teleport } from 'vue'
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
import VersionInfo from './VersionInfo.vue'
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
const showStatsPanel = ref(false)
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
const openGitHub = () => {
  window.open('https://github.com/zhoushoujianwork/GOQGO-WEB', '_blank')
}

const selectAgent = (agent: Agent) => {
  console.log('🎯 选择Agent:', agent.name)
  agentsStore.selectAgent(agent)
}

const showAgentDetails = (agent: Agent) => {
  selectedDetails.value = agent
  showDetailsModal.value = true
}

const showAgentLogs = (agent: Agent) => {
  console.log('📋 打开日志窗口:', agent.name, {
    agent: agent,
    namespace: agent.namespace,
    status: agent.status,
    currentWindowCount: openLogWindows.value.length
  })
  
  // 检查是否已经有该实例的日志窗口
  const existingWindowIndex = openLogWindows.value.findIndex(
    window => window.agent.namespace === agent.namespace && window.agent.name === agent.name
  )
  
  console.log('🔍 检查现有窗口:', {
    existingWindowIndex,
    existingWindows: openLogWindows.value.map(w => ({ name: w.agent.name, show: w.show }))
  })
  
  if (existingWindowIndex !== -1) {
    // 如果已存在，触发窗口重置位置
    console.log('🔄 重置现有日志窗口位置:', agent.name)
    const existingWindow = openLogWindows.value[existingWindowIndex]
    
    console.log('🔍 现有窗口状态:', {
      show: existingWindow.show,
      agent: existingWindow.agent.name,
      resetPosition: existingWindow.resetPosition
    })
    
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
  
  console.log('🆕 创建新日志窗口:', {
    agent: newLogWindow.agent.name,
    namespace: newLogWindow.agent.namespace,
    show: newLogWindow.show,
    agentData: newLogWindow.agent
  })
  
  openLogWindows.value.push(newLogWindow)
  console.log('✅ 创建新日志窗口:', agent.name, '当前窗口数:', openLogWindows.value.length)
  
  // 立即检查窗口是否正确添加
  setTimeout(() => {
    console.log('🔍 延迟检查窗口状态:', {
      windowCount: openLogWindows.value.length,
      windows: openLogWindows.value.map(w => ({ 
        name: w.agent.name, 
        show: w.show, 
        namespace: w.agent.namespace 
      }))
    })
  }, 100)
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
    'idle': 'success',      // 空闲状态 - 绿色
    'busy': 'info',         // 忙碌状态 - 蓝色  
    'running': 'info',      // 运行状态 - 蓝色
    'stopped': 'default',   // 停止状态 - 灰色
    'creating': 'warning',  // 创建中状态 - 橙色
    'error': 'error',       // 错误状态 - 红色
    'terminating': 'warning' // 终止中状态 - 橙色
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
    // 设置agents store的事件监听器
    agentsStore.setupEventListeners()
    console.log('✅ Agents store事件监听器已设置')
    
    await agentsStore.fetchAgents()
  } catch (error) {
    console.error('获取实例列表失败:', error)
  }
})

onUnmounted(() => {
  // 清理agents store的事件监听器
  agentsStore.cleanupEventListeners()
  console.log('🧹 Agents store事件监听器已清理')
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
    }
  }
  
  .header-right {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    min-width: 0;
    
    .github-button,
    .theme-button {
      color: rgba(255, 255, 255, 0.9);
      transition: all 0.3s ease;
      
      &:hover {
        color: #ffffff;
        background: rgba(255, 255, 255, 0.1);
        transform: scale(1.05);
      }
    }
    
    .version-info {
      font-size: 12px;
      opacity: 0.8;
      color: rgba(255, 255, 255, 0.9);
      font-weight: 400;
      padding: 4px 8px;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    :deep(.n-space) {
      flex-wrap: nowrap;
      
      .n-space-item {
        flex-shrink: 0;
      }
    }
  }
}

.content-area {
  flex: 1;
  display: flex;
  overflow: hidden;
  background: var(--body-color);
  padding: 16px;
  gap: 16px;
}

.left-panel {
  width: 280px;
  background: var(--card-color);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  
  .namespace-section {
    padding: 12px 16px;
    border-bottom: 1px solid var(--border-color);
    background: var(--body-color);
    border-radius: 8px 8px 0 0;
  }
  
  .panel-header {
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--border-color);
    background: var(--card-color);
    
    h3 {
      margin: 0;
      font-size: 16px;
      color: var(--text-color-base);
      font-weight: 600;
    }
  }
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--card-color);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--border-color);
  
  .chat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border-color);
    background: var(--body-color);
    flex-shrink: 0; // 头部不收缩
    
    h3 {
      margin: 0;
      font-size: 16px;
      color: var(--text-color-base);
      font-weight: 600;
    }
  }
  
  .chat-room-container {
    flex: 1; // 占据剩余空间
    overflow: hidden; // 防止溢出
    background: var(--card-color);
  }
}

.instances-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  background: var(--card-color);
}

.instance-item {
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 8px;
  border: 1px solid var(--border-color);
  background: var(--card-color);
  
  &:hover {
    background: var(--hover-color);
    border-color: var(--primary-color-hover);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  &.active {
    background: var(--primary-color-suppl);
    border-color: var(--primary-color);
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
  }
  
  .instance-info {
    .instance-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      
      .instance-name {
        font-weight: 600;
        color: var(--text-color-base);
        font-size: 14px;
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
        color: var(--text-color-3);
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
      
      // 状态标签自定义颜色
      :deep(.n-tag) {
        font-weight: 500;
        
        // Idle 状态 - 绿色
        &.n-tag--success {
          background-color: rgba(82, 196, 26, 0.1);
          color: #52c41a;
          border: 1px solid rgba(82, 196, 26, 0.3);
        }
        
        // Busy/Running 状态 - 蓝色
        &.n-tag--info {
          background-color: rgba(24, 144, 255, 0.1);
          color: #1890ff;
          border: 1px solid rgba(24, 144, 255, 0.3);
        }
        
        // Stopped 状态 - 灰色
        &.n-tag--default {
          background-color: rgba(140, 140, 140, 0.1);
          color: #8c8c8c;
          border: 1px solid rgba(140, 140, 140, 0.3);
        }
        
        // Creating 状态 - 橙色
        &.n-tag--warning {
          background-color: rgba(250, 173, 20, 0.1);
          color: #faad14;
          border: 1px solid rgba(250, 173, 20, 0.3);
        }
        
        // Error 状态 - 红色
        &.n-tag--error {
          background-color: rgba(245, 34, 45, 0.1);
          color: #f5222d;
          border: 1px solid rgba(245, 34, 45, 0.3);
        }
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
</style>
