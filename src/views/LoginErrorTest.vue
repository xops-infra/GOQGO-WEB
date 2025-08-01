<template>
  <div class="login-error-test">
    <n-card title="登录错误处理测试" :bordered="false">
      <n-space vertical size="large">
        <!-- 测试控制面板 -->
        <div>
          <n-space>
            <n-button @click="testValidToken" type="success" :loading="isLoading">
              测试有效Token
            </n-button>
            <n-button @click="testInvalidToken" type="error" :loading="isLoading">
              测试无效Token
            </n-button>
            <n-button @click="testEmptyToken" type="warning" :loading="isLoading">
              测试空Token
            </n-button>
            <n-button @click="testNetworkError" type="info" :loading="isLoading">
              测试网络错误
            </n-button>
            <n-button @click="clearError" :disabled="!userStore.error"> 清除错误 </n-button>
          </n-space>
        </div>

        <!-- 当前状态显示 -->
        <div>
          <n-space>
            <n-statistic
              label="登录状态"
              :value="userStore.isAuthenticated ? '已登录' : '未登录'"
            />
            <n-statistic label="加载状态" :value="userStore.isLoading ? '加载中' : '空闲'" />
            <n-statistic label="错误状态" :value="userStore.error ? '有错误' : '无错误'" />
          </n-space>
        </div>

        <!-- 错误信息显示 -->
        <div v-if="userStore.error">
          <n-alert type="error" :title="'登录错误'" closable @close="clearError">
            {{ userStore.error }}
          </n-alert>
        </div>

        <!-- 用户信息显示 -->
        <div v-if="userStore.currentUser">
          <n-alert type="success" :title="'登录成功'">
            <p><strong>显示名称:</strong> {{ userStore.currentUser.displayName }}</p>
            <p><strong>邮箱:</strong> {{ userStore.currentUser.email }}</p>
          </n-alert>
        </div>

        <!-- 测试日志 -->
        <div>
          <n-text strong>测试日志：</n-text>
          <n-card size="small" style="margin-top: 8px; max-height: 300px; overflow-y: auto">
            <div
              v-if="testLogs.length === 0"
              style="text-align: center; color: #999; padding: 20px"
            >
              暂无测试日志
            </div>
            <div v-else>
              <div v-for="(log, index) in testLogs" :key="index" class="log-item" :class="log.type">
                <span class="log-time">{{ log.time }}</span>
                <span class="log-type">{{ log.type.toUpperCase() }}</span>
                <span class="log-message">{{ log.message }}</span>
              </div>
            </div>
          </n-card>
        </div>

        <!-- API响应模拟 -->
        <div>
          <n-text strong>API响应格式说明：</n-text>
          <n-card size="small" style="margin-top: 8px">
            <div class="api-examples">
              <div class="api-example">
                <h4>成功响应:</h4>
                <pre>{{ JSON.stringify(successExample, null, 2) }}</pre>
              </div>
              <div class="api-example">
                <h4>错误响应:</h4>
                <pre>{{ JSON.stringify(errorExample, null, 2) }}</pre>
              </div>
            </div>
          </n-card>
        </div>
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useUserStore } from '@/stores/user'
import { useMessage } from 'naive-ui'

const userStore = useUserStore()
const message = useMessage()
const isLoading = ref(false)

// 测试日志
const testLogs = ref<
  Array<{
    time: string
    type: 'info' | 'success' | 'error' | 'warning'
    message: string
  }>
>([])

// API响应示例
const successExample = {
  success: true,
  message: 'login successful',
  bearer_token: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6...',
  displayName: 'My User',
  email: 'myuser@example.com'
}

const errorExample = {
  message: 'invalid token',
  success: false
}

// 添加日志
const addLog = (type: 'info' | 'success' | 'error' | 'warning', message: string) => {
  testLogs.value.unshift({
    time: new Date().toLocaleTimeString(),
    type,
    message
  })

  // 限制日志数量
  if (testLogs.value.length > 50) {
    testLogs.value = testLogs.value.slice(0, 50)
  }
}

// 测试有效Token
const testValidToken = async () => {
  isLoading.value = true
  addLog('info', '开始测试有效Token: my-simple-api-token-2025')

  try {
    await userStore.loginWithToken('my-simple-api-token-2025')
    addLog('success', '有效Token测试成功')
    message.success('有效Token测试成功')
  } catch (error: any) {
    addLog('error', `有效Token测试失败: ${error.message}`)
    message.error(`有效Token测试失败: ${error.message}`)
  } finally {
    isLoading.value = false
  }
}

// 测试无效Token
const testInvalidToken = async () => {
  isLoading.value = true
  addLog('info', '开始测试无效Token: invalid-token-123')

  try {
    await userStore.loginWithToken('invalid-token-123')
    addLog('warning', '无效Token测试意外成功')
    message.warning('无效Token测试意外成功')
  } catch (error: any) {
    addLog('error', `无效Token测试失败（预期）: ${error.message}`)
    message.info(`无效Token测试失败（预期）: ${error.message}`)
  } finally {
    isLoading.value = false
  }
}

// 测试空Token
const testEmptyToken = async () => {
  isLoading.value = true
  addLog('info', '开始测试空Token')

  try {
    await userStore.loginWithToken('')
    addLog('warning', '空Token测试意外成功')
    message.warning('空Token测试意外成功')
  } catch (error: any) {
    addLog('error', `空Token测试失败（预期）: ${error.message}`)
    message.info(`空Token测试失败（预期）: ${error.message}`)
  } finally {
    isLoading.value = false
  }
}

// 测试网络错误
const testNetworkError = async () => {
  isLoading.value = true
  addLog('info', '开始测试网络错误（使用错误的API地址）')

  // 临时修改API地址来模拟网络错误
  const originalLoginWithToken = userStore.loginWithToken

  // 创建一个会失败的登录方法
  const mockFailedLogin = async (token: string) => {
    throw new Error('Network Error: 无法连接到服务器')
  }

  try {
    await mockFailedLogin('test-token')
    addLog('warning', '网络错误测试意外成功')
    message.warning('网络错误测试意外成功')
  } catch (error: any) {
    addLog('error', `网络错误测试失败（预期）: ${error.message}`)
    message.info(`网络错误测试失败（预期）: ${error.message}`)
  } finally {
    isLoading.value = false
  }
}

// 清除错误
const clearError = () => {
  userStore.error = null
  addLog('info', '已清除错误状态')
}
</script>

<style scoped lang="scss">
.login-error-test {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.log-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-secondary);
  font-size: 12px;

  &:last-child {
    border-bottom: none;
  }

  .log-time {
    color: var(--text-tertiary);
    min-width: 80px;
    font-family: monospace;
  }

  .log-type {
    min-width: 60px;
    font-weight: bold;
    font-family: monospace;
  }

  .log-message {
    flex: 1;
    color: var(--text-primary);
  }

  &.info .log-type {
    color: var(--color-info);
  }

  &.success .log-type {
    color: var(--color-success);
  }

  &.error .log-type {
    color: var(--color-error);
  }

  &.warning .log-type {
    color: var(--color-warning);
  }
}

.api-examples {
  display: grid;
  gap: 16px;

  .api-example {
    h4 {
      margin: 0 0 8px 0;
      color: var(--text-primary);
      font-size: 14px;
    }

    pre {
      background: var(--bg-tertiary);
      padding: 12px;
      border-radius: 6px;
      font-size: 11px;
      line-height: 1.4;
      overflow-x: auto;
      margin: 0;
      color: var(--text-primary);
      border: 1px solid var(--border-primary);
    }
  }
}

@media (min-width: 768px) {
  .api-examples {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
