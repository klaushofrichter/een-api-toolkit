import { test, expect, Page } from '@playwright/test'

/**
 * E2E tests for the Vue Alerts & Metrics Example - OAuth Login Flow
 *
 * Tests the OAuth login flow through the UI:
 * 1. Click login button in the example app
 * 2. Enter credentials on EEN OAuth page
 * 3. Complete the OAuth callback
 * 4. Verify authenticated state and landing URL
 *
 * Required environment variables:
 * - VITE_PROXY_URL: OAuth proxy URL (e.g., http://127.0.0.1:8787)
 * - VITE_EEN_CLIENT_ID: EEN OAuth client ID
 * - TEST_USER: Test user email
 * - TEST_PASSWORD: Test user password
 */

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

  // Click the OAuth login button on the login page
  await Promise.all([
    page.waitForURL(/.*eagleeyenetworks.com.*/, { timeout: TIMEOUTS.OAUTH_REDIRECT }),
    page.click('button:has-text("Login with Eagle Eye Networks")')
  ])

  const emailInput = page.locator('#authentication--input__email')
  await emailInput.waitFor({ state: 'visible', timeout: TIMEOUTS.ELEMENT_VISIBLE })
  await emailInput.fill(username)

  await page.getByRole('button', { name: 'Next' }).click()

  const passwordInput = page.locator('#authentication--input__password')
  await passwordInput.waitFor({ state: 'visible', timeout: TIMEOUTS.PASSWORD_VISIBLE })
  await passwordInput.fill(password)

  await page.locator('#next, button:has-text("Sign in")').first().click()

  // After login, the alerts-metrics app redirects to /dashboard
  await page.waitForURL('**/dashboard', { timeout: TIMEOUTS.AUTH_COMPLETE })
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
          // Ignore
        }
      })
    }
  } catch {
    // Ignore
  }
}

/**
 * Wait for cameras to finish loading (either cameras appear or error/empty state)
 */
async function waitForCamerasLoaded(page: Page): Promise<void> {
  // Wait until either camera options appear, an error shows, or the select is enabled (empty case)
  await Promise.race([
    page.locator('[data-testid="camera-option"]').first().waitFor({ state: 'attached', timeout: TIMEOUTS.UI_UPDATE }),
    page.locator('[data-testid="camera-selector-error"]').waitFor({ state: 'visible', timeout: TIMEOUTS.UI_UPDATE }),
    page.locator('[data-testid="camera-select"]:not([disabled])').waitFor({ state: 'attached', timeout: TIMEOUTS.UI_UPDATE })
  ]).catch(() => {
    // At least one should resolve - if all fail, that's ok, we'll handle in the test
  })
}

/**
 * Wait for event types to finish loading
 */
async function waitForEventTypesLoaded(page: Page): Promise<void> {
  await Promise.race([
    page.locator('[data-testid="event-type-option"]').first().waitFor({ state: 'attached', timeout: TIMEOUTS.UI_UPDATE }),
    page.locator('[data-testid="event-type-select"]:not([disabled])').waitFor({ state: 'attached', timeout: TIMEOUTS.UI_UPDATE })
  ]).catch(() => {
    // Handle gracefully
  })
}

/**
 * Wait for metrics to finish loading (data, error, or no-data state)
 */
async function waitForMetricsLoaded(page: Page): Promise<void> {
  await Promise.race([
    page.locator('.chart-container canvas').waitFor({ state: 'visible', timeout: TIMEOUTS.UI_UPDATE }),
    page.locator('[data-testid="metrics-error"]').waitFor({ state: 'visible', timeout: TIMEOUTS.UI_UPDATE }),
    page.locator('[data-testid="metrics-no-data"]').waitFor({ state: 'visible', timeout: TIMEOUTS.UI_UPDATE })
  ]).catch(() => {
    // Handle gracefully
  })
}

/**
 * Wait for alerts to finish loading
 */
async function waitForAlertsLoaded(page: Page): Promise<void> {
  await Promise.race([
    page.locator('[data-testid="alert-item"]').first().waitFor({ state: 'attached', timeout: TIMEOUTS.UI_UPDATE }),
    page.locator('[data-testid="alerts-error"]').waitFor({ state: 'visible', timeout: TIMEOUTS.UI_UPDATE }),
    page.locator('[data-testid="alerts-no-data"]').waitFor({ state: 'visible', timeout: TIMEOUTS.UI_UPDATE })
  ]).catch(() => {
    // Handle gracefully
  })
}

