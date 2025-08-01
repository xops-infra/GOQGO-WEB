<template>
  <div class="text-color-test" :class="{ 'terminal-mode': isTerminal }">
    <div class="test-container">
      <div class="test-header">
        <h1 class="test-title" :class="{ 'neon-text neon-green': isTerminal }">
          {{ isTerminal ? 'TEXT_COLOR_TEST' : '文字颜色测试' }}
        </h1>
        <p class="test-description">
          {{ isTerminal ? 'TESTING_TEXT_READABILITY_ACROSS_THEMES' : '测试各主题下的文字可读性' }}
        </p>
      </div>

      <!-- 主题切换 -->
      <div class="theme-switcher">
        <h2>{{ isTerminal ? 'THEME_SELECTOR' : '主题选择' }}</h2>
        <n-space>
          <n-button
            v-for="theme in availableThemes"
            :key="theme.name"
            :type="currentTheme === theme.name.toLowerCase() ? 'primary' : 'default'"
            :class="{ 'btn-8bit': isTerminal }"
            @click="setTheme(theme.name.toLowerCase() as any)"
          >
            {{ theme.icon }} {{ theme.name }}
          </n-button>
        </n-space>
      </div>

      <!-- 文字颜色层级测试 -->
      <div class="text-levels-test">
        <h2>{{ isTerminal ? 'TEXT_HIERARCHY' : '文字层级' }}</h2>
        <n-card>
          <div class="text-samples">
            <div class="text-sample">
              <span class="label">Primary Text:</span>
              <span class="text-primary">这是主要文字颜色 - Primary text color</span>
            </div>
            <div class="text-sample">
              <span class="label">Secondary Text:</span>
              <span class="text-secondary">这是次要文字颜色 - Secondary text color</span>
            </div>
            <div class="text-sample">
              <span class="label">Tertiary Text:</span>
              <span class="text-tertiary">这是三级文字颜色 - Tertiary text color</span>
            </div>
            <div class="text-sample">
              <span class="label">Disabled Text:</span>
              <span class="text-disabled">这是禁用文字颜色 - Disabled text color</span>
            </div>
          </div>
        </n-card>
      </div>

      <!-- 组件文字测试 -->
      <div class="component-text-test">
        <h2>{{ isTerminal ? 'COMPONENT_TEXT' : '组件文字' }}</h2>

        <!-- 表格测试 -->
        <div class="test-section">
          <h3>{{ isTerminal ? 'TABLE_TEXT' : '表格文字' }}</h3>
          <n-data-table
            :columns="tableColumns"
            :data="tableData"
            :class="{ 'terminal-table': isTerminal }"
          />
        </div>

        <!-- 表单测试 -->
        <div class="test-section">
          <h3>{{ isTerminal ? 'FORM_TEXT' : '表单文字' }}</h3>
          <n-form :class="{ 'terminal-form': isTerminal }">
            <n-form-item :label="isTerminal ? 'INPUT_FIELD' : '输入字段'">
              <n-input
                :placeholder="isTerminal ? 'ENTER_TEXT_HERE' : '在此输入文字'"
                :class="{ 'terminal-input': isTerminal }"
              />
            </n-form-item>
            <n-form-item :label="isTerminal ? 'SELECT_FIELD' : '选择字段'">
              <n-select
                :options="selectOptions"
                :placeholder="isTerminal ? 'SELECT_OPTION' : '选择选项'"
                :class="{ 'terminal-select': isTerminal }"
              />
            </n-form-item>
          </n-form>
        </div>

        <!-- 按钮测试 -->
        <div class="test-section">
          <h3>{{ isTerminal ? 'BUTTON_TEXT' : '按钮文字' }}</h3>
          <n-space wrap>
            <n-button :class="{ 'btn-8bit': isTerminal }">
              {{ isTerminal ? 'DEFAULT' : '默认按钮' }}
            </n-button>
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
          </n-space>
        </div>

        <!-- 菜单测试 -->
        <div class="test-section">
          <h3>{{ isTerminal ? 'MENU_TEXT' : '菜单文字' }}</h3>
          <n-menu
            :options="menuOptions"
            mode="horizontal"
            :class="{ 'terminal-menu': isTerminal }"
          />
        </div>

        <!-- 标签测试 -->
        <div class="test-section">
          <h3>{{ isTerminal ? 'TAG_TEXT' : '标签文字' }}</h3>
          <n-space>
            <n-tag type="default">{{ isTerminal ? 'DEFAULT' : '默认标签' }}</n-tag>
            <n-tag type="primary">{{ isTerminal ? 'PRIMARY' : '主要标签' }}</n-tag>
            <n-tag type="success">{{ isTerminal ? 'SUCCESS' : '成功标签' }}</n-tag>
            <n-tag type="warning">{{ isTerminal ? 'WARNING' : '警告标签' }}</n-tag>
            <n-tag type="error">{{ isTerminal ? 'ERROR' : '错误标签' }}</n-tag>
          </n-space>
        </div>
      </div>

      <!-- 对比度测试 -->
      <div class="contrast-test">
        <h2>{{ isTerminal ? 'CONTRAST_TEST' : '对比度测试' }}</h2>
        <div class="contrast-samples">
          <div class="contrast-card" style="background: var(--bg-primary)">
            <h4>Primary Background</h4>
            <p class="text-primary">Primary text on primary background</p>
            <p class="text-secondary">Secondary text on primary background</p>
            <p class="text-tertiary">Tertiary text on primary background</p>
          </div>
          <div class="contrast-card" style="background: var(--bg-secondary)">
            <h4>Secondary Background</h4>
            <p class="text-primary">Primary text on secondary background</p>
            <p class="text-secondary">Secondary text on secondary background</p>
            <p class="text-tertiary">Tertiary text on secondary background</p>
          </div>
          <div class="contrast-card" style="background: var(--bg-tertiary)">
            <h4>Tertiary Background</h4>
            <p class="text-primary">Primary text on tertiary background</p>
            <p class="text-secondary">Secondary text on tertiary background</p>
            <p class="text-tertiary">Tertiary text on tertiary background</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'
