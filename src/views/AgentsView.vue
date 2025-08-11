<template>
  <div class="agents-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-info">
        <h1 class="page-title">智能体管理</h1>
        <p class="page-description">管理所有命名空间的AI智能体实例</p>
      </div>
      <div class="page-actions">
        <n-button type="primary" @click="showCreateModal = true">
          <template #icon>
            <n-icon><AddOutline /></n-icon>
          </template>
          创建实例
        </n-button>
      </div>
    </div>

    <!-- 筛选和搜索区域 -->
    <div class="filter-section">
      <n-card>
        <div class="filter-controls">
          <div class="filter-left">
            <n-space :size="16">
              <!-- 命名空间筛选 -->
              <div class="filter-item">
                <label class="filter-label">命名空间:</label>
                <n-select
                  v-model:value="selectedNamespace"
                  :options="namespaceOptions"
                  placeholder="选择命名空间"
                  clearable
                  style="width: 200px"
                  @update:value="handleNamespaceChange"
                />
              </div>
              
              <!-- 状态筛选 -->
              <div class="filter-item">
                <label class="filter-label">状态:</label>
                <n-select
                  v-model:value="selectedStatus"
                  :options="statusOptions"
                  placeholder="选择状态"
                  clearable
                  style="width: 150px"
                  @update:value="handleStatusChange"
                />
              </div>
            </n-space>
          </div>
          
          <div class="filter-right">
            <n-space :size="12">
              <!-- 搜索框 -->
              <n-input
                v-model:value="searchKeyword"
                placeholder="搜索实例名称..."
                clearable
                style="width: 250px"
              >
                <template #prefix>
                  <n-icon><SearchOutline /></n-icon>
                </template>
              </n-input>
              
              <!-- 刷新按钮 -->
              <n-button @click="handleRefresh" :loading="loading">
                <template #icon>
                  <n-icon><RefreshOutline /></n-icon>
                </template>
                刷新
              </n-button>
            </n-space>
          </div>
        </div>
      </n-card>
    </div>

    <!-- 统计信息 -->
    <div class="stats-section">
      <n-grid :cols="4" :x-gap="16">
        <n-grid-item>
          <n-card class="stat-card">
            <n-statistic label="总实例数" :value="allAgents.length" />
          </n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card class="stat-card">
            <n-statistic label="运行中" :value="runningCount" />
          </n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card class="stat-card">
            <n-statistic label="空闲" :value="idleCount" />
          </n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card class="stat-card">
            <n-statistic label="创建/终止中" :value="creatingCount" />
          </n-card>
        </n-grid-item>
      </n-grid>
    </div>

    <!-- 实例列表 -->
    <div class="agents-section">
      <n-card>
        <template #header>
          <div class="table-header">
            <span class="header-title">实例列表</span>
            <span class="header-count">({{ filteredAgents.length }} 个实例)</span>
          </div>
        </template>

        <n-data-table
          :columns="columns"
          :data="filteredAgents"
          :loading="loading"
          :pagination="pagination"
          :row-key="(row: any) => `${row.namespace}-${row.name}`"
        />
      </n-card>
    </div>

    <!-- 创建实例模态框 -->
    <AgentCreateModal
      :show="showCreateModal"
      @update:show="showCreateModal = $event"
      @created="handleAgentCreated"
    />

    <!-- 实例详情模态框 -->
    <n-modal
      v-model:show="showDetailModal"
      preset="card"
      title="实例详情"
      style="width: 800px"
    >
      <div v-if="selectedAgent" class="agent-detail">
        <n-descriptions :column="2" bordered>
          <n-descriptions-item label="实例名称">{{ selectedAgent.name }}</n-descriptions-item>
          <n-descriptions-item label="命名空间">{{ selectedAgent.namespace }}</n-descriptions-item>
          <n-descriptions-item label="角色">{{ selectedAgent.role }}</n-descriptions-item>
          <n-descriptions-item label="状态">
            <n-tag :type="getStatusType(selectedAgent.status)">
              {{ getStatusText(selectedAgent.status) }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="创建时间">{{ formatTime(selectedAgent.createdAt) }}</n-descriptions-item>
          <n-descriptions-item label="最后更新">{{ formatTime(selectedAgent.updatedAt) }}</n-descriptions-item>
          <n-descriptions-item label="工作目录">{{ selectedAgent.workDir || '-' }}</n-descriptions-item>
          <n-descriptions-item label="重启次数">{{ selectedAgent.restartCount || 0 }}</n-descriptions-item>
        </n-descriptions>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import {
  NCard,
  NButton,
  NIcon,
  NSpace,
  NSelect,
  NInput,
  NGrid,
  NGridItem,
  NStatistic,
  NDataTable,
  NTag,
  NModal,
  NDescriptions,
  NDescriptionsItem,
  useMessage,
  type DataTableColumns
} from 'naive-ui'
import {
  AddOutline,
  RefreshOutline,
  SearchOutline,
  PlayOutline,
  StopOutline,
  InformationCircleOutline,
  TrashOutline
} from '@vicons/ionicons5'
import { useAgentsStore } from '@/stores/agents'
import { useNamespacesStore } from '@/stores/namespaces'
import { storeToRefs } from 'pinia'
import AgentCreateModal from '@/components/AgentCreateModal.vue'

const message = useMessage()
const agentsStore = useAgentsStore()
const namespacesStore = useNamespacesStore()

const { agents: allAgents } = storeToRefs(agentsStore)
const { namespaces } = storeToRefs(namespacesStore)

// 响应式数据
const loading = ref(false)
const showCreateModal = ref(false)
const showDetailModal = ref(false)
const selectedAgent = ref<any>(null)
const searchKeyword = ref('')
const selectedNamespace = ref<string | null>(null)
const selectedStatus = ref<string | null>(null)

// 命名空间选项
const namespaceOptions = computed(() => {
  const options = namespaces.value.map(ns => ({
    label: ns.metadata?.name || ns.name,
    value: ns.metadata?.name || ns.name
  }))
  return [{ label: '所有命名空间', value: null }, ...options]
})

// 状态选项
const statusOptions = [
  { label: '所有状态', value: null },
  { label: '运行中', value: 'running' },
  { label: '空闲', value: 'idle' },
  { label: '创建中', value: 'Creating' },
  { label: '终止中', value: 'Terminating' },
  { label: '错误', value: 'error' }
]

// 计算属性
const filteredAgents = computed(() => {
  let filtered = allAgents.value

  // 命名空间筛选
  if (selectedNamespace.value) {
    filtered = filtered.filter(agent => agent.namespace === selectedNamespace.value)
  }

  // 状态筛选
  if (selectedStatus.value) {
    filtered = filtered.filter(agent => agent.status === selectedStatus.value)
  }

  // 搜索筛选
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(agent =>
      agent.name.toLowerCase().includes(keyword) ||
      agent.namespace.toLowerCase().includes(keyword) ||
      agent.role.toLowerCase().includes(keyword)
    )
  }

  return filtered
})

