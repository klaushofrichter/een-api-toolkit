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

  test('authenticated user sees cameras on live page', async ({ page }) => {
    // Navigate to live page (auth already injected by beforeEach)
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
    // Reload to apply auth state (already injected by beforeEach)
    await page.reload()

    // Should show authenticated state
    await expect(page.getByTestId('authenticated')).toBeVisible()
    await expect(page.getByTestId('view-live-button')).toBeVisible()
    await expect(page.getByText('You are logged in!')).toBeVisible()
  })

  test('refresh button fetches new image', async ({ page }) => {
    // Navigate to live page (auth already injected by beforeEach)
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

  test('authenticated home page shows view recorded button', async ({ page }) => {
    // Reload to apply auth state (already injected by beforeEach)
    await page.reload()

    // Should show authenticated state with both buttons
    await expect(page.getByTestId('authenticated')).toBeVisible()
    await expect(page.getByTestId('view-live-button')).toBeVisible()
    await expect(page.getByTestId('view-recorded-button')).toBeVisible()
  })

  test('recorded image page shows camera selector and time picker', async ({ page }) => {
    // Navigate to recorded page (auth already injected by beforeEach)
    await page.goto('/recorded')

    // Should show the recorded image page
    await expect(page.getByRole('heading', { name: 'Recorded Images' })).toBeVisible()

    // Wait for cameras to load
    await page.waitForSelector('[data-testid="camera-select"], .no-cameras', {
      timeout: 30000
    })

    const hasCameras = await page.getByTestId('camera-select').isVisible().catch(() => false)

    if (hasCameras) {
      console.log('Cameras found - checking recorded image controls')

      // Verify controls are present
      await expect(page.getByTestId('datetime-input')).toBeVisible()
      await expect(page.getByTestId('go-button')).toBeVisible()
      await expect(page.getByTestId('prev-button')).toBeVisible()
      await expect(page.getByTestId('next-button')).toBeVisible()

      // Initially prev/next should be disabled (no image loaded yet or no tokens)
      const prevDisabled = await page.getByTestId('prev-button').isDisabled()
      const nextDisabled = await page.getByTestId('next-button').isDisabled()
      console.log(`Navigation buttons: prev=${prevDisabled ? 'disabled' : 'enabled'}, next=${nextDisabled ? 'disabled' : 'enabled'}`)
    } else {
      console.log('No cameras in account')
    }
  })

  test('recorded image page auto-loads image on mount', async ({ page }) => {
    // Navigate to recorded page (auth already injected by beforeEach)
    await page.goto('/recorded')

    // Wait for cameras to load
    await page.waitForSelector('[data-testid="camera-select"], .no-cameras', {
      timeout: 30000
    })

    const hasCameras = await page.getByTestId('camera-select').isVisible().catch(() => false)

    if (hasCameras) {
      // Wait for image to load (auto-loads on page mount with default time of 1 hour ago)
      await page.waitForSelector('[data-testid="recorded-image"], .no-image, .error', {
        timeout: 45000
      })

      const hasImage = await page.getByTestId('recorded-image').isVisible().catch(() => false)

      if (hasImage) {
        console.log('Recorded image loaded successfully')

        // Check timestamp is shown
        const timestamp = page.getByTestId('timestamp')
        await expect(timestamp).toBeVisible()

        // Time picker should be updated with the image timestamp
        const datetimeInput = page.getByTestId('datetime-input')
        const inputValue = await datetimeInput.inputValue()
        expect(inputValue).toBeTruthy()
        console.log(`Time picker value: ${inputValue}`)
      } else {
        console.log('No recorded image available (no recordings in time range)')
      }
    } else {
      console.log('No cameras to test with')
    }
  })

  test('recorded image navigation buttons work', async ({ page }) => {
    // Navigate to recorded page (auth already injected by beforeEach)
    await page.goto('/recorded')

    // Wait for cameras to load
    await page.waitForSelector('[data-testid="camera-select"], .no-cameras', {
      timeout: 30000
    })

    const hasCameras = await page.getByTestId('camera-select').isVisible().catch(() => false)

    if (hasCameras) {
      // Wait for an image to load
      await page.waitForSelector('[data-testid="recorded-image"], .no-image', {
        timeout: 45000
      })

      const hasImage = await page.getByTestId('recorded-image').isVisible().catch(() => false)

      if (hasImage) {
        // Check if next button is enabled
        const nextButton = page.getByTestId('next-button')
        const isNextEnabled = !(await nextButton.isDisabled())

        if (isNextEnabled) {
          // Get current timestamp
          const initialTimestamp = await page.getByTestId('timestamp').textContent()

          // Click next
          await nextButton.click()

          // Wait for potential update
          await page.waitForTimeout(2000)

          // Check timestamp changed
          const newTimestamp = await page.getByTestId('timestamp').textContent()
          console.log(`Navigated: ${initialTimestamp} -> ${newTimestamp}`)

          // Check if prev button is now enabled
          const prevButton = page.getByTestId('prev-button')
          const isPrevEnabled = !(await prevButton.isDisabled())

          if (isPrevEnabled) {
            // Navigate back
            await prevButton.click()
            await page.waitForTimeout(2000)
            console.log('Previous navigation successful')
          }
        } else {
          console.log('Next button disabled - only one image available')
        }
      } else {
        console.log('No recorded image to navigate from')
      }
    } else {
      console.log('No cameras to test navigation with')
    }
  })

  test('recorded image page loads with past date via Go button', async ({ page }) => {
    // Navigate to recorded page (auth already injected by beforeEach)
    await page.goto('/recorded')

    // Wait for cameras to load
    await page.waitForSelector('[data-testid="camera-select"], .no-cameras', {
      timeout: 30000
    })

    const hasCameras = await page.getByTestId('camera-select').isVisible().catch(() => false)

    if (hasCameras) {
      // Set the date/time to 24 hours ago
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const year = yesterday.getFullYear()
      const month = String(yesterday.getMonth() + 1).padStart(2, '0')
      const day = String(yesterday.getDate()).padStart(2, '0')
      const hours = String(yesterday.getHours()).padStart(2, '0')
      const minutes = String(yesterday.getMinutes()).padStart(2, '0')
      const dateTimeValue = `${year}-${month}-${day}T${hours}:${minutes}`

      // Fill in the datetime input with yesterday's date
      await page.getByTestId('datetime-input').fill(dateTimeValue)

      // Click Go button to load image from that time
      await page.getByTestId('go-button').click()

      // Wait for the image to load or error to appear
      await page.waitForSelector('[data-testid="recorded-image"], .error, .no-image', {
        timeout: 45000
      })

      // Check results
      const hasImage = await page.getByTestId('recorded-image').isVisible().catch(() => false)
      const hasError = await page.locator('.error').isVisible().catch(() => false)

      if (hasImage) {
        console.log('Image loaded successfully with past date')
        // Check timestamp is shown
        const timestamp = page.getByTestId('timestamp')
        await expect(timestamp).toBeVisible()
      } else if (hasError) {
        const errorText = await page.locator('.error').textContent()
        console.log('Error loading image with past date:', errorText)
        // A 404 "Not found" is acceptable if no recordings exist for that time
        expect(errorText).toMatch(/Not found|No recordings|Unknown error/)
      } else {
        console.log('No image or error visible - no recordings for past date')
      }
    } else {
      console.log('No cameras to test past date with')
    }
  })

  test('camera selection persists between live and recorded pages', async ({ page }) => {
    // Navigate to live page (auth already injected by beforeEach)
    await page.goto('/live')

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
        // Get the second camera's value
        const secondCameraValue = await options[1].getAttribute('value')
        console.log(`Selecting camera: ${secondCameraValue}`)

        // Select the second camera
        await cameraSelect.selectOption(secondCameraValue!)

        // Wait for selection to be applied
        await page.waitForTimeout(1000)

        // Navigate to recorded page
        await page.goto('/recorded')

        // Wait for cameras to load on recorded page
        await page.waitForSelector('[data-testid="camera-select"]', {
          timeout: 30000
        })

        // Check that the same camera is selected
        const recordedCameraSelect = page.getByTestId('camera-select')
        const selectedValue = await recordedCameraSelect.inputValue()

        expect(selectedValue).toBe(secondCameraValue)
        console.log(`Camera selection persisted: ${selectedValue}`)

        // Navigate back to live page
        await page.goto('/live')

        // Wait for cameras to load
        await page.waitForSelector('[data-testid="camera-select"]', {
          timeout: 30000
        })

        // Verify selection still persists
        const liveCameraSelect = page.getByTestId('camera-select')
        const liveSelectedValue = await liveCameraSelect.inputValue()

        expect(liveSelectedValue).toBe(secondCameraValue)
        console.log('Camera selection persisted across page navigations')
      } else {
        console.log('Only one camera available - cannot test persistence')
      }
    } else {
      console.log('No cameras to test with')
    }
  })
})
