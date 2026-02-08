<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import {
  listEvents,
  listEventFieldValues,
  listEventTypes,
  getRecordedImage,
  getEvent,
  getIncludeParameterForEventTypes,
  getDataSchemasForEventType,
  type Camera,
  type Event,
  type EventType,
  type EenError
} from 'een-api-toolkit'
import { useHlsPlayer } from '../composables/useHlsPlayer'

// Initialize HLS player composable
const hlsPlayer = useHlsPlayer()
const { videoUrl, videoError, loadingVideo, loadVideo, resetVideo } = hlsPlayer

/**
 * Bounding box from object detection data.
 * Coordinates are normalized (0-1) relative to image dimensions.
 */
interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
  label?: string
  confidence?: number
}

/** Constant for converting normalized coordinates (0-1) to SVG viewBox percentage */
const NORMALIZED_TO_PERCENT = 100

/** Maximum number of images to cache to prevent memory issues */
const MAX_IMAGE_CACHE_SIZE = 50

/**
 * Type guard to check if a value is a non-empty string.
 */
function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}

/**
 * Type guard to validate a bounding box array.
 * Must be an array of exactly 4 numbers.
 */
function isValidBoundingBoxArray(value: unknown): value is [number, number, number, number] {
  return (
    Array.isArray(value) &&
    value.length === 4 &&
    value.every(v => typeof v === 'number' && !Number.isNaN(v))
  )
}

