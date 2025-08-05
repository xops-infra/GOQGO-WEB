<template>
  <div class="app-header" :class="headerClasses">
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
      <div class="header-brand">
        <img 
          src="/logo.svg" 
          alt="GoQGo" 
          class="brand-logo"
          @error="handleLogoError"
        />
        <h1 class="brand-title">{{ title }}</h1>
      </div>

      <!-- 面包屑导航 -->
      <div v-if="showBreadcrumb" class="header-breadcrumb">
        <n-breadcrumb>
          <n-breadcrumb-item
            v-for="item in breadcrumbItems"
            :key="item.path"
            :clickable="!!item.path"
            @click="item.path && $router.push(item.path)"
          >
            <n-icon v-if="item.icon" size="16" style="margin-right: 4px;">
              <component :is="item.icon" />
            </n-icon>
            {{ item.label }}
          </n-breadcrumb-item>
        </n-breadcrumb>
      </div>
    </div>

    <!-- 中间区域 -->
    <div class="header-center">
      <!-- 全局搜索 -->
      <div v-if="showSearch" class="header-search">
        <n-input
          v-model:value="searchQuery"
          placeholder="搜索..."
          clearable
          @keyup.enter="handleSearch"
          class="search-input"
        >
          <template #prefix>
            <n-icon size="16">
              <SearchIcon />
            </n-icon>
          </template>
        </n-input>
      </div>
    </div>

    <!-- 右侧区域 -->
    <div class="header-right">
      <!-- 连接状态指示器 -->
      <div v-if="showConnectionStatus" class="connection-indicator">
        <n-tooltip :show-arrow="false">
          <template #trigger>
            <div 
              class="connection-dot" 
              :class="connectionStatusClass"
            ></div>
          </template>
          {{ connectionStatusText }}
        </n-tooltip>
      </div>

      <!-- 通知中心 -->
      <n-dropdown
        v-if="showNotifications"
        :options="notificationOptions"
        @select="handleNotificationSelect"
      >
        <n-button text class="header-action">
          <template #icon>
            <n-badge :value="unreadCount" :max="99" :show="unreadCount > 0">
              <n-icon size="20">
                <NotificationIcon />
              </n-icon>
            </n-badge>
          </template>
        </n-button>
      </n-dropdown>

      <!-- 主题切换 -->
      <n-button
        text
        @click="toggleTheme"
        class="header-action"
        :title="isTerminal ? '切换到普通主题' : '切换到Terminal主题'"
      >
        <template #icon>
          <n-icon size="20">
            <ThemeIcon />
          </n-icon>
        </template>
      </n-button>

      <!-- 全屏切换 -->
      <n-button
        text
        @click="toggleFullscreen"
        class="header-action"
        :title="isFullscreen ? '退出全屏' : '进入全屏'"
      >
        <template #icon>
          <n-icon size="20">
            <FullscreenIcon />
          </n-icon>
        </template>
      </n-button>

      <!-- 用户菜单 -->
      <n-dropdown
        :options="userMenuOptions"
        @select="handleUserMenuSelect"
      >
        <div class="user-profile">
          <n-avatar
            :size="32"
            :src="userStore.currentUser?.avatar"
            :fallback-src="'/default-avatar.png'"
            class="user-avatar"
          >
            {{ userStore.displayName?.charAt(0) || 'U' }}
          </n-avatar>
          <span class="user-name">{{ userStore.displayName || '用户' }}</span>
          <n-icon size="16" class="dropdown-arrow">
            <ChevronDownIcon />
          </n-icon>
        </div>
      </n-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  NButton,
  NIcon,
  NBreadcrumb,
  NBreadcrumbItem,
  NInput,
  NTooltip,
  NDropdown,
  NBadge,
  NAvatar,
  useMessage
} from 'naive-ui'
import { useTheme } from '@/utils/theme'
import { useLayout } from '@/composables/useLayout'
import { useUserStore } from '@/stores/user'
import { useChatStore } from '@/stores/chat'

// 图标组件
import MenuIcon from '@/components/icons/MenuIcon.vue'
import SearchIcon from '@/components/icons/SearchIcon.vue'
import NotificationIcon from '@/components/icons/NotificationIcon.vue'
import ThemeIcon from '@/components/icons/ThemeIcon.vue'
import FullscreenIcon from '@/components/icons/FullscreenIcon.vue'
import ChevronDownIcon from '@/components/icons/ChevronDownIcon.vue'

interface Props {
  title?: string
  showBreadcrumb?: boolean
  showSearch?: boolean
  showNotifications?: boolean
  showConnectionStatus?: boolean
  fixed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'GoQGo',
  showBreadcrumb: true,
  showSearch: true,
  showNotifications: true,
  showConnectionStatus: true,
  fixed: false
})

const router = useRouter()
const route = useRoute()
const message = useMessage()

// Store
const userStore = useUserStore()
const chatStore = useChatStore()

// 主题和布局
const { isTerminal, toggleTheme } = useTheme()
const { toggleSidebar, sidebarCollapsed, enterFullscreen, exitFullscreen } = useLayout()

// 响应式数据
const searchQuery = ref('')
const isFullscreen = ref(false)
const unreadCount = ref(3) // 模拟未读通知数

// 计算属性
const headerClasses = computed(() => ({
  'header-terminal': isTerminal.value,
  'header-fixed': props.fixed
}))

const connectionStatusClass = computed(() => {
  const status = chatStore.connectionStatus
  return {
    'connection-connected': status === 'connected',
    'connection-disconnected': status === 'disconnected',
    'connection-connecting': status === 'connecting'
  }
})

