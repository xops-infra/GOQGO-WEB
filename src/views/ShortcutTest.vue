<template>
  <div class="shortcut-test">
    <div class="test-container">
      <h1 class="page-title">快捷键功能测试</h1>
      
      <!-- 快捷键展示区域 -->
      <div class="shortcut-showcase">
        <h2 class="section-title">快捷键分组展示</h2>
        
        <!-- 控制键组 -->
        <div class="shortcut-group">
          <h3 class="group-title">控制键组</h3>
          <div class="shortcut-buttons">
            <div class="shortcut-item" title="Ctrl+C - 中断信号">
              <n-button size="small" quaternary circle class="shortcut-button">
                <template #icon>
                  <n-icon>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"/>
                    </svg>
                  </n-icon>
                </template>
              </n-button>
              <span class="shortcut-text">Ctrl+C</span>
            </div>

            <div class="shortcut-item" title="Ctrl+Z - 暂停信号">
              <n-button size="small" quaternary circle class="shortcut-button">
                <template #icon>
                  <n-icon>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14,19H18V5H14M6,19H10V5H6V19Z"/>
                    </svg>
                  </n-icon>
                </template>
              </n-button>
              <span class="shortcut-text">Ctrl+Z</span>
            </div>

            <div class="shortcut-item" title="Ctrl+D - EOF">
              <n-button size="small" quaternary circle class="shortcut-button">
                <template #icon>
                  <n-icon>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
                    </svg>
                  </n-icon>
                </template>
              </n-button>
              <span class="shortcut-text">Ctrl+D</span>
            </div>
          </div>
        </div>

        <!-- 输入键组 -->
        <div class="shortcut-group">
          <h3 class="group-title">输入键组</h3>
          <div class="shortcut-buttons">
            <div class="shortcut-item" title="Enter - 回车键">
              <n-button size="small" quaternary circle class="shortcut-button">
                <template #icon>
                  <n-icon>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9,10V15H15V10H17L12,5L7,10H9M2,17V19H22V17H2Z"/>
                    </svg>
                  </n-icon>
                </template>
              </n-button>
              <span class="shortcut-text">Enter</span>
            </div>

            <div class="shortcut-item" title="Tab - 制表符">
              <n-button size="small" quaternary circle class="shortcut-button">
                <template #icon>
                  <n-icon>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"/>
                    </svg>
                  </n-icon>
                </template>
              </n-button>
              <span class="shortcut-text">Tab</span>
            </div>

            <div class="shortcut-item" title="Backspace - 退格键">
              <n-button size="small" quaternary circle class="shortcut-button">
                <template #icon>
                  <n-icon>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22,3H7C6.31,3 5.77,3.35 5.41,3.88L0,12L5.41,20.12C5.77,20.65 6.31,21 7,21H22A2,2 0 0,0 24,19V5A2,2 0 0,0 22,3M19,15.59L17.59,17L14,13.41L10.41,17L9,15.59L12.59,12L9,8.41L10.41,7L14,10.59L17.59,7L19,8.41L15.41,12"/>
                    </svg>
                  </n-icon>
                </template>
              </n-button>
              <span class="shortcut-text">⌫</span>
            </div>
          </div>
        </div>

        <!-- 方向键组 -->
        <div class="shortcut-group">
          <h3 class="group-title">方向键组</h3>
          <div class="shortcut-buttons">
            <div class="direction-keys">
              <div class="shortcut-item" title="↑ - 上方向键">
                <n-button size="small" quaternary circle class="shortcut-button direction-key">
                  <template #icon>
                    <n-icon>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z"/>
                      </svg>
                    </n-icon>
                  </template>
                </n-button>
                <span class="shortcut-text">↑</span>
              </div>

              <div class="direction-row">
                <div class="shortcut-item" title="← - 左方向键">
                  <n-button size="small" quaternary circle class="shortcut-button direction-key">
                    <template #icon>
                      <n-icon>
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z"/>
                        </svg>
                      </n-icon>
                    </template>
                  </n-button>
                  <span class="shortcut-text">←</span>
                </div>

                <div class="shortcut-item" title="↓ - 下方向键">
                  <n-button size="small" quaternary circle class="shortcut-button direction-key">
                    <template #icon>
                      <n-icon>
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
                        </svg>
                      </n-icon>
                    </template>
                  </n-button>
                  <span class="shortcut-text">↓</span>
                </div>

                <div class="shortcut-item" title="→ - 右方向键">
                  <n-button size="small" quaternary circle class="shortcut-button direction-key">
                    <template #icon>
                      <n-icon>
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"/>
                        </svg>
                      </n-icon>
                    </template>
                  </n-button>
                  <span class="shortcut-text">→</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 功能键组 -->
        <div class="shortcut-group">
          <h3 class="group-title">功能键组</h3>
          <div class="shortcut-buttons">
            <div class="shortcut-item" title="ESC - 退出键">
              <n-button size="small" quaternary circle class="shortcut-button">
                <template #icon>
                  <n-icon>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M15.5,8L17,9.5L13.5,13L17,16.5L15.5,18L12,14.5L8.5,18L7,16.5L10.5,13L7,9.5L8.5,8L12,11.5L15.5,8Z"/>
                    </svg>
                  </n-icon>
                </template>
              </n-button>
              <span class="shortcut-text">ESC</span>
            </div>

            <div class="shortcut-item" title="Home - 行首">
              <n-button size="small" quaternary circle class="shortcut-button">
                <template #icon>
                  <n-icon>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z"/>
                    </svg>
                  </n-icon>
                </template>
              </n-button>
              <span class="shortcut-text">Home</span>
            </div>

            <div class="shortcut-item" title="End - 行尾">
              <n-button size="small" quaternary circle class="shortcut-button">
                <template #icon>
                  <n-icon>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z"/>
                    </svg>
                  </n-icon>
                </template>
              </n-button>
              <span class="shortcut-text">End</span>
            </div>

            <div class="shortcut-item" title="PageUp - 上一页">
              <n-button size="small" quaternary circle class="shortcut-button">
                <template #icon>
                  <n-icon>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z"/>
                    </svg>
                  </n-icon>
                </template>
              </n-button>
              <span class="shortcut-text">PgUp</span>
            </div>

            <div class="shortcut-item" title="PageDown - 下一页">
              <n-button size="small" quaternary circle class="shortcut-button">
                <template #icon>
                  <n-icon>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
                    </svg>
                  </n-icon>
                </template>
              </n-button>
              <span class="shortcut-text">PgDn</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 功能说明 -->
      <div class="feature-info">
        <h2 class="section-title">功能说明</h2>
        <div class="info-content">
          <p>快捷键功能已完全集成到Agent日志窗口中，支持15个常用终端快捷键：</p>
          <ul>
            <li><strong>控制键组</strong>: Ctrl+C、Ctrl+Z、Ctrl+D - 用于进程控制</li>
            <li><strong>输入键组</strong>: Enter、Tab、Backspace - 用于基本输入操作</li>
            <li><strong>方向键组</strong>: ↑↓←→ - 用于光标移动和命令历史导航</li>
            <li><strong>功能键组</strong>: ESC、Home、End、PageUp、PageDown - 用于高级功能</li>
          </ul>
          <p>所有快捷键都采用终端主题风格设计，黑色背景配白色图标，与整体界面风格保持一致。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NButton, NIcon } from 'naive-ui'
