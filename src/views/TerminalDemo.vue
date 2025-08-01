<template>
  <div class="terminal-demo" :class="{ 'terminal-mode': isTerminal }">
    <div class="demo-container">
      <!-- 主题切换演示 -->
      <div class="demo-section">
        <h2 class="section-title" :class="{ 'neon-text neon-green': isTerminal }">
          {{ isTerminal ? 'THEME_SELECTOR' : '主题选择器' }}
        </h2>
        <div class="theme-showcase">
          <div class="theme-options">
            <n-button
              v-for="theme in availableThemes"
              :key="theme.name"
              :type="currentTheme === theme.name.toLowerCase() ? 'primary' : 'default'"
              :class="{ 'btn-8bit': isTerminal }"
              @click="setTheme(theme.name.toLowerCase() as any)"
            >
              {{ theme.icon }} {{ theme.name }}
            </n-button>
          </div>
        </div>
      </div>

      <!-- 图标展示 -->
      <div class="demo-section">
        <h2 class="section-title" :class="{ 'neon-text neon-cyan': isTerminal }">
          {{ isTerminal ? 'ICON_GALLERY' : '图标展示' }}
        </h2>
        <div class="icons-grid">
          <div
            v-for="icon in iconList"
            :key="icon.name"
            class="icon-item"
            :class="{ 'terminal-icon-item': isTerminal }"
          >
            <TerminalIcons :name="icon.name" :size="48" :glow="isTerminal" :animated="isTerminal" />
            <span class="icon-label">{{ icon.label }}</span>
          </div>
        </div>
      </div>

      <!-- 按钮样式展示 -->
      <div class="demo-section">
        <h2 class="section-title" :class="{ 'neon-text neon-blue': isTerminal }">
          {{ isTerminal ? 'BUTTON_STYLES' : '按钮样式' }}
        </h2>
        <div class="buttons-showcase">
          <n-space wrap>
            <n-button type="primary" :class="{ 'btn-8bit': isTerminal }">
              {{ isTerminal ? 'PRIMARY' : '主要按钮' }}
            </n-button>
            <n-button type="success" :class="{ 'btn-8bit': isTerminal }">
              {{ isTerminal ? 'SUCCESS' : '成功按钮' }}
            </n-button>
            <n-button type="warning" :class="{ 'btn-8bit': isTerminal }">
              {{ isTerminal ? 'WARNING' : '警告按钮' }}
            </n-button>
            <n-button type="error" :class="{ 'btn-8bit': isTerminal }">
              {{ isTerminal ? 'ERROR' : '错误按钮' }}
            </n-button>
            <n-button type="info" :class="{ 'btn-8bit': isTerminal }">
              {{ isTerminal ? 'INFO' : '信息按钮' }}
            </n-button>
          </n-space>
        </div>
      </div>

      <!-- 卡片展示 -->
      <div class="demo-section">
        <h2 class="section-title" :class="{ 'neon-text neon-red': isTerminal }">
          {{ isTerminal ? 'CARD_COMPONENTS' : '卡片组件' }}
        </h2>
        <div class="cards-showcase">
          <n-grid :cols="3" :x-gap="16" :y-gap="16">
            <n-grid-item>
              <TerminalStatsCard
                title="系统状态"
                value="ONLINE"
                type="success"
                icon="server"
                :progress="95"
                subtitle="SYSTEM_STATUS"
                trend="+5%"
                trend-direction="up"
              />
            </n-grid-item>
            <n-grid-item>
              <TerminalStatsCard
                title="CPU使用率"
                value="67%"
                type="warning"
                icon="cpu"
                :progress="67"
                subtitle="CPU_USAGE"
                trend="+12%"
                trend-direction="up"
              />
            </n-grid-item>
            <n-grid-item>
              <TerminalStatsCard
                title="网络连接"
                value="24"
                type="info"
                icon="network"
                :progress="80"
                subtitle="CONNECTIONS"
                trend="-3%"
                trend-direction="down"
              />
            </n-grid-item>
          </n-grid>
        </div>
      </div>

      <!-- 终端窗口展示 -->
      <div class="demo-section">
        <h2 class="section-title" :class="{ 'neon-text neon-purple': isTerminal }">
          {{ isTerminal ? 'TERMINAL_WINDOW' : '终端窗口' }}
        </h2>
        <div class="terminal-window-demo">
          <div class="terminal-window">
            <div class="terminal-header">
              <div class="terminal-controls">
                <div class="control-btn close"></div>
                <div class="control-btn minimize"></div>
                <div class="control-btn maximize"></div>
              </div>
              <div class="terminal-title">
                {{ isTerminal ? 'GOQGO_TERMINAL_v1.0' : 'GoQGo 终端 v1.0' }}
              </div>
            </div>
            <div class="terminal-content">
              <div class="terminal-line">
                <span class="terminal-prompt">root@goqgo:~$</span>
                <span class="terminal-command">system status --verbose</span>
              </div>
              <div class="terminal-line">
                <span class="terminal-output">✓ System Status: ONLINE</span>
              </div>
              <div class="terminal-line">
                <span class="terminal-output">✓ Agents: 4 running, 2 idle</span>
              </div>
              <div class="terminal-line">
                <span class="terminal-output">✓ Memory: 2.1GB / 8GB used</span>
              </div>
              <div class="terminal-line">
                <span class="terminal-output">✓ Network: Connected</span>
              </div>
              <div class="terminal-line">
                <span class="terminal-prompt">root@goqgo:~$</span>
                <span class="terminal-command">agents list</span>
              </div>
              <div class="terminal-line">
                <span class="terminal-output">ID NAME STATUS ROLE</span>
              </div>
              <div class="terminal-line">
                <span class="terminal-output">001 Assistant-Alpha RUNNING assistant</span>
              </div>
              <div class="terminal-line">
                <span class="terminal-output">002 Coder-Beta IDLE coder</span>
              </div>
              <div class="terminal-line">
                <span class="terminal-prompt">root@goqgo:~$</span>
                <span class="cursor blink">_</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NSpace, NGrid, NGridItem } from 'naive-ui'
