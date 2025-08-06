import { 
  mockUsers, 
  mockAgents, 
  mockNamespaces, 
  mockMessages, 
  mockRoles, 
  mockLogs 
} from './data'
import type { User, Agent, Namespace, Message, Role } from '@/types/api'

// 模拟网络延迟
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms))

// 生成随机ID
const generateId = () => Math.random().toString(36).substr(2, 9)

// Mock认证服务
export const mockAuthService = {
  async login(credentials: { username: string; password: string }) {
    await delay(500) // 模拟登录延迟
    
    const user = mockUsers.find(u => u.username === credentials.username)
    
    if (!user) {
      throw new Error('用户不存在')
    }
    
    // 简单的密码验证（实际项目中不要这样做）
    const validPasswords = {
      'admin': 'admin123',
      'demo': 'demo123'
    }
    
    if (validPasswords[credentials.username as keyof typeof validPasswords] !== credentials.password) {
      throw new Error('密码错误')
    }
    
    return {
      user,
      token: `mock-token-${user.id}-${Date.now()}`
    }
  },

  async verifyToken(token: string) {
    await delay(200)
    
    if (!token.startsWith('mock-token-')) {
      throw new Error('无效的token')
    }
    
    // 从token中提取用户ID
    const userId = token.split('-')[2]
    const user = mockUsers.find(u => u.id === userId)
    
    if (!user) {
      throw new Error('用户不存在')
    }
    
    return user
  },

  async logout() {
    await delay(200)
    return { success: true }
  },

  async getCurrentUser() {
    await delay(200)
    return mockUsers[0] // 返回admin用户
  }
}

