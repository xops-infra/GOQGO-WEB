import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import Layout from '@/components/Layout.vue'
import LoginView from '@/views/LoginView.vue'
import ChatView from '@/views/ChatView.vue'
import DebugView from '@/views/DebugView.vue'
import MessageParserTest from '@/views/MessageParserTest.vue'
import ChatTest from '@/views/ChatTest.vue'
import WebSocketDebug from '@/views/WebSocketDebug.vue'
import MessageConfirmTest from '@/views/MessageConfirmTest.vue'
import MessageConfirmDebug from '@/views/MessageConfirmDebug.vue'
import MessageTimeoutTest from '@/views/MessageTimeoutTest.vue'
import DividerTest from '@/views/DividerTest.vue'
import EmptyMessageTest from '@/views/EmptyMessageTest.vue'
import LoginStatusTest from '@/views/LoginStatusTest.vue'
import LoginErrorTest from '@/views/LoginErrorTest.vue'
import ApiAuthTest from '@/views/ApiAuthTest.vue'

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
      path: '/chat',
      name: 'chat',
      component: ChatView,
      meta: { 
        title: '聊天室',
        requiresAuth: true
      }
    },
    {
      path: '/debug',
      name: 'debug',
      component: DebugView,
      meta: { 
        title: 'WebSocket调试',
        requiresAuth: true
      }
    },
    {
      path: '/test/message-parser',
      name: 'message-parser-test',
      component: MessageParserTest,
      meta: { 
        title: '消息解析测试',
        requiresAuth: true
      }
    },
    {
      path: '/test/chat',
      name: 'chat-test',
      component: ChatTest,
      meta: { 
        title: '聊天功能测试',
        requiresAuth: true
      }
    },
    {
      path: '/test/websocket',
      name: 'websocket-debug',
      component: WebSocketDebug,
      meta: { 
        title: 'WebSocket调试',
        requiresAuth: true
      }
    },
    {
      path: '/test/message-confirm',
      name: 'message-confirm-test',
      component: MessageConfirmTest,
      meta: { 
        title: '消息确认测试',
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
    userStore.restoreAuth()
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
