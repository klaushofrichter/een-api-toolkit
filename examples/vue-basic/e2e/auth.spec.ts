import { test, expect } from '@playwright/test'

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
test.describe('Vue Basic Example - Authenticated', () => {
  const TEST_USER = process.env.TEST_USER
  const TEST_PASSWORD = process.env.TEST_PASSWORD

  test.beforeEach(async () => {
    // Skip all tests if credentials are not available
    if (!TEST_USER || !TEST_PASSWORD) {
      test.skip()
    }
  })

  test('complete OAuth login flow shows authenticated state', async ({ page }) => {
    // Start at home page
    await page.goto('/')

    // Verify initially not authenticated
    await expect(page.locator('[data-testid="not-authenticated"]')).toBeVisible()

    // Navigate to login page first
    await page.click('[data-testid="nav-login"]')
    await page.waitForURL('/login')

    // Click login button to start OAuth flow
    // Use Promise.all to handle navigation
    await Promise.all([
      page.waitForURL(/.*eagleeyenetworks.com.*/, { timeout: 30000 }),
      page.click('[data-testid="login-button"]')
    ])

    // Fill email
    const emailInput = page.locator('#authentication--input__email')
    await emailInput.waitFor({ state: 'visible', timeout: 15000 })
    await emailInput.fill(TEST_USER!)

    // Click next
    await page.getByRole('button', { name: 'Next' }).click()

    // Fill password
    const passwordInput = page.locator('#authentication--input__password')
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 })
    await passwordInput.fill(TEST_PASSWORD!)

    // Click sign in
    try {
      await page.locator('#next').click()
    } catch {
      await page.getByRole('button', { name: 'Sign in' }).click()
    }

    // Wait for redirect back to app (callback will be handled by the app)
    await page.waitForURL(/127\.0\.0\.1:3333/, { timeout: 30000 })

    // Wait for authentication to complete (callback processing)
    // The app should redirect to home page after successful auth
    await page.waitForURL('http://127.0.0.1:3333/', { timeout: 15000 })

    // Verify authenticated state - should see user info
    await expect(page.locator('[data-testid="not-authenticated"]')).not.toBeVisible({ timeout: 10000 })

    // Should see navigation links for authenticated users
    await expect(page.locator('[data-testid="nav-users"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-logout"]')).toBeVisible()

    // Login link should not be visible
    await expect(page.locator('[data-testid="nav-login"]')).not.toBeVisible()
  })

  test('authenticated user can view users list', async ({ page }) => {
    // Start at home page
    await page.goto('/')

    // Click login button
    await page.click('[data-testid="login-button"]')

    // Complete OAuth flow
    await page.waitForURL(/.*eagleeyenetworks.com.*/, { timeout: 15000 })

    const emailInput = page.locator('#authentication--input__email')
    await emailInput.waitFor({ state: 'visible', timeout: 15000 })
    await emailInput.fill(TEST_USER!)
    await page.getByRole('button', { name: 'Next' }).click()

    const passwordInput = page.locator('#authentication--input__password')
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 })
    await passwordInput.fill(TEST_PASSWORD!)

    try {
      await page.locator('#next').click()
    } catch {
      await page.getByRole('button', { name: 'Sign in' }).click()
    }

    // Wait for auth to complete
    await page.waitForURL('http://127.0.0.1:3333/', { timeout: 30000 })
    await expect(page.locator('[data-testid="nav-users"]')).toBeVisible({ timeout: 10000 })

    // Navigate to users page
    await page.click('[data-testid="nav-users"]')
    await page.waitForURL('/users')

    // Should see users list or loading state
    // Wait for either users to load or an error message
    await expect(
      page.locator('.users-list, .loading, .error').first()
    ).toBeVisible({ timeout: 15000 })
  })

  test('authenticated user can logout', async ({ page }) => {
    // Start at home page and login
    await page.goto('/')
    await page.click('[data-testid="login-button"]')

    // Complete OAuth flow
    await page.waitForURL(/.*eagleeyenetworks.com.*/, { timeout: 15000 })

    const emailInput = page.locator('#authentication--input__email')
    await emailInput.waitFor({ state: 'visible', timeout: 15000 })
    await emailInput.fill(TEST_USER!)
    await page.getByRole('button', { name: 'Next' }).click()

    const passwordInput = page.locator('#authentication--input__password')
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 })
    await passwordInput.fill(TEST_PASSWORD!)

    try {
      await page.locator('#next').click()
    } catch {
      await page.getByRole('button', { name: 'Sign in' }).click()
    }

    // Wait for auth to complete
    await page.waitForURL('http://127.0.0.1:3333/', { timeout: 30000 })
    await expect(page.locator('[data-testid="nav-logout"]')).toBeVisible({ timeout: 10000 })

    // Click logout
    await page.click('[data-testid="nav-logout"]')

    // Should redirect back to home and show not authenticated
    await page.waitForURL('http://127.0.0.1:3333/')
    await expect(page.locator('[data-testid="not-authenticated"]')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('[data-testid="nav-login"]')).toBeVisible()
  })
})
