// Mock Socket服务
import { 
  mockAgents, 
  generateRandomMessage, 
  generateThinkingMessage, 
  generateMentionConversation,
  type MockMessage 
} from './mockData'

// 简单的事件发射器实现
class SimpleEventEmitter {
  private events: { [key: string]: Function[] } = {}

  on(event: string, callback: Function) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
  }

  emit(event: string, ...args: any[]) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(...args))
    }
  }

  removeAllListeners(event?: string) {
    if (event) {
      delete this.events[event]
    } else {
      this.events = {}
    }
  }
}

export class MockSocketService extends SimpleEventEmitter {
  private isConnected = false
  private messageHistory: MockMessage[] = []
  private messageInterval: NodeJS.Timeout | null = null
  private clearInterval: NodeJS.Timeout | null = null
  private messageCount = 0
  private readonly MAX_MESSAGES = 50 // 最大消息数量，超过后清空

  constructor() {
    super()
    this.setupMockAgents()
  }

  // 连接Socket
  connect() {
    if (this.isConnected) return

    console.log('🔌 Mock Socket connecting...')
    
    // 模拟连接延迟
    setTimeout(() => {
      this.isConnected = true
      console.log('✅ Mock Socket connected')
      
      // 发送连接成功事件
      this.emit('connect')
      this.emit('agent_status', {
        agents: mockAgents.map(agent => ({
          name: agent.name,
          status: agent.status,
          role: agent.role
        }))
      })

      // 开始模拟消息流
      this.startMessageSimulation()
      
      // 设置定期清空聊天的定时器
      this.setupClearChatTimer()
      
    }, 1000)
  }

  // 断开连接
  disconnect() {
    if (!this.isConnected) return

    console.log('🔌 Mock Socket disconnecting...')
    this.isConnected = false
    
    // 清理定时器
    if (this.messageInterval) {
      clearInterval(this.messageInterval)
      this.messageInterval = null
    }
    
    if (this.clearInterval) {
      clearInterval(this.clearInterval)
      this.clearInterval = null
    }

    this.emit('disconnect')
    console.log('❌ Mock Socket disconnected')
  }

  // 发送消息
  sendMessage(content: string, mentionedAgents?: string[]) {
    if (!this.isConnected) {
      console.warn('⚠️ Socket not connected')
      return
    }

    const message: MockMessage = {
      id: `msg_${Date.now()}_user`,
      content,
      sender: 'user',
      timestamp: new Date().toISOString(),
      type: 'user',
      mentionedAgents
    }

    this.messageHistory.push(message)
    this.messageCount++
    
    // 发送消息事件
    this.emit('message', message)
    console.log('📤 User message sent:', content)

    // 如果@了智能体，模拟智能体回复
    if (mentionedAgents && mentionedAgents.length > 0) {
      this.simulateAgentResponse(mentionedAgents[0], content)
    }
  }

  // 获取消息历史
  getMessageHistory(): MockMessage[] {
    return [...this.messageHistory]
  }

  // 清空聊天记录
  clearChat() {
    console.log('🧹 Clearing chat history...')
    this.messageHistory = []
    this.messageCount = 0
    
    // 发送清空事件
    this.emit('chat_cleared')
    
    // 发送系统消息
    const systemMessage: MockMessage = {
      id: `system_${Date.now()}`,
      content: '💬 聊天记录已清空，开始新的对话...',
      sender: 'system',
      timestamp: new Date().toISOString(),
      type: 'system'
    }
    
    this.messageHistory.push(systemMessage)
    this.emit('message', systemMessage)
    
    console.log('✨ Chat cleared, starting fresh conversation')
  }

