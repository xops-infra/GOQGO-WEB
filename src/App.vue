<template>
  <n-config-provider :theme="naiveTheme" :theme-overrides="themeOverrides">
    <n-message-provider :container-style="messageContainerStyle">
      <n-dialog-provider>
        <n-notification-provider :container-style="notificationContainerStyle">
          <div class="app theme-transition" :class="{ 'terminal-mode': isTerminal }">
            <!-- Terminal主题背景特效 -->
            <TerminalEffects v-if="isTerminal" />

            <!-- Socket状态监控器 -->
            <SocketStatusMonitor v-if="showSocketMonitor" />

            <router-view />
          </div>
        </n-notification-provider>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, nextTick } from 'vue'
import { darkTheme, type GlobalThemeOverrides, useMessage } from 'naive-ui'
import { useTheme } from '@/utils/theme'
import { useRoute } from 'vue-router'
import SocketStatusMonitor from '@/components/SocketStatusMonitor.vue'
import TerminalEffects from '@/components/TerminalEffects.vue'

const themeStore = useTheme()
const { currentTheme, isTerminal } = themeStore
const route = useRoute()

// Socket状态监控
const showSocketMonitor = ref(false)

// message实例，在onMounted中初始化
let message: any = null

// 通知容器样式 - 左下角
const messageContainerStyle = computed(() => ({
  position: 'fixed',
  left: '20px',
  bottom: '100px', // 增加距离，避免与页脚重叠
  zIndex: 1000,
  maxWidth: '400px'
}))

const notificationContainerStyle = computed(() => ({
  position: 'fixed',
  left: '20px',
  bottom: '100px', // 增加距离，避免与页脚重叠
  zIndex: 1000,
  maxWidth: '400px'
}))



// Naive UI 主题配置 - 只使用terminal主题
const naiveTheme = computed(() => {
  return darkTheme // Terminal主题基于dark主题
})

// Naive UI 主题覆盖 - 只使用terminal主题
const themeOverrides = computed<GlobalThemeOverrides>(() => {
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

      textColorBase: '#ffffff',
      textColor1: '#ffffff',
      textColor2: '#cccccc',
      textColor3: '#999999',
      textColorDisabled: '#666666',

      bodyColor: '#000000',
      cardColor: '#0a0a0a',
      modalColor: '#0a0a0a',
      popoverColor: '#1a1a1a',

      borderColor: '#333333',
      dividerColor: '#2a2a2a',

      hoverColor: '#2a2a2a',
      pressedColor: '#1a1a1a',

      boxShadow1: '0 4px 12px rgba(0, 0, 0, 0.8)',
      boxShadow2: '0 8px 24px rgba(0, 0, 0, 0.9)',
      boxShadow3: '0 12px 32px rgba(0, 0, 0, 0.95)',

      fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
      fontFamilyMono: 'JetBrains Mono, Consolas, Monaco, monospace'
    }
  }
})

onMounted(async () => {
  try {
    // 初始化主题

    // 等待下一个tick，确保所有组件和store都已初始化
    await nextTick()

    // 延迟初始化message，确保n-message-provider已经渲染
    setTimeout(() => {
      try {
        message = useMessage()
      } catch (error) {
        console.warn('⚠️ Message provider初始化失败:', error)
      }
    }, 100)

    // 检查是否在聊天页面
    const isChatPage = route.path === '/'

    if (isChatPage) {
      // 显示Socket状态监控器
      showSocketMonitor.value = true
    }

  } catch (error) {
    console.error('❌ App初始化时出错:', error)
  }
})


</script>

<style lang="scss">
@use '@/styles/index.scss';

#app {
  height: 100vh;
  width: 100vw;
  overflow: hidden; /* 保持这个，防止页面滚动 */
}

.app {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary, #ffffff);
  color: var(--text-primary, #1f2937);
  position: relative;

  &.terminal-mode {
    font-family: var(--font-mono, 'Courier New', monospace);
  }
}

// Terminal主题特效


// 全局组件样式覆盖
.n-card {
  background-color: var(--bg-primary, #ffffff) !important;
  border-color: var(--border-primary, #e5e7eb) !important;

  .n-card__content {
    color: var(--text-primary, #1f2937) !important;
  }

  // Terminal主题下的卡片样式
  [data-theme='terminal'] & {
    border: 1px solid var(--terminal-border, #21262d) !important;
    box-shadow: var(--terminal-shadow, 0 4px 12px rgba(0, 0, 0, 0.8)) !important;

    &:hover {
      border-color: var(--pixel-green, #00ff41) !important;
      box-shadow: 0 0 10px rgba(0, 255, 65, 0.3) !important;
    }
  }
}

.n-button {
  transition: all 0.3s ease !important;

  // Terminal主题下的按钮样式
  [data-theme='terminal'] & {
    font-family: var(--font-display, 'Orbitron', monospace) !important;
    font-weight: 600 !important;
    text-transform: uppercase !important;
    letter-spacing: 1px !important;

    &.n-button--primary-type {
      background: var(--terminal-bg-secondary, #161b22) !important;
      color: var(--pixel-green, #00ff41) !important;
      border: 2px solid var(--pixel-green, #00ff41) !important;

      &:hover {
        background: var(--pixel-green, #00ff41) !important;
        color: var(--terminal-bg, #0d1117) !important;
        box-shadow: var(--neon-glow-green, 0 0 5px #00ff41, 0 0 10px #00ff41, 0 0 15px #00ff41) !important;
        transform: translateY(-2px) !important;
      }

      &:active {
        transform: translateY(0) !important;
      }
    }

    &.n-button--error-type {
      color: var(--pixel-red, #ff0066) !important;
      border-color: var(--pixel-red, #ff0066) !important;

      &:hover {
        background: var(--pixel-red, #ff0066) !important;
        box-shadow: var(--neon-glow-red, 0 0 5px #ff0066, 0 0 10px #ff0066, 0 0 15px #ff0066) !important;
      }
    }

    &.n-button--info-type {
      color: var(--pixel-cyan, #00ffff) !important;
      border-color: var(--pixel-cyan, #00ffff) !important;

      &:hover {
        background: var(--pixel-cyan, #00ffff) !important;
        box-shadow: var(--neon-glow-cyan, 0 0 5px #00ffff, 0 0 10px #00ffff, 0 0 15px #00ffff) !important;
      }
    }
  }
}

// 强制覆盖所有输入框样式
.n-input,
.n-input .n-input-wrapper,
.n-input .n-input__input,
.n-input .n-input__textarea {
  background-color: var(--bg-secondary, #f8f9fa) !important;
  color: var(--text-primary, #1f2937) !important;

  [data-theme='terminal'] & {
    font-family: var(--font-mono, 'Courier New', monospace) !important;
    background-color: var(--terminal-bg-secondary, #161b22) !important;
    border: 1px solid var(--terminal-border, #21262d) !important;

    &:focus-within {
      border-color: var(--pixel-green, #00ff41) !important;
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
