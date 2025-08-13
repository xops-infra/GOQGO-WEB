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
    <!-- 简化的标题栏 -->
    <div ref="headerRef" class="modal-header" @mousedown="startDrag">
      <div class="header-left">
        <div class="agent-info">
          <div class="agent-name">
            <LogsIcon :size="16" color="#07c160" />
            <span class="name">{{ agent?.name }}</span>
            <span class="namespace">{{ agent?.namespace }}</span>
          </div>
          <div class="status-info">
            <span class="status-dot" :class="{ connected: isConnected }"></span>
            <span class="status-text">{{ isConnected ? '已连接' : '未连接' }}</span>
            <span class="log-count">{{ logs.length }} 条日志</span>
          </div>
        </div>
      </div>
      
      <div class="header-right">
        <!-- 只保留关闭按钮 -->
        <n-button size="small" quaternary circle @click="closeModal" class="close-btn">
          <template #icon>
            <n-icon><CloseIcon /></n-icon>
          </template>
        </n-button>
      </div>
    </div>

    <!-- 日志内容区域 -->
    <div class="modal-body">
      <RawLogXTermRenderer
        ref="xtermRendererRef"
        :raw-content="rawLogContent"
        :auto-scroll="isRealTimeEnabled"
        :max-lines="10000"
      />
    </div>

    <!-- 功能按钮区域 -->
    <div class="modal-footer">
      <div class="footer-left">
        <span class="last-update" v-if="lastUpdateTime">
          最后更新: {{ formatTime(lastUpdateTime) }}
        </span>
      </div>
      
      <div class="footer-center">
        <!-- 优化后的功能按钮组 -->
        <div class="control-buttons-group">
          <!-- 实时跟踪按钮 - 突出显示 -->
          <n-button
            :type="isRealTimeEnabled ? 'success' : 'default'"
            size="small"
            @click="toggleRealTime"
            :disabled="!isConnected"
            class="primary-control-btn"
            round
          >
            <template #icon>
              <n-icon>
                <svg viewBox="0 0 24 24" width="14" height="14">
                  <circle cx="12" cy="12" r="3" fill="currentColor" v-if="isRealTimeEnabled"/>
                  <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2" v-else/>
                </svg>
              </n-icon>
            </template>
            {{ isRealTimeEnabled ? '实时跟踪' : '已暂停' }}
          </n-button>
          
          <!-- 分隔线 -->
          <div class="button-divider"></div>
          
          <!-- 操作按钮组 -->
          <div class="action-buttons-compact">
            <!-- 清空按钮 -->
            <n-button 
              size="small" 
              @click="clearLogs" 
              class="compact-btn"
              quaternary
              title="清空日志 (Ctrl+L)"
            >
              <template #icon>
                <n-icon size="14">
                  <svg viewBox="0 0 24 24">
                    <path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
                  </svg>
                </n-icon>
              </template>
              清空
            </n-button>
            
            <!-- 复制按钮 -->
            <n-button 
              size="small" 
              @click="copyAllLogs" 
              class="compact-btn"
              quaternary
              title="复制日志 (Ctrl+C)"
            >
              <template #icon>
                <n-icon size="14">
                  <svg viewBox="0 0 24 24">
                    <path fill="currentColor" d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"/>
                  </svg>
                </n-icon>
              </template>
              复制
            </n-button>
          </div>
        </div>
      </div>
      
      <div class="footer-right">
        <!-- 优化后的快捷键提示 -->
        <div class="shortcuts-compact">
          <span class="shortcut-label">快捷键:</span>
          <div class="shortcut-items">
            <span class="shortcut-key">Space</span>
            <span class="shortcut-desc">暂停</span>
            <span class="shortcut-key">Ctrl+L</span>
            <span class="shortcut-desc">清空</span>
            <span class="shortcut-key">Ctrl+C</span>
            <span class="shortcut-desc">复制</span>
            <span class="shortcut-key">Alt+Z</span>
            <span class="shortcut-desc">换行</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, watch } from 'vue'
import { NButton, NIcon } from 'naive-ui'
import { 
  CloseOutline as CloseIcon
} from '@vicons/ionicons5'
import { useMessage } from 'naive-ui'
import LogsIcon from '@/components/icons/LogsIcon.vue'
import RawLogXTermRenderer from '@/components/log/RawLogXTermRenderer.vue'
import { LogManager } from '@/utils/logManager'
import type { Agent, LogEntry } from '@/api/agents'

