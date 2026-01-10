<script setup lang="ts">
import { getAuthUrl, getStorageStrategy, STORAGE_STRATEGY_DESCRIPTIONS } from 'een-api-toolkit'

const storageStrategy = getStorageStrategy()
const storageDescription = STORAGE_STRATEGY_DESCRIPTIONS[storageStrategy]

function login() {
  // Redirect to EEN OAuth login
  window.location.href = getAuthUrl()
}
</script>

<template>
  <div class="login">
    <h2>Login</h2>
    <p>Click the button below to login with your Eagle Eye Networks account.</p>
    <button @click="login">Login with Eagle Eye Networks</button>
    <p class="storage-note" data-testid="storage-strategy">Storage strategy: <strong>{{ storageStrategy }}</strong> ({{ storageDescription }})</p>
  </div>
</template>

<style scoped>
.login {
  text-align: center;
  max-width: 400px;
  margin: 0 auto;
}

h2 {
  margin-bottom: 20px;
}

p {
  margin-bottom: 20px;
  color: #666;
}

.storage-note {
  margin-top: 30px;
  font-size: 0.85em;
  color: #888;
}
</style>