import { useTheme } from '@/utils/theme'
import TerminalIcons from '@/components/TerminalIcons.vue'
import TerminalStatsCard from '@/components/TerminalStatsCard.vue'

const { currentTheme, isTerminal, setTheme, getAvailableThemes } = useTheme()

const availableThemes = computed(() => getAvailableThemes())

const iconList = [
  { name: 'terminal', label: 'Terminal' },
  { name: 'cpu', label: 'CPU' },
  { name: 'network', label: 'Network' },
  { name: 'database', label: 'Database' },
  { name: 'server', label: 'Server' },
  { name: 'robot', label: 'Robot' },
  { name: 'code', label: 'Code' },
  { name: 'gear', label: 'Settings' },
  { name: 'lightning', label: 'Power' }
]
</script>

<style scoped lang="scss">
.terminal-demo {
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 24px;

  &.terminal-mode {
    background: var(--terminal-bg);
    font-family: var(--font-mono);
  }
}

.demo-container {
  max-width: 1200px;
  margin: 0 auto;
}

.demo-section {
  margin-bottom: 48px;

  .section-title {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 24px;
    color: var(--text-primary);

    .terminal-mode & {
      font-family: var(--font-display);
      text-transform: uppercase;
      letter-spacing: 2px;
    }
  }
}

.theme-showcase {
  .theme-options {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }
}

.icons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 24px;

  .icon-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 20px;
    background: var(--bg-secondary);
    border-radius: 8px;
    border: 1px solid var(--border-primary);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
    }

    &.terminal-icon-item {
      background: var(--terminal-bg-secondary);
      border: 1px solid var(--terminal-border);
      border-radius: 0;

      &:hover {
        border-color: var(--pixel-green);
        box-shadow: 0 0 20px rgba(0, 255, 65, 0.3);
      }
    }

    .icon-label {
      font-size: 12px;
      color: var(--text-secondary);
      text-align: center;

      .terminal-mode & {
        color: var(--terminal-text-secondary);
        font-family: var(--font-mono);
        text-transform: uppercase;
      }
    }
  }
}

.buttons-showcase {
  padding: 24px;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-primary);

  .terminal-mode & {
    background: var(--terminal-bg-secondary);
    border: 1px solid var(--terminal-border);
    border-radius: 0;
  }
}

.cards-showcase {
  // 卡片展示样式已在TerminalStatsCard中定义
}

.terminal-window-demo {
  .terminal-window {
    background: var(--terminal-bg);
    border: 1px solid var(--terminal-border);
    border-radius: 8px;
    box-shadow: var(--terminal-shadow-lg);
    overflow: hidden;

    .terminal-header {
      background: var(--terminal-bg-secondary);
      padding: 8px 16px;
      border-bottom: 1px solid var(--terminal-border);
      display: flex;
      align-items: center;
      gap: 8px;

      .terminal-controls {
        display: flex;
        gap: 6px;

        .control-btn {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: none;
          cursor: pointer;

          &.close {
            background: var(--terminal-error);
          }
          &.minimize {
            background: var(--terminal-warning);
          }
          &.maximize {
            background: var(--terminal-success);
          }

          &:hover {
            filter: brightness(1.2);
          }
        }
      }

      .terminal-title {
        color: var(--terminal-text-secondary);
        font-size: 12px;
        font-family: var(--font-mono);
        margin-left: auto;
      }
    }

    .terminal-content {
      background: var(--terminal-bg);
      padding: 16px;
      font-family: var(--font-mono);
      font-size: 14px;
      line-height: 1.6;
      min-height: 300px;

      .terminal-line {
        margin-bottom: 4px;

        .terminal-prompt {
          color: var(--terminal-prompt);
          font-weight: 600;
        }

        .terminal-command {
          color: var(--terminal-command);
          margin-left: 8px;
        }

        .terminal-output {
          color: var(--terminal-output);
        }

        .cursor {
          color: var(--pixel-green);
          font-weight: bold;
          margin-left: 4px;
        }
      }
    }
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

.blink {
  animation: blink 1s infinite;
}

// 响应式设计
@media (max-width: 768px) {
  .terminal-demo {
    padding: 16px;
  }

  .demo-section {
    margin-bottom: 32px;

    .section-title {
      font-size: 20px;
      margin-bottom: 16px;
    }
  }

  .icons-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 16px;

    .icon-item {
      padding: 16px;
    }
  }

  .buttons-showcase {
    padding: 16px;
  }

  .cards-showcase {
    :deep(.n-grid) {
      grid-template-columns: 1fr;
    }
  }
}
</style>
