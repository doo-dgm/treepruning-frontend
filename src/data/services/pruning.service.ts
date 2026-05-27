import api from '@/infra/api'
import type { Pruning, PruningForm } from '@/domain/pruning/PruningEntity'
import type { ApiResponse, PagedResponse  } from '@/data/types/ApiResponse'
import type { PreventivePayload } from '@/domain/pruning/SchedulePreventivePruningUseCase'

export const pruningService = {
  getAll: () => api.get<ApiResponse<PagedResponse<Pruning>>>('/prunings'),
  getById: (id: string) => api.get<ApiResponse<Pruning>>(`/prunings/${id}`),

  schedule: (data: PruningForm) => {
    const payload = {
      ...data,
      executedDate:           data.executedDate           || null,
      photographicRecordPath: data.photographicRecordPath || null,
    }
    return api.post<ApiResponse<void>>('/prunings', payload)
  },

  schedulePreventive: (data: PreventivePayload) =>
    api.post<ApiResponse<{ count: number }>>('/prunings', data),
}
