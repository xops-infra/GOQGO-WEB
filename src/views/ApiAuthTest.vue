<template>
  <div class="api-auth-test">
    <n-card title="API认证测试" :bordered="false">
      <n-space vertical size="large">
        <!-- 当前认证状态 -->
        <div>
          <n-text strong>当前认证状态：</n-text>
          <n-space style="margin-top: 8px;">
            <n-statistic label="登录状态" :value="userStore.isAuthenticated ? '已登录' : '未登录'" />
            <n-statistic label="Token状态" :value="hasToken ? '有Token' : '无Token'" />
            <n-statistic label="Token长度" :value="tokenLength" />
          </n-space>
        </div>

        <!-- Token信息显示 -->
        <div v-if="hasToken">
          <n-text strong>Token信息：</n-text>
          <n-card size="small" style="margin-top: 8px;">
            <div class="token-info">
              <p><strong>Token前缀:</strong> {{ tokenPrefix }}</p>
              <p><strong>完整Token:</strong> <code>{{ maskedToken }}</code></p>
              <p><strong>用户信息:</strong> {{ userStore.currentUser?.displayName }} ({{ userStore.currentUser?.email }})</p>
            </div>
          </n-card>
        </div>

        <!-- API测试按钮 -->
        <div>
          <n-text strong>API测试：</n-text>
          <n-space style="margin-top: 8px;">
            <n-button @click="testAgentsAPI" :loading="isLoading" type="primary">
              测试Agents API
            </n-button>
            <n-button @click="testNamespacesAPI" :loading="isLoading" type="info">
              测试Namespaces API
            </n-button>
            <n-button @click="testUsersAPI" :loading="isLoading" type="warning">
              测试Users API
            </n-button>
            <n-button @click="testChatAPI" :loading="isLoading" type="success">
              测试Chat API
            </n-button>
            <n-button @click="clearLogs" :disabled="testLogs.length === 0">
              清除日志
            </n-button>
          </n-space>
        </div>

        <!-- 测试结果 -->
        <div>
          <n-text strong>测试结果：</n-text>
          <n-card size="small" style="margin-top: 8px; max-height: 400px; overflow-y: auto;">
            <div v-if="testLogs.length === 0" style="text-align: center; color: #999; padding: 20px;">
              暂无测试结果
            </div>
            <div v-else>
              <div 
                v-for="(log, index) in testLogs" 
                :key="index"
                class="log-item"
                :class="log.type"
              >
                <div class="log-header">
                  <span class="log-time">{{ log.time }}</span>
                  <span class="log-type">{{ log.type.toUpperCase() }}</span>
                  <span class="log-api">{{ log.api }}</span>
                </div>
                <div class="log-message">{{ log.message }}</div>
                <div v-if="log.details" class="log-details">
                  <pre>{{ JSON.stringify(log.details, null, 2) }}</pre>
                </div>
              </div>
            </div>
          </n-card>
        </div>

        <!-- 错误处理说明 -->
        <div>
          <n-text strong>错误处理说明：</n-text>
          <n-card size="small" style="margin-top: 8px;">
            <div class="error-examples">
              <div class="error-example">
                <h4>401 未授权错误:</h4>
                <pre>{{ JSON.stringify(authErrorExample, null, 2) }}</pre>
              </div>
              <div class="error-example">
                <h4>正确的请求头:</h4>
                <pre>{{ JSON.stringify(correctHeaderExample, null, 2) }}</pre>
              </div>
            </div>
          </n-card>
        </div>
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useMessage } from 'naive-ui'
import { agentApi } from '@/api/agents'
import { namespaceApi } from '@/api/namespaces'
import { userApi } from '@/api/users'
import { chatApi } from '@/api/chat'

const userStore = useUserStore()
const message = useMessage()
const isLoading = ref(false)

// 测试日志
const testLogs = ref<Array<{
  time: string
  type: 'info' | 'success' | 'error' | 'warning'
  api: string
  message: string
  details?: any
}>>([])

// Token相关计算属性
const hasToken = computed(() => !!userStore.token)
const tokenLength = computed(() => userStore.token?.length || 0)
const tokenPrefix = computed(() => userStore.token?.substring(0, 20) + '...' || '')
const maskedToken = computed(() => {
  const token = userStore.token
  if (!token) return ''
  if (token.length <= 20) return token
  return token.substring(0, 10) + '...' + token.substring(token.length - 10)
})

// 错误示例
const authErrorExample = {
  error: "authorization header required",
  message: "请在请求头中提供 Authorization token"
}

