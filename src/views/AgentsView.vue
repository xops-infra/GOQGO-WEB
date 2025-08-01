<template>
  <div class="agents-view" :class="{ 'terminal-mode': isTerminal }">
    <!-- Terminal风格的Header -->
    <TerminalHeader />

    <div class="view-content">
      <!-- 统计卡片 -->
      <div class="stats-section">
        <n-grid :cols="4" :x-gap="16" :y-gap="16" class="stats-grid">
          <n-grid-item>
            <TerminalStatsCard
              title="总数量"
              :value="agents.length"
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
              title="空闲状态"
              :value="idleCount"
              type="warning"
              icon="idle"
              :progress="idleProgress"
              subtitle="IDLE_INSTANCES"
              :trend="idleTrend"
              trend-direction="stable"
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
              trend-direction="down"
            />
          </n-grid-item>
        </n-grid>
      </div>

      <!-- 智能体列表 -->
      <div class="agents-list-section">
        <n-card :class="{ 'terminal-window': isTerminal }" :bordered="false">
          <template #header>
            <div class="list-header" :class="{ 'terminal-header-content': isTerminal }">
              <div class="header-title">
                <span v-if="isTerminal" class="terminal-prompt">AGENT_INSTANCES</span>
                <span v-else>智能体列表</span>
              </div>
              <div class="header-controls">
                <n-space>
                  <n-select
                    v-model:value="selectedNamespace"
                    :options="namespaceOptions"
                    placeholder="选择命名空间"
                    style="width: 150px"
                    :class="{ 'terminal-select': isTerminal }"
                    @update:value="handleNamespaceChange"
                  />
                  <n-button
                    @click="refreshAgents"
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
            :data="agents"
            :loading="loading"
            :pagination="pagination"
            :class="{ 'terminal-table': isTerminal }"
          />
        </n-card>
      </div>
    </div>

    <!-- 创建智能体模态框 -->
    <n-modal
      v-model:show="showCreateModal"
      preset="dialog"
      :title="isTerminal ? 'CREATE_NEW_AGENT' : '创建智能体'"
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
        <n-form-item :label="isTerminal ? 'AGENT_NAME' : '名称'" path="name">
          <n-input
            v-model:value="createForm.name"
            :placeholder="isTerminal ? 'ENTER_AGENT_NAME' : '输入智能体名称'"
            :class="{ 'terminal-input': isTerminal }"
          />
        </n-form-item>

        <n-form-item :label="isTerminal ? 'ROLE' : '角色'" path="role">
          <n-select
            v-model:value="createForm.role"
            :options="roleOptions"
            :placeholder="isTerminal ? 'SELECT_ROLE' : '选择角色'"
            :class="{ 'terminal-select': isTerminal }"
          />
        </n-form-item>

        <n-form-item :label="isTerminal ? 'NAMESPACE' : '命名空间'" path="namespace">
          <n-input
            v-model:value="createForm.namespace"
            :placeholder="isTerminal ? 'ENTER_NAMESPACE' : '输入命名空间'"
            :class="{ 'terminal-input': isTerminal }"
          />
        </n-form-item>

        <n-form-item :label="isTerminal ? 'CONTEXT' : '上下文'" path="context">
          <n-input
            v-model:value="createForm.context"
            type="textarea"
            :placeholder="isTerminal ? 'ENTER_CONTEXT_INFO' : '输入智能体上下文信息'"
            :autosize="{ minRows: 3, maxRows: 6 }"
            :class="{ 'terminal-textarea': isTerminal }"
          />
        </n-form-item>
      </n-form>

      <template #action>
        <n-space>
          <n-button @click="showCreateModal = false" :class="{ 'btn-8bit': isTerminal }">
            {{ isTerminal ? 'CANCEL' : '取消' }}
          </n-button>
          <n-button
            type="primary"
            @click="handleCreateAgent"
            :loading="creating"
            :class="{ 'btn-8bit': isTerminal }"
          >
            {{ isTerminal ? 'CREATE' : '创建' }}
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, h } from 'vue'
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
  SendOutline
} from '@vicons/ionicons5'
import { useTheme } from '@/utils/theme'
import TerminalHeader from '@/components/TerminalHeader.vue'
import TerminalStatsCard from '@/components/TerminalStatsCard.vue'

const { isTerminal } = useTheme()
const message = useMessage()

