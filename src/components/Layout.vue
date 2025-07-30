<template>
  <n-layout class="layout" has-sider>
    <!-- 侧边栏 -->
    <n-layout-sider
      :collapsed="appStore.sidebarCollapsed"
      :collapsed-width="64"
      :width="240"
      collapse-mode="width"
      bordered
      show-trigger
      @collapse="appStore.toggleSidebar"
      @expand="appStore.toggleSidebar"
    >
      <div class="sidebar-header">
        <div class="logo">
          <img src="@/assets/Goqgo.svg" alt="GoQGo" class="logo-icon" />
          <span v-if="!appStore.sidebarCollapsed" class="logo-text">GoQGo</span>
        </div>
      </div>
      
      <n-menu
        :collapsed="appStore.sidebarCollapsed"
        :collapsed-width="64"
        :options="menuOptions"
        :value="currentRoute"
        @update:value="handleMenuSelect"
      />
    </n-layout-sider>

    <!-- 主内容区 -->
    <n-layout>
      <!-- 顶部导航 -->
      <n-layout-header class="header" bordered>
        <div class="header-content">
          <div class="header-left">
            <n-breadcrumb>
              <n-breadcrumb-item>{{ currentPageTitle }}</n-breadcrumb-item>
            </n-breadcrumb>
          </div>
          
          <div class="header-right">
            <n-space>
              <n-button quaternary circle @click="appStore.toggleTheme">
                <n-icon size="18">
                  <SunnyOutline v-if="appStore.theme === 'dark'" />
                  <MoonOutline v-else />
                </n-icon>
              </n-button>
              
              <n-dropdown :options="userMenuOptions" @select="handleUserMenuSelect">
                <n-avatar
                  round
                  size="small"
                  :src="appStore.user?.avatar"
                  :fallback-src="'/default-avatar.png'"
                />
              </n-dropdown>
            </n-space>
          </div>
        </div>
      </n-layout-header>

      <!-- 内容区域 -->
      <n-layout-content class="content">
        <router-view />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NIcon } from 'naive-ui'
import { 
  ChatbubbleEllipsesOutline,
  PeopleOutline,
  SettingsOutline,
  SunnyOutline,
  MoonOutline,
  LogOutOutline
} from '@vicons/ionicons5'
import { useAppStore } from '@/stores/app'
import type { NavigationItem } from '@/types'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()

const currentRoute = computed(() => route.name as string)

const currentPageTitle = computed(() => {
  const routeMap: Record<string, string> = {
    'chat': '聊天管理',
    'agents': '智能体管理',
    'projects': '项目管理',
    'settings': '系统设置'
  }
  return routeMap[currentRoute.value] || '首页'
})

const renderIcon = (icon: any) => {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const menuOptions = computed(() => [
  {
    label: '聊天管理',
    key: 'chat',
    icon: renderIcon(ChatbubbleEllipsesOutline)
  },
  {
    label: '智能体管理',
    key: 'agents',
    icon: renderIcon(PeopleOutline)
  },
  {
    label: '系统设置',
    key: 'settings',
    icon: renderIcon(SettingsOutline)
  }
])

const userMenuOptions = [
  {
    label: '退出登录',
    key: 'logout',
    icon: renderIcon(LogOutOutline)
  }
]

const handleMenuSelect = (key: string) => {
  router.push({ name: key })
}

const handleUserMenuSelect = (key: string) => {
  if (key === 'logout') {
    appStore.setUser(null)
    router.push('/login')
  }
}
</script>

<style scoped lang="scss">
.layout {
  height: 100vh;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid var(--n-border-color);
  
  .logo {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .logo-icon {
      width: 32px;
      height: 32px;
      object-fit: contain;
    }
    
    .logo-text {
      font-weight: 600;
      font-size: 18px;
      color: var(--n-text-color);
      background: linear-gradient(135deg, #4A90E2, #18a058);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }
}

.header {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  
  .header-content {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.content {
  padding: 24px;
  overflow: auto;
}
</style>
