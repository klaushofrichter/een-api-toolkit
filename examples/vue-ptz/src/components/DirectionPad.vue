<script setup lang="ts">
import { ref, computed } from 'vue'
import { movePtz } from 'een-api-toolkit'
import type { PtzDirection, PtzStepSize, PtzPreset, PtzPositionResponse } from 'een-api-toolkit'
import { useApiLog } from '../composables/useApiLog'

import { POSITION_TOLERANCE } from '../composables/useApiLog'

const props = defineProps<{
  cameraId: string | null
  homePreset: PtzPreset | null
  currentPosition: PtzPositionResponse | null
}>()

const isAtHome = computed(() => {
  if (!props.homePreset || !props.currentPosition) return false
  const home = props.homePreset.position
  const cur = props.currentPosition
  return (
    Math.abs((cur.x ?? 0) - (home.x ?? 0)) < POSITION_TOLERANCE &&
    Math.abs((cur.y ?? 0) - (home.y ?? 0)) < POSITION_TOLERANCE &&
    Math.abs((cur.z ?? 0) - (home.z ?? 0)) < POSITION_TOLERANCE
  )
})

const emit = defineEmits<{
  (e: 'move-complete'): void
}>()

const { log: apiLog } = useApiLog()
const stepSize = ref<PtzStepSize>('medium')
const moving = ref(false)
const error = ref<string | null>(null)

async function move(directions: PtzDirection[]) {
  if (!props.cameraId || moving.value) return

  moving.value = true
  error.value = null

  const moveCmd = { moveType: 'direction' as const, direction: directions, stepSize: stepSize.value }
  const result = await movePtz(props.cameraId, moveCmd)
  apiLog('movePtz', { cameraId: props.cameraId, move: moveCmd }, result.error ?? result.data, !!result.error)

  moving.value = false

  if (result.error) {
    error.value = result.error.message
  } else {
    emit('move-complete')
  }
}

async function goHome() {
  if (!props.cameraId || !props.homePreset || moving.value) return

  moving.value = true
  error.value = null

  const pos = props.homePreset.position
  const moveCmd = { moveType: 'position' as const, x: pos.x, y: pos.y, z: pos.z }
  const result = await movePtz(props.cameraId, moveCmd)
  apiLog('movePtz', { cameraId: props.cameraId, move: moveCmd }, result.error ?? result.data, !!result.error)

  moving.value = false

  if (result.error) {
    error.value = result.error.message
  } else {
    emit('move-complete')
  }
}
</script>

<template>
  <div class="direction-pad" data-testid="direction-pad">
    <div class="step-size-selector">
      <label>Step Size:</label>
      <select v-model="stepSize" data-testid="step-size-select">
        <option value="small">Small</option>
        <option value="medium">Medium</option>
        <option value="large">Large</option>
      </select>
    </div>

    <div class="dpad-grid">
      <div class="dpad-row">
        <div class="dpad-spacer"></div>
        <button
          class="dpad-btn"
          :disabled="!cameraId || moving"
          @click="move(['up'])"
          data-testid="btn-up"
          title="Pan Up"
        >
          &#9650;
        </button>
        <div class="dpad-spacer"></div>
      </div>
      <div class="dpad-row">
        <button
          class="dpad-btn"
          :disabled="!cameraId || moving"
          @click="move(['left'])"
          data-testid="btn-left"
          title="Pan Left"
        >
          &#9664;
        </button>
        <button
          v-if="homePreset"
          class="dpad-center dpad-home"
          :class="isAtHome ? 'dpad-home-at' : 'dpad-home-away'"
          :disabled="!cameraId || moving"
          @click="goHome"
          data-testid="btn-home"
          :title="'Go to Home: ' + homePreset.name"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
        </button>
        <div v-else class="dpad-center">PTZ</div>
        <button
          class="dpad-btn"
          :disabled="!cameraId || moving"
          @click="move(['right'])"
          data-testid="btn-right"
          title="Pan Right"
        >
          &#9654;
        </button>
      </div>
      <div class="dpad-row">
        <div class="dpad-spacer"></div>
        <button
          class="dpad-btn"
          :disabled="!cameraId || moving"
          @click="move(['down'])"
          data-testid="btn-down"
          title="Pan Down"
        >
          &#9660;
        </button>
        <div class="dpad-spacer"></div>
      </div>
    </div>

    <div class="zoom-controls">
      <button
        class="zoom-btn zoom-in"
        :disabled="!cameraId || moving"
        @click="move(['in'])"
        data-testid="btn-zoom-in"
        title="Zoom In"
      >
        + Zoom In
      </button>
      <button
        class="zoom-btn zoom-out"
        :disabled="!cameraId || moving"
        @click="move(['out'])"
        data-testid="btn-zoom-out"
        title="Zoom Out"
      >
        - Zoom Out
      </button>
    </div>

    <div v-if="error" class="pad-error">
      <p>{{ error }}</p>
    </div>
  </div>
</template>

<style scoped>
.direction-pad {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.step-size-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
  justify-content: center;
}

.step-size-selector label {
  font-size: 13px;
  font-weight: 600;
}

.step-size-selector select {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
}

.dpad-grid {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin-bottom: 15px;
}

.dpad-row {
  display: flex;
  gap: 4px;
}

.dpad-btn {
  width: 50px;
  height: 50px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #fff;
  color: #333;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  padding: 0;
}

.dpad-btn:hover:not(:disabled) {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.dpad-btn:active:not(:disabled) {
  background: #2980b9;
  transform: scale(0.95);
}

.dpad-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.dpad-center {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e9ecef;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  color: #666;
}

.dpad-home {
  border: 1px solid #ccc;
  cursor: pointer;
  transition: all 0.15s;
  padding: 0;
}

.dpad-home-at {
  color: #27ae60;
}

.dpad-home-away {
  color: #e74c3c;
}

.dpad-home-at:hover:not(:disabled) {
  background: #27ae60;
  color: white;
  border-color: #27ae60;
}

.dpad-home-away:hover:not(:disabled) {
  background: #e74c3c;
  color: white;
  border-color: #e74c3c;
}

.dpad-home:active:not(:disabled) {
  transform: scale(0.95);
}

.dpad-home:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.dpad-spacer {
  width: 50px;
  height: 50px;
}

.zoom-controls {
  display: flex;
  gap: 8px;
}

.zoom-btn {
  flex: 1;
  padding: 10px;
  font-size: 13px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background: #fff;
  color: #333;
  cursor: pointer;
  transition: all 0.15s;
}

.zoom-btn:hover:not(:disabled) {
  border-color: #3498db;
  color: #3498db;
}

.zoom-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.zoom-in:hover:not(:disabled) {
  background: #e8f5e9;
  border-color: #27ae60;
  color: #27ae60;
}

.zoom-out:hover:not(:disabled) {
  background: #fce4ec;
  border-color: #e74c3c;
  color: #e74c3c;
}

.pad-error {
  margin-top: 10px;
  padding: 8px;
  background: #f8d7da;
  border-radius: 4px;
  color: #721c24;
  font-size: 12px;
}
</style>
