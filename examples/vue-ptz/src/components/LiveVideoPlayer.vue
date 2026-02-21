<script setup lang="ts">
import { ref, watch, onUnmounted, nextTick } from 'vue'
import { useAuthStore, movePtz } from 'een-api-toolkit'
import type { Camera } from 'een-api-toolkit'
import LivePlayer from '@een/live-video-web-sdk'
import { useApiLog } from '../composables/useApiLog'

const props = defineProps<{
  camera: Camera | null
}>()

const emit = defineEmits<{
  (e: 'move-complete'): void
}>()

const authStore = useAuthStore()
const { log: apiLog } = useApiLog()
const videoRef = ref<HTMLVideoElement | null>(null)
const error = ref<string | null>(null)
const loading = ref(false)
const connected = ref(false)

let livePlayerInstance: LivePlayer | null = null

async function startPlayer(camera: Camera) {
  if (!videoRef.value || !authStore.baseUrl || !authStore.token) {
    error.value = 'Authentication required for live video'
    return
  }

  if (!authStore.baseUrl.startsWith('https://')) {
    error.value = 'Invalid base URL format - HTTPS required'
    return
  }

  stopPlayer()
  loading.value = true
  error.value = null

  try {
    livePlayerInstance = new LivePlayer()
    await livePlayerInstance.start({
      videoElement: videoRef.value,
      cameraId: camera.id,
      baseUrl: authStore.baseUrl,
      jwt: authStore.token
    })
    connected.value = true
  } catch (err) {
    error.value = `Live video error: ${String(err)}`
    connected.value = false
  } finally {
    loading.value = false
  }
}

function stopPlayer() {
  if (livePlayerInstance) {
    try {
      livePlayerInstance.stop()
    } catch (err) {
      console.warn('Error stopping live player:', err)
    }
    livePlayerInstance = null
  }
  connected.value = false
  loading.value = false
}

async function handleVideoClick(event: MouseEvent) {
  if (!props.camera) return

  const video = event.currentTarget as HTMLVideoElement
  const rect = video.getBoundingClientRect()
  const relativeX = (event.clientX - rect.left) / rect.width
  const relativeY = (event.clientY - rect.top) / rect.height

  const move = { moveType: 'centerOn' as const, relativeX, relativeY }
  const result = await movePtz(props.camera.id, move)
  apiLog('movePtz', { cameraId: props.camera.id, move }, result.error ?? result.data, !!result.error)

  if (result.error) {
    error.value = `Center-on failed: ${result.error.message}`
  } else {
    emit('move-complete')
  }
}

function handleVideoError() {
  error.value = 'Video playback error occurred'
  connected.value = false
}

watch(() => props.camera, async (newCamera) => {
  stopPlayer()
  error.value = null
  if (newCamera) {
    await nextTick()
    await startPlayer(newCamera)
  }
})

onUnmounted(() => {
  stopPlayer()
})
</script>

<template>
  <div class="live-video-player" data-testid="live-video-player">
    <div class="video-container">
      <div v-if="loading" class="loading-overlay">
        <div class="spinner"></div>
        <p>Connecting to live stream...</p>
      </div>

      <div v-if="!camera" class="placeholder">
        <p>Select a PTZ camera to view live video</p>
      </div>

      <video
        v-show="camera"
        ref="videoRef"
        class="video-element"
        autoplay
        muted
        playsinline
        data-testid="ptz-video"
        @click="handleVideoClick"
        @error="handleVideoError"
      />

      <div v-if="camera && connected" class="click-hint">
        Click on the video to center the camera on that point
      </div>
    </div>

    <div v-if="error" class="video-error">
      <p>{{ error }}</p>
    </div>

    <div class="status-bar">
      <span v-if="connected" class="status-connected">Connected</span>
      <span v-else-if="loading" class="status-loading">Connecting...</span>
      <span v-else class="status-disconnected">Disconnected</span>
    </div>
  </div>
</template>

<style scoped>
.live-video-player {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background: #000;
  flex-shrink: 0;
}

.video-container {
  position: relative;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-element {
  width: 100%;
  max-height: 500px;
  display: block;
  cursor: crosshair;
}

.placeholder {
  color: #999;
  text-align: center;
  padding: 60px 20px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  z-index: 10;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.click-hint {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  pointer-events: none;
}

.video-error {
  padding: 10px 15px;
  background: #f8d7da;
  color: #721c24;
  font-size: 14px;
}

.status-bar {
  padding: 8px 15px;
  background: #1a1a1a;
  font-size: 12px;
}

.status-connected {
  color: #27ae60;
  font-weight: 600;
}

.status-loading {
  color: #f39c12;
  font-weight: 600;
}

.status-disconnected {
  color: #e74c3c;
  font-weight: 600;
}
</style>
