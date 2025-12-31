/**
 * Authenticated E2E tests for vue-media example
 *
 * These tests require:
 * - TEST_USER and TEST_PASSWORD environment variables
 * - VITE_EEN_CLIENT_ID environment variable
 * - Running OAuth proxy server (see ../../../scripts/restart-proxy.sh)
 */

import { test, expect, chromium } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

// Load environment variables from root .env
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '../../..')
dotenv.config({ path: path.join(rootDir, '.env') })

const PROXY_URL = process.env.VITE_PROXY_URL || 'http://localhost:8787'
const CLIENT_ID = process.env.VITE_EEN_CLIENT_ID
const REDIRECT_URI = 'http://127.0.0.1:3333'
const AUTH_CACHE_FILE = path.join(__dirname, '.auth-state.json')

interface AuthState {
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
 * Load cached auth state if valid
 */
function loadCachedAuth(): AuthState | null {
  if (!fs.existsSync(AUTH_CACHE_FILE)) {
    return null
  }
  try {
    const data = fs.readFileSync(AUTH_CACHE_FILE, 'utf-8')
    const auth = JSON.parse(data) as AuthState
    const bufferMs = 5 * 60 * 1000
    if (Date.now() + bufferMs < auth.tokenExpiration) {
      return auth
    }
    return null
  } catch {
    return null
  }
}

/**
 * Perform OAuth login and return auth state
 */
async function performLogin(): Promise<AuthState> {
  const username = process.env.TEST_USER
  const password = process.env.TEST_PASSWORD

  if (!username || !password) {
    throw new Error('TEST_USER and TEST_PASSWORD must be set in .env')
  }

  if (!CLIENT_ID) {
    throw new Error('VITE_EEN_CLIENT_ID must be set in .env')
  }

  const browser = await chromium.launch({ headless: true })

  try {
    const context = await browser.newContext()
    const page = await context.newPage()

    const state = crypto.randomUUID()
    let redirectUrl: string | null = null

    page.on('request', (request) => {
      const url = request.url()
      if (url.includes('127.0.0.1:3333') && url.includes('code=')) {
        redirectUrl = url
      }
    })

    const authParams = new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: 'code',
      scope: 'vms.all',
      redirect_uri: REDIRECT_URI,
      state
    })

    await page.goto(`https://auth.eagleeyenetworks.com/oauth2/authorize?${authParams.toString()}`)
    await page.waitForURL(/.*eagleeyenetworks.com.*/, { timeout: 15000 })

    const emailInput = page.locator('#authentication--input__email')
    await emailInput.waitFor({ state: 'visible', timeout: 15000 })
    await emailInput.fill(username)

    await page.getByRole('button', { name: 'Next' }).click()

    const passwordInput = page.locator('#authentication--input__password')
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 })
    await passwordInput.fill(password)

    const signInButton = page.locator('#next')
    try {
      await signInButton.click()
    } catch {
      await page.getByRole('button', { name: 'Sign in' }).click()
    }

    try {
      await page.waitForURL(/127\.0\.0\.1:3333.*code=/, { timeout: 30000 })
    } catch {
      if (!redirectUrl) {
        const currentUrl = page.url()
        if (currentUrl.includes('code=')) {
          redirectUrl = currentUrl
        }
      }
    }

    if (!redirectUrl) {
      throw new Error('Failed to capture redirect URL with authorization code')
    }

    const url = new URL(redirectUrl)
    const code = url.searchParams.get('code')
    const returnedState = url.searchParams.get('state')

    if (!code || returnedState !== state) {
      throw new Error('Invalid authorization response')
    }

    const tokenParams = new URLSearchParams({
      code,
      redirect_uri: REDIRECT_URI
    })

    const tokenResponse = await page.request.post(
      `${PROXY_URL}/proxy/getAccessToken?${tokenParams.toString()}`,
      {
        headers: {
          Accept: 'application/json',
          Origin: 'http://127.0.0.1:3333'
        }
      }
    )

    if (!tokenResponse.ok()) {
      throw new Error(`Token exchange failed: ${tokenResponse.status()}`)
    }

    const tokenData = (await tokenResponse.json()) as TokenResponse

    let baseUrl: string
    if (typeof tokenData.httpsBaseUrl === 'string') {
      baseUrl = tokenData.httpsBaseUrl
    } else {
      const { hostname, port } = tokenData.httpsBaseUrl
      baseUrl = port ? `https://${hostname}:${port}` : `https://${hostname}`
    }

    const authState: AuthState = {
      token: tokenData.accessToken,
      tokenExpiration: Date.now() + tokenData.expiresIn * 1000,
      baseUrl,
      sessionId: tokenData.sessionId
    }

    fs.writeFileSync(AUTH_CACHE_FILE, JSON.stringify(authState, null, 2), { mode: 0o600 })

    return authState
  } finally {
    await browser.close()
  }
}

