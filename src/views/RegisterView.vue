<template>
  <div class="register-container">
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

    <!-- 右侧注册区域 -->
    <div class="register-section">
      <div class="register-content">
        <!-- 注册表单 -->
        <div class="register-form-container">
          <div class="register-header">
            <h2 class="register-title">创建账户</h2>
            <p class="register-subtitle">加入GoQGo开发平台</p>
          </div>

          <!-- 注册表单 -->
          <div class="register-form">
            <n-form ref="registerFormRef" :model="registerForm" :rules="registerRules" size="large">
              <n-form-item path="username" label="用户名">
                <n-input
                  v-model:value="registerForm.username"
                  placeholder="请输入用户名（3-20个字符）"
                  :input-props="{ autocomplete: 'username' }"
                  @keyup.enter="handleRegister"
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

              <n-form-item path="displayName" label="显示名称">
                <n-input
                  v-model:value="registerForm.displayName"
                  placeholder="请输入显示名称"
                  :input-props="{ autocomplete: 'name' }"
                  @keyup.enter="handleRegister"
                >
                  <template #prefix>
                    <n-icon>
                      <svg viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M7.07,18.28C7.5,17.38 10.12,16.5 12,16.5C13.88,16.5 16.5,17.38 16.93,18.28C15.57,19.36 13.86,20 12,20C10.14,20 8.43,19.36 7.07,18.28M18.36,16.83C16.93,15.09 13.46,14.5 12,14.5C10.54,14.5 7.07,15.09 5.64,16.83C4.62,15.5 4,13.82 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,13.82 19.38,15.5 18.36,16.83M12,6C10.06,6 8.5,7.56 8.5,9.5C8.5,11.44 10.06,13 12,13C13.94,13 15.5,11.44 15.5,9.5C15.5,7.56 13.94,6 12,6M12,11A1.5,1.5 0 0,1 10.5,9.5A1.5,1.5 0 0,1 12,8A1.5,1.5 0 0,1 13.5,9.5A1.5,1.5 0 0,1 12,11Z"
                        />
                      </svg>
                    </n-icon>
                  </template>
                </n-input>
              </n-form-item>

              <n-form-item path="email" label="邮箱地址">
                <n-input
                  v-model:value="registerForm.email"
                  placeholder="请输入邮箱地址"
                  :input-props="{ autocomplete: 'email' }"
                  @keyup.enter="handleRegister"
                >
                  <template #prefix>
                    <n-icon>
                      <svg viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z"
                        />
                      </svg>
                    </n-icon>
                  </template>
                </n-input>
              </n-form-item>

              <n-form-item path="password" label="密码">
                <n-input
                  v-model:value="registerForm.password"
                  type="password"
                  placeholder="请输入密码（至少6个字符）"
                  show-password-on="mousedown"
                  :input-props="{ autocomplete: 'new-password' }"
                  @keyup.enter="handleRegister"
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

              <n-form-item path="confirmPassword" label="确认密码">
                <n-input
                  v-model:value="registerForm.confirmPassword"
                  type="password"
                  placeholder="请再次输入密码"
                  show-password-on="mousedown"
                  :input-props="{ autocomplete: 'new-password' }"
                  @keyup.enter="handleRegister"
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
                  @click="handleRegister"
                >
                  {{ isLoading ? '注册中...' : '创建账户' }}
                </n-button>
              </n-form-item>
            </n-form>

            <!-- 登录链接 -->
            <div class="login-link">
              <span>已有账户？</span>
              <n-button text type="primary" @click="goToLogin">
                立即登录
              </n-button>
            </div>
          </div>

          <!-- 注册说明 -->
          <div class="register-help">
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
                注册说明
              </template>
              <ul class="help-list">
                <li>用户名只能包含字母、数字和下划线</li>
                <li>密码长度至少6个字符，建议包含字母和数字</li>
                <li>注册成功后将自动登录到系统</li>
                <li>请使用真实邮箱地址，用于找回密码</li>
              </ul>
            </n-alert>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage, type FormInst, type FormRules } from 'naive-ui'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const message = useMessage()
const userStore = useUserStore()

// 版本信息
const version = ref('v0.1.1')

// 加载状态
const isLoading = ref(false)

