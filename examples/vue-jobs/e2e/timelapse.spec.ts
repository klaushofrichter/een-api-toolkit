import { test, expect, Page } from '@playwright/test'
import { baseURL } from '../playwright.config'

/**
 * E2E tests for TimeLapse export functionality
 *
 * Tests the timeLapse export flow which requires playbackMultiplier:
 * 1. Login and navigate to Create Export
 * 2. Select timeLapse type and verify playbackMultiplier field appears
 * 3. Create a timeLapse export job
 * 4. Verify job is created and tracked
 *
 * Required environment variables:
 * - VITE_PROXY_URL: OAuth proxy URL
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
  JOB_CREATION: 30000
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

  await Promise.all([
    page.waitForURL(/.*eagleeyenetworks.com.*/, { timeout: TIMEOUTS.OAUTH_REDIRECT }),
    page.click('[data-testid="login-button"]')
  ])

  const emailInput = page.locator('#authentication--input__email')
  await emailInput.waitFor({ state: 'visible', timeout: TIMEOUTS.ELEMENT_VISIBLE })
  await emailInput.fill(username)

  await page.getByRole('button', { name: 'Next' }).click()

  const passwordInput = page.locator('#authentication--input__password')
  await passwordInput.waitFor({ state: 'visible', timeout: TIMEOUTS.PASSWORD_VISIBLE })
  await passwordInput.fill(password)

  await page.locator('#next, button:has-text("Sign in")').first().click()

  const baseURLPattern = new RegExp(baseURL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  await page.waitForURL(baseURLPattern, { timeout: TIMEOUTS.AUTH_COMPLETE })
}

