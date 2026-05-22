import api from './api'

export const pruningService = {
  getAll: () => api.get('/prunings'),
  getById: (id) => api.get(`/prunings/${id}`),
  schedule: (data) => api.post('/prunings', data),
}
