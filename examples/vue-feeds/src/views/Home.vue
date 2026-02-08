<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore, getStorageStrategy, STORAGE_STRATEGY_DESCRIPTIONS } from 'een-api-toolkit'

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)

const storageStrategy = getStorageStrategy()
const storageDescription = STORAGE_STRATEGY_DESCRIPTIONS[storageStrategy]
</script>

<template>
  <div class="home">
    <h2>Welcome to the EEN Feeds Example</h2>

    <div v-if="!isAuthenticated" class="login-prompt" data-testid="not-authenticated">
      <p>Please log in to view camera feeds.</p>
      <router-link to="/login">
        <button data-testid="login-button">Login with Eagle Eye Networks</button>
      </router-link>
    </div>

    <div v-else class="authenticated" data-testid="authenticated">
      <p>You are logged in!</p>
      <div class="button-group">
        <router-link to="/feeds">
          <button data-testid="view-feeds-button">View Camera Feeds</button>
        </router-link>
      </div>
    </div>

    <div class="description">
      <h3>About This Example</h3>
      <p>
        This example demonstrates using the EEN Feeds API to list available
        streaming feeds from cameras and display live video previews. It showcases
        the following toolkit functions:
      </p>
      <ul>
        <li><code>getCameras()</code> - List available cameras</li>
        <li><code>listFeeds()</code> - List feeds with streaming URLs</li>
        <li><code>initMediaSession()</code> - Initialize session cookie for media access</li>
      </ul>
      <p class="feature-note">
        Click "View" on any feed with a multipart URL to see a live preview.
        The toolkit handles media session cookie initialization automatically.
      </p>
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

.login-prompt,
.authenticated {
  text-align: center;
  padding: 30px;
  margin-bottom: 30px;
  background: #f8f9fa;
  border-radius: 8px;
}

.login-prompt p,
.authenticated p {
  margin-bottom: 20px;
  color: #666;
}

.button-group {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.description {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.description h3 {
  margin-bottom: 15px;
  color: #2c3e50;
}

.description ul {
  margin-top: 15px;
  padding-left: 25px;
}

.description li {
  margin-bottom: 8px;
}

.description code {
  background: #e9ecef;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: monospace;
}

.feature-note {
  margin-top: 15px;
  padding: 10px;
  background: #e8f4fd;
  border-left: 3px solid #3498db;
  border-radius: 0 4px 4px 0;
  font-size: 14px;
  color: #2c3e50;
}

.storage-note {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #ddd;
  font-size: 0.85em;
  color: #888;
}
</style>
