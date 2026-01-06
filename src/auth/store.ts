import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserProfile } from '../types'
import type { Result } from '../types'
import { debug } from '../utils/debug'
import { getStorageAdapter } from '../utils/storage'

// Lazy-loaded reference to refreshToken to avoid circular dependency at import time
// Caches the promise (not the resolved value) to prevent race conditions with concurrent calls
let refreshTokenFnPromise: Promise<() => Promise<Result<{ accessToken: string; expiresIn: number }>>> | null = null

function getRefreshTokenFn() {
  if (!refreshTokenFnPromise) {
    refreshTokenFnPromise = import('./service').then((service) => service.refreshToken)
  }
  return refreshTokenFnPromise
}

/**
 * Pinia store for authentication state management
 */
export const useAuthStore = defineStore('een-auth', () => {
  // State
  const token = ref<string | null>(null)
  const tokenExpiration = ref<number | null>(null)
  const refreshTokenMarker = ref<string | null>(null)
  const sessionId = ref<string | null>(null)
  const hostname = ref<string | null>(null)
  const port = ref<number>(443)
  const userProfile = ref<UserProfile | null>(null)
  const refreshTimerId = ref<ReturnType<typeof setTimeout> | null>(null)
  const isRefreshing = ref(false)
  let refreshPromise: Promise<void> | null = null
  const refreshFailed = ref(false)
  const refreshFailedMessage = ref<string | null>(null)

  // Computed
  const isAuthenticated = computed(() => !!token.value)

  const baseUrl = computed(() => {
    if (!hostname.value) return null
    return port.value === 443
      ? `https://${hostname.value}`
      : `https://${hostname.value}:${port.value}`
  })

  const isTokenExpired = computed(() => {
    if (!tokenExpiration.value) return true
    return Date.now() >= tokenExpiration.value
  })

  const tokenExpiresIn = computed(() => {
    if (!tokenExpiration.value) return 0
    return Math.max(0, tokenExpiration.value - Date.now())
  })

  // Actions
  function setToken(newToken: string, expiresIn: number) {
    token.value = newToken
    tokenExpiration.value = Date.now() + expiresIn * 1000
    saveToStorage()
    setupAutoRefresh()
    debug('Token set, expires in', expiresIn, 'seconds')
  }

  function setRefreshTokenMarker(marker: string) {
    refreshTokenMarker.value = marker
    saveToStorage()
  }

  function setSessionId(newSessionId: string) {
    sessionId.value = newSessionId
    saveToStorage()
  }

  function setBaseUrl(data: string | { hostname: string; port?: number }) {
    if (typeof data === 'string') {
      // Parse URL string
      try {
        const url = new URL(data.startsWith('http') ? data : `https://${data}`)
        hostname.value = url.hostname
        port.value = url.port ? parseInt(url.port, 10) : 443
      } catch (err: unknown) {
        // Invalid URL format, use as hostname directly
        debug('Failed to parse URL, using as hostname:', err instanceof Error ? err.message : String(err))
        hostname.value = data
        port.value = 443
      }
    } else {
      hostname.value = data.hostname
      port.value = data.port ?? 443
    }
    saveToStorage()
    debug('Base URL set:', baseUrl.value)
  }

  function setUserProfile(profile: UserProfile) {
    userProfile.value = profile
    saveToStorage()
  }

  function setupAutoRefresh() {
    // Clear existing timer
    if (refreshTimerId.value) {
      clearTimeout(refreshTimerId.value)
      refreshTimerId.value = null
    }

    if (!tokenExpiration.value || !token.value) {
      return
    }

    const now = Date.now()
    const expiresAt = tokenExpiration.value
    const timeUntilExpiry = expiresAt - now

    // Calculate refresh time: 5 minutes before expiration or 50% of TTL, whichever is earlier
    // Minimum: 1 minute before expiration, minimum timeout: 5 seconds
    const fiveMinutes = 5 * 60 * 1000
    const halfTtl = timeUntilExpiry / 2
    const refreshBuffer = Math.min(fiveMinutes, halfTtl)
    const refreshTime = Math.max(timeUntilExpiry - refreshBuffer, 60 * 1000)
    const timeout = Math.max(refreshTime, 5000)

    debug('Auto-refresh scheduled in', Math.round(timeout / 1000), 'seconds')

    refreshTimerId.value = setTimeout(async () => {
      await performAutoRefresh()
    }, timeout)
  }

  async function performAutoRefresh(): Promise<void> {
    // If refresh is already in progress, wait for the existing promise
    if (refreshPromise) {
      debug('Refresh already in progress, waiting for existing refresh')
      return refreshPromise
    }

    isRefreshing.value = true
    debug('Performing auto-refresh')

    refreshPromise = (async () => {
      try {
        const refreshToken = await getRefreshTokenFn()
        const result = await refreshToken()

        if (result.error) {
          refreshFailed.value = true
          refreshFailedMessage.value = result.error.message
          debug('Auto-refresh failed:', result.error.message)
        } else {
          refreshFailed.value = false
          refreshFailedMessage.value = null
          debug('Auto-refresh successful')
        }
      } catch (err: unknown) {
        refreshFailed.value = true
        refreshFailedMessage.value = err instanceof Error ? err.message : String(err)
        debug('Auto-refresh error:', err)
      } finally {
        isRefreshing.value = false
        refreshPromise = null
      }
    })()

    return refreshPromise
  }

  function clearRefreshFailed() {
    refreshFailed.value = false
    refreshFailedMessage.value = null
  }

  function logout() {
    // Clear timer
    if (refreshTimerId.value) {
      clearTimeout(refreshTimerId.value)
      refreshTimerId.value = null
    }

    // Clear state
    token.value = null
    tokenExpiration.value = null
    refreshTokenMarker.value = null
    sessionId.value = null
    hostname.value = null
    port.value = 443
    userProfile.value = null
    refreshFailed.value = false
    refreshFailedMessage.value = null

    // Clear storage
    clearStorage()
    debug('Logged out')
  }

  function initialize() {
    loadFromStorage()
    if (token.value && !isTokenExpired.value) {
      setupAutoRefresh()
      debug('Initialized from storage')
    } else if (token.value && isTokenExpired.value) {
      debug('Stored token expired, clearing')
      logout()
    }
  }

  // Storage helpers - use configured storage strategy
  function saveToStorage() {
    try {
      const storage = getStorageAdapter()
      if (token.value) storage.setItem('een_token', token.value)
      if (tokenExpiration.value) storage.setItem('een_tokenExpiration', String(tokenExpiration.value))
      if (refreshTokenMarker.value) storage.setItem('een_refreshTokenMarker', refreshTokenMarker.value)
      if (sessionId.value) storage.setItem('een_sessionId', sessionId.value)
      if (hostname.value) storage.setItem('een_hostname', hostname.value)
      if (port.value !== 443) storage.setItem('een_port', String(port.value))
      if (userProfile.value) storage.setItem('een_userProfile', JSON.stringify(userProfile.value))
    } catch (err: unknown) {
      // Storage might not be available (SSR, private browsing, etc.)
      debug('Failed to save to storage:', err instanceof Error ? err.message : String(err))
    }
  }

  function loadFromStorage() {
    try {
      const storage = getStorageAdapter()
      token.value = storage.getItem('een_token')
      const expStr = storage.getItem('een_tokenExpiration')
      tokenExpiration.value = expStr ? parseInt(expStr, 10) : null
      refreshTokenMarker.value = storage.getItem('een_refreshTokenMarker')
      sessionId.value = storage.getItem('een_sessionId')
      hostname.value = storage.getItem('een_hostname')
      const portStr = storage.getItem('een_port')
      port.value = portStr ? parseInt(portStr, 10) : 443
      const profileStr = storage.getItem('een_userProfile')
      userProfile.value = profileStr ? JSON.parse(profileStr) : null
    } catch (err: unknown) {
      // Storage might not be available (SSR, private browsing, etc.)
      debug('Failed to load from storage:', err instanceof Error ? err.message : String(err))
    }
  }

  function clearStorage() {
    try {
      const storage = getStorageAdapter()
      storage.removeItem('een_token')
      storage.removeItem('een_tokenExpiration')
      storage.removeItem('een_refreshTokenMarker')
      storage.removeItem('een_sessionId')
      storage.removeItem('een_hostname')
      storage.removeItem('een_port')
      storage.removeItem('een_userProfile')
    } catch (err: unknown) {
      // Storage might not be available (SSR, private browsing, etc.)
      debug('Failed to clear storage:', err instanceof Error ? err.message : String(err))
    }
  }

  return {
    // State
    token,
    tokenExpiration,
    refreshTokenMarker,
    sessionId,
    hostname,
    port,
    userProfile,
    isRefreshing,
    refreshFailed,
    refreshFailedMessage,

    // Computed
    isAuthenticated,
    baseUrl,
    isTokenExpired,
    tokenExpiresIn,

    // Actions
    setToken,
    setRefreshTokenMarker,
    setSessionId,
    setBaseUrl,
    setUserProfile,
    setupAutoRefresh,
    clearRefreshFailed,
    logout,
    initialize
  }
})
