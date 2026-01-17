<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getCameras, type Camera, type EenError } from 'een-api-toolkit'

const emit = defineEmits<{
  select: [camera: Camera]
}>()

const cameras = ref<Camera[]>([])
const loading = ref(false)
const error = ref<EenError | null>(null)
const selectedCameraId = ref<string>('')

async function fetchCameras() {
  loading.value = true
  error.value = null

  const result = await getCameras({ pageSize: 100 })

  if (result.error) {
    error.value = result.error
    cameras.value = []
  } else {
    cameras.value = result.data?.results ?? []
  }

  loading.value = false
}

function handleChange() {
  const camera = cameras.value.find(c => c.id === selectedCameraId.value)
  if (camera) {
    emit('select', camera)
  }
}

onMounted(() => {
  fetchCameras()
})
</script>

<template>
  <div class="camera-selector">
    <label for="camera-select">Camera:</label>
    <select
      id="camera-select"
      v-model="selectedCameraId"
      @change="handleChange"
      :disabled="loading"
      data-testid="camera-select"
    >
      <option value="" disabled>{{ loading ? 'Loading cameras...' : 'Select a camera' }}</option>
      <option
        v-for="camera in cameras"
        :key="camera.id"
        :value="camera.id"
        data-testid="camera-option"
      >
        {{ camera.name ? `${camera.name} (${camera.id})` : camera.id }}
      </option>
    </select>
    <div v-if="error" class="error" data-testid="camera-selector-error">
      {{ error.message }}
    </div>
  </div>
</template>

<style scoped>
.camera-selector {
  display: flex;
  align-items: center;
  gap: 10px;
}

label {
  font-weight: 500;
}

select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-width: 350px;
}

select:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.error {
  color: #e74c3c;
  font-size: 0.9rem;
}
</style>
