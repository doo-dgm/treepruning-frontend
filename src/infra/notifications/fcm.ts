import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import type { MessagePayload }               from 'firebase/messaging'
import { firebaseApp }                       from './firebase.config'

const messaging = getMessaging(firebaseApp)

// ── Solicita permiso y obtiene el FCM token ────────────
export async function requestNotificationPermission(): Promise<string | null> {
  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.warn('Permiso de notificaciones denegado.')
      return null
    }

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    })

    return token ?? null
  } catch (error) {
    console.error('Error al obtener FCM token:', error)
    return null
  }
}

// ── Escucha notificaciones cuando la app está en primer plano ──
export function onForegroundMessage(callback: (payload: MessagePayload) => void) {
  return onMessage(messaging, callback)
}
