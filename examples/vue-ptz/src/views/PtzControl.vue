<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { Camera, PtzPreset, PtzPosition } from 'een-api-toolkit'
import CameraSelector from '../components/CameraSelector.vue'
import LiveVideoPlayer from '../components/LiveVideoPlayer.vue'
import DirectionPad from '../components/DirectionPad.vue'
import PositionDisplay from '../components/PositionDisplay.vue'
import PositionInput from '../components/PositionInput.vue'
import PresetManager from '../components/PresetManager.vue'
import ApiLog from '../components/ApiLog.vue'

const selectedCamera = ref<Camera | null>(null)
const refreshTrigger = ref(0)
const homePreset = ref<PtzPreset | null>(null)
const currentPosition = ref<PtzPosition | null>(null)
const controlsRef = ref<HTMLElement | null>(null)
const controlsHeight = ref<number | undefined>(undefined)

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (controlsRef.value) {
    resizeObserver = new ResizeObserver(([entry]) => {
      controlsHeight.value = entry.contentRect.height
    })
    resizeObserver.observe(controlsRef.value)
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect()
})

function onCameraSelect(camera: Camera) {
  selectedCamera.value = camera
  refreshTrigger.value++
}

function onMoveComplete() {
  // Trigger a position refresh after any move
  refreshTrigger.value++
}
</script>

<template>
  <div class="ptz-control-view">
    <h2>PTZ Camera Control</h2>

    <div class="top-bar">
      <CameraSelector @select="onCameraSelect" />
      <div v-if="selectedCamera" class="info-badges">
        <span class="info-badge" data-testid="camera-id-badge">Camera: <code>{{ selectedCamera.id }}</code></span>
      </div>
    </div>

    <div class="ptz-layout" data-testid="ptz-layout">
      <div class="video-column" :style="controlsHeight ? { maxHeight: controlsHeight + 'px' } : undefined">
        <LiveVideoPlayer
          :camera="selectedCamera"
          @move-complete="onMoveComplete"
        />
        <ApiLog />
      </div>

      <div ref="controlsRef" class="controls-column">
        <PositionDisplay
          :camera-id="selectedCamera?.id ?? null"
          :refresh-trigger="refreshTrigger"
          @position-updated="currentPosition = $event"
        />

        <DirectionPad
          :camera-id="selectedCamera?.id ?? null"
          :home-preset="homePreset"
          :current-position="currentPosition"
          @move-complete="onMoveComplete"
        />

        <PositionInput
          :camera-id="selectedCamera?.id ?? null"
          :current-position="currentPosition"
          @move-complete="onMoveComplete"
        />

        <PresetManager
          :camera-id="selectedCamera?.id ?? null"
          @move-complete="onMoveComplete"
          @home-preset-changed="homePreset = $event"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.ptz-control-view {
  max-width: 1100px;
  margin: 0 auto;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.info-badges {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.info-badge {
  font-size: 11px;
  color: #666;
  white-space: nowrap;
}

.info-badge code {
  background: #e9ecef;
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 11px;
}

.ptz-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  align-items: start;
  gap: 20px;
  margin-bottom: 30px;
}

.video-column {
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.controls-column {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

@media (max-width: 768px) {
  .ptz-layout {
    grid-template-columns: 1fr;
  }

  .controls-column {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .controls-column > * {
    flex: 1;
    min-width: 250px;
  }
}
</style>
