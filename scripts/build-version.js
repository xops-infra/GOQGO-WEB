#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 获取当前Git标签版本
function getCurrentVersion() {
  try {
    // 尝试获取最新的git tag（按版本排序）
    const tag = execSync('git tag -l --sort=-version:refname | head -1', { encoding: 'utf8' }).trim()
    if (tag) {
      return tag
    }
    
    // 如果没有标签，尝试使用 git describe
    const describedTag = execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim()
    return describedTag
  } catch (error) {
    console.warn('⚠️ 未找到Git标签，使用package.json版本')
    // 如果没有标签，使用package.json的版本
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'))
    return `v${packageJson.version}`
  }
}

// 获取Git提交信息
function getCommitInfo() {
  try {
    const hash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()
    const date = execSync('git log -1 --format=%cd --date=short', { encoding: 'utf8' }).trim()
    return { hash, date }
  } catch (error) {
    return { hash: 'unknown', date: new Date().toISOString().split('T')[0] }
  }
}

// 生成版本信息文件
function generateVersionInfo() {
  const version = getCurrentVersion()
  const { hash, date } = getCommitInfo()
  
  const versionInfo = {
    version,
    buildTime: new Date().toISOString(),
    commitHash: hash,
    commitDate: date,
    environment: process.env.NODE_ENV || 'development'
  }

  // 写入版本信息文件
  const versionPath = path.join(__dirname, '../src/version.json')
  fs.writeFileSync(versionPath, JSON.stringify(versionInfo, null, 2))
  
  console.log('✅ 版本信息生成成功:')
  console.log(`   版本: ${version}`)
  console.log(`   构建时间: ${versionInfo.buildTime}`)
  console.log(`   提交: ${hash} (${date})`)
  console.log(`   环境: ${versionInfo.environment}`)
  
  return versionInfo
}

// 更新HTML模板中的版本信息
function updateHtmlTemplate(versionInfo) {
  const indexPath = path.join(__dirname, '../index.html')
  
  if (fs.existsSync(indexPath)) {
    let html = fs.readFileSync(indexPath, 'utf8')
    
    // 替换版本信息占位符
    html = html.replace(
      /<span class="version-info">Version:[^<]*<\/span>/g,
      `<span class="version-info">Version:${versionInfo.version}</span>`
    )
    
    fs.writeFileSync(indexPath, html)
    console.log('✅ HTML模板版本信息已更新')
  }
}

// 主函数
function main() {
  console.log('🔧 开始生成版本信息...')
  
  try {
    const versionInfo = generateVersionInfo()
    updateHtmlTemplate(versionInfo)
    
    console.log('🎉 版本信息构建完成!')
  } catch (error) {
    console.error('❌ 版本信息构建失败:', error.message)
    process.exit(1)
  }
}

// 运行主函数
main()
