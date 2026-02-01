<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getCameras, createExportJob, formatTimestamp, type Camera, type EenError, type ExportType } from 'een-api-toolkit'

const router = useRouter()

// Form state
const selectedCamera = ref<string>('')
const exportType = ref<ExportType>('video')
const exportName = ref('')
const duration = ref(15) // minutes
const playbackMultiplier = ref(10) // default multiplier for timeLapse/bundle

// Check if playbackMultiplier is needed
const needsPlaybackMultiplier = computed(() => {
  return exportType.value === 'timeLapse' || exportType.value === 'bundle'
})

// Data state
const cameras = ref<Camera[]>([])
const loading = ref(false)
const submitting = ref(false)
const error = ref<EenError | null>(null)
const success = ref<string | null>(null)

const exportTypes: { value: ExportType; label: string }[] = [
  { value: 'video', label: 'Video' },
  { value: 'timeLapse', label: 'Time Lapse' },
  { value: 'bundle', label: 'Bundle (Video + Images)' }
]

const durationOptions = [
  { value: 5, label: '5 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' }
]

const playbackMultiplierOptions = [
  { value: 2, label: '2x (30 min → 15 min)' },
  { value: 5, label: '5x (30 min → 6 min)' },
  { value: 10, label: '10x (30 min → 3 min)' },
  { value: 20, label: '20x (30 min → 1.5 min)' },
  { value: 48, label: '48x (30 min → 37 sec)' }
]

const canSubmit = computed(() => {
  if (!selectedCamera.value || !exportType.value || submitting.value) {
    return false
  }
  // Validate playbackMultiplier for timeLapse/bundle
  if (needsPlaybackMultiplier.value) {
    return playbackMultiplier.value >= 1 && playbackMultiplier.value <= 48
  }
  return true
})

async function fetchCameras() {
  loading.value = true
  error.value = null

  const result = await getCameras({
    pageSize: 100,
    status__in: ['online', 'streaming']
  })

  if (result.error) {
    error.value = result.error
  } else {
    cameras.value = result.data.results
  }

  loading.value = false
}

async function handleSubmit() {
  if (!canSubmit.value) return

  submitting.value = true
  error.value = null
  success.value = null

  const endTime = new Date()
  const startTime = new Date(endTime.getTime() - duration.value * 60 * 1000)

  const exportParams: Parameters<typeof createExportJob>[0] = {
    name: exportName.value || `Export - ${new Date().toLocaleString()}`,
    type: exportType.value,
    cameraId: selectedCamera.value,
    startTimestamp: formatTimestamp(startTime.toISOString()),
    endTimestamp: formatTimestamp(endTime.toISOString())
  }

  // Add playbackMultiplier for timeLapse and bundle exports
  if (needsPlaybackMultiplier.value) {
    exportParams.playbackMultiplier = playbackMultiplier.value
  }

  const result = await createExportJob(exportParams)

  if (result.error) {
    error.value = result.error
  } else {
    success.value = `Export job created successfully! Job ID: ${result.data.id}`
    // Redirect to job detail page after a moment
    setTimeout(() => {
      router.push(`/jobs/${result.data.id}`)
    }, 2000)
  }

  submitting.value = false
}

onMounted(() => {
  fetchCameras()
})
</script>

<template>
  <div class="create-export">
    <h2>Create Export</h2>
    <p class="description">
      Create a video export from a camera. The export will be processed in the background
      and you can track its progress on the Jobs page.
    </p>

    <div v-if="loading" class="loading">Loading cameras...</div>

    <div v-else-if="cameras.length === 0 && !error" class="no-cameras">
      <p>No online cameras available. Exports require at least one online camera.</p>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="export-form">
      <div class="form-group">
        <label for="camera">Camera</label>
        <select id="camera" v-model="selectedCamera" required>
          <option value="">Select a camera...</option>
          <option v-for="camera in cameras" :key="camera.id" :value="camera.id">
            {{ camera.name }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="exportType">Export Type</label>
        <select id="exportType" v-model="exportType">
          <option v-for="type in exportTypes" :key="type.value" :value="type.value">
            {{ type.label }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="duration">Duration (from now)</label>
        <select id="duration" v-model="duration">
          <option v-for="opt in durationOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>

      <div v-if="needsPlaybackMultiplier" class="form-group">
        <label for="playbackMultiplier">Playback Speed</label>
        <select id="playbackMultiplier" v-model="playbackMultiplier">
          <option v-for="opt in playbackMultiplierOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
        <p class="field-hint">Higher values create shorter, faster time-lapse videos</p>
      </div>

      <div class="form-group">
        <label for="name">Export Name (optional)</label>
        <input
          id="name"
          type="text"
          v-model="exportName"
          placeholder="Enter a name for this export"
        />
      </div>

      <div v-if="error" class="error">
        Error: {{ error.message }}
      </div>

      <div v-if="success" class="success">
        {{ success }}
      </div>

      <div class="form-actions">
        <button type="submit" :disabled="!canSubmit">
          {{ submitting ? 'Creating...' : 'Create Export' }}
        </button>
        <router-link to="/jobs">
          <button type="button" class="btn-secondary">Cancel</button>
        </router-link>
      </div>
    </form>
  </div>
</template>

<style scoped>
.create-export {
  width: 80vw;
  min-width: 500px;
  margin: 0 auto;
}

h2 {
  margin-bottom: 10px;
}

.description {
  color: #666;
  margin-bottom: 30px;
}

.no-cameras {
  padding: 20px;
  background: #fff3cd;
  border-radius: 8px;
  color: #856404;
}

.export-form {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group select,
.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group select:focus,
.form-group input:focus {
  outline: none;
  border-color: #42b883;
}

.field-hint {
  margin-top: 5px;
  font-size: 0.85rem;
  color: #888;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn-secondary {
  background: #6c757d;
}

.btn-secondary:hover {
  background: #5a6268;
}

.success {
  padding: 10px;
  background: #d4edda;
  border-radius: 4px;
  color: #155724;
  margin-bottom: 20px;
}
</style>
