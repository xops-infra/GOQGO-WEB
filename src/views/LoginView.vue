<template>
  <div class="login-container">
    <!-- 左侧品牌展示区域 -->
    <div class="brand-section">
      <div class="brand-content">
        <!-- Logo和标题 -->
        <div class="brand-header">
          <h1 class="brand-title">GoQGo</h1>
          <p class="brand-subtitle">AI智能体协助开发平台</p>
        </div>

        <!-- 特性介绍 -->
        <div class="features-list">
          <div class="feature-item">
            <div class="feature-icon">🤖</div>
            <div class="feature-content">
              <h3>多智能体协同</h3>
              <p>支持多个AI智能体同时工作，提升开发效率</p>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon">💬</div>
            <div class="feature-content">
              <h3>实时聊天系统</h3>
              <p>类似微信的群聊功能，团队实时沟通协作</p>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon">📁</div>
            <div class="feature-content">
              <h3>项目管理</h3>
              <p>统一管理多个项目模块，版本控制集成</p>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon">🔄</div>
            <div class="feature-content">
              <h3>实时同步</h3>
              <p>WebSocket连接确保信息实时更新</p>
            </div>
          </div>
        </div>

        <!-- 版本信息 -->
        <div class="version-info">
          <span class="version-text">Version {{ version }}</span>
        </div>
      </div>
    </div>

    <!-- 右侧登录区域 -->
    <div class="login-section">
      <div class="login-content">
        <!-- 登录表单 -->
        <div class="login-form-container">
          <div class="login-header">
            <h2 class="login-title">欢迎回来</h2>
            <p class="login-subtitle">请选择登录方式</p>
          </div>

          <!-- 登录方式切换 -->
          <div class="login-tabs">
            <button
              class="tab-button"
              :class="{ active: loginType === 'token' }"
              @click="loginType = 'token'"
            >
              Token登录
            </button>
            <button
              class="tab-button"
              :class="{ active: loginType === 'password' }"
              @click="loginType = 'password'"
            >
              密码登录
            </button>
            <button
              class="tab-button"
              :class="{ active: loginType === 'ad' }"
              @click="loginType = 'ad'"
              disabled
            >
              AD登录
              <span class="coming-soon">即将支持</span>
            </button>
          </div>

          <!-- Token登录表单 -->
          <div v-if="loginType === 'token'" class="login-form">
            <n-form ref="tokenFormRef" :model="tokenForm" :rules="tokenRules" size="large">
              <n-form-item path="token" label="访问令牌">
                <n-input
                  v-model:value="tokenForm.token"
                  type="password"
                  placeholder="请输入您的访问令牌"
                  show-password-on="mousedown"
                  :input-props="{ autocomplete: 'off' }"
                  @keyup.enter="handleTokenLogin"
                >
                  <template #prefix>
                    <n-icon>
                      <svg viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M7,14A2,2 0 0,1 5,12A2,2 0 0,1 7,10A2,2 0 0,1 9,12A2,2 0 0,1 7,14M12.65,10C11.83,7.67 9.61,6 7,6A6,6 0 0,0 1,12A6,6 0 0,0 7,18C9.61,18 11.83,16.33 12.65,14H17V18H21V14H23V10H12.65Z"
                        />
                      </svg>
                    </n-icon>
                  </template>
                </n-input>
              </n-form-item>

              <n-form-item>
                <n-button
                  type="primary"
                  size="large"
                  block
                  :loading="isLoading"
                  @click="handleTokenLogin"
                >
                  {{ isLoading ? '登录中...' : '登录' }}
                </n-button>
              </n-form-item>
            </n-form>

            <!-- Token说明 -->
            <div class="token-help">
              <n-alert type="info" :show-icon="false">
                <template #header>
                  <n-icon style="margin-right: 8px">
                    <svg viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"
                      />
                    </svg>
                  </n-icon>
                  Token登录说明
                </template>
                <ul class="help-list">
                  <li>使用预设的Token进行登录（类似AKSK认证）</li>
                  <li>登录成功后会获得临时token，有效期3天</li>
                  <li>示例Token: <code>my-simple-api-token-2025</code></li>
                  <li>请联系管理员获取您的专用Token</li>
                </ul>
              </n-alert>
            </div>
          </div>

          <!-- 密码登录表单 -->
          <div v-if="loginType === 'password'" class="login-form">
            <n-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" size="large">
              <n-form-item path="username" label="用户名">
                <n-input
                  v-model:value="passwordForm.username"
                  placeholder="请输入用户名"
                  :input-props="{ autocomplete: 'username' }"
                  @keyup.enter="handlePasswordLogin"
                >
                  <template #prefix>
                    <n-icon>
                      <svg viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"
                        />
                      </svg>
                    </n-icon>
                  </template>
                </n-input>
              </n-form-item>

              <n-form-item path="password" label="密码">
                <n-input
                  v-model:value="passwordForm.password"
                  type="password"
                  placeholder="请输入密码"
                  show-password-on="mousedown"
                  :input-props="{ autocomplete: 'current-password' }"
                  @keyup.enter="handlePasswordLogin"
                >
                  <template #prefix>
                    <n-icon>
                      <svg viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"
                        />
                      </svg>
                    </n-icon>
                  </template>
                </n-input>
              </n-form-item>

              <n-form-item>
                <n-button
                  type="primary"
                  size="large"
                  block
                  :loading="isLoading"
                  @click="handlePasswordLogin"
                >
                  {{ isLoading ? '登录中...' : '登录' }}
                </n-button>
              </n-form-item>
            </n-form>
          </div>

          <!-- AD登录表单（预留） -->
          <div v-if="loginType === 'ad'" class="login-form">
            <div class="coming-soon-content">
              <n-icon size="48" :color="'var(--text-disabled)'">
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C15.4,11.5 16,12.4 16,13V16C16,17.4 15.4,18 14.8,18H9.2C8.6,18 8,17.4 8,16V13C8,12.4 8.6,11.5 9.2,11.5V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,10V11.5H13.5V10C13.5,8.7 12.8,8.2 12,8.2Z"
                  />
                </svg>
              </n-icon>
              <h3>AD登录功能开发中</h3>
              <p>Active Directory集成登录功能即将上线，敬请期待！</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMessage, type FormInst, type FormRules } from 'naive-ui'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const message = useMessage()
