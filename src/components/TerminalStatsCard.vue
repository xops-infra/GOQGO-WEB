<template>
  <div
    class="terminal-stats-card"
    :class="{ 'terminal-style': isTerminal, [`card-${type}`]: type }"
  >
    <div class="card-header">
      <div class="card-icon" :class="{ 'neon-glow': isTerminal }">
        <component :is="iconComponent" />
      </div>
      <div class="card-title">
        {{ title }}
      </div>
    </div>

    <div class="card-content">
      <div class="main-value" :class="{ 'neon-text': isTerminal, [`neon-${type}`]: isTerminal }">
        {{ displayValue }}
      </div>

      <div v-if="subtitle" class="card-subtitle">
        {{ subtitle }}
      </div>

      <div v-if="trend" class="trend-indicator" :class="trendClass">
        <n-icon size="14">
          <component :is="trendIcon" />
        </n-icon>
        <span>{{ trend }}</span>
      </div>
    </div>

    <!-- Terminal风格的进度条 -->
    <div v-if="isTerminal && progress !== undefined" class="terminal-progress">
      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{ width: `${progress}%` }"
          :class="`progress-${type}`"
        ></div>
      </div>
      <div class="progress-text">{{ progress }}%</div>
    </div>

    <!-- 8-bit装饰边框 -->
    <div v-if="isTerminal" class="pixel-border"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import {
  TrendingUpOutline,
  TrendingDownOutline,
  RemoveOutline,
  ServerOutline,
  PlayOutline,
  PauseOutline,
  AlertCircleOutline,
  CheckmarkCircleOutline
} from '@vicons/ionicons5'
import { useTheme } from '@/utils/theme'

interface Props {
  title: string
  value: number | string
  subtitle?: string
  type?: 'primary' | 'success' | 'warning' | 'error' | 'info'
  trend?: string
  trendDirection?: 'up' | 'down' | 'stable'
  icon?: string
  progress?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
  trendDirection: 'stable'
})

const { isTerminal } = useTheme()

// 图标映射
const iconMap = {
  total: ServerOutline,
  running: PlayOutline,
  idle: PauseOutline,
  error: AlertCircleOutline,
  success: CheckmarkCircleOutline,
  default: ServerOutline
}

const iconComponent = computed(() => {
  return iconMap[props.icon as keyof typeof iconMap] || iconMap.default
})

// 趋势图标
const trendIcon = computed(() => {
  switch (props.trendDirection) {
    case 'up':
      return TrendingUpOutline
    case 'down':
      return TrendingDownOutline
    default:
      return RemoveOutline
  }
})

// 趋势样式类
const trendClass = computed(() => {
  const baseClass = isTerminal.value ? 'terminal-trend' : 'trend'
  switch (props.trendDirection) {
    case 'up':
      return `${baseClass} trend-up`
    case 'down':
      return `${baseClass} trend-down`
    default:
      return `${baseClass} trend-stable`
  }
})

// 显示值格式化
const displayValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toLocaleString()
  }
  return props.value
})
</script>

<style scoped lang="scss">
.terminal-stats-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: var(--border-focus);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  &.terminal-style {
    background: var(--terminal-bg-secondary);
    border: 2px solid var(--terminal-border);
    border-radius: 0;
    font-family: var(--font-mono);

    &:hover {
      border-color: var(--pixel-green);
      box-shadow:
        0 0 10px rgba(0, 255, 65, 0.3),
        inset 0 0 10px rgba(0, 255, 65, 0.1);
      transform: translateY(-4px);
    }

    &.card-primary {
      border-color: var(--pixel-green);

      &:hover {
        box-shadow: var(--neon-glow-green);
      }
    }

    &.card-success {
      border-color: var(--terminal-success);

      &:hover {
        border-color: var(--terminal-success);
        box-shadow: 0 0 10px rgba(126, 231, 135, 0.3);
      }
    }

    &.card-warning {
      border-color: var(--terminal-warning);

      &:hover {
        border-color: var(--terminal-warning);
        box-shadow: 0 0 10px rgba(255, 166, 87, 0.3);
      }
    }

    &.card-error {
      border-color: var(--terminal-error);

      &:hover {
        border-color: var(--terminal-error);
        box-shadow: 0 0 10px rgba(255, 123, 114, 0.3);
      }
    }

    &.card-info {
      border-color: var(--terminal-info);

      &:hover {
        border-color: var(--terminal-info);
        box-shadow: 0 0 10px rgba(57, 197, 207, 0.3);
      }
    }
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;

  .card-icon {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-tertiary);
    border-radius: 6px;
    color: var(--text-secondary);
    transition: all 0.3s ease;

    .terminal-style & {
      background: var(--terminal-surface);
      border: 1px solid var(--terminal-border);
      border-radius: 0;
      color: var(--pixel-green);

      &.neon-glow {
        box-shadow: 0 0 8px rgba(0, 255, 65, 0.4);
      }
    }
  }

  .card-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;

    .terminal-style & {
      color: var(--terminal-text-secondary);
      font-family: var(--font-display);
      font-weight: 600;
      letter-spacing: 1px;
    }
  }
}