const runningCount = computed(() =>
  allAgents.value.filter(agent => agent.status === 'running').length
)

const idleCount = computed(() =>
  allAgents.value.filter(agent => agent.status === 'idle').length
)

const errorCount = computed(() =>
  allAgents.value.filter(agent => agent.status === 'error').length
)

const creatingCount = computed(() =>
  allAgents.value.filter(agent => agent.status === 'Creating' || agent.status === 'Terminating').length
)

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
    title: '实例名称',
    key: 'name',
    width: 200,
    render: (row: any) => h('span', { style: 'font-weight: 600; color: #ffffff;' }, row.name)
  },
  {
    title: '命名空间',
    key: 'namespace',
    width: 120,
    render: (row: any) => h('span', { style: 'color: #ffffff;' }, row.namespace)
  },
  {
    title: '角色',
    key: 'role',
    width: 150,
    render: (row: any) => h('span', { style: 'color: #ffffff;' }, row.role)
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row: any) => {
      return h(NTag, {
        type: getStatusType(row.status)
      }, () => getStatusText(row.status))
    }
  },
  {
    title: '创建时间',
    key: 'createdAt',
    width: 180,
    render: (row: any) => h('span', { style: 'color: #ffffff;' }, formatTime(row.createdAt))
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    render: (row: any) => {
      return h(NSpace, { size: 8 }, () => [
        h(NButton, {
          size: 'small',
          type: 'info',
          onClick: () => handleShowDetail(row)
        }, () => '详情'),
        h(NButton, {
          size: 'small',
          type: 'success',
          onClick: () => handleRestartAgent(row)
        }, () => '重启'),
        h(NButton, {
          size: 'small',
          type: 'error',
          onClick: () => handleDeleteAgent(row)
        }, () => '删除')
      ])
    }
  }
]

