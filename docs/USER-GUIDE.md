# User Guide

This guide covers everything you need to use een-api-toolkit in your Vue 3 application.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [OAuth Proxy Setup](#oauth-proxy-setup)
- [Configuration](#configuration)
- [Authentication Flow](#authentication-flow)
- [Using the API](#using-the-api)
  - [Live Video Streaming](#live-video-streaming)
- [Error Handling](#error-handling)
- [Building an App from Scratch](#building-an-app-from-scratch)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- **Node.js** 20 LTS or later
- **Vue 3** application with Composition API
- **Pinia** for state management
- **EEN OAuth Client ID** from Eagle Eye Networks

To get an EEN OAuth Client ID, contact Eagle Eye Networks or register through the [EEN Developer Portal](https://developer.eagleeyenetworks.com/).

## Installation

### From npm (Recommended)

```bash
npm install een-api-toolkit
```

### Peer Dependencies

The toolkit requires Vue 3 and Pinia as peer dependencies:

```bash
npm install vue@^3.3.0 pinia@^2.0.0
```

### From Source (for development)

```bash
git clone https://github.com/klaushofrichter/een-api-toolkit.git
cd een-api-toolkit
npm install
npm run build
npm link

# In your project:
npm link een-api-toolkit
```

## OAuth Proxy Setup

The toolkit uses an OAuth proxy to securely manage authentication tokens. The refresh token is never exposed to the client application, preventing token theft via XSS attacks.

### Using een-oauth-proxy (Recommended)

[een-oauth-proxy](https://github.com/klaushofrichter/een-oauth-proxy) is a Cloudflare Worker that handles OAuth token management.

**Local Development:**

```bash
# Clone the proxy repository
git clone https://github.com/klaushofrichter/een-oauth-proxy.git
cd een-oauth-proxy/proxy

# Install dependencies
npm install

# Create configuration file
cp .dev.vars.example .dev.vars

# Edit .dev.vars with your credentials:
# CLIENT_ID="your-een-client-id"
# CLIENT_SECRET="your-een-client-secret"
# ALLOWED_ORIGINS="http://127.0.0.1:3333"

# Start the proxy
npm run dev  # Runs at http://localhost:8787
```

**Production Deployment:**

Deploy the proxy to Cloudflare Workers. See the [een-oauth-proxy README](https://github.com/klaushofrichter/een-oauth-proxy) for deployment instructions.

### Using Your Own Proxy

If you implement your own OAuth proxy, it must provide these endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/proxy/getAccessToken` | POST | Exchange authorization code for tokens |
| `/proxy/refreshAccessToken` | POST | Refresh the access token |
| `/proxy/revoke` | POST | Revoke session and tokens |

The proxy must:
- Store refresh tokens server-side (never return to client)
- Return only access tokens to the client
- Validate CORS origins
- Handle token refresh transparently

## Configuration

### Environment Variables

Create a `.env` file in your project root:

```env
# Required: Your EEN OAuth Client ID
VITE_EEN_CLIENT_ID=your-een-client-id

# Required: URL of your OAuth proxy
VITE_PROXY_URL=http://localhost:8787

# Optional: OAuth redirect URI (default: current origin)
VITE_REDIRECT_URI=http://127.0.0.1:3333

# Optional: Enable debug logging
VITE_DEBUG=false
```

### Toolkit Initialization

Initialize the toolkit in your app's entry point:

```typescript
// main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { initEenToolkit } from 'een-api-toolkit'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

// IMPORTANT: Pinia must be installed BEFORE initializing the toolkit
app.use(pinia)

// Now initialize the toolkit
initEenToolkit({
  proxyUrl: import.meta.env.VITE_PROXY_URL,
  clientId: import.meta.env.VITE_EEN_CLIENT_ID,
  redirectUri: import.meta.env.VITE_REDIRECT_URI,  // Optional
  debug: import.meta.env.VITE_DEBUG === 'true'     // Optional
})

app.mount('#app')
```

> **Important:** If you call `initEenToolkit()` or use any composables before installing Pinia, you will see this error:
> ```
> Error: [🍍]: "getActivePinia()" was called but there was no active Pinia.
> Are you trying to use a store before calling "app.use(pinia)"?
> ```

### Configuration Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `proxyUrl` | string | Yes | URL of your OAuth proxy server |
| `clientId` | string | Yes | Your EEN OAuth Client ID |
| `redirectUri` | string | No | OAuth callback URL (defaults to `window.location.origin`) |
| `debug` | boolean | No | Enable console debug logging |

## Authentication Flow

### OAuth Flow Overview

1. User clicks "Login" in your app
2. App redirects to EEN login page via the proxy
3. User authenticates with EEN
4. EEN redirects back to your app with an authorization code
5. App exchanges the code for tokens via the proxy
6. Proxy stores refresh token, returns access token
7. App stores access token in Pinia, user is authenticated

### Implementing Login

```typescript
// Login.vue
import { getAuthUrl } from 'een-api-toolkit'

function login() {
  // Redirects to EEN login page
  window.location.href = getAuthUrl()
}
```

### Handling the Callback

> **Important:** The EEN Identity Provider only supports redirects to the **root path** (`/`), not `/callback`. Your router must detect OAuth parameters on the root path and forward them to a callback handler internally.

**Router configuration** (handles OAuth redirect on root path):

```typescript
// router/index.ts
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: Login },
    {
      path: '/callback',
      name: 'callback',
      component: Callback  // Internal route - not the OAuth redirect target
    },
    {
      path: '/',
      name: 'home',
      component: Dashboard,
      meta: { requiresAuth: true },
      // Detect OAuth callback and forward to handler
      beforeEnter: (to, _from, next) => {
        if (to.query.code && to.query.state) {
          // Forward OAuth params to callback handler
          next({ name: 'callback', query: to.query })
        } else {
          next()
        }
      }
    }
  ]
})
```

**Callback component** (processes the forwarded OAuth params):

```typescript
// Callback.vue
import { useRoute, useRouter } from 'vue-router'
import { handleAuthCallback } from 'een-api-toolkit'
import { onMounted, ref } from 'vue'

const route = useRoute()
const router = useRouter()
const error = ref<string | null>(null)

onMounted(async () => {
  const code = route.query.code as string
  const state = route.query.state as string

  if (!code) {
    error.value = 'No authorization code received'
    return
  }

  const result = await handleAuthCallback(code, state)

  if (result.error) {
    error.value = result.error.message
    return
  }

  // Success - redirect to dashboard
  router.push('/dashboard')
})
```

**How it works:**
1. User clicks login → redirected to EEN login page
2. After authentication, EEN redirects to `http://127.0.0.1:3333?code=...&state=...` (root path)
3. Router's `beforeEnter` guard detects `code` and `state` query params
4. Router forwards to internal `/callback` route with the params
5. Callback component exchanges the code for tokens via `handleAuthCallback()`

### Checking Authentication State

```typescript
import { useAuthStore } from 'een-api-toolkit'

const authStore = useAuthStore()

// Check if user is authenticated
if (authStore.isAuthenticated) {
  // User has valid token
}

// Access the current token
const token = authStore.token

// Access the API base URL (varies by region)
const baseUrl = authStore.baseUrl
```

### Implementing Logout

```typescript
import { revokeToken } from 'een-api-toolkit'

async function handleLogout() {
  const { error } = await revokeToken()
  if (error) {
    console.error('Logout failed:', error.message)
  }
  router.push('/login')
}
```

### Route Guards

Protect routes that require authentication:

```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from 'een-api-toolkit'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: Login },
    { path: '/callback', component: Callback },
    { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } },
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
```

## Using the API

### Plain Async Functions

All API functions return a Promise with `{data, error}`:

```typescript
import { getCurrentUser, getUsers, getUser, getCameras, getCamera } from 'een-api-toolkit'

// Get current user
const { data: user, error } = await getCurrentUser()
if (user) {
  console.log(`Logged in as: ${user.email}`)
}

// Get users with pagination
const { data: usersResponse, error: usersError } = await getUsers({
  pageSize: 50,
  pageToken: 'next-page-token'  // From previous response
})
if (usersResponse) {
  console.log('Users:', usersResponse.results)
  console.log('Next page:', usersResponse.nextPageToken)
}

// Get a specific user by ID
const { data: specificUser } = await getUser('user-123')
if (specificUser) {
  console.log('User:', specificUser.email)
}

// Get cameras with filters
const { data: camerasResponse } = await getCameras({
  pageSize: 20,
  include: ['deviceInfo', 'status'],
  status__in: ['online']
})
if (camerasResponse) {
  console.log('Online cameras:', camerasResponse.results)
}

// Get a specific camera by ID
const { data: camera } = await getCamera('camera-123', {
  include: ['deviceInfo', 'status', 'shareDetails']
})
if (camera) {
  console.log('Camera:', camera.name, camera.status)
}
```

### Media API (Live and Recorded Images)

```typescript
import { getLiveImage, getRecordedImage, listMedia } from 'een-api-toolkit'

// Get live preview image
const { data: liveImage, error } = await getLiveImage({
  deviceId: 'camera-123'
})
if (liveImage) {
  // imageData is a base64 data URL (data:image/jpeg;base64,...)
  imgElement.src = liveImage.imageData
}

// Get recorded image from a specific time
const { data: recordedImage } = await getRecordedImage({
  deviceId: 'camera-123',
  type: 'preview',
  timestamp__gte: '2025-01-15T14:30:00.000-08:00'  // ISO 8601 with timezone offset
})
if (recordedImage) {
  imgElement.src = recordedImage.imageData

  // Navigate to next/previous image using tokens
  if (recordedImage.nextToken) {
    const { data: nextImage } = await getRecordedImage({
      pageToken: recordedImage.nextToken
    })
  }
}

// List media intervals (find when recordings exist)
const { data: mediaList } = await listMedia({
  deviceId: 'camera-123',
  type: 'preview',
  mediaType: 'video',
  startTimestamp: '2025-01-01T00:00:00.000+00:00',
  endTimestamp: '2025-01-02T00:00:00.000+00:00'
})
```

#### EEN Timestamp Format (Critical)

The EEN API requires timestamps in **ISO 8601 format with explicit timezone offset**. The `Z` suffix (UTC) is **not accepted** for recorded image queries.

| Format | Example | Valid |
|--------|---------|-------|
| With offset | `2025-01-15T14:30:00.000-08:00` | ✅ Yes |
| With offset | `2025-01-15T22:30:00.000+00:00` | ✅ Yes |
| With Z suffix | `2025-01-15T22:30:00.000Z` | ❌ No |

**Correct timestamp formatting function:**

```typescript
function toApiTimestamp(date: Date): string {
  // Get timezone offset in minutes
  const offsetMinutes = date.getTimezoneOffset()
  const offsetSign = offsetMinutes <= 0 ? '+' : '-'
  const offsetHours = String(Math.floor(Math.abs(offsetMinutes) / 60)).padStart(2, '0')
  const offsetMins = String(Math.abs(offsetMinutes) % 60).padStart(2, '0')
  const offset = `${offsetSign}${offsetHours}:${offsetMins}`

  // Format date components
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000${offset}`
}

// Usage
const timestamp = toApiTimestamp(new Date())
// Result: "2025-01-15T14:30:00.000-08:00"
```

**Common mistake:**

```typescript
// WRONG - toISOString() returns Z suffix which is not accepted
const timestamp = new Date().toISOString()
// Returns: "2025-01-15T22:30:00.000Z" ❌

// CORRECT - use explicit timezone offset
const timestamp = toApiTimestamp(new Date())
// Returns: "2025-01-15T14:30:00.000-08:00" ✅
```

**Note on milliseconds:** The milliseconds component (`.000`) is included for API format consistency. For `getRecordedImage` queries, the API returns the nearest available image to the requested timestamp, so sub-second precision is typically not critical.

### Live Video Streaming

The toolkit supports two methods for displaying live video from cameras:

1. **Preview streams** - Low-resolution multipart JPEG streams, ideal for thumbnails and monitoring views
2. **Main streams** - High-resolution video using the EEN Live Video SDK

#### Preview Streams (Multipart URL)

Preview streams use multipart URLs with cookie-based authentication. This is suitable for displaying multiple camera thumbnails or low-bandwidth scenarios.

**Step 1: Initialize the media session (once after login)**

```typescript
import { initMediaSession } from 'een-api-toolkit'

// Call this once after the user authenticates
const { data, error } = await initMediaSession()

if (error) {
  console.error('Failed to initialize media session:', error.message)
  return
}

console.log('Media session initialized')
```

**Step 2: Get feeds with multipart URLs**

```typescript
import { listFeeds } from 'een-api-toolkit'

const { data, error } = await listFeeds({
  deviceId: 'camera-123',
  type: 'preview',
  include: ['multipartUrl']
})

if (data?.results[0]?.multipartUrl) {
  // Use directly in an <img> element - the session cookie handles auth
  imgElement.src = data.results[0].multipartUrl
}
```

**Complete Vue example:**

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { initMediaSession, listFeeds, type Feed } from 'een-api-toolkit'

const feed = ref<Feed | null>(null)
const error = ref<string | null>(null)

onMounted(async () => {
  // Initialize media session for cookie-based auth
  const sessionResult = await initMediaSession()
  if (sessionResult.error) {
    error.value = sessionResult.error.message
    return
  }

  // Get preview feed with multipart URL
  const feedsResult = await listFeeds({
    deviceId: 'camera-123',
    type: 'preview',
    include: ['multipartUrl']
  })

  if (feedsResult.data?.results[0]) {
    feed.value = feedsResult.data.results[0]
  }
})
</script>

<template>
  <div>
    <p v-if="error" class="error">{{ error }}</p>
    <img
      v-else-if="feed?.multipartUrl"
      :src="feed.multipartUrl"
      alt="Live camera preview"
    />
  </div>
</template>
```

#### Main Streams (Live Video SDK)

For high-resolution video, use the [EEN Live Video SDK](https://developer.eagleeyenetworks.com/docs/live-video-web-sdk). This provides WebCodecs-based playback with low latency.

**Step 1: Install the SDK**

```bash
npm install @een/live-video-web-sdk
```

**Step 2: Initialize the player**

```typescript
import LivePlayer from '@een/live-video-web-sdk'
import { useAuthStore } from 'een-api-toolkit'

const authStore = useAuthStore()

// Create video element
const videoElement = document.getElementById('live-video') as HTMLVideoElement

// Initialize player
const player = new LivePlayer()

await player.start({
  videoElement,
  cameraId: 'camera-123',      // The camera's device ID
  baseUrl: authStore.baseUrl,   // e.g., 'https://c001.eagleeyenetworks.com'
  jwt: authStore.token          // The current access token
})

// To stop playback
player.stop()
```

**Complete Vue example:**

```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useAuthStore, listFeeds, type Feed } from 'een-api-toolkit'
import LivePlayer from '@een/live-video-web-sdk'

const authStore = useAuthStore()
const videoRef = ref<HTMLVideoElement | null>(null)
const feed = ref<Feed | null>(null)
const error = ref<string | null>(null)
const isConnected = ref(false)

let player: LivePlayer | null = null

async function startLiveStream(deviceId: string) {
  if (!videoRef.value || !authStore.baseUrl || !authStore.token) {
    error.value = 'Video element or authentication not available'
    return
  }

  // Clean up existing player
  stopLiveStream()

  try {
    player = new LivePlayer()

    await player.start({
      videoElement: videoRef.value,
      cameraId: deviceId,
      baseUrl: authStore.baseUrl,
      jwt: authStore.token
    })

    isConnected.value = true
  } catch (err) {
    error.value = `Failed to start live stream: ${String(err)}`
    isConnected.value = false
  }
}

function stopLiveStream() {
  if (player) {
    try {
      player.stop()
    } catch (err) {
      // Log cleanup errors for debugging, but don't throw
      console.warn('Failed to stop live stream during cleanup:', err)
    }
    player = null
  }
  isConnected.value = false
}

onMounted(async () => {
  // Get main feed for the camera
  const feedsResult = await listFeeds({
    deviceId: 'camera-123',
    type: 'main'
  })

  if (feedsResult.data?.results[0]) {
    feed.value = feedsResult.data.results[0]
    await nextTick()
    await startLiveStream(feed.value.deviceId)
  }
})

onUnmounted(() => {
  stopLiveStream()
})
</script>

<template>
  <div>
    <p v-if="error" class="error">{{ error }}</p>
    <video
      ref="videoRef"
      controls
      autoplay
      muted
      playsinline
    />
    <p v-if="isConnected">Connected to live stream</p>
  </div>
</template>
```

#### Choosing Between Preview and Main Streams

| Feature | Preview (Multipart) | Main (Live SDK) |
|---------|---------------------|-----------------|
| Resolution | Low (preview quality) | High (full resolution) |
| Latency | ~1-2 seconds | ~500ms (WebCodecs) |
| Browser support | All modern browsers | Chrome 94+, Edge 94+, Opera 80+ (WebCodecs required) |
| Use case | Thumbnails, multi-camera views | Single camera full-screen |
| Authentication | Session cookie | JWT token |
| Element | `<img>` | `<video>` |

#### Media Session API Reference

| Function | Purpose | Returns |
|----------|---------|---------|
| `getMediaSession()` | Get media session URL | `Result<MediaSessionResponse>` |
| `initMediaSession()` | Initialize session cookie | `Result<MediaSessionResult>` |

The media session must be initialized once after login before using multipart URLs in `<img>` elements. The session cookie is automatically included in subsequent requests.

### Pagination

```typescript
import { getUsers } from 'een-api-toolkit'

async function fetchAllUsers() {
  const allUsers = []
  let pageToken: string | undefined

  do {
    const { data, error } = await getUsers({
      pageSize: 100,
      pageToken
    })

    if (error) {
      console.error('Failed to fetch users:', error.message)
      break
    }

    allUsers.push(...data.results)
    pageToken = data.nextPageToken
  } while (pageToken)

  return allUsers
}
```

## Error Handling

All toolkit functions return `{data, error}` objects - they never throw exceptions:

```typescript
const { data, error } = await getUsers()

if (error) {
  switch (error.code) {
    case 'AUTH_REQUIRED':
      // User not authenticated - redirect to login
      router.push('/login')
      break

    case 'TOKEN_EXPIRED':
      // Token refresh failed - re-authenticate
      router.push('/login')
      break

    case 'API_ERROR':
      // EEN API returned an error (4xx/5xx)
      showNotification(`API Error: ${error.message}`)
      break

    case 'NETWORK_ERROR':
      // Network request failed
      showNotification('Network unavailable. Please try again.')
      break

    case 'INVALID_CONFIG':
      // Toolkit not initialized correctly
      console.error('Toolkit configuration error:', error.message)
      break

    default:
      showNotification(`Error: ${error.message}`)
  }
  return
}

// Safe to use data here
processUsers(data)
```

### Error Types

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | No authentication token available |
| `TOKEN_EXPIRED` | Token expired and refresh failed |
| `API_ERROR` | EEN API returned an error |
| `NETWORK_ERROR` | Network request failed |
| `INVALID_CONFIG` | Toolkit not properly configured |
| `VALIDATION_ERROR` | Invalid parameters provided |

## Building an App from Scratch

Follow these steps to create a new Vue 3 app with een-api-toolkit:

### 1. Create Vue Project

```bash
npm create vue@latest my-een-app
cd my-een-app
npm install
```

Select these options:
- TypeScript: Yes
- Vue Router: Yes
- Pinia: Yes

### 2. Install the Toolkit

```bash
npm install een-api-toolkit
```

### 3. Configure Environment

Create `.env`:

```env
VITE_EEN_CLIENT_ID=your-client-id
VITE_PROXY_URL=http://localhost:8787
```

### 4. Initialize Toolkit

Edit `src/main.ts`:

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { initEenToolkit } from 'een-api-toolkit'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

initEenToolkit({
  proxyUrl: import.meta.env.VITE_PROXY_URL,
  clientId: import.meta.env.VITE_EEN_CLIENT_ID
})

app.mount('#app')
```

### 5. Create Login View

Create `src/views/Login.vue`:

```vue
<script setup lang="ts">
import { getAuthUrl } from 'een-api-toolkit'

function login() {
  window.location.href = getAuthUrl()
}
</script>

<template>
  <div class="login">
    <h1>Welcome</h1>
    <p>Sign in with your Eagle Eye Networks account</p>
    <button @click="login">Login with EEN</button>
  </div>
</template>
```

### 6. Create Callback View

Create `src/views/Callback.vue`:

```vue
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { handleAuthCallback } from 'een-api-toolkit'

const route = useRoute()
const router = useRouter()
const error = ref<string | null>(null)
const loading = ref(true)

onMounted(async () => {
  const code = route.query.code as string
  const state = route.query.state as string

  if (!code) {
    error.value = 'No authorization code received'
    loading.value = false
    return
  }

  const result = await handleAuthCallback(code, state)
  loading.value = false

  if (result.error) {
    error.value = result.error.message
    return
  }

  router.push('/')
})
</script>

<template>
  <div class="callback">
    <div v-if="loading">Authenticating...</div>
    <div v-else-if="error" class="error">
      <h2>Authentication Failed</h2>
      <p>{{ error }}</p>
      <router-link to="/login">Try Again</router-link>
    </div>
  </div>
</template>
```

### 7. Create Dashboard View

Create `src/views/Dashboard.vue`:

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentUser, getUsers, revokeToken, type UserProfile, type User, type EenError } from 'een-api-toolkit'

const router = useRouter()

// Reactive state for current user
const user = ref<UserProfile | null>(null)
const loading = ref(false)
const error = ref<EenError | null>(null)

// Reactive state for users list
const users = ref<User[]>([])
const usersLoading = ref(false)
const nextPageToken = ref<string | undefined>(undefined)
const hasNextPage = computed(() => !!nextPageToken.value)

async function fetchUser() {
  loading.value = true
  const result = await getCurrentUser()
  loading.value = false
  if (result.error) {
    error.value = result.error
  } else {
    user.value = result.data
  }
}

async function fetchUsers() {
  usersLoading.value = true
  const result = await getUsers({ pageSize: 10 })
  usersLoading.value = false
  if (!result.error) {
    users.value = result.data.results
    nextPageToken.value = result.data.nextPageToken
  }
}

async function fetchNextPage() {
  if (!nextPageToken.value) return
  usersLoading.value = true
  const result = await getUsers({ pageSize: 10, pageToken: nextPageToken.value })
  usersLoading.value = false
  if (!result.error) {
    users.value.push(...result.data.results)
    nextPageToken.value = result.data.nextPageToken
  }
}

async function handleLogout() {
  await revokeToken()
  router.push('/login')
}

onMounted(() => {
  fetchUser()
  fetchUsers()
})
</script>

<template>
  <div class="dashboard">
    <header>
      <h1 v-if="user">Welcome, {{ user.firstName }}</h1>
      <button @click="handleLogout">Logout</button>
    </header>

    <div v-if="loading">Loading...</div>
    <div v-else-if="error">{{ error.message }}</div>
    <main v-else>
      <h2>Users</h2>
      <ul>
        <li v-for="u in users" :key="u.id">
          {{ u.firstName }} {{ u.lastName }} ({{ u.email }})
        </li>
      </ul>
      <button v-if="hasNextPage" @click="fetchNextPage" :disabled="usersLoading">
        Load More
      </button>
    </main>
  </div>
</template>
```

### 8. Configure Router

Edit `src/router/index.ts`:

> **Important:** The EEN Identity Provider requires the OAuth callback to be handled on the root path (`/`), not `/callback`. The router must detect OAuth parameters and redirect internally.

```typescript
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from 'een-api-toolkit'
import Login from '../views/Login.vue'
import Callback from '../views/Callback.vue'
import Dashboard from '../views/Dashboard.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: Login },
    {
      path: '/callback',
      name: 'callback',
      component: Callback
    },
    {
      path: '/',
      name: 'home',
      component: Dashboard,
      meta: { requiresAuth: true },
      // IMPORTANT: Handle OAuth callback on root path
      // EEN IDP only supports redirect to root (e.g., http://127.0.0.1:3333)
      beforeEnter: (to, _from, next) => {
        if (to.query.code && to.query.state) {
          // OAuth callback - redirect to callback handler with params
          next({ name: 'callback', query: to.query })
        } else {
          next()
        }
      }
    }
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Skip auth check for callback route (it handles its own auth)
  if (to.name === 'callback') {
    next()
  } else if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
```

### 9. Start Development

```bash
# Start the OAuth proxy (in another terminal)
cd ../een-oauth-proxy/proxy && npm run dev

# Start your app
npm run dev
```

Open http://127.0.0.1:5173 (or the port Vite assigns).

> **Important:** The EEN OAuth redirect URI must be registered with your Client ID. Common redirect URIs are `http://127.0.0.1:3333` or `http://127.0.0.1:5173`.

## Troubleshooting

### OAuth Redirect URI Requirements (Critical)

The EEN Identity Provider performs an **exact string match** on the redirect URI. Any deviation will cause OAuth to fail.

**Requirements:**
| Requirement | Correct | Incorrect |
|-------------|---------|-----------|
| Host | `127.0.0.1` | `localhost` |
| Path | None (root only) | `/callback` |
| Trailing slash | No | `http://127.0.0.1:3333/` |

**Correct redirect URI:** `http://127.0.0.1:3333`

**Registering your redirect URI with EEN:**
Configure your OAuth client's redirect URI at the [EEN Developer Portal - My Application](https://developer.eagleeyenetworks.com/page/my-application).

This means your application must:
1. Handle OAuth callbacks on the **root path** (`/`)
2. Run on `127.0.0.1:3333` (not `localhost:3333`)
3. Register exactly `http://127.0.0.1:3333` with EEN at the Developer Portal

**Router pattern for handling callbacks on root path:**

```typescript
// router/index.ts
{
  path: '/',
  name: 'home',
  component: Home,
  beforeEnter: (to, _from, next) => {
    // If URL has OAuth params, redirect to callback handler
    if (to.query.code && to.query.state) {
      next({ name: 'callback', query: to.query })
    } else {
      next()
    }
  }
}
```

**Vite configuration:**

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    host: '127.0.0.1',  // Must use 127.0.0.1, not localhost
    port: 3333,
    strictPort: true
  }
})
```

### "Redirect URI mismatch" Error

**Symptom:** OAuth provider returns an error about redirect URI not matching.

**Solutions:**
1. Verify `VITE_REDIRECT_URI` in `.env` is exactly `http://127.0.0.1:3333` (no trailing slash, no path)
2. Ensure your EEN OAuth client is registered with the same exact URI
3. Check your dev server runs on `127.0.0.1:3333`, not `localhost:3333`
4. Verify your router handles OAuth callbacks on the root path

### "Toolkit not initialized" / "getActivePinia()" Error

**Symptom:** You see one of these errors when the app starts or when using composables:

```
Error: [🍍]: "getActivePinia()" was called but there was no active Pinia.
Are you trying to use a store before calling "app.use(pinia)"?
```

**Cause:** The toolkit's auth store is being accessed before Pinia is installed on the Vue app.

**Solution:** Ensure Pinia is installed **before** calling `initEenToolkit()` or using `useAuthStore()`:

```typescript
// main.ts - CORRECT ORDER
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { initEenToolkit } from 'een-api-toolkit'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

// 1. Install Pinia FIRST
app.use(pinia)

// 2. THEN initialize toolkit
initEenToolkit({
  proxyUrl: import.meta.env.VITE_PROXY_URL,
  clientId: import.meta.env.VITE_EEN_CLIENT_ID,
  redirectUri: import.meta.env.VITE_REDIRECT_URI,
  debug: import.meta.env.VITE_DEBUG === 'true'
})

app.mount('#app')
```

### "CORS error" on API calls

Check your proxy's `ALLOWED_ORIGINS` configuration includes your app's origin:

```
ALLOWED_ORIGINS="http://127.0.0.1:3333,http://localhost:5173"
```

### OAuth callback fails

1. Verify the proxy is running (`http://localhost:8787`)
2. Check that `CLIENT_ID` and `CLIENT_SECRET` are correct in proxy config
3. Ensure your app handles callbacks on the root path (see "OAuth Redirect URI Requirements" above)
4. Check browser console for errors during callback processing

### Redirected back to login after authentication

**Symptom:** After entering credentials, you're redirected back to login instead of dashboard.

**Causes:**
1. Router guard blocking the callback before it's processed
2. OAuth params not detected on root path
3. Callback component not processing the authentication

**Solutions:**
1. Ensure router detects OAuth params (`code` and `state`) on root path
2. Route guard must allow callbacks through without auth check
3. Enable `VITE_DEBUG=true` and check console logs

### "Network error" on all requests

1. Confirm the proxy is running: `curl http://localhost:8787/health`
2. Check `VITE_PROXY_URL` in your `.env` file
3. Verify no firewall is blocking port 8787

### Token refresh fails

The proxy handles token refresh automatically. If refresh fails:
1. Check the proxy logs for errors
2. Verify `CLIENT_SECRET` is correct
3. The user may need to re-authenticate

### Debug Mode

Enable debug logging to see detailed information:

```env
VITE_DEBUG=true
```

This logs API requests, token operations, and auth state changes to the console.

## Example Application

See the [vue-users example](../examples/vue-users/) for a complete working application demonstrating all features.
