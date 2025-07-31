<template>
  <div class="message-stats">
    <n-card title="消息统计" :bordered="false" size="small">
      <template #header-extra>
        <n-button-group size="small">
          <n-button 
            :type="timeRange === 'today' ? 'primary' : 'default'"
            @click="timeRange = 'today'"
          >
            今日
          </n-button>
          <n-button 
            :type="timeRange === 'week' ? 'primary' : 'default'"
            @click="timeRange = 'week'"
          >
            本周
          </n-button>
          <n-button 
            :type="timeRange === 'month' ? 'primary' : 'default'"
            @click="timeRange = 'month'"
          >
            本月
          </n-button>
          <n-button 
            :type="timeRange === 'all' ? 'primary' : 'default'"
            @click="timeRange = 'all'"
          >
            全部
          </n-button>
        </n-button-group>
      </template>

      <div class="stats-content">
        <!-- 基础统计 -->
        <div class="basic-stats">
          <n-grid :cols="4" :x-gap="12">
            <n-grid-item>
              <n-statistic label="总消息数" :value="stats.totalMessages">
                <template #prefix>
                  <n-icon color="#18a058">
                    <svg viewBox="0 0 24 24">
                      <path fill="currentColor" d="M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4A2,2 0 0,0 20,2M6,9V7H18V9H6M14,11V13H6V11H14M16,15V17H6V15H16Z"/>
                    </svg>
                  </n-icon>
                </template>
              </n-statistic>
            </n-grid-item>
            <n-grid-item>
              <n-statistic label="文本消息" :value="stats.textMessages">
                <template #prefix>
                  <n-icon color="#2080f0">
                    <svg viewBox="0 0 24 24">
                      <path fill="currentColor" d="M5,3C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H5M5,5H19V19H5V5M7,7V9H17V7H7M7,11V13H17V11H7M7,15V17H14V15H7Z"/>
                    </svg>
                  </n-icon>
                </template>
              </n-statistic>
            </n-grid-item>
            <n-grid-item>
              <n-statistic label="图片消息" :value="stats.imageMessages">
                <template #prefix>
                  <n-icon color="#f0a020">
                    <svg viewBox="0 0 24 24">
                      <path fill="currentColor" d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z"/>
                    </svg>
                  </n-icon>
                </template>
              </n-statistic>
            </n-grid-item>
            <n-grid-item>
              <n-statistic label="文件消息" :value="stats.fileMessages">
                <template #prefix>
                  <n-icon color="#d03050">
                    <svg viewBox="0 0 24 24">
                      <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                    </svg>
                  </n-icon>
                </template>
              </n-statistic>
            </n-grid-item>
          </n-grid>
        </div>

        <!-- 活跃度统计 -->
        <div class="activity-stats">
          <n-divider title-placement="left">活跃度分析</n-divider>
          <n-grid :cols="3" :x-gap="12">
            <n-grid-item>
              <div class="stat-item">
                <div class="stat-label">最活跃时段</div>
                <div class="stat-value">{{ stats.mostActiveHour }}:00</div>
                <div class="stat-desc">{{ stats.mostActiveHourCount }} 条消息</div>
              </div>
            </n-grid-item>
            <n-grid-item>
              <div class="stat-item">
                <div class="stat-label">平均消息长度</div>
                <div class="stat-value">{{ stats.avgMessageLength }}</div>
                <div class="stat-desc">字符数</div>
              </div>
            </n-grid-item>
            <n-grid-item>
              <div class="stat-item">
                <div class="stat-label">消息频率</div>
                <div class="stat-value">{{ stats.messageFrequency }}</div>
                <div class="stat-desc">条/小时</div>
              </div>
            </n-grid-item>
          </n-grid>
        </div>

        <!-- 用户参与度 -->
        <div class="user-stats" v-if="stats.userStats.length > 0">
          <n-divider title-placement="left">用户参与度</n-divider>
          <div class="user-list">
            <div 
              v-for="user in stats.userStats" 
              :key="user.name"
              class="user-item"
            >
              <div class="user-info">
                <n-avatar 
                  :size="32" 
                  :src="user.avatar" 
                  :fallback-src="defaultAvatar"
                  round
                />
                <div class="user-details">
                  <div class="user-name">{{ user.name }}</div>
                  <div class="user-role">{{ user.role || '用户' }}</div>
                </div>
              </div>
              <div class="user-metrics">
                <n-tag size="small" type="info">
                  {{ user.messageCount }} 条
                </n-tag>
                <n-progress 
                  type="line" 
                  :percentage="user.percentage" 
                  :height="4"
                  :show-indicator="false"
                  style="width: 60px; margin-left: 8px;"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 关键词统计 -->
        <div class="keyword-stats" v-if="stats.keywords.length > 0">
          <n-divider title-placement="left">热门关键词</n-divider>
          <div class="keyword-cloud">
            <n-tag
              v-for="keyword in stats.keywords"
              :key="keyword.word"
              :size="getKeywordSize(keyword.count)"
              type="info"
              round
              style="margin: 2px;"
            >
              {{ keyword.word }} ({{ keyword.count }})
            </n-tag>
          </div>
        </div>

        <!-- 时间分布图 -->
        <div class="time-distribution" v-if="stats.hourlyDistribution.length > 0">
          <n-divider title-placement="left">24小时分布</n-divider>
          <div class="hour-chart">
            <div 
              v-for="(hour, index) in stats.hourlyDistribution"
              :key="index"
              class="hour-bar"
              :style="{ height: `${(hour.count / stats.maxHourlyCount) * 100}%` }"
              :title="`${hour.hour}:00 - ${hour.count} 条消息`"
            >
              <div class="hour-label">{{ hour.hour }}</div>
            </div>
          </div>
        </div>

        <!-- 导出功能 -->
        <div class="export-actions">
          <n-divider title-placement="left">数据导出</n-divider>
          <n-space>
            <n-button size="small" @click="exportStats('json')">
              <template #icon>
                <n-icon>
                  <svg viewBox="0 0 24 24">
                    <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                </n-icon>
              </template>
              导出JSON
            </n-button>
            <n-button size="small" @click="exportStats('csv')">
              <template #icon>
                <n-icon>
                  <svg viewBox="0 0 24 24">
                    <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                </n-icon>
              </template>
              导出CSV
            </n-button>
            <n-button size="small" @click="exportStats('report')">
              <template #icon>
                <n-icon>
                  <svg viewBox="0 0 24 24">
                    <path fill="currentColor" d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,19H5V5H19V19Z"/>
                  </svg>
                </n-icon>
              </template>
              生成报告
            </n-button>
          </n-space>
        </div>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import { useChatStore } from '@/stores/chat'
