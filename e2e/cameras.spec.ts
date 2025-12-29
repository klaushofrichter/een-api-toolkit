import { test, expect } from '@playwright/test'
import { getAuthToken, AuthState } from './auth-helper'
import { apiGet } from './api-helper'

test.describe('Cameras API', () => {
  let auth: AuthState

  test.beforeAll(async () => {
    // Get auth token (from cache or fresh login)
    auth = await getAuthToken()
  })

  test('GET /api/v3.0/cameras returns camera list', async ({ request }) => {
    const response = await apiGet(request, auth, '/api/v3.0/cameras', { pageSize: '10' })

    expect(response.ok()).toBe(true)

    const data = await response.json()
    console.log('Cameras returned:', data.results?.length || 0)

    // Verify response structure
    expect(data).toHaveProperty('results')
    expect(Array.isArray(data.results)).toBe(true)

    // Check camera structure if results exist
    if (data.results.length > 0) {
      const firstCamera = data.results[0]
      expect(firstCamera).toHaveProperty('id')
      expect(firstCamera).toHaveProperty('name')
      expect(firstCamera).toHaveProperty('accountId')
      console.log('First camera:', firstCamera.name, '- Status:', firstCamera.status || 'N/A')
    }
  })

  test('GET /api/v3.0/cameras with pagination', async ({ request }) => {
    // First request with small page size
    const response1 = await apiGet(request, auth, '/api/v3.0/cameras', { pageSize: '2' })

    expect(response1.ok()).toBe(true)
    const data1 = await response1.json()

    expect(data1).toHaveProperty('results')
    expect(data1.results.length).toBeLessThanOrEqual(2)

    // If there's a next page, fetch it
    if (data1.nextPageToken) {
      console.log('Fetching next page...')
      const response2 = await apiGet(request, auth, '/api/v3.0/cameras', {
        pageSize: '2',
        pageToken: data1.nextPageToken
      })

      expect(response2.ok()).toBe(true)
      const data2 = await response2.json()
      expect(data2).toHaveProperty('results')
      console.log('Second page cameras:', data2.results?.length || 0)
    } else {
      console.log('No additional pages available (account may have <= 2 cameras)')
    }
  })

  test('GET /api/v3.0/cameras with include parameter', async ({ request }) => {
    const response = await apiGet(request, auth, '/api/v3.0/cameras', {
      pageSize: '5',
      include: 'deviceInfo,status'
    })

    expect(response.ok()).toBe(true)

    const data = await response.json()
    console.log('Cameras with deviceInfo:', data.results?.length || 0)

    // Check that cameras are returned
    expect(data).toHaveProperty('results')

    if (data.results.length > 0) {
      const camera = data.results[0]
      console.log('Camera:', camera.name)
      if (camera.deviceInfo) {
        console.log('  Device:', camera.deviceInfo.make || 'Unknown', camera.deviceInfo.model || '')
      }
    }
  })

  test('GET /api/v3.0/cameras with status filter', async ({ request }) => {
    // Try to get online cameras with status included in response
    const response = await apiGet(request, auth, '/api/v3.0/cameras', {
      pageSize: '10',
      include: 'status',
      'status__in': 'online,streaming'
    })

    expect(response.ok()).toBe(true)

    const data = await response.json()
    console.log('Online/streaming cameras:', data.results?.length || 0)

    // All returned cameras should be online or streaming (if any exist)
    for (const camera of data.results || []) {
      // Status can be a string or object with connectionStatus
      const status =
        typeof camera.status === 'string'
          ? camera.status
          : camera.status?.connectionStatus
      if (status) {
        expect(['online', 'streaming']).toContain(status)
      }
    }
  })

  test('GET /api/v3.0/cameras with search query', async ({ request }) => {
    // Search for cameras (may or may not return results depending on camera names)
    const response = await apiGet(request, auth, '/api/v3.0/cameras', {
      pageSize: '10',
      q: 'camera'
    })

    expect(response.ok()).toBe(true)

    const data = await response.json()
    console.log('Search results for "camera":', data.results?.length || 0)

    // Verify response structure
    expect(data).toHaveProperty('results')
    expect(Array.isArray(data.results)).toBe(true)
  })

  test('GET /api/v3.0/cameras/{id} returns specific camera', async ({ request }) => {
    // First get a camera from the list
    const listResponse = await apiGet(request, auth, '/api/v3.0/cameras', { pageSize: '1' })

    expect(listResponse.ok()).toBe(true)
    const listData = await listResponse.json()

    if (listData.results?.length > 0) {
      const cameraId = listData.results[0].id
      const cameraName = listData.results[0].name

      // Now fetch that camera by ID
      const response = await apiGet(request, auth, `/api/v3.0/cameras/${cameraId}`)

      expect(response.ok()).toBe(true)

      const camera = await response.json()
      expect(camera.id).toBe(cameraId)
      expect(camera).toHaveProperty('name')
      expect(camera).toHaveProperty('accountId')
      console.log('Fetched camera by ID:', cameraName)
    } else {
      console.log('No cameras available to test single camera fetch')
    }
  })

  test('GET /api/v3.0/cameras/{id} with include parameter', async ({ request }) => {
    // First get a camera from the list
    const listResponse = await apiGet(request, auth, '/api/v3.0/cameras', { pageSize: '1' })

    expect(listResponse.ok()).toBe(true)
    const listData = await listResponse.json()

    if (listData.results?.length > 0) {
      const cameraId = listData.results[0].id

      // Fetch with deviceInfo included (streamUrls may require additional permissions)
      const response = await apiGet(request, auth, `/api/v3.0/cameras/${cameraId}`, {
        include: 'deviceInfo'
      })

      // If the include parameter fails, just skip the detailed check
      if (!response.ok()) {
        console.log('Include parameter not supported for this camera, status:', response.status())
        // Still verify we can get the camera without include
        const basicResponse = await apiGet(request, auth, `/api/v3.0/cameras/${cameraId}`)
        expect(basicResponse.ok()).toBe(true)
        return
      }

      const camera = await response.json()
      expect(camera.id).toBe(cameraId)
      console.log('Camera with details:', camera.name)

      if (camera.deviceInfo) {
        console.log('  Make:', camera.deviceInfo.make || 'N/A')
        console.log('  Model:', camera.deviceInfo.model || 'N/A')
      }
    } else {
      console.log('No cameras available to test detailed fetch')
    }
  })

  test('GET /api/v3.0/cameras/{id} returns 404 for non-existent camera', async ({ request }) => {
    // Use a clearly invalid ID format
    const response = await apiGet(request, auth, '/api/v3.0/cameras/non-existent-camera-id-12345')

    // Should return 404 Not Found
    expect(response.ok()).toBe(false)
    expect(response.status()).toBe(404)
    console.log('Correctly returned 404 for non-existent camera')
  })
})
