<template>
  <n-dropdown
    :options="themeOptions"
    @select="handleThemeSelect"
    trigger="click"
    placement="bottom-end"
  >
    <n-button
      quaternary
      circle
      size="medium"
      class="theme-toggle-btn"
      :title="currentThemeLabel"
    >
      <template #icon>
        <n-icon size="18">
          <component :is="currentThemeIcon" />
        </n-icon>
      </template>
    </n-button>
  </n-dropdown>
</template>

<script setup lang="ts">
import { computed, h, ref, onMounted } from 'vue'
import { NButton, NDropdown, NIcon } from 'naive-ui'
import { themeManager } from '@/utils/theme'
import { useAppStore } from '@/stores/app'
import type { ThemeMode } from '@/stores/app'

// 响应式的当前主题
const currentTheme = ref<ThemeMode>('light')

// 图标组件 (使用 h 函数创建)
const SunIcon = {
  render: () => h('svg', {
    viewBox: '0 0 24 24',
    fill: 'currentColor'
  }, [
    h('path', {
      d: 'M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z'
    })
  ])
}

const MoonIcon = {
  render: () => h('svg', {
    viewBox: '0 0 24 24',
    fill: 'currentColor'
  }, [
    h('path', {
      fillRule: 'evenodd',
      d: 'M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z',
      clipRule: 'evenodd'
    })
  ])
}

const AutoIcon = {
  render: () => h('svg', {
    viewBox: '0 0 24 24',
    fill: 'currentColor'
  }, [
    h('path', {
      d: 'M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12 19.5c-4.125 0-7.5-3.375-7.5-7.5S7.875 4.5 12 4.5V19.5z'
    })
  ])
}

const themeOptions = [
  {
    label: '浅色模式',
    key: 'light' as ThemeMode,
    icon: SunIcon
  },
  {
    label: '深色模式',
    key: 'dark' as ThemeMode,
    icon: MoonIcon
  },
  {
    label: '跟随系统',
    key: 'auto' as ThemeMode,
    icon: AutoIcon
  }
]

const currentThemeIcon = computed(() => {
  const option = themeOptions.find(opt => opt.key === currentTheme.value)
  return option?.icon || SunIcon
})

const currentThemeLabel = computed(() => {
  const option = themeOptions.find(opt => opt.key === currentTheme.value)
  return option?.label || '浅色模式'
})

const handleThemeSelect = (key: ThemeMode) => {
  currentTheme.value = key
  
  // 更新主题管理器
  themeManager.setTheme(key)
  
  // 尝试更新 store
  try {
    const appStore = useAppStore()
    appStore.theme = key
  } catch (error) {
    // 如果 store 不可用，忽略错误
    console.warn('Store not available:', error)
  }
}

onMounted(() => {
  // 初始化当前主题
  currentTheme.value = themeManager.getSavedTheme()
})
</script>

<style scoped lang="scss">
.theme-toggle-btn {
  color: var(--text-secondary);
  transition: all 0.3s ease;
  
  &:hover {
    color: var(--text-primary);
    background-color: var(--bg-hover);
  }
}
</style>
