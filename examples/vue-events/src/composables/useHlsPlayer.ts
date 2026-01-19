import { ref, nextTick, onUnmounted, type Ref } from 'vue'
import { listMedia, formatTimestamp, useAuthStore } from 'een-api-toolkit'
import Hls from 'hls.js'
import { useMediaSessionStore } from '../stores/mediaSession'

// Constants
const SEARCH_WINDOW_MS = 60 * 60 * 1000 // 1 hour before/after target timestamp
const MAX_MEDIA_PAGE_SIZE = 100 // Limit results for performance
const MAX_NETWORK_RETRIES = 3 // Maximum retry attempts for network errors

// Debug utility - logs only when VITE_DEBUG=true
const isDebug = import.meta.env?.VITE_DEBUG === 'true'
function debugError(...args: unknown[]): void {
  if (isDebug) {
    console.error('[useHlsPlayer]', ...args)
  }
}

/** Return type for the useHlsPlayer composable */
export interface HlsPlayerReturn {
  videoUrl: Ref<string | null>
  videoError: Ref<string | null>
  loadingVideo: Ref<boolean>
  videoRef: Ref<HTMLVideoElement | null>
  loadVideo: (deviceId: string, timestamp: string) => Promise<void>
  resetVideo: () => void
  destroyHls: () => void
}

/**
 * Composable for HLS video playback from EEN recordings.
 * Handles media session initialization, interval search, and HLS.js setup.
 * Uses Pinia store for media session state to ensure consistent behavior
 * across all component instances.
 */
