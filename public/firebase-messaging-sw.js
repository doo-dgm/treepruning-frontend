importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey:            self.VITE_FIREBASE_API_KEY            || '',
  authDomain:        self.VITE_FIREBASE_AUTH_DOMAIN        || '',
  projectId:         self.VITE_FIREBASE_PROJECT_ID         || '',
  messagingSenderId: self.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId:             self.VITE_FIREBASE_APP_ID             || '',
})

const messaging = firebase.messaging()

// Maneja notificaciones en background
messaging.onBackgroundMessage((payload) => {
  const { title = 'TreePruning', body = '' } = payload.notification ?? {}

  self.registration.showNotification(title, {
    body,
    icon: '/arbol.png',
  })
})
