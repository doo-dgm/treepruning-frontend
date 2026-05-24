import api from '@/infra/api'
import type { ApiResponse } from '@/data/types/ApiResponse'

export interface Tree {
  id:      string
  species: string
  [key: string]: unknown
}

export const treeService = {
  getAll:   ()              => api.get<ApiResponse<Tree[]>>('/trees'),
  getById:  (id: string)    => api.get<ApiResponse<Tree>>(`/trees/${id}`),
  getBySector:     (sectorId: string) => api.get<ApiResponse<Tree[]>>(`/trees?sectorId=${sectorId}`),
}
