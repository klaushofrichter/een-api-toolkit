import { useAuthStore } from './store'
import { getProxyUrl, getClientId, getRedirectUri } from '../config'
import { success, failure } from '../types'
import type { Result } from '../types'
import { debug } from '../utils/debug'

const EEN_AUTH_URL = 'https://auth.eagleeyenetworks.com/oauth2/authorize'

/**
 * Token response from the proxy
 */
interface TokenResponse {
  accessToken: string
  expiresIn: number
  httpsBaseUrl: string | { hostname: string; port?: number }
  userEmail: string
  sessionId: string
}

/**
 * Generate the OAuth authorization URL
 */
export function getAuthUrl(): string {
  const clientId = getClientId()
  if (!clientId) {
    throw new Error('Client ID not configured. Call initEenToolkit() or set VITE_EEN_CLIENT_ID')
  }

  // Generate and store state for CSRF protection
  const state = crypto.randomUUID()
  try {
    sessionStorage.setItem('een_oauth_state', state)
  } catch {
    // sessionStorage might not be available
  }

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    scope: 'vms.all',
    redirect_uri: getRedirectUri(),
    state
  })

  debug('Generated auth URL with state:', state)
  return `${EEN_AUTH_URL}?${params.toString()}`
}

/**
 * Exchange authorization code for access token
 */
export async function getAccessToken(code: string): Promise<Result<TokenResponse>> {
  const proxyUrl = getProxyUrl()
  if (!proxyUrl) {
    return failure('AUTH_FAILED', 'Proxy URL not configured. Call initEenToolkit() or set VITE_PROXY_URL')
  }

  const params = new URLSearchParams({
    code,
    redirect_uri: getRedirectUri()
  })

  try {
    const response = await fetch(`${proxyUrl}/proxy/getAccessToken?${params.toString()}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      return failure('AUTH_FAILED', `Token exchange failed: ${errorText}`, response.status)
    }

    const data = await response.json() as TokenResponse
    debug('Token received, expires in:', data.expiresIn)
    return success(data)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to exchange code: ${String(err)}`)
  }
}

/**
 * Refresh the access token using stored refresh token
 */
export async function refreshToken(): Promise<Result<{ accessToken: string; expiresIn: number }>> {
  const proxyUrl = getProxyUrl()
  if (!proxyUrl) {
    return failure('AUTH_FAILED', 'Proxy URL not configured')
  }

  const authStore = useAuthStore()

  try {
    const headers: HeadersInit = {
      'Accept': 'application/json'
    }

    // Add session ID header as fallback for environments where cookies don't work
    if (authStore.sessionId) {
      headers['Authorization'] = `Bearer ${authStore.sessionId}`
    }

    const response = await fetch(`${proxyUrl}/proxy/refreshAccessToken`, {
      method: 'POST',
      credentials: 'include',
      headers
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      return failure('AUTH_FAILED', `Token refresh failed: ${errorText}`, response.status)
    }

    const data = await response.json() as { accessToken: string; expiresIn: number }

    // Update store with new token
    authStore.setToken(data.accessToken, data.expiresIn)

    debug('Token refreshed, expires in:', data.expiresIn)
    return success(data)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to refresh token: ${String(err)}`)
  }
}

/**
 * Revoke the current token and logout
 */
export async function revokeToken(): Promise<Result<void>> {
  const proxyUrl = getProxyUrl()
  if (!proxyUrl) {
    return failure('AUTH_FAILED', 'Proxy URL not configured')
  }

  const authStore = useAuthStore()

  try {
    const headers: HeadersInit = {
      'Accept': 'application/json'
    }

    if (authStore.sessionId) {
      headers['Authorization'] = `Bearer ${authStore.sessionId}`
    }

    const response = await fetch(`${proxyUrl}/proxy/revoke`, {
      method: 'POST',
      credentials: 'include',
      headers
    })

    // Logout regardless of response
    authStore.logout()

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      return failure('AUTH_FAILED', `Token revocation failed: ${errorText}`, response.status)
    }

    debug('Token revoked')
    return success(undefined)
  } catch (err) {
    // Still logout on error
    authStore.logout()
    return failure('NETWORK_ERROR', `Failed to revoke token: ${String(err)}`)
  }
}

/**
 * Handle OAuth callback - validates state and exchanges code for token
 */
export async function handleAuthCallback(code: string, state: string): Promise<Result<TokenResponse>> {
  // Validate state for CSRF protection
  let storedState: string | null = null
  try {
    storedState = sessionStorage.getItem('een_oauth_state')
    sessionStorage.removeItem('een_oauth_state')
  } catch {
    // sessionStorage might not be available
  }

  if (!storedState) {
    return failure('AUTH_FAILED', 'No OAuth state found. Please restart the login process.')
  }

  // Constant-time comparison to prevent timing attacks
  if (!constantTimeEquals(state, storedState)) {
    return failure('AUTH_FAILED', 'Invalid OAuth state. Possible CSRF attack.')
  }

  debug('State validated, exchanging code for token')

  // Exchange code for token
  const result = await getAccessToken(code)

  if (result.error) {
    return result
  }

  // Update auth store with received data
  const authStore = useAuthStore()
  const data = result.data

  authStore.setToken(data.accessToken, data.expiresIn)
  authStore.setRefreshTokenMarker('present')
  authStore.setSessionId(data.sessionId)
  authStore.setBaseUrl(data.httpsBaseUrl)

  debug('Auth callback complete, user:', data.userEmail)

  return success(data)
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }

  return result === 0
}
