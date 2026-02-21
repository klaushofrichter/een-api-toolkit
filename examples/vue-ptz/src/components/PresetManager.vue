<script setup lang="ts">
import { ref, watch } from 'vue'
import { getPtzPosition, getPtzSettings, updatePtzSettings, movePtz } from 'een-api-toolkit'
import type { PtzSettings, PtzPreset, PtzMode } from 'een-api-toolkit'
import { useApiLog } from '../composables/useApiLog'

const props = defineProps<{
  cameraId: string | null
}>()

const emit = defineEmits<{
  (e: 'move-complete'): void
  (e: 'home-preset-changed', preset: PtzPreset | null): void
}>()

const { log: apiLog, setPresets } = useApiLog()
const settings = ref<PtzSettings | null>(null)
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const newPresetName = ref('')

async function loadSettings() {
  if (!props.cameraId) return

  loading.value = true
  error.value = null

  const result = await getPtzSettings(props.cameraId)
  apiLog('getPtzSettings', { cameraId: props.cameraId }, result.error ?? result.data, !!result.error)

  if (result.error) {
    error.value = result.error.message
    loading.value = false
    return
  }

  settings.value = result.data
  loading.value = false
  emitHomePreset()
}

function emitHomePreset() {
  setPresets(settings.value?.presets ?? [], settings.value?.homePreset ?? null)
  if (!settings.value || !settings.value.homePreset) {
    emit('home-preset-changed', null)
    return
  }
  const preset = settings.value.presets.find(p => p.name === settings.value!.homePreset) ?? null
  emit('home-preset-changed', preset)
}

async function goToPreset(preset: PtzPreset) {
  if (!props.cameraId) return

  const move = { moveType: 'position' as const, x: preset.position.x, y: preset.position.y, z: preset.position.z }
  const result = await movePtz(props.cameraId, move)
  apiLog('movePtz', { cameraId: props.cameraId, move }, result.error ?? result.data, !!result.error)

  if (result.error) {
    error.value = `Failed to go to preset: ${result.error.message}`
  } else {
    emit('move-complete')
  }
}

async function saveCurrentAsPreset() {
  if (!props.cameraId || !settings.value || !newPresetName.value.trim()) return

  saving.value = true
  error.value = null

  // Get current position
  const posResult = await getPtzPosition(props.cameraId)
  apiLog('getPtzPosition', { cameraId: props.cameraId }, posResult.error ?? posResult.data, !!posResult.error)
  if (posResult.error) {
    error.value = `Failed to read position: ${posResult.error.message}`
    saving.value = false
    return
  }

  const newPreset: PtzPreset = {
    name: newPresetName.value.trim(),
    position: posResult.data!,
    timeAtPreset: 10
  }

  const updatedPresets = [...settings.value.presets, newPreset]

  const saveUpdate = { presets: updatedPresets }
  const result = await updatePtzSettings(props.cameraId, saveUpdate)
  apiLog('updatePtzSettings', { cameraId: props.cameraId, settings: saveUpdate }, result.error ?? result.data, !!result.error)

  if (result.error) {
    error.value = `Failed to save preset: ${result.error.message}`
  } else {
    newPresetName.value = ''
    await loadSettings()
  }

  saving.value = false
}

async function deletePreset(index: number) {
  if (!props.cameraId || !settings.value) return

  saving.value = true
  error.value = null

  const deletedPreset = settings.value.presets[index]
  const updatedPresets = settings.value.presets.filter((_, i) => i !== index)

  // If deleting the home preset, clear it
  const update: { presets: PtzPreset[]; homePreset?: string | null } = {
    presets: updatedPresets
  }
  if (settings.value.homePreset === deletedPreset.name) {
    update.homePreset = null
  }

  const result = await updatePtzSettings(props.cameraId, update)
  apiLog('updatePtzSettings', { cameraId: props.cameraId, settings: update }, result.error ?? result.data, !!result.error)

  if (result.error) {
    error.value = `Failed to delete preset: ${result.error.message}`
  } else {
    await loadSettings()
  }

  saving.value = false
}

