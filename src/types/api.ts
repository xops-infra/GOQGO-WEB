export interface Agent {
  id: string
  name: string
  namespace: string
  status: 'running' | 'idle' | 'error'
  role: string
  createdAt: string
  updatedAt: string
  avatar?: string
}

export interface CreateAgentRequest {
  name: string
  namespace: string
  role: string
  context?: string
  env?: Record<string, string>
}

export interface ChatMessage {
  id: string
  agentId: string
  content: string
  timestamp: string
  type: 'user' | 'agent' | 'system'
  status?: 'sending' | 'sent' | 'error'
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
