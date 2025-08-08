<template>
  <div class="agents-view">
    <!-- 页面头部信息 -->
    <div class="page-header">
      <div class="page-info">
        <h1 class="page-title">{{ isTerminal ? 'AGENT_MANAGEMENT' : '智能体管理' }}</h1>
        <p class="page-description">{{ isTerminal ? 'MANAGE_AI_AGENTS_AND_INSTANCES' : '管理AI智能体和实例' }}</p>
      </div>
      <div class="page-actions">
        <n-button 
          type="primary" 
          @click="showCreateModal = true"
          :class="{ 'btn-8bit': isTerminal }"
        >
          <template #icon>
            <n-icon><AddIcon /></n-icon>
          </template>
          {{ isTerminal ? 'CREATE_AGENT' : '创建智能体' }}
        </n-button>
      </div>
    </div>

    <!-- 页面内容 -->
    <div class="page-content">
      <div class="agents-content" :class="{ 'terminal-mode': isTerminal }">
        <!-- 统计卡片 -->
        <div class="stats-section">
          <n-grid :cols="4" :x-gap="16" :y-gap="16" class="stats-grid">
            <n-grid-item>
              <TerminalStatsCard
                title="总数量"
                :value="filteredAgents.length"
                type="primary"
                icon="total"
                :progress="75"
                subtitle="TOTAL_AGENTS"
                trend="+12%"
                trend-direction="up"
              />
            </n-grid-item>
            <n-grid-item>
              <TerminalStatsCard
                title="运行中"
                :value="runningCount"
                type="success"
                icon="running"
                :progress="runningProgress"
                subtitle="ACTIVE_INSTANCES"
                :trend="runningTrend"
                trend-direction="up"
              />
            </n-grid-item>
            <n-grid-item>
              <TerminalStatsCard
                title="已停止"
                :value="stoppedCount"
                type="warning"
                icon="stopped"
                :progress="stoppedProgress"
                subtitle="STOPPED_INSTANCES"
                :trend="stoppedTrend"
                trend-direction="down"
              />
            </n-grid-item>
            <n-grid-item>
              <TerminalStatsCard
                title="错误状态"
                :value="errorCount"
                type="error"
                icon="error"
                :progress="errorProgress"
                subtitle="ERROR_INSTANCES"
                :trend="errorTrend"
                trend-direction="up"
              />
            </n-grid-item>
          </n-grid>
        </div>

        <!-- 主要内容区域 -->
        <n-card class="agents-table-card" :class="{ 'terminal-window': isTerminal }" :bordered="false">
          <template #header>
            <div class="table-header" :class="{ 'terminal-header': isTerminal }">
              <div class="header-left">
                <span class="header-title" :class="{ 'terminal-text': isTerminal }">
                  {{ isTerminal ? 'AGENT_INSTANCES' : '智能体实例' }}
                </span>
              </div>
              <div class="header-controls">
                <n-space :size="12">
                  <n-input
                    v-model:value="searchKeyword"
                    :placeholder="isTerminal ? 'SEARCH_AGENTS...' : '搜索智能体...'"
                    clearable
                    style="width: 200px"
                    :class="{ 'terminal-input': isTerminal }"
                  >
                    <template #prefix>
                      <n-icon><PersonOutline /></n-icon>
                    </template>
                  </n-input>
                  <n-button
                    @click="handleRefresh"
                    :loading="loading"
                    :class="{ 'btn-8bit': isTerminal }"
                  >
                    <template #icon>
                      <n-icon><RefreshOutline /></n-icon>
                    </template>
                    {{ isTerminal ? 'REFRESH' : '刷新' }}
                  </n-button>
                  <n-button
                    type="primary"
                    @click="showCreateModal = true"
                    :class="{ 'btn-8bit': isTerminal }"
                  >
                    <template #icon>
                      <n-icon><AddOutline /></n-icon>
                    </template>
                    {{ isTerminal ? 'CREATE_AGENT' : '创建智能体' }}
                  </n-button>
                </n-space>
              </div>
            </div>
          </template>

          <n-data-table
            :columns="columns"
            :data="filteredAgents"
            :loading="loading"
            :pagination="pagination"
            :row-key="(row: any) => row.name"
            :class="{ 'terminal-table': isTerminal }"
          />
        </n-card>

        <!-- 创建智能体模态框 -->
        <n-modal
          v-model:show="showCreateModal"
          preset="card"
          :title="isTerminal ? 'CREATE_NEW_AGENT' : '创建新智能体'"
          style="width: 600px"
          :class="{ 'terminal-modal': isTerminal }"
        >
          <n-form
            ref="createFormRef"
            :model="createForm"
            :rules="createRules"
            label-placement="left"
            label-width="auto"
            :class="{ 'terminal-form': isTerminal }"
          >
            <n-form-item :label="isTerminal ? 'AGENT_NAME' : '智能体名称'" path="name">
              <n-input
                v-model:value="createForm.name"
                :placeholder="isTerminal ? 'ENTER_AGENT_NAME' : '请输入智能体名称'"
                :class="{ 'terminal-input': isTerminal }"
              />
            </n-form-item>
            <n-form-item :label="isTerminal ? 'NAMESPACE' : '命名空间'" path="namespace">
              <n-input
                v-model:value="createForm.namespace"
                :placeholder="isTerminal ? 'ENTER_NAMESPACE' : '请输入命名空间'"
                :class="{ 'terminal-input': isTerminal }"
              />
            </n-form-item>
            <n-form-item :label="isTerminal ? 'ROLE' : '角色'" path="role">
              <n-input
                v-model:value="createForm.role"
                :placeholder="isTerminal ? 'ENTER_ROLE' : '请输入角色'"
                :class="{ 'terminal-input': isTerminal }"
              />
            </n-form-item>
          </n-form>
          
          <template #footer>
            <n-space justify="end">
              <n-button @click="showCreateModal = false" :class="{ 'btn-8bit': isTerminal }">
                {{ isTerminal ? 'CANCEL' : '取消' }}
              </n-button>
              <n-button
                type="primary"
                @click="handleCreate"
                :loading="creating"
                :class="{ 'btn-8bit': isTerminal }"
              >
                {{ isTerminal ? 'CREATE' : '创建' }}
              </n-button>
            </n-space>
          </template>
        </n-modal>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, h } from 'vue'
