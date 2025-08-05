<template>
  <div class="login-background">
    <!-- 动态背景粒子 -->
    <div class="particles-container">
      <div
        v-for="i in particleCount"
        :key="i"
        class="particle"
        :style="getParticleStyle(i)"
      ></div>
    </div>
    
    <!-- 几何图形装饰 -->
    <div class="geometric-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from '@/utils/theme'

const { isTerminal } = useTheme()

// 粒子数量
const particleCount = computed(() => isTerminal.value ? 20 : 30)

// 生成粒子样式
const getParticleStyle = (index: number) => {
  const size = Math.random() * 4 + 2
  const left = Math.random() * 100
  const animationDelay = Math.random() * 10
  const animationDuration = Math.random() * 20 + 10
  
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    animationDelay: `${animationDelay}s`,
    animationDuration: `${animationDuration}s`
  }
}
</script>

<style scoped lang="scss">
.login-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: -1;
}

.particles-container {
  position: absolute;
  width: 100%;
  height: 100%;
}

.particle {
  position: absolute;
  background: rgba(var(--color-primary-rgb), 0.3);
  border-radius: 50%;
  animation: float infinite linear;
  
  @keyframes float {
    0% {
      transform: translateY(100vh) rotate(0deg);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    90% {
      opacity: 1;
    }
    100% {
      transform: translateY(-100px) rotate(360deg);
      opacity: 0;
    }
  }
}

.geometric-shapes {
  position: absolute;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  border: 2px solid rgba(var(--color-primary-rgb), 0.1);
  
  &.shape-1 {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    top: 10%;
    right: 10%;
    animation: rotate 20s linear infinite;
  }
  
  &.shape-2 {
    width: 150px;
    height: 150px;
    bottom: 20%;
    left: 15%;
    animation: rotate 15s linear infinite reverse;
  }
  
  &.shape-3 {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    top: 60%;
    right: 30%;
    animation: rotate 25s linear infinite;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// Terminal主题样式
[data-theme='terminal'] .login-background {
  .particle {
    background: rgba(0, 255, 65, 0.3);
    box-shadow: 0 0 4px rgba(0, 255, 65, 0.5);
  }
  
  .shape {
    border-color: rgba(0, 255, 65, 0.2);
    box-shadow: 0 0 10px rgba(0, 255, 65, 0.1);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .shape {
    &.shape-1 {
      width: 120px;
      height: 120px;
    }
    
    &.shape-2 {
      width: 100px;
      height: 100px;
    }
    
    &.shape-3 {
      width: 80px;
      height: 80px;
    }
  }
}

// 减少动画以提升性能
@media (prefers-reduced-motion: reduce) {
  .particle,
  .shape {
    animation: none;
  }
}
</style>
