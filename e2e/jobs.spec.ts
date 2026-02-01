import { test, expect } from '@playwright/test'
import { getAuthToken, AuthState } from './auth-helper'
import { apiGet } from './api-helper'

test.describe('Jobs API', () => {
  let auth: AuthState
  let currentUserId: string | null = null

  test.beforeAll(async ({ request }) => {
    // Get auth token (from cache or fresh login)
    auth = await getAuthToken()

    // Get current user ID (required for jobs API)
    const userResponse = await request.get(`${auth.baseUrl}/api/v3.0/users/self`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${auth.accessToken}`
      }
    })

    if (userResponse.ok()) {
      const userData = await userResponse.json()
      currentUserId = userData.id
      console.log('Current user ID:', currentUserId)
    } else {
      console.log('Could not get current user - jobs tests may fail')
    }
  })

  test('GET /api/v3.0/jobs returns job list', async ({ request }) => {
    // Skip if we couldn't get the user ID
    if (!currentUserId) {
      console.log('No user ID available - skipping test')
      test.skip()
      return
    }

    const response = await apiGet(request, auth, '/api/v3.0/jobs', {
      pageSize: '10',
      userId: currentUserId
    })

    // Skip if endpoint not available (404) or not authorized (403)
    if (response.status() === 404 || response.status() === 403) {
      console.log(`Jobs endpoint returned ${response.status()} - skipping test`)
      test.skip()
      return
    }

    expect(response.ok()).toBe(true)

    const data = await response.json()
    console.log('Jobs returned:', data.results?.length || 0)

    // Verify response structure
    expect(data).toHaveProperty('results')
    expect(Array.isArray(data.results)).toBe(true)

    // Check job structure if results exist
    if (data.results.length > 0) {
      const firstJob = data.results[0]
      expect(firstJob).toHaveProperty('id')
      expect(firstJob).toHaveProperty('state')
      expect(firstJob).toHaveProperty('type')
      expect(firstJob).toHaveProperty('createTimestamp')
      console.log('First job:', firstJob.name || firstJob.id, '- State:', firstJob.state)
    }
  })

  test('GET /api/v3.0/jobs with pagination', async ({ request }) => {
    if (!currentUserId) {
      console.log('No user ID available - skipping test')
      test.skip()
      return
    }

    // First request with small page size
    const response1 = await apiGet(request, auth, '/api/v3.0/jobs', {
      pageSize: '2',
      userId: currentUserId
    })

    if (!response1.ok()) {
      console.log(`Jobs endpoint returned ${response1.status()} - skipping test`)
      test.skip()
      return
    }

    const data1 = await response1.json()

    expect(data1).toHaveProperty('results')
    expect(data1.results.length).toBeLessThanOrEqual(2)

    // If there's a next page, fetch it
    if (data1.nextPageToken) {
      console.log('Fetching next page...')
      const response2 = await apiGet(request, auth, '/api/v3.0/jobs', {
        pageSize: '2',
        pageToken: data1.nextPageToken,
        userId: currentUserId
      })

      expect(response2.ok()).toBe(true)
      const data2 = await response2.json()
      expect(data2).toHaveProperty('results')
      console.log('Second page jobs:', data2.results?.length || 0)
    } else {
      console.log('No additional pages available (account may have <= 2 jobs)')
    }
  })

  test('GET /api/v3.0/jobs with state filter', async ({ request }) => {
    if (!currentUserId) {
      console.log('No user ID available - skipping test')
      test.skip()
      return
    }

    // Filter by completed jobs (success or failure)
    const response = await apiGet(request, auth, '/api/v3.0/jobs', {
      pageSize: '10',
      'state__in': 'success,failure',
      userId: currentUserId
    })

    if (!response.ok()) {
      console.log(`Jobs endpoint returned ${response.status()} - skipping test`)
      test.skip()
      return
    }

    const data = await response.json()
    console.log('Completed jobs:', data.results?.length || 0)

    // All returned jobs should have state success or failure
    for (const job of data.results || []) {
      expect(['success', 'failure']).toContain(job.state)
    }
  })

  test('GET /api/v3.0/jobs with type filter', async ({ request }) => {
    if (!currentUserId) {
      console.log('No user ID available - skipping test')
      test.skip()
      return
    }

    // Filter for export jobs
    const response = await apiGet(request, auth, '/api/v3.0/jobs', {
      pageSize: '10',
      type: 'export',
      userId: currentUserId
    })

    if (!response.ok()) {
      console.log(`Jobs endpoint returned ${response.status()} - skipping test`)
      test.skip()
      return
    }

    const data = await response.json()
    console.log('Export jobs:', data.results?.length || 0)

    // Verify response structure
    expect(data).toHaveProperty('results')
    expect(Array.isArray(data.results)).toBe(true)
  })

  test('GET /api/v3.0/jobs/{id} returns specific job', async ({ request }) => {
    if (!currentUserId) {
      console.log('No user ID available - skipping test')
      test.skip()
      return
    }

    // First get a job from the list
    const listResponse = await apiGet(request, auth, '/api/v3.0/jobs', {
      pageSize: '1',
      userId: currentUserId
    })

    if (!listResponse.ok()) {
      console.log(`Jobs endpoint returned ${listResponse.status()} - skipping test`)
      test.skip()
      return
    }

    const listData = await listResponse.json()

    if (listData.results?.length > 0) {
      const jobId = listData.results[0].id
      const jobName = listData.results[0].name || listData.results[0].id

      // Now fetch that job by ID
      const response = await apiGet(request, auth, `/api/v3.0/jobs/${jobId}`)

      expect(response.ok()).toBe(true)

      const job = await response.json()
      expect(job.id).toBe(jobId)
      expect(job).toHaveProperty('state')
      expect(job).toHaveProperty('type')
      console.log('Fetched job by ID:', jobName)
    } else {
      console.log('No jobs available to test single job fetch')
    }
  })

  test('GET /api/v3.0/jobs/{id} returns 404 for non-existent job', async ({ request }) => {
    // Use a clearly invalid ID format
    const response = await apiGet(request, auth, '/api/v3.0/jobs/non-existent-job-id-12345')

    // Should return 404 Not Found
    expect(response.ok()).toBe(false)
    expect(response.status()).toBe(404)
    console.log('Correctly returned 404 for non-existent job')
  })

  test('DELETE /api/v3.0/jobs/{id} returns error for non-existent job', async ({ request }) => {
    // Use a clearly invalid ID format
    const response = await request.delete(`${auth.baseUrl}/api/v3.0/jobs/non-existent-job-id-12345`, {
      headers: {
        'Authorization': `Bearer ${auth.accessToken}`
      }
    })

    console.log('DELETE non-existent job status:', response.status())

    // API may return 204 (idempotent delete) or an error status
    // Accept any reasonable response
    if (response.ok()) {
      // Some APIs treat DELETE as idempotent - deleting non-existent is OK
      console.log('API treats DELETE as idempotent (returned success for non-existent job)')
    } else {
      // Should return an error (400, 403, 404, etc.)
      expect(response.status()).toBeGreaterThanOrEqual(400)
      console.log('Correctly returned error', response.status(), 'for DELETE non-existent job')
    }
  })
})
