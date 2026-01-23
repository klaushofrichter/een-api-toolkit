# Authentication - EEN API Toolkit

> **Version:** 0.3.27
>
> OAuth flow implementation, token management, and session handling.
> Load this document when implementing login, logout, or auth guards.

---

## Overview

The toolkit uses OAuth 2.0 with a proxy server for secure token management:

1. **User clicks login** → Redirect to EEN Identity Provider
2. **User authenticates** → EEN redirects back with auth code
3. **App exchanges code** → Proxy exchanges code for tokens
4. **Refresh token stored** → Proxy keeps refresh token secure (never sent to client)
5. **Access token returned** → Client stores short-lived access token

---

## Authentication Functions

### getAuthUrl()

Generate the OAuth authorization URL. Redirect the user here to start login.

```typescript
import { getAuthUrl } from 'een-api-toolkit'

function login() {
  window.location.href = getAuthUrl()
}
```

### handleAuthCallback(code, state)

Handle the OAuth callback. Call this when user returns to your redirect URI.

```typescript
import { handleAuthCallback } from 'een-api-toolkit'

const { data, error } = await handleAuthCallback(code, state)

if (error) {
  console.error('Auth failed:', error.message)
  return
}

// User is now authenticated
router.push('/dashboard')
```

### refreshToken()

Manually refresh the access token. Usually handled automatically.

```typescript
import { refreshToken } from 'een-api-toolkit'

const { data, error } = await refreshToken()
if (error) {
  // Refresh failed - redirect to login
  router.push('/login')
}
```

### revokeToken()

Revoke the token and logout.

```typescript
import { revokeToken } from 'een-api-toolkit'

async function logout() {
  await revokeToken()
  router.push('/login')
}
```

---

## Auth Store (useAuthStore)

Access authentication state directly:

```typescript
import { useAuthStore } from 'een-api-toolkit'

const authStore = useAuthStore()

// Reactive state
authStore.isAuthenticated  // boolean
authStore.token            // Access token (or null)
authStore.baseUrl          // EEN API base URL (e.g., https://c001.eagleeyenetworks.com)
authStore.sessionId        // Session identifier
```

---

## Vue Router Auth Guard

Protect routes that require authentication:

```typescript
import { useAuthStore } from 'een-api-toolkit'

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' })
  } else {
    next()
  }
})
```

---

## Component Templates

### Login.vue

```vue
<script setup lang="ts">
import { getAuthUrl } from 'een-api-toolkit'

function login() {
  // Redirect to EEN OAuth login
  window.location.href = getAuthUrl()
}
</script>

<template>
  <div class="login">
    <h2 data-testid="login-title">Login</h2>
    <p>Click the button below to login with your Eagle Eye Networks account.</p>
    <button data-testid="login-button" @click="login">Login with Eagle Eye Networks</button>
  </div>
</template>
```

### Callback.vue

```vue
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { handleAuthCallback } from 'een-api-toolkit'

const router = useRouter()
const error = ref<string | null>(null)
const processing = ref(true)

onMounted(async () => {
  const url = new URL(window.location.href)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const errorParam = url.searchParams.get('error')

  if (errorParam) {
    error.value = `OAuth error: ${errorParam}`
    processing.value = false
    return
  }

  if (!code || !state) {
    error.value = 'Missing authorization code or state parameter'
    processing.value = false
    return
  }

  const result = await handleAuthCallback(code, state)

  if (result.error) {
    error.value = result.error.message
    processing.value = false
    return
  }

  // Success - redirect to home
  router.push('/')
})
</script>

<template>
  <div class="callback">
    <div v-if="processing" class="loading">
      <h2>Authenticating...</h2>
      <p>Please wait while we complete the login process.</p>
    </div>

    <div v-else-if="error" class="error-state">
      <h2>Authentication Failed</h2>
      <p class="error">{{ error }}</p>
      <router-link to="/login">
        <button>Try Again</button>
      </router-link>
    </div>
  </div>
</template>
```

### Logout.vue

```vue
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { revokeToken } from 'een-api-toolkit'

const router = useRouter()
const processing = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  const result = await revokeToken()

  if (result.error) {
    // Even if revoke fails, the local state is cleared
    console.warn('Token revocation failed:', result.error.message)
  }

  processing.value = false

  // Redirect to home after a short delay
  setTimeout(() => {
    router.push('/')
  }, 2000)
})
</script>

<template>
  <div class="logout">
    <div v-if="processing">
      <h2>Logging out...</h2>
      <p class="loading">Please wait.</p>
    </div>

    <div v-else>
      <h2>Logged Out</h2>
      <p>You have been successfully logged out.</p>
      <p v-if="error" class="error">Note: {{ error }}</p>
      <p class="redirect">Redirecting to home page...</p>
    </div>
  </div>
</template>
```

---

## Token Lifecycle

| Event | Action |
|-------|--------|
| App loads | Check for existing token in storage |
| Token expires | Auto-refresh triggered (5 min before expiry) |
| Refresh fails | Clear auth state, redirect to login |
| User logs out | Revoke token, clear storage |

---

## Storage Strategies

```typescript
import { getStorageStrategy, STORAGE_STRATEGY_DESCRIPTIONS } from 'een-api-toolkit'

const strategy = getStorageStrategy()
const description = STORAGE_STRATEGY_DESCRIPTIONS[strategy]
// e.g., "localStorage: persists across sessions"
```

---

## Common Auth Errors

| Error Code | Cause | Solution |
|------------|-------|----------|
| `AUTH_REQUIRED` | No valid token | Redirect to login |
| `AUTH_FAILED` | Invalid credentials | Show error, allow retry |
| `TOKEN_EXPIRED` | Token expired | Auto-refresh or re-login |

---

## Reference Example

See `examples/vue-users/src/views/Login.vue`, `Callback.vue`, `Logout.vue`
