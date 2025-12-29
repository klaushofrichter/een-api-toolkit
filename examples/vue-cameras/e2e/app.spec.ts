import { test, expect } from '@playwright/test'

test.describe('Cameras Example App', () => {
  test('should display the home page', async ({ page }) => {
    await page.goto('/')

    // Check title
    await expect(page).toHaveTitle('EEN Cameras Example')

    // Check header
    await expect(page.locator('h1')).toContainText('EEN Cameras Example')

    // Check navigation links
    await expect(page.locator('nav')).toContainText('Home')
    await expect(page.locator('nav')).toContainText('Login')
  })

  test('should show welcome message on home page', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('h2')).toContainText('Welcome to the EEN Cameras Example')
  })

  test('should display login prompt when not authenticated', async ({ page }) => {
    await page.goto('/')

    // Should show login prompt
    await expect(page.locator('.login-prompt')).toBeVisible()
    await expect(page.locator('.login-prompt')).toContainText('Please log in to view your cameras')
  })

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/')

    // Click login in nav
    await page.locator('nav a:has-text("Login")').click()

    // Should be on login page
    await expect(page.locator('h2')).toContainText('Login')
    await expect(page.locator('button')).toContainText('Login with Eagle Eye Networks')
  })

  test('should redirect to login when accessing cameras without auth', async ({ page }) => {
    // Try to access cameras directly
    await page.goto('/cameras')

    // Should be redirected to login
    await expect(page.locator('h2')).toContainText('Login')
  })

  test('should show about section on home page', async ({ page }) => {
    await page.goto('/')

    // Check the about section
    await expect(page.locator('.description h3')).toContainText('About This Example')
    await expect(page.locator('.description')).toContainText('useCameras')
    await expect(page.locator('.description')).toContainText('useCamera')
  })

  test('should have correct navigation structure', async ({ page }) => {
    await page.goto('/')

    // Check all expected nav links for unauthenticated state
    const navLinks = page.locator('nav a')
    await expect(navLinks).toHaveCount(2) // Home, Login

    // Verify Home link
    await expect(navLinks.nth(0)).toHaveAttribute('href', '/')

    // Verify Login link
    await expect(navLinks.nth(1)).toHaveAttribute('href', '/login')
  })
})
