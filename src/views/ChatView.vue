<template>
  <div class="chat-view" :class="{ 'terminal-mode': isTerminal }">
    <!-- 左侧面板 -->
    <aside class="left-panel" :class="{ 'terminal-panel': isTerminal }">
      <!-- 上部分：Namespace管理 -->
      <div class="namespace-section">
        <NamespaceManager />
      </div>

      <!-- 下部分：Agents列表 -->
      <div class="agents-section">
        <div class="panel-header" :class="{ 'terminal-header': isTerminal }">
          <h3>{{ isTerminal ? 'Q_CLI_INSTANCES' : 'Q CLI 实例' }}</h3>
          <n-button 
            size="small" 
            type="primary" 
            @click="handleCreateClick"
            :class="{ 'btn-8bit': isTerminal }"
          >
            <template #icon>
              <n-icon><AddIcon /></n-icon>
            </template>
          </n-button>
        </div>

        <div class="instances-list">
          <!-- 实例列表 -->
          <div
            v-for="agent in agents"
            :key="agent.name"
            class="instance-item"
            :class="[
              { active: selectedAgent?.name === agent.name },
              `status-${agent.status.toLowerCase()}`,
              { 'terminal-instance': isTerminal }
            ]"
            @click="selectAgent(agent)"
          >
            <div class="instance-info">
              <div class="instance-header">
                <span class="instance-name" :class="{ 'terminal-text': isTerminal }">
                  {{ agent.name }}
                </span>
                <div class="instance-actions">
                  <n-tooltip>
                    <template #trigger>
                      <n-button
                        text
                        size="tiny"
                        :type="isLogWindowOpen(agent) ? 'primary' : 'default'"
                        :class="{ 
                          'log-button-active': isLogWindowOpen(agent),
                          'terminal-button': isTerminal 
                        }"
                        @click.stop="showAgentLogs(agent)"
                      >
                        <template #icon>
                          <n-icon>
                            <svg viewBox="0 0 24 24">
                              <path
                                fill="currentColor"
                                d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,19H5V5H19V19Z"
                              />
                            </svg>
                          </n-icon>
                        </template>
                      </n-button>
                    </template>
                    {{ isLogWindowOpen(agent) ? '重置日志窗口' : '查看日志' }}
                  </n-tooltip>
                  <n-tooltip>
                    <template #trigger>
                      <n-button 
                        text 
                        size="tiny" 
                        @click.stop="showAgentDetails(agent)"
                        :class="{ 'terminal-button': isTerminal }"
                      >
                        <template #icon>
                          <n-icon><InfoIcon /></n-icon>
                        </template>
                      </n-button>
                    </template>
                    查看详情
                  </n-tooltip>
                  <n-tooltip>
                    <template #trigger>
                      <n-button 
                        text 
                        size="tiny" 
                        @click.stop="restartAgent(agent)"
                        :class="{ 'terminal-button': isTerminal }"
                      >
                        <template #icon>
                          <n-icon><RefreshIcon /></n-icon>
                        </template>
                      </n-button>
                    </template>
                    重启实例
                  </n-tooltip>
                  <n-popconfirm @positive-click="deleteAgent(agent)">
                    <template #trigger>
                      <n-button 
                        text 
                        size="tiny" 
                        @click.stop
                        :class="{ 'terminal-button': isTerminal }"
                      >
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
                <n-tag 
                  :type="getRoleType(agent.role)" 
                  size="small" 
                  round
                  :class="{ 'terminal-tag': isTerminal }"
                >
                  {{ agent.role }}
                </n-tag>
                <span class="instance-uptime" :class="{ 'terminal-text': isTerminal }">
                  运行时间: {{ formatUptime(agent.age) }}
                </span>
              </div>
              <div class="instance-status">
                <n-tag 
                  :type="getStatusType(agent.status)" 
                  size="small" 
                  round
                  :class="{ 'terminal-tag': isTerminal }"
                >
                  {{ agent.status }}
                </n-tag>
                <span class="restart-count" v-if="agent.restartCount" :class="{ 'terminal-text': isTerminal }">
                  重启次数: {{ agent.restartCount }}
                </span>
              </div>
            </div>
          </div>

          <!-- 空状态显示 -->
          <div v-if="!agents.length && !agentsStore.loading" class="empty-state" :class="{ 'terminal-empty': isTerminal }">
            <div class="empty-icon">
              <n-icon size="48" :color="isTerminal ? '#00ff41' : 'var(--text-color-3)'">
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"
                  />
                </svg>
              </n-icon>
            </div>
            <div class="empty-text">
              <p class="empty-title" :class="{ 'terminal-text': isTerminal }">
                {{ isTerminal ? 'NO_INSTANCES' : '暂无实例' }}
              </p>
              <p class="empty-description" :class="{ 'terminal-text': isTerminal }">
                {{ isTerminal ? 'NO_AGENTS_IN_NAMESPACE' : '当前命名空间下没有可用的Agent实例' }}<br />
                {{ isTerminal ? 'CLICK_PLUS_TO_CREATE' : '点击右上角的 + 按钮创建新实例' }}
              </p>
            </div>
          </div>

          <!-- 加载状态 -->
          <div v-if="agentsStore.loading" class="loading-state" :class="{ 'terminal-loading': isTerminal }">
            <n-spin size="medium">
              <div class="loading-text" :class="{ 'terminal-text': isTerminal }">
                {{ isTerminal ? 'LOADING_INSTANCES' : '正在加载实例列表...' }}
              </div>
            </n-spin>
          </div>
        </div>
      </div>
    </aside>

    <!-- 右侧聊天区域 -->
    <section class="right-panel">
      <!-- 上部分：聊天内容 -->
      <div class="chat-content">
        <div class="chat-header" :class="{ 'terminal-header': isTerminal }">
          <h3 :class="{ 'terminal-text': isTerminal }">
            {{ safeCurrentNamespace }} {{ isTerminal ? 'CHAT_ROOM' : '聊天室' }}
          </h3>
          <n-button
            size="small"
            :type="showStatsPanel ? 'primary' : 'default'"
            @click="showStatsPanel = !showStatsPanel"
            :class="{ 'btn-8bit': isTerminal }"
          >
            <template #icon>
              <n-icon>
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22,21H2V3H4V19H6V17H10V19H12V16H16V19H18V17H22V21Z"
                  />
                </svg>
              </n-icon>
            </template>
            {{ isTerminal ? 'STATS' : '统计' }}
          </n-button>
        </div>
        <ChatRoom
          :namespace="safeCurrentNamespace || 'default'"
          :show-stats="showStatsPanel"
        />
      </div>
    </section>

    <!-- 模态框 -->
    <AgentCreateModal
      v-model:show="showCreateModal"
      :namespace="safeCurrentNamespace"
      @created="handleAgentCreated"
    />

    <AgentLogsModal
      v-model:show="showLogsModal"
      :agent="selectedAgentForLogs"
      @close="handleLogsModalClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { NButton, NIcon, NTooltip, NPopconfirm, NTag, NSpin } from 'naive-ui'
