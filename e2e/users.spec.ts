import { test, expect } from '@playwright/test'
import { getAuthToken, AuthState } from './auth-helper'
import { apiGet, apiGetUnauthenticated } from './api-helper'

test.describe('Users API', () => {
  let auth: AuthState

  test.beforeAll(async () => {
    // Get auth token (from cache or fresh login)
    auth = await getAuthToken()
  })

  test('GET /api/v3.0/users/self returns current user', async ({ request }) => {
    const response = await apiGet(request, auth, '/api/v3.0/users/self')

    expect(response.ok()).toBe(true)

    const user = await response.json()
    console.log('Current user:', user.email)

    // Verify essential fields
    expect(user).toHaveProperty('id')
    expect(user).toHaveProperty('email')
    expect(user).toHaveProperty('firstName')
    expect(user).toHaveProperty('lastName')
    expect(user.email).toBeTruthy()
  })

  test('GET /api/v3.0/users returns user list', async ({ request }) => {
    const response = await apiGet(request, auth, '/api/v3.0/users', { pageSize: '10' })

    expect(response.ok()).toBe(true)

    const data = await response.json()
    console.log('Users returned:', data.results?.length || 0)

    // Verify response structure
    expect(data).toHaveProperty('results')
    expect(Array.isArray(data.results)).toBe(true)

    // Check user structure if results exist
    if (data.results.length > 0) {
      const firstUser = data.results[0]
      expect(firstUser).toHaveProperty('id')
      expect(firstUser).toHaveProperty('email')
    }
  })

  test('GET /api/v3.0/users with pagination', async ({ request }) => {
    // First request with small page size
    const response1 = await apiGet(request, auth, '/api/v3.0/users', { pageSize: '2' })

    expect(response1.ok()).toBe(true)
    const data1 = await response1.json()

    expect(data1).toHaveProperty('results')
    expect(data1.results.length).toBeLessThanOrEqual(2)

    // If there's a next page, fetch it
    if (data1.nextPageToken) {
      console.log('Fetching next page...')
      const response2 = await apiGet(request, auth, '/api/v3.0/users', {
        pageSize: '2',
        pageToken: data1.nextPageToken
      })

      expect(response2.ok()).toBe(true)
      const data2 = await response2.json()
      expect(data2).toHaveProperty('results')
      console.log('Second page users:', data2.results?.length || 0)
    } else {
      console.log('No additional pages available')
    }
  })

  test('GET /api/v3.0/users/{id} returns specific user', async ({ request }) => {
    // First get current user to get a valid ID
    const selfResponse = await apiGet(request, auth, '/api/v3.0/users/self')

    expect(selfResponse.ok()).toBe(true)
    const self = await selfResponse.json()

    // Now fetch that user by ID
    const response = await apiGet(request, auth, `/api/v3.0/users/${self.id}`)

    expect(response.ok()).toBe(true)

    const user = await response.json()
    expect(user.id).toBe(self.id)
    expect(user.email).toBe(self.email)
    console.log('Fetched user by ID:', user.email)
  })

  test('API returns 401 for invalid token', async ({ request }) => {
    const response = await apiGetUnauthenticated(request, auth.baseUrl, '/api/v3.0/users/self')

    expect(response.ok()).toBe(false)
    expect(response.status()).toBe(401)
    console.log('Correctly rejected invalid token')
  })
})
