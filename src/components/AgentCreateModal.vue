<template>
  <n-modal
    v-model:show="showModal"
    :mask-closable="false"
    preset="card"
    title="新建 Q CLI 实例"
    size="medium"
    :closable="true"
    style="width: 650px"
    @close="handleClose"
  >
    <div class="agent-create-form">
      <!-- 基本信息区域 -->
      <div class="form-group">
        <h3 class="group-title">基本信息</h3>
        
        <!-- 当前Namespace -->
        <div class="form-section">
          <div class="section-title">当前 Namespace</div>
          <div class="namespace-display">
            <n-icon size="18" class="namespace-icon">
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21V20A2,2 0 0,1 19,22H5A2,2 0 0,1 3,20V19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2M7.5,13A2.5,2.5 0 0,0 5,15.5A2.5,2.5 0 0,0 7.5,18A2.5,2.5 0 0,0 10,15.5A2.5,2.5 0 0,0 7.5,13M16.5,13A2.5,2.5 0 0,0 14,15.5A2.5,2.5 0 0,0 16.5,18A2.5,2.5 0 0,0 19,15.5A2.5,2.5 0 0,0 16.5,13Z"/>
              </svg>
            </n-icon>
            <span class="namespace-name">{{ currentNamespace }}</span>
          </div>
        </div>

        <!-- 实例名称 -->
        <div class="form-section">
          <div class="section-title">实例名称</div>
          <n-input
            v-model:value="formData.name"
            placeholder="请输入实例名称（可选）"
            clearable
            :maxlength="50"
            show-count
          />
          <div class="section-tip">
            <n-icon size="16">
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"/>
              </svg>
            </n-icon>
            <span>留空将自动生成名称</span>
          </div>
        </div>
      </div>

      <!-- 角色配置区域 -->
      <div class="form-group">
        <h3 class="group-title">角色配置</h3>
        
        <div class="form-section">
          <div class="section-title">实例角色</div>
          <n-select
            v-model:value="formData.role"
            :options="roleOptions"
            placeholder="请选择实例的专业角色（可选）"
            clearable
            filterable
            :loading="rolesLoading"
            :consistent-menu-width="false"
          />
          <div class="section-tip">
            <n-icon size="16">
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
              </svg>
            </n-icon>
            <span>选择角色将为实例配置专业的AI能力和行为模式</span>
          </div>
          
          <!-- 选中角色的详细信息 -->
          <div v-if="selectedRoleInfo" class="selected-role-info">
            <div class="role-info-header">
              <n-icon size="16" class="role-icon">
                <svg viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </n-icon>
              <span class="role-name">{{ selectedRoleInfo.displayName }}</span>
            </div>
            <div class="role-description">{{ selectedRoleInfo.description }}</div>
          </div>
        </div>
      </div>

      <!-- 工作目录配置区域 -->
      <div class="form-group">
        <h3 class="group-title">工作目录配置</h3>
        
        <div class="form-section">
          <div class="section-title">目录类型</div>
          <div class="directory-type-selector">
            <n-radio-group v-model:value="formData.directoryType">
              <n-radio value="local">
                <div class="radio-option">
                  <n-icon size="18">
                    <svg viewBox="0 0 24 24">
                      <path fill="currentColor" d="M10,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8C22,6.89 21.1,6 20,6H12L10,4Z"/>
                    </svg>
                  </n-icon>
                  <span>本地路径</span>
                </div>
              </n-radio>
              <n-radio value="git">
                <div class="radio-option">
                  <n-icon size="18">
                    <svg viewBox="0 0 24 24">
                      <path fill="currentColor" d="M2.6,10.59L8.38,4.8L10.07,6.5C9.83,7.35 10.22,8.28 11,8.73V14.27C10.4,14.61 10,15.26 10,16A2,2 0 0,0 12,18A2,2 0 0,0 14,16C14,15.26 13.6,14.61 13,14.27V9.41L15.07,11.5C15,11.65 15,11.82 15,12A2,2 0 0,0 17,14A2,2 0 0,0 19,12A2,2 0 0,0 17,10C16.82,10 16.65,10 16.5,10.07L13.93,7.5C14.19,6.57 13.71,5.55 12.78,5.16C11.85,4.77 10.83,5.25 10.44,6.18C10.05,7.11 10.53,8.13 11.46,8.52C11.5,8.53 11.54,8.54 11.58,8.55L10.07,7.04L2.6,14.5L2.6,10.59Z"/>
                    </svg>
                  </n-icon>
                  <span>Git 仓库</span>
                </div>
              </n-radio>
            </n-radio-group>
          </div>
        </div>

        <div class="form-section">
          <div class="section-title">路径</div>
          <div class="path-input-container">
            <n-input
              v-model:value="formData.path"
              :placeholder="pathPlaceholder"
              clearable
              :disabled="loading"
            />
            <n-button
              v-if="formData.directoryType === 'local'"
              secondary
              @click="handleBrowseDirectory"
              :loading="browsing"
            >
              <template #icon>
                <n-icon>
                  <svg viewBox="0 0 24 24">
                    <path fill="currentColor" d="M10,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8C22,6.89 21.1,6 20,6H12L10,4Z"/>
                  </svg>
                </n-icon>
              </template>
              浏览
            </n-button>
          </div>
          <div class="section-tip">
            <n-icon size="16">
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"/>
              </svg>
            </n-icon>
            <span>{{ pathTipText }}</span>
          </div>
        </div>
      </div>

      <!-- 提示信息 -->
      <div class="info-banner">
        <n-alert type="info" :show-icon="true">
          提示：新建的实例将在指定的 <strong>{{ currentNamespace }}</strong> 中运行，使用选定的角色配置。
        </n-alert>
      </div>
    </div>

    <template #action>
      <div class="modal-actions">
        <n-button @click="handleClose" :disabled="loading">取消</n-button>
        <n-button type="primary" @click="handleCreate" :loading="loading" :disabled="!canCreate">
          <template #icon>
            <n-icon>
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
              </svg>
            </n-icon>
          </template>
          创建实例
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import { rolesApi } from '@/api/roles'
import type { Role } from '@/types/api'
import { useNamespacesStore } from '@/stores/namespaces'
import { useAgentsStore } from '@/stores/agents'
import { storeToRefs } from 'pinia'

