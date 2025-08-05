<template>
  <div class="base-layout" :class="layoutClasses">
    <!-- 全局加载遮罩 -->
    <div v-if="globalLoading" class="global-loading">
      <n-spin size="large" />
      <p>{{ loadingText }}</p>
    </div>

    <!-- 主要内容区域 -->
    <div class="layout-container">
      <!-- 头部区域 -->
      <header v-if="showHeader" class="layout-header">
        <slot name="header">
          <AppHeader />
        </slot>
      </header>

      <!-- 主体区域 -->
      <main class="layout-main" :class="mainClasses">
        <!-- 侧边栏 -->
        <aside v-if="showSidebar" class="layout-sidebar" :class="sidebarClasses">
          <slot name="sidebar">
            <AppSidebar />
          </slot>
        </aside>

        <!-- 内容区域 -->
        <section class="layout-content" :class="contentClasses">
          <slot />
        </section>

        <!-- 右侧面板 -->
        <aside v-if="showRightPanel" class="layout-right-panel" :class="rightPanelClasses">
          <slot name="right-panel" />
        </aside>
      </main>

      <!-- 底部区域 -->
      <footer v-if="showFooter" class="layout-footer">
        <slot name="footer">
          <AppFooter />
        </slot>
      </footer>
    </div>

    <!-- 全局通知 -->
    <n-notification-provider>
      <n-message-provider>
        <n-dialog-provider>
          <slot name="providers" />
        </n-dialog-provider>
      </n-message-provider>
    </n-notification-provider>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NSpin, NNotificationProvider, NMessageProvider, NDialogProvider } from 'naive-ui'
import { useTheme } from '@/utils/theme'
import { useLayout } from '@/composables/useLayout'
import AppHeader from './components/AppHeader.vue'
import AppSidebar from './components/AppSidebar.vue'
import AppFooter from './components/AppFooter.vue'

interface Props {
  // 布局配置
  showHeader?: boolean
  showSidebar?: boolean
  showFooter?: boolean
  showRightPanel?: boolean
  
  // 样式配置
  sidebarWidth?: string
  rightPanelWidth?: string
  headerHeight?: string
  footerHeight?: string
  
  // 响应式配置
  collapsible?: boolean
  breakpoint?: 'sm' | 'md' | 'lg' | 'xl'
  
  // 加载状态
  globalLoading?: boolean
  loadingText?: string
  
  // 布局模式
  mode?: 'default' | 'fullscreen' | 'minimal'
  
  // 主题
  theme?: 'light' | 'dark' | 'terminal'
}

const props = withDefaults(defineProps<Props>(), {
  showHeader: true,
  showSidebar: true,
  showFooter: false,
  showRightPanel: false,
  sidebarWidth: '280px',
  rightPanelWidth: '320px',
  headerHeight: '64px',
  footerHeight: '48px',
  collapsible: true,
  breakpoint: 'md',
  globalLoading: false,
  loadingText: '加载中...',
  mode: 'default',
  theme: 'light'
})

// 主题和布局状态
const { isTerminal } = useTheme()
const { 
  isMobile, 
  isTablet, 
  sidebarCollapsed, 
  rightPanelCollapsed 
} = useLayout()

// 计算样式类
const layoutClasses = computed(() => ({
  'layout-terminal': isTerminal.value,
  'layout-mobile': isMobile.value,
  'layout-tablet': isTablet.value,
  'layout-fullscreen': props.mode === 'fullscreen',
  'layout-minimal': props.mode === 'minimal',
  'sidebar-collapsed': sidebarCollapsed.value,
  'right-panel-collapsed': rightPanelCollapsed.value
}))

const mainClasses = computed(() => ({
  'has-sidebar': props.showSidebar,
  'has-right-panel': props.showRightPanel,
  'sidebar-collapsed': sidebarCollapsed.value && props.collapsible
}))

const sidebarClasses = computed(() => ({
  'sidebar-collapsed': sidebarCollapsed.value && props.collapsible,
  'sidebar-mobile': isMobile.value
}))

const contentClasses = computed(() => ({
  'content-centered': !props.showSidebar && !props.showRightPanel,
  'content-with-sidebar': props.showSidebar,
  'content-with-right-panel': props.showRightPanel
}))

const rightPanelClasses = computed(() => ({
  'right-panel-collapsed': rightPanelCollapsed.value && props.collapsible,
  'right-panel-mobile': isMobile.value
}))