import { useAgentsStore } from '@/stores/agents'
import { useNamespacesStore } from '@/stores/namespaces'
import { useTheme } from '@/utils/theme'
import { formatAgentUptime } from '@/utils/timeManager'
import NamespaceManager from '@/components/NamespaceManager.vue'
import ChatRoom from '@/components/ChatRoom.vue'
import AgentCreateModal from '@/components/AgentCreateModal.vue'
import AgentLogsModal from '@/components/AgentLogsModal.vue'
import { 
  Add as AddIcon,
  InformationCircle as InfoIcon,
  Refresh as RefreshIcon,
  Trash as DeleteIcon
} from '@vicons/ionicons5'

const { isTerminal } = useTheme()
const agentsStore = useAgentsStore()
const namespacesStore = useNamespacesStore()

// 从stores获取状态
const { agents, selectedAgent } = storeToRefs(agentsStore)
const { currentNamespace } = storeToRefs(namespacesStore)

// 响应式数据
const showCreateModal = ref(false)
const showLogsModal = ref(false)
const selectedAgentForLogs = ref(null)
const showStatsPanel = ref(false)

// 计算属性
const safeCurrentNamespace = computed(() => currentNamespace.value || 'default')

// 方法
const handleCreateClick = () => {
  showCreateModal.value = true
}

