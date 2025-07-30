<template>
  <div class="namespace-manager">
    <!-- 命名空间选择器 -->
    <n-select
      v-model:value="namespacesStore.currentNamespace"
      :options="namespacesStore.namespaceOptions"
      :loading="namespacesStore.loading"
      size="small"
      style="width: 150px"
      @update:value="handleNamespaceChange"
    />
    
    <!-- 管理按钮 -->
    <n-dropdown
      :options="dropdownOptions"
      @select="handleDropdownSelect"
      trigger="click"
    >
      <n-button size="small" quaternary>
        <n-icon><SettingsOutline /></n-icon>
      </n-button>
    </n-dropdown>

    <!-- 创建命名空间模态框 -->
    <n-modal v-model:show="showCreateModal" preset="dialog" title="创建命名空间">
      <n-form
        ref="createFormRef"
        :model="createForm"
        :rules="createRules"
        label-placement="left"
        label-width="80px"
      >
        <n-form-item label="名称" path="name">
          <n-input
            v-model:value="createForm.name"
            placeholder="输入命名空间名称"
            :input-props="{ autocomplete: 'off' }"
          />
        </n-form-item>
        
        <n-form-item label="描述">
          <n-input
            v-model:value="createForm.description"
            type="textarea"
            placeholder="可选的描述信息"
            :autosize="{ minRows: 2, maxRows: 4 }"
          />
        </n-form-item>
      </n-form>
      
      <template #action>
        <n-space>
          <n-button @click="showCreateModal = false">取消</n-button>
          <n-button type="primary" @click="handleCreateNamespace" :loading="creating">
            创建
          </n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 删除确认模态框 -->
    <n-modal v-model:show="showDeleteModal" preset="dialog" title="删除命名空间">
      <div class="delete-content">
        <n-alert type="warning" style="margin-bottom: 16px">
          <template #icon>
            <n-icon><WarningOutline /></n-icon>
          </template>
          删除命名空间将会删除其中的所有资源，此操作不可撤销！
        </n-alert>
        
        <p>确定要删除命名空间 <strong>{{ namespaceToDelete }}</strong> 吗？</p>
        
        <n-form-item label="请输入命名空间名称确认删除:">
          <n-input
            v-model:value="deleteConfirmName"
            placeholder="输入命名空间名称"
            :input-props="{ autocomplete: 'off' }"
          />
        </n-form-item>
      </div>
      
      <template #action>
        <n-space>
          <n-button @click="showDeleteModal = false">取消</n-button>
          <n-button
            type="error"
            :disabled="deleteConfirmName !== namespaceToDelete"
            @click="handleDeleteNamespace"
            :loading="deleting"
          >
            删除
          </n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 命名空间列表模态框 -->
    <n-modal v-model:show="showListModal" preset="card" title="命名空间管理" style="width: 600px">
      <div class="namespace-list">
        <div class="list-header">
          <n-button type="primary" size="small" @click="showCreateFromList">
            <n-icon><AddOutline /></n-icon>
            新建命名空间
          </n-button>
          <n-button size="small" @click="refreshNamespaces" :loading="namespacesStore.loading">
            <n-icon><RefreshOutline /></n-icon>
            刷新
          </n-button>
        </div>
        
        <n-data-table
          :columns="tableColumns"
          :data="namespacesStore.namespaces"
          :loading="namespacesStore.loading"
          :pagination="{ pageSize: 10 }"
          size="small"
        />
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h, onMounted } from 'vue'
import { NButton, NIcon, NTag, NSpace } from 'naive-ui'
import {
  SettingsOutline,
  AddOutline,
  RefreshOutline,
  ListOutline,
  TrashOutline,
  WarningOutline
} from '@vicons/ionicons5'
import { useNamespacesStore } from '@/stores/namespaces'
import { useAgentsStore } from '@/stores/agents'
import type { DataTableColumns } from 'naive-ui'
import type { Namespace } from '@/api/namespaces'

const namespacesStore = useNamespacesStore()
const agentsStore = useAgentsStore()

// 响应式数据
const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const showListModal = ref(false)
const creating = ref(false)
const deleting = ref(false)
const createFormRef = ref()

const createForm = ref({
  name: '',
  description: ''
})

const createRules = {
  name: [
    { required: true, message: '请输入命名空间名称', trigger: 'blur' },
    { 
      pattern: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/, 
      message: '名称只能包含小写字母、数字和连字符，且必须以字母或数字开头和结尾', 
      trigger: 'blur' 
    },
    { min: 1, max: 63, message: '名称长度必须在1-63个字符之间', trigger: 'blur' }
  ]
}

const namespaceToDelete = ref('')
const deleteConfirmName = ref('')

