<template>
  <div 
    v-if="showDropdown" 
    ref="autocompleteRef"
    class="agent-autocomplete" 
    :class="{ 'terminal-autocomplete': isTerminal }"
    :style="dropdownStyle"
  >
    <div 
      v-for="(agent, index) in filteredAgents" 
      :key="`${agent.name}.${agent.namespace}`"
      class="agent-option"
      :class="{ 
        'selected': index === selectedIndex,
        'terminal-option': isTerminal 
      }"
      @click="selectAgent(agent)"
      @mouseenter="selectedIndex = index"
    >
      <div class="agent-main">
        <span class="agent-name" :class="{ 'terminal-text': isTerminal }">
          {{ isTerminal ? agent.name.toUpperCase() : agent.name }}
        </span>
        <span 
          v-if="agent.namespace !== 'default'" 
          class="agent-namespace"
          :class="{ 'terminal-namespace': isTerminal }"
        >
          {{ isTerminal ? `::${agent.namespace.toUpperCase()}` : `.${agent.namespace}` }}
        </span>
        <span 
          class="agent-status" 
          :class="[getStatusClass(agent.status), { 'terminal-status': isTerminal }]"
        >
          {{ getStatusText(agent.status) }}
        </span>
      </div>
      
      <div v-if="agent.role" class="agent-role" :class="{ 'terminal-role': isTerminal }">
        {{ isTerminal ? agent.role.toUpperCase() : agent.role }}
      </div>
    </div>
    
    <div v-if="filteredAgents.length === 0" class="no-agents" :class="{ 'terminal-text': isTerminal }">
      {{ isTerminal ? 'NO_AGENTS_FOUND' : '未找到匹配的Agent' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useTheme } from '@/utils/theme'
import type { Agent } from '@/api/agents'

interface Props {
  agents: Agent[]
  query: string
  position: { x: number; y: number }
  visible: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [agent: Agent]
  close: []
}>()

const { isTerminal } = useTheme()

// 响应式状态
const selectedIndex = ref(0)
const autocompleteRef = ref<HTMLElement>()

// 获取最高z-index并设置为更高
const ensureTopLevel = () => {
  if (!autocompleteRef.value) return
  
  console.log('🎯 开始检测z-index...')
  
  // 获取所有可能遮挡的元素
  const allModals = document.querySelectorAll('.agent-logs-modal, .n-modal, .n-drawer, .n-popover')
  let maxZIndex = 1000 // 设置一个合理的基础值
  
  console.log(`📊 找到 ${allModals.length} 个可能遮挡的元素`)
  
  allModals.forEach((element, index) => {
    const computedStyle = window.getComputedStyle(element)
    const zIndex = parseInt(computedStyle.zIndex || '0')
    console.log(`  元素${index + 1}: z-index = ${zIndex} (${computedStyle.zIndex})`)
    
    // 只考虑有效的z-index值
    if (!isNaN(zIndex) && zIndex > maxZIndex) {
      maxZIndex = zIndex
    }
  })
  
  // 设置为最高层 + 100，确保足够高
  let finalZIndex = maxZIndex + 100
  
  // 备用方案：如果检测到的最高值太低，使用一个保证的高值
  if (finalZIndex < 10000) {
    finalZIndex = 10000
    console.log('🔒 使用备用高z-index值:', finalZIndex)
  }
  
  autocompleteRef.value.style.zIndex = finalZIndex.toString()
  
  console.log(`🎯 @提示框设置z-index: ${finalZIndex} (检测到的最高值: ${maxZIndex})`)
  
  // 验证设置是否成功
  setTimeout(() => {
    const actualZIndex = window.getComputedStyle(autocompleteRef.value!).zIndex
    console.log(`✅ 验证@提示框实际z-index: ${actualZIndex}`)
    
    // 如果还是被遮挡，使用终极方案
    if (parseInt(actualZIndex) < 10000) {
      console.log('⚠️ z-index设置可能失败，使用终极方案')
      autocompleteRef.value!.style.zIndex = '999999'
      autocompleteRef.value!.style.position = 'fixed'
      autocompleteRef.value!.style.pointerEvents = 'auto'
    }
  }, 0)
}

// 计算属性
const showDropdown = computed(() => {
  return props.visible && props.query.length > 0
})

const filteredAgents = computed(() => {
  if (!props.query) return []
  
  const query = props.query.toLowerCase()
  return props.agents
    .filter(agent => 
      agent.name.toLowerCase().includes(query) ||
      agent.role?.toLowerCase().includes(query) ||
      agent.namespace.toLowerCase().includes(query)
    )
    .slice(0, 8) // 最多显示8个
})

const dropdownStyle = computed(() => ({
  left: `${props.position.x}px`,
  top: `${props.position.y}px`
}))

// 方法
const selectAgent = (agent: Agent) => {
  emit('select', agent)
}

const getStatusClass = (status: string) => {
  const statusMap: Record<string, string> = {
    'running': 'status-running',
    'idle': 'status-idle', 
    'error': 'status-error',
    'Creating': 'status-creating',
    'Terminating': 'status-terminating'
  }
  return statusMap[status] || 'status-unknown'
}

const getStatusText = (status: string) => {
  if (isTerminal.value) {
    const statusMap: Record<string, string> = {
      'running': 'RUN',
      'idle': 'IDLE',
      'error': 'ERR',
      'Creating': 'NEW',
      'Terminating': 'END'
    }
    return statusMap[status] || 'UNK'
  } else {
    const statusMap: Record<string, string> = {
      'running': '运行',
      'idle': '空闲',
      'error': '错误',
      'Creating': '创建中',
      'Terminating': '终止中'
    }
    return statusMap[status] || '未知'
  }
}

// 键盘导航
const handleKeyDown = (event: KeyboardEvent) => {
  if (!showDropdown.value) return
  
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      selectedIndex.value = Math.min(selectedIndex.value + 1, filteredAgents.value.length - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
      break
    case 'Enter':
      event.preventDefault()
      if (filteredAgents.value[selectedIndex.value]) {
        selectAgent(filteredAgents.value[selectedIndex.value])
      }
      break
    case 'Escape':
      event.preventDefault()
      emit('close')
      break
  }
}

// 监听变化
watch(() => props.visible, (visible) => {
  if (visible) {
    selectedIndex.value = 0
    nextTick(() => {
      document.addEventListener('keydown', handleKeyDown)
      // 确保显示时在最顶层
      ensureTopLevel()
    })
  } else {
    document.removeEventListener('keydown', handleKeyDown)
  }
})

watch(() => filteredAgents.value.length, () => {
  selectedIndex.value = 0
})

// 监听DOM变化，确保始终在最顶层
let observer: MutationObserver | null = null

watch(() => props.visible, (visible) => {
  if (visible) {
    // 开始监听DOM变化
    observer = new MutationObserver(() => {
      if (props.visible) {
        ensureTopLevel()
      }
    })
    
    // 监听可能影响层级的元素变化
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    })
  } else {
    // 停止监听
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }
})

