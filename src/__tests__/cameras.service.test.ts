import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { getCameras, getCamera } from '../cameras/service'
import { useAuthStore } from '../auth/store'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('Camera service functions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('getCameras', () => {
    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await getCameras()

      expect(result.error).not.toBeNull()
      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.data).toBeNull()
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return AUTH_REQUIRED when baseUrl is not set', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      // baseUrl not set

      const result = await getCameras()

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.message).toBe('Base URL not configured')
    })

    it('should fetch cameras successfully', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      const mockResponse = {
        results: [
          { id: 'cam-1', name: 'Camera 1', accountId: 'acc-123' },
          { id: 'cam-2', name: 'Camera 2', accountId: 'acc-123' }
        ],
        nextPageToken: 'next-token-456',
        totalSize: 50
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await getCameras()

      expect(result.error).toBeNull()
      expect(result.data?.results).toHaveLength(2)
      expect(result.data?.nextPageToken).toBe('next-token-456')
      expect(result.data?.totalSize).toBe(50)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.c001.eagleeyenetworks.com/api/v3.0/cameras',
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
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      })

      await getCameras({ pageSize: 100, pageToken: 'page-xyz' })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.c001.eagleeyenetworks.com/api/v3.0/cameras?pageSize=100&pageToken=page-xyz',
        expect.any(Object)
      )
    })

    it('should include include and sort parameters', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      })

      await getCameras({ include: ['deviceInfo', 'streamUrls'], sort: ['-createdAt'] })

      const call = mockFetch.mock.calls[0]
      expect(call).toBeDefined()
      const url = call![0] as string
      expect(url).toContain('include=deviceInfo%2CstreamUrls')
      expect(url).toContain('sort=-createdAt')
    })

    it('should include location and bridge filters', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      })

      await getCameras({ locationId__in: ['loc-1', 'loc-2'], bridgeId__in: ['bridge-1'] })

      const call = mockFetch.mock.calls[0]
      expect(call).toBeDefined()
      const url = call![0] as string
      expect(url).toContain('locationId__in=loc-1%2Cloc-2')
      expect(url).toContain('bridgeId__in=bridge-1')
    })

    it('should include status filters', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      })

      await getCameras({ status__in: ['online', 'streaming'], status__ne: 'offline' })

      const call = mockFetch.mock.calls[0]
      expect(call).toBeDefined()
      const url = call![0] as string
      expect(url).toContain('status__in=online%2Cstreaming')
      expect(url).toContain('status__ne=offline')
    })

    it('should include tag filters', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      })

      await getCameras({ tags__contains: ['security'], tags__any: ['indoor', 'outdoor'] })

      const call = mockFetch.mock.calls[0]
      expect(call).toBeDefined()
      const url = call![0] as string
      expect(url).toContain('tags__contains=security')
      expect(url).toContain('tags__any=indoor%2Coutdoor')
    })

    it('should include name filters', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      })

      await getCameras({ name: 'Front Door', name__contains: 'door' })

      const call = mockFetch.mock.calls[0]
      expect(call).toBeDefined()
      const url = call![0] as string
      expect(url).toContain('name=Front+Door')
      expect(url).toContain('name__contains=door')
    })

    it('should include share detail filters', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      })

      await getCameras({ shared: true, sharedCameraAccount: 'acc-shared', firstResponder: false })

      const call = mockFetch.mock.calls[0]
      expect(call).toBeDefined()
      const url = call![0] as string
      expect(url).toContain('shareDetails.shared=true')
      expect(url).toContain('shareDetails.accountId=acc-shared')
      expect(url).toContain('shareDetails.firstResponder=false')
    })

    it('should include search parameters', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      })

      await getCameras({ q: 'front door', qRelevance__gte: 0.5 })

      const call = mockFetch.mock.calls[0]
      expect(call).toBeDefined()
      const url = call![0] as string
      expect(url).toContain('q=front+door')
      expect(url).toContain('qRelevance__gte=0.5')
    })

    it('should handle 401 error', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({ message: 'Invalid token' })
      })

      const result = await getCameras()

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.status).toBe(401)
    })

    it('should handle 429 rate limit error', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: () => Promise.resolve({ message: 'Rate limit exceeded' })
      })

      const result = await getCameras()

      expect(result.error?.code).toBe('RATE_LIMITED')
      expect(result.error?.status).toBe(429)
    })

    it('should handle network errors', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockRejectedValueOnce(new Error('Connection refused'))

      const result = await getCameras()

      expect(result.error?.code).toBe('NETWORK_ERROR')
      expect(result.error?.message).toContain('Connection refused')
    })
  })

  describe('getCamera', () => {
    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await getCamera('cam-123')

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return AUTH_REQUIRED when baseUrl is not set', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      // baseUrl not set

      const result = await getCamera('cam-123')

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.message).toBe('Base URL not configured')
    })

    it('should return VALIDATION_ERROR when cameraId is empty', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      const result = await getCamera('')

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toBe('Camera ID is required')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should fetch camera by ID successfully', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      const mockCamera = {
        id: 'cam-123',
        name: 'Front Door Camera',
        accountId: 'acc-456',
        status: 'online'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCamera)
      })

      const result = await getCamera('cam-123')

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockCamera)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.c001.eagleeyenetworks.com/api/v3.0/cameras/cam-123',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer test-token'
          }
        })
      )
    })

    it('should encode cameraId with special characters', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'cam/123' })
      })

      await getCamera('cam/123')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.c001.eagleeyenetworks.com/api/v3.0/cameras/cam%2F123',
        expect.any(Object)
      )
    })

    it('should include include parameter in request', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'cam-123' })
      })

      await getCamera('cam-123', { include: ['deviceInfo', 'streamUrls', 'shareDetails'] })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.c001.eagleeyenetworks.com/api/v3.0/cameras/cam-123?include=deviceInfo%2CstreamUrls%2CshareDetails',
        expect.any(Object)
      )
    })

    it('should handle 404 not found error', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ message: 'Camera not found' })
      })

      const result = await getCamera('nonexistent')

      expect(result.error?.code).toBe('NOT_FOUND')
      expect(result.error?.status).toBe(404)
    })

    it('should handle 403 forbidden error', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: () => Promise.resolve({ message: 'Access denied' })
      })

      const result = await getCamera('cam-123')

      expect(result.error?.code).toBe('FORBIDDEN')
      expect(result.error?.status).toBe(403)
    })

    it('should handle generic API error', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({ error: 'Database unavailable' })
      })

      const result = await getCamera('cam-123')

      expect(result.error?.code).toBe('API_ERROR')
      expect(result.error?.status).toBe(500)
      expect(result.error?.message).toContain('Database unavailable')
    })

    it('should handle non-JSON error response', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        json: () => Promise.reject(new Error('Invalid JSON'))
      })

      const result = await getCamera('cam-123')

      expect(result.error?.code).toBe('SERVICE_UNAVAILABLE')
      expect(result.error?.message).toContain('Service Unavailable')
    })

    it('should handle network errors', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockRejectedValueOnce(new Error('DNS resolution failed'))

      const result = await getCamera('cam-123')

      expect(result.error?.code).toBe('NETWORK_ERROR')
      expect(result.error?.message).toContain('DNS resolution failed')
    })
  })
})
