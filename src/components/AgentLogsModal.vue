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
    <div ref="headerRef" class="modal-header" @mousedown="startDrag">
      <div class="header-left">
        <LogsIcon :size="18" color="#07c160" />
        <div class="header-title">
          <h3>{{ agent?.name }} - 实时日志</h3>
          <span class="header-subtitle">{{ agent?.namespace }} / {{ agent?.role }}</span>
        </div>
      </div>
      <div class="header-right">
        <LogsControlButtons
          :is-real-time-enabled="isRealTimeEnabled"
          :is-connected="isConnected"
          :is-loading-history="isLoadingHistory"
          :is-refreshing="isRefreshing"
          :has-reached-top="hasReachedTop"
          :log-count="logs.length"
          @toggle-realtime="toggleRealTime"
          @load-history="loadMoreHistory"
          @refresh="refreshLogs"
          @clear="clearLogs"
          @copy="copyAllLogs"
          @close="closeModal"
        />
      </div>
    </div>

    <!-- 日志内容区域 -->
    <div class="modal-body">
      <!-- 加载历史日志提示 -->
      <div v-if="isLoadingHistory" class="loading-history">
        <n-spin size="small" />
        <span>加载历史日志中...</span>
      </div>

      <!-- 渲染器切换 -->
      <div class="renderer-switch">
        <n-radio-group v-model:value="rendererType" size="small">
          <n-radio value="xterm">XTerm 渲染器</n-radio>
          <n-radio value="ansi">ANSI 渲染器</n-radio>
        </n-radio-group>
      </div>

      <!-- XTerm 终端日志渲染器 -->
      <XTermLogRenderer
        v-if="rendererType === 'xterm'"
        ref="xtermRendererRef"
        :logs="logs"
        :is-loading="isConnecting"
        :loading-text="isConnecting ? '正在连接日志流...' : ''"
        :auto-scroll="isRealTimeEnabled"
        :max-lines="10000"
      />

      <!-- ANSI 终端日志渲染器 -->
      <TerminalLogRenderer
        v-else
        ref="ansiRendererRef"
        :logs="logs"
        :is-loading="isConnecting"
        :loading-text="isConnecting ? '正在连接日志流...' : ''"
        :auto-scroll="isRealTimeEnabled"
        :max-lines="10000"
        @scroll="handleScroll"
      />
    </div>

    <!-- 状态栏 -->
    <div class="modal-footer">
      <div class="footer-left">
        <n-tag :type="getConnectionStatus().type" size="small" round>
          {{ getConnectionStatus().text }}
        </n-tag>
        <n-tag :type="isRealTimeEnabled ? 'success' : 'default'" size="small" round>
          {{ isRealTimeEnabled ? '实时追踪' : '已暂停' }}
        </n-tag>
        <span class="log-count">共 {{ logs.length }} 条日志</span>
        <span v-if="hasReachedTop" class="history-status">已加载全部历史</span>
      </div>
      <div class="footer-right">
        <span class="last-update" v-if="lastUpdateTime">
          最后更新: {{ new Date(lastUpdateTime).toLocaleTimeString() }}
        </span>
      </div>
    </div>

    <!-- 调整大小手柄 -->
    <div class="resize-handle resize-handle-se" @mousedown="startResize"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useMessage } from 'naive-ui'
import { type Agent, type LogEntry } from '@/api/agents'
import { logsApi } from '@/api/logs'
import { LogSocket } from '@/utils/logSocket'
import { buildApiUrl, apiConfig } from '@/config/api'
import LogsControlButtons from './logs/LogsControlButtons.vue'
import LogsIcon from './icons/LogsIcon.vue'
import TerminalLogRenderer from './logs/TerminalLogRenderer.vue'
import XTermLogRenderer from './logs/XTermLogRenderer.vue'

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
  close: []
}>()

// 响应式数据
const visible = computed({
  get: () => {
    console.log('🔍 visible getter 被调用:', props.show, 'agent:', props.agent?.name)
    return props.show
  },
  set: (value) => {
    console.log('🔍 visible setter 被调用:', value, 'agent:', props.agent?.name)
    emit('update:show', value)
  }
})

