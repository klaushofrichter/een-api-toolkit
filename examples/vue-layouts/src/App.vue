<script setup lang="ts">
import { useAuthStore } from 'een-api-toolkit'
import { computed } from 'vue'

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
</script>

<template>
  <div class="app">
    <header>
      <h1 data-testid="app-title">EEN Layouts Example</h1>
      <nav>
        <router-link data-testid="nav-home" to="/">Home</router-link>
        <router-link data-testid="nav-layouts" v-if="isAuthenticated" to="/layouts">Layouts</router-link>
        <router-link data-testid="nav-login" v-if="!isAuthenticated" to="/login">Login</router-link>
        <router-link data-testid="nav-logout" v-if="isAuthenticated" to="/logout">Logout</router-link>
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

button.secondary {
  background: #6c757d;
}

button.secondary:hover {
  background: #5a6268;
}

button.danger {
  background: #dc3545;
}

button.danger:hover {
  background: #c82333;
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