// 组件卸载时清理
onUnmounted(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped lang="scss">
.agent-autocomplete {
  position: fixed;
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 300px;
  min-width: 250px;
  overflow-y: auto;
  /* z-index 由 JavaScript 动态管理 */
  
  &.terminal-autocomplete {
    background: #0a0a0a;
    border: 2px solid #00ff00;
    border-radius: 0;
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
  }
}

.agent-option {
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f7f9fa;
  transition: background-color 0.2s ease;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover, &.selected {
    background: #f7f9fa;
  }
  
  &.terminal-option {
    border-bottom: 1px solid #333;
    font-family: 'JetBrains Mono', monospace;
    
    &:hover, &.selected {
      background: rgba(0, 255, 0, 0.1);
    }
  }
}

.agent-main {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.agent-name {
  font-weight: 500;
  color: #1da1f2;
  font-size: 14px;
  
  &.terminal-text {
    color: #00ff00;
  }
}

.agent-namespace {
  font-size: 12px;
  color: #666;
  
  &.terminal-namespace {
    color: #ffff00;
  }
}

.agent-status {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 500;
  margin-left: auto;
  
  &.status-running {
    background: #e6f7ff;
    color: #1890ff;
  }
  
  &.status-idle {
    background: #f6ffed;
    color: #52c41a;
  }
  
  &.status-error {
    background: #fff2f0;
    color: #ff4d4f;
  }
  
  &.status-creating {
    background: #fff7e6;
    color: #fa8c16;
  }
  
  &.status-terminating {
    background: #f9f0ff;
    color: #722ed1;
  }
  
  &.terminal-status {
    border-radius: 0;
    border: 1px solid;
    background: transparent;
    
    &.status-running {
      color: #00ffff;
      border-color: #00ffff;
    }
    
    &.status-idle {
      color: #00ff00;
      border-color: #00ff00;
    }
    
    &.status-error {
      color: #ff0000;
      border-color: #ff0000;
    }
    
    &.status-creating {
      color: #ffff00;
      border-color: #ffff00;
    }
    
    &.status-terminating {
      color: #ff00ff;
      border-color: #ff00ff;
    }
  }
}

.agent-role {
  font-size: 12px;
  color: #666;
  font-style: italic;
  
  &.terminal-role {
    color: #888;
    font-style: normal;
  }
}

.no-agents {
  padding: 16px;
  text-align: center;
  color: #999;
  font-size: 12px;
  
  &.terminal-text {
    color: #666;
    font-family: 'JetBrains Mono', monospace;
  }
}
</style>
