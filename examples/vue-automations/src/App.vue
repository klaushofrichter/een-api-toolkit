<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAuthStore } from 'een-api-toolkit'

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)

// Initialize auth store from storage on app mount
onMounted(() => {
  authStore.initialize()
})
</script>

<template>
  <div id="app">
    <header>
      <h1 data-testid="app-title">EEN Automations Example</h1>
      <nav>
        <router-link to="/" data-testid="nav-home">Home</router-link>
        <template v-if="isAuthenticated">
          <router-link to="/automations" data-testid="nav-automations">Automations</router-link>
          <router-link to="/logout" data-testid="nav-logout">Logout</router-link>
        </template>
        <template v-else>
          <router-link to="/login" data-testid="nav-login">Login</router-link>
        </template>
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
  background: #f5f5f5;
}

#app {
  min-height: 100vh;
}

header {
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 15px 20px;
}

header h1 {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

nav {
  display: flex;
  gap: 15px;
}

nav a {
  color: #4a90a4;
  text-decoration: none;
}

nav a:hover {
  text-decoration: underline;
}

nav a.router-link-active {
  font-weight: bold;
}

main {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

button {
  padding: 10px 20px;
  background: #4a90a4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

button:hover {
  background: #3a7a94;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error {
  color: #c00;
  padding: 10px;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 4px;
  margin: 10px 0;
}

.loading {
  color: #666;
  padding: 20px;
  text-align: center;
}
</style>
