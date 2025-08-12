// WebSocket Agent 状态通知服务
import type { Agent } from '@/api/agents'

export interface AgentStatusCallbacks {
  onAgentCreated?: (agent: Agent) => void
  onAgentUpdated?: (agent: Agent) => void
  onAgentDeleted?: (agentName: string) => void
  onAgentRestarted?: (agent: Agent) => void
  onAgentStatusChanged?: (agentName: string, status: string) => void
  onAgentListUpdated?: (agents: Agent[]) => void
  onError?: (error: string) => void
}

class WebSocketAgentStatusService {
  private callbacks: AgentStatusCallbacks = {}
  private isInitialized = false

  // 初始化状态通知服务
  async initialize(namespace: string, callbacks: AgentStatusCallbacks = {}) {
    if (this.isInitialized) {
      return
    }

    this.callbacks = callbacks
    this.isInitialized = true
    console.log('✅ Agent 状态通知服务初始化完成 (WebSocket功能已禁用)')
  }

  // 清理服务
  cleanup() {
    this.callbacks = {}
    this.isInitialized = false
    console.log('🧹 WebSocket Agent 状态通知服务已清理')
  }

  // 获取初始化状态
  get initialized(): boolean {
    return this.isInitialized
  }
}

// 导出单例实例
export const webSocketAgentStatusService = new WebSocketAgentStatusService()

// 便捷函数
export async function initializeAgentStatusService(namespace: string, callbacks: AgentStatusCallbacks = {}) {
  return webSocketAgentStatusService.initialize(namespace, callbacks)
}

export function cleanupAgentStatusService() {
  webSocketAgentStatusService.cleanup()
}
