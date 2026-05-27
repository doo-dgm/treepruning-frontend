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

    const savedLang = localStorage.getItem('tree-pruning-lang')
    const language  = (savedLang === 'es' || savedLang === 'en')
      ? savedLang
      : (i18n.global.locale.value ?? 'es')

    try {
      await notificationService.registerToken(token, language)
    } catch {
      return
    }

    unsubscribeFcm?.()
    unsubscribeFcm = onForegroundMessage((payload) => {

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

  async function updateTokenLanguage(language: string) {
    if (!fcmToken.value) return
    try {
      await notificationService.registerToken(fcmToken.value, language)
    } catch {/**/ }
  }

  return {
    notifications,
    fcmToken,
    initNotifications,
    clearNotifications,
    dismissNotification,
    updateTokenLanguage,
    addLocalNotification: addNotification,
  }
}
