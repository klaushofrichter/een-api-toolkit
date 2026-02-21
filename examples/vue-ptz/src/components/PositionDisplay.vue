<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { getPtzPosition } from 'een-api-toolkit'
import type { PtzPosition } from 'een-api-toolkit'
import { useApiLog } from '../composables/useApiLog'

const props = defineProps<{
  cameraId: string | null
  refreshTrigger: number
}>()

const emit = defineEmits<{
  (e: 'position-updated', position: PtzPosition | null): void
}>()

const { log: apiLog } = useApiLog()
const position = ref<PtzPosition | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const autoRefresh = ref(true)

let pollTimer: ReturnType<typeof setInterval> | null = null

async function fetchPosition() {
  if (!props.cameraId || loading.value) return

  loading.value = true
  error.value = null

  const result = await getPtzPosition(props.cameraId)
  apiLog('getPtzPosition', { cameraId: props.cameraId }, result.error ?? result.data, !!result.error)

  if (result.error) {
    error.value = result.error.message
    loading.value = false
    return
  }

  position.value = result.data
  emit('position-updated', result.data ?? null)
  loading.value = false
}

function startPolling() {
  stopPolling()
  if (!props.cameraId || !autoRefresh.value) return

  fetchPosition()
  pollTimer = setInterval(fetchPosition, 5000)
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

watch(() => props.cameraId, () => {
  position.value = null
  startPolling()
}, { immediate: true })

watch(() => props.refreshTrigger, () => {
  fetchPosition()
})

watch(autoRefresh, (on) => {
  if (on) {
    startPolling()
  } else {
    stopPolling()
  }
})

onUnmounted(() => {
  stopPolling()
})
</script>

<template>
  <div class="position-display" data-testid="position-display">
    <div v-if="!cameraId" class="no-camera">
      No camera selected
    </div>

    <div v-else-if="error" class="position-error">
      {{ error }}
    </div>

    <div v-else class="position-values">
      <div class="position-item">
        <span class="label">Pan (X):</span>
        <span class="value" data-testid="position-x">
          {{ position?.x !== undefined ? position.x.toFixed(3) : '--' }}
        </span>
      </div>
      <div class="position-item">
        <span class="label">Tilt (Y):</span>
        <span class="value" data-testid="position-y">
          {{ position?.y !== undefined ? position.y.toFixed(3) : '--' }}
        </span>
      </div>
      <div class="position-item">
        <span class="label">Zoom (Z):</span>
        <span class="value" data-testid="position-z">
          {{ position?.z !== undefined ? position.z.toFixed(3) : '--' }}
        </span>
      </div>
    </div>

    <div v-if="cameraId" class="refresh-row">
      <button
        @click="fetchPosition"
        :disabled="loading"
        class="refresh-btn"
        data-testid="refresh-position"
      >
        {{ loading ? 'Updating...' : 'Refresh' }}
      </button>
      <label class="auto-refresh-label">
        <input type="checkbox" v-model="autoRefresh" data-testid="auto-refresh" />
        Auto
      </label>
    </div>
  </div>
</template>

<style scoped>
.position-display {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.no-camera {
  color: #999;
  font-style: italic;
  text-align: center;
  font-size: 13px;
}

.position-error {
  color: #e74c3c;
  font-size: 12px;
  text-align: center;
}

.position-values {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 10px;
}

.position-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.position-item .label {
  font-size: 13px;
  font-weight: 600;
  color: #555;
}

.position-item .value {
  font-family: monospace;
  font-size: 14px;
  color: #2c3e50;
  font-weight: 600;
}

.refresh-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.refresh-btn {
  flex: 1;
  padding: 8px;
  font-size: 12px;
  background: #6c757d;
}

.refresh-btn:hover:not(:disabled) {
  background: #5a6268;
}

.auto-refresh-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #555;
  cursor: pointer;
  white-space: nowrap;
}
</style>
