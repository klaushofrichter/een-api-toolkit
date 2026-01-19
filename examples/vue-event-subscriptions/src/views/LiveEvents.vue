<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  listEventSubscriptions,
  getRecordedImage,
  type EventSubscription,
  type SSEEvent
} from 'een-api-toolkit'
import { useConnectionStore } from '../stores/connection'
import { useHlsPlayer } from '../composables/useHlsPlayer'

const route = useRoute()
const connectionStore = useConnectionStore()

// Initialize HLS player composable
const hlsPlayer = useHlsPlayer()
const { videoUrl, videoError, loadingVideo, loadVideo, resetVideo } = hlsPlayer

// Subscriptions state
const subscriptions = ref<EventSubscription[]>([])
const selectedSubscriptionId = ref<string | null>(null)
const loadingSubscriptions = ref(false)

// Modal state
const selectedEvent = ref<SSEEvent | null>(null)
const showModal = ref(false)

// Lightbox state
const showLightbox = ref(false)
const lightboxImageUrl = ref<string | null>(null)
const loadingImage = ref(false)
const imageError = ref<string | null>(null)
const showVideo = ref(false)

const selectedSubscription = computed(() => {
  return subscriptions.value.find(s => s.id === selectedSubscriptionId.value)
})

const canConnect = computed(() => {
  if (!selectedSubscription.value) return false
  if (selectedSubscription.value.deliveryConfig.type !== 'serverSentEvents.v1') return false
  return !!selectedSubscription.value.deliveryConfig.sseUrl
})

// Use store computed values
const isConnected = computed(() => connectionStore.isConnected)
const isConnecting = computed(() => connectionStore.isConnecting)
const connectionStatus = computed(() => connectionStore.connectionStatus)
const connectionError = computed(() => connectionStore.connectionError)
const events = computed(() => connectionStore.events)
const maxEvents = connectionStore.maxEvents

async function loadSubscriptions() {
  loadingSubscriptions.value = true
  const result = await listEventSubscriptions({ pageSize: 100 })

  if (!result.error) {
    // Filter to only SSE subscriptions
    subscriptions.value = result.data.results.filter(
      s => s.deliveryConfig.type === 'serverSentEvents.v1'
    )
  }

  loadingSubscriptions.value = false
}

async function connect() {
  if (!canConnect.value || !selectedSubscription.value) return

  const subscriptionId = selectedSubscription.value.id

  // Reload all subscriptions to get fresh SSE URLs
  // SSE URLs become invalid after disconnecting
  await loadSubscriptions()

  // Find the subscription in the refreshed list
  const freshSubscription = subscriptions.value.find(s => s.id === subscriptionId)
  if (!freshSubscription) {
    connectionStore.setConnectionError({ code: 'NOT_FOUND', message: 'Subscription no longer exists' })
    return
  }

  if (freshSubscription.deliveryConfig.type !== 'serverSentEvents.v1') {
    connectionStore.setConnectionError({ code: 'VALIDATION_ERROR', message: 'Subscription is not an SSE type' })
    return
  }

  const sseUrl = freshSubscription.deliveryConfig.sseUrl
  if (!sseUrl) {
    connectionStore.setConnectionError({ code: 'VALIDATION_ERROR', message: 'No SSE URL available' })
    return
  }

  connectionStore.connect(subscriptionId, sseUrl)
}

function disconnect() {
  // Get the subscription ID before disconnecting
  const disconnectedId = connectionStore.connectedSubscriptionId

  connectionStore.disconnect()

  // Remove the subscription from the list since SSE URLs are single-use
  // and cannot be reconnected
  if (disconnectedId) {
    subscriptions.value = subscriptions.value.filter(s => s.id !== disconnectedId)
    selectedSubscriptionId.value = null
  }
}

function clearEvents() {
  connectionStore.clearEvents()
}

function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString()
}

function formatEventType(type: string): string {
  // Extract the short name from the full event type ID
  // e.g., "een.motionDetectionEvent.v1" -> "Motion Detection"
  const parts = type.split('.')
  if (parts.length >= 2) {
    const name = parts[1]
      .replace('Event', '')
      .replace(/([A-Z])/g, ' $1')
      .trim()
    return name.charAt(0).toUpperCase() + name.slice(1)
  }
  return type
}

