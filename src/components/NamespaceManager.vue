<template>
  <div class="namespace-manager">
    <!-- 下拉菜单 -->
    <n-dropdown
      :options="dropdownOptions"
      @select="handleMenuSelect"
      placement="bottom-end"
      trigger="click"
      :show-arrow="true"
    >
      <div class="namespace-container">
        <!-- 命名空间图标 -->
        <div class="namespace-icon">
          <NamespaceIcon :size="18" />
        </div>

        <!-- 命名空间信息 -->
        <div class="namespace-info">
          <div class="namespace-name">{{ currentNamespaceDisplay }}</div>
          <div class="namespace-stats">
            <n-tag size="small" round type="info"> {{ agentCount }} 个智能体 </n-tag>
          </div>
        </div>

        <!-- 下拉箭头 -->
        <n-icon class="dropdown-icon" size="16">
          <svg viewBox="0 0 24 24">
            <path fill="currentColor" d="M7,10L12,15L17,10H7Z" />
          </svg>
        </n-icon>
      </div>
    </n-dropdown>

    <!-- 创建命名空间弹窗 -->
    <n-modal
      v-model:show="showCreateModal"
      preset="card"
      title="创建新命名空间"
      style="width: 500px"
      :mask-closable="false"
      :closable="true"
    >
      <div class="create-namespace-form">
        <!-- 命名空间名称 -->
        <div class="form-section">
          <label class="form-label">命名空间名称 <span class="required">*</span></label>
          <n-input
            v-model:value="createFormData.name"
            placeholder="例如: my-project"
            size="medium"
            :maxlength="63"
            :status="createFormData.name && !nameValidation.valid ? 'error' : undefined"
          />
          <div
            class="form-hint"
            :class="{
              'validation-error': createFormData.name && !nameValidation.valid,
              'validation-success': createFormData.name && nameValidation.valid
            }"
          >
            <n-icon
              size="14"
              :color="
                createFormData.name && !nameValidation.valid
                  ? '#ff4d4f'
                  : createFormData.name && nameValidation.valid
                    ? '#52c41a'
                    : '#999'
              "
            >
              <svg v-if="!createFormData.name || nameValidation.valid" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z"
                />
              </svg>
              <svg v-else viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M15.5,7L14,8.5L12.5,7L11,8.5L12.5,10L11,11.5L12.5,13L11,14.5L12.5,16L14,14.5L15.5,16L17,14.5L15.5,13L17,11.5L15.5,10L17,8.5L15.5,7Z"
                />
              </svg>
            </n-icon>
            <span>
              {{
                createFormData.name
                  ? nameValidation.message
                  : '只能包含小写字母、数字和连字符，最长63个字符'
              }}
            </span>
          </div>
        </div>

        <!-- 描述 -->
        <div class="form-section">
          <label class="form-label">描述</label>
          <n-input
            v-model:value="createFormData.description"
            type="textarea"
            placeholder="请输入命名空间的描述信息（可选）"
            size="medium"
            :rows="3"
          />
          <div class="form-hint">
            <n-icon size="14" color="#999">
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z"
                />
              </svg>
            </n-icon>
            <span>简要说明这个命名空间的用途</span>
          </div>
        </div>

        <!-- 提示信息 -->
        <div class="info-banner">
          <n-icon size="16" color="#17a2b8">
            <svg viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z"
              />
            </svg>
          </n-icon>
          <span
            ><strong>提示：</strong
            >命名空间用于隔离不同项目或环境的资源，创建后可以在其中管理Agent实例。</span
          >
        </div>
      </div>

      <template #footer>
        <div class="modal-footer">
          <n-button @click="handleCancelCreate" size="medium">取消</n-button>
          <n-button
            type="primary"
            :loading="createLoading"
            @click="handleConfirmCreate"
            size="medium"
          >
            创建命名空间
          </n-button>
        </div>
      </template>
    </n-modal>

    <!-- 删除命名空间弹窗 -->
    <n-modal
      v-model:show="showDeleteModal"
      preset="card"
      title="删除命名空间"
      style="width: 500px"
      :mask-closable="false"
      :closable="true"
    >
      <div class="delete-namespace-form">
        <!-- 警告信息 -->
        <div class="warning-banner">
          <n-icon size="20" color="#ff4d4f">
            <svg viewBox="0 0 24 24">
              <path fill="currentColor" d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2M12,21L10.91,14.74L2,14L10.91,13.26L12,7L13.09,13.26L22,14L13.09,14.74L12,21Z"/>
            </svg>
          </n-icon>
          <div class="warning-content">
            <div class="warning-title">危险操作</div>
            <div class="warning-text">您即将删除命名空间 <strong>{{ currentNamespaceDisplay }}</strong></div>
          </div>
        </div>

        <!-- 删除后果说明 -->
        <div class="consequences">
          <div class="consequence-title">删除后果：</div>
          <ul class="consequence-list">
            <li>该命名空间下的 <strong>{{ agentCount }}</strong> 个 Agent 实例将被永久删除</li>
            <li>相关的配置和数据将无法恢复</li>
            <li>正在运行的会话将被强制终止</li>
          </ul>
          <div v-if="agentCount > 0" class="extra-warning">
            <n-icon size="16" color="#ff4d4f">
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2M12,21L10.91,14.74L2,14L10.91,13.26L12,7L13.09,13.26L22,14L13.09,14.74L12,21Z"/>
              </svg>
            </n-icon>
            <span>注意：该命名空间包含活跃的Agent实例，删除后将无法恢复！</span>
          </div>
        </div>

        <!-- 确认输入 -->
        <div class="confirm-section">
          <label class="confirm-label">
            请输入命名空间名称 <strong>{{ currentNamespaceDisplay }}</strong> 以确认删除：
          </label>
          <n-input 
            v-model:value="deleteConfirmText" 
            placeholder="输入命名空间名称"
            size="medium"
            :status="deleteConfirmText && !deleteConfirmValid ? 'error' : undefined"
          />
          <div class="confirm-hint" :class="{ 
            'validation-error': deleteConfirmText && !deleteConfirmValid,
            'validation-success': deleteConfirmText && deleteConfirmValid 
          }">
            <n-icon size="14" :color="
              deleteConfirmText && !deleteConfirmValid ? '#ff4d4f' : 
              deleteConfirmText && deleteConfirmValid ? '#52c41a' : '#999'
            ">
              <svg v-if="!deleteConfirmText || deleteConfirmValid" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z"/>
              </svg>
              <svg v-else viewBox="0 0 24 24">
                <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M15.5,7L14,8.5L12.5,7L11,8.5L12.5,10L11,11.5L12.5,13L11,14.5L12.5,16L14,14.5L15.5,16L17,14.5L15.5,13L17,11.5L15.5,10L17,8.5L15.5,7Z"/>
              </svg>
            </n-icon>
            <span>
              {{ deleteConfirmText ? (deleteConfirmValid ? '确认文本正确' : '请输入正确的命名空间名称') : '请输入命名空间名称以确认删除' }}
            </span>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="modal-footer">
          <n-button @click="handleCancelDelete" size="medium">取消</n-button>
          <n-button 
            type="error" 
            :loading="deleteLoading"
            :disabled="!deleteConfirmValid"
            @click="handleConfirmDelete"
            size="medium"
          >
            确认删除
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, h } from 'vue'
import { RefreshOutline, AddOutline } from '@vicons/ionicons5'
import { useNamespacesStore } from '@/stores/namespaces'
import { useAgentsStore } from '@/stores/agents'
import { storeToRefs } from 'pinia'
import { useMessage, NModal, NInput, NButton, NIcon } from 'naive-ui'
import NamespaceIcon from './icons/NamespaceIcon.vue'

