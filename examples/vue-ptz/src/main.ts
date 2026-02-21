import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { initEenToolkit } from 'een-api-toolkit'
import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

// Install Pinia FIRST (required before initEenToolkit)
app.use(pinia)
app.use(router)

// Initialize the EEN API Toolkit
initEenToolkit({
  proxyUrl: import.meta.env.VITE_PROXY_URL,
  clientId: import.meta.env.VITE_EEN_CLIENT_ID,
  redirectUri: import.meta.env.VITE_REDIRECT_URI || 'http://127.0.0.1:3333',
  debug: import.meta.env.VITE_DEBUG === 'true'
})

app.mount('#app')
