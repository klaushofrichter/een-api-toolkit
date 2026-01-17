<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import {
  listEvents,
  listEventFieldValues,
  listEventTypes,
  getRecordedImage,
  type Camera,
  type Event,
  type EventType,
  type EenError
} from 'een-api-toolkit'

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
const enlargedEventId = ref<string | null>(null)

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

  const result = await listEvents({
    actor: `camera:${props.camera.id}`,
    type__in: selectedEventTypes.value,
    startTimestamp__gte: getStartTimestamp(timeRange.value),
    endTimestamp__lte: new Date().toISOString(),
    pageSize: 20,
    pageToken: append ? nextPageToken.value : undefined,
    sort: '-startTimestamp',
    include: ['data.een.fullFrameImageUrl.v1', 'data.een.croppedFrameImageUrl.v1']
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

// Load images for events using getRecordedImage API
async function loadEventImages(eventsToLoad: Event[]) {
  // Load images in parallel for all camera events
  const loadPromises = eventsToLoad
    .filter(event => event.actorType === 'camera')
    .map(async (event) => {
      // Skip if already loaded
      if (eventImages.value.has(event.id)) return

      const result = await getRecordedImage({
        deviceId: event.actorId,
        type: 'preview',
        timestamp__gte: event.startTimestamp
      })

      if (!result.error && result.data) {
        eventImages.value.set(event.id, result.data.imageData)
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
}

// Close enlarged image view
function closeEnlargedImage() {
  enlargedEventId.value = null
}

// Watch for modal open/close
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    events.value = []
    nextPageToken.value = undefined
    error.value = null
    eventImages.value.clear()

    await fetchEventTypeNames()
    await fetchAvailableEventTypes()

    if (availableEventTypes.value.length > 0) {
      await fetchEvents()
    }
  } else {
    // Clean up on modal close to free memory (base64 images can be large)
    eventImages.value.clear()
    events.value = []
    enlargedEventId.value = null
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
        <h2>Events: {{ camera.name }}</h2>
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
              <div class="event-type">{{ getEventTypeName(event.type) }}</div>
              <div class="event-time">{{ formatTimestamp(event.startTimestamp) }}</div>
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
        v-if="enlargedEventId && enlargedImage"
        class="lightbox-overlay"
        @click.self="closeEnlargedImage"
        data-testid="lightbox-overlay"
      >
        <div class="lightbox-content">
          <button class="lightbox-close" @click="closeEnlargedImage" data-testid="lightbox-close">&times;</button>
          <img :src="enlargedImage" :alt="enlargedEvent?.type || 'Event image'" class="lightbox-image" />
          <div v-if="enlargedEvent" class="lightbox-info">
            <div class="lightbox-event-type">{{ getEventTypeName(enlargedEvent.type) }}</div>
            <div class="lightbox-event-time">{{ formatTimestamp(enlargedEvent.startTimestamp) }}</div>
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

.lightbox-close {
  position: absolute;
  top: -40px;
  right: -10px;
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  padding: 5px 10px;
  line-height: 1;
  z-index: 2001;
}

.lightbox-close:hover {
  color: #ccc;
}

.lightbox-image {
  max-width: 90vw;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 4px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.lightbox-info {
  margin-top: 15px;
  text-align: center;
  color: white;
}

.lightbox-event-type {
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 5px;
}

.lightbox-event-time {
  color: #ccc;
  font-size: 0.9rem;
}
</style>