import { storeToRefs } from 'pinia'

// Props
interface Props {
  namespace: string
}

const props = defineProps<Props>()

// 状态管理
const chatStore = useChatStore()
const { messages } = storeToRefs(chatStore)
const message = useMessage()

// 响应式数据
const timeRange = ref<'today' | 'week' | 'month' | 'all'>('today')
const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNmMGYwZjAiLz4KPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSI4IiB5PSI4Ij4KPHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiPgo8cGF0aCBmaWxsPSIjOTk5IiBkPSJNMTIsNEE0LDQgMCAwLDEgMTYsOEE0LDQgMCAwLDEgMTIsMTJBNCw0IDAgMCwxIDgsOEE0LDQgMCAwLDEgMTIsNE0xMiwxNEMxNi40MiwxNCAyMCwxNS43OSAyMCwxOFYyMEg0VjE4QzQsMTUuNzkgNy41OCwxNCAxMiwxNFoiLz4KPC9zdmc+Cjwvc3ZnPgo='

// 计算属性
const stats = computed(() => {
  const filteredMessages = getFilteredMessages()
  
  if (filteredMessages.length === 0) {
    return {
      totalMessages: 0,
      textMessages: 0,
      imageMessages: 0,
      fileMessages: 0,
      mostActiveHour: 0,
      mostActiveHourCount: 0,
      avgMessageLength: 0,
      messageFrequency: 0,
      userStats: [],
      keywords: [],
      hourlyDistribution: [],
      maxHourlyCount: 0
    }
  }
  
  // 基础统计
  const totalMessages = filteredMessages.length
  const textMessages = filteredMessages.filter(m => m.type === 'text').length
  const imageMessages = filteredMessages.filter(m => m.type === 'image').length
  const fileMessages = filteredMessages.filter(m => m.type === 'file').length
  
  // 时间分析
  const hourlyCount = new Array(24).fill(0)
  const userMessageCount = new Map<string, number>()
  const userInfo = new Map<string, any>()
  let totalTextLength = 0
  let textMessageCount = 0
  
  filteredMessages.forEach(msg => {
    const hour = new Date(msg.timestamp).getHours()
    hourlyCount[hour]++
    
    // 用户统计
    const userName = msg.sender || 'Unknown'
    userMessageCount.set(userName, (userMessageCount.get(userName) || 0) + 1)
    if (!userInfo.has(userName)) {
      userInfo.set(userName, {
        name: userName,
        avatar: msg.avatar,
        role: msg.role
      })
    }
    
    // 文本长度统计
    if (msg.type === 'text' && msg.content) {
      totalTextLength += msg.content.length
      textMessageCount++
    }
  })
  
  // 最活跃时段
  const maxHourlyCount = Math.max(...hourlyCount)
  const mostActiveHour = hourlyCount.indexOf(maxHourlyCount)
  
  // 用户参与度
  const userStats = Array.from(userMessageCount.entries())
    .map(([name, count]) => ({
      ...userInfo.get(name),
      messageCount: count,
      percentage: Math.round((count / totalMessages) * 100)
    }))
    .sort((a, b) => b.messageCount - a.messageCount)
    .slice(0, 10) // 只显示前10名
  
  // 关键词提取
  const keywords = extractKeywords(filteredMessages)
  
  // 24小时分布
  const hourlyDistribution = hourlyCount.map((count, hour) => ({
    hour,
    count
  }))
  
  // 消息频率计算
  const timeSpan = getTimeSpanHours()
  const messageFrequency = timeSpan > 0 ? Math.round((totalMessages / timeSpan) * 10) / 10 : 0
  
  return {
    totalMessages,
    textMessages,
    imageMessages,
    fileMessages,
    mostActiveHour,
    mostActiveHourCount: maxHourlyCount,
    avgMessageLength: textMessageCount > 0 ? Math.round(totalTextLength / textMessageCount) : 0,
    messageFrequency,
    userStats,
    keywords,
    hourlyDistribution,
    maxHourlyCount
  }
})

