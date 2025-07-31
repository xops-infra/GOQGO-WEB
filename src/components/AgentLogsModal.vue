<template>
  <div
    v-if="visible"
    ref="modalRef"
    class="agent-logs-modal"
    :style="{
      width: modalSize.width + 'px',
      height: modalSize.height + 'px',
      left: modalPosition.x + 'px',
      top: modalPosition.y + 'px'
    }"
    @click="handleWindowClick"
  >
      <!-- 标题栏 -->
      <div
        ref="headerRef"
        class="modal-header"
        @mousedown="startDrag"
      >
        <div class="header-left">
          <n-icon size="18" color="#07c160">
            <svg viewBox="0 0 24 24">
              <path fill="currentColor" d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,19H5V5H19V19Z"/>
            </svg>
          </n-icon>
          <div class="header-title">
            <h3>{{ agent?.name }} - 实时日志</h3>
            <span class="header-subtitle">{{ agent?.namespace }} / {{ agent?.role }}</span>
          </div>
        </div>
        <div class="header-right">
          <n-space>
            <n-tooltip>
              <template #trigger>
                <n-button
                  size="small"
                  quaternary
                  :type="isFollowing ? 'primary' : 'default'"
                  @click="toggleFollow"
                  :disabled="!isConnected"
                >
                  <template #icon>
                    <n-icon>
                      <svg viewBox="0 0 24 24">
                        <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M10,8L16,12L10,16V8Z"/>
                      </svg>
                    </n-icon>
                  </template>
                </n-button>
              </template>
              {{ isFollowing ? '停止跟随' : '跟随日志' }}
            </n-tooltip>
            <n-tooltip>
              <template #trigger>
                <n-button 
                  size="small" 
                  quaternary 
                  @click="loadHistoryLogs"
                  :loading="isLoadingHistory"
                  :disabled="!isConnected || hasReachedTop"
                >
                  <template #icon>
                    <n-icon>
                      <svg viewBox="0 0 24 24">
                        <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M11,8H13V12L16.2,14.2L15.2,15.8L11,13V8Z"/>
                      </svg>
                    </n-icon>
                  </template>
                </n-button>
              </template>
              {{ hasReachedTop ? '已到顶部' : '加载历史' }}
            </n-tooltip>
            <n-tooltip>
              <template #trigger>
                <n-button size="small" quaternary @click="clearLogs">
                  <template #icon>
                    <n-icon>
                      <svg viewBox="0 0 24 24">
                        <path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
                      </svg>
                    </n-icon>
                  </template>
                </n-button>
              </template>
              清空日志
            </n-tooltip>
            <n-button size="small" quaternary @click="closeModal">
              <template #icon>
                <n-icon>
                  <svg viewBox="0 0 24 24">
                    <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                  </svg>
                </n-icon>
              </template>
            </n-button>
          </n-space>
        </div>
      </div>

      <!-- 日志内容区域 -->
      <div class="modal-body">
        <!-- 加载历史日志提示 -->
        <div v-if="isLoadingHistory" class="loading-history">
          <n-spin size="small" />
          <span>加载历史日志中...</span>
        </div>
        
        <div
          ref="logsContainerRef"
          class="logs-container"
          @scroll="handleScroll"
        >
          <div class="logs-content">
            <div
              v-for="(log, index) in logs"
              :key="`${log.timestamp}-${index}`"
              :class="['log-line', `log-${log.level}`]"
            >
              <span class="log-timestamp">{{ formatTimestamp(log.timestamp) }}</span>
              <span class="log-level">{{ log.level.toUpperCase() }}</span>
              <span class="log-source" v-if="log.source">[{{ log.source }}]</span>
              <span class="log-message">{{ log.message }}</span>
            </div>
            
            <!-- 空状态 -->
            <div v-if="logs.length === 0 && !isConnecting" class="empty-logs">
              <n-icon size="48" color="#ccc">
                <svg viewBox="0 0 24 24">
                  <path fill="currentColor" d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,19H5V5H19V19Z"/>
                </svg>
              </n-icon>
              <p>暂无日志数据</p>
            </div>
            
            <!-- 连接中状态 -->
            <div v-if="isConnecting" class="connecting-logs">
              <n-spin size="large" />
              <p>正在连接日志流...</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 状态栏 -->
      <div class="modal-footer">
        <div class="footer-left">
          <n-tag :type="getConnectionStatus().type" size="small" round>
            {{ getConnectionStatus().text }}
          </n-tag>
          <span class="log-count">共 {{ logs.length }} 条日志</span>
          <span v-if="initialLines" class="initial-lines">初始加载: {{ initialLines }} 行</span>
        </div>
        <div class="footer-right">
          <span class="last-update" v-if="lastUpdateTime">
            最后更新: {{ formatTimestamp(lastUpdateTime) }}
          </span>
        </div>
      </div>

      <!-- 调整大小手柄 -->
      <div
        class="resize-handle resize-handle-se"
        @mousedown="startResize"
      ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useMessage } from 'naive-ui'
