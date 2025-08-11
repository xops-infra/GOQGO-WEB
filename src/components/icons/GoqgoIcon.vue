<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :class="className"
  >
    <!-- 扫描线背景效果 -->
    <defs>
      <pattern id="scanlines" x="0" y="0" width="2" height="2" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="200" y2="0" stroke="currentColor" stroke-width="0.5" opacity="0.1" />
      </pattern>
    </defs>
    
    <!-- 背景扫描线 -->
    <rect width="200" height="200" fill="url(#scanlines)" />
    
    <!-- 终端窗口外框 - 发光效果 -->
    <rect
      x="20"
      y="20"
      width="160"
      height="160"
      rx="8"
      stroke="currentColor"
      stroke-width="3"
      fill="none"
      opacity="0.8"
      filter="drop-shadow(0 0 8px currentColor)"
    />
    
    <!-- 终端窗口内框 -->
    <rect
      x="30"
      y="30"
      width="140"
      height="140"
      rx="4"
      stroke="currentColor"
      stroke-width="2"
      fill="none"
      opacity="0.6"
    />
    
    <!-- 命令提示符光标 -->
    <g opacity="0.9">
      <!-- 右箭头 ">" -->
      <path
        d="M60 100 L80 90 L80 110 Z"
        fill="currentColor"
      />
      <!-- 下划线 "_" -->
      <rect
        x="85"
        y="105"
        width="20"
        height="3"
        fill="currentColor"
      />
    </g>
    
    <!-- 装饰性扫描线 -->
    <line
      x1="40"
      y1="50"
      x2="160"
      y2="50"
      stroke="currentColor"
      stroke-width="1"
      opacity="0.3"
    />
    <line
      x1="40"
      y1="150"
      x2="160"
      y2="150"
      stroke="currentColor"
      stroke-width="1"
      opacity="0.3"
    />
    
    <!-- 闪烁光标动画 -->
    <rect
      x="85"
      y="105"
      width="20"
      height="3"
      fill="currentColor"
      opacity="0.9"
    >
      <animate
        attributeName="opacity"
        values="0.9;0.3;0.9"
        dur="1.5s"
        repeatCount="indefinite"
      />
    </rect>
    
    <!-- 外框发光动画 -->
    <rect
      x="20"
      y="20"
      width="160"
      height="160"
      rx="8"
      stroke="currentColor"
      stroke-width="3"
      fill="none"
      opacity="0.8"
      filter="drop-shadow(0 0 8px currentColor)"
    >
      <animate
        attributeName="opacity"
        values="0.8;1;0.8"
        dur="2s"
        repeatCount="indefinite"
      />
    </rect>
  </svg>
</template>

<script setup lang="ts">
interface Props {
  size?: number | string
  color?: string
  className?: string
}

withDefaults(defineProps<Props>(), {
  size: 120,
  color: '#00ff00',
  className: ''
})
</script>

<style scoped>
svg {
  transition: all 0.3s ease;
  filter: drop-shadow(0 0 10px currentColor);
}

svg:hover {
  transform: scale(1.05);
  filter: drop-shadow(0 0 15px currentColor);
}

/* 确保图标颜色继承父元素的颜色 */
svg {
  color: var(--icon-color, #00ff00);
}
</style>
