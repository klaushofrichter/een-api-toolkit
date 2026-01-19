import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { initMediaSession } from 'een-api-toolkit'

/**
 * Pinia store for managing media session state.
 * Centralizes media session initialization to avoid redundant API calls
 * and ensures consistent state across all components using HLS playback.
 */
export const useMediaSessionStore = defineStore('mediaSession', () => {
  // State
  const initialized = ref(false)
  const error = ref<string | null>(null)
  const initPromise = ref<Promise<boolean> | null>(null)

  // Computed
  const isReady = computed(() => initialized.value && !error.value)
  const hasError = computed(() => error.value !== null)

  /**
   * Initialize the media session.
   * Only calls the API once per session, subsequent calls return cached result.
   * Safe to call from multiple components simultaneously.
   *
   * @returns Promise that resolves to true if session is ready, false if failed
   */
  async function ensureInitialized(): Promise<boolean> {
    // Return cached result if already initialized
    if (initialized.value) {
      return true
    }

    // If previous initialization failed, return cached error state
    if (error.value) {
      return false
    }

    // If initialization is in progress, wait for it
    if (initPromise.value) {
      return initPromise.value
    }

    // Start new initialization
    initPromise.value = (async () => {
      const result = await initMediaSession()
      if (result.error) {
        error.value = `Media session error: ${result.error.message}`
        initPromise.value = null
        return false
      }
      initialized.value = true
      return true
    })()

    return initPromise.value
  }

  /**
   * Reset the media session state.
   * Call this when the user logs out or the session expires.
   */
  function reset() {
    initialized.value = false
    error.value = null
    initPromise.value = null
  }

  return {
    // State (read-only access)
    initialized,
    error,
    // Computed
    isReady,
    hasError,
    // Actions
    ensureInitialized,
    reset
  }
})
