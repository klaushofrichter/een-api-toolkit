<script setup lang="ts">
import { ref, watch } from 'vue'
import { movePtz } from 'een-api-toolkit'
import type { PtzPositionResponse, PtzDirection, PtzStepSize, PtzMoveType } from 'een-api-toolkit'
import { useApiLog } from '../composables/useApiLog'

const props = defineProps<{
  cameraId: string | null
  currentPosition: PtzPositionResponse | null
}>()

const emit = defineEmits<{
  (e: 'move-complete'): void
}>()

const { log: apiLog } = useApiLog()

// Move type selection
const moveType = ref<PtzMoveType>('position')

// Position fields
const x = ref<string>('0')
const y = ref<string>('0')
const z = ref<string>('0')

// Direction fields
const directions = ref<PtzDirection[]>([])
const stepSize = ref<PtzStepSize>('medium')
const allDirections: PtzDirection[] = ['up', 'down', 'left', 'right', 'in', 'out']

// CenterOn fields
const relativeX = ref<string>('0.5')
const relativeY = ref<string>('0.5')

const applying = ref(false)
const error = ref<string | null>(null)

watch(moveType, () => {
  error.value = null
})

function importPosition() {
  if (props.currentPosition) {
    x.value = props.currentPosition.x?.toFixed(3) ?? '0'
    y.value = props.currentPosition.y?.toFixed(3) ?? '0'
    z.value = props.currentPosition.z?.toFixed(3) ?? '0'
  }
}

async function apply() {
  if (!props.cameraId || applying.value) return

  error.value = null

  if (moveType.value === 'position') {
    const xVal = parseFloat(x.value)
    const yVal = parseFloat(y.value)
    const zVal = parseFloat(z.value)

    if (isNaN(xVal) || isNaN(yVal) || isNaN(zVal)) {
      error.value = 'Invalid numeric values'
      return
    }

    applying.value = true
    try {
      const move = { moveType: 'position' as const, x: xVal, y: yVal, z: zVal }
      const result = await movePtz(props.cameraId, move)
      apiLog('movePtz', { cameraId: props.cameraId, move }, result.error ?? result.data, !!result.error)

      if (result.error) {
        error.value = result.error.message
      } else {
        emit('move-complete')
      }
    } finally {
      applying.value = false
    }
  } else if (moveType.value === 'direction') {
    if (directions.value.length === 0) {
      error.value = 'Select at least one direction'
      return
    }

    applying.value = true
    try {
      const move = { moveType: 'direction' as const, direction: [...directions.value], stepSize: stepSize.value }
      const result = await movePtz(props.cameraId, move)
      apiLog('movePtz', { cameraId: props.cameraId, move }, result.error ?? result.data, !!result.error)

      if (result.error) {
        error.value = result.error.message
      } else {
        emit('move-complete')
      }
    } finally {
      applying.value = false
    }
  } else if (moveType.value === 'centerOn') {
    const rxVal = parseFloat(relativeX.value)
    const ryVal = parseFloat(relativeY.value)

    if (isNaN(rxVal) || isNaN(ryVal)) {
      error.value = 'Invalid numeric values'
      return
    }

    if (rxVal < 0 || rxVal > 1 || ryVal < 0 || ryVal > 1) {
      error.value = 'Values must be between 0 and 1'
      return
    }

    applying.value = true
    try {
      const move = { moveType: 'centerOn' as const, relativeX: rxVal, relativeY: ryVal }
      const result = await movePtz(props.cameraId, move)
      apiLog('movePtz', { cameraId: props.cameraId, move }, result.error ?? result.data, !!result.error)

      if (result.error) {
        error.value = result.error.message
      } else {
        emit('move-complete')
      }
    } finally {
      applying.value = false
    }
  }
}
</script>

