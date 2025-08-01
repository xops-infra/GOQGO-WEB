<template>
  <div class="login-status-test">
    <n-card title="登录状态测试" :bordered="false">
      <n-space vertical size="large">
        <!-- 用户状态显示 -->
        <div>
          <n-space>
            <n-statistic label="是否已登录" :value="userStore.isAuthenticated ? '是' : '否'" />
            <n-statistic label="用户名" :value="userStore.currentUser?.username || '未登录'" />
            <n-statistic label="显示名" :value="userStore.currentUser?.displayName || '未设置'" />
            <n-statistic label="Token长度" :value="userStore.token?.length || 0" />
          </n-space>
        </div>

        <!-- 用户信息详情 -->
        <div>
          <n-text strong>用户信息详情：</n-text>
          <n-card size="small" style="margin-top: 8px">
            <pre>{{ JSON.stringify(userStore.currentUser, null, 2) }}</pre>
          </n-card>
        </div>

        <!-- 用户数据详情 -->
        <div>
          <n-text strong>用户数据详情：</n-text>
          <n-card size="small" style="margin-top: 8px">
            <pre>{{ JSON.stringify(userStore.currentUserData, null, 2) }}</pre>
          </n-card>
        </div>

        <!-- 操作按钮 -->
        <div>
          <n-space>
            <n-button @click="refreshUserInfo" :loading="userStore.loading">
              刷新用户信息
            </n-button>
            <n-button @click="testLogout" type="error"> 测试登出 </n-button>
            <n-button @click="goToLogin" type="primary"> 跳转登录页 </n-button>
          </n-space>
        </div>

        <!-- UserInfo组件测试 -->
        <div>
          <n-text strong>UserInfo组件测试：</n-text>
          <div
            style="
              margin-top: 8px;
              padding: 16px;
              border: 1px solid var(--border-primary);
              border-radius: 8px;
            "
          >
            <UserInfo />
          </div>
        </div>

        <!-- 错误信息 -->
        <div v-if="userStore.error">
          <n-alert type="error" :title="'错误信息'">
            {{ userStore.error }}
          </n-alert>
        </div>
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useMessage } from 'naive-ui'
import UserInfo from '@/components/UserInfo.vue'

const router = useRouter()
const userStore = useUserStore()
const message = useMessage()

// 刷新用户信息
const refreshUserInfo = async () => {
  if (!userStore.currentUser?.username) {
    message.warning('用户未登录')
    return
  }

  try {
    await userStore.fetchCurrentUser(userStore.currentUser.username)
    message.success('用户信息已刷新')
  } catch (error) {
    message.error('刷新用户信息失败')
  }
}

// 测试登出
const testLogout = () => {
  userStore.logout()
  message.success('已登出')
  router.push('/login')
}

// 跳转登录页
const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped lang="scss">
.login-status-test {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

pre {
  background: var(--bg-tertiary);
  padding: 12px;
  border-radius: 6px;
  font-size: 12px;
  line-height: 1.4;
  overflow-x: auto;
  max-height: 300px;
  overflow-y: auto;
}
</style>
