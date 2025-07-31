<template>
  <n-config-provider :theme="naiveTheme" :theme-overrides="themeOverrides">
    <n-message-provider>
      <n-dialog-provider>
        <n-notification-provider>
          <div class="app theme-transition">
            <router-view />
          </div>
        </n-notification-provider>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { darkTheme, type GlobalThemeOverrides } from 'naive-ui'
import { useAppStore } from '@/stores/app'
import { themeManager } from '@/utils/theme'

const appStore = useAppStore()

// 响应式的当前主题状态
const currentTheme = ref<'light' | 'dark'>('light')

// Naive UI 主题配置
const naiveTheme = computed(() => {
  return currentTheme.value === 'dark' ? darkTheme : null
})

// Naive UI 主题覆盖
const themeOverrides = computed<GlobalThemeOverrides>(() => {
  const isDark = currentTheme.value === 'dark'
  
  return {
    common: {
      primaryColor: isDark ? '#60a5fa' : '#3b82f6',
      primaryColorHover: isDark ? '#3b82f6' : '#2563eb',
      primaryColorPressed: isDark ? '#2563eb' : '#1d4ed8',
      primaryColorSuppl: isDark ? '#60a5fa' : '#3b82f6',
      
      successColor: isDark ? '#34d399' : '#10b981',
      warningColor: isDark ? '#fbbf24' : '#f59e0b',
      errorColor: isDark ? '#f87171' : '#ef4444',
      infoColor: isDark ? '#22d3ee' : '#06b6d4',
      
      textColorBase: isDark ? '#f8fafc' : '#1f2937',
      textColor1: isDark ? '#f8fafc' : '#1f2937',
      textColor2: isDark ? '#cbd5e1' : '#6b7280',
      textColor3: isDark ? '#94a3b8' : '#9ca3af',
      textColorDisabled: isDark ? '#64748b' : '#d1d5db',
      
      bodyColor: isDark ? '#0f172a' : '#ffffff',
      cardColor: isDark ? '#1e293b' : '#ffffff',
      modalColor: isDark ? '#1e293b' : '#ffffff',
      popoverColor: isDark ? '#334155' : '#ffffff',
      
      borderColor: isDark ? '#475569' : '#e5e7eb',
      dividerColor: isDark ? '#475569' : '#f3f4f6',
      
      hoverColor: isDark ? '#475569' : '#f5f5f5',
      pressedColor: isDark ? '#1e40af' : '#e8f0fe',
      
      boxShadow1: isDark ? '0 1px 2px 0 rgba(0, 0, 0, 0.3)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      boxShadow2: isDark ? '0 4px 6px -1px rgba(0, 0, 0, 0.4)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      boxShadow3: isDark ? '0 10px 15px -3px rgba(0, 0, 0, 0.5)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    }
  }
})

// 更新当前主题状态
const updateCurrentTheme = () => {
  currentTheme.value = themeManager.getCurrentTheme()
}

onMounted(() => {
  // 初始化主题管理器
  themeManager.init()
  
  // 从本地存储恢复主题设置
  const savedTheme = themeManager.getSavedTheme()
  appStore.theme = savedTheme
  
  // 设置初始主题
  updateCurrentTheme()
  
  // 监听 store 中的主题变化
  watch(
    () => appStore.theme,
    (newTheme) => {
      themeManager.applyTheme(newTheme)
      updateCurrentTheme()
    },
    { immediate: true }
  )
  
  // 监听系统主题变化
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemThemeChange = () => {
      if (appStore.theme === 'auto') {
        updateCurrentTheme()
      }
    }
    
    mediaQuery.addEventListener('change', handleSystemThemeChange)
    
    // 清理函数
    onUnmounted(() => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
      themeManager.destroy()
    })
  }
})
</script>

<style lang="scss">
@use '@/styles/theme.scss';

#app {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.app {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

// 全局组件样式覆盖
.n-card {
  background-color: var(--bg-primary) !important;
  border-color: var(--border-primary) !important;
  
  .n-card__content {
    color: var(--text-primary) !important;
  }
}

.n-button {
  transition: all 0.3s ease !important;
}

// 强制覆盖所有输入框样式
.n-input,
.n-input .n-input-wrapper,
.n-input .n-input__input,
.n-input .n-input__textarea {
  background-color: var(--bg-secondary) !important;
  color: var(--text-primary) !important;
}

.n-input {
  .n-input__input-el,
  .n-input__textarea-el {
    background-color: var(--bg-secondary) !important;
    color: var(--text-primary) !important;
    border: none !important;
    
    &::placeholder {
      color: var(--text-tertiary) !important;
    }
  }
  
  .n-input__border,
  .n-input__state-border {
    border-color: var(--border-primary) !important;
  }
  
  &:hover .n-input__state-border {
    border-color: var(--border-focus) !important;
  }
  
  &.n-input--focus .n-input__state-border {
    border-color: var(--color-primary) !important;
  }
}

.n-menu {
  background-color: var(--bg-secondary) !important;
  
  .n-menu-item {
    color: var(--text-secondary) !important;
    
    &:hover {
      background-color: var(--bg-hover) !important;
    }
    
    &.n-menu-item--selected {
      background-color: var(--bg-active) !important;
      color: var(--color-primary) !important;
    }
  }
}

.n-layout-sider {
  background-color: var(--bg-secondary) !important;
  border-color: var(--border-primary) !important;
}

.n-layout-header {
  background-color: var(--bg-primary) !important;
  border-color: var(--border-primary) !important;
}

.n-layout-content {
  background-color: var(--bg-primary) !important;
}

.n-modal {
  .n-card {
    background-color: var(--bg-modal) !important;
    backdrop-filter: blur(10px);
  }
}

.n-drawer {
  .n-drawer-body-content-wrapper {
    background-color: var(--bg-secondary) !important;
  }
}

// 下拉菜单强制覆盖
.n-dropdown-menu {
  background-color: var(--bg-primary) !important;
  border: 1px solid var(--border-primary) !important;
  box-shadow: var(--shadow-lg) !important;
  
  .n-dropdown-option {
    color: var(--text-primary) !important;
    
    &:hover {
      background-color: var(--bg-hover) !important;
    }
  }
}
</style>
