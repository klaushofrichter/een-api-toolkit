/**
 * Shared helpers for EEN API service functions.
 *
 * Every resource service uses the same request preamble (auth + base URL
 * guards) and the same HTTP error mapping. They live here once so behavior
 * cannot drift between resources.
 */

import { useAuthStore } from '../auth/store'
import { failure } from '../types'
import type { Result } from '../types'
import { debug } from './debug'

/**
 * Result of {@link requireAuth}: either the authenticated context or a
 * ready-to-return failure Result.
 *
 * @internal
 */
export type AuthContext =
  | { ok: true; authStore: ReturnType<typeof useAuthStore>; baseUrl: string }
  | { ok: false; result: Result<never> }

/**
 * Validate that the user is authenticated and a base URL is configured.
 *
 * @remarks
 * Call at the top of every service function:
 * ```typescript
 * const auth = requireAuth()
 * if (!auth.ok) return auth.result
 * const { authStore, baseUrl } = auth
 * ```
 *
 * @returns The auth store and base URL, or a failure Result to return as-is
 *
 * @internal
 */
export function requireAuth(): AuthContext {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return { ok: false, result: failure('AUTH_REQUIRED', 'Authentication required') }
  }

  if (!authStore.baseUrl) {
    return { ok: false, result: failure('AUTH_REQUIRED', 'Base URL not configured') }
  }

  return { ok: true, authStore, baseUrl: authStore.baseUrl }
}

/**
 * Standard request headers for authenticated EEN API calls.
 *
 * @param token - The access token from the auth store
 * @returns Headers with Accept and Authorization set
 *
 * @internal
 */
export function authHeaders(token: string | null): Record<string, string> {
  return {
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`
  }
}

/**
 * Map a non-OK HTTP response to a failure Result.
 *
 * @remarks
 * Single canonical mapping used by all resource services, covering the full
 * set of status codes declared in {@link ErrorCode}.
 *
 * @param response - The non-OK fetch Response
 * @returns A failure Result with a normalized error code and message
 *
 * @internal
 */
export async function handleErrorResponse<T>(response: Response): Promise<Result<T>> {
  const status = response.status

  let message: string
  try {
    const errorData = await response.json()
    message = errorData.message ?? errorData.error ?? response.statusText
  } catch (parseError) {
    debug('Failed to parse error response JSON:', parseError)
    message = response.statusText || 'Unknown error'
  }

  switch (status) {
    case 400:
      return failure('VALIDATION_ERROR', `Bad request: ${message}`, status)
    case 401:
      return failure('AUTH_REQUIRED', `Authentication failed: ${message}`, status)
    case 403:
      return failure('FORBIDDEN', `Access denied: ${message}`, status)
    case 404:
      return failure('NOT_FOUND', `Not found: ${message}`, status)
    case 429:
      return failure('RATE_LIMITED', `Rate limited: ${message}`, status)
    case 503:
      return failure('SERVICE_UNAVAILABLE', `Service unavailable: ${message}`, status)
    default:
      return failure('API_ERROR', `API error: ${message}`, status)
  }
}