import {
  NGrid,
  NGridItem,
  NCard,
  NDataTable,
  NButton,
  NIcon,
  NSpace,
  NSelect,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NTag,
  useMessage,
  type DataTableColumns
} from 'naive-ui'
import {
  AddOutline,
  RefreshOutline,
  PlayOutline,
  PauseOutline,
  TrashOutline,
  SendOutline,
  PersonOutline
} from '@vicons/ionicons5'
import { useTheme } from '@/utils/theme'
import { formatRelativeTime, useTimeManager, formatAgentUptime } from '@/utils/timeManager'
import { agentApi } from '@/api/agents'
import { useUserStore } from '@/stores/user'
import TerminalStatsCard from '@/components/TerminalStatsCard.vue'
import PageLayout from '@/components/PageLayout.vue'
import { AddIcon } from '@/components/icons'

const { isTerminal } = useTheme()
const message = useMessage()
const userStore = useUserStore()

// 使用时间管理器
const { currentTime, cleanup } = useTimeManager()

// 响应式数据
const agents = ref<any[]>([])
const loading = ref(false)
const creating = ref(false)
const searchKeyword = ref('')
const showCreateModal = ref(false)
const createFormRef = ref()

// 创建表单
const createForm = ref({
  name: '',
  namespace: 'default',
  role: 'assistant'
})

