export interface Agent {
  id?: string
  name: string
  namespace: string
  status: 'running' | 'idle' | 'error' | 'Creating' | 'Terminating'
  role: string
  age?: string
  workDir?: string
  sessionName?: string
  restartCount?: number
  createdAt?: string
  updatedAt?: string
  avatar?: string
}

export interface CreateAgentRequest {
  name: string
  namespace: string
  role: string
  context?: string
  workDir?: string
  env?: string[]
}

export interface Role {
  name: string
  displayName: string
  description: string
  prompt: string
}

export interface RolesResponse {
  roles: Role[]
  total: number
}

export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  timestamp: string
  type: 'user' | 'agent' | 'system'
  status?: 'sending' | 'sent' | 'delivered' | 'error' | 'thinking'
  messageType?: 'text' | 'image' | 'file'
  imageUrl?: string
  imagePath?: string
  // 用于消息确认的临时ID
  tempId?: string
  // Agent提及信息
  mentionedAgents?: string[]
  // 对话ID，用于关联Agent思考状态
  conversationId?: string
  // 是否为思考状态消息
  isThinking?: boolean
  // 思考内容（用于流式更新）
  thinkingContent?: string
  // 是否需要替换思考消息（Agent最终回复时使用）
  replaceThinking?: boolean
}

export interface ChatSession {
  id: string
  title: string
  participants: Agent[]
  messages: ChatMessage[]
  createdAt: string
  lastActivity: string
}

export interface Project {
  id: string
  name: string
  description: string
  status: 'active' | 'inactive' | 'error'
  agents: Agent[]
  createdAt: string
}

  createdAt: string
}
