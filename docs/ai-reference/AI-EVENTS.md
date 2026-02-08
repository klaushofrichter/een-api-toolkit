# Events, Alerts & Real-Time Streaming - EEN API Toolkit

> **Version:** 0.3.67
>
> Complete reference for events, alerts, metrics, and SSE subscriptions.
> Load this document when implementing event-driven features.

---

## Overview

| Concept | Description |
|---------|-------------|
| **Events** | Camera-generated occurrences (motion, analytics) |
| **Alerts** | Rule-triggered notifications |
| **Metrics** | Aggregated event counts over time |
| **Notifications** | User-facing alert messages |
| **Subscriptions** | Real-time SSE streams for events |

---

## Event Types

```typescript
type ActorType =
  | 'bridge' | 'camera' | 'speaker' | 'account' | 'user'
  | 'layout' | 'job' | 'measurement' | 'sensor' | 'gateway'

interface Event {
  id: string
  startTimestamp: string       // ISO 8601
  endTimestamp?: string | null
  span: boolean
  accountId: string
  actorId: string
  actorAccountId: string
  actorType: ActorType
  creatorId: string
  type: string                 // e.g., 'een.motionDetectionEvent.v1'
  dataSchemas: string[]
  data: EventData[]
}

interface ListEventsParams {
  actor: string                     // Required: 'camera:{id}' format
  type__in: string[]                // Required: event types to fetch
  startTimestamp__gte: string       // Required: ISO 8601 timestamp
  startTimestamp__lte?: string
  endTimestamp__gte?: string
  endTimestamp__lte?: string
  pageSize?: number
  pageToken?: string
  sort?: '+startTimestamp' | '-startTimestamp'
  include?: string[]                // e.g., ['data.een.fullFrameImageUrl.v1']
}
```

---

## Event Metrics Types

```typescript
type MetricDataPoint = [number, number]  // [timestamp_ms, count]

interface EventMetric {
  eventType: string
  actorId: string
  actorType: string
  dataPoints: MetricDataPoint[]
}

interface GetEventMetricsParams {
  actor: string                  // Required: 'camera:{id}'
  eventType: string              // Required: e.g., 'een.motionDetectionEvent.v1'
  timestamp__gte?: string        // Defaults to 7 days ago
  timestamp__lte?: string        // Defaults to now
  aggregateByMinutes?: number    // Default 60, minimum 60
}
```

---

## Alert Types

```typescript
interface Alert {
  id: string
  timestamp: string
  alertType: string
  alertName?: string
  actorId: string
  actorType: string
  actorName?: string
  priority?: number              // 0-20
  actions?: Record<string, AlertAction>
}

interface ListAlertsParams {
  timestamp__gte?: string
  timestamp__lte?: string
  alertType__in?: string[]
  actorId__in?: string[]
  priority__gte?: number
  include?: ('data' | 'actions')[]
  sort?: ('+timestamp' | '-timestamp')[]
}
```

---

## Event Subscription Types

```typescript
type EventSubscriptionLifecycle = 'temporary' | 'persistent'
type EventSubscriptionDeliveryType = 'serverSentEvents.v1' | 'webhook.v1'

interface EventSubscription {
  id: string
  subscriptionConfig?: {
    lifeCycle: EventSubscriptionLifecycle
    timeToLiveSeconds?: number
  }
  deliveryConfig: {
    type: EventSubscriptionDeliveryType
    sseUrl?: string              // SSE endpoint URL (for SSE type)
    secret?: string              // Webhook signature secret (for webhook type)
  }
}

interface EventTypeFilter {
  id: string                     // e.g., 'een.motionDetectionEvent.v1'
}

interface FilterCreate {
  actors: string[]               // e.g., ['camera:{id}']
  types: EventTypeFilter[]       // Event types to subscribe to
}

interface CreateEventSubscriptionParams {
  deliveryConfig: {
    type: 'serverSentEvents.v1'
  } | {
    type: 'webhook.v1'
    webhookUrl: string
    technicalContactEmail: string
    technicalContactName: string
  }
  filters: FilterCreate[]
}

type SSEConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

interface SSEConnection {
  close: () => void
  status: SSEConnectionStatus
}

interface SSEEvent {
  id: string
  type: string
  actorId: string
  actorType?: string
  startTimestamp: string
  endTimestamp?: string | null
  span?: boolean
  data?: Array<{ type: string; [key: string]: unknown }>
}
```

---

## Event Functions

### listEvents(params)

```typescript
import { listEvents, formatTimestamp } from 'een-api-toolkit'

const { data, error } = await listEvents({
  actor: `camera:${cameraId}`,
  type__in: ['een.motionDetectionEvent.v1'],
  startTimestamp__gte: formatTimestamp(startDate.toISOString()),
  include: ['data.een.fullFrameImageUrl.v1']
})
```

### getEventMetrics(params)

```typescript
import { getEventMetrics, formatTimestamp } from 'een-api-toolkit'

const { data, error } = await getEventMetrics({
  actor: `camera:${cameraId}`,
  eventType: 'een.motionDetectionEvent.v1',
  timestamp__gte: formatTimestamp(sevenDaysAgo.toISOString()),
  aggregateByMinutes: 60
})

// Convert to Chart.js format
const chartData = data.map(metric => ({
  x: new Date(metric.dataPoints[0][0]),
  y: metric.dataPoints[0][1]
}))
```