const correctHeaderExample = {
  "Authorization": "Bearer f2d7475a2de7d92feb2868b16acb2d215f0c43273a531d64bc4c090b430f8ff9",
  "Content-Type": "application/json"
}

// 添加日志
const addLog = (type: 'info' | 'success' | 'error' | 'warning', api: string, message: string, details?: any) => {
  testLogs.value.unshift({
    time: new Date().toLocaleTimeString(),
    type,
    api,
    message,
    details
  })
  
  // 限制日志数量
  if (testLogs.value.length > 50) {
    testLogs.value = testLogs.value.slice(0, 50)
  }
}

// 测试Agents API
const testAgentsAPI = async () => {
  isLoading.value = true
  addLog('info', 'Agents API', '开始测试获取智能体列表')
  
  try {
    const result = await agentApi.getList('default')
    addLog('success', 'Agents API', `成功获取智能体列表，共 ${result.items?.length || 0} 个智能体`, result)
    message.success('Agents API测试成功')
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message
    addLog('error', 'Agents API', `测试失败: ${errorMsg}`, error.response?.data)
    message.error(`Agents API测试失败: ${errorMsg}`)
  } finally {
    isLoading.value = false
  }
}

// 测试Namespaces API
const testNamespacesAPI = async () => {
  isLoading.value = true
  addLog('info', 'Namespaces API', '开始测试获取命名空间列表')
  
  try {
    const result = await namespaceApi.getList()
    addLog('success', 'Namespaces API', `成功获取命名空间列表，共 ${result.items?.length || 0} 个命名空间`, result)
    message.success('Namespaces API测试成功')
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message
    addLog('error', 'Namespaces API', `测试失败: ${errorMsg}`, error.response?.data)
    message.error(`Namespaces API测试失败: ${errorMsg}`)
  } finally {
    isLoading.value = false
  }
}

// 测试Users API
const testUsersAPI = async () => {
  isLoading.value = true
  addLog('info', 'Users API', '开始测试获取用户列表')
  
  try {
    const result = await userApi.getList()
    addLog('success', 'Users API', `成功获取用户列表，共 ${result.items?.length || 0} 个用户`, result)
    message.success('Users API测试成功')
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message
    addLog('error', 'Users API', `测试失败: ${errorMsg}`, error.response?.data)
    message.error(`Users API测试失败: ${errorMsg}`)
  } finally {
    isLoading.value = false
  }
}

// 测试Chat API
const testChatAPI = async () => {
  isLoading.value = true
  addLog('info', 'Chat API', '开始测试获取聊天历史')
  
  try {
    const result = await chatApi.getChatHistory('default', 10)
    addLog('success', 'Chat API', `成功获取聊天历史，共 ${result.length || 0} 条消息`, result)
    message.success('Chat API测试成功')
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message
    addLog('error', 'Chat API', `测试失败: ${errorMsg}`, error.response?.data)
    message.error(`Chat API测试失败: ${errorMsg}`)
  } finally {
    isLoading.value = false
  }
}

// 清除日志
const clearLogs = () => {
  testLogs.value = []
  addLog('info', 'System', '已清除所有测试日志')
}
</script>

<style scoped lang="scss">
.api-auth-test {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.token-info {
  p {
    margin: 8px 0;
    
    code {
      background: var(--bg-tertiary);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'JetBrains Mono', 'Consolas', monospace;
      font-size: 0.85rem;
      color: var(--color-primary);
      border: 1px solid var(--border-primary);
    }
  }
}

.log-item {
  padding: 12px 0;
  border-bottom: 1px solid var(--border-secondary);
  
  &:last-child {
    border-bottom: none;
  }
  
  .log-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 4px;
    
    .log-time {
      color: var(--text-tertiary);
      font-size: 11px;
      font-family: monospace;
      min-width: 80px;
    }
    
    .log-type {
      font-size: 11px;
      font-weight: bold;
      font-family: monospace;
      min-width: 60px;
    }
    
    .log-api {
      font-size: 12px;
      font-weight: 500;
      color: var(--text-secondary);
      min-width: 100px;
    }
  }
  
  .log-message {
    color: var(--text-primary);
    font-size: 13px;
    margin-bottom: 8px;
  }
  
  .log-details {
    background: var(--bg-tertiary);
    border-radius: 4px;
    padding: 8px;
    margin-top: 8px;
    
    pre {
      margin: 0;
      font-size: 11px;
      line-height: 1.4;
      color: var(--text-secondary);
      max-height: 200px;
      overflow-y: auto;
    }
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

.error-examples {
  display: grid;
  gap: 16px;
  
  .error-example {
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
  .error-examples {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
