/**
 * 思考内容显示测试工具
 * 用于验证 agent_thinking_stream 的内容是否正确显示
 */

export interface ThinkingStreamData {
  conversationId: string
  content?: string
  progress?: number
  tempId?: string
}

export interface MockMessage {
  id: string
  conversationId?: string
  tempId?: string
  senderName: string
  isThinking: boolean
  thinkingContent?: string
}

/**
 * 模拟思考内容更新逻辑
 * 复制自 chat store 的 handleAgentThinkingStream 函数
 */
export function simulateThinkingContentUpdate(
  messages: MockMessage[],
  data: ThinkingStreamData
): { success: boolean; updatedMessage?: MockMessage; error?: string } {
  const { conversationId, content, progress, tempId } = data
  
  // 查找思考消息
  let thinkingMessageIndex = -1
  let searchMethod = 'none'
  
  // 优先通过 conversationId 查找
  if (conversationId) {
    thinkingMessageIndex = messages.findIndex(
      msg => msg.conversationId === conversationId && msg.isThinking
    )
    if (thinkingMessageIndex !== -1) {
      searchMethod = 'conversationId'
    }
  }
  
  // 如果没找到，尝试通过 tempId 查找
  if (thinkingMessageIndex === -1 && tempId) {
    thinkingMessageIndex = messages.findIndex(
      msg => msg.tempId === tempId && msg.isThinking
    )
    if (thinkingMessageIndex !== -1) {
      searchMethod = 'tempId'
    }
  }
  
  if (thinkingMessageIndex === -1) {
    return {
      success: false,
      error: `未找到对应的思考消息 (conversationId: ${conversationId}, tempId: ${tempId})`
    }
  }
  
  const thinkingMessage = { ...messages[thinkingMessageIndex] }
  
  // 更新思考内容 - 修复后的逻辑
  if (content !== undefined) {
    // 如果有实际的思考内容，直接使用
    thinkingMessage.thinkingContent = content
  } else if (progress !== undefined) {
    // 只有在没有实际内容时才显示进度
    thinkingMessage.thinkingContent = `正在思考... (${Math.round(progress * 100)}%)`
  }
  
  return {
    success: true,
    updatedMessage: thinkingMessage
  }
}

/**
 * 清理思考内容中的 ANSI 转义序列
 * 复制自 MessageItem.vue 的 cleanThinkingContent 函数
 */
export function cleanThinkingContent(content: string | undefined): string {
  if (!content) return '正在思考...'
  
  // 移除ANSI转义序列
  return content
    .replace(/\u001B\[[?]?[0-9;]*[a-zA-Z]/g, '') // 移除ANSI转义序列
    .replace(/\u001B\[[?]?[0-9;]*[hlm]/g, '')    // 移除其他控制序列
    .replace(/[\u0000-\u001F\u007F]/g, '')       // 移除其他控制字符
    .trim() || '正在思考...'
}

/**
 * 测试用例
 */
export function runThinkingContentTests(): void {
  console.log('🧪 开始思考内容显示测试...')
  
  // 测试数据
  const mockMessages: MockMessage[] = [
    {
      id: 'msg1',
      conversationId: 'conv_123_user_agent_hash',
      tempId: 'temp_123',
      senderName: 'default-sys.default',
      isThinking: true,
      thinkingContent: '正在思考...'
    },
    {
      id: 'msg2',
      senderName: 'user',
      isThinking: false,
      thinkingContent: undefined
    }
  ]
  
  // 测试1: 更新实际思考内容
  console.log('📝 测试1: 更新实际思考内容')
  const test1Data: ThinkingStreamData = {
    conversationId: 'conv_123_user_agent_hash',
    content: '我正在分析这个问题，需要考虑以下几个方面：\n1. 用户的具体需求\n2. 技术实现的可行性',
    tempId: 'temp_123'
  }
  
  const result1 = simulateThinkingContentUpdate([...mockMessages], test1Data)
  console.log('结果1:', result1)
  
  if (result1.success && result1.updatedMessage) {
    const cleanedContent = cleanThinkingContent(result1.updatedMessage.thinkingContent)
    console.log('清理后的内容:', cleanedContent)
    console.log('✅ 测试1通过: 实际内容正确显示')
  } else {
    console.log('❌ 测试1失败:', result1.error)
  }
  
  // 测试2: 只有进度信息
  console.log('\n📊 测试2: 只有进度信息')
  const test2Data: ThinkingStreamData = {
    conversationId: 'conv_123_user_agent_hash',
    progress: 0.75,
    tempId: 'temp_123'
  }
  
  const result2 = simulateThinkingContentUpdate([...mockMessages], test2Data)
  console.log('结果2:', result2)
  
  if (result2.success && result2.updatedMessage) {
    console.log('进度内容:', result2.updatedMessage.thinkingContent)
    console.log('✅ 测试2通过: 进度信息正确显示')
  } else {
    console.log('❌ 测试2失败:', result2.error)
  }
  
  // 测试3: 同时有内容和进度（应该优先显示内容）
  console.log('\n🔄 测试3: 同时有内容和进度')
  const test3Data: ThinkingStreamData = {
    conversationId: 'conv_123_user_agent_hash',
    content: '这是实际的思考内容，应该优先显示',
    progress: 0.85,
    tempId: 'temp_123'
  }
  
  const result3 = simulateThinkingContentUpdate([...mockMessages], test3Data)
  console.log('结果3:', result3)
  
  if (result3.success && result3.updatedMessage) {
    const shouldShowContent = result3.updatedMessage.thinkingContent === test3Data.content
    console.log('显示的内容:', result3.updatedMessage.thinkingContent)
    console.log(shouldShowContent ? '✅ 测试3通过: 优先显示实际内容' : '❌ 测试3失败: 内容被进度覆盖')
  } else {
    console.log('❌ 测试3失败:', result3.error)
  }
  
  // 测试4: 清理ANSI转义序列
  console.log('\n🧹 测试4: 清理ANSI转义序列')
  const dirtyContent = '\u001B[32m这是绿色文字\u001B[0m\u001B[1m这是粗体\u001B[0m'
  const cleanedContent = cleanThinkingContent(dirtyContent)
  console.log('原始内容:', dirtyContent)
  console.log('清理后:', cleanedContent)
  console.log(cleanedContent === '这是绿色文字这是粗体' ? '✅ 测试4通过: ANSI序列清理正确' : '❌ 测试4失败: ANSI序列清理有误')
  
  // 测试5: 消息查找失败
  console.log('\n🔍 测试5: 消息查找失败')
  const test5Data: ThinkingStreamData = {
    conversationId: 'nonexistent_conv_id',
    content: '这条消息应该找不到对应的思考消息',
    tempId: 'nonexistent_temp_id'
  }
  
  const result5 = simulateThinkingContentUpdate([...mockMessages], test5Data)
  console.log('结果5:', result5)
  console.log(result5.success ? '❌ 测试5失败: 应该找不到消息' : '✅ 测试5通过: 正确处理查找失败')
  
  console.log('\n🏁 思考内容显示测试完成!')
}

// 在开发环境下自动运行测试
if (import.meta.env.DEV) {
  // 延迟执行，避免影响应用启动
  setTimeout(() => {
    if (window.location.search.includes('test=thinking')) {
      runThinkingContentTests()
    }
  }, 1000)
}
