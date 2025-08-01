// 获取文件扩展名
export const getFileExtension = (mimeType: string): string => {
  const mimeMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/bmp': 'bmp'
  }
  return mimeMap[mimeType] || 'png'
}

// 格式化文件大小
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// 生成文件名
export const generateFileName = (file: File): string => {
  const timestamp = Date.now()
  const randomId = Math.floor(Math.random() * 10000)
  const extension = file.name.split('.').pop() || getFileExtension(file.type)
  return `image_${timestamp}_${randomId}.${extension}`
}
