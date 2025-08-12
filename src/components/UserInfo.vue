<template>
  <div v-if="currentUser" class="user-info">
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
          <div class="user-name">{{ userStore.displayName || '用户' }}</div>
          <div class="user-status">
            <n-tag :type="statusType" size="small" round>
              {{ statusText }}
            </n-tag>
          </div>
        </div>

        <n-icon class="dropdown-icon" size="16">
          <svg viewBox="0 0 24 24">
            <path fill="currentColor" d="M7,10L12,15L17,10H7Z" />
          </svg>
        </n-icon>
      </div>
    </n-dropdown>

    <!-- 用户详情模态框 -->
    <n-modal
      v-model:show="showUserDetails"
      preset="card"
      :title="`${userStore.displayName || '用户'} 的详细信息`"
      style="width: 700px; max-width: 90vw"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-labelledby="user-details-title"
    >
      <div v-if="currentUser" class="user-details">
        <!-- 基本信息 -->
        <n-descriptions title="基本信息" :column="2" bordered size="small">
          <n-descriptions-item label="显示名称">
            {{ currentUser.displayName }}
          </n-descriptions-item>
          <n-descriptions-item label="邮箱">
            {{ currentUser.email }}
          </n-descriptions-item>
          <n-descriptions-item label="状态">
            <n-tag type="success" size="small"> 在线 </n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="Token有效期"> 3天 </n-descriptions-item>
        </n-descriptions>

        <!-- 使用说明 -->
        <div style="margin-top: 16px">
          <n-text strong>使用说明：</n-text>
          <div class="user-description">
            <p>您已成功登录GoQGo AI智能体协助开发平台。</p>
            <p>当前使用Token认证方式，临时token有效期为3天。</p>
            <p>您可以使用所有功能，包括创建智能体、发送消息、查看日志等。</p>
          </div>
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useAgentsStore } from '@/stores/agents'
import { useMessage, useDialog } from 'naive-ui'
import { logoutManager } from '@/utils/logoutManager'

// 状态管理
const router = useRouter()
const userStore = useUserStore()
const agentsStore = useAgentsStore()
const { currentUser } = storeToRefs(userStore)
const { agents } = storeToRefs(agentsStore)
const message = useMessage()
const dialog = useDialog()

// 响应式数据
const showUserDetails = ref(false)

// 计算属性
const userAvatar = computed(() => {
  // 可以从用户数据中获取头像URL
  return ''
})

const defaultAvatar = computed(() => {
  if (!currentUser.value) return ''

  // 生成默认头像URL，使用更好的默认头像服务
  const displayName = userStore.displayName || '用户'
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&size=128&background=007bff&color=ffffff&bold=true&format=svg`
})

const userInitials = computed(() => {
  if (!currentUser.value) return 'U'

  const displayName = userStore.displayName || '用户'
  return displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
})

const statusType = computed(() => {
  return 'success' // 简化状态显示
})

const statusText = computed(() => {
  return '在线' // 简化状态文本
})

const hasAnyAgentPermission = computed(() => {
  return true // 简化权限检查
})

// 下拉菜单选项
const dropdownOptions = computed(() => [
  {
    label: '查看详情',
    key: 'details',
    icon: () =>
      h('svg', { viewBox: '0 0 24 24' }, [
        h('path', {
          fill: 'currentColor',
          d: 'M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z'
        })
      ])
  },
  {
    label: '刷新信息',
    key: 'refresh',
    icon: () =>
      h('svg', { viewBox: '0 0 24 24' }, [
        h('path', {
          fill: 'currentColor',
          d: 'M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z'
        })
      ])
  },
  {
    type: 'divider'
  },
  {
    label: '设置',
    key: 'settings',
    icon: () =>
      h('svg', { viewBox: '0 0 24 24' }, [
        h('path', {
          fill: 'currentColor',
          d: 'M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z'
        })
      ])
  },
  {
    label: '退出登录',
    key: 'logout',
    icon: () =>
      h('svg', { viewBox: '0 0 24 24' }, [
        h('path', {
          fill: 'currentColor',
          d: 'M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z'
        })
      ])
  }
])

// 菜单选择处理
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
    if (currentUser.value?.displayName) {
      await userStore.fetchCurrentUser(currentUser.value.displayName)
    }
    message.success('用户信息已刷新')
  } catch (error) {
    console.error('刷新用户信息失败:', error)
    message.error('刷新用户信息失败，请检查网络连接')
  }
}

const handleLogout = async () => {
  // 使用确认对话框
  const d = dialog.warning({
    title: '确认退出',
    content: '您确定要退出登录吗？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        // 使用统一的退出登录管理器
        await logoutManager.logout()
        message.success('已退出登录')
      } catch (error) {
        console.error('登出失败:', error)
        message.error('登出失败')
      }
    }
  })
}

const formatTime = (timeString: string) => {
  if (!timeString) return '-'
  return new Date(timeString).toLocaleString('zh-CN')
}

// 生命周期
onMounted(async () => {
  // 只有在用户已登录时才获取用户详细信息
  if (currentUser.value && currentUser.value.displayName) {
    try {
      await userStore.fetchCurrentUser(currentUser.value.displayName)
    } catch (error) {
      console.error('UserInfo组件初始化失败:', error)
      // 不显示错误消息，因为store已经处理了fallback
    }
  }
})
</script>

<style scoped lang="scss">
.user-info {
  .user-avatar-container {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;

    &:hover {
      background: var(--bg-hover);

      .dropdown-icon {
        opacity: 1;
        transform: translateY(-50%) rotate(180deg);
      }
    }

    &.loading {
      opacity: 0.7;
      pointer-events: none;

      .user-avatar {
        animation: pulse 1.5s ease-in-out infinite;
      }
    }

    @keyframes pulse {
      0%,
      100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
  }

  .user-avatar {
    flex-shrink: 0;
    border: 2px solid var(--border-primary);
    transition: all 0.3s ease;

    .user-avatar-container:hover & {
      border-color: var(--color-primary);
      transform: scale(1.05);
    }
  }

  .user-basic-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .user-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.2;
  }

  .user-status {
    display: flex;
    align-items: center;
    gap: 8px;

    .n-tag {
      font-size: 11px;
      height: 18px;
      line-height: 16px;
      padding: 0 6px;
      border-radius: 9px;
      font-weight: 500;

      .user-avatar-container:hover & {
        transform: scale(1.05);
      }
    }
  }

  .dropdown-icon {
    opacity: 0.6;
    transition: all 0.3s ease;
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-tertiary);
  }
}

.user-details {
  .user-description {
    margin: 8px 0 0 0;
    padding: 12px;
    background: var(--bg-tertiary);
    border-radius: 6px;
    color: var(--text-secondary);
    font-size: 14px;
    line-height: 1.5;
    border-left: 3px solid var(--color-primary);
  }
}

// 深色模式适配
:deep(.n-descriptions) {
  .n-descriptions-table-wrapper {
    .n-descriptions-table {
      .n-descriptions-table-header {
        .n-descriptions-table-header__title {
          color: var(--text-primary);
          font-weight: 600;
        }
      }

      .n-descriptions-table-content {
        .n-descriptions-item {
          .n-descriptions-item__label {
            color: var(--text-secondary);
            font-weight: 500;
          }

          .n-descriptions-item__content {
            color: var(--text-primary);
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .user-info {
    .user-avatar-container {
      padding: 6px 8px;
      gap: 8px;
    }

    .user-name {
      font-size: 13px;
    }
  }
}
</style>
