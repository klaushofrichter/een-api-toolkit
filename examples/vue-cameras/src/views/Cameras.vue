<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getCameras, getCamera, getCameraSettings, type Camera, type CameraSettings, type EenError, type ListCamerasParams } from 'een-api-toolkit'

// Reactive state
const cameras = ref<Camera[]>([])
const loading = ref(false)
const error = ref<EenError | null>(null)
const nextPageToken = ref<string | undefined>(undefined)
const totalSize = ref<number | undefined>(undefined)

const hasNextPage = computed(() => !!nextPageToken.value)

// Detail modal state
const detailCamera = ref<Camera | null>(null)
const detailLoading = ref(false)
const detailError = ref<EenError | null>(null)
const showDetail = ref(false)
const detailLoadingId = ref<string | null>(null)

// Settings modal state
const settingsData = ref<CameraSettings | null>(null)
const settingsLoading = ref(false)
const settingsError = ref<EenError | null>(null)
const showSettings = ref(false)
const settingsLoadingId = ref<string | null>(null)

const settingsIncludes = ['schema', 'proposedValues']

async function fetchSettings(cameraId: string) {
  settingsLoading.value = true
  settingsLoadingId.value = cameraId
  settingsData.value = null
  settingsError.value = null
  showSettings.value = true

  const result = await getCameraSettings(cameraId, { include: settingsIncludes as ('schema' | 'proposedValues')[] })

  if (result.error) {
    settingsError.value = result.error
  } else {
    settingsData.value = result.data
  }

  settingsLoading.value = false
  settingsLoadingId.value = null
}

function closeSettings() {
  showSettings.value = false
  settingsData.value = null
  settingsError.value = null
}

const allCameraIncludes = [
  'bridge', 'account', 'status', 'locationSummary', 'deviceAddress',
  'timeZone', 'notes', 'tags', 'devicePosition', 'networkInfo',
  'deviceInfo', 'effectivePermissions', 'firmware', 'shareDetails',
  'visibleByBridges', 'capabilities', 'analog', 'packages',
  'dewarpConfig', 'adminCredentials', 'publicSafetySharing', 'enabledAnalytics'
]

async function fetchDetail(cameraId: string) {
  detailLoading.value = true
  detailLoadingId.value = cameraId
  detailCamera.value = null
  detailError.value = null
  showDetail.value = true

  const result = await getCamera(cameraId, { include: allCameraIncludes })

  if (result.error) {
    detailError.value = result.error
  } else {
    detailCamera.value = result.data
  }

  detailLoading.value = false
  detailLoadingId.value = null
}

function closeDetail() {
  showDetail.value = false
  detailCamera.value = null
  detailError.value = null
}