const props = defineProps<{
  camera: Camera
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

// Time range options
type TimeRange = '1h' | '6h' | '24h'
const timeRangeOptions: { value: TimeRange; label: string }[] = [
  { value: '1h', label: 'Last 1 hour' },
  { value: '6h', label: 'Last 6 hours' },
  { value: '24h', label: 'Last 24 hours' }
]

// State
const loading = ref(false)
const loadingFieldValues = ref(false)
const error = ref<EenError | null>(null)
const fieldValuesError = ref<EenError | null>(null)
const events = ref<Event[]>([])
const nextPageToken = ref<string | undefined>(undefined)
const availableEventTypes = ref<string[]>([])
const selectedEventTypes = ref<string[]>([])
const timeRange = ref<TimeRange>('1h')
const eventTypeNames = ref<Map<string, string>>(new Map())
const eventImages = ref<Map<string, string>>(new Map())
const imageLoadingIds = ref<Set<string>>(new Set()) // Track which images are currently loading
const boundingBoxCache = ref<Map<string, BoundingBox[]>>(new Map()) // Cache bounding boxes per event
const enlargedEventId = ref<string | null>(null)

// JSON viewer state
const jsonViewerEventId = ref<string | null>(null)
const jsonViewerFullEvent = ref<Event | null>(null)
const jsonViewerLoading = ref(false)
const jsonViewerError = ref<string | null>(null)
const copySuccess = ref(false)

// Lightbox media state
const showVideo = ref(false)
const hdImageUrl = ref<string | null>(null)
const loadingHdImage = ref(false)
const hdImageError = ref<string | null>(null)
const currentMediaType = ref<'preview' | 'hd' | 'video'>('preview')

// Computed
const hasNextPage = computed(() => !!nextPageToken.value)
const hasNoEvents = computed(() => !loading.value && events.value.length === 0 && !error.value)
const enlargedEvent = computed(() => {
  if (!enlargedEventId.value) return null
  return events.value.find(e => e.id === enlargedEventId.value) || null
})
const enlargedImage = computed(() => {
  if (!enlargedEventId.value) return null
  return eventImages.value.get(enlargedEventId.value) || null
})
const enlargedBoundingBoxes = computed(() => {
  if (!enlargedEvent.value) return []
  return getBoundingBoxes(enlargedEvent.value)
})
const jsonViewerEvent = computed(() => {
  if (!jsonViewerEventId.value) return null
  return events.value.find(e => e.id === jsonViewerEventId.value) || null
})
const jsonViewerContent = computed(() => {
  // Use full event if loaded, otherwise fall back to list event
  const eventToShow = jsonViewerFullEvent.value || jsonViewerEvent.value
  if (!eventToShow) return ''
  try {
    return JSON.stringify(eventToShow, null, 2)
  } catch (err) {
    // Safely handle any JSON serialization errors
    return `Error serializing event data: ${String(err)}`
  }
})

// Data schemas for the current event type
const jsonViewerDataSchemas = computed(() => {
  if (!jsonViewerEvent.value) return []
  return getDataSchemasForEventType(jsonViewerEvent.value.type)
})

// Get start timestamp based on time range
function getStartTimestamp(range: TimeRange): string {
  const now = Date.now()
  const hoursMap: Record<TimeRange, number> = {
    '1h': 1,
    '6h': 6,
    '24h': 24
  }
  return new Date(now - hoursMap[range] * 60 * 60 * 1000).toISOString()
}

/**
 * Get fallback label for detected object based on event type.
 */
function getFallbackLabel(eventType: string): string {
  if (eventType.includes('person')) return 'Person'
  if (eventType.includes('vehicle')) return 'Vehicle'
  if (eventType.includes('licensePlate') || eventType.includes('lpr')) return 'License Plate'
  return 'Object'
}

/**
 * Extract bounding boxes from event data.
 * Looks for object detection data schemas and extracts bounding box info.
 * The EEN API returns boundingBox as [x1, y1, x2, y2] normalized coordinates (0-1).
 * Labels are obtained from een.objectClassification.v1 data when available.
 * Results are cached per event ID to avoid redundant calculations.
 */
function getBoundingBoxes(event: Event): BoundingBox[] {
  // Check cache first
  const cached = boundingBoxCache.value.get(event.id)
  if (cached) {
    return cached
  }

  const boxes: BoundingBox[] = []
  const fallbackLabel = getFallbackLabel(event.type)

  // Build a map of objectId -> classification label from objectClassification data
  const classificationMap = new Map<string, string>()
  for (const dataItem of event.data) {
    if (dataItem.type === 'een.objectClassification.v1') {
      // Use type guards for proper runtime validation
      const objectId = dataItem.objectId
      const label = dataItem.label
      if (isNonEmptyString(objectId) && isNonEmptyString(label)) {
        // Capitalize first letter of label
        const formattedLabel = label.charAt(0).toUpperCase() + label.slice(1).toLowerCase()
        classificationMap.set(objectId, formattedLabel)
      }
    }
  }

  // Extract bounding boxes from objectDetection data
  for (const dataItem of event.data) {
    if (dataItem.type === 'een.objectDetection.v1') {
      const boundingBox = dataItem.boundingBox
      const objectId = dataItem.objectId

      // Use type guard for proper runtime validation of bounding box array
      if (isValidBoundingBoxArray(boundingBox)) {
        const [x1, y1, x2, y2] = boundingBox
        // Use classification label if available, otherwise use fallback
        const label = (isNonEmptyString(objectId) && classificationMap.get(objectId)) || fallbackLabel
        boxes.push({
          x: x1,
          y: y1,
          width: x2 - x1,
          height: y2 - y1,
          label
        })
      }
    }
  }

  // Cache the result
  boundingBoxCache.value.set(event.id, boxes)
  return boxes
}

/**
 * Get the count of bounding boxes for an event.
 */
function getBoundingBoxCount(event: Event): number {
  return getBoundingBoxes(event).length
}

// Fetch available event types for this camera
async function fetchAvailableEventTypes() {
  loadingFieldValues.value = true
  fieldValuesError.value = null

  const result = await listEventFieldValues({
    actor: `camera:${props.camera.id}`
  })

  if (result.error) {
    fieldValuesError.value = result.error
    availableEventTypes.value = []
  } else {
    availableEventTypes.value = result.data.type || []
    // Select all by default
    selectedEventTypes.value = [...availableEventTypes.value]
  }

  loadingFieldValues.value = false
}

// Fetch event type names for display
async function fetchEventTypeNames() {
  const result = await listEventTypes({ pageSize: 100 })
  if (!result.error && result.data) {
    const nameMap = new Map<string, string>()
    for (const et of result.data.results as EventType[]) {
      nameMap.set(et.type, et.name)
    }
    eventTypeNames.value = nameMap
  }
}

// Get human-readable event type name
function getEventTypeName(type: string): string {
  return eventTypeNames.value.get(type) || formatEventType(type)
}

// Format event type for display (fallback)
function formatEventType(type: string): string {
  // e.g., "een.motionDetectionEvent.v1" -> "Motion Detection"
  const match = type.match(/een\.(\w+)Event\.v\d+/)
  if (match) {
    return match[1]
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim()
  }
  return type
}

// Fetch events
async function fetchEvents(append = false) {
  if (selectedEventTypes.value.length === 0) {
    events.value = []
    nextPageToken.value = undefined
    return
  }

  loading.value = true
  if (!append) {
    error.value = null
  }

  // Build include parameter dynamically based on selected event types
  const includeValues = getIncludeParameterForEventTypes(selectedEventTypes.value)

  const result = await listEvents({
    actor: `camera:${props.camera.id}`,
    type__in: selectedEventTypes.value,
    startTimestamp__gte: getStartTimestamp(timeRange.value),
    endTimestamp__lte: new Date().toISOString(),
    pageSize: 20,
    pageToken: append ? nextPageToken.value : undefined,
    sort: '-startTimestamp',
    include: includeValues
  })

  if (result.error) {
    error.value = result.error
    if (!append) {
      events.value = []
    }
    nextPageToken.value = undefined
  } else {
    const newEvents = result.data.results
    if (append) {
      events.value = [...events.value, ...newEvents]
    } else {
      events.value = newEvents
      eventImages.value.clear()
    }
    nextPageToken.value = result.data.nextPageToken

    // Load images for the new events (don't block UI)
    loadEventImages(newEvents)
  }

  loading.value = false
}

// Load more events
async function loadMore() {
  if (!nextPageToken.value) return
  await fetchEvents(true)
}

/**
 * Evict oldest images from cache if it exceeds the maximum size.
 * Removes images that are not currently being displayed.
 */
function evictOldestImages() {
  if (eventImages.value.size <= MAX_IMAGE_CACHE_SIZE) return

  // Get IDs of images to keep (currently visible events)
  const visibleEventIds = new Set(events.value.map(e => e.id))

  // Find images to evict (not currently visible)
  const idsToEvict: string[] = []
  for (const id of eventImages.value.keys()) {
    if (!visibleEventIds.has(id)) {
      idsToEvict.push(id)
    }
  }

  // Evict oldest first (Map maintains insertion order)
  const numToEvict = eventImages.value.size - MAX_IMAGE_CACHE_SIZE
  for (let i = 0; i < Math.min(numToEvict, idsToEvict.length); i++) {
    eventImages.value.delete(idsToEvict[i])
  }
}

// Load images for events using getRecordedImage API
async function loadEventImages(eventsToLoad: Event[]) {
  // Load images in parallel for all camera events
  const loadPromises = eventsToLoad
    .filter(event => event.actorType === 'camera')
    .map(async (event) => {
      // Skip if already loaded or currently loading (prevents race condition)
      if (eventImages.value.has(event.id) || imageLoadingIds.value.has(event.id)) {
        return
      }

      // Mark as loading to prevent duplicate requests
      imageLoadingIds.value.add(event.id)

      try {
        const result = await getRecordedImage({
          deviceId: event.actorId,
          type: 'preview',
          timestamp__gte: event.startTimestamp
        })

        if (!result.error && result.data) {
          eventImages.value.set(event.id, result.data.imageData)
          // Evict old images if cache is too large
          evictOldestImages()
        }
      } finally {
        // Remove from loading set regardless of success/failure
        imageLoadingIds.value.delete(event.id)
      }
    })

  await Promise.all(loadPromises)
}

// Get image for an event (from loaded images map)
function getEventImage(event: Event): string | null {
  return eventImages.value.get(event.id) || null
}

// Format timestamp for display
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleString()
}

