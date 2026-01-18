<script setup lang="ts">
import { useAuthStore, getCurrentUser, getStorageStrategy, STORAGE_STRATEGY_DESCRIPTIONS, type UserProfile, type EenError } from 'een-api-toolkit'
import { computed, ref, onMounted } from 'vue'

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)

const storageStrategy = getStorageStrategy()
const storageDescription = STORAGE_STRATEGY_DESCRIPTIONS[storageStrategy]

// Reactive state for current user
const user = ref<UserProfile | null>(null)
const loading = ref(false)
const error = ref<EenError | null>(null)

// Copy feedback state
const tokenCopied = ref(false)
const baseUrlCopied = ref(false)

async function fetchUser() {
  if (!isAuthenticated.value) return

  loading.value = true
  error.value = null

  const result = await getCurrentUser()
  if (result.error) {
    error.value = result.error
    user.value = null
  } else {
    user.value = result.data
  }

  loading.value = false
}

async function copyAccessToken() {
  const token = authStore.token
  if (!token) return

  await navigator.clipboard.writeText(token)
  tokenCopied.value = true
  setTimeout(() => {
    tokenCopied.value = false
  }, 2000)
}

async function copyBaseUrl() {
  const baseUrl = authStore.baseUrl
  if (!baseUrl) return

  await navigator.clipboard.writeText(baseUrl)
  baseUrlCopied.value = true
  setTimeout(() => {
    baseUrlCopied.value = false
  }, 2000)
}

onMounted(() => {
  if (isAuthenticated.value) {
    fetchUser()
  }
})
</script>

<template>
  <div class="home">
    <h2>Welcome to the EEN Alerts & Metrics Example</h2>

    <div v-if="isAuthenticated" data-testid="authenticated">
      <div v-if="loading" class="loading">Loading user info...</div>
      <div v-else-if="error" class="error">{{ error.message }}</div>
      <div v-else-if="user" class="user-info" data-testid="user-info">
        <p>Logged in as: <strong>{{ user.firstName }} {{ user.lastName }}</strong></p>
        <p>Email: {{ user.email }}</p>
        <div class="copy-buttons">
          <button @click="copyAccessToken" class="copy-button" data-testid="copy-token-button">
            {{ tokenCopied ? 'Copied!' : 'Copy Access Token' }}
          </button>
          <button @click="copyBaseUrl" class="copy-button" data-testid="copy-baseurl-button">
            {{ baseUrlCopied ? 'Copied!' : 'Copy Base URL' }}
          </button>
        </div>
      </div>

    </div>

    <div v-else class="login-prompt" data-testid="not-authenticated">
      <p>Please log in to view alerts, notifications, and metrics.</p>
      <router-link to="/login">
        <button data-testid="login-button">Login</button>
      </router-link>
    </div>

    <div class="description">
      <h3>About This Example</h3>
      <p>
        This example demonstrates how to use the <code>getEventMetrics</code>,
        <code>listAlerts</code>, and <code>listNotifications</code> functions
        from the EEN API Toolkit to display a dashboard with metrics charts,
        alerts, and notifications.
      </p>
      <h4>Features</h4>
      <ul>
        <li>Select a camera to view its data</li>
        <li>Time range selector (1h, 6h, 24h, 7d)</li>
        <li>Event metrics visualization with Chart.js</li>
        <li>Alerts list with filtering by camera</li>
        <li>Notifications list with read status</li>
        <li>Pagination with "Load More" buttons</li>
        <li>Copy buttons to easily grab the access token and base URL for direct API testing</li>
      </ul>
      <p class="storage-note" data-testid="storage-strategy">
        Storage strategy: <strong>{{ storageStrategy }}</strong> ({{ storageDescription }})
      </p>
    </div>
  </div>
</template>

<style scoped>
.home {
  max-width: 600px;
  margin: 0 auto;
}

h2 {
  margin-bottom: 20px;
}

.user-info {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.user-info p {
  margin: 5px 0;
}

.copy-buttons {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.copy-button {
  padding: 8px 12px;
  font-size: 0.85em;
  background: #fff;
  color: #333;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;
}

.copy-button:hover {
  background: #e8e8e8;
  border-color: #999;
  color: #000;
}

.login-prompt {
  text-align: center;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 20px;
}

.login-prompt p {
  margin-bottom: 15px;
}

.description {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.description h3 {
  margin-bottom: 10px;
}

.description h4 {
  margin-top: 15px;
  margin-bottom: 10px;
}

.description p {
  color: #666;
  margin-bottom: 15px;
}

.description ul {
  list-style: disc;
  padding-left: 20px;
  color: #666;
}

.description code {
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.9em;
}

.storage-note {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #ddd;
  font-size: 0.85em;
  color: #888;
}
</style>