const params = ref<ListCamerasParams>({
  pageSize: 20
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
      totalSize.value = undefined
    }
    nextPageToken.value = undefined
  } else {
    if (append) {
      cameras.value = [...cameras.value, ...result.data.results]
    } else {
      cameras.value = result.data.results
    }
    nextPageToken.value = result.data.nextPageToken
    totalSize.value = result.data.totalSize
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

    <div v-if="totalSize !== undefined" class="total-count">
      Total: {{ totalSize }} camera{{ totalSize !== 1 ? 's' : '' }}
    </div>

    <div v-if="loading && cameras.length === 0" class="loading">
      Loading cameras...
    </div>

    <div v-else-if="error" class="error">
      Error: {{ error.message }}
    </div>

    <div v-else>
      <div v-if="cameras.length > 0" class="camera-grid">
        <router-link
          v-for="camera in cameras"
          :key="camera.id"
          :to="`/cameras/${camera.id}`"
          class="camera-card"
        >
          <div class="camera-header">
            <h3>{{ camera.name }}</h3>
          </div>
          <div class="camera-details">
            <p><strong>ID:</strong> {{ camera.id }}</p>
            <p><strong>Bridge:</strong> {{ camera.bridgeId || 'N/A' }}</p>
          </div>
          <div class="card-actions">
            <button
              class="details-btn"
              data-testid="details-btn"
              @click.prevent.stop="fetchDetail(camera.id)"
              :disabled="detailLoadingId === camera.id"
            >
              {{ detailLoadingId === camera.id ? 'Loading...' : 'Details' }}
            </button>
            <button
              class="settings-btn"
              data-testid="settings-btn"
              @click.prevent.stop="fetchSettings(camera.id)"
              :disabled="settingsLoadingId === camera.id"
            >
              {{ settingsLoadingId === camera.id ? 'Loading...' : 'Settings' }}
            </button>
          </div>
        </router-link>
      </div>

      <p v-else class="no-cameras">
        No cameras found.
      </p>

      <div v-if="hasNextPage" class="pagination">
        <button @click="fetchNextPage" :disabled="loading">
          {{ loading ? 'Loading...' : 'Load More' }}
        </button>
      </div>
    </div>
    <!-- Detail Modal -->
    <div v-if="showDetail" class="modal-overlay" data-testid="modal-overlay" @click.self="closeDetail">
      <div class="modal-content" data-testid="modal-content">
        <div class="modal-header">
          <h3>Camera Details</h3>
          <button class="modal-close" data-testid="modal-close-x" @click="closeDetail">&times;</button>
        </div>
        <div class="modal-includes" data-testid="modal-includes">
          <strong>Include:</strong> {{ allCameraIncludes.join(', ') }}
        </div>
        <div v-if="detailLoading" class="modal-loading" data-testid="modal-loading">Loading camera details...</div>
        <div v-else-if="detailError" class="modal-error" data-testid="modal-error">Error: {{ detailError.message }}</div>
        <pre v-else class="modal-pre" data-testid="modal-json">{{ JSON.stringify(detailCamera, null, 2) }}</pre>
        <div class="modal-footer">
          <button data-testid="modal-close-btn" @click="closeDetail">Close</button>
        </div>
      </div>
    </div>
    <!-- Settings Modal -->
    <div v-if="showSettings" class="modal-overlay" data-testid="settings-modal-overlay" @click.self="closeSettings">
      <div class="modal-content" data-testid="settings-modal-content">
        <div class="modal-header">
          <h3>Camera Settings</h3>
          <button class="modal-close" data-testid="settings-modal-close-x" @click="closeSettings">&times;</button>
        </div>
        <div class="modal-includes" data-testid="settings-modal-includes">
          <strong>Include:</strong> {{ settingsIncludes.join(', ') }}
        </div>
        <div v-if="settingsLoading" class="modal-loading" data-testid="settings-modal-loading">Loading camera settings...</div>
        <div v-else-if="settingsError" class="modal-error" data-testid="settings-modal-error">Error: {{ settingsError.message }}</div>
        <pre v-else class="modal-pre" data-testid="settings-modal-json">{{ JSON.stringify(settingsData, null, 2) }}</pre>
        <div class="modal-footer">
          <button data-testid="settings-modal-close-btn" @click="closeSettings">Close</button>
        </div>
      </div>
    </div>
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
  align-items: center;
}

.total-count {
  color: #666;
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
  text-decoration: none;
  color: inherit;
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
}

.camera-details p {
  margin: 5px 0;
  font-size: 0.9rem;
  color: #666;
}

.camera-details strong {
  color: #333;
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

.card-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.details-btn {
  padding: 6px 16px;
  background: #42b883;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
}

.details-btn:hover {
  background: #369970;
}

.details-btn:disabled {
  background: #a0d4bf;
  cursor: not-allowed;
}

.settings-btn {
  padding: 6px 16px;
  background: #3498db;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
}

.settings-btn:hover {
  background: #2980b9;
}

.settings-btn:disabled {
  background: #85c1e9;
  cursor: not-allowed;
}

.modal-overlay {
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
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  width: 80%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.modal-header h3 {
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0 4px;
}

.modal-close:hover {
  color: #333;
}

.modal-includes {
  font-size: 0.8rem;
  color: #555;
  background: #f0f0f0;
  padding: 8px 12px;
  border-radius: 4px;
  margin-bottom: 12px;
  word-break: break-word;
}

.modal-loading,
.modal-error {
  padding: 20px;
  text-align: center;
}

.modal-error {
  color: #dc3545;
}

.modal-pre {
  overflow: auto;
  flex: 1;
  background: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.85rem;
  margin: 0;
  white-space: pre;
}

.modal-footer {
  margin-top: 16px;
  text-align: right;
}
</style>