// Handle event type checkbox toggle
function toggleEventType(type: string) {
  const index = selectedEventTypes.value.indexOf(type)
  if (index === -1) {
    selectedEventTypes.value.push(type)
  } else {
    selectedEventTypes.value.splice(index, 1)
  }
}

// Select/deselect all event types
function toggleAllEventTypes() {
  if (selectedEventTypes.value.length === availableEventTypes.value.length) {
    selectedEventTypes.value = []
  } else {
    selectedEventTypes.value = [...availableEventTypes.value]
  }
}

// Open enlarged image view
function openEnlargedImage(eventId: string) {
  enlargedEventId.value = eventId
  currentMediaType.value = 'preview'
  showVideo.value = false
  hdImageUrl.value = null
  hdImageError.value = null
  resetVideo()
}

// Close enlarged image view
function closeEnlargedImage() {
  enlargedEventId.value = null
  showVideo.value = false
  hdImageUrl.value = null
  hdImageError.value = null
  currentMediaType.value = 'preview'
  resetVideo()
}

// Open JSON viewer and fetch full event details
async function openJsonViewer(eventId: string) {
  jsonViewerEventId.value = eventId
  jsonViewerFullEvent.value = null
  jsonViewerError.value = null
  copySuccess.value = false

  // Find the event in the list to get its dataSchemas
  const listEvent = events.value.find(e => e.id === eventId)
  if (!listEvent) {
    jsonViewerError.value = 'Event not found in current list'
    return
  }

  // Build include array from dataSchemas (prefix with "data.")
  const includes = listEvent.dataSchemas?.map(schema => `data.${schema}`) || []

  if (includes.length === 0) {
    // No additional data to fetch, use the list event as-is
    return
  }

  // Fetch full event details with all data schemas
  jsonViewerLoading.value = true
  const { data, error } = await getEvent(eventId, { include: includes })
  jsonViewerLoading.value = false

  if (error) {
    jsonViewerError.value = error.message
    return
  }

  if (data) {
    jsonViewerFullEvent.value = data
  }
}