import {
  NSpace,
  NButton,
  NCard,
  NDataTable,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NMenu,
  NTag,
  type DataTableColumns
} from 'naive-ui'
import { useTheme } from '@/utils/theme'

const { currentTheme, isTerminal, setTheme, getAvailableThemes } = useTheme()

const availableThemes = computed(() => getAvailableThemes())

// 表格数据
const tableColumns: DataTableColumns = [
  {
    title: 'Name',
    key: 'name'
  },
  {
    title: 'Status',
    key: 'status'
  },
  {
    title: 'Description',
    key: 'description'
  }
]

const tableData = [
  {
    name: 'Agent Alpha',
    status: 'Running',
    description: 'This is a sample description with secondary text'
  },
  {
    name: 'Agent Beta',
    status: 'Idle',
    description: 'Another description to test text readability'
  },
  {
    name: 'Agent Gamma',
    status: 'Error',
    description: 'Error state description for testing purposes'
  }
]

// 选择器选项
const selectOptions = [
  { label: 'Option 1', value: 'option1' },
  { label: 'Option 2', value: 'option2' },
  { label: 'Option 3', value: 'option3' }
]

// 菜单选项
const menuOptions = [
  {
    label: 'Home',
    key: 'home'
  },
  {
    label: 'About',
    key: 'about'
  },
  {
    label: 'Contact',
    key: 'contact'
  }
]
</script>

<style scoped lang="scss">
.text-color-test {
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 24px;

  &.terminal-mode {
    background: var(--terminal-bg);
    font-family: var(--font-mono);
  }
}

.test-container {
  max-width: 1200px;
  margin: 0 auto;
}

.test-header {
  margin-bottom: 32px;
  text-align: center;

  .test-title {
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 8px;
    color: var(--text-primary);

    .terminal-mode & {
      font-family: var(--font-display);
      text-transform: uppercase;
      letter-spacing: 2px;
    }
  }

  .test-description {
    font-size: 16px;
    color: var(--text-secondary);
    margin: 0;

    .terminal-mode & {
      color: var(--terminal-text-secondary);
      text-transform: uppercase;
    }
  }
}

.theme-switcher,
.text-levels-test,
.component-text-test,
.contrast-test {
  margin-bottom: 48px;

  h2 {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 16px;
    color: var(--text-primary);

    .terminal-mode & {
      font-family: var(--font-display);
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--pixel-green);
    }
  }

  h3 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 12px;
    color: var(--text-primary);

    .terminal-mode & {
      font-family: var(--font-display);
      text-transform: uppercase;
      color: var(--pixel-cyan);
    }
  }
}

.text-samples {
  .text-sample {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 12px;
    padding: 8px;
    border-radius: 4px;
    background: var(--bg-secondary);

    .terminal-mode & {
      background: var(--terminal-bg-secondary);
      border: 1px solid var(--terminal-border);
      border-radius: 0;
    }

    .label {
      min-width: 140px;
      font-weight: 600;
      color: var(--text-primary);

      .terminal-mode & {
        color: var(--pixel-green);
        font-family: var(--font-mono);
        text-transform: uppercase;
      }
    }
  }
}

.test-section {
  margin-bottom: 32px;

  .n-card {
    margin-bottom: 16px;
  }
}

.contrast-samples {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;

  .contrast-card {
    padding: 24px;
    border-radius: 8px;
    border: 1px solid var(--border-primary);

    .terminal-mode & {
      border: 1px solid var(--terminal-border);
      border-radius: 0;
    }

    h4 {
      margin: 0 0 16px 0;
      color: var(--text-primary);

      .terminal-mode & {
        color: var(--pixel-green);
        text-transform: uppercase;
        font-family: var(--font-display);
      }
    }

    p {
      margin: 8px 0;
      line-height: 1.5;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .text-color-test {
    padding: 16px;
  }

  .test-header {
    .test-title {
      font-size: 24px;
    }

    .test-description {
      font-size: 14px;
    }
  }

  .contrast-samples {
    grid-template-columns: 1fr;
  }

  .text-samples {
    .text-sample {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;

      .label {
        min-width: auto;
      }
    }
  }
}
</style>
