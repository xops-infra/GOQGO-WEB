<template>
  <div 
    ref="containerRef"
    class="virtual-list"
    :style="{ height: `${containerHeight}px` }"
    @scroll="handleScroll"
  >
    <!-- 虚拟滚动容器 -->
    <div 
      class="virtual-list-phantom"
      :style="{ height: `${totalHeight}px` }"
    ></div>
    
    <!-- 可见项目容器 -->
    <div 
      class="virtual-list-content"
      :style="{ transform: `translateY(${offsetY}px)` }"
    >
      <div
        v-for="item in visibleItems"
        :key="item.index"
        class="virtual-list-item"
        :style="{ height: `${itemHeight}px` }"
      >
        <slot name="item" :item="item.data" :index="item.index" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

interface Props {
  items: any[]
  itemHeight: number
  containerHeight: number
  bufferSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  bufferSize: 10
})

// 响应式数据
const containerRef = ref<HTMLElement>()
const scrollTop = ref(0)

// 计算属性
const totalHeight = computed(() => props.items.length * props.itemHeight)

const visibleCount = computed(() => Math.ceil(props.containerHeight / props.itemHeight))

const startIndex = computed(() => {
  const index = Math.floor(scrollTop.value / props.itemHeight)
  return Math.max(0, index - props.bufferSize)
})

const endIndex = computed(() => {
  const index = startIndex.value + visibleCount.value + props.bufferSize * 2
  return Math.min(props.items.length - 1, index)
})

const visibleItems = computed(() => {
  const items = []
  for (let i = startIndex.value; i <= endIndex.value; i++) {
    if (props.items[i]) {
      items.push({
        index: i,
        data: props.items[i]
      })
    }
  }
  return items
})

const offsetY = computed(() => startIndex.value * props.itemHeight)

// 方法
const handleScroll = (e: Event) => {
  const target = e.target as HTMLElement
  scrollTop.value = target.scrollTop
}

const scrollToIndex = (index: number) => {
  if (!containerRef.value) return
  
  const targetScrollTop = index * props.itemHeight
  containerRef.value.scrollTop = targetScrollTop
}

const scrollToBottom = () => {
  if (!containerRef.value) return
  
  containerRef.value.scrollTop = totalHeight.value
}

// 监听items变化，保持滚动位置
watch(() => props.items.length, (newLength, oldLength) => {
  if (newLength > oldLength && containerRef.value) {
    // 如果用户在底部附近，自动滚动到新内容
    const { scrollTop: currentScrollTop, scrollHeight, clientHeight } = containerRef.value
    const isNearBottom = scrollHeight - currentScrollTop - clientHeight < 100
    
    if (isNearBottom) {
      setTimeout(() => {
        scrollToBottom()
      }, 0)
    }
  }
})

// 暴露方法给父组件
defineExpose({
  scrollToIndex,
  scrollToBottom
})
</script>

<style scoped lang="scss">
.virtual-list {
  position: relative;
  overflow: auto;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--bg-tertiary);
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border-secondary);
    border-radius: 4px;
    
    &:hover {
      background: var(--border-primary);
    }
  }
}

.virtual-list-phantom {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: -1;
}

.virtual-list-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

.virtual-list-item {
  overflow: hidden;
}

// Terminal主题样式
[data-theme='terminal'] .virtual-list {
  &::-webkit-scrollbar-track {
    background: var(--terminal-bg-tertiary);
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--terminal-border);
    
    &:hover {
      background: var(--pixel-green);
    }
  }
}
</style>
