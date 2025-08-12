// WebSocket 连接监控工具
export interface ConnectionStatus {
  id: string
  url: string
  status: 'connecting' | 'open' | 'closing' | 'closed'
  readyState: number
  timestamp: number
  error?: string
}

export interface ConnectionSummary {
  totalConnections: number
  activeConnections: number
  pendingConnections: number
  failedConnections: number
  connections: ConnectionStatus[]
}

class WebSocketConnectionMonitor {
  private connections = new Map<string, ConnectionStatus>()
  private static instance: WebSocketConnectionMonitor | null = null

  private constructor() {
    // 监听页面卸载，清理监控数据
    window.addEventListener('beforeunload', () => {
      this.clearAll()
    })
  }

  static getInstance(): WebSocketConnectionMonitor {
    if (!this.instance) {
      this.instance = new WebSocketConnectionMonitor()
    }
    return this.instance
  }

  // 注册连接
  registerConnection(id: string, url: string): void {
    const connection: ConnectionStatus = {
      id,
      url: this.sanitizeUrl(url),
      status: 'connecting',
      readyState: WebSocket.CONNECTING,
      timestamp: Date.now()
    }

    this.connections.set(id, connection)
    console.log(`[WebSocket] 🔍 [监控] 注册连接: ${id}`, connection)
  }

  // 更新连接状态
  updateConnectionStatus(id: string, status: 'connecting' | 'open' | 'closing' | 'closed', readyState?: number, error?: string): void {
    const connection = this.connections.get(id)
    if (connection) {
      connection.status = status
      connection.readyState = readyState ?? connection.readyState
      connection.error = error
      connection.timestamp = Date.now()

      console.log(`[WebSocket] 🔍 [监控] 更新连接状态: ${id}`, {
        status,
        readyState: readyState ?? connection.readyState,
        error
      })
    }
  }

  // 移除连接
  removeConnection(id: string): void {
    if (this.connections.delete(id)) {
      console.log(`[WebSocket] 🔍 [监控] 移除连接: ${id}`)
    }
  }

  // 获取连接摘要
  getConnectionSummary(): ConnectionSummary {
    const connections = Array.from(this.connections.values())
    const now = Date.now()
    const timeout = 30000 // 30秒超时

    const summary: ConnectionSummary = {
      totalConnections: connections.length,
      activeConnections: connections.filter(c => c.status === 'open').length,
      pendingConnections: connections.filter(c => 
        c.status === 'connecting' && (now - c.timestamp) < timeout
      ).length,
      failedConnections: connections.filter(c => 
        c.status === 'connecting' && (now - c.timestamp) >= timeout
      ).length,
      connections: [...connections]
    }

    return summary
  }

  // 诊断连接问题
  diagnoseConnections(): string[] {
    const issues: string[] = []
    const summary = this.getConnectionSummary()

    // 检查pending连接
    if (summary.pendingConnections > 1) {
      issues.push(`⚠️ 发现 ${summary.pendingConnections} 个pending连接，可能存在重复连接问题`)
    }

    // 检查超时的连接
    if (summary.failedConnections > 0) {
      issues.push(`❌ 发现 ${summary.failedConnections} 个超时连接，建议检查网络或服务器状态`)
    }

    // 检查连接数量
    if (summary.totalConnections > 3) {
      issues.push(`🔍 总连接数过多 (${summary.totalConnections})，可能存在连接泄漏`)
    }

    // 检查具体连接状态
    this.connections.forEach((conn, id) => {
      if (conn.status === 'connecting' && (Date.now() - conn.timestamp) > 10000) {
        issues.push(`⏰ 连接 ${id} 长时间处于connecting状态 (${Math.round((Date.now() - conn.timestamp) / 1000)}s)`)
      }
    })

    return issues
  }

  // 清理超时连接
  cleanupTimeoutConnections(): void {
    const now = Date.now()
    const timeout = 60000 // 1分钟超时

    for (const [id, connection] of this.connections.entries()) {
      if (connection.status === 'connecting' && (now - connection.timestamp) > timeout) {
        console.log(`[WebSocket] 🧹 [监控] 清理超时连接: ${id}`)
        this.connections.delete(id)
      }
    }
  }

  // 清理所有连接
  clearAll(): void {
    this.connections.clear()
    console.log('[WebSocket] 🧹 [监控] 清理所有连接监控数据')
  }

  // 清理URL中的敏感信息
  private sanitizeUrl(url: string): string {
    try {
      const urlObj = new URL(url)
      if (urlObj.searchParams.has('token')) {
        urlObj.searchParams.set('token', '***TOKEN***')
      }
      return urlObj.toString()
    } catch {
      // 如果URL解析失败，简单替换token
      return url.replace(/token=[^&]+/, 'token=***TOKEN***')
    }
  }

  // 获取详细连接信息
  getDetailedInfo(): string {
    const summary = this.getConnectionSummary()
    const issues = this.diagnoseConnections()
    
    let info = `🔍 WebSocket 连接监控报告\n`
    info += `总连接数: ${summary.totalConnections}\n`
    info += `活跃连接: ${summary.activeConnections}\n`
    info += `等待连接: ${summary.pendingConnections}\n`
    info += `失败连接: ${summary.failedConnections}\n\n`

    if (issues.length > 0) {
      info += `⚠️ 发现的问题:\n`
      issues.forEach(issue => {
        info += `  ${issue}\n`
      })
      info += `\n`
    }

    info += `📋 连接详情:\n`
    this.connections.forEach((conn, id) => {
      const duration = Math.round((Date.now() - conn.timestamp) / 1000)
      info += `  ${id}: ${conn.status} (${duration}s) - ${conn.url}\n`
    })

    return info
  }
}

// 导出单例实例
export const connectionMonitor = WebSocketConnectionMonitor.getInstance()

// 导出便捷函数
export function monitorWebSocketConnection(id: string, url: string) {
  connectionMonitor.registerConnection(id, url)
}

export function updateWebSocketStatus(id: string, status: 'connecting' | 'open' | 'closing' | 'closed', readyState?: number, error?: string) {
  connectionMonitor.updateConnectionStatus(id, status, readyState, error)
}

export function getWebSocketSummary() {
  return connectionMonitor.getConnectionSummary()
}

export function diagnoseWebSocketIssues() {
  return connectionMonitor.diagnoseConnections()
}

export function getWebSocketDiagnosticInfo() {
  return connectionMonitor.getDetailedInfo()
}
