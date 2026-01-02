/**
 * Authenticated E2E tests for vue-feeds example
 *
 * These tests require:
 * - TEST_USER and TEST_PASSWORD environment variables
 * - VITE_EEN_CLIENT_ID environment variable
 * - Running OAuth proxy server (see ../../../scripts/restart-proxy.sh)
 */

import { test, expect } from '@playwright/test'
import { getAuthToken, injectAuthState, AuthState } from '../../../e2e/auth-helper'

test.describe('vue-feeds authenticated tests', () => {
  let authState: AuthState

  test.beforeAll(async () => {
    // Get auth token (from cache or fresh login)
    authState = await getAuthToken()
  })

  test.beforeEach(async ({ page }) => {
    // Navigate to home and inject auth state before each test
    await page.goto('/')
    await injectAuthState(page, authState)
  })

  test('authenticated home page shows view feeds button', async ({ page }) => {
    // Reload to apply auth state (already injected by beforeEach)
    await page.reload()

    // Should show authenticated state
    await expect(page.getByTestId('authenticated')).toBeVisible()
    await expect(page.getByTestId('view-feeds-button')).toBeVisible()
    await expect(page.getByText('You are logged in!')).toBeVisible()
  })

  test('authenticated user sees cameras on feeds page', async ({ page }) => {
    // Navigate to feeds page (auth already injected by beforeEach)
    await page.goto('/feeds')

    // Should show the feeds view
    await expect(page.getByRole('heading', { name: 'Camera Feeds' })).toBeVisible()

    // Wait for cameras to load (or show no cameras message)
    await page.waitForSelector('[data-testid="camera-select"], .no-cameras', {
      timeout: 30000
    })

    // Either cameras are loaded or we see "no cameras" message
    const cameraSelect = page.getByTestId('camera-select')
    const noCameras = page.locator('.no-cameras')

    const hasCameras = await cameraSelect.isVisible().catch(() => false)
    const hasNoCameras = await noCameras.isVisible().catch(() => false)

    expect(hasCameras || hasNoCameras).toBe(true)

    if (hasCameras) {
      console.log('Cameras found - checking controls')

      // Verify controls are present
      await expect(page.getByTestId('refresh-button')).toBeVisible()

      // Wait for feeds to load
      await page.waitForSelector('[data-testid="feeds-table"], .no-feeds', {
        timeout: 30000
      })

      // Check if we have feeds
      const hasFeeds = await page.getByTestId('feeds-table').isVisible().catch(() => false)
      if (hasFeeds) {
        console.log('Feeds loaded successfully')

        // Check feeds summary
        await expect(page.getByTestId('feeds-summary')).toBeVisible()

        // Check that at least one feed row exists
        const feedRows = page.getByTestId('feed-row')
        const count = await feedRows.count()
        expect(count).toBeGreaterThan(0)
        console.log(`Found ${count} feeds`)
      } else {
        console.log('No feeds available for this camera')
      }
    } else {
      console.log('No cameras in account')
    }
  })

  test('feeds table shows correct feed information', async ({ page }) => {
    // Navigate to feeds page (auth already injected by beforeEach)
    await page.goto('/feeds')

    // Wait for cameras to load
    await page.waitForSelector('[data-testid="camera-select"], .no-cameras', {
      timeout: 30000
    })

    const hasCameras = await page.getByTestId('camera-select').isVisible().catch(() => false)

    if (hasCameras) {
      // Wait for feeds to load
      await page.waitForSelector('[data-testid="feeds-table"], .no-feeds', {
        timeout: 30000
      })

      const hasFeeds = await page.getByTestId('feeds-table').isVisible().catch(() => false)

      if (hasFeeds) {
        // Verify feed ID is displayed
        const feedId = await page.getByTestId('feed-id').first().textContent()
        expect(feedId).toBeTruthy()
        console.log(`First feed ID: ${feedId}`)

        // Verify feed type is displayed (main, preview, or talkdown)
        const feedType = await page.getByTestId('feed-type').first().textContent()
        expect(feedType).toMatch(/main|preview|talkdown/i)
        console.log(`First feed type: ${feedType}`)

        // Verify media type is displayed
        const mediaType = await page.getByTestId('feed-media-type').first().textContent()
        expect(mediaType).toBeTruthy()
        console.log(`First feed media type: ${mediaType}`)

        // Verify URL availability is shown
        const feedUrls = page.getByTestId('feed-urls').first()
        await expect(feedUrls).toBeVisible()
      } else {
        console.log('No feeds to test')
      }
    } else {
      console.log('No cameras to test with')
    }
  })

  test('refresh button fetches feeds', async ({ page }) => {
    // Navigate to feeds page (auth already injected by beforeEach)
    await page.goto('/feeds')

    // Wait for cameras to load
    await page.waitForSelector('[data-testid="camera-select"], .no-cameras', {
      timeout: 30000
    })

    const hasCameras = await page.getByTestId('camera-select').isVisible().catch(() => false)

    if (hasCameras) {
      // Wait for feeds to load
      await page.waitForSelector('[data-testid="feeds-table"], .no-feeds', {
        timeout: 30000
      })

      // Click refresh
      await page.getByTestId('refresh-button').click()

      // Button should be visible (not broken)
      await expect(page.getByTestId('refresh-button')).toBeVisible()

      console.log('Refresh button clicked successfully')
    } else {
      console.log('No cameras to test refresh with')
    }
  })

  test('camera selection changes feeds', async ({ page }) => {
    // Navigate to feeds page (auth already injected by beforeEach)
    await page.goto('/feeds')

    // Wait for cameras to load
    await page.waitForSelector('[data-testid="camera-select"], .no-cameras', {
      timeout: 30000
    })

    const cameraSelect = page.getByTestId('camera-select')
    const hasCameras = await cameraSelect.isVisible().catch(() => false)

    if (hasCameras) {
      // Get all camera options
      const options = await cameraSelect.locator('option').all()

      if (options.length >= 2) {
        // Wait for initial feeds to load
        await page.waitForSelector('[data-testid="feeds-table"], .no-feeds', {
          timeout: 30000
        })

        // Get the second camera's value
        const secondCameraValue = await options[1].getAttribute('value')
        console.log(`Selecting camera: ${secondCameraValue}`)

        // Select the second camera
        await cameraSelect.selectOption(secondCameraValue!)

        // Wait for feeds to reload
        await page.waitForSelector('[data-testid="feeds-list"]', {
          timeout: 30000
        })

        // Give it a moment to fetch new feeds
        await page.waitForTimeout(2000)

        // Verify feeds list is visible
        await expect(page.getByTestId('feeds-list')).toBeVisible()

        console.log('Camera selection changed successfully')
      } else {
        console.log('Only one camera available - cannot test camera switching')
      }
    } else {
      console.log('No cameras to test with')
    }
  })

  test('preview button opens modal with multipart image', async ({ page }) => {
    // Navigate to feeds page (auth already injected by beforeEach)
    await page.goto('/feeds')

    // Wait for cameras to load
    await page.waitForSelector('[data-testid="camera-select"], .no-cameras', {
      timeout: 30000
    })

    const hasCameras = await page.getByTestId('camera-select').isVisible().catch(() => false)

    if (hasCameras) {
      // Wait for feeds to load
      await page.waitForSelector('[data-testid="feeds-table"], .no-feeds', {
        timeout: 30000
      })

      const hasFeeds = await page.getByTestId('feeds-table').isVisible().catch(() => false)

      if (hasFeeds) {
        // Check if there's a View button (for preview feeds)
        const viewButton = page.getByTestId('view-preview-button').first()
        const hasViewButton = await viewButton.isVisible().catch(() => false)

        if (hasViewButton) {
          console.log('Found View button - clicking to open modal')

          // Click the View button
          await viewButton.click()

          // Wait for modal to appear
          await expect(page.getByTestId('preview-modal')).toBeVisible({ timeout: 10000 })

          // Verify modal shows preview image
          await expect(page.getByTestId('preview-image')).toBeVisible({ timeout: 10000 })

          // Verify modal header shows "Live Preview"
          await expect(page.getByRole('heading', { name: 'Live Preview' })).toBeVisible()

          // Verify mode badge shows PREVIEW
          await expect(page.locator('.mode-preview')).toContainText('PREVIEW')

          console.log('Preview modal opened successfully with multipart image')

          // Close modal
          await page.locator('.close-button').click()
          await expect(page.getByTestId('preview-modal')).not.toBeVisible()
          console.log('Modal closed successfully')
        } else {
          console.log('No preview feeds with View button available')
        }
      } else {
        console.log('No feeds available to test preview modal')
      }
    } else {
      console.log('No cameras to test with')
    }
  })

  test('live button opens modal with video element', async ({ page }) => {
    // Navigate to feeds page (auth already injected by beforeEach)
    await page.goto('/feeds')

    // Wait for cameras to load
    await page.waitForSelector('[data-testid="camera-select"], .no-cameras', {
      timeout: 30000
    })

    const hasCameras = await page.getByTestId('camera-select').isVisible().catch(() => false)

    if (hasCameras) {
      // Wait for feeds to load
      await page.waitForSelector('[data-testid="feeds-table"], .no-feeds', {
        timeout: 30000
      })

      const hasFeeds = await page.getByTestId('feeds-table').isVisible().catch(() => false)

      if (hasFeeds) {
        // Check if there's a Live button (for main feeds)
        const liveButton = page.getByTestId('view-live-button').first()
        const hasLiveButton = await liveButton.isVisible().catch(() => false)

        if (hasLiveButton) {
          console.log('Found Live button - clicking to open modal')

          // Click the Live button
          await liveButton.click()

          // Wait for modal to appear
          await expect(page.getByTestId('preview-modal')).toBeVisible({ timeout: 10000 })

          // Verify modal shows video element
          await expect(page.getByTestId('preview-video')).toBeVisible({ timeout: 10000 })

          // Verify modal header shows "Live Stream (SDK)"
          await expect(page.getByRole('heading', { name: 'Live Stream (SDK)' })).toBeVisible()

          // Verify mode badge shows LIVE
          await expect(page.locator('.mode-live')).toContainText('LIVE')

          console.log('Live modal opened successfully with video element')

          // Close modal
          await page.locator('.close-button').click()
          await expect(page.getByTestId('preview-modal')).not.toBeVisible()
          console.log('Modal closed successfully')
        } else {
          console.log('No main feeds with Live button available')
        }
      } else {
        console.log('No feeds available to test live modal')
      }
    } else {
      console.log('No cameras to test with')
    }
  })

  test('modal closes with escape key', async ({ page }) => {
    // Navigate to feeds page (auth already injected by beforeEach)
    await page.goto('/feeds')

    // Wait for cameras to load
    await page.waitForSelector('[data-testid="camera-select"], .no-cameras', {
      timeout: 30000
    })

    const hasCameras = await page.getByTestId('camera-select').isVisible().catch(() => false)

    if (hasCameras) {
      // Wait for feeds to load
      await page.waitForSelector('[data-testid="feeds-table"], .no-feeds', {
        timeout: 30000
      })

      const hasFeeds = await page.getByTestId('feeds-table').isVisible().catch(() => false)

      if (hasFeeds) {
        // Try View button first, then Live button
        const viewButton = page.getByTestId('view-preview-button').first()
        const liveButton = page.getByTestId('view-live-button').first()

        const hasViewButton = await viewButton.isVisible().catch(() => false)
        const hasLiveButton = await liveButton.isVisible().catch(() => false)

        if (hasViewButton || hasLiveButton) {
          const buttonToClick = hasViewButton ? viewButton : liveButton
          const buttonType = hasViewButton ? 'View' : 'Live'
          console.log(`Opening modal with ${buttonType} button`)

          // Click the button to open modal
          await buttonToClick.click()

          // Wait for modal to appear
          await expect(page.getByTestId('preview-modal')).toBeVisible({ timeout: 10000 })

          // Press Escape key
          await page.keyboard.press('Escape')

          // Verify modal is closed
          await expect(page.getByTestId('preview-modal')).not.toBeVisible({ timeout: 5000 })
          console.log('Modal closed with Escape key successfully')
        } else {
          console.log('No preview or live feeds available to test modal escape')
        }
      } else {
        console.log('No feeds available')
      }
    } else {
      console.log('No cameras to test with')
    }
  })

  test('modal closes when clicking backdrop', async ({ page }) => {
    // Navigate to feeds page (auth already injected by beforeEach)
    await page.goto('/feeds')

    // Wait for cameras to load
    await page.waitForSelector('[data-testid="camera-select"], .no-cameras', {
      timeout: 30000
    })

    const hasCameras = await page.getByTestId('camera-select').isVisible().catch(() => false)

    if (hasCameras) {
      // Wait for feeds to load
      await page.waitForSelector('[data-testid="feeds-table"], .no-feeds', {
        timeout: 30000
      })

      const hasFeeds = await page.getByTestId('feeds-table').isVisible().catch(() => false)

      if (hasFeeds) {
        // Try View button first, then Live button
        const viewButton = page.getByTestId('view-preview-button').first()
        const liveButton = page.getByTestId('view-live-button').first()

        const hasViewButton = await viewButton.isVisible().catch(() => false)
        const hasLiveButton = await liveButton.isVisible().catch(() => false)

        if (hasViewButton || hasLiveButton) {
          const buttonToClick = hasViewButton ? viewButton : liveButton
          const buttonType = hasViewButton ? 'View' : 'Live'
          console.log(`Opening modal with ${buttonType} button`)

          // Click the button to open modal
          await buttonToClick.click()

          // Wait for modal to appear
          await expect(page.getByTestId('preview-modal')).toBeVisible({ timeout: 10000 })

          // Click on the backdrop (modal-overlay) outside the modal-content
          // The modal-overlay covers the entire screen, click in a corner
          await page.getByTestId('preview-modal').click({ position: { x: 10, y: 10 } })

          // Verify modal is closed
          await expect(page.getByTestId('preview-modal')).not.toBeVisible({ timeout: 5000 })
          console.log('Modal closed by clicking backdrop successfully')
        } else {
          console.log('No preview or live feeds available to test backdrop close')
        }
      } else {
        console.log('No feeds available')
      }
    } else {
      console.log('No cameras to test with')
    }
  })

  test('modal displays correct feed information', async ({ page }) => {
    // Navigate to feeds page (auth already injected by beforeEach)
    await page.goto('/feeds')

    // Wait for cameras to load
    await page.waitForSelector('[data-testid="camera-select"], .no-cameras', {
      timeout: 30000
    })

    const hasCameras = await page.getByTestId('camera-select').isVisible().catch(() => false)

    if (hasCameras) {
      // Wait for feeds to load
      await page.waitForSelector('[data-testid="feeds-table"], .no-feeds', {
        timeout: 30000
      })

      const hasFeeds = await page.getByTestId('feeds-table').isVisible().catch(() => false)

      if (hasFeeds) {
        // Try View button first, then Live button
        const viewButton = page.getByTestId('view-preview-button').first()
        const liveButton = page.getByTestId('view-live-button').first()

        const hasViewButton = await viewButton.isVisible().catch(() => false)
        const hasLiveButton = await liveButton.isVisible().catch(() => false)

        if (hasViewButton || hasLiveButton) {
          const buttonToClick = hasViewButton ? viewButton : liveButton
          console.log(`Opening modal to verify feed info`)

          // Click the button to open modal
          await buttonToClick.click()

          // Wait for modal to appear
          await expect(page.getByTestId('preview-modal')).toBeVisible({ timeout: 10000 })

          // Verify feed info is displayed in modal
          const modalFeedInfo = page.locator('.feed-info')
          await expect(modalFeedInfo).toBeVisible()

          // Check that Feed ID is displayed
          await expect(modalFeedInfo).toContainText('Feed ID:')

          // Check that Type is displayed
          await expect(modalFeedInfo).toContainText('Type:')

          // Check that Device is displayed
          await expect(modalFeedInfo).toContainText('Device:')

          // Check that Mode is displayed
          await expect(modalFeedInfo).toContainText('Mode:')

          console.log('Modal displays correct feed information')

          // Close modal
          await page.locator('.close-button').click()
        } else {
          console.log('No preview or live feeds available to test modal info')
        }
      } else {
        console.log('No feeds available')
      }
    } else {
      console.log('No cameras to test with')
    }
  })
})
