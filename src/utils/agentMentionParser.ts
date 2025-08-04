/**
 * Agent提及解析器
 * 用于解析和处理消息中的@agent语法
 */

import type { AgentMention } from '@/types/conversation'

export class AgentMentionParser {
  // @agent_name 或 @agent_name.namespace 的正则表达式
  private static readonly MENTION_REGEX = /@([a-zA-Z0-9_-]+)(?:\.([a-zA-Z0-9_-]+))?/g

  /**
   * 解析消息内容中的Agent提及
   * @param content 消息内容
   * @returns Agent提及数组
   */
  static parse(content: string): AgentMention[] {
    const mentions: AgentMention[] = []
    let match

    // 重置正则表达式的lastIndex
    this.MENTION_REGEX.lastIndex = 0

    while ((match = this.MENTION_REGEX.exec(content)) !== null) {
      mentions.push({
        fullMatch: match[0],
        agentName: match[1],
        namespace: match[2] || 'default',
        startIndex: match.index,
        endIndex: match.index + match[0].length
      })
    }

    return mentions
  }

  /**
   * 高亮显示消息中的Agent提及
   * @param content 原始消息内容
   * @param mentions Agent提及数组
   * @returns 高亮后的HTML内容
   */
  static highlight(content: string, mentions?: AgentMention[]): string {
    if (!mentions) {
      mentions = this.parse(content)
    }

    if (mentions.length === 0) {
      return content
    }

    let result = content
    
    // 从后往前替换，避免索引偏移
    mentions
      .slice()
      .reverse()
      .forEach(mention => {
        const highlighted = `<span class="agent-mention" data-agent="${mention.agentName}" data-namespace="${mention.namespace}">${mention.fullMatch}</span>`
        result = result.substring(0, mention.startIndex) + 
                 highlighted + 
                 result.substring(mention.endIndex)
      })

    return result
  }

  /**
   * 验证Agent名称是否有效
   * @param agentName Agent名称
   * @returns 是否有效
   */
  static isValidAgentName(agentName: string): boolean {
    return /^[a-zA-Z0-9_-]+$/.test(agentName)
  }

  /**
   * 验证命名空间是否有效
   * @param namespace 命名空间
   * @returns 是否有效
   */
  static isValidNamespace(namespace: string): boolean {
    return /^[a-zA-Z0-9_-]+$/.test(namespace)
  }

  /**
   * 从消息内容中提取唯一的Agent提及
   * @param content 消息内容
   * @returns 唯一的Agent提及数组
   */
  static extractUniqueAgents(content: string): AgentMention[] {
    const mentions = this.parse(content)
    const uniqueAgents = new Map<string, AgentMention>()

    mentions.forEach(mention => {
      const key = `${mention.agentName}.${mention.namespace}`
      if (!uniqueAgents.has(key)) {
        uniqueAgents.set(key, mention)
      }
    })

    return Array.from(uniqueAgents.values())
  }

  /**
   * 检查消息是否包含Agent提及
   * @param content 消息内容
   * @returns 是否包含Agent提及
   */
  static hasAgentMentions(content: string): boolean {
    this.MENTION_REGEX.lastIndex = 0
    return this.MENTION_REGEX.test(content)
  }

  /**
   * 获取输入框中当前光标位置的Agent提及信息
   * @param content 输入内容
   * @param cursorPosition 光标位置
   * @returns 当前正在输入的Agent提及信息
   */
  static getCurrentMention(content: string, cursorPosition: number): {
    isInMention: boolean
    mentionStart: number
    mentionText: string
    agentName: string
    namespace?: string
  } | null {
    console.log('🔍 AgentMentionParser.getCurrentMention 被调用')
    console.log('📝 content:', content)
    console.log('📍 cursorPosition:', cursorPosition)
    
    // 查找光标位置前的@符号
    let mentionStart = -1
    for (let i = cursorPosition - 1; i >= 0; i--) {
      if (content[i] === '@') {
        mentionStart = i
        console.log('📍 找到@符号位置:', mentionStart)
        break
      }
      if (content[i] === ' ' || content[i] === '\n') {
        console.log('❌ 遇到空格/换行，停止搜索')
        break
      }
    }

    if (mentionStart === -1) {
      console.log('❌ 未找到@符号')
      return null
    }

    // 提取@符号到光标位置的文本
    const mentionText = content.substring(mentionStart, cursorPosition)
    console.log('📝 提取的mention文本:', mentionText)
    
    // 检查是否是有效的Agent提及格式
    const match = mentionText.match(/^@([a-zA-Z0-9_-]*)(?:\.([a-zA-Z0-9_-]*))?$/)
    console.log('🔍 正则匹配结果:', match)
    
    if (!match) {
      console.log('❌ 不匹配Agent提及格式')
      return null
    }

    const result = {
      isInMention: true,
      mentionStart,
      mentionText,
      agentName: match[1] || '',
      namespace: match[2]
    }
    
    console.log('✅ 检测到Agent提及:', result)
    return result
  }

  /**
   * 替换输入框中的Agent提及
   * @param content 原始内容
   * @param mentionStart 提及开始位置
   * @param cursorPosition 当前光标位置
   * @param agentName Agent名称
   * @param namespace 命名空间
   * @returns 新的内容和光标位置
   */
  static replaceMention(
    content: string,
    mentionStart: number,
    cursorPosition: number,
    agentName: string,
    namespace: string = 'default'
  ): { content: string; cursorPosition: number } {
    const mentionText = namespace === 'default' 
      ? `@${agentName}` 
      : `@${agentName}.${namespace}`
    
    const newContent = content.substring(0, mentionStart) + 
                      mentionText + 
                      content.substring(cursorPosition)
    
    const newCursorPosition = mentionStart + mentionText.length

    return {
      content: newContent,
      cursorPosition: newCursorPosition
    }
  }
}
