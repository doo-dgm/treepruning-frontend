const TOKEN_KEY   = 'tree-prunning-token'
const REFRESH_KEY = 'tree-prunning-refresh-token'
const USER_KEY    = 'tree-prunning-user'

export const keycloakStorage = {
  getToken():        string | null { return localStorage.getItem(TOKEN_KEY)   },
  getRefreshToken(): string | null { return localStorage.getItem(REFRESH_KEY) },
  getUser<T>():      T | null {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) as T : null
  },

  setTokens(token: string, refreshToken: string, user: unknown) {
    localStorage.setItem(TOKEN_KEY,   token)
    localStorage.setItem(REFRESH_KEY, refreshToken)
    localStorage.setItem(USER_KEY,    JSON.stringify(user))
  },

  clear() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem(USER_KEY)
  },
}
