import api from './api'

export const pruningTypeService = {
  getAll: () => api.get('/pruning-types'),
  getById: (id) => api.get(`/pruning-types/${id}`),
}
