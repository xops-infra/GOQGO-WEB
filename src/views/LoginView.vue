<template>
  <div class="login-container">
    <!-- 左侧品牌展示区域 -->
    <div class="brand-section">
      <div class="brand-content">
        <!-- Logo和标题 -->
        <div class="brand-header">
          <div class="logo-container">
            <img src="@/assets/Goqgo.svg" alt="GoQGo" class="brand-logo" />
          </div>
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
            <n-form
              ref="tokenFormRef"
              :model="tokenForm"
              :rules="tokenRules"
              size="large"
            >
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
                        <path fill="currentColor" d="M7,14A2,2 0 0,1 5,12A2,2 0 0,1 7,10A2,2 0 0,1 9,12A2,2 0 0,1 7,14M12.65,10C11.83,7.67 9.61,6 7,6A6,6 0 0,0 1,12A6,6 0 0,0 7,18C9.61,18 11.83,16.33 12.65,14H17V18H21V14H23V10H12.65Z"/>
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
                  <n-icon style="margin-right: 8px;">
                    <svg viewBox="0 0 24 24">
                      <path fill="currentColor" d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"/>
                    </svg>
                  </n-icon>
                  如何获取访问令牌？
                </template>
                <ul class="help-list">
                  <li>联系系统管理员获取个人访问令牌</li>
                  <li>令牌用于身份验证和资源访问控制</li>
                  <li>请妥善保管您的令牌，不要与他人分享</li>
                </ul>
              </n-alert>
            </div>
          </div>
          
          <!-- AD登录表单（预留） -->
          <div v-if="loginType === 'ad'" class="login-form">
            <div class="coming-soon-content">
              <n-icon size="48" color="#ccc">
                <svg viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C15.4,11.5 16,12.4 16,13V16C16,17.4 15.4,18 14.8,18H9.2C8.6,18 8,17.4 8,16V13C8,12.4 8.6,11.5 9.2,11.5V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,10V11.5H13.5V10C13.5,8.7 12.8,8.2 12,8.2Z"/>
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
import { useRouter } from 'vue-router'
import { useMessage, type FormInst, type FormRules } from 'naive-ui'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const message = useMessage()
const userStore = useUserStore()

// 版本信息
const version = ref('v0.1.1')

// 登录类型
const loginType = ref<'token' | 'ad'>('token')

// 加载状态
const isLoading = ref(false)

// Token登录表单
const tokenFormRef = ref<FormInst | null>(null)
const tokenForm = reactive({
  token: ''
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

// Token登录处理
const handleTokenLogin = async () => {
  if (!tokenFormRef.value) return
  
  try {
    await tokenFormRef.value.validate()
    isLoading.value = true
    
    // 调用用户store的登录方法
    await userStore.loginWithToken(tokenForm.token)
    
    message.success('登录成功！')
    
    // 跳转到主页面
    router.push('/')
    
  } catch (error: any) {
    console.error('登录失败:', error)
    
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
.login-container {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

// 左侧品牌区域
.brand-section {
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  position: relative;
  overflow: hidden;
  
  // 背景装饰
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    animation: float 20s ease-in-out infinite;
  }
  
  @keyframes float {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    33% { transform: translate(30px, -30px) rotate(120deg); }
    66% { transform: translate(-20px, 20px) rotate(240deg); }
  }
}

.brand-content {
  max-width: 600px;
  color: white;
  text-align: center;
  position: relative;
  z-index: 1;
}

.brand-header {
  margin-bottom: 60px;
  
  .logo-container {
    margin-bottom: 24px;
    
    .brand-logo {
      width: 120px;
      height: 120px;
      filter: brightness(0) invert(1);
      animation: pulse 2s ease-in-out infinite;
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
  }
  
  .brand-title {
    font-size: 4rem;
    font-weight: 700;
    margin: 0 0 16px 0;
    background: linear-gradient(45deg, #fff, #f0f0f0);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 4px 8px rgba(0,0,0,0.3);
  }
  
  .brand-subtitle {
    font-size: 1.25rem;
    opacity: 0.9;
    margin: 0;
    font-weight: 300;
  }
}

.features-list {
  display: grid;
  gap: 24px;
  margin-bottom: 40px;
  
  .feature-item {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      background: rgba(255, 255, 255, 0.15);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }
    
    .feature-icon {
      font-size: 2rem;
      flex-shrink: 0;
    }
    
    .feature-content {
      text-align: left;
      
      h3 {
        margin: 0 0 8px 0;
        font-size: 1.1rem;
        font-weight: 600;
      }
      
      p {
        margin: 0;
        opacity: 0.8;
        font-size: 0.9rem;
        line-height: 1.5;
      }
    }
  }
}

.version-info {
  opacity: 0.7;
  font-size: 0.9rem;
  
  .version-text {
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
}

// 右侧登录区域
.login-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  padding: 40px;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.1);
}

.login-content {
  width: 100%;
  max-width: 400px;
}

.login-form-container {
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 40px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-primary);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
  
  .login-title {
    font-size: 1.75rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 8px 0;
  }
  
  .login-subtitle {
    color: var(--text-secondary);
    margin: 0;
    font-size: 0.9rem;
  }
}

.login-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  padding: 4px;
  background: var(--bg-tertiary);
  border-radius: 8px;
  
  .tab-button {
    flex: 1;
    padding: 12px 16px;
    border: none;
    background: transparent;
    color: var(--text-secondary);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
    font-weight: 500;
    position: relative;
    
    &:hover:not(:disabled) {
      background: var(--bg-hover);
      color: var(--text-primary);
    }
    
    &.active {
      background: var(--color-primary);
      color: white;
      box-shadow: var(--shadow-sm);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
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
    margin-top: 24px;
    
    .help-list {
      margin: 8px 0 0 0;
      padding-left: 16px;
      
      li {
        margin-bottom: 4px;
        font-size: 0.85rem;
        line-height: 1.4;
        
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}

.coming-soon-content {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-tertiary);
  
  h3 {
    margin: 16px 0 8px 0;
    color: var(--text-secondary);
  }
  
  p {
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.5;
  }
}

// 响应式设计
@media (max-width: 1024px) {
  .login-container {
    flex-direction: column;
  }
  
  .brand-section {
    flex: none;
    min-height: 40vh;
    padding: 20px;
    
    .brand-header .brand-title {
      font-size: 3rem;
    }
    
    .features-list {
      display: none; // 在小屏幕上隐藏特性列表
    }
  }
  
  .login-section {
    flex: none;
    padding: 20px;
  }
  
  .login-form-container {
    padding: 24px;
  }
}

@media (max-width: 640px) {
  .brand-header .brand-title {
    font-size: 2.5rem;
  }
  
  .login-form-container {
    padding: 20px;
  }
}

// 深色模式适配
:deep(.n-form-item-label) {
  color: var(--text-primary);
  font-weight: 500;
}

:deep(.n-input) {
  --n-border: 1px solid var(--border-primary);
  --n-border-hover: 1px solid var(--color-primary);
  --n-border-focus: 1px solid var(--color-primary);
}

:deep(.n-button--primary-type) {
  --n-color: var(--color-primary);
  --n-color-hover: var(--color-primary-hover);
  --n-color-pressed: var(--color-primary-pressed);
}
</style>
