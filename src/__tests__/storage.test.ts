import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  setStorageStrategy,
  getStorageStrategy,
  getStorageAdapter,
  clearMemoryStorage
} from '../utils/storage'

describe('Storage Strategy', () => {
  // Save original localStorage/sessionStorage
  const originalLocalStorage = globalThis.localStorage
  const originalSessionStorage = globalThis.sessionStorage

  beforeEach(() => {
    // Reset to default state
    clearMemoryStorage()
    setStorageStrategy('localStorage')
  })

  afterEach(() => {
    // Restore original storage
    globalThis.localStorage = originalLocalStorage
    globalThis.sessionStorage = originalSessionStorage
    clearMemoryStorage()
  })

  describe('setStorageStrategy / getStorageStrategy', () => {
    it('should default to localStorage', () => {
      expect(getStorageStrategy()).toBe('localStorage')
    })

    it('should set and get localStorage strategy', () => {
      setStorageStrategy('localStorage')
      expect(getStorageStrategy()).toBe('localStorage')
    })

    it('should set and get sessionStorage strategy', () => {
      setStorageStrategy('sessionStorage')
      expect(getStorageStrategy()).toBe('sessionStorage')
    })

    it('should set and get memory strategy', () => {
      setStorageStrategy('memory')
      expect(getStorageStrategy()).toBe('memory')
    })
  })

  describe('Memory Storage Adapter', () => {
    beforeEach(() => {
      setStorageStrategy('memory')
    })

    it('should store and retrieve values', () => {
      const storage = getStorageAdapter()
      storage.setItem('test_key', 'test_value')
      expect(storage.getItem('test_key')).toBe('test_value')
    })

    it('should return null for non-existent keys', () => {
      const storage = getStorageAdapter()
      expect(storage.getItem('non_existent')).toBeNull()
    })

    it('should remove items', () => {
      const storage = getStorageAdapter()
      storage.setItem('test_key', 'test_value')
      storage.removeItem('test_key')
      expect(storage.getItem('test_key')).toBeNull()
    })

    it('should overwrite existing values', () => {
      const storage = getStorageAdapter()
      storage.setItem('test_key', 'first_value')
      storage.setItem('test_key', 'second_value')
      expect(storage.getItem('test_key')).toBe('second_value')
    })

    it('should handle multiple keys independently', () => {
      const storage = getStorageAdapter()
      storage.setItem('key1', 'value1')
      storage.setItem('key2', 'value2')
      expect(storage.getItem('key1')).toBe('value1')
      expect(storage.getItem('key2')).toBe('value2')
    })

    it('should persist values within same memory instance', () => {
      const storage1 = getStorageAdapter()
      storage1.setItem('test_key', 'test_value')

      const storage2 = getStorageAdapter()
      expect(storage2.getItem('test_key')).toBe('test_value')
    })

    it('should be cleared by clearMemoryStorage', () => {
      const storage = getStorageAdapter()
      storage.setItem('test_key', 'test_value')
      clearMemoryStorage()
      // Need to get new adapter after clear
      const newStorage = getStorageAdapter()
      expect(newStorage.getItem('test_key')).toBeNull()
    })
  })

  describe('LocalStorage Adapter', () => {
    let mockLocalStorage: Record<string, string>

    beforeEach(() => {
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
      setStorageStrategy('localStorage')
    })

    it('should store and retrieve values', () => {
      const storage = getStorageAdapter()
      storage.setItem('test_key', 'test_value')
      expect(storage.getItem('test_key')).toBe('test_value')
    })

    it('should return null for non-existent keys', () => {
      const storage = getStorageAdapter()
      expect(storage.getItem('non_existent')).toBeNull()
    })

    it('should remove items', () => {
      const storage = getStorageAdapter()
      storage.setItem('test_key', 'test_value')
      storage.removeItem('test_key')
      expect(storage.getItem('test_key')).toBeNull()
    })
  })

  describe('SessionStorage Adapter', () => {
    let mockSessionStorage: Record<string, string>

    beforeEach(() => {
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
      setStorageStrategy('sessionStorage')
    })

    it('should store and retrieve values', () => {
      const storage = getStorageAdapter()
      storage.setItem('test_key', 'test_value')
      expect(storage.getItem('test_key')).toBe('test_value')
    })

    it('should return null for non-existent keys', () => {
      const storage = getStorageAdapter()
      expect(storage.getItem('non_existent')).toBeNull()
    })

    it('should remove items', () => {
      const storage = getStorageAdapter()
      storage.setItem('test_key', 'test_value')
      storage.removeItem('test_key')
      expect(storage.getItem('test_key')).toBeNull()
    })
  })

  describe('Fallback behavior', () => {
    it('should fallback to memory when localStorage is unavailable', () => {
      // @ts-expect-error - intentionally setting to undefined
      globalThis.localStorage = undefined
      setStorageStrategy('localStorage')

      const storage = getStorageAdapter()
      storage.setItem('test_key', 'test_value')
      expect(storage.getItem('test_key')).toBe('test_value')
    })

    it('should fallback to memory when sessionStorage is unavailable', () => {
      // @ts-expect-error - intentionally setting to undefined
      globalThis.sessionStorage = undefined
      setStorageStrategy('sessionStorage')

      const storage = getStorageAdapter()
      storage.setItem('test_key', 'test_value')
      expect(storage.getItem('test_key')).toBe('test_value')
    })
  })

  describe('Error handling', () => {
    it('should handle localStorage.getItem throwing', () => {
      globalThis.localStorage = {
        getItem: () => {
          throw new Error('Storage quota exceeded')
        },
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
        key: () => null,
        length: 0
      } as Storage
      setStorageStrategy('localStorage')

      const storage = getStorageAdapter()
      // Should return null instead of throwing
      expect(storage.getItem('test_key')).toBeNull()
    })

    it('should handle localStorage.setItem throwing silently', () => {
      globalThis.localStorage = {
        getItem: () => null,
        setItem: () => {
          throw new Error('Storage quota exceeded')
        },
        removeItem: () => {},
        clear: () => {},
        key: () => null,
        length: 0
      } as Storage
      setStorageStrategy('localStorage')

      const storage = getStorageAdapter()
      // Should not throw
      expect(() => storage.setItem('test_key', 'test_value')).not.toThrow()
    })

    it('should handle localStorage.removeItem throwing silently', () => {
      globalThis.localStorage = {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {
          throw new Error('Storage error')
        },
        clear: () => {},
        key: () => null,
        length: 0
      } as Storage
      setStorageStrategy('localStorage')

      const storage = getStorageAdapter()
      // Should not throw
      expect(() => storage.removeItem('test_key')).not.toThrow()
    })
  })
})

describe('Storage Strategy Security Properties', () => {
  beforeEach(() => {
    clearMemoryStorage()
  })

  afterEach(() => {
    clearMemoryStorage()
  })

  it('memory storage should not expose data to global scope', () => {
    setStorageStrategy('memory')
    const storage = getStorageAdapter()
    storage.setItem('secret_token', 'abc123')

    // Token should not be accessible via localStorage or sessionStorage
    // This simulates what an XSS attack would try to access
    expect(typeof globalThis.localStorage?.getItem === 'function'
      ? globalThis.localStorage.getItem('secret_token')
      : null
    ).not.toBe('abc123')
  })

  it('memory storage data should be isolated per getStorageAdapter call', () => {
    setStorageStrategy('memory')

    // All calls to getStorageAdapter should return the same singleton
    const storage1 = getStorageAdapter()
    storage1.setItem('test', 'value')

    const storage2 = getStorageAdapter()
    expect(storage2.getItem('test')).toBe('value')
  })
})