const userStore = useUserStore()

// 获取重定向路径
const getRedirectPath = () => {
  const redirect = route.query.redirect as string
  return redirect && redirect !== '/login' ? decodeURIComponent(redirect) : '/'
}

// 版本信息
const version = ref('v0.1.1')

// 登录类型
const loginType = ref<'token' | 'password' | 'ad'>('token')

// 加载状态
const isLoading = ref(false)

// Token登录表单
const tokenFormRef = ref<FormInst | null>(null)
const tokenForm = reactive({
  token: 'my-simple-api-token-2025'
})

// 密码登录表单
const passwordFormRef = ref<FormInst | null>(null)
const passwordForm = reactive({
  username: '',
  password: ''
})

// 表单验证规则
const tokenRules: FormRules = {
  token: [
    {
      required: true,
      message: '请输入访问令牌',
      trigger: ['input', 'blur']
    },
    {
      min: 10,
      message: '令牌长度至少10个字符',
      trigger: ['input', 'blur']
    }
  ]
}

const passwordRules: FormRules = {
  username: [
    {
      required: true,
      message: '请输入用户名',
      trigger: ['input', 'blur']
    }
  ],
  password: [
    {
      required: true,
      message: '请输入密码',
      trigger: ['input', 'blur']
    },
    {
      min: 6,
      message: '密码长度至少6个字符',
      trigger: ['input', 'blur']
    }
  ]
}

// Token登录处理
const handleTokenLogin = async () => {
  if (!tokenFormRef.value) return

  try {
    await tokenFormRef.value.validate()
    isLoading.value = true

    // 调用用户store的token登录方法
    await userStore.loginWithToken(tokenForm.token)

    message.success('登录成功！')

    // 跳转到重定向页面或主页面
    const redirectPath = getRedirectPath()
    router.push(redirectPath)
  } catch (error: any) {
    console.error('Token登录失败:', error)

    if (error?.message) {
      message.error(error.message)
    } else if (typeof error === 'string') {
      message.error(error)
    } else {
      message.error('登录失败，请检查令牌是否正确')
    }
  } finally {
    isLoading.value = false
  }
}

// 密码登录处理
const handlePasswordLogin = async () => {
  if (!passwordFormRef.value) return

  try {
    await passwordFormRef.value.validate()
    isLoading.value = true

    // 调用用户store的密码登录方法
    await userStore.loginWithPassword(passwordForm.username, passwordForm.password)

    message.success('登录成功！')

    // 跳转到重定向页面或主页面
    const redirectPath = getRedirectPath()
    router.push(redirectPath)
  } catch (error: any) {
    console.error('密码登录失败:', error)

    if (error?.message) {
      message.error(error.message)
    } else if (typeof error === 'string') {
      message.error(error)
    } else {
      message.error('登录失败，请检查用户名和密码')
    }
  } finally {
    isLoading.value = false
  }
}

