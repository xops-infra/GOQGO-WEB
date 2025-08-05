<template>
  <div class="messages-toolbar">
    <div class="toolbar-left">
      <span class="message-count">{{ messageCount }} 条消息</span>
    </div>
    
    <div class="toolbar-right">
      <!-- 消息搜索 -->
      <n-popover trigger="click" placement="bottom-end" :show-arrow="false">
        <template #trigger>
          <n-button text class="toolbar-button">
            <template #icon>
              <n-icon>
                <SearchIcon />
              </n-icon>
            </template>
          </n-button>
        </template>
        
        <MessageSearchPanel
          :messages="messages"
          @scroll-to-message="$emit('scroll-to-message', $event)"
        />
      </n-popover>

      <!-- 更多操作 -->
      <n-dropdown :options="moreOptions" @select="handleMoreAction">
        <n-button text class="toolbar-button">
          <template #icon>
            <n-icon>
              <MoreIcon />
            </n-icon>
          </template>
        </n-button>
      </n-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NButton, NIcon, NPopover, NDropdown, useMessage } from 'naive-ui'
import MessageSearchPanel from './MessageSearchPanel.vue'
import SearchIcon from '@/components/icons/SearchIcon.vue'
import MoreIcon from '@/components/icons/MoreIcon.vue'
import type { Message } from '@/types/api'

interface Props {
  messageCount: number
  messages: Message[]
}

defineProps<Props>()

defineEmits<{
  'scroll-to-message': [messageId: string]
}>()

const message = useMessage()

// 更多操作选项
const moreOptions = [
  {
    label: '清空消息',
    key: 'clear-messages',
    props: {
      style: 'color: var(--color-warning);'
    }
  },
  {
    label: '导出聊天记录',
    key: 'export-messages'
  },
  {
    type: 'divider',
    key: 'divider1'
  },
  {
    label: '消息设置',
    key: 'message-settings'
  }
]

// 方法
const handleMoreAction = (key: string) => {
  switch (key) {
    case 'clear-messages':
      // 清空消息逻辑
      message.warning('清空消息功能开发中')
      break
    case 'export-messages':
      // 导出消息逻辑
      message.info('导出功能开发中')
      break
    case 'message-settings':
      // 消息设置逻辑
      message.info('设置功能开发中')
      break
  }
}
</script>

<style scoped lang="scss">
.messages-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
  flex-shrink: 0;
}

.toolbar-left {
  .message-count {
    font-size: 13px;
    color: var(--text-secondary);
    font-weight: 500;
  }
}

.toolbar-right {
  display: flex;
  gap: 4px;
}

.toolbar-button {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  color: var(--text-secondary);
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }
}

// Terminal主题样式
[data-theme='terminal'] .messages-toolbar {
  background: var(--terminal-bg-secondary);
  border-bottom-color: var(--terminal-border);
  
  .message-count {
    color: var(--terminal-text-secondary);
    font-family: var(--font-mono);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .toolbar-button {
    color: var(--terminal-text-secondary);
    
    &:hover {
      background: var(--terminal-surface);
      color: var(--pixel-cyan);
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .messages-toolbar {
    padding: 8px 12px;
  }
  
  .toolbar-button {
    width: 28px;
    height: 28px;
  }
}
</style>
