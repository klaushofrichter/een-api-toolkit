import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { listEvents, getEvent, listEventTypes, listEventFieldValues } from '../events/service'
import { useAuthStore } from '../auth/store'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('Events service functions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('listEvents', () => {
    const validParams = {
      actor: 'camera:100d4c41',
      type__in: ['een.motionDetectionEvent.v1'],
      startTimestamp__gte: '2024-01-01T00:00:00.000Z'
    }

    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await listEvents(validParams)

      expect(result.error).not.toBeNull()
      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.data).toBeNull()
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return AUTH_REQUIRED when baseUrl is not set', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      // baseUrl not set

      const result = await listEvents(validParams)

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.message).toBe('Base URL not configured')
    })

    it('should return VALIDATION_ERROR when actor is missing', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      const result = await listEvents({
        actor: '',
        type__in: ['een.motionDetectionEvent.v1'],
        startTimestamp__gte: '2024-01-01T00:00:00.000Z'
      })

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toBe('actor parameter is required')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return VALIDATION_ERROR when type__in is empty', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      const result = await listEvents({
        actor: 'camera:100d4c41',
        type__in: [],
        startTimestamp__gte: '2024-01-01T00:00:00.000Z'
      })

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toBe('type__in parameter is required and must not be empty')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return VALIDATION_ERROR when startTimestamp__gte is missing', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      const result = await listEvents({
        actor: 'camera:100d4c41',
        type__in: ['een.motionDetectionEvent.v1'],
        startTimestamp__gte: ''
      })

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toBe('startTimestamp__gte parameter is required')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should fetch events successfully with required params', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      const mockResponse = {
        results: [
          {
            id: 'event-1',
            type: 'een.motionDetectionEvent.v1',
            startTimestamp: '2024-01-01T00:00:00.000Z',
            span: false,
            accountId: 'acc-123',
            actorId: '100d4c41',
            actorAccountId: 'acc-123',
            actorType: 'camera',
            creatorId: 'creator-1',
            dataSchemas: [],
            data: []
          },
          {
            id: 'event-2',
            type: 'een.motionDetectionEvent.v1',
            startTimestamp: '2024-01-01T00:01:00.000Z',
            span: false,
            accountId: 'acc-123',
            actorId: '100d4c41',
            actorAccountId: 'acc-123',
            actorType: 'camera',
            creatorId: 'creator-1',
            dataSchemas: [],
            data: []
          }
        ],
        nextPageToken: 'next-token-456',
        totalSize: 50
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await listEvents(validParams)

      expect(result.error).toBeNull()
      expect(result.data?.results).toHaveLength(2)
      expect(result.data?.nextPageToken).toBe('next-token-456')
      expect(result.data?.totalSize).toBe(50)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v3.0/events?'),
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
        json: () => Promise.resolve({ results: [] })
      })

      await listEvents(validParams)

      const call = mockFetch.mock.calls[0]
      expect(call).toBeDefined()
      const url = call![0] as string
      expect(url).toContain('actor=camera%3A100d4c41')
      expect(url).toContain('type__in=een.motionDetectionEvent.v1')
      // Timestamp is converted from Z to +00:00 format
      expect(url).toContain('startTimestamp__gte=2024-01-01T00%3A00%3A00.000%2B00%3A00')
    })

    it('should include pagination parameters', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      })

      await listEvents({ ...validParams, pageSize: 50, pageToken: 'page-xyz' })

      const call = mockFetch.mock.calls[0]
      expect(call).toBeDefined()
      const url = call![0] as string
      expect(url).toContain('pageSize=50')
      expect(url).toContain('pageToken=page-xyz')
    })

    it('should include optional time filters', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      })

      await listEvents({
        ...validParams,
        startTimestamp__lte: '2024-01-02T00:00:00.000Z',
        endTimestamp__gte: '2024-01-01T00:00:00.000Z',
        endTimestamp__lte: '2024-01-02T00:00:00.000Z'
      })

      const call = mockFetch.mock.calls[0]
      expect(call).toBeDefined()
      const url = call![0] as string
      expect(url).toContain('startTimestamp__lte=')
      expect(url).toContain('endTimestamp__gte=')
      expect(url).toContain('endTimestamp__lte=')
    })

    it('should include sort parameter', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      })

      await listEvents({ ...validParams, sort: '-startTimestamp' })

      const call = mockFetch.mock.calls[0]
      expect(call).toBeDefined()
      const url = call![0] as string
      expect(url).toContain('sort=-startTimestamp')
    })

    it('should include include parameter', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      })

      await listEvents({
        ...validParams,
        include: ['data.een.objectDetection.v1', 'data.een.fullFrameImageUrl.v1']
      })

      const call = mockFetch.mock.calls[0]
      expect(call).toBeDefined()
      const url = call![0] as string
      expect(url).toContain('include=data.een.objectDetection.v1%2Cdata.een.fullFrameImageUrl.v1')
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

      const result = await listEvents(validParams)

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

      const result = await listEvents(validParams)

      expect(result.error?.code).toBe('RATE_LIMITED')
      expect(result.error?.status).toBe(429)
    })

    it('should handle network errors', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockRejectedValueOnce(new Error('Connection refused'))

      const result = await listEvents(validParams)

      expect(result.error?.code).toBe('NETWORK_ERROR')
      expect(result.error?.message).toContain('Connection refused')
    })
  })

  describe('getEvent', () => {
    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await getEvent('event-123')

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return AUTH_REQUIRED when baseUrl is not set', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      // baseUrl not set

      const result = await getEvent('event-123')

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.message).toBe('Base URL not configured')
    })

    it('should return VALIDATION_ERROR when eventId is empty', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      const result = await getEvent('')

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toBe('Event ID is required')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should fetch event by ID successfully', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      const mockEvent = {
        id: 'event-123',
        type: 'een.motionDetectionEvent.v1',
        startTimestamp: '2024-01-01T00:00:00.000Z',
        span: false,
        accountId: 'acc-123',
        actorId: '100d4c41',
        actorAccountId: 'acc-123',
        actorType: 'camera',
        creatorId: 'creator-1',
        dataSchemas: [],
        data: []
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockEvent)
      })

      const result = await getEvent('event-123')

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockEvent)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.c001.eagleeyenetworks.com/api/v3.0/events/event-123',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer test-token'
          }
        })
      )
    })

    it('should encode eventId with special characters', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'event/123' })
      })

      await getEvent('event/123')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.c001.eagleeyenetworks.com/api/v3.0/events/event%2F123',
        expect.any(Object)
      )
    })

    it('should include include parameter in request', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'event-123' })
      })

      await getEvent('event-123', {
        include: ['data.een.objectDetection.v1', 'data.een.fullFrameImageUrl.v1']
      })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.c001.eagleeyenetworks.com/api/v3.0/events/event-123?include=data.een.objectDetection.v1%2Cdata.een.fullFrameImageUrl.v1',
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
        json: () => Promise.resolve({ message: 'Event not found' })
      })

      const result = await getEvent('nonexistent')

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

      const result = await getEvent('event-123')

      expect(result.error?.code).toBe('FORBIDDEN')
      expect(result.error?.status).toBe(403)
    })

    it('should handle network errors', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockRejectedValueOnce(new Error('DNS resolution failed'))

      const result = await getEvent('event-123')

      expect(result.error?.code).toBe('NETWORK_ERROR')
      expect(result.error?.message).toContain('DNS resolution failed')
    })
  })

  describe('listEventTypes', () => {
    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await listEventTypes()

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return AUTH_REQUIRED when baseUrl is not set', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      // baseUrl not set

      const result = await listEventTypes()

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.message).toBe('Base URL not configured')
    })

    it('should fetch event types successfully', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      const mockResponse = {
        results: [
          {
            type: 'een.motionDetectionEvent.v1',
            name: 'Motion Detection',
            description: 'Motion detected in camera view'
          },
          {
            type: 'een.objectDetectionEvent.v1',
            name: 'Object Detection',
            description: 'Object detected in camera view'
          }
        ],
        nextPageToken: 'next-token',
        totalSize: 10
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await listEventTypes()

      expect(result.error).toBeNull()
      expect(result.data?.results).toHaveLength(2)
      expect(result.data?.nextPageToken).toBe('next-token')
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.c001.eagleeyenetworks.com/api/v3.0/eventTypes',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer test-token'
          }
        })
      )
    })

    it('should include pagination parameters', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      })

      await listEventTypes({ pageSize: 20, pageToken: 'page-abc' })

      const call = mockFetch.mock.calls[0]
      expect(call).toBeDefined()
      const url = call![0] as string
      expect(url).toContain('pageSize=20')
      expect(url).toContain('pageToken=page-abc')
    })

    it('should include language parameter', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      })

      await listEventTypes({ language: 'de' })

      const call = mockFetch.mock.calls[0]
      expect(call).toBeDefined()
      const url = call![0] as string
      expect(url).toContain('language=de')
    })

    it('should handle network errors', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await listEventTypes()

      expect(result.error?.code).toBe('NETWORK_ERROR')
      expect(result.error?.message).toContain('Network error')
    })
  })

  describe('listEventFieldValues', () => {
    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await listEventFieldValues({ actor: 'camera:100d4c41' })

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return AUTH_REQUIRED when baseUrl is not set', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      // baseUrl not set

      const result = await listEventFieldValues({ actor: 'camera:100d4c41' })

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.message).toBe('Base URL not configured')
    })

    it('should return VALIDATION_ERROR when actor is missing', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      const result = await listEventFieldValues({ actor: '' })

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toBe('actor parameter is required')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should fetch field values successfully', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      const mockResponse = {
        type: ['een.motionDetectionEvent.v1', 'een.objectDetectionEvent.v1']
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await listEventFieldValues({ actor: 'camera:100d4c41' })

      expect(result.error).toBeNull()
      expect(result.data?.type).toHaveLength(2)
      expect(result.data?.type).toContain('een.motionDetectionEvent.v1')
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.c001.eagleeyenetworks.com/api/v3.0/events:listFieldValues?actor=camera%3A100d4c41',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer test-token'
          }
        })
      )
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

      const result = await listEventFieldValues({ actor: 'camera:nonexistent' })

      expect(result.error?.code).toBe('NOT_FOUND')
      expect(result.error?.status).toBe(404)
    })

    it('should handle network errors', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockRejectedValueOnce(new Error('Connection timeout'))

      const result = await listEventFieldValues({ actor: 'camera:100d4c41' })

      expect(result.error?.code).toBe('NETWORK_ERROR')
      expect(result.error?.message).toContain('Connection timeout')
    })
  })
})
