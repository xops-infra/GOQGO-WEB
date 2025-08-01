<template>
  <n-config-provider :theme="naiveTheme" :theme-overrides="themeOverrides">
    <n-message-provider>
      <n-dialog-provider>
        <n-notification-provider>
          <div class="app theme-transition" :class="{ 'terminal-mode': isTerminal }">
            <!-- Terminal主题背景特效 -->
            <div v-if="isTerminal" class="terminal-effects">
              <div class="scanlines"></div>
              <div class="crt-overlay"></div>
            </div>

            <router-view />
          </div>
        </n-notification-provider>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { darkTheme, type GlobalThemeOverrides } from 'naive-ui'
import { useTheme } from '@/utils/theme'

const { currentTheme, isTerminal } = useTheme()

// Naive UI 主题配置
const naiveTheme = computed(() => {
  if (currentTheme.value === 'terminal') {
    return darkTheme // Terminal主题基于dark主题
  }
  return currentTheme.value === 'dark' ? darkTheme : null
})

// Naive UI 主题覆盖
const themeOverrides = computed<GlobalThemeOverrides>(() => {
  const theme = currentTheme.value

  // Terminal主题特殊配置
  if (theme === 'terminal') {
    return {
      common: {
        primaryColor: '#00ff41',
        primaryColorHover: '#00ffff',
        primaryColorPressed: '#0066ff',
        primaryColorSuppl: '#00ff41',

        successColor: '#7ee787',
        warningColor: '#ffa657',
        errorColor: '#ff7b72',
        infoColor: '#39c5cf',

        textColorBase: '#f0f6fc',
        textColor1: '#f0f6fc',
        textColor2: '#c9d1d9',
        textColor3: '#8b949e',
        textColorDisabled: '#6e7681',

        bodyColor: '#0d1117',
        cardColor: '#161b22',
        modalColor: '#161b22',
        popoverColor: '#21262d',

        borderColor: '#21262d',
        dividerColor: '#30363d',

        hoverColor: '#30363d',
        pressedColor: '#1e40af',

        boxShadow1: '0 4px 12px rgba(0, 0, 0, 0.8)',
        boxShadow2: '0 8px 24px rgba(0, 0, 0, 0.9)',
        boxShadow3: '0 12px 32px rgba(0, 0, 0, 0.95)',

        fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
        fontFamilyMono: 'JetBrains Mono, Consolas, Monaco, monospace'
      }
    }
  }

  // 普通深色主题
  const isDark = theme === 'dark'

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
      textColor2: isDark ? '#e2e8f0' : '#4b5563',
      textColor3: isDark ? '#cbd5e1' : '#6b7280',
      textColorDisabled: isDark ? '#94a3b8' : '#9ca3af',

      bodyColor: isDark ? '#0f172a' : '#ffffff',
      cardColor: isDark ? '#1e293b' : '#ffffff',
      modalColor: isDark ? '#1e293b' : '#ffffff',
      popoverColor: isDark ? '#334155' : '#ffffff',

      borderColor: isDark ? '#475569' : '#e5e7eb',
      dividerColor: isDark ? '#475569' : '#f3f4f6',

      hoverColor: isDark ? '#475569' : '#f5f5f5',
      pressedColor: isDark ? '#1e40af' : '#e8f0fe',

      boxShadow1: isDark ? '0 1px 2px 0 rgba(0, 0, 0, 0.3)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      boxShadow2: isDark
        ? '0 4px 6px -1px rgba(0, 0, 0, 0.4)'
        : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      boxShadow3: isDark
        ? '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
        : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
    }
  }
})

onMounted(() => {
  // 初始化主题
  console.log('App mounted with theme:', currentTheme.value)
})
</script>

<style lang="scss">
@use '@/styles/index.scss';

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
  position: relative;

  &.terminal-mode {
    font-family: var(--font-mono);
  }
}

// Terminal主题特效
.terminal-effects {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1000;

  .scanlines {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(transparent 50%, rgba(0, 255, 65, 0.02) 50%);
    background-size: 100% 4px;
    animation: scanlines 0.1s linear infinite;
  }

  .crt-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(
      ellipse at center,
      transparent 0%,
      transparent 70%,
      rgba(0, 0, 0, 0.2) 100%
    );
  }
}

@keyframes scanlines {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(4px);
  }
}

// 全局组件样式覆盖
.n-card {
  background-color: var(--bg-primary) !important;
  border-color: var(--border-primary) !important;

  .n-card__content {
    color: var(--text-primary) !important;
  }

  // Terminal主题下的卡片样式
  [data-theme='terminal'] & {
    border: 1px solid var(--terminal-border) !important;
    box-shadow: var(--terminal-shadow) !important;

    &:hover {
      border-color: var(--pixel-green) !important;
      box-shadow: 0 0 10px rgba(0, 255, 65, 0.3) !important;
    }
  }
}

