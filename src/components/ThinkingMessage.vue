<template>
  <div class="thinking-message" :class="{ 'terminal-mode': isTerminal }">
    <!-- 8-bit风格的头部 -->
    <div class="thinking-header">
      <div class="agent-avatar" :class="{ 'pixel-avatar': isTerminal }">
        <div class="avatar-content">
          {{ agentInitial }}
        </div>
        <div v-if="isTerminal" class="pixel-border"></div>
      </div>
      
      <div class="agent-info">
        <div class="agent-name" :class="{ 'terminal-text': isTerminal }">
          <span v-if="isTerminal" class="terminal-prompt">[AGENT]</span>
          {{ agentName }}
          <span v-if="namespace !== 'default'" class="namespace">
            {{ isTerminal ? `::${namespace.toUpperCase()}` : `.${namespace}` }}
          </span>
        </div>
        
        <div class="thinking-status" :class="{ 'terminal-status': isTerminal }">
          <div class="thinking-dots" :class="{ 'pixel-dots': isTerminal }">
            <span class="dot" :class="{ active: dotIndex >= 0 }">{{ isTerminal ? '█' : '●' }}</span>
            <span class="dot" :class="{ active: dotIndex >= 1 }">{{ isTerminal ? '█' : '●' }}</span>
            <span class="dot" :class="{ active: dotIndex >= 2 }">{{ isTerminal ? '█' : '●' }}</span>
          </div>
          
          <span class="thinking-text" :class="{ 'terminal-text': isTerminal }">
            {{ isTerminal ? 'PROCESSING...' : '思考中...' }}
          </span>
          
          <span class="duration" :class="{ 'terminal-duration': isTerminal }">
            {{ formattedDuration }}
          </span>
        </div>
      </div>
      
      <!-- 状态指示器 -->
      <div class="status-indicator" :class="statusClass">
        <n-icon v-if="!isTerminal" :component="statusIcon" />
        <span v-else class="terminal-status-icon">{{ terminalStatusIcon }}</span>
      </div>
    </div>

    <!-- 思考内容区域 -->
    <div v-if="showContent" class="thinking-content" :class="{ 'terminal-content': isTerminal }">
      <div class="content-header" @click="toggleExpanded">
        <span class="expand-icon" :class="{ expanded: isExpanded, 'terminal-icon': isTerminal }">
          {{ isTerminal ? (isExpanded ? '▼' : '▶') : '▶' }}
        </span>
        <span class="content-label" :class="{ 'terminal-text': isTerminal }">
          {{ isTerminal ? 'THINKING_LOG' : '思考过程' }}
        </span>
        <span class="content-size" :class="{ 'terminal-text': isTerminal }">
          ({{ contentSize }})
        </span>
      </div>
      
      <div v-if="isExpanded" class="content-body" :class="{ 'terminal-body': isTerminal }">
        <!-- 终端输出渲染器 -->
        <div class="terminal-output-container">
          <RawLogXTermRenderer
            ref="terminalRef"
            :raw-content="props.content"
            :auto-scroll="autoScroll"
            :max-lines="maxLines"
            class="thinking-terminal-renderer"
          />
        </div>
        
        <!-- 终端控制按钮 -->
        <div class="terminal-controls" :class="{ 'terminal-controls-8bit': isTerminal }">
          <n-button
            size="tiny"
            :type="autoScroll ? 'primary' : 'default'"
            @click="toggleAutoScroll"
            :class="{ 'btn-8bit': isTerminal }"
          >
            <template #icon>
              <n-icon><ArrowDownIcon /></n-icon>
            </template>
            {{ autoScroll ? '自动滚动' : '手动滚动' }}
          </n-button>
          
          <n-button
            size="tiny"
            @click="scrollToBottom"
            :class="{ 'btn-8bit': isTerminal }"
          >
            <template #icon>
              <n-icon><ArrowDownIcon /></n-icon>
            </template>
            到底部
          </n-button>
          
          <n-button
            size="tiny"
            @click="scrollToTop"
            :class="{ 'btn-8bit': isTerminal }"
          >
            <template #icon>
              <n-icon><ArrowUpIcon /></n-icon>
            </template>
            到顶部
          </n-button>
          
          <n-button
            size="tiny"
            @click="clearTerminal"
            :class="{ 'btn-8bit': isTerminal }"
          >
            <template #icon>
              <n-icon><TrashIcon /></n-icon>
            </template>
            清空
          </n-button>
          
          <n-button
            size="tiny"
            @click="copyToClipboard"
            :class="{ 'btn-8bit': isTerminal }"
          >
            <template #icon>
              <n-icon><CopyIcon /></n-icon>
            </template>
            复制
          </n-button>
        </div>
      </div>
    </div>

    <!-- 超时/错误状态 -->
    <div v-if="status === 'timeout' || status === 'error'" class="error-section" :class="{ 'terminal-error': isTerminal }">
      <div class="error-message" :class="{ 'terminal-text': isTerminal }">
        <n-icon v-if="!isTerminal" :component="AlertCircleOutline" class="error-icon" />
        <span v-else class="terminal-error-icon">⚠</span>
        {{ errorMessage }}
      </div>
      
      <n-button 
        v-if="showRetryButton"
        size="small" 
        type="primary"
        :class="{ 'btn-8bit': isTerminal }"
        @click="handleRetry"
      >
        {{ isTerminal ? 'RETRY' : '重试' }}
      </n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { NIcon, NButton } from 'naive-ui'