const modalRef = ref<HTMLElement>()
const headerRef = ref<HTMLElement>()
const xtermRendererRef = ref<InstanceType<typeof XTermLogRenderer>>()
const ansiRendererRef = ref<InstanceType<typeof TerminalLogRenderer>>()
const message = useMessage()

// 日志相关状态
const logs = ref<LogEntry[]>([])
const initialLines = ref(1000) // 初始加载的日志行数
const isRealTimeEnabled = ref(true) // 实时输出开关
const isConnected = ref(false)
const isConnecting = ref(false)
const isLoadingHistory = ref(false)
const isRefreshing = ref(false) // 刷新状态
const loadingTimeoutId = ref<number | null>(null) // loading超时ID
const hasReachedTop = ref(false)
const lastUpdateTime = ref<string>()
const logSocket = ref<LogSocket | null>(null)
const isConnectionPending = ref(false) // 连接状态标记

// 渲染器类型
const rendererType = ref<'ansi' | 'xterm'>('xterm') // 默认使用 xterm

// 模态框位置和大小
const modalPosition = ref({ x: 0, y: 0 })
const modalSize = ref({ width: 800, height: 600 })

// 拖拽状态
const isDragging = ref(false)
const isResizing = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const resizeStart = ref({ x: 0, y: 0, width: 0, height: 0 })

// 日志容器状态
// 移除了不需要的日志容器状态管理

