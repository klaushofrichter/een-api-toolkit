<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { listAlerts, listAlertTypes, getAlert, getRecordedImage, type Camera, type Alert, type AlertType, type EenError } from 'een-api-toolkit'
import { useHlsPlayer } from '../composables/useHlsPlayer'

// Initialize HLS player composable
// Note: videoRef is not destructured - accessed as hlsPlayer.videoRef in template
const hlsPlayer = useHlsPlayer()
const { videoUrl, videoError, loadingVideo, loadVideo, resetVideo } = hlsPlayer

const props = defineProps<{
  camera: Camera | null
  timeRange: string
}>()

const alerts = ref<Alert[]>([])
const alertTypes = ref<AlertType[]>([])
const selectedAlertType = ref<string>('')
const loadingAlertTypes = ref(false)
const loading = ref(false)
const loadingMore = ref(false)
const error = ref<EenError | null>(null)
const nextPageToken = ref<string | undefined>(undefined)

// Modal state
const showModal = ref(false)
const selectedAlert = ref<Alert | null>(null)
const loadingDetails = ref(false)
const detailsError = ref<EenError | null>(null)

// Lightbox state
const showLightbox = ref(false)
const lightboxImageUrl = ref<string | null>(null)
const loadingImage = ref(false)
const imageError = ref<string | null>(null)

// Video state (showVideo controls lightbox mode, rest from composable)
const showVideo = ref(false)

// Check if alert has an httpsUrl in its data
// The data is an array, look for type "een.fullFrameImageUrl.v1"
const alertImageUrl = computed(() => {
  if (!selectedAlert.value?.data) return null
  const data = selectedAlert.value.data

  // Alert data is an array
  if (!Array.isArray(data)) return null

  // Find the object with type "een.fullFrameImageUrl.v1"
  const imageItem = data.find(
    (item: unknown) =>
      item &&
      typeof item === 'object' &&
      (item as Record<string, unknown>).type === 'een.fullFrameImageUrl.v1'
  ) as Record<string, unknown> | undefined

  if (imageItem && typeof imageItem.httpsUrl === 'string') {
    return imageItem.httpsUrl
  }

  return null
})

// Parse the image URL to extract parameters for getRecordedImage
function parseImageUrlParams(url: string): { deviceId: string; type: 'preview' | 'main'; timestamp: string } | null {
  try {
    const urlObj = new URL(url)
    const deviceId = urlObj.searchParams.get('deviceId')
    const type = urlObj.searchParams.get('type') as 'preview' | 'main'
    const timestamp = urlObj.searchParams.get('timestamp__gte')

    if (deviceId && type && timestamp) {
      return { deviceId, type, timestamp }
    }
    return null
  } catch {
    return null
  }
}

function getTimeRangeMs(range: string): number {
  switch (range) {
    case '1h': return 60 * 60 * 1000
    case '6h': return 6 * 60 * 60 * 1000
    case '24h': return 24 * 60 * 60 * 1000
    case '7d': return 7 * 24 * 60 * 60 * 1000
    default: return 24 * 60 * 60 * 1000
  }
}

function formatAlertType(type: string): string {
  // Convert "een.motionDetectionAlert.v1" to "Motion Detection Alert"
  const parts = type.split('.')
  if (parts.length >= 2) {
    const name = parts[1]
      .replace(/([A-Z])/g, ' $1')
      .trim()
    return name.charAt(0).toUpperCase() + name.slice(1)
  }
  return type
}

async function fetchAlertTypes() {
  loadingAlertTypes.value = true
  error.value = null
  alertTypes.value = []
  selectedAlertType.value = ''

  const result = await listAlertTypes({ pageSize: 100 })

  if (result.error) {
    error.value = result.error
    loadingAlertTypes.value = false
    return
  }

  alertTypes.value = result.data?.results ?? []
  loadingAlertTypes.value = false
}

async function fetchAlerts(append = false) {
  if (append) {
    loadingMore.value = true
  } else {
    loading.value = true
    alerts.value = []
    nextPageToken.value = undefined
  }
  error.value = null

  const params: Parameters<typeof listAlerts>[0] = {
    pageSize: 20,
    pageToken: append ? nextPageToken.value : undefined,
    include: ['description'],
    sort: ['-timestamp']
  }

  // Only apply time filter if a specific time range is selected (not 'none')
  if (props.timeRange !== 'none') {
    const now = new Date()
    const rangeMs = getTimeRangeMs(props.timeRange)
    const startTime = new Date(now.getTime() - rangeMs)
    params.timestamp__gte = startTime.toISOString()
    params.timestamp__lte = now.toISOString()
  }

  // Only filter by camera if a specific camera is selected
  if (props.camera?.id) {
    params.actorId__in = [props.camera.id]
  }

  // Add alert type filter if selected
  if (selectedAlertType.value) {
    params.alertType__in = [selectedAlertType.value]
  }

  const result = await listAlerts(params)

  if (result.error) {
    error.value = result.error
  } else {
    const newAlerts = result.data?.results ?? []
    if (append) {
      alerts.value = [...alerts.value, ...newAlerts]
    } else {
      alerts.value = newAlerts
    }
    nextPageToken.value = result.data?.nextPageToken
  }

  loading.value = false
  loadingMore.value = false
}

