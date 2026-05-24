import { defineStore }    from 'pinia'
import { ref, computed }  from 'vue'
import { keycloakClient } from '@/infra/auth/keycloakClient'
import { parseRoles }     from '@/infra/auth/parseRoles'

export interface AuthSession {
  token:        string
  refreshToken: string
  user:         Record<string, unknown>
}

export const useAuthStore = defineStore('auth', () => {

  const token        = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const user         = ref<Record<string, unknown> | null>(null)

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


  async function login(credentials: { username: string; password: string }) {
    const result = await keycloakClient.login(credentials)
    if (result.success && result.session) {
      setSession(result.session)
    }
    return result
  }

  // ── Acción logout ────────────────────────────────────
  async function logout() {
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

  return {
    token, refreshToken, user, roles,
    isAuthenticated,
    hasRole, hasAnyRole, hasAllRoles,
    login, logout,
    setSession, clearSession,
  }
})
