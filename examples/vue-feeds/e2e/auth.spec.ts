/**
 * E2E tests for the Vue Feeds Example - OAuth Login Flow
 *
 * Tests the OAuth login flow through the UI:
 * 1. Click login button in the example app
 * 2. Enter credentials on EEN OAuth page
 * 3. Complete the OAuth callback
 * 4. Verify authenticated state and feeds functionality
 *
 * Required environment variables:
 * - VITE_PROXY_URL: OAuth proxy URL (e.g., http://127.0.0.1:8787)
 * - VITE_EEN_CLIENT_ID: EEN OAuth client ID
 * - TEST_USER: Test user email
 * - TEST_PASSWORD: Test user password
 */

import { test, expect, Page } from '@playwright/test'

const TIMEOUTS = {
  OAUTH_REDIRECT: 30000,
  ELEMENT_VISIBLE: 15000,
  PASSWORD_VISIBLE: 10000,
  AUTH_COMPLETE: 30000,
  UI_UPDATE: 10000,
  PROXY_CHECK: 5000,
  FEEDS_LOAD: 30000
} as const

const TEST_USER = process.env.TEST_USER
const TEST_PASSWORD = process.env.TEST_PASSWORD
const PROXY_URL = process.env.VITE_PROXY_URL

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
  } catch {
    return false
  } finally {
    clearTimeout(timeoutId)
  }
}

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

  const emailInput = page.locator('#authentication--input__email')
  await emailInput.waitFor({ state: 'visible', timeout: TIMEOUTS.ELEMENT_VISIBLE })
  await emailInput.fill(username)

  await page.getByRole('button', { name: 'Next' }).click()

  const passwordInput = page.locator('#authentication--input__password')
  await passwordInput.waitFor({ state: 'visible', timeout: TIMEOUTS.PASSWORD_VISIBLE })
  await passwordInput.fill(password)

  await page.locator('#next, button:has-text("Sign in")').first().click()

  // Wait for redirect back to the app (could be / or /feeds depending on app flow)
  await page.waitForURL(/127\.0\.0\.1:3333/, { timeout: TIMEOUTS.AUTH_COMPLETE })
}

async function clearAuthState(page: Page): Promise<void> {
  try {
    const url = page.url()
    if (url && url.startsWith('http')) {
      await page.evaluate(() => {
        try {
          localStorage.clear()
          sessionStorage.clear()
        } catch {
          // Ignore errors
        }
      })
    }
  } catch {
    // Ignore errors
  }
}

test.describe('Vue Feeds Example - Auth', () => {
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

  test('feeds page redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/feeds')
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

    const emailInput = page.locator('#authentication--input__email')
    await expect(emailInput).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE })
  })

  test('complete OAuth login flow and view feeds', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    await page.goto('/')
    await expect(page.getByTestId('not-authenticated')).toBeVisible()

    await performLogin(page, TEST_USER!, TEST_PASSWORD!)

    await expect(page.getByTestId('not-authenticated')).not.toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })
    await expect(page.getByTestId('nav-feeds')).toBeVisible()
    await expect(page.getByTestId('nav-logout')).toBeVisible()
  })

  test('can view feeds list after login', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    await performLogin(page, TEST_USER!, TEST_PASSWORD!)
    await expect(page.getByTestId('nav-feeds')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    await page.click('[data-testid="nav-feeds"]')
    await page.waitForURL('/feeds')

    await expect(page.getByRole('heading', { name: 'Camera Feeds' })).toBeVisible()

    // Wait for cameras to load
    await page.waitForSelector('[data-testid="camera-select"], .no-cameras', {
      timeout: TIMEOUTS.FEEDS_LOAD
    })
  })

  test('feeds page shows camera selector when cameras available', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    await performLogin(page, TEST_USER!, TEST_PASSWORD!)
    await expect(page.getByTestId('nav-feeds')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    await page.click('[data-testid="nav-feeds"]')
    await page.waitForURL('/feeds')

    await page.waitForSelector('[data-testid="camera-select"], .no-cameras', {
      timeout: TIMEOUTS.FEEDS_LOAD
    })

    const hasCameras = await page.getByTestId('camera-select').isVisible().catch(() => false)
    if (hasCameras) {
      await expect(page.getByTestId('refresh-button')).toBeVisible()
      console.log('Camera selector and refresh button visible')
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
