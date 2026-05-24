import api from '@/infra/api'
import type { Pruning, PruningForm } from '@/domain/pruning/PruningEntity'
import type { ApiResponse, PagedResponse  } from '@/data/types/ApiResponse'

export const pruningService = {
  getAll: () => api.get<ApiResponse<PagedResponse<Pruning>>>('/prunings'),
  getById:    (id: string)        => api.get<ApiResponse<Pruning>>(`/prunings/${id}`),
  schedule:   (data: PruningForm) => api.post<ApiResponse<void>>('/prunings', data),
}
