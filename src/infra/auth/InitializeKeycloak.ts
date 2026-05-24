import { keycloakClient } from './KeycloakClient'
import { useAuthStore }   from '../../presentation/stores/auth'

export async function initializeKeycloak() {
  const authStore = useAuthStore()

  // 1. Restaura sesión persistida (sin HTTP)
  const persisted = keycloakClient.getPersistedSession()
  if (!persisted) return

  authStore.setSession(persisted)

  // 2. Valida que el token siga vigente refrescándolo
  const refreshed = await keycloakClient.updateToken()
  if (refreshed) {
    authStore.setSession(refreshed)
  } else {
    authStore.clearSession()
  }
}
