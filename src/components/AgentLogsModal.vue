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
        <n-icon size="18" color="#07c160">
          <svg viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,19H5V5H19V19Z"
            />
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
                :type="isRealTimeEnabled ? 'primary' : 'default'"
                @click="toggleRealTime"
                :disabled="!isConnected"
              >
                <template #icon>
                  <n-icon>
                    <svg viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M12,2A2,2 0 0,1 14,4V8A2,2 0 0,1 12,10A2,2 0 0,1 10,8V4A2,2 0 0,1 12,2M21,11H20A8,8 0 0,1 12,19A8,8 0 0,1 4,11H3A1,1 0 0,1 2,10A1,1 0 0,1 3,9H4A8,8 0 0,1 12,1A8,8 0 0,1 20,9H21A1,1 0 0,1 22,10A1,1 0 0,1 21,11Z"
                      />
                    </svg>
                  </n-icon>
                </template>
              </n-button>
            </template>
            {{ isRealTimeEnabled ? '关闭实时' : '开启实时' }}
          </n-tooltip>
          <n-tooltip>
            <template #trigger>
              <n-button
                size="small"
                quaternary
                :type="isFollowing ? 'primary' : 'default'"
                @click="toggleFollow"
                :disabled="!isConnected || !isRealTimeEnabled"
              >
                <template #icon>
                  <n-icon>
                    <svg viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M7,10L12,15L17,10H7Z"
                      />
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
                      <path
                        fill="currentColor"
                        d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M11,8H13V12L16.2,14.2L15.2,15.8L11,13V8Z"
                      />
                    </svg>
                  </n-icon>
                </template>
              </n-button>
            </template>
            {{ hasReachedTop ? '已到顶部' : '加载历史' }}
          </n-tooltip>
          <n-tooltip>
            <template #trigger>
              <n-button
                size="small"
                quaternary
                @click="refreshLogs"
                :loading="isRefreshing"
                :disabled="!isConnected"
              >
                <template #icon>
                  <n-icon>
                    <svg viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"
                      />
                    </svg>
                  </n-icon>
                </template>
              </n-button>
            </template>
            刷新日志
          </n-tooltip>
          <n-tooltip>
            <template #trigger>
              <n-button size="small" quaternary @click="clearLogs">
                <template #icon>
                  <n-icon>
                    <svg viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"
                      />
                    </svg>
                  </n-icon>
                </template>
              </n-button>
            </template>
            清空日志
          </n-tooltip>
          <n-tooltip>
            <template #trigger>
              <n-button size="small" quaternary @click="focusAndSelectAll" :disabled="logs.length === 0">
                <template #icon>
                  <n-icon>
                    <svg viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M3,5H9V11H3V5M5,7V9H7V7H5M11,7H21V9H11V7M11,15H21V17H11V15M5,20L1.5,16.5L2.91,15.09L5,17.18L9.59,12.59L11,14L5,20Z"
                      />
                    </svg>
                  </n-icon>
                </template>
              </n-button>
            </template>
            全选日志 (Ctrl+A)
          </n-tooltip>
          <n-tooltip>
            <template #trigger>
              <n-button size="small" quaternary @click="copyAllLogs" :disabled="logs.length === 0">
                <template #icon>
                  <n-icon>
                    <svg viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"
                      />
                    </svg>
                  </n-icon>
                </template>
              </n-button>
            </template>
            复制所有日志
          </n-tooltip>
          <n-button size="small" quaternary @click="closeModal">
            <template #icon>
              <n-icon>
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
                  />
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
        :class="['logs-container', { active: isLogsContainerActive }]"
        @scroll="handleScroll"
        @mousedown="handleLogsMouseDown"
        @click="handleLogsClick"
        tabindex="0"
      >
        <!-- 隐藏的 textarea 用于捕获 Ctrl+A -->
        <textarea
          ref="hiddenTextareaRef"
          v-model="logsTextContent"
          class="hidden-textarea"
          @keydown.stop="handleTextareaKeydown"
          @focus="handleTextareaFocus"
          @blur="handleTextareaBlur"
          readonly
        ></textarea>
        <div class="logs-content" ref="logsContentRef">
          <div
            v-for="(log, index) in logs"
            :key="`${log.timestamp}-${index}`"
            :class="['log-line', `log-${log.level}`]"
          >
            <span class="log-timestamp">{{ formatTimestamp(log.timestamp) }}</span>
            <span class="log-level">{{ log.level.toUpperCase() }}</span>
            <span class="log-source" v-if="log.source" :class="`source-${log.source}`">[{{ log.source }}]</span>
            <span class="log-message">{{ log.message }}</span>
          </div>

          <!-- 空状态 -->
          <div v-if="logs.length === 0 && !isConnecting" class="empty-logs">
            <n-icon size="48" color="#ccc">
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,19H5V5H19V19Z"
                />
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
        <n-tag :type="isRealTimeEnabled ? 'success' : 'warning'" size="small" round>
          {{ isRealTimeEnabled ? '实时输出' : '暂停输出' }}
        </n-tag>
        <span class="log-count">共 {{ logs.length }} 条日志</span>
        <span v-if="initialLines" class="initial-lines">初始加载: {{ initialLines }} 行</span>
        <span class="shortcuts-hint">
          {{ isLogsContainerActive ? '已激活 - 按 Ctrl+A 全选' : '点击日志区域激活快捷键' }}
        </span>
      </div>
      <div class="footer-right">
        <span class="last-update" v-if="lastUpdateTime">
          最后更新: {{ formatTimestamp(lastUpdateTime) }}
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
import { LogSocket } from '@/utils/logSocket'
import { buildApiUrl, apiConfig } from '@/config/api'

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
const logsContainerRef = ref<HTMLElement>()
const logsContentRef = ref<HTMLElement>()
const hiddenTextareaRef = ref<HTMLTextAreaElement>()
const message = useMessage()

