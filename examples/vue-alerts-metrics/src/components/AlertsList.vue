<script setup lang="ts">
import { ref, watch } from 'vue'
import { listAlerts, listAlertTypes, type Camera, type Alert, type AlertType, type EenError } from 'een-api-toolkit'

const props = defineProps<{
  camera: Camera
  timeRange: string
}>()

const alerts = ref<Alert[]>([])
const alertTypes = ref<AlertType[]>([])
const selectedAlertType = ref<string>('')
const loadingAlertTypes = ref(false)
const loading = ref(false)
const loadingMore = ref(false)
const error = ref<EenError | null>(null)
const nextPageToken = ref<string | undefined>(undefined)

function getTimeRangeMs(range: string): number {
  switch (range) {
    case '1h': return 60 * 60 * 1000
    case '6h': return 6 * 60 * 60 * 1000
    case '24h': return 24 * 60 * 60 * 1000
    case '7d': return 7 * 24 * 60 * 60 * 1000
    default: return 24 * 60 * 60 * 1000
  }
}

function formatAlertType(type: string): string {
  // Convert "een.motionDetectionAlert.v1" to "Motion Detection Alert"
  const parts = type.split('.')
  if (parts.length >= 2) {
    const name = parts[1]
      .replace(/([A-Z])/g, ' $1')
      .trim()
    return name.charAt(0).toUpperCase() + name.slice(1)
  }
  return type
}

async function fetchAlertTypes() {
  loadingAlertTypes.value = true
  error.value = null
  alertTypes.value = []
  selectedAlertType.value = ''

  const result = await listAlertTypes({ pageSize: 100 })

  if (result.error) {
    error.value = result.error
    loadingAlertTypes.value = false
    return
  }

  alertTypes.value = result.data?.results ?? []
  loadingAlertTypes.value = false
}

async function fetchAlerts(append = false) {
  if (!props.camera?.id) return

  if (append) {
    loadingMore.value = true
  } else {
    loading.value = true
    alerts.value = []
    nextPageToken.value = undefined
  }
  error.value = null

  const now = new Date()
  const rangeMs = getTimeRangeMs(props.timeRange)
  const startTime = new Date(now.getTime() - rangeMs)

  const params: Parameters<typeof listAlerts>[0] = {
    actorId__in: [props.camera.id],
    timestamp__gte: startTime.toISOString(),
    timestamp__lte: now.toISOString(),
    pageSize: 20,
    pageToken: append ? nextPageToken.value : undefined,
    include: ['description'],
    sort: ['-timestamp']
  }

  // Add alert type filter if selected
  if (selectedAlertType.value) {
    params.alertType__in = [selectedAlertType.value]
  }

  const result = await listAlerts(params)

  if (result.error) {
    error.value = result.error
  } else {
    const newAlerts = result.data?.results ?? []
    if (append) {
      alerts.value = [...alerts.value, ...newAlerts]
    } else {
      alerts.value = newAlerts
    }
    nextPageToken.value = result.data?.nextPageToken
  }

  loading.value = false
  loadingMore.value = false
}

function handleAlertTypeChange() {
  fetchAlerts()
}

function loadMore() {
  if (nextPageToken.value) {
    fetchAlerts(true)
  }
}

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleString()
}

function getPriorityClass(priority?: number): string {
  if (priority === undefined) return ''
  if (priority >= 15) return 'priority-high'
  if (priority >= 10) return 'priority-medium'
  return 'priority-low'
}

// Fetch alert types once on mount
fetchAlertTypes()

// Fetch alerts when camera or time range changes
watch(
  () => [props.camera?.id, props.timeRange],
  () => {
    fetchAlerts()
  },
  { immediate: true }
)
</script>

<template>
  <div class="alerts-list" data-testid="alerts-list">
    <div class="alert-type-selector" data-testid="alert-type-selector">
      <label for="alert-type-select">Alert Type:</label>
      <select
        id="alert-type-select"
        v-model="selectedAlertType"
        @change="handleAlertTypeChange"
        :disabled="loadingAlertTypes"
        data-testid="alert-type-select"
      >
        <option value="">
          {{ loadingAlertTypes ? 'Loading...' : 'All Alert Types' }}
        </option>
        <option
          v-for="at in alertTypes"
          :key="at.type"
          :value="at.type"
          data-testid="alert-type-option"
        >
          {{ formatAlertType(at.type) }}
        </option>
      </select>
    </div>

    <div v-if="loading" class="loading" data-testid="alerts-loading">
      Loading alerts...
    </div>
    <div v-else-if="error" class="error" data-testid="alerts-error">
      {{ error.message }}
    </div>
    <div v-else-if="alerts.length === 0" class="no-data" data-testid="alerts-no-data">
      No alerts found for this time range.
    </div>
    <div v-else>
      <div
        v-for="alert in alerts"
        :key="alert.id"
        class="alert-item"
        data-testid="alert-item"
      >
        <div class="alert-header">
          <span class="alert-type">{{ alert.alertType?.split('.')[1] || alert.alertType }}</span>
          <span
            v-if="alert.priority !== undefined"
            class="priority-badge"
            :class="getPriorityClass(alert.priority)"
          >
            P{{ alert.priority }}
          </span>
        </div>
        <div class="alert-time">{{ formatTime(alert.timestamp) }}</div>
        <div v-if="alert.description" class="alert-description">
          {{ alert.description }}
        </div>
      </div>

      <button
        v-if="nextPageToken"
        @click="loadMore"
        :disabled="loadingMore"
        class="load-more-button"
        data-testid="alerts-load-more"
      >
        {{ loadingMore ? 'Loading...' : 'Load More' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.alerts-list {
  min-height: 200px;
}

.alert-type-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.alert-type-selector label {
  font-weight: 500;
  font-size: 0.9rem;
}

.alert-type-selector select {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.85rem;
  min-width: 200px;
}

.alert-type-selector select:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.loading,
.no-data {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  color: #666;
  font-style: italic;
}

.error {
  color: #e74c3c;
  padding: 10px;
  background: #fdf2f2;
  border-radius: 4px;
}

.alert-item {
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 6px;
  margin-bottom: 10px;
  background: #fafafa;
}

.alert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.alert-type {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.priority-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.priority-high {
  background: #fde8e8;
  color: #c53030;
}

.priority-medium {
  background: #fef3c7;
  color: #92400e;
}

.priority-low {
  background: #def7ec;
  color: #03543f;
}

.alert-time {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 5px;
}

.alert-description {
  font-size: 0.85rem;
  color: #555;
}

.load-more-button {
  width: 100%;
  margin-top: 10px;
  padding: 10px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  color: #333;
}

.load-more-button:hover {
  background: #eee;
}

.load-more-button:disabled {
  background: #f5f5f5;
  color: #999;
}
</style>
