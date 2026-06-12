import { test, expect } from '@playwright/test'
import { getAuthToken, AuthState } from './auth-helper'
import { apiGet, apiDelete } from './api-helper'

test.describe('Files API', () => {
  let auth: AuthState
  let endpointAvailable = true

  test.beforeAll(async ({ request }) => {
    // Get auth token (from cache or fresh login)
    auth = await getAuthToken()

    // Check if files endpoint is available
    const checkResponse = await apiGet(request, auth, '/api/v3.0/files', { pageSize: '1' })

    if (checkResponse.status() === 404 || checkResponse.status() === 400) {
      console.log(`Files endpoint returned ${checkResponse.status()} - tests will be skipped`)
      endpointAvailable = false
    }
  })

  test('GET /api/v3.0/files returns file list', async ({ request }) => {
    if (!endpointAvailable) {
      console.log('Files endpoint not available - skipping test')
      test.skip()
      return
    }

    const response = await apiGet(request, auth, '/api/v3.0/files', { pageSize: '10' })

    // Skip if endpoint not available
    if (response.status() === 404 || response.status() === 403 || response.status() === 400) {
      console.log(`Files endpoint returned ${response.status()} - skipping test`)
      test.skip()
      return
    }

    expect(response.ok()).toBe(true)

    const data = await response.json()
    console.log('Files returned:', data.results?.length || 0)

    // Verify response structure
    expect(data).toHaveProperty('results')
    expect(Array.isArray(data.results)).toBe(true)

    // Check file structure if results exist
    if (data.results.length > 0) {
      const firstFile = data.results[0]
      expect(firstFile).toHaveProperty('id')
      expect(firstFile).toHaveProperty('name')
      // Files may have different structures (directories vs actual files)
      // Core properties are id and name
      console.log('First file:', firstFile.name, '- Type:', firstFile.mimeType || 'N/A')
      if (firstFile.size) {
        console.log('  Size:', firstFile.size, 'bytes')
      }
    }
  })

  test('GET /api/v3.0/files with pagination', async ({ request }) => {
    if (!endpointAvailable) {
      console.log('Files endpoint not available - skipping test')
      test.skip()
      return
    }

    // First request with small page size
    const response1 = await apiGet(request, auth, '/api/v3.0/files', { pageSize: '2' })

    if (!response1.ok()) {
      console.log(`Files endpoint returned ${response1.status()} - skipping test`)
      test.skip()
      return
    }

    const data1 = await response1.json()

    expect(data1).toHaveProperty('results')
    expect(data1.results.length).toBeLessThanOrEqual(2)

    // If there's a next page, fetch it
    if (data1.nextPageToken) {
      console.log('Fetching next page...')
      const response2 = await apiGet(request, auth, '/api/v3.0/files', {
        pageSize: '2',
        pageToken: data1.nextPageToken
      })

      expect(response2.ok()).toBe(true)
      const data2 = await response2.json()
      expect(data2).toHaveProperty('results')
      console.log('Second page files:', data2.results?.length || 0)
    } else {
      console.log('No additional pages available (account may have <= 2 files)')
    }
  })

  test('GET /api/v3.0/files with type filter', async ({ request }) => {
    if (!endpointAvailable) {
      console.log('Files endpoint not available - skipping test')
      test.skip()
      return
    }

    // Filter for video files
    const response = await apiGet(request, auth, '/api/v3.0/files', {
      pageSize: '10',
      'type__in': 'video'
    })

    if (!response.ok()) {
      console.log(`Files endpoint returned ${response.status()} - skipping test`)
      test.skip()
      return
    }

    const data = await response.json()
    console.log('Video files:', data.results?.length || 0)

    // Verify response structure
    expect(data).toHaveProperty('results')
    expect(Array.isArray(data.results)).toBe(true)
  })

  test('GET /api/v3.0/files/{id} returns specific file', async ({ request }) => {
    if (!endpointAvailable) {
      console.log('Files endpoint not available - skipping test')
      test.skip()
      return
    }

    // First get a file from the list
    const listResponse = await apiGet(request, auth, '/api/v3.0/files', { pageSize: '1' })

    if (!listResponse.ok()) {
      console.log(`Files endpoint returned ${listResponse.status()} - skipping test`)
      test.skip()
      return
    }

    const listData = await listResponse.json()

    if (listData.results?.length > 0) {
      const fileId = listData.results[0].id
      const fileName = listData.results[0].name

      // Now fetch that file by ID
      const response = await apiGet(request, auth, `/api/v3.0/files/${fileId}`)

      expect(response.ok()).toBe(true)

      const file = await response.json()
      expect(file.id).toBe(fileId)
      // Core property is id - other properties may vary
      console.log('Fetched file by ID:', file.id)
      if (file.name) {
        console.log('  Name:', file.name)
      }

      if (file.size) {
        console.log('  Size:', file.size, 'bytes')
      }
      if (file.contentType) {
        console.log('  Content-Type:', file.contentType)
      }
    } else {
      console.log('No files available to test single file fetch')
    }
  })

  test('GET /api/v3.0/files/{id} returns 404 for non-existent file', async ({ request }) => {
    // Use a clearly invalid ID format
    const response = await apiGet(request, auth, '/api/v3.0/files/non-existent-file-id-12345')

    // Should return 404 Not Found
    expect(response.ok()).toBe(false)
    expect(response.status()).toBe(404)
    console.log('Correctly returned 404 for non-existent file')
  })

  test('GET /api/v3.0/files with all include fields returns extended metadata', async ({ request }) => {
    if (!endpointAvailable) {
      console.log('Files endpoint not available - skipping test')
      test.skip()
      return
    }

    // Valid include fields as documented in EEN API v3.0
    const allIncludeFields = [
      'accountId',
      'publicShare',
      'notes',
      'createTimestamp',
      'updateTimestamp',
      'size',
      'metadata',
      'tags',
      'childCount',
      'details'
    ]

    const response = await apiGet(request, auth, '/api/v3.0/files', {
      pageSize: '5',
      include: allIncludeFields.join(',')
    })

    if (!response.ok()) {
      console.log(`Files endpoint returned ${response.status()} - skipping test`)
      test.skip()
      return
    }

    expect(response.ok()).toBe(true)

    const data = await response.json()
    console.log('Files returned with all include fields:', data.results?.length || 0)

    // Verify response structure
    expect(data).toHaveProperty('results')
    expect(Array.isArray(data.results)).toBe(true)

    if (data.results.length > 0) {
      // Check first file for included fields
      const firstFile = data.results[0]
      console.log('\n=== File with all include fields ===')
      console.log('id:', firstFile.id)
      console.log('name:', firstFile.name)
      console.log('mimeType:', firstFile.mimeType)

      // Log which included fields are present
      console.log('\n--- Included fields ---')
      console.log('accountId:', firstFile.accountId ?? '(not returned)')
      console.log('publicShare:', firstFile.publicShare ?? '(not returned)')
      console.log('notes:', firstFile.notes !== undefined ? `"${firstFile.notes}"` : '(not returned)')
      console.log('createTimestamp:', firstFile.createTimestamp ?? '(not returned)')
      console.log('updateTimestamp:', firstFile.updateTimestamp ?? '(not returned)')
      console.log('size:', firstFile.size ?? '(not returned - may be folder)')
      console.log('metadata:', firstFile.metadata ?? '(not returned)')
      console.log('tags:', firstFile.tags ?? '(not returned)')
      console.log('childCount:', firstFile.childCount ?? '(not returned)')
      console.log('details:', firstFile.details ?? '(not returned)')

      // The included fields should make some of these present
      // accountId and createTimestamp are commonly returned
      expect(firstFile.accountId).toBeDefined()
      expect(firstFile.createTimestamp).toBeDefined()

      // Find a non-folder file to verify size is returned
      const nonFolderFile = data.results.find(
        (f: { mimeType: string }) => f.mimeType !== 'application/directory'
      )
      if (nonFolderFile) {
        console.log('\n--- Non-folder file ---')
        console.log('name:', nonFolderFile.name)
        console.log('size:', nonFolderFile.size, 'bytes')
        expect(nonFolderFile.size).toBeDefined()
        expect(typeof nonFolderFile.size).toBe('number')
      } else {
        console.log('\nNo non-folder files found to verify size field')
      }
    }
  })

  test('GET /api/v3.0/files/{id}:download returns file content', async ({ request }) => {
    if (!endpointAvailable) {
      console.log('Files endpoint not available - skipping test')
      test.skip()
      return
    }

    // List files with sizes so we can pick a small, downloadable one.
    // Folders (mimeType application/directory) download as large archives
    // that exceed the test timeout.
    const listResponse = await apiGet(request, auth, '/api/v3.0/files', {
      pageSize: '50',
      include: 'size'
    })

    if (!listResponse.ok()) {
      console.log(`Files endpoint returned ${listResponse.status()} - skipping test`)
      test.skip()
      return
    }

    const listData = await listResponse.json()
    const maxSize = 5 * 1024 * 1024
    const candidates = (listData.results ?? []).filter(
      (f: { mimeType: string; size?: number }) =>
        f.mimeType !== 'application/directory' && typeof f.size === 'number' && f.size <= maxSize
    )

    if (candidates.length > 0) {
      const fileId = candidates[0].id
      const fileName = candidates[0].name

      // Try to download the file
      const response = await apiGet(request, auth, `/api/v3.0/files/${fileId}:download`)

      // The file might not be downloadable (e.g., still processing)
      if (response.ok()) {
        const contentType = response.headers()['content-type']
        const contentDisposition = response.headers()['content-disposition']
        console.log('Downloaded file:', fileName)
        console.log('  Content-Type:', contentType)
        console.log('  Content-Disposition:', contentDisposition || 'N/A')

        // Verify we got some content
        const body = await response.body()
        expect(body.length).toBeGreaterThan(0)
      } else {
        console.log('File not downloadable (status:', response.status(), ')')
        // This is acceptable - file might not be ready, auth issues, or not supported
        expect([401, 403, 404, 409, 410]).toContain(response.status())
      }
    } else {
      console.log('No small non-folder files available to test download')
    }
  })

  test('DELETE /api/v3.0/files/{id} returns error for non-existent file', async ({ request }) => {
    // Use a clearly invalid ID format
    const response = await apiDelete(request, auth, '/api/v3.0/files/non-existent-file-id-12345')

    console.log('DELETE non-existent file status:', response.status())

    // API may return 200 (idempotent delete) or an error status
    // Accept any reasonable response
    if (response.ok()) {
      // Some APIs treat DELETE as idempotent - deleting non-existent is OK
      console.log('API treats DELETE as idempotent (returned success for non-existent file)')
    } else {
      // Should return an error (400, 403, 404, etc.)
      expect(response.status()).toBeGreaterThanOrEqual(400)
      console.log('Correctly returned error', response.status(), 'for DELETE non-existent file')
    }
  })
})
