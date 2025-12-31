<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { getCameras, getRecordedImage } from 'een-api-toolkit'
import type { Camera } from 'een-api-toolkit'
import { useSelectedCamera } from '../composables/useSelectedCamera'

const cameras = ref<Camera[]>([])
const { selectedCameraId, setSelectedCamera } = useSelectedCamera()
const imageData = ref<string | null>(null)
const imageTimestamp = ref<string | null>(null)
const loading = ref(true)
const loadingImage = ref(false)
const error = ref<string | null>(null)

// Navigation tokens
const nextToken = ref<string | null>(null)
const prevToken = ref<string | null>(null)

// Track component lifecycle to prevent memory leaks
const isMounted = ref(true)

// Track current request to handle race conditions
let currentRequestId = 0

// Time picker state - default to 1 hour ago
const selectedDateTime = ref(getDefaultDateTime())

function getDefaultDateTime(): string {
  const date = new Date(Date.now() - 3600000) // 1 hour ago
  return formatDateTimeLocal(date)
}

function formatDateTimeLocal(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

/**
 * Convert a datetime-local input value to ISO 8601 format with timezone offset.
 * The EEN API requires format like: 2025-12-30T07:57:37.000+00:00
 */
function toApiTimestamp(dateTimeLocalValue: string): string {
  const date = new Date(dateTimeLocalValue)

  const offsetMinutes = date.getTimezoneOffset()
  const offsetSign = offsetMinutes <= 0 ? '+' : '-'
  const offsetHours = String(Math.floor(Math.abs(offsetMinutes) / 60)).padStart(2, '0')
  const offsetMins = String(Math.abs(offsetMinutes) % 60).padStart(2, '0')
  const offset = `${offsetSign}${offsetHours}:${offsetMins}`

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000${offset}`
}

function formatTimestamp(timestamp: string | null): string {
  if (!timestamp) return 'N/A'
  try {
    return new Date(timestamp).toLocaleString()
  } catch {
    return timestamp
  }
}

/**
 * Update the time picker to reflect the current image timestamp
 */
function updateTimePickerFromImage() {
  if (imageTimestamp.value) {
    try {
      const date = new Date(imageTimestamp.value)
      selectedDateTime.value = formatDateTimeLocal(date)
    } catch {
      // Keep current value if parsing fails
    }
  }
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

  // Use shared camera if valid, otherwise auto-select first camera
  if (cameras.value.length > 0) {
    const isValidCamera = selectedCameraId.value &&
      cameras.value.some(c => c.id === selectedCameraId.value)
    if (!isValidCamera) {
      setSelectedCamera(cameras.value[0].id)
    }
    await fetchImageFromPicker()
  }
}

async function fetchImageFromPicker() {
  if (!selectedCameraId.value) return

  const requestId = ++currentRequestId
  const cameraId = selectedCameraId.value

  loadingImage.value = true
  error.value = null

  const timestamp = toApiTimestamp(selectedDateTime.value)

  const result = await getRecordedImage({
    deviceId: cameraId,
    type: 'preview',
    timestamp__gte: timestamp
  })

  if (!isMounted.value || requestId !== currentRequestId) {
    return
  }

  if (result.error) {
    error.value = result.error.message
    loadingImage.value = false
    return
  }

  if (result.data) {
    imageData.value = result.data.imageData
    imageTimestamp.value = result.data.timestamp
    nextToken.value = result.data.nextToken
    prevToken.value = result.data.prevToken
    updateTimePickerFromImage()
  }
  loadingImage.value = false
}

async function navigatePrev() {
  if (!prevToken.value) return

  const requestId = ++currentRequestId
  loadingImage.value = true
  error.value = null

  const result = await getRecordedImage({
    pageToken: prevToken.value
  })

  if (!isMounted.value || requestId !== currentRequestId) {
    return
  }

  if (result.error) {
    error.value = result.error.message
    loadingImage.value = false
    return
  }

  if (result.data) {
    imageData.value = result.data.imageData
    imageTimestamp.value = result.data.timestamp
    nextToken.value = result.data.nextToken
    prevToken.value = result.data.prevToken
    updateTimePickerFromImage()
  }
  loadingImage.value = false
}

async function navigateNext() {
  if (!nextToken.value) return

  const requestId = ++currentRequestId
  loadingImage.value = true
  error.value = null

  const result = await getRecordedImage({
    pageToken: nextToken.value
  })

  if (!isMounted.value || requestId !== currentRequestId) {
    return
  }

  if (result.error) {
    error.value = result.error.message
    loadingImage.value = false
    return
  }

  if (result.data) {
    imageData.value = result.data.imageData
    imageTimestamp.value = result.data.timestamp
    nextToken.value = result.data.nextToken
    prevToken.value = result.data.prevToken
    updateTimePickerFromImage()
  }
  loadingImage.value = false
}

async function selectCamera(cameraId: string) {
  setSelectedCamera(cameraId)
  imageData.value = null
  error.value = null
  nextToken.value = null
  prevToken.value = null
  await fetchImageFromPicker()
}

onMounted(() => {
  loadCameras()
})

onUnmounted(() => {
  isMounted.value = false
})
</script>

<template>
  <div class="recorded-image">
    <h2>Recorded Images</h2>

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

      <div class="time-picker">
        <label for="datetime-input">Select Date/Time:</label>
        <input
          id="datetime-input"
          type="datetime-local"
          v-model="selectedDateTime"
          data-testid="datetime-input"
        />
        <button @click="fetchImageFromPicker" :disabled="loadingImage" data-testid="go-button">
          Go
        </button>
      </div>

      <div class="controls">
        <button
          @click="navigatePrev"
          :disabled="loadingImage || !prevToken"
          data-testid="prev-button"
        >
          ← Previous
        </button>
        <button
          @click="navigateNext"
          :disabled="loadingImage || !nextToken"
          data-testid="next-button"
        >
          Next →
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
          alt="Recorded camera image"
          class="recorded-image-display"
          data-testid="recorded-image"
        />

        <div v-else class="no-image">
          <p>Select a time to view recorded images</p>
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
      <router-link to="/live">
        <button>View Live Camera</button>
      </router-link>
      <router-link to="/logout">
        <button>Logout</button>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.recorded-image {
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

.time-picker {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.time-picker label {
  font-weight: bold;
}

.time-picker input {
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.time-picker button {
  padding: 8px 16px;
}

.controls {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.controls button {
  padding: 8px 16px;
}

.controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.recorded-image-display {
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
  flex-wrap: wrap;
}

.error {
  color: #dc3545;
}
</style>
