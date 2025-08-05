#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

const log = (color, message) => {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// 重构任务配置
const REFACTOR_TASKS = [
  {
    id: 'TODO-001',
    title: '创建统一布局系统',
    phase: 1,
    priority: 'high',
    files: [
      'src/layouts/BaseLayout.vue',
      'src/layouts/components/AppHeader.vue',
      'src/layouts/components/AppSidebar.vue',
      'src/layouts/components/AppFooter.vue',
      'src/composables/useLayout.ts'
    ],
    status: 'in-progress'
  },
  {
    id: 'TODO-002',
    title: 'Layout.vue 重构',
    phase: 1,
    priority: 'high',
    files: [
      'src/layouts/MainLayout.vue',
      'src/layouts/components/MainHeader.vue',
      'src/layouts/components/MainSidebar.vue',
      'src/components/AgentListItem.vue',
      'src/components/ConnectionStatus.vue'
    ],
    targetLines: 500,
    currentLines: 1343,
    status: 'in-progress'
  },
  {
    id: 'TODO-003',
    title: 'AgentLogsModal.vue 重构',
    phase: 2,
    priority: 'high',
    files: [
      'src/components/AgentLogsModalNew.vue',
      'src/composables/useAgentLogs.ts',
      'src/components/logs/LogsModalContainer.vue',
      'src/components/logs/LogsModalHeader.vue',
      'src/components/logs/LogsContent.vue',
      'src/components/logs/LogsModalFooter.vue'
    ],
    targetLines: 500,
    currentLines: 1506,
    status: 'in-progress'
  },
  {
    id: 'TODO-004',
    title: 'ChatInput.vue 重构',
    phase: 2,
    priority: 'high',
    files: [
      'src/components/ChatInputNew.vue',
      'src/composables/useChatInput.ts',
      'src/components/chat-input/MentionSelector.vue',
      'src/components/chat-input/DragOverlay.vue',
      'src/components/chat-input/InputToolbar.vue',
      'src/components/chat-input/MessageEditor.vue',
      'src/components/chat-input/SendArea.vue'
    ],
    targetLines: 500,
    currentLines: 1385,
    status: 'in-progress'
  },
  {
    id: 'TODO-005',
    title: 'AgentsView.vue 重构',
    phase: 2,
    priority: 'medium',
    files: [
      'src/views/AgentsViewNew.vue',
      'src/composables/useAgentsView.ts',
      'src/views/agents/AgentsStatsSection.vue',
      'src/views/agents/AgentsFilterSection.vue',
      'src/views/agents/AgentsListSection.vue',
      'src/views/agents/AgentCard.vue'
    ],
    targetLines: 500,
    currentLines: 1003,
    status: 'in-progress'
  },
  {
    id: 'TODO-006',
    title: 'ChatRoom.vue 优化',
    phase: 3,
    priority: 'medium',
    files: [
      'src/components/ChatRoomNew.vue',
      'src/composables/useChatRoom.ts',
      'src/components/chat-room/ChatDragOverlay.vue',
      'src/components/chat-room/MessagesContainer.vue',
      'src/components/chat-room/MessagesToolbar.vue'
    ],
    targetLines: 500,
    currentLines: 929,
    status: 'in-progress'
  },
  {
    id: 'TODO-007',
    title: 'NamespaceManager.vue 优化',
    phase: 3,
    priority: 'medium',
    files: [
      'src/components/NamespaceManagerNew.vue',
      'src/composables/useNamespaceManager.ts',
      'src/components/namespace/NamespaceSelector.vue',
      'src/components/namespace/CreateNamespaceModal.vue'
    ],
    targetLines: 500,
    currentLines: 927,
    status: 'in-progress'
  },
  {
    id: 'TODO-008',
    title: 'Store 重构',
    phase: 4,
    priority: 'low',
    files: [
      'src/stores/chatNew.ts',
      'src/composables/useChatConnection.ts',
      'src/composables/useChatMessages.ts',
      'src/composables/useChatUsers.ts'
    ],
    targetLines: 600,
    currentLines: 870,
    status: 'in-progress'
  },
  {
    id: 'TODO-009',
    title: '页面组件优化',
    phase: 4,
    priority: 'low',
    files: [
      'src/views/LoginViewNew.vue',
      'src/composables/useLogin.ts',
      'src/views/login/LoginBrandSection.vue',
      'src/views/login/FeatureItem.vue'
    ],
    targetLines: 500,
    currentLines: 732,
    status: 'in-progress'
  }
]

// 获取文件行数
function getFileLines(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return 0
    }
    const content = fs.readFileSync(filePath, 'utf8')
    return content.split('\n').length
  } catch (error) {
    return 0
  }
}

// 检查文件是否存在
function checkFileExists(filePath) {
  return fs.existsSync(filePath)
}

// 获取Git提交信息
function getGitInfo() {
  try {
    const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim()
    const commit = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()
    const status = execSync('git status --porcelain', { encoding: 'utf8' }).trim()
    return { branch, commit, hasChanges: status.length > 0 }
  } catch (error) {
    return { branch: 'unknown', commit: 'unknown', hasChanges: false }
  }
}

