import { ref, computed } from 'vue'

// 全局当前时间
const currentTime = ref(new Date())

// 定时器ID
let timeUpdateTimer: NodeJS.Timeout | null = null

// 使用该时间管理器的组件计数
let componentCount = 0

// 启动时间更新定时器
const startTimeUpdate = () => {
  if (timeUpdateTimer) return // 已经启动了

  // 每分钟更新一次当前时间
  timeUpdateTimer = setInterval(() => {
    currentTime.value = new Date()
    console.log('⏰ 时间更新:', currentTime.value.toLocaleTimeString())
  }, 60000) // 60秒

  console.log('⏰ 时间管理器启动')
}

// 停止时间更新定时器
const stopTimeUpdate = () => {
  if (timeUpdateTimer) {
    clearInterval(timeUpdateTimer)
    timeUpdateTimer = null
    console.log('⏰ 时间管理器停止')
  }
}

// 注册组件使用时间管理器
export const useTimeManager = () => {
  componentCount++

  // 如果是第一个组件，启动定时器
  if (componentCount === 1) {
    startTimeUpdate()
  }

  // 返回清理函数
  const cleanup = () => {
    componentCount--

    // 如果没有组件使用了，停止定时器
    if (componentCount === 0) {
      stopTimeUpdate()
    }
  }

  return {
    currentTime,
    cleanup
  }
}

// 格式化相对时间的工具函数
export const formatRelativeTime = (timestamp: string, now: Date = new Date()) => {
  const date = new Date(timestamp)
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) {
    // 1分钟内
    return '刚刚'
  } else if (diff < 3600000) {
    // 1小时内
    const minutes = Math.floor(diff / 60000)
    return `${minutes}分钟前`
  } else if (diff < 86400000) {
    // 24小时内
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else if (diff < 604800000) {
    // 7天内
    const days = Math.floor(diff / 86400000)
    return `${days}天前`
  } else {
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

// 创建响应式的时间格式化计算属性
export const createTimeFormatter = (timestamp: string) => {
  const { currentTime } = useTimeManager()

  return computed(() => formatRelativeTime(timestamp, currentTime.value))
}