// 连接WebSocket获取实时日志
const connectLogStream = async () => {
  console.log('🔗 connectLogStream 函数被调用:', {
    agent: props.agent,
    agentName: props.agent?.name,
    namespace: props.agent?.namespace,
    visible: visible.value,
    isConnecting: isConnecting.value,
    isConnectionPending: isConnectionPending.value,
    timestamp: new Date().toISOString()
  })

  // 防止重复连接
  if (isConnecting.value || isConnectionPending.value) {
    console.log('⚠️ 连接正在进行中，跳过重复连接请求')
    return
  }

  if (!props.agent) {
    console.error('❌ 无法连接日志流: agent 为空', {
      propsAgent: props.agent,
      propsShow: props.show,
      visible: visible.value
    })
    message.error('无法连接日志流: agent 信息为空')
    return
  }

  console.log('🚀 开始连接日志流:', props.agent.name, props.agent.namespace)

  // 设置连接状态标记
  isConnectionPending.value = true

  // 检查后端服务是否可用
  try {
    const response = await fetch(buildApiUrl('/'))
    if (!response.ok) {
      throw new Error(`后端服务响应错误: ${response.status}`)
    }
    console.log('✅ 后端服务检查通过')
  } catch (error) {
    console.error('❌ 后端服务不可用:', error)
    message.error('无法连接到后端服务，请启动 GoQGo API 服务器', {
      duration: 10000
    })
    isConnecting.value = false
    isConnectionPending.value = false
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
          isConnectionPending.value = false
          
          // 连接成功后获取日志状态，同步前端状态
          getLogStatus().then(status => {
            if (status) {
              // 这里可以根据状态更新前端状态
              console.log('📊 同步日志状态:', status)
            }
          })
        },
        onDisconnect: () => {
          console.log('📡 日志流连接断开')
          isConnected.value = false
          isConnecting.value = false
          isConnectionPending.value = false
        },
        onInitial: (initialLogs) => {
          console.log('📋 收到初始日志:', initialLogs.length, '条')
          
          // 对初始日志进行去重处理
          const deduplicatedLogs = []
          const seenLogs = new Set()
          
          for (const log of initialLogs) {
            const logKey = `${log.timestamp}-${log.message}-${log.source}`
            if (!seenLogs.has(logKey)) {
              seenLogs.add(logKey)
              deduplicatedLogs.push(log)
            } else {
              console.log('⚠️ 跳过重复的初始日志:', log.message.substring(0, 30))
            }
          }
          
          console.log('📋 去重后的初始日志:', deduplicatedLogs.length, '条')
          logs.value = [...deduplicatedLogs]
          lastUpdateTime.value = new Date().toISOString()

          // 滚动到底部
          nextTick(() => {
            scrollToBottom()
          })
        },
        onAppend: (newLog) => {
          // 只有在实时输出开启时才处理新日志
          if (!isRealTimeEnabled.value) {
            console.log('⏸️ 实时输出已关闭，跳过新日志:', newLog.message.substring(0, 50))
            return
          }
          
          console.log('➕ 收到新日志:', newLog.message.substring(0, 50), '来源:', newLog.source)
          
          // 检查是否是重复日志（基于时间戳和消息内容）
          const isDuplicate = logs.value.some(existingLog => 
            existingLog.timestamp === newLog.timestamp && 
            existingLog.message === newLog.message &&
            Math.abs(new Date(existingLog.timestamp).getTime() - new Date(newLog.timestamp).getTime()) < 1000 // 1秒内的重复
          )
          
          if (isDuplicate) {
            console.log('⚠️ 检测到重复日志，跳过添加:', newLog.message.substring(0, 30))
            return
          }
          
          // 过滤 unknown 源的日志（如果已有相同内容的 default-sys 日志）
          if (newLog.source === 'unknown') {
            const hasDefaultSysVersion = logs.value.some(existingLog => 
              existingLog.source === 'default-sys' && 
              existingLog.message === newLog.message &&
              Math.abs(new Date(existingLog.timestamp).getTime() - new Date(newLog.timestamp).getTime()) < 5000 // 5秒内
            )
            
            if (hasDefaultSysVersion) {
              console.log('⚠️ 检测到 unknown 源的重复日志，跳过添加:', newLog.message.substring(0, 30))
              return
            }
          }
          
          logs.value.push(newLog)
          lastUpdateTime.value = new Date().toISOString()

          // 如果开启实时追踪，自动滚动到底部
          if (isRealTimeEnabled.value) {
            nextTick(() => {
              scrollToBottom()
            })
          }
        },
        onHistory: (historyLogs, hasMore) => {
          console.log('📜 收到历史日志:', historyLogs.length, '条, hasMore:', hasMore)

          // 清除超时保护并重置loading状态
          clearLoadingTimeout()
          isLoadingHistory.value = false

          // 如果没有历史日志，直接设置hasReachedTop
          if (historyLogs.length === 0) {
            hasReachedTop.value = true
            console.log('📜 没有更多历史日志')
            return
          }

          // 对历史日志进行去重处理
          const deduplicatedHistoryLogs = []
          const existingLogKeys = new Set(
            logs.value.map(log => `${log.timestamp}-${log.message}-${log.source}`)
          )
          
          for (const log of historyLogs) {
            const logKey = `${log.timestamp}-${log.message}-${log.source}`
            if (!existingLogKeys.has(logKey)) {
              existingLogKeys.add(logKey)
              deduplicatedHistoryLogs.push(log)
            } else {
              console.log('⚠️ 跳过重复的历史日志:', log.message.substring(0, 30))
            }
          }
          
          console.log('📜 去重后的历史日志:', deduplicatedHistoryLogs.length, '条')

          // 将去重后的历史日志添加到开头
          logs.value = [...deduplicatedHistoryLogs, ...logs.value]
          hasReachedTop.value = !hasMore

          // 终端渲染器会自动处理滚动位置
        },
        onRefreshed: (lines) => {
          console.log('🔄 收到刷新确认:', lines)
          isRefreshing.value = false
          clearLoadingTimeout()
          message.success(`日志已刷新 (${lines} 行)`)
        },
        onSessionClosed: (msg) => {
          console.log('❌ 会话已关闭:', msg)
          message.warning('Agent会话已关闭: ' + msg)
          isConnected.value = false
          isConnecting.value = false
          isConnectionPending.value = false
        },
        onFollowToggled: (data) => {
          console.log('🔄 收到实时跟踪状态切换:', data)
          // 更新前端的实时跟踪状态（WebSocket确认）
          const followState = data.follow
          isRealTimeEnabled.value = followState
          console.log('🔄 WebSocket状态同步:', { 
            received: data, 
            followState, 
            currentUI: isRealTimeEnabled.value 
          })
        },
        onError: (error) => {
          console.error('📡 日志流错误:', error)
          message.error(`日志连接错误: ${error}`)
          isConnected.value = false
          isConnecting.value = false
          isConnectionPending.value = false
          isLoadingHistory.value = false // 重置历史加载状态
          isRefreshing.value = false // 重置刷新状态
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
    isConnectionPending.value = false
  }
}

