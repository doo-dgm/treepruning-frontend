import api from '@/infra/api'
import type { ApiResponse } from '@/data/types/ApiResponse'

export interface Quadrille {
  id:   string
  quadrilleName: string
  [key: string]: unknown
}

export const quadrilleService = {
  getAll:   ()              => api.get<ApiResponse<Quadrille[]>>('/quadrilles'),
  getById:  (id: string)    => api.get<ApiResponse<Quadrille>>(`/quadrilles/${id}`),
}