// 响应式数据
const agents = ref<any[]>([])
const loading = ref(false)
const creating = ref(false)
const showCreateModal = ref(false)
const selectedNamespace = ref('default')
const createFormRef = ref()

// 表单数据
const createForm = ref({
  name: '',
  role: '',
  namespace: 'default',
  context: ''
})

// 表单验证规则
const createRules = {
  name: [{ required: true, message: '请输入智能体名称', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  namespace: [{ required: true, message: '请输入命名空间', trigger: 'blur' }]
}

// 计算属性
const runningCount = computed(
  () => agents.value.filter((agent) => agent.status === 'running').length
)

const idleCount = computed(() => agents.value.filter((agent) => agent.status === 'idle').length)

const errorCount = computed(() => agents.value.filter((agent) => agent.status === 'error').length)

// Terminal风格的进度计算
const runningProgress = computed(() =>
  agents.value.length > 0 ? Math.round((runningCount.value / agents.value.length) * 100) : 0
)

const idleProgress = computed(() =>
  agents.value.length > 0 ? Math.round((idleCount.value / agents.value.length) * 100) : 0
)

const errorProgress = computed(() =>
  agents.value.length > 0 ? Math.round((errorCount.value / agents.value.length) * 100) : 0
)

// 趋势数据
const runningTrend = computed(() => '+8%')
const idleTrend = computed(() => '0%')
const errorTrend = computed(() => '-15%')

// 命名空间选项
const namespaceOptions = computed(() => [
  { label: isTerminal.value ? 'DEFAULT' : 'default', value: 'default' },
  { label: isTerminal.value ? 'PRODUCTION' : 'production', value: 'production' },
  { label: isTerminal.value ? 'DEVELOPMENT' : 'development', value: 'development' },
  { label: isTerminal.value ? 'TESTING' : 'testing', value: 'testing' }
])

// 角色选项
const roleOptions = computed(() => [
  { label: isTerminal.value ? 'ASSISTANT' : '通用助手', value: 'assistant' },
  { label: isTerminal.value ? 'CODER' : '代码助手', value: 'coder' },
  { label: isTerminal.value ? 'ANALYST' : '数据分析师', value: 'analyst' },
  { label: isTerminal.value ? 'SUPPORT' : '客服助手', value: 'support' }
])

// 表格列定义
const columns = computed<DataTableColumns>(() => {
  const baseColumns = [
    {
      title: isTerminal.value ? 'AGENT_ID' : '名称',
      key: 'name',
      render: (row: any) => {
        return h(
          'span',
          {
            class: { 'terminal-text': isTerminal.value }
          },
          isTerminal.value ? `[${row.id}] ${row.name}`.toUpperCase() : row.name
        )
      }
    },
    {
      title: isTerminal.value ? 'NAMESPACE' : '命名空间',
      key: 'namespace',
      render: (row: any) => {
        return h(
          'span',
          {
            class: { 'terminal-text': isTerminal.value }
          },
          isTerminal.value ? row.namespace.toUpperCase() : row.namespace
        )
      }
    },
    {
      title: isTerminal.value ? 'ROLE' : '角色',
      key: 'role',
      render: (row: any) => {
        return h(
          'span',
          {
            class: { 'terminal-text': isTerminal.value }
          },
          isTerminal.value ? row.role.toUpperCase() : row.role
        )
      }
    },
    {
      title: isTerminal.value ? 'STATUS' : '状态',
      key: 'status',
      render: (row: any) => {
        const statusMap = {
          running: {
            text: isTerminal.value ? 'ONLINE' : '运行中',
            type: 'success',
            class: 'status-running'
          },
          idle: {
            text: isTerminal.value ? 'IDLE' : '空闲',
            type: 'warning',
            class: 'status-idle'
          },
          error: {
            text: isTerminal.value ? 'ERROR' : '错误',
            type: 'error',
            class: 'status-error'
          }
        }
        const status = statusMap[row.status as keyof typeof statusMap] || statusMap.idle

        if (isTerminal.value) {
          return h(
            'span',
            {
              class: ['terminal-status', status.class]
            },
            status.text
          )
        } else {
          return h(NTag, { type: status.type }, { default: () => status.text })
        }
      }
    },
    {
      title: isTerminal.value ? 'CREATED' : '创建时间',
      key: 'createdAt',
      render: (row: any) => {
        const date = new Date(row.createdAt)
        return h(
          'span',
          {
            class: { 'terminal-text': isTerminal.value }
          },
          isTerminal.value
            ? date.toISOString().replace('T', '_').split('.')[0]
            : date.toLocaleString('zh-CN')
        )
      }
    },
    {
      title: isTerminal.value ? 'ACTIONS' : '操作',
      key: 'actions',
      render: (row: any) => {
        return h(
          NSpace,
          { size: 8 },
          {
            default: () => [
              h(
                NButton,
                {
                  size: 'small',
                  type: row.status === 'running' ? 'warning' : 'success',
                  class: { 'btn-8bit': isTerminal.value },
                  onClick: () => toggleAgent(row)
                },
                {
                  icon: () =>
                    h(
                      NIcon,
                      {},
                      {
                        default: () => (row.status === 'running' ? h(PauseOutline) : h(PlayOutline))
                      }
                    ),
                  default: () =>
                    isTerminal.value
                      ? row.status === 'running'
                        ? 'PAUSE'
                        : 'START'
                      : row.status === 'running'
                        ? '暂停'
                        : '启动'
                }
              ),
              h(
                NButton,
                {
                  size: 'small',
                  type: 'info',
                  class: { 'btn-8bit': isTerminal.value },
                  onClick: () => sendMessage(row)
                },
                {
                  icon: () => h(NIcon, {}, { default: () => h(SendOutline) }),
                  default: () => (isTerminal.value ? 'MSG' : '消息')
                }
              ),
              h(
                NButton,
                {
                  size: 'small',
                  type: 'error',
                  class: { 'btn-8bit': isTerminal.value },
                  onClick: () => deleteAgent(row)
                },
                {
                  icon: () => h(NIcon, {}, { default: () => h(TrashOutline) }),
                  default: () => (isTerminal.value ? 'DEL' : '删除')
                }
              )
            ]
          }
        )
      }
    }
  ]

  return baseColumns
})

// 分页配置
const pagination = computed(() => ({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  showQuickJumper: true,
  prefix: ({ itemCount }: { itemCount: number }) =>
    isTerminal.value ? `TOTAL: ${itemCount}` : `共 ${itemCount} 条`
}))

// 方法
const refreshAgents = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 模拟数据
    agents.value = [
      {
        id: 'agent-001',
        name: 'Assistant-Alpha',
        namespace: 'default',
        role: 'assistant',
        status: 'running',
        createdAt: new Date().toISOString()
      },
      {
        id: 'agent-002',
        name: 'Coder-Beta',
        namespace: 'development',
        role: 'coder',
        status: 'idle',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'agent-003',
        name: 'Analyst-Gamma',
        namespace: 'production',
        role: 'analyst',
        status: 'error',
        createdAt: new Date(Date.now() - 172800000).toISOString()
      },
      {
        id: 'agent-004',
        name: 'Support-Delta',
        namespace: 'production',
        role: 'support',
        status: 'running',
        createdAt: new Date(Date.now() - 259200000).toISOString()
      }
    ]

    message.success(isTerminal.value ? 'AGENTS_REFRESHED' : '智能体列表已刷新')
  } catch (error) {
    message.error(isTerminal.value ? 'REFRESH_FAILED' : '刷新失败')
  } finally {
    loading.value = false
  }
}

