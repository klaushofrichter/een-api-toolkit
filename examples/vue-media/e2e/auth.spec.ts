/**
 * E2E tests for the Vue Media Example - OAuth Login Flow
 *
 * Tests the OAuth login flow through the UI:
 * 1. Click login button in the example app
 * 2. Enter credentials on EEN OAuth page
 * 3. Complete the OAuth callback
 * 4. Verify authenticated state and media functionality
 *
 * Required environment variables:
 * - VITE_PROXY_URL: OAuth proxy URL (e.g., http://127.0.0.1:8787)
 * - VITE_EEN_CLIENT_ID: EEN OAuth client ID
 * - TEST_USER: Test user email
 * - TEST_PASSWORD: Test user password
 *
 * Note: Helper functions (isProxyAccessible, performLogin, clearAuthState) are
 * intentionally duplicated in each example's auth.spec.ts to avoid Playwright's
 * "Requiring @playwright/test second time" error that occurs when importing
 * from a shared file outside the example directory.
 */

import { test, expect, Page } from '@playwright/test'
import { baseURL } from '../playwright.config'
import { formatDateTimeLocal } from '../src/utils/timestamp'

const TIMEOUTS = {
  OAUTH_REDIRECT: 30000,
  ELEMENT_VISIBLE: 15000,
  PASSWORD_VISIBLE: 10000,
  AUTH_COMPLETE: 30000,
  UI_UPDATE: 10000,
  PROXY_CHECK: 5000,
  MEDIA_LOAD: 30000
} as const

const TEST_USER = process.env.TEST_USER
const TEST_PASSWORD = process.env.TEST_PASSWORD
const PROXY_URL = process.env.VITE_PROXY_URL

/**
 * Checks if the OAuth proxy server is accessible.
 * Returns false if proxy is unavailable, allowing tests to be skipped gracefully.
 */