// 断开日志流
const disconnectLogStream = () => {
  console.log('🔌 断开日志流连接')
  if (logSocket.value) {
    logSocket.value.disconnect()
    logSocket.value = null
  }
  isConnected.value = false
  isConnecting.value = false
  isConnectionPending.value = false
  isLoadingHistory.value = false // 重置历史加载状态
  isRefreshing.value = false // 重置刷新状态
}

// 设置loading超时保护
const setLoadingTimeout = (type: 'history' | 'refresh', timeout = 10000) => {
  clearLoadingTimeout()
  loadingTimeoutId.value = window.setTimeout(() => {
    console.warn(`⏰ ${type} loading 超时，强制重置状态`)
    if (type === 'history') {
      isLoadingHistory.value = false
    } else if (type === 'refresh') {
      isRefreshing.value = false
    }
    message.warning(`${type === 'history' ? '加载历史日志' : '刷新日志'}超时，请重试`)
  }, timeout)
}

// 清除loading超时
const clearLoadingTimeout = () => {
  if (loadingTimeoutId.value) {
    clearTimeout(loadingTimeoutId.value)
    loadingTimeoutId.value = null
  }
}

// 获取日志状态 - 由于没有专门的status端点，这里返回默认状态
const getLogStatus = async () => {
  if (!props.agent) {
    return null
  }

  try {
    // 由于后端没有专门的status端点，返回默认状态
    // 实际状态会通过WebSocket消息获取
    console.log('📊 使用默认日志状态')
    return {
      followEnabled: false,
      websocketActive: false,
      timestamp: Date.now()
    }
  } catch (error) {
    console.error('❌ 获取日志状态失败:', error)
    return null
  }
}

// 刷新日志
const refreshLogs = async () => {
  if (!props.agent || !isConnected.value || isRefreshing.value) {
    return
  }

  try {
    isRefreshing.value = true
    setLoadingTimeout('refresh')
    
    console.log('🔄 开始刷新日志:', props.agent.name)
    
    // 使用 WebSocket 发送刷新请求
    if (logSocket.value) {
      logSocket.value.refresh(1000) // 刷新显示1000行
    }
    
    console.log('✅ 日志刷新请求已发送')
  } catch (error) {
    console.error('❌ 刷新日志失败:', error)
    message.error('刷新日志失败')
    isRefreshing.value = false
    clearLoadingTimeout()
  }
}

// 加载历史日志
const loadHistoryLogs = async () => {
  if (!props.agent || !isConnected.value || isLoadingHistory.value || hasReachedTop.value) {
    return
  }

  try {
    console.log('📜 请求加载历史日志')
    isLoadingHistory.value = true
    setLoadingTimeout('history') // 设置超时保护

    // 计算偏移量（当前日志数量）
    const offset = logs.value.length

    // 使用 WebSocket 发送加载历史记录请求
    if (logSocket.value) {
      logSocket.value.loadHistory(offset, 50)
    }

    console.log('✅ 历史日志请求已发送')
  } catch (error) {
    console.error('❌ 加载历史日志失败:', error)
    message.error('加载历史日志失败: ' + (error as Error).message)
    // 确保loading状态被重置
    clearLoadingTimeout()
    isLoadingHistory.value = false
  }
}

// 手动加载更多历史日志
const loadMoreHistory = () => {
  loadHistoryLogs()
}

