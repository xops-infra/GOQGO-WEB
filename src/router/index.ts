import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/components/Layout.vue'
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
    },
    {
      path: '/test/message-parser',
      name: 'message-parser-test',
      component: MessageParserTest,
      meta: { title: '消息解析测试' }
    },
    {
      path: '/test/chat',
      name: 'chat-test',
      component: ChatTest,
      meta: { title: '聊天功能测试' }
    },
    {
      path: '/test/websocket',
      name: 'websocket-debug',
      component: WebSocketDebug,
      meta: { title: 'WebSocket调试' }
    },
    {
      path: '/test/message-confirm',
      name: 'message-confirm-test',
      component: MessageConfirmTest,
      meta: { title: '消息确认测试' }
    },
    {
      path: '/test/message-confirm-debug',
      name: 'message-confirm-debug',
      component: MessageConfirmDebug,
      meta: { title: '消息确认调试' }
    },
    {
      path: '/test/message-timeout',
      name: 'message-timeout-test',
      component: MessageTimeoutTest,
      meta: { title: '消息超时测试' }
    },
    {
      path: '/test/divider',
      name: 'divider-test',
      component: DividerTest,
      meta: { title: '分割线测试' }
    },
    {
      path: '/test/empty-message',
      name: 'empty-message-test',
      component: EmptyMessageTest,
      meta: { title: '空消息状态测试' }
    }
  ]
})

export default router
