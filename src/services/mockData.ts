// Mock数据服务
export interface MockAgent {
  name: string
  role: string
  status: 'Running' | 'Idle' | 'Busy'
  avatar: string
  personality: string
  thinkingStyle: string[]
}

export interface MockMessage {
  id: string
  content: string
  sender: string
  timestamp: string
  type: 'user' | 'agent' | 'system' | 'thinking'
  mentionedAgents?: string[]
  isThinking?: boolean
  thinkingSteps?: string[]
}

// Mock智能体数据
export const mockAgents: MockAgent[] = [
  {
    name: 'ai-architect',
    role: 'architect',
    status: 'Running',
    avatar: '🏗️',
    personality: '系统架构师，擅长技术方案设计和系统优化',
    thinkingStyle: [
      '分析需求和约束条件',
      '评估技术方案的可行性',
      '考虑性能和扩展性',
      '制定实施计划'
    ]
  },
  {
    name: 'code-reviewer',
    role: 'reviewer',
    status: 'Running', 
    avatar: '🔍',
    personality: '代码审查专家，注重代码质量和最佳实践',
    thinkingStyle: [
      '检查代码规范和风格',
      '分析潜在的bug和安全问题',
      '评估代码可维护性',
      '提出改进建议'
    ]
  }
]

// Mock聊天消息模板
export const mockMessageTemplates = [
  // 用户消息
  {
    type: 'user',
    templates: [
      '大家好，我想讨论一下新项目的架构设计',
      '有人能帮我review一下这段代码吗？',
      '@ai-architect 你觉得用微服务架构怎么样？',
      '@code-reviewer 这个函数的性能有问题吗？',
      '我们需要优化数据库查询性能',
      '前端组件的状态管理应该怎么设计？',
      'API接口的版本控制策略是什么？',
      '如何处理高并发场景下的数据一致性？'
    ]
  },
  // ai-architect 回复
  {
    type: 'agent',
    sender: 'ai-architect',
    templates: [
      '从架构角度来看，我建议采用分层设计模式',
      '微服务架构确实适合这个场景，但需要考虑服务间通信的复杂性',
      '我们可以使用Redis做缓存层来提升性能',
      '建议引入API网关来统一管理接口',
      '数据库分片策略需要根据业务特点来设计',
      '考虑使用事件驱动架构来解耦服务',
      '监控和日志系统是必不可少的基础设施'
    ],
    thinkingTemplates: [
      '让我分析一下当前的技术栈和业务需求...',
      '需要考虑系统的可扩展性和维护性...',
      '从性能角度评估这个方案的可行性...',
      '分析潜在的技术风险和解决方案...'
    ]
  },
  // code-reviewer 回复
  {
    type: 'agent',
    sender: 'code-reviewer',
    templates: [
      '这段代码整体结构不错，但有几个地方可以优化',
      '建议添加错误处理和边界条件检查',
      '函数的复杂度有点高，可以考虑拆分',
      '变量命名很清晰，符合团队规范',
      '这里可能存在内存泄漏的风险',
      '建议添加单元测试来保证代码质量',
      '性能方面可以通过缓存来优化'
    ],
    thinkingTemplates: [
      '让我仔细检查这段代码的逻辑...',
      '分析代码的时间复杂度和空间复杂度...',
      '检查是否遵循了SOLID原则...',
      '评估代码的可测试性和可维护性...'
    ]
  }
]

// 生成随机消息
export const generateRandomMessage = (): MockMessage => {
  const messageTypes = mockMessageTemplates
  const randomType = messageTypes[Math.floor(Math.random() * messageTypes.length)]
  
  if (randomType.type === 'user') {
    const template = randomType.templates[Math.floor(Math.random() * randomType.templates.length)]
    return {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: template,
      sender: 'user',
      timestamp: new Date().toISOString(),
      type: 'user',
      mentionedAgents: extractMentions(template)
    }
  } else {
    const template = randomType.templates[Math.floor(Math.random() * randomType.templates.length)]
    const thinkingTemplate = randomType.thinkingTemplates?.[Math.floor(Math.random() * randomType.thinkingTemplates.length)]
    
    return {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: template,
      sender: randomType.sender!,
      timestamp: new Date().toISOString(),
      type: 'agent',
      isThinking: !!thinkingTemplate,
      thinkingSteps: thinkingTemplate ? generateThinkingSteps(thinkingTemplate) : undefined
    }
  }
}

