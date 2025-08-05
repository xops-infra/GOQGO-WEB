<template>
  <div class="main-header">
    <div class="header-content">
      <!-- 左侧区域 -->
      <div class="header-left">
        <!-- 菜单切换按钮 -->
        <n-button
          text
          @click="toggleSidebar"
          class="menu-toggle"
          :class="{ 'menu-active': !sidebarCollapsed }"
        >
          <template #icon>
            <n-icon size="20">
              <MenuIcon />
            </n-icon>
          </template>
        </n-button>

        <!-- Logo和标题 -->
        <div class="logo-section" @click="goToHome">
          <img src="@/assets/Goqgo.svg" alt="GoQGo" class="header-logo" />
          <div class="header-title">
            <h1>GoQGo</h1>
          </div>
        </div>

        <!-- 版本信息 -->
        <VersionInfo />

        <!-- GitHub链接 -->
        <n-tooltip>
          <template #trigger>
            <n-button text size="small" @click="openGitHub" class="github-button">
              <template #icon>
                <n-icon size="16">
                  <GitHubIcon />
                </n-icon>
              </template>
            </n-button>
          </template>
          <span>访问GitHub仓库</span>
        </n-tooltip>
      </div>

      <!-- 右侧区域 -->
      <div class="header-right">
        <n-space :size="12" align="center">
          <!-- 连接状态指示器 -->
          <ConnectionStatus />
          
          <!-- 主题切换 -->
          <ThemeToggle />
          
          <!-- 用户信息 -->
          <UserInfo />
        </n-space>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { NButton, NIcon, NTooltip, NSpace } from 'naive-ui'
import { useLayout } from '@/composables/useLayout'
import VersionInfo from '@/components/VersionInfo.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import UserInfo from '@/components/UserInfo.vue'
import ConnectionStatus from '@/components/ConnectionStatus.vue'
import MenuIcon from '@/components/icons/MenuIcon.vue'
import GitHubIcon from '@/components/icons/GitHubIcon.vue'

const router = useRouter()
const { toggleSidebar, sidebarCollapsed } = useLayout()

// 方法
const goToHome = () => {
  router.push('/')
}

const openGitHub = () => {
  window.open('https://github.com/zhoushoujianwork/GOQGO-WEB', '_blank')
}
</script>

<style scoped lang="scss">
.main-header {
  height: 100%;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-primary);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0;
}

.menu-toggle {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--bg-hover);
  }
  
  &.menu-active {
    background: var(--bg-active);
    color: var(--color-primary);
  }
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--bg-hover);
  }
  
  .header-logo {
    width: 32px;
    height: 32px;
    border-radius: 6px;
  }
  
  .header-title {
    h1 {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
      white-space: nowrap;
    }
  }
}

.github-button {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--bg-hover);
    color: var(--color-primary);
  }
}

.header-right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

// Terminal主题样式
[data-theme='terminal'] .main-header {
  background: var(--terminal-bg-secondary);
  border-bottom-color: var(--terminal-border);
  
  .header-title h1 {
    color: var(--pixel-green);
    font-family: var(--font-display);
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  .menu-toggle {
    &:hover {
      background: var(--terminal-surface);
      color: var(--pixel-cyan);
    }
    
    &.menu-active {
      background: var(--terminal-surface);
      color: var(--pixel-green);
    }
  }
  
  .logo-section {
    &:hover {
      background: var(--terminal-surface);
    }
  }
  
  .github-button {
    &:hover {
      background: var(--terminal-surface);
      color: var(--pixel-cyan);
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .header-content {
    padding: 0 12px;
  }
  
  .header-left {
    gap: 8px;
  }
  
  .header-title h1 {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .logo-section {
    .header-title {
      display: none;
    }
  }
}
</style>
