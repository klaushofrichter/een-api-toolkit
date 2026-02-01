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
      <h1 data-testid="app-title">EEN Jobs Example</h1>
      <nav>
        <router-link data-testid="nav-home" to="/">Home</router-link>
        <router-link data-testid="nav-jobs" v-if="isAuthenticated" to="/jobs">Jobs</router-link>
        <router-link data-testid="nav-files" v-if="isAuthenticated" to="/files">Files</router-link>
        <router-link data-testid="nav-create-export" v-if="isAuthenticated" to="/create-export">Create Export</router-link>
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

.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.85em;
  font-weight: 500;
}

.badge-pending {
  background: #fff3cd;
  color: #856404;
}

.badge-started {
  background: #cce5ff;
  color: #004085;
}

.badge-success {
  background: #d4edda;
  color: #155724;
}

.badge-failure {
  background: #f8d7da;
  color: #721c24;
}

.badge-available {
  background: #d4edda;
  color: #155724;
}

.badge-expired {
  background: #e2e3e5;
  color: #383d41;
}
</style>
