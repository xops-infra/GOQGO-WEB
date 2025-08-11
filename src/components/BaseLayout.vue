<template>
  <div class="base-layout" :class="{ 'terminal-mode': isTerminal }">
    <!-- 页头 -->
    <header class="layout-header">
      <AppHeader />
    </header>
    
    <!-- 主内容区域 -->
    <main class="layout-main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from '@/utils/theme'
import AppHeader from './AppHeader.vue'

const { isTerminal } = useTheme()
</script>

<style scoped lang="scss">
.base-layout {
  height: 100vh; /* 使用固定高度而不是min-height */
  display: flex;
  flex-direction: column;
  background: var(--bg-color, #ffffff);
  transition: all 0.3s ease;
  overflow: hidden; /* 防止整体滚动 */

  &.terminal-mode {
    background: var(--terminal-bg, #000000);
  }
}

.layout-header {
  flex-shrink: 0;
  z-index: 1000;
  /* 让header占用实际空间，而不是固定定位 */
  height: 90px; /* 与AppHeader的实际高度一致 */
  overflow: visible; /* 允许内容显示 */
}

.layout-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; /* 关键：允许flex子元素收缩 */
  overflow: hidden;
}

// Terminal模式下的特殊样式
.terminal-mode {
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      linear-gradient(90deg, transparent 98%, rgba(0, 255, 65, 0.1) 100%),
      linear-gradient(0deg, transparent 98%, rgba(0, 255, 65, 0.1) 100%);
    background-size: 20px 20px;
    pointer-events: none;
    z-index: -1;
  }
}
</style>
