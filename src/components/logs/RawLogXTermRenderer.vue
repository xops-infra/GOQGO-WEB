<template>
  <div class="raw-log-xterm-renderer">
    <div ref="terminalRef" class="terminal-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'

// 导入 xterm.js 样式
import '@xterm/xterm/css/xterm.css'

interface Props {
  rawContent: string
  autoScroll?: boolean
  maxLines?: number
}

const props = withDefaults(defineProps<Props>(), {
  autoScroll: true,
  maxLines: 10000
})

const terminalRef = ref<HTMLElement>()
let terminal: Terminal | null = null
let fitAddon: FitAddon | null = null
let webLinksAddon: WebLinksAddon | null = null
let resizeObserver: ResizeObserver | null = null

// 上次渲染的内容，用于增量更新
let lastRenderedContent = ''

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
    fontFamily: 'JetBrains Mono, Consolas, Monaco, "Courier New", monospace',
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

  console.log('✅ RawLogXTerm 终端初始化完成')
}

// 渲染原始日志内容
const renderRawContent = () => {
  if (!terminal || !props.rawContent) return

  // 如果内容没有变化，不需要重新渲染
  if (props.rawContent === lastRenderedContent) return

  console.log('📄 渲染原始日志内容，长度:', props.rawContent.length)

  // 清空终端
  terminal.clear()

  // 直接写入原始内容，xterm会自动处理ANSI转义序列
  // 类似 cat 或 tail 命令的输出
  if (props.rawContent) {
    terminal.write(props.rawContent)
  }

  // 更新已渲染内容
  lastRenderedContent = props.rawContent

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
    lastRenderedContent = ''
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

// 监听原始内容变化
watch(
  () => props.rawContent,
  () => {
    renderRawContent()
  }
)

// 组件挂载
onMounted(() => {
  nextTick(() => {
    initTerminal()
    renderRawContent()
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
.raw-log-xterm-renderer {
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
        width: 12px;
      }
      
      .xterm-viewport::-webkit-scrollbar-track {
        background: #161b22;
        border-radius: 6px;
      }
      
      .xterm-viewport::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.6);
        border-radius: 6px;
        border: 2px solid #161b22;
        
        &:hover {
          background: rgba(255, 255, 255, 0.8);
        }
        
        &:active {
          background: rgba(255, 255, 255, 0.9);
        }
      }
      
      .xterm-viewport::-webkit-scrollbar-corner {
        background: #161b22;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .raw-log-xterm-renderer {
    .terminal-container {
      :deep(.xterm) {
        font-size: 12px !important;
      }
    }
  }
}
</style>
