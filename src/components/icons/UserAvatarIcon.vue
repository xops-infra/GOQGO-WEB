<template>
  <svg 
    :width="size" 
    :height="size" 
    viewBox="0 0 32 32" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    class="user-avatar-icon"
  >
    <!-- 背景圆形 -->
    <circle 
      cx="16" 
      cy="16" 
      r="15" 
      :fill="backgroundColor" 
      :stroke="borderColor" 
      stroke-width="2"
    />
    
    <!-- 用户头部 -->
    <circle 
      cx="16" 
      cy="12" 
      r="5" 
      :fill="iconColor"
    />
    
    <!-- 用户身体 -->
    <path 
      d="M6 26c0-5.5 4.5-10 10-10s10 4.5 10 10" 
      :stroke="iconColor" 
      stroke-width="2" 
      fill="none"
      stroke-linecap="round"
    />
    
    <!-- Terminal 风格装饰 -->
    <template v-if="isTerminal">
      <!-- 像素化边框 -->
      <rect x="1" y="1" width="30" height="30" fill="none" :stroke="accentColor" stroke-width="1" opacity="0.5"/>
      <rect x="2" y="2" width="28" height="28" fill="none" :stroke="accentColor" stroke-width="1" opacity="0.3"/>
      
      <!-- 状态指示点 -->
      <circle 
        cx="26" 
        cy="6" 
        r="3" 
        :fill="statusColor"
        :stroke="backgroundColor"
        stroke-width="1"
      />
    </template>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from '@/utils/theme'

interface Props {
  size?: number | string
  username?: string
  isOnline?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 32,
  username: 'User',
  isOnline: true
})

const { isTerminal } = useTheme()

// 移除颜色生成函数，统一使用白色

const backgroundColor = computed(() => {
  if (isTerminal.value) {
    return '#0a0a0a'
  }
  return '#f8f9fa'
})

const borderColor = computed(() => {
  if (isTerminal.value) {
    return '#ffffff' // 统一使用白色边框
  }
  return '#e5e7eb'
})

const iconColor = computed(() => {
  if (isTerminal.value) {
    return '#ffffff' // 统一使用白色图标
  }
  return '#6b7280'
})

const accentColor = computed(() => {
  return '#ffffff' // 统一使用白色装饰
})

const statusColor = computed(() => {
  if (props.isOnline) {
    return isTerminal.value ? '#00ff41' : '#10b981' // 在线状态保持绿色
  }
  return isTerminal.value ? '#666666' : '#9ca3af'
})
</script>

<style scoped lang="scss">
.user-avatar-icon {
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: scale(1.05);
    filter: drop-shadow(0 0 8px currentColor);
  }
  
  // Terminal 主题下的特殊效果
  [data-theme='terminal'] & {
    filter: drop-shadow(0 0 4px #ffffff);
    
    &:hover {
      filter: drop-shadow(0 0 12px #ffffff);
      transform: scale(1.1);
    }
  }
}
</style>
