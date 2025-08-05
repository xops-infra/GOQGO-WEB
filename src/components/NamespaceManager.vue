<template>
  <div class="namespace-manager">
    <!-- 命名空间选择器 -->
    <NamespaceSelector
      :current-namespace="currentNamespace"
      :namespaces="namespaces"
      :agent-count="agentCount"
      :loading="loading"
      @select="handleNamespaceSelect"
      @create="showCreateModal = true"
      @manage="handleManageNamespace"
    />

    <!-- 创建命名空间模态框 -->
    <CreateNamespaceModal
      v-model:show="showCreateModal"
      :namespaces="namespaces"
      @created="handleNamespaceCreated"
    />

    <!-- 管理命名空间模态框 -->
    <ManageNamespaceModal
      v-model:show="showManageModal"
      :namespace="selectedNamespace"
      :namespaces="namespaces"
      @updated="handleNamespaceUpdated"
      @deleted="handleNamespaceDeleted"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useMessage } from 'naive-ui'
import { useNamespacesStore } from '@/stores/namespaces'
import { useAgentsStore } from '@/stores/agents'
import { useNamespaceManager } from '@/composables/useNamespaceManager'
import NamespaceSelector from './namespace/NamespaceSelector.vue'
import CreateNamespaceModal from './namespace/CreateNamespaceModal.vue'
import ManageNamespaceModal from './namespace/ManageNamespaceModal.vue'
import type { Namespace } from '@/types/api'

const message = useMessage()
const namespacesStore = useNamespacesStore()
const agentsStore = useAgentsStore()

const { namespaces, currentNamespace } = storeToRefs(namespacesStore)
const { agents } = storeToRefs(agentsStore)

// 响应式数据
const showCreateModal = ref(false)
const showManageModal = ref(false)
const selectedNamespace = ref<Namespace | null>(null)
const loading = ref(false)

// 使用命名空间管理组合式函数
const {
  // 计算属性
  agentCount,
  
  // 方法
  handleNamespaceSelect,
  handleNamespaceCreated,
  handleNamespaceUpdated,
  handleNamespaceDeleted,
  refreshNamespaces
} = useNamespaceManager()

// 方法
const handleManageNamespace = (namespace: Namespace) => {
  selectedNamespace.value = namespace
  showManageModal.value = true
}

// 生命周期
onMounted(() => {
  refreshNamespaces()
})
</script>

<style scoped lang="scss">
.namespace-manager {
  // 样式在子组件中定义
}
</style>