interface Props {
  show: boolean
  agent: Agent | null
  resetPosition?: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:show': [value: boolean]
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
const rawLogContent = ref<string>('')
const isRealTimeEnabled = ref(true)
const isConnected = ref(false)
const isConnecting = ref(false)
const lastUpdateTime = ref<string>()
const logManager = ref<LogManager | null>(null)

// 模态框位置和大小
const modalPosition = ref({ x: 0, y: 0 })
const modalSize = ref({ width: 900, height: 700 })

// 拖拽状态
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })

// 格式化时间
const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 连接日志流
const connectLogStream = async () => {
  if (!props.agent) return

  console.log('🔗 开始连接日志流:', {
    agentName: props.agent.name,
    namespace: props.agent.namespace,
    timestamp: new Date().toISOString()
  })

  try {
    isConnecting.value = true

    // 断开现有连接
    if (logManager.value) {
      console.log('🔄 断开现有连接')
      logManager.value.destroy()
    }

    // 创建新的日志管理器
    console.log('🏗️ 创建新的 LogManager:', {
      namespace: props.agent.namespace,
      agentName: props.agent.name
    })
    
    logManager.value = new LogManager(
      props.agent.namespace,
      props.agent.name,
      {
        onLogsUpdate: (logEntries, response, rawContent) => {
          console.log('📋 收到日志更新:', logEntries.length, '条')
          
          if (rawContent) {
            rawLogContent.value = rawContent
          }
          
          const formattedLogs: LogEntry[] = logEntries.map(entry => ({
            timestamp: entry.timestamp,
            level: entry.level as 'info' | 'warn' | 'error' | 'debug',
            message: entry.message,
            source: entry.source
          }))
          
          logs.value = formattedLogs
          lastUpdateTime.value = response.timestamp
        },
        onError: (error) => {
          console.error('📡 日志流错误:', error)
          message.error(`日志获取错误: ${error}`)
          isConnected.value = false
          isConnecting.value = false
        },
        onRefresh: () => {
          console.log('🔄 日志刷新中...')
        }
      }
    )

    console.log('✅ 日志管理器创建成功')
    
    // 模拟连接成功
    isConnected.value = true
    isConnecting.value = false
    
    // 开始自动刷新
    if (isRealTimeEnabled.value) {
      logManager.value.startAutoRefresh(3000)
    }
    
  } catch (error) {
    console.error('❌ 连接日志流失败:', error)
    message.error('连接日志流失败: ' + (error as Error).message)
    isConnected.value = false
    isConnecting.value = false
  }
}

// 断开日志流
const disconnectLogStream = () => {
  console.log('🔌 断开日志流连接')
  
  if (logManager.value) {
    console.log('🗑️ 销毁 LogManager 实例')
    logManager.value.destroy()
    logManager.value = null
  }
  
  isConnected.value = false
  isConnecting.value = false
  
  console.log('✅ 日志流连接已断开')
}

// 切换实时输出
const toggleRealTime = async () => {
  if (!props.agent || !isConnected.value) return

  try {
    const currentState = isRealTimeEnabled.value
    const newRealTimeState = !currentState
    
    isRealTimeEnabled.value = newRealTimeState
    
    if (logManager.value) {
      if (newRealTimeState) {
        logManager.value.startAutoRefresh(3000)
        message.success('实时跟踪已开启')
      } else {
        logManager.value.stopAutoRefresh()
        message.info('实时跟踪已暂停')
      }
    }
  } catch (error) {
    console.error('❌ 切换实时输出失败:', error)
    message.error('切换实时输出失败: ' + (error as Error).message)
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
  rawLogContent.value = ''
  message.success('日志已清空')
}

// 复制所有日志
const copyAllLogs = async () => {
  try {
    const logText = logs.value
      .map(log => `${log.timestamp} ${log.level.toUpperCase()} ${log.message}`)
      .join('\n')
    
    await navigator.clipboard.writeText(logText)
    message.success('日志已复制到剪贴板')
  } catch (error) {
    console.error('❌ 复制失败:', error)
    message.error('复制失败: ' + (error as Error).message)
  }
}

// 关闭模态框
const closeModal = () => {
  visible.value = false
}

// 拖拽相关方法
const startDrag = (e: MouseEvent) => {
  if (e.target !== headerRef.value) return
  
  isDragging.value = true
  dragStart.value = {
    x: e.clientX - modalPosition.value.x,
    y: e.clientY - modalPosition.value.y
  }
  
  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDrag)
}

const handleDrag = (e: MouseEvent) => {
  if (!isDragging.value) return
  
  modalPosition.value = {
    x: e.clientX - dragStart.value.x,
    y: e.clientY - dragStart.value.y
  }
}

const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
}

