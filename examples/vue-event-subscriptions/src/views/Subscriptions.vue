<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  listEventSubscriptions,
  createEventSubscription,
  deleteEventSubscription,
  getCameras,
  listEventTypes,
  type EventSubscription,
  type Camera,
  type EventType,
  type EenError,
  type ListEventSubscriptionsParams
} from 'een-api-toolkit'

// Subscriptions state
const subscriptions = ref<EventSubscription[]>([])
const loading = ref(false)
const error = ref<EenError | null>(null)
const nextPageToken = ref<string | undefined>(undefined)
const hasNextPage = computed(() => !!nextPageToken.value)

// Create form state
const cameras = ref<Camera[]>([])
const eventTypes = ref<EventType[]>([])
const selectedCameras = ref<string[]>([])
const selectedEventTypes = ref<string[]>([])
const creating = ref(false)
const createError = ref<EenError | null>(null)
const createSuccess = ref(false)

// Delete state
const deleting = ref<string | null>(null)

const params = ref<ListEventSubscriptionsParams>({ pageSize: 10 })

async function fetchSubscriptions(fetchParams?: ListEventSubscriptionsParams, append = false) {
  loading.value = true
  error.value = null

  const mergedParams = { ...params.value, ...fetchParams }
  const result = await listEventSubscriptions(mergedParams)

  if (result.error) {
    error.value = result.error
    if (!append) {
      subscriptions.value = []
    }
    nextPageToken.value = undefined
  } else {
    if (append) {
      subscriptions.value = [...subscriptions.value, ...result.data.results]
    } else {
      subscriptions.value = result.data.results
    }
    nextPageToken.value = result.data.nextPageToken
  }

  loading.value = false
  return result
}

function refresh() {
  return fetchSubscriptions()
}

async function fetchNextPage() {
  if (!nextPageToken.value) return
  return fetchSubscriptions({ ...params.value, pageToken: nextPageToken.value }, true)
}

/**
 * Validates and formats an actor ID for event subscriptions.
 * Actor IDs must follow the format "type:id" (e.g., "camera:abc123").
 * @param type - The actor type (e.g., "camera", "bridge")
 * @param id - The actor ID (alphanumeric, hyphens, underscores allowed)
 * @returns The formatted actor ID or null if invalid
 */
function formatActorId(type: string, id: string): string | null {
  // Validate actor type (only allow known types)
  const validTypes = ['camera', 'bridge', 'account', 'user']
  if (!validTypes.includes(type)) {
    return null
  }
  // Validate ID format (alphanumeric with hyphens and underscores)
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
    return null
  }
  return `${type}:${id}`
}

async function loadFormData() {
  // Load cameras
  const camerasResult = await getCameras({ pageSize: 100 })
  if (!camerasResult.error) {
    cameras.value = camerasResult.data.results
  }

  // Load event types
  const eventTypesResult = await listEventTypes({ pageSize: 100 })
  if (!eventTypesResult.error) {
    eventTypes.value = eventTypesResult.data.results
  }
}

async function handleCreate() {
  if (selectedCameras.value.length === 0 || selectedEventTypes.value.length === 0) {
    createError.value = { code: 'VALIDATION_ERROR', message: 'Please select at least one camera and one event type' }
    return
  }

  creating.value = true
  createError.value = null
  createSuccess.value = false

  // Validate and format actor IDs
  const actors: string[] = []
  for (const id of selectedCameras.value) {
    const actorId = formatActorId('camera', id)
    if (!actorId) {
      createError.value = { code: 'VALIDATION_ERROR', message: `Invalid camera ID format: ${id}` }
      creating.value = false
      return
    }
    actors.push(actorId)
  }

  const result = await createEventSubscription({
    deliveryConfig: { type: 'serverSentEvents.v1' },
    filters: [{
      actors,
      types: selectedEventTypes.value.map(type => ({ id: type }))
    }]
  })

  if (result.error) {
    createError.value = result.error
  } else {
    createSuccess.value = true
    selectedCameras.value = []
    selectedEventTypes.value = []
    // Refresh the list
    await fetchSubscriptions()
    // Hide success message after 3 seconds
    setTimeout(() => {
      createSuccess.value = false
    }, 3000)
  }

  creating.value = false
}

async function handleDelete(subscriptionId: string) {
  if (!confirm('Are you sure you want to delete this subscription?')) {
    return
  }

  deleting.value = subscriptionId
  const result = await deleteEventSubscription(subscriptionId)

  if (result.error) {
    error.value = result.error
  } else {
    // Remove from local list
    subscriptions.value = subscriptions.value.filter(s => s.id !== subscriptionId)
  }

  deleting.value = null
}

