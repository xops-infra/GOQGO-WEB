// 用户相关类型
export interface User {
  id: string
  username: string
  displayName?: string  // 用户显示名称，优先于username显示
  email: string
  role: 'admin' | 'user' | 'developer' | 'viewer'
  avatar?: string
  createdAt: string
  updatedAt: string
}

// Agent相关类型
export interface Agent {
  id?: string
  name: string
  user?: string // 添加用户字段，对应goqgo agent list中的USER列
  username?: string // 兼容字段，与user字段含义相同
  namespace: string
  status: 'running' | 'idle' | 'error' | 'Creating' | 'Terminating' | 'Stopped'
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
