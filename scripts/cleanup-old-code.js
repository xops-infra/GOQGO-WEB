#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

console.log('🧹 开始清理旧代码和测试文件...')

// 需要清理的文件模式
const cleanupPatterns = [
  /Test\.vue$/,
  /Debug\.vue$/,
  /test\.vue$/,
  /debug\.vue$/,
  /\.bak$/,
  /\.tmp$/,
  /\.orig$/,
  /~$/
]

// 需要清理的目录
const cleanupDirs = [
  'src/views',
  'src/components',
  'src/composables',
  'src/utils'
]

let cleanedFiles = 0

function cleanDirectory(dir) {
  if (!fs.existsSync(dir)) {
    return
  }

  const files = fs.readdirSync(dir, { withFileTypes: true })
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name)
    
    if (file.isDirectory()) {
      cleanDirectory(fullPath)
    } else {
      // 检查是否匹配清理模式
      const shouldClean = cleanupPatterns.some(pattern => pattern.test(file.name))
      
      if (shouldClean) {
        console.log(`🗑️  删除文件: ${fullPath}`)
        fs.unlinkSync(fullPath)
        cleanedFiles++
      }
    }
  }
}

// 执行清理
for (const dir of cleanupDirs) {
  cleanDirectory(dir)
}

// 检查空目录并删除
function removeEmptyDirs(dir) {
  if (!fs.existsSync(dir)) {
    return
  }

  const files = fs.readdirSync(dir)
  
  if (files.length === 0) {
    console.log(`📁 删除空目录: ${dir}`)
    fs.rmdirSync(dir)
    return
  }

  for (const file of files) {
    const fullPath = path.join(dir, file)
    if (fs.statSync(fullPath).isDirectory()) {
      removeEmptyDirs(fullPath)
    }
  }

  // 再次检查是否为空
  const remainingFiles = fs.readdirSync(dir)
  if (remainingFiles.length === 0) {
    console.log(`📁 删除空目录: ${dir}`)
    fs.rmdirSync(dir)
  }
}

// 清理空目录
for (const dir of cleanupDirs) {
  removeEmptyDirs(dir)
}

console.log(`✅ 清理完成！共删除 ${cleanedFiles} 个文件`)

// 生成清理报告
const report = {
  timestamp: new Date().toISOString(),
  cleanedFiles: cleanedFiles,
  cleanupPatterns: cleanupPatterns.map(p => p.toString()),
  cleanupDirs: cleanupDirs
}

fs.writeFileSync('cleanup-report.json', JSON.stringify(report, null, 2))
console.log('📋 清理报告已生成: cleanup-report.json')
