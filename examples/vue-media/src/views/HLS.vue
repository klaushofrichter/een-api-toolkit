<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { getCameras, listMedia, initMediaSession, useAuthStore } from 'een-api-toolkit'
import type { Camera, MediaInterval } from 'een-api-toolkit'
import { useSelectedCamera } from '../composables/useSelectedCamera'
import { useSelectedDateTime } from '../composables/useSelectedDateTime'
import { toApiTimestamp, formatTimestampDisplay, formatDuration, formatTimeDiff } from '../utils/timestamp'
import Hls from 'hls.js'

const cameras = ref<Camera[]>([])
const { selectedCameraId, setSelectedCamera } = useSelectedCamera()
const { selectedDateTime, formatDateTimeLocal } = useSelectedDateTime()
const loading = ref(true)
const loadingVideo = ref(false)
const error = ref<string | null>(null)

// Video state
const mediaInterval = ref<MediaInterval | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
const hlsInstance = ref<Hls | null>(null)

// Media session state
const mediaSessionInitialized = ref(false)

// Track component lifecycle
const isMounted = ref(true)

// Get auth store for HLS.js requests
const authStore = useAuthStore()

// Store current HLS URL for Safari retry
const currentHlsUrl = ref<string | null>(null)

function getSelectedTimePosition(): string {
  if (!mediaInterval.value) return ''
  try {
    const selected = new Date(selectedDateTime.value).getTime()
    const start = new Date(mediaInterval.value.startTimestamp).getTime()
    const end = new Date(mediaInterval.value.endTimestamp).getTime()

    if (selected < start) {
      const diff = start - selected
      return `Selected time is before this segment by ${formatTimeDiff(diff)}`
    } else if (selected > end) {
      const diff = selected - end
      return `Selected time is after this segment by ${formatTimeDiff(diff)}`
    } else {
      return 'Selected time is inside this segment'
    }
  } catch {
    return ''
  }
}

async function resetToNow() {
  selectedDateTime.value = formatDateTimeLocal(new Date())
  await fetchVideo()
}

function setToClipTime() {
  if (mediaInterval.value) {
    selectedDateTime.value = formatDateTimeLocal(new Date(mediaInterval.value.startTimestamp))
  }
}

async function loadCameras() {
  loading.value = true
  error.value = null

  // Initialize media session (required for video URLs)
  if (!mediaSessionInitialized.value) {
    const sessionResult = await initMediaSession()
    if (sessionResult.error) {
      // Provide specific guidance based on error type
      const errorMsg = sessionResult.error.message.toLowerCase()
      if (errorMsg.includes('unauthorized') || errorMsg.includes('401')) {
        error.value = 'Session expired. Please log out and log in again to view videos.'
      } else if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
        error.value = 'Network error initializing video session. Please check your connection and try again.'
      } else {
        error.value = `Failed to initialize video session: ${sessionResult.error.message}. Try refreshing the page.`
      }
      loading.value = false
      return
    }
    mediaSessionInitialized.value = true
  }

  const result = await getCameras()

  if (!isMounted.value) return

  if (result.error) {
    error.value = result.error.message
    loading.value = false
    return
  }

  cameras.value = result.data?.results || []
  loading.value = false

  if (cameras.value.length > 0) {
    const isValidCamera = selectedCameraId.value &&
      cameras.value.some(c => c.id === selectedCameraId.value)
    if (!isValidCamera) {
      setSelectedCamera(cameras.value[0].id)
    }
    await fetchVideo()
  }
}

function destroyHls() {
  if (hlsInstance.value) {
    hlsInstance.value.destroy()
    hlsInstance.value = null
  }
}

function clearVideoState() {
  destroyHls()
  // Clear video element src to prevent memory leaks
  if (videoRef.value) {
    videoRef.value.src = ''
    videoRef.value.load()
  }
  mediaInterval.value = null
  currentHlsUrl.value = null
}

