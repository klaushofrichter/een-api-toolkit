import { test, expect, Page } from '@playwright/test'

/**
 * E2E tests for the Vue Basic Example
 *
 * Tests the OAuth login flow through the UI:
 * 1. Click login button in the example app
 * 2. Enter credentials on EEN OAuth page
 * 3. Complete the OAuth callback
 * 4. Verify authenticated state
 *
 * Required environment variables:
 * - VITE_PROXY_URL: OAuth proxy URL (e.g., http://127.0.0.1:8787)
 * - VITE_EEN_CLIENT_ID: EEN OAuth client ID
 * - TEST_USER: Test user email
 * - TEST_PASSWORD: Test user password
 */

// Timeout constants for consistent behavior
const TIMEOUTS = {
  OAUTH_REDIRECT: 30000,
  ELEMENT_VISIBLE: 15000,
  PASSWORD_VISIBLE: 10000,
  AUTH_COMPLETE: 30000,
  UI_UPDATE: 10000,
  PROXY_CHECK: 5000
} as const

const TEST_USER = process.env.TEST_USER
const TEST_PASSWORD = process.env.TEST_PASSWORD
const PROXY_URL = process.env.VITE_PROXY_URL

/**
 * Checks if the OAuth proxy is accessible
 */
async function isProxyAccessible(): Promise<boolean> {
  if (!PROXY_URL) return false
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUTS.PROXY_CHECK)
    const response = await fetch(PROXY_URL, {
      method: 'HEAD',
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    return response.ok || response.status === 404 // 404 is ok, means proxy is running
  } catch {
    return false
  }
}

/**
 * Performs OAuth login flow through the UI
 */
async function performLogin(page: Page, username: string, password: string): Promise<void> {
  // Start at home page
  await page.goto('/')

  // Click login button and wait for OAuth redirect
  await Promise.all([
    page.waitForURL(/.*eagleeyenetworks.com.*/, { timeout: TIMEOUTS.OAUTH_REDIRECT }),
    page.click('[data-testid="login-button"]')
  ])

  // Fill email
  const emailInput = page.locator('#authentication--input__email')
  await emailInput.waitFor({ state: 'visible', timeout: TIMEOUTS.ELEMENT_VISIBLE })
  await emailInput.fill(username)

  // Click next
  await page.getByRole('button', { name: 'Next' }).click()

  // Fill password
  const passwordInput = page.locator('#authentication--input__password')
  await passwordInput.waitFor({ state: 'visible', timeout: TIMEOUTS.PASSWORD_VISIBLE })
  await passwordInput.fill(password)

  // Click sign in - use OR selector for robustness
  await page.locator('#next, button:has-text("Sign in")').first().click()

  // Wait for auth to complete and redirect to app
  await page.waitForURL('**/', { timeout: TIMEOUTS.AUTH_COMPLETE })
}

