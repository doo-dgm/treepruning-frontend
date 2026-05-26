import { ref }                 from 'vue'
import { requestNotificationPermission, onForegroundMessage } from '@/infra/notifications/fcm'
import { notificationService } from '@/data/services/notification.service'

export interface AppNotification {
  id:    string
  title: string
  body:  string
  time:  Date
}

// Estado compartido entre todas las instancias del composable
const notifications  = ref<AppNotification[]>([])
const fcmToken       = ref<string | null>(null)
let   unsubscribeFcm: (() => void) | null = null

const AUTO_DISMISS_MS = 6_000

function addNotification(title: string, body: string) {
  const id = crypto.randomUUID()
  notifications.value.unshift({ id, title, body, time: new Date() })
  // Auto-dismiss: registrado aquí, justo cuando se crea la notificación
  setTimeout(() => dismissNotification(id), AUTO_DISMISS_MS)
}

function dismissNotification(id: string) {
  notifications.value = notifications.value.filter(n => n.id !== id)
}

export function useNotifications() {

  async function initNotifications() {
    const token = await requestNotificationPermission()
    if (!token) return

    fcmToken.value = token

    try {
      await notificationService.registerToken(token)
    } catch {
      return
    }

    // Cancelar listener anterior si existe (evita duplicados si el usuario
    // hace login/logout/login sin recargar la página)
    unsubscribeFcm?.()
    unsubscribeFcm = onForegroundMessage((payload) => {
      addNotification(
        payload.notification?.title ?? 'Notificación',
        payload.notification?.body  ?? '',
      )
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
  }
}
