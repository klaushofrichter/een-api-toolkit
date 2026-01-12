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

// Error type to differentiate loading errors from playback errors
type ErrorType = 'loading' | 'playback' | 'auth' | null
const errorType = ref<ErrorType>(null)

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

// Loading timeout configuration (in milliseconds)
const VIDEO_LOADING_TIMEOUT_MS = 60000

// Loading timeout state
const loadingTimeoutId = ref<ReturnType<typeof setTimeout> | null>(null)

/**
 * Set error with type for differentiated display
 */
function setError(message: string, type: ErrorType) {
  error.value = message
  errorType.value = type
}

/**
 * Clear error state
 */
function clearError() {
  error.value = null
  errorType.value = null
}

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
  clearError()

  // Initialize media session (required for video URLs)
  if (!mediaSessionInitialized.value) {
    const sessionResult = await initMediaSession()
    if (sessionResult.error) {
      // Provide specific guidance based on error type
      const errorMsg = sessionResult.error.message.toLowerCase()
      if (errorMsg.includes('unauthorized') || errorMsg.includes('401')) {
        setError('Session expired. Please log out and log in again to view videos.', 'auth')
      } else if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
        setError('Network error initializing video session. Please check your connection and try again.', 'loading')
      } else {
        setError(`Failed to initialize video session: ${sessionResult.error.message}. Try refreshing the page.`, 'loading')
      }
      loading.value = false
      return
    }
    mediaSessionInitialized.value = true
  }

  const result = await getCameras()

  if (!isMounted.value) return

  if (result.error) {
    setError(result.error.message, 'loading')
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

function clearLoadingTimeout() {
  if (loadingTimeoutId.value) {
    clearTimeout(loadingTimeoutId.value)
    loadingTimeoutId.value = null
  }
}

function startLoadingTimeout() {
  clearLoadingTimeout()
  loadingTimeoutId.value = setTimeout(() => {
    if (!isMounted.value) return
    setError('Video loading timed out after 60 seconds. The video may be unavailable or your connection may be slow. Try selecting a different time or refreshing the page.', 'loading')
    destroyHls()
    if (videoRef.value) {
      videoRef.value.src = ''
      videoRef.value.load()
    }
  }, VIDEO_LOADING_TIMEOUT_MS)
}

function clearVideoState() {
  clearLoadingTimeout()
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
    setError('Video element not found. Please try refreshing the page.', 'loading')
    return
  }

  // Verify authentication before attempting playback
  if (!authStore.isAuthenticated) {
    setError('Authentication required. Please log in again to view video.', 'auth')
    return
  }

  destroyHls()
  currentHlsUrl.value = hlsUrl

  // Start loading timeout - will be cleared when video starts playing
  startLoadingTimeout()

  if (Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: false,
      xhrSetup: (xhr: XMLHttpRequest) => {
        // Verify authentication is still valid before each request
        if (!authStore.isAuthenticated) {
          setError('Session expired. Please log in again to continue watching.', 'auth')
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
      // Video manifest loaded successfully - clear loading timeout
      clearLoadingTimeout()
      videoRef.value?.play().catch(() => {
        // Autoplay blocked - user needs to click play
      })
    })

    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (data.fatal) {
        // Clear loading timeout on fatal errors
        clearLoadingTimeout()
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR: {
            // Type-safe check for HTTP response code in error data
            // HLS.js may include response info for network errors
            const response = data.response as { code?: number } | undefined
            const httpCode = response?.code
            const isAuthError = httpCode === 401 || httpCode === 403

            if (isAuthError) {
              setError('Authentication failed. Please log in again to continue watching.', 'auth')
              destroyHls()
            } else {
              setError('Network error loading video. Attempting to recover...', 'playback')
              hls.startLoad()
              // Restart timeout for recovery attempt
              startLoadingTimeout()
            }
            break
          }
          case Hls.ErrorTypes.MEDIA_ERROR:
            setError('Media error encountered. Attempting to recover...', 'playback')
            hls.recoverMediaError()
            // Restart timeout for recovery attempt
            startLoadingTimeout()
            break
          default:
            setError('Fatal error loading video. Try selecting a different time or camera.', 'playback')
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

    // Clear loading timeout when video starts playing
    video.onloadeddata = () => {
      clearLoadingTimeout()
    }

    // Handle errors for Safari native HLS (including token expiration)
    const handleSafariError = async () => {
      if (!isMounted.value) return

      // Clear loading timeout on error
      clearLoadingTimeout()

      // Check if this might be an auth-related error
      if (!authStore.isAuthenticated) {
        setError('Session expired. Please log in again to continue watching.', 'auth')
        video.src = ''
        video.load()
        return
      }

      // Try to get a fresh HLS URL by re-fetching the video
      setError('Video playback error. Attempting to reload...', 'playback')
      await fetchVideo()
    }

    video.onerror = handleSafariError

    // Also handle stalled playback which may indicate token issues
    video.onstalled = () => {
      // Only log warning, don't set error - browser handles stall recovery
      // Using debug logging pattern as suggested by code review
      if (import.meta.env.DEV) {
        console.warn('Video playback stalled - may indicate network or auth issues')
      }
    }

    video.src = hlsUrl
    video.play().catch(() => {
      // Autoplay blocked - user needs to click play
    })
  } else {
    setError('HLS playback is not supported in this browser. Please use Safari, Chrome, Firefox, or Edge.', 'loading')
  }
}

async function fetchVideo() {
  if (!selectedCameraId.value) return

  clearVideoState()
  loadingVideo.value = true
  clearError()

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
    setError(result.error.message, 'loading')
    return
  }

  if (result.data && result.data.results.length > 0) {
    const interval = result.data.results[0]
    mediaInterval.value = interval

    if (interval.hlsUrl) {
      await initHlsPlayback(interval.hlsUrl)
    } else {
      setError('HLS URL not available for this recording', 'loading')
    }
  } else {
    setError('No video recordings found for the selected time', 'loading')
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
  clearLoadingTimeout()
  destroyHls()
})
</script>

<template>
  <div class="hls-video">
    <h2>HLS Video Streaming (Main)</h2>
    <p class="description">Streams video using HLS (HTTP Live Streaming) protocol.</p>

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

      <div v-if="error" :class="['error-banner', `error-${errorType}`]">
        <p class="error">{{ error }}</p>
        <button v-if="errorType === 'playback'" @click="fetchVideo" class="retry-button">
          Retry
        </button>
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
  padding: 12px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.error-banner.error-loading {
  background-color: #fff3cd;
  border: 1px solid #ffc107;
}

.error-banner.error-loading .error {
  color: #856404;
}

.error-banner.error-playback {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
}

.error-banner.error-playback .error {
  color: #721c24;
}

.error-banner.error-auth {
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
}

.error-banner.error-auth .error {
  color: #155724;
}

.retry-button {
  padding: 6px 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.retry-button:hover {
  background-color: #0056b3;
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
