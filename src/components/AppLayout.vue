<template>
  <n-config-provider>
    <div class="app-layout">
      <!-- 顶部导航栏 -->
      <div class="app-header">
        <div class="header-content">
          <div class="header-left">
            <div class="logo-section" @click="goToHome">
              <img src="@/assets/Goqgo.svg" alt="GoQGo" class="header-logo" />
              <div class="header-title">
                <h1>GoQGo</h1>
              </div>
            </div>
            <VersionInfo />
          </div>
          
          <div class="header-center">
            <!-- 顶部导航栏中间区域 - 可以放置面包屑或其他导航元素 -->
          </div>
          
          <div class="header-right">
            <n-space :size="12" align="center">
              <AppNavigation />
              <n-divider vertical />
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
              <ThemeToggle />
              <UserInfo />
            </n-space>
          </div>
        </div>
      </div>

      <!-- 主内容区域 -->
      <div class="app-main">
        <!-- 页面头部 -->
        <div class="page-header">
          <div class="page-info">
            <h1 class="page-title">{{ currentPageTitle }}</h1>
            <n-text depth="2" class="page-description">{{ currentPageDescription }}</n-text>
          </div>
        </div>
        
        <!-- 页面内容 -->
        <div class="page-content">
          <router-view />
        </div>
      </div>
    </div>
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import VersionInfo from './VersionInfo.vue'
import AppNavigation from './AppNavigation.vue'
import ThemeToggle from './ThemeToggle.vue'
import UserInfo from './UserInfo.vue'

const router = useRouter()
const route = useRoute()

// 当前页面标题
const currentPageTitle = computed(() => {
  return route.meta.title as string || '页面'
})

// 当前页面描述
const currentPageDescription = computed(() => {
  const descriptions: Record<string, string> = {
    'roles': '管理和查看所有可用的AI角色',
    'chat': '与AI智能体进行实时对话交流',
    'agents': '管理和监控AI智能体实例',
    'debug': '系统调试和开发工具',
    'test': '功能测试和验证工具'
  }
  
  const routeName = route.name as string
  return descriptions[routeName] || '系统功能页面'
})

// 点击logo返回主页
const goToHome = () => {
  router.push({ name: 'home' })
}

// 打开GitHub仓库
const openGitHub = () => {
  window.open('https://github.com/zhoushoujianwork/GOQGO-WEB', '_blank')
}
</script>

<style scoped lang="scss">
.app-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--body-color);
}

.app-header {
  height: 60px;
  background: var(--card-color);
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  z-index: 1000;
  
  .header-content {
    height: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .logo-section {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      transition: all 0.2s ease;
      
      &:hover {
        background: var(--hover-color);
      }
      
      .header-logo {
        width: 32px;
        height: 32px;
      }
      
      .header-title {
        h1 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: var(--text-color-1);
        }
      }
    }
  }
  
  .header-center {
    flex: 1;
    display: flex;
    justify-content: center;
    max-width: 600px;
    
    .page-title {
      h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 500;
        color: var(--text-color-1);
        text-align: center;
      }
    }
  }
  
  .header-right {
    display: flex;
    align-items: center;
    
    .github-button {
      color: var(--text-color-2);
      
      &:hover {
        color: var(--text-color-1);
      }
    }
  }
}

.app-main {
  flex: 1;
  overflow: hidden;
  background: var(--body-color);
  display: flex;
  flex-direction: column;
}

.page-header {
  padding: 24px 24px 0 24px;
  background: var(--body-color);
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 24px;
  
  .page-info {
    .page-title {
      margin: 0 0 4px 0;
      font-size: 24px;
      font-weight: 600;
      color: var(--text-color-1);
    }
    
    .page-description {
      font-size: 14px;
      color: var(--text-color-3);
    }
  }
  
  .page-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

.page-content {
  flex: 1;
  overflow: auto;
  padding: 0 24px 24px 24px;
}

// 响应式设计
@media (max-width: 768px) {
  .app-header {
    .header-content {
      padding: 0 16px;
    }
    
    .header-center {
      display: none;
    }
    
    .header-left {
      gap: 12px;
      
      .header-title h1 {
        font-size: 18px;
      }
    }
  }
}
</style>