const selectAgent = (agent: any) => {
  agentsStore.selectAgent(agent)
}

const showAgentLogs = (agent: any) => {
  selectedAgentForLogs.value = agent
  showLogsModal.value = true
}

const showAgentDetails = (agent: any) => {
  // 实现查看详情的逻辑
  console.log('查看Agent详情:', agent)
}

const restartAgent = async (agent: any) => {
  try {
    await agentsStore.restartAgent(safeCurrentNamespace.value, agent.name)
  } catch (error) {
    console.error('重启Agent失败:', error)
  }
}

const deleteAgent = async (agent: any) => {
  try {
    await agentsStore.deleteAgent(safeCurrentNamespace.value, agent.name)
  } catch (error) {
    console.error('删除Agent失败:', error)
  }
}

const handleAgentCreated = () => {
  showCreateModal.value = false
  // 刷新agents列表
  agentsStore.fetchAgents(safeCurrentNamespace.value)
}

const handleLogsModalClose = () => {
  showLogsModal.value = false
  selectedAgentForLogs.value = null
}

const isLogWindowOpen = (agent: any) => {
  return selectedAgentForLogs.value && (selectedAgentForLogs.value as any).name === agent.name && showLogsModal.value
}

const formatUptime = (age: string | undefined) => {
  return formatAgentUptime(age || '')
}

const getRoleType = (role: string): 'success' | 'warning' | 'error' | 'info' | 'default' => {
  const roleMap: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
    assistant: 'success',
    coder: 'info',
    analyst: 'warning',
    support: 'default'
  }
  return roleMap[role] || 'default'
}

const getStatusType = (status: string): 'success' | 'warning' | 'error' | 'info' => {
  const statusMap: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
    running: 'success',
    idle: 'warning',
    error: 'error',
    Creating: 'info',
    Terminating: 'warning'
  }
  return statusMap[status] || 'default'
}

// 生命周期
onMounted(() => {
  // 初始化时获取agents列表
  agentsStore.fetchAgents(safeCurrentNamespace.value)
})

onUnmounted(() => {
  // 清理
  agentsStore.cleanup()
})
</script>

