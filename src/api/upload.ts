import { useUserStore } from '@/stores/user'
import { buildApiUrl, API_ENDPOINTS } from '@/config/api'

interface UploadResponse {
  files: Array<{
    name: string
    originalName: string
    size: number
    downloadUrl: string
    relativePath: string
    uploadTime: string
  }>
  message: string
  success: boolean
}

// 上传文件
export const uploadFile = async (file: File): Promise<string> => {
  const userStore = useUserStore()
  const username = userStore.currentUser.username

  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(buildApiUrl(API_ENDPOINTS.FILES.UPLOAD), {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    throw new Error('上传失败')
  }

  const data: UploadResponse = await response.json()

  // 处理后端返回的数据结构
  if (data.success && data.files && data.files.length > 0) {
    const uploadedFile = data.files[0]
    const fileUrl = uploadedFile.downloadUrl
    if (!fileUrl.startsWith('http')) {
      // fileUrl = fileUrl // 保持原值，这里可能需要添加baseURL前缀
    }
    return fileUrl
  } else {
    throw new Error(data.message || '上传失败')
  }
}

// 获取用户文件列表
export const getUserFiles = async (username?: string): Promise<any[]> => {
  const userStore = useUserStore()
  const targetUsername = username || userStore.currentUser.username

  const response = await fetch(buildApiUrl(API_ENDPOINTS.FILES.UPLOAD))

  if (!response.ok) {
    throw new Error('获取文件列表失败')
  }

  return response.json()
}

// 获取用户文件
export const getUserFile = async (filename: string, username?: string): Promise<Blob> => {
  const userStore = useUserStore()
  const targetUsername = username || userStore.currentUser.username

  const response = await fetch(buildApiUrl(API_ENDPOINTS.FILES.GET(filename)))

  if (!response.ok) {
    throw new Error('获取文件失败')
  }

  return response.blob()
}
