/**
 * E2E tests for the Vue PTZ Example - OAuth Login Flow
 *
 * Tests the OAuth login flow through the UI:
 * 1. Click login button in the example app
 * 2. Enter credentials on EEN OAuth page
 * 3. Complete the OAuth callback
 * 4. Verify authenticated state and PTZ control functionality
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

const TIMEOUTS = {
  OAUTH_REDIRECT: 30000,
  ELEMENT_VISIBLE: 15000,
  PASSWORD_VISIBLE: 10000,
  AUTH_COMPLETE: 30000,
  UI_UPDATE: 10000,
  PROXY_CHECK: 5000,
  PTZ_LOAD: 30000
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

test.describe('Vue PTZ Example - Auth', () => {
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

  test('ptz page redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/ptz')
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

  test('complete OAuth login flow and view PTZ controls', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    await page.goto('/')
    await expect(page.getByTestId('not-authenticated')).toBeVisible()

    await performLogin(page, TEST_USER!, TEST_PASSWORD!)

    await expect(page.getByTestId('not-authenticated')).not.toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })
    await expect(page.getByTestId('nav-ptz')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })
    await expect(page.getByTestId('nav-logout')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })
  })

  test('can view PTZ controls after login', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    await performLogin(page, TEST_USER!, TEST_PASSWORD!)
    await expect(page.getByTestId('nav-ptz')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    await page.click('[data-testid="nav-ptz"]')
    await page.waitForURL('/ptz')

    await expect(page.getByRole('heading', { name: 'PTZ Camera Control' })).toBeVisible()

    // Wait for camera selector or no-cameras message
    await page.waitForSelector('[data-testid="ptz-camera-select"], [data-testid="no-ptz-cameras"]', {
      timeout: TIMEOUTS.PTZ_LOAD
    })
  })

  test('PTZ page shows direction pad and controls', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    await performLogin(page, TEST_USER!, TEST_PASSWORD!)
    await expect(page.getByTestId('nav-ptz')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    await page.click('[data-testid="nav-ptz"]')
    await page.waitForURL('/ptz')

    // PTZ layout should be visible
    await expect(page.getByTestId('ptz-layout')).toBeVisible()

    // Direction pad should be visible
    await expect(page.getByTestId('direction-pad')).toBeVisible()

    // Position display should be visible
    await expect(page.getByTestId('position-display')).toBeVisible()

    // Preset manager should be visible
    await expect(page.getByTestId('preset-manager')).toBeVisible()
  })

  test('exercises PTZ API calls when PTZ camera is available', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    await performLogin(page, TEST_USER!, TEST_PASSWORD!)
    await expect(page.getByTestId('nav-ptz')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    await page.click('[data-testid="nav-ptz"]')
    await page.waitForURL('/ptz')

    // Wait for camera loading to finish
    await page.waitForSelector('[data-testid="ptz-camera-select"], [data-testid="no-ptz-cameras"]', {
      timeout: TIMEOUTS.PTZ_LOAD
    })

    // If no PTZ cameras available, skip gracefully
    const noPtzCameras = await page.getByTestId('no-ptz-cameras').isVisible().catch(() => false)
    if (noPtzCameras) {
      console.log('No PTZ cameras available — skipping PTZ API tests')
      return
    }

    // PTZ camera is available — exercise API calls

    // 1. Verify position display shows numeric values (confirms getPtzPosition succeeded)
    const positionX = page.getByTestId('position-x')
    await expect(positionX).toBeVisible({ timeout: TIMEOUTS.PTZ_LOAD })
    await expect(positionX).not.toHaveText('--', { timeout: TIMEOUTS.PTZ_LOAD })

    const positionY = page.getByTestId('position-y')
    await expect(positionY).toBeVisible()
    await expect(positionY).not.toHaveText('--')

    const positionZ = page.getByTestId('position-z')
    await expect(positionZ).toBeVisible()
    await expect(positionZ).not.toHaveText('--')

    // 2. Click a direction button and verify position still reads numeric (confirms movePtz round-trip)
    await page.click('[data-testid="btn-up"]')
    await page.waitForTimeout(2000)
    await page.click('[data-testid="refresh-position"]')
    await expect(positionX).not.toHaveText('--', { timeout: TIMEOUTS.UI_UPDATE })
    await expect(positionY).not.toHaveText('--', { timeout: TIMEOUTS.UI_UPDATE })

    // 3. Verify preset manager loaded (confirms getPtzSettings succeeded)
    await expect(page.getByTestId('preset-manager')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })
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
