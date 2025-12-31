<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getBridge, type Bridge, type BridgeStatus, type EenError } from 'een-api-toolkit'

const route = useRoute()
const router = useRouter()

const bridge = ref<Bridge | null>(null)
const loading = ref(false)
const error = ref<EenError | null>(null)

async function fetchBridge() {
  const bridgeId = route.params.id as string
  if (!bridgeId) {
    error.value = { code: 'VALIDATION_ERROR', message: 'Bridge ID is required' }
    return
  }

  loading.value = true
  error.value = null

  const result = await getBridge(bridgeId, {
    include: ['deviceInfo', 'networkInfo', 'status', 'devicePosition']
  })

  if (result.error) {
    error.value = result.error
    bridge.value = null
  } else {
    bridge.value = result.data
  }

  loading.value = false
}

// Helper to extract status string from the union type
function getStatusString(status?: BridgeStatus | { connectionStatus?: BridgeStatus }): BridgeStatus | undefined {
  if (!status) return undefined
  if (typeof status === 'string') return status
  return status.connectionStatus
}

// Get status badge class
function getStatusClass(status?: BridgeStatus | { connectionStatus?: BridgeStatus }): string {
  const statusStr = getStatusString(status)
  switch (statusStr) {
    case 'online':
      return 'status-online'
    case 'offline':
      return 'status-offline'
    case 'error':
      return 'status-error'
    default:
      return 'status-unknown'
  }
}

function goBack() {
  router.push('/bridges')
}

onMounted(() => {
  fetchBridge()
})
</script>

<template>
  <div class="bridge-detail">
    <button @click="goBack" class="back-button">&larr; Back to Bridges</button>

    <div v-if="loading" class="loading">
      Loading bridge details...
    </div>

    <div v-else-if="error" class="error">
      <h2>Error</h2>
      <p>{{ error.message }}</p>
      <button @click="goBack">Back to Bridges</button>
    </div>

    <div v-else-if="bridge" class="bridge-info">
      <div class="bridge-header">
        <h2>{{ bridge.name }}</h2>
        <span :class="['status-badge', getStatusClass(bridge.status)]">
          {{ getStatusString(bridge.status) || 'Unknown' }}
        </span>
      </div>

      <div class="info-section">
        <h3>Basic Information</h3>
        <dl>
          <dt>ID</dt>
          <dd>{{ bridge.id }}</dd>

          <dt>Account ID</dt>
          <dd>{{ bridge.accountId }}</dd>

          <dt v-if="bridge.locationId">Location ID</dt>
          <dd v-if="bridge.locationId">{{ bridge.locationId }}</dd>

          <dt v-if="bridge.timezone">Timezone</dt>
          <dd v-if="bridge.timezone">{{ bridge.timezone }}</dd>

          <dt v-if="bridge.tags?.length">Tags</dt>
          <dd v-if="bridge.tags?.length">{{ bridge.tags.join(', ') }}</dd>
        </dl>
      </div>

      <div v-if="bridge.deviceInfo" class="info-section">
        <h3>Device Information</h3>
        <dl>
          <dt v-if="bridge.deviceInfo.make">Make</dt>
          <dd v-if="bridge.deviceInfo.make">{{ bridge.deviceInfo.make }}</dd>

          <dt v-if="bridge.deviceInfo.model">Model</dt>
          <dd v-if="bridge.deviceInfo.model">{{ bridge.deviceInfo.model }}</dd>

          <dt v-if="bridge.deviceInfo.serialNumber">Serial Number</dt>
          <dd v-if="bridge.deviceInfo.serialNumber">{{ bridge.deviceInfo.serialNumber }}</dd>

          <dt v-if="bridge.deviceInfo.firmwareVersion">Firmware Version</dt>
          <dd v-if="bridge.deviceInfo.firmwareVersion">{{ bridge.deviceInfo.firmwareVersion }}</dd>

          <dt v-if="bridge.deviceInfo.hardwareVersion">Hardware Version</dt>
          <dd v-if="bridge.deviceInfo.hardwareVersion">{{ bridge.deviceInfo.hardwareVersion }}</dd>
        </dl>
      </div>

      <div v-if="bridge.networkInfo" class="info-section">
        <h3>Network Information</h3>
        <dl>
          <dt v-if="bridge.networkInfo.localIpAddress">Local IP</dt>
          <dd v-if="bridge.networkInfo.localIpAddress">{{ bridge.networkInfo.localIpAddress }}</dd>

          <dt v-if="bridge.networkInfo.publicIpAddress">Public IP</dt>
          <dd v-if="bridge.networkInfo.publicIpAddress">{{ bridge.networkInfo.publicIpAddress }}</dd>

          <dt v-if="bridge.networkInfo.macAddress">MAC Address</dt>
          <dd v-if="bridge.networkInfo.macAddress">{{ bridge.networkInfo.macAddress }}</dd>

          <dt v-if="bridge.networkInfo.gateway">Gateway</dt>
          <dd v-if="bridge.networkInfo.gateway">{{ bridge.networkInfo.gateway }}</dd>

          <dt v-if="bridge.networkInfo.subnetMask">Subnet Mask</dt>
          <dd v-if="bridge.networkInfo.subnetMask">{{ bridge.networkInfo.subnetMask }}</dd>
        </dl>
      </div>

      <div v-if="bridge.devicePosition" class="info-section">
        <h3>Location</h3>
        <dl>
          <dt v-if="bridge.devicePosition.latitude !== undefined">Latitude</dt>
          <dd v-if="bridge.devicePosition.latitude !== undefined">{{ bridge.devicePosition.latitude }}</dd>

          <dt v-if="bridge.devicePosition.longitude !== undefined">Longitude</dt>
          <dd v-if="bridge.devicePosition.longitude !== undefined">{{ bridge.devicePosition.longitude }}</dd>

          <dt v-if="bridge.devicePosition.floor !== undefined">Floor</dt>
          <dd v-if="bridge.devicePosition.floor !== undefined">{{ bridge.devicePosition.floor }}</dd>
        </dl>
      </div>

      <div class="info-section">
        <h3>Timestamps</h3>
        <dl>
          <dt v-if="bridge.createdAt">Created</dt>
          <dd v-if="bridge.createdAt">{{ new Date(bridge.createdAt).toLocaleString() }}</dd>

          <dt v-if="bridge.updatedAt">Updated</dt>
          <dd v-if="bridge.updatedAt">{{ new Date(bridge.updatedAt).toLocaleString() }}</dd>
        </dl>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bridge-detail {
  max-width: 800px;
  margin: 0 auto;
}

.back-button {
  margin-bottom: 20px;
  background: #666;
}

.back-button:hover {
  background: #555;
}

.bridge-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.bridge-header h2 {
  margin: 0;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.85rem;
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

.info-section {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.info-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.1rem;
  color: #333;
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
}

dl {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 10px;
  margin: 0;
}

dt {
  font-weight: 600;
  color: #555;
}

dd {
  margin: 0;
  color: #333;
  word-break: break-all;
}

.error {
  text-align: center;
  padding: 40px;
}

.error h2 {
  color: #e74c3c;
  margin-bottom: 10px;
}

.error p {
  margin-bottom: 20px;
}
</style>
