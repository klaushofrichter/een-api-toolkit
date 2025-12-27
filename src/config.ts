import type { EenToolkitConfig } from './types'

/**
 * Global toolkit configuration
 */
let config: EenToolkitConfig = {}

/**
 * Initialize the EEN API Toolkit
 */
export function initEenToolkit(options: EenToolkitConfig = {}): void {
  config = {
    proxyUrl: options.proxyUrl ?? import.meta.env?.VITE_PROXY_URL,
    clientId: options.clientId ?? import.meta.env?.VITE_EEN_CLIENT_ID,
    debug: options.debug ?? import.meta.env?.VITE_DEBUG === 'true'
  }
}

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