// Close JSON viewer
function closeJsonViewer() {
  jsonViewerEventId.value = null
  jsonViewerFullEvent.value = null
  jsonViewerError.value = null
  copySuccess.value = false
}

// Copy JSON to clipboard
async function copyJsonToClipboard() {
  if (!jsonViewerContent.value) return
  try {
    await navigator.clipboard.writeText(jsonViewerContent.value)
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea')
    textarea.value = jsonViewerContent.value
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  }
}

// Switch to preview mode
function showPreview() {
  currentMediaType.value = 'preview'
  showVideo.value = false
  resetVideo()
}

// Load and show HD image
async function showHdImage() {
  if (!enlargedEvent.value) return

  currentMediaType.value = 'hd'
  showVideo.value = false
  loadingHdImage.value = true
  hdImageError.value = null
  hdImageUrl.value = null
  resetVideo()

  const result = await getRecordedImage({
    deviceId: enlargedEvent.value.actorId,
    type: 'main',
    timestamp__gte: enlargedEvent.value.startTimestamp
  })

  if (result.error) {
    hdImageError.value = result.error.message
  } else if (result.data?.imageData) {
    hdImageUrl.value = result.data.imageData
  } else {
    hdImageError.value = 'No image data returned'
  }

  loadingHdImage.value = false
}

// Load and show video
async function showVideoPlayer() {
  if (!enlargedEvent.value) return

  currentMediaType.value = 'video'
  showVideo.value = true
  hdImageUrl.value = null
  hdImageError.value = null

  await loadVideo(enlargedEvent.value.actorId, enlargedEvent.value.startTimestamp)
}

// Handle keyboard events for accessibility
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    if (jsonViewerEventId.value) {
      closeJsonViewer()
    } else if (enlargedEventId.value) {
      closeEnlargedImage()
    }
  }
}

// Set up keyboard event listener for ESC key
onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  // Clean up JSON viewer state to prevent memory leaks
  jsonViewerFullEvent.value = null
  jsonViewerEventId.value = null
})

// Watch for modal open/close
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    events.value = []
    nextPageToken.value = undefined
    error.value = null
    eventImages.value.clear()
    imageLoadingIds.value.clear()
    boundingBoxCache.value.clear()

    await fetchEventTypeNames()
    await fetchAvailableEventTypes()

    if (availableEventTypes.value.length > 0) {
      await fetchEvents()
    }
  } else {
    // Clean up on modal close to free memory (base64 images can be large)
    eventImages.value.clear()
    imageLoadingIds.value.clear()
    boundingBoxCache.value.clear()
    events.value = []
    enlargedEventId.value = null
    jsonViewerEventId.value = null
  }
}, { immediate: true })

