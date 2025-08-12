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
          :log-count="logs.length"
          @toggle-realtime="toggleRealTime"
          @clear="clearLogs"
          @copy="copyAllLogs"
          @close="closeModal"
          @send-command="handleSendCommand"
        />
      </div>
    </div>

    <!-- 日志内容区域 -->
    <div class="modal-body">
      <!-- 原始日志 XTerm 渲染器 -->
      <RawLogXTermRenderer
        ref="xtermRendererRef"
        :raw-content="rawLogContent"
        :auto-scroll="isRealTimeEnabled"
        :max-lines="10000"
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
      </div>
      
      <!-- 快捷键区域 -->
      <div class="footer-shortcuts">
        <span class="shortcut-label">快捷键:</span>
        <!-- Ctrl+C 中断信号 -->
        <div class="shortcut-item" title="Ctrl+C - 中断信号">
          <n-button
            size="small"
            quaternary
            circle
            @click="handleSendCommand('C-c')"
            :disabled="!isConnected"
            class="footer-shortcut-button"
          >
            <template #icon>
              <n-icon>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"/>
                </svg>
              </n-icon>
            </template>
          </n-button>
          <span class="shortcut-text">Ctrl+C</span>
        </div>

        <!-- Enter 回车键 -->
        <div class="shortcut-item" title="Enter - 回车键">
          <n-button
            size="small"
            quaternary
            circle
            @click="handleSendCommand('Enter')"
            :disabled="!isConnected"
            class="footer-shortcut-button"
          >
            <template #icon>
              <n-icon>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9,10V15H15V10H17L12,5L7,10H9M2,17V19H22V17H2Z"/>
                </svg>
              </n-icon>
            </template>
          </n-button>
          <span class="shortcut-text">Enter</span>
        </div>
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
import { agentApi } from '@/api/agents'
import { logsApi } from '@/api/logs'
import { LogManager, type LogEntry as LogManagerEntry } from '@/utils/logManager'

import { buildApiUrl, apiConfig } from '@/config/api'
import LogsControlButtons from './logs/LogsControlButtons.vue'
import LogsIcon from './icons/LogsIcon.vue'
import RawLogXTermRenderer from './logs/RawLogXTermRenderer.vue'

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
const xtermRendererRef = ref<InstanceType<typeof RawLogXTermRenderer>>()
const message = useMessage()

// 日志相关状态
const logs = ref<LogEntry[]>([])
const rawLogContent = ref<string>('') // 新增：存储原始日志内容
const initialLines = ref(1000) // 初始加载的日志行数
const isRealTimeEnabled = ref(true) // 实时输出开关
const isConnected = ref(false)
const isConnecting = ref(false)
const loadingTimeoutId = ref<number | null>(null) // loading超时ID
const lastUpdateTime = ref<string>()
const logManager = ref<LogManager | null>(null)
const isConnectionPending = ref(false) // 连接状态标记



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