  // 设置Mock智能体
  private setupMockAgents() {
    // 模拟智能体状态变化
    setInterval(() => {
      if (!this.isConnected) return
      
      const randomAgent = mockAgents[Math.floor(Math.random() * mockAgents.length)]
      const statuses = ['Running', 'Idle', 'Busy'] as const
      const newStatus = statuses[Math.floor(Math.random() * statuses.length)]
      
      if (randomAgent.status !== newStatus) {
        randomAgent.status = newStatus
        this.emit('agent_status_change', {
          agent: randomAgent.name,
          status: newStatus
        })
      }
    }, 10000) // 每10秒随机改变一个智能体状态
  }

  // 开始消息模拟
  private startMessageSimulation() {
    // 先发送一个欢迎消息
    setTimeout(() => {
      const welcomeMessage: MockMessage = {
        id: `welcome_${Date.now()}`,
        content: '🎉 欢迎使用GoQGo智能体协作平台！当前有2个智能体在线：ai-architect 和 code-reviewer',
        sender: 'system',
        timestamp: new Date().toISOString(),
        type: 'system'
      }
      
      this.messageHistory.push(welcomeMessage)
      this.messageCount++
      this.emit('message', welcomeMessage)
    }, 2000)

    // 定期发送随机消息
    this.messageInterval = setInterval(() => {
      if (!this.isConnected) return
      
      // 30%概率发送@思考过程的完整对话
      if (Math.random() < 0.3) {
        this.simulateMentionConversation()
      } else {
        // 70%概率发送普通随机消息
        this.simulateRandomMessage()
      }
      
    }, 8000) // 每8秒发送一条消息
  }

  // 模拟随机消息
  private simulateRandomMessage() {
    const message = generateRandomMessage()
    this.messageHistory.push(message)
    this.messageCount++
    this.emit('message', message)
    
    console.log(`📨 Mock message from ${message.sender}:`, message.content.substring(0, 50) + '...')
  }

  // 模拟@思考过程对话
  private simulateMentionConversation() {
    const conversation = generateMentionConversation()
    
    conversation.forEach((message, index) => {
      setTimeout(() => {
        this.messageHistory.push(message)
        this.messageCount++
        this.emit('message', message)
        
        console.log(`🧠 Mock conversation step ${index + 1}:`, message.type, message.content.substring(0, 50) + '...')
      }, index * 2000) // 每2秒发送一条消息
    })
  }

  // 模拟智能体回复
  private simulateAgentResponse(agentName: string, userMessage: string) {
    // 1. 先发送思考过程
    setTimeout(() => {
      const thinkingMessage = generateThinkingMessage(agentName)
      this.messageHistory.push(thinkingMessage)
      this.messageCount++
      this.emit('message', thinkingMessage)
      
      console.log(`🤔 ${agentName} is thinking...`)
    }, 1500)

    // 2. 再发送回复
    setTimeout(() => {
      const replyMessage = generateRandomMessage()
      replyMessage.sender = agentName
      replyMessage.type = 'agent'
      replyMessage.id = `reply_${Date.now()}_${agentName}`
      
      this.messageHistory.push(replyMessage)
      this.messageCount++
      this.emit('message', replyMessage)
      
      console.log(`💬 ${agentName} replied:`, replyMessage.content.substring(0, 50) + '...')
    }, 4000)
  }

  // 设置定期清空聊天的定时器
  private setupClearChatTimer() {
    this.clearInterval = setInterval(() => {
      if (this.messageCount >= this.MAX_MESSAGES) {
        this.clearChat()
      }
    }, 5000) // 每5秒检查一次是否需要清空
  }

  // 获取连接状态
  isSocketConnected(): boolean {
    return this.isConnected
  }

  // 获取在线智能体
  getOnlineAgents() {
    return mockAgents.filter(agent => agent.status === 'Running')
  }
}

// 单例模式
let mockSocketInstance: MockSocketService | null = null

export const getMockSocket = (): MockSocketService => {
  if (!mockSocketInstance) {
    mockSocketInstance = new MockSocketService()
  }
  return mockSocketInstance
}

export default MockSocketService
