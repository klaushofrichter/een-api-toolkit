<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAuthStore, getStorageStrategy, STORAGE_STRATEGY_DESCRIPTIONS } from 'een-api-toolkit'

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
const copied = ref(false)

const storageStrategy = getStorageStrategy()
const storageDescription = STORAGE_STRATEGY_DESCRIPTIONS[storageStrategy]

async function copyToken() {
  if (!authStore.token) return
  await navigator.clipboard.writeText(authStore.token)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>

<template>
  <div class="home">
    <h2>Welcome to the EEN PTZ Control Example</h2>

    <div v-if="!isAuthenticated" class="login-prompt" data-testid="not-authenticated">
      <p>Please log in to control PTZ cameras.</p>
      <router-link to="/login">
        <button data-testid="login-button">Login with Eagle Eye Networks</button>
      </router-link>
    </div>

    <div v-else class="authenticated" data-testid="authenticated">
      <p>You are logged in!</p>
      <div class="auth-info">
        <div class="info-row">
          <span class="info-label">Base URL:</span>
          <code class="info-value">{{ authStore.baseUrl }}</code>
        </div>
        <div class="info-row">
          <span class="info-label">Access Token:</span>
          <button class="copy-btn" :class="{ 'copy-success': copied }" @click="copyToken" data-testid="copy-token">
            {{ copied ? 'Copied!' : 'Copy to Clipboard' }}
          </button>
        </div>
      </div>
      <div class="button-group">
        <router-link to="/ptz">
          <button data-testid="view-ptz-button">PTZ Camera Control</button>
        </router-link>
      </div>
    </div>

    <div class="description">
      <h3>About This Example</h3>
      <p>
        This example demonstrates PTZ (Pan/Tilt/Zoom) camera control using the
        EEN API toolkit. It showcases the following toolkit functions:
      </p>
      <ul>
        <li><code>getCameras()</code> - List available cameras</li>
        <li><code>getPtzPosition()</code> - Read current camera position</li>
        <li><code>movePtz()</code> - Move camera (position, direction, centerOn)</li>
        <li><code>getPtzSettings()</code> - Get presets and automation settings</li>
        <li><code>updatePtzSettings()</code> - Manage presets and modes</li>
      </ul>
      <p class="feature-note">
        Select a PTZ-capable camera to see live video with interactive controls
        including a direction pad, click-to-center, and preset management.
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

.auth-info {
  margin-bottom: 20px;
  text-align: left;
  background: white;
  padding: 12px 15px;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 0;
}

.info-label {
  font-size: 13px;
  font-weight: 600;
  color: #555;
  white-space: nowrap;
}

.info-value {
  font-size: 12px;
  background: #f4f4f4;
  padding: 2px 8px;
  border-radius: 3px;
  word-break: break-all;
}

.copy-btn {
  padding: 4px 12px;
  font-size: 12px;
  background: #6c757d;
  border-radius: 4px;
  transition: background 0.2s;
}

.copy-btn:hover {
  background: #5a6268;
}

.copy-success {
  background: #27ae60;
}

.copy-success:hover {
  background: #219a52;
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