// 连接日志流（改为API轮询方式）
const connectLogStream = async () => {
  // 立即输出调试信息，确保函数被调用
  console.log('🚀🚀🚀 connectLogStream 函数开始执行 🚀🚀🚀')
  console.log('📊 当前环境信息:', {
    agent: props.agent,
    agentName: props.agent?.name,
    namespace: props.agent?.namespace,
    visible: visible.value,
    isConnecting: isConnecting.value,
    isConnectionPending: isConnectionPending.value,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  })

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
    if (logManager.value) {
      console.log('🔄 断开现有连接')
      logManager.value.destroy()
    }

    // 创建新的日志管理器
    logManager.value = new LogManager(
      props.agent.namespace,
      props.agent.name,
      {
        onLogsUpdate: (logEntries, response, rawContent) => {
          console.log('📋 收到日志更新:', logEntries.length, '条')
          console.log('📄 原始内容长度:', rawContent?.length || 0)
          
          // 存储原始内容供xterm使用
          if (rawContent) {
            rawLogContent.value = rawContent
          }
          
          // 转换为组件需要的格式（用于兼容性和其他渲染器）
          const formattedLogs: LogEntry[] = logEntries.map(entry => ({
            id: entry.id,
            timestamp: entry.timestamp,
            level: entry.level,
            message: entry.message,
            source: entry.source
          }))
          
          logs.value = formattedLogs
          lastUpdateTime.value = response.timestamp
          
          // 如果开启实时追踪，自动滚动到底部
          if (isRealTimeEnabled.value) {
            nextTick(() => {
              // 滚动到底部的逻辑
            })
          }
        },
        onError: (error) => {
          console.error('📡 日志流错误:', error)
          message.error(`日志获取错误: ${error}`)
          isConnected.value = false
          isConnecting.value = false
          isConnectionPending.value = false
        },
        onRefresh: () => {
          console.log('🔄 日志刷新中...')
        }
      }
    )

    // 模拟连接成功
    console.log('✅ 日志管理器创建成功')
    
    // WebSocket功能已禁用，使用API轮询方式
    console.log('ℹ️ WebSocket功能已禁用，使用API轮询方式获取日志')
    
    isConnected.value = true
    isConnecting.value = false
    isConnectionPending.value = false
    
    // 立即获取一次日志
    await logManager.value.fetchLogs(initialLines.value)
    
    // 如果启用实时模式，开始自动刷新
    if (isRealTimeEnabled.value) {
      logManager.value.startAutoRefresh(3000) // 3秒刷新间隔
    }
    
    console.log('✅ 日志流连接完成')
  } catch (error) {
    console.error('❌ 创建日志流失败:', error)
    message.error('无法连接日志流: ' + (error as Error).message)
    isConnected.value = false
    isConnecting.value = false
    isConnectionPending.value = false
    
    // 自动运行API测试以诊断问题
    console.log('🧪 开始API诊断测试...')
    try {
      const testResult = await testLogsApi(props.agent.namespace, props.agent.name)
      console.log('🧪 API测试结果:', testResult)
      
      if (!testResult.success) {
        console.error('🧪 API测试失败，详细错误信息:', testResult.error)
      }
    } catch (testError) {
      console.error('🧪 API测试本身失败:', testError)
    }
  }
}

// 断开日志流
const disconnectLogStream = () => {
  console.log('🔌 断开日志流连接')
  if (logManager.value) {
    logManager.value.destroy()
    logManager.value = null
  }
  

  
  isConnected.value = false
  isConnecting.value = false
  isConnectionPending.value = false
  // isLoadingHistory.value = false // 重置历史加载状态 // 移除
  // isRefreshing.value = false // 重置刷新状态 // 移除
}

