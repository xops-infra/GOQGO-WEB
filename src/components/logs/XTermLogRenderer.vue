<template>
  <div class="xterm-log-renderer">
    <div ref="terminalRef" class="terminal-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import { formatThinkingForXTerm } from '@/utils/thinkingProcessor'
import type { LogEntry } from '@/api/agents'

// 导入 xterm.js 样式
import '@xterm/xterm/css/xterm.css'

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

const terminalRef = ref<HTMLElement>()
let terminal: Terminal | null = null
let fitAddon: FitAddon | null = null
let webLinksAddon: WebLinksAddon | null = null
let resizeObserver: ResizeObserver | null = null

// 已渲染的日志数量，用于增量更新
let renderedLogCount = 0

// 初始化终端
const initTerminal = () => {
  if (!terminalRef.value) return

  // 创建终端实例
  terminal = new Terminal({
    theme: {
      background: '#0d1117',
      foreground: '#f0f6fc',
      cursor: '#7ee787',
      cursorAccent: '#0d1117',
      selectionBackground: '#58a6ff40',
      black: '#484f58',
      red: '#ff7b72',
      green: '#7ee787',
      yellow: '#ffa657',
      blue: '#79c0ff',
      magenta: '#d2a8ff',
      cyan: '#39c5cf',
      white: '#f0f6fc',
      brightBlack: '#6e7681',
      brightRed: '#ffa198',
      brightGreen: '#56d364',
      brightYellow: '#e3b341',
      brightBlue: '#58a6ff',
      brightMagenta: '#bc8cff',
      brightCyan: '#39c5cf',
      brightWhite: '#ffffff'
    },
    fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
    fontSize: 13,
    lineHeight: 1.4,
    cursorBlink: false,
    cursorStyle: 'block',
    scrollback: props.maxLines,
    convertEol: true,
    disableStdin: true, // 禁用输入，只用于显示
    allowProposedApi: true
  })

  // 添加插件
  fitAddon = new FitAddon()
  webLinksAddon = new WebLinksAddon()
  
  terminal.loadAddon(fitAddon)
  terminal.loadAddon(webLinksAddon)

  // 打开终端
  terminal.open(terminalRef.value)

  // 适配大小
  fitAddon.fit()

  // 监听窗口大小变化
  resizeObserver = new ResizeObserver(() => {
    if (fitAddon) {
      fitAddon.fit()
    }
  })
  
  if (terminalRef.value) {
    resizeObserver.observe(terminalRef.value)
  }

  console.log('✅ XTerm 终端初始化完成')
}

// 渲染日志到终端
const renderLogs = () => {
  if (!terminal) return

  // 获取新增的日志
  const newLogs = props.logs.slice(renderedLogCount)
  
  if (newLogs.length === 0) return

  // 渲染新日志
  newLogs.forEach((log, index) => {
    let content = log.message || ''
    
    // 使用工具函数处理 thinking 动画
    content = formatThinkingForXTerm(content)
    
    // 跳过空内容
    if (!content) return
    
    // 添加源信息（如果有）
    if (log.source) {
      content = `\x1b[90m[${log.source}]\x1b[0m ${content}`
    }
    
    // 写入终端（自动处理 ANSI 转义序列）
    terminal!.writeln(content)
  })

  // 更新已渲染数量
  renderedLogCount = props.logs.length

  // 自动滚动到底部
  if (props.autoScroll) {
    nextTick(() => {
      terminal!.scrollToBottom()
    })
  }
}

// 清空终端
const clearTerminal = () => {
  if (terminal) {
    terminal.clear()
    renderedLogCount = 0
  }
}

// 滚动到底部
const scrollToBottom = () => {
  if (terminal) {
    terminal.scrollToBottom()
  }
}

// 滚动到顶部
const scrollToTop = () => {
  if (terminal) {
    terminal.scrollToTop()
  }
}

// 监听日志变化
watch(
  () => props.logs,
  () => {
    renderLogs()
  },
  { deep: true }
)

// 监听加载状态
watch(
  () => props.isLoading,
  (isLoading) => {
    if (!terminal) return
    
    if (isLoading) {
      terminal.writeln(`\x1b[33m${props.loadingText}...\x1b[0m`)
    }
  }
)

// 组件挂载
onMounted(() => {
  nextTick(() => {
    initTerminal()
    renderLogs()
  })
})

// 组件卸载
onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
  
  if (terminal) {
    terminal.dispose()
  }
})

// 暴露方法给父组件
defineExpose({
  scrollToBottom,
  scrollToTop,
  clearTerminal,
  terminal: () => terminal
})
</script>

<style scoped lang="scss">
.xterm-log-renderer {
  height: 100%;
  width: 100%;
  background: #0d1117;
  
  .terminal-container {
    height: 100%;
    width: 100%;
    
    // 确保 xterm.js 样式正确应用
    :deep(.xterm) {
      height: 100% !important;
      
      .xterm-viewport {
        background: #0d1117 !important;
      }
      
      .xterm-screen {
        background: #0d1117 !important;
      }
      
      // 自定义滚动条样式
      .xterm-viewport::-webkit-scrollbar {
        width: 8px;
      }
      
      .xterm-viewport::-webkit-scrollbar-track {
        background: #161b22;
      }
      
      .xterm-viewport::-webkit-scrollbar-thumb {
        background: #21262d;
        border-radius: 4px;
        
        &:hover {
          background: #8b949e;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .xterm-log-renderer {
    .terminal-container {
      :deep(.xterm) {
        font-size: 12px !important;
      }
    }
  }
}
</style>
