import { ref }                 from 'vue'
import { i18n }               from '@/infra/i18n'
import { requestNotificationPermission, onForegroundMessage } from '@/infra/notifications/fcm'
import { showBrowserNotification } from '@/infra/notifications/showBrowserNotification'
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

export function addNotification(title: string, body: string, type: NotificationType = 'info') {
  const id = crypto.randomUUID()
  notifications.value.unshift({ id, title, body, time: new Date(), type })
  setTimeout(() => dismissNotification(id), AUTO_DISMISS_MS[type])
}

function dismissNotification(id: string) {
  notifications.value = notifications.value.filter(n => n.id !== id)
}

export function useNotifications() {

  async function initNotifications() {
    const token = await requestNotificationPermission()
    if (!token) return

    fcmToken.value = token

    // i18n.global es el singleton del módulo — no requiere contexto de componente,
    // por lo que es seguro llamarlo desde store actions y composables fuera de setup()
    const language = i18n.global.locale.value ?? 'es'

    try {
      await notificationService.registerToken(token, language)
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
      showBrowserNotification(title, body)
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