const handleNamespaceChange = (value: string) => {
  selectedNamespace.value = value
  refreshAgents()
}

const toggleAgent = (agent: any) => {
  const action = agent.status === 'running' ? 'pause' : 'start'
  message.info(
    isTerminal.value
      ? `AGENT_${action.toUpperCase()}: ${agent.name}`
      : `${action === 'pause' ? '暂停' : '启动'}智能体: ${agent.name}`
  )
}

const sendMessage = (agent: any) => {
  const msg = prompt(
    isTerminal.value ? `SEND_MESSAGE_TO: ${agent.name}` : `向 ${agent.name} 发送消息:`
  )
  if (msg && msg.trim()) {
    message.info(isTerminal.value ? `MESSAGE_SENT: ${agent.name}` : `消息已发送给: ${agent.name}`)
  }
}

const deleteAgent = (agent: any) => {
  const confirmed = confirm(
    isTerminal.value
      ? `DELETE_AGENT: ${agent.name}? [Y/N]`
      : `确定要删除智能体 "${agent.name}" 吗？`
  )
  if (confirmed) {
    message.warning(isTerminal.value ? `AGENT_DELETED: ${agent.name}` : `删除智能体: ${agent.name}`)
  }
}

const handleCreateAgent = async () => {
  try {
    await createFormRef.value?.validate()
    creating.value = true

    // 模拟创建API调用
    await new Promise((resolve) => setTimeout(resolve, 1500))

    message.success(isTerminal.value ? 'AGENT_CREATED' : '智能体创建成功')
    showCreateModal.value = false

    // 重置表单
    createForm.value = {
      name: '',
      role: '',
      namespace: 'default',
      context: ''
    }

    // 刷新列表
    refreshAgents()
  } catch (error) {
    message.error(isTerminal.value ? 'CREATE_FAILED' : '创建失败')
  } finally {
    creating.value = false
  }
}