// 初始化模态框
const initializeModal = () => {
  const windowCount = document.querySelectorAll('.agent-logs-modal').length
  const screenWidth = window.innerWidth
  const screenHeight = window.innerHeight
  
  // 计算初始位置，避免重叠
  const offsetX = (windowCount * 30) % (screenWidth - modalSize.value.width)
  const offsetY = (windowCount * 30) % (screenHeight - modalSize.value.height)
  
  const finalX = Math.max(0, Math.min(offsetX, screenWidth - modalSize.value.width))
  const finalY = Math.max(0, Math.min(offsetY, screenHeight - modalSize.value.height))
  
  modalPosition.value = { x: finalX, y: finalY }
}

// 监听模态框显示状态
watch(
  visible,
  async (show) => {
    if (show && props.agent) {
      initializeModal()
      logs.value = []
      isRealTimeEnabled.value = true
      lastUpdateTime.value = undefined
      
      try {
        await connectLogStream()
      } catch (error) {
        console.error('❌ 连接日志流失败:', error)
        message.error('连接日志流失败: ' + (error as Error).message)
      }
    } else {
      disconnectLogStream()
    }
  },
  { immediate: true }
)

// 监听 agent 变化，当切换不同 agent 时重新连接日志流
watch(
  () => props.agent,
  async (newAgent, oldAgent) => {
    console.log('🔄 Agent 变化:', {
      old: oldAgent?.name,
      new: newAgent?.name,
      oldNamespace: oldAgent?.namespace,
      newNamespace: newAgent?.namespace,
      visible: visible.value
    })
    
    // 如果模态框已打开且 agent 发生变化，重新连接日志流
    if (visible.value && newAgent && oldAgent && 
        (newAgent.name !== oldAgent.name || newAgent.namespace !== oldAgent.namespace)) {
      console.log('🔄 Agent 已变化，重新连接日志流')
      
      // 断开旧连接
      disconnectLogStream()
      
      // 清空旧日志
      logs.value = []
      rawLogContent.value = ''
      lastUpdateTime.value = undefined
      
      // 重新连接
      try {
        await connectLogStream()
      } catch (error) {
        console.error('❌ 重新连接日志流失败:', error)
        message.error('重新连接日志流失败: ' + (error as Error).message)
      }
    }
  }
)

// 键盘快捷键支持（仅在可见时生效）
const handleKeydown = (e: KeyboardEvent) => {
  if (!visible.value) return

  // 关闭
  if (e.key === 'Escape') {
    closeModal()
    return
  }

  // 切换自动换行 Alt+Z（避免与浏览器冲突）
  if ((e.altKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
    const wrap = xtermRendererRef.value?.getLineWrap() ?? true
    xtermRendererRef.value?.setLineWrap(!wrap)
    e.preventDefault()
    message.info(`自动换行 ${wrap ? '关闭' : '开启'}`)
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
      initializeModal()
    }
  }
)

// 处理窗口点击
const handleWindowClick = (e: Event) => {
  e.stopPropagation()
}

