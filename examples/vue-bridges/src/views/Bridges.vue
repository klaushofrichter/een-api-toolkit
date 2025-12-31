<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { getBridges, type Bridge, type BridgeStatus, type EenError, type ListBridgesParams } from 'een-api-toolkit'

// Status filter
const statusFilter = ref<BridgeStatus | ''>('')

// Reactive state
const bridges = ref<Bridge[]>([])
const loading = ref(false)
const error = ref<EenError | null>(null)
const nextPageToken = ref<string | undefined>(undefined)
const totalSize = ref<number | undefined>(undefined)

const hasNextPage = computed(() => !!nextPageToken.value)

const params = ref<ListBridgesParams>({
  pageSize: 20,
  include: ['deviceInfo', 'status', 'networkInfo']
})

async function fetchBridges(fetchParams?: ListBridgesParams, append = false) {
  loading.value = true
  error.value = null

  const mergedParams = { ...params.value, ...fetchParams }
  const result = await getBridges(mergedParams)

  if (result.error) {
    error.value = result.error
    if (!append) {
      bridges.value = []
      totalSize.value = undefined
    }
    nextPageToken.value = undefined
  } else {
    if (append) {
      bridges.value = [...bridges.value, ...result.data.results]
    } else {
      bridges.value = result.data.results
    }
    nextPageToken.value = result.data.nextPageToken
    totalSize.value = result.data.totalSize
  }

  loading.value = false
  return result
}

function refresh() {
  return fetchBridges()
}

async function fetchNextPage() {
  if (!nextPageToken.value) return
  return fetchBridges({ ...params.value, pageToken: nextPageToken.value }, true)
}

function setParams(newParams: ListBridgesParams) {
  params.value = newParams
}

// Watch for status filter changes
watch(statusFilter, async (newStatus) => {
  if (newStatus) {
    setParams({
      pageSize: 20,
      include: ['deviceInfo', 'status', 'networkInfo'],
      status__in: [newStatus]
    })
  } else {
    setParams({
      pageSize: 20,
      include: ['deviceInfo', 'status', 'networkInfo']
    })
  }
  await fetchBridges()
})

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

onMounted(() => {
  fetchBridges()
})
</script>

<template>
  <div class="bridges">
    <div class="header">
      <h2>Bridges</h2>
      <div class="controls">
        <select v-model="statusFilter" class="status-filter">
          <option value="">All Statuses</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="error">Error</option>
          <option value="idle">Idle</option>
        </select>
        <button @click="refresh" :disabled="loading">
          {{ loading ? 'Loading...' : 'Refresh' }}
        </button>
      </div>
    </div>

    <div v-if="totalSize !== undefined" class="total-count">
      Total: {{ totalSize }} bridge{{ totalSize !== 1 ? 's' : '' }}
    </div>

    <div v-if="loading && bridges.length === 0" class="loading">
      Loading bridges...
    </div>

    <div v-else-if="error" class="error">
      Error: {{ error.message }}
    </div>

    <div v-else>
      <div v-if="bridges.length > 0" class="bridge-grid">
        <router-link
          v-for="bridge in bridges"
          :key="bridge.id"
          :to="`/bridges/${bridge.id}`"
          class="bridge-card"
        >
          <div class="bridge-header">
            <h3>{{ bridge.name }}</h3>
            <span :class="['status-badge', getStatusClass(bridge.status)]">
              {{ getStatusString(bridge.status) || 'Unknown' }}
            </span>
          </div>
          <div class="bridge-details">
            <p v-if="bridge.deviceInfo?.make || bridge.deviceInfo?.model">
              <strong>Device:</strong>
              {{ bridge.deviceInfo?.make || '' }} {{ bridge.deviceInfo?.model || '' }}
            </p>
            <p v-if="bridge.networkInfo?.localIpAddress">
              <strong>IP:</strong> {{ bridge.networkInfo.localIpAddress }}
            </p>
            <p v-if="bridge.locationId">
              <strong>Location:</strong> {{ bridge.locationId }}
            </p>
            <p v-if="bridge.tags && bridge.tags.length > 0">
              <strong>Tags:</strong> {{ bridge.tags.join(', ') }}
            </p>
          </div>
        </router-link>
      </div>

      <p v-else class="no-bridges">
        No bridges found{{ statusFilter ? ' with selected filter' : '' }}.
      </p>

      <div v-if="hasNextPage" class="pagination">
        <button @click="fetchNextPage" :disabled="loading">
          {{ loading ? 'Loading...' : 'Load More' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bridges {
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

.status-filter {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.total-count {
  color: #666;
  margin-bottom: 20px;
}

.bridge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.bridge-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
  text-decoration: none;
  color: inherit;
  transition: box-shadow 0.2s, border-color 0.2s;
}

.bridge-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #42b883;
}

.bridge-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.bridge-header h3 {
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

.bridge-details p {
  margin: 5px 0;
  font-size: 0.9rem;
  color: #666;
}

.bridge-details strong {
  color: #333;
}

.no-bridges {
  text-align: center;
  color: #666;
  padding: 40px;
}

.pagination {
  margin-top: 30px;
  text-align: center;
}
</style>
