import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/components/Layout.vue'
import ChatView from '@/views/ChatView.vue'
import DebugView from '@/views/DebugView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Layout,
      meta: { title: 'Q Chat Manager' }
    },
    {
      path: '/chat',
      name: 'chat',
      component: ChatView,
      meta: { title: '聊天室' }
    },
    {
      path: '/debug',
      name: 'debug',
      component: DebugView,
      meta: { title: 'WebSocket调试' }
    }
  ]
})

export default router
