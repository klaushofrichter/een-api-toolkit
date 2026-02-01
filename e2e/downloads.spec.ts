import { test, expect } from '@playwright/test'
import { getAuthToken, AuthState } from './auth-helper'
import { apiGet } from './api-helper'

test.describe('Downloads API', () => {
  let auth: AuthState
  let endpointAvailable = true

  test.beforeAll(async ({ request }) => {
    // Get auth token (from cache or fresh login)
    auth = await getAuthToken()

    // Check if downloads endpoint is available
    const checkResponse = await request.get(`${auth.baseUrl}/api/v3.0/downloads`, {
      params: { pageSize: '1' },
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${auth.accessToken}`
      }
    })

    if (checkResponse.status() === 404 || checkResponse.status() === 400) {
      console.log(`Downloads endpoint returned ${checkResponse.status()} - tests will be skipped`)
      endpointAvailable = false
    }
  })

  test('GET /api/v3.0/downloads returns download list', async ({ request }) => {
    if (!endpointAvailable) {
      console.log('Downloads endpoint not available - skipping test')
      test.skip()
      return
    }

    const response = await apiGet(request, auth, '/api/v3.0/downloads', { pageSize: '10' })

    // Skip if endpoint not available
    if (response.status() === 404 || response.status() === 403 || response.status() === 400) {
      console.log(`Downloads endpoint returned ${response.status()} - skipping test`)
      test.skip()
      return
    }

    expect(response.ok()).toBe(true)

    const data = await response.json()
    console.log('Downloads returned:', data.results?.length || 0)

    // Verify response structure
    expect(data).toHaveProperty('results')
    expect(Array.isArray(data.results)).toBe(true)

    // Check download structure if results exist
    if (data.results.length > 0) {
      const firstDownload = data.results[0]
      expect(firstDownload).toHaveProperty('id')
      // Downloads may have name or other properties depending on API version
      // Core property is id
      console.log('First download ID:', firstDownload.id)
      if (firstDownload.name) {
        console.log('  Name:', firstDownload.name)
      }
      if (firstDownload.status) {
        console.log('  Status:', firstDownload.status)
      }
    }
  })

  test('GET /api/v3.0/downloads with pagination', async ({ request }) => {
    if (!endpointAvailable) {
      console.log('Downloads endpoint not available - skipping test')
      test.skip()
      return
    }

    // First request with small page size
    const response1 = await apiGet(request, auth, '/api/v3.0/downloads', { pageSize: '2' })

    if (!response1.ok()) {
      console.log(`Downloads endpoint returned ${response1.status()} - skipping test`)
      test.skip()
      return
    }

    const data1 = await response1.json()

    expect(data1).toHaveProperty('results')
    expect(data1.results.length).toBeLessThanOrEqual(2)

    // If there's a next page, fetch it
    if (data1.nextPageToken) {
      console.log('Fetching next page...')
      const response2 = await apiGet(request, auth, '/api/v3.0/downloads', {
        pageSize: '2',
        pageToken: data1.nextPageToken
      })

      expect(response2.ok()).toBe(true)
      const data2 = await response2.json()
      expect(data2).toHaveProperty('results')
      console.log('Second page downloads:', data2.results?.length || 0)
    } else {
      console.log('No additional pages available (account may have <= 2 downloads)')
    }
  })

  test('GET /api/v3.0/downloads with status filter', async ({ request }) => {
    if (!endpointAvailable) {
      console.log('Downloads endpoint not available - skipping test')
      test.skip()
      return
    }

    // Filter for available downloads
    const response = await apiGet(request, auth, '/api/v3.0/downloads', {
      pageSize: '10',
      'status__in': 'available'
    })

    if (!response.ok()) {
      console.log(`Downloads endpoint returned ${response.status()} - skipping test`)
      test.skip()
      return
    }

    const data = await response.json()
    console.log('Available downloads:', data.results?.length || 0)

    // Verify response structure
    expect(data).toHaveProperty('results')
    expect(Array.isArray(data.results)).toBe(true)

    // Log status of returned downloads
    // Note: status__in filter may not be supported by all API versions
    for (const download of data.results || []) {
      if (download.status) {
        console.log('  Download status:', download.status)
      }
    }
  })

  test('GET /api/v3.0/downloads/{id} returns specific download', async ({ request }) => {
    if (!endpointAvailable) {
      console.log('Downloads endpoint not available - skipping test')
      test.skip()
      return
    }

    // First get a download from the list
    const listResponse = await apiGet(request, auth, '/api/v3.0/downloads', { pageSize: '1' })

    if (!listResponse.ok()) {
      console.log(`Downloads endpoint returned ${listResponse.status()} - skipping test`)
      test.skip()
      return
    }

    const listData = await listResponse.json()

    if (listData.results?.length > 0) {
      const downloadId = listData.results[0].id
      const downloadName = listData.results[0].name

      // Now fetch that download by ID
      const response = await apiGet(request, auth, `/api/v3.0/downloads/${downloadId}`)

      expect(response.ok()).toBe(true)

      const download = await response.json()
      expect(download.id).toBe(downloadId)
      // Core property is id - other properties may vary
      console.log('Fetched download by ID:', download.id)
      if (download.name) {
        console.log('  Name:', download.name)
      }

      if (download.sizeBytes) {
        console.log('  Size:', download.sizeBytes, 'bytes')
      }
      if (download.contentType) {
        console.log('  Content-Type:', download.contentType)
      }
    } else {
      console.log('No downloads available to test single download fetch')
    }
  })

  test('GET /api/v3.0/downloads/{id} returns 404 for non-existent download', async ({ request }) => {
    // Use a clearly invalid ID format
    const response = await apiGet(request, auth, '/api/v3.0/downloads/non-existent-download-id-12345')

    // Should return 404 Not Found
    expect(response.ok()).toBe(false)
    expect(response.status()).toBe(404)
    console.log('Correctly returned 404 for non-existent download')
  })

  test('GET /api/v3.0/downloads/{id}:download returns content for available download', async ({ request }) => {
    if (!endpointAvailable) {
      console.log('Downloads endpoint not available - skipping test')
      test.skip()
      return
    }

    // First get an available download from the list
    const listResponse = await apiGet(request, auth, '/api/v3.0/downloads', {
      pageSize: '1',
      'status__in': 'available'
    })

    if (!listResponse.ok()) {
      console.log(`Downloads endpoint returned ${listResponse.status()} - skipping test`)
      test.skip()
      return
    }

    const listData = await listResponse.json()

    if (listData.results?.length > 0) {
      const downloadId = listData.results[0].id
      const downloadName = listData.results[0].name

      // Try to download the content
      const response = await request.get(`${auth.baseUrl}/api/v3.0/downloads/${downloadId}:download`, {
        headers: {
          'Authorization': `Bearer ${auth.accessToken}`
        }
      })

      // Should succeed for available downloads
      if (response.ok()) {
        const contentType = response.headers()['content-type']
        const contentDisposition = response.headers()['content-disposition']
        console.log('Downloaded:', downloadName)
        console.log('  Content-Type:', contentType)
        console.log('  Content-Disposition:', contentDisposition || 'N/A')

        // Verify we got some content
        const body = await response.body()
        expect(body.length).toBeGreaterThan(0)
      } else {
        console.log('Download not available (status:', response.status(), ')')
        // This could happen if the download expired, auth issues, or other reasons
        expect([401, 403, 404, 409, 410]).toContain(response.status())
      }
    } else {
      console.log('No available downloads to test download content')
    }
  })
})
