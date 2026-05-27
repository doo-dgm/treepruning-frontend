import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue                       from '@vitejs/plugin-vue'
import vueDevTools               from 'vite-plugin-vue-devtools'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [
      vue(),
      vueDevTools(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true,
        },
      },
    },

    define: {
      __VITE_API_URL__:                 JSON.stringify('__VITE_API_URL__'),
      __VITE_KEYCLOAK_ISSUER_URI__:          JSON.stringify('__VITE_KEYCLOAK_ISSUER_URI__'),
      __VITE_KEYCLOAK_CLIENT__:              JSON.stringify('__VITE_KEYCLOAK_CLIENT__'),
      __VITE_FIREBASE_API_KEY__:             JSON.stringify('__VITE_FIREBASE_API_KEY__'),
      __VITE_FIREBASE_AUTH_DOMAIN__:         JSON.stringify('__VITE_FIREBASE_AUTH_DOMAIN__'),
      __VITE_FIREBASE_PROJECT_ID__:          JSON.stringify('__VITE_FIREBASE_PROJECT_ID__'),
      __VITE_FIREBASE_MESSAGING_SENDER_ID__: JSON.stringify('__VITE_FIREBASE_MESSAGING_SENDER_ID__'),
      __VITE_FIREBASE_APP_ID__:              JSON.stringify('__VITE_FIREBASE_APP_ID__'),
      __VITE_FIREBASE_VAPID_KEY__:           JSON.stringify('__VITE_FIREBASE_VAPID_KEY__'),
      __VITE_GOOGLE_MAPS_API_KEY__:          JSON.stringify('__VITE_GOOGLE_MAPS_API_KEY__'),
      __VITE_RECAPTCHA_SITE_KEY__:           JSON.stringify('__VITE_RECAPTCHA_SITE_KEY__'),
      __VITE_STRAPI_URL__:                   JSON.stringify('__VITE_STRAPI_URL__'),
    },
  }
})
