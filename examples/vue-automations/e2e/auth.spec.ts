import { test, expect, Page } from '@playwright/test'

/**
 * E2E tests for the Vue Automations Example - OAuth Login Flow
 *
 * Tests the OAuth login flow through the UI:
 * 1. Click login button in the example app
 * 2. Enter credentials on EEN OAuth page
 * 3. Complete the OAuth callback
 * 4. Verify authenticated state and automations display
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
  DATA_LOAD: 20000
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

  // After login, the automations app redirects to /automations
  await page.waitForURL('**/automations', { timeout: TIMEOUTS.AUTH_COMPLETE })
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

test.describe('Vue Automations Example - Auth', () => {
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
    await expect(page.locator('[data-testid="nav-automations"]')).not.toBeVisible()
  })

  test('automations page redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/automations')
    // Should redirect to login page
    await expect(page.locator('[data-testid="login-title"]')).toContainText('Login')
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

    // Verify landing URL is the automations page
    await expect(page).toHaveURL('http://127.0.0.1:3333/automations')

    // Verify authenticated state - we're on automations page so check nav elements
    await expect(page.locator('[data-testid="nav-automations"]')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })
    await expect(page.locator('[data-testid="nav-logout"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-login"]')).not.toBeVisible()
  })

  test('can view automations after login', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    await performLogin(page, TEST_USER!, TEST_PASSWORD!)
    await expect(page.locator('[data-testid="nav-automations"]')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    // Verify we're on the automations page
    await expect(page).toHaveURL('http://127.0.0.1:3333/automations')

    // Wait for data to load - should see either a table or "no data" message
    await expect(
      page.locator('[data-testid="event-alert-rules-table"], .no-data, .loading')
    ).toBeVisible({ timeout: TIMEOUTS.DATA_LOAD })

    // Should not see error state
    await expect(page.locator('.error')).not.toBeVisible()
  })

  test('can switch between automation tabs', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    await performLogin(page, TEST_USER!, TEST_PASSWORD!)

    // Default tab is Event Alert Rules
    await expect(page.locator('[data-testid="tab-event-alert-rules"]')).toHaveClass(/active/)

    // Click on Condition Rules tab
    await page.click('[data-testid="tab-condition-rules"]')
    await expect(page.locator('[data-testid="tab-condition-rules"]')).toHaveClass(/active/)
    await expect(page.locator('[data-testid="condition-rules-content"]')).toBeVisible()

    // Click on Action Rules tab
    await page.click('[data-testid="tab-action-rules"]')
    await expect(page.locator('[data-testid="tab-action-rules"]')).toHaveClass(/active/)
    await expect(page.locator('[data-testid="action-rules-content"]')).toBeVisible()

    // Click on Actions tab
    await page.click('[data-testid="tab-actions"]')
    await expect(page.locator('[data-testid="tab-actions"]')).toHaveClass(/active/)
    await expect(page.locator('[data-testid="actions-content"]')).toBeVisible()
  })

  test('action rules tab loads data without errors', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    // Collect console errors
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await performLogin(page, TEST_USER!, TEST_PASSWORD!)

    // Click on Action Rules tab
    await page.click('[data-testid="tab-action-rules"]')
    await expect(page.locator('[data-testid="tab-action-rules"]')).toHaveClass(/active/)

    // Wait for data to load - the TEST account should have action rules data
    const table = page.locator('[data-testid="action-rules-table"]')
    await expect(table).toBeVisible({ timeout: TIMEOUTS.DATA_LOAD })

    // Verify actual data rows exist (not just the header)
    const rows = table.locator('tbody tr')
    const rowCount = await rows.count()
    expect(rowCount).toBeGreaterThan(0)

    // Verify no error state is shown
    await expect(page.locator('[data-testid="action-rules-content"] .error')).not.toBeVisible()

    // Check for JavaScript errors during render
    const renderErrors = consoleErrors.filter(e =>
      e.includes('TypeError') || e.includes('Cannot read properties')
    )
    expect(renderErrors).toHaveLength(0)
  })

  test('condition rules tab loads data without errors', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    // Collect console errors
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await performLogin(page, TEST_USER!, TEST_PASSWORD!)

    // Click on Condition Rules tab
    await page.click('[data-testid="tab-condition-rules"]')
    await expect(page.locator('[data-testid="tab-condition-rules"]')).toHaveClass(/active/)

    // Wait for data to load - the TEST account should have condition rules data
    const table = page.locator('[data-testid="condition-rules-table"]')
    await expect(table).toBeVisible({ timeout: TIMEOUTS.DATA_LOAD })

    // Verify actual data rows exist (not just the header)
    const rows = table.locator('tbody tr')
    const rowCount = await rows.count()
    expect(rowCount).toBeGreaterThan(0)

    // Verify no error state is shown
    await expect(page.locator('[data-testid="condition-rules-content"] .error')).not.toBeVisible()

    // Check for JavaScript errors during render
    const renderErrors = consoleErrors.filter(e =>
      e.includes('TypeError') || e.includes('Cannot read properties')
    )
    expect(renderErrors).toHaveLength(0)
  })

  test('actions tab loads data without errors', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    // Collect console errors
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await performLogin(page, TEST_USER!, TEST_PASSWORD!)

    // Click on Actions tab
    await page.click('[data-testid="tab-actions"]')
    await expect(page.locator('[data-testid="tab-actions"]')).toHaveClass(/active/)

    // Wait for data to load - the TEST account should have actions data
    const table = page.locator('[data-testid="actions-table"]')
    await expect(table).toBeVisible({ timeout: TIMEOUTS.DATA_LOAD })

    // Verify actual data rows exist (not just the header)
    const rows = table.locator('tbody tr')
    const rowCount = await rows.count()
    expect(rowCount).toBeGreaterThan(0)

    // Verify no error state is shown
    await expect(page.locator('[data-testid="actions-content"] .error')).not.toBeVisible()

    // Check for JavaScript errors during render
    const renderErrors = consoleErrors.filter(e =>
      e.includes('TypeError') || e.includes('Cannot read properties')
    )
    expect(renderErrors).toHaveLength(0)
  })

  test('event alert rules tab loads data without errors', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    // Collect console errors
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await performLogin(page, TEST_USER!, TEST_PASSWORD!)

    // Event alert rules is the default tab - the TEST account should have data
    const table = page.locator('[data-testid="event-alert-rules-table"]')
    await expect(table).toBeVisible({ timeout: TIMEOUTS.DATA_LOAD })

    // Verify actual data rows exist (not just the header)
    const rows = table.locator('tbody tr')
    const rowCount = await rows.count()
    expect(rowCount).toBeGreaterThan(0)

    // Verify no error state is shown
    await expect(page.locator('[data-testid="event-alert-rules-content"] .error')).not.toBeVisible()

    // Check for JavaScript errors during render
    const renderErrors = consoleErrors.filter(e =>
      e.includes('TypeError') || e.includes('Cannot read properties')
    )
    expect(renderErrors).toHaveLength(0)
  })

  test('clicking a row opens modal with JSON data', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    await performLogin(page, TEST_USER!, TEST_PASSWORD!)

    // Wait for event alert rules to load (default tab)
    const table = page.locator('[data-testid="event-alert-rules-table"]')
    await expect(table).toBeVisible({ timeout: TIMEOUTS.DATA_LOAD })

    // Click the first row
    const firstRow = table.locator('tbody tr').first()
    await firstRow.click()

    // Verify modal appears
    const modal = page.locator('[data-testid="detail-modal"]')
    await expect(modal).toBeVisible()

    // Verify modal has JSON content
    const jsonContent = page.locator('[data-testid="modal-json"]')
    await expect(jsonContent).toBeVisible()
    const jsonText = await jsonContent.textContent()
    expect(jsonText).toContain('"id"')
    expect(jsonText).toContain('"name"')

    // Close modal by clicking close button
    await page.click('[data-testid="modal-close"]')
    await expect(modal).not.toBeVisible()
  })

  test('modal can be closed by clicking overlay', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    await performLogin(page, TEST_USER!, TEST_PASSWORD!)

    // Wait for event alert rules to load
    const table = page.locator('[data-testid="event-alert-rules-table"]')
    await expect(table).toBeVisible({ timeout: TIMEOUTS.DATA_LOAD })

    // Click the first row to open modal
    await table.locator('tbody tr').first().click()

    // Verify modal appears
    const modal = page.locator('[data-testid="detail-modal"]')
    await expect(modal).toBeVisible()

    // Close modal by clicking overlay (outside the modal)
    await page.click('[data-testid="modal-overlay"]', { position: { x: 10, y: 10 } })
    await expect(modal).not.toBeVisible()
  })

  test('can use enabled filter', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    // Go to home and check if already logged in
    await page.goto('/')
    await page.waitForTimeout(1000)

    const isLoggedIn = await page.locator('[data-testid="nav-logout"]').isVisible()

    if (!isLoggedIn) {
      await performLogin(page, TEST_USER!, TEST_PASSWORD!)
    } else {
      // Navigate to automations if already logged in
      await page.click('[data-testid="nav-automations"]')
      await page.waitForURL('**/automations')
    }

    // Wait for initial data load
    await expect(
      page.locator('[data-testid="event-alert-rules-table"], .no-data')
    ).toBeVisible({ timeout: TIMEOUTS.DATA_LOAD })

    // Change filter to enabled only
    await page.selectOption('[data-testid="enabled-filter"]', 'enabled')

    // Wait for data to reload
    await page.waitForTimeout(1000)

    // Should still show content (table or no-data) without error
    await expect(page.locator('.error')).not.toBeVisible()
  })

  test('can logout after login', async ({ page }) => {
    skipIfNoProxy()
    skipIfNoCredentials()

    // Go to home page first
    await page.goto('/')

    // Wait a moment for auth state to settle
    await page.waitForTimeout(1000)

    // Check if already logged in (from previous test) - if so, we can proceed with logout
    const logoutButton = page.locator('[data-testid="nav-logout"]')
    const isLoggedIn = await logoutButton.isVisible()

    if (!isLoggedIn) {
      // Need to log in first
      await performLogin(page, TEST_USER!, TEST_PASSWORD!)
      // Go to home to see the logout button
      await page.goto('/')
    }

    await expect(logoutButton).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })

    await logoutButton.click()

    // Wait for logout to complete and redirect to home
    await page.waitForURL('**/', { timeout: TIMEOUTS.AUTH_COMPLETE })
    await expect(page.locator('[data-testid="not-authenticated"]')).toBeVisible({ timeout: TIMEOUTS.UI_UPDATE })
    await expect(page.locator('[data-testid="nav-login"]')).toBeVisible()
  })
})
