# Cameras & Bridges API - EEN API Toolkit

> **Version:** 0.3.65
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

interface CameraSettings {
  data: CameraSettingsData
  schema?: object         // When include contains 'schema'
  proposedValues?: object // When include contains 'proposedValues'
}

interface CameraSettingsData {
  timeZone?: string
  rtsp?: CameraRtspConnectionSettings
  credentials?: { username?: string; password?: string }
  retention?: { cloudDays?: number; cloudPreviewOnly?: boolean; minimumOnPremiseDays?: number; maximumOnPremiseDays?: number; alwaysRecordingDays?: number }
  audio?: { microphoneEnabled?: boolean; inputSourceId?: string }
  previewVideo?: { transmitMode?: string; resolution?: string; intervalMs?: number; quality?: string; supportedResolutions?: string[] }
  mainVideo?: { transmitMode?: string; resolution?: string; quality?: string; kbpsFactor?: number; captureMode?: string; supportedResolutions?: string[] }
  analog?: { videoStandard?: string; badSignalProtection?: boolean; badSignalDetected?: boolean }
  operatingSettings?: { on?: boolean; scheduledOverride?: { on?: boolean; schedule?: string } | null }
  talkdown?: { protocol?: string; audioMode?: string; sipCredentials?: object }
}

interface GetCameraSettingsParams {
  include?: ('schema' | 'proposedValues')[]
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

### getCameraSettings(cameraId, params?)

```typescript
import { getCameraSettings } from 'een-api-toolkit'

// Basic usage
const { data, error } = await getCameraSettings('camera-id-123')
if (data) {
  console.log('Retention:', data.data.retention?.cloudDays, 'days')
}

// With schema and proposed values
const { data: settings } = await getCameraSettings('camera-id-123', {
  include: ['schema', 'proposedValues']
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

const settingsIncludes = ['schema', 'proposedValues'] as const

async function fetchSettings(cameraId: string) {
  settingsLoading.value = true
  settingsLoadingId.value = cameraId
  settingsData.value = null
  settingsError.value = null
  showSettings.value = true

  const result = await getCameraSettings(cameraId, { include: [...settingsIncludes] })

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
