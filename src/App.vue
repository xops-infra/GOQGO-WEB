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
import { computed, onMounted, onUnmounted } from 'vue'
import { darkTheme, type GlobalThemeOverrides } from 'naive-ui'
import { useAppStore } from '@/stores/app'
import { themeManager, useTheme } from '@/utils/theme'

const appStore = useAppStore()
const { getCurrentTheme } = useTheme()

// Naive UI 主题配置
const naiveTheme = computed(() => {
  return getCurrentTheme() === 'dark' ? darkTheme : null
})

// Naive UI 主题覆盖
const themeOverrides = computed<GlobalThemeOverrides>(() => {
  const isDark = getCurrentTheme() === 'dark'
  
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

onMounted(() => {
  // 初始化主题
  const savedTheme = themeManager.getSavedTheme()
  appStore.theme = savedTheme
})

onUnmounted(() => {
  themeManager.destroy()
})
</script>

<style lang="scss">
@import '@/styles/theme.scss';

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

.n-input {
  background-color: var(--bg-secondary) !important;
  border-color: var(--border-primary) !important;
  color: var(--text-primary) !important;
  
  &:focus {
    border-color: var(--border-focus) !important;
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
</style>
