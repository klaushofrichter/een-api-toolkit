import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { initEenToolkit } from 'een-api-toolkit'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// Install Pinia (required before initEenToolkit)
app.use(createPinia())

// Initialize EEN API Toolkit with memory storage for maximum security
// Note: Using 'memory' storage means tokens are lost on page refresh
initEenToolkit({
  proxyUrl: import.meta.env.VITE_PROXY_URL,
  clientId: import.meta.env.VITE_EEN_CLIENT_ID,
  redirectUri: import.meta.env.VITE_REDIRECT_URI,
  storageStrategy: 'memory',
  debug: import.meta.env.VITE_DEBUG === 'true'
})

// Install router
app.use(router)

app.mount('#app')