</script>

<style scoped lang="scss">
.shortcut-test {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;

  .test-container {
    max-width: 1200px;
    margin: 0 auto;
    background: white;
    border-radius: 12px;
    padding: 32px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    .page-title {
      text-align: center;
      color: #333;
      margin-bottom: 32px;
      font-size: 28px;
      font-weight: 600;
    }

    .section-title {
      color: #333;
      margin-bottom: 20px;
      font-size: 20px;
      font-weight: 600;
      border-bottom: 2px solid #e0e0e0;
      padding-bottom: 8px;
    }

    .shortcut-showcase {
      margin-bottom: 40px;

      .shortcut-group {
        margin-bottom: 32px;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 8px;
        border: 1px solid #e9ecef;

        .group-title {
          color: #495057;
          margin-bottom: 16px;
          font-size: 16px;
          font-weight: 600;
        }

        .shortcut-buttons {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;

          .shortcut-item {
            display: flex;
            align-items: center;
            gap: 8px;

            .shortcut-button {
              width: 32px;
              height: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 1px solid #dee2e6;
              background: #6c757d;
              color: white;
              border-radius: 6px;
              transition: all 0.2s ease;

              &:hover {
                background: #495057;
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
              }

              &.direction-key {
                width: 28px;
                height: 28px;
              }
            }

            .shortcut-text {
              color: #495057;
              font-size: 12px;
              font-family: monospace;
              font-weight: 500;
            }
          }

          .direction-keys {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;

            .direction-row {
              display: flex;
              align-items: center;
              gap: 4px;
            }
          }
        }
      }
    }

    .feature-info {
      .info-content {
        background: #e3f2fd;
        padding: 20px;
        border-radius: 8px;
        border-left: 4px solid #2196f3;

        p {
          margin: 0 0 16px 0;
          color: #1976d2;
          line-height: 1.6;

          &:last-child {
            margin-bottom: 0;
          }
        }

        ul {
          margin: 16px 0;
          padding-left: 20px;
          color: #1976d2;

          li {
            margin-bottom: 8px;
            line-height: 1.5;

            strong {
              color: #1565c0;
            }
          }
        }
      }
    }
  }
}
</style>