.n-button {
  transition: all 0.3s ease !important;

  // Terminal主题下的按钮样式
  [data-theme='terminal'] & {
    font-family: var(--font-display) !important;
    font-weight: 600 !important;
    text-transform: uppercase !important;
    letter-spacing: 1px !important;

    &.n-button--primary-type {
      background: var(--terminal-bg-secondary) !important;
      color: var(--pixel-green) !important;
      border: 2px solid var(--pixel-green) !important;

      &:hover {
        background: var(--pixel-green) !important;
        color: var(--terminal-bg) !important;
        box-shadow: var(--neon-glow-green) !important;
        transform: translateY(-2px) !important;
      }

      &:active {
        transform: translateY(0) !important;
      }
    }

    &.n-button--error-type {
      color: var(--pixel-red) !important;
      border-color: var(--pixel-red) !important;

      &:hover {
        background: var(--pixel-red) !important;
        box-shadow: var(--neon-glow-red) !important;
      }
    }

    &.n-button--info-type {
      color: var(--pixel-cyan) !important;
      border-color: var(--pixel-cyan) !important;

      &:hover {
        background: var(--pixel-cyan) !important;
        box-shadow: var(--neon-glow-cyan) !important;
      }
    }
  }
}

// 强制覆盖所有输入框样式
.n-input,
.n-input .n-input-wrapper,
.n-input .n-input__input,
.n-input .n-input__textarea {
  background-color: var(--bg-secondary) !important;
  color: var(--text-primary) !important;

  [data-theme='terminal'] & {
    font-family: var(--font-mono) !important;
    background-color: var(--terminal-bg-secondary) !important;
    border: 1px solid var(--terminal-border) !important;

    &:focus-within {
      border-color: var(--pixel-green) !important;
      box-shadow: 0 0 10px rgba(0, 255, 65, 0.3) !important;
    }
  }
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

    [data-theme='terminal'] & {
      background-color: var(--terminal-bg-secondary) !important;
      color: var(--terminal-text) !important;

      &::placeholder {
        color: var(--terminal-text-tertiary) !important;
      }
    }
  }

  .n-input__border,
  .n-input__state-border {
    border-color: var(--border-primary) !important;

    [data-theme='terminal'] & {
      border-color: var(--terminal-border) !important;
    }
  }

  &:hover .n-input__state-border {
    border-color: var(--border-focus) !important;

    [data-theme='terminal'] & {
      border-color: var(--pixel-green) !important;
    }
  }

  &.n-input--focus .n-input__state-border {
    border-color: var(--color-primary) !important;

    [data-theme='terminal'] & {
      border-color: var(--pixel-green) !important;
      box-shadow: 0 0 10px rgba(0, 255, 65, 0.3) !important;
    }
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

    [data-theme='terminal'] & {
      font-family: var(--font-mono) !important;

      &:hover {
        background-color: var(--terminal-surface) !important;
        color: var(--pixel-green) !important;
      }

      &.n-menu-item--selected {
        background-color: var(--terminal-surface) !important;
        color: var(--pixel-green) !important;
        border-left: 3px solid var(--pixel-green) !important;
      }
    }
  }
}

.n-layout-sider {
  background-color: var(--bg-secondary) !important;
  border-color: var(--border-primary) !important;

  [data-theme='terminal'] & {
    background-color: var(--terminal-bg-secondary) !important;
    border-color: var(--terminal-border) !important;
  }
}

.n-layout-header {
  background-color: var(--bg-primary) !important;
  border-color: var(--border-primary) !important;

  [data-theme='terminal'] & {
    background-color: var(--terminal-bg) !important;
    border-color: var(--terminal-border) !important;
  }
}

.n-layout-content {
  background-color: var(--bg-primary) !important;

  [data-theme='terminal'] & {
    background-color: var(--terminal-bg) !important;
  }
}

.n-modal {
  .n-card {
    background-color: var(--bg-modal) !important;
    backdrop-filter: blur(10px);

    [data-theme='terminal'] & {
      background-color: var(--terminal-bg-secondary) !important;
      border: 2px solid var(--pixel-green) !important;
      box-shadow: var(--neon-glow-green) !important;
    }
  }
}

.n-drawer {
  .n-drawer-body-content-wrapper {
    background-color: var(--bg-secondary) !important;

    [data-theme='terminal'] & {
      background-color: var(--terminal-bg-secondary) !important;
    }
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

    [data-theme='terminal'] & {
      font-family: var(--font-mono) !important;

      &:hover {
        background-color: var(--terminal-surface) !important;
        color: var(--pixel-green) !important;
      }
    }
  }

  [data-theme='terminal'] & {
    background-color: var(--terminal-bg-secondary) !important;
    border: 1px solid var(--terminal-border) !important;
    box-shadow: var(--terminal-shadow-lg) !important;
  }
}

// Terminal主题下的滚动条
[data-theme='terminal'] {
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: var(--terminal-bg-secondary);
  }

  ::-webkit-scrollbar-thumb {
    background: var(--pixel-green);
    border-radius: 4px;

    &:hover {
      background: var(--pixel-cyan);
    }
  }

  ::selection {
    background-color: var(--pixel-green);
    color: var(--terminal-bg);
  }
}
</style>
