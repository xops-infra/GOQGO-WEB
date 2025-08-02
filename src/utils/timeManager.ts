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

// 格式化Agent运行时间（如 "2h15m" 格式）
export const formatAgentUptime = (ageString: string): string => {
  if (!ageString) return '未知'
  
  // 如果已经是格式化的字符串（如 "2h15m"），直接返回
  if (/^\d+[dhms]+/.test(ageString)) {
    return ageString
  }
  
  // 如果是时间戳，转换为相对时间
  try {
    const date = new Date(ageString)
    if (!isNaN(date.getTime())) {
      return formatRelativeTime(ageString, new Date())
    }
  } catch (error) {
    console.warn('无法解析运行时间:', ageString)
  }
  
  return ageString
}

// 解析运行时间字符串为毫秒数（用于排序等）
export const parseUptimeToMs = (ageString: string): number => {
  if (!ageString) return 0
  
  let totalMs = 0
  const regex = /(\d+)([dhms])/g
  let match
  
  while ((match = regex.exec(ageString)) !== null) {
    const value = parseInt(match[1])
    const unit = match[2]
    
    switch (unit) {
      case 'd':
        totalMs += value * 24 * 60 * 60 * 1000
        break
      case 'h':
        totalMs += value * 60 * 60 * 1000
        break
      case 'm':
        totalMs += value * 60 * 1000
        break
      case 's':
        totalMs += value * 1000
        break
    }
  }
  
  return totalMs
}
export const formatRelativeTime = (timestamp: string, now: Date = new Date()) => {
  try {
    // 验证参数
    if (!timestamp) {
      console.warn('⚠️ formatRelativeTime: timestamp为空')
      return '未知时间'
    }
    
    if (!(now instanceof Date)) {
      console.warn('⚠️ formatRelativeTime: now参数不是Date对象，使用当前时间', now)
      now = new Date()
    }
    
    const date = new Date(timestamp)
    
    // 验证日期是否有效
    if (isNaN(date.getTime())) {
      console.warn('⚠️ formatRelativeTime: 无效的时间戳', timestamp)
      return '无效时间'
    }
    
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
  } catch (error) {
    console.error('❌ formatRelativeTime错误:', error)
    return '时间错误'
  }
}

// 创建响应式的时间格式化计算属性
export const createTimeFormatter = (timestamp: string) => {
  const { currentTime } = useTimeManager()

  return computed(() => formatRelativeTime(timestamp, currentTime.value))
}
