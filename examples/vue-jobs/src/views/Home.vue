<script setup lang="ts">
import { useAuthStore, getCurrentUser, getAuthUrl, getStorageStrategy, STORAGE_STRATEGY_DESCRIPTIONS, type UserProfile, type EenError } from 'een-api-toolkit'
import { computed, ref, watch } from 'vue'

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
const loginError = ref<string | null>(null)

const storageStrategy = getStorageStrategy()
const storageDescription = STORAGE_STRATEGY_DESCRIPTIONS[storageStrategy]

function login() {
  try {
    loginError.value = null
    const authUrl = getAuthUrl()
    window.location.href = authUrl
  } catch (err) {
    loginError.value = err instanceof Error ? err.message : 'Failed to initiate login'
    console.error('Login error:', err)
  }
}

// Reactive state for current user
const user = ref<UserProfile | null>(null)
const loading = ref(false)
const error = ref<EenError | null>(null)

// Guard to prevent concurrent fetch calls
let fetchInProgress = false

async function fetchUser() {
  if (fetchInProgress) return
  fetchInProgress = true
  loading.value = true
  error.value = null

  try {
    const result = await getCurrentUser()
    if (result.error) {
      error.value = result.error
      user.value = null
    } else {
      user.value = result.data
    }
  } finally {
    loading.value = false
    fetchInProgress = false
  }
}

// Fetch user when authentication state changes
watch(
  isAuthenticated,
  async (isAuth) => {
    if (isAuth && !user.value && !fetchInProgress) {
      await fetchUser()
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="home">
    <h2>Welcome to the EEN Jobs Example</h2>

    <div v-if="!isAuthenticated" class="not-authenticated" data-testid="not-authenticated">
      <p data-testid="not-authenticated-message">You are not logged in.</p>
      <p v-if="loginError" class="error" data-testid="login-error">{{ loginError }}</p>
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
        <router-link to="/jobs">
          <button>View Jobs</button>
        </router-link>
        <router-link to="/files">
          <button>View Files</button>
        </router-link>
        <router-link to="/create-export">
          <button>Create Export</button>
        </router-link>
      </div>
    </div>

    <div class="description">
      <h3>About This Example</h3>
      <p>
        This example demonstrates how to use the Jobs, Files, and Exports APIs from
        the EEN API Toolkit to manage video exports and downloadable files from the
        Eagle Eye Networks platform.
      </p>
      <h4>Features</h4>
      <ul>
        <li>List jobs with state filtering</li>
        <li>View job progress and poll for completion</li>
        <li>Create video exports from cameras</li>
        <li>List and download files</li>
        <li>OAuth authentication flow</li>
      </ul>
      <p class="storage-note" data-testid="storage-strategy">
        Storage strategy: <strong>{{ storageStrategy }}</strong> ({{ storageDescription }})
      </p>
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
  display: flex;
  gap: 10px;
  justify-content: center;
}

.description {
  margin-top: 40px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: left;
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
  background: #e9ecef;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.9em;
}

.storage-note {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #ddd;
  font-size: 0.85em;
  color: #888;
}
</style>
