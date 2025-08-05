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

            <!-- Socket状态监控器 -->
            <SocketStatusMonitor v-if="showSocketMonitor" />

            <!-- 页面刷新恢复提示 -->
            <n-alert 
              v-if="showRestorePrompt" 
              type="info" 
              closable
              @close="handleCloseRestorePrompt"
              class="restore-prompt"
            >
              <template #header>
                <n-icon><RestoreIcon /></n-icon>
                检测到页面刷新
              </template>
              <div class="restore-content">
                <p>发现之前的会话状态 ({{ restoreInfo?.ageText }})，是否恢复连接？</p>
                <div class="restore-actions">
                  <n-button size="small" type="primary" @click="handleRestore">
                    恢复连接
                  </n-button>
                  <n-button size="small" @click="handleSkipRestore">
                    跳过
                  </n-button>
                </div>
              </div>
            </n-alert>

            <router-view />
          </div>
        </n-notification-provider>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, h, nextTick } from 'vue'
import { darkTheme, type GlobalThemeOverrides, NAlert, NButton, NIcon, useMessage } from 'naive-ui'
import { useTheme } from '@/utils/theme'
import { useRoute } from 'vue-router'
import SocketStatusMonitor from '@/components/SocketStatusMonitor.vue'

const themeStore = useTheme()
const { currentTheme, isTerminal } = themeStore
const route = useRoute()

// 页面刷新恢复相关状态
const showSocketMonitor = ref(false)
const showRestorePrompt = ref(false)
const restoreInfo = ref<any>(null)

// message实例，在onMounted中初始化
let message: any = null
let pageRefreshHandler: any = null
let initPageRefreshHandler: any = null
let cleanupPageRefreshHandler: any = null

// 简单的恢复图标
const RestoreIcon = {
  render: () => {
    return h('svg', { viewBox: '0 0 16 16', fill: 'currentColor' }, [
      h('path', { d: 'M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z' }),
      h('path', { d: 'M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z' })
    ])
  }
}

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

onMounted(async () => {
  try {
    // 初始化message实例
    message = useMessage()
    
    // 初始化主题
    console.log('App mounted with theme:', currentTheme.value)
    
    // 等待下一个tick，确保所有组件和store都已初始化
    await nextTick()
    
    // 延迟初始化页面刷新处理器，避免在setup阶段出错
    setTimeout(async () => {
      try {
        // 动态导入pageRefreshHandler，避免在setup阶段导入
        const { pageRefreshHandler: handler, initPageRefreshHandler: init, cleanupPageRefreshHandler: cleanup } = await import('@/utils/pageRefreshHandler')
        pageRefreshHandler = handler
        initPageRefreshHandler = init
        cleanupPageRefreshHandler = cleanup
        
        initPageRefreshHandler()
        
        // 检查是否在聊天页面
        const isChatPage = route.path === '/' || route.path.startsWith('/chat')
        
        if (isChatPage) {
          // 显示Socket状态监控器
          showSocketMonitor.value = true
          
          // 检查是否有可恢复的状态
          try {
            if (pageRefreshHandler.hasRestorableState()) {
              restoreInfo.value = pageRefreshHandler.getSavedStateInfo()
              
              if (restoreInfo.value && !restoreInfo.value.isExpired) {
                console.log('📦 发现可恢复的页面状态:', restoreInfo.value)
                showRestorePrompt.value = true
              } else {
                console.log('⏰ 页面状态已过期，清理旧状态')
                pageRefreshHandler.clearPageState()
              }
            }
          } catch (error) {
            console.warn('⚠️ 检查页面状态时出错:', error)
          }
        }
      } catch (error) {
        console.warn('⚠️ 页面刷新处理器初始化失败:', error)
      }
    }, 500) // 延迟500ms，确保所有store都已初始化
    
  } catch (error) {
    console.error('❌ App初始化时出错:', error)
  }
})

onUnmounted(() => {
  // 清理页面刷新处理器
  if (cleanupPageRefreshHandler) {
    cleanupPageRefreshHandler()
  }
})

// 处理恢复连接
const handleRestore = async () => {
  showRestorePrompt.value = false
  
  if (!pageRefreshHandler) {
    console.warn('⚠️ pageRefreshHandler未初始化')
    return
  }
  
  try {
    if (message) {
      message.loading('正在恢复连接...', { duration: 0, key: 'restore' })
    }
    
    const success = await pageRefreshHandler.restorePageState()
    
    if (success) {
      if (message) {
        message.success('连接已恢复', { key: 'restore' })
      }
    } else {
      if (message) {
        message.warning('恢复失败，请手动重新连接', { key: 'restore' })
      }
    }
  } catch (error) {
    console.error('恢复连接失败:', error)
    if (message) {
      message.error('恢复连接时出现错误', { key: 'restore' })
    }
  }
}

// 跳过恢复
const handleSkipRestore = () => {
  showRestorePrompt.value = false
  if (pageRefreshHandler) {
    pageRefreshHandler.clearPageState()
  }
  if (message) {
    message.info('已跳过状态恢复')
  }
}

// 关闭恢复提示
const handleCloseRestorePrompt = () => {
  showRestorePrompt.value = false
  if (pageRefreshHandler) {
    pageRefreshHandler.clearPageState()
  }
}
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

/* 页面刷新恢复提示样式 */
.restore-prompt {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
}

.restore-content {
  margin-top: 8px;
}

.restore-content p {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: var(--n-text-color-2);
}

.restore-actions {
  display: flex;
  gap: 8px;
}

.restore-actions .n-button {
  flex: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .restore-prompt {
    left: 10px;
    right: 10px;
    transform: none;
    max-width: none;
  }
  
  .restore-actions {
    flex-direction: column;
  }
  
  .restore-actions .n-button {
    flex: none;
  }
}
</style>