export function useHlsPlayer(): HlsPlayerReturn {
  const authStore = useAuthStore()
  const mediaSessionStore = useMediaSessionStore()

  // State
  const videoUrl = ref<string | null>(null)
  const videoError = ref<string | null>(null)
  const loadingVideo = ref(false)
  const videoRef = ref<HTMLVideoElement | null>(null)

  let hlsInstance: Hls | null = null
  let networkRetryCount = 0

  /**
   * Initialize media session with caching via Pinia store.
   * Only calls the API once per session, subsequent calls return cached result.
   */
  async function ensureMediaSession(): Promise<boolean> {
    const success = await mediaSessionStore.ensureInitialized()
    if (!success && mediaSessionStore.error) {
      videoError.value = mediaSessionStore.error
    }
    return success
  }

  /**
   * Destroy the HLS instance and clean up resources.
   */
  function destroyHls() {
    if (hlsInstance) {
      hlsInstance.destroy()
      hlsInstance = null
    }
  }

  /**
   * Initialize HLS.js with proper authentication and error handling.
   */
  function initHls() {
    if (!videoUrl.value || !videoRef.value) return

    destroyHls()

    // Always use hls.js even on Safari - native HLS cannot send Authorization headers
    if (!Hls.isSupported()) {
      videoError.value = 'HLS is not supported in this browser. Please use a modern browser like Chrome, Firefox, or Edge.'
      return
    }

    // Configure hls.js to send Authorization header for authentication
    hlsInstance = new Hls({
      xhrSetup: function(xhr) {
        xhr.setRequestHeader('Authorization', `Bearer ${authStore.token}`)
      }
    })

    hlsInstance.loadSource(videoUrl.value)
    hlsInstance.attachMedia(videoRef.value)

    hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
      // Reset retry counter on successful manifest parse
      networkRetryCount = 0
      videoRef.value?.play().catch(() => {
        // Autoplay may be blocked, user can manually play
      })
    })

    // Enhanced error handling for different error types
    hlsInstance.on(Hls.Events.ERROR, (_, data) => {
      debugError('HLS error:', data)

      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            // Network error - could be auth issue or connectivity
            if (data.response?.code === 401) {
              videoError.value = 'Authentication expired. Please refresh the page and try again.'
              // Don't retry on auth errors - requires user action
              destroyHls()
            } else if (data.response?.code === 403) {
              videoError.value = 'Access denied to video stream.'
              // Don't retry on permission errors
              destroyHls()
            } else {
              // Retry other network errors with limit
              networkRetryCount++
              if (networkRetryCount <= MAX_NETWORK_RETRIES) {
                videoError.value = `Network error loading video: ${data.details}. Retry ${networkRetryCount}/${MAX_NETWORK_RETRIES}...`
                hlsInstance?.startLoad()
              } else {
                videoError.value = `Network error loading video: ${data.details}. Max retries (${MAX_NETWORK_RETRIES}) exceeded.`
                destroyHls()
              }
            }
            break

          case Hls.ErrorTypes.MEDIA_ERROR:
            // Media error - try to recover
            videoError.value = `Media error: ${data.details}. Attempting recovery...`
            hlsInstance?.recoverMediaError()
            break

          default:
            // Other fatal errors
            videoError.value = `HLS error: ${data.type} - ${data.details}`
            destroyHls()
        }
      }
    })
  }

  /**
   * Load and play HLS video for a given device and timestamp.
   *
   * @param deviceId - The camera device ID
   * @param timestamp - ISO timestamp string (the target time to find video for)
   * @returns Promise that resolves when video is ready or error occurs
   */
  async function loadVideo(deviceId: string, timestamp: string): Promise<void> {
    loadingVideo.value = true
    videoError.value = null
    videoUrl.value = null
    networkRetryCount = 0 // Reset retry counter for new video load

    // Initialize media session (cached after first call)
    const sessionOk = await ensureMediaSession()
    if (!sessionOk) {
      loadingVideo.value = false
      return
    }

    // Search for recordings around the target timestamp
    const targetTime = new Date(timestamp)
    const searchStartTime = new Date(targetTime.getTime() - SEARCH_WINDOW_MS)
    const searchEndTime = new Date(targetTime.getTime() + SEARCH_WINDOW_MS)

    // Use 'main' type for video - HLS is typically only available for main feeds
    const result = await listMedia({
      deviceId,
      type: 'main',
      mediaType: 'video',
      startTimestamp: formatTimestamp(searchStartTime.toISOString()),
      endTimestamp: formatTimestamp(searchEndTime.toISOString()),
      include: ['hlsUrl'],
      pageSize: MAX_MEDIA_PAGE_SIZE
    })

    if (result.error) {
      videoError.value = result.error.message
      loadingVideo.value = false
      return
    }

    const intervals = result.data?.results ?? []

    // Validate target timestamp
    const targetTimeMs = targetTime.getTime()
    if (isNaN(targetTimeMs)) {
      videoError.value = `Invalid timestamp format: ${timestamp}`
      loadingVideo.value = false
      return
    }

    // Find an interval that contains the target timestamp and has an HLS URL
    const interval = intervals.find(i => {
      if (!i.hlsUrl) return false
      const intervalStart = new Date(i.startTimestamp).getTime()
      const intervalEnd = new Date(i.endTimestamp).getTime()
      // Skip intervals with invalid timestamps
      if (isNaN(intervalStart) || isNaN(intervalEnd)) return false
      return targetTimeMs >= intervalStart && targetTimeMs <= intervalEnd
    })

    if (!interval?.hlsUrl) {
      // Provide detailed error message
      if (intervals.length === 0) {
        videoError.value = 'No recordings found for this time range'
      } else if (!intervals.some(i => i.hlsUrl)) {
        videoError.value = 'Recordings found but HLS not available'
      } else {
        videoError.value = `No recording contains timestamp ${timestamp}`
      }
      loadingVideo.value = false
      return
    }

    // Set the HLS URL
    videoUrl.value = interval.hlsUrl
    loadingVideo.value = false

    // Initialize HLS.js after the DOM has been updated
    await nextTick()
    initHls()
  }

  /**
   * Reset all video state.
   */
  function resetVideo() {
    destroyHls()
    videoUrl.value = null
    videoError.value = null
    loadingVideo.value = false
  }

  // Cleanup on unmount
  onUnmounted(() => {
    destroyHls()
  })

  return {
    // State
    videoUrl,
    videoError,
    loadingVideo,
    videoRef,

    // Methods
    loadVideo,
    resetVideo,
    destroyHls
  }
}

/**
 * Reset the media session cache.
 * Call this when the user logs out or the session expires to ensure
 * a fresh media session is initialized on next use.
 *
 * @remarks
 * This delegates to the Pinia media session store's reset method.
 * Must be called from within a Vue component context or after Pinia is installed.
 */
export function resetMediaSessionCache(): void {
  const mediaSessionStore = useMediaSessionStore()
  mediaSessionStore.reset()
}
