<template>
  <div class="thinking-stream-display" :class="{ 'terminal-mode': isTerminal }">
    <!-- 思考内容轮换显示 -->
    <div class="thinking-lines" :class="{ 'terminal-lines': isTerminal }">
      <div 
        v-for="(line, index) in displayLines" 
        :key="`line-${line.id}`"
        class="thinking-line"
        :class="{ 
          'terminal-line': isTerminal,
          'fade-in': line.isNew,
          'fade-out': line.isRemoving,
          'line-type': getLineType(line.content)
        }"
        :style="{ 
          animationDelay: `${index * 0.05}s`,
          opacity: line.isRemoving ? 0 : 1
        }"
      >
        <!-- 终端输出格式处理 -->
        <span v-if="isTerminal" class="line-prefix">{{ getLinePrefix(line.content) }}</span>
        <span class="line-content">{{ formatLineContent(line.content) }}</span>
      </div>
    </div>
    
    <!-- 思考指示器 -->
    <div v-if="!hasContent" class="thinking-indicator">
      <span class="thinking-text" :class="{ 'terminal-text': isTerminal }">
        {{ isTerminal ? 'PROCESSING...' : '正在思考...' }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useTheme } from '@/utils/theme'

interface Props {
  content?: string
}

const props = withDefaults(defineProps<Props>(), {
  content: ''
})

const { isTerminal } = useTheme()

// 响应式状态
const displayLines = ref<Array<{ 
  id: string; 
  content: string; 
  isNew: boolean; 
  isRemoving: boolean;
  timestamp: number;
}>>([])
const maxLines = 5 // 最大显示行数
const lineQueue = ref<string[]>([])
const lineCounter = ref(0)

// 计算属性
const hasContent = computed(() => {
  return props.content && props.content.trim().length > 0
})

