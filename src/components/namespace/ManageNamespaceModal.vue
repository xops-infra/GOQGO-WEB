<template>
  <n-modal
    :show="show"
    @update:show="$emit('update:show', $event)"
    preset="card"
    :title="`管理命名空间 - ${namespace?.name || ''}`"
    style="width: 500px"
    :mask-closable="false"
  >
    <div v-if="namespace" class="manage-namespace-content">
      <!-- 基本信息编辑 -->
      <div class="form-section">
        <label class="form-label">显示名称</label>
        <n-input
          v-model:value="formData.displayName"
          placeholder="例如: 我的项目"
          size="medium"
        />
      </div>

      <div class="form-section">
        <label class="form-label">描述</label>
        <n-input
          v-model:value="formData.description"
          type="textarea"
          placeholder="描述这个命名空间的用途..."
          :autosize="{ minRows: 3, maxRows: 5 }"
        />
      </div>

      <!-- 命名空间状态 -->
      <div class="form-section">
        <label class="form-label">状态信息</label>
        <div class="status-info">
          <div class="status-item">
            <span class="label">状态:</span>
            <n-tag :type="getStatusType(namespace.status)" size="small">
              {{ namespace.status }}
            </n-tag>
          </div>
          <div class="status-item">
            <span class="label">创建时间:</span>
            <span class="value">{{ formatDate(namespace.createdAt) }}</span>
          </div>
        </div>
      </div>

      <!-- 危险操作区域 -->
      <div class="danger-section">
        <h4>危险操作</h4>
        <div class="danger-actions">
          <n-button
            type="error"
            size="small"
            @click="showDeleteConfirm = true"
            :disabled="namespace.name === 'default'"
          >
            <template #icon>
              <n-icon>
                <DeleteIcon />
              </n-icon>
            </template>
            删除命名空间
          </n-button>
          <p v-if="namespace.name === 'default'" class="danger-hint">
            默认命名空间不能删除
          </p>
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
          :loading="updating"
          @click="handleUpdate"
        >
          保存更改
        </n-button>
      </div>
    </template>

    <!-- 删除确认对话框 -->
    <n-modal
      v-model:show="showDeleteConfirm"
      preset="dialog"
      title="确认删除命名空间"
      positive-text="确认删除"
      negative-text="取消"
      @positive-click="handleDelete"
    >
      <div class="delete-confirm-content">
        <p>您即将删除命名空间 <strong>{{ namespace?.name }}</strong>。</p>
        <p>此操作将：</p>
        <ul>
          <li>删除该命名空间下的所有Agent</li>
          <li>清除相关的聊天记录</li>
          <li>移除所有配置信息</li>
        </ul>
        <p><strong>此操作不可撤销，请谨慎操作！</strong></p>
        
        <div class="confirm-input">
          <label>请输入命名空间名称以确认删除:</label>
          <n-input
            v-model:value="deleteConfirmText"
            :placeholder="namespace?.name"
            size="small"
          />
        </div>
      </div>
    </n-modal>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  NModal,
  NInput,
  NButton,
  NIcon,
  NTag,
  useMessage
} from 'naive-ui'
import DeleteIcon from '@/components/icons/DeleteIcon.vue'
import type { Namespace } from '@/types/api'

interface Props {
  show: boolean
  namespace: Namespace | null
  namespaces: Namespace[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  updated: [namespace: Namespace]
  deleted: [namespaceName: string]
}>()

const message = useMessage()

// 响应式数据
const updating = ref(false)
const showDeleteConfirm = ref(false)
const deleteConfirmText = ref('')
const formData = ref({
  displayName: '',
  description: ''
})

// 计算属性
const canDelete = computed(() => {
  return deleteConfirmText.value === props.namespace?.name
})

// 方法
const getStatusType = (status: string) => {
  const typeMap = {
    Active: 'success',
    Terminating: 'warning',
    Failed: 'error'
  }
  return typeMap[status] || 'default'
}

const formatDate = (dateString: string) => {
  if (!dateString) return '未知'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN')
  } catch {
    return dateString
  }
}

const handleUpdate = async () => {
  if (!props.namespace) return

  updating.value = true
  try {
    const updatedNamespace: Namespace = {
      ...props.namespace,
      displayName: formData.value.displayName.trim() || props.namespace.name,
      description: formData.value.description.trim(),
      updatedAt: new Date().toISOString()
    }

    emit('updated', updatedNamespace)
    emit('update:show', false)
  } catch (error: any) {
    console.error('更新命名空间失败:', error)
    message.error(`更新失败: ${error.message}`)
  } finally {
    updating.value = false
  }
}

const handleDelete = async () => {
  if (!props.namespace || !canDelete.value) return

  try {
    emit('deleted', props.namespace.name)
    showDeleteConfirm.value = false
    emit('update:show', false)
  } catch (error: any) {
    console.error('删除命名空间失败:', error)
    message.error(`删除失败: ${error.message}`)
  }
}

// 监听命名空间变化，更新表单数据
watch(() => props.namespace, (newNamespace) => {
  if (newNamespace) {
    formData.value = {
      displayName: newNamespace.displayName || newNamespace.name,
      description: newNamespace.description || ''
    }
  }
}, { immediate: true })

// 监听显示状态变化，重置删除确认
watch(() => props.show, (newShow) => {
  if (!newShow) {
    showDeleteConfirm.value = false
    deleteConfirmText.value = ''
  }
})
</script>

<style scoped lang="scss">
.manage-namespace-content {
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
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 6px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .label {
    font-size: 13px;
    color: var(--text-secondary);
    font-weight: 500;
    min-width: 80px;
  }
  
  .value {
    font-size: 13px;
    color: var(--text-primary);
    font-family: var(--font-mono);
  }
}

.danger-section {
  border-top: 1px solid var(--border-primary);
  padding-top: 16px;
  
  h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
    color: var(--color-error);
    font-weight: 600;
  }
}

.danger-actions {
  .danger-hint {
    margin: 8px 0 0 0;
    font-size: 12px;
    color: var(--text-tertiary);
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.delete-confirm-content {
  p {
    margin: 0 0 12px 0;
    line-height: 1.5;
  }
  
  ul {
    margin: 12px 0;
    padding-left: 20px;
    
    li {
      margin-bottom: 4px;
      color: var(--text-secondary);
    }
  }
  
  strong {
    color: var(--color-error);
  }
}

.confirm-input {
  margin-top: 16px;
  
  label {
    display: block;
    margin-bottom: 8px;
    font-size: 13px;
    color: var(--text-secondary);
    font-weight: 500;
  }
}

// Terminal主题样式
[data-theme='terminal'] .manage-namespace-content {
  .form-label {
    color: var(--terminal-text);
    font-family: var(--font-mono);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-size: 12px;
  }
  
  .status-info {
    background: var(--terminal-bg-secondary);
    border: 1px solid var(--terminal-border);
  }
  
  .status-item {
    .label {
      color: var(--terminal-text-secondary);
      font-family: var(--font-mono);
      text-transform: uppercase;
      font-size: 11px;
    }
    
    .value {
      color: var(--terminal-text);
      font-family: var(--font-mono);
    }
  }
  
  .danger-section {
    border-top-color: var(--terminal-border);
    
    h4 {
      color: var(--pixel-red);
      font-family: var(--font-display);
      text-transform: uppercase;
    }
    
    .danger-hint {
      color: var(--terminal-text-tertiary);
      font-family: var(--font-mono);
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .modal-footer {
    flex-direction: column-reverse;
    
    .n-button {
      width: 100%;
    }
  }
}
</style>
