<script setup lang="ts">
import { ref, watch } from 'vue'
import { movePtz } from 'een-api-toolkit'
import type { PtzPositionResponse } from 'een-api-toolkit'
import { useApiLog } from '../composables/useApiLog'

const props = defineProps<{
  cameraId: string | null
  currentPosition: PtzPositionResponse | null
}>()

const emit = defineEmits<{
  (e: 'move-complete'): void
}>()

const { log: apiLog } = useApiLog()
const x = ref<string>('0')
const y = ref<string>('0')
const z = ref<string>('0')
const applying = ref(false)
const error = ref<string | null>(null)

watch(() => props.currentPosition, (pos) => {
  if (pos) {
    x.value = pos.x?.toFixed(3) ?? '0'
    y.value = pos.y?.toFixed(3) ?? '0'
    z.value = pos.z?.toFixed(3) ?? '0'
  }
}, { immediate: true })

async function apply() {
  if (!props.cameraId || applying.value) return

  const xVal = parseFloat(x.value)
  const yVal = parseFloat(y.value)
  const zVal = parseFloat(z.value)

  if (isNaN(xVal) || isNaN(yVal) || isNaN(zVal)) {
    error.value = 'Invalid numeric values'
    return
  }

  applying.value = true
  error.value = null

  const move = { moveType: 'position' as const, x: xVal, y: yVal, z: zVal }
  const result = await movePtz(props.cameraId, move)
  apiLog('movePtz', { cameraId: props.cameraId, move }, result.error ?? result.data, !!result.error)

  applying.value = false

  if (result.error) {
    error.value = result.error.message
  } else {
    emit('move-complete')
  }
}
</script>

<template>
  <div class="position-input" data-testid="position-input">
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
  min-width: 20px;
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

.input-row input:disabled {
  opacity: 0.5;
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