// 设置loading超时保护
const setLoadingTimeout = (type: 'history' | 'refresh', timeout = 10000) => {
  clearLoadingTimeout()
  loadingTimeoutId.value = window.setTimeout(() => {
    console.warn(`⏰ ${type} loading 超时，强制重置状态`)
    // if (type === 'history') { // 移除
    //   isLoadingHistory.value = false // 移除
    // } else if (type === 'refresh') { // 移除
    //   isRefreshing.value = false // 移除
    // } // 移除
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
    
    // 使用 LogManager 控制自动刷新
    if (logManager.value) {
      if (newRealTimeState) {
        logManager.value.startAutoRefresh(3000) // 3秒刷新间隔
      } else {
        logManager.value.stopAutoRefresh()
      }
    }

    // 显示状态切换成功的消息
    if (newRealTimeState) {
      message.success('实时跟踪已开启')
    } else {
      message.info('实时跟踪已暂停')
    }
  } catch (error) {
    console.error('❌ 切换实时输出失败:', error)
    message.error('切换实时输出失败: ' + (error as Error).message)
    // 回滚状态
    isRealTimeEnabled.value = !isRealTimeEnabled.value
  }
}

// 清空日志
const clearLogs = () => {
  if (logManager.value) {
    logManager.value.clearLogs()
  } else {
    logs.value = []
  }
}

// 手动刷新日志
const refreshLogs = async () => {
  if (!logManager.value) {
    message.warning('日志管理器未初始化')
    return
  }

  try {
    await logManager.value.refresh(initialLines.value)
    message.success('日志已刷新')
  } catch (error) {
    console.error('❌ 刷新日志失败:', error)
    message.error('刷新日志失败: ' + (error as Error).message)
  }
}

// 复制所有日志
const copyAllLogs = async () => {
  try {
    const logText = logs.value
      .map(log => `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}`)
      .join('\n')
    
    await navigator.clipboard.writeText(logText)
    message.success('日志已复制到剪贴板')
  } catch (error) {
    console.error('复制日志失败:', error)
    message.error('复制日志失败')
  }
}

// 处理发送命令事件
const handleSendCommand = async (command: string) => {
  console.log('👉 收到发送命令:', command)
  
  // 特殊处理：Enter键滚动到底部
  if (command === 'Enter') {
    console.log('📍 Enter键触发，滚动到底部')
    if (xtermRendererRef.value) {
      xtermRendererRef.value.scrollToBottom()
      message.info('已滚动到底部')
    }
    return
  }
  
  if (!props.agent) {
    message.warning('Agent 信息未加载，无法发送命令')
    return
  }

  message.info('WebSocket功能已禁用，无法发送命令')
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
      // hasReachedTop.value = false // 移除
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
      // hasReachedTop.value = false // 移除
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

// 键盘事件处理
const handleKeyDown = (event: KeyboardEvent) => {
  // 只在日志窗口可见时处理键盘事件
  if (!visible.value) return
  
  // 回车键滚动到底部
  if (event.key === 'Enter' && !event.ctrlKey && !event.shiftKey && !event.altKey) {
    event.preventDefault()
    console.log('⌨️ 键盘回车键触发，滚动到底部')
    if (xtermRendererRef.value) {
      xtermRendererRef.value.scrollToBottom()
    }
  }
}

// 生命周期
onMounted(() => {
  console.log('🚀 AgentLogsModal 组件挂载:', {
    agent: props.agent?.name,
    namespace: props.agent?.namespace,
    show: props.show,
    visible: visible.value
  })
  
  // 添加键盘事件监听
  document.addEventListener('keydown', handleKeyDown)
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
  document.removeEventListener('keydown', handleKeyDown)
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

  // 渲染器容器占满剩余空间
  > div:last-child {
    flex: 1;
    overflow: hidden;
  }
}

.modal-footer {
  background: var(--terminal-bg-secondary, #161b22);
  border-top: 1px solid var(--terminal-border, #21262d);
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
      color: var(--terminal-text-secondary, #c9d1d9);
    }

    .initial-lines {
      color: var(--terminal-text-secondary, #c9d1d9);
      font-size: 11px;
    }
    
    .shortcuts-hint {
      color: var(--terminal-text-secondary, #c9d1d9);
      font-size: 11px;
      font-style: italic;
    }
  }

  .footer-shortcuts {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0 auto;

    .shortcut-label {
      color: var(--terminal-text-secondary, #c9d1d9);
      font-size: 11px;
      font-weight: 500;
    }

    .shortcut-item {
      display: flex;
      align-items: center;
      gap: 6px;

      .shortcut-text {
        color: var(--terminal-text-secondary, #c9d1d9);
        font-size: 11px;
        font-family: monospace;
      }

      .footer-shortcut-button {
        padding: 0;
        min-width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        background-color: #ffffff;
        color: #495057;
        transition: all 0.2s ease;

        &:hover:not(:disabled) {
          background-color: #e9ecef;
          border-color: #adb5bd;
        }

        &:active:not(:disabled) {
          background-color: #dee2e6;
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background-color: #f8f9fa;
        }
      }
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
