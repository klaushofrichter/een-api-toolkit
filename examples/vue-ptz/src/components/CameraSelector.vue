<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getCameras, getCamera } from 'een-api-toolkit'
import type { Camera } from 'een-api-toolkit'

const emit = defineEmits<{
  (e: 'select', camera: Camera): void
}>()

const cameras = ref<Camera[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

async function loadPtzCameras() {
  loading.value = true
  error.value = null

  const result = await getCameras({ pageSize: 100 })

  if (result.error) {
    error.value = result.error.message
    loading.value = false
    return
  }

  // Check each camera for PTZ capability
  const allCameras = result.data?.results || []
  const ptzCameras: Camera[] = []

  for (const cam of allCameras) {
    const detailResult = await getCamera(cam.id, { include: ['capabilities'] })
    if (detailResult.data) {
      // PTZ capability is at capabilities.ptz.capable (nested object, not flat)
      const capabilities = (detailResult.data as Camera & { capabilities?: { ptz?: { capable?: boolean } } }).capabilities
      if (capabilities?.ptz?.capable) {
        ptzCameras.push(detailResult.data)
      }
    }
  }

  cameras.value = ptzCameras
  loading.value = false

  // Auto-select first PTZ camera
  if (ptzCameras.length > 0) {
    emit('select', ptzCameras[0])
  }
}

function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const camera = cameras.value.find(c => c.id === target.value)
  if (camera) {
    emit('select', camera)
  }
}

onMounted(() => {
  loadPtzCameras()
})
</script>

<template>
  <div class="camera-selector">
    <label for="ptz-camera-select">PTZ Camera:</label>

    <div v-if="loading" class="loading-inline">
      Loading cameras...
    </div>

    <div v-else-if="error" class="error-inline">
      {{ error }}
      <button @click="loadPtzCameras" class="retry-btn">Retry</button>
    </div>

    <div v-else-if="cameras.length === 0" class="no-cameras" data-testid="no-ptz-cameras">
      No PTZ-capable cameras found.
    </div>

    <div v-else class="selector-row">
      <select
        id="ptz-camera-select"
        @change="handleChange"
        data-testid="ptz-camera-select"
        aria-label="Select a PTZ camera"
      >
        <option v-for="camera in cameras" :key="camera.id" :value="camera.id">
          {{ camera.name || camera.id }}
        </option>
      </select>
      <button @click="loadPtzCameras" class="refresh-btn" data-testid="refresh-cameras">
        Refresh
      </button>
    </div>
  </div>
</template>

<style scoped>
.camera-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.camera-selector label {
  font-weight: bold;
  white-space: nowrap;
}

.selector-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.selector-row select {
  flex: 1;
  min-width: 200px;
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.loading-inline {
  color: #666;
  font-style: italic;
}

.error-inline {
  color: #e74c3c;
  display: flex;
  align-items: center;
  gap: 10px;
}

.retry-btn,
.refresh-btn {
  padding: 8px 16px;
  font-size: 13px;
}

.no-cameras {
  color: #999;
  font-style: italic;
}
</style>
