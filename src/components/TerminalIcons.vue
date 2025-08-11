<template>
  <svg
    :width="size"
    :height="size"
    :viewBox="viewBox"
    :class="['terminal-icon', `icon-${name}`, { 'neon-glow': glow }]"
    :style="iconStyle"
  >
    <!-- Terminal图标 -->
    <g v-if="name === 'terminal'">
      <!-- 扫描线背景效果 -->
      <defs>
        <pattern id="scanlines" x="0" y="0" width="2" height="2" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="32" y2="0" stroke="currentColor" stroke-width="0.4" opacity="0.15" />
        </pattern>
      </defs>
      
      <!-- 背景扫描线 -->
      <rect width="32" height="32" fill="url(#scanlines)" />
      
      <!-- 终端窗口外框 - 发光效果 -->
      <rect
        x="3"
        y="3"
        width="26"
        height="26"
        rx="4"
        fill="none"
        :stroke="color"
        stroke-width="3"
        opacity="0.9"
        filter="drop-shadow(0 0 4px currentColor)"
      />
      
      <!-- 终端窗口内框 -->
      <rect
        x="6"
        y="6"
        width="20"
        height="20"
        rx="3"
        fill="none"
        :stroke="color"
        stroke-width="2"
        opacity="0.7"
      />
      
      <!-- 命令提示符光标 -->
      <g opacity="0.95">
        <!-- 右箭头 ">" -->
        <path
          d="M10 16 L14 13 L14 19 Z"
          :fill="color"
        />
        <!-- 下划线 "_" -->
        <rect
          x="16"
          y="17"
          width="8"
          height="2"
          :fill="color"
        />
      </g>
      
      <!-- 装饰性扫描线 -->
      <line
        x1="7"
        y1="10"
        x2="25"
        y2="10"
        :stroke="color"
        stroke-width="1"
        opacity="0.4"
      />
      <line
        x1="7"
        y1="22"
        x2="25"
        y2="22"
        :stroke="color"
        stroke-width="1"
        opacity="0.4"
      />
      
      <!-- 闪烁光标动画 -->
      <rect
        x="16"
        y="17"
        width="8"
        height="2"
        :fill="color"
        opacity="0.95"
      >
        <animate
          attributeName="opacity"
          values="0.95;0.4;0.95"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </rect>
    </g>

    <!-- CPU/处理器图标 -->
    <g v-else-if="name === 'cpu'">
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx="2"
        fill="none"
        :stroke="color"
        stroke-width="2"
      />
      <rect x="8" y="8" width="8" height="8" rx="1" fill="none" :stroke="color" stroke-width="1" />
      <path
        d="M4 10h-2M4 14h-2M20 10h2M20 14h2M10 4v-2M14 4v-2M10 20v2M14 20v2"
        :stroke="color"
        stroke-width="2"
      />
    </g>

    <!-- 网络图标 -->
    <g v-else-if="name === 'network'">
      <circle cx="12" cy="12" r="3" fill="none" :stroke="color" stroke-width="2" />
      <circle cx="6" cy="6" r="2" fill="none" :stroke="color" stroke-width="2" />
      <circle cx="18" cy="6" r="2" fill="none" :stroke="color" stroke-width="2" />
      <circle cx="6" cy="18" r="2" fill="none" :stroke="color" stroke-width="2" />
      <circle cx="18" cy="18" r="2" fill="none" :stroke="color" stroke-width="2" />
      <path
        d="M8.5 7.5l3 3M15.5 7.5l-3 3M8.5 16.5l3-3M15.5 16.5l-3-3"
        :stroke="color"
        stroke-width="2"
      />
    </g>

    <!-- 数据库图标 -->
    <g v-else-if="name === 'database'">
      <ellipse cx="12" cy="5" rx="9" ry="3" fill="none" :stroke="color" stroke-width="2" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" fill="none" :stroke="color" stroke-width="2" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" fill="none" :stroke="color" stroke-width="2" />
    </g>

    <!-- 服务器图标 -->
    <g v-else-if="name === 'server'">
      <rect x="2" y="3" width="20" height="4" rx="1" fill="none" :stroke="color" stroke-width="2" />
      <rect
        x="2"
        y="10"
        width="20"
        height="4"
        rx="1"
        fill="none"
        :stroke="color"
        stroke-width="2"
      />
      <rect
        x="2"
        y="17"
        width="20"
        height="4"
        rx="1"
        fill="none"
        :stroke="color"
        stroke-width="2"
      />
      <circle cx="6" cy="5" r="1" :fill="color" />
      <circle cx="6" cy="12" r="1" :fill="color" />
      <circle cx="6" cy="19" r="1" :fill="color" />
    </g>

    <!-- 机器人图标 -->
    <g v-else-if="name === 'robot'">
      <rect
        x="6"
        y="6"
        width="12"
        height="12"
        rx="2"
        fill="none"
        :stroke="color"
        stroke-width="2"
      />
      <circle cx="9" cy="9" r="1" :fill="color" />
      <circle cx="15" cy="9" r="1" :fill="color" />
      <path d="M9 13h6" :stroke="color" stroke-width="2" stroke-linecap="round" />
      <path d="M12 6V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2" :stroke="color" stroke-width="2" />
      <path d="M6 15.5v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1" :stroke="color" stroke-width="2" />
    </g>

    <!-- 代码图标 -->
    <g v-else-if="name === 'code'">
      <path
        d="M16 18l6-6-6-6M8 6l-6 6 6 6"
        :stroke="color"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
      />
    </g>

    <!-- 齿轮图标 -->
    <g v-else-if="name === 'gear'">
      <circle cx="12" cy="12" r="3" fill="none" :stroke="color" stroke-width="2" />
      <path
        d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"
        :stroke="color"
        stroke-width="2"
      />
    </g>

    <!-- 闪电图标 -->
    <g v-else-if="name === 'lightning'">
      <path
        d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
        :stroke="color"
        stroke-width="2"
        stroke-linejoin="round"
        fill="none"
      />
    </g>

    <!-- 默认图标 -->
    <g v-else>
      <circle cx="12" cy="12" r="10" fill="none" :stroke="color" stroke-width="2" />
      <path d="M8 12h8M12 8v8" :stroke="color" stroke-width="2" />
    </g>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from '@/utils/theme'

