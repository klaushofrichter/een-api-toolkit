import { test, expect } from '@playwright/test'

test.describe('vue-ptz example app', () => {
  test('home page shows login button when not authenticated', async ({ page }) => {
    await page.goto('/')

    // Should show the home page
    await expect(page.getByRole('heading', { name: 'Welcome to the EEN PTZ Control Example' })).toBeVisible()

    // Should show "not authenticated" state with login button
    await expect(page.getByTestId('not-authenticated')).toBeVisible()
    await expect(page.getByTestId('login-button')).toBeVisible()
    await expect(page.getByText('Please log in to control PTZ cameras')).toBeVisible()
  })

  test('login button navigates to login page', async ({ page }) => {
    await page.goto('/')

    await page.getByTestId('login-button').click()

    await expect(page).toHaveURL('/login')
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible()
    await expect(page.getByText('Click the button below to authenticate with Eagle Eye Networks')).toBeVisible()
  })

  test('ptz route redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/ptz')

    // Should redirect to login page (auth guard)
    await expect(page).toHaveURL('/login')
  })

  test('navigation links work correctly', async ({ page }) => {
    await page.goto('/')

    // Check navigation is present
    await expect(page.getByRole('navigation')).toBeVisible()

    // Navigate to login via nav link (use testid to be specific)
    await page.getByTestId('nav-login').click()
    await expect(page).toHaveURL('/login')

    // Navigate back home
    await page.getByRole('link', { name: 'Home' }).click()
    await expect(page).toHaveURL('/')
  })

  test('about section displays toolkit function list', async ({ page }) => {
    await page.goto('/')

    // Check for the function descriptions
    await expect(page.getByText('getCameras()')).toBeVisible()
    await expect(page.getByText('getPtzPosition()')).toBeVisible()
    await expect(page.getByText('movePtz()')).toBeVisible()
    await expect(page.getByText('getPtzSettings()')).toBeVisible()
    await expect(page.getByText('updatePtzSettings()')).toBeVisible()
  })
})
