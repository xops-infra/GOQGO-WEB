/**
 * 消息处理工具函数
 */

// 消息大小限制常量
export const MESSAGE_LIMITS = {
  MAX_CHARS: 50000,      // 最大字符数
  MAX_BYTES: 64 * 1024,  // 最大字节数 (64KB)
  CHUNK_CHARS: 40000,    // 分块字符数
  CHUNK_BYTES: 50 * 1024 // 分块字节数 (50KB)
}

/**
 * 检查消息是否超过大小限制
 */
export function checkMessageSize(content: string): {
  isValid: boolean
  charCount: number
  byteSize: number
  errors: string[]
} {
  const charCount = content.length
  const byteSize = new Blob([content]).size
  const errors: string[] = []

  if (charCount > MESSAGE_LIMITS.MAX_CHARS) {
    errors.push(`消息字符数超限：${charCount}/${MESSAGE_LIMITS.MAX_CHARS}`)
  }

  if (byteSize > MESSAGE_LIMITS.MAX_BYTES) {
    errors.push(`消息大小超限：${Math.round(byteSize / 1024)}KB/${Math.round(MESSAGE_LIMITS.MAX_BYTES / 1024)}KB`)
  }

  return {
    isValid: errors.length === 0,
    charCount,
    byteSize,
    errors
  }
}

/**
 * 将长消息分割成多个较小的消息块
 */
export function splitLongMessage(content: string): string[] {
  const { isValid } = checkMessageSize(content)
  
  if (isValid) {
    return [content]
  }

  const chunks: string[] = []
  let remaining = content
  let chunkIndex = 1

  while (remaining.length > 0) {
    let chunkSize = MESSAGE_LIMITS.CHUNK_CHARS
    let chunk = remaining.substring(0, chunkSize)
    
    // 检查字节大小
    while (new Blob([chunk]).size > MESSAGE_LIMITS.CHUNK_BYTES && chunk.length > 0) {
      chunkSize -= 1000
      chunk = remaining.substring(0, chunkSize)
    }

    // 尝试在合适的位置分割（避免在单词中间分割）
    if (remaining.length > chunkSize) {
      const lastSpace = chunk.lastIndexOf(' ')
      const lastNewline = chunk.lastIndexOf('\n')
      const lastPunctuation = Math.max(
        chunk.lastIndexOf('.'),
        chunk.lastIndexOf('!'),
        chunk.lastIndexOf('?'),
        chunk.lastIndexOf('。'),
        chunk.lastIndexOf('！'),
        chunk.lastIndexOf('？')
      )

      // 选择最佳分割点
      const splitPoint = Math.max(lastNewline, lastPunctuation, lastSpace)
      if (splitPoint > chunkSize * 0.8) { // 如果分割点不会浪费太多空间
        chunk = remaining.substring(0, splitPoint + 1)
      }
    }

    // 添加分块标识
    if (chunks.length === 0 && remaining.length > chunk.length) {
      chunk = `[消息分块 ${chunkIndex}] ${chunk}`
    } else if (remaining.length > chunk.length) {
      chunk = `[消息分块 ${chunkIndex}] ${chunk}`
    }

    chunks.push(chunk.trim())
    remaining = remaining.substring(chunk.length).trim()
    chunkIndex++
  }

  return chunks
}

/**
 * 格式化消息大小显示
 */
export function formatMessageSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes}B`
  } else if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)}KB`
  } else {
    return `${Math.round(bytes / (1024 * 1024))}MB`
  }
}

/**
 * 获取消息大小警告级别
 */
export function getMessageSizeWarningLevel(content: string): 'safe' | 'warning' | 'danger' {
  const { charCount, byteSize } = checkMessageSize(content)
  
  const charPercentage = (charCount / MESSAGE_LIMITS.MAX_CHARS) * 100
  const bytePercentage = (byteSize / MESSAGE_LIMITS.MAX_BYTES) * 100
  const maxPercentage = Math.max(charPercentage, bytePercentage)

  if (maxPercentage >= 100) {
    return 'danger'
  } else if (maxPercentage >= 80) {
    return 'warning'
  } else {
    return 'safe'
  }
}
