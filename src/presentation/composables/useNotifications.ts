import { ref }                 from 'vue'
import { useI18n }             from 'vue-i18n'
import { requestNotificationPermission, onForegroundMessage } from '@/infra/notifications/fcm'
import { notificationService } from '@/data/services/notification.service'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface AppNotification {
  id:    string
  title: string
  body:  string
  time:  Date
  type:  NotificationType
}

// Estado compartido entre todas las instancias del composable
const notifications  = ref<AppNotification[]>([])
const fcmToken       = ref<string | null>(null)
let   unsubscribeFcm: (() => void) | null = null

const AUTO_DISMISS_MS: Record<NotificationType, number> = {
  success: 6_000,
  info:    6_000,
  warning: 8_000,
  error:   10_000,   // los errores duran más para que el usuario los lea
}

function addNotification(title: string, body: string, type: NotificationType = 'info') {
  const id = crypto.randomUUID()
  notifications.value.unshift({ id, title, body, time: new Date(), type })
  setTimeout(() => dismissNotification(id), AUTO_DISMISS_MS[type])
}

function dismissNotification(id: string) {
  notifications.value = notifications.value.filter(n => n.id !== id)
}

export function useNotifications() {

  const { locale } = useI18n()

  async function initNotifications() {
    const token = await requestNotificationPermission()
    if (!token) return

    fcmToken.value = token

    try {
      await notificationService.registerToken(token, locale.value)
    } catch {
      return
    }

    // Cancelar listener anterior (evita duplicados en login/logout/login)
    unsubscribeFcm?.()
    unsubscribeFcm = onForegroundMessage((payload) => {
      // Cuando la app está en primer plano, Firebase no muestra notificación nativa.
      // La mostramos manualmente a través del service worker para tener el mismo
      // comportamiento que en background (notificación del OS, no un toast in-app).
      const title = payload.notification?.title ?? 'TreePruning'
      const body  = payload.notification?.body  ?? ''
      navigator.serviceWorker.ready
        .then(registration => {
          registration.showNotification(title, {
            body,
            icon: '/arbol.png',
          })
        })
        .catch(() => {
          // Fallback: si el SW no está disponible, mostrar toast in-app
          addNotification(title, body, 'info')
        })
    })
  }

  async function clearNotifications() {
    unsubscribeFcm?.()
    unsubscribeFcm = null

    if (fcmToken.value) {
      try { await notificationService.unregisterToken(fcmToken.value) } catch { /* best-effort */ }
      fcmToken.value = null
    }
    notifications.value = []
  }

  return {
    notifications,
    fcmToken,
    initNotifications,
    clearNotifications,
    dismissNotification,
    /** Notificación local inmediata (sin FCM) — útil para confirmaciones y errores */
    addLocalNotification: addNotification,
  }
}
