import { test, expect } from '@playwright/test'

test.describe('Vue Layouts Example - App', () => {
  test.beforeEach(async ({ page }) => {
    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Browser console error:', msg.text())
      }
    })
    page.on('pageerror', err => {
      console.log('Page error:', err.message)
    })

    await page.goto('/')
    // Wait for Vue app header AND router-view content to render
    // The header renders first, then router-view resolves the route
    await page.waitForSelector('[data-testid="app-title"]', { timeout: 10000 })
    // Wait for router-view content (either authenticated or not-authenticated state)
    await page.waitForSelector('.home, .login, .layouts', { timeout: 10000 })
  })

  test('app loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/EEN Layouts/)
  })

  test('header displays app name', async ({ page }) => {
    await expect(page.locator('[data-testid="app-title"]')).toHaveText('EEN Layouts Example')
  })

  test('navigation shows Home and Login links when not authenticated', async ({ page }) => {
    // Home link should be visible
    await expect(page.locator('[data-testid="nav-home"]')).toBeVisible()

    // Login link should be visible (not authenticated)
    await expect(page.locator('[data-testid="nav-login"]')).toBeVisible()

    // Layouts and Logout should NOT be visible (requires auth)
    await expect(page.locator('[data-testid="nav-layouts"]')).not.toBeVisible()
    await expect(page.locator('[data-testid="nav-logout"]')).not.toBeVisible()
  })

  test('home page shows not logged in message', async ({ page }) => {
    await expect(page.locator('[data-testid="not-authenticated"]')).toBeVisible()
    await expect(page.locator('[data-testid="not-authenticated-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible()
  })

  test('login page displays login button', async ({ page }) => {
    await page.goto('/login')

    await expect(page.locator('[data-testid="login-title"]')).toHaveText('Login')
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible()
  })

  test('protected route redirects to login', async ({ page }) => {
    await page.goto('/layouts')

    // Should be redirected to login page
    await page.waitForURL('/login')
    await expect(page).toHaveURL('/login')
    await expect(page.locator('[data-testid="login-title"]')).toHaveText('Login')
  })

  test('navigation between pages works', async ({ page }) => {
    // Click Login link
    await page.click('[data-testid="nav-login"]')
    await page.waitForURL('/login')
    await expect(page).toHaveURL('/login')

    // Click Home link
    await page.click('[data-testid="nav-home"]')
    await page.waitForURL('/')
    await expect(page).toHaveURL('/')
  })
})