// 方法
const getFilteredMessages = () => {
  const now = new Date()
  const currentMessages = messages.value || []
  
  switch (timeRange.value) {
    case 'today':
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      return currentMessages.filter(m => new Date(m.timestamp) >= today)
    
    case 'week':
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return currentMessages.filter(m => new Date(m.timestamp) >= weekAgo)
    
    case 'month':
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
      return currentMessages.filter(m => new Date(m.timestamp) >= monthAgo)
    
    case 'all':
    default:
      return currentMessages
  }
}

const getTimeSpanHours = () => {
  const filteredMessages = getFilteredMessages()
  if (filteredMessages.length === 0) return 0
  
  const timestamps = filteredMessages.map(m => new Date(m.timestamp).getTime())
  const minTime = Math.min(...timestamps)
  const maxTime = Math.max(...timestamps)
  
  return (maxTime - minTime) / (1000 * 60 * 60) // 转换为小时
}

const extractKeywords = (messages: any[]) => {
  const wordCount = new Map<string, number>()
  const stopWords = new Set(['的', '了', '是', '在', '我', '你', '他', '她', '它', '这', '那', '有', '和', '与', '或', '但', '而', '就', '都', '也', '还', '只', '又', '再', '很', '更', '最', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'])
  
  messages
    .filter(m => m.type === 'text' && m.content)
    .forEach(m => {
      const words = m.content
        .toLowerCase()
        .replace(/[^\w\s\u4e00-\u9fff]/g, ' ') // 保留中文字符
        .split(/\s+/)
        .filter(word => word.length > 1 && !stopWords.has(word))
      
      words.forEach(word => {
        wordCount.set(word, (wordCount.get(word) || 0) + 1)
      })
    })
  
  return Array.from(wordCount.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20) // 只显示前20个关键词
}

const getKeywordSize = (count: number) => {
  if (count >= 10) return 'large'
  if (count >= 5) return 'medium'
  return 'small'
}

const exportStats = (format: 'json' | 'csv' | 'report') => {
  const currentStats = stats.value
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
  
  try {
    switch (format) {
      case 'json':
        exportJSON(currentStats, `message-stats-${timestamp}.json`)
        break
      case 'csv':
        exportCSV(currentStats, `message-stats-${timestamp}.csv`)
        break
      case 'report':
        exportReport(currentStats, `message-report-${timestamp}.html`)
        break
    }
    message.success(`${format.toUpperCase()} 导出成功`)
  } catch (error) {
    console.error('导出失败:', error)
    message.error('导出失败')
  }
}

const exportJSON = (data: any, filename: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  downloadFile(blob, filename)
}

const exportCSV = (data: any, filename: string) => {
  const csvContent = [
    ['指标', '数值'],
    ['总消息数', data.totalMessages],
    ['文本消息', data.textMessages],
    ['图片消息', data.imageMessages],
    ['文件消息', data.fileMessages],
    ['最活跃时段', `${data.mostActiveHour}:00`],
    ['平均消息长度', data.avgMessageLength],
    ['消息频率', data.messageFrequency]
  ].map(row => row.join(',')).join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
  downloadFile(blob, filename)
}

const exportReport = (data: any, filename: string) => {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>消息统计报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
        .stat-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
        .stat-value { font-size: 24px; font-weight: bold; color: #2080f0; }
        .stat-label { color: #666; margin-bottom: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>消息统计报告</h1>
        <p>生成时间: ${new Date().toLocaleString()}</p>
        <p>统计范围: ${timeRange.value === 'today' ? '今日' : timeRange.value === 'week' ? '本周' : timeRange.value === 'month' ? '本月' : '全部'}</p>
    </div>
    
    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-label">总消息数</div>
            <div class="stat-value">${data.totalMessages}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">文本消息</div>
            <div class="stat-value">${data.textMessages}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">图片消息</div>
            <div class="stat-value">${data.imageMessages}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">文件消息</div>
            <div class="stat-value">${data.fileMessages}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">最活跃时段</div>
            <div class="stat-value">${data.mostActiveHour}:00</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">平均消息长度</div>
            <div class="stat-value">${data.avgMessageLength} 字符</div>
        </div>
    </div>
</body>
</html>`
  
  const blob = new Blob([html], { type: 'text/html' })
  downloadFile(blob, filename)
}

const downloadFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 监听时间范围变化
watch(timeRange, () => {
  console.log(`📊 统计范围切换到: ${timeRange.value}`)
})

// 生命周期
onMounted(() => {
  console.log('📊 消息统计组件已加载')
})
</script>

<style scoped lang="scss">
.message-stats {
  .stats-content {
    .basic-stats {
      margin-bottom: 24px;
    }
    
    .activity-stats {
      margin-bottom: 24px;
      
      .stat-item {
        text-align: center;
        padding: 12px;
        border: 1px solid #f0f0f0;
        border-radius: 6px;
        
        .stat-label {
          font-size: 12px;
          color: #666;
          margin-bottom: 4px;
        }
        
        .stat-value {
          font-size: 20px;
          font-weight: 600;
          color: #333;
          margin-bottom: 4px;
        }
        
        .stat-desc {
          font-size: 11px;
          color: #999;
        }
      }
    }
    
    .user-stats {
      margin-bottom: 24px;
      
      .user-list {
        .user-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #f5f5f5;
          
          &:last-child {
            border-bottom: none;
          }
          
          .user-info {
            display: flex;
            align-items: center;
            gap: 8px;
            
            .user-details {
              .user-name {
                font-size: 14px;
                font-weight: 500;
                color: #333;
              }
              
              .user-role {
                font-size: 12px;
                color: #666;
              }
            }
          }
          
          .user-metrics {
            display: flex;
            align-items: center;
          }
        }
      }
    }
    
    .keyword-stats {
      margin-bottom: 24px;
      
      .keyword-cloud {
        line-height: 1.8;
      }
    }
    
    .time-distribution {
      margin-bottom: 24px;
      
      .hour-chart {
        display: flex;
        align-items: end;
        height: 100px;
        gap: 2px;
        padding: 10px 0;
        
        .hour-bar {
          flex: 1;
          background: linear-gradient(to top, #2080f0, #40a9ff);
          border-radius: 2px 2px 0 0;
          min-height: 4px;
          position: relative;
          cursor: pointer;
          transition: all 0.2s ease;
          
          &:hover {
            background: linear-gradient(to top, #1060c9, #2080f0);
          }
          
          .hour-label {
            position: absolute;
            bottom: -20px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 10px;
            color: #666;
          }
        }
      }
    }
    
    .export-actions {
      margin-top: 24px;
    }
  }
}

// 深度样式优化
:deep(.n-statistic) {
  .n-statistic-value {
    font-size: 24px;
    font-weight: 600;
  }
  
  .n-statistic-label {
    font-size: 12px;
    color: #666;
  }
}

:deep(.n-divider) {
  .n-divider__title {
    font-size: 14px;
    font-weight: 600;
    color: #333;
  }
}
</style>
