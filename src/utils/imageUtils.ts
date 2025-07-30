/**
 * 图片处理工具函数
 */

// 图片粘贴处理
export const handleImagePaste = async (clipboardData: DataTransfer): Promise<string | null> => {
  const items = Array.from(clipboardData.items)
  
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile()
      if (file) {
        // 生成临时文件路径
        const timestamp = Date.now()
        const randomId = Math.floor(Math.random() * 10000)
        const extension = getFileExtension(file.type)
        const fileName = `image_${timestamp}_${randomId}.${extension}`
        const tempPath = `/Users/mikas/Library/Application Support/cliExtra/temp_images/${fileName}`
        
        // 创建临时URL用于预览
        const tempUrl = URL.createObjectURL(file)
        
        // 返回图片路径格式
        return tempPath
      }
    }
  }
  
  return null
}

// 获取文件扩展名
const getFileExtension = (mimeType: string): string => {
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

// 保存图片到临时目录
export const saveImageToTemp = async (file: File): Promise<string> => {
  const timestamp = Date.now()
  const randomId = Math.floor(Math.random() * 10000)
  const extension = file.name.split('.').pop() || getFileExtension(file.type)
  const fileName = `image_${timestamp}_${randomId}.${extension}`
  const tempPath = `/Users/mikas/Library/Application Support/cliExtra/temp_images/${fileName}`
  
  // 这里实际上需要通过API将文件保存到指定路径
  // 暂时返回模拟路径，实际实现需要调用后端API
  return tempPath
}

// 检查是否为图片路径格式
export const isImagePath = (content: string): boolean => {
  const imagePathPattern = /^\[图片\]\(([^)]+)\)$/
  return imagePathPattern.test(content)
}

// 从图片路径格式中提取路径
export const extractImagePath = (content: string): string | null => {
  const imagePathPattern = /^\[图片\]\(([^)]+)\)$/
  const match = content.match(imagePathPattern)
  return match ? match[1] : null
}

// 生成图片路径格式
export const formatImagePath = (imagePath: string): string => {
  return `[图片](${imagePath})`
}

// 检查图片文件是否存在
export const checkImageExists = async (imagePath: string): Promise<boolean> => {
  try {
    // 这里需要调用API检查文件是否存在
    // 暂时返回true，实际实现需要调用后端API
    return true
  } catch {
    return false
  }
}

// 获取图片预览URL
export const getImagePreviewUrl = (imagePath: string): string => {
  // 如果是本地路径，转换为可访问的URL
  if (imagePath.startsWith('/Users/')) {
    // 这里需要通过API获取图片的预览URL
    // 暂时返回file://协议的URL，实际实现需要调用后端API
    return `file://${imagePath}`
  }
  return imagePath
}

// 压缩图片（可选功能）
export const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<Blob> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    
    img.onload = () => {
      const { width, height } = img
      const ratio = Math.min(maxWidth / width, maxWidth / height)
      
      canvas.width = width * ratio
      canvas.height = height * ratio
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      
      canvas.toBlob(resolve, 'image/jpeg', quality)
    }
    
    img.src = URL.createObjectURL(file)
  })
}
