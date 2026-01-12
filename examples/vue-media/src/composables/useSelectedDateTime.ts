import { ref, watch } from 'vue'
import { formatDateTimeLocal } from '../utils/timestamp'

const STORAGE_KEY = 'vue-media-selected-datetime'
const ONE_HOUR_MS = 60 * 60 * 1000

// DateTime validation pattern: YYYY-MM-DDTHH:mm:ss
const DATETIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/

/**
 * Validate datetime format to prevent injection
 */
function isValidDateTime(dt: string): boolean {
  if (!DATETIME_PATTERN.test(dt)) return false
  // Also verify it parses to a valid date
  const date = new Date(dt)
  return !isNaN(date.getTime())
}

/**
 * Safe sessionStorage getter with error handling
 */
function safeGetItem(key: string): string | null {
  try {
    return sessionStorage.getItem(key)
  } catch {
    // sessionStorage may be disabled or unavailable (private browsing, etc.)
    return null
  }
}

/**
 * Safe sessionStorage setter with error handling
 */
function safeSetItem(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value)
  } catch {
    // sessionStorage may be full, disabled, or unavailable
  }
}

/**
 * Get default datetime (1 hour ago)
 */
function getDefaultDateTime(): string {
  const date = new Date(Date.now() - ONE_HOUR_MS)
  return formatDateTimeLocal(date)
}

// Global reactive state for selected datetime
const selectedDateTime = ref<string>(getDefaultDateTime())

// Initialization flag to prevent race conditions
let isInitialized = false

/**
 * Initialize from sessionStorage (called once on first use)
 */
function initializeFromStorage(): void {
  if (isInitialized) return
  isInitialized = true

  const stored = safeGetItem(STORAGE_KEY)
  if (stored && isValidDateTime(stored)) {
    selectedDateTime.value = stored
  }
}

// Initialize on module load
initializeFromStorage()

// Persist to sessionStorage when changed
watch(selectedDateTime, (newValue) => {
  if (newValue && isValidDateTime(newValue)) {
    safeSetItem(STORAGE_KEY, newValue)
  }
})

/**
 * Composable for sharing selected datetime across pages (Recorded Image, Recorded Video)
 */
export function useSelectedDateTime() {
  // Ensure initialization on first use (handles lazy loading scenarios)
  initializeFromStorage()

  return {
    selectedDateTime,
    setSelectedDateTime(dt: string) {
      if (isValidDateTime(dt)) {
        selectedDateTime.value = dt
      }
    },
    resetToNow() {
      selectedDateTime.value = formatDateTimeLocal(new Date())
    },
    resetToDefault() {
      selectedDateTime.value = getDefaultDateTime()
    },
    formatDateTimeLocal
  }
}
