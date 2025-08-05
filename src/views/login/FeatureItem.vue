<template>
  <div class="feature-item">
    <div class="feature-icon">{{ icon }}</div>
    <div class="feature-content">
      <h3>{{ title }}</h3>
      <p>{{ description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  icon: string
  title: string
  description: string
}

defineProps<Props>()
</script>

<style scoped lang="scss">
.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  text-align: left;
  padding: 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  }
}

.feature-icon {
  font-size: 24px;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
}

.feature-content {
  flex: 1;
  
  h3 {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 600;
    color: white;
  }
  
  p {
    margin: 0;
    font-size: 14px;
    opacity: 0.9;
    line-height: 1.4;
  }
}

// Terminal主题样式
[data-theme='terminal'] .feature-item {
  background: rgba(0, 255, 65, 0.1);
  border-color: rgba(0, 255, 65, 0.3);
  
  &:hover {
    background: rgba(0, 255, 65, 0.15);
    box-shadow: 0 0 20px rgba(0, 255, 65, 0.3);
  }
  
  .feature-icon {
    background: rgba(0, 255, 65, 0.2);
    border: 1px solid rgba(0, 255, 65, 0.4);
  }
  
  .feature-content {
    h3 {
      color: var(--pixel-green);
      font-family: var(--font-display);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    p {
      color: var(--terminal-text-secondary);
      font-family: var(--font-mono);
      font-size: 12px;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .feature-item {
    padding: 12px;
    gap: 12px;
  }
  
  .feature-icon {
    font-size: 20px;
    width: 36px;
    height: 36px;
  }
  
  .feature-content {
    h3 {
      font-size: 15px;
    }
    
    p {
      font-size: 13px;
    }
  }
}
</style>