// 注册表单
const registerFormRef = ref<FormInst | null>(null)
const registerForm = reactive({
  username: '',
  displayName: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// 表单验证规则
const registerRules: FormRules = {
  username: [
    {
      required: true,
      message: '请输入用户名',
      trigger: ['input', 'blur']
    },
    {
      min: 3,
      max: 20,
      message: '用户名长度应在3-20个字符之间',
      trigger: ['input', 'blur']
    },
    {
      pattern: /^[a-zA-Z0-9_]+$/,
      message: '用户名只能包含字母、数字和下划线',
      trigger: ['input', 'blur']
    }
  ],
  displayName: [
    {
      required: true,
      message: '请输入显示名称',
      trigger: ['input', 'blur']
    },
    {
      min: 2,
      max: 50,
      message: '显示名称长度应在2-50个字符之间',
      trigger: ['input', 'blur']
    }
  ],
  email: [
    {
      required: true,
      message: '请输入邮箱地址',
      trigger: ['input', 'blur']
    },
    {
      type: 'email',
      message: '请输入有效的邮箱地址',
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
  ],
  confirmPassword: [
    {
      required: true,
      message: '请确认密码',
      trigger: ['input', 'blur']
    },
    {
      validator: (rule, value) => {
        if (value !== registerForm.password) {
          return new Error('两次输入的密码不一致')
        }
        return true
      },
      trigger: ['input', 'blur']
    }
  ]
}

// 注册处理
const handleRegister = async () => {
  if (!registerFormRef.value) return

  try {
    await registerFormRef.value.validate()
    isLoading.value = true

    // 调用用户store的注册方法
    await userStore.register({
      username: registerForm.username,
      displayName: registerForm.displayName,
      email: registerForm.email,
      password: registerForm.password
    })

    message.success('注册成功！正在跳转...')

    // 跳转到主页面
    setTimeout(() => {
      router.push('/')
    }, 1000)
  } catch (error: any) {
    console.error('注册失败:', error)

    if (error?.message) {
      message.error(error.message)
    } else if (typeof error === 'string') {
      message.error(error)
    } else {
      message.error('注册失败，请检查输入信息')
    }
  } finally {
    isLoading.value = false
  }
}

// 跳转到登录页面
const goToLogin = () => {
  router.push('/login')
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

.register-container {
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

// 右侧注册区域
.register-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--terminal-bg, #000000);
  padding: 40px;
  overflow: auto;
}

.register-content {
  width: 100%;
  max-width: 420px;
}

.register-form-container {
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

.register-header {
  text-align: center;
  margin-bottom: 30px;

  .register-title {
    font-size: 1.6rem;
    font-weight: 600;
    color: var(--terminal-text, #ffffff);
    margin: 0 0 8px 0;
    font-family: 'Arial', sans-serif;
  }

  .register-subtitle {
    color: var(--terminal-text-secondary, #cccccc);
    margin: 0;
    font-size: 0.9rem;
    font-family: 'Arial', sans-serif;
  }
}

.register-form {
  .login-link {
    text-align: center;
    margin-top: 20px;
    color: var(--terminal-text-secondary, #cccccc);
    font-size: 0.9rem;

    span {
      margin-right: 8px;
    }
  }

  .register-help {
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
    }
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

:deep(.n-button--text-type) {
  --n-text-color: var(--terminal-prompt, #00ff41);
  --n-text-color-hover: var(--terminal-command, #00ffff);
  --n-text-color-pressed: var(--pixel-blue, #0066ff);
}

:deep(.n-alert) {
  --n-border: 1px solid var(--terminal-border, #333333);
  --n-bg-color: var(--terminal-bg-tertiary, #1a1a1a);
  --n-text-color: var(--terminal-text-secondary, #cccccc);
  --n-title-text-color: var(--terminal-text, #ffffff);
  font-family: 'Arial', sans-serif;
}

// 响应式设计
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
  .register-container {
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }

  .brand-section {
    flex: none;
    height: 40vh;
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

  .register-section {
    flex: none;
    height: 60vh;
    padding: 25px;
    overflow: auto;
  }

  .register-form-container {
    padding: 25px;
  }
}

@media (max-width: 640px) {
  .brand-header .brand-title {
    font-size: 2rem;
  }

  .register-form-container {
    padding: 20px;
  }
}
</style>
