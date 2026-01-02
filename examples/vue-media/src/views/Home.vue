<script setup lang="ts">
import { useAuthStore } from 'een-api-toolkit'

const authStore = useAuthStore()
</script>

<template>
  <div class="home">
    <h2>Welcome to the EEN Media Example</h2>

    <div v-if="!authStore.isAuthenticated" class="login-prompt" data-testid="not-authenticated">
      <p>Please log in to view live camera images.</p>
      <router-link to="/login">
        <button data-testid="login-button">Login with Eagle Eye Networks</button>
      </router-link>
    </div>

    <div v-else class="authenticated" data-testid="authenticated">
      <p>You are logged in!</p>
      <div class="button-group">
        <router-link to="/live">
          <button data-testid="view-live-button">View Live Camera</button>
        </router-link>
        <router-link to="/recorded">
          <button data-testid="view-recorded-button">View Recorded Images</button>
        </router-link>
      </div>
    </div>

    <div class="description">
      <h3>About This Example</h3>
      <p>
        This example demonstrates using the EEN Media API to fetch live and recorded images from cameras.
        It showcases the following toolkit functions:
      </p>
      <ul>
        <li><code>getCameras()</code> - List available cameras</li>
        <li><code>getLiveImage()</code> - Fetch live preview images</li>
        <li><code>getRecordedImage()</code> - Fetch recorded preview images</li>
      </ul>
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
</style>
