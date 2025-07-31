// 版本信息接口
export interface VersionInfo {
  version: string
  buildTime: string
  commitHash: string
  commitDate: string
  environment: string
}

// 远程版本信息接口
export interface RemoteVersionInfo {
  tag_name: string
  name: string
  published_at: string
  html_url: string
  body?: string
}

// 获取本地版本信息
export async function getLocalVersion(): Promise<VersionInfo | null> {
  try {
    // 动态导入版本信息文件
    const versionInfo = await import('../version.json')
    return versionInfo.default || versionInfo
  } catch (error) {
    console.warn('⚠️ 无法获取本地版本信息:', error)
    return null
  }
}

// 比较版本号
export function compareVersions(version1: string, version2: string): number {
  // 移除 'v' 前缀
  const v1 = version1.replace(/^v/, '')
  const v2 = version2.replace(/^v/, '')
  
  const parts1 = v1.split('.').map(Number)
  const parts2 = v2.split('.').map(Number)
  
  const maxLength = Math.max(parts1.length, parts2.length)
  
  for (let i = 0; i < maxLength; i++) {
    const part1 = parts1[i] || 0
    const part2 = parts2[i] || 0
    
    if (part1 > part2) return 1
    if (part1 < part2) return -1
  }
  
  return 0
}

// 检查GitHub远程版本
export async function checkRemoteVersion(
  owner: string = 'zhoushoujianwork',
  repo: string = 'GOQGO-WEB'
): Promise<RemoteVersionInfo | null> {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`)
    
    if (!response.ok) {
      throw new Error(`GitHub API请求失败: ${response.status}`)
    }
    
    const data: RemoteVersionInfo = await response.json()
    return data
  } catch (error) {
    console.warn('⚠️ 无法获取远程版本信息:', error)
    return null
  }
}

// 检查是否有新版本
export async function checkForUpdates(): Promise<{
  hasUpdate: boolean
  localVersion: string
  remoteVersion: string
  updateInfo?: RemoteVersionInfo
}> {
  const localInfo = await getLocalVersion()
  const remoteInfo = await checkRemoteVersion()
  
  if (!localInfo || !remoteInfo) {
    return {
      hasUpdate: false,
      localVersion: localInfo?.version || 'unknown',
      remoteVersion: remoteInfo?.tag_name || 'unknown'
    }
  }
  
  const comparison = compareVersions(remoteInfo.tag_name, localInfo.version)
  
  return {
    hasUpdate: comparison > 0,
    localVersion: localInfo.version,
    remoteVersion: remoteInfo.tag_name,
    updateInfo: comparison > 0 ? remoteInfo : undefined
  }
}

// 格式化版本显示
export function formatVersionDisplay(versionInfo: VersionInfo): string {
  const isDev = versionInfo.environment === 'development'
  const baseVersion = versionInfo.version
  
  if (isDev) {
    return `${baseVersion}-beta.${versionInfo.commitHash}`
  }
  
  return baseVersion
}

// 格式化构建时间
export function formatBuildTime(buildTime: string): string {
  const date = new Date(buildTime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
