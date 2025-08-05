<template>
  <div class="form-section">
    <!-- Mock登录提示 -->
    <MockLoginTip @fill-credentials="handleFillCredentials" />
    
    <div class="form-container">
      <div class="form-header">
        <h2>欢迎登录</h2>
        <p>请输入您的账户信息</p>
      </div>

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

        <!-- 登录表单 -->
        <n-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          @submit.prevent="handleSubmit"
        >
          <n-form-item path="username" label="用户名">
            <n-input
              v-model:value="formData.username"
              placeholder="请输入用户名"
              size="large"
              :disabled="loading"
              @keydown.enter="handleSubmit"
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
              v-model:value="formData.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              :disabled="loading"
              show-password-on="mousedown"
              @keydown.enter="handleSubmit"
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
              :disabled="!canSubmit"
              @click="handleSubmit"
              block
            >
              {{ loading ? '登录中...' : '登录' }}
            </n-button>
          </n-form-item>
        </n-form>

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
  type FormInst,
  type FormRules
} from 'naive-ui'
import UserIcon from '@/components/icons/UserIcon.vue'
import LockIcon from '@/components/icons/LockIcon.vue'
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
  'clear-error': []
}>()

// 响应式数据
const formRef = ref<FormInst>()
const formData = ref({
  username: '',
  password: ''
})

// 表单验证规则
const formRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

// 计算属性
const canSubmit = computed(() => {
  return formData.value.username.trim() && formData.value.password.trim() && !props.loading
})

// 方法
const handleSubmit = async () => {
  if (!formRef.value || props.loading) return

  try {
    await formRef.value.validate()
    emit('login', {
      username: formData.value.username.trim(),
      password: formData.value.password
    })
  } catch (error) {
    console.log('表单验证失败:', error)
  }
}

const handleDemoLogin = async () => {
  // 如果是Mock模式，直接进行Mock登录
  if (isMockMode()) {
    console.log('🎭 直接使用Mock演示登录')
    try {
      await emit('login', {
        username: 'demo',
        password: 'demo123'
      })
    } catch (error) {
      console.error('Mock演示登录失败:', error)
    }
    return
  }
  
  // 非Mock模式，填入表单并提交
  formData.value = {
    username: 'demo',
    password: 'demo123'
  }
  handleSubmit()
}

const handleAdminLogin = async () => {
  // 如果是Mock模式，直接进行Mock登录
  if (isMockMode()) {
    console.log('🎭 直接使用Mock管理员登录')
    try {
      await emit('login', {
        username: 'admin',
        password: 'admin123'
      })
    } catch (error) {
      console.error('Mock管理员登录失败:', error)
    }
    return
  }
  
  // 非Mock模式，填入表单并提交
  formData.value = {
    username: 'admin',
    password: 'admin123'
  }
  handleSubmit()
}

const handleFillCredentials = (username: string, password: string) => {
  formData.value = {
    username,
    password
  }
}
</script>

<style scoped lang="scss">
.form-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: var(--bg-primary);
}

.form-container {
  width: 100%;
  max-width: 400px;
}

.form-header {
  text-align: center;
  margin-bottom: 32px;
  
  h2 {
    margin: 0 0 8px 0;
    font-size: 28px;
    font-weight: 600;
    color: var(--text-primary);
  }
  
  p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 14px;
  }
}

.login-form {
  .error-alert {
    margin-bottom: 20px;
  }
}

.form-footer {
  margin-top: 24px;
  text-align: center;
  
  .divider {
    position: relative;
    margin: 20px 0;
    
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: var(--border-primary);
    }
    
    span {
      background: var(--bg-primary);
      padding: 0 16px;
      color: var(--text-tertiary);
      font-size: 12px;
      position: relative;
    }
  }
  
  .demo-login {
    color: var(--color-primary);
    font-size: 13px;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  .mock-login-buttons {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    
    .demo-login {
      padding: 8px 16px;
      border: 1px solid var(--border-secondary);
      border-radius: 6px;
      background: var(--bg-secondary);
      transition: all 0.2s ease;
      text-decoration: none;
      
      &:hover {
        background: var(--bg-tertiary);
        border-color: var(--color-primary);
        transform: translateY(-1px);
        text-decoration: none;
      }
      
      &:active {
        transform: translateY(0);
      }
    }
  }
}

// Terminal主题样式
[data-theme='terminal'] .form-section {
  background: var(--terminal-bg);
  
  .form-header {
    h2 {
      color: var(--pixel-green);
      font-family: var(--font-display);
      text-transform: uppercase;
      letter-spacing: 1px;
      text-shadow: 0 0 10px var(--pixel-green);
    }
    
    p {
      color: var(--terminal-text-secondary);
      font-family: var(--font-mono);
      text-transform: uppercase;
      font-size: 12px;
    }
  }
  
  .divider {
    &::before {
      background: var(--terminal-border);
    }
    
    span {
      background: var(--terminal-bg);
      color: var(--terminal-text-tertiary);
      font-family: var(--font-mono);
    }
  }
  
  .demo-login {
    color: var(--pixel-cyan);
    font-family: var(--font-mono);
    text-transform: uppercase;
    
    &:hover {
      color: var(--pixel-green);
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .form-section {
    padding: 24px;
  }
  
  .form-header {
    margin-bottom: 24px;
    
    h2 {
      font-size: 24px;
    }
  }
}
</style>
