<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/presentation/stores/auth'
import logo from '@/assets/arbol.png'

const router = useRouter()
const { logout } = useAuthStore()

const nav = [
  { to: '/administracion', label: 'Administración', icon: '🗂️' },
  { to: '/podas',          label: 'Podas',           icon: '🌿' },
  { to: '/pqr',            label: 'PQR',              icon: '📋' },
  { to: '/estadisticas',   label: 'Estadísticas',    icon: '📊' },
]

function handleLogout() {
  logout()
  router.push('/login')
}
</script>

<template>
  <aside class="sidebar d-flex flex-column">
    <div class="sidebar__brand">
      <img :src="logo" alt="TreePruning" class="sidebar__logo" />
      <span class="sidebar__title">TreePruning</span>
    </div>

    <nav class="sidebar__nav flex-grow-1">
      <router-link
        v-for="item in nav"
        :key="item.to"
        :to="item.to"
        class="sidebar__link"
        active-class="sidebar__link--active"
      >
        <span class="sidebar__icon">{{ item.icon }}</span>
        {{ item.label }}
      </router-link>
    </nav>

    <div class="sidebar__footer">
      <button class="sidebar__logout" @click="handleLogout">
        Cerrar sesión
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 240px;
  min-height: 100vh;
  background: #1a2635;
  color: #cfd8e3;
  flex-shrink: 0;
}

.sidebar__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 16px 16px;
  border-bottom: 1px solid #2e3f52;
}

.sidebar__logo {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  object-fit: contain;
}

.sidebar__title {
  font-size: 1rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.5px;
}

.sidebar__nav {
  display: flex;
  flex-direction: column;
  padding: 12px 8px;
  gap: 2px;
}

.sidebar__link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  color: #cfd8e3;
  text-decoration: none;
  font-size: 0.9rem;
  transition: background 0.15s, color 0.15s;
}

.sidebar__link:hover {
  background: #2e3f52;
  color: #ffffff;
}

.sidebar__link--active {
  background: #1abc9c;
  color: #ffffff;
  font-weight: 600;
}

.sidebar__icon {
  font-size: 1rem;
  width: 20px;
  text-align: center;
}

.sidebar__footer {
  padding: 16px;
  border-top: 1px solid #2e3f52;
}

.sidebar__logout {
  width: 100%;
  padding: 9px 0;
  background: #b81f0e;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.sidebar__logout:hover {
  background: #e02c18;
}
</style>
