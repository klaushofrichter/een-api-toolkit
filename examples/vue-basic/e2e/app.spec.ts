import { test, expect } from '@playwright/test'

test.describe('Vue Basic Example - Unauthenticated', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('app loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/EEN API Toolkit/)
  })

  test('header displays app name', async ({ page }) => {
    await expect(page.locator('[data-testid="app-title"]')).toHaveText('EEN API Toolkit Example')
  })

  test('navigation shows Home and Login links when not authenticated', async ({ page }) => {
    // Home link should be visible
    await expect(page.locator('[data-testid="nav-home"]')).toBeVisible()

    // Login link should be visible (not authenticated)
    await expect(page.locator('[data-testid="nav-login"]')).toBeVisible()

    // Users and Logout should NOT be visible (requires auth)
    await expect(page.locator('[data-testid="nav-users"]')).not.toBeVisible()
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
    await page.goto('/users')

    // Should be redirected to login page
    await expect(page).toHaveURL('/login')
    await expect(page.locator('[data-testid="login-title"]')).toHaveText('Login')
  })

  test('navigation between pages works', async ({ page }) => {
    // Click Login link
    await page.click('[data-testid="nav-login"]')
    await expect(page).toHaveURL('/login')

    // Click Home link
    await page.click('[data-testid="nav-home"]')
    await expect(page).toHaveURL('/')
  })
})
