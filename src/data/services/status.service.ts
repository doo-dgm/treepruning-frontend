import api from '@/infra/api'
import type { ApiResponse } from '@/data/types/ApiResponse'

export interface Status {
  id:   string
  name: string
  [key: string]: unknown
}

export const statusService = {
  getAll:  ()           => api.get<ApiResponse<Status[]>>('/statuses'),
  getById: (id: string) => api.get<ApiResponse<Status>>(`/statuses/${id}`),
}