// 日志相关状态
const logs = ref<LogEntry[]>([])
const isFollowing = ref(true)
const isRealTimeEnabled = ref(true) // 新增：实时输出开关
const isConnected = ref(false)
const isConnecting = ref(false)
const isLoadingHistory = ref(false)
const isRefreshing = ref(false) // 新增：刷新状态
const loadingTimeoutId = ref<number | null>(null) // 新增：loading超时ID
const hasReachedTop = ref(false)
const lastUpdateTime = ref<string>()
const initialLines = ref<number>(100)
const logSocket = ref<LogSocket | null>(null)
const isConnectionPending = ref(false) // 添加连接状态标记
const isLogsContainerActive = ref(false) // 日志容器是否处于活跃状态
const logsTextContent = ref('') // 用于 textarea 的日志文本内容

// 模态框位置和大小
const modalPosition = ref({ x: 0, y: 0 })
const modalSize = ref({ width: 800, height: 600 })

// 拖拽状态
const isDragging = ref(false)
const isResizing = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const resizeStart = ref({ x: 0, y: 0, width: 0, height: 0 })

// 同步日志内容到 textarea
watch(logs, (newLogs) => {
  logsTextContent.value = newLogs
    .map(log => {
      const timestamp = formatTimestamp(log.timestamp)
      const level = log.level.toUpperCase()
      const source = log.source ? `[${log.source}]` : ''
      return `${timestamp} ${level} ${source} ${log.message}`
    })
    .join('\n')
}, { deep: true })

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

          // 如果正在跟随，自动滚动到底部
          if (isFollowing.value && isRealTimeEnabled.value) {
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

          // 保存当前滚动位置
          const container = logsContainerRef.value
          const oldScrollHeight = container?.scrollHeight || 0
          const oldScrollTop = container?.scrollTop || 0

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

          // 恢复滚动位置
          nextTick(() => {
            if (container) {
              const newScrollHeight = container.scrollHeight
              const heightDiff = newScrollHeight - oldScrollHeight
              container.scrollTop = oldScrollTop + heightDiff
            }
          })
        },
        onFollowToggled: (follow) => {
          console.log('🔄 收到跟踪模式切换确认:', follow)
          isRealTimeEnabled.value = follow
          if (!follow) {
            isFollowing.value = false
          }
          message.info(follow ? '已开启实时输出' : '已关闭实时输出')
        },
        onRefreshed: (lines) => {
          console.log('🔄 收到刷新确认:', lines)
          message.success(`日志已刷新 (${lines} 行)`)
        },
        onSessionClosed: (msg) => {
          console.log('❌ 会话已关闭:', msg)
          message.warning('Agent会话已关闭: ' + msg)
          isConnected.value = false
          isConnecting.value = false
          isConnectionPending.value = false
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

// 解析历史日志响应
const parseHistoryResponse = (data: any): LogEntry[] => {
  console.log('🔄 解析历史日志响应:', data)

  // 如果content为空字符串或null，返回空数组
  if (!data.content || data.content.trim() === '') {
    console.log('📜 历史日志内容为空')
    return []
  }

  const logLines = data.content.split('\n').filter((line: string) => line.trim())
  return logLines.map((line: string) => {
    // 尝试解析时间戳和消息
    const match = line.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}):\s*(.+)$/)
    if (match) {
      return {
        timestamp: new Date(match[1]).toISOString(),
        level: 'info' as const,
        message: match[2],
        source: data.agent || 'unknown'
      }
    } else {
      return {
        timestamp: data.timestamp
          ? new Date(data.timestamp * 1000).toISOString()
          : new Date().toISOString(),
        level: 'info' as const,
        message: line,
        source: data.agent || 'unknown'
      }
    }
  })
}

