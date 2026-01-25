<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useAuthStore } from 'een-api-toolkit'

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)

// Initialize auth store from storage on app mount
// This restores the session if a valid token exists in localStorage/sessionStorage
onMounted(() => {
  authStore.initialize()
})
</script>

<template>
  <div class="app">
    <header>
      <h1>EEN Bridges Example</h1>
      <nav>
        <router-link to="/" data-testid="nav-home">Home</router-link>
        <router-link v-if="isAuthenticated" to="/bridges" data-testid="nav-bridges">Bridges</router-link>
        <router-link v-if="!isAuthenticated" to="/login" data-testid="nav-login">Login</router-link>
        <router-link v-if="isAuthenticated" to="/logout" data-testid="nav-logout">Logout</router-link>
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
</style>
