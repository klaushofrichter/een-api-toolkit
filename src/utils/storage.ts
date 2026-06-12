// Import StorageStrategy from types to maintain single source of truth
import type { StorageStrategy } from '../types'
import { debug } from './debug'

// Re-export for convenience
export type { StorageStrategy }

/**
 * Human-readable descriptions for each storage strategy.
 * Useful for displaying storage information in UI components.
 *
 * @example
 * ```typescript
 * import { getStorageStrategy, STORAGE_STRATEGY_DESCRIPTIONS } from 'een-api-toolkit'
 *
 * const strategy = getStorageStrategy()
 * const description = STORAGE_STRATEGY_DESCRIPTIONS[strategy]
 * console.log(`Using ${strategy}: ${description}`)
 * ```
 *
 * @category Configuration
 */
export const STORAGE_STRATEGY_DESCRIPTIONS: Record<StorageStrategy, string> = {
  localStorage: 'persists across sessions',
  sessionStorage: 'per-tab, cleared on tab close',
  memory: 'tokens lost on page refresh'
}

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
  // Resolves the Storage object per call so cached adapter instances never
  // hold a stale reference (e.g. when the global is replaced in tests)
  constructor(private resolveStorage: () => Storage) {}

  getItem(key: string): string | null {
    return this.resolveStorage().getItem(key)
  }

  setItem(key: string, value: string): void {
    this.resolveStorage().setItem(key, value)
  }

  removeItem(key: string): void {
    this.resolveStorage().removeItem(key)
  }
}

// Singleton instances
let currentStrategy: StorageStrategy = 'localStorage'
let memoryStorageInstance: MemoryStorage | null = null
let localStorageAdapter: BrowserStorageAdapter | null = null
let sessionStorageAdapter: BrowserStorageAdapter | null = null

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
        sessionStorageAdapter ??= new BrowserStorageAdapter(() => sessionStorage)
        return sessionStorageAdapter
      }
      // Fallback to memory if sessionStorage not available
      debug('sessionStorage unavailable, falling back to memory storage')
      return getMemoryStorage()
    case 'localStorage':
    default:
      if (typeof localStorage !== 'undefined') {
        localStorageAdapter ??= new BrowserStorageAdapter(() => localStorage)
        return localStorageAdapter
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