// Watch for filter changes
watch([timeRange, selectedEventTypes], () => {
  if (props.isOpen) {
    fetchEvents()
  }
}, { deep: true })
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="emit('close')">
    <div class="modal">
      <div class="modal-header">
        <div class="header-info">
          <h2>Events: {{ camera.name }}</h2>
          <div class="camera-id">Camera ID: {{ camera.id }}</div>
        </div>
        <button class="close-button" @click="emit('close')">&times;</button>
      </div>

      <div class="modal-filters" data-testid="modal-filters">
        <div class="filter-row">
          <label>Time Range:</label>
          <select v-model="timeRange" data-testid="time-range-select">
            <option v-for="option in timeRangeOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <div class="filter-row event-types">
          <label>Event Types:</label>
          <div v-if="loadingFieldValues" class="loading-types">
            Loading event types...
          </div>
          <div v-else-if="fieldValuesError" class="error-types" data-testid="field-values-error">
            Error loading event types: {{ fieldValuesError.message }}
          </div>
          <div v-else-if="availableEventTypes.length === 0" class="no-types">
            No event types available for this camera
          </div>
          <div v-else class="event-type-list">
            <label class="event-type-checkbox select-all">
              <input
                type="checkbox"
                :checked="selectedEventTypes.length === availableEventTypes.length"
                :indeterminate="selectedEventTypes.length > 0 && selectedEventTypes.length < availableEventTypes.length"
                @change="toggleAllEventTypes"
              />
              <span>Select All</span>
            </label>
            <label
              v-for="eventType in availableEventTypes"
              :key="eventType"
              class="event-type-checkbox"
            >
              <input
                type="checkbox"
                :checked="selectedEventTypes.includes(eventType)"
                @change="toggleEventType(eventType)"
              />
              <span>{{ getEventTypeName(eventType) }}</span>
            </label>
          </div>
        </div>
      </div>

      <div class="modal-body">
        <div v-if="loading && events.length === 0" class="loading">
          Loading events...
        </div>

        <div v-else-if="error" class="error">
          Error: {{ error.message }}
        </div>

        <div v-else-if="hasNoEvents" class="no-events" data-testid="no-events">
          No events found for the selected filters.
        </div>

        <div v-else class="events-list" data-testid="events-list">
          <div v-for="event in events" :key="event.id" class="event-item" data-testid="event-item">
            <div
              class="event-thumbnail"
              :class="{ clickable: getEventImage(event) }"
              @click="getEventImage(event) && openEnlargedImage(event.id)"
            >
              <img
                v-if="getEventImage(event)"
                :src="getEventImage(event) || ''"
                :alt="event.type"
              />
              <div v-else class="no-thumbnail loading-image">
                Loading...
              </div>
            </div>
            <div class="event-info">
              <div class="event-type-row">
                <span class="event-type">{{ getEventTypeName(event.type) }}</span>
                <button
                  class="json-button"
                  @click="openJsonViewer(event.id)"
                  title="View JSON data"
                  aria-label="View event JSON data"
                  data-testid="json-button"
                >{ }</button>
              </div>
              <div class="event-time">{{ formatTimestamp(event.startTimestamp) }}</div>
              <div v-if="getBoundingBoxCount(event) > 0" class="event-detections" data-testid="event-detections">
                {{ getBoundingBoxCount(event) }} detection{{ getBoundingBoxCount(event) !== 1 ? 's' : '' }}
              </div>
              <div class="event-id">ID: {{ event.id }}</div>
            </div>
          </div>
        </div>

        <div v-if="hasNextPage" class="load-more">
          <button @click="loadMore" :disabled="loading">
            {{ loading ? 'Loading...' : 'Load More' }}
          </button>
        </div>
      </div>

      <!-- Enlarged image lightbox -->
      <div
        v-if="enlargedEventId && (enlargedImage || showVideo)"
        class="lightbox-overlay"
        @click.self="closeEnlargedImage"
        data-testid="lightbox-overlay"
      >
        <div class="lightbox-content">
          <!-- Header with buttons -->
          <div class="lightbox-header">
            <div class="lightbox-buttons">
              <button
                class="media-button"
                :class="{ active: currentMediaType === 'preview' }"
                @click="showPreview"
              >
                Preview
              </button>
              <button
                class="media-button media-button-hd"
                :class="{ active: currentMediaType === 'hd' }"
                @click="showHdImage"
              >
                HD Image
              </button>
              <button
                class="media-button media-button-video"
                :class="{ active: currentMediaType === 'video' }"
                @click="showVideoPlayer"
              >
                Video
              </button>
            </div>
            <button
              class="lightbox-close"
              @click="closeEnlargedImage"
              aria-label="Close enlarged image"
              data-testid="lightbox-close"
            >&times;</button>
          </div>

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

          <!-- HD Image mode -->
          <template v-else-if="currentMediaType === 'hd'">
            <div v-if="loadingHdImage" class="lightbox-loading">Loading HD image...</div>
            <div v-else-if="hdImageError" class="lightbox-error">{{ hdImageError }}</div>
            <div v-else-if="hdImageUrl" class="lightbox-image-container">
              <img :src="hdImageUrl" :alt="enlargedEvent?.type || 'Event image'" class="lightbox-image" />
              <!-- Bounding box overlay for HD -->
              <svg
                v-if="enlargedBoundingBoxes.length > 0"
                class="bounding-box-overlay"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                data-testid="bounding-box-overlay"
              >
                <rect
                  v-for="(box, index) in enlargedBoundingBoxes"
                  :key="index"
                  :x="box.x * NORMALIZED_TO_PERCENT"
                  :y="box.y * NORMALIZED_TO_PERCENT"
                  :width="box.width * NORMALIZED_TO_PERCENT"
                  :height="box.height * NORMALIZED_TO_PERCENT"
                  class="bounding-box"
                  data-testid="bounding-box"
                />
              </svg>
              <!-- Bounding box labels for HD -->
              <div
                v-for="(box, index) in enlargedBoundingBoxes"
                :key="'label-' + index"
                class="bounding-box-label"
                :style="{
                  left: (box.x * NORMALIZED_TO_PERCENT) + '%',
                  top: (box.y * NORMALIZED_TO_PERCENT) + '%'
                }"
                data-testid="bounding-box-label"
              >
                {{ box.label || 'Object' }}
                <span v-if="box.confidence" class="confidence">
                  {{ Math.round(box.confidence * 100) }}%
                </span>
              </div>
            </div>
          </template>

          <!-- Preview mode (default) -->
          <template v-else>
            <div v-if="!enlargedImage" class="lightbox-loading">Loading preview...</div>
            <div v-else class="lightbox-image-container">
              <img :src="enlargedImage" :alt="enlargedEvent?.type || 'Event image'" class="lightbox-image" />
              <!-- Bounding box overlay -->
              <svg
                v-if="enlargedBoundingBoxes.length > 0"
                class="bounding-box-overlay"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                data-testid="bounding-box-overlay"
              >
                <rect
                  v-for="(box, index) in enlargedBoundingBoxes"
                  :key="index"
                  :x="box.x * NORMALIZED_TO_PERCENT"
                  :y="box.y * NORMALIZED_TO_PERCENT"
                  :width="box.width * NORMALIZED_TO_PERCENT"
                  :height="box.height * NORMALIZED_TO_PERCENT"
                  class="bounding-box"
                  data-testid="bounding-box"
                />
              </svg>
              <!-- Bounding box labels -->
              <div
                v-for="(box, index) in enlargedBoundingBoxes"
                :key="'label-' + index"
                class="bounding-box-label"
                :style="{
                  left: (box.x * NORMALIZED_TO_PERCENT) + '%',
                  top: (box.y * NORMALIZED_TO_PERCENT) + '%'
                }"
                data-testid="bounding-box-label"
              >
                {{ box.label || 'Object' }}
                <span v-if="box.confidence" class="confidence">
                  {{ Math.round(box.confidence * 100) }}%
                </span>
              </div>
            </div>
          </template>

          <div v-if="enlargedEvent" class="lightbox-info">
            <div class="lightbox-event-line">
              <span class="lightbox-camera-info">{{ camera.name }} ({{ camera.id }})</span>
              <span class="lightbox-separator">|</span>
              <span class="lightbox-event-type">{{ getEventTypeName(enlargedEvent.type) }}</span>
            </div>
            <div class="lightbox-event-time">{{ formatTimestamp(enlargedEvent.startTimestamp) }}</div>
            <div v-if="enlargedBoundingBoxes.length > 0" class="lightbox-detections" data-testid="lightbox-detections">
              {{ enlargedBoundingBoxes.length }} detection{{ enlargedBoundingBoxes.length !== 1 ? 's' : '' }}
            </div>
          </div>
        </div>
      </div>

      <!-- JSON viewer lightbox -->
      <div
        v-if="jsonViewerEventId"
        class="json-viewer-overlay"
        @click.self="closeJsonViewer"
        data-testid="json-viewer-overlay"
      >
        <div class="json-viewer-content">
          <div class="json-viewer-header">
            <h3>Event JSON Data</h3>
            <div class="json-viewer-actions">
              <button
                class="copy-button"
                :class="{ success: copySuccess }"
                @click="copyJsonToClipboard"
                data-testid="copy-json-button"
              >
                {{ copySuccess ? 'Copied!' : 'Copy' }}
              </button>
              <button
                class="json-viewer-close"
                @click="closeJsonViewer"
                aria-label="Close JSON viewer"
                data-testid="json-viewer-close"
              >&times;</button>
            </div>
          </div>
          <div v-if="jsonViewerDataSchemas.length > 0" class="json-viewer-schemas" data-testid="json-viewer-schemas">
            <span class="schemas-label">Data Schemas:</span>
            <div class="schemas-list">
              <span
                v-for="schema in jsonViewerDataSchemas"
                :key="schema"
                class="schema-tag"
              >{{ schema }}</span>
            </div>
          </div>
          <div class="json-viewer-body">
            <div v-if="jsonViewerLoading" class="json-viewer-loading">
              Loading full event details...
            </div>
            <div v-else-if="jsonViewerError" class="json-viewer-error">
              Error: {{ jsonViewerError }}
            </div>
            <pre v-else><code>{{ jsonViewerContent }}</code></pre>
          </div>
          <div v-if="jsonViewerEvent" class="json-viewer-footer">
            <span class="json-event-type">{{ getEventTypeName(jsonViewerEvent.type) }}</span>
            <span class="json-event-time">{{ formatTimestamp(jsonViewerEvent.startTimestamp) }}</span>
            <span v-if="jsonViewerFullEvent" class="json-full-indicator">Full data loaded</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

