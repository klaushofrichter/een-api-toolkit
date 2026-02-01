<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getJob, downloadFile, type Job, type EenError } from 'een-api-toolkit'

const route = useRoute()
const router = useRouter()

const job = ref<Job | null>(null)
const loading = ref(false)
const error = ref<EenError | null>(null)
const downloading = ref(false)
const videoUrl = ref<string | null>(null)
const loadingVideo = ref(false)

// Polling state
const isPolling = ref(false)
let pollInterval: ReturnType<typeof setInterval> | null = null

const jobId = computed(() => route.params.id as string)

// Extract name from nested structure
const jobName = computed(() => {
  return job.value?.arguments?.originalRequest?.name || '-'
})

// Extract file URL from result (for download)
const fileUrl = computed(() => {
  return job.value?.result?.intervals?.[0]?.files?.[0]?.url
})

// Extract request timestamps from arguments
const requestStartTimestamp = computed(() => {
  return job.value?.arguments?.originalRequest?.startTimestamp
})

const requestEndTimestamp = computed(() => {
  return job.value?.arguments?.originalRequest?.endTimestamp
})

const canDownload = computed(() => {
  return job.value?.state === 'success' && fileUrl.value
})

const canPlay = computed(() => {
  // Can play video exports
  return canDownload.value && (job.value?.type === 'video' || job.value?.type === 'export')
})

async function fetchJob() {
  loading.value = true
  error.value = null

  const result = await getJob(jobId.value)

  if (result.error) {
    error.value = result.error
    job.value = null
    stopPolling()
  } else {
    job.value = result.data

    // Auto-start polling if job is pending or started
    if (['pending', 'started'].includes(result.data.state) && !isPolling.value) {
      startPolling()
    }

    // Stop polling if job is complete
    if (['success', 'failure', 'revoked'].includes(result.data.state)) {
      stopPolling()
    }
  }

  loading.value = false
}

function startPolling() {
  if (isPolling.value) return
  isPolling.value = true
  pollInterval = setInterval(fetchJob, 3000) // Poll every 3 seconds
}

function stopPolling() {
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
  isPolling.value = false
}

async function handleDownload() {
  const url = fileUrl.value
  if (!url) return

  // Extract file ID from URL (last path segment)
  const urlParts = url.split('/')
  const fileId = urlParts[urlParts.length - 1]

  downloading.value = true
  const result = await downloadFile(fileId)

  if (result.error) {
    error.value = result.error
  } else {
    // Create download link
    const blobUrl = URL.createObjectURL(result.data.blob)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = result.data.filename
    a.click()
    URL.revokeObjectURL(blobUrl)
  }

  downloading.value = false
}

async function handlePlay() {
  const url = fileUrl.value
  if (!url) return

  // Extract file ID from URL (last path segment)
  const urlParts = url.split('/')
  const fileId = urlParts[urlParts.length - 1]

  loadingVideo.value = true
  error.value = null

  const result = await downloadFile(fileId)

  if (result.error) {
    error.value = result.error
  } else {
    // Revoke previous URL if exists
    if (videoUrl.value) {
      URL.revokeObjectURL(videoUrl.value)
    }
    // Create blob URL for video playback
    videoUrl.value = URL.createObjectURL(result.data.blob)
  }

  loadingVideo.value = false
}

function closePlayer() {
  if (videoUrl.value) {
    URL.revokeObjectURL(videoUrl.value)
    videoUrl.value = null
  }
}

function goBack() {
  router.push('/jobs')
}

function formatDate(timestamp: string | undefined) {
  if (!timestamp) return '-'
  return new Date(timestamp).toLocaleString()
}

function getStateBadgeClass(state: string) {
  return `badge badge-${state}`
}

onMounted(() => {
  fetchJob()
})

onUnmounted(() => {
  stopPolling()
  if (videoUrl.value) {
    URL.revokeObjectURL(videoUrl.value)
  }
})
</script>

