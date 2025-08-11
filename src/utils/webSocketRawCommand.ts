// WebSocket 原始命令管理器
export interface RawCommandResult {
  commandId: string
  success: boolean
  message: string
  agentName: string
  error?: string
}

export interface RawCommandCallbacks {
  onResult?: (result: RawCommandResult) => void
  onError?: (error: string) => void
  onConnect?: () => void
  onDisconnect?: () => void
}

export class WebSocketRawCommand {
  private ws: WebSocket | null = null
  private namespace: string
  private callbacks: RawCommandCallbacks = {}
  private pendingCommands = new Map<string, any>()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectInterval = 1000

  constructor(namespace: string, callbacks: RawCommandCallbacks = {}) {
    this.namespace = namespace
    this.callbacks = callbacks
  }

  // 连接 WebSocket
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const token = localStorage.getItem('goqgo_token')
        if (!token) {
          throw new Error('未找到认证token')
        }

        // 构建 WebSocket URL
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        const wsUrl = `${wsProtocol}//${window.location.host}/ws/namespaces/${this.namespace}/chat?token=${encodeURIComponent(token)}`
        
        console.log('🔗 连接 WebSocket Raw Command:', wsUrl.replace(token, '***TOKEN***'))

        this.ws = new WebSocket(wsUrl)

        this.ws.onopen = () => {
          console.log('✅ WebSocket Raw Command 连接成功')
          this.reconnectAttempts = 0
          this.callbacks.onConnect?.()
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data)
            this.handleMessage(message)
          } catch (error) {
            console.error('❌ 解析 WebSocket 消息失败:', error)
          }
        }

        this.ws.onclose = (event) => {
          console.log('🔌 WebSocket Raw Command 连接关闭:', event.code, event.reason)
          this.callbacks.onDisconnect?.()
          this.handleReconnect()
        }

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket Raw Command 错误:', error)
          this.callbacks.onError?.('WebSocket 连接错误')
          reject(error)
        }

      } catch (error) {
        console.error('❌ 创建 WebSocket Raw Command 失败:', error)
        reject(error)
      }
    })
  }

  // 处理消息
  private handleMessage(message: any) {
    if (message.type === 'raw_command_result') {
      const result = message.data as RawCommandResult
      console.log('📨 收到命令执行结果:', result)
      
      // 移除待处理命令
      this.pendingCommands.delete(result.commandId)
      
      // 调用回调
      this.callbacks.onResult?.(result)
    }
  }

  // 发送原始命令
  sendRawCommand(agentName: string, command: string, options: { agentUsername?: string, instanceName?: string } = {}): string {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket 未连接')
    }

    const commandId = `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const message = {
      type: "raw_command",
      data: {
        agentName,
        command,
        commandId,
        ...options
      },
      timestamp: new Date().toISOString(),
      from: "frontend-client"
    }

    console.log('📤 发送原始命令:', { agentName, command, commandId })
    
    // 记录待处理命令
    this.pendingCommands.set(commandId, {
      agentName,
      command,
      timestamp: Date.now(),
      ...options
    })

    this.ws.send(JSON.stringify(message))
    return commandId
  }

  // 取消命令
  cancelCommand(commandId: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket 未连接')
    }

    const message = {
      type: "raw_command_cancel",
      data: { commandId },
      timestamp: new Date().toISOString(),
      from: "frontend-client"
    }

    console.log('🚫 取消命令:', commandId)
    this.ws.send(JSON.stringify(message))
    
    // 移除待处理命令
    this.pendingCommands.delete(commandId)
  }

  // 处理重连
  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`🔄 尝试重连 WebSocket Raw Command (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      
      setTimeout(() => {
        this.connect().catch(error => {
          console.error('❌ 重连失败:', error)
        })
      }, this.reconnectInterval * this.reconnectAttempts)
    } else {
      console.error('❌ 达到最大重连次数，停止重连')
    }
  }

  // 断开连接
  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.pendingCommands.clear()
  }

  // 获取连接状态
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  // 获取待处理命令数量
  get pendingCommandsCount(): number {
    return this.pendingCommands.size
  }
}
