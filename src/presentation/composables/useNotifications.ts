import { ref }                           from 'vue'
import { requestNotificationPermission, onForegroundMessage } from '@/infra/notifications/fcm'
import { notificationService }           from '@/data/services/notification.service'

export interface AppNotification {
  id:    string
  title: string
  body:  string
  time:  Date
}

const notifications = ref<AppNotification[]>([])
const fcmToken      = ref<string | null>(null)

export function useNotifications() {

  async function initNotifications() {
    const token = await requestNotificationPermission()
    if (!token) return

    fcmToken.value = token

    await notificationService.registerToken(token)

    onForegroundMessage((payload) => {
      const notification: AppNotification = {
        id:    crypto.randomUUID(),
        title: payload.notification?.title ?? 'Notificación',
        body:  payload.notification?.body  ?? '',
        time:  new Date(),
      }
      notifications.value.unshift(notification)
    })
  }

  async function clearNotifications() {
    if (fcmToken.value) {
      await notificationService.unregisterToken(fcmToken.value)
      fcmToken.value = null
    }
    notifications.value = []
  }

  function dismissNotification(id: string) {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  return {
    notifications,
    fcmToken,
    initNotifications,
    clearNotifications,
    dismissNotification,
  }
}
