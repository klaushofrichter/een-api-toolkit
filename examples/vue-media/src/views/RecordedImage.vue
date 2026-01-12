<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { getCameras, getRecordedImage } from 'een-api-toolkit'
import type { Camera, GetRecordedImageParams } from 'een-api-toolkit'
import { useSelectedCamera } from '../composables/useSelectedCamera'
import { useSelectedDateTime } from '../composables/useSelectedDateTime'
import { toApiTimestamp, formatTimestampLocale, formatTimestampUtc } from '../utils/timestamp'

const cameras = ref<Camera[]>([])
const { selectedCameraId, setSelectedCamera } = useSelectedCamera()
const { selectedDateTime, formatDateTimeLocal } = useSelectedDateTime()

// Preview image state
const imageData = ref<string | null>(null)
const imageTimestamp = ref<string | null>(null)
const imageResolution = ref<string | null>(null)
const loading = ref(true)
const loadingImage = ref(false)
const error = ref<string | null>(null)

// Main image state
const mainImageData = ref<string | null>(null)
const mainImageTimestamp = ref<string | null>(null)
const mainImageResolution = ref<string | null>(null)
const mainImageError = ref<string | null>(null)
const loadingMainImage = ref(false)

// Navigation tokens
const nextToken = ref<string | null>(null)
const prevToken = ref<string | null>(null)

// Track component lifecycle to prevent memory leaks
const isMounted = ref(true)

// Track current request to handle race conditions
let currentRequestId = 0

/**
 * Get image dimensions from a base64 image string
 */
function getImageResolution(base64Data: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      resolve(`${img.width}x${img.height}`)
    }
    img.onerror = () => {
      resolve('')
    }
    img.src = base64Data
  })
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
 * Reset the time picker to the current time and fetch the image
 */
async function resetToNow() {
  selectedDateTime.value = formatDateTimeLocal(new Date())
  await fetchImageFromPicker()
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
  imageResolution.value = null
  nextToken.value = null
  prevToken.value = null
  clearMainImageState()
}

/**
 * Clear main image state
 */
function clearMainImageState() {
  mainImageData.value = null
  mainImageTimestamp.value = null
  mainImageResolution.value = null
  mainImageError.value = null
}

/**
 * Fetch main image for the given timestamp
 */
async function fetchMainImage(timestamp: string, deviceId: string) {
  loadingMainImage.value = true
  mainImageError.value = null

  const result = await getRecordedImage({
    deviceId,
    type: 'main',
    timestamp__gte: timestamp
  })

  if (!isMounted.value) return

  loadingMainImage.value = false

  if (result.error) {
    mainImageData.value = null
    mainImageTimestamp.value = null
    mainImageResolution.value = null
    mainImageError.value = result.error.message
    return
  }

  if (result.data) {
    mainImageData.value = result.data.imageData
    mainImageTimestamp.value = result.data.timestamp
    // Get image resolution
    mainImageResolution.value = await getImageResolution(result.data.imageData)
  } else {
    mainImageData.value = null
    mainImageTimestamp.value = null
    mainImageResolution.value = null
    mainImageError.value = 'No main image available'
  }
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
    // Get image resolution
    imageResolution.value = await getImageResolution(result.data.imageData)
    updateTimePickerFromImage()

    // Also fetch main image using the preview image's timestamp
    if (result.data.timestamp && selectedCameraId.value) {
      fetchMainImage(result.data.timestamp, selectedCameraId.value)
    }
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
    <h2>Recorded Image (Preview and Main)</h2>

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

        <div v-else-if="imageData" class="preview-image-container">
          <img
            :src="imageData"
            alt="Recorded camera image"
            class="recorded-image-display"
            data-testid="recorded-image"
          />
          <div v-if="imageTimestamp" class="timestamp" data-testid="timestamp">
            <small>Preview Image Timestamp: {{ formatTimestampLocale(imageTimestamp) }}<span v-if="imageResolution"> - {{ imageResolution }}</span></small>
          </div>
        </div>

        <div v-else class="no-image">
          <p>Select a time to view recorded images</p>
        </div>
      </div>

      <!-- Main Image Section -->
      <div v-if="imageData" class="main-image-section" data-testid="main-image-section">
        <div v-if="loadingMainImage" class="main-image-loading">
          <p>Loading main image...</p>
        </div>

        <div v-else-if="mainImageError" class="main-image-error" data-testid="main-image-error">
          <p class="error-note">{{ mainImageError }}</p>
          <p class="error-explanation">
            This may be expected - main quality images are not always available for all time periods.
            The camera may only store preview quality images for older recordings.
          </p>
        </div>

        <div v-else-if="mainImageData" class="main-image-container" data-testid="main-image-container">
          <img
            :src="mainImageData"
            alt="Main quality recorded camera image"
            class="main-image-display"
            data-testid="main-image"
          />
          <div v-if="mainImageTimestamp" class="timestamp">
            <small>Main Image Timestamp: {{ formatTimestampLocale(mainImageTimestamp) }}<span v-if="mainImageResolution"> - {{ mainImageResolution }}</span></small>
          </div>
        </div>
      </div>

      <!-- UTC Timestamp at bottom -->
      <div v-if="imageTimestamp" class="utc-section" data-testid="utc-timestamp">
        <small>Timestamp for API (UTC): <span class="utc-timestamp">{{ formatTimestampUtc(imageTimestamp) }}</span></small>
      </div>
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

.preview-image-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
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

.utc-timestamp {
  font-family: monospace;
  color: #888;
}

.error {
  color: #dc3545;
}

.main-image-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ddd;
}

.utc-section {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #ddd;
  text-align: center;
  color: #666;
}

.main-image-loading {
  text-align: center;
  padding: 20px;
  color: #666;
}

.main-image-error {
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
}

.main-image-error .error-note {
  color: #856404;
  font-weight: bold;
  margin-bottom: 8px;
}

.main-image-error .error-explanation {
  color: #856404;
  font-size: 0.9em;
  margin: 0;
}

.main-image-container {
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.main-image-display {
  max-width: 100%;
  max-height: 500px;
  object-fit: contain;
}
</style>
