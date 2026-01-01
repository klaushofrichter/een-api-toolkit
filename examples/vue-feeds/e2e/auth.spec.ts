/**
 * Authenticated E2E tests for vue-feeds example
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

test.describe('vue-feeds authenticated tests', () => {
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

  /**
   * Helper function to inject auth state into localStorage
   */
  async function injectAuthState(page: import('@playwright/test').Page) {
    await page.evaluate(
      ({ token, baseUrl, sessionId, tokenExpiration }) => {
        localStorage.setItem('een_token', token)
        localStorage.setItem('een_tokenExpiration', String(tokenExpiration))
        localStorage.setItem('een_refreshTokenMarker', 'present')
        localStorage.setItem('een_sessionId', sessionId)
        const url = new URL(baseUrl)
        localStorage.setItem('een_hostname', url.hostname)
        if (url.port) {
          localStorage.setItem('een_port', url.port)
        }
      },
      authState
    )
  }

  test.beforeEach(async ({ page }) => {
    // Navigate to home and inject auth state before each test
    await page.goto('/')
    await injectAuthState(page)
  })

  test('authenticated home page shows view feeds button', async ({ page }) => {
    // Reload to apply auth state (already injected by beforeEach)
    await page.reload()

    // Should show authenticated state
    await expect(page.getByTestId('authenticated')).toBeVisible()
    await expect(page.getByTestId('view-feeds-button')).toBeVisible()
    await expect(page.getByText('You are logged in!')).toBeVisible()
  })

  test('authenticated user sees cameras on feeds page', async ({ page }) => {
    // Navigate to feeds page (auth already injected by beforeEach)
    await page.goto('/feeds')

    // Should show the feeds view
    await expect(page.getByRole('heading', { name: 'Camera Feeds' })).toBeVisible()

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

      // Wait for feeds to load
      await page.waitForSelector('[data-testid="feeds-table"], .no-feeds', {
        timeout: 30000
      })

      // Check if we have feeds
      const hasFeeds = await page.getByTestId('feeds-table').isVisible().catch(() => false)
      if (hasFeeds) {
        console.log('Feeds loaded successfully')

        // Check feeds summary
        await expect(page.getByTestId('feeds-summary')).toBeVisible()

        // Check that at least one feed row exists
        const feedRows = page.getByTestId('feed-row')
        const count = await feedRows.count()
        expect(count).toBeGreaterThan(0)
        console.log(`Found ${count} feeds`)
      } else {
        console.log('No feeds available for this camera')
      }
    } else {
      console.log('No cameras in account')
    }
  })

  test('feeds table shows correct feed information', async ({ page }) => {
    // Navigate to feeds page (auth already injected by beforeEach)
    await page.goto('/feeds')

    // Wait for cameras to load
    await page.waitForSelector('[data-testid="camera-select"], .no-cameras', {
      timeout: 30000
    })

    const hasCameras = await page.getByTestId('camera-select').isVisible().catch(() => false)

    if (hasCameras) {
      // Wait for feeds to load
      await page.waitForSelector('[data-testid="feeds-table"], .no-feeds', {
        timeout: 30000
      })

      const hasFeeds = await page.getByTestId('feeds-table').isVisible().catch(() => false)

      if (hasFeeds) {
        // Get the first feed row
        const firstRow = page.getByTestId('feed-row').first()

        // Verify feed ID is displayed
        const feedId = await page.getByTestId('feed-id').first().textContent()
        expect(feedId).toBeTruthy()
        console.log(`First feed ID: ${feedId}`)

        // Verify feed type is displayed (main, preview, or talkdown)
        const feedType = await page.getByTestId('feed-type').first().textContent()
        expect(feedType).toMatch(/main|preview|talkdown/i)
        console.log(`First feed type: ${feedType}`)

        // Verify media type is displayed
        const mediaType = await page.getByTestId('feed-media-type').first().textContent()
        expect(mediaType).toBeTruthy()
        console.log(`First feed media type: ${mediaType}`)

        // Verify URL availability is shown
        const feedUrls = page.getByTestId('feed-urls').first()
        await expect(feedUrls).toBeVisible()
      } else {
        console.log('No feeds to test')
      }
    } else {
      console.log('No cameras to test with')
    }
  })

  test('refresh button fetches feeds', async ({ page }) => {
    // Navigate to feeds page (auth already injected by beforeEach)
    await page.goto('/feeds')

    // Wait for cameras to load
    await page.waitForSelector('[data-testid="camera-select"], .no-cameras', {
      timeout: 30000
    })

    const hasCameras = await page.getByTestId('camera-select').isVisible().catch(() => false)

    if (hasCameras) {
      // Wait for feeds to load
      await page.waitForSelector('[data-testid="feeds-table"], .no-feeds', {
        timeout: 30000
      })

      // Click refresh
      await page.getByTestId('refresh-button').click()

      // Button should be visible (not broken)
      await expect(page.getByTestId('refresh-button')).toBeVisible()

      console.log('Refresh button clicked successfully')
    } else {
      console.log('No cameras to test refresh with')
    }
  })

  test('camera selection changes feeds', async ({ page }) => {
    // Navigate to feeds page (auth already injected by beforeEach)
    await page.goto('/feeds')

    // Wait for cameras to load
    await page.waitForSelector('[data-testid="camera-select"], .no-cameras', {
      timeout: 30000
    })

    const cameraSelect = page.getByTestId('camera-select')
    const hasCameras = await cameraSelect.isVisible().catch(() => false)

    if (hasCameras) {
      // Get all camera options
      const options = await cameraSelect.locator('option').all()

      if (options.length >= 2) {
        // Wait for initial feeds to load
        await page.waitForSelector('[data-testid="feeds-table"], .no-feeds', {
          timeout: 30000
        })

        // Get the second camera's value
        const secondCameraValue = await options[1].getAttribute('value')
        console.log(`Selecting camera: ${secondCameraValue}`)

        // Select the second camera
        await cameraSelect.selectOption(secondCameraValue!)

        // Wait for feeds to reload
        await page.waitForSelector('[data-testid="feeds-list"]', {
          timeout: 30000
        })

        // Give it a moment to fetch new feeds
        await page.waitForTimeout(2000)

        // Verify feeds list is visible
        await expect(page.getByTestId('feeds-list')).toBeVisible()

        console.log('Camera selection changed successfully')
      } else {
        console.log('Only one camera available - cannot test camera switching')
      }
    } else {
      console.log('No cameras to test with')
    }
  })
})