// 切换实时输出
const toggleRealTime = async () => {
  if (!props.agent || !isConnected.value) {
    return
  }

  try {
    // 先保存当前状态，再计算新状态
    const currentState = isRealTimeEnabled.value
    const newRealTimeState = !currentState
    
    console.log('🔄 切换实时状态:', { 
      current: currentState, 
      new: newRealTimeState 
    })
    
    // 立即更新UI状态，提供即时反馈
    isRealTimeEnabled.value = newRealTimeState
    
    // 使用 WebSocket 发送切换请求
    if (logSocket.value) {
      logSocket.value.toggleFollow(newRealTimeState)
    }

    // 显示状态切换成功的消息
    if (newRealTimeState) {
      message.success('实时跟踪已开启')
    } else {
      message.info('实时跟踪已暂停')
    }

    // WebSocket的 follow_toggled 消息会进一步确认状态，如果不一致会自动同步
  } catch (error) {
    console.error('❌ 切换实时输出失败:', error)
    message.error('切换实时输出失败: ' + (error as Error).message)
    // 回滚状态
    isRealTimeEnabled.value = !isRealTimeEnabled.value
  }
}

// 切换跟随模式
// 清空日志
const clearLogs = () => {
  logs.value = []
  hasReachedTop.value = false
}

// 滚动到底部
const scrollToBottom = () => {
  if (isRealTimeEnabled.value) {
    nextTick(() => {
      if (rendererType.value === 'xterm' && xtermRendererRef.value) {
        xtermRendererRef.value.scrollToBottom()
      } else if (rendererType.value === 'ansi' && ansiRendererRef.value) {
        ansiRendererRef.value.scrollToBottom()
      }
    })
  }
}

