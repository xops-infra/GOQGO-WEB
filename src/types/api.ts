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

export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  timestamp: string
  type: 'user' | 'agent' | 'system'
  status?: 'sending' | 'sent' | 'error'
  messageType?: 'text' | 'image' | 'file'
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
