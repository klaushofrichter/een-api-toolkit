import { test, expect, Page } from '@playwright/test'

/**
 * E2E tests for the Vue Bridges Example - OAuth Login Flow
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

  // After login, the bridges app redirects to /bridges
  await page.waitForURL('**/bridges', { timeout: TIMEOUTS.AUTH_COMPLETE })
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

test.describe('Vue Bridges Example - Auth', () => {
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
    await expect(page.locator('[data-testid="nav-bridges"]')).not.toBeVisible()
  })

  test('bridges page redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/bridges')
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

    // Verify landing URL is the bridges page (vue-bridges app redirects to /bridges after login)
    await expect(page).toHaveURL('http://127.0.0.1:3333/bridges')

    // Verify authenticated state - we're on bridges page so check nav elements
    await expect(page.locator('[data-testid="nav-bridges"]')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })
    await expect(page.locator('[data-testid="nav-logout"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-login"]')).not.toBeVisible()
  })

  test('can view bridges list after login', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    await performLogin(page, TEST_USER!, TEST_PASSWORD!)
    await expect(page.locator('[data-testid="nav-bridges"]')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    // Navigate to bridges page
    await page.click('[data-testid="nav-bridges"]')
    await page.waitForURL('/bridges')

    // Verify landing URL is bridges page
    await expect(page).toHaveURL('http://127.0.0.1:3333/bridges')

    // Should see bridges grid (not error state)
    await expect(page.locator('.bridge-grid, .no-bridges')).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE })
    await expect(page.locator('.error')).not.toBeVisible()
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

  test('after logout, localStorage is cleared and new login flow is required', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    // First login
    await performLogin(page, TEST_USER!, TEST_PASSWORD!)
    await expect(page.locator('[data-testid="nav-logout"]')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    // Verify we're authenticated
    await expect(page.locator('[data-testid="nav-bridges"]')).toBeVisible()

    // Logout
    await page.click('[data-testid="nav-logout"]')
    await page.waitForURL('**/')
    await expect(page.locator('[data-testid="not-authenticated"]')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    // Verify localStorage is cleared (session data removed)
    const tokenAfterLogout = await page.evaluate(() => localStorage.getItem('een_token'))
    expect(tokenAfterLogout).toBeNull()

    const sessionIdAfterLogout = await page.evaluate(() => localStorage.getItem('een_sessionId'))
    expect(sessionIdAfterLogout).toBeNull()

    const hostnameAfterLogout = await page.evaluate(() => localStorage.getItem('een_hostname'))
    expect(hostnameAfterLogout).toBeNull()

    // Verify the app shows not-authenticated state (proves our session is cleared)
    await expect(page.locator('[data-testid="not-authenticated"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-login"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-logout"]')).not.toBeVisible()

    // Click login to start new OAuth flow
    await page.click('[data-testid="login-button"]')
    await page.waitForURL('/login')

    // Click OAuth login button - this initiates the OAuth redirect
    await page.click('button:has-text("Login with Eagle Eye Networks")')

    // Wait for either:
    // 1. OAuth page (if IDP session expired) - user needs to enter credentials
    // 2. Callback/bridges page (if IDP remembers user via cookies) - auto-login
    // Either way, our localStorage was cleared and user had to initiate a new login
    await page.waitForURL(/eagleeyenetworks\.com|127\.0\.0\.1:3333/, { timeout: TIMEOUTS.AUTH_COMPLETE })

    // If we ended up back at our app (auto-login via IDP cookies), verify we're authenticated again
    const currentUrl = page.url()
    if (currentUrl.includes('127.0.0.1:3333')) {
      // Auto-logged in - wait for the full flow to complete
      await page.waitForURL('**/bridges', { timeout: TIMEOUTS.AUTH_COMPLETE })
      await expect(page.locator('[data-testid="nav-bridges"]')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })
      await expect(page.locator('[data-testid="nav-logout"]')).toBeVisible()

      // Verify localStorage has new token (proves it was cleared and refilled)
      const newToken = await page.evaluate(() => localStorage.getItem('een_token'))
      expect(newToken).not.toBeNull()
    } else {
      // At OAuth page - user needs to enter credentials
      const emailInput = page.locator('#authentication--input__email')
      await expect(emailInput).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE })
    }
  })

  test('localStorage: second tab shares session without re-login', async ({ page, context }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    // First tab: login
    await performLogin(page, TEST_USER!, TEST_PASSWORD!)
    await expect(page.locator('[data-testid="nav-logout"]')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    // Verify localStorage has token
    const tokenInFirstTab = await page.evaluate(() => localStorage.getItem('een_token'))
    expect(tokenInFirstTab).not.toBeNull()

    // Open second tab in same browser context (shares localStorage)
    const secondTab = await context.newPage()
    await secondTab.goto('/')

    // Second tab should be authenticated immediately (no login needed)
    // because localStorage is shared and App.vue calls initialize()
    await expect(secondTab.locator('[data-testid="nav-logout"]')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })
    await expect(secondTab.locator('[data-testid="nav-bridges"]')).toBeVisible()
    await expect(secondTab.locator('[data-testid="nav-login"]')).not.toBeVisible()

    // Verify second tab has the same token from localStorage
    const tokenInSecondTab = await secondTab.evaluate(() => localStorage.getItem('een_token'))
    expect(tokenInSecondTab).toBe(tokenInFirstTab)

    // Navigate to bridges in second tab - should work without login
    await secondTab.click('[data-testid="nav-bridges"]')
    await secondTab.waitForURL('**/bridges')
    await expect(secondTab.locator('.bridge-grid, .no-bridges')).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE })

    // Clean up second tab
    await secondTab.close()
  })
})
