<script setup lang="ts">
import { onMounted }      from 'vue'
import { useRouter }      from 'vue-router'
import { usePermissions } from '@/presentation/composables/usePermissions'
import { useAuthStore }   from '@/presentation/stores/auth'

const router = useRouter()
const auth   = useAuthStore()
const { hasAnyRole } = usePermissions()

onMounted(() => {
  // Redirige al primer módulo con permiso.
  // Fallback: si el JWT no trae los roles esperados o el usuario
  // no tiene ninguno asignado, va a PQR (módulo más accesible).
  if      (hasAnyRole('MANAGER', 'ADMIN')) router.replace({ name: 'podas' })
  else if (hasAnyRole('PERSON'))           router.replace({ name: 'pqr'   })
  else if (auth.isAuthenticated)           router.replace({ name: 'pqr'   })
  else                                     router.replace({ name: 'Login' })
})
</script>

<template>
  <div class="d-flex justify-content-center align-items-center" style="height: 60vh;">
    <div class="text-center text-muted">
      <div class="spinner-border mb-3" role="status"></div>
      <p>Cargando...</p>
    </div>
  </div>
</template>
