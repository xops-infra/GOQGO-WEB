import { createRouter, createWebHistory } from 'vue-router'
import TestView from '@/views/TestView.vue'
import Layout from '@/components/Layout.vue'
import ChatView from '@/views/ChatView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: TestView,
      meta: { title: 'GoQGo Web 测试' }
    },
    {
      path: '/layout',
      name: 'layout',
      component: Layout,
      meta: { title: 'Q Chat Manager' }
    },
    {
      path: '/chat',
      name: 'chat',
      component: ChatView,
      meta: { title: '聊天室' }
    }
  ]
})

export default router