// CSS变量
const cssVars = computed(() => ({
  '--sidebar-width': props.sidebarWidth,
  '--right-panel-width': props.rightPanelWidth,
  '--header-height': props.headerHeight,
  '--footer-height': props.footerHeight
}))
</script>

<style scoped lang="scss">
.base-layout {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  color: var(--text-primary);
  position: relative;
  overflow: hidden;
}

.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(var(--bg-primary-rgb), 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  
  p {
    margin-top: 16px;
    color: var(--text-secondary);
    font-size: 14px;
  }
}

.layout-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.layout-header {
  flex-shrink: 0;
  height: var(--header-height);
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-primary);
  z-index: 100;
}

.layout-main {
  flex: 1;
  display: flex;
  overflow: hidden;
  
  &.has-sidebar {
    .layout-content {
      margin-left: var(--sidebar-width);
    }
  }
  
  &.has-right-panel {
    .layout-content {
      margin-right: var(--right-panel-width);
    }
  }
  
  &.sidebar-collapsed {
    .layout-content {
      margin-left: 64px;
    }
  }
}

.layout-sidebar {
  position: fixed;
  left: 0;
  top: var(--header-height);
  bottom: 0;
  width: var(--sidebar-width);
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-primary);
  z-index: 90;
  transition: all 0.3s ease;
  
  &.sidebar-collapsed {
    width: 64px;
  }
  
  &.sidebar-mobile {
    transform: translateX(-100%);
    
    &:not(.sidebar-collapsed) {
      transform: translateX(0);
    }
  }
}

.layout-content {
  flex: 1;
  background: var(--bg-primary);
  overflow: auto;
  transition: all 0.3s ease;
  
  &.content-centered {
    margin: 0 auto;
    max-width: 1200px;
    padding: 0 24px;
  }
}

.layout-right-panel {
  position: fixed;
  right: 0;
  top: var(--header-height);
  bottom: 0;
  width: var(--right-panel-width);
  background: var(--bg-secondary);
  border-left: 1px solid var(--border-primary);
  z-index: 90;
  transition: all 0.3s ease;
  
  &.right-panel-collapsed {
    transform: translateX(100%);
  }
  
  &.right-panel-mobile {
    transform: translateX(100%);
    
    &:not(.right-panel-collapsed) {
      transform: translateX(0);
    }
  }
}

.layout-footer {
  flex-shrink: 0;
  height: var(--footer-height);
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

// Terminal主题样式
.layout-terminal {
  background: var(--terminal-bg);
  color: var(--terminal-text);
  
  .layout-header {
    background: var(--terminal-bg-secondary);
    border-bottom-color: var(--terminal-border);
  }
  
  .layout-sidebar {
    background: var(--terminal-bg-tertiary);
    border-right-color: var(--terminal-border);
  }
  
  .layout-content {
    background: var(--terminal-bg);
  }
  
  .layout-right-panel {
    background: var(--terminal-bg-tertiary);
    border-left-color: var(--terminal-border);
  }
  
  .layout-footer {
    background: var(--terminal-bg-secondary);
    border-top-color: var(--terminal-border);
  }
}

// 全屏模式
.layout-fullscreen {
  .layout-header,
  .layout-footer,
  .layout-sidebar,
  .layout-right-panel {
    display: none;
  }
  
  .layout-content {
    margin: 0;
  }
}

// 最小模式
.layout-minimal {
  .layout-sidebar,
  .layout-right-panel {
    display: none;
  }
  
  .layout-content {
    margin: 0;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .layout-main {
    &.has-sidebar {
      .layout-content {
        margin-left: 0;
      }
    }
    
    &.has-right-panel {
      .layout-content {
        margin-right: 0;
      }
    }
  }
  
  .layout-sidebar,
  .layout-right-panel {
    width: 100%;
    max-width: 320px;
  }
}

@media (max-width: 480px) {
  .layout-content {
    &.content-centered {
      padding: 0 16px;
    }
  }
}

// 动画效果
.layout-sidebar,
.layout-right-panel,
.layout-content {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

// 滚动条样式
.layout-content {
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--bg-tertiary);
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border-secondary);
    border-radius: 3px;
    
    &:hover {
      background: var(--border-primary);
    }
  }
}
</style>
