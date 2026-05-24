import api from '@/infra/api'
import type { ApiResponse } from '@/data/types/ApiResponse'

export interface Sector {
  id:   string
  name: string
  [key: string]: unknown
}

export const sectorService = {
  getAll:  ()           => api.get<ApiResponse<Sector[]>>('/sectors'),
  getById: (id: string) => api.get<ApiResponse<Sector>>(`/sectors/${id}`),
}
