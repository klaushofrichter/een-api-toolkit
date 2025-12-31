import { ref, watch } from 'vue'

const STORAGE_KEY = 'vue-media-selected-camera'

// Camera ID validation pattern (alphanumeric, typically 8 characters)
const CAMERA_ID_PATTERN = /^[a-zA-Z0-9]{1,32}$/

/**
 * Validate camera ID format to prevent XSS via localStorage injection
 */
function isValidCameraId(id: string): boolean {
  return CAMERA_ID_PATTERN.test(id)
}

/**
 * Safe localStorage getter with error handling
 */
function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    // localStorage may be disabled or unavailable (private browsing, etc.)
    return null
  }
}

/**
 * Safe localStorage setter with error handling
 */
function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // localStorage may be full, disabled, or unavailable
  }
}

/**
 * Safe localStorage remover with error handling
 */
function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // localStorage may be disabled or unavailable
  }
}

// Global reactive state for selected camera ID
const selectedCameraId = ref<string | null>(null)

// Initialization flag to prevent race conditions
let isInitialized = false

/**
 * Initialize from localStorage (called once on first use)
 */
function initializeFromStorage(): void {
  if (isInitialized) return
  isInitialized = true

  const stored = safeGetItem(STORAGE_KEY)
  if (stored && isValidCameraId(stored)) {
    selectedCameraId.value = stored
  }
}

// Initialize on module load
initializeFromStorage()

// Persist to localStorage when changed
watch(selectedCameraId, (newValue) => {
  if (newValue && isValidCameraId(newValue)) {
    safeSetItem(STORAGE_KEY, newValue)
  } else {
    safeRemoveItem(STORAGE_KEY)
  }
})

/**
 * Composable for sharing selected camera ID across pages
 */
export function useSelectedCamera() {
  // Ensure initialization on first use (handles lazy loading scenarios)
  initializeFromStorage()

  return {
    selectedCameraId,
    setSelectedCamera(id: string | null) {
      if (id === null || isValidCameraId(id)) {
        selectedCameraId.value = id
      }
    }
  }
}
