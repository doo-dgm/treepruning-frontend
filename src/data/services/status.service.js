import api from './api'

export const statusService = {
  getAll: () => api.get('/statuses'),
  getById: (id) => api.get(`/statuses/${id}`),
}