import { 
  AlertCircleOutline, 
  TimeOutline, 
  CheckmarkCircleOutline,
  ArrowDownOutline as ArrowDownIcon,
  ArrowUpOutline as ArrowUpIcon,
  TrashOutline as TrashIcon,
  CopyOutline as CopyIcon
} from '@vicons/ionicons5'
import { useTheme } from '@/utils/theme'
import { useTimeManager, formatRelativeTime } from '@/utils/timeManager'
import type { ConversationState } from '@/types/conversation'
import RawLogXTermRenderer from '@/components/logs/RawLogXTermRenderer.vue'

interface Props {
  conversationId: string
  agentName: string
  namespace?: string
  content: string
  startTime: number
  status?: 'thinking' | 'completed' | 'timeout' | 'error'
  error?: string
  showRetryButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  namespace: 'default',
  status: 'thinking',
  showRetryButton: true
})

const emit = defineEmits<{
  retry: [conversationId: string]
}>()

const { isTerminal } = useTheme()
const { currentTime } = useTimeManager()

// 响应式状态
const isExpanded = ref(false)
const dotIndex = ref(0)
// 移除 maxDisplayLength，因为现在使用终端渲染器

// 终端相关状态
const terminalRef = ref<InstanceType<typeof RawLogXTermRenderer> | null>(null)
const autoScroll = ref(true)
const maxLines = 10000

// 动画定时器
let dotAnimation: number | null = null

// 计算属性
const agentInitial = computed(() => {
  return props.agentName.charAt(0).toUpperCase()
})

const showContent = computed(() => {
  return props.content && props.content.length > 0
})

const contentSize = computed(() => {
  const length = props.content.length
  if (length < 1024) {
    return `${length}B`
  } else {
    return `${Math.round(length / 1024)}KB`
  }
})

// 移除 displayContent 和 hasMoreContent，因为现在使用终端渲染器

// 移除 scrollThumbHeight，因为现在使用终端渲染器的内置滚动条

const formattedDuration = computed(() => {
  const duration = Date.now() - props.startTime
  const seconds = Math.floor(duration / 1000)
  
  if (isTerminal.value) {
    return `${seconds.toString().padStart(2, '0')}s`
  } else {
    return `${seconds}秒`
  }
})

const statusClass = computed(() => {
  const baseClass = isTerminal.value ? 'terminal-status-indicator' : 'status-indicator'
  return [baseClass, props.status]
})

const statusIcon = computed(() => {
  switch (props.status) {
    case 'thinking':
      return TimeOutline
    case 'completed':
      return CheckmarkCircleOutline
    case 'timeout':
    case 'error':
      return AlertCircleOutline
    default:
      return TimeOutline
  }
})