// 组件卸载
onUnmounted(() => {
  disconnectLogStream()
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped lang="scss">
.agent-logs-modal {
  position: fixed;
  background: #0d1117;
  border: 2px solid #30363d; // 增强边框可见性
  border-radius: 12px; // 增加圆角
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.1), // 添加内发光边框
    inset 0 1px 0 rgba(255, 255, 255, 0.1); // 顶部内发光
  display: flex;
  flex-direction: column;
  z-index: 1000;
  overflow: hidden;
  
  // 现代化设计
  backdrop-filter: blur(10px);
  
  .modal-header {
    background: linear-gradient(135deg, #161b22 0%, #0d1117 100%);
    border-bottom: 2px solid #30363d; // 增强分隔线
    padding: 16px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: move;
    user-select: none;
    
    .header-left {
      .agent-info {
        .agent-name {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
          
          .name {
            font-size: 16px;
            font-weight: 600;
            color: #f0f6fc;
          }
          
          .namespace {
            font-size: 12px;
            color: #8b949e;
            background: #21262d;
            padding: 2px 8px;
            border-radius: 12px;
            border: 1px solid #30363d; // 添加边框
          }
        }
        
        .status-info {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          
          .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #f85149;
            border: 1px solid rgba(255, 255, 255, 0.2); // 添加边框
            
            &.connected {
              background: #238636;
              border-color: rgba(35, 134, 54, 0.3);
            }
          }
          
          .status-text {
            color: #8b949e;
          }
          
          .log-count {
            color: #58a6ff;
            font-weight: 500;
            background: rgba(88, 166, 255, 0.1); // 添加背景
            padding: 2px 6px;
            border-radius: 4px;
            border: 1px solid rgba(88, 166, 255, 0.2);
          }
        }
      }
    }
    
    .header-right {
      .close-btn {
        background: #da3633;
        border: 2px solid #da3633; // 增强边框
        color: white;
        transition: all 0.2s ease;
        
        &:hover {
          background: #f85149;
          border-color: #f85149;
          transform: scale(1.1); // 悬停时放大
        }
      }
    }
  }
  
  .modal-body {
    flex: 1;
    background: #0d1117;
    overflow: hidden;
    border-left: 1px solid rgba(255, 255, 255, 0.05); // 添加微妙的左边框
    border-right: 1px solid rgba(255, 255, 255, 0.05); // 添加微妙的右边框
  }
  
  .modal-footer {
    background: #161b22;
    border-top: 2px solid #30363d; // 增强分隔线
    padding: 16px 20px; // 增加内边距
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    
    .footer-left {
      .last-update {
        color: #8b949e;
        background: rgba(139, 148, 158, 0.1); // 添加背景
        padding: 4px 8px;
        border-radius: 4px;
        border: 1px solid rgba(139, 148, 158, 0.2);
      }
    }
    
    .footer-center {
      .control-buttons-group {
        display: flex;
        align-items: center;
        gap: 16px;
        
        .primary-control-btn {
          background: linear-gradient(135deg, #238636, #2ea043);
          border: 2px solid #2ea043;
          color: #ffffff;
          font-weight: 500;
          padding: 8px 16px;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(46, 160, 67, 0.2);
          
          &:hover {
            background: linear-gradient(135deg, #2ea043, #238636);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(46, 160, 67, 0.3);
          }
          
          &:disabled {
            background: #21262d;
            border-color: #30363d;
            color: #8b949e;
            box-shadow: none;
            transform: none;
          }
          
          &.n-button--default {
            background: #21262d;
            border-color: #30363d;
            color: #f0f6fc;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            
            &:hover {
              background: #30363d;
              border-color: #484f58;
            }
          }
        }
        
        .button-divider {
          width: 1px;
          height: 24px;
          background: linear-gradient(to bottom, transparent, #30363d, transparent);
          margin: 0 4px;
        }
        
        .action-buttons-compact {
          display: flex;
          align-items: center;
          gap: 8px;
          
          .compact-btn {
            background: rgba(33, 38, 45, 0.6);
            border: 1px solid rgba(48, 54, 61, 0.8);
            color: #8b949e;
            padding: 6px 10px;
            transition: all 0.2s ease;
            backdrop-filter: blur(4px);
            
            &:hover {
              background: rgba(48, 54, 61, 0.8);
              border-color: #484f58;
              color: #f0f6fc;
              transform: translateY(-1px);
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            }
            
            &:active {
              transform: translateY(0);
              box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
            }
          }
        }
      }
    }
    
    .footer-right {
      .shortcuts-compact {
        display: flex;
        align-items: center;
        gap: 12px;
        
        .shortcut-label {
          color: #8b949e;
          font-size: 11px;
          font-weight: 500;
        }
        
        .shortcut-items {
          display: flex;
          align-items: center;
          gap: 8px;
          
          .shortcut-key {
            background: linear-gradient(135deg, #21262d, #161b22);
            border: 1px solid #30363d;
            color: #f0f6fc;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-family: 'JetBrains Mono', 'Consolas', monospace;
            font-weight: 500;
            box-shadow: 
              0 1px 2px rgba(0, 0, 0, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
          }
          
          .shortcut-desc {
            color: #8b949e;
            font-size: 10px;
            margin-right: 4px;
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .agent-logs-modal {
    .modal-header {
      padding: 12px 16px;
      
      .header-left .agent-info .agent-name .name {
        font-size: 14px;
      }
    }
    
    .modal-footer {
      padding: 12px 16px;
      flex-direction: column;
      gap: 12px;
      
      .footer-center .control-buttons-group {
        gap: 8px;
        flex-direction: column;
        
        .primary-control-btn {
          padding: 6px 12px;
          font-size: 12px;
        }
        
        .action-buttons-compact {
          gap: 6px;
          
          .compact-btn {
            padding: 4px 8px;
            font-size: 11px;
          }
        }
      }
      
      .footer-right .shortcuts-compact {
        gap: 6px;
        
        .shortcut-items {
          gap: 4px;
          
          .shortcut-key {
            font-size: 9px;
            padding: 1px 4px;
          }
          
          .shortcut-desc {
            font-size: 9px;
          }
        }
      }
    }
  }
}
</style>
