<template>
  <div class="terminal-effects" v-if="isTerminal">
    <!-- 保持简洁的背景，移除所有动画效果 -->
  </div>
</template>

<script setup lang="ts">
import { useTheme } from '@/utils/theme'

const { isTerminal } = useTheme()

// 移除所有动画效果相关的代码
</script>

<style scoped lang="scss">
.terminal-effects {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1000;
  overflow: hidden;
  
  // 保持简洁的背景，不添加任何动画效果
  // 只保留基础的终端背景色
  background: transparent;
}

// 移除所有动画相关的样式
// 保持代码简洁
</style>
