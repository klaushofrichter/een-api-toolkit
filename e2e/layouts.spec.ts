import { test, expect } from '@playwright/test'
import { getAuthToken, AuthState } from './auth-helper'
import { apiGet, apiPost, apiPatch, apiDelete } from './api-helper'

// Test layout naming prefix for cleanup
const TEST_LAYOUT_PREFIX = 'E2E-TEST-layout-'

/**
 * Generate a unique test layout name.
 */
function getTestLayoutName(): string {
  return `${TEST_LAYOUT_PREFIX}${Date.now()}`
}

/**
 * Default layout settings for testing.
 */
const DEFAULT_LAYOUT_SETTINGS = {
  showCameraBorder: true,
  showCameraName: true,
  cameraAspectRatio: '16x9',
  paneColumns: 3
}

test.describe('Layouts API', () => {
  let auth: AuthState

  test.beforeAll(async () => {
    // Get auth token (from cache or fresh login)
    auth = await getAuthToken()
  })

  test.afterAll(async ({ request }) => {
    // Clean up any test layouts that may have been left behind
    try {
      const response = await apiGet(request, auth, '/api/v3.0/layouts', {
        name__contains: TEST_LAYOUT_PREFIX,
        pageSize: '100'
      })

      if (response.ok()) {
        const data = await response.json()
        for (const layout of data.results || []) {
          if (layout.name.startsWith(TEST_LAYOUT_PREFIX)) {
            console.log(`Cleaning up test layout: ${layout.name}`)
            await apiDelete(request, auth, `/api/v3.0/layouts/${layout.id}`)
          }
        }
      }
    } catch (err) {
      console.warn('Layout cleanup warning:', err)
    }
  })

  test('GET /api/v3.0/layouts returns layout list', async ({ request }) => {
    const response = await apiGet(request, auth, '/api/v3.0/layouts', { pageSize: '10' })

    expect(response.ok()).toBe(true)

    const data = await response.json()
    console.log('Layouts returned:', data.results?.length || 0)

    // Verify response structure
    expect(data).toHaveProperty('results')
    expect(Array.isArray(data.results)).toBe(true)

    // Check layout structure if results exist
    if (data.results.length > 0) {
      const firstLayout = data.results[0]
      expect(firstLayout).toHaveProperty('id')
      expect(firstLayout).toHaveProperty('name')
      expect(firstLayout).toHaveProperty('accountId')
      expect(firstLayout).toHaveProperty('panes')
      expect(firstLayout).toHaveProperty('settings')
      console.log('First layout:', firstLayout.name, '- Panes:', firstLayout.panes?.length || 0)
    }
  })

  test('GET /api/v3.0/layouts with pagination', async ({ request }) => {
    // First request with small page size
    const response1 = await apiGet(request, auth, '/api/v3.0/layouts', { pageSize: '2' })

    expect(response1.ok()).toBe(true)
    const data1 = await response1.json()

    expect(data1).toHaveProperty('results')
    expect(data1.results.length).toBeLessThanOrEqual(2)

    // If there's a next page, fetch it
    if (data1.nextPageToken) {
      console.log('Fetching next page...')
      const response2 = await apiGet(request, auth, '/api/v3.0/layouts', {
        pageSize: '2',
        pageToken: data1.nextPageToken
      })

      expect(response2.ok()).toBe(true)
      const data2 = await response2.json()
      expect(data2).toHaveProperty('results')
      console.log('Second page layouts:', data2.results?.length || 0)
    } else {
      console.log('No additional pages available (account may have <= 2 layouts)')
    }
  })

  test('GET /api/v3.0/layouts with include parameter', async ({ request }) => {
    const response = await apiGet(request, auth, '/api/v3.0/layouts', {
      pageSize: '5',
      include: 'resourceCounts,effectivePermissions'
    })

    expect(response.ok()).toBe(true)

    const data = await response.json()
    console.log('Layouts with includes:', data.results?.length || 0)

    expect(data).toHaveProperty('results')

    if (data.results.length > 0) {
      const layout = data.results[0]
      console.log('Layout:', layout.name)
      // Check for included fields (may not always be present)
      if (layout.resourceCounts) {
        console.log('  Resource counts:', JSON.stringify(layout.resourceCounts))
      }
      if (layout.effectivePermissions) {
        console.log('  Permissions:', JSON.stringify(layout.effectivePermissions))
      }
    }
  })

  test('GET /api/v3.0/layouts with search query', async ({ request }) => {
    // Search for layouts (may or may not return results depending on layout names)
    const response = await apiGet(request, auth, '/api/v3.0/layouts', {
      pageSize: '10',
      q: 'layout'
    })

    expect(response.ok()).toBe(true)

    const data = await response.json()
    console.log('Search results for "layout":', data.results?.length || 0)

    // Verify response structure
    expect(data).toHaveProperty('results')
    expect(Array.isArray(data.results)).toBe(true)
  })

  test('GET /api/v3.0/layouts/{id} returns specific layout', async ({ request }) => {
    // First get a layout from the list
    const listResponse = await apiGet(request, auth, '/api/v3.0/layouts', { pageSize: '1' })

    expect(listResponse.ok()).toBe(true)
    const listData = await listResponse.json()

    if (listData.results?.length > 0) {
      const layoutId = listData.results[0].id
      const layoutName = listData.results[0].name

      // Now fetch that layout by ID
      const response = await apiGet(request, auth, `/api/v3.0/layouts/${layoutId}`)

      expect(response.ok()).toBe(true)

      const layout = await response.json()
      expect(layout.id).toBe(layoutId)
      expect(layout).toHaveProperty('name')
      expect(layout).toHaveProperty('accountId')
      expect(layout).toHaveProperty('panes')
      expect(layout).toHaveProperty('settings')
      console.log('Fetched layout by ID:', layoutName)
    } else {
      console.log('No layouts available to test single layout fetch')
    }
  })

  test('GET /api/v3.0/layouts/{id} returns 404 for non-existent layout', async ({ request }) => {
    // Use a clearly invalid ID format
    const response = await apiGet(request, auth, '/api/v3.0/layouts/non-existent-layout-id-12345')

    // Should return 404 Not Found
    expect(response.ok()).toBe(false)
    expect(response.status()).toBe(404)
    console.log('Correctly returned 404 for non-existent layout')
  })

  test('CRUD: Create, Update, Delete layout', async ({ request }) => {
    const layoutName = getTestLayoutName()
    const updatedName = `${layoutName}-updated`

    // 1. CREATE
    console.log('Creating layout:', layoutName)
    const createResponse = await apiPost(request, auth, '/api/v3.0/layouts', {
      name: layoutName,
      settings: DEFAULT_LAYOUT_SETTINGS,
      panes: []
    })

    expect(createResponse.ok()).toBe(true)
    const createdLayout = await createResponse.json()

    expect(createdLayout).toHaveProperty('id')
    expect(createdLayout.name).toBe(layoutName)
    expect(createdLayout.settings).toMatchObject(DEFAULT_LAYOUT_SETTINGS)
    console.log('Created layout ID:', createdLayout.id)

    const layoutId = createdLayout.id

    // 2. READ - Verify creation
    const getResponse = await apiGet(request, auth, `/api/v3.0/layouts/${layoutId}`)
    expect(getResponse.ok()).toBe(true)
    const fetchedLayout = await getResponse.json()
    expect(fetchedLayout.name).toBe(layoutName)

    // 3. UPDATE - Change name
    console.log('Updating layout name to:', updatedName)
    const updateResponse = await apiPatch(request, auth, `/api/v3.0/layouts/${layoutId}`, {
      name: updatedName
    })

    expect(updateResponse.ok()).toBe(true)
    // PATCH returns 204 No Content
    expect(updateResponse.status()).toBe(204)

    // 4. READ - Verify update
    const getUpdatedResponse = await apiGet(request, auth, `/api/v3.0/layouts/${layoutId}`)
    expect(getUpdatedResponse.ok()).toBe(true)
    const updatedLayout = await getUpdatedResponse.json()
    expect(updatedLayout.name).toBe(updatedName)
    console.log('Layout updated successfully')

    // 5. DELETE
    console.log('Deleting layout:', layoutId)
    const deleteResponse = await apiDelete(request, auth, `/api/v3.0/layouts/${layoutId}`)

    expect(deleteResponse.ok()).toBe(true)
    expect(deleteResponse.status()).toBe(204)

    // 6. Verify deletion - should return 404
    const getDeletedResponse = await apiGet(request, auth, `/api/v3.0/layouts/${layoutId}`)
    expect(getDeletedResponse.status()).toBe(404)
    console.log('Layout deleted successfully')
  })

  test('POST /api/v3.0/layouts creates layout with panes', async ({ request }) => {
    // First, get a camera to add to the layout
    const camerasResponse = await apiGet(request, auth, '/api/v3.0/cameras', { pageSize: '1' })

    if (!camerasResponse.ok()) {
      console.log('Could not fetch cameras, skipping panes test')
      return
    }

    const camerasData = await camerasResponse.json()
    if (camerasData.results?.length === 0) {
      console.log('No cameras available, skipping panes test')
      return
    }

    const cameraId = camerasData.results[0].id
    const layoutName = getTestLayoutName()

    // Create layout with a pane
    const createResponse = await apiPost(request, auth, '/api/v3.0/layouts', {
      name: layoutName,
      settings: DEFAULT_LAYOUT_SETTINGS,
      panes: [
        {
          id: 1,
          name: 'Test Pane',
          type: 'preview',
          size: 1,
          cameraId: cameraId
        }
      ]
    })

    expect(createResponse.ok()).toBe(true)
    const createdLayout = await createResponse.json()

    expect(createdLayout.panes).toHaveLength(1)
    expect(createdLayout.panes[0].cameraId).toBe(cameraId)
    console.log('Created layout with pane, camera:', cameraId)

    // Clean up
    const deleteResponse = await apiDelete(request, auth, `/api/v3.0/layouts/${createdLayout.id}`)
    expect(deleteResponse.ok()).toBe(true)
  })

  test('PATCH /api/v3.0/layouts/{id} updates settings', async ({ request }) => {
    const layoutName = getTestLayoutName()

    // Create a layout
    const createResponse = await apiPost(request, auth, '/api/v3.0/layouts', {
      name: layoutName,
      settings: DEFAULT_LAYOUT_SETTINGS,
      panes: []
    })

    expect(createResponse.ok()).toBe(true)
    const createdLayout = await createResponse.json()
    const layoutId = createdLayout.id

    // Update settings
    const newSettings = {
      paneColumns: 4,
      showCameraName: false
    }

    const updateResponse = await apiPatch(request, auth, `/api/v3.0/layouts/${layoutId}`, {
      settings: newSettings
    })

    expect(updateResponse.ok()).toBe(true)

    // Verify update
    const getResponse = await apiGet(request, auth, `/api/v3.0/layouts/${layoutId}`)
    expect(getResponse.ok()).toBe(true)
    const updatedLayout = await getResponse.json()

    expect(updatedLayout.settings.paneColumns).toBe(4)
    expect(updatedLayout.settings.showCameraName).toBe(false)
    // Other settings should be preserved
    expect(updatedLayout.settings.showCameraBorder).toBe(DEFAULT_LAYOUT_SETTINGS.showCameraBorder)
    console.log('Layout settings updated successfully')

    // Clean up
    await apiDelete(request, auth, `/api/v3.0/layouts/${layoutId}`)
  })

  test('GET /api/v3.0/layouts with name__contains filter', async ({ request }) => {
    const layoutName = getTestLayoutName()

    // Create a layout
    const createResponse = await apiPost(request, auth, '/api/v3.0/layouts', {
      name: layoutName,
      settings: DEFAULT_LAYOUT_SETTINGS,
      panes: []
    })

    expect(createResponse.ok()).toBe(true)
    const createdLayout = await createResponse.json()

    // Search for it by partial name
    const searchResponse = await apiGet(request, auth, '/api/v3.0/layouts', {
      name__contains: TEST_LAYOUT_PREFIX
    })

    expect(searchResponse.ok()).toBe(true)
    const searchData = await searchResponse.json()

    // Should find our test layout
    const found = searchData.results.some((l: { id: string }) => l.id === createdLayout.id)
    expect(found).toBe(true)
    console.log('Found test layout via name__contains filter')

    // Clean up
    await apiDelete(request, auth, `/api/v3.0/layouts/${createdLayout.id}`)
  })
})