// 获取日志状态
const getLogStatus = async () => {
  if (!props.agent) {
    return null
  }

  try {
    const token = localStorage.getItem('goqgo_token')
    if (!token) {
      return null
    }

    const response = await fetch(
      buildApiUrl(`/api/v1/namespaces/${props.agent.namespace}/agents/${props.agent.name}/logs/status`),
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )

    if (!response.ok) {
      console.warn('获取日志状态失败:', response.status)
      return null
    }

    const status = await response.json()
    console.log('📊 日志状态:', status)
    return status
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
    const token = localStorage.getItem('goqgo_token')
    if (!token) {
      message.error('未找到认证token，请先登录')
      return
    }

    isRefreshing.value = true
    setLoadingTimeout('refresh') // 设置超时保护
    console.log('🔄 刷新日志')

    // 调用后端API刷新日志
    const response = await fetch(
      buildApiUrl(`/api/v1/namespaces/${props.agent.namespace}/agents/${props.agent.name}/logs/refresh`),
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lines: initialLines.value })
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`刷新日志失败: ${response.status} ${errorText}`)
    }

    const result = await response.json()
    console.log('✅ 日志刷新API响应:', result)
    
    // 清空当前日志，等待WebSocket推送新数据
    logs.value = []
    hasReachedTop.value = false
    
    // WebSocket会收到 refreshed 消息和新的日志数据
    // 不需要手动重新连接，后端会自动推送刷新后的数据
  } catch (error) {
    console.error('❌ 刷新日志失败:', error)
    message.error('刷新日志失败: ' + (error as Error).message)
  } finally {
    clearLoadingTimeout()
    isRefreshing.value = false
  }
}

