# Media & Live Video - EEN API Toolkit

> **Version:** 0.3.62
>
> Complete reference for media retrieval, live streaming, and video playback.
> Load this document when implementing video features.

---

## CRITICAL: Choosing the Right Approach

| Use Case | Method | Why |
|----------|--------|-----|
| Thumbnails (20+ cameras) | `getLiveImage()` | Handles auth, returns base64 |
| Auto-updating preview | `multipartUrl` | Continuous MJPEG stream |
| Full-quality live video | Live Video SDK | WebCodecs, full resolution |
| Recorded video playback | HLS via `listMedia()` | Standard video player |

---

## Common Pitfalls (READ FIRST)

### DON'T: Construct API URLs for `<img>` tags

```typescript
// WRONG - browsers cannot send Authorization headers with <img src>
const url = `${authStore.baseUrl}/api/v3.0/media/liveImage.jpeg?deviceId=${cameraId}`
imgElement.src = url  // Results in 401 Unauthorized
```

### DON'T: Modify multipartUrl

```typescript
// WRONG - adding parameters breaks the pre-signed URL
imgElement.src = `${feedUrl}?timestamp=${Date.now()}`  // 400 Bad Request
```

### DO: Use `getLiveImage()` for thumbnails

```typescript
// CORRECT - returns base64 data URL
const { data } = await getLiveImage({ deviceId: cameraId })
imgElement.src = data.imageData  // "data:image/jpeg;base64,..."
```

---

## Media Types

```typescript
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
```

---

## Feed Types

```typescript
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
```

---

## Media Functions

### getLiveImage(params)

Get live preview image. Best for thumbnails.

```typescript
import { getLiveImage } from 'een-api-toolkit'

const { data, error } = await getLiveImage({ deviceId: 'camera-123' })

if (data) {
  imgElement.src = data.imageData  // data:image/jpeg;base64,...
  console.log('Timestamp:', data.timestamp)
}
```

### getRecordedImage(params)

Get recorded image with navigation.

```typescript
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
```

### initMediaSession()

Initialize media session for cookie-based auth. Required before using multipartUrl.

```typescript
import { initMediaSession, listFeeds } from 'een-api-toolkit'

// Initialize once after login
await initMediaSession()

// Now multipartUrl works in <img> elements
const { data: feeds } = await listFeeds({
  deviceId: 'camera-123',
  include: ['multipartUrl']
})

imgElement.src = feeds.results[0].multipartUrl
```

### listMedia(params)

List recording intervals. Use for HLS playback.

```typescript
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
```

---

## Live Video Streaming

### Preview Stream (MJPEG)

```typescript
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
```

### Main Stream (Live Video SDK)

```typescript
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
```

---

## HLS Playback

```typescript
import Hls from 'hls.js'
import { useAuthStore } from 'een-api-toolkit'

const authStore = useAuthStore()

const hls = new Hls({
  xhrSetup: (xhr) => {
    // MUST use Authorization header, not withCredentials
    xhr.setRequestHeader('Authorization', `Bearer ${authStore.token}`)
  }
})

hls.loadSource(hlsUrl)
hls.attachMedia(videoElement)
```

---

## Utility: formatTimestamp

EEN API requires `+00:00` format, not `Z`:

```typescript
import { formatTimestamp } from 'een-api-toolkit'

// Convert Z to +00:00
formatTimestamp('2025-01-15T22:30:00.000Z')
// Returns: '2025-01-15T22:30:00.000+00:00'
```

---

## Vue Components

### LiveCamera.vue

