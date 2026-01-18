<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { listNotifications, getNotification, getRecordedImage, type Camera, type Notification, type EenError } from 'een-api-toolkit'
import { useHlsPlayer } from '../composables/useHlsPlayer'

// Initialize HLS player composable
// Note: videoRef is not destructured - accessed as hlsPlayer.videoRef in template
const hlsPlayer = useHlsPlayer()
const { videoUrl, videoError, loadingVideo, loadVideo, resetVideo } = hlsPlayer

const props = defineProps<{
  camera: Camera | null
  timeRange: string
}>()

const notifications = ref<Notification[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const error = ref<EenError | null>(null)
const nextPageToken = ref<string | undefined>(undefined)

// Modal state
const showModal = ref(false)
const selectedNotification = ref<Notification | null>(null)
const loadingDetails = ref(false)
const detailsError = ref<EenError | null>(null)

// Lightbox state
const showLightbox = ref(false)
const lightboxImageUrl = ref<string | null>(null)
const loadingImage = ref(false)
const imageError = ref<string | null>(null)

// Video state (showVideo controls lightbox mode, rest from composable)
const showVideo = ref(false)

// Check if notification has an httpsUrl in its data
// The httpsUrl is in the list_data array, in an object with type "een.fullFrameImageUrl.v1"
const notificationImageUrl = computed(() => {
  const rawData = selectedNotification.value?.data
  if (!rawData) return null

  // Validate data is an object before casting
  if (typeof rawData !== 'object' || rawData === null) return null
  const data = rawData as Record<string, unknown>

  // Look for list_data array
  const listData = data.list_data
  if (!Array.isArray(listData)) return null

  // Find the object with type "een.fullFrameImageUrl.v1"
  const imageItem = listData.find(
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

async function fetchNotifications(append = false) {
  if (append) {
    loadingMore.value = true
  } else {
    loading.value = true
    notifications.value = []
    nextPageToken.value = undefined
  }
  error.value = null

  const params: Parameters<typeof listNotifications>[0] = {
    pageSize: 20,
    pageToken: append ? nextPageToken.value : undefined,
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
    params.actorId = props.camera.id
  }

  const result = await listNotifications(params)

  if (result.error) {
    error.value = result.error
  } else {
    const newNotifications = result.data?.results ?? []
    if (append) {
      notifications.value = [...notifications.value, ...newNotifications]
    } else {
      notifications.value = newNotifications
    }
    nextPageToken.value = result.data?.nextPageToken
  }

  loading.value = false
  loadingMore.value = false
}

function loadMore() {
  if (nextPageToken.value) {
    fetchNotifications(true)
  }
}

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleString()
}

function getCategoryClass(category: string): string {
  switch (category) {
    case 'health': return 'category-health'
    case 'video': return 'category-video'
    case 'security': return 'category-security'
    case 'operational': return 'category-operational'
    default: return 'category-default'
  }
}

async function handleNotificationClick(notification: Notification) {
  showModal.value = true
  loadingDetails.value = true
  detailsError.value = null
  selectedNotification.value = null

  const result = await getNotification(notification.id)

  if (result.error) {
    detailsError.value = result.error
  } else {
    selectedNotification.value = result.data
  }

  loadingDetails.value = false
}

function closeModal() {
  showModal.value = false
  selectedNotification.value = null
  detailsError.value = null
}

async function handleImageClick(quality: 'preview' | 'main' = 'preview') {
  if (!notificationImageUrl.value) return

  loadingImage.value = true
  imageError.value = null
  lightboxImageUrl.value = null
  showLightbox.value = true

  // Parse the URL to extract parameters
  const params = parseImageUrlParams(notificationImageUrl.value)
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
  if (!notificationImageUrl.value) return

  // Parse the URL to extract parameters
  const params = parseImageUrlParams(notificationImageUrl.value)
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
function debouncedFetchNotifications() {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  debounceTimer = setTimeout(() => {
    fetchNotifications()
    debounceTimer = null
  }, DEBOUNCE_DELAY)
}

// Fetch notifications when camera or time range changes (debounced)
watch(
  () => [props.camera?.id, props.timeRange],
  (_newVal, oldVal) => {
    // Immediate fetch on first load (when oldVal is undefined)
    if (oldVal === undefined) {
      fetchNotifications()
    } else {
      debouncedFetchNotifications()
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="notifications-list" data-testid="notifications-list">
    <div v-if="loading" class="loading" data-testid="notifications-loading">
      Loading notifications...
    </div>
    <div v-else-if="error" class="error" data-testid="notifications-error">
      {{ error.message }}
    </div>
    <div v-else-if="notifications.length === 0" class="no-data" data-testid="notifications-no-data">
      No notifications found for this time range.
    </div>
    <div v-else>
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification-item clickable"
        :class="{ unread: !notification.read }"
        data-testid="notification-item"
        @click="handleNotificationClick(notification)"
      >
        <div class="notification-header">
          <span
            class="category-badge"
            :class="getCategoryClass(notification.category)"
          >
            {{ notification.category }}
          </span>
          <span v-if="!notification.read" class="unread-badge">New</span>
        </div>
        <div class="notification-time">{{ formatTime(notification.timestamp) }}</div>
        <div v-if="notification.description" class="notification-description">
          {{ notification.description }}
        </div>
        <div class="notification-status">
          Status: {{ notification.status }}
        </div>
      </div>

      <button
        v-if="nextPageToken"
        @click="loadMore"
        :disabled="loadingMore"
        class="load-more-button"
        data-testid="notifications-load-more"
      >
        {{ loadingMore ? 'Loading...' : 'Load More' }}
      </button>
    </div>

    <!-- Notification Details Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal" data-testid="notification-modal-overlay">
      <div class="modal-content" data-testid="notification-modal">
        <div class="modal-header">
          <h3>Notification Details</h3>
          <div class="modal-header-buttons">
            <button
              v-if="notificationImageUrl"
              class="image-button"
              @click="handleImageClick('preview')"
              data-testid="notification-image-button"
            >
              Preview
            </button>
            <button
              v-if="notificationImageUrl"
              class="image-button image-button-hd"
              @click="handleImageClick('main')"
              data-testid="notification-image-hd-button"
            >
              HD Image
            </button>
            <button
              v-if="notificationImageUrl"
              class="image-button image-button-video"
              @click="handleVideoClick"
              data-testid="notification-video-button"
            >
              Video
            </button>
            <button class="close-button" @click="closeModal" data-testid="notification-modal-close">&times;</button>
          </div>
        </div>
        <div class="modal-body">
          <div v-if="loadingDetails" class="loading">Loading notification details...</div>
          <div v-else-if="detailsError" class="error">{{ detailsError.message }}</div>
          <div v-else-if="selectedNotification" class="notification-details">
            <div class="detail-row">
              <span class="detail-label">ID:</span>
              <span class="detail-value monospace">{{ selectedNotification.id }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Category:</span>
              <span class="detail-value">
                <span class="category-badge" :class="getCategoryClass(selectedNotification.category)">
                  {{ selectedNotification.category }}
                </span>
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Status:</span>
              <span class="detail-value">{{ selectedNotification.status }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Read:</span>
              <span class="detail-value">{{ selectedNotification.read ? 'Yes' : 'No' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Timestamp:</span>
              <span class="detail-value">{{ formatTime(selectedNotification.timestamp) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Created:</span>
              <span class="detail-value">{{ formatTime(selectedNotification.createTimestamp) }}</span>
            </div>
            <div v-if="selectedNotification.sentTimestamp" class="detail-row">
              <span class="detail-label">Sent:</span>
              <span class="detail-value">{{ formatTime(selectedNotification.sentTimestamp) }}</span>
            </div>
            <div v-if="selectedNotification.description" class="detail-row">
              <span class="detail-label">Description:</span>
              <span class="detail-value">{{ selectedNotification.description }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Actor ID:</span>
              <span class="detail-value monospace">{{ selectedNotification.actorId }}</span>
            </div>
            <div v-if="selectedNotification.actorName" class="detail-row">
              <span class="detail-label">Actor Name:</span>
              <span class="detail-value">{{ selectedNotification.actorName }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Actor Type:</span>
              <span class="detail-value">{{ selectedNotification.actorType }}</span>
            </div>
            <div v-if="selectedNotification.alertId" class="detail-row">
              <span class="detail-label">Alert ID:</span>
              <span class="detail-value monospace">{{ selectedNotification.alertId }}</span>
            </div>
            <div v-if="selectedNotification.alertType" class="detail-row">
              <span class="detail-label">Alert Type:</span>
              <span class="detail-value">{{ selectedNotification.alertType }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">User ID:</span>
              <span class="detail-value monospace">{{ selectedNotification.userId }}</span>
            </div>
            <div v-if="selectedNotification.notificationActions && selectedNotification.notificationActions.length > 0" class="detail-row">
              <span class="detail-label">Actions:</span>
              <span class="detail-value">{{ selectedNotification.notificationActions.join(', ') }}</span>
            </div>
            <div v-if="selectedNotification.dataSchemas && selectedNotification.dataSchemas.length > 0" class="detail-row">
              <span class="detail-label">Data Schemas:</span>
              <span class="detail-value">{{ selectedNotification.dataSchemas.join(', ') }}</span>
            </div>
            <div v-if="selectedNotification.data && Object.keys(selectedNotification.data).length > 0" class="detail-section">
              <span class="detail-label">Data:</span>
              <pre class="detail-json">{{ JSON.stringify(selectedNotification.data, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Image/Video Lightbox -->
    <div v-if="showLightbox" class="lightbox-overlay" @click.self="closeLightbox" data-testid="notification-lightbox-overlay">
      <div class="lightbox-content" data-testid="notification-lightbox">
        <button class="lightbox-close" @click="closeLightbox" data-testid="notification-lightbox-close">&times;</button>
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
            data-testid="notification-lightbox-video"
          />
        </template>
        <!-- Image mode -->
        <template v-else>
          <div v-if="loadingImage" class="lightbox-loading">Loading image...</div>
          <div v-else-if="imageError" class="lightbox-error">{{ imageError }}</div>
          <img
            v-else-if="lightboxImageUrl"
            :src="lightboxImageUrl"
            alt="Notification image"
            class="lightbox-image"
            data-testid="notification-lightbox-image"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notifications-list {
  min-height: 200px;
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

.notification-item {
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 6px;
  margin-bottom: 10px;
  background: #fafafa;
}

.notification-item.unread {
  background: #f0f9ff;
  border-color: #bae6fd;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.category-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.category-health {
  background: #fef3c7;
  color: #92400e;
}

.category-video {
  background: #dbeafe;
  color: #1e40af;
}

.category-security {
  background: #fde8e8;
  color: #c53030;
}

.category-operational {
  background: #e0e7ff;
  color: #3730a3;
}

.category-default {
  background: #f3f4f6;
  color: #374151;
}

.unread-badge {
  background: #3b82f6;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
}

.notification-time {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 5px;
}

.notification-description {
  font-size: 0.85rem;
  color: #555;
  margin-bottom: 5px;
}

.notification-status {
  font-size: 0.75rem;
  color: #888;
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

.notification-item.clickable {
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.notification-item.clickable:hover {
  background: #f0f0f0;
  border-color: #ccc;
}

.notification-item.clickable.unread:hover {
  background: #e0f2fe;
  border-color: #7dd3fc;
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

.notification-details {
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
