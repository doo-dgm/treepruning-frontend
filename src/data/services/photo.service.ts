import api              from '@/infra/api'
import type { ApiResponse } from '@/data/types/ApiResponse'

export interface PhotoUploadResult {
  path: string
}

export interface PhotoUrlsResult {
  urls:             string[]
  expiresInSeconds: number
}

export const photoService = {
  upload: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<ApiResponse<PhotoUploadResult>>('/photos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  getUrls: (pruningId: string) =>
    api.get<ApiResponse<PhotoUrlsResult>>(`/prunings/${pruningId}/photo-url`),
}
