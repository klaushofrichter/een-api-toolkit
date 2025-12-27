/**
 * Auth Helper for E2E Tests
 *
 * Performs OAuth login via Playwright and caches the access token.
 * The token can be reused across multiple API tests without
 * re-authenticating each time.
 */

import { chromium, Browser, Page } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const AUTH_FILE = path.join(__dirname, '.auth-state.json')
const PROXY_URL = process.env.VITE_PROXY_URL || 'http://localhost:8787'
const CLIENT_ID = process.env.VITE_EEN_CLIENT_ID
const REDIRECT_URI = 'http://127.0.0.1:3333'

export interface AuthState {
  token: string
  tokenExpiration: number
  baseUrl: string
  sessionId: string
}

interface TokenResponse {
  accessToken: string
  expiresIn: number
  httpsBaseUrl: string | { hostname: string; port?: number }
  sessionId: string
}

/**
 * Get a valid access token, either from cache or by performing OAuth login.
 * Returns the auth state with token, baseUrl, and sessionId.
 */
export async function getAuthToken(): Promise<AuthState> {
  // Check if we have a valid cached token
  const cached = loadCachedAuth()
  if (cached) {
    console.log('Using cached auth token (expires in', Math.round((cached.tokenExpiration - Date.now()) / 60000), 'minutes)')
    return cached
  }

  // No valid token, perform OAuth login
  console.log('No valid cached token, performing OAuth login...')
  return await performOAuthLogin()
}

/**
 * Load cached auth state if it exists and hasn't expired.
 * Returns null if no valid cache exists.
 */
function loadCachedAuth(): AuthState | null {
  if (!fs.existsSync(AUTH_FILE)) {
    return null
  }

  try {
    const data = fs.readFileSync(AUTH_FILE, 'utf-8')
    const auth = JSON.parse(data) as AuthState

    // Check if token is still valid (with 5 minute buffer)
    const bufferMs = 5 * 60 * 1000
    if (Date.now() + bufferMs < auth.tokenExpiration) {
      return auth
    }

    console.log('Cached token has expired')
    return null
  } catch (err) {
    console.error('Failed to load cached auth:', err)
    return null
  }
}

/**
 * Perform OAuth login via Playwright browser automation.
 * Saves the auth state to cache file for reuse.
 */
async function performOAuthLogin(): Promise<AuthState> {
  const username = process.env.TEST_USER
  const password = process.env.TEST_PASSWORD

  if (!username || !password) {
    throw new Error('TEST_USER and TEST_PASSWORD must be set in .env')
  }

  if (!CLIENT_ID) {
    throw new Error('VITE_EEN_CLIENT_ID must be set in .env')
  }

  let browser: Browser | null = null

  try {
    browser = await chromium.launch({ headless: true })
    const context = await browser.newContext()
    const page = await context.newPage()

    // Generate state for CSRF protection
    const state = crypto.randomUUID()

    // Set up request interception to capture redirect URL
    let redirectUrl: string | null = null
    page.on('request', (request) => {
      const url = request.url()
      if (url.includes('127.0.0.1:3333') && url.includes('code=')) {
        redirectUrl = url
      }
    })

    // Build OAuth URL
    const authParams = new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: 'code',
      scope: 'vms.all',
      redirect_uri: REDIRECT_URI,
      state
    })

    const authUrl = `https://auth.eagleeyenetworks.com/oauth2/authorize?${authParams.toString()}`

    // Navigate to OAuth
    await page.goto(authUrl)
    await page.waitForURL(/.*eagleeyenetworks.com.*/, { timeout: 15000 })

    // Fill email
    const emailInput = page.locator('#authentication--input__email')
    await emailInput.waitFor({ state: 'visible', timeout: 15000 })
    await emailInput.fill(username)

    // Click next
    await page.getByRole('button', { name: 'Next' }).click()

    // Fill password
    const passwordInput = page.locator('#authentication--input__password')
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 })
    await passwordInput.fill(password)

    // Click sign in
    const signInButton = page.locator('#next')
    try {
      await signInButton.click()
    } catch {
      await page.getByRole('button', { name: 'Sign in' }).click()
    }

    // Wait for redirect with proper event-based waiting
    // The redirect will fail (no server on 3333) but we capture the URL via request listener
    try {
      await page.waitForURL(/127\.0\.0\.1:3333.*code=/, { timeout: 30000 })
    } catch {
      // Expected - no server running, check if we captured the redirect URL
      if (!redirectUrl) {
        const currentUrl = page.url()
        if (currentUrl.includes('code=')) {
          redirectUrl = currentUrl
        }
      }
    }

    if (!redirectUrl) {
      throw new Error('Failed to capture redirect URL with authorization code. Check TEST_USER/TEST_PASSWORD credentials.')
    }

    // Extract code and validate state
    const url = new URL(redirectUrl)
    const code = url.searchParams.get('code')
    const returnedState = url.searchParams.get('state')

    if (!code) {
      throw new Error('No authorization code received')
    }

    if (returnedState !== state) {
      throw new Error('State mismatch - possible CSRF attack')
    }

    // Exchange code for token via proxy
    const tokenParams = new URLSearchParams({
      code,
      redirect_uri: REDIRECT_URI
    })

    const tokenResponse = await page.request.post(
      `${PROXY_URL}/proxy/getAccessToken?${tokenParams.toString()}`,
      {
        headers: {
          'Accept': 'application/json',
          'Origin': 'http://127.0.0.1:3333'
        }
      }
    )

    if (!tokenResponse.ok()) {
      const errorText = await tokenResponse.text()
      throw new Error(`Token exchange failed: ${tokenResponse.status()} ${errorText}`)
    }

    const tokenData = await tokenResponse.json() as TokenResponse

    // Parse baseUrl
    let baseUrl: string
    if (typeof tokenData.httpsBaseUrl === 'string') {
      baseUrl = tokenData.httpsBaseUrl
    } else {
      const { hostname, port } = tokenData.httpsBaseUrl
      baseUrl = port ? `https://${hostname}:${port}` : `https://${hostname}`
    }

    // Build auth state
    const authState: AuthState = {
      token: tokenData.accessToken,
      tokenExpiration: Date.now() + (tokenData.expiresIn * 1000),
      baseUrl,
      sessionId: tokenData.sessionId
    }

    // Save to cache with restricted permissions (owner read/write only)
    fs.writeFileSync(AUTH_FILE, JSON.stringify(authState, null, 2), { mode: 0o600 })
    console.log('Auth token obtained and cached')
    console.log('Base URL:', baseUrl)

    return authState
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

/**
 * Clear the cached auth state.
 * Use this to force re-authentication on next test run.
 */
export function clearAuthCache(): void {
  if (fs.existsSync(AUTH_FILE)) {
    fs.unlinkSync(AUTH_FILE)
    console.log('Auth cache cleared')
  }
}
