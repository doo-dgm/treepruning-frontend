import api from './api'

export const quadrilleService = {
  getAll: () => api.get('/quadrilles'),
  getById: (id) => api.get(`/quadrilles/${id}`),
}