<template>
  <div class="position-input" data-testid="position-input">
    <div class="input-row">
      <label>Move</label>
      <select v-model="moveType" :disabled="!cameraId || applying" data-testid="move-type-select">
        <option value="position">Position</option>
        <option value="direction">Direction</option>
        <option value="centerOn">Center On</option>
      </select>
    </div>

    <!-- Position fields -->
    <template v-if="moveType === 'position'">
      <div class="input-row">
        <label>X</label>
        <input
          v-model="x"
          type="number"
          step="0.01"
          :disabled="!cameraId || applying"
          data-testid="input-x"
          @keyup.enter="apply"
        />
      </div>
      <div class="input-row">
        <label>Y</label>
        <input
          v-model="y"
          type="number"
          step="0.01"
          :disabled="!cameraId || applying"
          data-testid="input-y"
          @keyup.enter="apply"
        />
      </div>
      <div class="input-row">
        <label>Z</label>
        <input
          v-model="z"
          type="number"
          step="0.1"
          min="0"
          :disabled="!cameraId || applying"
          data-testid="input-z"
          @keyup.enter="apply"
        />
      </div>
      <button
        class="import-btn"
        :disabled="!cameraId || !currentPosition || applying"
        @click="importPosition"
        data-testid="import-position"
      >
        Import Current Position
      </button>
    </template>

    <!-- Direction fields -->
    <template v-if="moveType === 'direction'">
      <div class="direction-checkboxes">
        <label v-for="dir in allDirections" :key="dir" class="checkbox-label">
          <input
            type="checkbox"
            :value="dir"
            v-model="directions"
            :disabled="!cameraId || applying"
            :data-testid="'dir-' + dir"
          />
          {{ dir }}
        </label>
      </div>
      <div class="input-row">
        <label>Step</label>
        <select v-model="stepSize" :disabled="!cameraId || applying" data-testid="step-size-select">
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>
    </template>

    <!-- CenterOn fields -->
    <template v-if="moveType === 'centerOn'">
      <div class="input-row">
        <label>rX</label>
        <input
          v-model="relativeX"
          type="number"
          step="0.01"
          min="0"
          max="1"
          :disabled="!cameraId || applying"
          data-testid="input-relative-x"
          @keyup.enter="apply"
        />
      </div>
      <div class="input-row">
        <label>rY</label>
        <input
          v-model="relativeY"
          type="number"
          step="0.01"
          min="0"
          max="1"
          :disabled="!cameraId || applying"
          data-testid="input-relative-y"
          @keyup.enter="apply"
        />
      </div>
    </template>

    <button
      class="apply-btn"
      :disabled="!cameraId || applying"
      @click="apply"
      data-testid="apply-position"
    >
      {{ applying ? 'Applying...' : 'Apply' }}
    </button>
    <div v-if="error" class="input-error">
      <span>{{ error }}</span>
      <button class="dismiss-btn" @click="error = null">&times;</button>
    </div>
  </div>
</template>

<style scoped>
.position-input {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.input-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.input-row label {
  font-size: 13px;
  font-weight: 600;
  color: #555;
  min-width: 32px;
  text-align: right;
}

.input-row input {
  flex: 1;
  padding: 5px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  font-family: monospace;
}

.input-row select {
  flex: 1;
  padding: 5px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
}

.input-row input:disabled,
.input-row select:disabled {
  opacity: 0.5;
}

.direction-checkboxes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 12px;
  margin-bottom: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #555;
  cursor: pointer;
  text-transform: capitalize;
}

.checkbox-label input[type="checkbox"] {
  margin: 0;
}

.import-btn {
  width: 100%;
  padding: 6px;
  font-size: 11px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 4px;
}

.import-btn:hover:not(:disabled) {
  background: #5a6268;
}

.import-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.apply-btn {
  width: 100%;
  padding: 8px;
  font-size: 12px;
  background: #3498db;
  margin-top: 4px;
}

.apply-btn:hover:not(:disabled) {
  background: #2980b9;
}

.apply-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.input-error {
  margin-top: 8px;
  padding: 6px 8px;
  background: #f8d7da;
  border-radius: 4px;
  color: #721c24;
  font-size: 12px;
  position: relative;
}

.dismiss-btn {
  position: absolute;
  top: 2px;
  right: 4px;
  background: none;
  border: none;
  color: #721c24;
  font-size: 14px;
  cursor: pointer;
  padding: 0 2px;
  line-height: 1;
}

.dismiss-btn:hover {
  color: #491217;
}
</style>
