import api from '@/infra/api'
import type { ApiResponse } from '@/data/types/ApiResponse'

export interface PruningType {
  id:   string
  name: string
  [key: string]: unknown
}

export const pruningTypeService = {
  getAll:   ()              => api.get<ApiResponse<PruningType[]>>('/types'),
  getById:  (id: string)    => api.get<ApiResponse<PruningType>>(`/types/${id}`),
}
