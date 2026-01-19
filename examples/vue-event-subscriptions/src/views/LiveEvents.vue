<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  listEventSubscriptions,
  connectToEventSubscription,
  type EventSubscription,
  type SSEConnection,
  type SSEConnectionStatus,
  type SSEEvent,
  type EenError
} from 'een-api-toolkit'

const route = useRoute()

// Subscriptions state
const subscriptions = ref<EventSubscription[]>([])
const selectedSubscriptionId = ref<string | null>(null)
const loadingSubscriptions = ref(false)

// Connection state
const connection = ref<SSEConnection | null>(null)
const connectionStatus = ref<SSEConnectionStatus>('disconnected')
const connectionError = ref<EenError | null>(null)

// Events state
const events = ref<SSEEvent[]>([])
const maxEvents = 100

// Modal state
const selectedEvent = ref<SSEEvent | null>(null)
const showModal = ref(false)

const selectedSubscription = computed(() => {
  return subscriptions.value.find(s => s.id === selectedSubscriptionId.value)
})

const canConnect = computed(() => {
  if (!selectedSubscription.value) return false
  if (selectedSubscription.value.deliveryConfig.type !== 'serverSentEvents.v1') return false
  return !!selectedSubscription.value.deliveryConfig.sseUrl
})

const isConnected = computed(() => connectionStatus.value === 'connected')
const isConnecting = computed(() => connectionStatus.value === 'connecting')

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

function connect() {
  if (!canConnect.value || !selectedSubscription.value) return

  const sseUrl = selectedSubscription.value.deliveryConfig.type === 'serverSentEvents.v1'
    ? selectedSubscription.value.deliveryConfig.sseUrl
    : undefined

  if (!sseUrl) return

  connectionError.value = null
  events.value = []

  const result = connectToEventSubscription(sseUrl, {
    onEvent: (event) => {
      // Add new event at the beginning
      events.value = [event, ...events.value.slice(0, maxEvents - 1)]
    },
    onError: (error) => {
      connectionError.value = { code: 'NETWORK_ERROR', message: error.message }
    },
    onStatusChange: (status) => {
      connectionStatus.value = status
    }
  })

  if (result.error) {
    connectionError.value = result.error
  } else {
    connection.value = result.data
  }
}

function disconnect() {
  if (connection.value) {
    connection.value.close()
    connection.value = null
  }
}

function clearEvents() {
  events.value = []
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
}

function closeModal() {
  showModal.value = false
  selectedEvent.value = null
}

function handleModalBackdropClick(e: MouseEvent) {
  if ((e.target as HTMLElement).classList.contains('modal-backdrop')) {
    closeModal()
  }
}

// Load subscriptions on mount
onMounted(async () => {
  await loadSubscriptions()

  // Check for subscriptionId in query params
  const queryId = route.query.subscriptionId as string | undefined
  if (queryId) {
    selectedSubscriptionId.value = queryId
  }
})

// Clean up connection on unmount
onUnmounted(() => {
  disconnect()
})

// Auto-disconnect when changing subscription
watch(selectedSubscriptionId, () => {
  if (connection.value) {
    disconnect()
  }
  events.value = []
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
    </div>

    <!-- Event Details Modal -->
    <div
      v-if="showModal && selectedEvent"
      class="modal-backdrop"
      @click="handleModalBackdropClick"
    >
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ formatEventType(selectedEvent.type) }}</h3>
          <button class="modal-close" @click="closeModal">&times;</button>
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
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e2e3e5;
  background: #f8f9fa;
}

.modal-header h3 {
  margin: 0;
  color: #42b883;
}

.modal-close {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #666;
  padding: 0;
  line-height: 1;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.15s ease;
}

.modal-close:hover {
  background: #e2e3e5;
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
</style>