---

## Alert Functions

### listAlerts(params?)

```typescript
import { listAlerts, formatTimestamp } from 'een-api-toolkit'

const { data, error } = await listAlerts({
  timestamp__gte: formatTimestamp(startDate.toISOString()),
  actorId__in: [cameraId],
  include: ['actions'],
  sort: ['-timestamp']
})
```

---

## Notification Functions

### listNotifications(params?)

```typescript
import { listNotifications } from 'een-api-toolkit'

const { data, error } = await listNotifications({
  read: false,
  sort: ['-timestamp']
})
```

---

## Event Subscription Functions

### SSE Lifecycle

```typescript
import {
  createEventSubscription,
  connectToEventSubscription,
  deleteEventSubscription
} from 'een-api-toolkit'

// 1. Create subscription
const { data: subscription } = await createEventSubscription({
  deliveryConfig: { type: 'serverSentEvents.v1' },
  filters: [{
    actors: [`camera:${cameraId}`],
    types: [{ id: 'een.motionDetectionEvent.v1' }]
  }]
})

// 2. Connect to SSE stream
const { data: connection } = connectToEventSubscription(
  subscription.deliveryConfig.sseUrl,
  {
    onEvent: (event) => {
      console.log('Event received:', event)
    },
    onError: (error) => {
      console.error('SSE error:', error)
    },
    onStatusChange: (status) => {
      console.log('Connection status:', status)
    }
  }
)

// 3. Cleanup when done
connection.close()
await deleteEventSubscription(subscription.id)
```

---

## Vue Components

### EventsModal.vue

```vue
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
```

### MetricsChart.vue

