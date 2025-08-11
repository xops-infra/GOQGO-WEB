import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import BaseLayout from '@/components/BaseLayout.vue'

import LoginView from '@/views/LoginView.vue'
import ChatView from '@/views/ChatView.vue'
import AgentsView from '@/views/AgentsView.vue'
import DashboardView from '@/views/DashboardView.vue'
import RolesView from '@/views/RolesView.vue'
import SettingsView from '@/views/SettingsView.vue'
import TerminalDemo from '@/views/TerminalDemo.vue'
import TextColorTest from '@/views/TextColorTest.vue'
import MessageConfirmDebug from '@/views/MessageConfirmDebug.vue'
import MessageTimeoutTest from '@/views/MessageTimeoutTest.vue'
import DividerTest from '@/views/DividerTest.vue'
import EmptyMessageTest from '@/views/EmptyMessageTest.vue'
import LoginStatusTest from '@/views/LoginStatusTest.vue'
import LoginErrorTest from '@/views/LoginErrorTest.vue'
import ApiAuthTest from '@/views/ApiAuthTest.vue'
import AuthTest from '@/views/AuthTest.vue'
import MarkdownTest from '@/views/MarkdownTest.vue'
import MentionTest from '@/views/MentionTest.vue'
import ThinkingTest from '@/views/ThinkingTest.vue'
import LogsTest from '@/views/LogsTest.vue'
import ShortcutTest from '@/views/ShortcutTest.vue'
import IconTest from '@/views/IconTest.vue'

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
      path: '/terminal-demo',
      name: 'terminal-demo',
      component: TerminalDemo,
      meta: {
        title: 'Terminal风格演示',
        requiresAuth: false
      }
    },
    {
      path: '/text-color-test',
      name: 'text-color-test',
      component: TextColorTest,
      meta: {
        title: '文字颜色测试',
        requiresAuth: false
      }
    },
    {
      path: '/test/auth',
      name: 'auth-test',
      component: AuthTest,
      meta: {
        title: '认证系统测试',
        requiresAuth: true
      }
    },
    {
      path: '/test/message-confirm-debug',
      name: 'message-confirm-debug',
      component: MessageConfirmDebug,
      meta: {
        title: '消息确认调试',
        requiresAuth: true
      }
    },
    {
      path: '/test/message-timeout',
      name: 'message-timeout-test',
      component: MessageTimeoutTest,
      meta: {
        title: '消息超时测试',
        requiresAuth: true
      }
    },
    {
      path: '/test/divider',
      name: 'divider-test',
      component: DividerTest,
      meta: {
        title: '分割线测试',
        requiresAuth: true
      }
    },
    {
      path: '/test/empty-message',
      name: 'empty-message-test',
      component: EmptyMessageTest,
      meta: {
        title: '空消息状态测试',
        requiresAuth: true
      }
    },
    {
      path: '/test/login-status',
      name: 'login-status-test',
      component: LoginStatusTest,
      meta: {
        title: '登录状态测试',
        requiresAuth: true
      }
    },
    {
      path: '/test/login-error',
      name: 'login-error-test',
      component: LoginErrorTest,
      meta: {
        title: '登录错误测试',
        requiresAuth: false // 允许未登录访问，用于测试登录错误
      }
    },
    {
      path: '/test/api-auth',
      name: 'api-auth-test',
      component: ApiAuthTest,
      meta: {
        title: 'API认证测试',
        requiresAuth: true
      }
    },
    {
      path: '/test/mention',
      name: 'mention-test',
      component: MentionTest,
      meta: {
        title: '@ 功能测试',
        requiresAuth: true
      }
    },
    {
      path: '/test/thinking',
      name: 'thinking-test',
      component: ThinkingTest,
      meta: {
        title: '思考消息测试',
        requiresAuth: true
      }
    },
    {
      path: '/test/logs',
      name: 'logs-test',
      component: LogsTest,
      meta: {
        title: '日志功能测试',
        requiresAuth: true
      }
    },
    {
      path: '/test/markdown',
      name: 'markdown-test',
      component: MarkdownTest,
      meta: {
        title: 'Markdown 渲染测试',
        requiresAuth: false
      }
    },
    {
      path: '/shortcut-test',
      name: 'shortcut-test',
      component: ShortcutTest,
      meta: {
        title: '快捷键测试',
        requiresAuth: true
      }
    },
    {
      path: '/icon-test',
      name: 'icon-test',
      component: IconTest,
      meta: {
        title: '图标测试',
        requiresAuth: false
      }
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
    const restored = userStore.restoreAuth()
    // 如果恢复失败，确保清除状态
    if (!restored) {
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
