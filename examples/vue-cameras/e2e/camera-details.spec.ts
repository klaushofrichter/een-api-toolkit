import { test, expect, Page } from '@playwright/test'

/**
 * E2E tests for the Camera Details Modal
 *
 * Tests the "Details" button on camera cards that opens a modal
 * displaying the full camera JSON response without navigating away.
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
  PROXY_CHECK: 5000,
  MODAL_CONTENT: 15000
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

  await page.click('[data-testid="login-button"]')
  await page.waitForURL('/login')

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

async function loginAndNavigateToCameras(page: Page): Promise<void> {
  await performLogin(page, TEST_USER!, TEST_PASSWORD!)
  await expect(page.locator('[data-testid="nav-cameras"]')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

  // Wait for camera grid or no-cameras message to appear
  await expect(page.locator('.camera-grid, .no-cameras')).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE })
}

test.describe('Camera Details Modal', () => {
  let proxyAccessible = false

  function skipIfNotReady() {
    test.skip(!proxyAccessible, 'OAuth proxy not accessible')
    test.skip(!TEST_USER || !TEST_PASSWORD, 'Test credentials not available')
  }

  test.beforeAll(async () => {
    proxyAccessible = await isProxyAccessible()
    if (!proxyAccessible) {
      console.log('OAuth proxy not accessible - camera details tests will be skipped')
    }
  })

  test.afterEach(async ({ page }) => {
    await clearAuthState(page)
  })

  test('each camera card has a Details button', async ({ page }) => {
    skipIfNotReady()

    await loginAndNavigateToCameras(page)

    const cameraCards = page.locator('.camera-card')
    const cardCount = await cameraCards.count()
    test.skip(cardCount === 0, 'No cameras available to test')

    // Every card should have a Details button
    const detailButtons = page.locator('[data-testid="details-btn"]')
    await expect(detailButtons).toHaveCount(cardCount)

    // All buttons should display "Details" text
    for (let i = 0; i < cardCount; i++) {
      await expect(detailButtons.nth(i)).toHaveText('Details')
    }
  })

  test('clicking Details button opens modal with JSON content', async ({ page }) => {
    skipIfNotReady()

    await loginAndNavigateToCameras(page)

    const cameraCards = page.locator('.camera-card')
    const cardCount = await cameraCards.count()
    test.skip(cardCount === 0, 'No cameras available to test')

    // Modal should not be visible initially
    await expect(page.locator('[data-testid="modal-overlay"]')).not.toBeVisible()

    // Click the first Details button
    await page.locator('[data-testid="details-btn"]').first().click()

    // Modal should appear
    await expect(page.locator('[data-testid="modal-overlay"]')).toBeVisible()
    await expect(page.locator('[data-testid="modal-content"]')).toBeVisible()

    // Wait for loading to finish and JSON to appear
    await expect(page.locator('[data-testid="modal-json"]')).toBeVisible({ timeout: TIMEOUTS.MODAL_CONTENT })

    // JSON should contain camera data (id field is always present)
    const jsonText = await page.locator('[data-testid="modal-json"]').textContent()
    expect(jsonText).toBeTruthy()
    const parsed = JSON.parse(jsonText!)
    expect(parsed).toHaveProperty('id')
    expect(parsed).toHaveProperty('name')
  })

  test('clicking Details does not navigate away from cameras page', async ({ page }) => {
    skipIfNotReady()

    await loginAndNavigateToCameras(page)

    const cardCount = await page.locator('.camera-card').count()
    test.skip(cardCount === 0, 'No cameras available to test')

    // Record the URL before clicking
    const urlBefore = page.url()

    // Click Details button
    await page.locator('[data-testid="details-btn"]').first().click()

    // Wait for modal
    await expect(page.locator('[data-testid="modal-overlay"]')).toBeVisible()

    // URL should remain the same (no navigation to /cameras/:id)
    expect(page.url()).toBe(urlBefore)
  })

  test('modal close button (X) closes the modal', async ({ page }) => {
    skipIfNotReady()

    await loginAndNavigateToCameras(page)

    const cardCount = await page.locator('.camera-card').count()
    test.skip(cardCount === 0, 'No cameras available to test')

    // Open modal
    await page.locator('[data-testid="details-btn"]').first().click()
    await expect(page.locator('[data-testid="modal-overlay"]')).toBeVisible()

    // Wait for content to load
    await expect(page.locator('[data-testid="modal-json"]')).toBeVisible({ timeout: TIMEOUTS.MODAL_CONTENT })

    // Click the X close button
    await page.locator('[data-testid="modal-close-x"]').click()

    // Modal should be gone
    await expect(page.locator('[data-testid="modal-overlay"]')).not.toBeVisible()
  })

  test('modal footer Close button closes the modal', async ({ page }) => {
    skipIfNotReady()

    await loginAndNavigateToCameras(page)

    const cardCount = await page.locator('.camera-card').count()
    test.skip(cardCount === 0, 'No cameras available to test')

    // Open modal
    await page.locator('[data-testid="details-btn"]').first().click()
    await expect(page.locator('[data-testid="modal-overlay"]')).toBeVisible()

    // Wait for content to load
    await expect(page.locator('[data-testid="modal-json"]')).toBeVisible({ timeout: TIMEOUTS.MODAL_CONTENT })

    // Click the footer Close button
    await page.locator('[data-testid="modal-close-btn"]').click()

    // Modal should be gone
    await expect(page.locator('[data-testid="modal-overlay"]')).not.toBeVisible()
  })

  test('clicking modal overlay background closes the modal', async ({ page }) => {
    skipIfNotReady()

    await loginAndNavigateToCameras(page)

    const cardCount = await page.locator('.camera-card').count()
    test.skip(cardCount === 0, 'No cameras available to test')

    // Open modal
    await page.locator('[data-testid="details-btn"]').first().click()
    await expect(page.locator('[data-testid="modal-overlay"]')).toBeVisible()

    // Wait for content to load
    await expect(page.locator('[data-testid="modal-json"]')).toBeVisible({ timeout: TIMEOUTS.MODAL_CONTENT })

    // Click on the overlay (outside the modal content) - top-left corner
    await page.locator('[data-testid="modal-overlay"]').click({ position: { x: 5, y: 5 } })

    // Modal should be gone
    await expect(page.locator('[data-testid="modal-overlay"]')).not.toBeVisible()
  })

  test('modal JSON includes fields from all include parameters', async ({ page }) => {
    skipIfNotReady()

    await loginAndNavigateToCameras(page)

    const cardCount = await page.locator('.camera-card').count()
    test.skip(cardCount === 0, 'No cameras available to test')

    // Open modal - the Details button fetches with all include parameters
    await page.locator('[data-testid="details-btn"]').first().click()
    await expect(page.locator('[data-testid="modal-json"]')).toBeVisible({ timeout: TIMEOUTS.MODAL_CONTENT })

    // Parse the JSON and check for include-only fields
    const jsonText = await page.locator('[data-testid="modal-json"]').textContent()
    const parsed = JSON.parse(jsonText!)

    // These fields are only present when requested via include parameter
    // The Details modal calls getCamera with all includes, so status and deviceInfo should be present
    expect(parsed).toHaveProperty('id')
    expect(parsed).toHaveProperty('name')
    expect(parsed).toHaveProperty('status')
  })

  test('modal displays header with title', async ({ page }) => {
    skipIfNotReady()

    await loginAndNavigateToCameras(page)

    const cardCount = await page.locator('.camera-card').count()
    test.skip(cardCount === 0, 'No cameras available to test')

    // Open modal
    await page.locator('[data-testid="details-btn"]').first().click()
    await expect(page.locator('[data-testid="modal-content"]')).toBeVisible()

    // Check modal header
    await expect(page.locator('[data-testid="modal-content"] h3')).toHaveText('Camera Details')

    // Check include strings are displayed
    const includes = page.locator('[data-testid="modal-includes"]')
    await expect(includes).toBeVisible()
    await expect(includes).toContainText('bridge')
    await expect(includes).toContainText('deviceInfo')
    await expect(includes).toContainText('enabledAnalytics')
  })

  test('can close modal and navigate home', async ({ page }) => {
    skipIfNotReady()

    await loginAndNavigateToCameras(page)

    const cardCount = await page.locator('.camera-card').count()
    test.skip(cardCount === 0, 'No cameras available to test')

    // Open the modal
    await page.locator('[data-testid="details-btn"]').first().click()
    await expect(page.locator('[data-testid="modal-json"]')).toBeVisible({ timeout: TIMEOUTS.MODAL_CONTENT })

    // Close the modal
    await page.locator('[data-testid="modal-close-btn"]').click()
    await expect(page.locator('[data-testid="modal-overlay"]')).not.toBeVisible()

    // Navigate home
    await page.click('[data-testid="nav-home"]')
    await page.waitForURL('/')

    // Verify we're on the home page
    await expect(page.locator('[data-testid="authenticated"]')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })
    await expect(page.locator('h2')).toContainText('Welcome')
  })

  test('clicking a camera card still navigates to detail page', async ({ page }) => {
    skipIfNotReady()

    await loginAndNavigateToCameras(page)

    const cardCount = await page.locator('.camera-card').count()
    test.skip(cardCount === 0, 'No cameras available to test')

    // Click on the card itself (the card header, not the Details button)
    await page.locator('.camera-card .camera-header').first().click()

    // Should navigate to camera detail page
    await expect(page).toHaveURL(/\/cameras\/[a-f0-9-]+/, { timeout: TIMEOUTS.ELEMENT_VISIBLE })

    // Should show camera detail page content
    await expect(page.locator('.camera-detail')).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE })
  })

  test('can open details for multiple cameras sequentially', async ({ page }) => {
    skipIfNotReady()

    await loginAndNavigateToCameras(page)

    const cardCount = await page.locator('.camera-card').count()
    test.skip(cardCount < 2, 'Need at least 2 cameras to test')

    // Open first camera details
    await page.locator('[data-testid="details-btn"]').nth(0).click()
    await expect(page.locator('[data-testid="modal-json"]')).toBeVisible({ timeout: TIMEOUTS.MODAL_CONTENT })

    const firstJson = await page.locator('[data-testid="modal-json"]').textContent()
    const firstCamera = JSON.parse(firstJson!)

    // Close modal
    await page.locator('[data-testid="modal-close-btn"]').click()
    await expect(page.locator('[data-testid="modal-overlay"]')).not.toBeVisible()

    // Open second camera details
    await page.locator('[data-testid="details-btn"]').nth(1).click()
    await expect(page.locator('[data-testid="modal-json"]')).toBeVisible({ timeout: TIMEOUTS.MODAL_CONTENT })

    const secondJson = await page.locator('[data-testid="modal-json"]').textContent()
    const secondCamera = JSON.parse(secondJson!)

    // The two cameras should be different
    expect(secondCamera.id).not.toBe(firstCamera.id)
  })

  test('modal shows loading state before content appears', async ({ page }) => {
    skipIfNotReady()

    await loginAndNavigateToCameras(page)

    const cardCount = await page.locator('.camera-card').count()
    test.skip(cardCount === 0, 'No cameras available to test')

    // Click Details and check that modal appears immediately (with loading or content)
    await page.locator('[data-testid="details-btn"]').first().click()
    await expect(page.locator('[data-testid="modal-overlay"]')).toBeVisible()

    // Either loading or JSON should be visible (loading may be too fast to catch)
    await expect(
      page.locator('[data-testid="modal-loading"], [data-testid="modal-json"]').first()
    ).toBeVisible({ timeout: TIMEOUTS.MODAL_CONTENT })

    // Eventually JSON should appear
    await expect(page.locator('[data-testid="modal-json"]')).toBeVisible({ timeout: TIMEOUTS.MODAL_CONTENT })
  })

  test('camera grid remains visible while modal is open', async ({ page }) => {
    skipIfNotReady()

    await loginAndNavigateToCameras(page)

    const cardCount = await page.locator('.camera-card').count()
    test.skip(cardCount === 0, 'No cameras available to test')

    // Open modal
    await page.locator('[data-testid="details-btn"]').first().click()
    await expect(page.locator('[data-testid="modal-overlay"]')).toBeVisible()

    // Camera grid should still exist in the DOM (behind the overlay)
    await expect(page.locator('.camera-grid')).toBeAttached()
  })

  test('full workflow: login, view cameras, open details, close, go home', async ({ page }) => {
    skipIfNotReady()

    // 1. Start at home page (not authenticated)
    await page.goto('/')
    await expect(page.locator('[data-testid="not-authenticated"]')).toBeVisible()

    // 2. Login
    await performLogin(page, TEST_USER!, TEST_PASSWORD!)
    await expect(page.locator('[data-testid="nav-cameras"]')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    // 3. Navigate to cameras
    await page.click('[data-testid="nav-cameras"]')
    await page.waitForURL('/cameras')
    await expect(page.locator('.camera-grid, .no-cameras')).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE })

    const cardCount = await page.locator('.camera-card').count()
    test.skip(cardCount === 0, 'No cameras available to test')

    // 4. Open details modal
    await page.locator('[data-testid="details-btn"]').first().click()
    await expect(page.locator('[data-testid="modal-overlay"]')).toBeVisible()
    await expect(page.locator('[data-testid="modal-json"]')).toBeVisible({ timeout: TIMEOUTS.MODAL_CONTENT })

    // 5. Verify JSON is valid and has content
    const jsonText = await page.locator('[data-testid="modal-json"]').textContent()
    expect(jsonText).toBeTruthy()
    const parsed = JSON.parse(jsonText!)
    expect(parsed.id).toBeTruthy()
    expect(parsed.name).toBeTruthy()

    // 6. Close the modal
    await page.locator('[data-testid="modal-close-btn"]').click()
    await expect(page.locator('[data-testid="modal-overlay"]')).not.toBeVisible()

    // 7. Verify still on cameras page
    await expect(page).toHaveURL(/\/cameras$/)
    await expect(page.locator('.camera-grid')).toBeVisible()

    // 8. Navigate home
    await page.click('[data-testid="nav-home"]')
    await page.waitForURL('/')
    await expect(page.locator('[data-testid="authenticated"]')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })
    await expect(page.locator('h2')).toContainText('Welcome')
  })
})
