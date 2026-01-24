<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Layout, Camera, LayoutSettings, LayoutPane, CameraStatus } from 'een-api-toolkit'

const props = defineProps<{
  layout: Layout | null
  cameras: Camera[]
  loading: boolean
  error: string | null
  defaultSettings: LayoutSettings
}>()

const emit = defineEmits<{
  save: [data: { name: string; settings: LayoutSettings; panes: LayoutPane[] }]
  delete: [layoutId: string]
  close: []
}>()

// Form state
const name = ref('')
const settings = ref<LayoutSettings>({ ...props.defaultSettings })
const panes = ref<LayoutPane[]>([])

// Initialize form when layout changes
watch(
  () => props.layout,
  (newLayout) => {
    if (newLayout) {
      name.value = newLayout.name
      settings.value = { ...newLayout.settings }
      panes.value = newLayout.panes ? [...newLayout.panes] : []
    } else {
      name.value = ''
      settings.value = { ...props.defaultSettings }
      panes.value = []
    }
  },
  { immediate: true }
)

const isEditing = computed(() => !!props.layout)
const modalTitle = computed(() => isEditing.value ? 'Edit Layout' : 'Create Layout')

const canDelete = computed(() => {
  if (!props.layout) return false
  return props.layout.effectivePermissions?.delete !== false
})

// Helper to get camera status string
function getCameraStatusString(status?: CameraStatus | { connectionStatus?: CameraStatus }): string {
  if (!status) return 'unknown'
  if (typeof status === 'string') return status
  return status.connectionStatus || 'unknown'
}

// Get camera name by ID
function getCameraName(cameraId: string): string {
  const camera = props.cameras.find(c => c.id === cameraId)
  return camera?.name || cameraId
}

// Add a new pane
function addPane() {
  const newId = panes.value.length > 0
    ? Math.max(...panes.value.map(p => p.id)) + 1
    : 1

  panes.value.push({
    id: newId,
    name: `Pane ${newId}`,
    type: 'preview',
    size: 1,
    cameraId: ''
  })
}

// Remove a pane
function removePane(index: number) {
  panes.value.splice(index, 1)
}

// Handle form submission
function handleSubmit() {
  if (!name.value.trim()) {
    return
  }

  // Filter out panes without cameras
  const validPanes = panes.value.filter(p => p.cameraId)

  emit('save', {
    name: name.value.trim(),
    settings: settings.value,
    panes: validPanes
  })
}

// Handle delete
function handleDelete() {
  if (props.layout) {
    emit('delete', props.layout.id)
  }
}
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ modalTitle }}</h2>
        <button class="close-btn" @click="emit('close')">&times;</button>
      </div>

      <div v-if="error" class="error">{{ error }}</div>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="name">Layout Name</label>
          <input
            id="name"
            v-model="name"
            type="text"
            placeholder="Enter layout name"
            required
          />
        </div>

        <div class="form-section">
          <h3>Settings</h3>

          <div class="settings-grid">
            <div class="form-group">
              <label for="columns">Columns</label>
              <select id="columns" v-model.number="settings.paneColumns">
                <option :value="1">1 Column</option>
                <option :value="2">2 Columns</option>
                <option :value="3">3 Columns</option>
                <option :value="4">4 Columns</option>
                <option :value="5">5 Columns</option>
                <option :value="6">6 Columns</option>
              </select>
            </div>

            <div class="form-group">
              <label for="aspectRatio">Aspect Ratio</label>
              <select id="aspectRatio" v-model="settings.cameraAspectRatio">
                <option value="16x9">16:9 (Widescreen)</option>
                <option value="4x3">4:3 (Standard)</option>
              </select>
            </div>

            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" v-model="settings.showCameraBorder" />
                Show Camera Border
              </label>
            </div>

            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" v-model="settings.showCameraName" />
                Show Camera Name
              </label>
            </div>
          </div>
        </div>

        <div class="form-section">
          <div class="section-header">
            <h3>Camera Panes</h3>
            <button type="button" class="add-btn" @click="addPane">+ Add Pane</button>
          </div>

          <div v-if="panes.length === 0" class="no-panes">
            No camera panes. Click "Add Pane" to add cameras to this layout.
          </div>

          <div v-else class="panes-list">
            <div v-for="(pane, index) in panes" :key="pane.id" class="pane-item">
              <div class="pane-fields">
                <div class="form-group">
                  <label :for="`pane-name-${pane.id}`">Pane Name</label>
                  <input
                    :id="`pane-name-${pane.id}`"
                    v-model="pane.name"
                    type="text"
                    placeholder="Pane name"
                  />
                </div>

                <div class="form-group">
                  <label :for="`pane-camera-${pane.id}`">Camera</label>
                  <select :id="`pane-camera-${pane.id}`" v-model="pane.cameraId">
                    <option value="">Select camera...</option>
                    <option v-for="camera in cameras" :key="camera.id" :value="camera.id">
                      {{ camera.name }} ({{ getCameraStatusString(camera.status) }})
                    </option>
                  </select>
                </div>

                <div class="form-group">
                  <label :for="`pane-size-${pane.id}`">Size</label>
                  <select :id="`pane-size-${pane.id}`" v-model.number="pane.size">
                    <option :value="1">Small (1x1)</option>
                    <option :value="2">Medium (2x2)</option>
                    <option :value="3">Large (3x3)</option>
                  </select>
                </div>
              </div>

              <button type="button" class="remove-btn" @click="removePane(index)">Remove</button>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <div class="left-actions">
            <button
              v-if="isEditing && canDelete"
              type="button"
              class="danger"
              @click="handleDelete"
              :disabled="loading"
            >
              Delete Layout
            </button>
          </div>

          <div class="right-actions">
            <button type="button" class="secondary" @click="emit('close')">Cancel</button>
            <button type="submit" :disabled="loading || !name.trim()">
              {{ loading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Layout') }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  line-height: 1;
}

.close-btn:hover {
  color: #333;
}

form {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #333;
}

.form-group input[type="text"],
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.form-group input[type="text"]:focus,
.form-group select:focus {
  outline: none;
  border-color: #42b883;
  box-shadow: 0 0 0 2px rgba(66, 184, 131, 0.2);
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-group input[type="checkbox"] {
  width: 18px;
  height: 18px;
}

.form-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
}

.form-section h3 {
  margin: 0 0 16px 0;
  font-size: 1rem;
  color: #333;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  margin: 0;
}

.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.add-btn {
  padding: 6px 12px;
  font-size: 14px;
}

.no-panes {
  text-align: center;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 8px;
  color: #666;
}

.panes-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pane-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.pane-fields {
  display: grid;
  grid-template-columns: 1fr 1fr 100px;
  gap: 12px;
  margin-bottom: 12px;
}

.pane-fields .form-group {
  margin-bottom: 0;
}

.remove-btn {
  background: #f8d7da;
  color: #721c24;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.remove-btn:hover {
  background: #f5c6cb;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.left-actions,
.right-actions {
  display: flex;
  gap: 10px;
}

.error {
  margin: 0 20px;
  padding: 12px;
  background: #fdf2f2;
  border-radius: 6px;
  color: #e74c3c;
}

@media (max-width: 600px) {
  .pane-fields {
    grid-template-columns: 1fr;
  }

  .settings-grid {
    grid-template-columns: 1fr;
  }

  .modal-footer {
    flex-direction: column;
    gap: 12px;
  }

  .left-actions,
  .right-actions {
    width: 100%;
    justify-content: center;
  }
}
</style>