interface Props {
  name: string
  size?: number | string
  color?: string
  glow?: boolean
  animated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 24,
  color: 'currentColor',
  glow: false,
  animated: false
})

const { isTerminal } = useTheme()

const viewBox = computed(() => '0 0 32 32')

const iconStyle = computed(() => {
  const styles: Record<string, string> = {}

  if (props.animated) {
    styles.animation = 'pulse 2s ease-in-out infinite alternate'
  }

  if (isTerminal.value && props.glow) {
    styles.filter = `drop-shadow(0 0 8px ${props.color})`
  }

  return styles
})
</script>

<style scoped lang="scss">
.terminal-icon {
  transition: all 0.3s ease;

  &.neon-glow {
    [data-theme='terminal'] & {
      filter: drop-shadow(0 0 8px currentColor);

      &:hover {
        filter: drop-shadow(0 0 12px currentColor);
        transform: scale(1.1);
      }
    }
  }

  &.icon-terminal {
    [data-theme='terminal'] & {
      color: var(--pixel-green);
    }
  }

  &.icon-cpu {
    [data-theme='terminal'] & {
      color: var(--pixel-blue);
    }
  }

  &.icon-network {
    [data-theme='terminal'] & {
      color: var(--pixel-cyan);
    }
  }

  &.icon-database {
    [data-theme='terminal'] & {
      color: var(--pixel-purple);
    }
  }

  &.icon-server {
    [data-theme='terminal'] & {
      color: var(--pixel-orange);
    }
  }

  &.icon-robot {
    [data-theme='terminal'] & {
      color: var(--pixel-green);
    }
  }

  &.icon-code {
    [data-theme='terminal'] & {
      color: var(--pixel-yellow);
    }
  }

  &.icon-gear {
    [data-theme='terminal'] & {
      color: var(--pixel-red);
    }
  }

  &.icon-lightning {
    [data-theme='terminal'] & {
      color: var(--pixel-yellow);
    }
  }
}

@keyframes pulse {
  from {
    opacity: 0.7;
    transform: scale(1);
  }
  to {
    opacity: 1;
    transform: scale(1.05);
  }
}
</style>
