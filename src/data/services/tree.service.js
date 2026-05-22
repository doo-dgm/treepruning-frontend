import api from './api'

export const treeService = {
  getAll: () => api.get('/trees'),
  getById: (id) => api.get(`/trees/${id}`),
}
