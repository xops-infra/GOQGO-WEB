<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :class="className"
  >
    <!-- 外圆环 -->
    <circle
      cx="100"
      cy="100"
      r="90"
      stroke="currentColor"
      stroke-width="8"
      fill="none"
      opacity="0.3"
    />

    <!-- 内圆 -->
    <circle cx="100" cy="100" r="60" :fill="color" opacity="0.8" />

    <!-- 字母 G -->
    <path
      d="M70 100 C70 85, 85 70, 100 70 C115 70, 130 85, 130 100 L115 100 L115 115 L100 115 C85 115, 70 100, 70 100 Z"
      fill="white"
      opacity="0.9"
    />

    <!-- 装饰点 -->
    <circle cx="100" cy="50" r="4" :fill="color" opacity="0.6" />
    <circle cx="150" cy="100" r="4" :fill="color" opacity="0.6" />
    <circle cx="100" cy="150" r="4" :fill="color" opacity="0.6" />
    <circle cx="50" cy="100" r="4" :fill="color" opacity="0.6" />

    <!-- 动画效果 -->
    <circle
      cx="100"
      cy="100"
      r="75"
      stroke="currentColor"
      stroke-width="2"
      fill="none"
      opacity="0.2"
    >
      <animate attributeName="r" values="75;85;75" dur="3s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.2;0.1;0.2" dur="3s" repeatCount="indefinite" />
    </circle>
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
  color: '#3b82f6',
  className: ''
})
</script>

<style scoped>
svg {
  transition: all 0.3s ease;
}

svg:hover {
  transform: scale(1.05);
}
</style>
