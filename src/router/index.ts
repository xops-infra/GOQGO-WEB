import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import Layout from '@/components/Layout.vue'
import AppLayout from '@/components/AppLayout.vue'
import LoginView from '@/views/LoginView.vue'
import ChatView from '@/views/ChatView.vue'
import AgentsView from '@/views/AgentsView.vue'
import RolesView from '@/views/RolesView.vue'
import TerminalDemo from '@/views/TerminalDemo.vue'

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
      path: '/',
      name: 'home',
      component: Layout,
      meta: {
        title: 'Q Chat Manager',
        requiresAuth: true
      }
    },
    {
      path: '/app',
      name: 'app',
      component: AppLayout,
      meta: {
        title: 'GoQGo App',
        requiresAuth: true
      }
    },
    {
      path: '/chat',
      name: 'chat',
      component: ChatView,
      meta: {
        title: '聊天 - GoQGo',
        requiresAuth: true
      }
    },
    {
      path: '/agents',
      name: 'agents',
      component: AgentsView,
      meta: {
        title: 'Agent管理 - GoQGo',
        requiresAuth: true
      }
    },
    {
      path: '/roles',
      name: 'roles',
      component: RolesView,
      meta: {
        title: '角色管理 - GoQGo',
        requiresAuth: true
      }
    },
    {
      path: '/terminal-demo',
      name: 'terminal-demo',
      component: TerminalDemo,
      meta: {
        title: 'Terminal演示 - GoQGo',
        requiresAuth: true
      }
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
  
  // 检查认证状态
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login')
    return
  }
  
  // 已登录用户访问登录页面时重定向到首页
  if (to.meta.hideForAuth && userStore.isLoggedIn) {
    next('/')
    return
  }
  
  next()
})

export default router
