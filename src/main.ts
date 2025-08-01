import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import { useUserStore } from '@/stores/user'

// Naive UI
import naive from 'naive-ui'

// 导入全局样式
import '@/styles/index.scss'

// 创建应用实例
const app = createApp(App)

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