const connectionStatusText = computed(() => {
  const statusMap = {
    connected: '已连接',
    disconnected: '连接断开',
    connecting: '连接中...'
  }
  return statusMap[chatStore.connectionStatus] || '未知状态'
})

// 面包屑数据
const breadcrumbItems = computed(() => {
  const items = []
  
  // 根据路由生成面包屑
  if (route.matched.length > 1) {
    route.matched.forEach((match, index) => {
      if (match.meta?.title) {
        items.push({
          label: match.meta.title,
          path: index === route.matched.length - 1 ? '' : match.path,
          icon: match.meta.icon
        })
      }
    })
  }
  
  return items
})

// 通知选项
const notificationOptions = [
  {
    label: '查看所有通知',
    key: 'view-all'
  },
  {
    label: '标记全部已读',
    key: 'mark-all-read'
  },
  {
    type: 'divider',
    key: 'divider1'
  },
  {
    label: '通知设置',
    key: 'settings'
  }
]

// 用户菜单选项
const userMenuOptions = computed(() => [
  {
    label: '个人资料',
    key: 'profile',
    icon: 'person'
  },
  {
    label: '账户设置',
    key: 'settings',
    icon: 'settings'
  },
  {
    type: 'divider',
    key: 'divider1'
  },
  {
    label: '帮助中心',
    key: 'help',
    icon: 'help'
  },
  {
    label: '关于',
    key: 'about',
    icon: 'info'
  },
  {
    type: 'divider',
    key: 'divider2'
  },
  {
    label: '退出登录',
    key: 'logout',
    icon: 'logout'
  }
])

// 方法
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      name: 'search',
      query: { q: searchQuery.value.trim() }
    })
  }
}

const handleNotificationSelect = (key: string) => {
  switch (key) {
    case 'view-all':
      router.push('/notifications')
      break
    case 'mark-all-read':
      unreadCount.value = 0
      message.success('所有通知已标记为已读')
      break
    case 'settings':
      router.push('/settings/notifications')
      break
  }
}

const handleUserMenuSelect = (key: string) => {
  switch (key) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'help':
      window.open('/help', '_blank')
      break
    case 'about':
      router.push('/about')
      break
    case 'logout':
      userStore.logout()
      router.push('/login')
      break
  }
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
    enterFullscreen()
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
    exitFullscreen()
  }
}

const handleLogoError = () => {
  // Logo加载失败时的处理
  console.warn('Logo加载失败')
}

// 监听全屏状态变化
onMounted(() => {
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
  })
})
</script>

<style scoped lang="scss">
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 16px;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-primary);
  position: relative;
  
  &.header-fixed {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
  }
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

.header-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .brand-logo {
    width: 32px;
    height: 32px;
    border-radius: 6px;
  }
  
  .brand-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
    white-space: nowrap;
  }
}

.header-breadcrumb {
  flex: 1;
  min-width: 0;
  
  :deep(.n-breadcrumb) {
    .n-breadcrumb-item {
      color: var(--text-secondary);
      
      &:last-child {
        color: var(--text-primary);
        font-weight: 500;
      }
    }
  }
}

.header-center {
  flex: 2;
  display: flex;
  justify-content: center;
  padding: 0 24px;
}

.header-search {
  width: 100%;
  max-width: 400px;
  
  .search-input {
    :deep(.n-input) {
      background: var(--bg-secondary);
      border-color: var(--border-secondary);
      
      &:hover {
        border-color: var(--border-focus);
      }
      
      &.n-input--focus {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.1);
      }
    }
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: flex-end;
}

.connection-indicator {
  margin-right: 8px;
  
  .connection-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    transition: all 0.3s ease;
    
    &.connection-connected {
      background: var(--color-success);
      box-shadow: 0 0 4px rgba(var(--color-success-rgb), 0.5);
    }
    
    &.connection-disconnected {
      background: var(--color-error);
      box-shadow: 0 0 4px rgba(var(--color-error-rgb), 0.5);
    }
    
    &.connection-connecting {
      background: var(--color-warning);
      box-shadow: 0 0 4px rgba(var(--color-warning-rgb), 0.5);
      animation: pulse 1.5s infinite;
    }
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.header-action {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--bg-hover);
  }
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--bg-hover);
  }
  
  .user-avatar {
    flex-shrink: 0;
  }
  
  .user-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .dropdown-arrow {
    color: var(--text-tertiary);
    transition: transform 0.2s ease;
  }
}

// Terminal主题样式
.header-terminal {
  background: var(--terminal-bg-secondary);
  border-bottom-color: var(--terminal-border);
  
  .brand-title {
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
  
  .header-action {
    &:hover {
      background: var(--terminal-surface);
      color: var(--pixel-cyan);
    }
  }
  
  .user-profile {
    &:hover {
      background: var(--terminal-surface);
    }
    
    .user-name {
      color: var(--terminal-text);
      font-family: var(--font-mono);
    }
  }
  
  .connection-dot {
    &.connection-connected {
      background: var(--pixel-green);
      box-shadow: 0 0 6px var(--pixel-green);
    }
    
    &.connection-disconnected {
      background: var(--pixel-red);
      box-shadow: 0 0 6px var(--pixel-red);
    }
    
    &.connection-connecting {
      background: var(--pixel-yellow);
      box-shadow: 0 0 6px var(--pixel-yellow);
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .header-center {
    display: none;
  }
  
  .header-breadcrumb {
    display: none;
  }
  
  .user-name {
    display: none;
  }
  
  .brand-title {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .app-header {
    padding: 0 12px;
  }
  
  .header-left {
    gap: 8px;
  }
  
  .header-right {
    gap: 4px;
  }
  
  .brand-logo {
    width: 28px !important;
    height: 28px !important;
  }
}
</style>
