import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/presentation/stores/auth'

export function authGuard(
  to:   RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  const auth = useAuthStore()

  // 1. Ruta pública → pasa directo
  if (!to.meta.requiresAuth) return next()

  // 2. No autenticado → redirige al login
  if (!auth.isAuthenticated) return next({ name: 'login' })

  // 3. Ruta requiere roles específicos
  const requiredRoles = to.meta.roles as string[] | undefined
  if (requiredRoles?.length && !auth.hasAnyRole(...requiredRoles)) {
    return next({ name: 'forbidden' })   // o la ruta que uses para 403
  }

  next()
}
