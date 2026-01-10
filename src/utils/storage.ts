// Import StorageStrategy from types to maintain single source of truth
import type { StorageStrategy } from '../types'
import { debug } from './debug'

// Re-export for convenience
export type { StorageStrategy }

/**
 * Storage adapter interface for token persistence.
 * @internal
 */
export interface StorageAdapter {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

/**
 * In-memory storage implementation.
 * Tokens are lost on page refresh but are immune to storage-based XSS attacks.
 * @internal
 */
class MemoryStorage implements StorageAdapter {
  private store = new Map<string, string>()

  getItem(key: string): string | null {
    return this.store.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value)
  }

  removeItem(key: string): void {
    this.store.delete(key)
  }
}

/**
 * Browser storage wrapper that delegates to localStorage/sessionStorage.
 * Errors are propagated to the caller (auth/store.ts) for proper logging.
 * @internal
 */
class BrowserStorageAdapter implements StorageAdapter {
  constructor(private storage: Storage) {}

  getItem(key: string): string | null {
    return this.storage.getItem(key)
  }

  setItem(key: string, value: string): void {
    this.storage.setItem(key, value)
  }

  removeItem(key: string): void {
    this.storage.removeItem(key)
  }
}

// Singleton instances
let currentStrategy: StorageStrategy = 'localStorage'
let memoryStorageInstance: MemoryStorage | null = null

/**
 * Get the memory storage singleton instance.
 * @internal
 */
function getMemoryStorage(): MemoryStorage {
  if (!memoryStorageInstance) {
    memoryStorageInstance = new MemoryStorage()
  }
  return memoryStorageInstance
}

/**
 * Set the storage strategy for the toolkit.
 *
 * @param strategy - The storage strategy to use
 *
 * @remarks
 * This should be called during toolkit initialization via {@link initEenToolkit}.
 * Changing the strategy after authentication may cause the current session to be lost.
 *
 * @internal
 */
export function setStorageStrategy(strategy: StorageStrategy): void {
  currentStrategy = strategy
}

/**
 * Get the current storage strategy.
 *
 * @returns The currently configured storage strategy
 *
 * @category Configuration
 */
export function getStorageStrategy(): StorageStrategy {
  return currentStrategy
}

/**
 * Get the storage adapter for the current strategy.
 *
 * @returns A storage adapter implementation based on the configured strategy
 *
 * @internal
 */
export function getStorageAdapter(): StorageAdapter {
  switch (currentStrategy) {
    case 'memory':
      return getMemoryStorage()
    case 'sessionStorage':
      if (typeof sessionStorage !== 'undefined') {
        return new BrowserStorageAdapter(sessionStorage)
      }
      // Fallback to memory if sessionStorage not available
      debug('sessionStorage unavailable, falling back to memory storage')
      return getMemoryStorage()
    case 'localStorage':
    default:
      if (typeof localStorage !== 'undefined') {
        return new BrowserStorageAdapter(localStorage)
      }
      // Fallback to memory if localStorage not available
      debug('localStorage unavailable, falling back to memory storage')
      return getMemoryStorage()
  }
}

/**
 * Clear the memory storage instance.
 * Useful for testing or when switching strategies.
 *
 * @internal
 */
export function clearMemoryStorage(): void {
  memoryStorageInstance = null
}