import { type Agent, type LogEntry } from '@/api/agents'
import { LogSocket } from '@/utils/logSocket'

// Props
interface Props {
  agent: Agent | null
  show: boolean
  resetPosition?: number
  bringToFront?: number
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:show': [value: boolean]
  'close': []
}>()

// 响应式数据
const visible = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
})

const modalRef = ref<HTMLElement>()
const headerRef = ref<HTMLElement>()
const logsContainerRef = ref<HTMLElement>()
const message = useMessage()

// 日志相关状态
const logs = ref<LogEntry[]>([])
const isFollowing = ref(true)
const isConnected = ref(false)
const isConnecting = ref(false)
const isLoadingHistory = ref(false)
const hasReachedTop = ref(false)
const lastUpdateTime = ref<string>()
const initialLines = ref<number>(100)
const logSocket = ref<LogSocket | null>(null)

// 模态框位置和大小
const modalPosition = ref({ x: 0, y: 0 })
const modalSize = ref({ width: 800, height: 600 })

// 拖拽状态
const isDragging = ref(false)
const isResizing = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const resizeStart = ref({ x: 0, y: 0, width: 0, height: 0 })

// 连接WebSocket获取实时日志
const connectLogStream = async () => {
  if (!props.agent) {
    console.error('❌ 无法连接日志流: agent 为空')
    message.error('无法连接日志流: agent 信息为空')
    return
  }
  
  console.log('🚀 开始连接日志流:', props.agent.name, props.agent.namespace)
  
  // 检查后端服务是否可用
  try {
    const response = await fetch('http://localhost:8080/')
    if (!response.ok) {
      throw new Error(`后端服务响应错误: ${response.status}`)
    }
    console.log('✅ 后端服务检查通过')
  } catch (error) {
    console.error('❌ 后端服务不可用:', error)
    message.error('无法连接到后端服务，请启动 GoQGo API 服务器：goqgo apiserver --port 8080', {
      duration: 10000
    })
    isConnecting.value = false
    return
  }
  
  try {
    isConnecting.value = true
    
    // 断开现有连接
    if (logSocket.value) {
      console.log('🔄 断开现有连接')
      logSocket.value.disconnect()
    }
    
    // 创建新的日志连接
    logSocket.value = new LogSocket(
      props.agent.namespace,
      props.agent.name,
      { lines: initialLines.value, follow: true },
      {
        onConnect: () => {
          console.log('📡 日志流连接成功')
          isConnected.value = true
          isConnecting.value = false
        },
        onDisconnect: () => {
          console.log('📡 日志流连接断开')
          isConnected.value = false
          isConnecting.value = false
        },
        onInitial: (initialLogs) => {
          console.log('📋 收到初始日志:', initialLogs.length, '条')
          logs.value = [...initialLogs]
          lastUpdateTime.value = new Date().toISOString()
          
          // 滚动到底部
          nextTick(() => {
            scrollToBottom()
          })
        },
        onAppend: (newLog) => {
          console.log('➕ 收到新日志:', newLog.message.substring(0, 50))
          logs.value.push(newLog)
          lastUpdateTime.value = new Date().toISOString()
          
          // 如果正在跟随，自动滚动到底部
          if (isFollowing.value) {
            nextTick(() => {
              scrollToBottom()
            })
          }
        },
        onHistory: (historyLogs, hasMore) => {
          console.log('📜 收到历史日志:', historyLogs.length, '条, hasMore:', hasMore)
          
          // 保存当前滚动位置
          const container = logsContainerRef.value
          const oldScrollHeight = container?.scrollHeight || 0
          const oldScrollTop = container?.scrollTop || 0
          
          // 将历史日志添加到开头
          logs.value = [...historyLogs, ...logs.value]
          hasReachedTop.value = !hasMore
          isLoadingHistory.value = false
          
          // 恢复滚动位置
          nextTick(() => {
            if (container) {
              const newScrollHeight = container.scrollHeight
              const heightDiff = newScrollHeight - oldScrollHeight
              container.scrollTop = oldScrollTop + heightDiff
            }
          })
        },
        onError: (error) => {
          console.error('📡 日志流错误:', error)
          message.error(`日志连接错误: ${error}`)
          isConnected.value = false
          isConnecting.value = false
          isLoadingHistory.value = false
        }
      }
    )
    
    console.log('🔗 尝试连接 WebSocket...')
    await logSocket.value.connect()
    console.log('✅ WebSocket 连接完成')
  } catch (error) {
    console.error('❌ 创建日志流失败:', error)
    message.error('无法连接日志流: ' + error.message)
    isConnected.value = false
    isConnecting.value = false
  }
}

