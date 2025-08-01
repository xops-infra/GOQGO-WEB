<template>
  <n-modal
    v-model:show="showModal"
    :mask-closable="false"
    preset="card"
    title="新建 Q CLI 实例"
    size="medium"
    :bordered="false"
    :segmented="true"
    style="width: 600px"
  >
    <template #header-extra>
      <n-button quaternary circle size="small" @click="handleClose">
        <template #icon>
          <n-icon>
            <svg viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
              />
            </svg>
          </n-icon>
        </template>
      </n-button>
    </template>

    <div class="agent-create-form">
      <!-- 当前Namespace -->
      <div class="form-section">
        <div class="section-title">当前 Namespace</div>
        <div class="namespace-display">
          <n-icon size="18" class="namespace-icon">
            <svg viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21V20A2,2 0 0,1 19,22H5A2,2 0 0,1 3,20V19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2M7.5,13A2.5,2.5 0 0,0 5,15.5A2.5,2.5 0 0,0 7.5,18A2.5,2.5 0 0,0 10,15.5A2.5,2.5 0 0,0 7.5,13M16.5,13A2.5,2.5 0 0,0 14,15.5A2.5,2.5 0 0,0 16.5,18A2.5,2.5 0 0,0 19,15.5A2.5,2.5 0 0,0 16.5,13Z"
              />
            </svg>
          </n-icon>
          <span class="namespace-name">{{ currentNamespace }}</span>
        </div>
        <div class="section-tip">
          <n-icon size="16">
            <svg viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"
              />
            </svg>
          </n-icon>
          <span>实例将在当前 namespace 中创建</span>
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
              <path
                fill="currentColor"
                d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"
              />
            </svg>
          </n-icon>
          <span>留空将自动生成名称</span>
        </div>
      </div>

      <!-- 实例角色 -->
      <div class="form-section">
        <div class="section-title">实例角色</div>
        <n-select
          v-model:value="formData.role"
          :options="roleOptions"
          placeholder="请选择实例的专业角色（可选）"
          clearable
          filterable
        />
        <div class="section-tip">
          <n-icon size="16">
            <svg viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"
              />
            </svg>
          </n-icon>
          <span>选择实例的专业角色（可选）</span>
        </div>
      </div>

      <!-- 工作目录 -->
      <div class="form-section">
        <div class="section-title">工作目录</div>
        <div class="directory-type-selector">
          <n-radio-group v-model:value="formData.directoryType">
            <n-radio value="local">
              <div class="radio-option">
                <n-icon size="18">
                  <svg viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M10,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8C22,6.89 21.1,6 20,6H12L10,4Z"
                    />
                  </svg>
                </n-icon>
                <span>本地路径</span>
              </div>
            </n-radio>
            <n-radio value="git">
              <div class="radio-option">
                <n-icon size="18">
                  <svg viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M2.6,10.59L8.38,4.8L10.07,6.5C9.83,7.35 10.22,8.28 11,8.73V14.27C10.4,14.61 10,15.26 10,16A2,2 0 0,0 12,18A2,2 0 0,0 14,16C14,15.26 13.6,14.61 13,14.27V9.41L15.07,11.5C15,11.65 15,11.82 15,12A2,2 0 0,0 17,14A2,2 0 0,0 19,12A2,2 0 0,0 17,10C16.82,10 16.65,10 16.5,10.07L13.93,7.5C14.19,6.57 13.71,5.55 12.78,5.16C11.85,4.77 10.83,5.25 10.44,6.18C10.05,7.11 10.53,8.13 11.46,8.52C11.5,8.53 11.54,8.54 11.58,8.55L10.07,7.04L2.6,14.5L2.6,10.59Z"
                    />
                  </svg>
                </n-icon>
                <span>Git 地址</span>
              </div>
            </n-radio>
          </n-radio-group>
        </div>
      </div>

      <!-- 路径输入 -->
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
                  <path
                    fill="currentColor"
                    d="M10,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8C22,6.89 21.1,6 20,6H12L10,4Z"
                  />
                </svg>
              </n-icon>
            </template>
            浏览
          </n-button>
        </div>
        <div class="section-tip">
          <n-icon size="16">
            <svg viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"
              />
            </svg>
          </n-icon>
          <span>{{ pathTipText }}</span>
        </div>
      </div>

      <!-- 提示信息 -->
      <div class="info-banner">
        <n-alert type="info" :show-icon="true">
          <template #icon>
            <n-icon>
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"
                />
              </svg>
            </n-icon>
          </template>
          提示：新建的实例将在指定的
          <strong>{{ currentNamespace }}</strong> 中运行，使用选定的角色配置。
        </n-alert>
      </div>
    </div>

    <template #action>
      <div class="modal-actions">
        <n-button @click="handleClose" :disabled="loading"> 取消 </n-button>
        <n-button type="primary" @click="handleCreate" :loading="loading" :disabled="!canCreate">
          <template #icon>
            <n-icon>
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
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
import { ref, computed, watch } from 'vue'
import { useMessage } from 'naive-ui'
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