console.log('🚀 NamespaceManager 开始加载')

// 状态管理
const namespacesStore = useNamespacesStore()
const agentsStore = useAgentsStore()
const { namespaces, currentNamespace } = storeToRefs(namespacesStore)
const { agents } = storeToRefs(agentsStore)
const message = useMessage()

// 响应式数据
const loading = ref(false)
const showCreateModal = ref(false)
const createLoading = ref(false)
const showDeleteModal = ref(false)
const deleteLoading = ref(false)
const deleteConfirmText = ref('')

// 创建表单数据
const createFormData = ref({
  name: '',
  description: ''
})

// 名称验证
const nameValidation = computed(() => {
  const name = createFormData.value.name.trim()
  if (!name) {
    return { valid: false, message: '' }
  }

  const namePattern = /^[a-z0-9-]+$/
  if (!namePattern.test(name)) {
    return { valid: false, message: '只能包含小写字母、数字和连字符' }
  }

  if (name.length > 63) {
    return { valid: false, message: '名称长度不能超过63个字符' }
  }

  // 检查是否已存在
  const exists = namespaces.value.some((ns) => (ns.metadata?.name || ns.name) === name)
  if (exists) {
    return { valid: false, message: '该命名空间名称已存在' }
  }

  return { valid: true, message: '名称可用' }
})