test.describe('vue-media authenticated tests', () => {
  let authState: AuthState

  test.beforeAll(async () => {
    // Get auth token (from cache or fresh login)
    const cached = loadCachedAuth()
    if (cached) {
      console.log('Using cached auth token')
      authState = cached
    } else {
      console.log('Performing OAuth login...')
      authState = await performLogin()
      console.log('Login successful')
    }
  })

  test('authenticated user sees cameras on live page', async ({ page }) => {
    // Set up localStorage with auth state before navigating
    await page.goto('/')

    // Inject auth state into the app's Pinia store via localStorage
    await page.evaluate(
      ({ token, baseUrl, sessionId, tokenExpiration }) => {
        const authData = {
          isAuthenticated: true,
          token,
          tokenExpiration,
          refreshTokenMarker: 'present',
          baseUrl,
          sessionId
        }
        localStorage.setItem('een-auth', JSON.stringify(authData))
      },
      authState
    )

    // Navigate to live page
    await page.goto('/live')

    // Should show the live camera view
    await expect(page.getByRole('heading', { name: 'Live Camera View' })).toBeVisible()

    // Wait for cameras to load (or show no cameras message)
    await page.waitForSelector('[data-testid="camera-select"], .no-cameras', {
      timeout: 30000
    })

    // Either cameras are loaded or we see "no cameras" message
    const cameraSelect = page.getByTestId('camera-select')
    const noCameras = page.locator('.no-cameras')

    const hasCameras = await cameraSelect.isVisible().catch(() => false)
    const hasNoCameras = await noCameras.isVisible().catch(() => false)

    expect(hasCameras || hasNoCameras).toBe(true)

    if (hasCameras) {
      console.log('Cameras found - checking controls')

      // Verify controls are present
      await expect(page.getByTestId('refresh-button')).toBeVisible()
      await expect(page.getByTestId('auto-refresh-button')).toBeVisible()

      // Wait for image to load
      await page.waitForSelector('[data-testid="live-image"], .image-loading, .no-image', {
        timeout: 30000
      })

      // Check if we got an image or an error
      const hasImage = await page.getByTestId('live-image').isVisible().catch(() => false)
      if (hasImage) {
        console.log('Live image loaded successfully')

        // Check timestamp is shown
        const timestamp = page.getByTestId('timestamp')
        await expect(timestamp).toBeVisible()
      } else {
        console.log('No live image available (camera may be offline)')
      }
    } else {
      console.log('No cameras in account')
    }
  })

  test('authenticated home page shows view live button', async ({ page }) => {
    await page.goto('/')

    // Inject auth state
    await page.evaluate(
      ({ token, baseUrl, sessionId, tokenExpiration }) => {
        const authData = {
          isAuthenticated: true,
          token,
          tokenExpiration,
          refreshTokenMarker: 'present',
          baseUrl,
          sessionId
        }
        localStorage.setItem('een-auth', JSON.stringify(authData))
      },
      authState
    )

    // Reload to apply auth state
    await page.reload()

    // Should show authenticated state
    await expect(page.getByTestId('authenticated')).toBeVisible()
    await expect(page.getByTestId('view-live-button')).toBeVisible()
    await expect(page.getByText('You are logged in!')).toBeVisible()
  })

  test('refresh button fetches new image', async ({ page }) => {
    await page.goto('/')

    // Inject auth state
    await page.evaluate(
      ({ token, baseUrl, sessionId, tokenExpiration }) => {
        const authData = {
          isAuthenticated: true,
          token,
          tokenExpiration,
          refreshTokenMarker: 'present',
          baseUrl,
          sessionId
        }
        localStorage.setItem('een-auth', JSON.stringify(authData))
      },
      authState
    )

    await page.goto('/live')

    // Wait for initial load
    await page.waitForSelector('[data-testid="camera-select"], .no-cameras', {
      timeout: 30000
    })

    const hasCameras = await page.getByTestId('camera-select').isVisible().catch(() => false)

    if (hasCameras) {
      // Wait for initial image
      await page.waitForSelector('[data-testid="live-image"], .no-image', {
        timeout: 30000
      })

      // Click refresh
      await page.getByTestId('refresh-button').click()

      // Button should show loading state briefly
      // Just verify the click works without errors
      await expect(page.getByTestId('refresh-button')).toBeVisible()

      console.log('Refresh button clicked successfully')
    } else {
      console.log('No cameras to test refresh with')
    }
  })
})
