<script setup lang="ts">
import { useRouter }      from 'vue-router'
import { usePermissions } from '@/presentation/composables/usePermissions'

const router = useRouter()
const { hasAnyRole } = usePermissions()

// Redirige al primer módulo con permiso
if      (hasAnyRole('MANAGER', 'ADMIN')) router.replace({ name: 'podas' })
else if (hasAnyRole('PERSON'))           router.replace({ name: 'pqr' })
</script>

<template>
  <div class="container mt-4">
    <p>Cargando...</p>
  </div>
</template>
