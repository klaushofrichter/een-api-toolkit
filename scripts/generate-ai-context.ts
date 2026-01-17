#!/usr/bin/env npx tsx
/**
 * Generate AI-CONTEXT.md from TypeDoc output and source files.
 *
 * This script creates a comprehensive, single-file reference optimized
 * for AI assistants to understand and use the een-api-toolkit.
 *
 * Usage: npx tsx scripts/generate-ai-context.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.dirname(__dirname)
const DOCS_DIR = path.join(ROOT_DIR, 'docs')
const API_DIR = path.join(DOCS_DIR, 'api')
const OUTPUT_FILE = path.join(DOCS_DIR, 'AI-CONTEXT.md')

// Read package.json for version
const packageJson = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf-8'))

function generateHeader(): string {
  return `# EEN API Toolkit - AI Reference

> **Version:** ${packageJson.version}
>
> This file is optimized for AI assistants. It contains all API signatures,
> types, and usage patterns in a single, parseable document.
>
> For the full EEN API documentation, see the
> [Eagle Eye Networks Developer Portal](https://developer.eagleeyenetworks.com).

> **Working Examples:** The installed package includes complete Vue 3 example applications
> at \`./node_modules/een-api-toolkit/examples/\`. These demonstrate OAuth authentication,
> user management, camera listing, live/recorded media, video feeds, and events.
> For Live Main Video streaming, see \`vue-feeds/src/views/Feeds.vue\`.
> For Events API with thumbnails, see \`vue-events/src/components/EventsModal.vue\`.

---

`
}

function generateCriticalSetup(): string {
  return `## Prerequisites & Installation (READ FIRST)

> **⚠️ CRITICAL:** This section contains essential setup requirements.
> Skipping these steps will cause runtime errors.

### Prerequisites

Before using the een-api-toolkit, ensure you have:

| Requirement | Details |
|-------------|---------|
| **Vue 3.x** | The toolkit is built for Vue 3 Composition API |
| **Pinia** | Required peer dependency for state management |
| **Vite** | Recommended build tool (dev server must run on \`127.0.0.1:3333\`) |
| **OAuth Proxy** | Required for secure token management (see [een-oauth-proxy](https://github.com/klaushofrichter/een-oauth-proxy)) |

### Installation

\`\`\`bash
npm install een-api-toolkit pinia
\`\`\`

### Complete Setup (main.ts)

> **⚠️ CRITICAL:** Pinia MUST be installed on the Vue app BEFORE calling
> \`initEenToolkit()\` or using \`useAuthStore()\`. Failure to do so will cause
> a runtime error.

\`\`\`typescript
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
\`\`\`

### Environment Variables (.env)

\`\`\`env
VITE_PROXY_URL=http://localhost:8787
VITE_EEN_CLIENT_ID=your-een-client-id
VITE_DEBUG=true
\`\`\`

### Common Errors

#### "getActivePinia() was called but there was no active Pinia"

**Cause:** Pinia was not installed before \`initEenToolkit()\` was called or before using \`useAuthStore()\`.

**Solution:** Ensure your \`main.ts\` calls \`app.use(pinia)\` BEFORE \`initEenToolkit()\`:

\`\`\`typescript
const app = createApp(App)
const pinia = createPinia()

app.use(pinia)           // ✅ First - install Pinia
initEenToolkit({...})    // ✅ Second - initialize toolkit
app.mount('#app')        // ✅ Last - mount app
\`\`\`

#### "Redirect URI mismatch"

**Cause:** OAuth redirect URI doesn't exactly match \`http://127.0.0.1:3333\`.

**Solution:**
- Use \`127.0.0.1\` not \`localhost\`
- Use port \`3333\` exactly
- No trailing slash (not \`http://127.0.0.1:3333/\`)
- No path (not \`http://127.0.0.1:3333/callback\`)
- Register this exact URI at [EEN Developer Portal](https://developer.eagleeyenetworks.com/page/my-application)

**Vite config:**
\`\`\`typescript
// vite.config.ts
server: { host: '127.0.0.1', port: 3333, strictPort: true }
\`\`\`

**Router pattern:** Handle OAuth callback on root path, then redirect internally:
\`\`\`typescript
// router/index.ts - root path must catch OAuth params
{
  path: '/',
  beforeEnter: (to, _from, next) => {
    if (to.query.code && to.query.state) {
      next({ name: 'callback', query: to.query })
    } else {
      next()
    }
  }
}
\`\`\`

### Common Pitfalls - Preview Images

Displaying live preview images requires careful attention to authentication. Here are common mistakes:

#### DON'T: Construct API URLs directly for \`<img>\` tags

\`\`\`typescript
// WRONG - browsers cannot send Authorization headers with <img src>
const url = \`\${authStore.baseUrl}/api/v3.0/media/liveImage.jpeg?deviceId=\${cameraId}\`
imgElement.src = url  // Results in 401 Unauthorized
\`\`\`

**Why it fails:** The \`<img>\` element makes a simple GET request without custom headers. The JWT token cannot be sent, so the request is unauthorized.

#### DON'T: Modify multipartUrl by adding query parameters

\`\`\`typescript
// WRONG - adding parameters breaks the pre-signed URL
const feedUrl = feed.multipartUrl
imgElement.src = \`\${feedUrl}?timestamp=\${Date.now()}\`  // Results in 400 Bad Request
imgElement.src = \`\${feedUrl}&cache=\${Date.now()}\`     // Also fails
\`\`\`

**Why it fails:** The \`multipartUrl\` is a complete, pre-authenticated URL. Any modification (including cache-busting parameters) invalidates it.

#### DO: Use \`getLiveImage()\` for preview thumbnails

\`\`\`typescript
// CORRECT - returns base64 data URL that works directly in <img src>
import { getLiveImage } from 'een-api-toolkit'

const { data, error } = await getLiveImage({ deviceId: cameraId })
if (data?.imageData) {
  imgElement.src = data.imageData  // "data:image/jpeg;base64,..."
}
\`\`\`

**Why it works:** The toolkit handles authentication internally and returns a base64-encoded data URL that can be used directly without browser restrictions.

### Choosing the Right Preview Method

| Use Case | Method | Notes |
|----------|--------|-------|
| Grid of camera thumbnails (20+) | \`getLiveImage()\` | Best for large grids, handles auth internally |
| Periodic refresh (e.g., every 3s) | \`getLiveImage()\` | Call repeatedly in a timer |
| Camera grid (<20 cameras) | \`multipartUrl\` | Automatic updates via continuous MJPEG stream. Requires \`initMediaSession()\` first |
| One-time snapshot | \`getLiveImage()\` | Simple and self-contained |
| Full-quality live video | Live Video SDK | For modal/fullscreen video playback |

**Quick Reference:**

\`\`\`typescript
// For thumbnails and grids - USE THIS
const { data } = await getLiveImage({ deviceId })
img.src = data.imageData

// For continuous MJPEG stream (grids <20 cameras, auto-updates)
await initMediaSession()
const { data: feeds } = await listFeeds({ deviceId, include: ['multipartUrl'] })
img.src = feeds.results.find(f => f.type === 'preview')?.multipartUrl

// For HD live video - use @een/live-video-web-sdk
const player = new LivePlayer()
player.start({ videoElement, cameraId, baseUrl, jwt })
\`\`\`

---

`
}

function generateQuickReference(): string {
  return `## Quick Reference

### Example Applications

Complete Vue 3 applications demonstrating toolkit features:

| Example | Description | Key Files |
|---------|-------------|-----------|
| [vue-users](./examples/vue-users/) | User management with pagination | \`src/views/Users.vue\` |
| [vue-cameras](./examples/vue-cameras/) | Camera listing with status filters | \`src/views/Cameras.vue\` |
| [vue-bridges](./examples/vue-bridges/) | Bridge listing with device info | \`src/views/Bridges.vue\` |
| [vue-media](./examples/vue-media/) | Live and recorded image viewing | \`src/views/Media.vue\` |
| [vue-feeds](./examples/vue-feeds/) | Live video streaming (preview and main) | \`src/views/Feeds.vue\` |
| [vue-events](./examples/vue-events/) | Events with bounding box overlays | \`src/components/EventsModal.vue\` |

### Configuration

| Function | Purpose |
|----------|---------|
| \`initEenToolkit(config)\` | Initialize the toolkit with proxy URL and client ID |

### Authentication Functions

| Function | Purpose | Returns |
|----------|---------|---------|
| \`getAuthUrl()\` | Generate OAuth authorization URL | \`string\` |
| \`handleAuthCallback(code, state)\` | Exchange auth code for token | \`Result<TokenResponse>\` |
| \`refreshToken()\` | Refresh the access token | \`Result<{accessToken, expiresIn}>\` |
| \`revokeToken()\` | Revoke token and logout | \`Result<void>\` |

### User Functions

| Function | Purpose | Returns |
|----------|---------|---------|
| \`getCurrentUser()\` | Get current user profile | \`Result<UserProfile>\` |
| \`getUsers(params?)\` | List all users (paginated) | \`Result<PaginatedResult<User>>\` |
| \`getUser(userId, params?)\` | Get a specific user | \`Result<User>\` |

### Camera Functions

| Function | Purpose | Returns |
|----------|---------|---------|
| \`getCameras(params?)\` | List all cameras (paginated) | \`Result<PaginatedResult<Camera>>\` |
| \`getCamera(cameraId, params?)\` | Get a specific camera | \`Result<Camera>\` |

### Bridge Functions

| Function | Purpose | Returns |
|----------|---------|---------|
| \`getBridges(params?)\` | List all bridges (paginated) | \`Result<PaginatedResult<Bridge>>\` |
| \`getBridge(bridgeId, params?)\` | Get a specific bridge | \`Result<Bridge>\` |

### Media Functions

| Function | Purpose | Returns |
|----------|---------|---------|
| \`listMedia(params)\` | List media intervals for a device | \`Result<PaginatedResult<MediaInterval>>\` |
| \`listFeeds(params)\` | List available feeds for a device | \`Result<ListFeedsResult>\` |
| \`getLiveImage(params)\` | Get live preview image from camera | \`Result<LiveImageResult>\` |
| \`getRecordedImage(params)\` | Get recorded image from history | \`Result<RecordedImageResult>\` |
| \`getMediaSession()\` | Get media session URL for cookies | \`Result<MediaSessionResponse>\` |
| \`initMediaSession()\` | Initialize media session (sets cookie) | \`Result<MediaSessionResult>\` |

### Events Functions

| Function | Purpose | Returns |
|----------|---------|---------|
| \`listEvents(params)\` | List events for a device with filters | \`Result<PaginatedResult<Event>>\` |
| \`getEvent(eventId, params?)\` | Get a specific event by ID | \`Result<Event>\` |
| \`listEventTypes(params?)\` | List all available event types | \`Result<PaginatedResult<EventType>>\` |
| \`listEventFieldValues(params)\` | Get available event types for a device | \`Result<EventFieldValues>\` |

---

`
}

function generateCriticalRequirements(): string {
  return `## Critical Requirements

### OAuth Redirect URI (IMPORTANT)

The EEN Identity Provider performs an **exact string match** on the redirect URI. Applications MUST follow these rules:

| Requirement | Correct | Incorrect |
|-------------|---------|-----------|
| Host | \`127.0.0.1\` | \`localhost\` |
| Path | None (root path only) | \`/callback\` |
| Trailing slash | No | \`http://127.0.0.1:3333/\` |

**The only valid redirect URI is: \`http://127.0.0.1:3333\`**

**Configure at:** [EEN Developer Portal - My Application](https://developer.eagleeyenetworks.com/page/my-application)

### Application Requirements

1. **Handle OAuth callbacks on the root path (\`/\`)** - not \`/callback\`
2. **Run dev server on \`127.0.0.1\`** - not \`localhost\`
3. **Register exactly \`http://127.0.0.1:3333\` with EEN at the Developer Portal**

### Router Pattern for OAuth Callbacks

The root path must detect OAuth params and handle the callback:

\`\`\`typescript
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
\`\`\`

### Vite Dev Server Configuration

\`\`\`typescript
// vite.config.ts
export default defineConfig({
  server: {
    host: '127.0.0.1',  // MUST use 127.0.0.1, not localhost
    port: 3333,
    strictPort: true
  }
})
\`\`\`

### Common OAuth Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Redirect URI mismatch" | URI doesn't match exactly | Use \`http://127.0.0.1:3333\` (no path, no trailing slash) |
| Redirected back to login | Router guard blocks callback | Allow OAuth params through on root path |
| Callback not processed | Wrong path or host | Handle callback on \`/\`, use \`127.0.0.1\` |

---

`
}

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

### Configuration Type

\`\`\`typescript
type StorageStrategy = 'localStorage' | 'sessionStorage' | 'memory'

interface EenToolkitConfig {
  proxyUrl?: string           // OAuth proxy URL (required for API calls)
  clientId?: string           // EEN OAuth client ID
  redirectUri?: string        // OAuth redirect URI (default: http://127.0.0.1:3333)
  storageStrategy?: StorageStrategy  // Token storage: 'localStorage' (default), 'sessionStorage', or 'memory'
  debug?: boolean             // Enable debug logging
}
\`\`\`

### Storage Strategy Descriptions

Human-readable descriptions for each storage strategy, useful for displaying in UI components:

\`\`\`typescript
import { getStorageStrategy, STORAGE_STRATEGY_DESCRIPTIONS } from 'een-api-toolkit'

// STORAGE_STRATEGY_DESCRIPTIONS is a Record<StorageStrategy, string>:
// {
//   localStorage: 'persists across sessions',
//   sessionStorage: 'per-tab, cleared on tab close',
//   memory: 'tokens lost on page refresh'
// }

const strategy = getStorageStrategy()
const description = STORAGE_STRATEGY_DESCRIPTIONS[strategy]
console.log(\`Using \${strategy}: \${description}\`)
\`\`\`

---

`
}

function generateEntityTypes(): string {
  return `## Entity Types

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
\`\`\`

### User Parameter Types

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

### Camera Parameter Types

\`\`\`typescript
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
\`\`\`

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
  devicePosition?: BridgeDevicePosition
  cameraCount?: number
  createdAt?: string
  updatedAt?: string
}

interface BridgeDeviceInfo {
  make?: string           // Manufacturer
  model?: string          // Model name
  firmwareVersion?: string
  serialNumber?: string
  hardwareVersion?: string
}

interface BridgeNetworkInfo {
  localIpAddress?: string
  publicIpAddress?: string
  macAddress?: string
  subnetMask?: string
  gateway?: string
  dnsServers?: string[]
}

interface BridgeDevicePosition {
  latitude?: number
  longitude?: number
  altitude?: number
  floor?: number
  azimuth?: number
}
\`\`\`

### Bridge Parameter Types

\`\`\`typescript
interface ListBridgesParams {
  pageSize?: number           // Results per page
  pageToken?: string          // Pagination token
  include?: string[]          // Additional fields to include
  sort?: string[]             // Sort order
  status__in?: BridgeStatus[] // Filter by status
  status__ne?: BridgeStatus   // Exclude by status
  tags__contains?: string[]   // Filter by tags (all must match)
  tags__any?: string[]        // Filter by tags (any match)
  name?: string               // Exact name match
  name__contains?: string     // Partial name match
  name__in?: string[]         // Name in list
  id__in?: string[]           // ID in list
  id__notIn?: string[]        // ID not in list
  locationId__in?: string[]   // Location ID filter
  q?: string                  // Full-text search
  qRelevance__gte?: number    // Minimum relevance score
}

interface GetBridgeParams {
  include?: string[]  // Valid values: status, deviceInfo, networkInfo,
                      // devicePosition, tags, effectivePermissions, etc.
}
\`\`\`

### Media Types

\`\`\`typescript
type MediaType = 'video' | 'image'
type MediaStreamType = 'preview' | 'main'

interface MediaInterval {
  type: MediaStreamType
  deviceId: string
  mediaType: MediaType
  startTimestamp: string  // ISO 8601
  endTimestamp: string    // ISO 8601
  flvUrl?: string | null
  rtspUrl?: string
  rtspsUrl?: string
  hlsUrl?: string
  mp4Url?: string
  multipartUrl?: string
  wsLiveUrl?: string
}

interface ListMediaParams {
  deviceId: string          // Required - camera ID
  type: MediaStreamType     // 'preview' or 'main'
  mediaType: MediaType      // 'video' or 'image'
  startTimestamp: string    // ISO 8601 start time
  endTimestamp?: string     // ISO 8601 end time
  coalesce?: boolean        // Merge adjacent intervals
  include?: string[]        // e.g., ['flvUrl', 'hlsUrl', 'wsLiveUrl']
  pageToken?: string
  pageSize?: number
}

interface GetLiveImageParams {
  deviceId: string          // Required - camera ID
  type?: 'preview'          // Only 'preview' supported for live images
}

interface LiveImageResult {
  imageData: string         // Base64 data URL (data:image/jpeg;base64,...)
  timestamp: string | null  // X-Een-Timestamp header value
  prevToken: string | null  // X-Een-PrevToken for navigation
}

interface GetRecordedImageParams {
  deviceId?: string         // Camera ID (optional if using pageToken)
  pageToken?: string        // Token for specific image
  type?: MediaStreamType    // 'preview' or 'main'
  timestamp__lt?: string    // Before timestamp
  timestamp__lte?: string   // At or before timestamp
  timestamp?: string        // Exact timestamp
  timestamp__gte?: string   // At or after timestamp
  timestamp__gt?: string    // After timestamp
  overlayId__in?: string[]  // Overlay filter
  include?: string[]        // e.g., ['overlayEmbedded', 'overlaySvgHeader']
  targetWidth?: number      // Resize width
  targetHeight?: number     // Resize height
}

interface RecordedImageResult {
  imageData: string         // Base64 data URL
  timestamp: string | null  // X-Een-Timestamp header value
  nextToken: string | null  // X-Een-NextToken for next image
  prevToken: string | null  // X-Een-PrevToken for previous image
  overlaySvg: string | null // X-Een-OverlaySvg for overlays
}

// Media Session types - for setting up cookie-based media access
interface MediaSessionResponse {
  url: string               // URL to call to set the session cookie
}

interface MediaSessionResult {
  success: boolean          // Whether cookie was set successfully
  sessionUrl: string        // The URL that was called
}
\`\`\`

### Feed Types

\`\`\`typescript
type FeedStreamType = 'main' | 'preview' | 'talkdown'
type FeedMediaType = 'video' | 'audio' | 'image' | 'halfDuplex' | 'fullDuplex'
type FeedIncludeOption = 'flvUrl' | 'rtspUrl' | 'rtspsUrl' | 'localRtspUrl' | 'hlsUrl' | 'multipartUrl' | 'webRtcUrl' | 'audioPushHttpsUrl'

interface Feed {
  id: string                    // Feed identifier (typically deviceId-type)
  type: FeedStreamType          // Stream type
  deviceId: string              // Device generating this feed
  mediaType: FeedMediaType      // Media type
  flvUrl?: string | null        // Flash Video URL (if requested)
  rtspUrl?: string | null       // RTSP URL (if requested)
  rtspsUrl?: string | null      // RTSP over TLS (if requested)
  localRtspUrl?: string | null  // Local RTSP to bridge (if requested)
  hlsUrl?: string | null        // HLS URL (if requested)
  multipartUrl?: string | null  // Multipart URL for raw frames (if requested)
  webRtcUrl?: string | null     // WebRTC URL (if requested)
  audioPushHttpsUrl?: string | null  // Audio push for speakers (if requested)
}

interface ListFeedsParams {
  deviceId?: string             // Filter by single device ID
  deviceId__in?: string[]       // Filter by multiple device IDs
  type?: FeedStreamType         // Filter by stream type
  include?: FeedIncludeOption[] // URL fields to include in response
  pageSize?: number
  pageToken?: string
}

interface ListFeedsResult {
  results: Feed[]
  nextPageToken?: string
  totalSize?: number
}
\`\`\`

### Event Types

\`\`\`typescript
type ActorType = 'bridge' | 'camera' | 'speaker' | 'account' | 'user' | 'layout' | 'job' | 'measurement' | 'sensor' | 'gateway'

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

interface EventData {
  type: string
  creatorId: string
  [key: string]: unknown       // Event data is polymorphic
}

interface EventType {
  type: string                 // e.g., 'een.motionDetectionEvent.v1'
  name: string                 // Human-readable name
  description: string
}

interface EventFieldValues {
  type: string[]               // Available event types for the actor
}

interface ListEventsParams {
  actor: string                     // Required: 'camera:{id}' format
  type__in: string[]                // Required: event types to fetch
  startTimestamp__gte: string       // Required: ISO 8601 timestamp
  endTimestamp__lte?: string        // Optional: filter by end time
  pageSize?: number
  pageToken?: string
  sort?: '+startTimestamp' | '-startTimestamp'
  include?: string[]                // e.g., ['data.een.fullFrameImageUrl.v1']
}

interface ListEventFieldValuesParams {
  actor: string                     // Required: 'camera:{id}' format
}
\`\`\`

---

`
}

function generateAPIReference(): string {
  return `## API Reference

### initEenToolkit

Initialize the toolkit. Call this before using any API functions.

\`\`\`typescript
import { initEenToolkit } from 'een-api-toolkit'

// In main.ts
initEenToolkit({
  proxyUrl: import.meta.env.VITE_PROXY_URL,
  clientId: import.meta.env.VITE_EEN_CLIENT_ID,
  debug: true // optional
})
\`\`\`

### getAuthUrl

Generate the OAuth authorization URL. Redirect the user here to start login.

\`\`\`typescript
import { getAuthUrl } from 'een-api-toolkit'

function login() {
  window.location.href = getAuthUrl()
}
\`\`\`

### handleAuthCallback

Handle the OAuth callback after user authorizes. Call this when user returns to your redirect URI.

\`\`\`typescript
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
\`\`\`

### getCurrentUser

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

### getUsers

List users with optional pagination.

\`\`\`typescript
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
\`\`\`

### getUser

Get a specific user by ID.

\`\`\`typescript
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
\`\`\`

### getCameras

List cameras with optional pagination and filtering.

\`\`\`typescript
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
\`\`\`

### getCamera

Get a specific camera by ID.

\`\`\`typescript
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
\`\`\`

### getBridges

List bridges with optional pagination and filtering.

\`\`\`typescript
import { getBridges } from 'een-api-toolkit'

// Basic usage
const { data, error } = await getBridges()

// With pagination
const { data } = await getBridges({ pageSize: 50 })

// With status filter
const { data } = await getBridges({
  pageSize: 20,
  status__in: ['online']
})

// With search
const { data } = await getBridges({
  q: 'office',
  include: ['deviceInfo', 'status', 'networkInfo']
})
\`\`\`

### getBridge

Get a specific bridge by ID.

\`\`\`typescript
import { getBridge } from 'een-api-toolkit'

const { data, error } = await getBridge('bridge-id-123')

if (error) {
  if (error.code === 'NOT_FOUND') {
    console.log('Bridge not found')
  }
  return
}

// With additional fields
const { data: bridgeWithDetails } = await getBridge('bridge-id-123', {
  include: ['deviceInfo', 'networkInfo', 'status']
})
\`\`\`

### listMedia

List media intervals for a camera. Useful for finding when recordings exist.

\`\`\`typescript
import { listMedia } from 'een-api-toolkit'

const { data, error } = await listMedia({
  deviceId: 'camera-id-123',
  type: 'preview',
  mediaType: 'video',
  startTimestamp: '2024-01-01T00:00:00.000Z',
  endTimestamp: '2024-01-02T00:00:00.000Z'
})

if (error) {
  console.error('Failed to list media:', error.message)
  return
}

// Get available recording intervals
for (const interval of data.results) {
  console.log(\`Recording: \${interval.startTimestamp} - \${interval.endTimestamp}\`)
}
\`\`\`

### getLiveImage

Get a live preview image from a camera. Returns base64-encoded image data.

\`\`\`typescript
import { getLiveImage } from 'een-api-toolkit'

const { data, error } = await getLiveImage({
  deviceId: 'camera-id-123'
})

if (error) {
  console.error('Failed to get live image:', error.message)
  return
}

// Use in an <img> element
const imgElement = document.querySelector('img')
imgElement.src = data.imageData  // data:image/jpeg;base64,...

// Timestamp of the image
console.log('Image timestamp:', data.timestamp)
\`\`\`

### getRecordedImage

Get a recorded image from camera history. Supports timestamp-based navigation.

\`\`\`typescript
import { getRecordedImage } from 'een-api-toolkit'

// Get image at specific timestamp
const { data, error } = await getRecordedImage({
  deviceId: 'camera-id-123',
  timestamp: '2024-01-15T14:30:00.000Z'
})

if (error) {
  console.error('Failed to get recorded image:', error.message)
  return
}

// Display the image
const imgElement = document.querySelector('img')
if (imgElement) {
  imgElement.src = data.imageData
}

// Navigate to next/previous image
if (data.nextToken) {
  const { data: nextImage } = await getRecordedImage({
    pageToken: data.nextToken
  })
  // Use nextImage...
}
\`\`\`

### initMediaSession

Initialize media session for cookie-based authentication. Required before using
multipart URLs directly in HTML elements.

\`\`\`typescript
import { initMediaSession, listFeeds } from 'een-api-toolkit'

// Initialize the media session (do this once after login)
const { data, error } = await initMediaSession()

if (error) {
  console.error('Failed to init media session:', error.message)
  return
}

console.log('Media session initialized:', data.sessionUrl)

// Now multipart URLs can be used directly in <img> elements
const { data: feeds } = await listFeeds({
  deviceId: 'camera-123',
  include: ['multipartUrl']
})

if (feeds?.results[0]?.multipartUrl) {
  // This works because the session cookie is set
  const imgElement = document.querySelector('img')
  imgElement.src = feeds.results[0].multipartUrl
}
\`\`\`

### getMediaSession

Get the media session URL without setting the cookie. Use \`initMediaSession()\`
for most cases.

\`\`\`typescript
import { getMediaSession } from 'een-api-toolkit'

// Get the session URL (step 1 of 2)
const { data, error } = await getMediaSession()

if (error) {
  console.error('Failed to get media session:', error.message)
  return
}

console.log('Session URL:', data.url)
// Manually call data.url with credentials: 'include' to set the cookie
\`\`\`

---

`
}

function generateLiveVideoStreaming(): string {
  return `## Live Video Streaming

The EEN API Toolkit supports two methods for displaying live video from cameras:

### Stream Types Comparison

| Feature | Preview Stream | Main Stream |
|---------|---------------|-------------|
| Quality | Lower resolution | Full resolution |
| Authentication | Session cookie (multipart URL) | JWT token (Live SDK) |
| Element Type | \`<img>\` element | \`<video>\` element |
| Technology | MJPEG multipart | WebCodecs via SDK |
| Browser Support | All modern browsers | Chrome 94+, Edge 94+, Opera 80+ (WebCodecs) |
| Use Case | Thumbnails, quick previews | Full video playback |
| Setup | \`initMediaSession()\` | \`@een/live-video-web-sdk\` |

### Preview Streams (Multipart URL)

Preview streams use cookie-based authentication with multipart URLs. These are ideal
for thumbnails and quick previews using simple \`<img>\` elements.

**Step 1: Initialize the media session (once after login)**

\`\`\`typescript
import { initMediaSession } from 'een-api-toolkit'

// Call once after authentication
const { data, error } = await initMediaSession()
if (error) {
  console.error('Failed to init media session:', error.message)
  return
}
// Session cookie is now set
\`\`\`

**Step 2: Get the feed URL and display it**

\`\`\`typescript
import { listFeeds } from 'een-api-toolkit'

const { data: feeds } = await listFeeds({
  deviceId: cameraId,
  type: 'preview',
  include: ['multipartUrl']
})

// Find a feed with multipartUrl
const previewFeed = feeds?.results.find(f => f.multipartUrl)
if (previewFeed?.multipartUrl) {
  // Can be used directly in an <img> element
  imgElement.src = previewFeed.multipartUrl
}
\`\`\`

**Complete Vue Example (Preview Stream):**

\`\`\`vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { initMediaSession, listFeeds, type Feed } from 'een-api-toolkit'

const props = defineProps<{ cameraId: string }>()
const previewUrl = ref<string | null>(null)
const loading = ref(true)

onMounted(async () => {
  // Initialize media session for cookie-based auth
  const { error: sessionError } = await initMediaSession()
  if (sessionError) {
    console.error('Failed to init session:', sessionError.message)
    loading.value = false
    return
  }

  // Get preview feed
  const { data, error } = await listFeeds({
    deviceId: props.cameraId,
    type: 'preview',
    include: ['multipartUrl']
  })

  if (error) {
    console.error('Failed to get feeds:', error.message)
    loading.value = false
    return
  }

  const feed = data.results.find(f => f.multipartUrl)
  previewUrl.value = feed?.multipartUrl ?? null
  loading.value = false
})
</script>

<template>
  <div class="preview-container">
    <div v-if="loading">Loading...</div>
    <img v-else-if="previewUrl" :src="previewUrl" alt="Camera preview" />
    <div v-else>No preview available</div>
  </div>
</template>
\`\`\`

### Main Streams (Live Video SDK)

Main streams provide full-resolution video using the \`@een/live-video-web-sdk\`.
This requires JWT authentication and uses WebCodecs for efficient video playback.

**Installation:**

\`\`\`bash
npm install @een/live-video-web-sdk
\`\`\`

**Complete Vue Example (Main Stream):**

\`\`\`vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { LivePlayer } from '@een/live-video-web-sdk'
import { useAuthStore, listFeeds, type Feed } from 'een-api-toolkit'

const props = defineProps<{ cameraId: string }>()
const authStore = useAuthStore()
const videoElement = ref<HTMLVideoElement | null>(null)
const loading = ref(true)
const statusMessage = ref('')

let livePlayer: LivePlayer | null = null

async function initPlayer() {
  // Get the main feed to verify it exists
  const { data, error } = await listFeeds({
    deviceId: props.cameraId,
    type: 'main',
    include: ['multipartUrl']
  })

  if (error || !data.results.length) {
    statusMessage.value = 'No main feed available'
    loading.value = false
    return
  }

  // Wait for video element to be mounted
  await nextTick()
  if (!videoElement.value) return

  // Ensure auth is valid
  if (!authStore.baseUrl || !authStore.token) {
    statusMessage.value = 'Not authenticated'
    loading.value = false
    return
  }

  // Initialize the Live SDK player
  livePlayer = new LivePlayer()

  // Subscribe to status updates
  livePlayer.onStatusChange((status) => {
    statusMessage.value = status
    if (status === 'playing') {
      loading.value = false
    }
  })

  // Start playback
  await livePlayer.start({
    videoElement: videoElement.value,
    cameraId: props.cameraId,
    baseUrl: authStore.baseUrl,
    jwt: authStore.token
  })
}

function handleVideoError(event: Event) {
  const video = event.target as HTMLVideoElement
  console.error('Video error:', video.error?.message)
  statusMessage.value = 'Playback error'
  loading.value = false
}

function cleanup() {
  if (livePlayer) {
    livePlayer.stop()
    livePlayer = null
  }
}

onMounted(() => {
  initPlayer()
})

onUnmounted(() => {
  cleanup()
})
</script>

<template>
  <div class="video-container">
    <div v-if="loading" class="loading-overlay">
      <span>{{ statusMessage || 'Connecting...' }}</span>
    </div>
    <video
      ref="videoElement"
      autoplay
      muted
      playsinline
      @error="handleVideoError"
    />
    <div v-if="statusMessage && !loading" class="status">{{ statusMessage }}</div>
  </div>
</template>

<style scoped>
.video-container {
  position: relative;
  background: #000;
}
video {
  width: 100%;
  height: auto;
}
.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  color: white;
}
</style>
\`\`\`

### Choosing Between Preview and Main Streams

- **Preview streams** are simpler to implement and work well for:
  - Camera selection grids
  - Thumbnail previews
  - Lower bandwidth scenarios
  - Simple \`<img>\` element integration

- **Main streams** are better for:
  - Full-screen video viewing
  - High-quality playback
  - Professional monitoring applications
  - Integration with video controls

---

`
}


function generatePatterns(): string {
  return `## Common Patterns

### Error Handling

\`\`\`typescript
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
\`\`\`

### Pagination

\`\`\`typescript
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
\`\`\`

### Auth Guard (Vue Router)

\`\`\`typescript
import { useAuthStore } from 'een-api-toolkit'

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})
\`\`\`

### Vue Component Example

\`\`\`vue
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
  <div v-else>Not authenticated or user data not available.</div>
</template>
\`\`\`

---

`
}

function generateAntiPatterns(): string {
  return `## Anti-Patterns (What NOT to Do)

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
data.results.forEach(...) // Safe - TypeScript knows data is not null
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
// main.ts
initEenToolkit({ ... })
app.mount('#app')
\`\`\`

### DON'T: Access data before checking error

\`\`\`typescript
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
\`\`\`

---

`
}

function generateExternalResources(): string {
  return `## External Resources

- [Eagle Eye Networks Developer Portal](https://developer.eagleeyenetworks.com)
- [EEN API v3.0 Reference](https://developer.eagleeyenetworks.com/reference/using-the-api)
- [GitHub Repository](https://github.com/klaushofrichter/een-api-toolkit)
- [OAuth Proxy](https://github.com/klaushofrichter/een-oauth-proxy) - Required for secure token management
`
}

function generateSetupGuide(): string {
  return `## Additional Setup Details

### OAuth Callback Route

The \`beforeEnter\` guard shown in the "Critical Requirements" section redirects OAuth responses to a named route called 'callback'. Here is how to set up that route and its component:

\`\`\`typescript
// router/index.ts
{
  path: '/callback',
  name: 'callback',
  component: () => import('./views/Callback.vue')
}
\`\`\`

\`\`\`vue
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
    router.push(\`/login?error=\${error.code}\`)
    return
  }

  router.push('/dashboard')
})
</script>

<template>
  <div>Authenticating...</div>
</template>
\`\`\`

### Login Component

\`\`\`vue
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
\`\`\`

### Logout Component

\`\`\`vue
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
\`\`\`

---

## External Resources

- [Eagle Eye Networks Developer Portal](https://developer.eagleeyenetworks.com)
- [EEN API v3.0 Reference](https://developer.eagleeyenetworks.com/reference/using-the-api)
- [GitHub Repository](https://github.com/klaushofrichter/een-api-toolkit)
- [OAuth Proxy](https://github.com/klaushofrichter/een-oauth-proxy) - Required for secure token management
`
}

function main() {
  // Ensure docs directory exists
  if (!fs.existsSync(DOCS_DIR)) {
    fs.mkdirSync(DOCS_DIR, { recursive: true })
  }

  // Generate AI-CONTEXT.md
  const content = [
    generateHeader(),
    generateCriticalSetup(),        // Prerequisites & Installation at the TOP (includes Common Pitfalls)
    generateQuickReference(),
    // generateCriticalRequirements() removed - consolidated into generateCriticalSetup()
    generateCoreTypes(),
    generateEntityTypes(),
    generateAPIReference(),
    generateLiveVideoStreaming(),   // Live video streaming guide
    generatePatterns(),
    generateAntiPatterns(),
    // generateSetupGuide() removed - redundant with API Reference examples
    generateExternalResources()
  ].join('')

  fs.writeFileSync(OUTPUT_FILE, content)
  console.log(`Generated ${OUTPUT_FILE}`)
  console.log(`Version: ${packageJson.version}`)
}

main()
