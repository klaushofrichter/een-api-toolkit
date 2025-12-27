import { test, expect, Page } from '@playwright/test'

/**
 * Authenticated E2E tests for the Vue Basic Example
 *
 * These tests perform the actual OAuth login flow through the UI:
 * 1. Click login button in the example app
 * 2. Enter credentials on EEN OAuth page
 * 3. Complete the OAuth callback
 * 4. Verify authenticated state
 *
 * Required environment variables:
 * - VITE_PROXY_URL: OAuth proxy URL
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
  UI_UPDATE: 10000
} as const

/**
 * Performs OAuth login flow through the UI
 * @param page - Playwright page object
 * @param username - Test user email
 * @param password - Test user password
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

test.describe('Vue Basic Example - Authenticated', () => {
  const TEST_USER = process.env.TEST_USER
  const TEST_PASSWORD = process.env.TEST_PASSWORD

  test.beforeEach(async () => {
    // Skip all tests if credentials are not available
    if (!TEST_USER || !TEST_PASSWORD) {
      test.skip()
    }
  })

  // Note: Playwright automatically handles context cleanup between tests,
  // so no afterAll hook is needed for auth state cleanup

  test('complete OAuth login flow shows authenticated state', async ({ page }) => {
    // Verify initially not authenticated
    await page.goto('/')
    await expect(page.locator('[data-testid="not-authenticated"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-login"]')).toBeVisible()

    // Perform login using helper
    await performLogin(page, TEST_USER!, TEST_PASSWORD!)

    // Verify authenticated state - should see user info
    await expect(page.locator('[data-testid="not-authenticated"]')).not.toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    // Should see navigation links for authenticated users
    await expect(page.locator('[data-testid="nav-users"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-logout"]')).toBeVisible()

    // Login link should not be visible
    await expect(page.locator('[data-testid="nav-login"]')).not.toBeVisible()
  })

  test('authenticated user can view users list', async ({ page }) => {
    await performLogin(page, TEST_USER!, TEST_PASSWORD!)
    await expect(page.locator('[data-testid="nav-users"]')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    // Navigate to users page
    await page.click('[data-testid="nav-users"]')
    await page.waitForURL('/users')

    // Should see users list (not error state)
    await expect(page.locator('.users-list')).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE })
    await expect(page.locator('.error')).not.toBeVisible()
  })

  test('authenticated user can logout', async ({ page }) => {
    await performLogin(page, TEST_USER!, TEST_PASSWORD!)
    await expect(page.locator('[data-testid="nav-logout"]')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    // Click logout
    await page.click('[data-testid="nav-logout"]')

    // Should redirect back to home and show not authenticated
    await page.waitForURL('**/')
    await expect(page.locator('[data-testid="not-authenticated"]')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })
    await expect(page.locator('[data-testid="nav-login"]')).toBeVisible()
  })
})

test.describe('Vue Basic Example - Negative Auth Tests', () => {
  test('login button shows when not authenticated', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-testid="not-authenticated"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-login"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-logout"]')).not.toBeVisible()
  })

  test('users page redirects or shows error when not authenticated', async ({ page }) => {
    // Try to access users page directly without auth
    await page.goto('/users')

    // Should either redirect to login or show an error/not-authenticated message
    await expect(
      page.locator('[data-testid="not-authenticated"], [data-testid="nav-login"], .error, .auth-required').first()
    ).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })
  })

  test('login button initiates OAuth redirect', async ({ page }) => {
    // Verify login button works and redirects to OAuth provider
    await page.goto('/')
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible()
    await expect(page.locator('[data-testid="login-button"]')).toBeEnabled()

    // Click login and verify redirect to OAuth page
    await Promise.all([
      page.waitForURL(/.*eagleeyenetworks.com.*/, { timeout: TIMEOUTS.OAUTH_REDIRECT }),
      page.click('[data-testid="login-button"]')
    ])

    // Verify we're on the OAuth page by checking for email input
    const emailInput = page.locator('#authentication--input__email')
    await expect(emailInput).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE })
  })
})

test.describe('Vue Basic Example - Failed Login', () => {
  const TEST_USER = process.env.TEST_USER

  test.beforeEach(async () => {
    // Skip if no test user (we need a valid email format)
    if (!TEST_USER) {
      test.skip()
    }
  })

  test('invalid password shows error on OAuth page', async ({ page }) => {
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

    // Should show error message on OAuth page (not redirect to app)
    // The OAuth page should display an error for invalid credentials
    await expect(
      page.locator('.error, [class*="error"], [data-testid*="error"], #error, .alert-danger').first()
    ).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    // Should still be on OAuth page, not redirected to app
    await expect(page).not.toHaveURL(/127\.0\.0\.1/)
  })
})
