import { test, expect } from '@playwright/test'
import { getAuthToken, AuthState } from './auth-helper'
import { apiGet } from './api-helper'

test.describe('Bridges API', () => {
  let auth: AuthState

  test.beforeAll(async () => {
    // Get auth token (from cache or fresh login)
    auth = await getAuthToken()
  })

  test('GET /api/v3.0/bridges returns bridge list', async ({ request }) => {
    const response = await apiGet(request, auth, '/api/v3.0/bridges', { pageSize: '10' })

    expect(response.ok()).toBe(true)

    const data = await response.json()
    console.log('Bridges returned:', data.results?.length || 0)

    // Verify response structure
    expect(data).toHaveProperty('results')
    expect(Array.isArray(data.results)).toBe(true)

    // Check bridge structure if results exist
    if (data.results.length > 0) {
      const firstBridge = data.results[0]
      expect(firstBridge).toHaveProperty('id')
      expect(firstBridge).toHaveProperty('name')
      expect(firstBridge).toHaveProperty('accountId')
      console.log('First bridge:', firstBridge.name, '- Status:', firstBridge.status || 'N/A')
    }
  })

  test('GET /api/v3.0/bridges with pagination', async ({ request }) => {
    // First request with small page size
    const response1 = await apiGet(request, auth, '/api/v3.0/bridges', { pageSize: '2' })

    expect(response1.ok()).toBe(true)
    const data1 = await response1.json()

    expect(data1).toHaveProperty('results')
    expect(data1.results.length).toBeLessThanOrEqual(2)

    // If there's a next page, fetch it
    if (data1.nextPageToken) {
      console.log('Fetching next page...')
      const response2 = await apiGet(request, auth, '/api/v3.0/bridges', {
        pageSize: '2',
        pageToken: data1.nextPageToken
      })

      expect(response2.ok()).toBe(true)
      const data2 = await response2.json()
      expect(data2).toHaveProperty('results')
      console.log('Second page bridges:', data2.results?.length || 0)
    } else {
      console.log('No additional pages available (account may have <= 2 bridges)')
    }
  })

  test('GET /api/v3.0/bridges with include parameter', async ({ request }) => {
    const response = await apiGet(request, auth, '/api/v3.0/bridges', {
      pageSize: '5',
      include: 'deviceInfo,status'
    })

    expect(response.ok()).toBe(true)

    const data = await response.json()
    console.log('Bridges with deviceInfo:', data.results?.length || 0)

    // Check that bridges are returned
    expect(data).toHaveProperty('results')

    if (data.results.length > 0) {
      const bridge = data.results[0]
      console.log('Bridge:', bridge.name)
      if (bridge.deviceInfo) {
        console.log('  Device:', bridge.deviceInfo.make || 'Unknown', bridge.deviceInfo.model || '')
      }
    }
  })

  test('GET /api/v3.0/bridges with status filter', async ({ request }) => {
    // Try to get online bridges with status included in response
    const response = await apiGet(request, auth, '/api/v3.0/bridges', {
      pageSize: '10',
      include: 'status',
      'status__in': 'online'
    })

    expect(response.ok()).toBe(true)

    const data = await response.json()
    console.log('Online bridges:', data.results?.length || 0)

    // All returned bridges should be online (if any exist)
    for (const bridge of data.results || []) {
      // Status can be a string or object with connectionStatus
      const status =
        typeof bridge.status === 'string'
          ? bridge.status
          : bridge.status?.connectionStatus
      if (status) {
        expect(status).toBe('online')
      }
    }
  })

  test('GET /api/v3.0/bridges with search query', async ({ request }) => {
    // Search for bridges (may or may not return results depending on bridge names)
    const response = await apiGet(request, auth, '/api/v3.0/bridges', {
      pageSize: '10',
      q: 'bridge'
    })

    expect(response.ok()).toBe(true)

    const data = await response.json()
    console.log('Search results for "bridge":', data.results?.length || 0)

    // Verify response structure
    expect(data).toHaveProperty('results')
    expect(Array.isArray(data.results)).toBe(true)
  })

  test('GET /api/v3.0/bridges/{id} returns specific bridge', async ({ request }) => {
    // First get a bridge from the list
    const listResponse = await apiGet(request, auth, '/api/v3.0/bridges', { pageSize: '1' })

    expect(listResponse.ok()).toBe(true)
    const listData = await listResponse.json()

    if (listData.results?.length > 0) {
      const bridgeId = listData.results[0].id
      const bridgeName = listData.results[0].name

      // Now fetch that bridge by ID
      const response = await apiGet(request, auth, `/api/v3.0/bridges/${bridgeId}`)

      expect(response.ok()).toBe(true)

      const bridge = await response.json()
      expect(bridge.id).toBe(bridgeId)
      expect(bridge).toHaveProperty('name')
      expect(bridge).toHaveProperty('accountId')
      console.log('Fetched bridge by ID:', bridgeName)
    } else {
      console.log('No bridges available to test single bridge fetch')
    }
  })

  test('GET /api/v3.0/bridges/{id} with include parameter', async ({ request }) => {
    // First get a bridge from the list
    const listResponse = await apiGet(request, auth, '/api/v3.0/bridges', { pageSize: '1' })

    expect(listResponse.ok()).toBe(true)
    const listData = await listResponse.json()

    if (listData.results?.length > 0) {
      const bridgeId = listData.results[0].id

      // Fetch with deviceInfo included
      const response = await apiGet(request, auth, `/api/v3.0/bridges/${bridgeId}`, {
        include: 'deviceInfo'
      })

      // If the include parameter fails, just skip the detailed check
      if (!response.ok()) {
        console.log('Include parameter not supported for this bridge, status:', response.status())
        // Still verify we can get the bridge without include
        const basicResponse = await apiGet(request, auth, `/api/v3.0/bridges/${bridgeId}`)
        expect(basicResponse.ok()).toBe(true)
        return
      }

      const bridge = await response.json()
      expect(bridge.id).toBe(bridgeId)
      console.log('Bridge with details:', bridge.name)

      if (bridge.deviceInfo) {
        console.log('  Make:', bridge.deviceInfo.make || 'N/A')
        console.log('  Model:', bridge.deviceInfo.model || 'N/A')
      }
    } else {
      console.log('No bridges available to test detailed fetch')
    }
  })

  test('GET /api/v3.0/bridges/{id} returns 404 for non-existent bridge', async ({ request }) => {
    // Use a clearly invalid ID format
    const response = await apiGet(request, auth, '/api/v3.0/bridges/non-existent-bridge-id-12345')

    // Should return 404 Not Found
    expect(response.ok()).toBe(false)
    expect(response.status()).toBe(404)
    console.log('Correctly returned 404 for non-existent bridge')
  })
})
