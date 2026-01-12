<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from 'een-api-toolkit'

const authStore = useAuthStore()

// Initialize auth store from localStorage on app mount
onMounted(() => {
  authStore.initialize()
})
</script>

<template>
  <div id="app">
    <header>
      <h1>EEN Media Example</h1>
      <nav>
        <router-link to="/" data-testid="nav-home">Home</router-link>
        <router-link v-if="!authStore.isAuthenticated" to="/login" data-testid="nav-login">Login</router-link>
        <router-link v-if="authStore.isAuthenticated" to="/live" data-testid="nav-live">Live Camera Image</router-link>
        <router-link v-if="authStore.isAuthenticated" to="/recorded" data-testid="nav-recorded">Recorded Image</router-link>
        <router-link v-if="authStore.isAuthenticated" to="/hls" data-testid="nav-hls">HLS Video</router-link>
        <router-link v-if="authStore.isAuthenticated" to="/logout" data-testid="nav-logout">Logout</router-link>
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  line-height: 1.6;
  color: #333;
  background: #f5f5f5;
}

#app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

header {
  background: #2c3e50;
  color: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

header h1 {
  margin-bottom: 15px;
}

nav {
  display: flex;
  gap: 15px;
}

nav a {
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

nav a:hover {
  background: rgba(255, 255, 255, 0.1);
}

nav a.router-link-active {
  background: rgba(255, 255, 255, 0.2);
}

main {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #2c3e50;
  margin-bottom: 20px;
}

button {
  background: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

button:hover {
  background: #2980b9;
}

button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.error {
  color: #e74c3c;
  padding: 15px;
  background: #fdf0ef;
  border-radius: 4px;
  margin-bottom: 20px;
}
</style>
