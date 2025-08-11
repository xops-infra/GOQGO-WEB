<template>
  <div class="dashboard-view">
    <!-- 开发中提示 -->
    <div class="development-notice">
      <div class="notice-content">
        <div class="notice-icon">
          <n-icon size="64" color="#f0a020">
            <ConstructOutline />
          </n-icon>
        </div>
        <h1 class="notice-title">开发中</h1>
        <p class="notice-description">Dashboard 功能正在开发中，敬请期待...</p>
        <div class="notice-progress">
          <n-progress 
            type="line" 
            :percentage="35" 
            :show-indicator="false"
            :color="'#f0a020'"
            :height="8"
          />
          <span class="progress-text">开发进度: 35%</span>
        </div>
        <div class="notice-features">
          <h3>即将推出的功能：</h3>
          <ul>
            <li>📊 实时系统监控</li>
            <li>🤖 智能体状态管理</li>
            <li>📈 性能指标图表</li>
            <li>🔧 系统配置管理</li>
            <li>📝 操作日志查看</li>
          </ul>
        </div>
        <div class="notice-actions">
          <n-button 
            type="primary" 
            size="large"
            @click="goToChat"
            class="back-button"
          >
            返回聊天室
          </n-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NIcon, NProgress, NButton } from 'naive-ui'
import { ConstructOutline } from '@vicons/ionicons5'
import { useRouter } from 'vue-router'

const router = useRouter()

const goToChat = () => {
  router.push('/')
}
</script>

<style scoped lang="scss">
.dashboard-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--page-bg);
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.development-notice {
  max-width: 600px;
  width: 100%;
  text-align: center;
}

.notice-content {
  background: var(--card-color);
  border-radius: 16px;
  padding: 48px 32px;
  border: 1px solid var(--border-color);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.notice-icon {
  margin-bottom: 24px;
  animation: pulse 2s infinite;
}

.notice-title {
  font-size: 36px;
  font-weight: 700;
  color: var(--text-color-1);
  margin-bottom: 16px;
  background: linear-gradient(135deg, #f0a020, #f59e0b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.notice-description {
  font-size: 18px;
  color: var(--text-color-3);
  margin-bottom: 32px;
  line-height: 1.6;
}

.notice-progress {
  margin-bottom: 32px;
  
  .progress-text {
    display: block;
    margin-top: 12px;
    font-size: 14px;
    color: var(--text-color-3);
  }
}

.notice-features {
  margin-bottom: 32px;
  text-align: left;
  
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-color-1);
    margin-bottom: 16px;
    text-align: center;
  }
  
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    
    li {
      padding: 8px 0;
      font-size: 16px;
      color: var(--text-color-2);
      border-bottom: 1px solid var(--border-color);
      
      &:last-child {
        border-bottom: none;
      }
    }
  }
}

.notice-actions {
  .back-button {
    min-width: 160px;
    height: 48px;
    font-size: 16px;
    font-weight: 500;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .dashboard-view {
    padding: 16px;
  }
  
  .notice-content {
    padding: 32px 24px;
  }
  
  .notice-title {
    font-size: 28px;
  }
  
  .notice-description {
    font-size: 16px;
  }
  
  .notice-features {
    ul li {
      font-size: 14px;
    }
  }
}
</style>
