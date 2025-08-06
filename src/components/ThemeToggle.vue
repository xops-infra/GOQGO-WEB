<template>
  <div class="theme-toggle">
    <!-- Terminal主题指示器 -->
    <n-tooltip>
      <template #trigger>
        <div class="terminal-theme-indicator">
          <span class="theme-icon neon-text neon-green">🖥️</span>
          <span class="theme-name">Terminal</span>
        </div>
      </template>
      <span>当前主题: Terminal</span>
    </n-tooltip>

    <!-- Terminal主题特效 -->
    <div class="matrix-bg" ref="matrixContainer"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { NTooltip } from 'naive-ui'

const matrixContainer = ref<HTMLElement>()

// Terminal矩阵特效
const createMatrixEffect = () => {
  if (!matrixContainer.value) return

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = 100
  canvas.height = 100
  canvas.style.position = 'absolute'
  canvas.style.top = '0'
  canvas.style.left = '0'
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  canvas.style.opacity = '0.1'
  canvas.style.pointerEvents = 'none'

  matrixContainer.value.appendChild(canvas)

  const chars = '01'
  const fontSize = 8
  const columns = canvas.width / fontSize
  const drops: number[] = []

  for (let i = 0; i < columns; i++) {
    drops[i] = 1
  }

  const draw = () => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = '#00ff00'
    ctx.font = `${fontSize}px monospace`

    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)]
      ctx.fillText(text, i * fontSize, drops[i] * fontSize)

      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0
      }
      drops[i]++
    }
  }

  const interval = setInterval(draw, 100)
  return () => {
    clearInterval(interval)
    if (canvas.parentNode) {
      canvas.parentNode.removeChild(canvas)
    }
  }
}

let cleanupMatrix: (() => void) | undefined

onMounted(() => {
  // 延迟创建特效，确保DOM已渲染
  setTimeout(() => {
    cleanupMatrix = createMatrixEffect()
  }, 100)
})

onUnmounted(() => {
  if (cleanupMatrix) {
    cleanupMatrix()
  }
})
</script>

<style scoped lang="scss">
.theme-toggle {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}

.terminal-theme-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 255, 0, 0.3);
  border-radius: 6px;
  cursor: default;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(0, 255, 0, 0.6);
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.2);
  }

  .theme-icon {
    font-size: 16px;
    filter: drop-shadow(0 0 6px rgba(0, 255, 0, 0.8));
  }

  .theme-name {
    font-size: 12px;
    font-weight: bold;
    color: #00ff00;
    font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
    text-shadow: 0 0 6px rgba(0, 255, 0, 0.8);
    text-transform: uppercase;
    letter-spacing: 1px;
  }
}

.matrix-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
  border-radius: 6px;
  overflow: hidden;
}

// Terminal主题发光效果
.neon-text {
  &.neon-green {
    color: #00ff00;
    text-shadow: 
      0 0 5px rgba(0, 255, 0, 0.8),
      0 0 10px rgba(0, 255, 0, 0.6),
      0 0 15px rgba(0, 255, 0, 0.4);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .terminal-theme-indicator {
    padding: 4px 8px;
    
    .theme-name {
      font-size: 10px;
    }
    
    .theme-icon {
      font-size: 14px;
    }
  }
}

// 动画效果
@keyframes terminal-glow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(0, 255, 0, 0.2);
  }
  50% {
    box-shadow: 0 0 15px rgba(0, 255, 0, 0.4);
  }
}

.terminal-theme-indicator {
  animation: terminal-glow 3s ease-in-out infinite;
}
</style>
