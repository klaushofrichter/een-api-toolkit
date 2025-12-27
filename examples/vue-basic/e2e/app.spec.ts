import { test, expect } from '@playwright/test'

test.describe('Vue Basic Example - Unauthenticated', () => {
  test('app loads with correct title', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/EEN API Toolkit/)
  })

  test('header displays app name', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('header h1')).toHaveText('EEN API Toolkit Example')
  })

  test('navigation shows Home and Login links when not authenticated', async ({ page }) => {
    await page.goto('/')

    // Home link should be visible
    await expect(page.locator('nav a[href="/"]')).toBeVisible()

    // Login link should be visible (not authenticated)
    await expect(page.locator('nav a[href="/login"]')).toBeVisible()

    // Users and Logout should NOT be visible (requires auth)
    await expect(page.locator('nav a[href="/users"]')).not.toBeVisible()
    await expect(page.locator('nav a[href="/logout"]')).not.toBeVisible()
  })

  test('home page shows not logged in message', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('.not-authenticated')).toBeVisible()
    await expect(page.locator('text=You are not logged in')).toBeVisible()
    await expect(page.locator('button:has-text("Login with Eagle Eye Networks")')).toBeVisible()
  })

  test('login page displays login button', async ({ page }) => {
    await page.goto('/login')

    await expect(page.locator('h2')).toHaveText('Login')
    await expect(page.locator('button:has-text("Login with Eagle Eye Networks")')).toBeVisible()
  })

  test('protected route redirects to login', async ({ page }) => {
    await page.goto('/users')

    // Should be redirected to login page
    await expect(page).toHaveURL('/login')
    await expect(page.locator('h2')).toHaveText('Login')
  })

  test('navigation between pages works', async ({ page }) => {
    await page.goto('/')

    // Click Login link
    await page.click('nav a[href="/login"]')
    await expect(page).toHaveURL('/login')

    // Click Home link
    await page.click('nav a[href="/"]')
    await expect(page).toHaveURL('/')
  })
})