async function isProxyAccessible(): Promise<boolean> {
  if (!PROXY_URL) return false
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUTS.PROXY_CHECK)

  try {
    const response = await fetch(PROXY_URL, {
      method: 'HEAD',
      signal: controller.signal
    })
    return response.ok || response.status === 404
  } catch (error) {
    if (!process.env.CI) {
      console.log('Proxy check failed:', error instanceof Error ? error.message : error)
    }
    return false
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Performs OAuth login flow through the EEN authentication page.
 * Handles two-step navigation: app login page -> EEN OAuth -> callback
 */
async function performLogin(page: Page, username: string, password: string): Promise<void> {
  await page.goto('/')

  // Click login button on home page to go to login page
  await page.click('[data-testid="login-button"]')
  await page.waitForURL('/login')

  // Click login button on login page to trigger OAuth
  await Promise.all([
    page.waitForURL(/.*eagleeyenetworks.com.*/, { timeout: TIMEOUTS.OAUTH_REDIRECT }),
    page.getByRole('button', { name: 'Login with Eagle Eye Networks' }).click()
  ])

  // EEN OAuth page selectors - these depend on EEN's login UI and may need
  // updates if EEN changes their authentication page structure
  const emailInput = page.locator('#authentication--input__email')
  await emailInput.waitFor({ state: 'visible', timeout: TIMEOUTS.ELEMENT_VISIBLE })
  await emailInput.fill(username)

  await page.getByRole('button', { name: 'Next' }).click()

  const passwordInput = page.locator('#authentication--input__password')
  await passwordInput.waitFor({ state: 'visible', timeout: TIMEOUTS.PASSWORD_VISIBLE })
  await passwordInput.fill(password)

  // EEN uses either #next or "Sign in" button depending on login flow
  await page.locator('#next, button:has-text("Sign in")').first().click()

  // Wait for redirect back to the app using configured baseURL
  const baseURLPattern = new RegExp(baseURL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  await page.waitForURL(baseURLPattern, { timeout: TIMEOUTS.AUTH_COMPLETE })
}

/**
 * Clears authentication state from browser storage.
 * Used in afterEach to ensure test isolation.
 */
async function clearAuthState(page: Page): Promise<void> {
  try {
    const url = page.url()
    if (url && url.startsWith('http')) {
      await page.evaluate(() => {
        try {
          localStorage.clear()
          sessionStorage.clear()
        } catch {
          // Storage access may fail in certain contexts
        }
      })
    }
  } catch (error) {
    if (!process.env.CI) {
      console.log('Clear auth state failed:', error instanceof Error ? error.message : error)
    }
  }
}

test.describe('Vue Media Example - Auth', () => {
  let proxyAccessible = false

  function skipIfNoProxy() {
    test.skip(!proxyAccessible, 'OAuth proxy not accessible')
  }

  function skipIfNoCredentials() {
    test.skip(!TEST_USER || !TEST_PASSWORD, 'Test credentials not available')
  }

  test.beforeAll(async () => {
    proxyAccessible = await isProxyAccessible()
    if (!proxyAccessible) {
      console.log('OAuth proxy not accessible - OAuth tests will be skipped')
    }
  })

  test.afterEach(async ({ page }) => {
    await clearAuthState(page)
  })

  test('shows login button when not authenticated', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('not-authenticated')).toBeVisible()
    await expect(page.getByTestId('nav-login')).toBeVisible()
  })

  test('live page redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/live')
    await expect(page).toHaveURL('/login')
  })

  test('login button redirects to OAuth page', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    await page.goto('/')
    await expect(page.getByTestId('login-button')).toBeVisible()

    // Click login button on home page to go to login page
    await page.click('[data-testid="login-button"]')
    await page.waitForURL('/login')

    // Click login button on login page to trigger OAuth
    await Promise.all([
      page.waitForURL(/.*eagleeyenetworks.com.*/, { timeout: TIMEOUTS.OAUTH_REDIRECT }),
      page.getByRole('button', { name: 'Login with Eagle Eye Networks' }).click()
    ])

    // EEN OAuth page selector
    const emailInput = page.locator('#authentication--input__email')
    await expect(emailInput).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE })
  })

  test('complete OAuth login flow and view media', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    await page.goto('/')
    await expect(page.getByTestId('not-authenticated')).toBeVisible()

    await performLogin(page, TEST_USER!, TEST_PASSWORD!)

    await expect(page.getByTestId('not-authenticated')).not.toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })
    await expect(page.getByTestId('nav-live')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })
    await expect(page.getByTestId('nav-logout')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })
  })

  test('can view live camera after login', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    await performLogin(page, TEST_USER!, TEST_PASSWORD!)
    await expect(page.getByTestId('nav-live')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    await page.click('[data-testid="nav-live"]')
    await page.waitForURL('/live')

    await expect(page.getByRole('heading', { name: 'Live Camera Image (preview)' })).toBeVisible()

    // Wait for cameras to load
    await page.waitForSelector('[data-testid="camera-select"], .no-cameras', {
      timeout: TIMEOUTS.MEDIA_LOAD
    })
  })

  test('live page shows camera controls when cameras available', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    await performLogin(page, TEST_USER!, TEST_PASSWORD!)
    await expect(page.getByTestId('nav-live')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    await page.click('[data-testid="nav-live"]')
    await page.waitForURL('/live')

    await page.waitForSelector('[data-testid="camera-select"], .no-cameras', {
      timeout: TIMEOUTS.MEDIA_LOAD
    })

    const hasCameras = await page.getByTestId('camera-select').isVisible().catch(() => false)
    if (hasCameras) {
      await expect(page.getByTestId('refresh-button')).toBeVisible()
      await expect(page.getByTestId('auto-refresh-button')).toBeVisible()
      console.log('Camera controls visible')
    } else {
      console.log('No cameras in account - skipping camera-specific checks')
    }
  })

  test('can view recorded images after login', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    await performLogin(page, TEST_USER!, TEST_PASSWORD!)
    await expect(page.getByTestId('nav-recorded')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    await page.click('[data-testid="nav-recorded"]')
    await page.waitForURL('/recorded')

    await expect(page.getByRole('heading', { name: 'Recorded Image (Preview and Main)' })).toBeVisible()

    // Wait for cameras to load
    await page.waitForSelector('[data-testid="camera-select"], .no-cameras', {
      timeout: TIMEOUTS.MEDIA_LOAD
    })
  })

  test('recorded page shows navigation controls when cameras available', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    await performLogin(page, TEST_USER!, TEST_PASSWORD!)
    await expect(page.getByTestId('nav-recorded')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    await page.click('[data-testid="nav-recorded"]')
    await page.waitForURL('/recorded')

    await page.waitForSelector('[data-testid="camera-select"], .no-cameras', {
      timeout: TIMEOUTS.MEDIA_LOAD
    })

    const hasCameras = await page.getByTestId('camera-select').isVisible().catch(() => false)
    if (hasCameras) {
      await expect(page.getByTestId('datetime-input')).toBeVisible()
      await expect(page.getByTestId('go-button')).toBeVisible()
      await expect(page.getByTestId('now-button')).toBeVisible()
      await expect(page.getByTestId('prev-button')).toBeVisible()
      await expect(page.getByTestId('next-button')).toBeVisible()
      console.log('Recorded image controls visible')
    } else {
      console.log('No cameras in account - skipping camera-specific checks')
    }
  })

  test('Now button resets datetime picker to current time', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    await performLogin(page, TEST_USER!, TEST_PASSWORD!)
    await expect(page.getByTestId('nav-recorded')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    await page.click('[data-testid="nav-recorded"]')
    await page.waitForURL('/recorded')

    await page.waitForSelector('[data-testid="camera-select"], .no-cameras', {
      timeout: TIMEOUTS.MEDIA_LOAD
    })

    const hasCameras = await page.getByTestId('camera-select').isVisible().catch(() => false)
    if (hasCameras) {
      const datetimeInput = page.getByTestId('datetime-input')
      await expect(datetimeInput).toBeVisible()

      // Set datetime to a past time (1 hour ago)
      const pastTime = new Date(Date.now() - 60 * 60 * 1000)
      const pastTimeStr = pastTime.toISOString().slice(0, 19) // Format: YYYY-MM-DDTHH:mm:ss
      await datetimeInput.fill(pastTimeStr)

      // Verify the input has the past time
      const valueBeforeClick = await datetimeInput.inputValue()
      expect(valueBeforeClick).toContain(pastTimeStr.slice(0, 16)) // Check date and time portion

      // Click the Now button
      await page.click('[data-testid="now-button"]')

      // Get the new value and verify it's closer to current time
      const valueAfterClick = await datetimeInput.inputValue()
      const nowTime = new Date()
      const selectedTime = new Date(valueAfterClick)

      // The selected time should be within 2 minutes of now
      const timeDiffMs = Math.abs(nowTime.getTime() - selectedTime.getTime())
      expect(timeDiffMs).toBeLessThan(2 * 60 * 1000) // 2 minutes tolerance

      // Verify UTC timestamp is visible and in valid EEN API format
      const utcTimestamp = page.getByTestId('utc-timestamp')
      await expect(utcTimestamp).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

      const utcText = await utcTimestamp.textContent()
      expect(utcText).toContain('Timestamp for API (UTC):')

      // Extract the timestamp value and verify EEN API format: YYYY-MM-DDTHH:mm:ss.sss+00:00
      const apiTimestampMatch = utcText?.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}\+00:00/)
      expect(apiTimestampMatch).not.toBeNull()

      console.log('Now button correctly reset datetime to current time')
      console.log('UTC timestamp visible and valid:', apiTimestampMatch?.[0])
    } else {
      console.log('No cameras in account - skipping Now button test')
    }
  })

  test('datetime selection persists between recorded and video pages', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    // Force browser to use UTC timezone for consistent behavior across CI and local environments
    await page.addInitScript(() => {
      const OriginalDate = Date
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).Date = class extends OriginalDate {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        constructor(...args: any[]) {
          if (args.length === 0) {
            super()
          } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            super(...(args as [any]))
          }
        }
        getTimezoneOffset() {
          return 0 // UTC
        }
      }
    })

    await performLogin(page, TEST_USER!, TEST_PASSWORD!)
    await expect(page.getByTestId('nav-recorded')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    // Navigate to recorded page
    await page.click('[data-testid="nav-recorded"]')
    await page.waitForURL('/recorded')

    await page.waitForSelector('[data-testid="camera-select"], .no-cameras', {
      timeout: TIMEOUTS.MEDIA_LOAD
    })

    const hasCameras = await page.getByTestId('camera-select').isVisible().catch(() => false)
    if (hasCameras) {
      const datetimeInput = page.getByTestId('datetime-input')
      await expect(datetimeInput).toBeVisible()

      // Set a specific datetime (2 hours ago to ensure it's different from default)
      const specificTime = new Date(Date.now() - 2 * 60 * 60 * 1000)
      // Use shared utility for local time formatting (datetime-local inputs use local time, not UTC)
      const specificTimeStr = formatDateTimeLocal(specificTime)
      await datetimeInput.fill(specificTimeStr)
      // Trigger blur and dispatch input event to ensure Vue v-model updates the shared ref
      await datetimeInput.blur()
      await datetimeInput.dispatchEvent('input')
      // Brief wait for Vue reactivity to propagate to the module singleton
      // Note: waitForFunction on sessionStorage doesn't work here because the SPA shares
      // a module-level ref that only reads from storage on initial load, not on navigation
      await page.waitForTimeout(100)

      // Verify the input has the specific time
      const valueOnRecorded = await datetimeInput.inputValue()
      expect(valueOnRecorded).toContain(specificTimeStr.slice(0, 16)) // Check date and time portion

      // Navigate to HLS video page
      await page.click('[data-testid="nav-hls"]')
      await page.waitForURL('/hls')

      await page.waitForSelector('[data-testid="camera-select"], .no-cameras', {
        timeout: TIMEOUTS.MEDIA_LOAD
      })

      // Verify the datetime is persisted on HLS page
      const hlsDatetimeInput = page.getByTestId('datetime-input')
      await expect(hlsDatetimeInput).toBeVisible()

      const valueOnHls = await hlsDatetimeInput.inputValue()
      expect(valueOnHls).toContain(specificTimeStr.slice(0, 16)) // Should match the time set on recorded page

      console.log('Datetime persistence verified: recorded →', valueOnRecorded, '| hls →', valueOnHls)
    } else {
      console.log('No cameras in account - skipping datetime persistence test')
    }
  })

  test('can view HLS video after login', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    await performLogin(page, TEST_USER!, TEST_PASSWORD!)
    await expect(page.getByTestId('nav-hls')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    await page.click('[data-testid="nav-hls"]')
    await page.waitForURL('/hls')

    await expect(page.getByRole('heading', { name: 'HLS Video Streaming (Main)' })).toBeVisible()

    // Wait for cameras to load
    await page.waitForSelector('[data-testid="camera-select"], .no-cameras', {
      timeout: TIMEOUTS.MEDIA_LOAD
    })
  })

  test('HLS page shows controls when cameras available', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    await performLogin(page, TEST_USER!, TEST_PASSWORD!)
    await expect(page.getByTestId('nav-hls')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    await page.click('[data-testid="nav-hls"]')
    await page.waitForURL('/hls')

    await page.waitForSelector('[data-testid="camera-select"], .no-cameras', {
      timeout: TIMEOUTS.MEDIA_LOAD
    })

    const hasCameras = await page.getByTestId('camera-select').isVisible().catch(() => false)
    if (hasCameras) {
      await expect(page.getByTestId('datetime-input')).toBeVisible()
      await expect(page.getByTestId('go-button')).toBeVisible()
      await expect(page.getByTestId('now-button')).toBeVisible()
      console.log('HLS video controls visible')
    } else {
      console.log('No cameras in account - skipping camera-specific checks')
    }
  })

  test('can logout after login', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    await performLogin(page, TEST_USER!, TEST_PASSWORD!)
    await expect(page.getByTestId('nav-logout')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    await page.click('[data-testid="nav-logout"]')

    await page.waitForURL('**/')
    await expect(page.getByTestId('not-authenticated')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })
    await expect(page.getByTestId('nav-login')).toBeVisible()
  })
})
