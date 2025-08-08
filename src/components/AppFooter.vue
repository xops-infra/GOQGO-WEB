<template>
  <div class="app-footer" :class="{ 'terminal-mode': isTerminal }">
    <div class="footer-container">
      <div class="footer-content">
        <!-- 左侧信息 -->
        <div class="footer-left">
          <div class="version-info">
            <span class="version-text" :class="{ 'terminal-text': isTerminal }">
              {{ isTerminal ? 'VERSION' : '版本' }}: {{ versionInfo.version }}
            </span>
            <span class="build-time" :class="{ 'terminal-text': isTerminal }">
              {{ isTerminal ? 'BUILD_TIME' : '构建时间' }}: {{ formatBuildTime(versionInfo.buildTime) }}
            </span>
          </div>
        </div>

        <!-- 右侧信息 -->
        <div class="footer-right">
          <div class="footer-links">
            <a 
              href="https://github.com/zhoushoujianwork/GOQGO-WEB" 
              target="_blank" 
              rel="noopener noreferrer"
              class="footer-link"
              :class="{ 'terminal-link': isTerminal }"
              title="GitHub"
            >
              <n-icon size="16">
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z"
                  />
                </svg>
              </n-icon>
            </a>
            <a 
              href="https://github.com/zhoushoujianwork/GOQGO-WEB/issues" 
              target="_blank" 
              rel="noopener noreferrer"
              class="footer-link"
              :class="{ 'terminal-link': isTerminal }"
              title="Issues"
            >
              <n-icon size="16">
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z"
                  />
                </svg>
              </n-icon>
            </a>
            <span class="project-info" :class="{ 'terminal-text': isTerminal }">
              {{ isTerminal ? 'DEVOPS' : 'DevOps' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import { useTheme } from '@/utils/theme'
import versionData from '@/version.json'

const { isTerminal } = useTheme()

// 版本信息
const versionInfo = computed(() => ({
  version: versionData.version || 'v0.2.0',
  buildTime: versionData.buildTime || new Date().toISOString(),
  commit: versionData.commit || 'unknown'
}))

// 格式化构建时间
const formatBuildTime = (buildTime: string) => {
  try {
    const date = new Date(buildTime)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return buildTime
  }
}
</script>

<style scoped lang="scss">
.app-footer {
  background: var(--footer-bg, #f8f9fa);
  border-top: 1px solid var(--border-color, #e5e7eb);
  padding: 8px 0;
  transition: all 0.3s ease;
  height: 36px;
  display: flex;
  align-items: center;

  &.terminal-mode {
    background: var(--terminal-footer-bg, #000000);
    border-top: 1px solid var(--terminal-border, #00ff41);
  }
}

.footer-container {
  width: 100%;
  padding: 0 32px;
  box-sizing: border-box;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  width: 100%;
  height: 100%;
}

.footer-left {
  .version-info {
    display: flex;
    gap: 20px;
    align-items: center;
  }

  .version-text,
  .build-time {
    color: var(--text-secondary, #6b7280);
    font-family: 'Courier New', monospace;
    font-size: 11px;
    font-weight: 500;

    &.terminal-text {
      color: #00ff41;
      text-transform: uppercase;
      text-shadow: 0 0 5px rgba(0, 255, 65, 0.3);
    }
  }
}

.footer-right {
  .footer-links {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .footer-link {
    color: var(--text-secondary, #6b7280);
    text-decoration: none;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 3px;

    &:hover {
      color: var(--primary-color, #3b82f6);
      background: rgba(59, 130, 246, 0.1);
      transform: translateY(-1px);
    }

    &.terminal-link {
      color: #00ff41;
      font-family: 'Courier New', monospace;
      text-transform: uppercase;
      text-shadow: 0 0 5px rgba(0, 255, 65, 0.5);

      &:hover {
        color: #00ffff;
        text-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
        background: rgba(0, 255, 65, 0.1);
        transform: translateY(-1px);
      }
    }
  }

  .project-info {
    color: var(--text-secondary, #6b7280);
    font-size: 11px;
    font-weight: 600;
    margin-left: 6px;
    padding: 3px 6px;
    border-radius: 3px;
    background: rgba(107, 114, 128, 0.1);
    transition: all 0.2s ease;

    &:hover {
      background: rgba(107, 114, 128, 0.2);
    }

    &.terminal-text {
      color: #00ff41;
      font-family: 'Courier New', monospace;
      text-transform: uppercase;
      background: rgba(0, 255, 65, 0.1);
      border: 1px solid rgba(0, 255, 65, 0.3);
      text-shadow: 0 0 5px rgba(0, 255, 65, 0.5);

      &:hover {
        background: rgba(0, 255, 65, 0.2);
        border-color: rgba(0, 255, 65, 0.5);
        transform: translateY(-1px);
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .footer-container {
    padding: 0 20px;
  }

  .footer-content {
    flex-direction: column;
    gap: 6px;
    text-align: center;
  }

  .footer-left .version-info {
    flex-direction: column;
    gap: 2px;
  }

  .footer-right .footer-links {
    gap: 10px;
  }

  .footer-left .version-text,
  .footer-left .build-time {
    font-size: 10px;
  }

  .footer-right .project-info {
    font-size: 10px;
    padding: 2px 5px;
  }
}

@media (max-width: 480px) {
  .footer-container {
    padding: 0 16px;
  }

  .footer-content {
    gap: 4px;
  }

  .footer-left .version-info {
    gap: 1px;
  }

  .footer-right .footer-links {
    gap: 8px;
  }
}
</style> 