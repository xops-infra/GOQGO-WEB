/**
 * Agent对话相关的类型定义
 */

// WebSocket消息类型枚举
export enum WSMessageType {
  AGENT_THINKING_STREAM = 'agent_thinking_stream',
  AGENT_REPLY = 'agent_reply',
  CONVERSATION_STATUS_UPDATE = 'conversation_status_update',
  AGENT_STATUS_CHANGE = 'agent_status_change'
}

// Agent提及信息
export interface AgentMention {
  fullMatch: string
  agentName: string
  namespace: string
  startIndex: number
  endIndex: number
}

// 对话状态
export interface ConversationState {
  conversationId: string
  agentName: string
  namespace: string
  status: 'thinking' | 'completed' | 'timeout' | 'error'
  createdAt: string
  timeoutAt: string
  thinkingContent: string
  finalContent?: string
  messageId?: string
  startTime: number
  duration?: number
  error?: string
}

// 消息状态
export interface MessageState {
  messageId: string
  status: 'thinking' | 'completed' | 'timeout' | 'error'
  thinkingContent: string
  startTime: number
  conversationId: string
}

// WebSocket消息接口
export interface WSMessage {
  type: string
  data: any
  timestamp: string
  from: string
}

// Agent思考流消息数据
export interface AgentThinkingStreamData {
  conversationId: string
  content: string
  agentName: string
  namespace: string
  timestamp: string
}

// Agent回复消息数据
export interface AgentReplyData {
  conversationId: string
  content: string
  agentName: string
  namespace: string
  replaceThinking: boolean
  timestamp: string
}

// 对话状态更新数据
export interface ConversationStatusUpdateData {
  conversationId: string
  newStatus: 'thinking' | 'completed' | 'timeout' | 'error'
  reason?: string
  timestamp: string
}

// Agent状态变化数据
export interface AgentStatusChangeData {
  agentName: string
  namespace: string
  oldStatus: string
  newStatus: string
  reason?: string
  timestamp: string
}

// 发送消息请求
export interface SendMessageRequest {
  content: string
  type: 'user'
  mentionedAgents?: string[]
  conversationId?: string
}

// 扩展的ChatMessage类型
export interface ExtendedChatMessage {
  id: string
  content: string
  type: 'user' | 'agent' | 'system'
  username: string
  timestamp: string
  conversationId?: string
  status?: 'thinking' | 'completed' | 'timeout' | 'error'
  isThinking?: boolean
  replaceThinking?: boolean
  thinkingContent?: string
  agentName?: string
  namespace?: string
  duration?: number
  error?: string
}