.modal {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.camera-id {
  font-size: 0.8rem;
  color: #666;
  font-family: monospace;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  color: #666;
  line-height: 1;
}

.close-button:hover {
  color: #333;
}

.modal-filters {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  background: #f9f9f9;
}

.filter-row {
  margin-bottom: 10px;
}

.filter-row:last-child {
  margin-bottom: 0;
}

.filter-row label {
  display: block;
  font-weight: 600;
  margin-bottom: 5px;
  font-size: 0.9rem;
}

.filter-row select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  width: 200px;
}

.event-type-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  max-height: 100px;
  overflow-y: auto;
  padding: 5px 0;
}

.event-type-checkbox {
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: normal;
  font-size: 0.85rem;
  padding: 4px 8px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.event-type-checkbox:hover {
  background: #f0f0f0;
}

.event-type-checkbox.select-all {
  background: #e8f5e9;
  border-color: #42b883;
}

.event-type-checkbox input {
  margin: 0;
}

.loading-types,
.no-types {
  color: #666;
  font-size: 0.9rem;
  font-style: italic;
}

.error-types {
  color: #c0392b;
  font-size: 0.9rem;
  font-weight: 500;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.loading,
.no-events {
  text-align: center;
  color: #666;
  padding: 40px;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.event-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #fff;
}

.event-item:hover {
  border-color: #ddd;
  background: #fafafa;
}

.event-thumbnail {
  width: 120px;
  height: 80px;
  flex-shrink: 0;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.event-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-thumbnail {
  color: #999;
  font-size: 0.8rem;
}

.loading-image {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.event-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.event-type {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 5px;
}

.event-time {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 3px;
}

.event-id {
  color: #999;
  font-size: 0.75rem;
  font-family: monospace;
}

.load-more {
  margin-top: 20px;
  text-align: center;
}

.load-more button {
  min-width: 150px;
}

/* Clickable thumbnail */
.event-thumbnail.clickable {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.event-thumbnail.clickable:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
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
  z-index: 2000;
}

.lightbox-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.lightbox-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 15px;
}

.lightbox-buttons {
  display: flex;
  gap: 10px;
}

.media-button {
  padding: 8px 16px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  opacity: 0.7;
  transition: opacity 0.2s, background 0.2s;
}

.media-button:hover {
  opacity: 1;
}

.media-button.active {
  opacity: 1;
  box-shadow: 0 0 0 2px white;
}

.media-button-hd {
  background: #3b82f6;
}

.media-button-video {
  background: #9b59b6;
}

.lightbox-close {
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

.lightbox-loading,
.lightbox-error {
  color: white;
  font-size: 1.1rem;
  padding: 40px;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-error {
  color: #ff6b6b;
}

.lightbox-video {
  max-width: 90vw;
  max-height: 70vh;
  width: 100%;
  background: #000;
  border-radius: 4px;
}

.lightbox-info {
  margin-top: 15px;
  text-align: center;
  color: white;
}

.lightbox-event-line {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 5px;
}

.lightbox-camera-info {
  color: #aaa;
  font-size: 0.95rem;
}

.lightbox-separator {
  color: #666;
}

.lightbox-event-type {
  font-weight: 600;
  font-size: 1.1rem;
}

.lightbox-event-time {
  color: #ccc;
  font-size: 0.9rem;
}

.lightbox-detections {
  color: #4CAF50;
  font-size: 0.85rem;
  margin-top: 5px;
}

/* Detection count in event list */
.event-detections {
  color: #4CAF50;
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 3px;
}

/* Lightbox image container for bounding box overlay */
.lightbox-image-container {
  position: relative;
  display: inline-block;
  max-width: 90vw;
  max-height: 80vh;
}

.lightbox-image-container .lightbox-image {
  display: block;
  max-width: 90vw;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 4px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

/* SVG overlay for bounding boxes */
.bounding-box-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.bounding-box {
  fill: none;
  stroke: #00FF00;
  stroke-width: 0.5;
  vector-effect: non-scaling-stroke;
}

/* Bounding box labels */
.bounding-box-label {
  position: absolute;
  background: rgba(0, 255, 0, 0.85);
  color: #000;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 2px;
  white-space: nowrap;
  transform: translateY(-100%);
  pointer-events: none;
}

.bounding-box-label .confidence {
  font-weight: normal;
  opacity: 0.8;
  margin-left: 4px;
}

/* Event type row with JSON button */
.event-type-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 5px;
}

.event-type-row .event-type {
  margin-bottom: 0;
  flex: 1;
}

/* JSON button on event cards */
.json-button {
  padding: 2px 5px;
  background: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-size: 0.65rem;
  font-family: monospace;
  color: #666;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
  line-height: 1;
}

.json-button:hover {
  background: #e0e0e0;
  border-color: #999;
  color: #333;
}

/* JSON viewer lightbox */
.json-viewer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2100;
}

.json-viewer-content {
  background: #1e1e1e;
  border-radius: 8px;
  width: 90%;
  max-width: 700px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.json-viewer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #333;
}

.json-viewer-header h3 {
  margin: 0;
  color: #fff;
  font-size: 1rem;
  font-weight: 500;
}

.json-viewer-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.copy-button {
  padding: 6px 14px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.copy-button:hover {
  background: #3aa876;
}

.copy-button.success {
  background: #2d8659;
}

.json-viewer-close {
  background: none;
  border: none;
  color: #aaa;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0 5px;
  line-height: 1;
}

.json-viewer-close:hover {
  color: #fff;
}

.json-viewer-schemas {
  padding: 12px 20px;
  border-bottom: 1px solid #333;
  background: #252525;
}

.schemas-label {
  color: #888;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
  margin-bottom: 8px;
}

.schemas-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.schema-tag {
  background: #333;
  color: #42b883;
  font-size: 0.7rem;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
  padding: 3px 8px;
  border-radius: 3px;
  border: 1px solid #444;
}

.json-viewer-body {
  flex: 1;
  overflow: auto;
  padding: 15px 20px;
}

.json-viewer-body pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.json-viewer-body code {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
  font-size: 0.8rem;
  line-height: 1.5;
  color: #d4d4d4;
}

.json-viewer-footer {
  padding: 12px 20px;
  border-top: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #888;
  font-size: 0.8rem;
}

.json-event-type {
  font-weight: 500;
  color: #aaa;
}

.json-event-time {
  color: #666;
}

.json-full-indicator {
  color: #42b883;
  font-size: 0.75rem;
  margin-left: auto;
}

.json-viewer-loading {
  color: #aaa;
  font-size: 0.9rem;
  text-align: center;
  padding: 40px 20px;
}

.json-viewer-error {
  color: #ff6b6b;
  font-size: 0.85rem;
  margin-bottom: 15px;
}
</style>
