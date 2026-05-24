importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey:            'AIzaSyDQW3iAoG5U7iZdXuVn8TvZESmymQTyBEw',         // ← valor real del .env
  authDomain:        'tree-pruning-3d771.firebaseapp.com',
  projectId:         'tree-pruning-3d771',
  messagingSenderId: '1075159830302',
  appId:             '1:1075159830302:web:213c8b398a1cb410d0830f',
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  const { title = 'TreePruning', body = '' } = payload.notification ?? {}
  self.registration.showNotification(title, {
    body,
    icon: '/arbol.png',
  })
})
