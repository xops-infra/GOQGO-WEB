// 上传文件
export const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await fetch('http://localhost:8080/api/v1/upload', {
    method: 'POST',
    body: formData
  })
  
  if (!response.ok) {
    throw new Error('上传失败')
  }
  
  const data = await response.json()
  return data.url
}
