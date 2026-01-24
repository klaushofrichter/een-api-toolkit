# Cameras & Bridges API - EEN API Toolkit

> **Version:** 0.3.34
>
> Complete reference for camera and bridge management.
> Load this document when working with devices.

---

## Camera Types

### Camera

```typescript
type CameraStatus =
  | 'online' | 'offline' | 'deviceOffline' | 'bridgeOffline'
  | 'invalidCredentials' | 'error' | 'streaming' | 'registered'
  | 'attaching' | 'initializing'

interface Camera {
  id: string
  name: string
  accountId: string
  bridgeId?: string | null
  locationId?: string | null
  status?: CameraStatus
  timezone?: string
  guid?: string
  ipAddress?: string
  macAddress?: string
  tags?: string[]
  notes?: string
  deviceInfo?: CameraDeviceInfo
  shareDetails?: CameraShareDetails
  devicePosition?: CameraDevicePosition
  createdAt?: string
  updatedAt?: string
}

interface CameraDeviceInfo {
  make?: string           // Manufacturer (e.g., "Axis")
  model?: string          // Model name
  firmwareVersion?: string
  directToCloud?: boolean // No bridge required
  serialNumber?: string
  resolution?: string
}
```

### Parameters

```typescript
interface ListCamerasParams {
  pageSize?: number           // Results per page
  pageToken?: string          // Pagination token
  include?: string[]          // Additional fields
  sort?: string[]             // Sort order
  status__in?: CameraStatus[] // Filter by status
  status__ne?: CameraStatus   // Exclude by status
  tags__contains?: string[]   // All tags must match
  tags__any?: string[]        // Any tag matches
  name__contains?: string     // Partial name match
  q?: string                  // Full-text search
  bridgeId__in?: string[]     // Filter by bridge
  locationId__in?: string[]   // Filter by location
}
```

---

## Bridge Types

### Bridge

```typescript
type BridgeStatus =
  | 'online' | 'offline' | 'error' | 'idle'
  | 'registered' | 'attaching' | 'initializing'

interface Bridge {
  id: string
  name: string
  accountId: string
  locationId?: string | null
  guid?: string
  timezone?: string
  status?: BridgeStatus | { connectionStatus?: BridgeStatus }
  tags?: string[]
  deviceInfo?: BridgeDeviceInfo
  networkInfo?: BridgeNetworkInfo
  cameraCount?: number
  createdAt?: string
  updatedAt?: string
}

interface BridgeNetworkInfo {
  localIpAddress?: string
  publicIpAddress?: string
  macAddress?: string
}
```

---

## Camera Functions

### getCameras(params?)

```typescript
import { getCameras } from 'een-api-toolkit'

// Basic usage
const { data, error } = await getCameras()

// Filter by status
const { data } = await getCameras({
  status__in: ['online', 'streaming']
})

// Full-text search
const { data } = await getCameras({
  q: 'front door',
  include: ['deviceInfo', 'status']
})

// Filter by tags
const { data } = await getCameras({
  tags__any: ['floor1', 'floor2']
})
```

### getCamera(cameraId, params?)

```typescript
import { getCamera } from 'een-api-toolkit'

const { data, error } = await getCamera('camera-id-123')

// With additional fields
const { data: detailed } = await getCamera('camera-id-123', {
  include: ['deviceInfo', 'status', 'shareDetails', 'tags']
})
```

---

## Bridge Functions

### getBridges(params?)

```typescript
import { getBridges } from 'een-api-toolkit'

// Basic usage
const { data, error } = await getBridges()

// Filter by status
const { data } = await getBridges({
  status__in: ['online'],
  include: ['deviceInfo', 'networkInfo']
})
```

### getBridge(bridgeId, params?)

```typescript
import { getBridge } from 'een-api-toolkit'

const { data, error } = await getBridge('bridge-id-123', {
  include: ['deviceInfo', 'networkInfo', 'status']
})
```

---

## Filter Patterns

| Filter | Example | Description |
|--------|---------|-------------|
| `status__in` | `['online', 'streaming']` | Include specific statuses |
| `status__ne` | `'offline'` | Exclude a status |
| `tags__contains` | `['outdoor']` | All tags must match |
| `tags__any` | `['floor1', 'floor2']` | Any tag matches |
| `name__contains` | `'lobby'` | Partial name match |
| `q` | `'front door'` | Full-text search |

---

## Vue Components

### Cameras.vue

```vue
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { getCameras, type Camera, type CameraStatus, type EenError, type ListCamerasParams } from 'een-api-toolkit'

// Status filter
const statusFilter = ref<CameraStatus | ''>('')

// Reactive state
const cameras = ref<Camera[]>([])
const loading = ref(false)
const error = ref<EenError | null>(null)
const nextPageToken = ref<string | undefined>(undefined)
const totalSize = ref<number | undefined>(undefined)

const hasNextPage = computed(() => !!nextPageToken.value)

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

function setParams(newParams: ListCamerasParams) {
  params.value = newParams
}

// Watch for status filter changes
watch(statusFilter, async (newStatus) => {
  if (newStatus) {
    setParams({
      pageSize: 20,
      include: ['deviceInfo', 'status'],
      status__in: [newStatus]
    })
  } else {
    setParams({
      pageSize: 20,
      include: ['deviceInfo', 'status']
    })
  }
  await fetchCameras()
})

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
  fetchCameras()
})
</script>

<template>
  <div class="cameras">
    <div class="header">
      <h2>Cameras</h2>
      <div class="controls">
        <select v-model="statusFilter" class="status-filter">
          <option value="">All Statuses</option>
          <option value="online">Online</option>
          <option value="streaming">Streaming</option>
          <option value="offline">Offline</option>
          <option value="deviceOffline">Device Offline</option>
          <option value="bridgeOffline">Bridge Offline</option>
          <option value="error">Error</option>
        </select>
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
            <span :class="['status-badge', getStatusClass(camera.status)]">
              {{ getStatusString(camera.status) || 'Unknown' }}
            </span>
          </div>
          <div class="camera-details">
            <p v-if="camera.deviceInfo?.make || camera.deviceInfo?.model">
              <strong>Device:</strong>
              {{ camera.deviceInfo?.make || '' }} {{ camera.deviceInfo?.model || '' }}
            </p>
            <p v-if="camera.locationId">
              <strong>Location:</strong> {{ camera.locationId }}
            </p>
            <p v-if="camera.tags && camera.tags.length > 0">
              <strong>Tags:</strong> {{ camera.tags.join(', ') }}
            </p>
          </div>
        </router-link>
      </div>

      <p v-else class="no-cameras">
        No cameras found{{ statusFilter ? ' with selected filter' : '' }}.
      </p>

      <div v-if="hasNextPage" class="pagination">
        <button @click="fetchNextPage" :disabled="loading">
          {{ loading ? 'Loading...' : 'Load More' }}
        </button>
      </div>
    </div>
  </div>
</template>
```

### Bridges.vue

```vue
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
```

---

## Reference Examples

- `examples/vue-cameras/`
- `examples/vue-bridges/`