// 断开日志流
const disconnectLogStream = () => {
  if (logSocket.value) {
    logSocket.value.disconnect()
    logSocket.value = null
  }
  isConnected.value = false
  isConnecting.value = false
}

// 加载历史日志
const loadHistoryLogs = () => {
  if (!logSocket.value || !isConnected.value || isLoadingHistory.value || hasReachedTop.value) {
    return
  }
  
  console.log('📜 请求加载历史日志')
  isLoadingHistory.value = true
  logSocket.value.loadHistory()
}

// 切换跟随模式
const toggleFollow = () => {
  isFollowing.value = !isFollowing.value
  if (isFollowing.value) {
    scrollToBottom()
  }
}

// 清空日志
const clearLogs = () => {
  logs.value = []
  hasReachedTop.value = false
}

// 滚动到底部
const scrollToBottom = () => {
  if (logsContainerRef.value) {
    logsContainerRef.value.scrollTop = logsContainerRef.value.scrollHeight
  }
}

// 处理滚动事件
const handleScroll = () => {
  if (!logsContainerRef.value) return
  
  const { scrollTop, scrollHeight, clientHeight } = logsContainerRef.value
  const isAtBottom = scrollHeight - scrollTop - clientHeight < 10
  const isAtTop = scrollTop < 10
  
  // 如果用户手动滚动到非底部位置，停止自动跟随
  if (!isAtBottom && isFollowing.value) {
    isFollowing.value = false
  }
  
  // 如果滚动到顶部且有更多历史日志，自动加载
  if (isAtTop && !isLoadingHistory.value && !hasReachedTop.value && isConnected.value) {
    loadHistoryLogs()
  }
}

// 开始拖拽
const startDrag = (e: MouseEvent) => {
  if (e.target !== headerRef.value && !headerRef.value?.contains(e.target as Node)) return
  
  isDragging.value = true
  dragStart.value = {
    x: e.clientX - modalPosition.value.x,
    y: e.clientY - modalPosition.value.y
  }
  
  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDrag)
  e.preventDefault()
}

// 处理拖拽
const handleDrag = (e: MouseEvent) => {
  if (!isDragging.value) return
  
  modalPosition.value = {
    x: e.clientX - dragStart.value.x,
    y: e.clientY - dragStart.value.y
  }
}

// 停止拖拽
const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
}

// 开始调整大小
const startResize = (e: MouseEvent) => {
  isResizing.value = true
  resizeStart.value = {
    x: e.clientX,
    y: e.clientY,
    width: modalSize.value.width,
    height: modalSize.value.height
  }
  
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  e.preventDefault()
}

// 处理调整大小
const handleResize = (e: MouseEvent) => {
  if (!isResizing.value) return
  
  const deltaX = e.clientX - resizeStart.value.x
  const deltaY = e.clientY - resizeStart.value.y
  
  modalSize.value = {
    width: Math.max(400, resizeStart.value.width + deltaX),
    height: Math.max(300, resizeStart.value.height + deltaY)
  }
}

// 停止调整大小
const stopResize = () => {
  isResizing.value = false
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}

