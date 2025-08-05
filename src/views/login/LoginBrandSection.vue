<template>
  <div class="brand-section">
    <div class="brand-content">
      <!-- Logo和标题 -->
      <div class="brand-header">
        <div class="logo-container">
          <img src="@/assets/Goqgo.svg" alt="GoQGo" class="brand-logo" />
        </div>
        <h1 class="brand-title">GoQGo</h1>
        <p class="brand-subtitle">AI智能体协助开发平台</p>
      </div>

      <!-- 特性介绍 -->
      <div class="features-list">
        <FeatureItem
          icon="🤖"
          title="多智能体协同"
          description="支持多个AI智能体同时工作，提升开发效率"
        />
        
        <FeatureItem
          icon="💬"
          title="实时聊天系统"
          description="类似微信的群聊功能，团队实时沟通协作"
        />
        
        <FeatureItem
          icon="📁"
          title="项目管理"
          description="统一管理多个项目模块，版本控制集成"
        />
        
        <FeatureItem
          icon="🔄"
          title="实时同步"
          description="WebSocket连接确保信息实时更新"
        />
      </div>

      <!-- 版本信息 -->
      <div class="version-info">
        <VersionDisplay />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import FeatureItem from './FeatureItem.vue'
import VersionDisplay from '@/components/VersionDisplay.vue'
</script>

<style scoped lang="scss">
.brand-section {
  flex: 1;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
    opacity: 0.3;
  }
}

.brand-content {
  max-width: 500px;
  text-align: center;
  color: white;
  position: relative;
  z-index: 1;
}

.brand-header {
  margin-bottom: 48px;
  
  .logo-container {
    margin-bottom: 24px;
    
    .brand-logo {
      width: 80px;
      height: 80px;
      filter: brightness(0) invert(1);
      animation: logoFloat 3s ease-in-out infinite;
    }
  }
  
  .brand-title {
    font-size: 48px;
    font-weight: 700;
    margin: 0 0 12px 0;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    letter-spacing: -1px;
  }
  
  .brand-subtitle {
    font-size: 18px;
    margin: 0;
    opacity: 0.9;
    font-weight: 300;
  }
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 48px;
}

.version-info {
  opacity: 0.8;
}

@keyframes logoFloat {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

// Terminal主题样式
[data-theme='terminal'] .brand-section {
  background: linear-gradient(135deg, var(--terminal-bg) 0%, var(--terminal-bg-secondary) 100%);
  
  &::before {
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="terminal-grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(0,255,65,0.2)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23terminal-grid)"/></svg>');
  }
  
  .brand-content {
    color: var(--terminal-text);
  }
  
  .brand-title {
    color: var(--pixel-green);
    font-family: var(--font-display);
    text-transform: uppercase;
    letter-spacing: 2px;
    text-shadow: 0 0 10px var(--pixel-green);
  }
  
  .brand-subtitle {
    color: var(--terminal-text-secondary);
    font-family: var(--font-mono);
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  .brand-logo {
    filter: brightness(0) saturate(100%) invert(84%) sepia(84%) saturate(2841%) hue-rotate(79deg) brightness(119%) contrast(119%);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .brand-section {
    padding: 24px;
    min-height: 40vh;
  }
  
  .brand-header {
    margin-bottom: 32px;
    
    .brand-logo {
      width: 60px;
      height: 60px;
    }
    
    .brand-title {
      font-size: 36px;
    }
    
    .brand-subtitle {
      font-size: 16px;
    }
  }
  
  .features-list {
    gap: 16px;
    margin-bottom: 32px;
  }
}

@media (max-width: 480px) {
  .brand-header {
    .brand-title {
      font-size: 28px;
    }
    
    .brand-subtitle {
      font-size: 14px;
    }
  }
}
</style>