// 表单数据
const formData = ref({
  name: '',
  role: '',
  directoryType: 'local' as 'local' | 'git',
  path: ''
})

// 角色选项
const roleOptions = [
  { label: '前端开发工程师', value: 'frontend-engineer' },
  { label: '后端开发工程师', value: 'backend-engineer' },
  { label: '全栈开发工程师', value: 'fullstack-engineer' },
  { label: 'DevOps工程师', value: 'devops-engineer' },
  { label: '测试工程师', value: 'test-engineer' },
  { label: '产品经理', value: 'product-manager' },
  { label: '项目经理', value: 'project-manager' },
  { label: 'UI/UX设计师', value: 'ui-ux-designer' },
  { label: '数据分析师', value: 'data-analyst' },
  { label: '架构师', value: 'architect' },
  { label: '技术顾问', value: 'technical-consultant' },
  { label: '通用助手', value: 'general-assistant' }
]

// 计算属性
const pathPlaceholder = computed(() => {
  return formData.value.directoryType === 'local'
    ? '例如: /Users/username/project'
    : '例如: https://github.com/username/repo.git'
})

const pathTipText = computed(() => {
  return formData.value.directoryType === 'local'
    ? '请输入本地目录的绝对路径，或点击"浏览"选择目录'
    : '请输入Git仓库的完整地址，支持HTTPS和SSH协议'
})

const canCreate = computed(() => {
  return formData.value.path.trim() !== ''
})

// 方法
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
    path: ''
  }
}

const handleBrowseDirectory = async () => {
  browsing.value = true
  try {
    // 这里可以调用系统的目录选择对话框
    // 由于Web环境限制，这里只是模拟
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

  // 验证Git地址格式
  if (formData.value.directoryType === 'git') {
    const gitUrlPattern =
      /^(https?:\/\/[\w.-]+\/[\w.-]+\/[\w.-]+\.git|git@[\w.-]+:[\w.-]+\/[\w.-]+\.git)$/
    if (!gitUrlPattern.test(formData.value.path.trim())) {
      message.error('Git地址格式不正确，请输入完整的Git仓库地址')
      return
    }
  }

  // 验证本地路径格式
  if (formData.value.directoryType === 'local') {
    if (!formData.value.path.trim().startsWith('/')) {
      message.error('本地路径必须是绝对路径')
      return
    }
  }

  loading.value = true
  try {
    const createData = {
      name: formData.value.name.trim() || undefined,
      role: formData.value.role || undefined,
      workingDirectory: {
        type: formData.value.directoryType,
        path: formData.value.path.trim()
      },
      namespace: currentNamespace.value
    }

    console.log('创建实例数据:', createData)

    // 调用API创建实例
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

// 监听显示状态变化
watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      resetForm()
    }
  }
)
</script>

<style scoped lang="scss">
.agent-create-form {
  .form-section {
    margin-bottom: 24px;

    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
    }

    .section-tip {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 6px;
      font-size: 12px;
      color: #666;

      .n-icon {
        color: #999;
      }
    }
  }

  .namespace-display {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: #f5f5f5;
    border-radius: 6px;
    border: 1px solid #e0e0e0;

    .namespace-icon {
      color: #666;
    }

    .namespace-name {
      font-size: 14px;
      font-weight: 500;
      color: #333;
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
      gap: 6px;
      font-size: 14px;
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

  .info-banner {
    margin-top: 20px;

    :deep(.n-alert) {
      .n-alert__content {
        font-size: 13px;
        line-height: 1.5;
      }
    }
  }
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

// 深度样式优化
:deep(.n-card-header) {
  .n-card-header__main {
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }
}

:deep(.n-input) {
  .n-input__input-el {
    font-size: 14px;
  }
}

:deep(.n-select) {
  .n-base-selection-label {
    font-size: 14px;
  }
}

:deep(.n-radio) {
  .n-radio__label {
    font-size: 14px;
  }
}
</style>
