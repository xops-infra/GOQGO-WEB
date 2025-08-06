import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import { useUserStore } from '@/stores/user'

// Naive UI
import naive from 'naive-ui'

// 导入全局样式
import '@/styles/index.scss'
import '@/assets/styles/highlight.scss'

// 导入全局错误处理器
import { errorHandler } from '@/utils/errorHandler'

// 初始化Mock服务（仅在Mock模式启用时）
import { isMockMode } from './mock/config'
if (isMockMode()) {
  import('./mock').then(({ initMock }) => {
    initMock()
  })
}

// 导入API测试工具（开发环境）
if (import.meta.env.DEV) {
  import('./utils/login-test')
  import('./utils/mock-test')
  import('./utils/auth-test')
  import('./utils/logout-test')
  import('./utils/sendMessage-test')
  import('./utils/userInfo-debug')
  import('./utils/fix-user-display')
  import('./utils/api-path-test')
  import('./utils/token-header-test')
}

// 创建应用实例
const app = createApp(App)

// 设置全局错误处理器
app.config.errorHandler = errorHandler.getVueErrorHandler()

// 创建Pinia实例
const pinia = createPinia()

// 使用插件
app.use(pinia)
app.use(router)
app.use(naive)

// 初始化用户store（在路由守卫之前）
const userStore = useUserStore()
console.log('🚀 初始化用户store')

// 挂载应用
app.mount('#app')