// 计算属性
const dropdownOptions = computed(() => [
  {
    label: '新建命名空间',
    key: 'create',
    icon: () => h(NIcon, null, { default: () => h(AddOutline) })
  },
  {
    label: '管理命名空间',
    key: 'manage',
    icon: () => h(NIcon, null, { default: () => h(ListOutline) })
  },
  {
    label: '刷新列表',
    key: 'refresh',
    icon: () => h(NIcon, null, { default: () => h(RefreshOutline) })
  }
])

// 表格列定义
const tableColumns: DataTableColumns<Namespace> = [
  {
    title: '名称',
    key: 'metadata.name',
    width: 150,
    render(row) {
      return h('div', { class: 'namespace-name' }, [
        row.metadata.name,
        row.metadata.name === namespacesStore.currentNamespace 
          ? h(NTag, { type: 'primary', size: 'small', style: 'margin-left: 8px' }, { default: () => '当前' })
          : null
      ])
    }
  },
  {
    title: '状态',
    key: 'status.phase',
    width: 100,
    render(row) {
      const phase = row.status?.phase || 'Unknown'
      const type = phase === 'Active' ? 'success' : 'warning'
      return h(NTag, { type, size: 'small' }, { default: () => phase })
    }
  },
  {
    title: '创建时间',
    key: 'metadata.creationTimestamp',
    width: 180,
    render(row) {
      return row.metadata.creationTimestamp 
        ? new Date(row.metadata.creationTimestamp).toLocaleString('zh-CN')
        : '-'
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    render(row) {
      return h(NSpace, { size: 'small' }, {
        default: () => [
          h(NButton, {
            size: 'small',
            type: 'primary',
            disabled: row.metadata.name === namespacesStore.currentNamespace,
            onClick: () => switchToNamespace(row.metadata.name)
          }, { default: () => '切换' }),
          h(NButton, {
            size: 'small',
            type: 'error',
            disabled: row.metadata.name === 'default',
            onClick: () => confirmDeleteNamespace(row.metadata.name)
          }, { 
            default: () => '删除',
            icon: () => h(NIcon, null, { default: () => h(TrashOutline) })
          })
        ]
      })
    }
  }
]

// 方法
const handleNamespaceChange = (namespace: string) => {
  namespacesStore.setCurrentNamespace(namespace)
  // 切换命名空间时重新加载agents
  agentsStore.fetchAgents(namespace)
}

const handleDropdownSelect = (key: string) => {
  switch (key) {
    case 'create':
      showCreateModal.value = true
      break
    case 'manage':
      showListModal.value = true
      break
    case 'refresh':
      refreshNamespaces()
      break
  }
}

const showCreateFromList = () => {
  showListModal.value = false
  showCreateModal.value = true
}

const handleCreateNamespace = async () => {
  try {
    await createFormRef.value?.validate()
    creating.value = true
    
    await namespacesStore.createNamespace(createForm.value.name)
    
    console.log(`命名空间 ${createForm.value.name} 创建成功`)
    showCreateModal.value = false
    
    // 重置表单
    createForm.value = {
      name: '',
      description: ''
    }
  } catch (error) {
    console.error('创建命名空间失败:', error)
  } finally {
    creating.value = false
  }
}

const confirmDeleteNamespace = (name: string) => {
  if (name === 'default') {
    console.warn('不能删除默认命名空间')
    return
  }
  
  namespaceToDelete.value = name
  deleteConfirmName.value = ''
  showDeleteModal.value = true
  showListModal.value = false
}

const handleDeleteNamespace = async () => {
  try {
    deleting.value = true
    await namespacesStore.deleteNamespace(namespaceToDelete.value)
    
    console.log(`命名空间 ${namespaceToDelete.value} 删除成功`)
    showDeleteModal.value = false
    
    // 如果删除的是当前命名空间，重新加载agents
    if (namespaceToDelete.value === namespacesStore.currentNamespace) {
      agentsStore.fetchAgents('default')
    }
  } catch (error) {
    console.error('删除命名空间失败:', error)
  } finally {
    deleting.value = false
  }
}

const switchToNamespace = (name: string) => {
  handleNamespaceChange(name)
  showListModal.value = false
}

const refreshNamespaces = () => {
  namespacesStore.fetchNamespaces()
}

// 生命周期
onMounted(() => {
  namespacesStore.fetchNamespaces()
})
</script>

<style scoped lang="scss">
.namespace-manager {
  display: flex;
  align-items: center;
  gap: 8px;
}

.delete-content {
  .n-form-item {
    margin-top: 16px;
  }
}

.namespace-list {
  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
}

.namespace-name {
  display: flex;
  align-items: center;
}
</style>
