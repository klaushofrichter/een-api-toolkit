# EEN API Toolkit - AI Reference

> **Version:** 0.0.11
> **Generated:** 2025-12-28
>
> This file is optimized for AI assistants. It contains all API signatures,
> types, and usage patterns in a single, parseable document.
>
> For the full EEN API documentation, see the
> [Eagle Eye Networks Developer Portal](https://developer.eagleeyenetworks.com).

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

### Vue 3 Composables

| Composable | Purpose | Returns |
|------------|---------|---------|
| `useCurrentUser(options?)` | Reactive current user | `{ user, loading, error, refresh }` |
| `useUsers(params?, options?)` | Reactive user list with pagination | `{ users, loading, hasNextPage, fetchNextPage, ... }` |
| `useUser(userId, options?)` | Reactive single user | `{ user, loading, error, refresh }` |

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

### Parameter Types

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

---

## Vue 3 Composables

### useCurrentUser

Reactive composable for the current authenticated user.

```vue
<script setup>
import { useCurrentUser } from 'een-api-toolkit'

const { user, loading, error, refresh } = useCurrentUser()

// Options:
// { immediate: false } - don't fetch on mount
</script>

<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <div v-else-if="user">
    <h1>Welcome, {{ user.firstName }}!</h1>
    <button @click="refresh">Refresh</button>
  </div>
</template>
```

**Returns:**
- `user: Ref<UserProfile | null>` - The user profile
- `loading: Ref<boolean>` - Fetch in progress
- `error: Ref<EenError | null>` - Last error
- `fetch(): Promise<Result<UserProfile>>` - Fetch user
- `refresh(): Promise<Result<UserProfile>>` - Alias for fetch

### useUsers

Reactive composable for listing users with pagination.

```vue
<script setup>
import { useUsers } from 'een-api-toolkit'

const {
  users,
  loading,
  error,
  hasNextPage,
  fetchNextPage,
  refresh
} = useUsers({ pageSize: 20 })
</script>

<template>
  <ul>
    <li v-for="user in users" :key="user.id">
      {{ user.firstName }} {{ user.lastName }}
    </li>
  </ul>
  <button v-if="hasNextPage" @click="fetchNextPage">Load More</button>
</template>
```

**Returns:**
- `users: Ref<User[]>` - Array of users
- `loading: Ref<boolean>` - Fetch in progress
- `error: Ref<EenError | null>` - Last error
- `hasNextPage: ComputedRef<boolean>` - More pages available
- `hasPrevPage: ComputedRef<boolean>` - Previous page available
- `nextPageToken: Ref<string | undefined>` - Next page token
- `totalSize: Ref<number | undefined>` - Total count
- `fetch(params?): Promise<Result>` - Fetch with params
- `refresh(): Promise<Result>` - Refresh current page
- `fetchNextPage(): Promise<Result | undefined>` - Fetch next page
- `fetchPrevPage(): Promise<Result | undefined>` - Fetch previous page
- `setParams(params): void` - Update default params

### useUser

Reactive composable for a single user by ID.

```vue
<script setup>
import { useUser } from 'een-api-toolkit'
import { useRoute } from 'vue-router'

const route = useRoute()

// Static ID
const { user, loading, error } = useUser('user-123')

// Reactive ID from route
const { user: routeUser } = useUser(() => route.params.id as string)

// With options
const { user: userWithPerms } = useUser('user-123', {
  include: ['permissions']
})
</script>
```

**Returns:**
- `user: Ref<User | null>` - The user
- `loading: Ref<boolean>` - Fetch in progress
- `error: Ref<EenError | null>` - Last error
- `fetch(params?): Promise<Result<User>>` - Fetch user
- `refresh(): Promise<Result<User>>` - Refresh user

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

### Composable with Conditional Fetch

```vue
<script setup>
import { useCurrentUser } from 'een-api-toolkit'
import { onMounted } from 'vue'

// Don't fetch on mount
const { user, fetch } = useCurrentUser({ immediate: false })

onMounted(async () => {
  // Only fetch if some condition is met
  if (shouldFetchUser()) {
    await fetch()
  }
})
</script>
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

## Setup Guide

### Installation

```bash
npm install een-api-toolkit
```

### Prerequisites (IMPORTANT)

The toolkit uses **Pinia for state management internally**. You must install and configure Pinia before initializing the toolkit:

```bash
npm install pinia
```

**Pinia must be installed on the Vue app instance BEFORE calling `initEenToolkit()` or using any composables** (`useCurrentUser`, `useUsers`, `useUser`). Failing to do so will result in:

```
Error: [🍍]: "getActivePinia()" was called but there was no active Pinia.
Are you trying to use a store before calling "app.use(pinia)"?
```

### Environment Variables

Create a `.env` file:

```env
VITE_PROXY_URL=https://your-proxy.workers.dev
VITE_EEN_CLIENT_ID=your-een-client-id
# IMPORTANT: EEN IDP only permits this exact redirect URI
VITE_REDIRECT_URI=http://127.0.0.1:3333
VITE_DEBUG=true
```

> **Important:** The EEN Identity Provider only permits `http://127.0.0.1:3333` as the OAuth redirect URI. Do not use `localhost` or other ports.

### Basic Setup (main.ts)

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { initEenToolkit } from 'een-api-toolkit'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

// IMPORTANT: Install Pinia BEFORE initializing the toolkit
app.use(pinia)

// Now initialize the toolkit (Pinia must already be installed)
initEenToolkit({
  proxyUrl: import.meta.env.VITE_PROXY_URL,
  clientId: import.meta.env.VITE_EEN_CLIENT_ID,
  debug: import.meta.env.DEV
})

app.mount('#app')
```

### OAuth Callback Route

```typescript
// router/index.ts
{
  path: '/callback',
  component: () => import('./views/Callback.vue')
}
```

```vue
<!-- views/Callback.vue -->
<script setup>
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

---

## External Resources

- [Eagle Eye Networks Developer Portal](https://developer.eagleeyenetworks.com)
- [EEN API v3.0 Reference](https://developer.eagleeyenetworks.com/reference/using-the-api)
- [GitHub Repository](https://github.com/klaushofrichter/een-api-toolkit)
