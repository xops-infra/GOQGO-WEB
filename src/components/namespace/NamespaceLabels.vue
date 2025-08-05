<template>
  <div class="namespace-labels">
    <!-- 现有标签 -->
    <div v-if="Object.keys(labels).length > 0" class="labels-list">
      <div
        v-for="(value, key) in labels"
        :key="key"
        class="label-item"
      >
        <span class="label-key">{{ key }}</span>
        <span class="label-separator">:</span>
        <span class="label-value">{{ value }}</span>
        <n-button
          text
          size="tiny"
          @click="removeLabel(key)"
          class="remove-button"
        >
          <n-icon size="12">
            <CloseIcon />
          </n-icon>
        </n-button>
      </div>
    </div>

    <!-- 添加新标签 -->
    <div class="add-label">
      <n-input
        v-model:value="newLabelKey"
        placeholder="标签名"
        size="small"
        style="width: 100px"
        @keydown.enter="addLabel"
      />
      <span class="separator">:</span>
      <n-input
        v-model:value="newLabelValue"
        placeholder="标签值"
        size="small"
        style="width: 120px"
        @keydown.enter="addLabel"
      />
      <n-button
        size="small"
        @click="addLabel"
        :disabled="!canAddLabel"
      >
        添加
      </n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NInput, NButton, NIcon } from 'naive-ui'
import CloseIcon from '@/components/icons/CloseIcon.vue'

interface Props {
  labels: Record<string, string>
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '添加标签...'
})

const emit = defineEmits<{
  'update:labels': [labels: Record<string, string>]
}>()

// 响应式数据
const newLabelKey = ref('')
const newLabelValue = ref('')

// 计算属性
const canAddLabel = computed(() => {
  return newLabelKey.value.trim() && newLabelValue.value.trim() &&
         !props.labels.hasOwnProperty(newLabelKey.value.trim())
})

// 方法
const addLabel = () => {
  if (!canAddLabel.value) return

  const key = newLabelKey.value.trim()
  const value = newLabelValue.value.trim()

  const updatedLabels = {
    ...props.labels,
    [key]: value
  }

  emit('update:labels', updatedLabels)
  
  // 清空输入
  newLabelKey.value = ''
  newLabelValue.value = ''
}

const removeLabel = (key: string) => {
  const updatedLabels = { ...props.labels }
  delete updatedLabels[key]
  emit('update:labels', updatedLabels)
}
</script>

<style scoped lang="scss">
.namespace-labels {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.labels-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.label-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 4px;
  font-size: 12px;
  
  .label-key {
    color: var(--color-primary);
    font-weight: 600;
  }
  
  .label-separator {
    color: var(--text-tertiary);
  }
  
  .label-value {
    color: var(--text-primary);
  }
  
  .remove-button {
    color: var(--text-tertiary);
    
    &:hover {
      color: var(--color-error);
    }
  }
}

.add-label {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .separator {
    color: var(--text-tertiary);
    font-weight: bold;
  }
}

// Terminal主题样式
[data-theme='terminal'] .namespace-labels {
  .label-item {
    background: var(--terminal-bg-tertiary);
    border-color: var(--terminal-border);
    
    .label-key {
      color: var(--pixel-green);
      font-family: var(--font-mono);
      text-transform: uppercase;
    }
    
    .label-separator {
      color: var(--terminal-text-tertiary);
    }
    
    .label-value {
      color: var(--terminal-text);
      font-family: var(--font-mono);
    }
    
    .remove-button {
      color: var(--terminal-text-tertiary);
      
      &:hover {
        color: var(--pixel-red);
      }
    }
  }
  
  .add-label .separator {
    color: var(--terminal-text-tertiary);
    font-family: var(--font-mono);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .add-label {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    
    .n-input {
      width: 100% !important;
    }
    
    .separator {
      display: none;
    }
  }
}
</style>