test.describe('Vue Basic Example', () => {
  // Check proxy accessibility once before all tests
  let proxyAccessible = false

  test.beforeAll(async () => {
    proxyAccessible = await isProxyAccessible()
    if (!proxyAccessible) {
      console.log('OAuth proxy not accessible - OAuth tests will be skipped')
    }
  })

  test('shows login button when not authenticated', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-testid="not-authenticated"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-login"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-logout"]')).not.toBeVisible()
  })

  test('users page shows not-authenticated state without login', async ({ page }) => {
    await page.goto('/users')
    await expect(
      page.locator('[data-testid="not-authenticated"], [data-testid="nav-login"], .error, .auth-required').first()
    ).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })
  })

  test('login button redirects to OAuth page', async ({ page }) => {
    // Skip if proxy not accessible or credentials not available
    test.skip(!proxyAccessible, 'OAuth proxy not accessible')
    test.skip(!TEST_USER || !TEST_PASSWORD, 'Test credentials not available')

    await page.goto('/')
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible()
    await expect(page.locator('[data-testid="login-button"]')).toBeEnabled()

    // Click login and verify redirect to OAuth page
    await Promise.all([
      page.waitForURL(/.*eagleeyenetworks.com.*/, { timeout: TIMEOUTS.OAUTH_REDIRECT }),
      page.click('[data-testid="login-button"]')
    ])

    // Verify we're on the OAuth page
    const emailInput = page.locator('#authentication--input__email')
    await expect(emailInput).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE })
  })

  test('complete OAuth login flow', async ({ page }) => {
    // Skip if proxy not accessible or credentials not available
    test.skip(!proxyAccessible, 'OAuth proxy not accessible')
    test.skip(!TEST_USER || !TEST_PASSWORD, 'Test credentials not available')

    // Verify initially not authenticated
    await page.goto('/')
    await expect(page.locator('[data-testid="not-authenticated"]')).toBeVisible()

    // Perform login
    await performLogin(page, TEST_USER!, TEST_PASSWORD!)

    // Verify authenticated state
    await expect(page.locator('[data-testid="not-authenticated"]')).not.toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })
    await expect(page.locator('[data-testid="nav-users"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-logout"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-login"]')).not.toBeVisible()
  })

  test('can view users list after login', async ({ page }) => {
    // Skip if proxy not accessible or credentials not available
    test.skip(!proxyAccessible, 'OAuth proxy not accessible')
    test.skip(!TEST_USER || !TEST_PASSWORD, 'Test credentials not available')

    await performLogin(page, TEST_USER!, TEST_PASSWORD!)
    await expect(page.locator('[data-testid="nav-users"]')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    // Navigate to users page
    await page.click('[data-testid="nav-users"]')
    await page.waitForURL('/users')

    // Should see users table (not error state)
    await expect(page.locator('.users table')).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE })
    await expect(page.locator('.error')).not.toBeVisible()
  })

  test('can logout after login', async ({ page }) => {
    // Skip if proxy not accessible or credentials not available
    test.skip(!proxyAccessible, 'OAuth proxy not accessible')
    test.skip(!TEST_USER || !TEST_PASSWORD, 'Test credentials not available')

    await performLogin(page, TEST_USER!, TEST_PASSWORD!)
    await expect(page.locator('[data-testid="nav-logout"]')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    // Click logout
    await page.click('[data-testid="nav-logout"]')

    // Should show not authenticated
    await page.waitForURL('**/')
    await expect(page.locator('[data-testid="not-authenticated"]')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })
    await expect(page.locator('[data-testid="nav-login"]')).toBeVisible()
  })

  test('invalid password shows error on OAuth page', async ({ page }) => {
    // Skip if proxy not accessible or credentials not available
    test.skip(!proxyAccessible, 'OAuth proxy not accessible')
    test.skip(!TEST_USER, 'Test user not available')

    await page.goto('/')

    // Click login and wait for OAuth redirect
    await Promise.all([
      page.waitForURL(/.*eagleeyenetworks.com.*/, { timeout: TIMEOUTS.OAUTH_REDIRECT }),
      page.click('[data-testid="login-button"]')
    ])

    // Fill valid email
    const emailInput = page.locator('#authentication--input__email')
    await emailInput.waitFor({ state: 'visible', timeout: TIMEOUTS.ELEMENT_VISIBLE })
    await emailInput.fill(TEST_USER!)
    await page.getByRole('button', { name: 'Next' }).click()

    // Fill invalid password
    const passwordInput = page.locator('#authentication--input__password')
    await passwordInput.waitFor({ state: 'visible', timeout: TIMEOUTS.PASSWORD_VISIBLE })
    await passwordInput.fill('invalid-password-12345!')

    // Click sign in
    await page.locator('#next, button:has-text("Sign in")').first().click()

    // Should show error message on OAuth page
    await expect(
      page.locator('.error, [class*="error"], [data-testid*="error"], #error, .alert-danger').first()
    ).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    // Should still be on OAuth page
    await expect(page).toHaveURL(/eagleeyenetworks\.com/)
  })
})