function handleAlertTypeChange() {
  fetchAlerts()
}

function loadMore() {
  if (nextPageToken.value) {
    fetchAlerts(true)
  }
}

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleString()
}

function getPriorityClass(priority?: number): string {
  if (priority === undefined) return ''
  if (priority >= 15) return 'priority-high'
  if (priority >= 10) return 'priority-medium'
  return 'priority-low'
}

async function handleAlertClick(alert: Alert) {
  showModal.value = true
  loadingDetails.value = true
  detailsError.value = null
  selectedAlert.value = null

  const result = await getAlert(alert.id, {
    include: ['data', 'actions', 'description', 'dataSchemas']
  })

  if (result.error) {
    detailsError.value = result.error
  } else {
    selectedAlert.value = result.data
  }

  loadingDetails.value = false
}

function closeModal() {
  showModal.value = false
  selectedAlert.value = null
  detailsError.value = null
}

async function handleImageClick(quality: 'preview' | 'main' = 'preview') {
  if (!alertImageUrl.value) return

  loadingImage.value = true
  imageError.value = null
  lightboxImageUrl.value = null
  showLightbox.value = true

  // Parse the URL to extract parameters
  const params = parseImageUrlParams(alertImageUrl.value)
  if (!params) {
    imageError.value = 'Invalid image URL format'
    loadingImage.value = false
    return
  }

  // Use the toolkit's getRecordedImage function
  const result = await getRecordedImage({
    deviceId: params.deviceId,
    type: quality,
    timestamp__gte: params.timestamp
  })

  if (result.error) {
    imageError.value = result.error.message
  } else if (result.data?.imageData) {
    lightboxImageUrl.value = result.data.imageData
  } else {
    imageError.value = 'No image data returned'
  }

  loadingImage.value = false
}

function closeLightbox() {
  showLightbox.value = false
  lightboxImageUrl.value = null
  imageError.value = null
  // Also cleanup video if it was playing
  resetVideo()
  showVideo.value = false
}

async function handleVideoClick() {
  if (!alertImageUrl.value) return

  // Parse the URL to extract parameters
  const params = parseImageUrlParams(alertImageUrl.value)
  if (!params) {
    return
  }

  showVideo.value = true
  showLightbox.value = true

  // Use the composable to load and play video
  await loadVideo(params.deviceId, params.timestamp)
}

// Debounce delay for filter changes (ms)
const DEBOUNCE_DELAY = 300

// Debounce timer reference
let debounceTimer: ReturnType<typeof setTimeout> | null = null

// Debounced fetch to avoid rapid API calls on quick filter changes
function debouncedFetchAlerts() {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  debounceTimer = setTimeout(() => {
    fetchAlerts()
    debounceTimer = null
  }, DEBOUNCE_DELAY)
}

// Fetch alert types once on mount
fetchAlertTypes()

