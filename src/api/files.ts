import axios from '@/utils/axios'
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
  // 上传用户文件
  uploadFile: async (username: string, file: File): Promise<{ url: string; filename: string }> => {
    const formData = new FormData()
    formData.append('file', file)

    console.log('📤 发送文件上传请求:', { username, fileName: file.name, fileSize: file.size })

    try {
      // 注意：由于axios响应拦截器返回response.data，所以这里的response实际上是数据本身
      const uploadResult = await axios.post<UploadResponse>(API_ENDPOINTS.FILES.UPLOAD, formData, {
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
        let fileUrl = uploadedFile.downloadUrl
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
      if (error.response) {
        console.error('❌ 错误响应:', error.response.status, error.response.data)
      }
      throw error
    }
  },

  // 获取用户文件列表
  getUserFiles: async (username: string): Promise<UserFile[]> => {
    const response = await axios.get(API_ENDPOINTS.FILES.UPLOAD)
    return response.data
  },

  // 获取用户文件
  getUserFile: async (username: string, filename: string): Promise<Blob> => {
    const response = await axios.get(API_ENDPOINTS.FILES.GET(filename), {
      responseType: 'blob'
    })
    return response.data
  },

  // 删除用户文件
  deleteUserFile: async (username: string, filename: string): Promise<void> => {
    await axios.delete(API_ENDPOINTS.FILES.DELETE(filename))
  }
}
