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
      'self.VITE_FIREBASE_API_KEY':              JSON.stringify(env.VITE_FIREBASE_API_KEY),
      'self.VITE_FIREBASE_AUTH_DOMAIN':          JSON.stringify(env.VITE_FIREBASE_AUTH_DOMAIN),
      'self.VITE_FIREBASE_PROJECT_ID':           JSON.stringify(env.VITE_FIREBASE_PROJECT_ID),
      'self.VITE_FIREBASE_MESSAGING_SENDER_ID':  JSON.stringify(env.VITE_FIREBASE_MESSAGING_SENDER_ID),
      'self.VITE_FIREBASE_APP_ID':               JSON.stringify(env.VITE_FIREBASE_APP_ID),
      'self.VITE_FIREBASE_VAPID_KEY':           JSON.stringify(env.VITE_FIREBASE_VAPID_KEY),
    },
  }
})
