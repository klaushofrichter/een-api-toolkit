<script setup lang="ts">
import { useAuthStore } from 'een-api-toolkit'
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const refreshFailed = computed(() => authStore.refreshFailed)
const refreshFailedMessage = computed(() => authStore.refreshFailedMessage)
const isRefreshing = computed(() => authStore.isRefreshing)

// Reactive tick to force re-computation of tokenExpiresIn
const tick = ref(0)
let tickInterval: ReturnType<typeof setInterval> | null = null

const tokenExpiresIn = computed(() => {
  // Reference tick to trigger reactivity
  void tick.value
  const ms = authStore.tokenExpiresIn
  if (!ms) return null
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}m ${seconds}s`
})

onMounted(() => {
  // Update every 10 seconds
  tickInterval = setInterval(() => {
    tick.value++
  }, 10000)
})

onUnmounted(() => {
  if (tickInterval) {
    clearInterval(tickInterval)
  }
})

function dismissRefreshError() {
  authStore.clearRefreshFailed()
}

function handleRelogin() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="app">
    <!-- Session refresh banner -->
    <div v-if="refreshFailed" class="refresh-banner error-banner">
      <span>Session refresh failed: {{ refreshFailedMessage }}</span>
      <div class="banner-actions">
        <button class="small" @click="handleRelogin">Re-login</button>
        <button class="small secondary" @click="dismissRefreshError">Dismiss</button>
      </div>
    </div>
    <div v-else-if="isRefreshing" class="refresh-banner info-banner">
      <span>Refreshing session...</span>
    </div>

    <header>
      <h1 data-testid="app-title">EEN Event Subscriptions</h1>
      <nav>
        <router-link data-testid="nav-home" to="/">Home</router-link>
        <router-link data-testid="nav-subscriptions" v-if="isAuthenticated" to="/subscriptions">Subscriptions</router-link>
        <router-link data-testid="nav-live" v-if="isAuthenticated" to="/live">Live Events</router-link>
        <router-link data-testid="nav-login" v-if="!isAuthenticated" to="/login">Login</router-link>
        <router-link data-testid="nav-logout" v-if="isAuthenticated" to="/logout">Logout</router-link>
        <span v-if="isAuthenticated && tokenExpiresIn" class="token-info" title="Token expires in">
          {{ tokenExpiresIn }}
        </span>
      </nav>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  line-height: 1.6;
  color: #333;
}

.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

header h1 {
  font-size: 1.5rem;
}

nav {
  display: flex;
  gap: 20px;
}

nav a {
  color: #42b883;
  text-decoration: none;
}

nav a:hover {
  text-decoration: underline;
}

nav a.router-link-active {
  font-weight: bold;
}

button {
  background: #42b883;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

button:hover {
  background: #3aa876;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

button.danger {
  background: #e74c3c;
}

button.danger:hover {
  background: #c0392b;
}

button.secondary {
  background: #95a5a6;
}

button.secondary:hover {
  background: #7f8c8d;
}

.error {
  color: #e74c3c;
  padding: 10px;
  background: #fdf2f2;
  border-radius: 4px;
  margin: 10px 0;
}

.loading {
  color: #666;
  font-style: italic;
}

.success {
  color: #27ae60;
  padding: 10px;
  background: #eafaf1;
  border-radius: 4px;
  margin: 10px 0;
}

/* Session refresh banner */
.refresh-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  margin-bottom: 15px;
  border-radius: 4px;
  font-size: 14px;
}

.error-banner {
  background: #fdf2f2;
  color: #e74c3c;
  border: 1px solid #f5c6cb;
}

.info-banner {
  background: #e8f4fd;
  color: #2980b9;
  border: 1px solid #bee5eb;
}

.banner-actions {
  display: flex;
  gap: 8px;
}

button.small {
  padding: 6px 12px;
  font-size: 12px;
}

/* Token expiry indicator */
.token-info {
  font-size: 12px;
  color: #888;
  padding: 4px 8px;
  background: #f5f5f5;
  border-radius: 4px;
  font-family: monospace;
}
</style>