async function setHomePreset(presetName: string | null) {
  if (!props.cameraId) return

  saving.value = true
  error.value = null

  const homeUpdate = { homePreset: presetName }
  const result = await updatePtzSettings(props.cameraId, homeUpdate)
  apiLog('updatePtzSettings', { cameraId: props.cameraId, settings: homeUpdate }, result.error ?? result.data, !!result.error)

  if (result.error) {
    error.value = `Failed to set home preset: ${result.error.message}`
  } else {
    await loadSettings()
  }

  saving.value = false
}

async function setMode(mode: PtzMode) {
  if (!props.cameraId) return

  saving.value = true
  error.value = null

  const modeUpdate = { mode }
  const result = await updatePtzSettings(props.cameraId, modeUpdate)
  apiLog('updatePtzSettings', { cameraId: props.cameraId, settings: modeUpdate }, result.error ?? result.data, !!result.error)

  if (result.error) {
    error.value = `Failed to update mode: ${result.error.message}`
  } else {
    await loadSettings()
  }

  saving.value = false
}

async function setAutoStartDelay(event: Event) {
  if (!props.cameraId) return

  const target = event.target as HTMLInputElement
  const delay = parseInt(target.value, 10)
  if (isNaN(delay) || delay < 0) return

  saving.value = true
  error.value = null

  const delayUpdate = { autoStartDelay: delay }
  const result = await updatePtzSettings(props.cameraId, delayUpdate)
  apiLog('updatePtzSettings', { cameraId: props.cameraId, settings: delayUpdate }, result.error ?? result.data, !!result.error)

  if (result.error) {
    error.value = `Failed to update delay: ${result.error.message}`
  } else {
    await loadSettings()
  }

  saving.value = false
}

watch(() => props.cameraId, () => {
  settings.value = null
  error.value = null
  loadSettings()
})
</script>