.card-content {
  .main-value {
    font-size: 32px;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1;
    margin-bottom: 8px;

    .terminal-style & {
      font-family: var(--font-display);
      color: var(--terminal-text);

      &.neon-text {
        &.neon-primary {
          color: var(--pixel-green);
          text-shadow: var(--neon-glow-green);
        }

        &.neon-success {
          color: var(--terminal-success);
          text-shadow: 0 0 10px currentColor;
        }

        &.neon-warning {
          color: var(--terminal-warning);
          text-shadow: 0 0 10px currentColor;
        }

        &.neon-error {
          color: var(--terminal-error);
          text-shadow: 0 0 10px currentColor;
        }

        &.neon-info {
          color: var(--terminal-info);
          text-shadow: 0 0 10px currentColor;
        }
      }
    }
  }

  .card-subtitle {
    font-size: 12px;
    color: var(--text-tertiary);
    margin-bottom: 8px;

    .terminal-style & {
      color: var(--terminal-text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }

  .trend-indicator {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 500;

    &.trend-up {
      color: var(--color-success);
    }

    &.trend-down {
      color: var(--color-error);
    }

    &.trend-stable {
      color: var(--text-tertiary);
    }

    &.terminal-trend {
      font-family: var(--font-mono);
      text-transform: uppercase;

      &.trend-up {
        color: var(--terminal-success);
        text-shadow: 0 0 5px currentColor;
      }

      &.trend-down {
        color: var(--terminal-error);
        text-shadow: 0 0 5px currentColor;
      }

      &.trend-stable {
        color: var(--terminal-text-tertiary);
      }
    }
  }
}

.terminal-progress {
  margin-top: 16px;

  .progress-bar {
    height: 4px;
    background: var(--terminal-surface);
    border: 1px solid var(--terminal-border);
    position: relative;
    overflow: hidden;

    .progress-fill {
      height: 100%;
      transition: width 0.3s ease;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
          90deg,
          transparent 0%,
          rgba(255, 255, 255, 0.3) 50%,
          transparent 100%
        );
        animation: progress-shine 2s ease-in-out infinite;
      }

      &.progress-primary {
        background: var(--pixel-green);
        box-shadow: 0 0 8px rgba(0, 255, 65, 0.5);
      }

      &.progress-success {
        background: var(--terminal-success);
        box-shadow: 0 0 8px rgba(126, 231, 135, 0.5);
      }

      &.progress-warning {
        background: var(--terminal-warning);
        box-shadow: 0 0 8px rgba(255, 166, 87, 0.5);
      }

      &.progress-error {
        background: var(--terminal-error);
        box-shadow: 0 0 8px rgba(255, 123, 114, 0.5);
      }

      &.progress-info {
        background: var(--terminal-info);
        box-shadow: 0 0 8px rgba(57, 197, 207, 0.5);
      }
    }
  }

  .progress-text {
    font-size: 10px;
    color: var(--terminal-text-tertiary);
    text-align: right;
    margin-top: 4px;
    font-family: var(--font-mono);
  }
}

.pixel-border {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(
    45deg,
    var(--pixel-green) 0%,
    var(--pixel-cyan) 25%,
    var(--pixel-blue) 50%,
    var(--pixel-purple) 75%,
    var(--pixel-green) 100%
  );
  background-size: 400% 400%;
  animation: pixel-border-flow 4s ease-in-out infinite;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;

  .terminal-stats-card:hover & {
    opacity: 0.3;
  }
}

// 动画效果
@keyframes progress-shine {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes pixel-border-flow {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .terminal-stats-card {
    padding: 16px;

    .card-header {
      margin-bottom: 12px;

      .card-icon {
        width: 28px;
        height: 28px;
      }

      .card-title {
        font-size: 12px;
      }
    }

    .card-content {
      .main-value {
        font-size: 24px;
      }
    }
  }
}
</style>
