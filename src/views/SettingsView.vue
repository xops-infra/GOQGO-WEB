<template>
  <div class="settings-view">
    <!-- 页面头部信息 -->
    <div class="page-header">
      <div class="page-info">
        <h1 class="page-title">{{ isTerminal ? 'SYSTEM_SETTINGS' : '系统设置' }}</h1>
        <p class="page-description">{{ isTerminal ? 'CONFIGURE_SYSTEM_PARAMETERS' : '配置系统参数和偏好设置' }}</p>
      </div>
    </div>

    <!-- 页面内容 -->
    <div class="page-content">
      <div class="settings-content" :class="{ 'terminal-mode': isTerminal }">
        <!-- 设置分类 -->
        <n-tabs type="line" animated>
          <n-tab-pane name="general" :tab="isTerminal ? 'GENERAL' : '常规'">
            <div class="settings-section">
              <h3>{{ isTerminal ? 'GENERAL_SETTINGS' : '常规设置' }}</h3>
              <n-form :model="generalSettings" label-placement="left" label-width="auto">
                <n-form-item :label="isTerminal ? 'LANGUAGE' : '语言'">
                  <n-select v-model:value="generalSettings.language" :options="languageOptions" />
                </n-form-item>
                <n-form-item :label="isTerminal ? 'TIMEZONE' : '时区'">
                  <n-select v-model:value="generalSettings.timezone" :options="timezoneOptions" />
                </n-form-item>
              </n-form>
            </div>
          </n-tab-pane>
          
          <n-tab-pane name="appearance" :tab="isTerminal ? 'APPEARANCE' : '外观'">
            <div class="settings-section">
              <h3>{{ isTerminal ? 'APPEARANCE_SETTINGS' : '外观设置' }}</h3>
              <n-form :model="appearanceSettings" label-placement="left" label-width="auto">
                <n-form-item :label="isTerminal ? 'THEME' : '主题'">
                  <n-select v-model:value="appearanceSettings.theme" :options="themeOptions" />
                </n-form-item>
                <n-form-item :label="isTerminal ? 'FONT_SIZE' : '字体大小'">
                  <n-slider v-model:value="appearanceSettings.fontSize" :min="12" :max="20" />
                </n-form-item>
              </n-form>
            </div>
          </n-tab-pane>
          
          <n-tab-pane name="notifications" :tab="isTerminal ? 'NOTIFICATIONS' : '通知'">
            <div class="settings-section">
              <h3>{{ isTerminal ? 'NOTIFICATION_SETTINGS' : '通知设置' }}</h3>
              <n-form :model="notificationSettings" label-placement="left" label-width="auto">
                <n-form-item :label="isTerminal ? 'ENABLE_NOTIFICATIONS' : '启用通知'">
                  <n-switch v-model:value="notificationSettings.enabled" />
                </n-form-item>
                <n-form-item :label="isTerminal ? 'SOUND_NOTIFICATIONS' : '声音通知'">
                  <n-switch v-model:value="notificationSettings.sound" />
                </n-form-item>
              </n-form>
            </div>
          </n-tab-pane>
        </n-tabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { NForm, NFormItem, NInput, NSelect, NSwitch, NButton, NSpace, NCard, NInputNumber, useMessage } from 'naive-ui'
import { useTheme } from '@/utils/theme'
import { useUserStore } from '@/stores/user'
import PageLayout from '@/components/PageLayout.vue'

const { isTerminal } = useTheme()
const userStore = useUserStore()
const message = useMessage()

// 响应式数据
const formRef = ref()
const saving = ref(false)

const formData = reactive({
  apiEndpoint: 'http://localhost:8000',
  websocketUrl: 'ws://localhost:8000/ws',
  defaultNamespace: 'default',
  themeMode: 'auto',
  autoRefresh: true,
  refreshInterval: 30
})

