<template>
  <div class="auth-test">
    <n-card title="认证系统测试" :bordered="false">
      <n-space vertical size="large">
        <!-- 认证状态 -->
        <n-card title="认证状态" size="small">
          <n-space vertical>
            <n-tag :type="isAuthenticated ? 'success' : 'error'">
              {{ isAuthenticated ? '已认证' : '未认证' }}
            </n-tag>
            <div v-if="currentUser">
              <n-text>用户: {{ currentUser.displayName }}</n-text>
              <br>
              <n-text>邮箱: {{ currentUser.email }}</n-text>
            </div>
            <div v-if="token">
              <n-text>Token: {{ token.substring(0, 20) }}...</n-text>
            </div>
          </n-space>
        </n-card>

        <!-- API测试 -->
        <n-card title="API请求测试" size="small">
          <n-space vertical>
            <n-space>
              <n-button @click="testAuthenticatedApi" :loading="apiLoading" type="primary">
                测试需要认证的API
              </n-button>
              <n-button @click="testPublicApi" :loading="publicApiLoading">
                测试公开API
              </n-button>
            </n-space>
            
            <div v-if="apiResult">
              <n-text>API结果:</n-text>
              <n-code :code="JSON.stringify(apiResult, null, 2)" language="json" />
            </div>
            
            <div v-if="apiError">
              <n-text type="error">API错误:</n-text>
              <n-code :code="apiError" language="text" />
            </div>
          </n-space>
        </n-card>

        <!-- 认证操作 -->
        <n-card title="认证操作" size="small">
          <n-space>
            <n-button @click="clearAuth" type="warning">
              清除认证信息
            </n-button>
            <n-button @click="redirectToLogin" type="error">
              强制跳转登录
            </n-button>
            <n-button @click="simulateTokenExpiry" type="error">
              模拟Token过期
            </n-button>
          </n-space>
        </n-card>

        <!-- 日志 -->
        <n-card title="操作日志" size="small">
          <n-scrollbar style="max-height: 300px">
            <div v-for="(log, index) in logs" :key="index" class="log-item">
              <n-text :type="log.type">
                [{{ log.time }}] {{ log.message }}
              </n-text>
            </div>
          </n-scrollbar>
          <n-space style="margin-top: 12px">
            <n-button @click="clearLogs" size="small">清除日志</n-button>
          </n-space>
        </n-card>
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { authManager } from '@/utils/auth'
import { get } from '@/utils/request'
import { useMessage } from 'naive-ui'

const userStore = useUserStore()
const message = useMessage()

// 状态
const apiLoading = ref(false)
const publicApiLoading = ref(false)
const apiResult = ref<any>(null)
const apiError = ref<string>('')

// 日志
interface LogItem {
  time: string
  message: string
  type: 'default' | 'success' | 'warning' | 'error'
}

const logs = ref<LogItem[]>([])

// 计算属性
const isAuthenticated = computed(() => userStore.isAuthenticated)
const currentUser = computed(() => userStore.currentUser)
const token = computed(() => userStore.token)

// 添加日志
const addLog = (message: string, type: LogItem['type'] = 'default') => {
  logs.value.unshift({
    time: new Date().toLocaleTimeString(),
    message,
    type
  })
  
  // 限制日志数量
  if (logs.value.length > 100) {
    logs.value = logs.value.slice(0, 100)
  }
}

// 清除日志
const clearLogs = () => {
  logs.value = []
  addLog('日志已清除', 'success')
}

// 测试需要认证的API
const testAuthenticatedApi = async () => {
  apiLoading.value = true
  apiResult.value = null
  apiError.value = ''
  
  try {
    addLog('开始测试需要认证的API...', 'default')
    
    // 测试获取namespace列表（需要认证）
    const result = await get('/api/v1/namespaces')
    
    apiResult.value = result
    addLog('认证API测试成功', 'success')
    message.success('认证API测试成功')
    
  } catch (error: any) {
    console.error('认证API测试失败:', error)
    apiError.value = error.response?.data?.message || error.message || '未知错误'
    addLog(`认证API测试失败: ${apiError.value}`, 'error')
    message.error('认证API测试失败')
  } finally {
    apiLoading.value = false
  }
}

// 测试公开API
const testPublicApi = async () => {
  publicApiLoading.value = true
  apiResult.value = null
  apiError.value = ''
  
  try {
    addLog('开始测试公开API...', 'default')
    
    // 测试健康检查API（不需要认证）
    const result = await get('/api/v1/health')
    
    apiResult.value = result
    addLog('公开API测试成功', 'success')
    message.success('公开API测试成功')
    
  } catch (error: any) {
    console.error('公开API测试失败:', error)
    apiError.value = error.response?.data?.message || error.message || '未知错误'
    addLog(`公开API测试失败: ${apiError.value}`, 'error')
    message.error('公开API测试失败')
  } finally {
    publicApiLoading.value = false
  }
}

// 清除认证信息
const clearAuth = () => {
  userStore.clearAuth()
  addLog('认证信息已清除', 'warning')
  message.warning('认证信息已清除')
}

// 强制跳转登录
const redirectToLogin = () => {
  addLog('强制跳转到登录页', 'error')
  authManager.redirectToLogin('用户手动触发')
}

// 模拟Token过期
const simulateTokenExpiry = async () => {
  try {
    addLog('模拟Token过期...', 'warning')
    
    // 设置一个无效的token
    localStorage.setItem('goqgo_token', 'invalid_token_for_testing')
    
    // 尝试调用需要认证的API
    await get('/api/v1/namespaces')
    
  } catch (error: any) {
    addLog('Token过期模拟成功，应该会跳转到登录页', 'error')
    console.log('Token过期测试完成:', error)
  }
}

// 组件挂载
onMounted(() => {
  addLog('认证系统测试页面已加载', 'success')
  
  // 检查当前认证状态
  if (isAuthenticated.value) {
    addLog(`当前用户: ${currentUser.value?.displayName}`, 'success')
  } else {
    addLog('当前未登录', 'warning')
  }
})
</script>

<style scoped lang="scss">
.auth-test {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.log-item {
  padding: 4px 0;
  border-bottom: 1px solid var(--n-border-color);
  
  &:last-child {
    border-bottom: none;
  }
}
</style>
