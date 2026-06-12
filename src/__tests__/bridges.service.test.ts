import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { getBridges, getBridge } from '../bridges/service'
import { useAuthStore } from '../auth/store'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('Bridge service functions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('getBridges', () => {
    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await getBridges()

      expect(result.error).not.toBeNull()
      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.data).toBeNull()
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return AUTH_REQUIRED when baseUrl is not set', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      // baseUrl not set

      const result = await getBridges()

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.message).toBe('Base URL not configured')
    })

    it('should fetch bridges successfully', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      const mockResponse = {
        results: [
          { id: 'bridge-1', name: 'Bridge 1', accountId: 'acc-123' },
          { id: 'bridge-2', name: 'Bridge 2', accountId: 'acc-123' }
        ],
        nextPageToken: 'next-token-456',
        totalSize: 10
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await getBridges()

      expect(result.error).toBeNull()
      expect(result.data?.results).toHaveLength(2)
      expect(result.data?.nextPageToken).toBe('next-token-456')
      expect(result.data?.totalSize).toBe(10)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.c001.eagleeyenetworks.com/api/v3.0/bridges',
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

      await getBridges({ pageSize: 100, pageToken: 'page-xyz' })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.c001.eagleeyenetworks.com/api/v3.0/bridges?pageSize=100&pageToken=page-xyz',
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

      await getBridges({ include: ['deviceInfo', 'networkInfo'], sort: ['-createdAt'] })

      const call = mockFetch.mock.calls[0]
      expect(call).toBeDefined()
      const url = call![0] as string
      expect(url).toContain('include=deviceInfo%2CnetworkInfo')
      expect(url).toContain('sort=-createdAt')
    })

    it('should include location filters', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      })

      await getBridges({ locationId__in: ['loc-1', 'loc-2'] })

      const call = mockFetch.mock.calls[0]
      expect(call).toBeDefined()
      const url = call![0] as string
      expect(url).toContain('locationId__in=loc-1%2Cloc-2')
    })

    it('should include status filters', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      })

      await getBridges({ status__in: ['online'], status__ne: 'offline' })

      const call = mockFetch.mock.calls[0]
      expect(call).toBeDefined()
      const url = call![0] as string
      expect(url).toContain('status__in=online')
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

      await getBridges({ tags__contains: ['production'], tags__any: ['primary', 'secondary'] })

      const call = mockFetch.mock.calls[0]
      expect(call).toBeDefined()
      const url = call![0] as string
      expect(url).toContain('tags__contains=production')
      expect(url).toContain('tags__any=primary%2Csecondary')
    })

    it('should include name filters', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      })

      await getBridges({ name: 'Main Bridge', name__contains: 'main' })

      const call = mockFetch.mock.calls[0]
      expect(call).toBeDefined()
      const url = call![0] as string
      expect(url).toContain('name=Main+Bridge')
      expect(url).toContain('name__contains=main')
    })

    it('should include ID filters', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      })

      await getBridges({ id__in: ['bridge-1', 'bridge-2'], id__notIn: ['bridge-3'] })

      const call = mockFetch.mock.calls[0]
      expect(call).toBeDefined()
      const url = call![0] as string
      expect(url).toContain('id__in=bridge-1%2Cbridge-2')
      expect(url).toContain('id__notIn=bridge-3')
    })

    it('should include search parameters', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      })

      await getBridges({ q: 'main office', qRelevance__gte: 0.5 })

      const call = mockFetch.mock.calls[0]
      expect(call).toBeDefined()
      const url = call![0] as string
      expect(url).toContain('q=main+office')
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

      const result = await getBridges()

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

      const result = await getBridges()

      expect(result.error?.code).toBe('RATE_LIMITED')
      expect(result.error?.status).toBe(429)
    })

    it('should handle network errors', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockRejectedValueOnce(new Error('Connection refused'))

      const result = await getBridges()

      expect(result.error?.code).toBe('NETWORK_ERROR')
      expect(result.error?.message).toContain('Connection refused')
    })
  })

  describe('getBridge', () => {
    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await getBridge('bridge-123')

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return AUTH_REQUIRED when baseUrl is not set', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      // baseUrl not set

      const result = await getBridge('bridge-123')

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.message).toBe('Base URL not configured')
    })

    it('should return VALIDATION_ERROR when bridgeId is empty', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      const result = await getBridge('')

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toBe('Bridge ID is required')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should fetch bridge by ID successfully', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      const mockBridge = {
        id: 'bridge-123',
        name: 'Main Office Bridge',
        accountId: 'acc-456',
        status: 'online'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBridge)
      })

      const result = await getBridge('bridge-123')

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockBridge)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.c001.eagleeyenetworks.com/api/v3.0/bridges/bridge-123',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer test-token'
          }
        })
      )
    })

    it('should encode bridgeId with special characters', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'bridge/123' })
      })

      await getBridge('bridge/123')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.c001.eagleeyenetworks.com/api/v3.0/bridges/bridge%2F123',
        expect.any(Object)
      )
    })

    it('should include include parameter in request', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'bridge-123' })
      })

      await getBridge('bridge-123', { include: ['deviceInfo', 'networkInfo', 'status'] })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.c001.eagleeyenetworks.com/api/v3.0/bridges/bridge-123?include=deviceInfo%2CnetworkInfo%2Cstatus',
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
        json: () => Promise.resolve({ message: 'Bridge not found' })
      })

      const result = await getBridge('nonexistent')

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

      const result = await getBridge('bridge-123')

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

      const result = await getBridge('bridge-123')

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

      const result = await getBridge('bridge-123')

      expect(result.error?.code).toBe('SERVICE_UNAVAILABLE')
      expect(result.error?.message).toContain('Service Unavailable')
    })

    it('should handle network errors', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockRejectedValueOnce(new Error('DNS resolution failed'))

      const result = await getBridge('bridge-123')

      expect(result.error?.code).toBe('NETWORK_ERROR')
      expect(result.error?.message).toContain('DNS resolution failed')
    })
  })
})
