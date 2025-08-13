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
import { SearchAddon } from '@xterm/addon-search'

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
let searchAddon: SearchAddon | null = null
let resizeObserver: ResizeObserver | null = null

// 上次渲染的内容，用于增量更新
let lastRenderedContent = ''
// 用户滚动状态跟踪
let userScrolledUp = false
let lastScrollPosition = 0
let isUserScrolling = false
let scrollTimeout: number | null = null
let refreshToTopMode = false // 新增：刷新到顶部模式标记

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
    // 字体配置
    fontFamily: 'JetBrains Mono, Consolas, Monaco, "Courier New", monospace',
    fontSize: 13,
    lineHeight: 1.4,
    // 光标配置
    cursorBlink: false,
    cursorStyle: 'block',
    // 终端行为配置
    scrollback: props.maxLines,
    scrollSensitivity: 1, // 滚动敏感度
    fastScrollThreshold: 1000, // 快速滚动阈值
    // 基本配置
    convertEol: true,
    disableStdin: true, // 禁用输入，只用于显示
    allowProposedApi: true,
    // 增强配置
    windowsMode: true, // 启用 Windows 模式，更好地处理换行
    macOptionIsMeta: true, // macOS 上 Option 键作为 Meta 键
    rightClickSelectsWord: true, // 右键选择单词
    fastScrollModifier: 'alt', // Alt 键快速滚动
    fastScrollSensitivity: 5, // 快速滚动敏感度
    // 更好的 ANSI 转义序列支持
    allowTransparency: true, // 允许透明度
    macOptionClickForcesSelection: true // macOS Option+点击强制选择
  })

  // 添加插件
  fitAddon = new FitAddon()
  webLinksAddon = new WebLinksAddon()
  searchAddon = new SearchAddon()
  
  terminal.loadAddon(fitAddon)
  terminal.loadAddon(webLinksAddon)
  terminal.loadAddon(searchAddon)

  // 打开终端
  terminal.open(terminalRef.value)

  // 适配大小
  fitAddon.fit()

  // 监听用户滚动事件
  terminal.onScroll((scrollPosition) => {
    const buffer = terminal!.buffer.active
    const totalLines = buffer.length
    const viewportHeight = terminal!.rows
    const maxScrollPosition = Math.max(0, totalLines - viewportHeight)
    
    // 检查用户是否滚动到了顶部或接近顶部
    const isAtTop = scrollPosition <= 0
    const isNearTop = scrollPosition <= 5 // 允许5行的误差
    
    // 检查用户是否在底部或接近底部
    const isAtBottom = scrollPosition >= maxScrollPosition
    const isNearBottom = scrollPosition >= maxScrollPosition - 5 // 允许5行的误差
    
    // 更新用户滚动状态
    userScrolledUp = !isNearBottom
    lastScrollPosition = scrollPosition
    
    // 标记用户正在滚动
    isUserScrolling = true
    
    // 清除之前的超时
    if (scrollTimeout) {
      clearTimeout(scrollTimeout)
    }
    
    // 设置超时，500ms后认为用户停止滚动
    scrollTimeout = window.setTimeout(() => {
      isUserScrolling = false
    }, 500)
    
    console.log('📜 用户滚动事件:', {
      scrollPosition,
      totalLines,
      maxScrollPosition,
      isAtTop,
      isNearTop,
      isAtBottom,
      isNearBottom,
      userScrolledUp,
      isUserScrolling
    })
  })

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

  console.log('📄 渲染原始日志内容:', {
    contentLength: props.rawContent.length,
    userScrolledUp,
    lastScrollPosition,
    isUserScrolling,
    autoScroll: props.autoScroll
  })

  // 保存当前滚动位置（如果用户手动滚动过）
  let shouldRestorePosition = false
  let savedScrollPosition = 0
  
  if (userScrolledUp && !isUserScrolling) {
    shouldRestorePosition = true
    savedScrollPosition = lastScrollPosition
    console.log('💾 保存用户滚动位置:', savedScrollPosition)
  }

  // 清空终端
  terminal.clear()

  // 直接写入原始内容，xterm会自动处理ANSI转义序列
  if (props.rawContent) {
    // 处理内容，确保正确处理换行和ANSI序列
    const processedContent = props.rawContent
      .replace(/\r\n/g, '\n') // 统一换行符
      .replace(/\r/g, '\n')   // 处理回车符
    
    terminal.write(processedContent)
  }

  // 更新已渲染内容
  lastRenderedContent = props.rawContent

  // 决定滚动行为
  nextTick(() => {
    if (!terminal) return
    
    if (refreshToTopMode) {
      // 刷新到顶部模式：强制滚动到顶部
      console.log('🔄📍 刷新到顶部模式：强制滚动到顶部')
      terminal.scrollToTop()
      userScrolledUp = true // 标记用户已滚动
    } else if (shouldRestorePosition) {
      // 恢复用户之前的滚动位置
      console.log('🔄 恢复用户滚动位置:', savedScrollPosition)
      
      // 由于内容可能发生变化，需要重新计算有效的滚动位置
      const buffer = terminal.buffer.active
      const totalLines = buffer.length
      const viewportHeight = terminal.rows
      const maxScrollPosition = Math.max(0, totalLines - viewportHeight)
      
      // 确保滚动位置在有效范围内
      const validScrollPosition = Math.min(savedScrollPosition, maxScrollPosition)
      
      // 设置滚动位置
      terminal.scrollToLine(validScrollPosition)
      
      console.log('✅ 滚动位置已恢复:', {
        requested: savedScrollPosition,
        actual: validScrollPosition,
        maxScrollPosition
      })
    } else if (props.autoScroll && !userScrolledUp) {
      // 只有在用户没有手动滚动且启用自动滚动时才滚动到底部
      console.log('📍 自动滚动到底部')
      terminal.scrollToBottom()
    } else {
      console.log('⏸️ 跳过自动滚动 - 用户已手动滚动或禁用自动滚动')
    }
  })
}

