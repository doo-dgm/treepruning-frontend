/**
 * Muestra una notificación nativa del sistema operativo a través del service worker.
 *
 * - Funciona tanto con la app en primer plano como en segundo plano.
 * - Requiere que el permiso de notificaciones esté concedido.
 * - Si el service worker no está disponible o el permiso fue denegado, no hace nada.
 */
export function showBrowserNotification(
  title: string,
  body:  string,
  icon = '/arbol.png',
): void {
  if (Notification.permission !== 'granted') return

  navigator.serviceWorker.ready
    .then(registration => {
      registration.showNotification(title, { body, icon })
    })
    .catch(err => {
      console.warn('[notification] No se pudo mostrar notificación nativa:', err)
    })
}
