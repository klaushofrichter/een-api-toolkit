#!/usr/bin/env npx tsx
/**
 * Generate AI reference documentation from TypeDoc output, source files, and examples.
 *
 * This script creates domain-specific reference documents optimized for AI assistants.
 * By default, it generates 7 focused files. Use --single for legacy monolithic output.
 *
 * Usage:
 *   npx tsx scripts/generate-ai-context.ts          # Generate 7 split files (default)
 *   npx tsx scripts/generate-ai-context.ts --single # Generate single monolithic file
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.dirname(__dirname)
const DOCS_DIR = path.join(ROOT_DIR, 'docs')
const AI_REF_DIR = path.join(DOCS_DIR, 'ai-reference')
const EXAMPLES_DIR = path.join(ROOT_DIR, 'examples')

// Read package.json for version
const packageJson = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf-8'))

interface GeneratorConfig {
  version: string
  singleFile: boolean
}

// =============================================================================
// EXAMPLE EXTRACTION UTILITIES
// =============================================================================

function readFile(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf-8')
  } catch {
    return ''
  }
}

function extractVueScript(filePath: string): string {
  const content = readFile(filePath)
  if (!content) return ''
  const match = content.match(/<script[^>]*>([\s\S]*?)<\/script>/)
  return match ? match[1].trim() : ''
}

function extractVueTemplate(filePath: string): string {
  const content = readFile(filePath)
  if (!content) return ''
  const match = content.match(/<template>([\s\S]*?)<\/template>/)
  return match ? match[1].trim() : ''
}

function extractVueComponent(filePath: string): string {
  const content = readFile(filePath)
  if (!content) return ''
  // Return script + template without style
  const scriptMatch = content.match(/<script[^>]*>[\s\S]*?<\/script>/)
  const templateMatch = content.match(/<template>[\s\S]*?<\/template>/)
  const parts: string[] = []
  if (scriptMatch) parts.push(scriptMatch[0])
  if (templateMatch) parts.push(templateMatch[0])
  return parts.join('\n\n')
}

// =============================================================================
// SHARED CONTENT GENERATORS
// =============================================================================

function generateVersionHeader(title: string, version: string, description: string): string {
  return `# ${title}

> **Version:** ${version}
>
> ${description}

---

`
}

function generateCrossReferences(docs: string[]): string {
  if (docs.length === 0) return ''
  const links = docs.map(doc => `- [${doc}](./${doc})`).join('\n')
  return `
## See Also

${links}

`
}

// =============================================================================
// CORE TYPES (shared across documents)
// =============================================================================

function generateCoreTypes(): string {
  return `## Core Types

### Result<T>

All API functions return a \`Result<T>\` type - they never throw exceptions.

\`\`\`typescript
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
  | 'AUTH_REQUIRED'       // No valid token - redirect to login
  | 'AUTH_FAILED'         // Authentication failed
  | 'TOKEN_EXPIRED'       // Token expired - will auto-refresh
  | 'API_ERROR'           // EEN API returned an error
  | 'NETWORK_ERROR'       // Network request failed
  | 'VALIDATION_ERROR'    // Invalid parameters
  | 'NOT_FOUND'           // Resource not found (404)
  | 'FORBIDDEN'           // Access denied (403)
  | 'RATE_LIMITED'        // Too many requests (429)
  | 'SERVICE_UNAVAILABLE' // Service unavailable (503)
  | 'UNKNOWN_ERROR'       // Unexpected error
\`\`\`

### Pagination Types

\`\`\`typescript
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
\`\`\`

---

`
}

// =============================================================================
// AI-CONTEXT.md (Overview)
// =============================================================================

function generateOverview(config: GeneratorConfig): string {
  return `# EEN API Toolkit - AI Reference

> **Version:** ${config.version}
>
> This documentation is optimized for AI assistants. It provides focused, domain-specific
> references to help you understand and use the een-api-toolkit efficiently.
>
> **Split Documentation:** Load only the documents you need to preserve context.

---

## Document Navigation

| Task | Document | Tokens |
|------|----------|--------|
| Setting up a new Vue 3 app | [AI-SETUP.md](./ai-reference/AI-SETUP.md) | ~2.5K |
| Implementing OAuth login | [AI-AUTH.md](./ai-reference/AI-AUTH.md) | ~2K |
| Working with users | [AI-USERS.md](./ai-reference/AI-USERS.md) | ~1.5K |
| Working with cameras or bridges | [AI-DEVICES.md](./ai-reference/AI-DEVICES.md) | ~3K |
| Live video, images, HLS playback | [AI-MEDIA.md](./ai-reference/AI-MEDIA.md) | ~4K |
| Events, alerts, metrics, SSE | [AI-EVENTS.md](./ai-reference/AI-EVENTS.md) | ~3.5K |

## Specialized Agents

Specialized agents are available in \`.claude/agents/\` for domain-specific tasks:

| Agent | Use When |
|-------|----------|
| \`een-setup-agent\` | Creating a new Vue 3 app, fixing Pinia errors, OAuth redirect issues |
| \`een-auth-agent\` | Implementing login/logout, auth callbacks, route guards, token refresh |
| \`een-users-agent\` | Listing users, user profiles, user management features |
| \`een-devices-agent\` | Working with cameras or bridges, filtering by status/tags |
| \`een-media-agent\` | Live video, camera previews, HLS playback, recorded images |
| \`een-events-agent\` | Events, alerts, metrics, real-time SSE subscriptions |

**How to Use Agents:**

1. **In the toolkit repository:** Agents are automatically discovered in \`.claude/agents/\`

2. **In your own project using een-api-toolkit:**
   \`\`\`bash
   # Install agents to your project (user must run this command)
   npx een-setup-agents
   \`\`\`
   This copies agents to \`.claude/agents/\` where Claude Code discovers them automatically.

3. **Manual access:** Agents can also be read directly from \`node_modules/een-api-toolkit/.claude/agents/\`

**For AI assistants:**

> **IMPORTANT:** If specialized agents are not installed in this project's \`.claude/agents/\` directory,
> recommend that the user run \`npx een-setup-agents\` to install them. This enables automatic
> agent discovery and provides focused, context-efficient assistance for EEN API development.

To use an agent's knowledge without installation, read its definition directly:
\`\`\`
Read: node_modules/een-api-toolkit/.claude/agents/een-auth-agent.md
\`\`\`
Then follow the context files and instructions specified within.

## Example Applications

| Example | Description | Key Files |
|---------|-------------|-----------|
| [vue-users](../examples/vue-users/) | User management with pagination | \`src/views/Users.vue\` |
| [vue-cameras](../examples/vue-cameras/) | Camera listing with status filters | \`src/views/Cameras.vue\` |
| [vue-bridges](../examples/vue-bridges/) | Bridge listing with device info | \`src/views/Bridges.vue\` |
| [vue-media](../examples/vue-media/) | Live and recorded image viewing | \`src/views/LiveCamera.vue\` |
| [vue-feeds](../examples/vue-feeds/) | Live video streaming | \`src/views/Feeds.vue\` |
| [vue-events](../examples/vue-events/) | Events with bounding boxes | \`src/components/EventsModal.vue\` |
| [vue-alerts-metrics](../examples/vue-alerts-metrics/) | Event metrics and alerts | \`src/components/MetricsChart.vue\` |
| [vue-event-subscriptions](../examples/vue-event-subscriptions/) | Real-time SSE streaming | \`src/views/LiveEvents.vue\` |

---

## Quick Reference - All Functions

### Configuration
| Function | Purpose |
|----------|---------|
| \`initEenToolkit(config)\` | Initialize the toolkit with proxy URL and client ID |

### Authentication
| Function | Purpose |
|----------|---------|
| \`getAuthUrl()\` | Generate OAuth authorization URL |
| \`handleAuthCallback(code, state)\` | Exchange auth code for token |
| \`refreshToken()\` | Refresh the access token |
| \`revokeToken()\` | Revoke token and logout |

### Users
| Function | Purpose |
|----------|---------|
| \`getCurrentUser()\` | Get current user profile |
| \`getUsers(params?)\` | List all users (paginated) |
| \`getUser(userId, params?)\` | Get a specific user |

### Cameras
| Function | Purpose |
|----------|---------|
| \`getCameras(params?)\` | List all cameras (paginated) |
| \`getCamera(cameraId, params?)\` | Get a specific camera |

### Bridges
| Function | Purpose |
|----------|---------|
| \`getBridges(params?)\` | List all bridges (paginated) |
| \`getBridge(bridgeId, params?)\` | Get a specific bridge |

### Media
| Function | Purpose |
|----------|---------|
| \`listMedia(params)\` | List media intervals for a device |
| \`listFeeds(params)\` | List available feeds for a device |
| \`getLiveImage(params)\` | Get live preview image from camera |
| \`getRecordedImage(params)\` | Get recorded image from history |
| \`getMediaSession()\` | Get media session URL for cookies |
| \`initMediaSession()\` | Initialize media session (sets cookie) |

### Events
| Function | Purpose |
|----------|---------|
| \`listEvents(params)\` | List events for a device |
| \`getEvent(eventId, params?)\` | Get a specific event |
| \`listEventTypes(params?)\` | List all available event types |
| \`listEventFieldValues(params)\` | Get event types for a device |

### Event Metrics
| Function | Purpose |
|----------|---------|
| \`getEventMetrics(params)\` | Get event count metrics over time |

### Alerts
| Function | Purpose |
|----------|---------|
| \`listAlerts(params?)\` | List alerts with filters |
| \`getAlert(id, params?)\` | Get a specific alert |
| \`listAlertTypes(params?)\` | List all available alert types |

### Notifications
| Function | Purpose |
|----------|---------|
| \`listNotifications(params?)\` | List notifications |
| \`getNotification(id)\` | Get a specific notification |

### Event Subscriptions
| Function | Purpose |
|----------|---------|
| \`listEventSubscriptions(params?)\` | List all subscriptions |
| \`getEventSubscription(id)\` | Get a specific subscription |
| \`createEventSubscription(params)\` | Create a new subscription |
| \`deleteEventSubscription(id)\` | Delete a subscription |
| \`connectToEventSubscription(sseUrl, options)\` | Connect to SSE stream |

### Utilities
| Function | Purpose |
|----------|---------|
| \`formatTimestamp(timestamp)\` | Convert Z to +00:00 format |

---

${generateCoreTypes()}

## Common Patterns

### Error Handling

\`\`\`typescript
const { data, error } = await getUsers()

if (error) {
  switch (error.code) {
    case 'AUTH_REQUIRED':
      router.push('/login')
      break
    case 'NOT_FOUND':
      showNotFound()
      break
    default:
      showError(error.message)
  }
  return
}

// TypeScript knows data is not null here
processUsers(data.results)
\`\`\`

### Pagination

\`\`\`typescript
async function fetchAll<T>(
  fetcher: (params: { pageToken?: string }) => Promise<Result<PaginatedResult<T>>>
): Promise<T[]> {
  const all: T[] = []
  let pageToken: string | undefined

  do {
    const { data, error } = await fetcher({ pageToken })
    if (error) break
    all.push(...data.results)
    pageToken = data.nextPageToken
  } while (pageToken)

  return all
}
\`\`\`

---

## Anti-Patterns (What NOT to Do)

### DON'T: Use try/catch for API errors

\`\`\`typescript
// WRONG - functions don't throw
try {
  const users = await getUsers()
} catch (e) {
  // This will never catch API errors!
}

// CORRECT
const { data, error } = await getUsers()
if (error) handleError(error)
\`\`\`

### DON'T: Ignore the error check

\`\`\`typescript
// WRONG - data might be null
const { data } = await getUsers()
data.results.forEach(...) // TypeError if error occurred!

// CORRECT
const { data, error } = await getUsers()
if (error) return
data.results.forEach(...) // Safe
\`\`\`

### DON'T: Call initEenToolkit multiple times

\`\`\`typescript
// WRONG - calling in component
export default {
  setup() {
    initEenToolkit({ ... }) // Called every time component mounts!
  }
}

// CORRECT - call once in main.ts
initEenToolkit({ ... })
app.mount('#app')
\`\`\`

---

## External Resources

- [Eagle Eye Networks Developer Portal](https://developer.eagleeyenetworks.com)
- [EEN API v3.0 Reference](https://developer.eagleeyenetworks.com/reference/using-the-api)
- [GitHub Repository](https://github.com/klaushofrichter/een-api-toolkit)
- [OAuth Proxy](https://github.com/klaushofrichter/een-oauth-proxy)
`
}

// =============================================================================
// AI-SETUP.md (Vue 3 Application Setup)
// =============================================================================

function generateSetupDoc(config: GeneratorConfig): string {
  const mainTs = readFile(path.join(EXAMPLES_DIR, 'vue-users/src/main.ts'))
  const viteConfig = readFile(path.join(EXAMPLES_DIR, 'vue-users/vite.config.ts'))
  const routerIndex = readFile(path.join(EXAMPLES_DIR, 'vue-users/src/router/index.ts'))

  return `# Vue 3 Application Setup - EEN API Toolkit

> **Version:** ${config.version}
>
> Complete guide for setting up a Vue 3 application with the een-api-toolkit.
> Load this document when creating a new project or troubleshooting setup issues.

---

## Prerequisites

| Requirement | Details |
|-------------|---------|
| **Node.js** | Version 20 LTS or later |
| **Vue 3.x** | The toolkit is built for Vue 3 Composition API |
| **Pinia** | Required peer dependency for state management |
| **Vite** | Recommended build tool |
| **OAuth Proxy** | Required for secure token management |

---

## Quick Start

### 1. Create Vue 3 Project

\`\`\`bash
npm create vue@latest my-een-app
cd my-een-app
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install een-api-toolkit pinia
\`\`\`

### 3. Configure main.ts

> **⚠️ CRITICAL:** Pinia MUST be installed on the Vue app BEFORE calling
> \`initEenToolkit()\` or using \`useAuthStore()\`.

\`\`\`typescript
${mainTs}
\`\`\`

### 4. Configure vite.config.ts

> **⚠️ IMPORTANT:** Must use \`127.0.0.1:3333\` for EEN OAuth callback.

\`\`\`typescript
${viteConfig}
\`\`\`

### 5. Configure Environment Variables

Create \`.env\` file:

\`\`\`env
VITE_PROXY_URL=http://localhost:8787
VITE_EEN_CLIENT_ID=your-een-client-id
VITE_REDIRECT_URI=http://127.0.0.1:3333
VITE_DEBUG=true
\`\`\`

---

## Router Setup

The router must handle OAuth callbacks on the root path and protect authenticated routes.

\`\`\`typescript
${routerIndex}
\`\`\`

---

## Project Structure

\`\`\`
my-een-app/
├── src/
│   ├── main.ts              # Pinia + toolkit initialization
│   ├── App.vue              # Root component
│   ├── router/
│   │   └── index.ts         # Routes with auth guards
│   └── views/
│       ├── Home.vue         # Landing page
│       ├── Login.vue        # OAuth login trigger
│       ├── Logout.vue       # Token revocation
│       └── Callback.vue     # OAuth callback handler
├── .env                     # Environment variables
└── vite.config.ts           # Vite configuration
\`\`\`

---

## Common Setup Errors

### "getActivePinia() was called but there was no active Pinia"

**Cause:** Pinia was not installed before \`initEenToolkit()\` was called.

**Solution:** Ensure \`app.use(pinia)\` is called BEFORE \`initEenToolkit()\`:

\`\`\`typescript
const app = createApp(App)
app.use(createPinia())      // ✅ First
initEenToolkit({...})       // ✅ Second
app.mount('#app')           // ✅ Last
\`\`\`

### "Redirect URI mismatch"

**Cause:** OAuth redirect URI doesn't exactly match \`http://127.0.0.1:3333\`.

**Solution:**
- Use \`127.0.0.1\` not \`localhost\`
- Use port \`3333\` exactly
- No trailing slash
- No path (not \`/callback\`)
- Register at [EEN Developer Portal](https://developer.eagleeyenetworks.com/page/my-application)

### Port 3333 already in use

**Solution:** Kill existing process:

\`\`\`bash
kill $(lsof -ti :3333) 2>/dev/null || true
npm run dev
\`\`\`

---

## Configuration Options

\`\`\`typescript
interface EenToolkitConfig {
  proxyUrl?: string           // OAuth proxy URL (required)
  clientId?: string           // EEN OAuth client ID (required)
  redirectUri?: string        // OAuth redirect URI (default: http://127.0.0.1:3333)
  storageStrategy?: StorageStrategy  // Token storage strategy
  debug?: boolean             // Enable debug logging
}

type StorageStrategy = 'localStorage' | 'sessionStorage' | 'memory'
\`\`\`

### Storage Strategies

| Strategy | Persistence | Use Case |
|----------|-------------|----------|
| \`localStorage\` | Survives browser restart | Default, good for most apps |
| \`sessionStorage\` | Per-tab, cleared on close | Multi-account scenarios |
| \`memory\` | Lost on page refresh | Maximum security |

---

## Next Steps

After setup, proceed to:
- [AI-AUTH.md](./AI-AUTH.md) - Implement login/logout flows
- [AI-USERS.md](./AI-USERS.md) - Work with user data
- [AI-DEVICES.md](./AI-DEVICES.md) - Work with cameras and bridges

---

## Reference Example

See \`examples/vue-users/\` for a complete working example.
`
}

// =============================================================================
// AI-AUTH.md (Authentication)
// =============================================================================

function generateAuthDoc(config: GeneratorConfig): string {
  const loginVue = extractVueComponent(path.join(EXAMPLES_DIR, 'vue-users/src/views/Login.vue'))
  const callbackVue = extractVueComponent(path.join(EXAMPLES_DIR, 'vue-users/src/views/Callback.vue'))
  const logoutVue = extractVueComponent(path.join(EXAMPLES_DIR, 'vue-users/src/views/Logout.vue'))

  return `# Authentication - EEN API Toolkit

> **Version:** ${config.version}
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

\`\`\`typescript
import { getAuthUrl } from 'een-api-toolkit'

function login() {
  window.location.href = getAuthUrl()
}
\`\`\`

### handleAuthCallback(code, state)

Handle the OAuth callback. Call this when user returns to your redirect URI.

\`\`\`typescript
import { handleAuthCallback } from 'een-api-toolkit'

const { data, error } = await handleAuthCallback(code, state)

if (error) {
  console.error('Auth failed:', error.message)
  return
}

// User is now authenticated
router.push('/dashboard')
\`\`\`

### refreshToken()

Manually refresh the access token. Usually handled automatically.

\`\`\`typescript
import { refreshToken } from 'een-api-toolkit'

const { data, error } = await refreshToken()
if (error) {
  // Refresh failed - redirect to login
  router.push('/login')
}
\`\`\`

### revokeToken()

Revoke the token and logout.

\`\`\`typescript
import { revokeToken } from 'een-api-toolkit'

async function logout() {
  await revokeToken()
  router.push('/login')
}
\`\`\`

---

## Auth Store (useAuthStore)

Access authentication state directly:

\`\`\`typescript
import { useAuthStore } from 'een-api-toolkit'

const authStore = useAuthStore()

// Reactive state
authStore.isAuthenticated  // boolean
authStore.token            // Access token (or null)
authStore.baseUrl          // EEN API base URL (e.g., https://c001.eagleeyenetworks.com)
authStore.sessionId        // Session identifier
\`\`\`

---

## Vue Router Auth Guard

Protect routes that require authentication:

\`\`\`typescript
import { useAuthStore } from 'een-api-toolkit'

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' })
  } else {
    next()
  }
})
\`\`\`

---

## Component Templates

### Login.vue

\`\`\`vue
${loginVue}
\`\`\`

### Callback.vue

\`\`\`vue
${callbackVue}
\`\`\`

### Logout.vue

\`\`\`vue
${logoutVue}
\`\`\`

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

\`\`\`typescript
import { getStorageStrategy, STORAGE_STRATEGY_DESCRIPTIONS } from 'een-api-toolkit'

const strategy = getStorageStrategy()
const description = STORAGE_STRATEGY_DESCRIPTIONS[strategy]
// e.g., "localStorage: persists across sessions"
\`\`\`

---

## Common Auth Errors

| Error Code | Cause | Solution |
|------------|-------|----------|
| \`AUTH_REQUIRED\` | No valid token | Redirect to login |
| \`AUTH_FAILED\` | Invalid credentials | Show error, allow retry |
| \`TOKEN_EXPIRED\` | Token expired | Auto-refresh or re-login |

---

## Reference Example

See \`examples/vue-users/src/views/Login.vue\`, \`Callback.vue\`, \`Logout.vue\`
`
}

// =============================================================================
// AI-USERS.md (Users API)
// =============================================================================

function generateUsersDoc(config: GeneratorConfig): string {
  const usersVue = extractVueComponent(path.join(EXAMPLES_DIR, 'vue-users/src/views/Users.vue'))

  return `# Users API - EEN API Toolkit

> **Version:** ${config.version}
>
> Complete reference for user management.
> Load this document when working with user data.

---

## Types

### User

\`\`\`typescript
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
\`\`\`

### UserProfile

\`\`\`typescript
interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  accountId?: string
  timeZone?: string
  language?: string
}
\`\`\`

### Parameters

\`\`\`typescript
interface ListUsersParams {
  pageSize?: number    // Results per page (default: 100, max: 1000)
  pageToken?: string   // Pagination token
  include?: string[]   // Additional fields (e.g., ['permissions'])
}

interface GetUserParams {
  include?: string[]   // Additional fields to include
}
\`\`\`

---

## Functions

### getCurrentUser()

Get the current authenticated user's profile.

\`\`\`typescript
import { getCurrentUser } from 'een-api-toolkit'

const { data, error } = await getCurrentUser()

if (error) {
  if (error.code === 'AUTH_REQUIRED') {
    router.push('/login')
  }
  return
}

console.log(\`Welcome, \${data.firstName} \${data.lastName}\`)
\`\`\`

### getUsers(params?)

List users with optional pagination.

\`\`\`typescript
import { getUsers } from 'een-api-toolkit'

// Basic usage
const { data, error } = await getUsers()

// With pagination
const { data } = await getUsers({ pageSize: 50 })

// With include
const { data } = await getUsers({ include: ['permissions'] })
\`\`\`

### getUser(userId, params?)

Get a specific user by ID.

\`\`\`typescript
import { getUser } from 'een-api-toolkit'

const { data, error } = await getUser('user-id-123')

if (error?.code === 'NOT_FOUND') {
  console.log('User not found')
  return
}

// With permissions
const { data: userWithPerms } = await getUser('user-id-123', {
  include: ['permissions']
})
\`\`\`

---

## Pagination Example

\`\`\`typescript
async function fetchAllUsers(): Promise<User[]> {
  const allUsers: User[] = []
  let pageToken: string | undefined

  do {
    const { data, error } = await getUsers({ pageSize: 100, pageToken })
    if (error) break
    allUsers.push(...data.results)
    pageToken = data.nextPageToken
  } while (pageToken)

  return allUsers
}
\`\`\`

---

## Complete Vue Component

\`\`\`vue
${usersVue}
\`\`\`

---

## Reference Example

See \`examples/vue-users/src/views/Users.vue\`
`
}

// =============================================================================
// AI-DEVICES.md (Cameras & Bridges)
// =============================================================================

function generateDevicesDoc(config: GeneratorConfig): string {
  const camerasVue = extractVueComponent(path.join(EXAMPLES_DIR, 'vue-cameras/src/views/Cameras.vue'))
  const bridgesVue = extractVueComponent(path.join(EXAMPLES_DIR, 'vue-bridges/src/views/Bridges.vue'))

  return `# Cameras & Bridges API - EEN API Toolkit

> **Version:** ${config.version}
>
> Complete reference for camera and bridge management.
> Load this document when working with devices.

---

## Camera Types

### Camera

\`\`\`typescript
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
  deviceInfo?: CameraDeviceInfo
  shareDetails?: CameraShareDetails
  devicePosition?: CameraDevicePosition
  createdAt?: string
  updatedAt?: string
}

interface CameraDeviceInfo {
  make?: string           // Manufacturer (e.g., "Axis")
  model?: string          // Model name
  firmwareVersion?: string
  directToCloud?: boolean // No bridge required
  serialNumber?: string
  resolution?: string
}
\`\`\`

### Parameters

\`\`\`typescript
interface ListCamerasParams {
  pageSize?: number           // Results per page
  pageToken?: string          // Pagination token
  include?: string[]          // Additional fields
  sort?: string[]             // Sort order
  status__in?: CameraStatus[] // Filter by status
  status__ne?: CameraStatus   // Exclude by status
  tags__contains?: string[]   // All tags must match
  tags__any?: string[]        // Any tag matches
  name__contains?: string     // Partial name match
  q?: string                  // Full-text search
  bridgeId__in?: string[]     // Filter by bridge
  locationId__in?: string[]   // Filter by location
}
\`\`\`

---

## Bridge Types

### Bridge

\`\`\`typescript
type BridgeStatus =
  | 'online' | 'offline' | 'error' | 'idle'
  | 'registered' | 'attaching' | 'initializing'

interface Bridge {
  id: string
  name: string
  accountId: string
  locationId?: string | null
  guid?: string
  timezone?: string
  status?: BridgeStatus | { connectionStatus?: BridgeStatus }
  tags?: string[]
  deviceInfo?: BridgeDeviceInfo
  networkInfo?: BridgeNetworkInfo
  cameraCount?: number
  createdAt?: string
  updatedAt?: string
}

interface BridgeNetworkInfo {
  localIpAddress?: string
  publicIpAddress?: string
  macAddress?: string
}
\`\`\`

---

## Camera Functions

### getCameras(params?)

\`\`\`typescript
import { getCameras } from 'een-api-toolkit'

// Basic usage
const { data, error } = await getCameras()

// Filter by status
const { data } = await getCameras({
  status__in: ['online', 'streaming']
})

// Full-text search
const { data } = await getCameras({
  q: 'front door',
  include: ['deviceInfo', 'status']
})

// Filter by tags
const { data } = await getCameras({
  tags__any: ['floor1', 'floor2']
})
\`\`\`

### getCamera(cameraId, params?)

\`\`\`typescript
import { getCamera } from 'een-api-toolkit'

const { data, error } = await getCamera('camera-id-123')

// With additional fields
const { data: detailed } = await getCamera('camera-id-123', {
  include: ['deviceInfo', 'status', 'shareDetails', 'tags']
})
\`\`\`

---

## Bridge Functions

### getBridges(params?)

\`\`\`typescript
import { getBridges } from 'een-api-toolkit'

// Basic usage
const { data, error } = await getBridges()

// Filter by status
const { data } = await getBridges({
  status__in: ['online'],
  include: ['deviceInfo', 'networkInfo']
})
\`\`\`

### getBridge(bridgeId, params?)

\`\`\`typescript
import { getBridge } from 'een-api-toolkit'

const { data, error } = await getBridge('bridge-id-123', {
  include: ['deviceInfo', 'networkInfo', 'status']
})
\`\`\`

---

## Filter Patterns

| Filter | Example | Description |
|--------|---------|-------------|
| \`status__in\` | \`['online', 'streaming']\` | Include specific statuses |
| \`status__ne\` | \`'offline'\` | Exclude a status |
| \`tags__contains\` | \`['outdoor']\` | All tags must match |
| \`tags__any\` | \`['floor1', 'floor2']\` | Any tag matches |
| \`name__contains\` | \`'lobby'\` | Partial name match |
| \`q\` | \`'front door'\` | Full-text search |

---

## Vue Components

### Cameras.vue

\`\`\`vue
${camerasVue}
\`\`\`

### Bridges.vue

\`\`\`vue
${bridgesVue}
\`\`\`

---

## Reference Examples

- \`examples/vue-cameras/\`
- \`examples/vue-bridges/\`
`
}

// =============================================================================
// AI-MEDIA.md (Media, Feeds & Live Video)
// =============================================================================

function generateMediaDoc(config: GeneratorConfig): string {
  const liveCameraVue = extractVueComponent(path.join(EXAMPLES_DIR, 'vue-media/src/views/LiveCamera.vue'))
  const feedsVue = extractVueComponent(path.join(EXAMPLES_DIR, 'vue-feeds/src/views/Feeds.vue'))

  return `# Media & Live Video - EEN API Toolkit

> **Version:** ${config.version}
>
> Complete reference for media retrieval, live streaming, and video playback.
> Load this document when implementing video features.

---

## CRITICAL: Choosing the Right Approach

| Use Case | Method | Why |
|----------|--------|-----|
| Thumbnails (20+ cameras) | \`getLiveImage()\` | Handles auth, returns base64 |
| Auto-updating preview | \`multipartUrl\` | Continuous MJPEG stream |
| Full-quality live video | Live Video SDK | WebCodecs, full resolution |
| Recorded video playback | HLS via \`listMedia()\` | Standard video player |

---

## Common Pitfalls (READ FIRST)

### DON'T: Construct API URLs for \`<img>\` tags

\`\`\`typescript
// WRONG - browsers cannot send Authorization headers with <img src>
const url = \`\${authStore.baseUrl}/api/v3.0/media/liveImage.jpeg?deviceId=\${cameraId}\`
imgElement.src = url  // Results in 401 Unauthorized
\`\`\`

### DON'T: Modify multipartUrl

\`\`\`typescript
// WRONG - adding parameters breaks the pre-signed URL
imgElement.src = \`\${feedUrl}?timestamp=\${Date.now()}\`  // 400 Bad Request
\`\`\`

### DO: Use \`getLiveImage()\` for thumbnails

\`\`\`typescript
// CORRECT - returns base64 data URL
const { data } = await getLiveImage({ deviceId: cameraId })
imgElement.src = data.imageData  // "data:image/jpeg;base64,..."
\`\`\`

---

## Media Types

\`\`\`typescript
type MediaType = 'video' | 'image'
type MediaStreamType = 'preview' | 'main'

interface MediaInterval {
  type: MediaStreamType
  deviceId: string
  mediaType: MediaType
  startTimestamp: string  // ISO 8601
  endTimestamp: string    // ISO 8601
  hlsUrl?: string
  multipartUrl?: string
}

interface ListMediaParams {
  deviceId: string          // Required - camera ID
  type: MediaStreamType     // 'preview' or 'main'
  mediaType: MediaType      // 'video' or 'image'
  startTimestamp: string    // ISO 8601 start time
  endTimestamp?: string     // ISO 8601 end time
  include?: string[]        // e.g., ['hlsUrl', 'multipartUrl']
}

interface LiveImageResult {
  imageData: string         // Base64 data URL
  timestamp: string | null  // X-Een-Timestamp header
  prevToken: string | null  // For navigation
}

interface RecordedImageResult {
  imageData: string         // Base64 data URL
  timestamp: string | null
  nextToken: string | null  // Navigate forward
  prevToken: string | null  // Navigate backward
  overlaySvg: string | null // Bounding box overlay
}
\`\`\`

---

## Feed Types

\`\`\`typescript
type FeedStreamType = 'main' | 'preview' | 'talkdown'
type FeedMediaType = 'video' | 'audio' | 'image'

interface Feed {
  id: string
  type: FeedStreamType
  deviceId: string
  mediaType: FeedMediaType
  multipartUrl?: string | null  // For MJPEG streaming
  hlsUrl?: string | null        // For HLS playback
}

interface ListFeedsParams {
  deviceId?: string
  type?: FeedStreamType
  include?: ('multipartUrl' | 'hlsUrl' | 'rtspUrl')[]
}
\`\`\`

---

## Media Functions

### getLiveImage(params)

Get live preview image. Best for thumbnails.

\`\`\`typescript
import { getLiveImage } from 'een-api-toolkit'

const { data, error } = await getLiveImage({ deviceId: 'camera-123' })

if (data) {
  imgElement.src = data.imageData  // data:image/jpeg;base64,...
  console.log('Timestamp:', data.timestamp)
}
\`\`\`

### getRecordedImage(params)

Get recorded image with navigation.

\`\`\`typescript
import { getRecordedImage } from 'een-api-toolkit'

// Get image at timestamp
const { data } = await getRecordedImage({
  deviceId: 'camera-123',
  timestamp: '2024-01-15T14:30:00.000+00:00'
})

// Navigate to next image
if (data.nextToken) {
  const { data: next } = await getRecordedImage({ pageToken: data.nextToken })
}
\`\`\`

### initMediaSession()

Initialize media session for cookie-based auth. Required before using multipartUrl.

\`\`\`typescript
import { initMediaSession, listFeeds } from 'een-api-toolkit'

// Initialize once after login
await initMediaSession()

// Now multipartUrl works in <img> elements
const { data: feeds } = await listFeeds({
  deviceId: 'camera-123',
  include: ['multipartUrl']
})

imgElement.src = feeds.results[0].multipartUrl
\`\`\`

### listMedia(params)

List recording intervals. Use for HLS playback.

\`\`\`typescript
import { listMedia, formatTimestamp } from 'een-api-toolkit'

const { data } = await listMedia({
  deviceId: 'camera-123',
  type: 'main',           // MUST be 'main' for HLS
  mediaType: 'video',
  startTimestamp: formatTimestamp(startDate.toISOString()),
  endTimestamp: formatTimestamp(endDate.toISOString()),
  include: ['hlsUrl']
})

// Find interval containing target timestamp
const interval = data.results.find(i =>
  i.hlsUrl && targetTime >= new Date(i.startTimestamp) && targetTime <= new Date(i.endTimestamp)
)
\`\`\`

---

## Live Video Streaming

### Preview Stream (MJPEG)

\`\`\`typescript
// 1. Initialize media session
await initMediaSession()

// 2. Get feed with multipartUrl
const { data: feeds } = await listFeeds({
  deviceId: cameraId,
  type: 'preview',
  include: ['multipartUrl']
})

// 3. Use directly in <img>
const previewFeed = feeds.results.find(f => f.multipartUrl)
imgElement.src = previewFeed.multipartUrl
\`\`\`

### Main Stream (Live Video SDK)

\`\`\`typescript
import { LivePlayer } from '@een/live-video-web-sdk'
import { useAuthStore } from 'een-api-toolkit'

const authStore = useAuthStore()
const player = new LivePlayer()

player.onStatusChange((status) => {
  console.log('Player status:', status)
})

await player.start({
  videoElement: videoRef.value,
  cameraId: cameraId,
  baseUrl: authStore.baseUrl,
  jwt: authStore.token
})

// Cleanup
player.stop()
\`\`\`

---

## HLS Playback

\`\`\`typescript
import Hls from 'hls.js'
import { useAuthStore } from 'een-api-toolkit'

const authStore = useAuthStore()

const hls = new Hls({
  xhrSetup: (xhr) => {
    // MUST use Authorization header, not withCredentials
    xhr.setRequestHeader('Authorization', \`Bearer \${authStore.token}\`)
  }
})

hls.loadSource(hlsUrl)
hls.attachMedia(videoElement)
\`\`\`

---

## Utility: formatTimestamp

EEN API requires \`+00:00\` format, not \`Z\`:

\`\`\`typescript
import { formatTimestamp } from 'een-api-toolkit'

// Convert Z to +00:00
formatTimestamp('2025-01-15T22:30:00.000Z')
// Returns: '2025-01-15T22:30:00.000+00:00'
\`\`\`

---

## Vue Components

### LiveCamera.vue

\`\`\`vue
${liveCameraVue}
\`\`\`

### Feeds.vue

\`\`\`vue
${feedsVue}
\`\`\`

---

## Reference Examples

- \`examples/vue-media/\` - Live and recorded images, HLS
- \`examples/vue-feeds/\` - Preview and main streams
`
}

// =============================================================================
// AI-EVENTS.md (Events, Alerts, Metrics & Subscriptions)
// =============================================================================

function generateEventsDoc(config: GeneratorConfig): string {
  const eventsModalVue = extractVueComponent(path.join(EXAMPLES_DIR, 'vue-events/src/components/EventsModal.vue'))
  const metricsChartVue = extractVueComponent(path.join(EXAMPLES_DIR, 'vue-alerts-metrics/src/components/MetricsChart.vue'))
  const liveEventsVue = extractVueComponent(path.join(EXAMPLES_DIR, 'vue-event-subscriptions/src/views/LiveEvents.vue'))

  return `# Events, Alerts & Real-Time Streaming - EEN API Toolkit

> **Version:** ${config.version}
>
> Complete reference for events, alerts, metrics, and SSE subscriptions.
> Load this document when implementing event-driven features.

---

## Overview

| Concept | Description |
|---------|-------------|
| **Events** | Camera-generated occurrences (motion, analytics) |
| **Alerts** | Rule-triggered notifications |
| **Metrics** | Aggregated event counts over time |
| **Notifications** | User-facing alert messages |
| **Subscriptions** | Real-time SSE streams for events |

---

## Event Types

\`\`\`typescript
type ActorType =
  | 'bridge' | 'camera' | 'speaker' | 'account' | 'user'
  | 'layout' | 'job' | 'measurement' | 'sensor' | 'gateway'

interface Event {
  id: string
  startTimestamp: string       // ISO 8601
  endTimestamp?: string | null
  span: boolean
  accountId: string
  actorId: string
  actorAccountId: string
  actorType: ActorType
  creatorId: string
  type: string                 // e.g., 'een.motionDetectionEvent.v1'
  dataSchemas: string[]
  data: EventData[]
}

interface ListEventsParams {
  actor: string                     // Required: 'camera:{id}' format
  type__in: string[]                // Required: event types to fetch
  startTimestamp__gte: string       // Required: ISO 8601 timestamp
  startTimestamp__lte?: string
  endTimestamp__gte?: string
  endTimestamp__lte?: string
  pageSize?: number
  pageToken?: string
  sort?: '+startTimestamp' | '-startTimestamp'
  include?: string[]                // e.g., ['data.een.fullFrameImageUrl.v1']
}
\`\`\`

---

## Event Metrics Types

\`\`\`typescript
type MetricDataPoint = [number, number]  // [timestamp_ms, count]

interface EventMetric {
  eventType: string
  actorId: string
  actorType: string
  dataPoints: MetricDataPoint[]
}

interface GetEventMetricsParams {
  actor: string                  // Required: 'camera:{id}'
  eventType: string              // Required: e.g., 'een.motionDetectionEvent.v1'
  timestamp__gte?: string        // Defaults to 7 days ago
  timestamp__lte?: string        // Defaults to now
  aggregateByMinutes?: number    // Default 60, minimum 60
}
\`\`\`

---

## Alert Types

\`\`\`typescript
interface Alert {
  id: string
  timestamp: string
  alertType: string
  alertName?: string
  actorId: string
  actorType: string
  actorName?: string
  priority?: number              // 0-20
  actions?: Record<string, AlertAction>
}

interface ListAlertsParams {
  timestamp__gte?: string
  timestamp__lte?: string
  alertType__in?: string[]
  actorId__in?: string[]
  priority__gte?: number
  include?: ('data' | 'actions')[]
  sort?: ('+timestamp' | '-timestamp')[]
}
\`\`\`

---

## Event Subscription Types

\`\`\`typescript
type EventSubscriptionLifecycle = 'temporary' | 'persistent'
type EventSubscriptionDeliveryType = 'serverSentEvents.v1' | 'webhook.v1'

interface EventSubscription {
  id: string
  subscriptionConfig?: {
    lifeCycle: EventSubscriptionLifecycle
    timeToLiveSeconds?: number
  }
  deliveryConfig: {
    type: EventSubscriptionDeliveryType
    sseUrl?: string              // SSE endpoint URL (for SSE type)
    secret?: string              // Webhook signature secret (for webhook type)
  }
}

interface EventTypeFilter {
  id: string                     // e.g., 'een.motionDetectionEvent.v1'
}

interface FilterCreate {
  actors: string[]               // e.g., ['camera:{id}']
  types: EventTypeFilter[]       // Event types to subscribe to
}

interface CreateEventSubscriptionParams {
  deliveryConfig: {
    type: 'serverSentEvents.v1'
  } | {
    type: 'webhook.v1'
    webhookUrl: string
    technicalContactEmail: string
    technicalContactName: string
  }
  filters: FilterCreate[]
}

type SSEConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

interface SSEConnection {
  close: () => void
  status: SSEConnectionStatus
}

interface SSEEvent {
  id: string
  type: string
  actorId: string
  actorType?: string
  startTimestamp: string
  endTimestamp?: string | null
  span?: boolean
  data?: Array<{ type: string; [key: string]: unknown }>
}
\`\`\`

---

## Event Functions

### listEvents(params)

\`\`\`typescript
import { listEvents, formatTimestamp } from 'een-api-toolkit'

const { data, error } = await listEvents({
  actor: \`camera:\${cameraId}\`,
  type__in: ['een.motionDetectionEvent.v1'],
  startTimestamp__gte: formatTimestamp(startDate.toISOString()),
  include: ['data.een.fullFrameImageUrl.v1']
})
\`\`\`

### getEventMetrics(params)

\`\`\`typescript
import { getEventMetrics, formatTimestamp } from 'een-api-toolkit'

const { data, error } = await getEventMetrics({
  actor: \`camera:\${cameraId}\`,
  eventType: 'een.motionDetectionEvent.v1',
  timestamp__gte: formatTimestamp(sevenDaysAgo.toISOString()),
  aggregateByMinutes: 60
})

// Convert to Chart.js format
const chartData = data.map(metric => ({
  x: new Date(metric.dataPoints[0][0]),
  y: metric.dataPoints[0][1]
}))
\`\`\`

---

## Alert Functions

### listAlerts(params?)

\`\`\`typescript
import { listAlerts, formatTimestamp } from 'een-api-toolkit'

const { data, error } = await listAlerts({
  timestamp__gte: formatTimestamp(startDate.toISOString()),
  actorId__in: [cameraId],
  include: ['actions'],
  sort: ['-timestamp']
})
\`\`\`

---

## Notification Functions

### listNotifications(params?)

\`\`\`typescript
import { listNotifications } from 'een-api-toolkit'

const { data, error } = await listNotifications({
  read: false,
  sort: ['-timestamp']
})
\`\`\`

---

## Event Subscription Functions

### SSE Lifecycle

\`\`\`typescript
import {
  createEventSubscription,
  connectToEventSubscription,
  deleteEventSubscription
} from 'een-api-toolkit'

// 1. Create subscription
const { data: subscription } = await createEventSubscription({
  deliveryConfig: { type: 'serverSentEvents.v1' },
  filters: [{
    actors: [\`camera:\${cameraId}\`],
    types: [{ id: 'een.motionDetectionEvent.v1' }]
  }]
})

// 2. Connect to SSE stream
const { data: connection } = connectToEventSubscription(
  subscription.deliveryConfig.sseUrl,
  {
    onEvent: (event) => {
      console.log('Event received:', event)
    },
    onError: (error) => {
      console.error('SSE error:', error)
    },
    onStatusChange: (status) => {
      console.log('Connection status:', status)
    }
  }
)

// 3. Cleanup when done
connection.close()
await deleteEventSubscription(subscription.id)
\`\`\`

---

## Vue Components

### EventsModal.vue

\`\`\`vue
${eventsModalVue}
\`\`\`

### MetricsChart.vue

\`\`\`vue
${metricsChartVue}
\`\`\`

### LiveEvents.vue

\`\`\`vue
${liveEventsVue}
\`\`\`

---

## Reference Examples

- \`examples/vue-events/\` - Event listing with bounding boxes
- \`examples/vue-alerts-metrics/\` - Metrics, alerts, notifications
- \`examples/vue-event-subscriptions/\` - Real-time SSE streaming
`
}

// =============================================================================
// LEGACY SINGLE FILE GENERATOR
// =============================================================================

function generateSingleFile(config: GeneratorConfig): string {
  // Import all the content from the original generator
  return `${generateOverview(config)}

---

# Full API Reference

${generateSetupDoc(config).split('---\n\n')[1] || ''}

---

${generateAuthDoc(config).split('---\n\n')[1] || ''}

---

${generateUsersDoc(config).split('---\n\n')[1] || ''}

---

${generateDevicesDoc(config).split('---\n\n')[1] || ''}

---

${generateMediaDoc(config).split('---\n\n')[1] || ''}

---

${generateEventsDoc(config).split('---\n\n')[1] || ''}
`
}

// =============================================================================
// MAIN
// =============================================================================

function main() {
  const args = process.argv.slice(2)
  const singleFile = args.includes('--single')

  const config: GeneratorConfig = {
    version: packageJson.version,
    singleFile
  }

  // Ensure directories exist
  if (!fs.existsSync(DOCS_DIR)) {
    fs.mkdirSync(DOCS_DIR, { recursive: true })
  }

  if (singleFile) {
    // Generate single monolithic file (legacy mode)
    const content = generateSingleFile(config)
    const outputPath = path.join(DOCS_DIR, 'AI-CONTEXT.md')
    fs.writeFileSync(outputPath, content)
    console.log(`Generated ${outputPath} (single file mode)`)
  } else {
    // Generate split files (default)
    if (!fs.existsSync(AI_REF_DIR)) {
      fs.mkdirSync(AI_REF_DIR, { recursive: true })
    }

    // Generate overview
    const overviewPath = path.join(DOCS_DIR, 'AI-CONTEXT.md')
    fs.writeFileSync(overviewPath, generateOverview(config))
    console.log(`Generated ${overviewPath}`)

    // Generate domain-specific docs
    const docs = [
      { name: 'AI-SETUP.md', generator: generateSetupDoc },
      { name: 'AI-AUTH.md', generator: generateAuthDoc },
      { name: 'AI-USERS.md', generator: generateUsersDoc },
      { name: 'AI-DEVICES.md', generator: generateDevicesDoc },
      { name: 'AI-MEDIA.md', generator: generateMediaDoc },
      { name: 'AI-EVENTS.md', generator: generateEventsDoc }
    ]

    for (const doc of docs) {
      const docPath = path.join(AI_REF_DIR, doc.name)
      fs.writeFileSync(docPath, doc.generator(config))
      console.log(`Generated ${docPath}`)
    }
  }

  console.log(`\nVersion: ${config.version}`)
  console.log(`Mode: ${singleFile ? 'single file' : 'split files'}`)
}

main()
