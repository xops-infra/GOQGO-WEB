<template>
  <div class="terminal-log-renderer" ref="containerRef">
    <div class="terminal-content" ref="contentRef">
      <div
        v-for="(line, index) in renderedLines"
        :key="`${line.id}-${index}`"
        class="terminal-line"
        v-html="line.html"
      />
      
      <!-- 空状态 -->
      <div v-if="renderedLines.length === 0 && !isLoading" class="terminal-empty">
        <div class="empty-icon">$</div>
        <div class="empty-text">等待日志输出...</div>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="isLoading" class="terminal-loading">
        <div class="loading-spinner">
          <span class="loading-dot">.</span>
          <span class="loading-dot">.</span>
          <span class="loading-dot">.</span>
        </div>
        <div class="loading-text">{{ loadingText }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import Convert from 'ansi-to-html'
import { formatThinkingForHTML, cleanAnsiSequences, isThinkingAnimation } from '@/utils/thinkingProcessor'
import type { LogEntry } from '@/api/agents'

interface Props {
  logs: LogEntry[]
  isLoading?: boolean
  loadingText?: string
  autoScroll?: boolean
  maxLines?: number
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  loadingText: '加载中',
  autoScroll: true,
  maxLines: 10000
})

const containerRef = ref<HTMLElement>()
const contentRef = ref<HTMLElement>()

// 创建 ansi-to-html 转换器实例
const ansiConverter = new Convert({
  fg: '#f0f6fc',
  bg: '#0d1117',
  newline: false,
  escapeXML: true,
  stream: false,
  colors: {
    0: '#484f58',   // black
    1: '#ff7b72',   // red
    2: '#7ee787',   // green
    3: '#ffa657',   // yellow
    4: '#79c0ff',   // blue
    5: '#d2a8ff',   // magenta
    6: '#39c5cf',   // cyan
    7: '#f0f6fc',   // white
    8: '#6e7681',   // bright black
    9: '#ffa198',   // bright red
    10: '#56d364',  // bright green
    11: '#e3b341',  // bright yellow
    12: '#58a6ff',  // bright blue
    13: '#bc8cff',  // bright magenta
    14: '#39c5cf',  // bright cyan
    15: '#ffffff'   // bright white
  }
})

// 渲染的日志行
const renderedLines = computed(() => {
  const lines = props.logs.slice(-props.maxLines).map((log, index) => ({
    id: `${index}-${log.source}`, // 使用索引和源作为 ID
    html: renderLogLine(log)
  }))
  
  return lines
})

// 渲染单行日志
const renderLogLine = (log: LogEntry): string => {
  let content = log.message || ''
  
  // 检查是否是 thinking 动画
  if (isThinkingAnimation(content)) {
    // 使用工具函数格式化 thinking 动画
    const thinkingHTML = formatThinkingForHTML(content)
    const source = log.source ? `<span class="log-source">[${log.source}]</span> ` : ''
    return `${source}${thinkingHTML}`
  }
  
  // 清理 ANSI 控制序列
  content = cleanAnsiSequences(content)
  
  // 跳过空内容
  if (!content) return ''
  
  // 使用 ansi-to-html 处理 ANSI 转义序列
  const convertedContent = ansiConverter.toHtml(content)
  
  // 添加源信息（如果有）
  const source = log.source ? `<span class="log-source">[${log.source}]</span> ` : ''
  
  return `${source}<span class="log-content">${convertedContent}</span>`
}

// 滚动到底部
const scrollToBottom = () => {
  if (containerRef.value && props.autoScroll) {
    nextTick(() => {
      containerRef.value!.scrollTop = containerRef.value!.scrollHeight
    })
  }
}

// 监听日志变化，自动滚动
watch(
  () => props.logs.length,
  () => {
    scrollToBottom()
  }
)

// 组件挂载后滚动到底部
onMounted(() => {
  scrollToBottom()
})

// 暴露方法给父组件
defineExpose({
  scrollToBottom,
  scrollToTop: () => {
    if (containerRef.value) {
      containerRef.value.scrollTop = 0
    }
  }
})
</script>

<style scoped lang="scss">
.terminal-log-renderer {
  height: 100%;
  overflow-y: auto;
  background: var(--terminal-bg, #0d1117);
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 13px;
  line-height: 1.4;
  color: var(--terminal-text, #f0f6fc);
  
  // 自定义滚动条
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--terminal-bg-secondary, #161b22);
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--terminal-border, #21262d);
    border-radius: 4px;
    
    &:hover {
      background: var(--terminal-text-tertiary, #8b949e);
    }
  }
}

.terminal-content {
  padding: 8px 12px;
  min-height: 100%;
}

.terminal-line {
  margin-bottom: 2px;
  word-break: break-all;
  white-space: pre-wrap;
  
  :deep(.log-source) {
    color: var(--terminal-text-secondary, #c9d1d9);
    font-size: 11px;
    margin-right: 8px;
    opacity: 0.8;
  }
  
  :deep(.log-content) {
    color: var(--terminal-text, #f0f6fc);
  }
  
  // thinking 指示器样式（移除动画）
  :deep(.thinking-indicator) {
    color: #ffa657;
    font-weight: 500;
    
    .thinking-text {
      color: #ffa657;
    }
    
    .thinking-dots {
      // 移除闪烁动画，保持静态显示
      opacity: 1;
    }
  }
  
  // ansi-to-html 生成的样式会自动应用
  // 不需要手动定义 ANSI 颜色类
}

// 移除动画 keyframes

.terminal-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--terminal-text-tertiary, #8b949e);
  
  .empty-icon {
    font-size: 48px;
    font-weight: bold;
    margin-bottom: 16px;
    color: var(--terminal-prompt, #7ee787);
  }
  
  .empty-text {
    font-size: 14px;
  }
}

.terminal-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: var(--terminal-text-secondary, #c9d1d9);
  
  .loading-spinner {
    display: flex;
    gap: 4px;
    margin-bottom: 12px;
    
    .loading-dot {
      font-size: 20px;
      font-weight: bold;
      color: var(--terminal-prompt, #7ee787);
      animation: loading-blink 1.4s infinite;
      
      &:nth-child(2) {
        animation-delay: 0.2s;
      }
      
      &:nth-child(3) {
        animation-delay: 0.4s;
      }
    }
  }
  
  .loading-text {
    font-size: 12px;
    opacity: 0.8;
  }
}

@keyframes loading-blink {
  0%, 80%, 100% {
    opacity: 0.3;
  }
  40% {
    opacity: 1;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .terminal-log-renderer {
    font-size: 12px;
  }
  
  .terminal-content {
    padding: 6px 8px;
  }
  
  .terminal-line {
    :deep(.log-source) {
      font-size: 10px;
      margin-right: 6px;
    }
  }
}
</style>
