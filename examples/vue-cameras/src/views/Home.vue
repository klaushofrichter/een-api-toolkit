<script setup lang="ts">
import { useAuthStore, useCurrentUser } from 'een-api-toolkit'
import { computed } from 'vue'

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)

// Fetch current user if authenticated
const { user, loading, error } = useCurrentUser({ immediate: true })
</script>

<template>
  <div class="home">
    <h2>Welcome to the EEN Cameras Example</h2>

    <div v-if="isAuthenticated">
      <div v-if="loading" class="loading">Loading user info...</div>
      <div v-else-if="error" class="error">{{ error.message }}</div>
      <div v-else-if="user" class="user-info">
        <p>Logged in as: <strong>{{ user.firstName }} {{ user.lastName }}</strong></p>
        <p>Email: {{ user.email }}</p>
      </div>

      <div class="actions">
        <router-link to="/cameras">
          <button>View Cameras</button>
        </router-link>
      </div>
    </div>

    <div v-else class="login-prompt">
      <p>Please log in to view your cameras.</p>
      <router-link to="/login">
        <button>Login</button>
      </router-link>
    </div>

    <div class="description">
      <h3>About This Example</h3>
      <p>
        This example demonstrates how to use the <code>useCameras</code> and
        <code>useCamera</code> composables from the EEN API Toolkit to display
        and manage cameras from the Eagle Eye Networks platform.
      </p>
      <h4>Features</h4>
      <ul>
        <li>List cameras with pagination</li>
        <li>Filter cameras by status</li>
        <li>View camera details</li>
        <li>Display device information</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.home {
  max-width: 600px;
  margin: 0 auto;
}

h2 {
  margin-bottom: 20px;
}

.user-info {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.user-info p {
  margin: 5px 0;
}

.actions {
  margin: 20px 0;
}

.login-prompt {
  text-align: center;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 20px;
}

.login-prompt p {
  margin-bottom: 15px;
}

.description {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.description h3 {
  margin-bottom: 10px;
}

.description h4 {
  margin-top: 15px;
  margin-bottom: 10px;
}

.description p {
  color: #666;
  margin-bottom: 15px;
}

.description ul {
  list-style: disc;
  padding-left: 20px;
  color: #666;
}

.description code {
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.9em;
}
</style>