// 表单验证规则
const createRules = {
  name: [
    { required: true, message: '请输入智能体名称', trigger: 'blur' }
  ],
  namespace: [
    { required: true, message: '请输入命名空间', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请输入角色', trigger: 'blur' }
  ]
}

// 计算属性
const filteredAgents = computed(() => {
  if (!searchKeyword.value) return agents.value
  return agents.value.filter(agent => 
    agent.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
    agent.namespace.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
    agent.role.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

const runningCount = computed(() => 
  agents.value.filter(agent => agent.status === 'Running').length
)

const stoppedCount = computed(() => 
  agents.value.filter(agent => agent.status === 'Stopped').length
)

const errorCount = computed(() => 
  agents.value.filter(agent => agent.status === 'Error').length
)

const runningProgress = computed(() => 
  agents.value.length > 0 ? Math.round((runningCount.value / agents.value.length) * 100) : 0
)

const stoppedProgress = computed(() => 
  agents.value.length > 0 ? Math.round((stoppedCount.value / agents.value.length) * 100) : 0
)

const errorProgress = computed(() => 
  agents.value.length > 0 ? Math.round((errorCount.value / agents.value.length) * 100) : 0
)

const runningTrend = computed(() => '+5%')
const stoppedTrend = computed(() => '-2%')
const errorTrend = computed(() => '+1%')

// 分页配置
const pagination = {
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  showQuickJumper: true
}

// 表格列配置
const columns: DataTableColumns = [
  {
    title: '名称',
    key: 'name',
    width: 200,
    render: (row: any) => h('span', { class: isTerminal.value ? 'terminal-text' : '' }, row.name)
  },
  {
    title: '命名空间',
    key: 'namespace',
    width: 120,
    render: (row: any) => h('span', { class: isTerminal.value ? 'terminal-text' : '' }, row.namespace)
  },
  {
    title: '角色',
    key: 'role',
    width: 120,
    render: (row: any) => h('span', { class: isTerminal.value ? 'terminal-text' : '' }, row.role)
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row: any) => {
      const statusMap: Record<string, { type: any, text: string }> = {
        'Running': { type: 'success', text: '运行中' },
        'Stopped': { type: 'warning', text: '已停止' },
        'Error': { type: 'error', text: '错误' }
      }
      const status = statusMap[row.status] || { type: 'default', text: row.status }
      return h(NTag, { 
        type: status.type,
        class: isTerminal.value ? 'terminal-tag' : ''
      }, () => isTerminal.value ? row.status.toUpperCase() : status.text)
    }
  },
  {
    title: '运行时间',
    key: 'uptime',
    width: 150,
    render: (row: any) => {
      if (row.status !== 'Running') return '-'
      const uptime = formatAgentUptime(row.startTime, currentTime.value)
      return h('span', { class: isTerminal.value ? 'terminal-text' : '' }, uptime)
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    render: (row: any) => {
      return h(NSpace, { size: 8 }, () => [
        h(NButton, {
          size: 'small',
          type: row.status === 'Running' ? 'warning' : 'primary',
          onClick: () => handleToggleAgent(row),
          class: isTerminal.value ? 'btn-8bit' : ''
        }, () => row.status === 'Running' ? '停止' : '启动'),
        h(NButton, {
          size: 'small',
          type: 'error',
          onClick: () => handleDeleteAgent(row),
          class: isTerminal.value ? 'btn-8bit' : ''
        }, () => '删除')
      ])
    }
  }
]

// 方法
const handleRefresh = async () => {
  loading.value = true
  try {
    const response = await agentApi.list()
    agents.value = response.data || []
  } catch (error) {
    console.error('刷新智能体列表失败:', error)
    message.error('刷新失败')
  } finally {
    loading.value = false
  }
}

const handleCreate = async () => {
  try {
    await createFormRef.value?.validate()
    creating.value = true
    
    await agentApi.create(createForm.value)
    message.success('智能体创建成功')
    showCreateModal.value = false
    
    // 重置表单
    createForm.value = {
      name: '',
      namespace: 'default',
      role: 'assistant'
    }
    
    // 刷新列表
    await handleRefresh()
  } catch (error) {
    console.error('创建智能体失败:', error)
    message.error('创建失败')
  } finally {
    creating.value = false
  }
}

const handleToggleAgent = async (agent: any) => {
  try {
    if (agent.status === 'Running') {
      await agentApi.stop(agent.name, agent.namespace)
      message.success('智能体已停止')
    } else {
      await agentApi.start(agent.name, agent.namespace)
      message.success('智能体已启动')
    }
    await handleRefresh()
  } catch (error) {
    console.error('操作失败:', error)
    message.error('操作失败')
  }
}

const handleDeleteAgent = async (agent: any) => {
  try {
    await agentApi.delete(agent.name, agent.namespace)
    message.success('智能体已删除')
    await handleRefresh()
  } catch (error) {
    console.error('删除失败:', error)
    message.error('删除失败')
  }
}

// 生命周期
onMounted(() => {
  handleRefresh()
})

onUnmounted(() => {
  cleanup()
})
</script>

<style scoped lang="scss">
.agents-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--page-bg);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  background: var(--header-bg);
  border-bottom: 1px solid var(--border-color);
}

.page-info {
  flex: 1;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-color-1);
  margin-bottom: 8px;
}

.page-description {
  font-size: 16px;
  color: var(--text-color-2);
}

.page-actions {
  display: flex;
  gap: 12px;
}

.page-content {
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.agents-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;

  &.terminal-mode {
    background: var(--terminal-bg);
  }
}

.stats-section {
  .stats-grid {
    :deep(.n-grid) {
      gap: 16px;
    }
  }
}

.agents-table-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  
  &.terminal-window {
    background: var(--terminal-card-bg);
    border: 1px solid var(--terminal-border);
  }
  
  :deep(.n-card__content) {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0;
  }
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
  
  &.terminal-header {
    background: var(--terminal-header-bg);
    border-bottom-color: var(--terminal-border);
  }
  
  .header-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-color-1);
    
    &.terminal-text {
      color: var(--terminal-text);
      font-family: 'Courier New', monospace;
    }
  }
  
  .header-controls {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

:deep(.n-data-table) {
  flex: 1;
  
  &.terminal-table {
    background: var(--terminal-table-bg);
    
    .n-data-table-th {
      background: var(--terminal-header-bg);
      color: var(--terminal-text);
      font-family: 'Courier New', monospace;
    }
    
    .n-data-table-td {
      background: var(--terminal-cell-bg);
      border-color: var(--terminal-border);
    }
  }
}

// Terminal模式样式
.terminal-mode {
  .terminal-input {
    :deep(.n-input) {
      background: var(--terminal-input-bg);
      border-color: var(--terminal-border);
      color: var(--terminal-text);
      font-family: 'Courier New', monospace;
    }
  }
  
  .btn-8bit {
    background: var(--terminal-button-bg);
    border-color: var(--terminal-border);
    color: var(--terminal-text);
    font-family: 'Courier New', monospace;
    
    &:hover {
      background: var(--terminal-button-hover-bg);
    }
  }
  
  .terminal-tag {
    font-family: 'Courier New', monospace;
    text-transform: uppercase;
  }
  
  .terminal-text {
    color: var(--terminal-text);
    font-family: 'Courier New', monospace;
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .stats-grid {
    :deep(.n-grid) {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .page-actions {
    width: 100%;
    justify-content: center;
  }

  .table-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;

    .header-controls {
      .n-space {
        justify-content: center;
      }
    }
  }
}

@media (max-width: 480px) {
  .stats-grid {
    :deep(.n-grid) {
      grid-template-columns: 1fr;
    }
  }
}
</style>
