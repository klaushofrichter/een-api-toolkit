import { test, expect, Page } from '@playwright/test'
import { baseURL } from '../playwright.config'

/**
 * E2E tests for delete features in Jobs and Files pages
 *
 * Tests the delete buttons and confirmation dialogs:
 * - Delete buttons are visible in Actions column
 * - Clicking delete shows confirmation dialog
 * - Canceling dialog does not delete the item
 * - Tables use at least 80% of viewport width
 *
 * Note: These tests do NOT actually delete data to preserve test account state.
 * They only verify the UI behavior and confirm dialog functionality.
 */

// Timeout constants
const TIMEOUTS = {
  OAUTH_REDIRECT: 30000,
  ELEMENT_VISIBLE: 15000,
  PASSWORD_VISIBLE: 10000,
  AUTH_COMPLETE: 30000,
  UI_UPDATE: 10000,
  PROXY_CHECK: 5000,
  DIALOG_VISIBLE: 5000
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

test.describe('Delete Features - Jobs and Files Pages', () => {
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
      console.log('OAuth proxy not accessible - delete feature tests will be skipped')
    }
  })

  test.afterEach(async ({ page }) => {
    await clearAuthState(page)
  })

  test.describe('Jobs Page Delete Feature', () => {
    test('jobs table has delete buttons in actions column', async ({ page }) => {
      skipIfNoProxy()
      skipIfNoCredentials()

      await performLogin(page, TEST_USER!, TEST_PASSWORD!)
      await page.click('[data-testid="nav-jobs"]')
      await page.waitForURL('/jobs')

      // Wait for loading to complete
      await page.waitForFunction(
        () => !document.querySelector('.jobs .loading'),
        { timeout: TIMEOUTS.ELEMENT_VISIBLE }
      ).catch(() => {})

      // Check if table exists
      const table = page.locator('.jobs table')
      const hasTable = await table.isVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE }).catch(() => false)

      if (!hasTable) {
        const noJobs = page.locator('.jobs p:has-text("No jobs found")')
        const hasNoJobs = await noJobs.isVisible({ timeout: 2000 }).catch(() => false)
        if (hasNoJobs) {
          console.log('No jobs found - skipping delete button test')
          return
        }
        throw new Error('Neither jobs table nor "No jobs found" message visible')
      }

      // Check for delete buttons in actions column
      const deleteButtons = table.locator('tbody tr td.actions button.btn-danger')
      const buttonCount = await deleteButtons.count()
      console.log(`Found ${buttonCount} delete buttons in jobs table`)

      expect(buttonCount).toBeGreaterThan(0)

      // Verify first delete button has correct text
      const firstDeleteButton = deleteButtons.first()
      await expect(firstDeleteButton).toHaveText('Delete')
      await expect(firstDeleteButton).toBeEnabled()
    })

    test('jobs delete button shows confirmation dialog', async ({ page }) => {
      skipIfNoProxy()
      skipIfNoCredentials()

      await performLogin(page, TEST_USER!, TEST_PASSWORD!)
      await page.click('[data-testid="nav-jobs"]')
      await page.waitForURL('/jobs')

      await page.waitForFunction(
        () => !document.querySelector('.jobs .loading'),
        { timeout: TIMEOUTS.ELEMENT_VISIBLE }
      ).catch(() => {})

      const table = page.locator('.jobs table')
      const hasTable = await table.isVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE }).catch(() => false)

      if (!hasTable) {
        console.log('No jobs table visible - skipping confirmation dialog test')
        return
      }

      const deleteButtons = table.locator('tbody tr td.actions button.btn-danger')
      const buttonCount = await deleteButtons.count()

      if (buttonCount === 0) {
        console.log('No delete buttons found - skipping confirmation dialog test')
        return
      }

      // Set up dialog handler to capture and dismiss
      let dialogMessage = ''
      page.on('dialog', async dialog => {
        dialogMessage = dialog.message()
        console.log('Dialog message:', dialogMessage)
        await dialog.dismiss() // Cancel the delete
      })

      // Click the first delete button
      await deleteButtons.first().click()

      // Wait a moment for dialog
      await page.waitForTimeout(500)

      // Verify dialog was shown with confirmation message
      expect(dialogMessage).toContain('Are you sure')
      expect(dialogMessage).toContain('delete')
    })

    test('canceling jobs delete dialog does not remove the job', async ({ page }) => {
      skipIfNoProxy()
      skipIfNoCredentials()

      await performLogin(page, TEST_USER!, TEST_PASSWORD!)
      await page.click('[data-testid="nav-jobs"]')
      await page.waitForURL('/jobs')

      await page.waitForFunction(
        () => !document.querySelector('.jobs .loading'),
        { timeout: TIMEOUTS.ELEMENT_VISIBLE }
      ).catch(() => {})

      const table = page.locator('.jobs table')
      const hasTable = await table.isVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE }).catch(() => false)

      if (!hasTable) {
        console.log('No jobs table visible - skipping cancel test')
        return
      }

      // Count rows before
      const rows = table.locator('tbody tr')
      const rowCountBefore = await rows.count()
      console.log(`Jobs before cancel: ${rowCountBefore}`)

      if (rowCountBefore === 0) {
        console.log('No jobs found - skipping cancel test')
        return
      }

      // Get the first job's name for verification
      const firstJobName = await rows.first().locator('td').first().textContent()

      // Set up dialog handler to dismiss (cancel)
      page.on('dialog', async dialog => {
        await dialog.dismiss()
      })

      // Click delete button
      const deleteButton = table.locator('tbody tr td.actions button.btn-danger').first()
      await deleteButton.click()

      // Wait a moment
      await page.waitForTimeout(500)

      // Count rows after - should be the same
      const rowCountAfter = await rows.count()
      console.log(`Jobs after cancel: ${rowCountAfter}`)

      expect(rowCountAfter).toBe(rowCountBefore)

      // Verify first job is still there
      const firstJobNameAfter = await rows.first().locator('td').first().textContent()
      expect(firstJobNameAfter).toBe(firstJobName)
      console.log('Job was NOT deleted after canceling dialog')
    })

    test('jobs table uses at least 80% of viewport width', async ({ page }) => {
      skipIfNoProxy()
      skipIfNoCredentials()

      await performLogin(page, TEST_USER!, TEST_PASSWORD!)
      await page.click('[data-testid="nav-jobs"]')
      await page.waitForURL('/jobs')

      await page.waitForFunction(
        () => !document.querySelector('.jobs .loading'),
        { timeout: TIMEOUTS.ELEMENT_VISIBLE }
      ).catch(() => {})

      // Get the jobs container width
      const jobsContainer = page.locator('.jobs')
      const isVisible = await jobsContainer.isVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE }).catch(() => false)

      if (!isVisible) {
        console.log('Jobs container not visible - skipping width test')
        return
      }

      const viewportSize = page.viewportSize()
      if (!viewportSize) {
        console.log('Could not get viewport size - skipping width test')
        return
      }

      const containerBox = await jobsContainer.boundingBox()
      if (!containerBox) {
        console.log('Could not get container bounding box - skipping width test')
        return
      }

      const widthPercentage = (containerBox.width / viewportSize.width) * 100
      console.log(`Jobs container width: ${containerBox.width}px (${widthPercentage.toFixed(1)}% of viewport)`)

      // Should be at least 80% of viewport width
      expect(widthPercentage).toBeGreaterThanOrEqual(80)
    })
  })

  test.describe('Files Page Delete Feature', () => {
    test('files table has delete buttons in actions column', async ({ page }) => {
      skipIfNoProxy()
      skipIfNoCredentials()

      await performLogin(page, TEST_USER!, TEST_PASSWORD!)
      await page.click('[data-testid="nav-files"]')
      await page.waitForURL('/files')

      await page.waitForFunction(
        () => !document.querySelector('.files .loading'),
        { timeout: TIMEOUTS.ELEMENT_VISIBLE }
      ).catch(() => {})

      const table = page.locator('.files table')
      const hasTable = await table.isVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE }).catch(() => false)

      if (!hasTable) {
        const noFiles = page.locator('.files p:has-text("No files found")')
        const hasNoFiles = await noFiles.isVisible({ timeout: 2000 }).catch(() => false)
        if (hasNoFiles) {
          console.log('No files found - skipping delete button test')
          return
        }
        throw new Error('Neither files table nor "No files found" message visible')
      }

      // Check for delete buttons in actions column
      const deleteButtons = table.locator('tbody tr td.actions button.btn-danger')
      const buttonCount = await deleteButtons.count()
      console.log(`Found ${buttonCount} delete buttons in files table`)

      expect(buttonCount).toBeGreaterThan(0)

      // Verify first delete button has correct text
      const firstDeleteButton = deleteButtons.first()
      await expect(firstDeleteButton).toHaveText('Delete')
      await expect(firstDeleteButton).toBeEnabled()
    })

    test('files delete button shows confirmation dialog', async ({ page }) => {
      skipIfNoProxy()
      skipIfNoCredentials()

      await performLogin(page, TEST_USER!, TEST_PASSWORD!)
      await page.click('[data-testid="nav-files"]')
      await page.waitForURL('/files')

      await page.waitForFunction(
        () => !document.querySelector('.files .loading'),
        { timeout: TIMEOUTS.ELEMENT_VISIBLE }
      ).catch(() => {})

      const table = page.locator('.files table')
      const hasTable = await table.isVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE }).catch(() => false)

      if (!hasTable) {
        console.log('No files table visible - skipping confirmation dialog test')
        return
      }

      const deleteButtons = table.locator('tbody tr td.actions button.btn-danger')
      const buttonCount = await deleteButtons.count()

      if (buttonCount === 0) {
        console.log('No delete buttons found - skipping confirmation dialog test')
        return
      }

      // Set up dialog handler to capture and dismiss
      let dialogMessage = ''
      page.on('dialog', async dialog => {
        dialogMessage = dialog.message()
        console.log('Dialog message:', dialogMessage)
        await dialog.dismiss() // Cancel the delete
      })

      // Click the first delete button
      await deleteButtons.first().click()

      // Wait a moment for dialog
      await page.waitForTimeout(500)

      // Verify dialog was shown with confirmation message
      expect(dialogMessage).toContain('Are you sure')
      expect(dialogMessage).toContain('delete')
      expect(dialogMessage).toContain('recycle bin')
    })

    test('canceling files delete dialog does not remove the file', async ({ page }) => {
      skipIfNoProxy()
      skipIfNoCredentials()

      await performLogin(page, TEST_USER!, TEST_PASSWORD!)
      await page.click('[data-testid="nav-files"]')
      await page.waitForURL('/files')

      await page.waitForFunction(
        () => !document.querySelector('.files .loading'),
        { timeout: TIMEOUTS.ELEMENT_VISIBLE }
      ).catch(() => {})

      const table = page.locator('.files table')
      const hasTable = await table.isVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE }).catch(() => false)

      if (!hasTable) {
        console.log('No files table visible - skipping cancel test')
        return
      }

      // Count rows before
      const rows = table.locator('tbody tr')
      const rowCountBefore = await rows.count()
      console.log(`Files before cancel: ${rowCountBefore}`)

      if (rowCountBefore === 0) {
        console.log('No files found - skipping cancel test')
        return
      }

      // Get the first file's name for verification
      const firstFileName = await rows.first().locator('td').first().textContent()

      // Set up dialog handler to dismiss (cancel)
      page.on('dialog', async dialog => {
        await dialog.dismiss()
      })

      // Click delete button
      const deleteButton = table.locator('tbody tr td.actions button.btn-danger').first()
      await deleteButton.click()

      // Wait a moment
      await page.waitForTimeout(500)

      // Count rows after - should be the same
      const rowCountAfter = await rows.count()
      console.log(`Files after cancel: ${rowCountAfter}`)

      expect(rowCountAfter).toBe(rowCountBefore)

      // Verify first file is still there
      const firstFileNameAfter = await rows.first().locator('td').first().textContent()
      expect(firstFileNameAfter).toBe(firstFileName)
      console.log('File was NOT deleted after canceling dialog')
    })

    test('files table uses at least 80% of viewport width', async ({ page }) => {
      skipIfNoProxy()
      skipIfNoCredentials()

      await performLogin(page, TEST_USER!, TEST_PASSWORD!)
      await page.click('[data-testid="nav-files"]')
      await page.waitForURL('/files')

      await page.waitForFunction(
        () => !document.querySelector('.files .loading'),
        { timeout: TIMEOUTS.ELEMENT_VISIBLE }
      ).catch(() => {})

      // Get the files container width
      const filesContainer = page.locator('.files')
      const isVisible = await filesContainer.isVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE }).catch(() => false)

      if (!isVisible) {
        console.log('Files container not visible - skipping width test')
        return
      }

      const viewportSize = page.viewportSize()
      if (!viewportSize) {
        console.log('Could not get viewport size - skipping width test')
        return
      }

      const containerBox = await filesContainer.boundingBox()
      if (!containerBox) {
        console.log('Could not get container bounding box - skipping width test')
        return
      }

      const widthPercentage = (containerBox.width / viewportSize.width) * 100
      console.log(`Files container width: ${containerBox.width}px (${widthPercentage.toFixed(1)}% of viewport)`)

      // Should be at least 80% of viewport width
      expect(widthPercentage).toBeGreaterThanOrEqual(80)
    })
  })

  test.describe('Actions Column Layout', () => {
    test('jobs actions column has view and delete buttons side by side', async ({ page }) => {
      skipIfNoProxy()
      skipIfNoCredentials()

      await performLogin(page, TEST_USER!, TEST_PASSWORD!)
      await page.click('[data-testid="nav-jobs"]')
      await page.waitForURL('/jobs')

      await page.waitForFunction(
        () => !document.querySelector('.jobs .loading'),
        { timeout: TIMEOUTS.ELEMENT_VISIBLE }
      ).catch(() => {})

      const table = page.locator('.jobs table')
      const hasTable = await table.isVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE }).catch(() => false)

      if (!hasTable) {
        console.log('No jobs table visible - skipping layout test')
        return
      }

      // Check first row's actions cell
      const actionsCell = table.locator('tbody tr').first().locator('td.actions')
      const buttons = actionsCell.locator('button')
      const buttonCount = await buttons.count()

      expect(buttonCount).toBe(2) // View and Delete

      // Verify button labels
      await expect(buttons.nth(0)).toHaveText('View')
      await expect(buttons.nth(1)).toHaveText('Delete')

      console.log('Jobs actions column has View and Delete buttons')
    })

    test('files actions column has download and delete buttons side by side', async ({ page }) => {
      skipIfNoProxy()
      skipIfNoCredentials()

      await performLogin(page, TEST_USER!, TEST_PASSWORD!)
      await page.click('[data-testid="nav-files"]')
      await page.waitForURL('/files')

      await page.waitForFunction(
        () => !document.querySelector('.files .loading'),
        { timeout: TIMEOUTS.ELEMENT_VISIBLE }
      ).catch(() => {})

      const table = page.locator('.files table')
      const hasTable = await table.isVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE }).catch(() => false)

      if (!hasTable) {
        console.log('No files table visible - skipping layout test')
        return
      }

      // Check first row's actions cell
      const actionsCell = table.locator('tbody tr').first().locator('td.actions')
      const buttons = actionsCell.locator('button')
      const buttonCount = await buttons.count()

      expect(buttonCount).toBe(2) // Download and Delete

      // Verify button labels
      await expect(buttons.nth(0)).toHaveText('Download')
      await expect(buttons.nth(1)).toHaveText('Delete')

      console.log('Files actions column has Download and Delete buttons')
    })
  })
})
