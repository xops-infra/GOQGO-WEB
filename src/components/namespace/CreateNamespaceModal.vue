<template>
  <n-modal
    :show="show"
    @update:show="$emit('update:show', $event)"
    preset="card"
    title="创建新命名空间"
    style="width: 500px"
    :mask-closable="false"
    :closable="true"
  >
    <div class="create-namespace-form">
      <!-- 命名空间名称 -->
      <div class="form-section">
        <label class="form-label">
          命名空间名称 <span class="required">*</span>
        </label>
        <n-input
          v-model:value="formData.name"
          placeholder="例如: my-project"
          size="medium"
          :status="nameValidation.isValid ? undefined : 'error'"
          @blur="validateName"
        />
        <div v-if="!nameValidation.isValid" class="form-error">
          {{ nameValidation.message }}
        </div>
        <div class="form-hint">
          只能包含小写字母、数字和连字符，不能以连字符开头或结尾
        </div>
      </div>

      <!-- 显示名称 -->
      <div class="form-section">
        <label class="form-label">显示名称</label>
        <n-input
          v-model:value="formData.displayName"
          placeholder="例如: 我的项目"
          size="medium"
        />
        <div class="form-hint">
          用于界面显示的友好名称
        </div>
      </div>

      <!-- 描述 -->
      <div class="form-section">
        <label class="form-label">描述</label>
        <n-input
          v-model:value="formData.description"
          type="textarea"
          placeholder="描述这个命名空间的用途..."
          :autosize="{ minRows: 3, maxRows: 5 }"
        />
      </div>

      <!-- 标签 -->
      <div class="form-section">
        <label class="form-label">标签</label>
        <NamespaceLabels
          v-model:labels="formData.labels"
          placeholder="添加标签..."
        />
        <div class="form-hint">
          用于分类和筛选命名空间
        </div>
      </div>

      <!-- 资源配额 -->
      <div class="form-section">
        <label class="form-label">资源配额</label>
        <div class="quota-grid">
          <div class="quota-item">
            <label>最大Agent数量</label>
            <n-input-number
              v-model:value="formData.resourceQuota.maxAgents"
              :min="1"
              :max="100"
              size="small"
            />
          </div>
          <div class="quota-item">
            <label>CPU限制 (核)</label>
            <n-input-number
              v-model:value="formData.resourceQuota.cpuLimit"
              :min="0.1"
              :max="16"
              :step="0.1"
              size="small"
            />
          </div>
          <div class="quota-item">
            <label>内存限制 (GB)</label>
            <n-input-number
              v-model:value="formData.resourceQuota.memoryLimit"
              :min="0.5"
              :max="64"
              :step="0.5"
              size="small"
            />
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="modal-footer">
        <n-button @click="$emit('update:show', false)">
          取消
        </n-button>
        <n-button
          type="primary"
          :loading="creating"
          :disabled="!canCreate"
          @click="handleCreate"
        >
          创建命名空间
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  NModal,
  NInput,
  NInputNumber,
  NButton,
  useMessage
} from 'naive-ui'
import NamespaceLabels from './NamespaceLabels.vue'
import type { Namespace } from '@/types/api'

interface Props {
  show: boolean
  namespaces: Namespace[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  created: [namespace: Namespace]
}>()

const message = useMessage()

// 响应式数据
const creating = ref(false)
const formData = ref({
  name: '',
  displayName: '',
  description: '',
  labels: {} as Record<string, string>,
  resourceQuota: {
    maxAgents: 10,
    cpuLimit: 2,
    memoryLimit: 4
  }
})

// 计算属性
const nameValidation = computed(() => {
  const name = formData.value.name.trim()
  
  if (!name) {
    return { isValid: false, message: '命名空间名称不能为空' }
  }
  
  const namePattern = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/
  if (!namePattern.test(name)) {
    return {
      isValid: false,
      message: '名称格式不正确'
    }
  }
  
  const exists = props.namespaces.some(ns => ns.name === name)
  if (exists) {
    return { isValid: false, message: '命名空间名称已存在' }
  }
  
  return { isValid: true, message: '' }
})

const canCreate = computed(() => {
  return nameValidation.value.isValid && formData.value.name.trim()
})

// 方法
const validateName = () => {
  // 触发验证显示
}

const handleCreate = async () => {
  if (!canCreate.value) return

  creating.value = true
  try {
    const namespace: Namespace = {
      name: formData.value.name.trim(),
      displayName: formData.value.displayName.trim() || formData.value.name.trim(),
      description: formData.value.description.trim(),
      labels: formData.value.labels,
      resourceQuota: formData.value.resourceQuota,
      status: 'Active',
      createdAt: new Date().toISOString()
    }

    emit('created', namespace)
    emit('update:show', false)
    resetForm()
  } catch (error: any) {
    console.error('创建命名空间失败:', error)
    message.error(`创建失败: ${error.message}`)
  } finally {
    creating.value = false
  }
}

const resetForm = () => {
  formData.value = {
    name: '',
    displayName: '',
    description: '',
    labels: {},
    resourceQuota: {
      maxAgents: 10,
      cpuLimit: 2,
      memoryLimit: 4
    }
  }
}

// 监听显示状态变化
watch(() => props.show, (newShow) => {
  if (newShow) {
    resetForm()
  }
})
</script>

<style scoped lang="scss">
.create-namespace-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  
  .required {
    color: var(--color-error);
    margin-left: 2px;
  }
}

.form-error {
  font-size: 12px;
  color: var(--color-error);
  margin-top: 4px;
}

.form-hint {
  font-size: 12px;
  color: var(--text-tertiary);
  margin-top: 4px;
}

.quota-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  
  .quota-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
    
    label {
      font-size: 13px;
      color: var(--text-secondary);
      font-weight: 500;
    }
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

// Terminal主题样式
[data-theme='terminal'] .create-namespace-form {
  .form-label {
    color: var(--terminal-text);
    font-family: var(--font-mono);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-size: 12px;
  }
  
  .form-hint {
    color: var(--terminal-text-tertiary);
    font-family: var(--font-mono);
  }
  
  .form-error {
    color: var(--pixel-red);
    font-family: var(--font-mono);
  }
  
  .quota-item label {
    color: var(--terminal-text-secondary);
    font-family: var(--font-mono);
    text-transform: uppercase;
    font-size: 11px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .quota-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .modal-footer {
    flex-direction: column-reverse;
    
    .n-button {
      width: 100%;
    }
  }
}
</style>
