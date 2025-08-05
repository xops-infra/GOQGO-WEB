/**
 * 消息解析工具
 * 用于识别和渲染聊天消息中的文件链接、图片等内容
 */

// 支持的图片格式
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico']

// 支持的视频格式
const VIDEO_EXTENSIONS = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', '3gp']

// 支持的音频格式
const AUDIO_EXTENSIONS = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a']

// 支持的文档格式
const DOCUMENT_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf']

// 支持的压缩包格式
const ARCHIVE_EXTENSIONS = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2']

/**
 * 解析的文件信息
 */
export interface ParsedFile {
  type: 'image' | 'video' | 'audio' | 'document' | 'archive' | 'unknown'
  url: string
  extension: string
  filename?: string
  icon: string
  label: string
}

/**
 * 内容块类型
 */
export interface ContentBlock {
  type: 'text' | 'image' | 'file'
  content: string
  url?: string
  extension?: string
  filename?: string
  icon?: string
  label?: string
}

/**
 * 解析的消息内容
 */
export interface ParsedMessage {
  text: string
  files: ParsedFile[]
  hasFiles: boolean
  contentBlocks: ContentBlock[] // 按顺序排列的内容块
}

/**
 * 从URL中提取文件扩展名
 */
function getFileExtension(url: string): string {
  try {
    // 移除查询参数和锚点
    const cleanUrl = url.split('?')[0].split('#')[0]
    const parts = cleanUrl.split('.')
    return parts.length > 1 ? parts.pop()!.toLowerCase() : ''
  } catch {
    return ''
  }
}

/**
 * 从URL中提取文件名
 */
function getFilename(url: string): string {
  try {
    const cleanUrl = url.split('?')[0].split('#')[0]
    const parts = cleanUrl.split('/')
    return parts.pop() || 'unknown'
  } catch {
    return 'unknown'
  }
}

/**
 * 根据文件扩展名确定文件类型
 */
function getFileType(extension: string): ParsedFile['type'] {
  if (IMAGE_EXTENSIONS.includes(extension)) return 'image'
  if (VIDEO_EXTENSIONS.includes(extension)) return 'video'
  if (AUDIO_EXTENSIONS.includes(extension)) return 'audio'
  if (DOCUMENT_EXTENSIONS.includes(extension)) return 'document'
  if (ARCHIVE_EXTENSIONS.includes(extension)) return 'archive'
  return 'unknown'
}

/**
 * 获取文件类型对应的图标
 */
function getFileIcon(type: ParsedFile['type']): string {
  const icons = {
    image: '🖼️',
    video: '🎥',
    audio: '🎵',
    document: '📄',
    archive: '📦',
    unknown: '📎'
  }
  return icons[type]
}

/**
 * 获取文件类型对应的标签
 */
function getFileLabel(type: ParsedFile['type']): string {
  const labels = {
    image: '图片',
    video: '视频',
    audio: '音频',
    document: '文档',
    archive: '压缩包',
    unknown: '文件'
  }
  return labels[type]
}

// 动态获取 API 服务器 baseURL
import axiosInstance from './axios'
import { apiConfig } from '@/config/api'

// 使用统一的API配置
const API_BASE_URL = apiConfig.baseURL
// 去除末尾斜杠
const baseUrl = API_BASE_URL.replace(/\/$/, '')
// 动态生成正则，支持任意 API 服务器
const fileUrlRegex = new RegExp(`(${baseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^\\s]+)`, 'g')

/**
 * 检查URL是否为本地服务器文件（现在基于 baseUrl 判断）
 */
function isLocalServerFile(url: string): boolean {
  return url.startsWith(baseUrl)
}

/**
 * 解析消息内容，按空格分割并按顺序排列
 */
