<template>
  <div class="roles-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">角色管理</h1>
        <p class="page-description">管理AI智能体角色</p>
      </div>
      <div class="header-actions">
        <n-button 
          type="primary" 
          @click="handleRefresh"
          :loading="loading"
          size="small"
        >
          <template #icon>
            <n-icon>
              <RefreshOutline />
            </n-icon>
          </template>
          刷新
        </n-button>
      </div>
    </div>

    <!-- 页面内容 -->
    <div class="page-content">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <n-spin size="large" />
        <p>加载角色列表中...</p>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-state">
        <n-icon size="48" color="#d03050">
          <AlertCircleOutline />
        </n-icon>
        <h3>加载失败</h3>
        <p>{{ error }}</p>
        <n-button @click="handleRefresh" type="primary">
          重试
        </n-button>
      </div>

      <!-- 空状态 -->
      <div v-else-if="roles.length === 0" class="empty-state">
        <n-icon size="48" color="#909399">
          <PersonOutline />
        </n-icon>
        <h3>暂无角色</h3>
        <p>还没有创建任何角色</p>
      </div>

      <!-- 角色列表 -->
      <div v-else class="roles-container">
        <div class="roles-grid">
          <div 
            v-for="role in roles" 
            :key="role.name"
            class="role-card"
          >
            <RoleDetail :role="role" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMessage, NButton, NIcon, NSpin } from 'naive-ui'
import { RefreshOutline, AlertCircleOutline, PersonOutline } from '@vicons/ionicons5'
import { rolesApi } from '@/api/roles'
import RoleDetail from '@/components/RoleDetail.vue'
import type { Role } from '@/types/api'

// 响应式数据
const loading = ref(false)
const error = ref<string | null>(null)
const roles = ref<Role[]>([])

const message = useMessage()

// 方法
const handleRefresh = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await rolesApi.getList()
    roles.value = response.roles || []
    message.success('角色列表已刷新')
  } catch (err: any) {
    console.error('获取角色列表失败:', err)
    error.value = err.message || '获取角色列表失败'
    message.error('获取角色列表失败')
  } finally {
    loading.value = false
  }
}

// 生命周期
onMounted(() => {
  handleRefresh()
})
</script>

<style scoped lang="scss">
.roles-view {
  min-height: 100vh;
  background: var(--terminal-bg, #000000);
  display: flex;
  flex-direction: column;
}

.page-header {
  background: var(--terminal-header-bg, #1a1a1a);
  border-bottom: 1px solid var(--terminal-border, #333333);
  padding: 24px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.header-content {
  .page-title {
    font-size: 28px;
    font-weight: 600;
    color: var(--terminal-text, #00ff41);
    margin: 0 0 8px 0;
    font-family: 'Courier New', monospace;
  }

  .page-description {
    font-size: 16px;
    color: var(--terminal-text-dim, #888888);
    margin: 0;
    font-family: 'Courier New', monospace;
  }
}

.header-actions {
  .n-button {
    min-width: 80px;
    background: var(--terminal-primary, #00ff41);
    border-color: var(--terminal-primary, #00ff41);
    color: #000000;
    font-family: 'Courier New', monospace;
    font-weight: 600;
    
    &:hover {
      background: var(--terminal-primary-hover, #00cc33);
      border-color: var(--terminal-primary-hover, #00cc33);
    }
  }
}

.page-content {
  flex: 1;
  padding: 24px 32px;
  overflow-y: auto;
  min-height: 0;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;

  p {
    margin-top: 16px;
    color: var(--terminal-text-dim, #888888);
    font-size: 16px;
    font-family: 'Courier New', monospace;
  }
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;

  h3 {
    margin: 16px 0 8px 0;
    color: var(--terminal-text, #00ff41);
    font-size: 20px;
    font-family: 'Courier New', monospace;
  }

  p {
    margin: 0 0 24px 0;
    color: var(--terminal-text-dim, #888888);
    font-size: 16px;
    font-family: 'Courier New', monospace;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;

  h3 {
    margin: 16px 0 8px 0;
    color: var(--terminal-text, #00ff41);
    font-size: 20px;
    font-family: 'Courier New', monospace;
  }

  p {
    margin: 0;
    color: var(--terminal-text-dim, #888888);
    font-size: 16px;
    font-family: 'Courier New', monospace;
  }
}

.roles-container {
  .roles-grid {
    column-count: auto;
    column-width: 350px;
    column-gap: 24px;
    padding-bottom: 24px;
    /* 添加浏览器前缀支持 */
    -webkit-column-count: auto;
    -webkit-column-width: 350px;
    -webkit-column-gap: 24px;
    -moz-column-count: auto;
    -moz-column-width: 350px;
    -moz-column-gap: 24px;
  }

  .role-card {
    background: var(--terminal-card-bg, #1a1a1a);
    border: 1px solid var(--terminal-border, #333333);
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 255, 65, 0.1);
    transition: all 0.2s ease;
    overflow: hidden;
    break-inside: avoid; /* 防止卡片被分割到不同列 */
    -webkit-column-break-inside: avoid; /* Webkit浏览器支持 */
    page-break-inside: avoid; /* 旧版浏览器支持 */
    margin-bottom: 24px; /* 添加底部间距 */
    display: inline-block; /* 确保列布局正常工作 */
    width: 100%; /* 占满列宽 */

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 255, 65, 0.2);
      border-color: var(--terminal-primary, #00ff41);
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .page-header {
    padding: 16px 20px;
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .page-content {
    padding: 16px 20px;
  }

  .roles-container .roles-grid {
    column-width: 280px;
    column-gap: 16px;
  }

  .roles-container .role-card {
    margin-bottom: 16px;
  }

  .header-actions {
    align-self: flex-end;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 12px 16px;
  }

  .page-content {
    padding: 12px 16px;
  }

  .page-title {
    font-size: 24px;
  }

  .page-description {
    font-size: 14px;
  }

  .roles-container .roles-grid {
    column-count: 1;
    column-width: auto;
    column-gap: 0;
  }

  .roles-container .role-card {
    margin-bottom: 16px;
  }
}
</style>