// 生命周期
onMounted(() => {
  refreshAgents()
})
</script>

<style scoped lang="scss">
.agents-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);

  &.terminal-mode {
    font-family: var(--font-mono);
    background: var(--terminal-bg);
  }
}

.view-content {
  flex: 1;
  padding: 24px;
  overflow: auto;

  .terminal-mode & {
    padding: 16px;
  }
}

.stats-section {
  margin-bottom: 24px;

  .stats-grid {
    .terminal-mode & {
      gap: 12px;
    }
  }
}

.agents-list-section {
  .list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    &.terminal-header-content {
      font-family: var(--font-mono);

      .header-title {
        color: var(--pixel-green);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;

        .terminal-prompt {
          &::before {
            content: '> ';
            color: var(--terminal-prompt);
          }
        }
      }
    }

    .header-controls {
      .terminal-mode & {
        .n-space {
          gap: 12px;
        }
      }
    }
  }
}

// Terminal风格的表格
:deep(.terminal-table) {
  .n-data-table {
    background: var(--terminal-bg-secondary);
    color: var(--terminal-text);

    .n-data-table-thead {
      background: var(--terminal-surface);

      .n-data-table-th {
        background: var(--terminal-surface);
        color: var(--pixel-green);
        border-color: var(--terminal-border);
        font-family: var(--font-display);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
    }

    .n-data-table-tbody {
      .n-data-table-tr {
        background: var(--terminal-bg-secondary);
        border-color: var(--terminal-border);

        &:hover {
          background: var(--terminal-surface);
        }

        .n-data-table-td {
          border-color: var(--terminal-border);
          color: var(--terminal-text);
          font-family: var(--font-mono);
        }
      }
    }
  }
}

// Terminal风格的状态
.terminal-status {
  font-family: var(--font-mono);
  font-weight: 600;
  text-transform: uppercase;

  &.status-running {
    color: var(--terminal-success);
    text-shadow: 0 0 5px currentColor;
  }

  &.status-idle {
    color: var(--terminal-warning);
    text-shadow: 0 0 5px currentColor;
  }

  &.status-error {
    color: var(--terminal-error);
    text-shadow: 0 0 5px currentColor;
  }
}

.terminal-text {
  font-family: var(--font-mono);
  color: var(--terminal-text);
}

// Terminal风格的模态框
:deep(.terminal-modal) {
  .n-dialog {
    background: var(--terminal-bg-secondary);
    border: 2px solid var(--pixel-green);
    box-shadow: var(--neon-glow-green);

    .n-dialog__title {
      color: var(--pixel-green);
      font-family: var(--font-display);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .n-dialog__content {
      color: var(--terminal-text);
    }
  }
}

// Terminal风格的表单
:deep(.terminal-form) {
  .n-form-item-label {
    color: var(--terminal-text-secondary);
    font-family: var(--font-mono);
    text-transform: uppercase;
    font-weight: 600;
  }

  .terminal-input,
  .terminal-textarea,
  .terminal-select {
    .n-input,
    .n-base-selection {
      background: var(--terminal-bg);
      border: 1px solid var(--terminal-border);
      color: var(--terminal-text);
      font-family: var(--font-mono);

      &:hover {
        border-color: var(--pixel-green);
      }

      &:focus-within {
        border-color: var(--pixel-green);
        box-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .view-content {
    padding: 12px;
  }

  .stats-grid {
    :deep(.n-grid) {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .list-header {
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