const terminalStatusIcon = computed(() => {
  switch (props.status) {
    case 'thinking':
      return '⏳'
    case 'completed':
      return '✓'
    case 'timeout':
      return '⏰'
    case 'error':
      return '✗'
    default:
      return '⏳'
  }
})

const errorMessage = computed(() => {
  if (props.status === 'timeout') {
    return isTerminal.value ? 'RESPONSE_TIMEOUT' : '响应超时'
  } else if (props.status === 'error') {
    return props.error || (isTerminal.value ? 'PROCESSING_ERROR' : '处理错误')
  }
  return ''
})

// 方法
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const handleRetry = () => {
  emit('retry', props.conversationId)
}

// 终端控制方法
const toggleAutoScroll = () => {
  autoScroll.value = !autoScroll.value
}

const scrollToBottom = () => {
  if (terminalRef.value) {
    terminalRef.value.scrollToBottom()
  }
}

const scrollToTop = () => {
  if (terminalRef.value) {
    terminalRef.value.scrollToTop()
  }
}

const clearTerminal = () => {
  if (terminalRef.value) {
    terminalRef.value.clearTerminal()
  }
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(props.content)
    // 可以添加一个提示消息
    console.log('✅ 终端内容已复制到剪贴板')
  } catch (err) {
    console.error('❌ 复制失败:', err)
  }
}

const startDotAnimation = () => {
  if (dotAnimation) {
    clearInterval(dotAnimation)
  }
  
  dotAnimation = setInterval(() => {
    dotIndex.value = (dotIndex.value + 1) % 4
  }, 500)
}

const stopDotAnimation = () => {
  if (dotAnimation) {
    clearInterval(dotAnimation)
    dotAnimation = null
  }
}

// 监听状态变化
watch(() => props.status, (newStatus) => {
  if (newStatus === 'thinking') {
    startDotAnimation()
  } else {
    stopDotAnimation()
  }
}, { immediate: true })

// 生命周期
onMounted(() => {
  if (props.status === 'thinking') {
    startDotAnimation()
  }
})

onUnmounted(() => {
  stopDotAnimation()
})
</script>

<style scoped lang="scss">
.thinking-message {
  background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
  border: 2px solid #4a90e2;
  border-radius: 12px;
  padding: 16px;
  margin: 12px 0;
  position: relative;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(74, 144, 226, 0.2);
  }

  &.terminal-mode {
    background: #0a0a0a;
    border: 2px solid #00ff00;
    border-radius: 0;
    font-family: 'JetBrains Mono', 'Consolas', monospace;
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);

    &:hover {
      box-shadow: 0 0 15px rgba(0, 255, 0, 0.5);
    }
  }
}

.thinking-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.agent-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4a90e2, #357abd);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;

  .avatar-content {
    color: white;
    font-weight: bold;
    font-size: 16px;
  }

  &.pixel-avatar {
    border-radius: 0;
    background: #00ff00;
    border: 2px solid #ffffff;
    
    .avatar-content {
      color: #000000;
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
    }

    .pixel-border {
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      border: 1px solid #00ff00;
      pointer-events: none;
    }
  }
}

.agent-info {
  flex: 1;
  min-width: 0;
}

.agent-name {
  font-weight: 600;
  color: #1da1f2;
  font-size: 14px;
  margin-bottom: 4px;

  .terminal-prompt {
    color: #00ff00;
    margin-right: 4px;
  }

  .namespace {
    font-size: 12px;
    color: #666;
    font-weight: normal;
  }

  &.terminal-text {
    color: #00ff00;
    text-transform: uppercase;
    
    .namespace {
      color: #ffff00;
    }
  }
}

.thinking-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.thinking-dots {
  display: flex;
  gap: 2px;

  .dot {
    color: #4a90e2;
    opacity: 0.3;
    transition: opacity 0.3s ease;

    &.active {
      opacity: 1;
    }
  }

  &.pixel-dots .dot {
    color: #00ff00;
    font-family: monospace;
  }
}

.thinking-text {
  color: #666;
  font-style: italic;

  &.terminal-text {
    color: #ffff00;
    font-style: normal;
    text-transform: uppercase;
  }
}

.duration {
  color: #999;
  font-size: 11px;

  &.terminal-duration {
    color: #00ffff;
    font-family: monospace;
  }
}

