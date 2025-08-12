/**
 * WebSocket连接管理器
 * 统一管理所有WebSocket连接，确保退出登录时能正确断开所有连接
 */
export class WebSocketConnectionManager {
  private static instance: WebSocketConnectionManager
  private connections: Map<string, any> = new Map()
  private connectionTypes: Set<string> = new Set()

  private constructor() {}

  static getInstance(): WebSocketConnectionManager {
    if (!WebSocketConnectionManager.instance) {
      WebSocketConnectionManager.instance = new WebSocketConnectionManager()
    }
    return WebSocketConnectionManager.instance
  }

  /**
   * 注册WebSocket连接
   */
  registerConnection(type: string, key: string, connection: any): void {
    const connectionId = `${type}:${key}`
    this.connections.set(connectionId, connection)
    this.connectionTypes.add(type)
    
    console.log(`[WebSocket] 📝 注册连接: ${connectionId}`)
  }

  /**
   * 注销WebSocket连接
   */
  unregisterConnection(type: string, key: string): void {
    const connectionId = `${type}:${key}`
    this.connections.delete(connectionId)
    
    console.log(`[WebSocket] 📝 注销连接: ${connectionId}`)
  }

  /**
   * 获取指定类型的连接
   */
  getConnectionsByType(type: string): Map<string, any> {
    const typeConnections = new Map()
    
    for (const [connectionId, connection] of this.connections.entries()) {
      if (connectionId.startsWith(`${type}:`)) {
        const key = connectionId.substring(type.length + 1)
        typeConnections.set(key, connection)
      }
    }
    
    return typeConnections
  }

  /**
   * 断开所有WebSocket连接
   */
  disconnectAll(): void {
    console.log(`[WebSocket] 🔌 开始断开所有连接，共 ${this.connections.size} 个连接`)
    
    const disconnectPromises: Promise<void>[] = []
    
    for (const [connectionId, connection] of this.connections.entries()) {
      try {
        if (connection && typeof connection.disconnect === 'function') {
          console.log(`[WebSocket] 🔌 断开连接: ${connectionId}`)
          
          const disconnectPromise = Promise.resolve().then(() => {
            try {
              connection.disconnect()
              console.log(`[WebSocket] ✅ 连接已断开: ${connectionId}`)
            } catch (error) {
              console.warn(`[WebSocket] ⚠️ 断开连接失败: ${connectionId}`, error)
            }
          })
          
          disconnectPromises.push(disconnectPromise)
        } else {
          console.warn(`[WebSocket] ⚠️ 连接对象无效或缺少disconnect方法: ${connectionId}`)
        }
      } catch (error) {
        console.error(`[WebSocket] ❌ 处理连接时出错: ${connectionId}`, error)
      }
    }
    
    // 等待所有断开操作完成
    Promise.all(disconnectPromises).then(() => {
      console.log(`[WebSocket] ✅ 所有连接断开完成`)
      this.connections.clear()
      this.connectionTypes.clear()
    }).catch((error) => {
      console.error(`[WebSocket] ❌ 断开连接过程中出现错误:`, error)
    })
  }

  /**
   * 断开指定类型的连接
   */
  disconnectByType(type: string): void {
    const typeConnections = this.getConnectionsByType(type)
    console.log(`[WebSocket] 🔌 开始断开类型 ${type} 的连接，共 ${typeConnections.size} 个`)
    
    for (const [key, connection] of typeConnections.entries()) {
      try {
        if (connection && typeof connection.disconnect === 'function') {
          console.log(`[WebSocket] 🔌 断开连接: ${type}:${key}`)
          connection.disconnect()
          this.connections.delete(`${type}:${key}`)
        }
      } catch (error) {
        console.error(`[WebSocket] ❌ 断开连接失败: ${type}:${key}`, error)
      }
    }
    
    console.log(`[WebSocket] ✅ 类型 ${type} 的连接断开完成`)
  }

  /**
   * 获取连接统计信息
   */
  getConnectionStats(): {
    totalConnections: number
    connectionTypes: string[]
    connectionsByType: Record<string, number>
  } {
    const stats = {
      totalConnections: this.connections.size,
      connectionTypes: Array.from(this.connectionTypes),
      connectionsByType: {} as Record<string, number>
    }
    
    for (const type of this.connectionTypes) {
      const typeConnections = this.getConnectionsByType(type)
      stats.connectionsByType[type] = typeConnections.size
    }
    
    return stats
  }

  /**
   * 检查是否有活跃连接
   */
  hasActiveConnections(): boolean {
    return this.connections.size > 0
  }

  /**
   * 清理无效连接
   */
  cleanupInvalidConnections(): void {
    const invalidConnections: string[] = []
    
    for (const [connectionId, connection] of this.connections.entries()) {
      if (!connection || typeof connection.disconnect !== 'function') {
        invalidConnections.push(connectionId)
      }
    }
    
    if (invalidConnections.length > 0) {
      console.log(`[WebSocket] 🧹 清理 ${invalidConnections.length} 个无效连接`)
      
      for (const connectionId of invalidConnections) {
        this.connections.delete(connectionId)
        console.log(`[WebSocket] 🗑️ 清理无效连接: ${connectionId}`)
      }
    }
  }
}

// 导出单例实例
export const webSocketConnectionManager = WebSocketConnectionManager.getInstance()

// 导出便捷方法
export const registerWebSocketConnection = (type: string, key: string, connection: any) => 
  webSocketConnectionManager.registerConnection(type, key, connection)

export const unregisterWebSocketConnection = (type: string, key: string) => 
  webSocketConnectionManager.unregisterConnection(type, key)

export const disconnectAllWebSockets = () => webSocketConnectionManager.disconnectAll()
export const disconnectWebSocketsByType = (type: string) => webSocketConnectionManager.disconnectByType(type)
export const getWebSocketStats = () => webSocketConnectionManager.getConnectionStats()
