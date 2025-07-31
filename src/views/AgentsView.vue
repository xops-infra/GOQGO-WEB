<template>
  <div class="agents-view">
    <div class="agents-header">
      <n-space justify="space-between" align="center">
        <div>
          <h2>智能体管理</h2>
          <p>管理和监控AI智能体实例</p>
        </div>
        <n-button type="primary" @click="showCreateModal = true">
          <template #icon>
            <n-icon><AddOutline /></n-icon>
          </template>
          创建智能体
        </n-button>
      </n-space>
    </div>

    <!-- 统计卡片 -->
    <n-grid :cols="4" :x-gap="16" class="stats-grid">
      <n-grid-item>
        <n-card>
          <n-statistic label="总数" :value="agents.length" />
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card>
          <n-statistic label="运行中" :value="runningCount" />
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card>
          <n-statistic label="空闲" :value="idleCount" />
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card>
          <n-statistic label="错误" :value="errorCount" />
        </n-card>
      </n-grid-item>
    </n-grid>

    <!-- 智能体列表 -->
    <n-card title="智能体列表" :bordered="false">
      <template #header-extra>
        <n-space>
          <n-select
            v-model:value="selectedNamespace"
            :options="namespaceOptions"
            placeholder="选择命名空间"
            style="width: 150px"
            @update:value="handleNamespaceChange"
          />
          <n-button @click="refreshAgents" :loading="loading">
            <template #icon>
              <n-icon><RefreshOutline /></n-icon>
            </template>
            刷新
          </n-button>
        </n-space>
      </template>

      <n-data-table
        :columns="columns"
        :data="agents"
        :loading="loading"
        :pagination="pagination"
      />
    </n-card>

    <!-- 创建智能体模态框 -->
    <n-modal v-model:show="showCreateModal" preset="dialog" title="创建智能体">
      <n-form
        ref="createFormRef"
        :model="createForm"
        :rules="createRules"
        label-placement="left"
        label-width="auto"
      >
        <n-form-item label="名称" path="name">
          <n-input v-model:value="createForm.name" placeholder="输入智能体名称" />
        </n-form-item>
        
        <n-form-item label="角色" path="role">
          <n-select
            v-model:value="createForm.role"
            :options="roleOptions"
            placeholder="选择角色"
          />
        </n-form-item>
        
        <n-form-item label="命名空间" path="namespace">
          <n-input v-model:value="createForm.namespace" placeholder="输入命名空间" />
        </n-form-item>
        
        <n-form-item label="上下文" path="context">
          <n-input
            v-model:value="createForm.context"
            type="textarea"
            placeholder="输入智能体上下文信息"
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

    <!-- Agent创建模态框 -->
    <AgentCreateModal
      v-model:show="showCreateModal"
      @created="handleAgentCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { NButton, NTag, NSpace } from 'naive-ui'
import { AddOutline, RefreshOutline, TrashOutline, SendOutline } from '@vicons/ionicons5'
import { useAgentsStore } from '@/stores/agents'
import AgentCreateModal from '@/components/AgentCreateModal.vue'
import type { Agent, CreateAgentRequest } from '@/types/api'
import type { DataTableColumns } from 'naive-ui'

const agentsStore = useAgentsStore()

// 响应式数据
const showCreateModal = ref(false)
const creating = ref(false)
const selectedNamespace = ref('default')
const createFormRef = ref()

const createForm = ref<CreateAgentRequest>({
  name: '',
  namespace: 'default',
  role: '',
  context: ''
})

const createRules = {
  name: [
    { required: true, message: '请输入智能体名称', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  namespace: [
    { required: true, message: '请输入命名空间', trigger: 'blur' }
  ]
}

// 计算属性
const agents = computed(() => agentsStore.agents)
const loading = computed(() => agentsStore.loading)

const runningCount = computed(() => 
  agents.value.filter(agent => agent.status === 'running').length
)

const idleCount = computed(() => 
  agents.value.filter(agent => agent.status === 'idle').length
)

const errorCount = computed(() => 
  agents.value.filter(agent => agent.status === 'error').length
)

const namespaceOptions = computed(() => [
  { label: 'default', value: 'default' },
  { label: 'development', value: 'development' },
  { label: 'production', value: 'production' }
])

const roleOptions = [
  { label: '前端工程师', value: 'frontend-engineer' },
  { label: '后端工程师', value: 'backend-engineer' },
  { label: '产品经理', value: 'product-manager' },
  { label: '测试工程师', value: 'test-engineer' },
  { label: '运维工程师', value: 'devops-engineer' }
]

const pagination = {
  pageSize: 10
}

// 表格列定义
const columns: DataTableColumns<Agent> = [
  {
    title: '名称',
    key: 'name',
    width: 150
  },
  {
    title: '角色',
    key: 'role',
    width: 120
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render(row) {
      const typeMap: Record<string, any> = {
        'running': 'success',
        'idle': 'warning',
        'error': 'error'
      }
      return h(NTag, { type: typeMap[row.status] }, { default: () => row.status })
    }
  },
  {
    title: '命名空间',
    key: 'namespace',
    width: 120
  },
  {
    title: '创建时间',
    key: 'createdAt',
    width: 180,
    render(row) {
      return new Date(row.createdAt).toLocaleString('zh-CN')
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    render(row) {
      return h(NSpace, {}, {
        default: () => [
          h(NButton, {
            size: 'small',
            type: 'primary',
            onClick: () => handleSendMessage(row)
          }, { default: () => '发送消息', icon: () => h(SendOutline) }),
          h(NButton, {
            size: 'small',
            type: 'error',
            onClick: () => handleDeleteAgent(row)
          }, { default: () => '删除', icon: () => h(TrashOutline) })
        ]
      })
    }
  }
]

// 方法
const refreshAgents = async () => {
  await agentsStore.fetchAgents(selectedNamespace.value)
}

const handleNamespaceChange = async (namespace: string) => {
  await agentsStore.fetchAgents(namespace)
}

const handleCreateAgent = async () => {
  try {
    await createFormRef.value?.validate()
    creating.value = true
    
    await agentsStore.createAgent(createForm.value)
    
    console.log('智能体创建成功')
    showCreateModal.value = false
    
    // 重置表单
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

const handleDeleteAgent = (agent: Agent) => {
  const confirmed = confirm(`确定要删除智能体 "${agent.name}" 吗？此操作不可撤销。`)
  if (confirmed) {
    agentsStore.deleteAgent(agent.name)
      .then(() => {
        console.log('删除成功')
      })
      .catch((error) => {
        console.error('删除失败:', error)
      })
  }
}

const handleSendMessage = (agent: Agent) => {
  const message = prompt(`向 ${agent.name} 发送消息:`)
  if (message && message.trim()) {
    console.log(`向 ${agent.name} 发送消息: ${message}`)
    // 这里可以调用实际的发送消息API
  }
}

const handleAgentCreated = (agent: any) => {
  console.log('✅ Agent创建成功:', agent)
  // 刷新agents列表
  refreshAgents()
}

// 生命周期
onMounted(() => {
  refreshAgents()
})
</script>

<style scoped lang="scss">
.agents-view {
  .agents-header {
    margin-bottom: 24px;
    
    h2 {
      margin: 0 0 4px 0;
      font-size: 24px;
      font-weight: 600;
    }
    
    p {
      margin: 0;
      color: var(--n-text-color-disabled);
    }
  }
  
  .stats-grid {
    margin-bottom: 24px;
  }
}
</style>
