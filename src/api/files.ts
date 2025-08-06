import { get, post, del } from '@/utils/request'
import { API_ENDPOINTS } from '@/config/api'

export interface UserFile {
  name: string
  originalName: string
  size: number
  downloadUrl: string
  relativePath: string
  uploadTime: string
}

export interface UploadResponse {
  files: UserFile[]
  message: string
  success: boolean
}

export const filesApi = {
  // 获取文件列表
  getFileList: async (): Promise<UserFile[]> => {
    const response = await get(API_ENDPOINTS.FILES.LIST)
    return response.data || []
  },

  // 上传用户文件
  uploadFile: async (username: string, file: File): Promise<{ url: string; filename: string }> => {
    const formData = new FormData()
    formData.append('file', file)

    console.log('📤 发送文件上传请求:', { username, fileName: file.name, fileSize: file.size })

    try {
      const uploadResult = await post<UploadResponse>(API_ENDPOINTS.FILES.UPLOAD, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      console.log('📥 收到上传响应:', uploadResult)

      // 处理后端返回的数据结构
      if (!uploadResult) {
        console.error('❌ 响应数据为空')
        throw new Error('服务器响应数据为空')
      }

      if (uploadResult.success && uploadResult.files && uploadResult.files.length > 0) {
        const uploadedFile = uploadResult.files[0]

        // 处理downloadUrl，如果已经是完整URL就直接使用，否则添加前缀
        const fileUrl = uploadedFile.downloadUrl
        if (!fileUrl.startsWith('http')) {
          // fileUrl = fileUrl // 保持原值，这里可能需要添加baseURL前缀
        }

        const result = {
          url: fileUrl,
          filename: uploadedFile.name || uploadedFile.originalName
        }
        console.log('✅ 文件上传处理成功:', result)
        return result
      } else {
        console.error('❌ 文件上传失败:', uploadResult)
        throw new Error(uploadResult?.message || '上传失败')
      }
    } catch (error) {
      console.error('❌ 上传请求异常:', error)
      throw error
    }
  },

  // 获取用户文件列表
  getUserFiles: async (username: string): Promise<UserFile[]> => {
    const response = await get(API_ENDPOINTS.FILES.LIST)
    return response.data || []
  },

  // 获取用户文件
  getUserFile: async (username: string, filename: string): Promise<Blob> => {
    const response = await get(API_ENDPOINTS.FILES.GET(username, filename), {
      responseType: 'blob'
    })
    return response
  },

  // 删除用户文件
  deleteUserFile: async (username: string, filename: string): Promise<void> => {
    await del(API_ENDPOINTS.FILES.DELETE(filename))
  }
}
