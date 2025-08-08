/**
 * Thinking 动画处理工具
 * 用于处理终端中的 thinking 动画序列
 */

// 旋转动画字符 (Unicode 盲文字符)
export const SPINNER_CHARS = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

// ANSI 控制序列
export const ANSI_SEQUENCES = {
  HIDE_CURSOR: '[?25l',
  SHOW_CURSOR: '[?25h',
  ENABLE_BRACKETED_PASTE: '[?2004h',
  DISABLE_BRACKETED_PASTE: '[?2004l'
}

/**
 * 检查文本是否包含 thinking 动画
 */
export function isThinkingAnimation(text: string): boolean {
  if (!text.includes('Thinking...')) {
    return false
  }
  
  // 检查是否包含旋转字符
  return SPINNER_CHARS.some(char => text.includes(char))
}

/**
 * 清理 ANSI 控制序列
 */
export function cleanAnsiSequences(text: string): string {
  return text
    // 移除光标控制序列
    .replace(/\[?\?25[lh]/g, '')
    // 移除括号粘贴模式
    .replace(/\[?\?2004[lh]/g, '')
    // 移除其他常见控制序列
    .replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '')
    // 清理多余的空白
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * 处理 thinking 动画文本
 * 将复杂的动画序列转换为简单的显示格式
 */
export function processThinkingText(text: string): {
  isThinking: boolean
  processedText: string
  originalText: string
} {
  const originalText = text
  
  if (!isThinkingAnimation(text)) {
    return {
      isThinking: false,
      processedText: cleanAnsiSequences(text),
      originalText
    }
  }
  
  // 这是 thinking 动画，简化显示
  return {
    isThinking: true,
    processedText: '🤔 Thinking...',
    originalText
  }
}

/**
 * 为 XTerm 格式化 thinking 文本
 */
export function formatThinkingForXTerm(text: string): string {
  const result = processThinkingText(text)
  
  if (result.isThinking) {
    return '\x1b[33m🤔 Thinking...\x1b[0m'
  }
  
  return result.processedText
}

/**
 * 为 HTML 格式化 thinking 文本
 */
export function formatThinkingForHTML(text: string): string {
  const result = processThinkingText(text)
  
  if (result.isThinking) {
    return '<span class="thinking-indicator">🤔 <span class="thinking-text">Thinking</span><span class="thinking-dots">...</span></span>'
  }
  
  return result.processedText
}

/**
 * 提取 thinking 动画的统计信息
 */
export function analyzeThinkingAnimation(text: string): {
  spinnerCount: number
  thinkingCount: number
  duration: number // 估算的动画持续时间（秒）
  hasControlSequences: boolean
} {
  const spinnerMatches = text.match(new RegExp(`[${SPINNER_CHARS.join('')}]`, 'g'))
  const thinkingMatches = text.match(/Thinking\.\.\./g)
  
  const spinnerCount = spinnerMatches ? spinnerMatches.length : 0
  const thinkingCount = thinkingMatches ? thinkingMatches.length : 0
  
  // 估算动画持续时间（每个旋转字符约 0.1 秒）
  const duration = spinnerCount * 0.1
  
  const hasControlSequences = Object.values(ANSI_SEQUENCES).some(seq => 
    text.includes(seq)
  )
  
  return {
    spinnerCount,
    thinkingCount,
    duration,
    hasControlSequences
  }
}

/**
 * 批量处理日志条目中的 thinking 动画
 */
export function processLogEntries(logs: Array<{ message: string; [key: string]: any }>): Array<{
  message: string
  isThinking: boolean
  originalMessage: string
  [key: string]: any
}> {
  return logs.map(log => {
    const result = processThinkingText(log.message)
    return {
      ...log,
      message: result.processedText,
      isThinking: result.isThinking,
      originalMessage: result.originalText
    }
  })
}
