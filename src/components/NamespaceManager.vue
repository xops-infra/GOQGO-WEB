<template>
  <div class="namespace-manager">
    <!-- 基础选择器 -->
    <n-select
      v-model:value="currentNamespace"
      :options="namespaceOptions"
      :loading="loading"
      size="small"
      style="width: 200px;"
      placeholder="选择命名空间"
      @update:value="handleNamespaceChange"
    />
    
    <!-- 刷新按钮 -->
    <n-button size="small" quaternary @click="handleRefresh" :loading="loading">
      <n-icon><SettingsOutline /></n-icon>
    </n-button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { SettingsOutline } from '@vicons/ionicons5'
import { useNamespacesStore } from '@/stores/namespaces'

console.log('🚀 NamespaceManager 开始加载')

// Store
const namespacesStore = useNamespacesStore()

// 本地状态
const loading = ref(false)
const currentNamespace = ref('default')

// 计算属性
const namespaceOptions = computed(() => {
  const namespaces = namespacesStore.namespaces || []
  const options = namespaces.map(ns => ({
    label: `${ns.metadata.name} (${ns.status?.agentCount || 0})`,
    value: ns.metadata.name
  }))
  console.log('📊 Namespace选项:', options)
  return options
})

// 方法
const handleNamespaceChange = async (value: string) => {
  console.log('🔄 切换到namespace:', value)
  if (!value) return
  
  currentNamespace.value = value
  try {
    await namespacesStore.switchNamespace(value)
    console.log('✅ 切换成功')
  } catch (error) {
    console.error('❌ 切换失败:', error)
  }
}

const handleRefresh = async () => {
  console.log('🔄 刷新namespace列表')
  loading.value = true
  try {
    await namespacesStore.fetchNamespaces()
    console.log('✅ 刷新完成')
  } catch (error) {
    console.error('❌ 刷新失败:', error)
  } finally {
    loading.value = false
  }
}

// 生命周期
onMounted(async () => {
  console.log('🎬 NamespaceManager mounted')
  
  loading.value = true
  try {
    await namespacesStore.fetchNamespaces()
    
    // 同步当前选择
    currentNamespace.value = namespacesStore.currentNamespace
    console.log('✅ 初始化完成，当前namespace:', currentNamespace.value)
    console.log('📊 可用namespaces:', namespacesStore.namespaces.map(ns => `${ns.metadata.name}(${ns.status?.agentCount || 0})`))
  } catch (error) {
    console.error('❌ 初始化失败:', error)
  } finally {
    loading.value = false
  }
})

// 监听store中currentNamespace的变化
const unwatchCurrentNamespace = namespacesStore.$subscribe((mutation, state) => {
  if (currentNamespace.value !== state.currentNamespace) {
    currentNamespace.value = state.currentNamespace
    console.log('🔄 同步namespace变化:', state.currentNamespace)
  }
})

// 清理订阅
onUnmounted(() => {
  unwatchCurrentNamespace()
})
</script>

<style scoped lang="scss">
.namespace-manager {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