```vue
<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js'
import { getEventMetrics, listEventFieldValues, type Camera, type EventMetric, type EenError } from 'een-api-toolkit'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
)

const props = defineProps<{
  camera: Camera
  timeRange: string
  aggregateMinutes?: number
}>()

interface DataPoint {
  timestamp: number
  count: number
}

const dataPoints = ref<DataPoint[]>([])
const eventTypes = ref<string[]>([])
const selectedEventType = ref<string>('')
const loadingEventTypes = ref(false)
const loadingMetrics = ref(false)
const error = ref<EenError | null>(null)

function getTimeRangeMs(range: string): number {
  switch (range) {
    case '1h': return 60 * 60 * 1000
    case '6h': return 6 * 60 * 60 * 1000
    case '24h': return 24 * 60 * 60 * 1000
    case '7d': return 7 * 24 * 60 * 60 * 1000
    case 'none': return 7 * 24 * 60 * 60 * 1000  // Default to 7 days when "none"
    default: return 7 * 24 * 60 * 60 * 1000
  }
}

function getAggregationMinutes(range: string): number {
  // Note: EEN API requires minimum 60 minute aggregation
  switch (range) {
    case '1h': return 60      // 1 hour bucket (1 data point)
    case '6h': return 60      // 1 hour buckets (6 data points)
    case '24h': return 60     // 1 hour buckets (24 data points)
    case '7d': return 360     // 6 hour buckets (28 data points)
    case 'none': return 360   // 6 hour buckets for 7 days default
    default: return 360
  }
}

function formatEventType(eventType: string): string {
  // Convert "een.motionDetectionEvent.v1" to "Motion Detection"
  const parts = eventType.split('.')
  if (parts.length >= 2) {
    const name = parts[1]
      .replace(/Event$/, '')
      .replace(/([A-Z])/g, ' $1')
      .trim()
    return name.charAt(0).toUpperCase() + name.slice(1)
  }
  return eventType
}

async function fetchEventTypes() {
  if (!props.camera?.id) return

  loadingEventTypes.value = true
  error.value = null
  eventTypes.value = []
  selectedEventType.value = ''
  dataPoints.value = []

  const result = await listEventFieldValues({
    actor: `camera:${props.camera.id}`
  })

  if (result.error) {
    error.value = result.error
    loadingEventTypes.value = false
    return
  }

  eventTypes.value = result.data?.type ?? []
  // Auto-select first event type if available
  if (eventTypes.value.length > 0) {
    selectedEventType.value = eventTypes.value[0]
    fetchMetrics()
  }
  loadingEventTypes.value = false
}

async function fetchMetrics() {
  if (!props.camera?.id || !selectedEventType.value) return

  loadingMetrics.value = true
  error.value = null
  dataPoints.value = []

  const now = new Date()
  const rangeMs = getTimeRangeMs(props.timeRange)
  const startTime = new Date(now.getTime() - rangeMs)
  // Use provided aggregateMinutes prop, or fall back to auto-calculated value
  const aggregateByMinutes = props.aggregateMinutes ?? getAggregationMinutes(props.timeRange)

  const result = await getEventMetrics({
    actor: `camera:${props.camera.id}`,
    eventType: selectedEventType.value,
    timestamp__gte: startTime.toISOString(),
    timestamp__lte: now.toISOString(),
    aggregateByMinutes
  })

  if (result.error) {
    error.value = result.error
    loadingMetrics.value = false
    return
  }

  // Transform API data to chart data points
  const metrics = result.data ?? []
  const nowMs = now.getTime()
  if (metrics.length > 0) {
    // Use the first metric's data points (for count target)
    const metric = metrics.find((m: EventMetric) => m.target === 'count') ?? metrics[0]
    // Defensive check for dataPoints array
    if (metric.dataPoints && Array.isArray(metric.dataPoints)) {
      // Filter out future data points
      dataPoints.value = metric.dataPoints
        .filter(([timestamp]) => timestamp <= nowMs)
        .map(([timestamp, count]) => ({
          timestamp,
          count
        }))
    }
  }

  loadingMetrics.value = false
}

function handleEventTypeChange() {
  if (selectedEventType.value) {
    fetchMetrics()
  }
}

const chartData = computed(() => {
  if (dataPoints.value.length === 0) {
    return {
      labels: [],
      datasets: []
    }
  }

  return {
    labels: dataPoints.value.map(({ timestamp }) => {
      const date = new Date(timestamp)
      // Use time-only format for short ranges, date+time for longer ranges (including 'none' which defaults to 7 days)
      if (props.timeRange === '1h' || props.timeRange === '6h') {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    }),
    datasets: [
      {
        label: formatEventType(selectedEventType.value),
        data: dataPoints.value.map(({ count }) => count),
        borderColor: '#42b883',
        backgroundColor: 'rgba(66, 184, 131, 0.1)',
        tension: 0.3,
        fill: true
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top' as const
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Event Count'
      }
    },
    x: {
      title: {
        display: true,
        text: 'Time'
      }
    }
  }
}

// Fetch event types when camera changes
watch(
  () => props.camera?.id,
  () => {
    fetchEventTypes()
  },
  { immediate: true }
)

// Fetch metrics when time range or aggregate changes (if event type is selected)
watch(
  () => [props.timeRange, props.aggregateMinutes],
  () => {
    if (selectedEventType.value) {
      fetchMetrics()
    }
  }
)
</script>

<template>
  <div class="metrics-chart" data-testid="metrics-chart">
    <div class="event-type-selector" data-testid="event-type-selector">
      <label for="event-type-select">Event Type:</label>
      <select
        id="event-type-select"
        v-model="selectedEventType"
        @change="handleEventTypeChange"
        :disabled="loadingEventTypes || eventTypes.length === 0"
        data-testid="event-type-select"
      >
        <option value="" disabled>
          {{ loadingEventTypes ? 'Loading event types...' : (eventTypes.length === 0 ? 'No event types available' : 'Select an event type') }}
        </option>
        <option
          v-for="et in eventTypes"
          :key="et"
          :value="et"
          data-testid="event-type-option"
        >
          {{ formatEventType(et) }} ({{ et }})
        </option>
      </select>
    </div>

    <div v-if="loadingMetrics" class="loading" data-testid="metrics-loading">
      Loading metrics...
    </div>
    <div v-else-if="error" class="error" data-testid="metrics-error">
      {{ error.message }}
    </div>
    <div v-else-if="!selectedEventType" class="no-data" data-testid="metrics-no-selection">
      Please select an event type to view metrics.
    </div>
    <div v-else-if="chartData.datasets.length === 0" class="no-data" data-testid="metrics-no-data">
      No event data available for this time range.
    </div>
    <div v-else class="chart-container">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>
```

### LiveEvents.vue

```vue
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

// Handle image click (preview or HD)
// Uses event.actorId and event.startTimestamp directly instead of parsing URL
async function handleImageClick(quality: 'preview' | 'main' = 'preview') {
  if (!selectedEvent.value) return

  // Use event properties directly for reliability
  const deviceId = selectedEvent.value.actorId
  const timestamp = selectedEvent.value.startTimestamp

  if (!deviceId || !timestamp) {
    return
  }

  loadingImage.value = true
  imageError.value = null
  lightboxImageUrl.value = null
  showLightbox.value = true
  showVideo.value = false

  // Use the toolkit's getRecordedImage function
  const result = await getRecordedImage({
    deviceId,
    type: quality,
    timestamp__gte: timestamp
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
// Uses event.actorId and event.startTimestamp directly instead of parsing URL
async function handleVideoClick() {
  if (!selectedEvent.value) return

  // Use event properties directly for reliability
  const deviceId = selectedEvent.value.actorId
  const timestamp = selectedEvent.value.startTimestamp

  if (!deviceId || !timestamp) {
    return
  }

  showVideo.value = true
  showLightbox.value = true

  // Use the composable to load and play video
  await loadVideo(deviceId, timestamp)
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
        <li>SSE subscriptions have a server-determined 15-minute TTL (not configurable) and expire if not connected.</li>
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
```

---

## Reference Examples

- `examples/vue-events/` - Event listing with bounding boxes
- `examples/vue-alerts-metrics/` - Metrics, alerts, notifications
- `examples/vue-event-subscriptions/` - Real-time SSE streaming