// 方法
const handleRefresh = async () => {
  console.log('🔄 开始刷新数据...')
  loading.value = true
  
  try {
    // 先清空现有agents数据，确保能正确累积
    agentsStore.clearAllAgents()
    
    // 先获取命名空间列表
    console.log('📋 获取命名空间列表...')
    await namespacesStore.fetchNamespaces()
    
    // 再获取agents数据
    console.log('👥 获取agents数据...')
    await loadAllAgents()
    
    console.log('✅ 数据刷新完成')
  } catch (error) {
    console.error('❌ 刷新失败:', error)
    message.error('刷新失败，请重试')
  } finally {
    loading.value = false
    console.log('🏁 loading状态已重置')
  }
}

const loadAllAgents = async () => {
  console.log('🔄 开始加载所有agents...')
  
  // 如果没有命名空间数据，使用默认命名空间
  if (namespaces.value.length === 0) {
    console.log('📋 没有命名空间数据，使用默认命名空间')
    try {
      await agentsStore.fetchAgents('default')
      console.log('✅ 默认命名空间agents获取成功')
    } catch (error) {
      console.warn('⚠️ 获取默认命名空间agents失败:', error)
    }
    return
  }

  console.log('📋 可用命名空间:', namespaces.value.map(ns => ns.metadata?.name || ns.name))

  // 使用 Promise.all 并发获取所有命名空间的agents，提高效率
  const fetchPromises = namespaces.value.map(async (ns) => {
    const namespaceName = ns.metadata?.name || ns.name
    console.log(`🔍 开始获取 ${namespaceName} 的agents...`)
    
    try {
      await agentsStore.fetchAgents(namespaceName)
      console.log(`✅ ${namespaceName} agents获取成功`)
      return { namespace: namespaceName, success: true }
    } catch (error) {
      console.warn(`⚠️ 获取 ${namespaceName} 的agents失败:`, error)
      return { namespace: namespaceName, success: false, error }
    }
  })

  // 等待所有请求完成
  const results = await Promise.all(fetchPromises)
  
  // 统计结果
  const successCount = results.filter(r => r.success).length
  const totalCount = results.length
  
  console.log(`✅ 所有agents加载完成: ${successCount}/${totalCount} 个命名空间成功`)
  
  // 调试：输出所有agent的状态值
  if (allAgents.value.length > 0) {
    const statusCounts = allAgents.value.reduce((acc, agent) => {
      acc[agent.status] = (acc[agent.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    console.log('📊 Agent状态统计:', statusCounts)
    console.log('🔍 Agent状态详情:', allAgents.value.map(agent => ({
      name: agent.name,
      namespace: agent.namespace,
      status: agent.status
    })))
  }
}

const handleNamespaceChange = () => {
  // 命名空间变化时的处理逻辑
}

const handleStatusChange = () => {
  // 状态变化时的处理逻辑
}

const handleShowDetail = (agent: any) => {
  selectedAgent.value = agent
  showDetailModal.value = true
}

const handleRestartAgent = async (agent: any) => {
  try {
    await agentsStore.restartAgent(agent.namespace, agent.name)
    message.success(`实例 ${agent.name} 已重启`)
    await handleRefresh()
  } catch (error) {
    console.error('重启失败:', error)
    message.error('重启失败')
  }
}

const handleDeleteAgent = async (agent: any) => {
  try {
    await agentsStore.deleteAgent(agent.namespace, agent.name)
    message.success(`实例 ${agent.name} 已删除`)
    await handleRefresh()
  } catch (error) {
    console.error('删除失败:', error)
    message.error('删除失败')
  }
}

const handleAgentCreated = () => {
  handleRefresh()
}

// 工具函数
const getStatusType = (status: string) => {
  const statusMap: Record<string, any> = {
    'running': 'success',
    'idle': 'warning', 
    'error': 'error',
    'Creating': 'info',
    'Terminating': 'warning'
  }
  return statusMap[status] || 'default'
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'running': '运行中',
    'idle': '空闲',
    'error': '错误',
    'Creating': '创建中',
    'Terminating': '终止中'
  }
  return statusMap[status] || status
}

const formatTime = (time: string) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

// 生命周期
onMounted(async () => {
  console.log('🚀 AgentsView 组件已挂载')
  
  // 设置事件监听器
  agentsStore.setupEventListeners()
  
  // 设置一个超时，确保页面不会一直loading
  const timeoutId = setTimeout(() => {
    if (loading.value) {
      console.warn('⏰ 数据加载超时，强制结束loading状态')
      loading.value = false
      message.warning('数据加载超时，请手动刷新')
    }
  }, 10000) // 10秒超时
  
  try {
    await handleRefresh()
    clearTimeout(timeoutId)
  } catch (error) {
    console.error('❌ 初始化失败:', error)
    clearTimeout(timeoutId)
    loading.value = false
  }
})

onUnmounted(() => {
  console.log('🧹 AgentsView 组件已卸载')
  // 清理事件监听器
  agentsStore.cleanupEventListeners()
})
</script>

<style scoped lang="scss">
.agents-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 20px;
  padding: 20px;
  background: #1a1a1a;
  color: #ffffff;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #2a2a2a;
  border-radius: 8px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 8px 0;
}

.page-description {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.filter-section {
  :deep(.n-card) {
    background: #2a2a2a;
    border: 1px solid #404040;
  }
}

.filter-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.filter-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  color: #ffffff;
  white-space: nowrap;
}

.stats-section {
  .stat-card {
    :deep(.n-card) {
      background: #2a2a2a;
      border: 1px solid #404040;
    }
    
    :deep(.n-statistic) {
      .n-statistic-label {
        color: rgba(255, 255, 255, 0.7);
      }
      
      .n-statistic-value {
        color: #ffffff;
      }
    }
  }
}

.agents-section {
  flex: 1;
  
  :deep(.n-card) {
    background: #2a2a2a;
    border: 1px solid #404040;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  :deep(.n-card__content) {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
}

.table-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}

.header-count {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.agent-detail {
  :deep(.n-descriptions) {
    .n-descriptions-table-wrapper {
      background: #2a2a2a;
    }
    
    .n-descriptions-table-content {
      color: #ffffff;
    }
    
    .n-descriptions-table-header {
      background: #404040;
      color: #ffffff;
    }
  }
}

// 深度样式优化
:deep(.n-select) {
  .n-base-selection {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.2);
  }
  
  .n-base-selection-label {
    color: #ffffff;
  }
  
  .n-base-selection-placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
}

:deep(.n-input) {
  .n-input-wrapper {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.2);
  }
  
  .n-input__input-el {
    color: #ffffff;
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }
  }
}

:deep(.n-data-table) {
  background: transparent;
  
  .n-data-table-th {
    background: #404040;
    color: #ffffff;
    border-color: #555555;
  }
  
  .n-data-table-td {
    background: #2a2a2a;
    border-color: #404040;
  }
  
  .n-data-table-tr:hover .n-data-table-td {
    background: #333333;
  }
}

:deep(.n-modal) {
  .n-card {
    background: #2a2a2a;
    border: 1px solid #404040;
  }
  
  .n-card-header {
    background: #404040;
    border-bottom: 1px solid #555555;
    
    .n-card-header__main {
      color: #ffffff;
    }
  }
}
</style>