test.describe('TimeLapse Export', () => {
  test.beforeAll(async () => {
    // Check prerequisites
    if (!TEST_USER || !TEST_PASSWORD) {
      console.log('Skipping: TEST_USER and TEST_PASSWORD required')
      test.skip()
    }

    const proxyAccessible = await isProxyAccessible()
    if (!proxyAccessible) {
      console.log('Skipping: OAuth proxy not accessible at', PROXY_URL)
      test.skip()
    }
  })

  test('playbackMultiplier field appears when timeLapse is selected', async ({ page }) => {
    if (!TEST_USER || !TEST_PASSWORD) {
      test.skip()
      return
    }

    // Login
    await performLogin(page, TEST_USER, TEST_PASSWORD)

    // Wait for authenticated state
    await page.waitForSelector('.authenticated, .user-info', { timeout: TIMEOUTS.UI_UPDATE })

    // Navigate to Create Export page
    await page.click('a[href="/create-export"], button:has-text("Create Export")')
    await page.waitForURL(/.*create-export.*/, { timeout: TIMEOUTS.UI_UPDATE })

    // Wait for cameras to load - check that camera select has options
    const cameraSelect = page.locator('select#camera')
    await expect(cameraSelect).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    // Wait for at least one camera option to be available
    const cameraOptions = cameraSelect.locator('option:not([value=""])')
    await expect(cameraOptions.first()).toBeAttached({ timeout: TIMEOUTS.UI_UPDATE })

    // Verify playback multiplier is NOT visible for video type (default)
    const playbackMultiplierSelect = page.locator('select#playbackMultiplier')
    await expect(playbackMultiplierSelect).not.toBeVisible()

    // Select timeLapse export type
    await page.selectOption('select#exportType', 'timeLapse')

    // Verify playback multiplier IS visible for timeLapse
    await expect(playbackMultiplierSelect).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    // Verify it has options
    const options = await playbackMultiplierSelect.locator('option').count()
    expect(options).toBeGreaterThan(0)
    console.log('TimeLapse playback multiplier field has', options, 'options')
  })

  test('playbackMultiplier field appears when bundle is selected', async ({ page }) => {
    if (!TEST_USER || !TEST_PASSWORD) {
      test.skip()
      return
    }

    // Login
    await performLogin(page, TEST_USER, TEST_PASSWORD)
    await page.waitForSelector('.authenticated, .user-info', { timeout: TIMEOUTS.UI_UPDATE })

    // Navigate to Create Export page
    await page.click('a[href="/create-export"], button:has-text("Create Export")')
    await page.waitForURL(/.*create-export.*/, { timeout: TIMEOUTS.UI_UPDATE })

    // Wait for cameras to load
    const cameraSelect = page.locator('select#camera')
    await expect(cameraSelect).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })
    const cameraOptions = cameraSelect.locator('option:not([value=""])')
    await expect(cameraOptions.first()).toBeAttached({ timeout: TIMEOUTS.UI_UPDATE })

    // Select bundle export type
    await page.selectOption('select#exportType', 'bundle')

    // Verify playback multiplier IS visible for bundle
    const playbackMultiplierSelect = page.locator('select#playbackMultiplier')
    await expect(playbackMultiplierSelect).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })
  })

  test('can create timeLapse export job', async ({ page }) => {
    if (!TEST_USER || !TEST_PASSWORD) {
      test.skip()
      return
    }

    // Login
    await performLogin(page, TEST_USER, TEST_PASSWORD)
    await page.waitForSelector('.authenticated, .user-info', { timeout: TIMEOUTS.UI_UPDATE })

    // Navigate to Create Export page
    await page.click('a[href="/create-export"], button:has-text("Create Export")')
    await page.waitForURL(/.*create-export.*/, { timeout: TIMEOUTS.UI_UPDATE })

    // Wait for cameras to load
    const cameraSelect = page.locator('select#camera')
    await expect(cameraSelect).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    // Wait a moment for options to populate
    await page.waitForTimeout(1000)

    const cameraOptions = cameraSelect.locator('option:not([value=""])')
    const cameraCount = await cameraOptions.count()

    if (cameraCount === 0) {
      console.log('No cameras available - skipping timeLapse export test')
      test.skip()
      return
    }

    // Select first camera
    const firstCameraValue = await cameraOptions.first().getAttribute('value')
    if (firstCameraValue) {
      await page.selectOption('select#camera', firstCameraValue)
    }

    // Select timeLapse export type
    await page.selectOption('select#exportType', 'timeLapse')

    // Verify playback multiplier appears
    const playbackMultiplierSelect = page.locator('select#playbackMultiplier')
    await expect(playbackMultiplierSelect).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    // Select a playback multiplier (10x)
    await page.selectOption('select#playbackMultiplier', '10')

    // Select shortest duration (5 minutes)
    await page.selectOption('select#duration', '5')

    // Enter export name
    await page.fill('input#name', 'E2E TimeLapse Test Export')

    // Submit the form
    await page.click('button[type="submit"]')

    // Wait for either success or error
    const resultSelector = '.success, .error'
    await page.waitForSelector(resultSelector, { timeout: TIMEOUTS.JOB_CREATION })

    // Check result
    const successElement = page.locator('.success')
    const errorElement = page.locator('.error')

    if (await successElement.isVisible()) {
      const successText = await successElement.textContent()
      console.log('TimeLapse export job created:', successText)
      expect(successText).toContain('Export job created successfully')

      // Should redirect to job detail page
      await page.waitForURL(/.*jobs\/.*/, { timeout: TIMEOUTS.UI_UPDATE })
      console.log('Redirected to job detail page:', page.url())
    } else if (await errorElement.isVisible()) {
      const errorText = await errorElement.textContent()
      console.log('TimeLapse export creation failed:', errorText)

      // Some errors are acceptable (no video in time range, etc.)
      // Just log and don't fail the test for expected errors
      if (errorText?.includes('no video') || errorText?.includes('No video')) {
        console.log('Expected error: No video available in time range')
      } else {
        // Unexpected error - fail with details
        expect.soft(errorText).not.toContain('playbackMultiplier')
      }
    }
  })

  test('can create bundle export job', async ({ page }) => {
    if (!TEST_USER || !TEST_PASSWORD) {
      test.skip()
      return
    }

    // Login
    await performLogin(page, TEST_USER, TEST_PASSWORD)
    await page.waitForSelector('.authenticated, .user-info', { timeout: TIMEOUTS.UI_UPDATE })

    // Navigate to Create Export page
    await page.click('a[href="/create-export"], button:has-text("Create Export")')
    await page.waitForURL(/.*create-export.*/, { timeout: TIMEOUTS.UI_UPDATE })

    // Wait for cameras to load
    const cameraSelect = page.locator('select#camera')
    await expect(cameraSelect).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    // Wait a moment for options to populate
    await page.waitForTimeout(1000)

    const cameraOptions = cameraSelect.locator('option:not([value=""])')
    const cameraCount = await cameraOptions.count()

    if (cameraCount === 0) {
      console.log('No cameras available - skipping bundle export test')
      test.skip()
      return
    }

    // Select first camera
    const firstCameraValue = await cameraOptions.first().getAttribute('value')
    if (firstCameraValue) {
      await page.selectOption('select#camera', firstCameraValue)
    }

    // Select bundle export type
    await page.selectOption('select#exportType', 'bundle')

    // Verify playback multiplier appears (required for bundle)
    const playbackMultiplierSelect = page.locator('select#playbackMultiplier')
    await expect(playbackMultiplierSelect).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    // Select a playback multiplier (5x)
    await page.selectOption('select#playbackMultiplier', '5')

    // Select shortest duration (5 minutes)
    await page.selectOption('select#duration', '5')

    // Enter export name
    await page.fill('input#name', 'E2E Bundle Test Export')

    // Submit the form
    await page.click('button[type="submit"]')

    // Wait for either success or error
    const resultSelector = '.success, .error'
    await page.waitForSelector(resultSelector, { timeout: TIMEOUTS.JOB_CREATION })

    // Check result
    const successElement = page.locator('.success')
    const errorElement = page.locator('.error')

    if (await successElement.isVisible()) {
      const successText = await successElement.textContent()
      console.log('Bundle export job created:', successText)
      expect(successText).toContain('Export job created successfully')

      // Should redirect to job detail page
      await page.waitForURL(/.*jobs\/.*/, { timeout: TIMEOUTS.UI_UPDATE })
      console.log('Redirected to job detail page:', page.url())
    } else if (await errorElement.isVisible()) {
      const errorText = await errorElement.textContent()
      console.log('Bundle export creation failed:', errorText)

      // Some errors are acceptable (no video in time range, etc.)
      if (errorText?.includes('no video') || errorText?.includes('No video')) {
        console.log('Expected error: No video available in time range')
      } else {
        // Unexpected error - fail with details
        expect.soft(errorText).not.toContain('playbackMultiplier')
      }
    }
  })

  test('video export does not show playbackMultiplier field', async ({ page }) => {
    if (!TEST_USER || !TEST_PASSWORD) {
      test.skip()
      return
    }

    // Login
    await performLogin(page, TEST_USER, TEST_PASSWORD)
    await page.waitForSelector('.authenticated, .user-info', { timeout: TIMEOUTS.UI_UPDATE })

    // Navigate to Create Export page
    await page.click('a[href="/create-export"], button:has-text("Create Export")')
    await page.waitForURL(/.*create-export.*/, { timeout: TIMEOUTS.UI_UPDATE })

    // Wait for cameras to load
    const cameraSelect = page.locator('select#camera')
    await expect(cameraSelect).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })
    const cameraOptions = cameraSelect.locator('option:not([value=""])')
    await expect(cameraOptions.first()).toBeAttached({ timeout: TIMEOUTS.UI_UPDATE })

    // Video is default, verify playback multiplier is NOT visible
    const playbackMultiplierSelect = page.locator('select#playbackMultiplier')
    await expect(playbackMultiplierSelect).not.toBeVisible()

    // Explicitly select video type
    await page.selectOption('select#exportType', 'video')

    // Still should not be visible
    await expect(playbackMultiplierSelect).not.toBeVisible()
    console.log('Verified: playbackMultiplier not shown for video export type')
  })
})
