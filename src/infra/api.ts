import axios from 'axios'
import { useAuthStore } from '@/presentation/stores/auth'
import { keycloakClient } from '@/infra/auth/KeycloakClient'
import { config } from '@/infra/config'

const api = axios.create({
  baseURL: config.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

/** Devuelve true si el JWT ya expiró o expira en menos de 30 segundos. */
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(
      atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
    )
    return payload.exp < Math.floor(Date.now() / 1000) + 30
  } catch {
    return true
  }
}

api.interceptors.request.use(async (reqConfig) => {
  const auth = useAuthStore()
  if (auth.token) {
    // Si el token expiró o está a punto de expirar, renovarlo antes de enviar
    if (isTokenExpired(auth.token)) {
      const session = await keycloakClient.updateToken()
      if (session) {
        auth.setSession(session)
      }
    }
    if (auth.token) {
      reqConfig.headers.Authorization = `Bearer ${auth.token}`
    }
  }
  return reqConfig
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
