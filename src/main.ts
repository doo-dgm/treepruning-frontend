import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { initializeKeycloak } from './infra/auth/Initializekeycloak'
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
app.mount('#app')
