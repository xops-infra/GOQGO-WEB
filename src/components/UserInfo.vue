<template>
  <div class="user-info">
    <n-dropdown
      :options="dropdownOptions"
      @select="handleMenuSelect"
      placement="bottom-end"
      trigger="click"
      :show-arrow="true"
    >
      <div class="user-avatar-container" :class="{ loading: userStore.loading }">
        <n-avatar
          :size="36"
          :src="userAvatar"
          :fallback-src="defaultAvatar"
          class="user-avatar"
          round
        >
          {{ userInitials }}
        </n-avatar>
        
        <div class="user-basic-info">
          <div class="user-name">{{ currentUser.displayName }}</div>
          <div class="user-status">
            <n-tag
              :type="statusType"
              size="small"
              round
            >
              {{ statusText }}
            </n-tag>
          </div>
        </div>
        
        <n-icon class="dropdown-icon" size="16">
          <svg viewBox="0 0 24 24">
            <path fill="currentColor" d="M7,10L12,15L17,10H7Z"/>
          </svg>
        </n-icon>
      </div>
    </n-dropdown>

    <!-- 用户详情模态框 -->
    <n-modal
      v-model:show="showUserDetails"
      preset="card"
      :title="`${currentUser.displayName} 的详细信息`"
      style="width: 700px; max-width: 90vw"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-labelledby="user-details-title"
    >
      <div v-if="currentUserData" class="user-details">
        <!-- 基本信息 -->
        <n-descriptions
          title="基本信息"
          :column="2"
          bordered
          size="small"
        >
          <n-descriptions-item label="用户名">
            {{ currentUserData.metadata.name }}
          </n-descriptions-item>
          <n-descriptions-item label="显示名称">
            {{ currentUserData.spec.displayName }}
          </n-descriptions-item>
          <n-descriptions-item label="邮箱">
            {{ currentUserData.spec.email }}
          </n-descriptions-item>
          <n-descriptions-item label="部门">
            {{ currentUserData.metadata.labels.department || '-' }}
          </n-descriptions-item>
          <n-descriptions-item label="角色">
            {{ currentUserData.metadata.labels.role || '-' }}
          </n-descriptions-item>
          <n-descriptions-item label="团队">
            {{ currentUserData.metadata.labels.team || '-' }}
          </n-descriptions-item>
          <n-descriptions-item label="时区">
            {{ currentUserData.spec.preferences.timezone }}
          </n-descriptions-item>
          <n-descriptions-item label="默认命名空间">
            {{ currentUserData.spec.preferences.defaultNamespace }}
          </n-descriptions-item>
        </n-descriptions>

        <!-- 状态信息 -->
        <n-descriptions
          title="状态信息"
          :column="2"
          bordered
          size="small"
          style="margin-top: 16px"
        >
          <n-descriptions-item label="状态">
            <n-tag :type="statusType" size="small">
              {{ currentUserData.status.phase }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="最后登录">
            {{ formatTime(currentUserData.status.lastLoginTime) }}
          </n-descriptions-item>
          <n-descriptions-item label="创建时间">
            {{ formatTime(currentUserData.metadata.creationTimestamp) }}
          </n-descriptions-item>
          <n-descriptions-item label="Token过期时间">
            {{ formatTime(currentUserData.spec.tokenExpiry) }}
          </n-descriptions-item>
        </n-descriptions>

        <!-- 资源统计 -->
        <n-descriptions
          title="资源统计"
          :column="3"
          bordered
          size="small"
          style="margin-top: 16px"
        >
          <n-descriptions-item label="智能体数量">
            {{ currentUserData.status.agentCount }} / {{ currentUserData.spec.quotas.maxAgents }}
          </n-descriptions-item>
          <n-descriptions-item label="命名空间数量">
            {{ currentUserData.status.namespaceCount }} / {{ currentUserData.spec.quotas.maxNamespaces }}
          </n-descriptions-item>
          <n-descriptions-item label="工作流数量">
            {{ currentUserData.status.dagCount }} / {{ currentUserData.spec.quotas.maxDags }}
          </n-descriptions-item>
        </n-descriptions>

        <!-- 权限信息 -->
        <n-descriptions
          title="权限信息"
          :column="1"
          bordered
          size="small"
          style="margin-top: 16px"
        >
          <n-descriptions-item label="智能体权限">
            <n-space>
              <n-tag v-if="currentUserData.spec.permissions.agents.create" type="success" size="small">创建</n-tag>
              <n-tag v-if="currentUserData.spec.permissions.agents.delete" type="error" size="small">删除</n-tag>
              <n-tag v-if="currentUserData.spec.permissions.agents.restart" type="warning" size="small">重启</n-tag>
              <n-tag v-if="currentUserData.spec.permissions.agents.send" type="info" size="small">发送消息</n-tag>
              <n-tag v-if="currentUserData.spec.permissions.agents.logs" type="default" size="small">查看日志</n-tag>
              <span v-if="!hasAnyAgentPermission" class="no-permission">无权限</span>
            </n-space>
          </n-descriptions-item>
          <n-descriptions-item label="工作流权限">
            <n-space>
              <n-tag v-if="currentUserData.spec.permissions.dags.create" type="success" size="small">创建</n-tag>
              <n-tag v-if="currentUserData.spec.permissions.dags.run" type="info" size="small">运行</n-tag>
              <n-tag v-if="currentUserData.spec.permissions.dags.delete" type="error" size="small">删除</n-tag>
              <span v-if="!hasAnyDagPermission" class="no-permission">无权限</span>
            </n-space>
          </n-descriptions-item>
        </n-descriptions>

        <!-- 描述信息 -->
        <div v-if="currentUserData.metadata.annotations.description" style="margin-top: 16px">
          <h4>描述</h4>
          <p class="user-description">{{ currentUserData.metadata.annotations.description }}</p>
        </div>
      </div>
      
      <div v-else class="loading-placeholder">
        <n-spin size="large" />
        <p>加载用户信息中...</p>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'
import { useMessage } from 'naive-ui'

// 状态管理
const userStore = useUserStore()
const { currentUser, currentUserData } = storeToRefs(userStore)
const message = useMessage()

// 响应式数据
const showUserDetails = ref(false)

// 计算属性
const userAvatar = computed(() => {
  // 可以从用户数据中获取头像URL
  return currentUserData.value?.metadata.annotations?.avatar || ''
})

const defaultAvatar = computed(() => {
  // 生成默认头像URL，使用更好的默认头像服务
  const email = currentUserData.value?.spec.email || 'xops@patsnap.com'
  const hash = btoa(email).replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.value.displayName)}&size=128&background=007bff&color=ffffff&bold=true&format=svg`
})

const userInitials = computed(() => {
  const displayName = currentUser.value.displayName
  return displayName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
})

const statusType = computed(() => {
  if (!currentUserData.value) return 'default'
  
  switch (currentUserData.value.status.phase) {
    case 'Active':
      return 'success'
    case 'Inactive':
      return 'warning'
    case 'Suspended':
      return 'error'
    default:
      return 'default'
  }
})

const statusText = computed(() => {
  if (!currentUserData.value) return '在线'
  
  switch (currentUserData.value.status.phase) {
    case 'Active':
      return '活跃'
    case 'Inactive':
      return '非活跃'
    case 'Suspended':
      return '已暂停'
    default:
      return '未知'
  }
})

const hasAnyAgentPermission = computed(() => {
  if (!currentUserData.value) return false
  const perms = currentUserData.value.spec.permissions.agents
  return perms.create || perms.delete || perms.restart || perms.send || perms.logs
})

const hasAnyDagPermission = computed(() => {
  if (!currentUserData.value) return false
  const perms = currentUserData.value.spec.permissions.dags
  return perms.create || perms.run || perms.delete
})

// 下拉菜单选项
const dropdownOptions = computed(() => [
  {
    label: '查看详情',
    key: 'details',
    icon: () => h('svg', { viewBox: '0 0 24 24' }, [
      h('path', { fill: 'currentColor', d: 'M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z' })
    ])
  },
  {
    label: '刷新信息',
    key: 'refresh',
    icon: () => h('svg', { viewBox: '0 0 24 24' }, [
      h('path', { fill: 'currentColor', d: 'M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z' })
    ])
  },
  {
    type: 'divider'
  },
  {
    label: '设置',
    key: 'settings',
    icon: () => h('svg', { viewBox: '0 0 24 24' }, [
      h('path', { fill: 'currentColor', d: 'M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z' })
    ])
  },
  {
    label: '退出登录',
    key: 'logout',
    icon: () => h('svg', { viewBox: '0 0 24 24' }, [
      h('path', { fill: 'currentColor', d: 'M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z' })
    ])
  }
])

// 方法
const handleMenuSelect = (key: string) => {
  switch (key) {
    case 'details':
      showUserDetails.value = true
      break
    case 'refresh':
      refreshUserInfo()
      break
    case 'settings':
      message.info('设置功能开发中...')
      break
    case 'logout':
      handleLogout()
      break
  }
}

const refreshUserInfo = async () => {
  try {
    await userStore.fetchCurrentUser(currentUser.value.username)
    if (userStore.error) {
      message.warning(`刷新用户信息时遇到问题: ${userStore.error}，已使用缓存数据`)
    } else {
      message.success('用户信息已刷新')
    }
  } catch (error) {
    console.error('刷新用户信息失败:', error)
    message.error('刷新用户信息失败，请检查网络连接')
  }
}

const handleLogout = () => {
  message.info('退出登录功能开发中...')
}

const formatTime = (timeString: string) => {
  if (!timeString) return '-'
  return new Date(timeString).toLocaleString('zh-CN')
}

// 生命周期
onMounted(async () => {
  // 初始化时获取用户信息
  try {
    await userStore.fetchCurrentUser('xops')
  } catch (error) {
    console.error('UserInfo组件初始化失败:', error)
    // 不显示错误消息，因为store已经处理了fallback
  }
})
</script>

<style scoped lang="scss">
.user-info {
  .user-avatar-container {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;
    min-width: 160px;
    white-space: nowrap;
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.12);
    }
    
    &.loading {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }
  
  .user-avatar {
    flex-shrink: 0;
    border: 2px solid rgba(255, 255, 255, 0.1);
    transition: border-color 0.2s ease;
    
    .user-avatar-container:hover & {
      border-color: rgba(255, 255, 255, 0.2);
    }
  }
  
  .user-basic-info {
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
    flex: 1;
    
    .user-name {
      font-size: 14px;
      font-weight: 600;
      color: #ffffff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.2;
    }
    
    .user-status {
      display: flex;
      align-items: center;
      
      :deep(.n-tag) {
        font-size: 11px;
        height: 18px;
        padding: 0 6px;
        font-weight: 500;
        
        &.n-tag--success {
          background-color: rgba(82, 196, 26, 0.15);
          color: #52c41a;
          border: 1px solid rgba(82, 196, 26, 0.3);
        }
        
        &.n-tag--warning {
          background-color: rgba(250, 173, 20, 0.15);
          color: #faad14;
          border: 1px solid rgba(250, 173, 20, 0.3);
        }
        
        &.n-tag--error {
          background-color: rgba(245, 34, 45, 0.15);
          color: #f5222d;
          border: 1px solid rgba(245, 34, 45, 0.3);
        }
      }
    }
  }
  
  .dropdown-icon {
    flex-shrink: 0;
    color: rgba(255, 255, 255, 0.5);
    transition: all 0.2s ease;
    
    .user-avatar-container:hover & {
      color: rgba(255, 255, 255, 0.8);
      transform: rotate(180deg);
    }
  }
}

.user-details {
  .user-description {
    margin: 8px 0 0 0;
    padding: 16px;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 8px;
    color: #495057;
    line-height: 1.6;
    border-left: 4px solid #007bff;
    font-style: italic;
  }
  
  .no-permission {
    color: #6c757d;
    font-style: italic;
    font-size: 12px;
  }
  
  // 优化描述信息的样式
  :deep(.n-descriptions) {
    .n-descriptions-header {
      margin-bottom: 12px;
      
      .n-descriptions-header__title {
        font-size: 16px;
        font-weight: 600;
        color: #212529;
      }
    }
    
    .n-descriptions-item {
      .n-descriptions-item-label {
        font-weight: 500;
        color: #495057;
        min-width: 100px;
      }
      
      .n-descriptions-item-content {
        color: #212529;
      }
    }
  }
  
  // 优化标签样式
  :deep(.n-tag) {
    font-size: 12px;
    font-weight: 500;
    border-radius: 4px;
    
    &.n-tag--success {
      background-color: rgba(82, 196, 26, 0.1);
      color: #389e0d;
      border: 1px solid rgba(82, 196, 26, 0.2);
    }
    
    &.n-tag--error {
      background-color: rgba(245, 34, 45, 0.1);
      color: #cf1322;
      border: 1px solid rgba(245, 34, 45, 0.2);
    }
    
    &.n-tag--warning {
      background-color: rgba(250, 173, 20, 0.1);
      color: #d48806;
      border: 1px solid rgba(250, 173, 20, 0.2);
    }
    
    &.n-tag--info {
      background-color: rgba(24, 144, 255, 0.1);
      color: #096dd9;
      border: 1px solid rgba(24, 144, 255, 0.2);
    }
    
    &.n-tag--default {
      background-color: rgba(0, 0, 0, 0.05);
      color: #595959;
      border: 1px solid rgba(0, 0, 0, 0.1);
    }
  }
}

.loading-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  
  :deep(.n-spin) {
    .n-spin-body {
      color: #007bff;
    }
  }
  
  p {
    margin-top: 20px;
    color: #6c757d;
    font-size: 14px;
    font-weight: 500;
  }
}

// 优化下拉菜单样式
:deep(.n-dropdown-menu) {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(0, 0, 0, 0.08);
  padding: 4px;
  
  .n-dropdown-option {
    border-radius: 6px;
    margin: 2px 0;
    padding: 8px 12px;
    transition: all 0.2s ease;
    
    &:hover {
      background-color: #f8f9fa;
    }
    
    .n-dropdown-option-body {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .n-dropdown-option-body__prefix {
        color: #6c757d;
        
        svg {
          width: 16px;
          height: 16px;
        }
      }
      
      .n-dropdown-option-body__label {
        font-size: 14px;
        font-weight: 500;
        color: #212529;
      }
    }
    
    &.n-dropdown-option--show-arrow {
      &:hover {
        background-color: #e3f2fd;
        
        .n-dropdown-option-body__prefix {
          color: #1976d2;
        }
      }
    }
  }
  
  .n-dropdown-divider {
    margin: 4px 0;
    background-color: rgba(0, 0, 0, 0.06);
  }
}
</style>