// 加载历史日志
const loadHistoryLogs = async () => {
  if (!props.agent || !isConnected.value || isLoadingHistory.value || hasReachedTop.value) {
    return
  }

  try {
    const token = localStorage.getItem('goqgo_token')
    if (!token) {
      message.error('未找到认证token，请先登录')
      return
    }

    console.log('📜 请求加载历史日志')
    isLoadingHistory.value = true
    setLoadingTimeout('history') // 设置超时保护

    // 计算偏移量（当前日志数量）
    const offset = logs.value.length

    // 调用后端API加载历史日志
    const response = await fetch(
      buildApiUrl(`/api/v1/namespaces/${props.agent.namespace}/agents/${props.agent.name}/logs/history`),
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          offset: offset,
          lines: 50 
        })
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`加载历史日志失败: ${response.status} ${errorText}`)
    }

    const result = await response.json()
    console.log('✅ 历史日志API响应:', result)
    
    // 检查响应中是否包含错误信息
    if (result.message && result.message.includes('no log file found')) {
      console.log('📜 没有找到日志文件')
      hasReachedTop.value = true
      message.info('没有更多历史日志')
      return
    }
    
    // WebSocket会收到 history 消息来处理历史日志数据
    // 但如果WebSocket没有收到消息，我们需要手动处理
    if (!result.websocketActive) {
      // 如果WebSocket不活跃，直接处理响应数据
      const historyLogs = parseHistoryResponse(result)
      
      if (historyLogs.length === 0) {
        hasReachedTop.value = true
        message.info('没有更多历史日志')
      } else {
        // 手动添加历史日志
        const container = logsContainerRef.value
        const oldScrollHeight = container?.scrollHeight || 0
        const oldScrollTop = container?.scrollTop || 0

        logs.value = [...historyLogs, ...logs.value]
        hasReachedTop.value = !result.hasMore

        // 恢复滚动位置
        nextTick(() => {
          if (container) {
            const newScrollHeight = container.scrollHeight
            const heightDiff = newScrollHeight - oldScrollHeight
            container.scrollTop = oldScrollTop + heightDiff
          }
        })
      }
    }
  } catch (error) {
    console.error('❌ 加载历史日志失败:', error)
    message.error('加载历史日志失败: ' + (error as Error).message)
  } finally {
    // 确保loading状态被重置
    clearLoadingTimeout()
    isLoadingHistory.value = false
  }
}

