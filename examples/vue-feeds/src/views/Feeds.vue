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
            <template v-else>Live Preview</template>
          </h3>
          <button @click="closeModal" class="close-button" aria-label="Close modal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="feed-info">
            <p><strong>Feed ID:</strong> {{ selectedFeed.id }}</p>
            <p><strong>Type:</strong> {{ selectedFeed.type }}</p>
            <p><strong>Device:</strong> {{ selectedFeed.deviceId }}</p>
            <p><strong>Mode:</strong>
              <span :class="['mode-badge', `mode-${playerMode}`]">{{ playerMode.toUpperCase() }}</span>
            </p>
          </div>
          <div v-if="modalError" class="modal-error">
            <p class="error">{{ modalError }}</p>
          </div>
          <div class="preview-container">
            <!-- Loading overlay for Live SDK -->
            <div v-if="playerMode === 'live' && livePlayerLoading" class="loading-overlay">
              <div class="spinner"></div>
              <p>Loading live stream...</p>
            </div>
            <!-- Video Player for Live SDK mode -->
            <video
              v-if="playerMode === 'live'"
              ref="videoRef"
              class="preview-video"
              controls
              autoplay
              muted
              playsinline
              data-testid="preview-video"
              @error="handleVideoError"
            />
            <!-- Multipart Image for preview mode -->
            <img
              v-else-if="playerMode === 'preview' && selectedFeed.multipartUrl"
              :src="selectedFeed.multipartUrl"
              alt="Live camera preview"
              class="preview-image"
              data-testid="preview-image"
            />
          </div>
          <p class="preview-note">
            <template v-if="playerMode === 'live'">
              Using Live Video SDK with WebCodecs.
              <span v-if="livePlayerConnected" class="status-connected">Connected</span>
              <span v-else-if="!livePlayerLoading" class="status-disconnected">Disconnected</span>
            </template>
            <template v-else>
              Using multipart URL with media session cookie for authentication.
            </template>
          </p>
        </div>
        <div class="modal-footer">
          <button @click="closeModal" class="close-modal-button">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.feeds-view {
  max-width: 900px;
  margin: 0 auto;
}

h2 {
  margin-bottom: 20px;
  text-align: center;
}

.loading,
.error-state,
.no-cameras,
.no-feeds {
  text-align: center;
  padding: 40px;
}

.camera-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.camera-selector label {
  font-weight: bold;
}

.camera-selector select {
  flex: 1;
  min-width: 200px;
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.camera-selector button {
  padding: 8px 16px;
}

.error-banner {
  margin-bottom: 15px;
}

.feeds-list {
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 8px;
  min-height: 200px;
  overflow: hidden;
}

.feeds-table {
  width: 100%;
  border-collapse: collapse;
}

.feeds-table th,
.feeds-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.feeds-table th {
  background: #e9ecef;
  font-weight: 600;
  color: #2c3e50;
}

.feeds-table tbody tr:hover {
  background: #f0f0f0;
}

.feeds-table tbody tr:last-child td {
  border-bottom: none;
}

.type-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.type-main {
  background: #3498db;
  color: white;
}

.type-preview {
  background: #27ae60;
  color: white;
}

.type-talkdown {
  background: #9b59b6;
  color: white;
}

.url-list {
  color: #27ae60;
  font-size: 13px;
}

.no-urls {
  color: #999;
  font-style: italic;
}

.feeds-summary {
  margin-top: 10px;
  text-align: right;
  color: #666;
}

.navigation {
  margin-top: 30px;
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.error {
  color: #dc3545;
}

/* View button */
.button-group-cell {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.view-button {
  padding: 4px 8px;
  font-size: 11px;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.view-button:hover {
  background: #219a52;
}

.view-button.live-button {
  background: #9b59b6;
}

.view-button.live-button:hover {
  background: #8e44ad;
}

.no-preview {
  color: #999;
}

/* Mode badge in modal */
.mode-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.mode-preview {
  background: #27ae60;
  color: white;
}

.mode-live {
  background: #9b59b6;
  color: white;
}

/* Status indicators */
.status-connected {
  color: #27ae60;
  font-weight: 600;
  margin-left: 8px;
}

.status-disconnected {
  color: #e74c3c;
  font-weight: 600;
  margin-left: 8px;
}

/* Loading overlay */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  z-index: 10;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 800px;
  max-height: 90vh;
  width: 90%;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #ddd;
  background: #f8f9fa;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  line-height: 1;
}

.close-button:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  max-height: calc(90vh - 150px);
}

.feed-info {
  margin-bottom: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
}

.feed-info p {
  margin: 5px 0;
  font-size: 14px;
  color: #333;
}

.modal-error {
  margin-bottom: 15px;
  padding: 10px 15px;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
}

.modal-error .error {
  margin: 0;
  font-size: 14px;
}

.preview-container {
  position: relative;
  background: #000;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.preview-image,
.preview-video {
  max-width: 100%;
  max-height: 500px;
  height: auto;
  display: block;
}

.preview-video {
  width: 100%;
  background: #000;
}

.preview-note {
  margin-top: 15px;
  font-size: 12px;
  color: #666;
  text-align: center;
  font-style: italic;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #ddd;
  background: #f8f9fa;
  text-align: right;
}

.close-modal-button {
  padding: 8px 20px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.close-modal-button:hover {
  background: #5a6268;
}
</style>
