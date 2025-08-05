<template>
  <div class="version-display">
    <div class="version-info">
      <span class="version-label">版本:</span>
      <span class="version-value">{{ version }}</span>
    </div>
    <div class="build-info">
      <span class="build-label">构建:</span>
      <span class="build-value">{{ buildTime }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// 从环境变量或构建时注入的版本信息获取
const version = computed(() => {
  return import.meta.env.VITE_APP_VERSION || 'v0.2.0'
})

const buildTime = computed(() => {
  const buildTime = import.meta.env.VITE_BUILD_TIME
  if (buildTime) {
    try {
      const date = new Date(buildTime)
      return date.toLocaleDateString('zh-CN')
    } catch {
      return buildTime
    }
  }
  return new Date().toLocaleDateString('zh-CN')
})
</script>

<style scoped lang="scss">
.version-display {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  opacity: 0.8;
}

.version-info,
.build-info {
  display: flex;
  align-items: center;
  gap: 6px;
}

.version-label,
.build-label {
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.version-value,
.build-value {
  color: rgba(255, 255, 255, 0.9);
  font-family: var(--font-mono);
}

// Terminal主题样式
[data-theme='terminal'] .version-display {
  .version-label,
  .build-label {
    color: var(--terminal-text-secondary);
    font-family: var(--font-mono);
    text-transform: uppercase;
  }
  
  .version-value,
  .build-value {
    color: var(--pixel-green);
    font-family: var(--font-mono);
  }
}
</style>
