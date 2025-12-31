<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { getCameras, getLiveImage } from 'een-api-toolkit'
import type { Camera, LiveImageResult } from 'een-api-toolkit'

const cameras = ref<Camera[]>([])
const selectedCameraId = ref<string | null>(null)
const imageData = ref<string | null>(null)
const imageTimestamp = ref<string | null>(null)
const loading = ref(true)
const loadingImage = ref(false)
const error = ref<string | null>(null)
const refreshInterval = ref<ReturnType<typeof setInterval> | null>(null)
const autoRefresh = ref(true)

async function loadCameras() {
  loading.value = true
  error.value = null

  const result = await getCameras()

  if (result.error) {
    error.value = result.error.message
    loading.value = false
    return
  }

  cameras.value = result.data?.results || []
  loading.value = false

  // Auto-select first camera if available
  if (cameras.value.length > 0 && !selectedCameraId.value) {
    selectedCameraId.value = cameras.value[0].id
    await fetchLiveImage()
  }
}

async function fetchLiveImage() {
  if (!selectedCameraId.value) return

  loadingImage.value = true

  const result = await getLiveImage({ deviceId: selectedCameraId.value })

  if (result.error) {
    error.value = result.error.message
    loadingImage.value = false
    return
  }

  const data = result.data as LiveImageResult
  imageData.value = data.imageData
  imageTimestamp.value = data.timestamp
  loadingImage.value = false
}

async function selectCamera(cameraId: string) {
  selectedCameraId.value = cameraId
  imageData.value = null
  error.value = null
  await fetchLiveImage()
}

function startAutoRefresh() {
  if (refreshInterval.value) return

  refreshInterval.value = setInterval(() => {
    if (autoRefresh.value && selectedCameraId.value) {
      fetchLiveImage()
    }
  }, 5000) // Refresh every 5 seconds
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
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
}

function formatTimestamp(timestamp: string | null): string {
  if (!timestamp) return 'N/A'
  try {
    return new Date(timestamp).toLocaleString()
  } catch {
    return timestamp
  }
}

onMounted(() => {
  loadCameras()
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<template>
  <div class="live-camera">
    <h2>Live Camera View</h2>

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
        <small>Timestamp: {{ formatTimestamp(imageTimestamp) }}</small>
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

.navigation {
  margin-top: 30px;
  display: flex;
  gap: 10px;
  justify-content: center;
}

.error {
  color: #dc3545;
}
</style>
