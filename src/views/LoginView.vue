<template>
  <div class="login-container">
    <!-- 左侧品牌展示区域 -->
    <LoginBrandSection />

    <!-- 右侧登录表单区域 -->
    <LoginFormSection
      :loading="loading"
      :error="error"
      @login="handleLogin"
      @token-login="handleTokenLogin"
      @clear-error="clearError"
    />

    <!-- 背景装饰 -->
    <LoginBackground />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { useUserStore } from '@/stores/user'
import { useLogin } from '@/composables/useLogin'
import LoginBrandSection from './login/LoginBrandSection.vue'
import LoginFormSection from './login/LoginFormSection.vue'
import LoginBackground from './login/LoginBackground.vue'

const router = useRouter()
const message = useMessage()
const userStore = useUserStore()

// 使用登录组合式函数
const {
  loading,
  error,
  handleLogin: performLogin,
  handleTokenLogin: performTokenLogin,
  clearError,
  autoLogin
} = useLogin()

// 方法
const handleLogin = async (credentials: { username: string; password: string }) => {
  try {
    const user = await performLogin(credentials)
    
    // 登录成功，跳转到主页
    message.success(`欢迎回来，${user.displayName || user.username}！`)
    router.push('/')
  } catch (loginError: any) {
    console.error('登录失败:', loginError)
    // 错误已经在useLogin中处理，这里不需要额外处理
  }
}

const handleTokenLogin = async (token: string) => {
  try {
    const user = await performTokenLogin(token)
    
    // 登录成功，跳转到主页
    message.success(`Token登录成功，欢迎 ${user.displayName || user.username}！`)
    router.push('/')
  } catch (loginError: any) {
    console.error('Token登录失败:', loginError)
    // 错误已经在useLogin中处理，这里不需要额外处理
  }
}

// 组件挂载时尝试自动登录
onMounted(async () => {
  // 如果用户已经登录，直接跳转到主页
  if (userStore.isLoggedIn) {
    router.push('/')
    return
  }

  // 检查URL参数中的消息
  const urlParams = new URLSearchParams(window.location.search)
  const messageParam = urlParams.get('message')
  if (messageParam) {
    if (messageParam.includes('登出') || messageParam.includes('退出')) {
      message.success(messageParam)
    } else {
      message.info(messageParam)
    }
  }

  // 尝试自动登录
  try {
    const success = await autoLogin()
    if (success) {
      message.success('自动登录成功')
      router.push('/')
    }
  } catch (error) {
    console.log('自动登录失败:', error)
    // 自动登录失败是正常的，不需要显示错误信息
  }
})
</script>

<style scoped lang="scss">
.login-container {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

// 响应式设计
@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }
}
</style>
