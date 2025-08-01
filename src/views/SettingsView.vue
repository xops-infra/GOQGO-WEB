<template>
  <div class="settings-view">
    <n-card title="系统设置" :bordered="false">
      <n-tabs type="line" animated>
        <n-tab-pane name="general" tab="通用设置">
          <n-form label-placement="left" label-width="120px">
            <n-form-item label="主题模式">
              <n-radio-group v-model:value="themeMode" @update:value="handleThemeChange">
                <n-radio value="light">浅色模式</n-radio>
                <n-radio value="dark">深色模式</n-radio>
              </n-radio-group>
            </n-form-item>

            <n-form-item label="语言设置">
              <n-select v-model:value="language" :options="languageOptions" style="width: 200px" />
            </n-form-item>

            <n-form-item label="自动保存">
              <n-switch v-model:value="autoSave" />
            </n-form-item>
          </n-form>
        </n-tab-pane>

        <n-tab-pane name="api" tab="API配置">
          <n-form label-placement="left" label-width="120px">
            <n-form-item label="API地址">
              <n-input v-model:value="apiUrl" placeholder="http://localhost:8080" />
            </n-form-item>

            <n-form-item label="超时时间">
              <n-input-number v-model:value="timeout" :min="1000" :max="60000" :step="1000">
                <template #suffix>ms</template>
              </n-input-number>
            </n-form-item>

            <n-form-item label="连接测试">
              <n-button @click="testConnection" :loading="testing"> 测试连接 </n-button>
            </n-form-item>
          </n-form>
        </n-tab-pane>

        <n-tab-pane name="about" tab="关于">
          <n-space vertical size="large">
            <div class="about-section">
              <h3>Q Chat Manager</h3>
              <p>版本: 1.0.0</p>
              <p>GoQGo AI智能体协助开发平台的Web前端界面</p>
            </div>

            <div class="about-section">
              <h4>技术栈</h4>
              <n-space>
                <n-tag>Vue 3</n-tag>
                <n-tag>TypeScript</n-tag>
                <n-tag>Naive UI</n-tag>
                <n-tag>Pinia</n-tag>
                <n-tag>Vite</n-tag>
              </n-space>
            </div>

            <div class="about-section">
              <h4>功能特性</h4>
              <ul>
                <li>🤖 AI智能体管理</li>
                <li>💬 实时聊天系统</li>
                <li>📁 项目管理</li>
                <li>🔄 实时同步</li>
                <li>📊 开发监控</li>
                <li>🎨 现代化UI</li>
              </ul>
            </div>
          </n-space>
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

// 响应式数据
const themeMode = ref(appStore.theme)
const language = ref('zh-CN')
const autoSave = ref(true)
const apiUrl = ref('http://localhost:8080')
const timeout = ref(10000)
const testing = ref(false)

const languageOptions = [
  { label: '简体中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' }
]

// 方法
const handleThemeChange = (value: 'light' | 'dark') => {
  appStore.theme = value
}

const testConnection = async () => {
  testing.value = true
  try {
    // 模拟API连接测试
    await new Promise((resolve) => setTimeout(resolve, 2000))
    console.log('连接测试成功')
  } catch (error) {
    console.error('连接测试失败:', error)
  } finally {
    testing.value = false
  }
}

// 生命周期
onMounted(() => {
  // 初始化设置
})
</script>

<style scoped lang="scss">
.settings-view {
  max-width: 800px;

  .about-section {
    h3,
    h4 {
      margin: 0 0 12px 0;
      color: var(--n-text-color);
    }

    p {
      margin: 4px 0;
      color: var(--n-text-color-disabled);
    }

    ul {
      margin: 8px 0;
      padding-left: 20px;

      li {
        margin: 4px 0;
        color: var(--n-text-color);
      }
    }
  }
}
</style>