// 计算任务进度
function calculateTaskProgress(task) {
  if (task.files.length === 0) return 0
  
  let completedFiles = 0
  let totalProgress = 0
  
  task.files.forEach(filePath => {
    if (checkFileExists(filePath)) {
      completedFiles++
      
      if (task.targetLines && task.currentLines) {
        const currentLines = getFileLines(filePath)
        const reduction = Math.max(0, task.currentLines - currentLines)
        const targetReduction = task.currentLines - task.targetLines
        const progress = Math.min(100, (reduction / targetReduction) * 100)
        totalProgress += progress
      } else {
        totalProgress += 100
      }
    }
  })
  
  return Math.round(totalProgress / task.files.length)
}

// 生成进度报告
function generateProgressReport() {
  const gitInfo = getGitInfo()
  
  log('cyan', '🚀 GoQGo Web 重构进度报告')
  log('cyan', '=' .repeat(50))
  
  // Git信息
  log('blue', `📋 Git信息:`)
  log('reset', `   分支: ${gitInfo.branch}`)
  log('reset', `   提交: ${gitInfo.commit}`)
  log('reset', `   状态: ${gitInfo.hasChanges ? '有未提交更改' : '工作区干净'}`)
  console.log()
  
  // 按阶段分组
  const phases = {}
  REFACTOR_TASKS.forEach(task => {
    if (!phases[task.phase]) {
      phases[task.phase] = []
    }
    phases[task.phase].push(task)
  })
  
  let totalTasks = 0
  let completedTasks = 0
  let inProgressTasks = 0
  
  Object.keys(phases).sort().forEach(phase => {
    log('magenta', `📦 Phase ${phase}:`)
    
    phases[phase].forEach(task => {
      const progress = calculateTaskProgress(task)
      const statusIcon = {
        'completed': '✅',
        'in-progress': '🔄',
        'pending': '⏳',
        'blocked': '🚫'
      }[task.status] || '❓'
      
      const priorityColor = {
        'high': 'red',
        'medium': 'yellow',
        'low': 'green'
      }[task.priority] || 'reset'
      
      log('reset', `   ${statusIcon} ${task.id}: ${task.title}`)
      log(priorityColor, `      优先级: ${task.priority.toUpperCase()}`)
      log('reset', `      进度: ${progress}%`)
      
      // 显示文件状态
      task.files.forEach(filePath => {
        const exists = checkFileExists(filePath)
        const lines = exists ? getFileLines(filePath) : 0
        const fileStatus = exists ? '✅' : '❌'
        
        log('reset', `      ${fileStatus} ${filePath} ${exists ? `(${lines} 行)` : '(不存在)'}`)
        
        if (task.targetLines && exists && lines > task.targetLines) {
          const excess = lines - task.targetLines
          log('yellow', `         ⚠️  超出目标 ${excess} 行`)
        }
      })
      
      totalTasks++
      if (task.status === 'completed') completedTasks++
      if (task.status === 'in-progress') inProgressTasks++
      
      console.log()
    })
  })
  
  // 总体进度
  log('cyan', '📊 总体进度:')
  log('green', `   已完成: ${completedTasks}/${totalTasks} (${Math.round(completedTasks/totalTasks*100)}%)`)
  log('yellow', `   进行中: ${inProgressTasks}`)
  log('red', `   待开始: ${totalTasks - completedTasks - inProgressTasks}`)
  
  // 代码行数统计
  log('cyan', '📏 代码行数统计:')
  let totalCurrentLines = 0
  let totalTargetLines = 0
  let totalActualLines = 0
  
  REFACTOR_TASKS.forEach(task => {
    if (task.currentLines && task.targetLines) {
      totalCurrentLines += task.currentLines
      totalTargetLines += task.targetLines
      
      task.files.forEach(filePath => {
        if (checkFileExists(filePath)) {
          totalActualLines += getFileLines(filePath)
        }
      })
    }
  })
  
  const reduction = totalCurrentLines - totalActualLines
  const targetReduction = totalCurrentLines - totalTargetLines
  const reductionProgress = targetReduction > 0 ? Math.round((reduction / targetReduction) * 100) : 0
  
  log('reset', `   原始总行数: ${totalCurrentLines}`)
  log('reset', `   当前总行数: ${totalActualLines}`)
  log('reset', `   目标总行数: ${totalTargetLines}`)
  log('green', `   已减少行数: ${reduction} (${reductionProgress}%)`)
  
  console.log()
  
  // 下一步建议
  log('cyan', '🎯 下一步建议:')
  const nextTasks = REFACTOR_TASKS
    .filter(task => task.status === 'pending')
    .sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
    .slice(0, 3)
  
  nextTasks.forEach((task, index) => {
    log('yellow', `   ${index + 1}. ${task.title} (${task.priority} 优先级)`)
  })
  
  console.log()
  log('cyan', '生成时间: ' + new Date().toLocaleString('zh-CN'))
}

// 主函数
function main() {
  const args = process.argv.slice(2)
  const command = args[0] || 'report'
  
  switch (command) {
    case 'report':
      generateProgressReport()
      break
    default:
      log('red', '❌ 未知命令')
      log('cyan', '可用命令:')
      log('reset', '  report - 生成进度报告')
      process.exit(1)
  }
}

// 运行
main()
