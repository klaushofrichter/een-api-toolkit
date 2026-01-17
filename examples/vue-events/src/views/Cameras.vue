<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getCameras, type Camera, type CameraStatus, type EenError, type ListCamerasParams } from 'een-api-toolkit'
import EventsModal from '../components/EventsModal.vue'

// Reactive state
const cameras = ref<Camera[]>([])
const loading = ref(false)
const error = ref<EenError | null>(null)
const nextPageToken = ref<string | undefined>(undefined)

// Modal state
const selectedCamera = ref<Camera | null>(null)
const showEventsModal = ref(false)

const params = ref<ListCamerasParams>({
  pageSize: 20,
  include: ['deviceInfo', 'status']
})

async function fetchCameras(fetchParams?: ListCamerasParams, append = false) {
  loading.value = true
  error.value = null

  const mergedParams = { ...params.value, ...fetchParams }
  const result = await getCameras(mergedParams)

  if (result.error) {
    error.value = result.error
    if (!append) {
      cameras.value = []
    }
    nextPageToken.value = undefined
  } else {
    if (append) {
      cameras.value = [...cameras.value, ...result.data.results]
    } else {
      cameras.value = result.data.results
    }
    nextPageToken.value = result.data.nextPageToken
  }

  loading.value = false
  return result
}

function refresh() {
  return fetchCameras()
}

async function fetchNextPage() {
  if (!nextPageToken.value) return
  return fetchCameras({ ...params.value, pageToken: nextPageToken.value }, true)
}

// Helper to extract status string from the union type
function getStatusString(status?: CameraStatus | { connectionStatus?: CameraStatus }): CameraStatus | undefined {
  if (!status) return undefined
  if (typeof status === 'string') return status
  return status.connectionStatus
}

// Get status badge class
function getStatusClass(status?: CameraStatus | { connectionStatus?: CameraStatus }): string {
  const statusStr = getStatusString(status)
  switch (statusStr) {
    case 'online':
    case 'streaming':
      return 'status-online'
    case 'offline':
    case 'deviceOffline':
    case 'bridgeOffline':
      return 'status-offline'
    case 'error':
    case 'invalidCredentials':
      return 'status-error'
    default:
      return 'status-unknown'
  }
}

function openEventsModal(camera: Camera) {
  selectedCamera.value = camera
  showEventsModal.value = true
}

function closeEventsModal() {
  showEventsModal.value = false
  selectedCamera.value = null
}

onMounted(() => {
  fetchCameras()
})
</script>

<template>
  <div class="cameras">
    <div class="header">
      <h2>Cameras</h2>
      <div class="controls">
        <button @click="refresh" :disabled="loading">
          {{ loading ? 'Loading...' : 'Refresh' }}
        </button>
      </div>
    </div>

    <p class="hint">Click on a camera to view its events</p>

    <div v-if="loading && cameras.length === 0" class="loading">
      Loading cameras...
    </div>

    <div v-else-if="error" class="error">
      Error: {{ error.message }}
    </div>

    <div v-else>
      <div v-if="cameras.length > 0" class="camera-grid">
        <div
          v-for="camera in cameras"
          :key="camera.id"
          class="camera-card"
          @click="openEventsModal(camera)"
        >
          <div class="camera-header">
            <h3>{{ camera.name }}</h3>
            <span :class="['status-badge', getStatusClass(camera.status)]">
              {{ getStatusString(camera.status) || 'Unknown' }}
            </span>
          </div>
          <div class="camera-details">
            <p v-if="camera.deviceInfo?.make || camera.deviceInfo?.model">
              <strong>Device:</strong>
              {{ camera.deviceInfo?.make || '' }} {{ camera.deviceInfo?.model || '' }}
            </p>
            <p class="camera-id">
              <strong>ID:</strong> {{ camera.id }}
            </p>
          </div>
          <div class="view-events">
            View Events
          </div>
        </div>
      </div>

      <p v-else class="no-cameras">
        No cameras found.
      </p>

      <div v-if="nextPageToken" class="pagination">
        <button @click="fetchNextPage" :disabled="loading">
          {{ loading ? 'Loading...' : 'Load More' }}
        </button>
      </div>
    </div>

    <!-- Events Modal -->
    <EventsModal
      v-if="selectedCamera"
      :camera="selectedCamera"
      :is-open="showEventsModal"
      @close="closeEventsModal"
    />
  </div>
</template>

<style scoped>
.cameras {
  max-width: 1000px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.hint {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 20px;
}

.camera-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.camera-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: box-shadow 0.2s, border-color 0.2s;
}

.camera-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #42b883;
}

.camera-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.camera-header h3 {
  margin: 0;
  font-size: 1.1rem;
  flex: 1;
  margin-right: 10px;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
}

.status-online {
  background: #d4edda;
  color: #155724;
}

.status-offline {
  background: #f8d7da;
  color: #721c24;
}

.status-error {
  background: #fff3cd;
  color: #856404;
}

.status-unknown {
  background: #e2e3e5;
  color: #383d41;
}

.camera-details p {
  margin: 5px 0;
  font-size: 0.9rem;
  color: #666;
}

.camera-details strong {
  color: #333;
}

.camera-id {
  font-family: monospace;
  font-size: 0.8rem !important;
}

.view-events {
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid #eee;
  color: #42b883;
  font-weight: 600;
  text-align: center;
  font-size: 0.9rem;
}

.no-cameras {
  text-align: center;
  color: #666;
  padding: 40px;
}

.pagination {
  margin-top: 30px;
  text-align: center;
}
</style>