// 删除确认验证
const deleteConfirmValid = computed(() => {
  return deleteConfirmText.value.trim() === currentNamespaceDisplay.value
})

// 计算属性
const currentNamespaceDisplay = computed(() => {
  const ns = currentNamespace.value
  return typeof ns === 'string' ? ns : String(ns || 'default')
})

const agentCount = computed(() => {
  // 从agents store获取当前namespace的agent数量
  const currentNs = currentNamespace.value
  if (!currentNs || !agents.value) {
    return 0
  }

  // 过滤出当前namespace下的agents
  const currentNamespaceAgents = agents.value.filter((agent) => agent.namespace === currentNs)

  console.log(`📊 当前命名空间 ${currentNs} 下有 ${currentNamespaceAgents.length} 个智能体`)
  return currentNamespaceAgents.length
})

// 下拉菜单选项
const dropdownOptions = computed(() => {
  const options = []

  // 命名空间列表
  if (namespaces.value.length > 0) {
    namespaces.value.forEach((ns) => {
      const namespaceName = String(ns.metadata?.name || ns.name || ns)
      options.push({
        key: `namespace-${namespaceName}`,
        label: namespaceName,
        icon: () => h(NamespaceIcon, { size: 16 })
      })
    })
  }

  // 分隔线
  if (options.length > 0) {
    options.push({
      key: 'divider-1',
      type: 'divider'
    })
  }

  // 管理选项
  options.push(
    {
      key: 'refresh',
      label: '刷新命名空间',
      icon: () => h(RefreshOutline)
    },
    {
      key: 'create',
      label: '创建命名空间',
      icon: () => h(AddOutline)
    }
  )
  
  // 只有非default命名空间才显示删除选项
  if (currentNamespaceDisplay.value !== 'default') {
    options.push({
      key: 'delete',
      label: '删除命名空间',
      icon: () => h('svg', { viewBox: '0 0 24 24' }, [
        h('path', { 
          fill: 'currentColor', 
          d: 'M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z' 
        })
      ]),
      props: {
        style: 'color: #ff4d4f'
      }
    })
  }

  return options
})

// 方法
const handleMenuSelect = async (key: string) => {
  console.log('🎯 选择菜单项:', key)

  if (key.startsWith('namespace-')) {
    const namespace = key.replace('namespace-', '')
    await switchNamespace(namespace)
  } else {
    switch (key) {
      case 'refresh':
        await refreshNamespaces()
        break
      case 'create':
        console.log('🚀 打开创建命名空间对话框')
        showCreateModal.value = true
        break
      case 'delete':
        console.log('🗑️ 打开删除命名空间对话框')
        showDeleteModal.value = true
        break
    }
  }
}

const switchNamespace = async (namespace: string) => {
  if (namespace === currentNamespace.value) {
    return
  }

  loading.value = true
  try {
    await namespacesStore.switchNamespace(namespace)
    message.success(`已切换到命名空间: ${namespace}`)
  } catch (error) {
    console.error('❌ 切换命名空间失败:', error)
    message.error('切换命名空间失败')
  } finally {
    loading.value = false
  }
}

const refreshNamespaces = async () => {
  loading.value = true
  try {
    await namespacesStore.fetchNamespaces()
    message.success('命名空间列表已刷新')
  } catch (error) {
    console.error('❌ 刷新命名空间失败:', error)
    message.error('刷新命名空间失败')
  } finally {
    loading.value = false
  }
}

// 处理取消创建
const handleCancelCreate = () => {
  console.log('❌ 取消创建namespace')
  showCreateModal.value = false
  createFormData.value = {
    name: '',
    description: ''
  }
}

