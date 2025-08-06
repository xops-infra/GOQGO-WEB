<template>
  <div class="form-section">
    <!-- Mock登录提示 -->
    <MockLoginTip @fill-credentials="handleFillCredentials" />
    
    <div class="form-container">
      <div class="form-header">
        <h2>欢迎登录</h2>
        <p>请输入您的账户信息</p>
      </div>

      <!-- 登录方式切换 -->
      <div class="login-mode-tabs">
        <n-tabs v-model:value="loginMode" type="segment" size="small">
          <n-tab-pane name="password" tab="密码登录">
            <!-- 密码登录表单 -->
            <div class="login-form">
              <!-- 错误提示 -->
              <div v-if="error" class="error-alert">
                <n-alert type="error" :show-icon="false">
                  {{ error }}
                  <template #action>
                    <n-button text size="small" @click="$emit('clear-error')">
                      <n-icon>
                        <CloseIcon />
                      </n-icon>
                    </n-button>
                  </template>
                </n-alert>
              </div>

              <!-- 密码登录表单 -->
              <n-form
                ref="passwordFormRef"
                :model="passwordFormData"
                :rules="passwordFormRules"
                @submit.prevent="handlePasswordSubmit"
              >
                <n-form-item path="username" label="用户名">
                  <n-input
                    v-model:value="passwordFormData.username"
                    placeholder="请输入用户名"
                    size="large"
                    :disabled="loading"
                    @keydown.enter="handlePasswordSubmit"
                  >
                    <template #prefix>
                      <n-icon>
                        <UserIcon />
                      </n-icon>
                    </template>
                  </n-input>
                </n-form-item>

                <n-form-item path="password" label="密码">
                  <n-input
                    v-model:value="passwordFormData.password"
                    type="password"
                    placeholder="请输入密码"
                    size="large"
                    :disabled="loading"
                    show-password-on="mousedown"
                    @keydown.enter="handlePasswordSubmit"
                  >
                    <template #prefix>
                      <n-icon>
                        <LockIcon />
                      </n-icon>
                    </template>
                  </n-input>
                </n-form-item>

                <n-form-item>
                  <n-button
                    type="primary"
                    size="large"
                    :loading="loading"
                    :disabled="!canPasswordSubmit"
                    @click="handlePasswordSubmit"
                    block
                  >
                    {{ loading ? '登录中...' : '登录' }}
                  </n-button>
                </n-form-item>
              </n-form>
            </div>
          </n-tab-pane>

          <n-tab-pane name="token" tab="Token登录">
            <!-- Token登录表单 -->
            <div class="login-form">
              <!-- 错误提示 -->
              <div v-if="error" class="error-alert">
                <n-alert type="error" :show-icon="false">
                  {{ error }}
                  <template #action>
                    <n-button text size="small" @click="$emit('clear-error')">
                      <n-icon>
                        <CloseIcon />
                      </n-icon>
                    </n-button>
                  </template>
                </n-alert>
              </div>

              <!-- Token登录表单 -->
              <n-form
                ref="tokenFormRef"
                :model="tokenFormData"
                :rules="tokenFormRules"
                @submit.prevent="handleTokenSubmit"
              >
                <n-form-item path="token" label="访问Token">
                  <n-input
                    v-model:value="tokenFormData.token"
                    type="password"
                    placeholder="请输入您的访问Token"
                    size="large"
                    :disabled="loading"
                    show-password-on="mousedown"
                    @keydown.enter="handleTokenSubmit"
                  >
                    <template #prefix>
                      <n-icon>
                        <KeyIcon />
                      </n-icon>
                    </template>
                  </n-input>
                </n-form-item>

                <n-form-item>
                  <n-button
                    type="primary"
                    size="large"
                    :loading="loading"
                    :disabled="!canTokenSubmit"
                    @click="handleTokenSubmit"
                    block
                  >
                    {{ loading ? '登录中...' : '使用Token登录' }}
                  </n-button>
                </n-form-item>
              </n-form>

              <!-- Token登录说明 -->
              <div class="token-help">
                <n-alert type="info" :show-icon="false">
                  <template #header>
                    <span>Token登录说明</span>
                  </template>
                  使用您预设的访问Token进行登录，无需输入用户名和密码。
                </n-alert>
              </div>
            </div>
          </n-tab-pane>
        </n-tabs>
      </div>

      <!-- 其他登录选项 -->
      <div class="form-footer">
        <div class="divider">
          <span>或</span>
        </div>
        
        <!-- Mock模式下显示快速登录按钮 -->
        <div v-if="isMockMode()" class="mock-login-buttons">
          <n-button 
            text 
            size="small" 
            class="demo-login" 
            @click="handleAdminLogin"
            :loading="loading"
          >
            🔑 管理员登录 (admin)
          </n-button>
          
          <n-button 
            text 
            size="small" 
            class="demo-login" 
            @click="handleDemoLogin"
            :loading="loading"
          >
            👤 演示账户登录 (demo)
          </n-button>
        </div>
        
        <!-- 非Mock模式下的演示登录 -->
        <n-button 
          v-else
          text 
          size="small" 
          class="demo-login" 
          @click="handleDemoLogin"
        >
          使用演示账户登录
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  NForm,
  NFormItem,
  NInput,
  NButton,
  NAlert,
  NIcon,
  NTabs,
  NTabPane,
  type FormInst,
  type FormRules
} from 'naive-ui'
import UserIcon from '@/components/icons/UserIcon.vue'
import LockIcon from '@/components/icons/LockIcon.vue'
import KeyIcon from '@/components/icons/KeyIcon.vue'
import CloseIcon from '@/components/icons/CloseIcon.vue'
import MockLoginTip from '@/components/MockLoginTip.vue'
import { isMockMode } from '@/mock/config'

