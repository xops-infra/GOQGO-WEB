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
 * 解析的消息内容
 */
export interface ParsedMessage {
  text: string
  files: ParsedFile[]
  hasFiles: boolean
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

/**
 * 检查URL是否为本地服务器文件
 */
function isLocalServerFile(url: string): boolean {
  return url.includes('localhost:8080') || url.includes('127.0.0.1:8080')
}

/**
 * 解析消息内容，识别文件链接
 */
export function parseMessage(content: string): ParsedMessage {
  const files: ParsedFile[] = []
  const textContent = content

  // 正则表达式匹配 http://localhost:8080 开头的文件链接
  const fileUrlRegex = /(https?:\/\/(?:localhost|127\.0\.0\.1):8080[^\s]+)/g

  let match
  while ((match = fileUrlRegex.exec(content)) !== null) {
    const url = match[1]
    const extension = getFileExtension(url)
    const filename = getFilename(url)
    const type = getFileType(extension)

    // 只处理本地服务器的文件
    if (isLocalServerFile(url)) {
      files.push({
        type,
        url,
        extension,
        filename,
        icon: getFileIcon(type),
        label: getFileLabel(type)
      })
    }
  }

  return {
    text: textContent,
    files,
    hasFiles: files.length > 0
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
