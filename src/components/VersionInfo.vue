<template>
  <div class="version-info-container">
    <!-- 版本显示 -->
    <span class="version-info" @click="showDetails = !showDetails">
      Version: {{ displayVersion }}
      <n-icon v-if="hasUpdate" class="update-indicator" color="#52c41a">
        <svg viewBox="0 0 24 24">
          <path fill="currentColor" d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z"/>
        </svg>
      </n-icon>
    </span>

    <!-- 详细信息弹窗 -->
    <n-modal v-model:show="showDetails" preset="card" title="版本信息" style="width: 500px;">
      <div class="version-details">
        <div class="version-item">
          <span class="label">当前版本:</span>
          <span class="value">{{ localVersion?.version || 'unknown' }}</span>
        </div>
        
        <div class="version-item">
          <span class="label">构建时间:</span>
          <span class="value">{{ buildTimeFormatted }}</span>
        </div>
        
        <div class="version-item">
          <span class="label">提交信息:</span>
          <span class="value">{{ localVersion?.commitHash }} ({{ localVersion?.commitDate }})</span>
        </div>
        
        <div class="version-item">
          <span class="label">环境:</span>
          <span class="value" :class="environmentClass">{{ localVersion?.environment }}</span>
        </div>

        <!-- 更新信息 -->
        <div v-if="updateInfo" class="update-section">
          <n-divider />
          <div class="update-header">
            <n-icon color="#52c41a" size="20">
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z"/>
              </svg>
            </n-icon>
            <span class="update-title">发现新版本: {{ updateInfo.remoteVersion }}</span>
          </div>
          
          <div class="version-item">
            <span class="label">发布时间:</span>
            <span class="value">{{ formatReleaseTime(updateInfo.updateInfo?.published_at) }}</span>
          </div>
          
          <div v-if="updateInfo.updateInfo?.body" class="release-notes">
            <span class="label">更新说明:</span>
            <div class="notes-content">{{ updateInfo.updateInfo.body }}</div>
          </div>
          
          <div class="update-actions">
            <n-button 
              type="primary" 
              @click="openGitHubRelease"
              :disabled="!updateInfo.updateInfo?.html_url"
            >
              查看更新
            </n-button>
            <n-button @click="checkUpdate" :loading="checking">
              重新检查
            </n-button>
          </div>
        </div>
        
        <!-- 无更新时的检查按钮 -->
        <div v-else class="check-section">
          <n-divider />
          <n-button @click="checkUpdate" :loading="checking" block>
            检查更新
          </n-button>
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { NIcon, NModal, NButton, NDivider, useMessage } from 'naive-ui'
import { 
  getLocalVersion, 
  checkForUpdates, 
  formatVersionDisplay, 
  formatBuildTime,
  type VersionInfo 
} from '@/utils/version'

// 响应式数据
const showDetails = ref(false)
const localVersion = ref<VersionInfo | null>(null)
const updateInfo = ref<any>(null)
const checking = ref(false)

const message = useMessage()

// 计算属性
const displayVersion = computed(() => {
  if (!localVersion.value) return '内测版'
  return formatVersionDisplay(localVersion.value)
})

const buildTimeFormatted = computed(() => {
  if (!localVersion.value?.buildTime) return 'unknown'
  return formatBuildTime(localVersion.value.buildTime)
})

const environmentClass = computed(() => {
  const env = localVersion.value?.environment
  return {
    'env-development': env === 'development',
    'env-production': env === 'production'
  }
})

const hasUpdate = computed(() => {
  return updateInfo.value?.hasUpdate || false
})

// 方法
const loadLocalVersion = async () => {
  localVersion.value = await getLocalVersion()
}

const checkUpdate = async () => {
  checking.value = true
  try {
    const result = await checkForUpdates()
    updateInfo.value = result
    
    if (result.hasUpdate) {
      message.success(`发现新版本 ${result.remoteVersion}`)
    } else {
      message.info('当前已是最新版本')
    }
  } catch (error) {
    console.error('检查更新失败:', error)
    message.error('检查更新失败')
  } finally {
    checking.value = false
  }
}

const openGitHubRelease = () => {
  if (updateInfo.value?.updateInfo?.html_url) {
    window.open(updateInfo.value.updateInfo.html_url, '_blank')
  }
}

const formatReleaseTime = (publishedAt?: string) => {
  if (!publishedAt) return 'unknown'
  return formatBuildTime(publishedAt)
}

// 生命周期
onMounted(async () => {
  await loadLocalVersion()
  // 自动检查更新（静默）
  checkUpdate()
})
</script>

<style scoped lang="scss">
.version-info-container {
  position: relative;
  padding-bottom: 8px; // 改用 padding-bottom 而不是 margin-bottom
}

.version-info {
  font-size: 12px;
  color: white;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: color 0.3s ease;
  transform: translateY(4px); // 向下移动 4px

  &:hover {
    color: #1890ff;
  }

  .update-indicator {
    animation: pulse 2s infinite;
  }
}

.version-details {
  .version-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .label {
      font-weight: 500;
      color: #595959;
    }

    .value {
      color: #262626;
      font-family: 'JetBrains Mono', monospace;

      &.env-development {
        color: #faad14;
      }

      &.env-production {
        color: #52c41a;
      }
    }
  }

  .update-section {
    margin-top: 16px;

    .update-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;

      .update-title {
        font-weight: 600;
        color: #52c41a;
      }
    }

    .release-notes {
      margin: 12px 0;

      .label {
        display: block;
        font-weight: 500;
        color: #595959;
        margin-bottom: 8px;
      }

      .notes-content {
        background: #f6f8fa;
        padding: 12px;
        border-radius: 6px;
        font-size: 13px;
        line-height: 1.5;
        color: #262626;
        white-space: pre-wrap;
        max-height: 200px;
        overflow-y: auto;
      }
    }

    .update-actions {
      display: flex;
      gap: 12px;
      margin-top: 16px;
    }
  }

  .check-section {
    margin-top: 16px;
  }
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
</style>