// 窗口焦点管理
const bringToFront = () => {
  if (modalRef.value) {
    // 获取当前最高的z-index
    const allModals = document.querySelectorAll('.agent-logs-modal')
    let maxZIndex = 1001
    
    allModals.forEach(modal => {
      const zIndex = parseInt(window.getComputedStyle(modal).zIndex || '1001')
      if (zIndex > maxZIndex) {
        maxZIndex = zIndex
      }
    })
    
    // 设置当前窗口为最高层
    modalRef.value.style.zIndex = (maxZIndex + 1).toString()
    console.log('🔝 窗口置顶:', props.agent?.name, 'z-index:', maxZIndex + 1)
  }
}

// 点击窗口时置顶
const handleWindowClick = () => {
  bringToFront()
}

// 关闭模态框
const closeModal = () => {
  console.log('❌ 用户关闭日志窗口:', props.agent?.name)
  visible.value = false
  emit('close')
}

// 格式化时间戳
const formatTimestamp = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 获取连接状态
const getConnectionStatus = () => {
  if (isConnecting.value) {
    return { type: 'warning' as const, text: '连接中' }
  } else if (isConnected.value) {
    return { type: 'success' as const, text: '已连接' }
  } else {
    return { type: 'error' as const, text: '未连接' }
  }
}

// 监听agent变化
watch(() => props.agent, (newAgent) => {
  if (newAgent && visible.value) {
    disconnectLogStream()
    logs.value = []
    hasReachedTop.value = false
    connectLogStream()
  }
})

// 初始化模态框位置和大小
const initializeModal = () => {
  // 重置到默认大小
  modalSize.value = { width: 800, height: 600 }
  
  // 计算居中位置
  const centerX = (window.innerWidth - modalSize.value.width) / 2
  const centerY = (window.innerHeight - modalSize.value.height) / 2
  
  // 获取当前已打开的窗口数量（不包括当前窗口）
  const existingWindows = document.querySelectorAll('.agent-logs-modal')
  const windowCount = existingWindows.length
  
  // 计算偏移量，使用更好的分布算法
  let offsetX = 0
  let offsetY = 0
  
  if (windowCount > 0) {
    // 使用螺旋式分布，避免窗口重叠
    const angle = (windowCount * 45) % 360 // 每个窗口旋转45度
    const radius = Math.min(50 + windowCount * 20, 150) // 半径递增，最大150px
    
    offsetX = Math.cos(angle * Math.PI / 180) * radius
    offsetY = Math.sin(angle * Math.PI / 180) * radius
  }
  
  // 确保窗口不会超出屏幕边界
  const finalX = Math.max(0, Math.min(centerX + offsetX, window.innerWidth - modalSize.value.width))
  const finalY = Math.max(0, Math.min(centerY + offsetY, window.innerHeight - modalSize.value.height))
  
  modalPosition.value = { x: finalX, y: finalY }
  
  console.log('📐 初始化日志窗口位置:', modalPosition.value, '大小:', modalSize.value, '窗口数:', windowCount)
}

// 监听模态框显示状态
watch(visible, async (show) => {
  console.log('👁️ 日志窗口显示状态变化:', show, 'agent:', props.agent?.name)
  
  if (show && props.agent) {
    console.log('🔄 重置日志窗口位置和状态:', props.agent.name, props.agent.namespace)
    
    // 每次打开都重置位置和大小
    initializeModal()
    
    // 重置日志相关状态
    logs.value = []
    isFollowing.value = true
    hasReachedTop.value = false
    lastUpdateTime.value = undefined
    
    // 连接日志流
    try {
      console.log('🔗 准备连接日志流...')
      await connectLogStream()
      console.log('✅ 日志流连接完成')
    } catch (error) {
      console.error('❌ 连接日志流失败:', error)
      message.error('连接日志流失败: ' + (error as Error).message)
    }
  } else {
    console.log('🔌 断开日志流连接')
    disconnectLogStream()
  }
})

// ESC键支持
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && visible.value) {
    closeModal()
  }
}

// 监听键盘事件
watch(visible, (show) => {
  if (show) {
    document.addEventListener('keydown', handleKeydown)
  } else {
    document.removeEventListener('keydown', handleKeydown)
  }
})

