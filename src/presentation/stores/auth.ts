import { defineStore }    from 'pinia'
import { ref, computed }  from 'vue'
import { keycloakClient } from '@/infra/auth/KeycloakClient'
import { parseRoles }     from '@/infra/auth/parseRoles'
import { getRecaptchaToken } from '@/infra/recaptcha/recaptcha'
import { useNotifications } from '../composables/useNotifications'

export interface AuthSession {
  token:        string
  refreshToken: string
  user:         Record<string, unknown>
}

export const useAuthStore = defineStore('auth', () => {

  const token        = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const user         = ref<Record<string, unknown> | null>(null)

  const loginAttempts  = ref(0)
  const requireCaptcha = computed(() => loginAttempts.value >= 1)

  // ── Roles extraídos del JWT ──────────────────────────
  const roles = computed<string[]>(() =>
    user.value ? parseRoles(user.value) : []
  )

  const isAuthenticated = computed(() => !!token.value)

  function hasRole(role: string): boolean {
    return roles.value.includes(role)
  }

  function hasAnyRole(...requiredRoles: string[]): boolean {
    return requiredRoles.some(r => roles.value.includes(r))
  }

  function hasAllRoles(...requiredRoles: string[]): boolean {
    return requiredRoles.every(r => roles.value.includes(r))
  }


  // ── Acción logout ────────────────────────────────────
  async function logout() {
    const { clearNotifications } = useNotifications()
    await clearNotifications()
    await keycloakClient.logout()
    clearSession()
  }



  // ── Mutaciones internas ──────────────────────────────
  function setSession(session: AuthSession) {
    token.value        = session.token
    refreshToken.value = session.refreshToken
    user.value         = session.user
  }

  function clearSession() {
    token.value        = null
    refreshToken.value = null
    user.value         = null
  }

  async function login(credentials: { username: string; password: string }) {
  let recaptchaToken: string | undefined

  // A partir del segundo intento solicita reCAPTCHA
  if (requireCaptcha.value) {
    try {
      recaptchaToken = await getRecaptchaToken('login')
    } catch {
      loginAttempts.value = 0
      return { success: false, message: 'Verificación de seguridad no disponible. Intenta de nuevo.' }
    }
  }

  const result = await keycloakClient.login({ ...credentials, recaptchaToken })

  if (result.success && result.session) {
    setSession(result.session!)
    loginAttempts.value = 0
    const { initNotifications } = useNotifications()
    try { await initNotifications() } catch { /* no crítico */ }
  } else {
    loginAttempts.value++
  }

  return result
}

  return {
    token, refreshToken, user, roles,
    isAuthenticated, requireCaptcha,
    hasRole, hasAnyRole, hasAllRoles,
    login, logout,
    setSession, clearSession,
  }
})