async function initHlsPlayback(hlsUrl: string) {
  await nextTick()

  if (!videoRef.value) {
    error.value = 'Video element not found. Please try refreshing the page.'
    return
  }

  // Verify authentication before attempting playback
  if (!authStore.isAuthenticated) {
    error.value = 'Authentication required. Please log in again to view video.'
    return
  }

  destroyHls()
  currentHlsUrl.value = hlsUrl

  if (Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: false,
      xhrSetup: (xhr: XMLHttpRequest) => {
        // Verify authentication is still valid before each request
        if (!authStore.isAuthenticated) {
          error.value = 'Session expired. Please log in again to continue watching.'
          return
        }
        // Access token directly from authStore to get fresh token on each request
        // This prevents stale token issues if the token is refreshed during playback
        const token = authStore.token
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`)
        }
      }
    })

    hls.loadSource(hlsUrl)
    hls.attachMedia(videoRef.value)

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      videoRef.value?.play().catch(() => {
        // Autoplay blocked - user needs to click play
      })
    })

    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            // Check if this might be an auth error (401/403)
            if (data.response?.code === 401 || data.response?.code === 403) {
              error.value = 'Authentication failed. Please log in again to continue watching.'
              destroyHls()
            } else {
              error.value = 'Network error loading video. Attempting to recover...'
              hls.startLoad()
            }
            break
          case Hls.ErrorTypes.MEDIA_ERROR:
            error.value = 'Media error encountered. Attempting to recover...'
            hls.recoverMediaError()
            break
          default:
            error.value = 'Fatal error loading video. Try selecting a different time or camera.'
            destroyHls()
            break
        }
      }
    })

    hlsInstance.value = hls
  } else if (videoRef.value.canPlayType('application/vnd.apple.mpegurl')) {
    // Native HLS support (Safari)
    // Safari's native HLS doesn't support custom headers for segment requests.
    // The HLS URL from EEN API includes authentication in the URL itself,
    // but if the session expires, we need to handle the error and retry.
    const video = videoRef.value

    // Handle errors for Safari native HLS (including token expiration)
    const handleSafariError = async () => {
      if (!isMounted.value) return

      // Check if this might be an auth-related error
      if (!authStore.isAuthenticated) {
        error.value = 'Session expired. Please log in again to continue watching.'
        video.src = ''
        video.load()
        return
      }

      // Try to get a fresh HLS URL by re-fetching the video
      error.value = 'Video playback error. Attempting to reload...'
      await fetchVideo()
    }

    video.onerror = handleSafariError

    // Also handle stalled playback which may indicate token issues
    video.onstalled = () => {
      // Only show error if stalled for extended period (handled by browser timeout)
      console.warn('Video playback stalled - may indicate network or auth issues')
    }

    video.src = hlsUrl
    video.play().catch(() => {
      // Autoplay blocked - user needs to click play
    })
  } else {
    error.value = 'HLS playback is not supported in this browser. Please use Safari, Chrome, Firefox, or Edge.'
  }
}

async function fetchVideo() {
  if (!selectedCameraId.value) return

  clearVideoState()
  loadingVideo.value = true
  error.value = null

  const timestamp = toApiTimestamp(selectedDateTime.value)

  const result = await listMedia({
    deviceId: selectedCameraId.value,
    type: 'main',
    mediaType: 'video',
    startTimestamp: timestamp,
    include: ['hlsUrl']
  })

  if (!isMounted.value) return

  loadingVideo.value = false

  if (result.error) {
    error.value = result.error.message
    return
  }

  if (result.data && result.data.results.length > 0) {
    const interval = result.data.results[0]
    mediaInterval.value = interval

    if (interval.hlsUrl) {
      await initHlsPlayback(interval.hlsUrl)
    } else {
      error.value = 'HLS URL not available for this recording'
    }
  } else {
    error.value = 'No video recordings found for the selected time'
  }
}

async function selectCamera(cameraId: string) {
  if (!isMounted.value) return
  setSelectedCamera(cameraId)
  await fetchVideo()
}

function handleCameraChange(event: Event) {
  const target = event.target as HTMLSelectElement | null
  if (target?.value) {
    selectCamera(target.value)
  }
}

onMounted(() => {
  loadCameras()
})

onUnmounted(() => {
  isMounted.value = false
  destroyHls()
})
</script>

<template>
  <div class="hls-video">
    <h2>HLS Video Streaming (Main)</h2>
    <p class="description">Streams video using HLS (HTTP Live Streaming) protocol with adaptive bitrate.</p>

    <div v-if="loading" class="loading">
      <p>Loading cameras...</p>
    </div>

    <div v-else-if="error && cameras.length === 0" class="error-state">
      <p class="error">{{ error }}</p>
      <button @click="loadCameras">Retry</button>
    </div>

    <div v-else-if="cameras.length === 0" class="no-cameras">
      <p>No cameras found in your account.</p>
    </div>

    <div v-else class="camera-view">
      <div class="camera-selector">
        <label for="camera-select">Select Camera:</label>
        <select
          id="camera-select"
          :value="selectedCameraId"
          @change="handleCameraChange"
          data-testid="camera-select"
          aria-label="Select a camera to view HLS video"
        >
          <option v-for="camera in cameras" :key="camera.id" :value="camera.id">
            {{ camera.name || camera.id }}
          </option>
        </select>
      </div>

      <div class="time-picker">
        <label for="datetime-input">Select Date/Time:</label>
        <input
          id="datetime-input"
          type="datetime-local"
          step="1"
          v-model="selectedDateTime"
          data-testid="datetime-input"
          aria-label="Select date and time for HLS video"
        />
        <button
          @click="fetchVideo"
          :disabled="loadingVideo"
          data-testid="go-button"
          aria-label="Load video from selected time"
        >
          Go
        </button>
        <button
          @click="resetToNow"
          data-testid="now-button"
          aria-label="Reset to current time"
        >
          Now
        </button>
        <button
          v-if="mediaInterval"
          @click="setToClipTime"
          data-testid="clip-time-button"
          aria-label="Set time to clip start"
        >
          Clip Time
        </button>
      </div>

      <div v-if="error" class="error-banner">
        <p class="error">{{ error }}</p>
      </div>

      <div class="video-container" data-testid="video-container">
        <div v-if="loadingVideo" class="video-loading">
          <p>Loading video stream...</p>
        </div>

        <video
          v-else-if="mediaInterval"
          ref="videoRef"
          controls
          playsinline
          class="video-display"
          data-testid="hls-video"
          aria-label="HLS video player"
        >
          Your browser does not support video playback.
        </video>

        <div v-else class="no-video">
          <p>Select a time to view recorded video</p>
        </div>
      </div>

      <div v-if="mediaInterval" class="timestamp" data-testid="timestamp">
        <small>
          {{ formatTimestampDisplay(mediaInterval.startTimestamp) }} - {{ formatTimestampDisplay(mediaInterval.endTimestamp) }}
          ({{ formatDuration(mediaInterval.startTimestamp, mediaInterval.endTimestamp) }})
        </small>
        <br />
        <small class="time-position">{{ getSelectedTimePosition() }}</small>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hls-video {
  max-width: 800px;
  margin: 0 auto;
}

h2 {
  margin-bottom: 10px;
  text-align: center;
}

.description {
  text-align: center;
  color: #666;
  margin-bottom: 20px;
  font-size: 14px;
}

.loading,
.error-state,
.no-cameras {
  text-align: center;
  padding: 40px;
}

.camera-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.camera-selector label {
  font-weight: bold;
}

.camera-selector select {
  flex: 1;
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.time-picker {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.time-picker label {
  font-weight: bold;
}

.time-picker input {
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.time-picker button {
  padding: 8px 16px;
}

.error-banner {
  margin-bottom: 15px;
}

.video-container {
  background: #000;
  border: 1px solid #ddd;
  border-radius: 8px;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.video-loading,
.no-video {
  text-align: center;
  color: #999;
}

.video-display {
  max-width: 100%;
  max-height: 500px;
  width: 100%;
}

.timestamp {
  margin-top: 10px;
  text-align: center;
  color: #666;
}

.time-position {
  color: #888;
  font-style: italic;
}

.error {
  color: #dc3545;
}
</style>
