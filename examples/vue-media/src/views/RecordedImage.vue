<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { getCameras, getRecordedImage } from 'een-api-toolkit'
import type { Camera, GetRecordedImageParams } from 'een-api-toolkit'
import { useSelectedCamera } from '../composables/useSelectedCamera'

// Constants
const ONE_HOUR_MS = 60 * 60 * 1000

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
  const date = new Date(Date.now() - ONE_HOUR_MS)
  return formatDateTimeLocal(date)
}

function formatDateTimeLocal(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
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
    return new Date(timestamp).toLocaleString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
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

/**
 * Reset the time picker to the current time
 */
function resetToNow() {
  selectedDateTime.value = formatDateTimeLocal(new Date())
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

/**
 * Clear all image-related state
 */
function clearImageState() {
  imageData.value = null
  imageTimestamp.value = null
  nextToken.value = null
  prevToken.value = null
}

/**
 * Core image fetching function - handles loading state, race conditions, and error handling
 */
async function _fetchImage(params: GetRecordedImageParams) {
  const requestId = ++currentRequestId
  loadingImage.value = true
  error.value = null

  const result = await getRecordedImage(params)

  // Check if component is still mounted and this is still the current request
  if (!isMounted.value || requestId !== currentRequestId) {
    return
  }

  loadingImage.value = false

  if (result.error) {
    error.value = result.error.message
    // Clear stale data on error to avoid showing outdated image
    clearImageState()
    return
  }

  if (result.data) {
    imageData.value = result.data.imageData
    imageTimestamp.value = result.data.timestamp
    nextToken.value = result.data.nextToken
    prevToken.value = result.data.prevToken
    updateTimePickerFromImage()
  } else {
    // Handle successful responses that don't contain an image
    clearImageState()
  }
}

async function fetchImageFromPicker() {
  if (!selectedCameraId.value) return

  const timestamp = toApiTimestamp(selectedDateTime.value)
  await _fetchImage({
    deviceId: selectedCameraId.value,
    type: 'preview',
    timestamp__gte: timestamp
  })
}

async function navigatePrev() {
  if (!prevToken.value) return
  await _fetchImage({ pageToken: prevToken.value })
}

async function navigateNext() {
  if (!nextToken.value) return
  await _fetchImage({ pageToken: nextToken.value })
}

/**
 * Handle camera selection change with proper race condition handling
 */
async function selectCamera(cameraId: string) {
  if (!isMounted.value) return

  setSelectedCamera(cameraId)
  clearImageState()
  error.value = null
  await fetchImageFromPicker()
}

/**
 * Typed event handler for camera select change
 */
function handleCameraChange(event: Event) {
  const target = event.target as HTMLSelectElement | null
  if (target?.value) {
    selectCamera(target.value)
  }
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
    <h2>Recorded Images (Preview)</h2>

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
          @change="handleCameraChange"
          data-testid="camera-select"
          aria-label="Select a camera to view recorded images"
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
          step="1"
          v-model="selectedDateTime"
          data-testid="datetime-input"
          aria-label="Select date and time for recorded image"
        />
        <button
          @click="fetchImageFromPicker"
          :disabled="loadingImage"
          data-testid="go-button"
          aria-label="Load image from selected time"
        >
          Go
        </button>
        <button
          @click="resetToNow"
          data-testid="now-button"
          aria-label="Reset to current time"
        >
          Now
        </button>
      </div>

      <div class="controls">
        <button
          @click="navigatePrev"
          :disabled="loadingImage || !prevToken"
          data-testid="prev-button"
          aria-label="Go to previous recorded image"
        >
          ← Previous
        </button>
        <button
          @click="navigateNext"
          :disabled="loadingImage || !nextToken"
          data-testid="next-button"
          aria-label="Go to next recorded image"
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
