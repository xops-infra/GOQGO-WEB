<template>
  <div class="message-editor">
    <n-input
      ref="inputRef"
      :value="value"
      @update:value="$emit('update:value', $event)"
      type="textarea"
      :placeholder="placeholder"
      :autosize="{ minRows: 1, maxRows: 6 }"
      :disabled="disabled"
      @keydown="$emit('keydown', $event)"
      @paste="$emit('paste', $event)"
      @input="$emit('input', $event)"
      class="message-input"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NInput } from 'naive-ui'

interface Props {
  value: string
  placeholder?: string
  disabled?: boolean
}

defineProps<Props>()

defineEmits<{
  'update:value': [value: string]
  keydown: [event: KeyboardEvent]
  paste: [event: ClipboardEvent]
  input: [event: Event]
}>()

const inputRef = ref()

// 暴露方法给父组件
defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  getInputElement: () => {
    return inputRef.value?.inputElRef || 
           inputRef.value?.textareaElRef || 
           inputRef.value?.$el?.querySelector('textarea') || 
           inputRef.value?.$el?.querySelector('input')
  }
})
</script>

<style scoped lang="scss">
.message-editor {
  flex: 1;
}

.message-input {
  // 重写Naive UI输入框样式以适配主题
  :deep(.n-input) {
    background-color: var(--bg-secondary) !important;
    border: 1px solid var(--border-primary) !important;
    border-radius: 8px !important;
    transition: all 0.3s ease !important;

    // 输入框内部元素
    .n-input__input-el,
    .n-input__textarea-el {
      background-color: transparent !important;
      color: var(--text-primary) !important;
      border: none !important;
      font-size: 14px !important;
      line-height: 1.5 !important;
      padding: 8px 12px !important;

      &::placeholder {
        color: var(--text-tertiary) !important;
        opacity: 1 !important;
      }

      &:focus {
        outline: none !important;
      }
    }

    // 边框状态
    .n-input__border,
    .n-input__state-border {
      border: none !important;
    }

    // 悬停状态
    &:hover {
      border-color: var(--border-focus) !important;
      background-color: var(--bg-hover) !important;
    }

    // 聚焦状态
    &.n-input--focus {
      border-color: var(--color-primary) !important;
      background-color: var(--bg-secondary) !important;
      box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.1) !important;
    }

    // 禁用状态
    &.n-input--disabled {
      background-color: var(--bg-tertiary) !important;
      border-color: var(--border-secondary) !important;
      opacity: 0.6 !important;

      .n-input__input-el,
      .n-input__textarea-el {
        color: var(--text-disabled) !important;
      }
    }
  }

  // textarea特殊处理
  :deep(.n-input__textarea-el) {
    resize: none !important;
    min-height: 36px !important;
    max-height: 144px !important;
  }
}

// Terminal主题样式
[data-theme='terminal'] .message-input {
  :deep(.n-input) {
    background-color: var(--terminal-bg-secondary) !important;
    border-color: var(--terminal-border) !important;
    
    .n-input__input-el,
    .n-input__textarea-el {
      color: var(--terminal-text) !important;
      font-family: var(--font-mono) !important;
      
      &::placeholder {
        color: var(--terminal-text-tertiary) !important;
      }
    }

    &:hover {
      border-color: var(--terminal-border-active) !important;
      background-color: var(--terminal-bg-tertiary) !important;
    }

    &.n-input--focus {
      border-color: var(--pixel-green) !important;
      box-shadow: 0 0 0 2px rgba(0, 255, 65, 0.1) !important;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .message-input {
    :deep(.n-input) {
      .n-input__input-el,
      .n-input__textarea-el {
        font-size: 13px !important;
        padding: 6px 10px !important;
      }
    }

    :deep(.n-input__textarea-el) {
      min-height: 32px !important;
      max-height: 120px !important;
    }
  }
}
</style>
