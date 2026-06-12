/**
 * Debug logging utility
 * Enabled via initEenToolkit({ debug: true }) or VITE_DEBUG=true in environment
 */

let debugOverride: boolean | null = null

/**
 * Set the debug flag from toolkit configuration.
 * Takes precedence over the VITE_DEBUG environment variable.
 *
 * @internal
 */
export function setDebugEnabled(enabled: boolean): void {
  debugOverride = enabled
}

const isDebugEnabled = (): boolean => {
  if (debugOverride !== null) {
    return debugOverride
  }
  try {
    return import.meta.env?.VITE_DEBUG === 'true'
  } catch {
    return false
  }
}

/**
 * Redact the query string from a URL for safe logging.
 * Session/signature-bearing query parameters must not reach the console.
 *
 * @internal
 */
export function redactUrl(url: string): string {
  try {
    const u = new URL(url)
    return u.search ? `${u.origin}${u.pathname}?[redacted]` : `${u.origin}${u.pathname}`
  } catch {
    return '[invalid URL]'
  }
}

export function debug(...args: unknown[]): void {
  if (isDebugEnabled()) {
    // eslint-disable-next-line no-console -- intentional debug logging
    console.log('[een-api-toolkit]', ...args)
  }
}

export function debugWarn(...args: unknown[]): void {
  if (isDebugEnabled()) {
    console.warn('[een-api-toolkit]', ...args)
  }
}

export function debugError(...args: unknown[]): void {
  if (isDebugEnabled()) {
    console.error('[een-api-toolkit]', ...args)
  }
}