// 获取版本信息
onMounted(async () => {
  try {
    const response = await fetch('/version.json')
    const versionData = await response.json()
    version.value = versionData.version || 'v0.1.1'
  } catch (error) {
    console.warn('获取版本信息失败:', error)
  }
})
</script>

<style scoped lang="scss">
// 重置和基础样式
* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}

.login-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  background: var(--terminal-bg, #000000);
  font-family: 'Arial', 'Helvetica', sans-serif;
  overflow: hidden;
}

// 左侧品牌区域
.brand-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--terminal-bg-secondary, #0a0a0a);
  border-right: 2px solid var(--terminal-border-active, #00ff41);
  padding: 40px;
  position: relative;
  overflow: hidden;
}

.brand-content {
  max-width: 500px;
  color: var(--terminal-text, #ffffff);
  text-align: center;
}

.brand-header {
  margin-bottom: 50px;

  .logo-container {
    margin-bottom: 20px;

    .brand-logo-text {
      font-size: 4rem;
      font-weight: 700;
      color: var(--terminal-prompt, #00ff41);
      text-shadow: 0 0 10px #00ff41, 0 0 20px #00ff41, 0 0 30px #00ff41;
      font-family: 'Orbitron', 'Arial', sans-serif;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
  }

  .brand-title {
    font-size: 3.5rem;
    font-weight: 700;
    margin: 0 0 16px 0;
    color: var(--terminal-prompt, #00ff41);
    text-shadow: 0 0 10px #00ff41, 0 0 20px #00ff41, 0 0 30px #00ff41;
    font-family: 'Orbitron', 'Arial', sans-serif;
    text-transform: uppercase;
    letter-spacing: 2px;
  }

  .brand-subtitle {
    font-size: 1.1rem;
    color: var(--terminal-text-secondary, #cccccc);
    margin: 0;
    font-weight: 400;
    line-height: 1.4;
  }
}

.features-list {
  display: grid;
  gap: 20px;
  margin-bottom: 40px;

  .feature-item {
    display: flex;
    align-items: flex-start;
    gap: 15px;
    padding: 18px;
    background: var(--terminal-bg-tertiary, #1a1a1a);
    border: 2px solid var(--terminal-border, #333333);
    transition: all 0.3s ease;

    &:hover {
      border-color: var(--terminal-border-active, #00ff41);
      transform: translateY(-2px);
    }

    .feature-icon {
      font-size: 1.8rem;
      flex-shrink: 0;
    }

    .feature-content {
      text-align: left;

      h3 {
        margin: 0 0 8px 0;
        font-size: 1rem;
        font-weight: 600;
        color: var(--terminal-text, #ffffff);
        font-family: 'Arial', sans-serif;
      }

      p {
        margin: 0;
        color: var(--terminal-text-secondary, #cccccc);
        font-size: 0.9rem;
        line-height: 1.4;
        font-family: 'Arial', sans-serif;
      }
    }
  }
}

.version-info {
  .version-text {
    padding: 8px 16px;
    background: var(--terminal-bg-tertiary, #1a1a1a);
    border: 1px solid var(--terminal-border, #333333);
    color: var(--terminal-text-secondary, #cccccc);
    font-size: 0.85rem;
    font-family: 'Arial', sans-serif;
  }
}

// 右侧登录区域
.login-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--terminal-bg, #000000);
  padding: 40px;
  overflow: hidden;
}

.login-content {
  width: 100%;
  max-width: 380px;
}

.login-form-container {
  background: var(--terminal-bg-secondary, #0a0a0a);
  border: 2px solid var(--terminal-border-active, #00ff41);
  padding: 35px;
  position: relative;
  box-shadow: 0 0 20px rgba(0, 255, 65, 0.3);

  &::before {
    content: '';
    position: absolute;
    top: 4px;
    left: 4px;
    right: -4px;
    bottom: -4px;
    background: var(--terminal-surface, #2a2a2a);
    z-index: -1;
    border: 1px solid var(--terminal-border, #333333);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 30px;

  .login-title {
    font-size: 1.6rem;
    font-weight: 600;
    color: var(--terminal-text, #ffffff);
    margin: 0 0 8px 0;
    font-family: 'Arial', sans-serif;
  }

  .login-subtitle {
    color: var(--terminal-text-secondary, #cccccc);
    margin: 0;
    font-size: 0.9rem;
    font-family: 'Arial', sans-serif;
  }
}

.login-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 25px;
  padding: 3px;
  background: var(--terminal-bg-tertiary, #1a1a1a);
  border: 1px solid var(--terminal-border, #333333);

  .tab-button {
    flex: 1;
    padding: 10px 14px;
    border: none;
    background: transparent;
    color: var(--terminal-text-secondary, #cccccc);
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.85rem;
    font-weight: 500;
    font-family: 'Arial', sans-serif;

    &:hover:not(:disabled) {
      background: var(--terminal-surface, #2a2a2a);
      color: var(--terminal-text, #ffffff);
    }

    &.active {
      background: var(--terminal-prompt, #00ff41);
      color: var(--terminal-bg, #000000);
      font-weight: 600;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      color: var(--terminal-text-muted, #666666);
    }

    .coming-soon {
      display: block;
      font-size: 0.7rem;
      opacity: 0.7;
      margin-top: 2px;
    }
  }
}

.login-form {
  .token-help {
    margin-top: 20px;

    .help-list {
      margin: 8px 0 0 0;
      padding-left: 16px;

      li {
        margin-bottom: 4px;
        font-size: 0.8rem;
        line-height: 1.4;
        color: var(--terminal-text-secondary, #cccccc);
        font-family: 'Arial', sans-serif;

        &:last-child {
          margin-bottom: 0;
        }
      }

      code {
        background: var(--terminal-bg-tertiary, #1a1a1a);
        padding: 2px 6px;
        border: 1px solid var(--terminal-border, #333333);
        color: var(--terminal-prompt, #00ff41);
        font-family: 'Courier New', monospace;
        font-size: 0.75rem;
      }
    }
  }
}

.coming-soon-content {
  text-align: center;
  padding: 30px 20px;
  color: var(--terminal-text-tertiary, #999999);

  h3 {
    margin: 16px 0 8px 0;
    color: var(--terminal-text-secondary, #cccccc);
    font-family: 'Arial', sans-serif;
  }

  p {
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.5;
    font-family: 'Arial', sans-serif;
  }
}

// Terminal主题模式适配
:deep(.n-form-item-label) {
  color: var(--terminal-text, #ffffff);
  font-weight: 500;
  font-family: 'Arial', sans-serif;
}

:deep(.n-input) {
  --n-border: 1px solid var(--terminal-border, #333333);
  --n-border-hover: 1px solid var(--terminal-border-active, #00ff41);
  --n-border-focus: 1px solid var(--terminal-border-active, #00ff41);
  --n-color: var(--terminal-text, #ffffff);
  --n-color-focus: var(--terminal-text, #ffffff);
  --n-placeholder-color: var(--terminal-text-muted, #666666);
  --n-bg-color: var(--terminal-bg-tertiary, #1a1a1a);
  --n-bg-color-hover: var(--terminal-surface, #2a2a2a);
  --n-bg-color-focus: var(--terminal-surface, #2a2a2a);
}

:deep(.n-button--primary-type) {
  --n-color: var(--terminal-prompt, #00ff41);
  --n-color-hover: var(--terminal-command, #00ffff);
  --n-color-pressed: var(--pixel-blue, #0066ff);
  --n-border: 1px solid var(--terminal-border-active, #00ff41);
  --n-font-weight: 600;
  --n-text-color: var(--terminal-bg, #000000);
  --n-text-color-hover: var(--terminal-bg, #000000);
  --n-text-color-pressed: var(--terminal-bg, #000000);
  font-family: 'Arial', sans-serif;
}

:deep(.n-alert) {
  --n-border: 1px solid var(--terminal-border, #333333);
  --n-bg-color: var(--terminal-bg-tertiary, #1a1a1a);
  --n-text-color: var(--terminal-text-secondary, #cccccc);
  --n-title-text-color: var(--terminal-text, #ffffff);
  font-family: 'Arial', sans-serif;
}

// 响应式设计 - 确保在不同屏幕尺寸下都能正常显示
@media (max-width: 1200px) {
  .brand-header .brand-title {
    font-size: 3rem;
  }
  
  .features-list {
    gap: 15px;
    
    .feature-item {
      padding: 15px;
      
      .feature-icon {
        font-size: 1.5rem;
      }
    }
  }
}

@media (max-width: 1024px) {
  .login-container {
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }

  .brand-section {
    flex: none;
    height: 45vh;
    border-right: none;
    border-bottom: 2px solid var(--terminal-border-active, #00ff41);
    padding: 25px;

    .brand-header .brand-title {
      font-size: 2.5rem;
    }

    .features-list {
      display: none;
    }
  }

  .login-section {
    flex: none;
    height: 55vh;
    padding: 25px;
    overflow: hidden;
  }

  .login-form-container {
    padding: 25px;
  }
}

@media (max-width: 640px) {
  .brand-header .brand-title {
    font-size: 2rem;
  }

  .login-form-container {
    padding: 20px;
  }
  
  .login-tabs .tab-button {
    padding: 8px 10px;
    font-size: 0.8rem;
  }
}
</style>
