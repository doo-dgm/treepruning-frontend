import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/presentation/stores/auth'

// Layouts
import AuthLayout from '@/ui/layouts/AuthLayout.vue'
import PrivateLayout from '@/ui/layouts/PrivateLayout.vue'

// Views
import LoginView from '@/ui/views/LoginView.vue'
import GestionView from '@/ui/views/GestionView.vue'
import PruningManagement from '@/ui/views/PruningManagement.vue'
import PQR from '@/ui/views/PQR.vue'
import Statistics from '@/ui/views/Statistics.vue'


const routes = [
  // Rutas publicas
  {
    path: '/auth',
    component: AuthLayout,
    redirect: '/auth/login',
    meta: { requiresGuest: true },
    children: [
      {
        path: 'login',
        name: 'Login',
        component: LoginView,
      }
    ],
  },

  // rutas privadas
  {
    path: '/',
    component: PrivateLayout,
    meta: { requiresAuth: true },
    children: [
      { path: 'administracion',
        name: 'administracion',
        component: GestionView,
        meta: {title: 'Administracion'}  },
      { path: 'podas',
        name: 'podas',
        component: PruningManagement,
        meta: {title: 'Manejo de podas'}
       },
      { path: 'pqr',
        name: 'pqr',
        component: PQR,
        meta: {title: 'PQR'}
       },
      { path: 'estadisticas',
        name: 'estadisticas',
        component: Statistics,
        meta: {title: 'Estadísticas'},
      }
    ],
  },

  // 404
  {
    path: '/:pathMatch(.*)*',
    redirect: '/administracion',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // To do
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  // Ruta protegida sin sesión → login
  if (to.meta.requiresAuth && !isAuthenticated) {
    if (to.name === 'Login') return next() // ya estás ahí, no redirigir
    return next({ name: 'Login', query: { redirect: to.fullPath } })
  }

  // Ruta de invitado con sesión → dashboard
  if (to.meta.requiresGuest && isAuthenticated) {
    if (to.name === 'Administracion') return next() // ya estás ahí
    return next({ name: 'Administracion' })
  }

  next()
})

export default router
