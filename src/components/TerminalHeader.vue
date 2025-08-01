<template>
  <div class="terminal-header" :class="{ 'terminal-style': isTerminal }">
    <div class="header-content">
      <!-- Logo和标题 -->
      <div class="logo-section">
        <div class="logo" :class="{ 'neon-text neon-green': isTerminal }">
          <TerminalIcons name="terminal" :size="32" :glow="isTerminal" :animated="isTerminal" />
        </div>
        <div class="title-section">
          <h1 class="app-title" :class="{ 'neon-text neon-green': isTerminal }">
            {{ isTerminal ? 'GOQGO.TERMINAL' : 'GoQGo' }}
          </h1>
          <div class="subtitle" :class="{ 'terminal-prompt': isTerminal }">
            {{ isTerminal ? 'AI_AGENT_MANAGEMENT_SYSTEM' : 'AI智能体管理平台' }}
          </div>
        </div>
      </div>

      <!-- 状态指示器 -->
      <div class="status-section">
        <div class="system-status" :class="{ 'terminal-status': isTerminal }">
          <div class="status-item">
            <span class="status-label">系统状态:</span>
            <span class="status-value" :class="statusClass">
              {{ systemStatus }}
            </span>
          </div>
          <div v-if="isTerminal" class="terminal-time">
            {{ currentTime }}
          </div>
        </div>
      </div>

      <!-- 控制区域 -->
      <div class="controls-section">
        <n-space align="center" :size="16">
          <!-- 连接状态 -->
          <div class="connection-status" :class="{ 'terminal-connection': isTerminal }">
            <n-badge :color="connectionColor" dot :processing="isConnecting">
              <span class="connection-text">
                {{ connectionText }}
              </span>
            </n-badge>
          </div>

          <!-- 主题切换 -->
          <ThemeToggle />

          <!-- 用户菜单 -->
          <n-dropdown
            :options="userMenuOptions"
            @select="handleUserMenuSelect"
            trigger="click"
            placement="bottom-end"
          >
            <n-button :class="{ 'btn-8bit': isTerminal }" circle ghost>
              <template #icon>
                <n-icon size="18">
                  <PersonOutline />
                </n-icon>
              </template>
            </n-button>
          </n-dropdown>
        </n-space>
      </div>
    </div>

    <!-- Terminal风格的命令行提示 -->
    <div v-if="isTerminal" class="terminal-prompt-bar">
      <span class="prompt-prefix">root@goqgo:~$</span>
      <span class="prompt-command typewriter">{{ currentCommand }}</span>
      <span class="cursor blink">_</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { NSpace, NBadge, NButton, NDropdown, NIcon, useMessage } from 'naive-ui'
import { PersonOutline } from '@vicons/ionicons5'
import { useTheme } from '@/utils/theme'
import ThemeToggle from './ThemeToggle.vue'
import TerminalIcons from './TerminalIcons.vue'

const { isTerminal } = useTheme()
const message = useMessage()

// 系统状态
const systemStatus = ref('ONLINE')
const isConnecting = ref(false)
const currentTime = ref('')
const currentCommand = ref('system.status --verbose')

// 计算属性
const statusClass = computed(() => {
  switch (systemStatus.value) {
    case 'ONLINE':
      return isTerminal.value ? 'terminal-success' : 'text-success'
    case 'OFFLINE':
      return isTerminal.value ? 'terminal-error' : 'text-error'
    case 'MAINTENANCE':
      return isTerminal.value ? 'terminal-warning' : 'text-warning'
    default:
      return ''
  }
})

const connectionColor = computed(() => {
  if (isConnecting.value) return '#ffa657'
  return systemStatus.value === 'ONLINE' ? '#7ee787' : '#ff7b72'
})

const connectionText = computed(() => {
  if (isConnecting.value) return '连接中...'
  return systemStatus.value === 'ONLINE' ? '已连接' : '未连接'
})

// 用户菜单选项
const userMenuOptions = computed(() => [
  {
    label: '个人设置',
    key: 'settings',
    icon: () => '⚙️'
  },
  {
    label: '帮助文档',
    key: 'help',
    icon: () => '📖'
  },
  {
    type: 'divider'
  },
  {
    label: '退出登录',
    key: 'logout',
    icon: () => '🚪'
  }
])

// 处理用户菜单选择
const handleUserMenuSelect = (key: string) => {
  switch (key) {
    case 'settings':
      message.info('打开设置页面')
      break
    case 'help':
      message.info('打开帮助文档')
      break
    case 'logout':
      message.warning('退出登录')
      break
  }
}

