import { ref, watch } from 'vue'

// Global reactive state for selected camera ID
const selectedCameraId = ref<string | null>(null)

// Load from localStorage on initialization
const stored = localStorage.getItem('vue-media-selected-camera')
if (stored) {
  selectedCameraId.value = stored
}

// Persist to localStorage when changed
watch(selectedCameraId, (newValue) => {
  if (newValue) {
    localStorage.setItem('vue-media-selected-camera', newValue)
  } else {
    localStorage.removeItem('vue-media-selected-camera')
  }
})

/**
 * Composable for sharing selected camera ID across pages
 */
export function useSelectedCamera() {
  return {
    selectedCameraId,
    setSelectedCamera(id: string | null) {
      selectedCameraId.value = id
    }
  }
}