// 提取@提及
const extractMentions = (content: string): string[] => {
  const mentions = content.match(/@[\w-]+/g)
  return mentions ? mentions.map(m => m.substring(1)) : []
}

// 生成思考步骤
const generateThinkingSteps = (baseThinking: string): string[] => {
  const steps = [baseThinking]
  
  // 随机添加1-3个思考步骤
  const additionalSteps = [
    '考虑边界情况和异常处理...',
    '评估对现有系统的影响...',
    '分析用户体验和性能影响...',
    '检查是否符合最佳实践...',
    '考虑未来的扩展性需求...',
    '评估实施的复杂度和风险...'
  ]
  
  const numSteps = Math.floor(Math.random() * 3) + 1
  for (let i = 0; i < numSteps; i++) {
    const randomStep = additionalSteps[Math.floor(Math.random() * additionalSteps.length)]
    if (!steps.includes(randomStep)) {
      steps.push(randomStep)
    }
  }
  
  return steps
}

// 生成思考过程消息
export const generateThinkingMessage = (agentName: string): MockMessage => {
  const agent = mockAgents.find(a => a.name === agentName)
  if (!agent) return generateRandomMessage()
  
  const thinkingSteps = agent.thinkingStyle.map(step => `💭 ${step}...`)
  
  return {
    id: `thinking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    content: `正在思考中...`,
    sender: agentName,
    timestamp: new Date().toISOString(),
    type: 'thinking',
    isThinking: true,
    thinkingSteps
  }
}

// 生成@思考过程的完整对话
export const generateMentionConversation = (): MockMessage[] => {
  const messages: MockMessage[] = []
  
  // 1. 用户提问并@某个智能体
  const userQuestion = {
    id: `msg_${Date.now()}_user`,
    content: '@ai-architect 我们的新项目需要设计一个高并发的消息系统，你有什么建议吗？',
    sender: 'user',
    timestamp: new Date().toISOString(),
    type: 'user' as const,
    mentionedAgents: ['ai-architect']
  }
  messages.push(userQuestion)
  
  // 2. 智能体思考过程
  const thinkingMessage = {
    id: `thinking_${Date.now()}_architect`,
    content: '正在分析高并发消息系统的设计方案...',
    sender: 'ai-architect',
    timestamp: new Date(Date.now() + 1000).toISOString(),
    type: 'thinking' as const,
    isThinking: true,
    thinkingSteps: [
      '💭 分析消息系统的核心需求：高并发、低延迟、高可用...',
      '💭 评估不同的消息队列方案：Kafka、RabbitMQ、Redis Streams...',
      '💭 考虑消息的持久化和容错机制...',
      '💭 设计消息路由和负载均衡策略...',
      '💭 评估系统的扩展性和监控方案...'
    ]
  }
  messages.push(thinkingMessage)
  
  // 3. 智能体回复
  const agentReply = {
    id: `msg_${Date.now()}_architect_reply`,
    content: `基于你的需求，我建议采用以下架构方案：

🏗️ **消息系统架构设计**

1. **消息队列选择**：推荐使用Apache Kafka
   - 支持高吞吐量（百万级TPS）
   - 天然支持分区和副本机制
   - 优秀的水平扩展能力

2. **系统分层设计**：
   - API网关层：统一接入和限流
   - 业务逻辑层：消息处理和路由
   - 存储层：Kafka + Redis + MySQL

3. **高并发优化策略**：
   - 异步处理：使用事件驱动架构
   - 缓存策略：Redis集群缓存热点数据
   - 数据库优化：读写分离 + 分库分表

4. **监控和运维**：
   - 实时监控：Prometheus + Grafana
   - 日志收集：ELK Stack
   - 链路追踪：Jaeger

这个方案可以支撑千万级用户的并发消息处理，你觉得怎么样？`,
    sender: 'ai-architect',
    timestamp: new Date(Date.now() + 5000).toISOString(),
    type: 'agent' as const
  }
  messages.push(agentReply)
  
  return messages
}

export default {
  mockAgents,
  mockMessageTemplates,
  generateRandomMessage,
  generateThinkingMessage,
  generateMentionConversation
}
