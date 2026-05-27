<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter }           from 'vue-router'
import { useI18n }             from 'vue-i18n'
import { useAuthStore }        from '@/presentation/stores/auth'
import { usePermissions }      from '@/presentation/composables/usePermissions'
import { useNotifications }    from '@/presentation/composables/useNotifications'
import logo from '@/assets/arbol.png'

const props = defineProps<{
  collapsed: boolean   // desktop: solo iconos
  open:      boolean   // mobile: drawer visible
}>()

const emit = defineEmits<{
  toggle: []   // colapsar/expandir en desktop
  close:  []   // cerrar drawer en mobile
}>()

const { t, locale }           = useI18n()
const router                  = useRouter()
const { logout }              = useAuthStore()
const { hasAnyRole }          = usePermissions()
const { updateTokenLanguage } = useNotifications()

const LANG_KEY = 'tree-pruning-lang'

function setLocale(lang: string) {
  locale.value = lang
  localStorage.setItem(LANG_KEY, lang)
  // Sincronizar el idioma en el token FCM para que las notificaciones push
  // lleguen en el idioma correcto desde el backend.
  updateTokenLanguage(lang)
}

onMounted(() => {
  const saved = localStorage.getItem(LANG_KEY)
  if (saved === 'es' || saved === 'en') locale.value = saved
})

const nav = [
  { to: '/administracion', labelKey: 'nav.administration', icon: '🗂️', roles: ['MANAGER', 'ADMIN']           },
  { to: '/podas',          labelKey: 'nav.prunings',       icon: '🌿', roles: ['MANAGER', 'ADMIN']           },
  { to: '/pqr',            labelKey: 'nav.pqr',            icon: '📋', roles: ['PERSON', 'MANAGER', 'ADMIN'] },
  { to: '/estadisticas',   labelKey: 'nav.statistics',     icon: '📊', roles: ['MANAGER', 'ADMIN']           },
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
  <aside class="sidebar" :class="{ 'sidebar--collapsed': collapsed, 'sidebar--open': open }">

    <!-- Cabecera: logo + título + botón cerrar (mobile) -->
    <div class="sidebar__brand">
      <img :src="logo" alt="TreePruning" class="sidebar__logo" />
      <span v-if="!collapsed" class="sidebar__title">TreePruning</span>
      <!-- Botón X visible solo en mobile -->
      <button class="sidebar__close" aria-label="Cerrar menú" @click="emit('close')">✕</button>
    </div>

    <!-- Navegación -->
    <nav class="sidebar__nav flex-grow-1">
      <router-link
        v-for="item in visibleNav"
        :key="item.to"
        :to="item.to"
        class="sidebar__link"
        active-class="sidebar__link--active"
        @click="emit('close')"
      >
        <span class="sidebar__icon" :title="collapsed ? t(item.labelKey) : ''">{{ item.icon }}</span>
        <span v-if="!collapsed" class="sidebar__label">{{ t(item.labelKey) }}</span>
      </router-link>
    </nav>

    <!-- Pie: idioma + logout + toggle desktop -->
    <div class="sidebar__footer">
      <div v-if="!collapsed" class="sidebar__lang">
        <span class="sidebar__lang-label">{{ t('lang.label') }}</span>
        <div class="sidebar__lang-toggle">
          <button
            class="sidebar__lang-btn"
            :class="{ 'sidebar__lang-btn--active': locale === 'es' }"
            @click="setLocale('es')"
          >ES</button>
          <button
            class="sidebar__lang-btn"
            :class="{ 'sidebar__lang-btn--active': locale === 'en' }"
            @click="setLocale('en')"
          >EN</button>
        </div>
      </div>

      <button v-if="!collapsed" class="sidebar__logout" @click="handleLogout">
        {{ t('auth.logout') }}
      </button>
      <button v-else class="sidebar__logout sidebar__logout--icon" :title="t('auth.logout')" @click="handleLogout">
        🚪
      </button>

      <!-- Botón colapsar/expandir — solo desktop -->
      <button class="sidebar__toggle-btn" :title="collapsed ? 'Expandir' : 'Colapsar'" @click="emit('toggle')">
        ☰
      </button>
    </div>
  </aside>
</template>

<style scoped>
/* ── Base ─────────────────────────────────────────────────────────────────── */
.sidebar {
  width: 240px;
  min-height: 100vh;
  background: #1a2635;
  color: #cfd8e3;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  transition: width 0.25s ease, transform 0.25s ease;
  overflow: hidden;
}

/* ── Colapso (desktop) ───────────────────────────────────────────────────── */
.sidebar--collapsed {
  width: 60px;
}

/* ── Cabecera ─────────────────────────────────────────────────────────────── */
.sidebar__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 12px 16px;
  border-bottom: 1px solid #2e3f52;
  min-height: 64px;
}

.sidebar__logo {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  object-fit: contain;
  flex-shrink: 0;
}

.sidebar__title {
  font-size: 1rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.5px;
  white-space: nowrap;
  flex: 1;
}

/* Botón X — oculto en desktop, visible en mobile */
.sidebar__close {
  display: none;
  background: none;
  border: none;
  color: #cfd8e3;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 4px;
  margin-left: auto;
  line-height: 1;
}

/* ── Navegación ──────────────────────────────────────────────────────────── */
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
  white-space: nowrap;
}

.sidebar--collapsed .sidebar__link {
  justify-content: center;
  padding: 10px 0;
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
  font-size: 1.1rem;
  width: 22px;
  text-align: center;
  flex-shrink: 0;
}

/* ── Pie ──────────────────────────────────────────────────────────────────── */
.sidebar__footer {
  padding: 12px;
  border-top: 1px solid #2e3f52;
  display: flex;
  flex-direction: column;
  gap: 8px;
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
.sidebar__logout:hover { background: #e02c18; }

.sidebar__logout--icon {
  font-size: 1.1rem;
  padding: 8px 0;
}

/* Botón ◀ / ▶ para colapsar/expandir en desktop */
.sidebar__toggle-btn {
  width: 100%;
  padding: 6px 0;
  background: #2e3f52;
  color: #cfd8e3;
  border: none;
  border-radius: 8px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.sidebar__toggle-btn:hover {
  background: #3d5166;
  color: #fff;
}

/* ── Idioma ───────────────────────────────────────────────────────────────── */
.sidebar__lang {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar__lang-label {
  font-size: 0.78rem;
  color: #c4d4e4;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sidebar__lang-toggle {
  display: flex;
  background: #0f1c29;
  border-radius: 6px;
  padding: 2px;
  gap: 2px;
}

.sidebar__lang-btn {
  padding: 3px 10px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #c4d4e4;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  letter-spacing: 0.5px;
  transition: background 0.15s, color 0.15s;
}
.sidebar__lang-btn:hover { color: #ffffff; }
.sidebar__lang-btn--active {
  background: #1abc9c;
  color: #ffffff;
}

/* ── Mobile (≤ 768px) ────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100dvh;
    z-index: 1000;
    transform: translateX(-100%);
    width: 260px !important;  /* siempre completo en mobile */
  }

  /* Drawer abierto */
  .sidebar--open {
    transform: translateX(0);
  }

  /* Mostrar botón X en mobile */
  .sidebar__close {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Ocultar botón de colapso en mobile */
  .sidebar__toggle-btn {
    display: none;
  }
}
</style>
