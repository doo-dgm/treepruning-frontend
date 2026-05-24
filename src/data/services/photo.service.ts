import api              from '@/infra/api'
import type { ApiResponse } from '@/data/types/ApiResponse'

export interface PhotoUploadResult {
  path: string
}

export const photoService = {
  upload: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<ApiResponse<PhotoUploadResult>>('/photos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
