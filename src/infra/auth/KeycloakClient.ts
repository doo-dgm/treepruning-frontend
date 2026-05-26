// src/infra/auth/KeycloakClient.ts
import { keycloakStorage } from './keycloakStorage'

const KC_ISSUER = import.meta.env.VITE_KEYCLOAK_ISSUER_URI
const KC_CLIENT = import.meta.env.VITE_KEYCLOAK_CLIENT
const API_BASE  = import.meta.env.VITE_API_BASE_URL

// Login va al backend (valida reCAPTCHA + llama a Keycloak internamente)
const loginEndpoint  = `${API_BASE}/auth/login`
// Refresh y logout siguen yendo directo a Keycloak
const tokenEndpoint  = `${KC_ISSUER}/protocol/openid-connect/token`
const logoutEndpoint = `${KC_ISSUER}/protocol/openid-connect/logout`


export interface AuthSession {
  token:        string
  refreshToken: string
  user:         Record<string, unknown>
}

export interface LoginResult {
  success: boolean
  session?: AuthSession
  message?: string
}


let _refreshTimer: ReturnType<typeof setTimeout> | null = null

function scheduleRefresh(expiresInSeconds: number) {
  if (_refreshTimer) clearTimeout(_refreshTimer)
  const delay = (expiresInSeconds - 30) * 1000
  _refreshTimer = setTimeout(() => keycloakClient.updateToken(), delay)
}


export const keycloakClient = {

  async login(credentials: { username: string; password: string; recaptchaToken?: string }): Promise<LoginResult> {
    let response: Response
    try {
      response = await fetch(loginEndpoint, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username:       credentials.username,
          password:       credentials.password,
          recaptchaToken: credentials.recaptchaToken ?? '',
        }),
      })
    } catch {
      return { success: false, message: 'Error de conexión. Verifica tu red.' }
    }

    let body: any
    try { body = await response.json() } catch { body = null }

    if (!response.ok) {
      // El backend devuelve ApiResponse<Void> con { status, message, data }
      const msg = body?.message ?? 'Error de autenticación.'
      return { success: false, message: msg }
    }

    // El backend devuelve ApiResponse<LoginResponseDTO>:
    // { status, message, data: { accessToken, refreshToken, expiresIn } }
    const dto    = body?.data
    const user   = parseJwt(dto.accessToken)
    const session: AuthSession = {
      token:        dto.accessToken,
      refreshToken: dto.refreshToken,
      user,
    }

    keycloakStorage.setTokens(session.token, session.refreshToken, session.user)
    scheduleRefresh(dto.expiresIn)

    return { success: true, session }
  },

  async logout(): Promise<void> {
    const refreshToken = keycloakStorage.getRefreshToken()

    if (refreshToken) {
      await fetch(logoutEndpoint, {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id:     KC_CLIENT,
          refresh_token: refreshToken,
        }),
      }).catch(() => {})
    }

    if (_refreshTimer) clearTimeout(_refreshTimer)
    keycloakStorage.clear()
  },

  async updateToken(): Promise<AuthSession | null> {
    const refreshToken = keycloakStorage.getRefreshToken()
    if (!refreshToken) return null

    try {
      const response = await fetch(tokenEndpoint, {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type:    'refresh_token',
          client_id:     KC_CLIENT,
          refresh_token: refreshToken,
        }),
      })

      if (!response.ok) {
        await keycloakClient.logout()
        return null
      }

      const data    = await response.json()
      const user    = parseJwt(data.access_token)
      const session: AuthSession = {
        token:        data.access_token,
        refreshToken: data.refresh_token,
        user,
      }

      keycloakStorage.setTokens(session.token, session.refreshToken, session.user)
      scheduleRefresh(data.expires_in)

      return session

    } catch {
      await keycloakClient.logout()
      return null
    }
  },

  getPersistedSession(): AuthSession | null {
    const token        = keycloakStorage.getToken()
    const refreshToken = keycloakStorage.getRefreshToken()
    const user         = keycloakStorage.getUser<Record<string, unknown>>()

    if (!token || !refreshToken) return null
    return { token, refreshToken, user: user ?? {} }
  },
}

function parseJwt(jwt: string): Record<string, unknown> {
  const base64 = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(atob(base64))
}

function mapError(error: string): string {
  const messages: Record<string, string> = {
    invalid_grant:       'Usuario o contraseña incorrectos.',
    unauthorized_client: 'Cliente no autorizado.',
    invalid_client:      'Configuración de cliente inválida.',
  }
  return messages[error] ?? 'Error de autenticación.'
}