// 监听重置位置请求
watch(() => props.resetPosition, (newValue) => {
  if (newValue && newValue > 0) {
    console.log('🔄 收到重置位置请求:', props.agent?.name)
    initializeModal()
  }
})

// 监听置顶请求
watch(() => props.bringToFront, (newValue) => {
  if (newValue && newValue > 0) {
    console.log('🔝 收到置顶请求:', props.agent?.name)
    bringToFront()
  }
})

// 生命周期
onUnmounted(() => {
  disconnectLogStream()
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped lang="scss">
.agent-logs-modal {
  background: #1a1a1a;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  position: fixed;
  z-index: 1001;
  border: 1px solid #333;
  min-width: 400px;
  min-height: 300px;
  max-width: 95vw;
  max-height: 95vh;
}

.modal-header {
  background: linear-gradient(135deg, #2d2d2d, #1a1a1a);
  border-bottom: 1px solid #333;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: move;
  user-select: none;
  border-radius: 8px 8px 0 0;
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .header-title {
      h3 {
        margin: 0;
        color: #fff;
        font-size: 16px;
        font-weight: 600;
      }
      
      .header-subtitle {
        color: #999;
        font-size: 12px;
      }
    }
  }
  
  .header-right {
    display: flex;
    align-items: center;
  }
}

.modal-body {
  flex: 1;
  overflow: hidden;
  
  .logs-container {
    height: 100%;
    overflow-y: auto;
    background: #0d1117;
    font-family: 'JetBrains Mono', 'Consolas', 'Monaco', monospace;
    font-size: 13px;
    line-height: 1.4;
    
    &::-webkit-scrollbar {
      width: 8px;
    }
    
    &::-webkit-scrollbar-track {
      background: #1a1a1a;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #444;
      border-radius: 4px;
      
      &:hover {
        background: #555;
      }
    }
  }
  
  .logs-content {
    padding: 8px;
  }
  
  .log-line {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 2px 0;
    border-left: 3px solid transparent;
    padding-left: 8px;
    
    &.log-error {
      border-left-color: #ff6b6b;
      background: rgba(255, 107, 107, 0.1);
    }
    
    &.log-warn {
      border-left-color: #ffa726;
      background: rgba(255, 167, 38, 0.1);
    }
    
    &.log-info {
      border-left-color: #42a5f5;
      background: rgba(66, 165, 245, 0.1);
    }
    
    &.log-debug {
      border-left-color: #66bb6a;
      background: rgba(102, 187, 106, 0.1);
    }
    
    .log-timestamp {
      color: #666;
      font-size: 11px;
      min-width: 80px;
      flex-shrink: 0;
    }
    
    .log-level {
      color: #fff;
      font-weight: 600;
      min-width: 50px;
      flex-shrink: 0;
      font-size: 11px;
    }
    
    .log-source {
      color: #888;
      font-size: 11px;
      flex-shrink: 0;
    }
    
    .log-message {
      color: #e6e6e6;
      flex: 1;
      word-break: break-all;
    }
  }
  
  .empty-logs {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: #666;
    
    p {
      margin: 16px 0 0 0;
      font-size: 14px;
    }
  }
  
  .connecting-logs {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: #999;
    
    p {
      margin: 16px 0 0 0;
      font-size: 14px;
    }
  }
  
  .loading-history {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    background: rgba(13, 17, 23, 0.9);
    padding: 8px 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #999;
    font-size: 12px;
    z-index: 10;
    border-bottom: 1px solid #333;
    
    span {
      color: #999;
    }
  }
}

.modal-footer {
  background: #2d2d2d;
  border-top: 1px solid #333;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  border-radius: 0 0 8px 8px;
  
  .footer-left {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .log-count {
      color: #999;
    }
    
    .initial-lines {
      color: #666;
      font-size: 11px;
    }
  }
  
  .footer-right {
    .last-update {
      color: #666;
    }
  }
}

.resize-handle {
  position: absolute;
  background: transparent;
  
  &.resize-handle-se {
    bottom: 0;
    right: 0;
    width: 16px;
    height: 16px;
    cursor: se-resize;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 0;
      height: 0;
      border-left: 8px solid transparent;
      border-bottom: 8px solid #666;
    }
  }
}
</style>