// 处理确认创建
const handleConfirmCreate = async () => {
  console.log('✅ 确认创建namespace')
  console.log('📋 表单数据:', createFormData.value)

  // 验证必填字段
  if (!createFormData.value.name.trim()) {
    message.error('请输入命名空间名称')
    return
  }

  // 使用计算属性进行验证
  if (!nameValidation.value.valid) {
    message.error(nameValidation.value.message)
    return
  }

  createLoading.value = true

  try {
    console.log('🚀 开始创建namespace...')

    const createRequest = {
      name: createFormData.value.name.trim(),
      description:
        createFormData.value.description.trim() || `命名空间 ${createFormData.value.name}`
    }

    console.log('📤 发送创建请求:', createRequest)

    await namespacesStore.createNamespace(createRequest)

    message.success('命名空间创建成功')
    showCreateModal.value = false

    // 重置表单
    createFormData.value = {
      name: '',
      description: ''
    }

    // 刷新命名空间列表
    await refreshNamespaces()

    console.log('✅ namespace创建完成')
  } catch (error) {
    console.error('❌ 创建namespace失败:', error)
    message.error('创建命名空间失败')
  } finally {
    createLoading.value = false
  }
}

// 处理取消删除
const handleCancelDelete = () => {
  console.log('❌ 取消删除namespace')
  showDeleteModal.value = false
  deleteConfirmText.value = ''
}

// 处理确认删除
const handleConfirmDelete = async () => {
  console.log('✅ 确认删除namespace')
  console.log('📋 当前命名空间:', currentNamespaceDisplay.value)
  console.log('📋 确认文本:', deleteConfirmText.value)
  
  // 验证确认文本
  if (!deleteConfirmValid.value) {
    message.error('请输入正确的命名空间名称以确认删除')
    return
  }
  
  // 检查是否为默认命名空间
  if (currentNamespaceDisplay.value === 'default') {
    message.error('不能删除默认命名空间')
    return
  }
  
  deleteLoading.value = true
  
  try {
    console.log('🚀 开始删除namespace...')
    
    await namespacesStore.deleteNamespace(currentNamespaceDisplay.value)
    
    message.success('命名空间删除成功')
    showDeleteModal.value = false
    deleteConfirmText.value = ''
    
    // 切换到默认命名空间
    await namespacesStore.switchNamespace('default')
    
    // 刷新命名空间列表
    await refreshNamespaces()
    
    console.log('✅ namespace删除完成')
  } catch (error) {
    console.error('❌ 删除namespace失败:', error)
    message.error('删除命名空间失败')
  } finally {
    deleteLoading.value = false
  }
}

// 生命周期
onMounted(async () => {
  console.log('🔧 NamespaceManager 组件挂载')

  // 初始化命名空间列表
  if (namespaces.value.length === 0) {
    await refreshNamespaces()
  }
})

// 监听store变化
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
  .namespace-container {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid var(--border-primary);
    min-width: 180px;
    white-space: nowrap;
    background: var(--bg-primary);
    box-shadow: var(--shadow-sm);

    &:hover {
      background: var(--bg-hover);
      border-color: var(--color-primary-hover);
      box-shadow: var(--shadow-md);
    }

    &.loading {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }

  .namespace-icon {
    flex-shrink: 0;
    color: var(--color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(59, 130, 246, 0.1);
    transition: all 0.2s ease;

    .namespace-container:hover & {
      background: var(--color-primary-hover);
      color: #ffffff;
    }
  }

  .namespace-info {
    display: flex;
    flex-direction: row; // 改为水平排列
    align-items: center; // 垂直居中对齐
    gap: 8px; // 调整间距
    min-width: 0;
    flex: 1;

    .namespace-name {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.2;
    }

    .namespace-stats {
      display: flex;
      align-items: center;
      flex-shrink: 0; // 防止标签被压缩
    }
  }

  .dropdown-icon {
    flex-shrink: 0;
    color: var(--text-tertiary);
    transition: all 0.2s ease;

    .namespace-container:hover & {
      color: var(--text-secondary);
      transform: rotate(180deg);
    }
  }
}

// 优化下拉菜单样式
:deep(.n-dropdown-menu) {
  background: var(--bg-primary);
  border-radius: 8px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-primary);
  padding: 6px;
  min-width: 220px;

  .n-dropdown-option {
    border-radius: 6px;
    margin: 2px 0;
    padding: 10px 12px;
    transition: all 0.2s ease;

    &:hover {
      background-color: var(--bg-hover);
    }

    .n-dropdown-option-body {
      display: flex;
      align-items: center;
      gap: 10px;

      .n-dropdown-option-body__prefix {
        color: var(--text-secondary);
        flex-shrink: 0;

        svg {
          width: 16px;
          height: 16px;
        }
      }

      .n-dropdown-option-body__label {
        font-size: 14px;
        font-weight: 500;
        color: var(--text-primary);
        line-height: 1.4;
      }
    }

    &.n-dropdown-option--show-arrow {
      &:hover {
        background-color: rgba(59, 130, 246, 0.1);

        .n-dropdown-option-body__prefix {
          color: var(--color-primary);
        }

        .n-dropdown-option-body__label {
          color: var(--color-primary);
        }
      }
    }

    &.n-dropdown-option--disabled {
      opacity: 0.5;

      .n-dropdown-option-body__label {
        color: var(--text-disabled);
        font-size: 12px;
        font-weight: 400;
      }
    }
  }

  .n-dropdown-divider {
    margin: 6px 0;
    height: 1px;
    background-color: var(--border-primary);
  }
}

