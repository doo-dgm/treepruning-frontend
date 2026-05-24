<script setup lang="ts">
import { useRouter }      from 'vue-router'
import { usePermissions } from '@/presentation/composables/usePermissions'

const router = useRouter()
const { hasAnyRole } = usePermissions()

// Redirige al primer módulo con permiso
if      (hasAnyRole('prunings.read'))  router.replace({ name: 'podas' })
else if (hasAnyRole('pqrs.read'))      router.replace({ name: 'pqr' })
else if (hasAnyRole('statistics.read')) router.replace({ name: 'estadisticas' })
else if (hasAnyRole('gestion.read'))   router.replace({ name: 'administracion' })
</script>

<template>
  <div class="container mt-4">
    <p>Cargando...</p>
  </div>
</template>