// Props
interface Props {
  show: boolean
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:show': [value: boolean]
  created: [agent: any]
}>()

// 状态管理
const namespacesStore = useNamespacesStore()
const agentsStore = useAgentsStore()
const { currentNamespace } = storeToRefs(namespacesStore)
const message = useMessage()

// 响应式数据
const showModal = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
})

const loading = ref(false)
const browsing = ref(false)
const rolesLoading = ref(false)
const roles = ref<Role[]>([])

// 表单数据
const formData = ref({
  name: '',
  role: '',
  directoryType: 'local' as 'local' | 'git',
  path: ''
})

// 角色选项
const roleOptions = computed(() => {
  return roles.value.map(role => ({
    label: role.displayName,
    value: role.name,
    description: role.description
  }))
})

// 选中角色的详细信息
const selectedRoleInfo = computed(() => {
  if (!formData.value.role) return null
  return roles.value.find(role => role.name === formData.value.role) || null
})

// 计算属性
const pathPlaceholder = computed(() => {
  return formData.value.directoryType === 'local'
    ? '例如: /Users/username/project 或 ./my-project'
    : '例如: https://github.com/username/repo.git'
})

const pathTipText = computed(() => {
  return formData.value.directoryType === 'local'
    ? '支持绝对路径和相对路径，或点击"浏览"选择目录'
    : '支持HTTPS和SSH协议的Git仓库地址，实例将自动克隆代码'
})

const canCreate = computed(() => {
  return formData.value.path.trim() !== ''
})

// 方法
const loadRoles = async () => {
  rolesLoading.value = true
  try {
    const response = await rolesApi.getList()
    roles.value = response.roles || []
    
    if (roles.value.length === 0) {
      // 设置默认角色
      roles.value = [
        { name: 'general-assistant', displayName: '通用助手', description: '通用AI助手', prompt: '' },
        { name: 'frontend-engineer', displayName: '前端开发工程师', description: '专业的前端开发工程师', prompt: '' },
        { name: 'backend-engineer', displayName: '后端开发工程师', description: '专业的后端开发工程师', prompt: '' },
        { name: 'architect', displayName: '架构师', description: '系统架构师', prompt: '' }
      ]
    }
  } catch (error: any) {
    console.error('加载角色列表失败:', error)
    // 使用默认角色选项作为后备
    roles.value = [
      { name: 'general-assistant', displayName: '通用助手', description: '通用AI助手', prompt: '' },
      { name: 'frontend-engineer', displayName: '前端开发工程师', description: '专业的前端开发工程师', prompt: '' },
      { name: 'backend-engineer', displayName: '后端开发工程师', description: '专业的后端开发工程师', prompt: '' },
      { name: 'architect', displayName: '架构师', description: '系统架构师', prompt: '' }
    ]
    message.error(`角色列表加载失败: ${error.message}`)
  } finally {
    rolesLoading.value = false
  }
}

const handleClose = () => {
  if (loading.value) return
  showModal.value = false
  resetForm()
}

const resetForm = () => {
  formData.value = {
    name: '',
    role: '',
    directoryType: 'local',
    path: './'
  }
}

const handleBrowseDirectory = async () => {
  browsing.value = true
  try {
    message.info('目录浏览功能需要桌面应用支持')
  } catch (error) {
    console.error('浏览目录失败:', error)
    message.error('浏览目录失败')
  } finally {
    browsing.value = false
  }
}