// 创建命名空间modal样式
.create-namespace-form {
  .form-section {
    margin-bottom: 24px;

    .form-label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: var(--text-color-1);
      margin-bottom: 8px;

      .required {
        color: #ff4d4f;
        margin-left: 2px;
      }
    }

    .form-hint {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 6px;
      font-size: 12px;
      color: var(--text-color-3);

      span {
        line-height: 1.4;
      }
      
      &.validation-error {
        color: #ff4d4f;
      }
      
      &.validation-success {
        color: #52c41a;
      }
    }
  }

  .info-banner {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 12px;
    background: #e7f3ff;
    border: 1px solid #b3d8ff;
    border-radius: 6px;
    margin-top: 20px;

    span {
      font-size: 13px;
      color: #0066cc;
      line-height: 1.5;

      strong {
        font-weight: 600;
      }
    }
  }

  .n-input {
    width: 100%;
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

// 删除命名空间modal样式
.delete-namespace-form {
  .warning-banner {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    background: #fff2f0;
    border: 1px solid #ffccc7;
    border-radius: 6px;
    margin-bottom: 20px;
    
    .warning-content {
      flex: 1;
      
      .warning-title {
        font-size: 16px;
        font-weight: 600;
        color: #ff4d4f;
        margin-bottom: 4px;
      }
      
      .warning-text {
        font-size: 14px;
        color: #ff4d4f;
        
        strong {
          font-weight: 600;
          background: #ffebe6;
          padding: 2px 6px;
          border-radius: 4px;
        }
      }
    }
  }
  
  .consequences {
    margin-bottom: 24px;
    
    .consequence-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-color-1);
      margin-bottom: 8px;
    }
    
    .consequence-list {
      margin: 0;
      padding-left: 20px;
      
      li {
        font-size: 13px;
        color: var(--text-color-2);
        line-height: 1.6;
        margin-bottom: 4px;
        
        strong {
          color: #ff4d4f;
          font-weight: 600;
        }
        
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
    
    .extra-warning {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 12px;
      padding: 8px 12px;
      background: #fff2f0;
      border: 1px solid #ffccc7;
      border-radius: 4px;
      
      span {
        font-size: 12px;
        color: #ff4d4f;
        font-weight: 500;
      }
    }
  }
  
  .confirm-section {
    .confirm-label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: var(--text-color-1);
      margin-bottom: 8px;
      
      strong {
        color: #ff4d4f;
        background: #ffebe6;
        padding: 2px 6px;
        border-radius: 4px;
      }
    }
    
    .confirm-hint {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 6px;
      font-size: 12px;
      color: var(--text-color-3);
      
      span {
        line-height: 1.4;
      }
      
      &.validation-error {
        color: #ff4d4f;
      }
      
      &.validation-success {
        color: #52c41a;
      }
    }
  }
  
  .n-input {
    width: 100%;
  }
}
</style>
