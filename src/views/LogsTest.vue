<template>
  <div class="logs-test">
    <n-card title="日志功能测试" :bordered="false">
      <n-space vertical>
        <n-alert type="info" title="测试说明">
          这个页面用于测试新的日志功能，包括实时输出开关、刷新和历史加载功能。
        </n-alert>

        <n-form inline>
          <n-form-item label="命名空间">
            <n-input v-model:value="namespace" placeholder="default" style="width: 150px" />
          </n-form-item>
          <n-form-item label="Agent名称">
            <n-input v-model:value="agentName" placeholder="test-agent" style="width: 150px" />
          </n-form-item>
          <n-form-item>
            <n-button type="primary" @click="openLogs" :disabled="!namespace || !agentName">
              打开日志窗口
            </n-button>
          </n-form-item>
        </n-form>

        <n-divider />

        <n-space>
          <n-button @click="testApiStatus" :loading="testing">测试状态API</n-button>
          <n-button @click="testApiFollow" :loading="testing">测试跟踪API</n-button>
          <n-button @click="testApiRefresh" :loading="testing">测试刷新API</n-button>
          <n-button @click="testApiHistory" :loading="testing">测试历史API</n-button>
        </n-space>

        <n-card v-if="apiResult" title="API测试结果" size="small">
          <pre>{{ JSON.stringify(apiResult, null, 2) }}</pre>
        </n-card>
      </n-space>
    </n-card>

    <!-- 日志模态框 -->
    <AgentLogsModal
      v-model:show="showLogs"
      :agent="testAgent"
      @close="showLogs = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMessage } from 'naive-ui'
import AgentLogsModal from '@/components/AgentLogsModal.vue'
import type { Agent } from '@/api/agents'

const message = useMessage()

// 响应式数据
const namespace = ref('default')
const agentName = ref('test-agent')
const showLogs = ref(false)
const testing = ref(false)
const apiResult = ref<any>(null)

// 测试用的Agent对象
const testAgent = ref<Agent | null>(null)

// 打开日志窗口
const openLogs = () => {
  testAgent.value = {
    id: `${namespace.value}/${agentName.value}`,
    name: agentName.value,
    namespace: namespace.value,
    status: 'running',
    role: 'test-role',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  showLogs.value = true
}

// 获取认证token
const getToken = () => {
  const token = localStorage.getItem('goqgo_token')
  if (!token) {
    message.error('未找到认证token，请先登录')
    return null
  }
  return token
}

// 测试状态API
const testApiStatus = async () => {
  const token = getToken()
  if (!token) return

  testing.value = true
  try {
    const response = await fetch(
      `http://localhost:8080/api/v1/namespaces/${namespace.value}/agents/${agentName.value}/logs/status`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )

    if (!response.ok) {
      throw new Error(`API调用失败: ${response.status}`)
    }

    apiResult.value = await response.json()
    message.success('状态API测试成功')
  } catch (error) {
    console.error('状态API测试失败:', error)
    message.error('状态API测试失败: ' + (error as Error).message)
    apiResult.value = { error: (error as Error).message }
  } finally {
    testing.value = false
  }
}

// 测试跟踪API
const testApiFollow = async () => {
  const token = getToken()
  if (!token) return

  testing.value = true
  try {
    const response = await fetch(
      `http://localhost:8080/api/v1/namespaces/${namespace.value}/agents/${agentName.value}/logs/follow`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ follow: true })
      }
    )

    if (!response.ok) {
      throw new Error(`API调用失败: ${response.status}`)
    }

    apiResult.value = await response.json()
    message.success('跟踪API测试成功')
  } catch (error) {
    console.error('跟踪API测试失败:', error)
    message.error('跟踪API测试失败: ' + (error as Error).message)
    apiResult.value = { error: (error as Error).message }
  } finally {
    testing.value = false
  }
}

// 测试刷新API
const testApiRefresh = async () => {
  const token = getToken()
  if (!token) return

  testing.value = true
  try {
    const response = await fetch(
      `http://localhost:8080/api/v1/namespaces/${namespace.value}/agents/${agentName.value}/logs/refresh`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lines: 100 })
      }
    )

    if (!response.ok) {
      throw new Error(`API调用失败: ${response.status}`)
    }

    apiResult.value = await response.json()
    message.success('刷新API测试成功')
  } catch (error) {
    console.error('刷新API测试失败:', error)
    message.error('刷新API测试失败: ' + (error as Error).message)
    apiResult.value = { error: (error as Error).message }
  } finally {
    testing.value = false
  }
}

// 测试历史API
const testApiHistory = async () => {
  const token = getToken()
  if (!token) return

  testing.value = true
  try {
    const response = await fetch(
      `http://localhost:8080/api/v1/namespaces/${namespace.value}/agents/${agentName.value}/logs/history`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ offset: 0, lines: 50 })
      }
    )

    if (!response.ok) {
      throw new Error(`API调用失败: ${response.status}`)
    }

    apiResult.value = await response.json()
    message.success('历史API测试成功')
  } catch (error) {
    console.error('历史API测试失败:', error)
    message.error('历史API测试失败: ' + (error as Error).message)
    apiResult.value = { error: (error as Error).message }
  } finally {
    testing.value = false
  }
}
</script>

<style scoped lang="scss">
.logs-test {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;

  pre {
    background: #f5f5f5;
    padding: 12px;
    border-radius: 4px;
    font-size: 12px;
    max-height: 300px;
    overflow-y: auto;
  }
}
</style>
