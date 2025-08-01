<template>
  <div class="theme-toggle">
    <n-dropdown
      :options="themeOptions"
      @select="handleThemeSelect"
      trigger="click"
      placement="bottom-end"
    >
      <n-button
        :class="['theme-btn', { 'btn-8bit': isTerminal }]"
        :type="isTerminal ? undefined : 'primary'"
        ghost
        circle
        size="medium"
      >
        <template #icon>
          <span class="theme-icon" :class="{ 'neon-text neon-green': isTerminal }">
            {{ currentThemeConfig.icon }}
          </span>
        </template>
      </n-button>
    </n-dropdown>

    <!-- Terminal主题特效 -->
    <div v-if="isTerminal" class="matrix-bg" ref="matrixContainer"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { NButton, NDropdown } from 'naive-ui'
import { useTheme, createTerminalEffect, type ThemeType } from '@/utils/theme'

const { isTerminal, setTheme, getThemeConfig, getAvailableThemes } = useTheme()

const matrixContainer = ref<HTMLElement>()
let matrixEffect: ReturnType<typeof createTerminalEffect>['createMatrixRain'] | null = null

// 当前主题配置
const currentThemeConfig = computed(() => getThemeConfig())

// 主题选项
const themeOptions = computed(() => {
  return getAvailableThemes().map((theme) => ({
    label: `${theme.icon} ${theme.name}`,
    key: theme.name.toLowerCase() as ThemeType,
    props: {
      style: isTerminal.value ? 'font-family: var(--font-display); color: var(--pixel-green);' : ''
    }
  }))
})

// 处理主题选择
const handleThemeSelect = (key: ThemeType) => {
  setTheme(key)

  // 如果切换到terminal主题，启动特效
  if (key === 'terminal') {
    setTimeout(() => {
      initMatrixEffect()
    }, 100)
  } else {
    destroyMatrixEffect()
  }
}

// 初始化矩阵雨特效
const initMatrixEffect = () => {
  if (!isTerminal.value || matrixEffect) return

  const effects = createTerminalEffect()
  matrixEffect = effects.createMatrixRain()

  if (matrixEffect && matrixContainer.value) {
    matrixContainer.value.appendChild(matrixEffect.canvas)
  }
}

// 销毁矩阵雨特效
const destroyMatrixEffect = () => {
  if (matrixEffect) {
    matrixEffect.destroy()
    matrixEffect = null
  }
}

onMounted(() => {
  if (isTerminal.value) {
    initMatrixEffect()
  }
})

onUnmounted(() => {
  destroyMatrixEffect()
})
</script>

<style scoped lang="scss">
.theme-toggle {
  position: relative;

  .theme-btn {
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.1);
    }
  }

  .theme-icon {
    font-size: 18px;
    transition: all 0.3s ease;

    &.neon-text {
      animation: pulse-glow 2s ease-in-out infinite alternate;
    }
  }

  .matrix-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: -1;
  }
}

@keyframes pulse-glow {
  from {
    text-shadow:
      0 0 5px currentColor,
      0 0 10px currentColor,
      0 0 15px currentColor;
  }
  to {
    text-shadow:
      0 0 10px currentColor,
      0 0 20px currentColor,
      0 0 30px currentColor;
  }
}

// Terminal主题下的特殊样式
[data-theme='terminal'] {
  .theme-toggle {
    .theme-btn {
      border-color: var(--pixel-green);
      color: var(--pixel-green);

      &:hover {
        background: var(--pixel-green);
        color: var(--terminal-bg);
        box-shadow: var(--neon-glow-green);
      }
    }
  }
}
</style>