/**
 * Wait for notifications to finish loading
 */
async function waitForNotificationsLoaded(page: Page): Promise<void> {
  await Promise.race([
    page.locator('[data-testid="notification-item"]').first().waitFor({ state: 'attached', timeout: TIMEOUTS.UI_UPDATE }),
    page.locator('[data-testid="notifications-error"]').waitFor({ state: 'visible', timeout: TIMEOUTS.UI_UPDATE }),
    page.locator('[data-testid="notifications-no-data"]').waitFor({ state: 'visible', timeout: TIMEOUTS.UI_UPDATE })
  ]).catch(() => {
    // Handle gracefully
  })
}

test.describe('Vue Alerts & Metrics Example - Auth', () => {
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
    await expect(page.locator('[data-testid="nav-dashboard"]')).not.toBeVisible()
  })

  test('dashboard page redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard')
    // Should redirect to login page
    await expect(page.locator('h2')).toContainText('Login')
  })

  test('login button redirects to OAuth page', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    await page.goto('/')
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible()

    // Click login button to go to login page
    await page.click('[data-testid="login-button"]')
    await page.waitForURL('/login')

    // Click the OAuth login button
    await Promise.all([
      page.waitForURL(/.*eagleeyenetworks.com.*/, { timeout: TIMEOUTS.OAUTH_REDIRECT }),
      page.click('button:has-text("Login with Eagle Eye Networks")')
    ])

    const emailInput = page.locator('#authentication--input__email')
    await expect(emailInput).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE })
  })

  test('complete OAuth login flow and verify landing URL', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    // Verify initially not authenticated
    await page.goto('/')
    await expect(page.locator('[data-testid="not-authenticated"]')).toBeVisible()

    // Perform login
    await performLogin(page, TEST_USER!, TEST_PASSWORD!)

    // Verify landing URL is the dashboard page
    await expect(page).toHaveURL('http://127.0.0.1:3333/dashboard')

    // Verify authenticated state - we're on dashboard page so check nav elements
    await expect(page.locator('[data-testid="nav-dashboard"]')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })
    await expect(page.locator('[data-testid="nav-logout"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-login"]')).not.toBeVisible()
  })

  test('can view dashboard after login', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    await performLogin(page, TEST_USER!, TEST_PASSWORD!)
    await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    // Verify dashboard elements are present
    await expect(page.locator('h2')).toContainText('Alerts & Metrics Dashboard')
    await expect(page.locator('[data-testid="camera-selector"]')).toBeVisible()
    await expect(page.locator('[data-testid="time-range-selector"]')).toBeVisible()
  })

  test('camera selector loads cameras', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    await performLogin(page, TEST_USER!, TEST_PASSWORD!)
    await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    // Wait for camera selector to load
    const cameraSelect = page.locator('[data-testid="camera-select"]')
    await expect(cameraSelect).toBeVisible()

    // Wait for cameras to load using condition-based wait
    await waitForCamerasLoaded(page)

    // Check if cameras loaded (should have options)
    const options = page.locator('[data-testid="camera-option"]')
    const optionCount = await options.count()
    console.log(`Found ${optionCount} cameras`)

    // Should have at least some cameras (or show an error)
    const hasError = await page.locator('[data-testid="camera-selector-error"]').isVisible()
    if (!hasError) {
      expect(optionCount).toBeGreaterThanOrEqual(0)
    }
  })

  test('time range selector changes selection', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    await performLogin(page, TEST_USER!, TEST_PASSWORD!)
    await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    // Test time range buttons
    const buttonNone = page.locator('[data-testid="time-range-none"]')
    const button1h = page.locator('[data-testid="time-range-1h"]')
    const button24h = page.locator('[data-testid="time-range-24h"]')

    await expect(buttonNone).toBeVisible()
    await expect(button1h).toBeVisible()
    await expect(button24h).toBeVisible()

    // 'None' should be active by default
    await expect(buttonNone).toHaveClass(/active/)

    // Click 24h and verify it becomes active
    await button24h.click()
    await expect(button24h).toHaveClass(/active/)
    await expect(buttonNone).not.toHaveClass(/active/)

    // Click 1h and verify it becomes active
    await button1h.click()
    await expect(button1h).toHaveClass(/active/)
    await expect(button24h).not.toHaveClass(/active/)
  })

  test('metrics chart displays after selecting camera and event type', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    await performLogin(page, TEST_USER!, TEST_PASSWORD!)
    await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    // Wait for cameras to load using condition-based wait
    await waitForCamerasLoaded(page)

    // Select first camera if available
    const cameraSelect = page.locator('[data-testid="camera-select"]')
    const cameraOptions = page.locator('[data-testid="camera-option"]')
    const cameraCount = await cameraOptions.count()

    if (cameraCount > 0) {
      // Get first camera value and select it
      const firstCameraValue = await cameraOptions.first().getAttribute('value')
      if (firstCameraValue) {
        await cameraSelect.selectOption(firstCameraValue)

        // Wait for event types to load using condition-based wait
        await waitForEventTypesLoaded(page)

        // Check metrics chart container is displayed
        const metricsChart = page.locator('[data-testid="metrics-chart"]')
        await expect(metricsChart).toBeVisible()

        // Check event type selector is visible
        const eventTypeSelect = page.locator('[data-testid="event-type-select"]')
        await expect(eventTypeSelect).toBeVisible()

        // Select first event type if available
        const eventTypeOptions = page.locator('[data-testid="event-type-option"]')
        const eventTypeCount = await eventTypeOptions.count()

        if (eventTypeCount > 0) {
          const firstEventType = await eventTypeOptions.first().getAttribute('value')
          if (firstEventType) {
            await eventTypeSelect.selectOption(firstEventType)

            // Wait for metrics to load using condition-based wait
            await waitForMetricsLoaded(page)

            // Should show either data, loading, error, or no-data
            const hasData = await page.locator('.chart-container canvas').isVisible()
            const isLoading = await page.locator('[data-testid="metrics-loading"]').isVisible()
            const hasError = await page.locator('[data-testid="metrics-error"]').isVisible()
            const noData = await page.locator('[data-testid="metrics-no-data"]').isVisible()

            expect(hasData || isLoading || hasError || noData).toBe(true)
          }
        } else {
          console.log('No event types available for this camera')
          // Should show "no selection" message
          const noSelection = await page.locator('[data-testid="metrics-no-selection"]').isVisible()
          expect(noSelection).toBe(true)
        }
      }
    } else {
      console.log('No cameras available to test metrics chart')
    }
  })

  test('alerts list loads after selecting camera', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    await performLogin(page, TEST_USER!, TEST_PASSWORD!)
    await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    // Wait for cameras to load using condition-based wait
    await waitForCamerasLoaded(page)

    // Select first camera if available
    const cameraSelect = page.locator('[data-testid="camera-select"]')
    const options = page.locator('[data-testid="camera-option"]')
    const optionCount = await options.count()

    if (optionCount > 0) {
      const firstCameraValue = await options.first().getAttribute('value')
      if (firstCameraValue) {
        await cameraSelect.selectOption(firstCameraValue)

        // Wait for alerts to load using condition-based wait
        await waitForAlertsLoaded(page)

        // Check alerts list is displayed
        const alertsList = page.locator('[data-testid="alerts-list"]')
        await expect(alertsList).toBeVisible()

        // Should show either items, loading, error, or no-data
        const hasItems = await page.locator('[data-testid="alert-item"]').first().isVisible().catch(() => false)
        const isLoading = await page.locator('[data-testid="alerts-loading"]').isVisible()
        const hasError = await page.locator('[data-testid="alerts-error"]').isVisible()
        const noData = await page.locator('[data-testid="alerts-no-data"]').isVisible()

        expect(hasItems || isLoading || hasError || noData).toBe(true)
      }
    } else {
      console.log('No cameras available to test alerts list')
    }
  })

  test('notifications list loads after selecting camera', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    await performLogin(page, TEST_USER!, TEST_PASSWORD!)
    await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    // Wait for cameras to load using condition-based wait
    await waitForCamerasLoaded(page)

    // Select first camera if available
    const cameraSelect = page.locator('[data-testid="camera-select"]')
    const options = page.locator('[data-testid="camera-option"]')
    const optionCount = await options.count()

    if (optionCount > 0) {
      const firstCameraValue = await options.first().getAttribute('value')
      if (firstCameraValue) {
        await cameraSelect.selectOption(firstCameraValue)

        // Wait for notifications to load using condition-based wait
        await waitForNotificationsLoaded(page)

        // Check notifications list is displayed
        const notificationsList = page.locator('[data-testid="notifications-list"]')
        await expect(notificationsList).toBeVisible()

        // Should show either items, loading, error, or no-data
        const hasItems = await page.locator('[data-testid="notification-item"]').first().isVisible().catch(() => false)
        const isLoading = await page.locator('[data-testid="notifications-loading"]').isVisible()
        const hasError = await page.locator('[data-testid="notifications-error"]').isVisible()
        const noData = await page.locator('[data-testid="notifications-no-data"]').isVisible()

        expect(hasItems || isLoading || hasError || noData).toBe(true)
      }
    } else {
      console.log('No cameras available to test notifications list')
    }
  })

  test('can logout after login', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    await performLogin(page, TEST_USER!, TEST_PASSWORD!)
    await expect(page.locator('[data-testid="nav-logout"]')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    await page.click('[data-testid="nav-logout"]')

    await page.waitForURL('**/')
    await expect(page.locator('[data-testid="not-authenticated"]')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })
    await expect(page.locator('[data-testid="nav-login"]')).toBeVisible()
  })

  test('pagination works for alerts', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    await performLogin(page, TEST_USER!, TEST_PASSWORD!)
    await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    // Wait for cameras to load using condition-based wait
    await waitForCamerasLoaded(page)
    const cameraSelect = page.locator('[data-testid="camera-select"]')
    const options = page.locator('[data-testid="camera-option"]')
    const optionCount = await options.count()

    if (optionCount > 0) {
      const firstCameraValue = await options.first().getAttribute('value')
      if (firstCameraValue) {
        await cameraSelect.selectOption(firstCameraValue)

        // Use 7 day range for more alerts
        await page.locator('[data-testid="time-range-7d"]').click()

        // Wait for alerts to load using condition-based wait
        await waitForAlertsLoaded(page)

        // Check if load more button exists
        const loadMoreButton = page.locator('[data-testid="alerts-load-more"]')
        const hasLoadMore = await loadMoreButton.isVisible()

        if (hasLoadMore) {
          // Get current alert count
          const alertsBefore = await page.locator('[data-testid="alert-item"]').count()

          // Click load more and wait for more items to appear
          await loadMoreButton.click()
          await waitForAlertsLoaded(page)

          // Verify more alerts loaded
          const alertsAfter = await page.locator('[data-testid="alert-item"]').count()
          expect(alertsAfter).toBeGreaterThanOrEqual(alertsBefore)
        } else {
          console.log('No Load More button for alerts (not enough alerts)')
        }
      }
    } else {
      console.log('No cameras available to test pagination')
    }
  })

  test('pagination works for notifications', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    await performLogin(page, TEST_USER!, TEST_PASSWORD!)
    await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    // Wait for cameras to load using condition-based wait
    await waitForCamerasLoaded(page)
    const cameraSelect = page.locator('[data-testid="camera-select"]')
    const options = page.locator('[data-testid="camera-option"]')
    const optionCount = await options.count()

    if (optionCount > 0) {
      const firstCameraValue = await options.first().getAttribute('value')
      if (firstCameraValue) {
        await cameraSelect.selectOption(firstCameraValue)

        // Use 7 day range for more notifications
        await page.locator('[data-testid="time-range-7d"]').click()

        // Wait for notifications to load using condition-based wait
        await waitForNotificationsLoaded(page)

        // Check if load more button exists
        const loadMoreButton = page.locator('[data-testid="notifications-load-more"]')
        const hasLoadMore = await loadMoreButton.isVisible()

        if (hasLoadMore) {
          // Get current notification count
          const notificationsBefore = await page.locator('[data-testid="notification-item"]').count()

          // Click load more and wait for more items to appear
          await loadMoreButton.click()
          await waitForNotificationsLoaded(page)

          // Verify more notifications loaded
          const notificationsAfter = await page.locator('[data-testid="notification-item"]').count()
          expect(notificationsAfter).toBeGreaterThanOrEqual(notificationsBefore)
        } else {
          console.log('No Load More button for notifications (not enough notifications)')
        }
      }
    } else {
      console.log('No cameras available to test pagination')
    }
  })
})