// Fetch alerts when camera or time range changes (debounced)
watch(
  () => [props.camera?.id, props.timeRange],
  (_newVal, oldVal) => {
    // Immediate fetch on first load (when oldVal is undefined)
    if (oldVal === undefined) {
      fetchAlerts()
    } else {
      debouncedFetchAlerts()
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="alerts-list" data-testid="alerts-list">
    <div class="alert-type-selector" data-testid="alert-type-selector">
      <label for="alert-type-select">Alert Type:</label>
      <select
        id="alert-type-select"
        v-model="selectedAlertType"
        @change="handleAlertTypeChange"
        :disabled="loadingAlertTypes"
        data-testid="alert-type-select"
      >
        <option value="">
          {{ loadingAlertTypes ? 'Loading...' : 'All Alert Types' }}
        </option>
        <option
          v-for="at in alertTypes"
          :key="at.type"
          :value="at.type"
          data-testid="alert-type-option"
        >
          {{ formatAlertType(at.type) }}
        </option>
      </select>
    </div>

    <div v-if="loading" class="loading" data-testid="alerts-loading">
      Loading alerts...
    </div>
    <div v-else-if="error" class="error" data-testid="alerts-error">
      {{ error.message }}
    </div>
    <div v-else-if="alerts.length === 0" class="no-data" data-testid="alerts-no-data">
      No alerts found for this time range.
    </div>
    <div v-else>
      <div
        v-for="alert in alerts"
        :key="alert.id"
        class="alert-item clickable"
        data-testid="alert-item"
        @click="handleAlertClick(alert)"
      >
        <div class="alert-header">
          <span class="alert-type">{{ alert.alertType?.split('.')[1] || alert.alertType }}</span>
          <span
            v-if="alert.priority !== undefined"
            class="priority-badge"
            :class="getPriorityClass(alert.priority)"
          >
            P{{ alert.priority }}
          </span>
        </div>
        <div class="alert-time">{{ formatTime(alert.timestamp) }}</div>
        <div v-if="alert.description" class="alert-description">
          {{ alert.description }}
        </div>
      </div>

      <button
        v-if="nextPageToken"
        @click="loadMore"
        :disabled="loadingMore"
        class="load-more-button"
        data-testid="alerts-load-more"
      >
        {{ loadingMore ? 'Loading...' : 'Load More' }}
      </button>
    </div>

    <!-- Alert Details Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal" data-testid="alert-modal-overlay">
      <div class="modal-content" data-testid="alert-modal">
        <div class="modal-header">
          <h3>Alert Details</h3>
          <div class="modal-header-buttons">
            <button
              v-if="alertImageUrl"
              class="image-button"
              @click="handleImageClick('preview')"
              data-testid="alert-image-button"
            >
              Preview
            </button>
            <button
              v-if="alertImageUrl"
              class="image-button image-button-hd"
              @click="handleImageClick('main')"
              data-testid="alert-image-hd-button"
            >
              HD Image
            </button>
            <button
              v-if="alertImageUrl"
              class="image-button image-button-video"
              @click="handleVideoClick"
              data-testid="alert-video-button"
            >
              Video
            </button>
            <button class="close-button" @click="closeModal" data-testid="alert-modal-close">&times;</button>
          </div>
        </div>
        <div class="modal-body">
          <div v-if="loadingDetails" class="loading">Loading alert details...</div>
          <div v-else-if="detailsError" class="error">{{ detailsError.message }}</div>
          <div v-else-if="selectedAlert" class="alert-details">
            <div class="detail-row">
              <span class="detail-label">ID:</span>
              <span class="detail-value monospace">{{ selectedAlert.id }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Type:</span>
              <span class="detail-value">{{ formatAlertType(selectedAlert.alertType) }}</span>
            </div>
            <div v-if="selectedAlert.alertName" class="detail-row">
              <span class="detail-label">Name:</span>
              <span class="detail-value">{{ selectedAlert.alertName }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Timestamp:</span>
              <span class="detail-value">{{ formatTime(selectedAlert.timestamp) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Created:</span>
              <span class="detail-value">{{ formatTime(selectedAlert.createTimestamp) }}</span>
            </div>
            <div v-if="selectedAlert.priority !== undefined" class="detail-row">
              <span class="detail-label">Priority:</span>
              <span class="detail-value">
                <span class="priority-badge" :class="getPriorityClass(selectedAlert.priority)">
                  P{{ selectedAlert.priority }}
                </span>
              </span>
            </div>
            <div v-if="selectedAlert.category" class="detail-row">
              <span class="detail-label">Category:</span>
              <span class="detail-value">{{ selectedAlert.category }}</span>
            </div>
            <div v-if="selectedAlert.description" class="detail-row">
              <span class="detail-label">Description:</span>
              <span class="detail-value">{{ selectedAlert.description }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Actor ID:</span>
              <span class="detail-value monospace">{{ selectedAlert.actorId }}</span>
            </div>
            <div v-if="selectedAlert.actorName" class="detail-row">
              <span class="detail-label">Actor Name:</span>
              <span class="detail-value">{{ selectedAlert.actorName }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Actor Type:</span>
              <span class="detail-value">{{ selectedAlert.actorType }}</span>
            </div>
            <div v-if="selectedAlert.locationName" class="detail-row">
              <span class="detail-label">Location:</span>
              <span class="detail-value">{{ selectedAlert.locationName }}</span>
            </div>
            <div v-if="selectedAlert.eventId" class="detail-row">
              <span class="detail-label">Event ID:</span>
              <span class="detail-value monospace">{{ selectedAlert.eventId }}</span>
            </div>
            <div v-if="selectedAlert.ruleId" class="detail-row">
              <span class="detail-label">Rule ID:</span>
              <span class="detail-value monospace">{{ selectedAlert.ruleId }}</span>
            </div>
            <div v-if="selectedAlert.dataSchemas && selectedAlert.dataSchemas.length > 0" class="detail-row">
              <span class="detail-label">Data Schemas:</span>
              <span class="detail-value">{{ selectedAlert.dataSchemas.join(', ') }}</span>
            </div>
            <div v-if="selectedAlert.data && Object.keys(selectedAlert.data).length > 0" class="detail-section">
              <span class="detail-label">Data:</span>
              <pre class="detail-json">{{ JSON.stringify(selectedAlert.data, null, 2) }}</pre>
            </div>
            <div v-if="selectedAlert.actions && Object.keys(selectedAlert.actions).length > 0" class="detail-section">
              <span class="detail-label">Actions:</span>
              <pre class="detail-json">{{ JSON.stringify(selectedAlert.actions, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Image/Video Lightbox -->
    <div v-if="showLightbox" class="lightbox-overlay" @click.self="closeLightbox" data-testid="lightbox-overlay">
      <div class="lightbox-content" data-testid="lightbox">
        <button class="lightbox-close" @click="closeLightbox" data-testid="lightbox-close">&times;</button>
        <!-- Video mode -->
        <template v-if="showVideo">
          <div v-if="loadingVideo" class="lightbox-loading">Loading video...</div>
          <div v-else-if="videoError" class="lightbox-error">{{ videoError }}</div>
          <video
            v-else-if="videoUrl"
            :ref="(el) => hlsPlayer.videoRef.value = el as HTMLVideoElement | null"
            class="lightbox-video"
            controls
            autoplay
            muted
            playsinline
            data-testid="lightbox-video"
          />
        </template>
        <!-- Image mode -->
        <template v-else>
          <div v-if="loadingImage" class="lightbox-loading">Loading image...</div>
          <div v-else-if="imageError" class="lightbox-error">{{ imageError }}</div>
          <img
            v-else-if="lightboxImageUrl"
            :src="lightboxImageUrl"
            alt="Alert image"
            class="lightbox-image"
            data-testid="lightbox-image"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.alerts-list {
  min-height: 200px;
}

.alert-type-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.alert-type-selector label {
  font-weight: 500;
  font-size: 0.9rem;
}

.alert-type-selector select {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.85rem;
  min-width: 200px;
}

.alert-type-selector select:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.loading,
.no-data {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  color: #666;
  font-style: italic;
}

.error {
  color: #e74c3c;
  padding: 10px;
  background: #fdf2f2;
  border-radius: 4px;
}

.alert-item {
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 6px;
  margin-bottom: 10px;
  background: #fafafa;
}

.alert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.alert-type {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.priority-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.priority-high {
  background: #fde8e8;
  color: #c53030;
}

.priority-medium {
  background: #fef3c7;
  color: #92400e;
}

.priority-low {
  background: #def7ec;
  color: #03543f;
}

.alert-time {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 5px;
}

.alert-description {
  font-size: 0.85rem;
  color: #555;
}

.load-more-button {
  width: 100%;
  margin-top: 10px;
  padding: 10px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  color: #333;
}

.load-more-button:hover {
  background: #eee;
}

.load-more-button:disabled {
  background: #f5f5f5;
  color: #999;
}

.alert-item.clickable {
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.alert-item.clickable:hover {
  background: #f0f0f0;
  border-color: #ccc;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 80%;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
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
}

.alert-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  gap: 10px;
}

.detail-label {
  font-weight: 600;
  color: #555;
  min-width: 110px;
  flex-shrink: 0;
}

.detail-value {
  color: #333;
  word-break: break-word;
}

.detail-value.monospace {
  font-family: monospace;
  font-size: 0.85rem;
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 3px;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.detail-json {
  background: #f8f8f8;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 12px;
  font-size: 0.8rem;
  overflow-x: auto;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.modal-header-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
}

.image-button {
  padding: 6px 14px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
}

.image-button:hover {
  background: #3aa876;
}

.image-button-hd {
  background: #3b82f6;
}

.image-button-hd:hover {
  background: #2563eb;
}

.image-button-video {
  background: #9b59b6;
}

.image-button-video:hover {
  background: #8e44ad;
}

/* Lightbox styles */
.lightbox-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}

.lightbox-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-close {
  position: absolute;
  top: -40px;
  right: 0;
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  padding: 5px 10px;
  line-height: 1;
}

.lightbox-close:hover {
  color: #ccc;
}

.lightbox-image {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 4px;
}

.lightbox-video {
  max-width: 90vw;
  max-height: 90vh;
  width: 100%;
  background: #000;
  border-radius: 4px;
}

.lightbox-loading,
.lightbox-error {
  color: white;
  font-size: 1.1rem;
  padding: 40px;
}

.lightbox-error {
  color: #ff6b6b;
}
</style>
