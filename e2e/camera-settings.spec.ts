import { test, expect } from '@playwright/test'
import { getAuthToken, AuthState } from './auth-helper'
import { apiGet } from './api-helper'

test.describe('Camera Settings API', () => {
  let auth: AuthState

  test.beforeAll(async () => {
    // Get auth token (from cache or fresh login)
    auth = await getAuthToken()
  })

  test('GET /api/v3.0/cameras/{id}/settings returns settings', async ({ request }) => {
    // First get a camera from the list
    const listResponse = await apiGet(request, auth, '/api/v3.0/cameras', { pageSize: '1' })

    expect(listResponse.ok()).toBe(true)
    const listData = await listResponse.json()

    if (listData.results?.length > 0) {
      const cameraId = listData.results[0].id

      // Fetch settings for this camera
      const response = await apiGet(request, auth, `/api/v3.0/cameras/${cameraId}/settings`)

      expect(response.ok()).toBe(true)

      const settings = await response.json()
      expect(settings).toHaveProperty('data')
      console.log('Camera settings fetched for:', cameraId)

      // data should be an object containing settings
      expect(typeof settings.data).toBe('object')
    } else {
      console.log('No cameras available to test settings')
    }
  })

  test('GET /api/v3.0/cameras/{id}/settings?include=schema returns schema', async ({ request }) => {
    const listResponse = await apiGet(request, auth, '/api/v3.0/cameras', { pageSize: '1' })

    expect(listResponse.ok()).toBe(true)
    const listData = await listResponse.json()

    if (listData.results?.length > 0) {
      const cameraId = listData.results[0].id

      const response = await apiGet(request, auth, `/api/v3.0/cameras/${cameraId}/settings`, {
        include: 'schema'
      })

      expect(response.ok()).toBe(true)

      const settings = await response.json()
      expect(settings).toHaveProperty('data')
      expect(settings).toHaveProperty('schema')
      console.log('Camera settings with schema fetched for:', cameraId)
    } else {
      console.log('No cameras available to test settings with schema')
    }
  })

  test('GET /api/v3.0/cameras/{id}/settings?include=proposedValues returns proposedValues', async ({ request }) => {
    const listResponse = await apiGet(request, auth, '/api/v3.0/cameras', { pageSize: '1' })

    expect(listResponse.ok()).toBe(true)
    const listData = await listResponse.json()

    if (listData.results?.length > 0) {
      const cameraId = listData.results[0].id

      const response = await apiGet(request, auth, `/api/v3.0/cameras/${cameraId}/settings`, {
        include: 'proposedValues'
      })

      expect(response.ok()).toBe(true)

      const settings = await response.json()
      expect(settings).toHaveProperty('data')
      expect(settings).toHaveProperty('proposedValues')
      console.log('Camera settings with proposedValues fetched for:', cameraId)
    } else {
      console.log('No cameras available to test settings with proposedValues')
    }
  })

  test('GET /api/v3.0/cameras/{id}/settings?include=schema,proposedValues returns both', async ({ request }) => {
    const listResponse = await apiGet(request, auth, '/api/v3.0/cameras', { pageSize: '1' })

    expect(listResponse.ok()).toBe(true)
    const listData = await listResponse.json()

    if (listData.results?.length > 0) {
      const cameraId = listData.results[0].id

      const response = await apiGet(request, auth, `/api/v3.0/cameras/${cameraId}/settings`, {
        include: 'schema,proposedValues'
      })

      expect(response.ok()).toBe(true)

      const settings = await response.json()
      expect(settings).toHaveProperty('data')
      expect(settings).toHaveProperty('schema')
      expect(settings).toHaveProperty('proposedValues')
      console.log('Camera settings with schema and proposedValues fetched for:', cameraId)
    } else {
      console.log('No cameras available to test settings with both includes')
    }
  })

  test('GET /api/v3.0/cameras/{id}/settings returns 404 for non-existent camera', async ({ request }) => {
    const response = await apiGet(request, auth, '/api/v3.0/cameras/non-existent-camera-id-12345/settings')

    expect(response.ok()).toBe(false)
    expect(response.status()).toBe(404)
    console.log('Correctly returned 404 for non-existent camera settings')
  })
})