const cleanContent = computed(() => {
  if (!props.content) return ''
  
  // 清理ANSI转义序列
  return props.content
    .replace(/\u001B\[[?]?[0-9;]*[a-zA-Z]/g, '') // 移除ANSI转义序列
    .replace(/\u001B\[[?]?[0-9;]*[hlm]/g, '')    // 移除其他控制序列
    .replace(/[\u0000-\u001F\u007F]/g, '')       // 移除其他控制字符
    .trim()
})

// 方法
const generateLineId = () => {
  return `line-${Date.now()}-${++lineCounter.value}`
}

const addNewLine = (content: string) => {
  const lineId = generateLineId()
  const newLine = {
    id: lineId,
    content: content.trim(),
    isNew: true,
    isRemoving: false,
    timestamp: Date.now()
  }
  
  // 添加新行到显示列表
  displayLines.value.push(newLine)
  
  // 如果超过最大行数，移除最旧的行
  if (displayLines.value.length > maxLines) {
    const removedLine = displayLines.value.shift()
    if (removedLine) {
      // 标记为正在移除
      removedLine.isRemoving = true
    }
  }
  
  // 延迟移除动画效果
  setTimeout(() => {
    displayLines.value = displayLines.value.filter(line => !line.isRemoving)
  }, 300)
  
  // 延迟取消新行标记
  setTimeout(() => {
    const line = displayLines.value.find(l => l.id === lineId)
    if (line) {
      line.isNew = false
    }
  }, 500)
}

const processContent = (content: string) => {
  if (!content) return
  
  // 清理内容
  const cleanContent = content
    .replace(/\u001B\[[?]?[0-9;]*[a-zA-Z]/g, '') // 移除ANSI转义序列
    .replace(/\u001B\[[?]?[0-9;]*[hlm]/g, '')    // 移除其他控制序列
    .replace(/[\u0000-\u001F\u007F]/g, '')       // 移除其他控制字符
    .trim()
  
  if (!cleanContent) return
  
  // 按行分割内容
  const lines = cleanContent.split('\n').filter(line => line.trim().length > 0)
  
  // 处理每一行
  lines.forEach(line => {
    const trimmedLine = line.trim()
    if (trimmedLine) {
      addNewLine(trimmedLine)
    }
  })
}

// 终端输出格式处理
const getLineType = (content: string): string => {
  if (content.startsWith('ERROR') || content.includes('error')) return 'error'
  if (content.startsWith('WARN') || content.includes('warning')) return 'warning'
  if (content.startsWith('INFO') || content.includes('info')) return 'info'
  if (content.startsWith('DEBUG') || content.includes('debug')) return 'debug'
  if (content.startsWith('SUCCESS') || content.includes('success')) return 'success'
  return 'normal'
}

const getLinePrefix = (content: string): string => {
  if (content.startsWith('ERROR')) return '[ERROR]'
  if (content.startsWith('WARN')) return '[WARN]'
  if (content.startsWith('INFO')) return '[INFO]'
  if (content.startsWith('DEBUG')) return '[DEBUG]'
  if (content.startsWith('SUCCESS')) return '[SUCCESS]'
  return '>'
}

const formatLineContent = (content: string): string => {
  // 移除前缀，只显示内容部分
  const prefixes = ['ERROR:', 'WARN:', 'INFO:', 'DEBUG:', 'SUCCESS:']
  for (const prefix of prefixes) {
    if (content.startsWith(prefix)) {
      return content.substring(prefix.length).trim()
    }
  }
  return content
}

// 监听内容变化 - 处理增量更新
watch(() => props.content, (newContent, oldContent) => {
  if (newContent !== oldContent) {
    // 如果是新的内容，处理增量更新
    if (newContent && oldContent) {
      // 提取新增的内容
      const newLines = newContent.substring(oldContent.length)
      if (newLines) {
        processContent(newLines)
      }
    } else if (newContent) {
      // 首次加载，处理全部内容
      processContent(newContent)
    }
  }
}, { immediate: true })

// 生命周期
onMounted(() => {
  // 初始化显示
  if (props.content) {
    processContent(props.content)
  }
})

onUnmounted(() => {
  // 清理
  displayLines.value = []
  lineQueue.value = []
})
</script>

<style scoped lang="scss">
.thinking-stream-display {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-height: 20px;
  max-height: 120px; // 限制最大高度
  overflow: hidden;
}

.thinking-lines {
  display: flex;
  flex-direction: column;
  gap: 1px;
  
  &.terminal-lines {
    font-family: 'Courier New', monospace;
    font-size: 11px;
  }
}

.thinking-line {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.3;
  padding: 1px 0;
  transition: all 0.3s ease;
  animation: slideInUp 0.3s ease-out;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  &.terminal-line {
    color: #00ff41;
    font-family: 'Courier New', monospace;
    font-size: 10px;
    text-shadow: 0 0 3px rgba(0, 255, 65, 0.2);
    
    .line-prefix {
      color: #ffff00;
      margin-right: 4px;
      font-weight: bold;
    }
  }
  
  &.fade-in {
    animation: fadeInUp 0.3s ease-out;
  }
  
  &.fade-out {
    animation: fadeOutUp 0.3s ease-out;
  }
  
  // 行类型样式
  &.line-type-error {
    color: #ff4444;
    
    &.terminal-line {
      color: #ff0000;
      text-shadow: 0 0 3px rgba(255, 0, 0, 0.3);
    }
  }
  
  &.line-type-warning {
    color: #ffaa00;
    
    &.terminal-line {
      color: #ffff00;
      text-shadow: 0 0 3px rgba(255, 255, 0, 0.3);
    }
  }
  
  &.line-type-info {
    color: #4444ff;
    
    &.terminal-line {
      color: #00ffff;
      text-shadow: 0 0 3px rgba(0, 255, 255, 0.3);
    }
  }
  
  &.line-type-success {
    color: #44ff44;
    
    &.terminal-line {
      color: #00ff00;
      text-shadow: 0 0 3px rgba(0, 255, 0, 0.3);
    }
  }
}

.line-content {
  word-break: break-all;
}

.thinking-indicator {
  display: flex;
  align-items: center;
  
  .thinking-text {
    color: var(--text-tertiary);
    font-style: italic;
    font-size: 12px;
    
    &.terminal-text {
      color: #ffff00;
      font-style: normal;
      text-transform: uppercase;
      font-family: 'Courier New', monospace;
      text-shadow: 0 0 3px rgba(255, 255, 0, 0.3);
    }
  }
}

// 动画效果
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeOutUp {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-4px);
  }
}

// Terminal主题特殊样式
[data-theme='terminal'] {
  .thinking-stream-display {
    .thinking-line {
      color: #00ff41;
      font-family: 'Courier New', monospace;
      text-shadow: 0 0 2px rgba(0, 255, 65, 0.2);
    }
    
    .thinking-indicator {
      .thinking-text {
        color: #ffff00;
        text-shadow: 0 0 2px rgba(255, 255, 0, 0.2);
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .thinking-stream-display {
    max-height: 100px;
  }
  
  .thinking-line {
    font-size: 11px;
    
    &.terminal-line {
      font-size: 9px;
    }
  }
}
</style> 