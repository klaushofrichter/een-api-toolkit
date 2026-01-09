# EEN API Toolkit - AI Reference

> **Version:** 0.3.7
>
> This file is optimized for AI assistants. It contains all API signatures,
> types, and usage patterns in a single, parseable document.
>
> For the full EEN API documentation, see the
> [Eagle Eye Networks Developer Portal](https://developer.eagleeyenetworks.com).

> **Working Examples:** The installed package includes complete Vue 3 example applications
> at `./node_modules/een-api-toolkit/examples/`. These demonstrate OAuth authentication,
> user management, camera listing, live/recorded media, and video feeds. For Live Main
> Video streaming, see `./node_modules/een-api-toolkit/examples/vue-feeds/src/views/Feeds.vue`.

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
- Use port `3333` exactly
- No trailing slash (not `http://127.0.0.1:3333/`)
- No path (not `http://127.0.0.1:3333/callback`)
- Register this exact URI at [EEN Developer Portal](https://developer.eagleeyenetworks.com/page/my-application)

**Vite config:**
```typescript
// vite.config.ts
server: { host: '127.0.0.1', port: 3333, strictPort: true }
```

**Router pattern:** Handle OAuth callback on root path, then redirect internally:
```typescript
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
```

### Common Pitfalls - Preview Images

Displaying live preview images requires careful attention to authentication. Here are common mistakes:

#### DON'T: Construct API URLs directly for `<img>` tags

```typescript
// WRONG - browsers cannot send Authorization headers with <img src>
const url = `${authStore.baseUrl}/api/v3.0/media/liveImage.jpeg?deviceId=${cameraId}`
imgElement.src = url  // Results in 401 Unauthorized
```

**Why it fails:** The `<img>` element makes a simple GET request without custom headers. The JWT token cannot be sent, so the request is unauthorized.

#### DON'T: Modify multipartUrl by adding query parameters

```typescript
// WRONG - adding parameters breaks the pre-signed URL
const feedUrl = feed.multipartUrl
imgElement.src = `${feedUrl}?timestamp=${Date.now()}`  // Results in 400 Bad Request
imgElement.src = `${feedUrl}&cache=${Date.now()}`     // Also fails
```

**Why it fails:** The `multipartUrl` is a complete, pre-authenticated URL. Any modification (including cache-busting parameters) invalidates it.

#### DO: Use `getLiveImage()` for preview thumbnails

```typescript
// CORRECT - returns base64 data URL that works directly in <img src>
import { getLiveImage } from 'een-api-toolkit'

const { data, error } = await getLiveImage({ deviceId: cameraId })
if (data?.imageData) {
  imgElement.src = data.imageData  // "data:image/jpeg;base64,..."
}
```

**Why it works:** The toolkit handles authentication internally and returns a base64-encoded data URL that can be used directly without browser restrictions.

### Choosing the Right Preview Method

| Use Case | Method | Notes |
|----------|--------|-------|
| Grid of camera thumbnails | `getLiveImage()` | Best for multiple cameras, handles auth internally |
| Periodic refresh (e.g., every 3s) | `getLiveImage()` | Call repeatedly in a timer |
| Single continuous MJPEG stream | `multipartUrl` | Requires `initMediaSession()` first, use URL unmodified |
| One-time snapshot | `getLiveImage()` | Simple and self-contained |
| Full-quality live video | Live Video SDK | For modal/fullscreen video playback |

**Quick Reference:**

```typescript
// For thumbnails and grids - USE THIS
const { data } = await getLiveImage({ deviceId })
img.src = data.imageData

// For continuous MJPEG stream (single camera, unmodified URL only)
await initMediaSession()
const { data: feeds } = await listFeeds({ deviceId, include: ['multipartUrl'] })
img.src = feeds.results.find(f => f.type === 'preview')?.multipartUrl

// For HD live video - use @een/live-video-web-sdk
const player = new LivePlayer()
player.start({ videoElement, cameraId, baseUrl, jwt })
```

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

### Bridge Functions

| Function | Purpose | Returns |
|----------|---------|---------|
| `getBridges(params?)` | List all bridges (paginated) | `Result<PaginatedResult<Bridge>>` |
| `getBridge(bridgeId, params?)` | Get a specific bridge | `Result<Bridge>` |

### Media Functions

| Function | Purpose | Returns |
|----------|---------|---------|
| `listMedia(params)` | List media intervals for a device | `Result<PaginatedResult<MediaInterval>>` |
| `listFeeds(params)` | List available feeds for a device | `Result<ListFeedsResult>` |
| `getLiveImage(params)` | Get live preview image from camera | `Result<LiveImageResult>` |
| `getRecordedImage(params)` | Get recorded image from history | `Result<RecordedImageResult>` |
| `getMediaSession()` | Get media session URL for cookies | `Result<MediaSessionResponse>` |
| `initMediaSession()` | Initialize media session (sets cookie) | `Result<MediaSessionResult>` |

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
type StorageStrategy = 'localStorage' | 'sessionStorage' | 'memory'

interface EenToolkitConfig {
  proxyUrl?: string           // OAuth proxy URL (required for API calls)
  clientId?: string           // EEN OAuth client ID
  redirectUri?: string        // OAuth redirect URI (default: http://127.0.0.1:3333)
  storageStrategy?: StorageStrategy  // Token storage: 'localStorage' (default), 'sessionStorage', or 'memory'
  debug?: boolean             // Enable debug logging
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

### Bridge

```typescript
type BridgeStatus = 'online' | 'offline' | 'error' | 'idle' | 'registered' | 'attaching' | 'initializing'

interface Bridge {
  id: string
  name: string
  accountId: string
  locationId?: string | null
  guid?: string
  timezone?: string
  status?: BridgeStatus | { connectionStatus?: BridgeStatus }
  tags?: string[]
  deviceInfo?: { make?: string; model?: string; firmwareVersion?: string; serialNumber?: string; hardwareVersion?: string }
  networkInfo?: { localIpAddress?: string; publicIpAddress?: string; macAddress?: string; subnetMask?: string; gateway?: string; dnsServers?: string[] }
  devicePosition?: { latitude?: number; longitude?: number; altitude?: number; floor?: number; azimuth?: number }
  cameraCount?: number
  createdAt?: string
  updatedAt?: string
}

// ListBridgesParams: Same filter pattern as ListCamerasParams (without camera-specific fields like bridgeId__in, shared, directToCloud)
// GetBridgeParams: { include?: string[] } - values: status, deviceInfo, networkInfo, devicePosition, tags, effectivePermissions
```

### Media Types

```typescript
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
```

### Feed Types

```typescript
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
```

---

## API Reference

### Authentication

```typescript
import { initEenToolkit, getAuthUrl, handleAuthCallback } from 'een-api-toolkit'

// Initialize (call once in main.ts after Pinia is installed)
initEenToolkit({
  proxyUrl: import.meta.env.VITE_PROXY_URL,
  clientId: import.meta.env.VITE_EEN_CLIENT_ID
})

// Start OAuth login
window.location.href = getAuthUrl()

// Handle callback (in your callback route)
const code = new URL(location.href).searchParams.get('code')
const state = new URL(location.href).searchParams.get('state')
if (code && state) {
  const { error } = await handleAuthCallback(code, state)
  if (!error) router.push('/dashboard')
}
```

### Users

```typescript
import { getCurrentUser, getUsers, getUser } from 'een-api-toolkit'

// Current user
const { data: profile } = await getCurrentUser()

// List users (with pagination)
const { data } = await getUsers({ pageSize: 50 })
// data.results, data.nextPageToken

// Get specific user
const { data: user } = await getUser('user-id', { include: ['permissions'] })
```

### Cameras

```typescript
import { getCameras, getCamera } from 'een-api-toolkit'

// List with filters
const { data } = await getCameras({
  pageSize: 20,
  status__in: ['online', 'streaming'],
  q: 'front door',
  include: ['deviceInfo', 'status']
})

// Get specific camera
const { data: camera } = await getCamera('camera-id', {
  include: ['deviceInfo', 'status', 'shareDetails']
})
```

### Bridges

```typescript
import { getBridges, getBridge } from 'een-api-toolkit'

// Same pattern as cameras
const { data } = await getBridges({ status__in: ['online'], include: ['networkInfo'] })
const { data: bridge } = await getBridge('bridge-id', { include: ['deviceInfo'] })
```

### Media

```typescript
import { listMedia, getLiveImage, getRecordedImage } from 'een-api-toolkit'

// List recording intervals
const { data } = await listMedia({
  deviceId: 'camera-id',
  type: 'preview',
  mediaType: 'video',
  startTimestamp: '2024-01-01T00:00:00.000Z',
  endTimestamp: '2024-01-02T00:00:00.000Z'
})

// Get live image (returns base64 data URL - use for thumbnails/grids)
const { data: live } = await getLiveImage({ deviceId: 'camera-id' })
imgElement.src = live.imageData  // "data:image/jpeg;base64,..."

// Get recorded image with navigation
const { data: recorded } = await getRecordedImage({
  deviceId: 'camera-id',
  timestamp: '2024-01-15T14:30:00.000Z'
})
imgElement.src = recorded.imageData
// Use recorded.nextToken/prevToken for navigation
```

### Media Session (for multipartUrl)

```typescript
import { initMediaSession, listFeeds } from 'een-api-toolkit'

// Initialize session (once after login) - sets auth cookie
const { error } = await initMediaSession()

// Get multipart URL for continuous MJPEG stream
const { data: feeds } = await listFeeds({
  deviceId: 'camera-id',
  type: 'preview',
  include: ['multipartUrl']
})
const feed = feeds?.results.find(f => f.multipartUrl)
if (feed) imgElement.src = feed.multipartUrl  // Use exactly as-is
```

---

## Live Video Streaming

### Stream Types Comparison

| Feature | Preview Stream | Main Stream |
|---------|---------------|-------------|
| Quality | Lower resolution | Full resolution |
| Authentication | Session cookie | JWT token |
| Element | `<img>` | `<video>` |
| Technology | MJPEG multipart | WebCodecs |
| Browser Support | All modern | Chrome 94+, Edge 94+, Opera 80+ |
| Setup | `initMediaSession()` | `@een/live-video-web-sdk` |

### Preview Streams (Multipart URL)

For thumbnails and grids using `<img>` elements. **Do not modify the multipartUrl** (see READ FIRST).

```typescript
import { initMediaSession, listFeeds } from 'een-api-toolkit'

// Step 1: Initialize session (once after login)
await initMediaSession()

// Step 2: Get and use the multipart URL
const { data: feeds } = await listFeeds({
  deviceId: cameraId,
  type: 'preview',
  include: ['multipartUrl']
})
const feed = feeds?.results.find(f => f.multipartUrl)
if (feed?.multipartUrl) {
  imgElement.src = feed.multipartUrl  // Use exactly as-is
}
```

### Main Streams (Live Video SDK)

Full-resolution video requires `@een/live-video-web-sdk` with JWT authentication.

```bash
npm install @een/live-video-web-sdk
```

```typescript
import { LivePlayer } from '@een/live-video-web-sdk'
import { useAuthStore } from 'een-api-toolkit'

const authStore = useAuthStore()
const livePlayer = new LivePlayer()

// Optional: Subscribe to status updates
livePlayer.onStatusChange((status) => console.log('Status:', status))

// Start playback
await livePlayer.start({
  videoElement: document.querySelector('video'),
  cameraId: 'camera-id',
  baseUrl: authStore.baseUrl,
  jwt: authStore.token
})

// Cleanup when done
livePlayer.stop()
```

**Video element requirements:** `<video autoplay muted playsinline />`

> **Complete examples:** See `examples/vue-feeds/` for full Vue implementations of both stream types.

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

---

## Anti-Patterns

```typescript
// DON'T: Use try/catch - functions return Result, never throw
try { await getUsers() } catch (e) { /* never catches API errors */ }

// DON'T: Access data without checking error first
const { data } = await getUsers()
data.results.forEach(...)  // TypeError if error!

// DO: Always check error before accessing data
const { data, error } = await getUsers()
if (error) return handleError(error)
data.results.forEach(...)  // Safe - TypeScript knows data is not null

// DON'T: Call initEenToolkit in components (call once in main.ts)
```

---

## External Resources

- [Eagle Eye Networks Developer Portal](https://developer.eagleeyenetworks.com)
- [EEN API v3.0 Reference](https://developer.eagleeyenetworks.com/reference/using-the-api)
- [GitHub Repository](https://github.com/klaushofrichter/een-api-toolkit)
- [OAuth Proxy](https://github.com/klaushofrichter/een-oauth-proxy) - Required for secure token management