function openEventModal(event: SSEEvent) {
  selectedEvent.value = event
  showModal.value = true
  // Add keyboard listener for Escape key
  document.addEventListener('keydown', handleKeyDown)
}

function closeModal() {
  showModal.value = false
  selectedEvent.value = null
  // Remove keyboard listener
  document.removeEventListener('keydown', handleKeyDown)
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    if (showLightbox.value) {
      closeLightbox()
    } else if (showModal.value) {
      closeModal()
    }
  }
}

function handleModalBackdropClick(e: MouseEvent) {
  if ((e.target as HTMLElement).classList.contains('modal-backdrop')) {
    closeModal()
  }
}

// Extract the image URL from event data
function getEventImageUrl(event: SSEEvent): string | null {
  if (!event.data) return null
  const fullFrameData = event.data.find(d => d.type === 'een.fullFrameImageUrl.v1')
  if (fullFrameData && typeof fullFrameData.httpsUrl === 'string') {
    return fullFrameData.httpsUrl
  }
  return null
}

// Check if event has media URLs
function hasMediaUrls(event: SSEEvent): boolean {
  return getEventImageUrl(event) !== null
}

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

// Handle image click (preview or HD)
async function handleImageClick(quality: 'preview' | 'main' = 'preview') {
  if (!selectedEvent.value) return

  const imageUrl = getEventImageUrl(selectedEvent.value)
  if (!imageUrl) return

  loadingImage.value = true
  imageError.value = null
  lightboxImageUrl.value = null
  showLightbox.value = true
  showVideo.value = false

  // Parse the URL to extract parameters
  const params = parseImageUrlParams(imageUrl)
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

// Handle video click
async function handleVideoClick() {
  if (!selectedEvent.value) return

  const imageUrl = getEventImageUrl(selectedEvent.value)
  if (!imageUrl) return

  // Parse the URL to extract parameters
  const params = parseImageUrlParams(imageUrl)
  if (!params) {
    return
  }

  showVideo.value = true
  showLightbox.value = true

  // Use the composable to load and play video
  await loadVideo(params.deviceId, params.timestamp)
}

// Close lightbox
function closeLightbox() {
  showLightbox.value = false
  lightboxImageUrl.value = null
  imageError.value = null
  // Cleanup video if it was playing
  resetVideo()
  showVideo.value = false
}

// Load subscriptions on mount
onMounted(async () => {
  await loadSubscriptions()

  // If already connected, set the selected subscription to match
  if (connectionStore.connectedSubscriptionId) {
    selectedSubscriptionId.value = connectionStore.connectedSubscriptionId
  } else {
    // Check for subscriptionId in query params
    const queryId = route.query.subscriptionId as string | undefined
    if (queryId) {
      selectedSubscriptionId.value = queryId
    }
  }
})

// Auto-disconnect when changing subscription (but not if selecting the already connected one)
watch(selectedSubscriptionId, (newId) => {
  if (newId && newId !== connectionStore.connectedSubscriptionId && connectionStore.isConnected) {
    disconnect()
  }
})
</script>

<template>
  <div class="live-events">
    <h2>Live Events</h2>

    <!-- Subscription Selector -->
    <div class="selector-section">
      <label>Select Subscription:</label>
      <select
        v-model="selectedSubscriptionId"
        :disabled="loadingSubscriptions || isConnected"
        data-testid="subscription-select"
      >
        <option :value="null">-- Select a subscription --</option>
        <option v-for="sub in subscriptions" :key="sub.id" :value="sub.id">
          {{ sub.id.slice(0, 16) }}... ({{ sub.subscriptionConfig?.lifeCycle || 'unknown' }})
        </option>
      </select>

      <div class="connection-controls">
        <button
          v-if="!isConnected"
          @click="connect"
          :disabled="!canConnect || isConnecting"
          data-testid="connect-button"
        >
          {{ isConnecting ? 'Connecting...' : 'Connect' }}
        </button>
        <button
          v-else
          @click="disconnect"
          class="danger"
          data-testid="disconnect-button"
        >
          Disconnect
        </button>
        <button
          @click="clearEvents"
          class="secondary"
          :disabled="events.length === 0"
        >
          Clear Events
        </button>
      </div>
    </div>

    <!-- Connection Status -->
    <div class="status-section">
      <span class="status-label">Status:</span>
      <span
        class="status-indicator"
        :class="{
          'connected': isConnected,
          'connecting': isConnecting,
          'disconnected': connectionStatus === 'disconnected',
          'error': connectionStatus === 'error'
        }"
        data-testid="connection-status"
      >
        {{ connectionStatus }}
      </span>
    </div>

    <div v-if="connectionError" class="error">
      Connection Error: {{ connectionError.message }}
    </div>

    <!-- Events List -->
    <div class="events-section">
      <h3>Events ({{ events.length }})</h3>

      <div v-if="events.length === 0" class="no-events">
        <p v-if="isConnected">Waiting for events...</p>
        <p v-else>Connect to a subscription to start receiving events.</p>
      </div>

      <div v-else class="events-list" data-testid="events-list">
        <div
          v-for="(event, index) in events"
          :key="`${event.id}-${index}`"
          class="event-card clickable"
          @click="openEventModal(event)"
        >
          <div class="event-header">
            <span class="event-type">{{ formatEventType(event.type) }}</span>
            <span class="event-time">{{ formatTimestamp(event.startTimestamp) }}</span>
          </div>
          <div class="event-details">
            <span class="detail">
              <strong>Actor:</strong> {{ event.actorId }}
            </span>
            <span class="detail">
              <strong>Type:</strong> {{ event.type }}
            </span>
            <span v-if="event.span !== undefined" class="detail">
              <strong>Span:</strong> {{ event.span ? 'Yes' : 'No' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="help-section">
      <h4>Tips</h4>
      <ul>
        <li>Select a subscription from the dropdown to connect</li>
        <li>Events will appear in real-time as they occur</li>
        <li>Maximum {{ maxEvents }} events are displayed (oldest removed first)</li>
        <li>Click on an event card to view detailed information</li>
      </ul>
      <h4>Important</h4>
      <ul class="warning-list">
        <li>SSE URLs are single-use. Once disconnected, the subscription cannot be reconnected.</li>
        <li>To receive events again after disconnecting, create a new subscription.</li>
        <li>Subscriptions have a 15-minute TTL and expire if not connected.</li>
      </ul>
    </div>

    <!-- Event Details Modal -->
    <div
      v-if="showModal && selectedEvent"
      class="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      @click="handleModalBackdropClick"
    >
      <div class="modal-content" role="document">
        <div class="modal-header">
          <h3 id="modal-title">{{ formatEventType(selectedEvent.type) }}</h3>
          <div class="modal-header-buttons">
            <button
              v-if="hasMediaUrls(selectedEvent)"
              class="image-button"
              @click="handleImageClick('preview')"
            >
              Preview
            </button>
            <button
              v-if="hasMediaUrls(selectedEvent)"
              class="image-button image-button-hd"
              @click="handleImageClick('main')"
            >
              HD Image
            </button>
            <button
              v-if="hasMediaUrls(selectedEvent)"
              class="image-button image-button-video"
              @click="handleVideoClick"
            >
              Video
            </button>
            <button class="close-button" @click="closeModal" aria-label="Close modal">&times;</button>
          </div>
        </div>
        <div class="modal-body">
          <div class="modal-section">
            <h4>Event Information</h4>
            <div class="modal-field">
              <strong>Event ID:</strong>
              <span class="mono">{{ selectedEvent.id }}</span>
            </div>
            <div class="modal-field">
              <strong>Type:</strong>
              <span class="mono">{{ selectedEvent.type }}</span>
            </div>
            <div class="modal-field">
              <strong>Actor:</strong>
              <span class="mono">{{ selectedEvent.actorId }}</span>
            </div>
            <div class="modal-field">
              <strong>Start Time:</strong>
              <span>{{ formatTimestamp(selectedEvent.startTimestamp) }}</span>
            </div>
            <div v-if="selectedEvent.endTimestamp" class="modal-field">
              <strong>End Time:</strong>
              <span>{{ formatTimestamp(selectedEvent.endTimestamp) }}</span>
            </div>
            <div v-if="selectedEvent.span !== undefined" class="modal-field">
              <strong>Span Event:</strong>
              <span>{{ selectedEvent.span ? 'Yes' : 'No' }}</span>
            </div>
          </div>

          <div v-if="selectedEvent.data && selectedEvent.data.length > 0" class="modal-section">
            <h4>Event Data ({{ selectedEvent.data.length }} items)</h4>
            <pre class="modal-json">{{ JSON.stringify(selectedEvent.data, null, 2) }}</pre>
          </div>

          <div v-else class="modal-section">
            <h4>Event Data</h4>
            <p class="no-data-text">No additional data available for this event.</p>
          </div>
        </div>
      </div>

    </div>

    <!-- Image/Video Lightbox -->
    <div v-if="showLightbox" class="lightbox-overlay" @click.self="closeLightbox">
      <div class="lightbox-content">
        <button class="lightbox-close" @click="closeLightbox">&times;</button>
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
          />
        </template>
        <!-- Image mode -->
        <template v-else>
          <div v-if="loadingImage" class="lightbox-loading">Loading image...</div>
          <div v-else-if="imageError" class="lightbox-error">{{ imageError }}</div>
          <img
            v-else-if="lightboxImageUrl"
            :src="lightboxImageUrl"
            alt="Event image"
            class="lightbox-image"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.live-events {
  max-width: 900px;
  margin: 0 auto;
}

h2 {
  margin-bottom: 20px;
}

.selector-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.selector-section label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.selector-section select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 15px;
}

.connection-controls {
  display: flex;
  gap: 10px;
}

.status-section {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
}

.status-label {
  font-weight: 500;
}

.status-indicator {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.status-indicator.connected {
  background: #d4edda;
  color: #155724;
}

.status-indicator.connecting {
  background: #fff3cd;
  color: #856404;
}

.status-indicator.disconnected {
  background: #e2e3e5;
  color: #383d41;
}

.status-indicator.error {
  background: #f8d7da;
  color: #721c24;
}

.events-section {
  margin-top: 20px;
}

.events-section h3 {
  margin-bottom: 15px;
}

.no-events {
  text-align: center;
  color: #666;
  padding: 40px;
  background: #f8f9fa;
  border-radius: 8px;
}

.events-list {
  max-height: 500px;
  overflow-y: auto;
  border: 1px solid #e2e3e5;
  border-radius: 8px;
}

.event-card {
  padding: 15px;
  border-bottom: 1px solid #e2e3e5;
  background: white;
}

.event-card:last-child {
  border-bottom: none;
}

.event-card.clickable {
  cursor: pointer;
  transition: background-color 0.15s ease, box-shadow 0.15s ease;
}

.event-card.clickable:hover {
  background: #f0f7f4;
  box-shadow: inset 3px 0 0 #42b883;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.event-type {
  font-weight: 600;
  color: #42b883;
}

.event-time {
  font-size: 12px;
  color: #666;
}

.event-details {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  font-size: 13px;
}

.detail strong {
  color: #555;
}

/* Modal styles */
.modal-backdrop {
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

.modal-section {
  margin-bottom: 20px;
}

.modal-section:last-child {
  margin-bottom: 0;
}

.modal-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.modal-field {
  display: flex;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.modal-field:last-child {
  border-bottom: none;
}

.modal-field strong {
  min-width: 100px;
  color: #666;
  font-weight: 500;
}

.modal-field .mono {
  font-family: monospace;
  font-size: 13px;
  word-break: break-all;
}

.modal-json {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  font-size: 12px;
  overflow-x: auto;
  margin: 0;
  max-height: 300px;
  overflow-y: auto;
}

.no-data-text {
  color: #888;
  font-style: italic;
  margin: 0;
}

.help-section {
  margin-top: 30px;
  padding: 15px;
  background: #e9ecef;
  border-radius: 8px;
}

.help-section h4 {
  margin-bottom: 10px;
}

.help-section ul {
  margin: 0;
  padding-left: 20px;
  color: #666;
  font-size: 14px;
}

.help-section li {
  margin-bottom: 5px;
}

.help-section .warning-list {
  color: #856404;
  background: #fff3cd;
  padding: 10px 10px 10px 30px;
  border-radius: 4px;
  margin-top: 10px;
}

.help-section .warning-list li {
  margin-bottom: 4px;
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