```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { getCameras, getLiveImage } from 'een-api-toolkit'
import type { Camera } from 'een-api-toolkit'
import { useSelectedCamera } from '../composables/useSelectedCamera'
import { formatTimestampLocale, formatTimestampUtc } from '../utils/timestamp'

const cameras = ref<Camera[]>([])
const { selectedCameraId, setSelectedCamera } = useSelectedCamera()
const imageData = ref<string | null>(null)
const imageTimestamp = ref<string | null>(null)
const loading = ref(true)
const loadingImage = ref(false)
const error = ref<string | null>(null)
const refreshInterval = ref<ReturnType<typeof setInterval> | null>(null)
const autoRefresh = ref(true)

// Configurable refresh interval (in milliseconds)
const REFRESH_INTERVAL_MS = 5000

// Error recovery: track consecutive failures for backoff
const consecutiveErrors = ref(0)
const MAX_CONSECUTIVE_ERRORS = 3

// Track component lifecycle to prevent memory leaks
const isMounted = ref(true)

// Track current request to handle race conditions during camera switching
let currentRequestId = 0

async function loadCameras() {
  loading.value = true
  error.value = null

  const result = await getCameras()

  // Check if component is still mounted
  if (!isMounted.value) return

  if (result.error) {
    error.value = result.error.message
    loading.value = false
    return
  }

  cameras.value = result.data?.results || []
  loading.value = false

  // Use shared camera if valid, otherwise auto-select first camera
  if (cameras.value.length > 0) {
    const isValidCamera = selectedCameraId.value &&
      cameras.value.some(c => c.id === selectedCameraId.value)
    if (!isValidCamera) {
      setSelectedCamera(cameras.value[0].id)
    }
    await fetchLiveImage()
  }
}

async function fetchLiveImage() {
  if (!selectedCameraId.value) return

  // Increment request ID to track this specific request
  const requestId = ++currentRequestId
  const cameraId = selectedCameraId.value

  loadingImage.value = true

  const result = await getLiveImage({ deviceId: cameraId })

  // Check if component is still mounted and this is still the current request
  if (!isMounted.value || requestId !== currentRequestId) {
    return // Discard stale response
  }

  if (result.error) {
    error.value = result.error.message
    loadingImage.value = false
    consecutiveErrors.value++

    // Stop auto-refresh after too many consecutive errors
    if (consecutiveErrors.value >= MAX_CONSECUTIVE_ERRORS && autoRefresh.value) {
      autoRefresh.value = false
      stopAutoRefresh()
      error.value = `${result.error.message} (Auto-refresh stopped after ${MAX_CONSECUTIVE_ERRORS} failures)`
    }
    return
  }

  // Reset error count on success
  consecutiveErrors.value = 0
  error.value = null

  if (result.data) {
    imageData.value = result.data.imageData
    imageTimestamp.value = result.data.timestamp
  }
  loadingImage.value = false
}

async function selectCamera(cameraId: string) {
  setSelectedCamera(cameraId)
  imageData.value = null
  error.value = null
  consecutiveErrors.value = 0
  await fetchLiveImage()
}

function startAutoRefresh() {
  if (refreshInterval.value) return

  consecutiveErrors.value = 0
  refreshInterval.value = setInterval(async () => {
    if (autoRefresh.value && selectedCameraId.value && isMounted.value) {
      try {
        await fetchLiveImage()
      } catch (err) {
        // Catch any unexpected errors to prevent interval from breaking
        console.error('Auto-refresh error:', err)
        consecutiveErrors.value++
        if (consecutiveErrors.value >= MAX_CONSECUTIVE_ERRORS) {
          autoRefresh.value = false
          stopAutoRefresh()
        }
      }
    }
  }, REFRESH_INTERVAL_MS)
}

function stopAutoRefresh() {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
}

function toggleAutoRefresh() {
  autoRefresh.value = !autoRefresh.value
  if (autoRefresh.value) {
    consecutiveErrors.value = 0
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
}

onMounted(() => {
  loadCameras()
  startAutoRefresh()
})

onUnmounted(() => {
  isMounted.value = false
  stopAutoRefresh()
})
</script>

<template>
  <div class="live-camera">
    <h2>Live Camera Image (preview)</h2>

    <div v-if="loading" class="loading">
      <p>Loading cameras...</p>
    </div>

    <div v-else-if="error && cameras.length === 0" class="error-state">
      <p class="error">{{ error }}</p>
      <button @click="loadCameras">Retry</button>
    </div>

    <div v-else-if="cameras.length === 0" class="no-cameras">
      <p>No cameras found in your account.</p>
    </div>

    <div v-else class="camera-view">
      <div class="camera-selector">
        <label for="camera-select">Select Camera:</label>
        <select
          id="camera-select"
          :value="selectedCameraId"
          @change="selectCamera(($event.target as HTMLSelectElement).value)"
          data-testid="camera-select"
        >
          <option v-for="camera in cameras" :key="camera.id" :value="camera.id">
            {{ camera.name || camera.id }}
          </option>
        </select>
      </div>

      <div class="controls">
        <button @click="fetchLiveImage" :disabled="loadingImage" data-testid="refresh-button">
          {{ loadingImage ? 'Loading...' : 'Refresh' }}
        </button>
        <button @click="toggleAutoRefresh" data-testid="auto-refresh-button">
          {{ autoRefresh ? 'Stop Auto-Refresh' : 'Start Auto-Refresh' }}
        </button>
      </div>

      <div v-if="error" class="error-banner">
        <p class="error">{{ error }}</p>
      </div>

      <div class="image-container" data-testid="image-container">
        <div v-if="loadingImage && !imageData" class="image-loading">
          <p>Loading image...</p>
        </div>

        <img
          v-else-if="imageData"
          :src="imageData"
          alt="Live camera image"
          class="live-image"
          data-testid="live-image"
        />

        <div v-else class="no-image">
          <p>No image available</p>
        </div>
      </div>

      <div v-if="imageTimestamp" class="timestamp" data-testid="timestamp">
        <small>Timestamp: {{ formatTimestampLocale(imageTimestamp) }}</small>
        <br />
        <small data-testid="utc-timestamp">Timestamp for API (UTC): <span class="utc-timestamp">{{ formatTimestampUtc(imageTimestamp) }}</span></small>
      </div>
    </div>

  </div>
</template>
```