<template>
  <div class="preset-manager" data-testid="preset-manager">
    <div v-if="!cameraId" class="no-camera">
      No camera selected
    </div>

    <div v-else-if="loading" class="loading-state">
      Loading settings...
    </div>

    <div v-else-if="error && !settings" class="error-state">
      <p class="error-text">{{ error }}</p>
      <button @click="loadSettings" class="retry-btn">Retry</button>
    </div>

    <div v-else-if="settings" class="settings-content">
      <!-- Mode selector -->
      <div class="setting-group">
        <label>Mode:</label>
        <select
          :value="settings.mode"
          @change="setMode(($event.target as HTMLSelectElement).value as PtzMode)"
          :disabled="saving"
          data-testid="mode-select"
        >
          <option value="manualOnly">Manual Only</option>
          <option value="homeReturn">Home Return</option>
          <option value="tour">Tour</option>
        </select>
      </div>

      <!-- Auto-start delay -->
      <div class="setting-group">
        <label>Auto-start Delay (s):</label>
        <input
          type="number"
          :value="settings.autoStartDelay"
          @change="setAutoStartDelay"
          :disabled="saving"
          min="0"
          data-testid="auto-start-delay"
        />
      </div>

      <!-- Home preset -->
      <div class="setting-group">
        <label>Home Preset:</label>
        <select
          :value="settings.homePreset || ''"
          @change="setHomePreset(($event.target as HTMLSelectElement).value || null)"
          :disabled="saving"
          data-testid="home-preset-select"
        >
          <option value="">None</option>
          <option v-for="preset in settings.presets" :key="preset.name" :value="preset.name">
            {{ preset.name }}
          </option>
        </select>
      </div>

      <!-- Presets list -->
      <div class="presets-section">
        <h4>Saved Presets ({{ settings.presets.length }})</h4>

        <div v-if="settings.presets.length === 0" class="no-presets">
          No presets saved
        </div>

        <div v-else class="preset-list" data-testid="preset-list">
          <div v-for="(preset, index) in settings.presets" :key="preset.name" class="preset-item">
            <div class="preset-info">
              <span class="preset-name">
                {{ preset.name }}
                <span v-if="preset.name === settings.homePreset" class="home-badge">HOME</span>
              </span>
              <span class="preset-coords">
                ({{ preset.position.x?.toFixed(1) ?? '?' }},
                {{ preset.position.y?.toFixed(1) ?? '?' }},
                {{ preset.position.z?.toFixed(1) ?? '?' }})
              </span>
            </div>
            <div class="preset-actions">
              <button
                @click="goToPreset(preset)"
                :disabled="saving"
                class="goto-btn"
                :data-testid="'goto-preset-' + index"
                title="Move camera to this preset"
              >
                Go To
              </button>
              <button
                @click="deletePreset(index)"
                :disabled="saving"
                class="delete-btn"
                :data-testid="'delete-preset-' + index"
                title="Delete this preset"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Save new preset -->
      <div class="save-preset-section">
        <h4>Save Current Position</h4>
        <div class="save-preset-form">
          <input
            v-model="newPresetName"
            type="text"
            placeholder="Preset name"
            :disabled="saving"
            data-testid="new-preset-name"
            @keyup.enter="saveCurrentAsPreset"
          />
          <button
            @click="saveCurrentAsPreset"
            :disabled="saving || !newPresetName.trim()"
            class="save-btn"
            data-testid="save-preset-btn"
          >
            {{ saving ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </div>

      <div v-if="error" class="settings-error">
        <p>{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.preset-manager {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.no-camera,
.loading-state {
  color: #999;
  font-style: italic;
  text-align: center;
  font-size: 13px;
}

.error-state {
  text-align: center;
}

.error-text {
  color: #e74c3c;
  font-size: 12px;
  margin-bottom: 8px;
}

.setting-group {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.setting-group label {
  font-size: 12px;
  font-weight: 600;
  color: #555;
  min-width: 100px;
}

.setting-group select,
.setting-group input {
  flex: 1;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
}

.setting-group input[type="number"] {
  max-width: 80px;
}

.presets-section {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #ddd;
}

.presets-section h4,
.save-preset-section h4 {
  font-size: 12px;
  color: #555;
  margin-bottom: 8px;
}

.no-presets {
  color: #999;
  font-style: italic;
  font-size: 12px;
  text-align: center;
  padding: 10px;
}

.preset-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.preset-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.preset-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.preset-name {
  font-size: 13px;
  font-weight: 600;
  color: #2c3e50;
}

.home-badge {
  display: inline-block;
  padding: 1px 6px;
  background: #27ae60;
  color: white;
  font-size: 9px;
  border-radius: 3px;
  margin-left: 6px;
  vertical-align: middle;
}

.preset-coords {
  font-family: monospace;
  font-size: 11px;
  color: #888;
}

.preset-actions {
  display: flex;
  gap: 4px;
}

.goto-btn {
  padding: 4px 10px;
  font-size: 11px;
  background: #3498db;
  border-radius: 4px;
}

.goto-btn:hover:not(:disabled) {
  background: #2980b9;
}

.delete-btn {
  padding: 4px 10px;
  font-size: 11px;
  background: #e74c3c;
  border-radius: 4px;
}

.delete-btn:hover:not(:disabled) {
  background: #c0392b;
}

.save-preset-section {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #ddd;
}

.save-preset-form {
  display: flex;
  gap: 6px;
}

.save-preset-form input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
}

.save-btn {
  padding: 6px 14px;
  font-size: 12px;
  background: #27ae60;
}

.save-btn:hover:not(:disabled) {
  background: #219a52;
}

.retry-btn {
  padding: 6px 14px;
  font-size: 12px;
}

.settings-error {
  margin-top: 10px;
  padding: 8px;
  background: #f8d7da;
  border-radius: 4px;
  color: #721c24;
  font-size: 12px;
}
</style>