<style scoped lang="scss">
.chat-view {
  display: flex;
  height: 100%; /* 适应父容器高度 */
  min-height: 0; /* 关键：允许flex子元素收缩 */
  background: var(--bg-color, #ffffff);
  transition: all 0.3s ease;
  /* 移除padding-top，因为header现在占用布局空间 */

  &.terminal-mode {
    background: var(--terminal-bg, #000000);
  }
}

// 左侧面板
.left-panel {
  width: 360px;
  background: var(--panel-bg, #f8f9fa);
  border-right: 1px solid var(--border-color, #e5e7eb);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: all 0.3s ease;
  overflow: hidden;
  height: calc(100vh - 90px - 36px); /* 更新高度计算，减去header(90px)和footer高度 */

  &.terminal-panel {
    background: var(--terminal-panel-bg, #111111);
    border-right: 1px solid var(--terminal-border, #00ff41);
  }
}

// Namespace管理区域（上部分）
.namespace-section {
  flex-shrink: 0;
  padding: 16px;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  // 移除固定的高度限制，让容器自适应内容高度
  // min-height: 120px;
  // max-height: 200px;

  .terminal-mode & {
    border-bottom: 1px solid var(--terminal-border, #00ff41);
  }
}

// Agents列表区域（下部分）
.agents-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.panel-header {
  flex-shrink: 0;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color, #e5e7eb);

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary, #1f2937);
  }

  &.terminal-header {
    border-bottom: 1px solid var(--terminal-border, #00ff41);

    h3 {
      color: #00ff41;
      font-family: 'Courier New', monospace;
      text-transform: uppercase;
    }
  }
}

.instances-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  min-height: 0;
}

.instance-item {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--hover-bg, #f3f4f6);
    border-color: var(--primary-color, #3b82f6);
  }

  &.active {
    background: var(--primary-color, #3b82f6);
    border-color: var(--primary-color, #3b82f6);
    color: white;
  }

  &.terminal-instance {
    background: var(--terminal-card-bg, #000000);
    border: 1px solid var(--terminal-border, #00ff41);

    &:hover {
      background: rgba(0, 255, 65, 0.1);
      box-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
    }
  }
}

.instance-info {
  .instance-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .instance-name {
    font-weight: 600;
    font-size: 14px;
    color: var(--text-primary, #1f2937);

    &.terminal-text {
      color: #00ff41;
      font-family: 'Courier New', monospace;
    }
  }

  .instance-actions {
    display: flex;
    gap: 4px;
  }

  .instance-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .instance-uptime {
    font-size: 12px;
    color: var(--text-secondary, #6b7280);

    &.terminal-text {
      color: #00ff41;
      font-family: 'Courier New', monospace;
    }
  }

  .instance-status {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .restart-count {
    font-size: 12px;
    color: var(--text-secondary, #6b7280);

    &.terminal-text {
      color: #00ff41;
      font-family: 'Courier New', monospace;
    }
  }
}

.terminal-button {
  color: #00ff41;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
  font-size: 12px;

  &:hover {
    background: rgba(0, 255, 65, 0.1);
    color: #00ff41;
    box-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
  }
}

.log-button-active {
  background: rgba(0, 255, 65, 0.2) !important;
  color: #00ff41 !important;
  box-shadow: 0 0 15px rgba(0, 255, 65, 0.5) !important;
}

.terminal-tag {
  color: #00ff41;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
}

// 右侧聊天区域
.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--chat-bg, #ffffff);
  min-height: 0; /* 关键：允许flex子元素收缩 */
  overflow: hidden;
  height: calc(100vh - 90px - 36px); /* 减去页头高度(90px)和页脚高度(36px) */

  .terminal-mode & {
    background: var(--terminal-chat-bg, #000000);
  }
}

// 聊天内容区域
.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; /* 关键：允许flex子元素收缩 */
  overflow: hidden;
  height: 100%; /* 确保占满父容器高度 */
}

.chat-header {
  flex-shrink: 0;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color, #e5e7eb);

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary, #1f2937);
  }

  &.terminal-header {
    border-bottom: 2px solid #333333;
    background: #0a0a0a;
    position: relative;
    overflow: hidden;

    h3 {
      color: #ffffff;
      font-family: 'Courier New', monospace;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
  }
}

.btn-8bit {
  background: #0a0a0a !important;
  border: 2px solid #00ff41 !important;
  color: #00ff41 !important;
  font-family: 'Courier New', monospace !important;
  text-transform: uppercase !important;
  font-weight: 700 !important;
  letter-spacing: 1px !important;
  border-radius: 0 !important;
  transition: all 0.3s ease !important;
  position: relative !important;

  &:hover {
    background: #00ff41 !important;
    color: #000000 !important;
    transform: translateY(-2px) !important;
  }

  &:active {
    transform: translateY(0) !important;
  }
}

// 空状态和加载状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;

  &.terminal-empty {
    .empty-text {
      .empty-title,
      .empty-description {
        color: #ffffff;
        font-family: 'Courier New', monospace;
        letter-spacing: 1px;
      }
    }
  }
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;

  &.terminal-loading {
    .loading-text {
      color: #ffffff;
      font-family: 'Courier New', monospace;
      letter-spacing: 1px;
    }
  }
}

.loading-text {
  margin-top: 8px;
  font-size: 14px;
  color: var(--text-secondary, #6b7280);
}

// 响应式设计
@media (max-width: 768px) {
  .chat-view {
    flex-direction: column;
    padding-top: 78px; /* 移动端页头高度调整到 78px */
  }

  .left-panel {
    width: 100%;
    height: 300px;
    height: calc(100vh - 78px - 36px - 300px); /* 调整移动端高度计算 */
  }

  .right-panel {
    flex: 1;
    height: calc(100vh - 78px - 36px - 300px); /* 调整移动端高度计算 */
  }
}
</style>
