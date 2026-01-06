import type { EenToolkitConfig, StorageStrategy } from './types'
import { setStorageStrategy, getStorageStrategy } from './utils/storage'

/**
 * Global toolkit configuration
 */
let config: EenToolkitConfig = {}

/**
 * Initialize the EEN API Toolkit
 *
 * @remarks
 * Call this function once at application startup before using any toolkit features.
 * The storage strategy determines how authentication tokens are persisted.
 *
 * @param options - Configuration options for the toolkit
 *
 * @example
 * ```typescript
 * import { initEenToolkit } from 'een-api-toolkit'
 *
 * // Basic initialization with localStorage (default, backwards compatible)
 * initEenToolkit({
 *   proxyUrl: 'https://your-proxy.workers.dev',
 *   clientId: 'your-client-id'
 * })
 *
 * // High-security initialization with memory-only storage
 * initEenToolkit({
 *   proxyUrl: 'https://your-proxy.workers.dev',
 *   clientId: 'your-client-id',
 *   storageStrategy: 'memory'
 * })
 * ```
 */
export function initEenToolkit(options: EenToolkitConfig = {}): void {
  // Set storage strategy first (default to localStorage for backwards compatibility)
  const storageStrategy: StorageStrategy = options.storageStrategy ?? 'localStorage'
  setStorageStrategy(storageStrategy)

  config = {
    proxyUrl: options.proxyUrl ?? import.meta.env?.VITE_PROXY_URL,
    clientId: options.clientId ?? import.meta.env?.VITE_EEN_CLIENT_ID,
    redirectUri: options.redirectUri ?? import.meta.env?.VITE_REDIRECT_URI,
    storageStrategy,
    debug: options.debug ?? import.meta.env?.VITE_DEBUG === 'true'
  }
}

export { getStorageStrategy }

/**
 * Get the current configuration
 */
export function getConfig(): EenToolkitConfig {
  return config
}

/**
 * Get the proxy URL
 */
export function getProxyUrl(): string | undefined {
  return config.proxyUrl ?? import.meta.env?.VITE_PROXY_URL
}

/**
 * Get the client ID
 */
export function getClientId(): string | undefined {
  return config.clientId ?? import.meta.env?.VITE_EEN_CLIENT_ID
}

/**
 * Get the redirect URI
 */
export function getRedirectUri(): string {
  return config.redirectUri ?? import.meta.env?.VITE_REDIRECT_URI ?? 'http://127.0.0.1:3333'
}