export function parseMessage(content: string): ParsedMessage {
  const files: ParsedFile[] = []
  const contentBlocks: ContentBlock[] = []
  
  // 按空格分割内容
  const parts = content.split(/\s+/)
  
  for (const part of parts) {
    if (!part.trim()) continue
    
    // 检查是否是URL
    if (part.startsWith(baseUrl)) {
      const extension = getFileExtension(part)
      const filename = getFilename(part)
      const type = getFileType(extension)
      
      // 创建文件对象
      const file: ParsedFile = {
        type,
        url: part,
        extension,
        filename,
        icon: getFileIcon(type),
        label: getFileLabel(type)
      }
      
      files.push(file)
      
      // 创建内容块
      const blockType = type === 'image' ? 'image' : 'file'
      contentBlocks.push({
        type: blockType,
        content: part,
        url: part,
        extension,
        filename,
        icon: getFileIcon(type),
        label: getFileLabel(type)
      })
    } else {
      // 普通文本
      contentBlocks.push({
        type: 'text',
        content: part
      })
    }
  }
  
  // 合并连续的相同类型内容块
  const mergedBlocks: ContentBlock[] = []
  let currentBlock: ContentBlock | null = null
  
  for (const block of contentBlocks) {
    if (!currentBlock) {
      currentBlock = { ...block }
    } else if (currentBlock.type === block.type && block.type === 'text') {
      // 合并连续的文本块
      currentBlock.content += ' ' + block.content
    } else {
      // 不同类型或非文本类型，添加当前块并开始新块
      mergedBlocks.push(currentBlock)
      currentBlock = { ...block }
    }
  }
  
  // 添加最后一个块
  if (currentBlock) {
    mergedBlocks.push(currentBlock)
  }
  
  // 重新组合文本内容（不包含URL的部分）
  const textContent = parts
    .filter(part => !part.startsWith(baseUrl))
    .join(' ')
    .trim()

  return {
    text: textContent,
    files,
    hasFiles: files.length > 0,
    contentBlocks: mergedBlocks
  }
}

/**
 * 将解析后的消息转换为HTML格式
 */
export function formatParsedMessage(parsedMessage: ParsedMessage): string {
  let { text } = parsedMessage
  const { files } = parsedMessage

  // 替换文件链接为HTML元素
  files.forEach((file) => {
    const fileHtml = generateFileHtml(file)
    // 将原始URL替换为HTML
    text = text.replace(file.url, fileHtml)
  })

  // 处理 @mention
  text = text.replace(/@(\w+)(\s|$)/g, '<span class="mention">@$1</span>$2')

  // 处理换行
  text = text.replace(/\n/g, '<br>')

  return text
}

/**
 * 根据文件类型生成对应的HTML
 */
function generateFileHtml(file: ParsedFile): string {
  switch (file.type) {
    case 'image':
      return `<div class="inline-image-container">
        <img src="${file.url}" alt="${file.filename}" class="inline-image" onclick="window.open('${file.url}', '_blank')" />
        <div class="image-overlay">
          <span class="image-label">${file.icon} ${file.label}</span>
        </div>
      </div>`

    case 'video':
      return `<div class="file-link video-link">
        <a href="${file.url}" target="_blank" class="file-link-content">
          <span class="file-icon">${file.icon}</span>
          <div class="file-info">
            <span class="file-type">${file.label}</span>
            <span class="file-name">${file.filename}</span>
          </div>
        </a>
      </div>`

    case 'audio':
      return `<div class="file-link audio-link">
        <a href="${file.url}" target="_blank" class="file-link-content">
          <span class="file-icon">${file.icon}</span>
          <div class="file-info">
            <span class="file-type">${file.label}</span>
            <span class="file-name">${file.filename}</span>
          </div>
        </a>
      </div>`

    default:
      return `<div class="file-link generic-file">
        <a href="${file.url}" target="_blank" class="file-link-content">
          <span class="file-icon">${file.icon}</span>
          <div class="file-info">
            <span class="file-type">${file.label}</span>
            <span class="file-name">${file.filename}</span>
          </div>
        </a>
      </div>`
  }
}

/**
 * 简化版本：直接格式化消息内容
 */
export function formatMessageContent(content: string): string {
  const parsedMessage = parseMessage(content)
  return formatParsedMessage(parsedMessage)
}
