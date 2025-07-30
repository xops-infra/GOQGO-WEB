import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/components/Layout.vue'
import ChatView from '@/views/ChatView.vue'

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
    }
  ]
})

export default router
