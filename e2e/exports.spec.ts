import { test, expect } from '@playwright/test'
import { getAuthToken, AuthState } from './auth-helper'
import { apiGet, apiPost } from './api-helper'

test.describe('Exports API', () => {
  let auth: AuthState

  test.beforeAll(async () => {
    // Get auth token (from cache or fresh login)
    auth = await getAuthToken()
  })

  test('POST /api/v3.0/exports creates export job (requires camera)', async ({ request }) => {
    // First, get a camera to export from
    const camerasResponse = await apiGet(request, auth, '/api/v3.0/cameras', {
      pageSize: '1',
      'status__in': 'online,streaming'
    })

    expect(camerasResponse.ok()).toBe(true)
    const camerasData = await camerasResponse.json()

    if (camerasData.results?.length === 0) {
      console.log('No online cameras available - skipping export test')
      test.skip()
      return
    }

    const cameraId = camerasData.results[0].id
    const cameraName = camerasData.results[0].name
    console.log('Using camera:', cameraName, '(', cameraId, ')')

    // Create timestamp range for last 5 minutes
    const endTime = new Date()
    const startTime = new Date(endTime.getTime() - 5 * 60 * 1000)

    // Format timestamps - EEN API requires +00:00 format, not Z
    const formatTimestamp = (date: Date): string => {
      return date.toISOString().replace('Z', '+00:00')
    }

    // Create export job - this might fail if the camera has no recordings
    // API requires: deviceId (not cameraId), info{}, period{}
    const response = await apiPost(request, auth, '/api/v3.0/exports', {
      deviceId: cameraId,
      type: 'video',
      info: {
        name: 'E2E Test Export',
        directory: '/'
      },
      period: {
        startTimestamp: formatTimestamp(startTime),
        endTimestamp: formatTimestamp(endTime)
      }
    })

    if (response.ok()) {
      const job = await response.json()
      console.log('Export job created:', job.id)

      // API returns just the job ID on creation
      expect(job).toHaveProperty('id')
      expect(typeof job.id).toBe('string')

      // Log additional properties if present
      if (job.state) {
        console.log('  State:', job.state)
      }
      if (job.type) {
        console.log('  Type:', job.type)
      }
    } else {
      // Export might fail if camera has no recordings in the time range
      const errorData = await response.json().catch(() => ({}))
      console.log('Export creation failed (status:', response.status(), ')')
      console.log('  Error:', errorData.message || 'Unknown error')

      // Accept common failure cases
      // 400 - Bad request (e.g., no video in time range)
      // 404 - Camera not found
      // 409 - Conflict (e.g., export already exists)
      expect([400, 404, 409]).toContain(response.status())
    }
  })

  test('POST /api/v3.0/exports returns error for invalid camera', async ({ request }) => {
    const endTime = new Date()
    const startTime = new Date(endTime.getTime() - 5 * 60 * 1000)

    const formatTimestamp = (date: Date): string => {
      return date.toISOString().replace('Z', '+00:00')
    }

    const response = await apiPost(request, auth, '/api/v3.0/exports', {
      deviceId: 'invalid-camera-id-12345',
      type: 'video',
      info: {
        directory: '/'
      },
      period: {
        startTimestamp: formatTimestamp(startTime),
        endTimestamp: formatTimestamp(endTime)
      }
    })

    // Should return 400 or 404
    expect(response.ok()).toBe(false)
    expect([400, 404]).toContain(response.status())
    console.log('Correctly returned error for invalid camera (status:', response.status(), ')')
  })

  test('POST /api/v3.0/exports returns error for missing required fields', async ({ request }) => {
    // Missing cameraId
    const response = await apiPost(request, auth, '/api/v3.0/exports', {
      type: 'video'
      // Missing cameraId, startTimestamp, endTimestamp
    })

    // Should return 400 Bad Request
    expect(response.ok()).toBe(false)
    expect(response.status()).toBe(400)
    console.log('Correctly returned 400 for missing required fields')
  })

  test('POST /api/v3.0/exports creates timeLapse export (requires playbackMultiplier)', async ({ request }) => {
    // First, get a camera to export from
    const camerasResponse = await apiGet(request, auth, '/api/v3.0/cameras', {
      pageSize: '1',
      'status__in': 'online,streaming'
    })

    expect(camerasResponse.ok()).toBe(true)
    const camerasData = await camerasResponse.json()

    if (camerasData.results?.length === 0) {
      console.log('No online cameras available - skipping timeLapse export test')
      test.skip()
      return
    }

    const cameraId = camerasData.results[0].id
    const cameraName = camerasData.results[0].name
    console.log('Using camera for timeLapse:', cameraName, '(', cameraId, ')')

    // Create timestamp range for last 15 minutes
    const endTime = new Date()
    const startTime = new Date(endTime.getTime() - 15 * 60 * 1000)

    const formatTimestamp = (date: Date): string => {
      return date.toISOString().replace('Z', '+00:00')
    }

    // Create timeLapse export job with required playbackMultiplier
    const response = await apiPost(request, auth, '/api/v3.0/exports', {
      deviceId: cameraId,
      type: 'timeLapse',
      playbackMultiplier: 10, // Required for timeLapse (1-48)
      info: {
        name: 'E2E TimeLapse Test Export',
        directory: '/'
      },
      period: {
        startTimestamp: formatTimestamp(startTime),
        endTimestamp: formatTimestamp(endTime)
      }
    })

    if (response.ok()) {
      const job = await response.json()
      console.log('TimeLapse export job created:', job.id)

      expect(job).toHaveProperty('id')
      expect(typeof job.id).toBe('string')

      if (job.state) {
        console.log('  State:', job.state)
      }
      if (job.type) {
        console.log('  Type:', job.type)
      }
    } else {
      // Export might fail if camera has no recordings in the time range
      const errorData = await response.json().catch(() => ({}))
      console.log('TimeLapse export creation failed (status:', response.status(), ')')
      console.log('  Error:', errorData.message || 'Unknown error')

      // Accept common failure cases
      expect([400, 404, 409]).toContain(response.status())
    }
  })

  test('POST /api/v3.0/exports timeLapse without playbackMultiplier returns error', async ({ request }) => {
    // First, get a camera to export from
    const camerasResponse = await apiGet(request, auth, '/api/v3.0/cameras', {
      pageSize: '1',
      'status__in': 'online,streaming'
    })

    expect(camerasResponse.ok()).toBe(true)
    const camerasData = await camerasResponse.json()

    if (camerasData.results?.length === 0) {
      console.log('No online cameras available - skipping test')
      test.skip()
      return
    }

    const cameraId = camerasData.results[0].id

    const endTime = new Date()
    const startTime = new Date(endTime.getTime() - 5 * 60 * 1000)

    const formatTimestamp = (date: Date): string => {
      return date.toISOString().replace('Z', '+00:00')
    }

    // Create timeLapse export WITHOUT playbackMultiplier (should fail)
    const response = await apiPost(request, auth, '/api/v3.0/exports', {
      deviceId: cameraId,
      type: 'timeLapse',
      // Missing required playbackMultiplier
      info: {
        name: 'E2E TimeLapse Test - Missing Multiplier',
        directory: '/'
      },
      period: {
        startTimestamp: formatTimestamp(startTime),
        endTimestamp: formatTimestamp(endTime)
      }
    })

    // Should return 400 Bad Request for missing required field
    expect(response.ok()).toBe(false)
    expect(response.status()).toBe(400)

    const errorData = await response.json().catch(() => ({}))
    console.log('Correctly returned error for missing playbackMultiplier:', errorData.message || 'Unknown error')

    // Error message should mention playbackMultiplier
    expect(errorData.message?.toLowerCase() || '').toContain('playbackmultiplier')
  })

  test('POST /api/v3.0/exports creates bundle export (requires playbackMultiplier)', async ({ request }) => {
    // First, get a camera to export from
    const camerasResponse = await apiGet(request, auth, '/api/v3.0/cameras', {
      pageSize: '1',
      'status__in': 'online,streaming'
    })

    expect(camerasResponse.ok()).toBe(true)
    const camerasData = await camerasResponse.json()

    if (camerasData.results?.length === 0) {
      console.log('No online cameras available - skipping bundle export test')
      test.skip()
      return
    }

    const cameraId = camerasData.results[0].id
    const cameraName = camerasData.results[0].name
    console.log('Using camera for bundle:', cameraName, '(', cameraId, ')')

    // Create timestamp range for last 15 minutes
    const endTime = new Date()
    const startTime = new Date(endTime.getTime() - 15 * 60 * 1000)

    const formatTimestamp = (date: Date): string => {
      return date.toISOString().replace('Z', '+00:00')
    }

    // Create bundle export job with required playbackMultiplier
    // Bundle = combination of video and timeLapse
    const response = await apiPost(request, auth, '/api/v3.0/exports', {
      deviceId: cameraId,
      type: 'bundle',
      playbackMultiplier: 5, // Required for bundle (1-48)
      info: {
        name: 'E2E Bundle Test Export',
        directory: '/'
      },
      period: {
        startTimestamp: formatTimestamp(startTime),
        endTimestamp: formatTimestamp(endTime)
      }
    })

    if (response.ok()) {
      const job = await response.json()
      console.log('Bundle export job created:', job.id)

      expect(job).toHaveProperty('id')
      expect(typeof job.id).toBe('string')

      if (job.state) {
        console.log('  State:', job.state)
      }
      if (job.type) {
        console.log('  Type:', job.type)
      }
    } else {
      // Export might fail if camera has no recordings in the time range
      const errorData = await response.json().catch(() => ({}))
      console.log('Bundle export creation failed (status:', response.status(), ')')
      console.log('  Error:', errorData.message || 'Unknown error')

      // Accept common failure cases
      expect([400, 404, 409]).toContain(response.status())
    }
  })

  test('POST /api/v3.0/exports bundle without playbackMultiplier returns error', async ({ request }) => {
    // First, get a camera to export from
    const camerasResponse = await apiGet(request, auth, '/api/v3.0/cameras', {
      pageSize: '1',
      'status__in': 'online,streaming'
    })

    expect(camerasResponse.ok()).toBe(true)
    const camerasData = await camerasResponse.json()

    if (camerasData.results?.length === 0) {
      console.log('No online cameras available - skipping test')
      test.skip()
      return
    }

    const cameraId = camerasData.results[0].id

    const endTime = new Date()
    const startTime = new Date(endTime.getTime() - 5 * 60 * 1000)

    const formatTimestamp = (date: Date): string => {
      return date.toISOString().replace('Z', '+00:00')
    }

    // Create bundle export WITHOUT playbackMultiplier (should fail)
    const response = await apiPost(request, auth, '/api/v3.0/exports', {
      deviceId: cameraId,
      type: 'bundle',
      // Missing required playbackMultiplier
      info: {
        name: 'E2E Bundle Test - Missing Multiplier',
        directory: '/'
      },
      period: {
        startTimestamp: formatTimestamp(startTime),
        endTimestamp: formatTimestamp(endTime)
      }
    })

    // Should return 400 Bad Request for missing required field
    expect(response.ok()).toBe(false)
    expect(response.status()).toBe(400)

    const errorData = await response.json().catch(() => ({}))
    console.log('Correctly returned error for missing playbackMultiplier in bundle:', errorData.message || 'Unknown error')

    // Error message should mention playbackMultiplier
    expect(errorData.message?.toLowerCase() || '').toContain('playbackmultiplier')
  })
})
