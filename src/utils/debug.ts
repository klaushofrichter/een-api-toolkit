/**
 * Debug logging utility
 * Enabled when VITE_DEBUG=true in environment
 */

const isDebugEnabled = (): boolean => {
  try {
    return import.meta.env?.VITE_DEBUG === 'true'
  } catch {
    return false
  }
}

export function debug(...args: unknown[]): void {
  if (isDebugEnabled()) {
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
