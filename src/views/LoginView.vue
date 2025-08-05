<template>
  <div class="login-container">
    <!-- 左侧品牌展示区域 -->
    <LoginBrandSection />

    <!-- 右侧登录表单区域 -->
    <LoginFormSection
      :loading="loading"
      :error="error"
      @login="handleLogin"
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
  clearError
} = useLogin()

// 方法
const handleLogin = async (credentials: { username: string; password: string }) => {
  try {
    const user = await performLogin(credentials)
    
    // 登录成功，跳转到主页
    message.success(`欢迎回来，${user.username}！`)
    router.push('/')
  } catch (loginError: any) {
    console.error('登录失败:', loginError)
    // 错误已在useLogin中处理
  }
}

// 生命周期
onMounted(() => {
  // 如果已经登录，直接跳转
  if (userStore.isLoggedIn) {
    router.push('/')
  }
})
</script>

<style scoped lang="scss">
.login-container {
  min-height: 100vh;
  display: flex;
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
