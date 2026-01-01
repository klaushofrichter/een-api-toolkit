<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { getCameras, listFeeds } from 'een-api-toolkit'
import type { Camera, Feed } from 'een-api-toolkit'

const cameras = ref<Camera[]>([])
const selectedCameraId = ref<string | null>(null)
const feeds = ref<Feed[]>([])
const loading = ref(true)
const loadingFeeds = ref(false)
const error = ref<string | null>(null)

// Track component lifecycle to prevent memory leaks
const isMounted = ref(true)

// Track current request to handle race conditions
let currentRequestId = 0

// AbortController for cancelling in-flight requests
let abortController: AbortController | null = null

// URL field labels for display (data-driven approach)
const URL_LABELS: Partial<Record<keyof Feed, string>> = {
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
    include: ['hlsUrl', 'multipartUrl', 'flvUrl', 'rtspUrl']
  })

  // Check if component is still mounted and this is the current request
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
    selectCamera(target.value)
  }
}

function getAvailableUrls(feed: Feed): string[] {
  return (Object.keys(URL_LABELS) as (keyof Feed)[])
    .filter(key => feed[key])
    .map(key => URL_LABELS[key]!)
}

onMounted(() => {
  loadCameras()
})

onUnmounted(() => {
  isMounted.value = false
  // Cancel any in-flight request on unmount
  if (abortController) {
    abortController.abort()
  }
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
</style>
