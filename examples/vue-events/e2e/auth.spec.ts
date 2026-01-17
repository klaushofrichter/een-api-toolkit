import { test, expect, Page } from '@playwright/test'

/**
 * E2E tests for the Vue Events Example - OAuth Login Flow
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

  // After login, the events app redirects to /cameras
  await page.waitForURL('**/cameras', { timeout: TIMEOUTS.AUTH_COMPLETE })
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

test.describe('Vue Events Example - Auth', () => {
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
    await expect(page.locator('[data-testid="nav-cameras"]')).not.toBeVisible()
  })

  test('cameras page redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/cameras')
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

    // Verify landing URL is the cameras page (vue-events app redirects to /cameras after login)
    await expect(page).toHaveURL('http://127.0.0.1:3333/cameras')

    // Verify authenticated state - we're on cameras page so check nav elements
    await expect(page.locator('[data-testid="nav-cameras"]')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })
    await expect(page.locator('[data-testid="nav-logout"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-login"]')).not.toBeVisible()
  })

  test('can view cameras list after login', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    await performLogin(page, TEST_USER!, TEST_PASSWORD!)
    await expect(page.locator('[data-testid="nav-cameras"]')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    // Navigate to cameras page
    await page.click('[data-testid="nav-cameras"]')
    await page.waitForURL('/cameras')

    // Verify landing URL is cameras page
    await expect(page).toHaveURL('http://127.0.0.1:3333/cameras')

    // Should see cameras grid or hint text (not error state)
    await expect(page.locator('.camera-grid, .no-cameras, .hint')).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE })
    await expect(page.locator('.error')).not.toBeVisible()
  })

  test('can open events modal for a camera after login', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    await performLogin(page, TEST_USER!, TEST_PASSWORD!)

    // Wait for cameras to load
    await expect(page.locator('.camera-grid, .no-cameras')).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE })

    // If there are cameras, click on one to open events modal
    const cameraCards = page.locator('.camera-card')
    const cameraCount = await cameraCards.count()

    if (cameraCount > 0) {
      // Click on first camera
      await cameraCards.first().click()

      // Wait for modal to appear
      await expect(page.locator('.modal')).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE })

      // Verify modal header shows camera name
      await expect(page.locator('.modal-header h2')).toContainText('Events:')

      // Verify filters are present
      await expect(page.locator('.modal-filters')).toBeVisible()

      // Close modal
      await page.locator('.close-button').click()
      await expect(page.locator('.modal')).not.toBeVisible()
    } else {
      console.log('No cameras available to test events modal')
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

  test('shows events for online camera with 24h time range', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    await performLogin(page, TEST_USER!, TEST_PASSWORD!)

    // Wait for cameras to load
    await expect(page.locator('.camera-grid, .no-cameras')).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE })

    // Find an online camera (has 'status-online' class)
    const onlineCameras = page.locator('.camera-card:has(.status-online)')
    const onlineCount = await onlineCameras.count()
    console.log(`Found ${onlineCount} online cameras`)

    let selectedOnlineCamera = false
    if (onlineCount === 0) {
      // Fall back to any camera if no online cameras
      const allCameras = page.locator('.camera-card')
      const anyCount = await allCameras.count()
      if (anyCount === 0) {
        console.log('No cameras available to test events')
        return
      }
      console.log('No online cameras, using first available camera')
      await allCameras.first().click()
    } else {
      // Click on first online camera
      selectedOnlineCamera = true
      console.log('Clicking on first online camera')
      await onlineCameras.first().click()
    }

    // Wait for modal to appear
    await expect(page.locator('.modal')).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE })

    // Wait for event types to load (modal filters should be visible)
    await expect(page.locator('[data-testid="modal-filters"]')).toBeVisible()

    // Select 24h time range
    const timeRangeSelect = page.locator('[data-testid="time-range-select"]')
    await expect(timeRangeSelect).toBeVisible()
    await timeRangeSelect.selectOption('24h')
    console.log('Selected 24h time range')

    // Wait for events to load - should see either events-list or no-events
    // Give it more time to fetch from the API
    await page.waitForTimeout(3000)

    // Check for events list or loading state to clear
    const eventsListOrNoEvents = page.locator('[data-testid="events-list"], [data-testid="no-events"]')
    await expect(eventsListOrNoEvents).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE })

    // Verify events are displayed (with 24h range, there should be events for an active camera)
    const eventsList = page.locator('[data-testid="events-list"]')
    const eventsVisible = await eventsList.isVisible()

    if (eventsVisible) {
      // Verify at least one event is displayed
      const eventItems = page.locator('[data-testid="event-item"]')
      const eventCount = await eventItems.count()
      console.log(`Found ${eventCount} events displayed in the modal`)
      expect(eventCount).toBeGreaterThan(0)

      // Verify event item structure
      const firstEvent = eventItems.first()
      await expect(firstEvent.locator('.event-type')).toBeVisible()
      await expect(firstEvent.locator('.event-time')).toBeVisible()

      // Wait for images to load (they load asynchronously)
      await page.waitForTimeout(3000)

      // Verify at least some event thumbnails have images
      const thumbnailImages = page.locator('.event-thumbnail img')
      const imageCount = await thumbnailImages.count()
      console.log(`Found ${imageCount} event thumbnail images loaded`)
      expect(imageCount).toBeGreaterThan(0)
    } else {
      // No events found
      console.log('No events found for this camera in the last 24 hours')
      await expect(page.locator('[data-testid="no-events"]')).toBeVisible()

      // If we selected an online camera, this is unexpected - fail the test
      if (selectedOnlineCamera) {
        throw new Error('Expected events for online camera with 24h time range, but none were found')
      }
    }

    // Close modal
    await page.locator('.close-button').click()
    await expect(page.locator('.modal')).not.toBeVisible()
  })
})
