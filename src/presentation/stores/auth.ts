import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token        = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const user         = ref<Record<string, any> | null>(null)
  const loading      = ref(false)

  const isAuthenticated = computed(() => !!token.value)

  function setSession(session: { token: string; refreshToken?: string; user: any }) {
    token.value        = session.token
    refreshToken.value = session.refreshToken ?? null
    user.value         = session.user
  }

  function clearSession() {
    token.value        = null
    refreshToken.value = null
    user.value         = null
  }

  return { token, refreshToken, user, loading, isAuthenticated, setSession, clearSession }
})
