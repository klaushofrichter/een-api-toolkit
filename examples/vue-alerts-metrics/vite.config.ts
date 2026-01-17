import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    // IMPORTANT: Must use 127.0.0.1:3333 for EEN OAuth callback
    // The EEN Identity Provider only permits this specific redirect URI
    host: '127.0.0.1',
    port: 3333
  }
})
