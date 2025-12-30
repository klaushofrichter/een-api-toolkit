<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getCamera, type Camera, type CameraStatus, type EenError } from 'een-api-toolkit'

const route = useRoute()

// Reactive state
const camera = ref<Camera | null>(null)
const loading = ref(false)
const error = ref<EenError | null>(null)

async function fetchCamera() {
  const id = route.params.id as string
  if (!id) {
    error.value = { code: 'VALIDATION_ERROR', message: 'Camera ID is required' }
    return
  }

  loading.value = true
  error.value = null

  const result = await getCamera(id, {
    include: ['deviceInfo', 'status', 'shareDetails', 'devicePosition', 'networkInfo', 'tags']
  })

  if (result.error) {
    error.value = result.error
    camera.value = null
  } else {
    camera.value = result.data
  }

  loading.value = false
}

function refresh() {
  return fetchCamera()
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

onMounted(() => {
  fetchCamera()
})

// Watch for route param changes
watch(
  () => route.params.id,
  (newId, oldId) => {
    if (newId && newId !== oldId) {
      fetchCamera()
    }
  }
)
</script>

<template>
  <div class="camera-detail">
    <div class="nav-back">
      <router-link to="/cameras">&larr; Back to Cameras</router-link>
    </div>

    <div v-if="loading" class="loading">
      Loading camera details...
    </div>

    <div v-else-if="error" class="error">
      Error: {{ error.message }}
    </div>

    <div v-else-if="camera" class="camera-info">
      <div class="header">
        <div>
          <h2>{{ camera.name }}</h2>
          <p class="camera-id">ID: {{ camera.id }}</p>
        </div>
        <div class="header-actions">
          <span :class="['status-badge', getStatusClass(camera.status)]">
            {{ getStatusString(camera.status) || 'Unknown' }}
          </span>
          <button @click="refresh">Refresh</button>
        </div>
      </div>

      <div class="sections">
        <!-- Basic Info -->
        <section class="info-section">
          <h3>Basic Information</h3>
          <dl>
            <dt>Account ID</dt>
            <dd>{{ camera.accountId }}</dd>

            <dt>Bridge ID</dt>
            <dd>{{ camera.bridgeId || 'Direct to Cloud' }}</dd>

            <dt>Location ID</dt>
            <dd>{{ camera.locationId || 'Not assigned' }}</dd>

            <dt v-if="camera.timezone">Timezone</dt>
            <dd v-if="camera.timezone">{{ camera.timezone }}</dd>

            <dt v-if="camera.tags && camera.tags.length > 0">Tags</dt>
            <dd v-if="camera.tags && camera.tags.length > 0">
              <span v-for="tag in camera.tags" :key="tag" class="tag">{{ tag }}</span>
            </dd>
          </dl>
        </section>

        <!-- Device Info -->
        <section v-if="camera.deviceInfo" class="info-section">
          <h3>Device Information</h3>
          <dl>
            <dt v-if="camera.deviceInfo.make">Manufacturer</dt>
            <dd v-if="camera.deviceInfo.make">{{ camera.deviceInfo.make }}</dd>

            <dt v-if="camera.deviceInfo.model">Model</dt>
            <dd v-if="camera.deviceInfo.model">{{ camera.deviceInfo.model }}</dd>

            <dt v-if="camera.deviceInfo.firmwareVersion">Firmware</dt>
            <dd v-if="camera.deviceInfo.firmwareVersion">{{ camera.deviceInfo.firmwareVersion }}</dd>

            <dt v-if="camera.deviceInfo.serialNumber">Serial Number</dt>
            <dd v-if="camera.deviceInfo.serialNumber">{{ camera.deviceInfo.serialNumber }}</dd>

            <dt v-if="camera.deviceInfo.resolution">Resolution</dt>
            <dd v-if="camera.deviceInfo.resolution">{{ camera.deviceInfo.resolution }}</dd>

            <dt>Direct to Cloud</dt>
            <dd>{{ camera.deviceInfo.directToCloud ? 'Yes' : 'No' }}</dd>
          </dl>
        </section>

        <!-- Network Info -->
        <section v-if="camera.ipAddress || camera.macAddress" class="info-section">
          <h3>Network Information</h3>
          <dl>
            <dt v-if="camera.ipAddress">IP Address</dt>
            <dd v-if="camera.ipAddress">{{ camera.ipAddress }}</dd>

            <dt v-if="camera.macAddress">MAC Address</dt>
            <dd v-if="camera.macAddress">{{ camera.macAddress }}</dd>

            <dt v-if="camera.guid">GUID</dt>
            <dd v-if="camera.guid">{{ camera.guid }}</dd>
          </dl>
        </section>

        <!-- Share Details -->
        <section v-if="camera.shareDetails" class="info-section">
          <h3>Sharing</h3>
          <dl>
            <dt>Shared</dt>
            <dd>{{ camera.shareDetails.shared ? 'Yes' : 'No' }}</dd>

            <dt v-if="camera.shareDetails.accountId">Shared with Account</dt>
            <dd v-if="camera.shareDetails.accountId">{{ camera.shareDetails.accountId }}</dd>

            <dt v-if="camera.shareDetails.firstResponder !== undefined">First Responder</dt>
            <dd v-if="camera.shareDetails.firstResponder !== undefined">
              {{ camera.shareDetails.firstResponder ? 'Yes' : 'No' }}
            </dd>
          </dl>
        </section>

        <!-- Position -->
        <section v-if="camera.devicePosition" class="info-section">
          <h3>Location</h3>
          <dl>
            <dt v-if="camera.devicePosition.latitude !== undefined">Coordinates</dt>
            <dd v-if="camera.devicePosition.latitude !== undefined">
              {{ camera.devicePosition.latitude }}, {{ camera.devicePosition.longitude }}
            </dd>

            <dt v-if="camera.devicePosition.floor !== undefined">Floor</dt>
            <dd v-if="camera.devicePosition.floor !== undefined">{{ camera.devicePosition.floor }}</dd>

            <dt v-if="camera.devicePosition.azimuth !== undefined">Azimuth</dt>
            <dd v-if="camera.devicePosition.azimuth !== undefined">{{ camera.devicePosition.azimuth }}deg</dd>
          </dl>
        </section>

        <!-- Analytics -->
        <section v-if="camera.enabledAnalytics && camera.enabledAnalytics.length > 0" class="info-section">
          <h3>Analytics</h3>
          <div class="analytics-list">
            <span v-for="analytic in camera.enabledAnalytics" :key="analytic" class="analytic-badge">
              {{ analytic }}
            </span>
          </div>
        </section>

        <!-- Timestamps -->
        <section class="info-section">
          <h3>Timestamps</h3>
          <dl>
            <dt v-if="camera.createdAt">Created</dt>
            <dd v-if="camera.createdAt">{{ new Date(camera.createdAt).toLocaleString() }}</dd>

            <dt v-if="camera.updatedAt">Updated</dt>
            <dd v-if="camera.updatedAt">{{ new Date(camera.updatedAt).toLocaleString() }}</dd>
          </dl>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.camera-detail {
  max-width: 800px;
  margin: 0 auto;
}

.nav-back {
  margin-bottom: 20px;
}

.nav-back a {
  color: #42b883;
  text-decoration: none;
}

.nav-back a:hover {
  text-decoration: underline;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.header h2 {
  margin: 0 0 5px 0;
}

.camera-id {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
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

.sections {
  display: grid;
  gap: 25px;
}

.info-section {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
}

.info-section h3 {
  margin: 0 0 15px 0;
  font-size: 1rem;
  color: #333;
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
}

dl {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 10px 15px;
  margin: 0;
}

dt {
  font-weight: 600;
  color: #555;
}

dd {
  margin: 0;
  color: #333;
}

.tag {
  display: inline-block;
  background: #e0e0e0;
  padding: 2px 8px;
  border-radius: 3px;
  margin-right: 5px;
  font-size: 0.85rem;
}

.analytics-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.analytic-badge {
  background: #42b883;
  color: white;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.85rem;
}
</style>
