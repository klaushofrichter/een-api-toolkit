<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  getLayouts,
  getCameras,
  createLayout,
  updateLayout,
  deleteLayout,
  type Layout,
  type Camera,
  type EenError,
  type ListLayoutsParams,
  type CreateLayoutParams,
  type UpdateLayoutParams,
  type LayoutSettings
} from 'een-api-toolkit'
import LayoutModal from '../components/LayoutModal.vue'

// Reactive state
const layouts = ref<Layout[]>([])
const cameras = ref<Camera[]>([])
const loading = ref(false)
const error = ref<EenError | null>(null)
const nextPageToken = ref<string | undefined>(undefined)

const hasNextPage = computed(() => !!nextPageToken.value)

const params = ref<ListLayoutsParams>({
  pageSize: 20,
  include: ['resourceCounts', 'effectivePermissions']
})

// Modal state
const showModal = ref(false)
const selectedLayout = ref<Layout | null>(null)
const modalLoading = ref(false)
const modalError = ref<string | null>(null)

// Default settings for new layouts
const defaultSettings: LayoutSettings = {
  showCameraBorder: true,
  showCameraName: true,
  cameraAspectRatio: '16x9',
  paneColumns: 3
}

async function fetchLayouts(fetchParams?: ListLayoutsParams, append = false) {
  loading.value = true
  error.value = null

  const mergedParams = { ...params.value, ...fetchParams }
  const result = await getLayouts(mergedParams)

  if (result.error) {
    error.value = result.error
    if (!append) {
      layouts.value = []
    }
    nextPageToken.value = undefined
  } else {
    if (append) {
      layouts.value = [...layouts.value, ...result.data.results]
    } else {
      layouts.value = result.data.results
    }
    nextPageToken.value = result.data.nextPageToken
  }

  loading.value = false
  return result
}

async function fetchCameras() {
  const result = await getCameras({ pageSize: 100, include: ['status'] })
  if (result.data) {
    cameras.value = result.data.results
  }
}

function refresh() {
  return fetchLayouts()
}

async function fetchNextPage() {
  if (!nextPageToken.value) return
  return fetchLayouts({ ...params.value, pageToken: nextPageToken.value }, true)
}

function openCreateModal() {
  selectedLayout.value = null
  modalError.value = null
  showModal.value = true
}

function openEditModal(layout: Layout) {
  selectedLayout.value = layout
  modalError.value = null
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  selectedLayout.value = null
  modalError.value = null
}

async function handleSave(data: { name: string; settings: LayoutSettings; panes: Layout['panes'] }) {
  modalLoading.value = true
  modalError.value = null

  try {
    if (selectedLayout.value) {
      // Update existing layout
      const updateParams: UpdateLayoutParams = {
        name: data.name,
        settings: data.settings,
        panes: data.panes
      }

      const result = await updateLayout(selectedLayout.value.id, updateParams)
      if (result.error) {
        modalError.value = result.error.message
        return
      }
    } else {
      // Create new layout
      const createParams: CreateLayoutParams = {
        name: data.name,
        settings: data.settings,
        panes: data.panes
      }

      const result = await createLayout(createParams)
      if (result.error) {
        modalError.value = result.error.message
        return
      }
    }

    closeModal()
    await fetchLayouts()
  } finally {
    modalLoading.value = false
  }
}

async function handleDelete(layoutId: string) {
  if (!confirm('Are you sure you want to delete this layout?')) {
    return
  }

  modalLoading.value = true
  modalError.value = null

  const result = await deleteLayout(layoutId)

  if (result.error) {
    modalError.value = result.error.message
    modalLoading.value = false
    return
  }

  closeModal()
  await fetchLayouts()
  modalLoading.value = false
}

onMounted(async () => {
  await Promise.all([fetchLayouts(), fetchCameras()])
})
</script>

<template>
  <div class="layouts">
    <div class="header">
      <h2>Layouts</h2>
      <div class="controls">
        <button @click="openCreateModal">Create Layout</button>
        <button class="secondary" @click="refresh" :disabled="loading">
          {{ loading ? 'Loading...' : 'Refresh' }}
        </button>
      </div>
    </div>

    <div v-if="loading && layouts.length === 0" class="loading">
      Loading layouts...
    </div>

    <div v-else-if="error" class="error">
      Error: {{ error.message }}
    </div>

    <div v-else>
      <div v-if="layouts.length > 0" class="layout-grid">
        <div
          v-for="layout in layouts"
          :key="layout.id"
          class="layout-card"
          @click="openEditModal(layout)"
        >
          <div class="layout-header">
            <h3>{{ layout.name }}</h3>
            <span class="pane-count">{{ layout.panes?.length || 0 }} panes</span>
          </div>
          <div class="layout-details">
            <p>
              <strong>Columns:</strong> {{ layout.settings?.paneColumns || 'N/A' }}
            </p>
            <p>
              <strong>Aspect Ratio:</strong> {{ layout.settings?.cameraAspectRatio || 'N/A' }}
            </p>
            <p v-if="layout.resourceCounts?.cameras !== undefined">
              <strong>Cameras:</strong> {{ layout.resourceCounts.cameras }}
            </p>
            <div v-if="layout.effectivePermissions" class="permissions">
              <span v-if="layout.effectivePermissions.edit" class="badge edit">Can Edit</span>
              <span v-if="layout.effectivePermissions.delete" class="badge delete">Can Delete</span>
            </div>
          </div>
        </div>
      </div>

      <p v-else class="no-layouts">
        No layouts found. Click "Create Layout" to add one.
      </p>

      <div v-if="hasNextPage" class="pagination">
        <button @click="fetchNextPage" :disabled="loading">
          {{ loading ? 'Loading...' : 'Load More' }}
        </button>
      </div>
    </div>

    <!-- Layout Modal -->
    <LayoutModal
      v-if="showModal"
      :layout="selectedLayout"
      :cameras="cameras"
      :loading="modalLoading"
      :error="modalError"
      :default-settings="defaultSettings"
      @save="handleSave"
      @delete="handleDelete"
      @close="closeModal"
    />
  </div>
</template>

<style scoped>
.layouts {
  max-width: 1000px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.controls {
  display: flex;
  gap: 10px;
}

.layout-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.layout-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
}

.layout-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.layout-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.layout-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
}

.pane-count {
  background: #e9ecef;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
  color: #666;
}

.layout-details p {
  margin: 4px 0;
  font-size: 0.9rem;
  color: #666;
}

.permissions {
  margin-top: 8px;
  display: flex;
  gap: 6px;
}

.badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge.edit {
  background: #d4edda;
  color: #155724;
}

.badge.delete {
  background: #f8d7da;
  color: #721c24;
}

.no-layouts {
  text-align: center;
  color: #666;
  padding: 40px 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}
</style>
