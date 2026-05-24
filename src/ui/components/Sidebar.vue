<!-- src/ui/components/SidebarNav.vue -->
<script setup lang="ts">
import { computed }       from 'vue'
import { useRouter }      from 'vue-router'
import { useI18n }        from 'vue-i18n'
import { useAuthStore }   from '@/presentation/stores/auth'
import { usePermissions } from '@/presentation/composables/usePermissions'
import logo from '@/assets/arbol.png'

const { t }           = useI18n()
const router          = useRouter()
const { logout }      = useAuthStore()
const { hasAnyRole }  = usePermissions()

const nav = [
  { to: '/administracion', labelKey: 'nav.administration', icon: '🗂️', roles: ['gestion.read']     },
  { to: '/podas',          labelKey: 'nav.prunings',       icon: '🌿', roles: ['prunings.read']     },
  { to: '/pqr',            labelKey: 'nav.pqr',            icon: '📋', roles: ['pqrs.read']         },
  { to: '/estadisticas',   labelKey: 'nav.statistics',     icon: '📊', roles: ['statistics.read']   },
]

const visibleNav = computed(() =>
  nav.filter(item => item.roles.length === 0 || hasAnyRole(...item.roles))
)

async function handleLogout() {
  await logout()
  router.push('/auth/login')
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
        v-for="item in visibleNav"
        :key="item.to"
        :to="item.to"
        class="sidebar__link"
        active-class="sidebar__link--active"
      >
        <span class="sidebar__icon">{{ item.icon }}</span>
        {{ t(item.labelKey) }}
      </router-link>
    </nav>

    <div class="sidebar__footer">
      <button class="sidebar__logout" @click="handleLogout">
        {{ t('auth.logout') }}
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
