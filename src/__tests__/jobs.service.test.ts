import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { listJobs, getJob, deleteJob } from '../jobs/service'
import { useAuthStore } from '../auth/store'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('Jobs service functions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('listJobs', () => {
    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await listJobs()

      expect(result.error).not.toBeNull()
      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.data).toBeNull()
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return AUTH_REQUIRED when baseUrl is not set', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      // baseUrl not set

      const result = await listJobs()

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.message).toBe('Base URL not configured')
    })

    it('should fetch jobs successfully', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const mockResponse = {
        results: [
          { id: 'job-1', name: 'Export 1', state: 'success', type: 'export' },
          { id: 'job-2', name: 'Export 2', state: 'pending', type: 'export' }
        ],
        nextPageToken: 'next-token-456',
        totalSize: 50
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await listJobs()

      expect(result.error).toBeNull()
      expect(result.data?.results).toHaveLength(2)
      expect(result.data?.nextPageToken).toBe('next-token-456')
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v3.0/jobs',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer test-token'
          }
        })
      )
    })

    it('should include pagination parameters in request', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      })

      await listJobs({ pageSize: 100, pageToken: 'page-xyz' })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v3.0/jobs?pageSize=100&pageToken=page-xyz',
        expect.any(Object)
      )
    })

    it('should include state filter in request', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      })

      await listJobs({ state__in: ['pending', 'started'] })

      const call = mockFetch.mock.calls[0]
      expect(call).toBeDefined()
      const url = call![0] as string
      expect(url).toContain('state__in=pending%2Cstarted')
    })

    it('should include type filter in request', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      })

      await listJobs({ type: 'export' })

      const call = mockFetch.mock.calls[0]
      expect(call).toBeDefined()
      const url = call![0] as string
      expect(url).toContain('type=export')
    })

    it('should include timestamp filters in request', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      })

      await listJobs({
        createTimestamp__gte: '2024-01-01T00:00:00.000+00:00',
        createTimestamp__lte: '2024-12-31T23:59:59.999+00:00'
      })

      const call = mockFetch.mock.calls[0]
      expect(call).toBeDefined()
      const url = call![0] as string
      expect(url).toContain('createTimestamp__gte=')
      expect(url).toContain('createTimestamp__lte=')
    })

    it('should handle 401 error', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({ message: 'Invalid token' })
      })

      const result = await listJobs()

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.status).toBe(401)
    })

    it('should handle network errors', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockRejectedValueOnce(new Error('Connection refused'))

      const result = await listJobs()

      expect(result.error?.code).toBe('NETWORK_ERROR')
      expect(result.error?.message).toContain('Connection refused')
    })
  })

  describe('getJob', () => {
    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await getJob('job-123')

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return AUTH_REQUIRED when baseUrl is not set', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      // baseUrl not set

      const result = await getJob('job-123')

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.message).toBe('Base URL not configured')
    })

    it('should return VALIDATION_ERROR when jobId is empty', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const result = await getJob('')

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toBe('Job ID is required')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should fetch job by ID successfully', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const mockJob = {
        id: 'job-123',
        accountId: 'acc-456',
        userId: 'user-789',
        name: 'Test Export',
        type: 'export',
        state: 'success',
        progress: 100,
        fileId: 'file-abc',
        createTimestamp: '2024-01-01T00:00:00.000+00:00'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockJob)
      })

      const result = await getJob('job-123')

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockJob)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v3.0/jobs/job-123',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer test-token'
          }
        })
      )
    })

    it('should encode jobId with special characters', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'job/123' })
      })

      await getJob('job/123')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v3.0/jobs/job%2F123',
        expect.any(Object)
      )
    })

    it('should include include parameter in request', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'job-123' })
      })

      await getJob('job-123', { include: ['details'] })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v3.0/jobs/job-123?include=details',
        expect.any(Object)
      )
    })

    it('should handle 404 not found error', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ message: 'Job not found' })
      })

      const result = await getJob('nonexistent')

      expect(result.error?.code).toBe('NOT_FOUND')
      expect(result.error?.status).toBe(404)
    })

    it('should handle 403 forbidden error', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: () => Promise.resolve({ message: 'Access denied' })
      })

      const result = await getJob('job-123')

      expect(result.error?.code).toBe('FORBIDDEN')
      expect(result.error?.status).toBe(403)
    })

    it('should handle network errors', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockRejectedValueOnce(new Error('DNS resolution failed'))

      const result = await getJob('job-123')

      expect(result.error?.code).toBe('NETWORK_ERROR')
      expect(result.error?.message).toContain('DNS resolution failed')
    })
  })

  describe('deleteJob', () => {
    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await deleteJob('job-123')

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return AUTH_REQUIRED when baseUrl is not set', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      // baseUrl not set

      const result = await deleteJob('job-123')

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.message).toBe('Base URL not configured')
    })

    it('should return VALIDATION_ERROR when jobId is empty', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const result = await deleteJob('')

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toBe('Job ID is required')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should delete job successfully with 204 response', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204
      })

      const result = await deleteJob('job-123')

      expect(result.error).toBeNull()
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v3.0/jobs/job-123',
        expect.objectContaining({
          method: 'DELETE',
          headers: {
            'Authorization': 'Bearer test-token'
          }
        })
      )
    })

    it('should encode jobId with special characters', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204
      })

      await deleteJob('job/123')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v3.0/jobs/job%2F123',
        expect.any(Object)
      )
    })

    it('should handle 404 not found error', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ message: 'Job not found' })
      })

      const result = await deleteJob('nonexistent')

      expect(result.error?.code).toBe('NOT_FOUND')
      expect(result.error?.status).toBe(404)
    })

    it('should handle 403 forbidden error', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: () => Promise.resolve({ message: 'Access denied' })
      })

      const result = await deleteJob('job-123')

      expect(result.error?.code).toBe('FORBIDDEN')
      expect(result.error?.status).toBe(403)
    })

    it('should handle network errors', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockRejectedValueOnce(new Error('Connection reset'))

      const result = await deleteJob('job-123')

      expect(result.error?.code).toBe('NETWORK_ERROR')
      expect(result.error?.message).toContain('Connection reset')
    })
  })
})
