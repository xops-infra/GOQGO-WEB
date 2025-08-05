<template>
  <div v-if="showTip" class="mock-login-tip">
    <div class="tip-content">
      <div class="tip-header">
        <n-icon size="20" color="#00ff41">
          <InfoIcon />
        </n-icon>
        <span class="tip-title">Mock模式已启用</span>
        <n-button text size="small" @click="closeTip" class="close-btn">
          <n-icon>
            <CloseIcon />
          </n-icon>
        </n-button>
      </div>
      
      <div class="tip-body">
        <p>当前处于Mock模式，可以使用以下测试账户登录：</p>
        
        <div class="accounts">
          <div class="account-item">
            <div class="account-info">
              <strong>管理员账户</strong>
              <div class="credentials">
                <span>用户名: <code>admin</code></span>
                <span>密码: <code>admin123</code></span>
              </div>
            </div>
            <n-button size="small" @click="fillCredentials('admin', 'admin123')">
              快速填入
            </n-button>
          </div>
          
          <div class="account-item">
            <div class="account-info">
              <strong>演示账户</strong>
              <div class="credentials">
                <span>用户名: <code>demo</code></span>
                <span>密码: <code>demo123</code></span>
              </div>
            </div>
            <n-button size="small" @click="fillCredentials('demo', 'demo123')">
              快速填入
            </n-button>
          </div>
        </div>
        
        <div class="tip-footer">
          <p class="note">
            <n-icon size="14">
              <WarningIcon />
            </n-icon>
            Mock模式仅用于开发和演示，所有数据都是模拟的
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { NIcon, NButton } from 'naive-ui'
import { isMockMode } from '@/mock/config'
import InfoIcon from '@/components/icons/InfoIcon.vue'
import CloseIcon from '@/components/icons/CloseIcon.vue'
import WarningIcon from '@/components/icons/WarningIcon.vue'

const emit = defineEmits<{
  'fill-credentials': [username: string, password: string]
}>()

const showTip = ref(false)

// 方法
const fillCredentials = (username: string, password: string) => {
  emit('fill-credentials', username, password)
}

const closeTip = () => {
  showTip.value = false
  localStorage.setItem('mock-login-tip-closed', 'true')
}

// 生命周期
onMounted(() => {
  // 只在Mock模式下显示，且用户没有关闭过
  const isClosed = localStorage.getItem('mock-login-tip-closed') === 'true'
  showTip.value = isMockMode() && !isClosed
})
</script>

<style scoped lang="scss">
.mock-login-tip {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  max-width: 400px;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.tip-content {
  padding: 16px;
}

.tip-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  
  .tip-title {
    flex: 1;
    font-weight: 600;
    color: var(--text-primary);
    font-size: 14px;
  }
  
  .close-btn {
    color: var(--text-tertiary);
    
    &:hover {
      color: var(--text-primary);
    }
  }
}

.tip-body {
  p {
    margin: 0 0 12px 0;
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.4;
  }
}

.accounts {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 12px;
}

.account-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  background: var(--bg-secondary);
  border-radius: 6px;
  border: 1px solid var(--border-secondary);
}

.account-info {
  flex: 1;
  
  strong {
    display: block;
    font-size: 12px;
    color: var(--text-primary);
    margin-bottom: 4px;
  }
}

.credentials {
  display: flex;
  flex-direction: column;
  gap: 2px;
  
  span {
    font-size: 11px;
    color: var(--text-tertiary);
    
    code {
      background: var(--bg-tertiary);
      padding: 1px 4px;
      border-radius: 3px;
      font-family: var(--font-mono);
      color: var(--color-primary);
    }
  }
}

.tip-footer {
  .note {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: var(--text-tertiary);
    margin: 0;
    padding: 8px;
    background: var(--bg-tertiary);
    border-radius: 4px;
  }
}

// Terminal主题样式
[data-theme='terminal'] .mock-login-tip {
  background: var(--terminal-bg);
  border-color: var(--terminal-border);
  box-shadow: 0 0 20px rgba(0, 255, 65, 0.3);
  
  .tip-title {
    color: var(--pixel-green);
    font-family: var(--font-display);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .tip-body p {
    color: var(--terminal-text-secondary);
    font-family: var(--font-mono);
  }
  
  .account-item {
    background: var(--terminal-bg-secondary);
    border-color: var(--terminal-border);
    
    strong {
      color: var(--terminal-text);
      font-family: var(--font-mono);
      text-transform: uppercase;
    }
    
    code {
      background: var(--terminal-bg-tertiary);
      color: var(--pixel-cyan);
      border: 1px solid var(--terminal-border);
    }
  }
  
  .note {
    background: var(--terminal-bg-tertiary);
    color: var(--terminal-text-tertiary);
    font-family: var(--font-mono);
    text-transform: uppercase;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .mock-login-tip {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
  
  .account-item {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
}
</style>