// 清空终端
const clearTerminal = () => {
  if (terminal) {
    terminal.clear()
    lastRenderedContent = ''
    // 重置滚动状态
    userScrolledUp = false
    lastScrollPosition = 0
    isUserScrolling = false
  }
}

// 滚动到底部
const scrollToBottom = () => {
  if (terminal) {
    terminal.scrollToBottom()
    // 重置用户滚动状态
    userScrolledUp = false
    console.log('📍 手动滚动到底部，重置用户滚动状态')
  }
}

// 滚动到顶部
const scrollToTop = () => {
  if (terminal) {
    terminal.scrollToTop()
    // 标记用户已滚动
    userScrolledUp = true
    console.log('📍 手动滚动到顶部，标记用户已滚动')
  }
}

// 检查是否在底部
const isAtBottom = (): boolean => {
  if (!terminal) return false
  
  const buffer = terminal.buffer.active
  const totalLines = buffer.length
  const viewportHeight = terminal.rows
  const maxScrollPosition = Math.max(0, totalLines - viewportHeight)
  const currentScrollPosition = terminal.buffer.active.viewportY
  
  return currentScrollPosition >= maxScrollPosition - 2 // 允许2行误差
}

// 设置刷新到顶部模式
const setRefreshToTopMode = (enabled: boolean) => {
  refreshToTopMode = enabled
  console.log('🔄📍 设置刷新到顶部模式:', enabled)
}

// 获取当前滚动状态
const getScrollStatus = () => {
  if (!terminal) return null
  
  const buffer = terminal.buffer.active
  const totalLines = buffer.length
  const viewportHeight = terminal.rows
  const currentScrollPosition = terminal.buffer.active.viewportY
  const maxScrollPosition = Math.max(0, totalLines - viewportHeight)
  
  return {
    currentScrollPosition,
    maxScrollPosition,
    totalLines,
    viewportHeight,
    isAtBottom: currentScrollPosition >= maxScrollPosition - 2,
    isAtTop: currentScrollPosition <= 2,
    userScrolledUp,
    isUserScrolling
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
  isAtBottom,
  getScrollStatus,
  setRefreshToTopMode,
  // 添加搜索功能
  search: (term: string) => searchAddon?.findNext(term),
  searchPrevious: (term: string) => searchAddon?.findPrevious(term),
  clearSearch: () => searchAddon?.clearDecorations(),
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
      
      // 搜索高亮样式
      .xterm-decoration-overview-ruler {
        background: rgba(255, 255, 0, 0.3);
      }
      
      // 确保终端内容正确显示
      .xterm-rows {
        background: #0d1117 !important;
      }
      
      // 终端文本样式
      .xterm-text-layer {
        background: #0d1117 !important;
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
