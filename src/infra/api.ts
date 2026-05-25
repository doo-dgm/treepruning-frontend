import axios from 'axios'
import { useAuthStore } from '@/presentation/stores/auth'
import { config } from '@/infra/config'

const api = axios.create({
  baseURL: config.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message ?? error.message
    return Promise.reject(new Error(message))
  },
)

export default {
  get:    <T>(url: string)                                    => api.get<T>(url)             as unknown as Promise<T>,
  post:   <T>(url: string, data?: unknown, config?: object)   => api.post<T>(url, data, config) as unknown as Promise<T>,
  put:    <T>(url: string, data?: unknown, config?: object)   => api.put<T>(url, data, config)  as unknown as Promise<T>,
  delete: <T>(url: string)                                    => api.delete<T>(url)          as unknown as Promise<T>,
}
