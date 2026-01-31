import { test, expect } from '@playwright/test'

test.describe('Vue Automations Example - App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('app loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/EEN Automations/)
  })

  test('header displays app name', async ({ page }) => {
    await expect(page.locator('[data-testid="app-title"]')).toHaveText('EEN Automations Example')
  })

  test('navigation shows Home and Login links when not authenticated', async ({ page }) => {
    // Home link should be visible
    await expect(page.locator('[data-testid="nav-home"]')).toBeVisible()

    // Login link should be visible (not authenticated)
    await expect(page.locator('[data-testid="nav-login"]')).toBeVisible()

    // Automations and Logout should NOT be visible (requires auth)
    await expect(page.locator('[data-testid="nav-automations"]')).not.toBeVisible()
    await expect(page.locator('[data-testid="nav-logout"]')).not.toBeVisible()
  })

  test('home page shows not logged in message', async ({ page }) => {
    await expect(page.locator('[data-testid="not-authenticated"]')).toBeVisible()
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible()
  })

  test('home page displays storage strategy', async ({ page }) => {
    await expect(page.locator('[data-testid="storage-strategy"]')).toBeVisible()
  })

  test('login page displays login button', async ({ page }) => {
    await page.goto('/login')

    await expect(page.locator('[data-testid="login-title"]')).toHaveText('Login')
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible()
  })

  test('protected route redirects to login', async ({ page }) => {
    await page.goto('/automations')

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

  test('home page shows features list', async ({ page }) => {
    // Check that the features section is visible
    const description = page.locator('.description')
    await expect(description).toBeVisible()

    // Check for features list items (6 features + 4 functions = 10 total)
    await expect(description.locator('li')).toHaveCount(10)
  })

  test('home page shows functions used', async ({ page }) => {
    // Check that the functions used section mentions the automation functions
    const description = page.locator('.description')
    await expect(description.locator('code')).toHaveCount(4)
    await expect(description.locator('text=listEventAlertConditionRules')).toBeVisible()
    await expect(description.locator('text=listAlertConditionRules')).toBeVisible()
    await expect(description.locator('text=listAlertActionRules')).toBeVisible()
    await expect(description.locator('text=listAlertActions')).toBeVisible()
  })
})