interface Props {
  loading: boolean
  error: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  login: [credentials: { username: string; password: string }]
  'token-login': [token: string]
  'clear-error': []
}>()

// 响应式数据
const loginMode = ref<'password' | 'token'>('password')
const passwordFormRef = ref<FormInst>()
const tokenFormRef = ref<FormInst>()

const passwordFormData = ref({
  username: '',
  password: ''
})

const tokenFormData = ref({
  token: ''
})

// 表单验证规则
const passwordFormRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const tokenFormRules: FormRules = {
  token: [
    { required: true, message: '请输入访问Token', trigger: 'blur' },
    { min: 10, message: 'Token长度至少10位', trigger: 'blur' }
  ]
}

// 计算属性
const canPasswordSubmit = computed(() => {
  return passwordFormData.value.username.trim() && passwordFormData.value.password.trim() && !props.loading
})

const canTokenSubmit = computed(() => {
  return tokenFormData.value.token.trim() && !props.loading
})

// 方法
const handlePasswordSubmit = async () => {
  if (!passwordFormRef.value || props.loading) return

  try {
    await passwordFormRef.value.validate()
    emit('login', {
      username: passwordFormData.value.username.trim(),
      password: passwordFormData.value.password
    })
  } catch (error) {
    console.log('密码表单验证失败:', error)
  }
}

const handleTokenSubmit = async () => {
  if (!tokenFormRef.value || props.loading) return

  try {
    await tokenFormRef.value.validate()
    emit('token-login', tokenFormData.value.token.trim())
  } catch (error) {
    console.log('Token表单验证失败:', error)
  }
}

const handleDemoLogin = async () => {
  // 如果是Mock模式，直接进行Mock登录
  if (isMockMode()) {
    console.log('🎭 直接使用Mock演示登录')
    emit('login', {
      username: 'demo',
      password: 'demo123'
    })
  } else {
    // 非Mock模式下填充演示账户信息
    passwordFormData.value = {
      username: 'demo',
      password: 'demo123'
    }
    loginMode.value = 'password'
  }
}

const handleAdminLogin = async () => {
  console.log('🎭 直接使用Mock管理员登录')
  emit('login', {
    username: 'admin',
    password: 'admin123'
  })
}

const handleFillCredentials = (credentials: { username: string; password: string }) => {
  passwordFormData.value = credentials
  loginMode.value = 'password'
}
</script>

<style scoped lang="scss">
.form-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
  }
}

.form-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;

  h2 {
    font-size: 1.8rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }

  p {
    color: #7f8c8d;
    font-size: 0.9rem;
  }
}

.login-mode-tabs {
  margin-bottom: 1rem;

  :deep(.n-tabs-nav) {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 8px;
    padding: 4px;
  }
}

.login-form {
  .error-alert {
    margin-bottom: 1rem;
  }

  :deep(.n-form-item-label) {
    font-weight: 500;
    color: #2c3e50;
  }

  :deep(.n-input) {
    border-radius: 10px;
  }

  :deep(.n-button) {
    border-radius: 10px;
    font-weight: 500;
  }
}

.token-help {
  margin-top: 1rem;
  
  :deep(.n-alert) {
    border-radius: 8px;
    font-size: 0.85rem;
  }
}

.form-footer {
  margin-top: 1.5rem;
  text-align: center;

  .divider {
    position: relative;
    margin: 1rem 0;
    
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: #e1e8ed;
    }

    span {
      background: rgba(255, 255, 255, 0.95);
      padding: 0 1rem;
      color: #7f8c8d;
      font-size: 0.85rem;
      position: relative;
    }
  }

  .mock-login-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .demo-login {
    color: #667eea;
    font-size: 0.85rem;
    
    &:hover {
      color: #5a67d8;
    }
  }
}
</style>