### Feeds.vue

```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { getCameras, listFeeds, initMediaSession, useAuthStore } from 'een-api-toolkit'
import type { Camera, Feed, FeedIncludeOption } from 'een-api-toolkit'
import LivePlayer from '@een/live-video-web-sdk'

const authStore = useAuthStore()

const cameras = ref<Camera[]>([])
const selectedCameraId = ref<string | null>(null)
const feeds = ref<Feed[]>([])
const loading = ref(true)
const loadingFeeds = ref(false)
const error = ref<string | null>(null)

// Modal state
const showModal = ref(false)
const selectedFeed = ref<Feed | null>(null)
const mediaSessionInitialized = ref(false)
const mediaSessionError = ref<string | null>(null)
const modalError = ref<string | null>(null)

// Player mode: 'preview' | 'live'
type PlayerMode = 'preview' | 'live'
const playerMode = ref<PlayerMode>('preview')

// Video element ref
const videoRef = ref<HTMLVideoElement | null>(null)

// Live SDK player state
let livePlayerInstance: LivePlayer | null = null
const livePlayerLoading = ref(false)
const livePlayerConnected = ref(false)

// Track component lifecycle to prevent memory leaks
const isMounted = ref(true)

// Track current request to handle race conditions
let currentRequestId = 0

// AbortController for cancelling in-flight requests
let abortController: AbortController | null = null

// URL field labels for display (data-driven approach)
// Uses FeedIncludeOption type to ensure only URL fields are included, not other Feed properties
const URL_LABELS: Record<FeedIncludeOption, string> = {
  hlsUrl: 'HLS',
  multipartUrl: 'Multipart',
  flvUrl: 'FLV',
  rtspUrl: 'RTSP',
  rtspsUrl: 'RTSPS',
  localRtspUrl: 'Local RTSP',
  webRtcUrl: 'WebRTC',
  audioPushHttpsUrl: 'Audio Push'
}

async function loadCameras() {
  loading.value = true
  error.value = null

  const result = await getCameras()

  if (!isMounted.value) return

  if (result.error) {
    error.value = result.error.message
    loading.value = false
    return
  }

  cameras.value = result.data?.results || []
  loading.value = false

  // Auto-select first camera
  if (cameras.value.length > 0 && !selectedCameraId.value) {
    selectedCameraId.value = cameras.value[0].id
    await fetchFeeds()
  }
}

async function fetchFeeds() {
  if (!selectedCameraId.value) return

  // Cancel any in-flight request
  if (abortController) {
    abortController.abort()
  }
  abortController = new AbortController()

  const requestId = ++currentRequestId
  loadingFeeds.value = true
  error.value = null

  const result = await listFeeds({
    deviceId: selectedCameraId.value,
    include: ['hlsUrl', 'multipartUrl', 'flvUrl', 'rtspUrl'],
    signal: abortController.signal
  })

  // Guard against stale responses:
  // - isMounted check prevents memory leaks by not updating state after unmount
  // - requestId check prevents race conditions when rapid camera switching causes
  //   overlapping requests where an older response arrives after a newer one
  if (!isMounted.value || requestId !== currentRequestId) {
    return
  }

  loadingFeeds.value = false

  if (result.error) {
    error.value = result.error.message
    feeds.value = []
    return
  }

  feeds.value = result.data?.results || []
}

async function selectCamera(cameraId: string) {
  if (!isMounted.value) return

  selectedCameraId.value = cameraId
  feeds.value = []
  error.value = null
  await fetchFeeds()
}

function handleCameraChange(event: Event) {
  const target = event.target as HTMLSelectElement
  if (target.value) {
    // Defensive error handling - selectCamera handles errors internally via fetchFeeds,
    // but we catch here to handle any unexpected errors during the camera change flow
    selectCamera(target.value).catch((err) => {
      error.value = `Failed to select camera: ${String(err)}`
    })
  }
}

function getAvailableUrls(feed: Feed): string[] {
  return (Object.keys(URL_LABELS) as FeedIncludeOption[])
    .filter(key => feed[key])
    .map(key => URL_LABELS[key])
}

// Initialize media session for cookie-based authentication
async function initializeMediaSession() {
  if (mediaSessionInitialized.value) return true

  mediaSessionError.value = null
  const result = await initMediaSession()

  if (result.error) {
    mediaSessionError.value = result.error.message
    return false
  }

  mediaSessionInitialized.value = true
  return true
}

// Check if feed supports multipart preview
function hasMultipartUrl(feed: Feed): boolean {
  return !!feed.multipartUrl
}

// Check if feed should use multipart preview
function isPreviewFeed(feed: Feed): boolean {
  return feed.type === 'preview' && hasMultipartUrl(feed)
}

// Check if feed supports Live SDK (main feed - uses deviceId)
function supportsLiveSdk(feed: Feed): boolean {
  return feed.type === 'main' && !!feed.deviceId
}

// Initialize Live SDK player for a feed
async function initLivePlayer(feed: Feed) {
  if (!feed.deviceId || !videoRef.value) return

  // Verify auth is available
  if (!authStore.baseUrl || !authStore.token) {
    modalError.value = 'Authentication required for Live SDK'
    return
  }

  // Validate base URL format
  if (!authStore.baseUrl.startsWith('https://')) {
    modalError.value = 'Invalid base URL format - HTTPS required'
    return
  }

  // Clean up any existing player
  destroyLivePlayer()

  livePlayerLoading.value = true
  livePlayerConnected.value = false

  try {
    const videoElement = videoRef.value

    const config = {
      videoElement,
      cameraId: feed.deviceId,
      baseUrl: authStore.baseUrl,
      jwt: authStore.token
    }

    livePlayerInstance = new LivePlayer()
    await livePlayerInstance.start(config)

    livePlayerConnected.value = true
  } catch (err) {
    modalError.value = `Live SDK Error: ${String(err)}`
    livePlayerConnected.value = false
  } finally {
    livePlayerLoading.value = false
  }
}

// Destroy Live SDK player instance
function destroyLivePlayer() {
  if (livePlayerInstance) {
    try {
      livePlayerInstance.stop()
    } catch (err) {
      // Log cleanup errors for debugging, but don't throw
      console.warn('Error while stopping live player:', err)
    }
    livePlayerInstance = null
  }
  livePlayerLoading.value = false
  livePlayerConnected.value = false
}

// Clean up all players
function destroyAllPlayers() {
  destroyLivePlayer()
}

// Handle video element errors
function handleVideoError() {
  modalError.value = 'Video playback error occurred'
  livePlayerConnected.value = false
}

// Open the live preview modal for a feed
async function openFeedPreview(feed: Feed, mode: PlayerMode = 'preview') {
  // Clear any previous modal error
  modalError.value = null

  // Validate mode is supported for this feed
  if (mode === 'preview' && !isPreviewFeed(feed)) {
    error.value = 'This feed does not support preview mode'
    return
  }
  if (mode === 'live' && !supportsLiveSdk(feed)) {
    error.value = 'This feed does not support Live SDK'
    return
  }

  // For preview mode, initialize media session
  if (mode === 'preview') {
    const initialized = await initializeMediaSession()
    if (!initialized) {
      error.value = mediaSessionError.value || 'Failed to initialize media session'
      return
    }
  }

  playerMode.value = mode
  selectedFeed.value = feed
  showModal.value = true

  // For live mode, initialize player after modal is shown
  if (mode === 'live') {
    await nextTick()
    await initLivePlayer(feed)
  }
}

// Close the modal
function closeModal() {
  destroyAllPlayers()
  showModal.value = false
  selectedFeed.value = null
  playerMode.value = 'preview'
}

// Handle clicking outside the modal to close it
function handleModalBackdropClick(event: Event) {
  if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
    closeModal()
  }
}

// Handle escape key to close modal
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && showModal.value) {
    closeModal()
  }
}

onMounted(() => {
  loadCameras()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  isMounted.value = false
  // Cancel any in-flight request on unmount
  if (abortController) {
    abortController.abort()
  }
  // Clean up all players
  destroyAllPlayers()
  // Remove keydown listener
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="feeds-view">
    <h2>Camera Feeds</h2>

    <div v-if="loading" class="loading">
      <p>Loading cameras...</p>
    </div>

    <div v-else-if="error && cameras.length === 0" class="error-state">
      <p class="error">{{ error }}</p>
      <button @click="loadCameras">Retry</button>
    </div>

    <div v-else-if="cameras.length === 0" class="no-cameras">
      <p>No cameras found in your account.</p>
    </div>

    <div v-else class="feeds-content">
      <div class="camera-selector">
        <label for="camera-select">Select Camera:</label>
        <select
          id="camera-select"
          :value="selectedCameraId"
          @change="handleCameraChange"
          data-testid="camera-select"
          aria-label="Select a camera to view its feeds"
        >
          <option v-for="camera in cameras" :key="camera.id" :value="camera.id">
            {{ camera.name || camera.id }}
          </option>
        </select>
        <button
          @click="fetchFeeds"
          :disabled="loadingFeeds"
          data-testid="refresh-button"
          aria-label="Refresh feeds list"
        >
          Refresh
        </button>
      </div>

      <div v-if="error" class="error-banner">
        <p class="error">{{ error }}</p>
      </div>

      <div class="feeds-list" data-testid="feeds-list">
        <div v-if="loadingFeeds" class="loading">
          <p>Loading feeds...</p>
        </div>

        <div v-else-if="feeds.length === 0" class="no-feeds">
          <p>No feeds available for this camera.</p>
        </div>

        <table v-else class="feeds-table" data-testid="feeds-table">
          <thead>
            <tr>
              <th>Feed ID</th>
              <th>Type</th>
              <th>Media Type</th>
              <th>Available URLs</th>
              <th>Preview</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="feed in feeds" :key="feed.id" data-testid="feed-row">
              <td data-testid="feed-id">{{ feed.id }}</td>
              <td data-testid="feed-type">
                <span :class="['type-badge', `type-${feed.type}`]">
                  {{ feed.type }}
                </span>
              </td>
              <td data-testid="feed-media-type">{{ feed.mediaType }}</td>
              <td data-testid="feed-urls">
                <span v-if="getAvailableUrls(feed).length > 0" class="url-list">
                  {{ getAvailableUrls(feed).join(', ') }}
                </span>
                <span v-else class="no-urls">None</span>
              </td>
              <td data-testid="feed-preview">
                <div class="button-group-cell">
                  <!-- Preview button for preview feeds -->
                  <button
                    v-if="isPreviewFeed(feed)"
                    @click="openFeedPreview(feed, 'preview')"
                    class="view-button"
                    data-testid="view-preview-button"
                    title="Multipart preview stream"
                  >
                    View
                  </button>
                  <!-- Live SDK button for main feeds -->
                  <button
                    v-if="supportsLiveSdk(feed)"
                    @click="openFeedPreview(feed, 'live')"
                    class="view-button live-button"
                    data-testid="view-live-button"
                    title="Live Video SDK (WebCodecs)"
                  >
                    Live
                  </button>
                  <span v-if="!isPreviewFeed(feed) && !supportsLiveSdk(feed)" class="no-preview">-</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="feeds.length > 0" class="feeds-summary" data-testid="feeds-summary">
        <small>Total feeds: {{ feeds.length }}</small>
      </div>
    </div>

    <div class="navigation">
      <router-link to="/">
        <button>Back to Home</button>
      </router-link>
      <router-link to="/logout">
        <button>Logout</button>
      </router-link>
    </div>

    <!-- Live Preview Modal -->
    <div
      v-if="showModal && selectedFeed"
      class="modal-overlay"
      @click="handleModalBackdropClick"
      data-testid="preview-modal"
    >
      <div class="modal-content">
        <div class="modal-header">
          <h3>
            <template v-if="playerMode === 'live'">Live Stream (SDK)</template>
```

---

## Reference Examples

- `examples/vue-media/` - Live and recorded images, HLS
- `examples/vue-feeds/` - Preview and main streams
