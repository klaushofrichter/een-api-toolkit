import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { getEventMetrics } from '../eventMetrics/service'
import { useAuthStore } from '../auth/store'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('Event Metrics service functions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('getEventMetrics', () => {
    const validParams = {
      actor: 'camera:100d4c41',
      eventType: 'een.motionDetectionEvent.v1'
    }

    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await getEventMetrics(validParams)

      expect(result.error).not.toBeNull()
      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.data).toBeNull()
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return AUTH_REQUIRED when baseUrl is not set', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      // baseUrl not set

      const result = await getEventMetrics(validParams)

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.message).toBe('Base URL not configured')
    })

    it('should return VALIDATION_ERROR when actor is missing', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      const result = await getEventMetrics({
        actor: '',
        eventType: 'een.motionDetectionEvent.v1'
      })

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toBe('actor parameter is required')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return VALIDATION_ERROR when eventType is missing', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      const result = await getEventMetrics({
        actor: 'camera:100d4c41',
        eventType: ''
      })

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toBe('eventType parameter is required')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should fetch event metrics successfully with required params', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      const mockResponse = [
        {
          eventType: 'een.motionDetectionEvent.v1',
          actorId: '100d4c41',
          actorType: 'camera',
          target: 'count',
          dataPoints: [
            [1704067200000, 5],
            [1704070800000, 10],
            [1704074400000, 3]
          ]
        }
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await getEventMetrics(validParams)

      expect(result.error).toBeNull()
      expect(result.data).toHaveLength(1)
      const firstMetric = result.data![0]!
      expect(firstMetric.eventType).toBe('een.motionDetectionEvent.v1')
      expect(firstMetric.dataPoints).toHaveLength(3)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v3.0/eventMetrics?'),
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer test-token'
          }
        })
      )
    })

    it('should include required params in URL', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      })

      await getEventMetrics(validParams)

      const call = mockFetch.mock.calls[0]
      expect(call).toBeDefined()
      const url = call![0] as string
      expect(url).toContain('actor=camera%3A100d4c41')
      expect(url).toContain('eventType=een.motionDetectionEvent.v1')
    })

    it('should include optional timestamp params', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      })

      await getEventMetrics({
        ...validParams,
        timestamp__gte: '2024-01-01T00:00:00.000Z',
        timestamp__lte: '2024-01-02T00:00:00.000Z'
      })

      const call = mockFetch.mock.calls[0]
      expect(call).toBeDefined()
      const url = call![0] as string
      expect(url).toContain('timestamp__gte=')
      expect(url).toContain('timestamp__lte=')
    })

    it('should include aggregateByMinutes param', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      })

      await getEventMetrics({
        ...validParams,
        aggregateByMinutes: 30
      })

      const call = mockFetch.mock.calls[0]
      expect(call).toBeDefined()
      const url = call![0] as string
      expect(url).toContain('aggregateByMinutes=30')
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

      const result = await getEventMetrics(validParams)

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.status).toBe(401)
    })

    it('should handle 403 error', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: () => Promise.resolve({ message: 'Access denied' })
      })

      const result = await getEventMetrics(validParams)

      expect(result.error?.code).toBe('FORBIDDEN')
      expect(result.error?.status).toBe(403)
    })

    it('should handle 404 error', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ message: 'Actor not found' })
      })

      const result = await getEventMetrics(validParams)

      expect(result.error?.code).toBe('NOT_FOUND')
      expect(result.error?.status).toBe(404)
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

      const result = await getEventMetrics(validParams)

      expect(result.error?.code).toBe('RATE_LIMITED')
      expect(result.error?.status).toBe(429)
    })

    it('should handle network errors', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockRejectedValueOnce(new Error('Connection refused'))

      const result = await getEventMetrics(validParams)

      expect(result.error?.code).toBe('NETWORK_ERROR')
      expect(result.error?.message).toContain('Connection refused')
    })

    it('should handle empty response', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      })

      const result = await getEventMetrics(validParams)

      expect(result.error).toBeNull()
      expect(result.data).toEqual([])
    })

    it('should handle JSON parse error in error response', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('Invalid JSON'))
      })

      const result = await getEventMetrics(validParams)

      expect(result.error?.code).toBe('API_ERROR')
      expect(result.error?.message).toContain('Internal Server Error')
    })
  })
})
