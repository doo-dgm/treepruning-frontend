import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { initializeKeycloak } from '@/infra/auth/InitializeKeycloak'
import { i18n } from './infra/i18n'
import { VueReCaptcha } from 'vue-recaptcha-v3'
import { config } from '@/infra/config'

import router from './ui/router'
import App from './App.vue'

import './assets/main.css'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

await initializeKeycloak()

app.use(router)
app.use(i18n)
app.use(VueReCaptcha, {
  siteKey: config.recaptchaSiteKey,
  loaderOptions: {
    autoHideBadge: false
  }
})

app.mount('#app')
