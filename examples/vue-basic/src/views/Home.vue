<script setup lang="ts">
import { useAuthStore, useCurrentUser, getAuthUrl } from 'een-api-toolkit'
import { computed, watch } from 'vue'

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)

function login() {
  window.location.href = getAuthUrl()
}

// Don't fetch on mount - we'll handle it reactively
const { user, loading, error, fetch } = useCurrentUser({
  immediate: false
})

// Fetch user when authentication state changes
watch(
  isAuthenticated,
  (isAuth) => {
    if (isAuth && !user.value) {
      fetch()
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="home">
    <h2>Welcome to the EEN API Toolkit Example</h2>

    <div v-if="!isAuthenticated" class="not-authenticated" data-testid="not-authenticated">
      <p data-testid="not-authenticated-message">You are not logged in.</p>
      <button data-testid="login-button" @click="login">Login with Eagle Eye Networks</button>
    </div>

    <div v-else class="authenticated">
      <div v-if="loading" class="loading">Loading user profile...</div>
      <div v-else-if="error" class="error">Error: {{ error.message }}</div>
      <div v-else-if="user" class="user-info">
        <h3>Hello, {{ user.firstName }} {{ user.lastName }}!</h3>
        <p>Email: {{ user.email }}</p>
        <p>Account ID: {{ user.accountId }}</p>
      </div>

      <div class="actions">
        <router-link to="/users">
          <button>View Users</button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  text-align: center;
}

h2 {
  margin-bottom: 30px;
}

.not-authenticated,
.authenticated {
  margin-top: 20px;
}

.user-info {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.user-info h3 {
  margin-bottom: 10px;
}

.user-info p {
  color: #666;
}

.actions {
  margin-top: 20px;
}
</style>
