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

<style scoped>
.live-camera {
  max-width: 800px;
  margin: 0 auto;
}

h2 {
  margin-bottom: 20px;
  text-align: center;
}

.loading,
.error-state,
.no-cameras {
  text-align: center;
  padding: 40px;
}

.camera-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.camera-selector label {
  font-weight: bold;
}

.camera-selector select {
  flex: 1;
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.controls {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.controls button {
  padding: 8px 16px;
}

.error-banner {
  margin-bottom: 15px;
}

.image-container {
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 8px;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.image-loading,
.no-image {
  text-align: center;
  color: #666;
}

.live-image {
  max-width: 100%;
  max-height: 500px;
  object-fit: contain;
}

.timestamp {
  margin-top: 10px;
  text-align: center;
  color: #666;
}

.utc-timestamp {
  font-family: monospace;
  color: #888;
}

.error {
  color: #dc3545;
}
</style>