// 处理滚动事件
const handleScroll = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target) return

  const { scrollTop, scrollHeight, clientHeight } = target
  const isAtTop = scrollTop < 10

  // 如果滚动到顶部且有更多历史日志，自动加载
  if (isAtTop && !isLoadingHistory.value && !hasReachedTop.value && isConnected.value) {
    loadHistoryLogs()
  }
}
// 复制所有日志内容
const copyAllLogs = async () => {
  if (logs.value.length === 0) {
    message.warning('没有日志内容可复制')
    return
  }

  try {
    // 格式化日志内容为纯文本，保持终端输出格式
    const logText = logs.value
      .map(log => {
        const source = log.source ? `[${log.source}] ` : ''
        // 直接使用原始消息，保持 ANSI 转义序列
        return `${source}${log.message}`
      })
      .join('\n')

    // 使用现代 Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(logText)
      message.success(`已复制 ${logs.value.length} 条日志到剪贴板`)
    } else {
      // 降级方案：使用传统方法
      const textArea = document.createElement('textarea')
      textArea.value = logText
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      try {
        document.execCommand('copy')
        message.success(`已复制 ${logs.value.length} 条日志到剪贴板`)
      } catch (err) {
        console.error('复制失败:', err)
        message.error('复制失败，请手动选择并复制')
      } finally {
        document.body.removeChild(textArea)
      }
    }
  } catch (error) {
    console.error('复制日志失败:', error)
    message.error('复制失败: ' + (error as Error).message)
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

    allModals.forEach((modal) => {
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
watch(
  () => props.agent,
  (newAgent, oldAgent) => {
    console.log('🔄 props.agent 变化:', {
      old: oldAgent?.name,
      new: newAgent?.name,
      namespace: newAgent?.namespace,
      visible: visible.value
    })
    // 只在 agent 变化时重新连接，不管 visible 状态
    // visible 状态的连接管理由另一个 watch 处理
    if (newAgent && oldAgent && newAgent.name !== oldAgent.name && visible.value) {
      console.log('🔄 Agent 变化，重新连接日志流')
      disconnectLogStream()
      logs.value = []
      hasReachedTop.value = false
      connectLogStream()
    }
  }
)

// 监听 show 属性变化
watch(
  () => props.show,
  (newShow, oldShow) => {
    console.log('🔄 props.show 变化:', { old: oldShow, new: newShow, agent: props.agent?.name })
  }
)

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

    offsetX = Math.cos((angle * Math.PI) / 180) * radius
    offsetY = Math.sin((angle * Math.PI) / 180) * radius
  }

  // 确保窗口不会超出屏幕边界
  const finalX = Math.max(0, Math.min(centerX + offsetX, window.innerWidth - modalSize.value.width))
  const finalY = Math.max(
    0,
    Math.min(centerY + offsetY, window.innerHeight - modalSize.value.height)
  )

  modalPosition.value = { x: finalX, y: finalY }

  console.log(
    '📐 初始化日志窗口位置:',
    modalPosition.value,
    '大小:',
    modalSize.value,
    '窗口数:',
    windowCount
  )
}

// 监听模态框显示状态
watch(
  visible,
  async (show) => {
    console.log('👁️ 日志窗口显示状态变化:', show, 'agent:', props.agent?.name)

    if (show && props.agent) {
      console.log('🔄 重置日志窗口位置和状态:', props.agent.name, props.agent.namespace)

      // 每次打开都重置位置和大小
      initializeModal()

      // 重置日志相关状态
      logs.value = []
      isRealTimeEnabled.value = true // 重置实时输出状态
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
  },
  { immediate: true }
)

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
watch(
  () => props.resetPosition,
  (newValue) => {
    if (newValue && newValue > 0) {
      console.log('🔄 收到重置位置请求:', props.agent?.name)
      initializeModal()
    }
  }
)

// 监听置顶请求
watch(
  () => props.bringToFront,
  (newValue) => {
    if (newValue && newValue > 0) {
      console.log('🔝 收到置顶请求:', props.agent?.name)
      bringToFront()
    }
  }
)

// 生命周期
onMounted(() => {
  console.log('🚀 AgentLogsModal 组件挂载:', {
    agent: props.agent?.name,
    namespace: props.agent?.namespace,
    show: props.show,
    visible: visible.value
  })
})

onUnmounted(() => {
  console.log('💀 AgentLogsModal 组件卸载:', props.agent?.name)
  disconnectLogStream()
  clearLoadingTimeout() // 清除超时保护
  
  // 清理事件监听器
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped lang="scss">
.agent-logs-modal {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  position: fixed;
  z-index: 1001;
  border: 1px solid #e0e0e0;
  min-width: 400px;
  min-height: 300px;
  max-width: 95vw;
  max-height: 95vh;
}

.modal-header {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-bottom: 1px solid #e0e0e0;
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
        color: #2c3e50;
        font-size: 16px;
        font-weight: 600;
      }

      .header-subtitle {
        color: #6c757d;
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
  position: relative;
  display: flex;
  flex-direction: column;

  .loading-history {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    background: rgba(248, 249, 250, 0.95);
    padding: 8px 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #6c757d;
    font-size: 12px;
    z-index: 10;
    border-bottom: 1px solid #e0e0e0;

    span {
      color: #6c757d;
    }
  }

  .renderer-switch {
    padding: 8px 16px;
    background: var(--terminal-bg-secondary, #161b22);
    border-bottom: 1px solid var(--terminal-border, #21262d);
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 12px;
    color: var(--terminal-text-secondary, #c9d1d9);
    flex-shrink: 0;

    :deep(.n-radio-group) {
      .n-radio {
        .n-radio__label {
          color: var(--terminal-text-secondary, #c9d1d9);
          font-size: 11px;
        }
        
        &.n-radio--checked {
          .n-radio__label {
            color: var(--terminal-text, #f0f6fc);
          }
        }
      }
    }
  }

  // 渲染器容器占满剩余空间
  > div:last-child {
    flex: 1;
    overflow: hidden;
  }
}

.modal-footer {
  background: #f8f9fa;
  border-top: 1px solid #e0e0e0;
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
      color: #6c757d;
    }

    .initial-lines {
      color: #6c757d;
      font-size: 11px;
    }
    
    .shortcuts-hint {
      color: #6c757d;
      font-size: 11px;
      font-style: italic;
    }
  }

  .footer-right {
    .last-update {
      color: #6c757d;
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
      border-bottom: 8px solid #adb5bd;
    }
  }
}
</style>