function getDeliveryType(sub: EventSubscription): string {
  return sub.deliveryConfig.type
}

function getSseUrl(sub: EventSubscription): string | undefined {
  if (sub.deliveryConfig.type === 'serverSentEvents.v1') {
    return sub.deliveryConfig.sseUrl
  }
  return undefined
}

onMounted(async () => {
  await Promise.all([
    fetchSubscriptions(),
    loadFormData()
  ])
})
</script>

<template>
  <div class="subscriptions">
    <div class="header">
      <h2>Event Subscriptions</h2>
      <button @click="refresh" :disabled="loading">
        {{ loading ? 'Loading...' : 'Refresh' }}
      </button>
    </div>

    <!-- Create Form -->
    <div class="create-form">
      <h3>Create New Subscription</h3>

      <div v-if="createError" class="error">
        Error: {{ createError.message }}
      </div>

      <div v-if="createSuccess" class="success">
        Subscription created successfully!
      </div>

      <div class="form-row">
        <label>Select Cameras:</label>
        <select v-model="selectedCameras" multiple data-testid="camera-select">
          <option v-for="camera in cameras" :key="camera.id" :value="camera.id">
            {{ camera.name || camera.id }}
          </option>
        </select>
        <small>Hold Ctrl/Cmd to select multiple</small>
      </div>

      <div class="form-row">
        <label>Select Event Types:</label>
        <select v-model="selectedEventTypes" multiple data-testid="event-type-select">
          <option v-for="eventType in eventTypes" :key="eventType.type" :value="eventType.type">
            {{ eventType.name }} ({{ eventType.type }})
          </option>
        </select>
        <small>Hold Ctrl/Cmd to select multiple</small>
      </div>

      <button
        @click="handleCreate"
        :disabled="creating || selectedCameras.length === 0 || selectedEventTypes.length === 0"
        data-testid="create-subscription-button"
      >
        {{ creating ? 'Creating...' : 'Create Subscription' }}
      </button>
    </div>

    <!-- Subscriptions List -->
    <div class="list-section">
      <h3>Active Subscriptions</h3>

      <div v-if="loading && subscriptions.length === 0" class="loading">
        Loading subscriptions...
      </div>

      <div v-else-if="error" class="error">
        Error: {{ error.message }}
      </div>

      <div v-else>
        <table v-if="subscriptions.length > 0" data-testid="subscriptions-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Lifecycle</th>
              <th>TTL</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sub in subscriptions" :key="sub.id">
              <td class="id-cell" :title="sub.id">{{ sub.id.slice(0, 12) }}...</td>
              <td>{{ getDeliveryType(sub) }}</td>
              <td>{{ sub.subscriptionConfig?.lifeCycle || '-' }}</td>
              <td>{{ sub.subscriptionConfig?.timeToLiveSeconds ? `${sub.subscriptionConfig.timeToLiveSeconds}s` : '-' }}</td>
              <td class="actions">
                <router-link
                  v-if="getSseUrl(sub)"
                  :to="{ path: '/live', query: { subscriptionId: sub.id } }"
                >
                  <button class="secondary small">Listen</button>
                </router-link>
                <button
                  class="danger small"
                  @click="handleDelete(sub.id)"
                  :disabled="deleting === sub.id"
                  :data-testid="`delete-${sub.id}`"
                >
                  {{ deleting === sub.id ? 'Deleting...' : 'Delete' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <p v-else class="no-data">No subscriptions found. Create one above to get started.</p>

        <div v-if="hasNextPage" class="pagination">
          <button @click="fetchNextPage" :disabled="loading">
            {{ loading ? 'Loading...' : 'Load More' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.subscriptions {
  max-width: 900px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.create-form {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.create-form h3 {
  margin-bottom: 15px;
}

.form-row {
  margin-bottom: 15px;
}

.form-row label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-row select {
  width: 100%;
  min-height: 100px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-row small {
  display: block;
  margin-top: 5px;
  color: #666;
  font-size: 12px;
}

.list-section {
  margin-top: 20px;
}

.list-section h3 {
  margin-bottom: 15px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background: #f5f5f5;
  font-weight: 600;
}

.id-cell {
  font-family: monospace;
  font-size: 12px;
}

.actions {
  display: flex;
  gap: 8px;
}

button.small {
  padding: 6px 12px;
  font-size: 12px;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}

.no-data {
  color: #666;
  font-style: italic;
  padding: 20px;
  text-align: center;
}
</style>
