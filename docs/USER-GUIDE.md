# User Guide

This guide covers everything you need to use een-api-toolkit in your Vue 3 application.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Claude Code Agents](#claude-code-agents)
- [OAuth Proxy Setup](#oauth-proxy-setup)
- [Configuration](#configuration)
- [Authentication Flow](#authentication-flow)
- [Using the API](#using-the-api)
  - [Events API](#events-api)
  - [Live Video Streaming](#live-video-streaming)
- [Utilities](#utilities)
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
npm install vue@^3.3.0 pinia@^3.0.0
```

> **Note:** Starting from v0.3.19, this toolkit requires Pinia 3.x. If you're upgrading from an earlier version and using Pinia 2.x, you'll need to upgrade to Pinia 3. The upgrade is straightforward as Pinia 3 maintains API compatibility with Pinia 2. See the [Pinia migration guide](https://pinia.vuejs.org/cookbook/migration-v2-v3.html) for details.

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

## Claude Code Agents

The toolkit includes specialized Claude Code agents that provide domain-specific assistance when building EEN applications. These agents have deep knowledge of the toolkit's APIs and best practices.

> **Note:** These agents are designed specifically for [Claude Code](https://docs.anthropic.com/en/docs/claude-code). The agent definition format (YAML frontmatter in `.claude/agents/*.md`) is Claude Code specific. To use these agents with other AI coding assistants (such as Gemini CLI, GitHub Copilot, or Cursor), the agent specifications would need to be converted to their respective formats.

### Available Agents

| Agent | Purpose |
|-------|---------|
| `een-setup-agent` | Vue 3 project scaffolding, Pinia initialization, Vite configuration, redirect URI setup |
| `een-auth-agent` | OAuth login/logout flows, auth callbacks, route guards, token refresh |
| `een-users-agent` | User listing, profiles, permissions, getCurrentUser() |
| `een-devices-agent` | Cameras and bridges listing, status filtering, device details |
| `een-media-agent` | Live video, camera previews, HLS playback, recorded images, LivePlayer SDK |
| `een-events-agent` | Events, alerts, metrics, SSE subscriptions, Chart.js integration |

### Installing Agents

After installing the toolkit, run the agent setup script to copy the agents to your project:

```bash
npx een-setup-agents
```

This copies the agent definition files to `.claude/agents/` in your project directory, where Claude Code automatically discovers them.

> **Important:** After running the setup script, you must **restart Claude Code** for the agents to become available. Claude Code only loads agents from `.claude/agents/` at startup.

> **Note:** Installing agents is optional. The toolkit works fully without agents - you can use all API functions and follow the documentation. Agents simply provide specialized AI assistance for common tasks like OAuth setup, video streaming, and troubleshooting.

### Using Agents

Once installed and Claude Code is restarted, the agents are automatically available. Claude Code will invoke the appropriate agent based on your questions:

**Examples of questions that trigger agents:**

```
# Triggers een-setup-agent
"I want to create a new Vue 3 app that uses een-api-toolkit"
"I'm getting 'Pinia not active' errors"

# Triggers een-auth-agent
"How do I add OAuth login to my EEN app?"
"My OAuth callback is failing with an error"

# Triggers een-devices-agent
"How do I show all cameras in a grid?"
"How do I filter cameras by online status?"

# Triggers een-media-agent
"How do I show live preview images from my cameras?"
"My HLS video player isn't working"

# Triggers een-events-agent
"How do I show motion events from a camera?"
"How do I create a chart showing event counts over time?"
```

### Agent Capabilities

Each agent has access to:
- Detailed API documentation and type definitions
- Code examples and patterns from the toolkit
- Common error solutions and troubleshooting guides
- Best practices for security and performance

The agents can read your project files, suggest code changes, and help debug issues specific to EEN API integration.

### Updating Agents

When you update the toolkit to a newer version, re-run the setup script to get the latest agent definitions:

```bash
npm update een-api-toolkit
npx een-setup-agents
```

Remember to restart Claude Code after updating the agents.

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
| `storageStrategy` | string | No | Token storage method: `'localStorage'` (default), `'sessionStorage'`, or `'memory'` |
| `debug` | boolean | No | Enable console debug logging |

### Token Storage Strategy

The `storageStrategy` option controls how authentication tokens are persisted in the browser. This is a security vs. convenience tradeoff.

```typescript
initEenToolkit({
  proxyUrl: import.meta.env.VITE_PROXY_URL,
  clientId: import.meta.env.VITE_EEN_CLIENT_ID,
  storageStrategy: 'sessionStorage'  // Choose based on your security requirements
})
```

#### Storage Options Comparison

| Strategy | Security | Persistence | XSS Risk |
|----------|----------|-------------|----------|
| `localStorage` | Lower | Survives browser restart | Tokens accessible via JavaScript |
| `sessionStorage` | Medium | Per-tab, cleared on tab close | Limited to single tab |
| `memory` | Highest | Lost on page refresh | Tokens never written to disk |

#### User Experience Impact

The storage strategy significantly affects user experience:

| Scenario | `localStorage` | `sessionStorage` | `memory` |
|----------|----------------|------------------|----------|
| Page refresh | Stays logged in | Stays logged in | **Must re-login** |
| Close & reopen tab | Stays logged in | **Must re-login** | **Must re-login** |
| Open new tab | Stays logged in | **Must re-login** | **Must re-login** |
| Close browser | Stays logged in | **Must re-login** | **Must re-login** |

#### Recommendations

- **`localStorage`** (default): Best user experience. Suitable for most applications where the primary threat model doesn't include XSS attacks from the same origin.

- **`sessionStorage`**: Balanced approach. Each browser tab is isolated, limiting the blast radius of potential XSS attacks. Users opening multiple tabs will need to authenticate in each tab.

- **`memory`**: Maximum security. Tokens are never persisted to disk and cannot be stolen via storage inspection. Recommended for:
  - High-security deployments (financial, healthcare, critical infrastructure)
  - Admin panels with elevated privileges
  - Applications where users expect to re-authenticate frequently

#### Security Context

The toolkit already implements secure practices:
- **Refresh tokens are never exposed** to the client - they're stored server-side in the OAuth proxy
- **Access tokens are short-lived** (validity configurable per account, from 15 min to 7 days), limiting the window of exposure
- The storage strategy affects only the access token and session metadata

For applications where XSS is a significant concern, consider using `sessionStorage` or `memory` in combination with Content Security Policy (CSP) headers.

#### Displaying Storage Strategy in UI

The toolkit exports `STORAGE_STRATEGY_DESCRIPTIONS` - a mapping of storage strategies to human-readable descriptions. This is useful for displaying the current storage strategy to users, especially on login pages.

```typescript
import { getStorageStrategy, STORAGE_STRATEGY_DESCRIPTIONS } from 'een-api-toolkit'

const strategy = getStorageStrategy()
const description = STORAGE_STRATEGY_DESCRIPTIONS[strategy]

console.log(`Using ${strategy}: ${description}`)
// Example output: "Using sessionStorage: per-tab, cleared on tab close"
```

**Available descriptions:**

| Strategy | Description |
|----------|-------------|
| `localStorage` | "persists across sessions" |
| `sessionStorage` | "per-tab, cleared on tab close" |
| `memory` | "tokens lost on page refresh" |

**Vue 3 Example:**

```vue
<script setup lang="ts">
import { getStorageStrategy, STORAGE_STRATEGY_DESCRIPTIONS } from 'een-api-toolkit'

const storageStrategy = getStorageStrategy()
const storageDescription = STORAGE_STRATEGY_DESCRIPTIONS[storageStrategy]
</script>

<template>
  <p class="storage-note">
    Storage strategy: <strong>{{ storageStrategy }}</strong> ({{ storageDescription }})
  </p>
</template>
```

This approach ensures the displayed information always stays in sync with the actual configuration, even if the storage strategy is changed in `initEenToolkit()`.

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
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from 'een-api-toolkit'

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

// Global navigation guard for authentication
router.beforeEach((to, _from, next) => {
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
2. After authentication, EEN redirects to your configured `redirectUri` with OAuth params (e.g., `http://127.0.0.1:3333?code=...&state=...`)
3. Router's `beforeEnter` guard detects `code` and `state` query params
4. Router forwards to internal `/callback` route with the params
5. Callback component exchanges the code for tokens via `handleAuthCallback()`

> **Note:** The redirect URL is determined by the `redirectUri` option in `initEenToolkit()` (or `VITE_REDIRECT_URI` env var). This must match exactly what's registered with your EEN OAuth client.

> **Security Note:** The `state` parameter provides CSRF protection. The toolkit's `handleAuthCallback()` function validates the state parameter internally against the value stored during `getAuthUrl()`. Invalid or tampered state values will result in an authentication error.

> **Error Handling:** The callback component handles all OAuth error scenarios. If the authorization code is invalid, expired, or the state doesn't match, `handleAuthCallback()` returns an error object with details. Invalid parameters (e.g., manually navigating to `/?code=invalid&state=invalid`) are safely handled and will display an error message rather than cause application crashes.

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

The EEN API requires timestamps in **ISO 8601 format with `+00:00` suffix**. The `Z` suffix (UTC) is **not accepted**.

| Format | Example | Valid |
|--------|---------|-------|
| With +00:00 | `2025-01-15T22:30:00.000+00:00` | ✅ Yes |
| With Z suffix | `2025-01-15T22:30:00.000Z` | ❌ No |

**Using the `formatTimestamp` utility (recommended):**

The toolkit exports a `formatTimestamp` utility function that converts standard ISO timestamps (with `Z` suffix) to the EEN API format (with `+00:00` suffix):

```typescript
import { formatTimestamp } from 'een-api-toolkit'

// Convert JavaScript's toISOString() output to EEN API format
const timestamp = formatTimestamp(new Date().toISOString())
// Input:  "2025-01-15T22:30:00.000Z"
// Output: "2025-01-15T22:30:00.000+00:00"

// Use in API calls
const { data } = await getRecordedImage({
  deviceId: 'camera-123',
  type: 'preview',
  timestamp__gte: formatTimestamp(new Date().toISOString())
})
```

**Note:** The toolkit's API functions (like `listAlerts`, `getEventMetrics`, `listNotifications`) automatically apply `formatTimestamp` internally, so you can pass timestamps in either format. However, when displaying timestamps for debugging or when making direct API calls, use `formatTimestamp` to ensure the correct format.

**Common mistake:**

```typescript
// WRONG - toISOString() returns Z suffix which is not accepted by EEN API
const timestamp = new Date().toISOString()
// Returns: "2025-01-15T22:30:00.000Z" ❌

// CORRECT - use formatTimestamp to convert to +00:00 format
import { formatTimestamp } from 'een-api-toolkit'
const timestamp = formatTimestamp(new Date().toISOString())
// Returns: "2025-01-15T22:30:00.000+00:00" ✅
```

### Events API

The Events API allows you to query events (motion detection, analytics, etc.) from cameras and other devices.

```typescript
import { listEvents, listEventTypes, listEventFieldValues, getRecordedImage } from 'een-api-toolkit'

// Step 1: Get available event types for a camera
const { data: fieldValues, error } = await listEventFieldValues({
  actor: `camera:${cameraId}`
})

if (fieldValues) {
  console.log('Available event types:', fieldValues.type)
  // e.g., ['een.motionDetectionEvent.v1', 'een.personDetectionEvent.v1']
}

// Step 2: List events with filters
const { data: eventsResponse } = await listEvents({
  actor: `camera:${cameraId}`,
  type__in: fieldValues?.type || [],  // Event types to fetch
  startTimestamp__gte: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),  // Last 24 hours
  endTimestamp__lte: new Date().toISOString(),
  pageSize: 20,
  sort: '-startTimestamp',  // Newest first
  include: ['data.een.fullFrameImageUrl.v1']  // Include image URLs in response
})

if (eventsResponse) {
  for (const event of eventsResponse.results) {
    console.log(`Event: ${event.type} at ${event.startTimestamp}`)
  }
}

// Step 3: Get event thumbnail using getRecordedImage
const event = eventsResponse?.results[0]
if (event) {
  const { data: image } = await getRecordedImage({
    deviceId: event.actorId,
    type: 'preview',
    timestamp__gte: event.startTimestamp
  })

  if (image) {
    imgElement.src = image.imageData  // Base64 data URL
  }
}
```

#### Include Parameter & Data Schemas

The `include` parameter controls which data schemas are populated in the `event.data[]` array.
Include values are derived from the event's `dataSchemas` array by adding the `data.` prefix.

**How it works:**
1. Each event has a `dataSchemas` array listing available schemas (e.g., `['een.objectDetection.v1', 'een.fullFrameImageUrl.v1']`)
2. To include that data, prefix with `data.` (e.g., `include: ['data.een.objectDetection.v1']`)
3. Without includes, the event may return with minimal or empty `data[]`

**Common data schemas:**

| Schema | Include Value | Description |
|--------|---------------|-------------|
| `een.objectDetection.v1` | `data.een.objectDetection.v1` | Bounding boxes `[x1, y1, x2, y2]` (normalized 0-1) |
| `een.objectClassification.v1` | `data.een.objectClassification.v1` | Object labels (person, vehicle, etc.) |
| `een.fullFrameImageUrl.v1` | `data.een.fullFrameImageUrl.v1` | Full frame image URL |
| `een.croppedFrameImageUrl.v1` | `data.een.croppedFrameImageUrl.v1` | Cropped/zoomed image URL |
| `een.fullFrameImageUrlWithOverlay.v1` | `data.een.fullFrameImageUrlWithOverlay.v1` | Image URL with bounding box overlay |
| `een.eevaAttributes.v1` | `data.een.eevaAttributes.v1` | EEVA analytics attributes |
| `een.customLabels.v1` | `data.een.customLabels.v1` | Custom detection labels |

**Fetching full event details:**

```typescript
import { getEvent } from 'een-api-toolkit'

// Get event with all available data based on its dataSchemas
const simpleEvent = events.value.find(e => e.id === eventId)
const includes = simpleEvent?.dataSchemas.map(schema => `data.${schema}`) || []

const { data: fullEvent } = await getEvent(eventId, { include: includes })
// fullEvent.data[] now contains all available data objects
```

**Complete Vue Example (Events Modal):**

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'
import { listEvents, listEventFieldValues, getRecordedImage, type Event } from 'een-api-toolkit'

const props = defineProps<{ cameraId: string; isOpen: boolean }>()

const events = ref<Event[]>([])
const eventImages = ref<Map<string, string>>(new Map())
const loading = ref(false)

// Fetch events when modal opens, clean up on close
watch(() => props.isOpen, async (isOpen) => {
  if (!isOpen) {
    // Clean up on close to free memory
    eventImages.value.clear()
    events.value = []
    return
  }

  loading.value = true

  // Get available event types for this camera
  const { data: fieldValues } = await listEventFieldValues({
    actor: `camera:${props.cameraId}`
  })

  if (!fieldValues?.type?.length) {
    loading.value = false
    return
  }

  // Fetch events
  const { data } = await listEvents({
    actor: `camera:${props.cameraId}`,
    type__in: fieldValues.type,
    startTimestamp__gte: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    endTimestamp__lte: new Date().toISOString(),
    pageSize: 20,
    sort: '-startTimestamp'
  })

  events.value = data?.results || []
  loading.value = false

  // Load thumbnails in parallel for better performance
  await Promise.all(
    events.value.map(async (event) => {
      const { data: image } = await getRecordedImage({
        deviceId: event.actorId,
        type: 'preview',
        timestamp__gte: event.startTimestamp
      })
      if (image) {
        eventImages.value.set(event.id, image.imageData)
      }
    })
  )
}, { immediate: true })
</script>

<template>
  <div v-if="isOpen" class="events-modal">
    <div v-if="loading">Loading events...</div>
    <div v-else-if="events.length === 0">No events found</div>
    <div v-else class="events-list">
      <div v-for="event in events" :key="event.id" class="event-item">
        <img v-if="eventImages.get(event.id)" :src="eventImages.get(event.id)" />
        <div>{{ event.type }} - {{ event.startTimestamp }}</div>
      </div>
    </div>
  </div>
</template>
```

See the [vue-events example](../examples/vue-events/) for a complete working application with events modal, filtering by event type, and time range selection.

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

## Utilities

The toolkit exports utility functions to help with common tasks.

### formatTimestamp

Converts ISO 8601 timestamps from `Z` format to `+00:00` format, as required by the EEN API.

```typescript
import { formatTimestamp } from 'een-api-toolkit'

// Convert Z format to +00:00 format
formatTimestamp('2025-01-15T22:30:00.000Z')
// Returns: '2025-01-15T22:30:00.000+00:00'

// Already in +00:00 format - returns unchanged
formatTimestamp('2025-01-15T22:30:00.000+00:00')
// Returns: '2025-01-15T22:30:00.000+00:00'

// Common usage pattern
const now = new Date()
const apiTimestamp = formatTimestamp(now.toISOString())
```

**When to use:**
- When displaying timestamps that match the exact API format (e.g., for debugging)
- When making direct API calls outside of the toolkit
- When building custom timestamp display components

**Note:** The toolkit's API functions automatically apply this conversion internally, so you don't need to pre-format timestamps when using functions like `listAlerts()`, `getEventMetrics()`, or `listNotifications()`.

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

### HLS Video Playback

For detailed troubleshooting of HLS (HTTP Live Streaming) video playback issues, see the dedicated [HLS Video Troubleshooting Guide](./guides/HLS-VIDEO-TROUBLESHOOTING.md).

Common HLS issues include:
- **401 Unauthorized**: HLS.js needs Bearer token authentication, not cookies
- **No video available**: Recording intervals must contain the target timestamp
- **Timestamp format errors**: Use `formatTimestamp()` to convert `Z` to `+00:00` format
- **HLS not available**: Only `main` feeds support HLS, not `preview`

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

## Example Applications

The toolkit includes several example applications demonstrating different features:

- [vue-users](../examples/vue-users/) - User management with pagination and error handling
- [vue-cameras](../examples/vue-cameras/) - Camera listing with status display
- [vue-bridges](../examples/vue-bridges/) - Bridge listing with device info
- [vue-layouts](../examples/vue-layouts/) - Layout CRUD with camera pane management
- [vue-media](../examples/vue-media/) - Live and recorded image playback
- [vue-feeds](../examples/vue-feeds/) - Live video streaming with preview and main streams
- [vue-events](../examples/vue-events/) - Events API with filtering, time ranges, and thumbnails
- [vue-alerts-metrics](../examples/vue-alerts-metrics/) - Event metrics, alerts, and notifications
- [vue-event-subscriptions](../examples/vue-event-subscriptions/) - Real-time SSE event streaming
