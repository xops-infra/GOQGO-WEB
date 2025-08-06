<template>
  <div class="terminal-header">
    <div class="terminal-content">
      <!-- 左侧Terminal标题 -->
      <div class="terminal-left">
        <div class="terminal-icon">
          <svg viewBox="0 0 24 24" class="terminal-svg">
            <path fill="currentColor" d="M20,19V7H4V19H20M20,3A2,2 0 0,1 22,5V19A2,2 0 0,1 20,21H4A2,2 0 0,1 2,19V5C2,3.89 2.9,3 4,3H20M13,17V15H18V17H13M9.58,13L5.57,9H8.4L11.7,12.3C12.09,12.69 12.09,13.33 11.7,13.72L8.42,17H5.59L9.58,13Z" />
          </svg>
        </div>
        <div class="title-content">
          <h1 class="main-title">GOQGO.TERMINAL</h1>
          <div class="command-line">
            <span class="user-prompt">root@goqgo:~$</span>
            <span class="command-text">{{ currentCommand }}</span>
            <span class="cursor">_</span>
          </div>
        </div>
      </div>
      
      <!-- 中间导航 -->
      <div class="terminal-nav">
        <MainNavigation />
      </div>
      
      <!-- 右侧控制区域 -->
      <div class="terminal-right">
        <VersionInfo class="version-info" />
        <ThemeToggle />
        <UserInfo />
        <n-tooltip>
          <template #trigger>
            <n-button text size="small" @click="openGitHub" class="github-button">
              <template #icon>
                <n-icon size="16">
                  <svg viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z"
                    />
                  </svg>
                </n-icon>
              </template>
            </n-button>
          </template>
          <span>访问GitHub仓库</span>
        </n-tooltip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { NButton, NIcon, NTooltip } from 'naive-ui'
import MainNavigation from './MainNavigation.vue'
import ThemeToggle from './ThemeToggle.vue'
import UserInfo from './UserInfo.vue'
import VersionInfo from './VersionInfo.vue'

const route = useRoute()

// 根据当前路由显示不同的命令
const currentCommand = computed(() => {
  const commandMap: Record<string, string> = {
    'home': 'chat.interactive',
    'agents': 'monitor.performance',
    'market': 'marketplace.browse',
    'dashboard': 'system.dashboard',
    'roles': 'rbac.manage'
  }
  return commandMap[route.name as string] || 'system.status'
})

const openGitHub = () => {
  window.open('https://github.com/zhoushoujianwork/GOQGO-WEB', '_blank')
}
</script>

<style scoped lang="scss">
.terminal-header {
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
  border-bottom: 2px solid #00ff00;
  box-shadow: 0 0 15px rgba(0, 255, 0, 0.2);
  position: relative;
  height: 80px;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 50%, rgba(0, 255, 0, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 80% 50%, rgba(0, 255, 0, 0.03) 0%, transparent 50%);
    pointer-events: none;
  }
}

.terminal-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 20px;
  position: relative;
  z-index: 1;
}

.terminal-left {
  display: flex;
  align-items: center;
  gap: 15px;
  
  .terminal-icon {
    .terminal-svg {
      width: 32px;
      height: 32px;
      color: #00ff00;
      filter: drop-shadow(0 0 8px rgba(0, 255, 0, 0.6));
    }
  }
  
  .title-content {
    .main-title {
      font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
      font-size: 1.4rem;
      font-weight: bold;
      color: #00ff00;
      text-shadow: 
        0 0 8px rgba(0, 255, 0, 0.8),
        0 0 15px rgba(0, 255, 0, 0.4);
      margin: 0 0 4px 0;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    
    .command-line {
      font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
      font-size: 0.75rem;
      color: #00cc88;
      display: flex;
      align-items: center;
      gap: 6px;
      
      .user-prompt {
        color: #00ff00;
        font-weight: bold;
        text-shadow: 0 0 4px rgba(0, 255, 0, 0.6);
      }
      
      .command-text {
        color: #00ccff;
        text-shadow: 0 0 3px rgba(0, 204, 255, 0.4);
      }
      
      .cursor {
        color: #00ff00;
        animation: blink 1s infinite;
        font-weight: bold;
      }
    }
  }
}

.terminal-nav {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  
  :deep(.main-navigation) {
    .nav-items {
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(0, 255, 0, 0.3);
      box-shadow: 0 0 10px rgba(0, 255, 0, 0.1);
      padding: 2px;
    }
    
    .nav-item {
      color: #00cc88;
      font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-size: 0.8rem;
      padding: 6px 12px;
      border: 1px solid transparent;
      
      &:hover {
        color: #00ff00;
        text-shadow: 0 0 6px rgba(0, 255, 0, 0.8);
        border-color: rgba(0, 255, 0, 0.5);
        box-shadow: 0 0 8px rgba(0, 255, 0, 0.2);
      }
      
      &.n-button--primary {
        background: rgba(0, 255, 0, 0.1);
        color: #00ff00;
        border-color: #00ff00;
        text-shadow: 0 0 8px rgba(0, 255, 0, 0.8);
        box-shadow: 0 0 12px rgba(0, 255, 0, 0.3);
        
        &::before {
          content: '> ';
          color: #00ff00;
        }
      }
    }
  }
}

.terminal-right {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .version-info {
    opacity: 0.8;
    
    :deep(.version-text) {
      color: #00cc88;
      font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
      font-size: 0.7rem;
    }
  }
  
  .github-button {
    color: #00ff00;
    transition: all 0.3s ease;
    
    &:hover {
      color: #00ff00;
      text-shadow: 0 0 8px rgba(0, 255, 0, 0.8);
      transform: scale(1.1);
    }
  }
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

// 响应式设计
@media (max-width: 768px) {
  .terminal-content {
    padding: 0 15px;
  }
  
  .terminal-left {
    gap: 10px;
    
    .title-content .main-title {
      font-size: 1.1rem;
    }
    
    .command-line {
      font-size: 0.65rem;
    }
  }
  
  .terminal-nav {
    display: none; // 移动端隐藏导航，节省空间
  }
  
  .terminal-right {
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .terminal-header {
    height: 60px; // 移动端更紧凑
  }
  
  .terminal-left .title-content .main-title {
    font-size: 1rem;
  }
}
</style>
