<script setup lang="ts">
import { ref }                from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore }       from '@/presentation/stores/auth'
import logo                   from '@/assets/arbol.png'

const router    = useRouter()
const route     = useRoute()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const loading  = ref(false)
const error    = ref<string | null>(null)

async function handleLogin() {
  error.value = null

  if (!username.value || !password.value) {
    error.value = 'Ingresa usuario y contraseña.'
    return
  }

  loading.value = true
  try {
    const result = await authStore.login({
      username: username.value,
      password: password.value,
    })

    if (result.success) {
      const redirect = (route.query.redirect as string) || '/administracion'
      router.push(redirect)
    } else {
      error.value = result.message ?? 'Error de autenticación.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-card">
    <div class="login-card__header">
      <img :src="logo" alt="TreePruning" class="login-card__logo" />
      <h1 class="login-card__title">TreePruning</h1>
      <p class="login-card__subtitle">Sistema de gestión de podas</p>
    </div>

    <form @submit.prevent="handleLogin" novalidate>
      <div v-if="error" class="alert alert-danger py-2 mb-3 text-sm">{{ error }}</div>

      <div class="mb-3">
        <label for="username" class="form-label">Usuario</label>
        <input
          id="username"
          v-model="username"
          type="text"
          class="form-control"
          placeholder="Nombre de usuario"
          autocomplete="username"
          required
        />
      </div>

      <div class="mb-4">
        <label for="password" class="form-label">Contraseña</label>
        <input
          id="password"
          v-model="password"
          type="password"
          class="form-control"
          placeholder="••••••••"
          autocomplete="current-password"
          required
        />
      </div>

      <button type="submit" class="btn btn-success w-100" :disabled="loading">
        <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
        Iniciar sesión
      </button>
    </form>
  </div>
</template>

<style scoped>
.login-card {
  background: #ffffff;
  border-radius: 14px;
  padding: 40px 36px;
  width: 100%;
  max-width: 360px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.10);
}

.login-card__header {
  text-align: center;
  margin-bottom: 28px;
}

.login-card__logo {
  width: 72px;
  height: 72px;
  border-radius: 16px;
  object-fit: contain;
  margin-bottom: 12px;
}

.login-card__title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1a2635;
  margin: 0;
}

.login-card__subtitle {
  font-size: 0.85rem;
  color: #6c757d;
  margin: 4px 0 0;
}

.text-sm {
  font-size: 0.85rem;
}
</style>
