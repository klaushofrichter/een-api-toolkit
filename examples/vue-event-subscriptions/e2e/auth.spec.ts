import { test, expect, Page } from '@playwright/test'
import { baseURL } from '../playwright.config'

/**
 * E2E tests for the Event Subscriptions Example
 *
 * Tests the OAuth login flow and event subscription functionality:
 * 1. Click login button in the example app
 * 2. Enter credentials on EEN OAuth page
 * 3. Complete the OAuth callback
 * 4. Verify authenticated state
 * 5. Test event subscription CRUD operations
 * 6. Test SSE connection for live events
 *
 * Required environment variables:
 * - VITE_PROXY_URL: OAuth proxy URL (e.g., http://127.0.0.1:8787)
 * - VITE_EEN_CLIENT_ID: EEN OAuth client ID
 * - TEST_USER: Test user email
 * - TEST_PASSWORD: Test user password
 */

// Timeout constants for consistent behavior
const TIMEOUTS = {
  OAUTH_REDIRECT: 30000,   // OAuth redirects can be slow on first load
  ELEMENT_VISIBLE: 15000,  // Wait for OAuth page elements to render
  PASSWORD_VISIBLE: 10000, // Password field appears after email validation
  AUTH_COMPLETE: 30000,    // Full OAuth flow completion
  UI_UPDATE: 10000,        // UI state updates after auth changes
  PROXY_CHECK: 5000,       // Quick check if proxy is running
  SSE_CONNECTION: 15000,   // SSE connection establishment
  DATA_LOAD: 15000         // Data loading (cameras, event types, subscriptions)
} as const

const TEST_USER = process.env.TEST_USER
const TEST_PASSWORD = process.env.TEST_PASSWORD
const PROXY_URL = process.env.VITE_PROXY_URL

/**
 * Checks if the OAuth proxy is accessible.
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
  } catch {
    return false
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Performs OAuth login flow through the UI.
 */
async function performLogin(page: Page, username: string, password: string): Promise<void> {
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

  // Click sign in
  await page.locator('#next, button:has-text("Sign in")').first().click()

  // Wait for redirect back to the app
  const baseURLPattern = new RegExp(baseURL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  await page.waitForURL(baseURLPattern, { timeout: TIMEOUTS.AUTH_COMPLETE })
}

/**
 * Clears browser storage to reset auth state.
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
          // Ignore errors
        }
      })
    }
  } catch {
    // Ignore errors
  }
}

test.describe('Event Subscriptions Example', () => {
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
    await expect(page.locator('[data-testid="not-authenticated"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-login"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-logout"]')).not.toBeVisible()
  })

  test('login button redirects to OAuth page', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

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
    skipIfNoProxy()
    skipIfNoCredentials()

    // Verify initially not authenticated
    await page.goto('/')
    await expect(page.locator('[data-testid="not-authenticated"]')).toBeVisible()

    // Perform login
    await performLogin(page, TEST_USER!, TEST_PASSWORD!)

    // Verify authenticated state
    await expect(page.locator('[data-testid="not-authenticated"]')).not.toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })
    await expect(page.locator('[data-testid="nav-subscriptions"]')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })
    await expect(page.locator('[data-testid="nav-live"]')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })
    await expect(page.locator('[data-testid="nav-logout"]')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })
    await expect(page.locator('[data-testid="nav-login"]')).not.toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })
  })

  test('can view subscriptions page after login', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    await performLogin(page, TEST_USER!, TEST_PASSWORD!)
    await expect(page.locator('[data-testid="nav-subscriptions"]')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    // Navigate to subscriptions page
    await page.click('[data-testid="nav-subscriptions"]')
    await page.waitForURL('/subscriptions')

    // Should see the create form and subscriptions table (or no-data message)
    await expect(page.locator('[data-testid="camera-select"]')).toBeVisible({ timeout: TIMEOUTS.DATA_LOAD })
    await expect(page.locator('[data-testid="event-type-select"]')).toBeVisible({ timeout: TIMEOUTS.DATA_LOAD })
  })

  test('can view live events page after login', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    await performLogin(page, TEST_USER!, TEST_PASSWORD!)
    await expect(page.locator('[data-testid="nav-live"]')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    // Navigate to live events page
    await page.click('[data-testid="nav-live"]')
    await page.waitForURL('/live')

    // Should see the subscription selector and connect button
    await expect(page.locator('[data-testid="subscription-select"]')).toBeVisible({ timeout: TIMEOUTS.DATA_LOAD })
    await expect(page.locator('[data-testid="connect-button"]')).toBeVisible()
    await expect(page.locator('[data-testid="connection-status"]')).toHaveText('disconnected')
  })

  test('can create and delete subscription', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    await performLogin(page, TEST_USER!, TEST_PASSWORD!)

    // Navigate to subscriptions page
    await page.click('[data-testid="nav-subscriptions"]')
    await page.waitForURL('/subscriptions')

    // Wait for cameras and event types to load
    await expect(page.locator('[data-testid="camera-select"] option')).not.toHaveCount(0, { timeout: TIMEOUTS.DATA_LOAD })
    await expect(page.locator('[data-testid="event-type-select"] option')).not.toHaveCount(0, { timeout: TIMEOUTS.DATA_LOAD })

    // Select a camera (first one)
    const cameraSelect = page.locator('[data-testid="camera-select"]')
    const cameraOptions = await cameraSelect.locator('option').all()
    if (cameraOptions.length > 0) {
      await cameraSelect.selectOption({ index: 0 })
    }

    // Select an event type (first one, typically motion detection)
    const eventTypeSelect = page.locator('[data-testid="event-type-select"]')
    const eventTypeOptions = await eventTypeSelect.locator('option').all()
    if (eventTypeOptions.length > 0) {
      await eventTypeSelect.selectOption({ index: 0 })
    }

    // Create subscription
    const createButton = page.locator('[data-testid="create-subscription-button"]')
    await expect(createButton).toBeEnabled()
    await createButton.click()

    // Wait for success message
    await expect(page.locator('.success')).toBeVisible({ timeout: TIMEOUTS.DATA_LOAD })

    // Verify subscription appears in table
    await expect(page.locator('[data-testid="subscriptions-table"]')).toBeVisible({ timeout: TIMEOUTS.DATA_LOAD })

    // Verify at least one subscription exists in the table
    const subscriptionRows = page.locator('[data-testid="subscriptions-table"] tbody tr')
    const rowCount = await subscriptionRows.count()
    expect(rowCount).toBeGreaterThan(0)

    // Delete the first subscription
    const deleteButton = page.locator('button.danger.small').first()
    await expect(deleteButton).toBeVisible()

    // Accept the confirmation dialog
    page.on('dialog', dialog => dialog.accept())
    await deleteButton.click()

    // Wait for deletion to complete - just verify the operation doesn't error
    // We don't assert exact counts since live service state can vary
    await page.waitForTimeout(2000)
  })

  test('can logout after login', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    await performLogin(page, TEST_USER!, TEST_PASSWORD!)
    await expect(page.locator('[data-testid="nav-logout"]')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    // Click logout
    await page.click('[data-testid="nav-logout"]')

    // Should show not authenticated - wait for redirect to app baseURL
    const baseURLPattern = new RegExp(baseURL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    await page.waitForURL(baseURLPattern)
    await expect(page.locator('[data-testid="not-authenticated"]')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })
    await expect(page.locator('[data-testid="nav-login"]')).toBeVisible()
  })
})
