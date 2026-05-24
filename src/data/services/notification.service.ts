import api              from '@/infra/api'
import type { ApiResponse } from '@/data/types/ApiResponse'

export const notificationService = {
  registerToken: (token: string) =>
    api.post<ApiResponse<void>>('/notifications/token', { token }),

  unregisterToken: (token: string) =>
    api.post<ApiResponse<void>>('/notifications/token/unregister', { token }),
}
