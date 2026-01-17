import { test, expect } from '@playwright/test'
import { getAuthToken, AuthState } from './auth-helper'
import { apiGet, apiGetUnauthenticated } from './api-helper'

/**
 * Format timestamp to EEN API format (+00:00 instead of Z)
 */
function formatTimestamp(timestamp: string): string {
  if (timestamp.endsWith('+00:00')) return timestamp
  if (timestamp.endsWith('Z')) {
    return timestamp.replace('Z', '+00:00')
  }
  return timestamp
}

test.describe('Events API', () => {
  let auth: AuthState
  let testCameraId: string | null = null

  test.beforeAll(async ({ request }) => {
    // Get auth token (from cache or fresh login)
    auth = await getAuthToken()

    // Get a camera ID to use for event queries
    const camerasResponse = await apiGet(request, auth, '/api/v3.0/cameras', { pageSize: '1' })
    if (camerasResponse.ok()) {
      const camerasData = await camerasResponse.json()
      if (camerasData.results?.length > 0) {
        testCameraId = camerasData.results[0].id
        console.log('Using camera for event tests:', testCameraId)
      }
    }
  })

  test('GET /api/v3.0/eventTypes returns event types list', async ({ request }) => {
    const response = await apiGet(request, auth, '/api/v3.0/eventTypes', { pageSize: '10' })

    expect(response.ok()).toBe(true)

    const data = await response.json()
    console.log('Event types returned:', data.results?.length || 0)

    // Verify response structure
    expect(data).toHaveProperty('results')
    expect(Array.isArray(data.results)).toBe(true)

    // Check event type structure if results exist
    if (data.results.length > 0) {
      const firstType = data.results[0]
      expect(firstType).toHaveProperty('type')
      expect(firstType).toHaveProperty('name')
      expect(firstType).toHaveProperty('description')
      console.log('First event type:', firstType.name, '-', firstType.type)
    }
  })

  test('GET /api/v3.0/eventTypes with pagination', async ({ request }) => {
    // First request with small page size
    const response1 = await apiGet(request, auth, '/api/v3.0/eventTypes', { pageSize: '5' })

    expect(response1.ok()).toBe(true)
    const data1 = await response1.json()

    expect(data1).toHaveProperty('results')
    expect(data1.results.length).toBeLessThanOrEqual(5)

    // If there's a next page, fetch it
    if (data1.nextPageToken) {
      console.log('Fetching next page of event types...')
      const response2 = await apiGet(request, auth, '/api/v3.0/eventTypes', {
        pageSize: '5',
        pageToken: data1.nextPageToken
      })

      expect(response2.ok()).toBe(true)
      const data2 = await response2.json()
      expect(data2).toHaveProperty('results')
      console.log('Second page event types:', data2.results?.length || 0)
    } else {
      console.log('No additional pages available')
    }
  })

  test('GET /api/v3.0/events:listFieldValues returns available event types for camera', async ({ request }) => {
    test.skip(!testCameraId, 'No camera available for testing')

    const response = await apiGet(request, auth, '/api/v3.0/events:listFieldValues', {
      actor: `camera:${testCameraId}`
    })

    expect(response.ok()).toBe(true)

    const data = await response.json()
    console.log('Available event types for camera:', data.type?.length || 0)

    // Verify response structure
    expect(data).toHaveProperty('type')
    expect(Array.isArray(data.type)).toBe(true)

    if (data.type.length > 0) {
      console.log('Event types:', data.type.slice(0, 5).join(', '))
    }
  })

  test('GET /api/v3.0/events returns events for camera', async ({ request }) => {
    test.skip(!testCameraId, 'No camera available for testing')

    // First get available event types for this camera
    const fieldValuesResponse = await apiGet(request, auth, '/api/v3.0/events:listFieldValues', {
      actor: `camera:${testCameraId}`
    })

    if (!fieldValuesResponse.ok()) {
      console.log('Could not get field values, skipping events test')
      return
    }

    const fieldValues = await fieldValuesResponse.json()
    if (!fieldValues.type || fieldValues.type.length === 0) {
      console.log('No event types available for camera, skipping events test')
      return
    }

    // Use the first available event type
    const eventType = fieldValues.type[0]
    console.log('Querying events of type:', eventType)

    // Query events from the last 24 hours
    const oneDayAgo = formatTimestamp(new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    const now = formatTimestamp(new Date().toISOString())

    const response = await apiGet(request, auth, '/api/v3.0/events', {
      actor: `camera:${testCameraId}`,
      'type__in': eventType,
      'startTimestamp__gte': oneDayAgo,
      'endTimestamp__lte': now,
      pageSize: '10'
    })

    expect(response.ok()).toBe(true)

    const data = await response.json()
    console.log('Events returned:', data.results?.length || 0)

    // Verify response structure
    expect(data).toHaveProperty('results')
    expect(Array.isArray(data.results)).toBe(true)

    // Check event structure if results exist
    if (data.results.length > 0) {
      const firstEvent = data.results[0]
      expect(firstEvent).toHaveProperty('id')
      expect(firstEvent).toHaveProperty('type')
      expect(firstEvent).toHaveProperty('startTimestamp')
      expect(firstEvent).toHaveProperty('actorId')
      expect(firstEvent).toHaveProperty('actorType')
      console.log('First event:', firstEvent.type, 'at', firstEvent.startTimestamp)
    }
  })

  test('GET /api/v3.0/events with pagination', async ({ request }) => {
    test.skip(!testCameraId, 'No camera available for testing')

    // Get available event types
    const fieldValuesResponse = await apiGet(request, auth, '/api/v3.0/events:listFieldValues', {
      actor: `camera:${testCameraId}`
    })

    if (!fieldValuesResponse.ok()) {
      return
    }

    const fieldValues = await fieldValuesResponse.json()
    if (!fieldValues.type || fieldValues.type.length === 0) {
      console.log('No event types available, skipping pagination test')
      return
    }

    const eventType = fieldValues.type[0]
    const oneWeekAgo = formatTimestamp(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    const now = formatTimestamp(new Date().toISOString())

    // First request with small page size
    const response1 = await apiGet(request, auth, '/api/v3.0/events', {
      actor: `camera:${testCameraId}`,
      'type__in': eventType,
      'startTimestamp__gte': oneWeekAgo,
      'endTimestamp__lte': now,
      pageSize: '2'
    })

    expect(response1.ok()).toBe(true)
    const data1 = await response1.json()

    expect(data1).toHaveProperty('results')
    expect(data1.results.length).toBeLessThanOrEqual(2)

    // If there's a next page, fetch it
    if (data1.nextPageToken) {
      console.log('Fetching next page of events...')
      const response2 = await apiGet(request, auth, '/api/v3.0/events', {
        actor: `camera:${testCameraId}`,
        'type__in': eventType,
        'startTimestamp__gte': oneWeekAgo,
        'endTimestamp__lte': now,
        pageSize: '2',
        pageToken: data1.nextPageToken
      })

      expect(response2.ok()).toBe(true)
      const data2 = await response2.json()
      expect(data2).toHaveProperty('results')
      console.log('Second page events:', data2.results?.length || 0)
    } else {
      console.log('No additional pages available (camera may have <= 2 events)')
    }
  })

  test('GET /api/v3.0/events/{id} returns specific event', async ({ request }) => {
    test.skip(!testCameraId, 'No camera available for testing')

    // Get available event types
    const fieldValuesResponse = await apiGet(request, auth, '/api/v3.0/events:listFieldValues', {
      actor: `camera:${testCameraId}`
    })

    if (!fieldValuesResponse.ok()) {
      return
    }

    const fieldValues = await fieldValuesResponse.json()
    if (!fieldValues.type || fieldValues.type.length === 0) {
      console.log('No event types available, skipping single event test')
      return
    }

    const eventType = fieldValues.type[0]
    const oneWeekAgo = formatTimestamp(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    const now = formatTimestamp(new Date().toISOString())

    // First get an event from the list
    const listResponse = await apiGet(request, auth, '/api/v3.0/events', {
      actor: `camera:${testCameraId}`,
      'type__in': eventType,
      'startTimestamp__gte': oneWeekAgo,
      'endTimestamp__lte': now,
      pageSize: '1'
    })

    expect(listResponse.ok()).toBe(true)
    const listData = await listResponse.json()

    if (listData.results?.length > 0) {
      const eventId = listData.results[0].id

      // Now fetch that event by ID
      const response = await apiGet(request, auth, `/api/v3.0/events/${eventId}`)

      expect(response.ok()).toBe(true)

      const event = await response.json()
      expect(event.id).toBe(eventId)
      expect(event).toHaveProperty('type')
      expect(event).toHaveProperty('startTimestamp')
      console.log('Fetched event by ID:', event.type)
    } else {
      console.log('No events available to test single event fetch')
    }
  })

  test('Events API returns 401 for invalid token', async ({ request }) => {
    // Test with an invalid token
    const response = await apiGetUnauthenticated(
      request,
      auth.baseUrl,
      '/api/v3.0/eventTypes',
      'invalid-token-12345'
    )

    // Should return 401 Unauthorized
    expect(response.ok()).toBe(false)
    expect(response.status()).toBe(401)
    console.log('Correctly returned 401 for invalid token')
  })

  test('GET /api/v3.0/events returns error for missing required params', async ({ request }) => {
    // Missing actor parameter should return an error
    const response = await apiGet(request, auth, '/api/v3.0/events', {
      'type__in': 'een.motionDetectionEvent.v1',
      'startTimestamp__gte': new Date(Date.now() - 3600000).toISOString()
    })

    // Should return 400 Bad Request
    expect(response.ok()).toBe(false)
    expect(response.status()).toBe(400)
    console.log('Correctly returned error for missing actor parameter')
  })
})
