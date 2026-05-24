import { createRouter, createWebHistory } from 'vue-router'
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/presentation/stores/auth'

// Layouts
import AuthLayout    from '@/ui/layouts/AuthLayout.vue'
import PrivateLayout from '@/ui/layouts/PrivateLayout.vue'

// Views
import LoginView        from '@/ui/views/LoginView.vue'
import Administration   from '@/ui/views/GestionView.vue'
import PruningManagement from '@/ui/views/PruningManagement.vue'
import PQR              from '@/ui/views/PQR.vue'
import Statistics       from '@/ui/views/StatisticsPanel.vue'
import HomeView        from '@/ui/views/HomeView.vue'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?:  boolean
    requiresGuest?: boolean
    roles?:         string[]
    title?:         string
  }
}

const routes = [

  {
    path:      '/auth',
    component: AuthLayout,
    redirect:  '/auth/login',
    meta:      { requiresGuest: true },
    children: [
      {
        path:      'login',
        name:      'Login',
        component: LoginView,
      },
    ],
  },

  {
    path:      '/',
    component: PrivateLayout,
    meta:      { requiresAuth: true },
    children: [
      {
        path:      '',           // ← ruta raíz '/'
        name:      'home',
        component: HomeView,     // o redirige al primer módulo que tenga permiso
        meta:      { title: 'Inicio' },  // ← sin roles
      },
      {
        path:      'administracion',
        name:      'administracion',
        component: Administration,
        meta:      { title: 'Administracion', roles: ['gestion.read'] },
      },
      {
        path:      'podas',
        name:      'podas',
        component: PruningManagement,
        meta:      { title: 'Manejo de podas', roles: ['prunings.read'] },
      },
      {
        path:      'pqr',
        name:      'pqr',
        component: PQR,
        meta:      { title: 'PQR', roles: ['pqrs.read'] },
      },
      {
        path:      'estadisticas',
        name:      'estadisticas',
        component: Statistics,
        meta:      { title: 'Estadísticas', roles: ['statistics.read'] },
      },
    ],
  },

  // 404
  {
    path:     '/:pathMatch(.*)*',
    redirect: '/home',        // ← cambia a home
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// guard
router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next({ name: 'Login', query: { redirect: to.fullPath } })
  }

  if (to.meta.requiresGuest && auth.isAuthenticated) {
    return next({ name: 'home' })     // ← cambia a home
  }

  const requiredRoles = to.meta.roles as string[] | undefined
  if (requiredRoles?.length && !auth.hasAnyRole(...requiredRoles)) {
    return next({ name: 'home' })     // ← cambia a home
  }

  next()
})

export default router
