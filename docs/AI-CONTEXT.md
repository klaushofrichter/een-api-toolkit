# EEN API Toolkit - AI Reference

> **Version:** 0.0.19
>
> This file is optimized for AI assistants. It contains all API signatures,
> types, and usage patterns in a single, parseable document.
>
> For the full EEN API documentation, see the
> [Eagle Eye Networks Developer Portal](https://developer.eagleeyenetworks.com).

---

## Prerequisites & Installation (READ FIRST)

> **⚠️ CRITICAL:** This section contains essential setup requirements.
> Skipping these steps will cause runtime errors.

### Prerequisites

Before using the een-api-toolkit, ensure you have:

| Requirement | Details |
|-------------|---------|
| **Vue 3.x** | The toolkit is built for Vue 3 Composition API |
| **Pinia** | Required peer dependency for state management |
| **Vite** | Recommended build tool (dev server must run on `127.0.0.1:3333`) |
| **OAuth Proxy** | Required for secure token management (see [een-oauth-proxy](https://github.com/klaushofrichter/een-oauth-proxy)) |

### Installation

```bash
npm install een-api-toolkit pinia
```

### Complete Setup (main.ts)

> **⚠️ CRITICAL:** Pinia MUST be installed on the Vue app BEFORE calling
> `initEenToolkit()` or using `useAuthStore()`. Failure to do so will cause
> a runtime error.

```typescript
// main.ts - Complete Setup Example
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { initEenToolkit } from 'een-api-toolkit'
import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

// Step 1: Install Pinia FIRST (required)
app.use(pinia)

// Step 2: Install router if using Vue Router
app.use(router)

// Step 3: Initialize the toolkit (Pinia must already be installed)
initEenToolkit({
  proxyUrl: import.meta.env.VITE_PROXY_URL,      // e.g., 'http://localhost:8787'
  clientId: import.meta.env.VITE_EEN_CLIENT_ID,  // Your EEN OAuth client ID
  redirectUri: 'http://127.0.0.1:3333',          // Must be exactly this
  debug: import.meta.env.VITE_DEBUG === 'true'
})

// Step 4: Mount the app
app.mount('#app')
```

### Environment Variables (.env)

```env
VITE_PROXY_URL=http://localhost:8787
VITE_EEN_CLIENT_ID=your-een-client-id
VITE_DEBUG=true
```

### Common Errors

#### "getActivePinia() was called but there was no active Pinia"

**Cause:** Pinia was not installed before `initEenToolkit()` was called or before using `useAuthStore()`.

**Solution:** Ensure your `main.ts` calls `app.use(pinia)` BEFORE `initEenToolkit()`:

```typescript
const app = createApp(App)
const pinia = createPinia()

app.use(pinia)           // ✅ First - install Pinia
initEenToolkit({...})    // ✅ Second - initialize toolkit
app.mount('#app')        // ✅ Last - mount app
```

#### "Redirect URI mismatch"

**Cause:** OAuth redirect URI doesn't exactly match `http://127.0.0.1:3333`.

**Solution:**
- Use `127.0.0.1` not `localhost`
- Use port `3333`
- No trailing slash, no path
- Register this exact URI at [EEN Developer Portal](https://developer.eagleeyenetworks.com/page/my-application)

---

## Quick Reference

### Configuration

| Function | Purpose |
|----------|---------|
| `initEenToolkit(config)` | Initialize the toolkit with proxy URL and client ID |

### Authentication Functions

| Function | Purpose | Returns |
|----------|---------|---------|
| `getAuthUrl()` | Generate OAuth authorization URL | `string` |
| `handleAuthCallback(code, state)` | Exchange auth code for token | `Result<TokenResponse>` |
| `refreshToken()` | Refresh the access token | `Result<{accessToken, expiresIn}>` |
| `revokeToken()` | Revoke token and logout | `Result<void>` |

### User Functions

| Function | Purpose | Returns |
|----------|---------|---------|
| `getCurrentUser()` | Get current user profile | `Result<UserProfile>` |
| `getUsers(params?)` | List all users (paginated) | `Result<PaginatedResult<User>>` |
| `getUser(userId, params?)` | Get a specific user | `Result<User>` |

### Camera Functions

| Function | Purpose | Returns |
|----------|---------|---------|
| `getCameras(params?)` | List all cameras (paginated) | `Result<PaginatedResult<Camera>>` |
| `getCamera(cameraId, params?)` | Get a specific camera | `Result<Camera>` |

---

## Critical Requirements

### OAuth Redirect URI (IMPORTANT)

The EEN Identity Provider performs an **exact string match** on the redirect URI. Applications MUST follow these rules:

| Requirement | Correct | Incorrect |
|-------------|---------|-----------|
| Host | `127.0.0.1` | `localhost` |
| Path | None (root path only) | `/callback` |
| Trailing slash | No | `http://127.0.0.1:3333/` |

**The only valid redirect URI is: `http://127.0.0.1:3333`**

**Configure at:** [EEN Developer Portal - My Application](https://developer.eagleeyenetworks.com/page/my-application)

### Application Requirements

1. **Handle OAuth callbacks on the root path (`/`)** - not `/callback`
2. **Run dev server on `127.0.0.1`** - not `localhost`
3. **Register exactly `http://127.0.0.1:3333` with EEN at the Developer Portal**

### Router Pattern for OAuth Callbacks

The root path must detect OAuth params and handle the callback:

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

### Vite Dev Server Configuration

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    host: '127.0.0.1',  // MUST use 127.0.0.1, not localhost
    port: 3333,
    strictPort: true
  }
})
```

### Common OAuth Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Redirect URI mismatch" | URI doesn't match exactly | Use `http://127.0.0.1:3333` (no path, no trailing slash) |
| Redirected back to login | Router guard blocks callback | Allow OAuth params through on root path |
| Callback not processed | Wrong path or host | Handle callback on `/`, use `127.0.0.1` |

---

## Core Types

### Result<T>

All API functions return a `Result<T>` type - they never throw exceptions.

```typescript
type Result<T> =
  | { data: T; error: null }      // Success
  | { data: null; error: EenError } // Failure

interface EenError {
  code: ErrorCode
  message: string
  status?: number
  details?: unknown
}

type ErrorCode =
  | 'AUTH_REQUIRED'    // No valid token - redirect to login
  | 'AUTH_FAILED'      // Authentication failed
  | 'TOKEN_EXPIRED'    // Token expired - will auto-refresh
  | 'API_ERROR'        // EEN API returned an error
  | 'NETWORK_ERROR'    // Network request failed
  | 'VALIDATION_ERROR' // Invalid parameters
  | 'NOT_FOUND'        // Resource not found (404)
  | 'FORBIDDEN'        // Access denied (403)
  | 'RATE_LIMITED'     // Too many requests (429)
  | 'UNKNOWN_ERROR'    // Unexpected error
```

### Pagination Types

```typescript
interface PaginationParams {
  pageSize?: number   // Results per page (default varies, typically 100)
  pageToken?: string  // Token for fetching a specific page
}

interface PaginatedResult<T> {
  results: T[]
  nextPageToken?: string  // Token for next page (undefined if last page)
  prevPageToken?: string  // Token for previous page
  totalSize?: number      // Total count (not always provided)
}
```

### Configuration Type

```typescript
interface EenToolkitConfig {
  proxyUrl?: string    // OAuth proxy URL (required for API calls)
  clientId?: string    // EEN OAuth client ID
  redirectUri?: string // OAuth redirect URI (default: http://127.0.0.1:3333)
  debug?: boolean      // Enable debug logging
}
```

---

## Entity Types

### User

```typescript
interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  accountId?: string
  timeZone?: string       // IANA timezone (e.g., "America/Los_Angeles")
  language?: string       // ISO 639-1 code (e.g., "en")
  phone?: string
  mobilePhone?: string
  permissions?: string[]  // Requires include: ['permissions']
  lastLogin?: string      // ISO 8601 timestamp
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  accountId?: string
  timeZone?: string
  language?: string
}
```

### Camera

```typescript
type CameraStatus =
  | 'online' | 'offline' | 'deviceOffline' | 'bridgeOffline'
  | 'invalidCredentials' | 'error' | 'streaming' | 'registered'
  | 'attaching' | 'initializing'

interface Camera {
  id: string
  name: string
  accountId: string
  bridgeId?: string | null
  locationId?: string | null
  status?: CameraStatus
  timezone?: string
  guid?: string
  ipAddress?: string
  macAddress?: string
  tags?: string[]
  notes?: string
  multiCameraId?: string
  recordingModes?: CameraRecordingModes
  deviceInfo?: CameraDeviceInfo
  shareDetails?: CameraShareDetails
  devicePosition?: CameraDevicePosition
  enabledAnalytics?: string[]
  packages?: string[]
  createdAt?: string
  updatedAt?: string
}

interface CameraDeviceInfo {
  make?: string           // Manufacturer (e.g., "Axis", "Hikvision")
  model?: string          // Model name
  firmwareVersion?: string
  directToCloud?: boolean // Direct-to-cloud camera (no bridge)
  serialNumber?: string
  resolution?: string
  type?: string           // Camera type (e.g., "IP", "Analog")
}

interface CameraShareDetails {
  shared?: boolean
  accountId?: string      // Sharing account ID
  firstResponder?: boolean
  permissions?: string[]
}

interface CameraDevicePosition {
  latitude?: number
  longitude?: number
  altitude?: number
  floor?: number
  azimuth?: number
}
```

### User Parameter Types

```typescript
interface ListUsersParams {
  pageSize?: number    // Results per page (default: 100, max: 1000)
  pageToken?: string   // Pagination token
  include?: string[]   // Additional fields (e.g., ['permissions'])
}

interface GetUserParams {
  include?: string[]   // Additional fields to include
}
```

### Camera Parameter Types

```typescript
interface ListCamerasParams {
  pageSize?: number           // Results per page
  pageToken?: string          // Pagination token
  include?: string[]          // Additional fields to include
  sort?: string[]             // Sort order
  status__in?: CameraStatus[] // Filter by status
  status__ne?: CameraStatus   // Exclude by status
  tags__contains?: string[]   // Filter by tags (all must match)
  tags__any?: string[]        // Filter by tags (any match)
  name?: string               // Exact name match
  name__contains?: string     // Partial name match
  name__in?: string[]         // Name in list
  id__in?: string[]           // ID in list
  id__notIn?: string[]        // ID not in list
  bridgeId__in?: string[]     // Bridge ID filter
  locationId__in?: string[]   // Location ID filter
  shared?: boolean            // Shared camera filter
  directToCloud?: boolean     // Direct-to-cloud filter
  q?: string                  // Full-text search
  // ... and more filter parameters
}

interface GetCameraParams {
  include?: string[]  // Valid values: bridge, account, status, locationSummary,
                      // deviceAddress, timeZone, notes, tags, devicePosition,
                      // networkInfo, deviceInfo, effectivePermissions, firmware,
                      // shareDetails, visibleByBridges, capabilities, analog,
                      // packages, dewarpConfig, adminCredentials,
                      // publicSafetySharing, enabledAnalytics
}
```

---

## API Reference

### initEenToolkit

Initialize the toolkit. Call this before using any API functions.

```typescript
import { initEenToolkit } from 'een-api-toolkit'

// In main.ts
initEenToolkit({
  proxyUrl: import.meta.env.VITE_PROXY_URL,
  clientId: import.meta.env.VITE_EEN_CLIENT_ID,
  debug: true // optional
})
```

### getAuthUrl

Generate the OAuth authorization URL. Redirect the user here to start login.

```typescript
import { getAuthUrl } from 'een-api-toolkit'

function login() {
  window.location.href = getAuthUrl()
}
```

### handleAuthCallback

Handle the OAuth callback after user authorizes. Call this when user returns to your redirect URI.

```typescript
import { handleAuthCallback } from 'een-api-toolkit'

// In your callback route handler
const url = new URL(window.location.href)
const code = url.searchParams.get('code')
const state = url.searchParams.get('state')

if (code && state) {
  const { data, error } = await handleAuthCallback(code, state)

  if (error) {
    console.error('Auth failed:', error.message)
    return
  }

  // User is now authenticated
  router.push('/dashboard')
}
```

### getCurrentUser

Get the current authenticated user's profile.

```typescript
import { getCurrentUser } from 'een-api-toolkit'

const { data, error } = await getCurrentUser()

if (error) {
  if (error.code === 'AUTH_REQUIRED') {
    router.push('/login')
  }
  return
}

console.log(`Welcome, ${data.firstName} ${data.lastName}`)
```

### getUsers

List users with optional pagination.

```typescript
import { getUsers } from 'een-api-toolkit'

// Basic usage
const { data, error } = await getUsers()

// With pagination
const { data } = await getUsers({ pageSize: 50 })

// Fetch all users
let allUsers: User[] = []
let pageToken: string | undefined

do {
  const { data, error } = await getUsers({ pageSize: 100, pageToken })
  if (error) break
  allUsers.push(...data.results)
  pageToken = data.nextPageToken
} while (pageToken)
```

### getUser

Get a specific user by ID.

```typescript
import { getUser } from 'een-api-toolkit'

const { data, error } = await getUser('user-id-123')

if (error) {
  if (error.code === 'NOT_FOUND') {
    console.log('User not found')
  }
  return
}

// With permissions
const { data: userWithPerms } = await getUser('user-id-123', {
  include: ['permissions']
})
```

### getCameras

List cameras with optional pagination and filtering.

```typescript
import { getCameras } from 'een-api-toolkit'

// Basic usage
const { data, error } = await getCameras()

// With pagination
const { data } = await getCameras({ pageSize: 50 })

// With status filter
const { data } = await getCameras({
  pageSize: 20,
  status__in: ['online', 'streaming']
})

// With search
const { data } = await getCameras({
  q: 'front door',
  include: ['deviceInfo', 'status']
})
```

### getCamera

Get a specific camera by ID.

```typescript
import { getCamera } from 'een-api-toolkit'

const { data, error } = await getCamera('camera-id-123')

if (error) {
  if (error.code === 'NOT_FOUND') {
    console.log('Camera not found')
  }
  return
}

// With additional fields
const { data: cameraWithDetails } = await getCamera('camera-id-123', {
  include: ['deviceInfo', 'status', 'shareDetails']
})
```

---

## Common Patterns

### Error Handling

```typescript
// All functions return Result<T>, never throw
const { data, error } = await getUsers()

if (error) {
  switch (error.code) {
    case 'AUTH_REQUIRED':
      router.push('/login')
      break
    case 'NETWORK_ERROR':
      showRetryDialog()
      break
    case 'RATE_LIMITED':
      await sleep(1000)
      return retry()
    default:
      showError(error.message)
  }
  return
}

// TypeScript knows data is not null here
processUsers(data.results)
```

### Pagination

```typescript
// Manual pagination - fetch all
async function fetchAllUsers(): Promise<User[]> {
  const allUsers: User[] = []
  let pageToken: string | undefined

  do {
    const { data, error } = await getUsers({ pageSize: 100, pageToken })
    if (error) break // Stop on error, return what we have
    allUsers.push(...data.results)
    pageToken = data.nextPageToken
  } while (pageToken)

  return allUsers
}
```

### Auth Guard (Vue Router)

```typescript
import { useAuthStore } from 'een-api-toolkit'

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})
```

### Vue Component Example

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getCurrentUser, type UserProfile, type EenError } from 'een-api-toolkit'

const user = ref<UserProfile | null>(null)
const loading = ref(false)
const error = ref<EenError | null>(null)

async function fetchUser() {
  loading.value = true
  const result = await getCurrentUser()
  loading.value = false

  if (result.error) {
    error.value = result.error
    return
  }

  user.value = result.data
}

onMounted(() => {
  fetchUser()
})
</script>

<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="error">{{ error.message }}</div>
  <div v-else-if="user">Welcome, {{ user.firstName }}!</div>
</template>
```

---

## Anti-Patterns (What NOT to Do)

### DON'T: Use try/catch for API errors

```typescript
// WRONG - functions don't throw
try {
  const users = await getUsers()
} catch (e) {
  // This will never catch API errors!
}

// CORRECT
const { data, error } = await getUsers()
if (error) handleError(error)
```

### DON'T: Ignore the error check

```typescript
// WRONG - data might be null
const { data } = await getUsers()
data.results.forEach(...) // TypeError if error occurred!

// CORRECT
const { data, error } = await getUsers()
if (error) return
data.results.forEach(...) // Safe - TypeScript knows data is not null
```

### DON'T: Call initEenToolkit multiple times

```typescript
// WRONG - calling in component
export default {
  setup() {
    initEenToolkit({ ... }) // Called every time component mounts!
  }
}

// CORRECT - call once in main.ts
// main.ts
initEenToolkit({ ... })
app.mount('#app')
```

### DON'T: Access data before checking error

```typescript
// WRONG - unsafe access
const { data, error } = await getUser(id)
console.log(data.email) // TypeError if error!
if (error) { ... }

// CORRECT - check error first
const { data, error } = await getUser(id)
if (error) {
  console.error(error.message)
  return
}
console.log(data.email) // Safe
```

---

## Additional Setup Details

### OAuth Callback Route

The `beforeEnter` guard shown in the "Critical Requirements" section redirects OAuth responses to a named route called 'callback'. Here is how to set up that route and its component:

```typescript
// router/index.ts
{
  path: '/callback',
  name: 'callback',
  component: () => import('./views/Callback.vue')
}
```

```vue
<!-- views/Callback.vue -->
<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { handleAuthCallback } from 'een-api-toolkit'

const router = useRouter()

onMounted(async () => {
  const url = new URL(window.location.href)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')

  if (!code || !state) {
    router.push('/login?error=missing_params')
    return
  }

  const { error } = await handleAuthCallback(code, state)

  if (error) {
    router.push(`/login?error=${error.code}`)
    return
  }

  router.push('/dashboard')
})
</script>

<template>
  <div>Authenticating...</div>
</template>
```

### Login Component

```vue
<!-- views/Login.vue -->
<script setup>
import { getAuthUrl } from 'een-api-toolkit'

function login() {
  window.location.href = getAuthUrl()
}
</script>

<template>
  <div>
    <h1>Login</h1>
    <button @click="login">Sign in with Eagle Eye Networks</button>
  </div>
</template>
```

### Logout Component

```vue
<!-- In a component, e.g., App.vue or a NavBar component -->
<script setup lang="ts">
import { revokeToken } from 'een-api-toolkit'
import { useRouter } from 'vue-router'

const router = useRouter()

async function logout() {
  await revokeToken()
  // Redirect to login page after token is revoked
  router.push('/login')
}
</script>

<template>
  <button @click="logout">Logout</button>
</template>
```

---

## External Resources

- [Eagle Eye Networks Developer Portal](https://developer.eagleeyenetworks.com)
- [EEN API v3.0 Reference](https://developer.eagleeyenetworks.com/reference/using-the-api)
- [GitHub Repository](https://github.com/klaushofrichter/een-api-toolkit)
- [OAuth Proxy](https://github.com/klaushofrichter/een-oauth-proxy) - Required for secure token management
