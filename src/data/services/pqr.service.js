import api from './api'

export const pqrService = {
  submit: (data) => api.post('/pqrs', data),
}