const themeModeOptions = [
  { label: isTerminal.value ? 'AUTO' : '自动', value: 'auto' },
  { label: isTerminal.value ? 'LIGHT' : '浅色', value: 'light' },
  { label: isTerminal.value ? 'DARK' : '深色', value: 'dark' },
  { label: isTerminal.value ? 'TERMINAL' : '终端', value: 'terminal' }
]

const rules = {
  apiEndpoint: [
    { required: true, message: '请输入API端点地址', trigger: 'blur' },
    { type: 'url', message: '请输入有效的URL地址', trigger: 'blur' }
  ],
  websocketUrl: [
    { required: true, message: '请输入WebSocket地址', trigger: 'blur' }
  ],
  defaultNamespace: [
    { required: true, message: '请输入默认命名空间', trigger: 'blur' }
  ],
  refreshInterval: [
    { type: 'number', min: 5, max: 300, message: '刷新间隔必须在5-300秒之间', trigger: 'blur' }
  ]
}

// 方法
const handleSave = async () => {
  try {
    await formRef.value?.validate()
    saving.value = true
    
    // 这里应该调用API保存设置
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
    
    message.success(isTerminal.value ? 'SETTINGS_SAVED' : '设置已保存')
  } catch (error) {
    console.error('保存设置失败:', error)
    message.error(isTerminal.value ? 'SAVE_FAILED' : '保存失败')
  } finally {
    saving.value = false
  }
}

const handleReset = () => {
  formData.apiEndpoint = 'http://localhost:8000'
  formData.websocketUrl = 'ws://localhost:8000/ws'
  formData.defaultNamespace = 'default'
  formData.themeMode = 'auto'
  formData.autoRefresh = true
  formData.refreshInterval = 30
  
  message.info(isTerminal.value ? 'SETTINGS_RESET' : '设置已重置')
}
</script>

<style scoped lang="scss">
.settings-content {
  max-width: 800px;
  margin: 0 auto;

  &.terminal-mode {
    background: var(--terminal-bg);
  }
}

:deep(.n-card) {
  &.terminal-window {
    background: var(--terminal-card-bg);
    border: 1px solid var(--terminal-border);
    
    .n-card-header {
      background: var(--terminal-header-bg);
      border-bottom-color: var(--terminal-border);
      
      .card-header {
        &.terminal-header {
          color: var(--terminal-text);
          font-family: 'Courier New', monospace;
        }
      }
    }
  }
}

:deep(.n-form) {
  &.terminal-form {
    .n-form-item-label {
      color: var(--terminal-text);
      font-family: 'Courier New', monospace;
    }
  }
}

// Terminal模式样式
.terminal-mode {
  .terminal-input {
    :deep(.n-input) {
      background: var(--terminal-input-bg);
      border-color: var(--terminal-border);
      color: var(--terminal-text);
      font-family: 'Courier New', monospace;
    }
  }
  
  .terminal-select {
    :deep(.n-base-selection) {
      background: var(--terminal-input-bg);
      border-color: var(--terminal-border);
      color: var(--terminal-text);
      font-family: 'Courier New', monospace;
    }
  }
  
  .terminal-input-number {
    :deep(.n-input-number) {
      background: var(--terminal-input-bg);
      border-color: var(--terminal-border);
      color: var(--terminal-text);
      font-family: 'Courier New', monospace;
    }
  }
  
  .terminal-switch {
    :deep(.n-switch) {
      --n-rail-color: var(--terminal-border);
      --n-rail-color-active: var(--terminal-primary);
    }
  }
  
  .btn-8bit {
    background: var(--terminal-button-bg);
    border-color: var(--terminal-border);
    color: var(--terminal-text);
    font-family: 'Courier New', monospace;
    
    &:hover {
      background: var(--terminal-button-hover-bg);
    }
    
    &.n-button--primary-type {
      background: var(--terminal-primary);
      border-color: var(--terminal-primary);
      
      &:hover {
        background: var(--terminal-primary-hover);
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .settings-content {
    max-width: 100%;
  }
}
</style>