// Mock Agent服务
export const mockAgentService = {
  async getAgents(namespace?: string) {
    await delay(300)
    
    if (namespace) {
      return mockAgents.filter(agent => agent.namespace === namespace)
    }
    
    return mockAgents
  },

  async getAgent(id: string) {
    await delay(200)
    
    const agent = mockAgents.find(a => a.id === id)
    if (!agent) {
      throw new Error('Agent不存在')
    }
    
    return agent
  },

  async createAgent(agentData: Partial<Agent>) {
    await delay(500)
    
    const newAgent: Agent = {
      id: generateId(),
      name: agentData.name || 'new-agent',
      namespace: agentData.namespace || 'default',
      role: agentData.role || 'default',
      status: 'creating',
      username: 'admin',
      age: '0m',
      restartCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      config: agentData.config || {}
    }
    
    mockAgents.push(newAgent)
    
    // 模拟创建过程
    setTimeout(() => {
      newAgent.status = 'running'
      newAgent.age = '1m'
    }, 2000)
    
    return newAgent
  },

  async updateAgent(id: string, updates: Partial<Agent>) {
    await delay(300)
    
    const index = mockAgents.findIndex(a => a.id === id)
    if (index === -1) {
      throw new Error('Agent不存在')
    }
    
    mockAgents[index] = {
      ...mockAgents[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    return mockAgents[index]
  },

  async deleteAgent(id: string) {
    await delay(400)
    
    const index = mockAgents.findIndex(a => a.id === id)
    if (index === -1) {
      throw new Error('Agent不存在')
    }
    
    mockAgents.splice(index, 1)
    return { success: true }
  },

  async restartAgent(id: string) {
    await delay(600)
    
    const agent = mockAgents.find(a => a.id === id)
    if (!agent) {
      throw new Error('Agent不存在')
    }
    
    agent.status = 'creating'
    agent.restartCount += 1
    agent.updatedAt = new Date().toISOString()
    
    // 模拟重启过程
    setTimeout(() => {
      agent.status = 'running'
      agent.age = '0m'
    }, 3000)
    
    return agent
  },

  async stopAgent(id: string) {
    await delay(400)
    
    const agent = mockAgents.find(a => a.id === id)
    if (!agent) {
      throw new Error('Agent不存在')
    }
    
    agent.status = 'stopped'
    agent.updatedAt = new Date().toISOString()
    
    return agent
  }
}

// Mock命名空间服务
export const mockNamespaceService = {
  async getList() {
    await delay(200)
    return {
      items: mockNamespaces.map(ns => ({
        apiVersion: 'v1',
        kind: 'Namespace',
        metadata: {
          name: ns.name,
          creationTimestamp: ns.createdAt
        },
        spec: {
          displayName: ns.displayName,
          description: ns.description,
          labels: ns.labels
        },
        status: {
          phase: ns.status,
          agentCount: 0,
          dagCount: 0
        }
      }))
    }
  },

  async get(name: string) {
    await delay(200)
    
    const namespace = mockNamespaces.find(ns => ns.name === name)
    if (!namespace) {
      throw new Error('命名空间不存在')
    }
    
    return {
      apiVersion: 'v1',
      kind: 'Namespace',
      metadata: {
        name: namespace.name,
        creationTimestamp: namespace.createdAt
      },
      spec: {
        displayName: namespace.displayName,
        description: namespace.description,
        labels: namespace.labels
      },
      status: {
        phase: namespace.status,
        agentCount: 0,
        dagCount: 0
      }
    }
  },

  async create(namespaceData: any) {
    await delay(400)
    
    const newNamespace = {
      apiVersion: 'v1',
      kind: 'Namespace',
      metadata: {
        name: namespaceData.metadata?.name || 'new-namespace',
        creationTimestamp: new Date().toISOString()
      },
      spec: namespaceData.spec || {},
      status: {
        phase: 'Active',
        agentCount: 0,
        dagCount: 0
      }
    }
    
    // 添加到Mock数据中
    mockNamespaces.push({
      name: newNamespace.metadata.name,
      displayName: newNamespace.spec.displayName || newNamespace.metadata.name,
      description: newNamespace.spec.description || '',
      status: 'Active',
      createdAt: newNamespace.metadata.creationTimestamp,
      updatedAt: newNamespace.metadata.creationTimestamp,
      labels: newNamespace.spec.labels || {},
      resourceQuota: {
        maxAgents: 10,
        cpuLimit: 2,
        memoryLimit: 4
      }
    })
    
    return newNamespace
  },

  async update(name: string, data: any) {
    await delay(400)
    
    const namespace = mockNamespaces.find(ns => ns.name === name)
    if (!namespace) {
      throw new Error('命名空间不存在')
    }
    
    // 更新Mock数据
    Object.assign(namespace, {
      displayName: data.spec?.displayName || namespace.displayName,
      description: data.spec?.description || namespace.description,
      labels: data.spec?.labels || namespace.labels,
      updatedAt: new Date().toISOString()
    })
    
    return {
      apiVersion: 'v1',
      kind: 'Namespace',
      metadata: {
        name: namespace.name,
        creationTimestamp: namespace.createdAt
      },
      spec: {
        displayName: namespace.displayName,
        description: namespace.description,
        labels: namespace.labels
      },
      status: {
        phase: namespace.status,
        agentCount: 0,
        dagCount: 0
      }
    }
  },

  async delete(name: string) {
    await delay(400)
    
    const index = mockNamespaces.findIndex(ns => ns.name === name)
    if (index === -1) {
      throw new Error('命名空间不存在')
    }
    
    mockNamespaces.splice(index, 1)
  }
}

// Mock聊天服务
export const mockChatService = {
  async getChatHistory(namespace: string, chatName: string, limit?: number, before?: string) {
    await delay(200)
    
    let messages = mockMessages.filter(msg => msg.namespace === namespace)
    
    // 按时间排序
    messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    
    if (before) {
      const beforeTime = new Date(before).getTime()
      messages = messages.filter(msg => new Date(msg.timestamp).getTime() < beforeTime)
    }
    
    if (limit) {
      messages = messages.slice(-limit)
    }
    
    return messages
  },

  async sendMessage(messageData: {
    content: string
    sender: string
    namespace: string
    type?: string
    mentionedAgents?: string[]
  }) {
    await delay(300)
    
    const newMessage: Message = {
      id: generateId(),
      content: messageData.content,
      sender: messageData.sender,
      namespace: messageData.namespace,
      timestamp: new Date().toISOString(),
      type: messageData.type || 'text',
      status: 'sent',
      mentionedAgents: messageData.mentionedAgents
    }
    
    mockMessages.push(newMessage)
    return newMessage
  },

  async deleteMessage(id: string) {
    await delay(200)
    
    const index = mockMessages.findIndex(msg => msg.id === id)
    if (index === -1) {
      throw new Error('消息不存在')
    }
    
    mockMessages.splice(index, 1)
    return { success: true }
  }
}

// Mock角色服务
export const mockRoleService = {
  async getList() {
    await delay(200)
    return {
      total: mockRoles.length,
      roles: mockRoles
    }
  },

  async getRole(roleName: string) {
    await delay(200)
    
    const role = mockRoles.find(r => r.name === roleName)
    if (!role) {
      throw new Error('角色不存在')
    }
    
    return role
  },

  async getRoleDisplayName(roleName: string) {
    await delay(200)
    
    const role = mockRoles.find(r => r.name === roleName)
    return role?.displayName || roleName
  },

  async checkRoleExists(roleName: string) {
    await delay(200)
    
    return mockRoles.some(r => r.name === roleName)
  }
}

// Mock日志服务
export const mockLogService = {
  async getLogs(agentId: string, options?: { lines?: number; follow?: boolean }) {
    await delay(400)
    
    const logs = mockLogs[agentId as keyof typeof mockLogs] || []
    
    if (options?.lines) {
      return logs.slice(-options.lines)
    }
    
    return logs
  },

  async streamLogs(agentId: string, callback: (log: string) => void) {
    // 模拟实时日志流
    const logs = mockLogs[agentId as keyof typeof mockLogs] || []
    
    // 先发送现有日志
    logs.forEach(log => callback(log))
    
    // 模拟新日志
    const interval = setInterval(() => {
      const timestamp = new Date().toISOString().replace('T', ' ').substr(0, 19)
      const randomLogs = [
        `[${timestamp}] INFO: Service heartbeat`,
        `[${timestamp}] INFO: Processing request`,
        `[${timestamp}] INFO: Memory usage: 45%`,
        `[${timestamp}] INFO: CPU usage: 23%`,
        `[${timestamp}] INFO: Network I/O normal`
      ]
      
      const randomLog = randomLogs[Math.floor(Math.random() * randomLogs.length)]
      callback(randomLog)
    }, 2000)
    
    // 返回清理函数
    return () => clearInterval(interval)
  }
}

// Mock文件服务
export const mockFileService = {
  async uploadFile(username: string, file: File) {
    await delay(1000) // 模拟上传延迟
    
    // 模拟文件上传
    const mockUrl = `https://mock-cdn.goqgo.com/uploads/${username}/${Date.now()}-${file.name}`
    
    return {
      url: mockUrl,
      filename: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString()
    }
  }
}
