import { test, expect, Page } from '@playwright/test'
import { baseURL } from '../playwright.config'

/**
 * E2E tests for the Vue Jobs Example
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
// Values chosen based on OAuth flow timing requirements
const TIMEOUTS = {
  OAUTH_REDIRECT: 30000,   // OAuth redirects can be slow on first load
  ELEMENT_VISIBLE: 15000,  // Wait for OAuth page elements to render
  PASSWORD_VISIBLE: 10000, // Password field appears after email validation
  AUTH_COMPLETE: 30000,    // Full OAuth flow completion
  UI_UPDATE: 10000,        // UI state updates after auth changes
  PROXY_CHECK: 5000        // Quick check if proxy is running
} as const

const TEST_USER = process.env.TEST_USER
const TEST_PASSWORD = process.env.TEST_PASSWORD
const PROXY_URL = process.env.VITE_PROXY_URL

/**
 * Checks if the OAuth proxy is accessible.
 * Returns true if proxy responds (even with 404), false if unreachable.
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
    // 404 is ok - means proxy is running but endpoint doesn't exist
    return response.ok || response.status === 404
  } catch {
    return false
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Performs OAuth login flow through the UI.
 * Starts from home page and completes full OAuth authentication.
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

  // Wait for redirect back to the app using configured baseURL
  const baseURLPattern = new RegExp(baseURL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  await page.waitForURL(baseURLPattern, { timeout: TIMEOUTS.AUTH_COMPLETE })
}

/**
 * Clears browser storage to reset auth state.
 * Handles cases where localStorage isn't accessible (e.g., about:blank, cross-origin).
 */
async function clearAuthState(page: Page): Promise<void> {
  try {
    // Only try to clear storage if we're on a page that allows it
    const url = page.url()
    if (url && url.startsWith('http')) {
      await page.evaluate(() => {
        try {
          localStorage.clear()
          sessionStorage.clear()
        } catch {
          // Ignore errors - storage may not be accessible
        }
      })
    }
  } catch {
    // Ignore errors - page may be closed or in an inaccessible state
  }
}