const handleCreate = async () => {
  if (!canCreate.value) {
    message.warning('请输入工作目录路径')
    return
  }

  loading.value = true
  try {
    const createData = {
      name: formData.value.name.trim() || undefined,
      role: formData.value.role || 'general-assistant',
      workDir: formData.value.path.trim(),
      namespace: currentNamespace.value,
      context: formData.value.directoryType === 'git' 
        ? `工作在Git仓库: ${formData.value.path.trim()}` 
        : `工作在本地目录: ${formData.value.path.trim()}`
    }

    const newAgent = await agentsStore.createAgent(currentNamespace.value, createData)
    message.success('实例创建成功！')
    emit('created', newAgent)
    handleClose()
  } catch (error: any) {
    console.error('创建实例失败:', error)
    message.error(error.message || '创建实例失败，请重试')
  } finally {
    loading.value = false
  }
}

// 生命周期
onMounted(() => {
  loadRoles()
})

// 监听显示状态变化
watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      resetForm()
      loadRoles()
    }
  }
)

// 监听目录类型变化
watch(
  () => formData.value.directoryType,
  (newType) => {
    if (newType === 'local' && !formData.value.path) {
      formData.value.path = './'
    } else if (newType === 'git' && !formData.value.path) {
      formData.value.path = 'https://github.com/username/repo.git'
    }
  }
)
</script>

<style scoped lang="scss">
.agent-create-form {
  color: #ffffff;

  .form-group {
    margin-bottom: 32px;
    
    .group-title {
      font-size: 16px;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid rgba(255, 255, 255, 0.2);
    }
  }

  .form-section {
    margin-bottom: 20px;

    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 8px;
    }

    .section-tip {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 6px;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.7);

      .n-icon {
        color: rgba(255, 255, 255, 0.6);
      }
    }
  }

  .namespace-display {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: rgba(59, 130, 246, 0.1);
    border-radius: 8px;
    border: 1px solid rgba(59, 130, 246, 0.3);

    .namespace-icon {
      color: #3b82f6;
    }

    .namespace-name {
      font-size: 14px;
      font-weight: 600;
      color: #ffffff;
    }
  }

  .directory-type-selector {
    .n-radio-group {
      display: flex;
      gap: 24px;
    }

    .radio-option {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      padding: 12px 16px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.2s ease;
      color: #ffffff;
      
      &:hover {
        border-color: #3b82f6;
        background: rgba(59, 130, 246, 0.1);
      }

      .n-icon {
        color: rgba(255, 255, 255, 0.8);
      }
    }
  }

  .path-input-container {
    display: flex;
    gap: 8px;
    align-items: center;

    .n-input {
      flex: 1;
    }
  }

  .selected-role-info {
    margin-top: 12px;
    padding: 12px;
    background: rgba(16, 185, 129, 0.1);
    border-radius: 8px;
    border: 1px solid rgba(16, 185, 129, 0.3);
    
    .role-info-header {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 6px;
      
      .role-icon {
        color: #10b981;
      }
      
      .role-name {
        font-size: 14px;
        font-weight: 600;
        color: #ffffff;
      }
    }
    
    .role-description {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.4;
    }
  }

  .info-banner {
    margin-top: 24px;
  }
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

// 选中状态样式
:deep(.n-radio--checked) {
  .radio-option {
    background: rgba(59, 130, 246, 0.2);
    border-color: #3b82f6;
    color: #ffffff;

    .n-icon {
      color: #3b82f6;
    }
  }
}

// 深度样式优化 - 确保输入框和选择框的文字为白色
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

  .n-input__border,
  .n-input__state-border {
    border-color: rgba(255, 255, 255, 0.2);
  }

  &:hover {
    .n-input__border,
    .n-input__state-border {
      border-color: rgba(255, 255, 255, 0.4);
    }
  }

  &.n-input--focus {
    .n-input__border,
    .n-input__state-border {
      border-color: #3b82f6;
    }
  }
}

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

  &:hover {
    .n-base-selection {
      border-color: rgba(255, 255, 255, 0.4);
    }
  }

  &.n-select--focused {
    .n-base-selection {
      border-color: #3b82f6;
    }
  }
}

:deep(.n-radio) {
  .n-radio__label {
    color: #ffffff;
  }

  .n-radio__dot {
    border-color: rgba(255, 255, 255, 0.4);
  }

  &.n-radio--checked {
    .n-radio__dot {
      border-color: #3b82f6;
      background-color: #3b82f6;
    }
  }
}

// 模态框标题样式
:deep(.n-card-header) {
  .n-card-header__main {
    color: #ffffff;
    font-weight: 600;
  }
}

// Alert 组件样式
:deep(.n-alert) {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);

  .n-alert__content {
    color: #ffffff;
  }

  .n-alert__icon {
    color: #3b82f6;
  }
}

// 按钮样式优化
:deep(.n-button) {
  &:not(.n-button--primary) {
    color: #ffffff;
    border-color: rgba(255, 255, 255, 0.3);

    &:hover {
      border-color: rgba(255, 255, 255, 0.5);
      background: rgba(255, 255, 255, 0.05);
    }
  }
}
</style>
