import { useAuthStore } from '@/presentation/stores/auth'
import { storeToRefs } from 'pinia'

export function usePermissions() {
  const store = useAuthStore()
  const { roles, isAuthenticated } = storeToRefs(store)

  return {
    roles,
    isAuthenticated,
    hasRole:     (role: string)          => store.hasRole(role),
    hasAnyRole:  (...r: string[])        => store.hasAnyRole(...r),
    hasAllRoles: (...r: string[])        => store.hasAllRoles(...r),
  }
}