<template>
  <div class="job-detail">
    <div class="header">
      <h2>Job Details</h2>
      <button @click="goBack">Back to Jobs</button>
    </div>

    <div v-if="loading && !job" class="loading">
      Loading job...
    </div>

    <div v-else-if="error" class="error">
      Error: {{ error.message }}
    </div>

    <div v-else-if="job" class="job-info">
      <div class="info-card">
        <div class="info-row">
          <span class="label">ID:</span>
          <span class="value">{{ job.id }}</span>
        </div>
        <div class="info-row">
          <span class="label">Name:</span>
          <span class="value">{{ jobName }}</span>
        </div>
        <div class="info-row">
          <span class="label">Type:</span>
          <span class="value">{{ job.type }}</span>
        </div>
        <div class="info-row">
          <span class="label">State:</span>
          <span :class="getStateBadgeClass(job.state)">{{ job.state }}</span>
        </div>
        <div v-if="job.state === 'started'" class="info-row">
          <span class="label">Progress:</span>
          <span class="value">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${(job.progress || 0) * 100}%` }"></div>
            </div>
            <span class="progress-text">{{ Math.round((job.progress || 0) * 100) }}%</span>
          </span>
        </div>
        <div v-if="job.state === 'failure' && job.error" class="info-row">
          <span class="label">Error:</span>
          <span class="value error-text">{{ job.error }}</span>
        </div>
        <div v-if="fileUrl" class="info-row">
          <span class="label">File:</span>
          <span class="value file-url">{{ job.result?.intervals?.[0]?.files?.[0]?.name || 'Available' }}</span>
        </div>
        <div class="info-row">
          <span class="label">Created:</span>
          <span class="value">{{ formatDate(job.createTimestamp) }}</span>
        </div>
        <div v-if="requestStartTimestamp" class="info-row">
          <span class="label">Period Start:</span>
          <span class="value">{{ formatDate(requestStartTimestamp) }}</span>
        </div>
        <div v-if="requestEndTimestamp" class="info-row">
          <span class="label">Period End:</span>
          <span class="value">{{ formatDate(requestEndTimestamp) }}</span>
        </div>
        <div v-if="job.updateTimestamp" class="info-row">
          <span class="label">Last Updated:</span>
          <span class="value">{{ formatDate(job.updateTimestamp) }}</span>
        </div>
      </div>

      <div class="actions">
        <button v-if="canPlay" @click="handlePlay" :disabled="loadingVideo || downloading">
          {{ loadingVideo ? 'Loading...' : 'Play Video' }}
        </button>
        <button v-if="canDownload" @click="handleDownload" :disabled="downloading || loadingVideo">
          {{ downloading ? 'Downloading...' : 'Download File' }}
        </button>
        <button @click="fetchJob" :disabled="loading">
          {{ loading ? 'Refreshing...' : 'Refresh' }}
        </button>
      </div>

      <!-- Video Player -->
      <div v-if="videoUrl" class="video-player">
        <div class="video-header">
          <h3>Video Player</h3>
          <button class="close-player" @click="closePlayer">&times;</button>
        </div>
        <video controls autoplay :src="videoUrl" class="video-element">
          Your browser does not support the video tag.
        </video>
      </div>

      <div v-if="isPolling" class="polling-notice">
        Auto-refreshing every 3 seconds...
      </div>
    </div>
  </div>
</template>

<style scoped>
.job-detail {
  width: 80vw;
  min-width: 600px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.info-card {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 20px;
}

.info-row {
  display: flex;
  margin-bottom: 12px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.label {
  font-weight: 600;
  width: 30%;
  flex-shrink: 0;
}

.value {
  color: #666;
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-bar {
  width: 150px;
  height: 10px;
  background: #e0e0e0;
  border-radius: 5px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #42b883;
  transition: width 0.3s ease;
}

.progress-text {
  font-weight: 500;
}

.error-text {
  color: #e74c3c;
}

.actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.polling-notice {
  margin-top: 15px;
  padding: 10px;
  background: #e3f2fd;
  border-radius: 4px;
  color: #1976d2;
  font-size: 0.9rem;
}

.video-player {
  margin-top: 20px;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

.video-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: #222;
}

.video-header h3 {
  margin: 0;
  color: white;
  font-size: 1rem;
}

.close-player {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.close-player:hover {
  color: #e74c3c;
}

.video-element {
  width: 100%;
  display: block;
}
</style>
