import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import Layout from '@/components/Layout.vue'
import AppLayout from '@/components/AppLayout.vue'
import LoginView from '@/views/LoginView.vue'
import ChatView from '@/views/ChatView.vue'
import AgentsView from '@/views/AgentsView.vue'
import RolesView from '@/views/RolesView.vue'
import MarketView from '@/views/MarketView.vue'
import DashboardView from '@/views/DashboardView.vue'
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
      path: '/logout',
      name: 'logout',
      beforeEnter: (to, from, next) => {
        // 在进入logout路由时执行登出逻辑
        import('@/utils/auth').then(({ authManager }) => {
          console.log('🚪 执行登出操作...')
          authManager.logout()
          // 跳转到登录页
          next('/login?message=已成功登出')
        })
      },
      meta: {
        title: '登出 - GoQGo',
        requiresAuth: false
      }
    },
    {
      path: '/',
      component: Layout,
      meta: {
        requiresAuth: true
      },
      children: [
        {
          path: '',
          name: 'home',
          component: ChatView,
          meta: {
            title: 'Q Chat Manager',
            requiresAuth: true
          }
        },
        {
          path: 'agents',
          name: 'agents',
          component: AgentsView,
          meta: {
            title: 'Agent管理 - GoQGo',
            requiresAuth: true
          }
        },
        {
          path: 'market',
          name: 'market',
          component: MarketView,
          meta: {
            title: 'Agent市场 - GoQGo',
            requiresAuth: true
          }
        },
        {
          path: 'dashboard',
          name: 'dashboard', 
          component: DashboardView,
          meta: {
            title: 'Agents看板 - GoQGo',
            requiresAuth: true
          }
        },
        {
          path: 'roles',
          name: 'roles',
          component: RolesView,
          meta: {
            title: '角色管理 - GoQGo',
            requiresAuth: true
          }
        }
      ]
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
  
  // 如果需要认证，先尝试恢复认证状态
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    console.log('🔒 路由需要认证，检查本地存储...')
    
    // 尝试从本地存储恢复认证状态
    await userStore.restoreAuth()
    
    // 再次检查认证状态
    if (!userStore.isLoggedIn) {
      console.log('🔒 未找到有效认证信息，跳转到登录页')
      next('/login')
      return
    } else {
      console.log('✅ 成功恢复认证状态:', userStore.username)
    }
  }
  
  // 已登录用户访问登录页面时重定向到首页
  if (to.meta.hideForAuth && userStore.isLoggedIn) {
    next('/')
    return
  }
  
  next()
})

export default router