// 切换实时输出
const toggleRealTime = async () => {
  if (!props.agent || !isConnected.value) {
    return
  }

  try {
    const token = localStorage.getItem('goqgo_token')
    if (!token) {
      message.error('未找到认证token，请先登录')
      return
    }

    const newRealTimeState = !isRealTimeEnabled.value
    
    // 调用后端API切换Follow模式
    const response = await fetch(
      buildApiUrl(`/api/v1/namespaces/${props.agent.namespace}/agents/${props.agent.name}/logs/follow`),
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ follow: newRealTimeState })
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API调用失败: ${response.status} ${errorText}`)
    }

    const result = await response.json()
    console.log('🔄 实时输出切换API响应:', result)

    // WebSocket会收到 follow_toggled 消息来更新状态，所以这里不需要手动更新
    // 状态更新会在 onFollowToggled 回调中处理
  } catch (error) {
    console.error('❌ 切换实时输出失败:', error)
    message.error('切换实时输出失败: ' + (error as Error).message)
  }
}

// 切换跟随模式
const toggleFollow = async () => {
  if (!isRealTimeEnabled.value) {
    message.warning('请先开启实时输出')
    return
  }
  
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

// 处理隐藏 textarea 的键盘事件
const handleTextareaKeydown = (e: KeyboardEvent) => {
  console.log('🎯 Textarea 键盘事件:', e.key, 'Ctrl:', e.ctrlKey, '活跃状态:', isLogsContainerActive.value)
  
  if (e.ctrlKey && e.key === 'a' && isLogsContainerActive.value) {
    console.log('📋 在 textarea 中捕获到 Ctrl+A，执行全选')
    // 让 textarea 自然处理 Ctrl+A，然后将选择应用到可视区域
    setTimeout(() => {
      selectAllLogsText()
    }, 0)
  }
}

// 处理 textarea 获得焦点
const handleTextareaFocus = () => {
  console.log('🎯 隐藏 textarea 获得焦点')
  // 不自动选择文本，只是获得焦点
}

// 处理 textarea 失去焦点
const handleTextareaBlur = () => {
  console.log('🔄 隐藏 textarea 失去焦点')
}

// 处理日志区域鼠标按下事件
const handleLogsMouseDown = (e: MouseEvent) => {
  // 确保点击的是日志容器内部
  if (logsContainerRef.value && logsContainerRef.value.contains(e.target as Node)) {
    isLogsContainerActive.value = true
    // 让隐藏的 textarea 获得焦点，但不选择文本
    if (hiddenTextareaRef.value) {
      hiddenTextareaRef.value.focus()
      // 清除任何现有的选择，确保不会自动全选
      setTimeout(() => {
        if (hiddenTextareaRef.value) {
          hiddenTextareaRef.value.setSelectionRange(0, 0)
        }
      }, 0)
    }
    console.log('🎯 日志容器激活（鼠标按下），textarea 获得焦点但不选择文本')
  }
}

// 处理日志区域点击事件
const handleLogsClick = (e: MouseEvent) => {
  // 确保点击的是日志容器内部
  if (logsContainerRef.value && logsContainerRef.value.contains(e.target as Node)) {
    focusLogsContainer()
    isLogsContainerActive.value = true
    // 让隐藏的 textarea 获得焦点，但不选择文本
    if (hiddenTextareaRef.value) {
      hiddenTextareaRef.value.focus()
      // 清除任何现有的选择，确保不会自动全选
      setTimeout(() => {
        if (hiddenTextareaRef.value) {
          hiddenTextareaRef.value.setSelectionRange(0, 0)
        }
        // 同时清除可视区域的选择
        const selection = window.getSelection()
        if (selection) {
          selection.removeAllRanges()
        }
      }, 0)
    }
    console.log('🎯 日志容器激活（点击），textarea 获得焦点但不选择文本')
  }
}

// 全局点击事件处理 - 点击日志容器外部时取消活跃状态
const handleGlobalClick = (e: MouseEvent) => {
  if (logsContainerRef.value && !logsContainerRef.value.contains(e.target as Node)) {
    if (isLogsContainerActive.value) {
      isLogsContainerActive.value = false
      console.log('🔄 日志容器失去活跃状态（点击外部）')
    }
  }
}

// 点击日志容器时获得焦点
const focusLogsContainer = () => {
  if (logsContainerRef.value) {
    logsContainerRef.value.focus()
    console.log('🎯 日志容器获得焦点')
  }
}

// 焦点并全选
const focusAndSelectAll = () => {
  isLogsContainerActive.value = true
  if (hiddenTextareaRef.value) {
    hiddenTextareaRef.value.focus()
    // 明确调用全选
    setTimeout(() => {
      if (hiddenTextareaRef.value) {
        hiddenTextareaRef.value.select()
      }
      selectAllLogsText()
    }, 0)
  }
}

// 全选日志文本内容
const selectAllLogsText = () => {
  if (!logsContentRef.value) return
  
  const selection = window.getSelection()
  if (!selection) return
  
  const range = document.createRange()
  range.selectNodeContents(logsContentRef.value)
  selection.removeAllRanges()
  selection.addRange(range)
  
  console.log('📋 已全选日志内容')
}

// 复制所有日志内容
const copyAllLogs = async () => {
  if (logs.value.length === 0) {
    message.warning('没有日志内容可复制')
    return
  }

  try {
    // 格式化日志内容为纯文本
    const logText = logs.value
      .map(log => {
        const timestamp = formatTimestamp(log.timestamp)
        const level = log.level.toUpperCase()
        const source = log.source ? `[${log.source}]` : ''
        return `${timestamp} ${level} ${source} ${log.message}`
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
      isFollowing.value = true
      isRealTimeEnabled.value = true // 重置实时输出状态
      hasReachedTop.value = false
      lastUpdateTime.value = undefined
      isLogsContainerActive.value = false

      // 连接日志流
      try {
        console.log('🔗 准备连接日志流...')
        await connectLogStream()
        console.log('✅ 日志流连接完成')
        
        // 连接成功后让日志容器获得焦点并激活
        nextTick(() => {
          focusLogsContainer()
          isLogsContainerActive.value = true
          console.log('🎯 日志容器自动激活')
        })
      } catch (error) {
        console.error('❌ 连接日志流失败:', error)
        message.error('连接日志流失败: ' + (error as Error).message)
      }
    } else {
      console.log('🔌 断开日志流连接')
      disconnectLogStream()
      isLogsContainerActive.value = false
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
  
  // 添加全局点击监听器来管理活跃状态
  document.addEventListener('click', handleGlobalClick, true)
})

onUnmounted(() => {
  console.log('💀 AgentLogsModal 组件卸载:', props.agent?.name)
  disconnectLogStream()
  clearLoadingTimeout() // 清除超时保护
  
  // 清理事件监听器
  document.removeEventListener('click', handleGlobalClick, true)
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

  .logs-container {
    height: 100%;
    overflow-y: auto;
    background: #f8f9fa;
    font-family: 'JetBrains Mono', 'Consolas', 'Monaco', monospace;
    font-size: 13px;
    line-height: 1.4;
    outline: none;
    border: 2px solid transparent;
    border-radius: 4px;
    transition: all 0.2s ease;
    cursor: text;
    position: relative; // 为隐藏的 textarea 提供定位上下文
    
    // 启用文本选择
    user-select: text;
    -webkit-user-select: text;
    -moz-user-select: text;
    -ms-user-select: text;
    
    // 获得焦点时的样式
    &:focus {
      border-color: #0d6efd;
      background: #ffffff;
      box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.1);
    }
    
    // 鼠标悬停时的提示
    &:hover {
      background: #ffffff;
      border-color: #dee2e6;
    }
    
    // 活跃状态样式
    &.active {
      border-color: #0d6efd;
      background: #ffffff;
      box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.15);
    }

    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f3f4;
    }

    &::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 4px;

      &:hover {
        background: #a8a8a8;
      }
    }
  }
  
  // 隐藏的 textarea 样式
  .hidden-textarea {
    position: absolute;
    top: -9999px;
    left: -9999px;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
    border: none;
    outline: none;
    resize: none;
    font-family: 'JetBrains Mono', 'Consolas', 'Monaco', monospace;
    font-size: 13px;
    line-height: 1.4;
    white-space: pre-wrap;
  }

  .logs-content {
    padding: 8px;
    // 确保内容区域也支持文本选择
    user-select: text;
    -webkit-user-select: text;
    -moz-user-select: text;
    -ms-user-select: text;
  }

  .log-line {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 2px 0;
    border-left: 3px solid transparent;
    padding-left: 8px;
    // 启用文本选择
    user-select: text;
    -webkit-user-select: text;
    -moz-user-select: text;
    -ms-user-select: text;
    
    // 选中时的样式
    &::selection {
      background: rgba(13, 110, 253, 0.2);
    }
    
    &::-moz-selection {
      background: rgba(13, 110, 253, 0.2);
    }

    &.log-error {
      border-left-color: #dc3545;
      background: rgba(220, 53, 69, 0.1);
    }

    &.log-warn {
      border-left-color: #fd7e14;
      background: rgba(253, 126, 20, 0.1);
    }

    &.log-info {
      border-left-color: #0d6efd;
      background: rgba(13, 110, 253, 0.1);
    }

    &.log-debug {
      border-left-color: #198754;
      background: rgba(25, 135, 84, 0.1);
    }

    .log-timestamp {
      color: #6c757d;
      font-size: 11px;
      min-width: 80px;
      flex-shrink: 0;
      user-select: text;
    }

    .log-level {
      color: #495057;
      font-weight: 600;
      min-width: 50px;
      flex-shrink: 0;
      font-size: 11px;
      user-select: text;
    }

    .log-source {
      color: #6c757d;
      font-size: 11px;
      flex-shrink: 0;
      user-select: text;
      
      // 不同源的样式
      &.source-default-sys {
        color: #0d6efd;
        font-weight: 600;
      }
      
      &.source-unknown {
        color: #dc3545;
        font-weight: 600;
        background: rgba(220, 53, 69, 0.1);
        padding: 1px 4px;
        border-radius: 2px;
      }
      
      &.source-websocket {
        color: #198754;
        font-weight: 600;
      }
    }

    .log-message {
      color: #212529;
      flex: 1;
      word-break: break-all;
      user-select: text;
      
      // 选中文本的样式
      &::selection {
        background: rgba(13, 110, 253, 0.3);
        color: #212529;
      }
      
      &::-moz-selection {
        background: rgba(13, 110, 253, 0.3);
        color: #212529;
      }
    }
  }

  .empty-logs {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: #6c757d;

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
    color: #6c757d;

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