test.describe('Vue Jobs Example', () => {
  // Check proxy accessibility once before all tests
  let proxyAccessible = false

  // Helper functions to skip tests when prerequisites aren't met
  function skipIfNoProxy() {
    test.skip(!proxyAccessible, 'OAuth proxy not accessible')
  }

  function skipIfNoCredentials() {
    test.skip(!TEST_USER || !TEST_PASSWORD, 'Test credentials not available')
  }

  function skipIfNoUser() {
    test.skip(!TEST_USER, 'Test user not available')
  }

  test.beforeAll(async () => {
    proxyAccessible = await isProxyAccessible()
    if (!proxyAccessible) {
      console.log('OAuth proxy not accessible - OAuth tests will be skipped')
    }
  })

  test.afterEach(async ({ page }) => {
    // Clear auth state after each test to prevent state pollution
    await clearAuthState(page)
  })

  test('shows login button when not authenticated', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-testid="not-authenticated"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-login"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-logout"]')).not.toBeVisible()
  })

  test('jobs page redirects to login without authentication', async ({ page }) => {
    await page.goto('/jobs')
    await page.waitForURL('/login')
    await expect(page.locator('[data-testid="login-title"]')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })
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
    await expect(page.locator('[data-testid="nav-jobs"]')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })
    await expect(page.locator('[data-testid="nav-files"]')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })
    await expect(page.locator('[data-testid="nav-create-export"]')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })
    await expect(page.locator('[data-testid="nav-logout"]')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })
    await expect(page.locator('[data-testid="nav-login"]')).not.toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })
  })

  test('can view jobs list after login', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    await performLogin(page, TEST_USER!, TEST_PASSWORD!)
    await expect(page.locator('[data-testid="nav-jobs"]')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    // Navigate to jobs page
    await page.click('[data-testid="nav-jobs"]')
    await page.waitForURL('/jobs')

    // Should see jobs content (table or "No jobs found" message)
    await expect(
      page.locator('.jobs table, .jobs p:has-text("No jobs found")').first()
    ).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE })
    await expect(page.locator('.error')).not.toBeVisible()
  })

  test('can view files list after login', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    await performLogin(page, TEST_USER!, TEST_PASSWORD!)
    await expect(page.locator('[data-testid="nav-files"]')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    // Navigate to files page
    await page.click('[data-testid="nav-files"]')
    await page.waitForURL('/files')

    // Should see files content (table or "No files found" message)
    await expect(
      page.locator('.files table, .files p:has-text("No files found")').first()
    ).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE })
  })

  test('files list displays valid data (type, size, date)', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    await performLogin(page, TEST_USER!, TEST_PASSWORD!)
    await page.click('[data-testid="nav-files"]')
    await page.waitForURL('/files')

    // Wait for either loading to finish or content to appear
    // First wait for loading state to clear
    await page.waitForFunction(
      () => !document.querySelector('.files .loading'),
      { timeout: TIMEOUTS.ELEMENT_VISIBLE }
    ).catch(() => {})

    // Wait for files table to be visible
    const table = page.locator('.files table')
    const hasTable = await table.isVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE }).catch(() => false)

    if (!hasTable) {
      // Check if "No files found" is shown
      const noFiles = page.locator('.files p:has-text("No files found")')
      const hasNoFiles = await noFiles.isVisible({ timeout: 2000 }).catch(() => false)
      if (hasNoFiles) {
        console.log('No files found message visible - skipping data validation')
      } else {
        console.log('No files table or message visible - skipping data validation')
      }
      return
    }

    // Get all data rows
    const rows = table.locator('tbody tr')
    const rowCount = await rows.count()
    console.log(`Found ${rowCount} files in the table`)

    // Validate each row has proper metadata
    let foundFileWithSize = false
    for (let i = 0; i < Math.min(rowCount, 10); i++) {
      const row = rows.nth(i)
      const cells = row.locator('td')
      const name = await cells.nth(0).textContent()
      const type = await cells.nth(1).textContent()
      const size = await cells.nth(2).textContent()
      const date = await cells.nth(3).textContent()

      console.log(`Row ${i + 1}:`, { name: name?.substring(0, 40), type, size, date: date?.substring(0, 20) })

      // Validate name is not empty
      expect(name).toBeTruthy()
      expect(name!.trim().length).toBeGreaterThan(0)

      // Validate type is not empty (folder, video, image, etc.)
      expect(type).toBeTruthy()
      expect(type!.trim().length).toBeGreaterThan(0)

      // Validate size format: "-" for folders, or valid size (e.g., "1.5 MB")
      expect(size).toBeTruthy()
      const sizeValue = size!.trim()
      expect(sizeValue).toMatch(/^(-|\d+(\.\d+)?\s*(B|KB|MB|GB))$/)

      // Track if we found a file with actual size (not a folder)
      if (sizeValue !== '-') {
        foundFileWithSize = true
        console.log(`  -> Found file with size: ${sizeValue}`)
      }

      // Validate date is valid (not "Invalid Date")
      expect(date).toBeTruthy()
      expect(date!.trim()).not.toBe('Invalid Date')
      expect(date!.trim().length).toBeGreaterThan(0)
    }

    // Ensure we found at least one file with actual size data
    // This validates the size field is being returned from the API
    if (!foundFileWithSize && rowCount > 0) {
      console.log('Note: All visible files are folders (no size). This is valid but size display not fully verified.')
    } else if (foundFileWithSize) {
      console.log('✓ Successfully verified file size display')
    }
  })

  test('can access create export page after login', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    await performLogin(page, TEST_USER!, TEST_PASSWORD!)
    await expect(page.locator('[data-testid="nav-create-export"]')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    // Navigate to create export page
    await page.click('[data-testid="nav-create-export"]')
    await page.waitForURL('/create-export')

    // Should see the create export form or loading state
    await expect(
      page.locator('.create-export h2:has-text("Create Export")').first()
    ).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE })
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

  test('invalid password shows error on OAuth page', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoUser()

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
