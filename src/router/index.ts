import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import BaseLayout from '@/components/BaseLayout.vue'

import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import ChatView from '@/views/ChatView.vue'
import AgentsView from '@/views/AgentsView.vue'
import DashboardView from '@/views/DashboardView.vue'
import RolesView from '@/views/RolesView.vue'
import SettingsView from '@/views/SettingsView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: {
        title: '登录 - GoQGo',
        requiresAuth: false,
        hideForAuth: true // 已登录用户隐藏此页面
      }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: {
        title: '注册 - GoQGo',
        requiresAuth: false,
        hideForAuth: true // 已登录用户隐藏此页面
      }
    },
    {
      path: '/',
      name: 'home',
      component: BaseLayout,
      meta: {
        title: 'GoQGo - 聊天室',
        requiresAuth: true
      },
      children: [
        {
          path: '',
          name: 'chat',
          component: ChatView
        }
      ]
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: BaseLayout,
      meta: {
        title: 'GoQGo - 系统看板',
        requiresAuth: true
      },
      children: [
        {
          path: '',
          name: 'dashboard-content',
          component: DashboardView,
          meta: {
            title: '系统看板'
          }
        }
      ]
    },
    {
      path: '/agents',
      name: 'agents',
      component: BaseLayout,
      meta: {
        title: '智能体管理',
        requiresAuth: true
      },
      children: [
        {
          path: '',
          name: 'agents-content',
          component: AgentsView
        }
      ]
    },
    {
      path: '/roles',
      name: 'roles',
      component: BaseLayout,
      meta: {
        title: '角色管理',
        requiresAuth: true
      },
      children: [
        {
          path: '',
          name: 'roles-content',
          component: RolesView
        }
      ]
    },
    {
      path: '/settings',
      name: 'settings',
      component: BaseLayout,
      meta: {
        title: '系统设置',
        requiresAuth: true
      },
      children: [
        {
          path: '',
          name: 'settings-content',
          component: SettingsView
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()

  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title as string
  }

  // 如果是首次访问，尝试恢复登录状态
  if (!userStore.isAuthenticated) {
    try {
      const restored = await userStore.restoreAuth()
      // 如果恢复失败，确保清除状态
      if (!restored) {
        userStore.clearAuth()
      }
    } catch (error) {
      console.error('恢复登录状态失败:', error)
      userStore.clearAuth()
    }
  }

  const isAuthenticated = userStore.isAuthenticated
  const requiresAuth = to.meta.requiresAuth !== false // 默认需要认证
  const hideForAuth = to.meta.hideForAuth === true // 已登录用户隐藏

  console.log('🛡️ 路由守卫:', {
    to: to.path,
    isAuthenticated,
    requiresAuth,
    hideForAuth
  })

  if (requiresAuth && !isAuthenticated) {
    // 需要认证但未登录，跳转到登录页
    console.log('🔒 未登录，跳转到登录页')
    next('/login')
  } else if (hideForAuth && isAuthenticated) {
    // 已登录用户访问登录页，跳转到首页
    console.log('✅ 已登录，跳转到首页')
    next('/')
  } else {
    // 允许访问
    next()
  }
})

export default router