// 更新时间
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 模拟命令切换
const commands = [
  'system.status --verbose',
  'agents.list --all',
  'monitor.performance',
  'network.check --ping',
  'security.scan --quick'
]

let commandIndex = 0
const switchCommand = () => {
  commandIndex = (commandIndex + 1) % commands.length
  currentCommand.value = commands[commandIndex]
}

let timeInterval: number | null = null
let commandInterval: number | null = null

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)

  if (isTerminal.value) {
    commandInterval = setInterval(switchCommand, 5000)
  }
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
  if (commandInterval) {
    clearInterval(commandInterval)
  }
})
</script>

<style scoped lang="scss">
.terminal-header {
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-primary);
  padding: 16px 24px;
  transition: all 0.3s ease;

  &.terminal-style {
    background: var(--terminal-bg);
    border-bottom: 1px solid var(--terminal-border);
    font-family: var(--font-mono);

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(
        90deg,
        var(--pixel-green) 0%,
        var(--pixel-cyan) 50%,
        var(--pixel-blue) 100%
      );
      animation: pulse-border 2s ease-in-out infinite alternate;
    }
  }
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;

  .logo {
    display: flex;
    align-items: center;

    .logo-icon {
      transition: all 0.3s ease;

      .terminal-style & {
        filter: drop-shadow(0 0 8px var(--pixel-green));
      }
    }
  }

  .title-section {
    .app-title {
      font-size: 24px;
      font-weight: 700;
      margin: 0;
      color: var(--text-primary);

      .terminal-style & {
        font-family: var(--font-display);
        font-size: 20px;
        letter-spacing: 2px;
        text-transform: uppercase;
      }
    }

    .subtitle {
      font-size: 12px;
      color: var(--text-secondary);
      margin-top: 2px;

      &.terminal-prompt {
        color: var(--terminal-text-secondary);
        font-family: var(--font-mono);
        text-transform: uppercase;
        letter-spacing: 1px;

        &::before {
          content: '> ';
          color: var(--pixel-green);
        }
      }
    }
  }
}

.status-section {
  .system-status {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;

    &.terminal-status {
      font-family: var(--font-mono);
      font-size: 12px;
    }

    .status-item {
      display: flex;
      gap: 8px;

      .status-label {
        color: var(--text-secondary);
        font-size: 12px;
      }

      .status-value {
        font-weight: 600;
        font-size: 12px;

        &.terminal-success {
          color: var(--terminal-success);
          text-shadow: 0 0 5px currentColor;
        }

        &.terminal-error {
          color: var(--terminal-error);
          text-shadow: 0 0 5px currentColor;
        }

        &.terminal-warning {
          color: var(--terminal-warning);
          text-shadow: 0 0 5px currentColor;
        }
      }
    }

    .terminal-time {
      color: var(--terminal-text-tertiary);
      font-size: 10px;
      font-family: var(--font-mono);
    }
  }
}

.controls-section {
  .connection-status {
    &.terminal-connection {
      font-family: var(--font-mono);
      font-size: 12px;

      .connection-text {
        color: var(--terminal-text-secondary);
        text-transform: uppercase;
      }
    }
  }
}

.terminal-prompt-bar {
  margin-top: 12px;
  padding: 8px 12px;
  background: var(--terminal-bg-secondary);
  border: 1px solid var(--terminal-border);
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;

  .prompt-prefix {
    color: var(--terminal-prompt);
    font-weight: 600;
  }

  .prompt-command {
    color: var(--terminal-command);
    flex: 1;
  }

  .cursor {
    color: var(--pixel-green);
    font-weight: bold;
  }
}

// 动画效果
@keyframes pulse-border {
  from {
    opacity: 0.5;
    transform: scaleX(0.8);
  }
  to {
    opacity: 1;
    transform: scaleX(1);
  }
}

@keyframes blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}

@keyframes typewriter {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}

.blink {
  animation: blink 1s infinite;
}

.typewriter {
  overflow: hidden;
  white-space: nowrap;
  animation: typewriter 2s steps(40, end);
}

// 响应式设计
@media (max-width: 768px) {
  .terminal-header {
    padding: 12px 16px;

    .header-content {
      flex-direction: column;
      gap: 16px;
      align-items: stretch;
    }

    .logo-section {
      justify-content: center;

      .title-section {
        text-align: center;

        .app-title {
          font-size: 18px;
        }
      }
    }

    .status-section,
    .controls-section {
      justify-content: center;
    }
  }

  .terminal-prompt-bar {
    font-size: 11px;
    padding: 6px 8px;
  }
}
</style>