.status-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  
  &.thinking {
    color: #4a90e2;
    background: rgba(74, 144, 226, 0.1);
  }
  
  &.completed {
    color: #17bf63;
    background: rgba(23, 191, 99, 0.1);
  }
  
  &.timeout, &.error {
    color: #e0245e;
    background: rgba(224, 36, 94, 0.1);
  }

  &.terminal-status-indicator {
    border-radius: 0;
    background: transparent;
    border: 1px solid;
    font-family: monospace;
    font-size: 12px;

    &.thinking {
      color: #ffff00;
      border-color: #ffff00;
    }
    
    &.completed {
      color: #00ff00;
      border-color: #00ff00;
    }
    
    &.timeout, &.error {
      color: #ff0000;
      border-color: #ff0000;
    }
  }
}

.thinking-content {
  border-top: 1px solid rgba(74, 144, 226, 0.2);
  padding-top: 12px;

  &.terminal-content {
    border-top: 1px solid #00ff00;
  }
}

.content-header {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 0;
  user-select: none;

  &:hover {
    background: rgba(74, 144, 226, 0.05);
  }

  .terminal-content &:hover {
    background: rgba(0, 255, 0, 0.1);
  }
}

.expand-icon {
  color: #4a90e2;
  font-size: 12px;
  transition: transform 0.2s ease;

  &.expanded {
    transform: rotate(90deg);
  }

  &.terminal-icon {
    color: #00ff00;
    font-family: monospace;
  }
}

.content-label {
  font-size: 12px;
  font-weight: 500;
  color: #666;

  &.terminal-text {
    color: #00ff00;
    text-transform: uppercase;
  }
}

.content-size {
  font-size: 11px;
  color: #999;
  margin-left: auto;

  &.terminal-text {
    color: #00ffff;
  }
}

.content-body {
  margin-top: 8px;
  position: relative;

  &.terminal-body {
    border: 1px solid #00ff00;
    background: rgba(0, 0, 0, 0.5);
  }
}

.terminal-output-container {
  height: 300px;
  margin-bottom: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;

  .thinking-terminal-renderer {
    height: 100%;
    width: 100%;
  }

  &.terminal-body {
    border: 1px solid #00ff00;
    border-radius: 0;
  }
}

.terminal-controls {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding: 8px 0;
  border-top: 1px solid rgba(0, 0, 0, 0.1);

  &.terminal-controls-8bit {
    border-top: 1px solid #00ff00;
  }

  .n-button {
    font-size: 11px;
    padding: 4px 8px;
    height: 24px;
  }
}

// 移除 terminal-scrollbar 样式，因为现在使用终端渲染器的内置滚动条

.error-section {
  margin-top: 12px;
  padding: 8px 12px;
  background: rgba(224, 36, 94, 0.1);
  border: 1px solid rgba(224, 36, 94, 0.3);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  &.terminal-error {
    background: rgba(255, 0, 0, 0.1);
    border: 1px solid #ff0000;
    border-radius: 0;
  }
}

.error-message {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #e0245e;

  .error-icon {
    font-size: 14px;
  }

  .terminal-error-icon {
    color: #ff0000;
    font-family: monospace;
  }

  &.terminal-text {
    color: #ff0000;
    text-transform: uppercase;
  }
}

// 8-bit按钮样式
.btn-8bit {
  background: #00ff00 !important;
  color: #000000 !important;
  border: 2px solid #ffffff !important;
  border-radius: 0 !important;
  font-family: 'JetBrains Mono', monospace !important;
  text-transform: uppercase !important;
  font-weight: bold !important;
  font-size: 11px !important;
  padding: 4px 8px !important;
  
  &:hover {
    background: #ffffff !important;
    color: #000000 !important;
    border-color: #00ff00 !important;
    box-shadow: 0 0 5px rgba(0, 255, 0, 0.5) !important;
  }
}

// 动画效果
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.thinking-message {
  animation: fadeIn 0.3s ease-out;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 1;
  }
}

.thinking-dots .dot.active {
  animation: pulse 1s ease-in-out infinite;
}
</style>
