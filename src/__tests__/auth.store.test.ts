import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth/store'
import { setStorageStrategy, clearMemoryStorage, getStorageAdapter } from '../utils/storage'

/**
 * Tests for auth store session persistence across different storage strategies.
 *
 * These tests verify that:
 * 1. Sessions persist correctly with localStorage strategy
 * 2. Sessions persist correctly with sessionStorage strategy
 * 3. Sessions do NOT persist with memory strategy (by design)
 * 4. Logout clears sessions from all storage strategies
 * 5. initialize() correctly restores sessions from storage
 */

describe('Auth Store Session Persistence', () => {
  // Save original localStorage/sessionStorage
  const originalLocalStorage = globalThis.localStorage
  const originalSessionStorage = globalThis.sessionStorage

  // Mock storages
  let mockLocalStorage: Record<string, string>
  let mockSessionStorage: Record<string, string>

  function setupMockLocalStorage() {
    mockLocalStorage = {}
    globalThis.localStorage = {
      getItem: (key: string) => mockLocalStorage[key] ?? null,
      setItem: (key: string, value: string) => {
        mockLocalStorage[key] = value
      },
      removeItem: (key: string) => {
        delete mockLocalStorage[key]
      },
      clear: () => {
        mockLocalStorage = {}
      },
      key: (index: number) => Object.keys(mockLocalStorage)[index] ?? null,
      length: Object.keys(mockLocalStorage).length
    } as Storage
  }

  function setupMockSessionStorage() {
    mockSessionStorage = {}
    globalThis.sessionStorage = {
      getItem: (key: string) => mockSessionStorage[key] ?? null,
      setItem: (key: string, value: string) => {
        mockSessionStorage[key] = value
      },
      removeItem: (key: string) => {
        delete mockSessionStorage[key]
      },
      clear: () => {
        mockSessionStorage = {}
      },
      key: (index: number) => Object.keys(mockSessionStorage)[index] ?? null,
      length: Object.keys(mockSessionStorage).length
    } as Storage
  }

  beforeEach(() => {
    // Create fresh Pinia instance for each test
    setActivePinia(createPinia())
    clearMemoryStorage()
    setupMockLocalStorage()
    setupMockSessionStorage()
  })

  afterEach(() => {
    // Restore original storage
    globalThis.localStorage = originalLocalStorage
    globalThis.sessionStorage = originalSessionStorage
    clearMemoryStorage()
    vi.clearAllMocks()
  })

  describe('localStorage strategy', () => {
    beforeEach(() => {
      setStorageStrategy('localStorage')
    })

    it('should persist session to localStorage after setToken', () => {
      const authStore = useAuthStore()

      // Set token (simulates successful login)
      authStore.setToken('test-token-123', 3600)
      authStore.setBaseUrl('https://c001.eagleeyenetworks.com')
      authStore.setSessionId('session-abc')

      // Verify data is in localStorage
      expect(mockLocalStorage['een_token']).toBe('test-token-123')
      expect(mockLocalStorage['een_hostname']).toBe('c001.eagleeyenetworks.com')
      expect(mockLocalStorage['een_sessionId']).toBe('session-abc')
    })

    it('should restore session from localStorage on initialize()', () => {
      // Pre-populate localStorage (simulates data from previous session)
      const futureExpiration = Date.now() + 3600000 // 1 hour from now
      mockLocalStorage['een_token'] = 'persisted-token'
      mockLocalStorage['een_tokenExpiration'] = String(futureExpiration)
      mockLocalStorage['een_hostname'] = 'c002.eagleeyenetworks.com'
      mockLocalStorage['een_sessionId'] = 'persisted-session'

      // Create new store (simulates page refresh)
      setActivePinia(createPinia())
      const authStore = useAuthStore()

      // Before initialize, store should be empty
      expect(authStore.token).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)

      // Call initialize (this is what App.vue should do on mount)
      authStore.initialize()

      // After initialize, session should be restored
      expect(authStore.token).toBe('persisted-token')
      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.baseUrl).toBe('https://c002.eagleeyenetworks.com')
      expect(authStore.sessionId).toBe('persisted-session')
    })

    it('should clear localStorage on logout', () => {
      const authStore = useAuthStore()

      // Set up authenticated state
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://c001.eagleeyenetworks.com')
      authStore.setSessionId('test-session')

      // Verify data is in localStorage
      expect(mockLocalStorage['een_token']).toBe('test-token')

      // Logout
      authStore.logout()

      // Verify localStorage is cleared
      expect(mockLocalStorage['een_token']).toBeUndefined()
      expect(mockLocalStorage['een_tokenExpiration']).toBeUndefined()
      expect(mockLocalStorage['een_hostname']).toBeUndefined()
      expect(mockLocalStorage['een_sessionId']).toBeUndefined()

      // Verify store is cleared
      expect(authStore.token).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
    })

    it('should clear expired token on initialize()', () => {
      // Pre-populate localStorage with expired token
      const pastExpiration = Date.now() - 3600000 // 1 hour ago
      mockLocalStorage['een_token'] = 'expired-token'
      mockLocalStorage['een_tokenExpiration'] = String(pastExpiration)
      mockLocalStorage['een_hostname'] = 'c001.eagleeyenetworks.com'

      // Create new store and initialize
      setActivePinia(createPinia())
      const authStore = useAuthStore()
      authStore.initialize()

      // Expired token should be cleared
      expect(authStore.token).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
      expect(mockLocalStorage['een_token']).toBeUndefined()
    })
  })

  describe('sessionStorage strategy', () => {
    beforeEach(() => {
      setStorageStrategy('sessionStorage')
    })

    it('should persist session to sessionStorage after setToken', () => {
      const authStore = useAuthStore()

      // Set token (simulates successful login)
      authStore.setToken('test-token-456', 3600)
      authStore.setBaseUrl('https://c003.eagleeyenetworks.com')
      authStore.setSessionId('session-def')

      // Verify data is in sessionStorage
      expect(mockSessionStorage['een_token']).toBe('test-token-456')
      expect(mockSessionStorage['een_hostname']).toBe('c003.eagleeyenetworks.com')
      expect(mockSessionStorage['een_sessionId']).toBe('session-def')
    })

    it('should restore session from sessionStorage on initialize()', () => {
      // Pre-populate sessionStorage (simulates data from same tab session)
      const futureExpiration = Date.now() + 3600000
      mockSessionStorage['een_token'] = 'session-persisted-token'
      mockSessionStorage['een_tokenExpiration'] = String(futureExpiration)
      mockSessionStorage['een_hostname'] = 'c004.eagleeyenetworks.com'
      mockSessionStorage['een_sessionId'] = 'session-persisted'

      // Create new store (simulates component remount within same tab)
      setActivePinia(createPinia())
      const authStore = useAuthStore()

      // Before initialize
      expect(authStore.token).toBeNull()

      // Call initialize
      authStore.initialize()

      // Session should be restored
      expect(authStore.token).toBe('session-persisted-token')
      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.baseUrl).toBe('https://c004.eagleeyenetworks.com')
    })

    it('should clear sessionStorage on logout', () => {
      const authStore = useAuthStore()

      // Set up authenticated state
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://c001.eagleeyenetworks.com')

      // Verify data is in sessionStorage
      expect(mockSessionStorage['een_token']).toBe('test-token')

      // Logout
      authStore.logout()

      // Verify sessionStorage is cleared
      expect(mockSessionStorage['een_token']).toBeUndefined()
      expect(mockSessionStorage['een_tokenExpiration']).toBeUndefined()
      expect(mockSessionStorage['een_hostname']).toBeUndefined()
    })
  })

  describe('memory strategy', () => {
    beforeEach(() => {
      setStorageStrategy('memory')
    })

    it('should store token in memory only', () => {
      const authStore = useAuthStore()

      // Set token
      authStore.setToken('memory-token', 3600)
      authStore.setBaseUrl('https://c005.eagleeyenetworks.com')

      // Token should be in memory storage
      const storage = getStorageAdapter()
      expect(storage.getItem('een_token')).toBe('memory-token')

      // But NOT in localStorage or sessionStorage
      expect(mockLocalStorage['een_token']).toBeUndefined()
      expect(mockSessionStorage['een_token']).toBeUndefined()
    })

    it('should NOT restore session after memory is cleared (simulates page refresh)', () => {
      const authStore = useAuthStore()

      // Set token in memory
      authStore.setToken('memory-only-token', 3600)
      authStore.setBaseUrl('https://c006.eagleeyenetworks.com')

      expect(authStore.isAuthenticated).toBe(true)

      // Clear memory storage (simulates page refresh losing memory)
      clearMemoryStorage()

      // Create new store (simulates page refresh)
      setActivePinia(createPinia())
      const newAuthStore = useAuthStore()

      // Call initialize
      newAuthStore.initialize()

      // Session should NOT be restored (memory was cleared)
      expect(newAuthStore.token).toBeNull()
      expect(newAuthStore.isAuthenticated).toBe(false)
    })

    it('should clear memory storage on logout', () => {
      const authStore = useAuthStore()

      // Set up authenticated state
      authStore.setToken('memory-token', 3600)

      const storage = getStorageAdapter()
      expect(storage.getItem('een_token')).toBe('memory-token')

      // Logout
      authStore.logout()

      // Memory storage should be cleared
      expect(storage.getItem('een_token')).toBeNull()
      expect(authStore.token).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
    })

    it('memory strategy should not expose tokens to localStorage/sessionStorage (XSS protection)', () => {
      const authStore = useAuthStore()

      // Set token in memory
      authStore.setToken('secret-token', 3600)

      // Token should NOT be accessible via localStorage or sessionStorage
      // This protects against XSS attacks that try to read browser storage
      expect(mockLocalStorage['een_token']).toBeUndefined()
      expect(mockSessionStorage['een_token']).toBeUndefined()
    })
  })

  describe('session persistence behavior comparison', () => {
    it('localStorage: session survives "page refresh" (initialize after new pinia)', () => {
      setStorageStrategy('localStorage')

      // Login
      const authStore1 = useAuthStore()
      authStore1.setToken('ls-token', 3600)
      authStore1.setBaseUrl('https://c001.eagleeyenetworks.com')
      expect(authStore1.isAuthenticated).toBe(true)

      // "Page refresh" - new Pinia, call initialize
      setActivePinia(createPinia())
      const authStore2 = useAuthStore()
      authStore2.initialize()

      // Session should be restored
      expect(authStore2.isAuthenticated).toBe(true)
      expect(authStore2.token).toBe('ls-token')
    })

    it('sessionStorage: session survives "page refresh" within same tab', () => {
      setStorageStrategy('sessionStorage')

      // Login
      const authStore1 = useAuthStore()
      authStore1.setToken('ss-token', 3600)
      authStore1.setBaseUrl('https://c001.eagleeyenetworks.com')
      expect(authStore1.isAuthenticated).toBe(true)

      // "Page refresh" within same tab - new Pinia, call initialize
      setActivePinia(createPinia())
      const authStore2 = useAuthStore()
      authStore2.initialize()

      // Session should be restored
      expect(authStore2.isAuthenticated).toBe(true)
      expect(authStore2.token).toBe('ss-token')
    })

    it('memory: session does NOT survive "page refresh"', () => {
      setStorageStrategy('memory')

      // Login
      const authStore1 = useAuthStore()
      authStore1.setToken('mem-token', 3600)
      authStore1.setBaseUrl('https://c001.eagleeyenetworks.com')
      expect(authStore1.isAuthenticated).toBe(true)

      // "Page refresh" - clear memory, new Pinia, call initialize
      clearMemoryStorage()
      setActivePinia(createPinia())
      const authStore2 = useAuthStore()
      authStore2.initialize()

      // Session should NOT be restored (memory was cleared)
      expect(authStore2.isAuthenticated).toBe(false)
      expect(authStore2.token).toBeNull()
    })

    it('all strategies: logout clears session completely', () => {
      const strategies = ['localStorage', 'sessionStorage', 'memory'] as const

      for (const strategy of strategies) {
        // Setup
        setStorageStrategy(strategy)
        setActivePinia(createPinia())
        if (strategy === 'localStorage') setupMockLocalStorage()
        if (strategy === 'sessionStorage') setupMockSessionStorage()
        if (strategy === 'memory') clearMemoryStorage()

        const authStore = useAuthStore()

        // Login
        authStore.setToken(`${strategy}-token`, 3600)
        authStore.setBaseUrl('https://c001.eagleeyenetworks.com')
        expect(authStore.isAuthenticated).toBe(true)

        // Logout
        authStore.logout()

        // Session should be completely cleared
        expect(authStore.isAuthenticated).toBe(false)
        expect(authStore.token).toBeNull()

        // Storage should be cleared
        const storage = getStorageAdapter()
        expect(storage.getItem('een_token')).toBeNull()
      }
    })
  })

  describe('initialize() without prior session', () => {
    it('should not throw when no session exists in localStorage', () => {
      setStorageStrategy('localStorage')
      const authStore = useAuthStore()

      // Should not throw
      expect(() => authStore.initialize()).not.toThrow()

      // Should remain unauthenticated
      expect(authStore.isAuthenticated).toBe(false)
      expect(authStore.token).toBeNull()
    })

    it('should not throw when no session exists in sessionStorage', () => {
      setStorageStrategy('sessionStorage')
      const authStore = useAuthStore()

      expect(() => authStore.initialize()).not.toThrow()
      expect(authStore.isAuthenticated).toBe(false)
    })

    it('should not throw when no session exists in memory', () => {
      setStorageStrategy('memory')
      const authStore = useAuthStore()

      expect(() => authStore.initialize()).not.toThrow()
      expect(authStore.isAuthenticated).toBe(false)
    })
  })

  describe('login -> logout -> second login requires credentials', () => {
    it('localStorage: after logout, second login requires new credentials', () => {
      setStorageStrategy('localStorage')

      // First login
      const authStore1 = useAuthStore()
      authStore1.setToken('first-login-token', 3600)
      authStore1.setBaseUrl('https://c001.eagleeyenetworks.com')
      authStore1.setSessionId('first-session')
      expect(authStore1.isAuthenticated).toBe(true)

      // Verify token is in storage
      expect(mockLocalStorage['een_token']).toBe('first-login-token')

      // Logout
      authStore1.logout()
      expect(authStore1.isAuthenticated).toBe(false)

      // Verify storage is cleared
      expect(mockLocalStorage['een_token']).toBeUndefined()
      expect(mockLocalStorage['een_sessionId']).toBeUndefined()

      // Simulate page refresh after logout - new Pinia instance
      setActivePinia(createPinia())
      const authStore2 = useAuthStore()

      // Try to initialize (restore from storage)
      authStore2.initialize()

      // Should NOT be authenticated - storage was cleared by logout
      // This proves a second login with credentials is required
      expect(authStore2.isAuthenticated).toBe(false)
      expect(authStore2.token).toBeNull()
      expect(authStore2.sessionId).toBeNull()
    })

    it('sessionStorage: after logout, second login requires new credentials', () => {
      setStorageStrategy('sessionStorage')

      // First login
      const authStore1 = useAuthStore()
      authStore1.setToken('session-first-token', 3600)
      authStore1.setBaseUrl('https://c002.eagleeyenetworks.com')
      authStore1.setSessionId('session-first')
      expect(authStore1.isAuthenticated).toBe(true)

      // Verify token is in storage
      expect(mockSessionStorage['een_token']).toBe('session-first-token')

      // Logout
      authStore1.logout()

      // Verify storage is cleared
      expect(mockSessionStorage['een_token']).toBeUndefined()

      // Simulate new store instance
      setActivePinia(createPinia())
      const authStore2 = useAuthStore()
      authStore2.initialize()

      // Should NOT be authenticated
      expect(authStore2.isAuthenticated).toBe(false)
      expect(authStore2.token).toBeNull()
    })

    it('memory: after logout, second login requires new credentials', () => {
      setStorageStrategy('memory')

      // First login
      const authStore1 = useAuthStore()
      authStore1.setToken('memory-first-token', 3600)
      authStore1.setBaseUrl('https://c003.eagleeyenetworks.com')
      expect(authStore1.isAuthenticated).toBe(true)

      // Logout
      authStore1.logout()

      // Memory is cleared
      const storage = getStorageAdapter()
      expect(storage.getItem('een_token')).toBeNull()

      // New store instance
      setActivePinia(createPinia())
      const authStore2 = useAuthStore()
      authStore2.initialize()

      // Should NOT be authenticated
      expect(authStore2.isAuthenticated).toBe(false)
    })

    it('localStorage: logout clears ALL auth data, not just token', () => {
      setStorageStrategy('localStorage')

      const authStore = useAuthStore()

      // Set up full authenticated state
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://c001.eagleeyenetworks.com')
      authStore.setSessionId('test-session')
      authStore.setRefreshTokenMarker('present')

      // Verify all data is stored
      expect(mockLocalStorage['een_token']).toBe('test-token')
      expect(mockLocalStorage['een_hostname']).toBe('c001.eagleeyenetworks.com')
      expect(mockLocalStorage['een_sessionId']).toBe('test-session')
      expect(mockLocalStorage['een_refreshTokenMarker']).toBe('present')
      expect(mockLocalStorage['een_tokenExpiration']).toBeDefined()

      // Logout
      authStore.logout()

      // ALL auth data should be cleared
      expect(mockLocalStorage['een_token']).toBeUndefined()
      expect(mockLocalStorage['een_hostname']).toBeUndefined()
      expect(mockLocalStorage['een_sessionId']).toBeUndefined()
      expect(mockLocalStorage['een_refreshTokenMarker']).toBeUndefined()
      expect(mockLocalStorage['een_tokenExpiration']).toBeUndefined()

      // In-memory state should also be cleared
      expect(authStore.token).toBeNull()
      expect(authStore.sessionId).toBeNull()
      expect(authStore.hostname).toBeNull()
      expect(authStore.refreshTokenMarker).toBeNull()
    })
  })

  describe('multi-tab session sharing', () => {
    it('localStorage: second tab shares session without re-login', () => {
      setStorageStrategy('localStorage')

      // First tab: login
      const tab1Store = useAuthStore()
      tab1Store.setToken('shared-token', 3600)
      tab1Store.setBaseUrl('https://c001.eagleeyenetworks.com')
      tab1Store.setSessionId('shared-session')
      expect(tab1Store.isAuthenticated).toBe(true)

      // Second tab: new Pinia instance (simulates new tab with same localStorage)
      setActivePinia(createPinia())
      const tab2Store = useAuthStore()

      // Before initialize, tab2 is not authenticated
      expect(tab2Store.token).toBeNull()
      expect(tab2Store.isAuthenticated).toBe(false)

      // After initialize, tab2 should share the session from localStorage
      tab2Store.initialize()

      expect(tab2Store.isAuthenticated).toBe(true)
      expect(tab2Store.token).toBe('shared-token')
      expect(tab2Store.sessionId).toBe('shared-session')
      expect(tab2Store.baseUrl).toBe('https://c001.eagleeyenetworks.com')
    })

    it('sessionStorage: second tab does NOT share session (tab-isolated)', () => {
      setStorageStrategy('sessionStorage')

      // First tab: login
      const tab1Store = useAuthStore()
      tab1Store.setToken('tab1-token', 3600)
      tab1Store.setBaseUrl('https://c001.eagleeyenetworks.com')
      expect(tab1Store.isAuthenticated).toBe(true)

      // Verify token is in sessionStorage
      expect(mockSessionStorage['een_token']).toBe('tab1-token')

      // Second tab: new Pinia instance
      // In a real browser, sessionStorage is per-tab, so a new tab would have empty sessionStorage
      // We simulate this by clearing the mock sessionStorage (simulating new tab's empty storage)
      setActivePinia(createPinia())

      // Clear sessionStorage to simulate new tab (each tab has its own sessionStorage)
      mockSessionStorage = {}
      globalThis.sessionStorage = {
        getItem: (key: string) => mockSessionStorage[key] ?? null,
        setItem: (key: string, value: string) => { mockSessionStorage[key] = value },
        removeItem: (key: string) => { delete mockSessionStorage[key] },
        clear: () => { mockSessionStorage = {} },
        key: (index: number) => Object.keys(mockSessionStorage)[index] ?? null,
        length: Object.keys(mockSessionStorage).length
      } as Storage

      const tab2Store = useAuthStore()
      tab2Store.initialize()

      // Tab2 should NOT be authenticated (sessionStorage is isolated per tab)
      expect(tab2Store.isAuthenticated).toBe(false)
      expect(tab2Store.token).toBeNull()
    })

    it('memory: second tab does NOT share session', () => {
      setStorageStrategy('memory')

      // First tab: login
      const tab1Store = useAuthStore()
      tab1Store.setToken('memory-token', 3600)
      tab1Store.setBaseUrl('https://c001.eagleeyenetworks.com')
      expect(tab1Store.isAuthenticated).toBe(true)

      // Second tab: new Pinia instance with cleared memory (simulates new tab)
      // Memory storage is in-process, so a new tab would have empty memory
      clearMemoryStorage()
      setActivePinia(createPinia())

      const tab2Store = useAuthStore()
      tab2Store.initialize()

      // Tab2 should NOT be authenticated (memory is not shared between tabs)
      expect(tab2Store.isAuthenticated).toBe(false)
      expect(tab2Store.token).toBeNull()
    })

    it('localStorage: changes in one tab are visible in another after initialize', () => {
      setStorageStrategy('localStorage')

      // Tab1: login
      const tab1Store = useAuthStore()
      tab1Store.setToken('original-token', 3600)
      tab1Store.setBaseUrl('https://c001.eagleeyenetworks.com')

      // Tab2: initialize and verify session
      setActivePinia(createPinia())
      const tab2Store = useAuthStore()
      tab2Store.initialize()
      expect(tab2Store.token).toBe('original-token')

      // Tab1: logout (clears localStorage)
      tab1Store.logout()
      expect(mockLocalStorage['een_token']).toBeUndefined()

      // Tab2: if it re-initializes (e.g., after page refresh), session is gone
      setActivePinia(createPinia())
      const tab2StoreRefreshed = useAuthStore()
      tab2StoreRefreshed.initialize()

      // Tab2 is now logged out because localStorage was cleared by Tab1
      expect(tab2StoreRefreshed.isAuthenticated).toBe(false)
      expect(tab2StoreRefreshed.token).toBeNull()
    })
  })
})
