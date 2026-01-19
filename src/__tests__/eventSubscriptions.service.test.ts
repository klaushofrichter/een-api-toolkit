import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import {
  listEventSubscriptions,
  getEventSubscription,
  createEventSubscription,
  deleteEventSubscription,
  connectToEventSubscription
} from '../eventSubscriptions/service'
import { useAuthStore } from '../auth/store'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('EventSubscriptions service functions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('listEventSubscriptions', () => {
    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await listEventSubscriptions()

      expect(result.error).not.toBeNull()
      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.data).toBeNull()
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return AUTH_REQUIRED when baseUrl is not set', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      // baseUrl not set

      const result = await listEventSubscriptions()

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.message).toBe('Base URL not configured')
    })

    it('should fetch event subscriptions successfully', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const mockResponse = {
        results: [
          {
            id: 'sub-1',
            subscriptionConfig: {
              lifeCycle: 'temporary',
              timeToLiveSeconds: 900
            },
            deliveryConfig: {
              type: 'serverSentEvents.v1',
              sseUrl: 'https://api.example.com/sse/v3.0/eventSubscriptions/sub-1'
            }
          },
          {
            id: 'sub-2',
            subscriptionConfig: {
              lifeCycle: 'temporary',
              timeToLiveSeconds: 900
            },
            deliveryConfig: {
              type: 'serverSentEvents.v1',
              sseUrl: 'https://api.example.com/sse/v3.0/eventSubscriptions/sub-2'
            }
          }
        ],
        nextPageToken: 'next-token-456',
        totalSize: 10
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await listEventSubscriptions()

      expect(result.error).toBeNull()
      expect(result.data?.results).toHaveLength(2)
      expect(result.data?.nextPageToken).toBe('next-token-456')
      expect(result.data?.totalSize).toBe(10)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v3.0/eventSubscriptions',
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
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      })

      await listEventSubscriptions({ pageSize: 50, pageToken: 'page-xyz' })

      const call = mockFetch.mock.calls[0]
      expect(call).toBeDefined()
      const url = call![0] as string
      expect(url).toContain('pageSize=50')
      expect(url).toContain('pageToken=page-xyz')
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

      const result = await listEventSubscriptions()

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.status).toBe(401)
    })

    it('should handle network errors', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockRejectedValueOnce(new Error('Connection refused'))

      const result = await listEventSubscriptions()

      expect(result.error?.code).toBe('NETWORK_ERROR')
      expect(result.error?.message).toContain('Connection refused')
    })
  })

  describe('getEventSubscription', () => {
    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await getEventSubscription('sub-123')

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return AUTH_REQUIRED when baseUrl is not set', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      // baseUrl not set

      const result = await getEventSubscription('sub-123')

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.message).toBe('Base URL not configured')
    })

    it('should return VALIDATION_ERROR when subscriptionId is empty', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const result = await getEventSubscription('')

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toBe('Subscription ID is required')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should fetch event subscription by ID successfully', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const mockSubscription = {
        id: 'sub-123',
        subscriptionConfig: {
          lifeCycle: 'temporary',
          timeToLiveSeconds: 900
        },
        deliveryConfig: {
          type: 'serverSentEvents.v1',
          sseUrl: 'https://api.example.com/sse/v3.0/eventSubscriptions/sub-123'
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSubscription)
      })

      const result = await getEventSubscription('sub-123')

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockSubscription)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v3.0/eventSubscriptions/sub-123',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer test-token'
          }
        })
      )
    })

    it('should encode subscriptionId with special characters', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'sub/123' })
      })

      await getEventSubscription('sub/123')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v3.0/eventSubscriptions/sub%2F123',
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
        json: () => Promise.resolve({ message: 'Subscription not found' })
      })

      const result = await getEventSubscription('nonexistent')

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

      const result = await getEventSubscription('sub-123')

      expect(result.error?.code).toBe('FORBIDDEN')
      expect(result.error?.status).toBe(403)
    })

    it('should handle network errors', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockRejectedValueOnce(new Error('DNS resolution failed'))

      const result = await getEventSubscription('sub-123')

      expect(result.error?.code).toBe('NETWORK_ERROR')
      expect(result.error?.message).toContain('DNS resolution failed')
    })
  })

  describe('createEventSubscription', () => {
    const validParams = {
      deliveryConfig: { type: 'serverSentEvents.v1' as const },
      filters: [{
        actors: ['camera:100d4c41'],
        types: [{ id: 'een.motionDetectionEvent.v1' }]
      }]
    }

    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await createEventSubscription(validParams)

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return AUTH_REQUIRED when baseUrl is not set', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      // baseUrl not set

      const result = await createEventSubscription(validParams)

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.message).toBe('Base URL not configured')
    })

    it('should return VALIDATION_ERROR when deliveryConfig is missing', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const result = await createEventSubscription({
        deliveryConfig: undefined as unknown as { type: 'serverSentEvents.v1' },
        filters: validParams.filters
      })

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toBe('deliveryConfig is required')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return VALIDATION_ERROR when filters is empty', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const result = await createEventSubscription({
        deliveryConfig: validParams.deliveryConfig,
        filters: []
      })

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toBe('At least one filter is required')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return VALIDATION_ERROR when filter has no actors', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const result = await createEventSubscription({
        deliveryConfig: validParams.deliveryConfig,
        filters: [{
          actors: [],
          types: [{ id: 'een.motionDetectionEvent.v1' }]
        }]
      })

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toBe('Each filter must have at least one actor')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return VALIDATION_ERROR when filter has no types', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const result = await createEventSubscription({
        deliveryConfig: validParams.deliveryConfig,
        filters: [{
          actors: ['camera:100d4c41'],
          types: []
        }]
      })

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toBe('Each filter must have at least one event type')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should create event subscription successfully', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const mockSubscription = {
        id: 'new-sub-123',
        subscriptionConfig: {
          lifeCycle: 'temporary',
          timeToLiveSeconds: 900
        },
        deliveryConfig: {
          type: 'serverSentEvents.v1',
          sseUrl: 'https://api.example.com/sse/v3.0/eventSubscriptions/new-sub-123'
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSubscription)
      })

      const result = await createEventSubscription(validParams)

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockSubscription)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v3.0/eventSubscriptions',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          },
          body: JSON.stringify(validParams)
        })
      )
    })

    it('should handle 400 validation error from server', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({ message: 'Invalid filter format' })
      })

      const result = await createEventSubscription(validParams)

      expect(result.error?.code).toBe('API_ERROR')
      expect(result.error?.message).toContain('Invalid filter format')
    })

    it('should handle network errors', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockRejectedValueOnce(new Error('Network timeout'))

      const result = await createEventSubscription(validParams)

      expect(result.error?.code).toBe('NETWORK_ERROR')
      expect(result.error?.message).toContain('Network timeout')
    })
  })

  describe('deleteEventSubscription', () => {
    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await deleteEventSubscription('sub-123')

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return AUTH_REQUIRED when baseUrl is not set', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      // baseUrl not set

      const result = await deleteEventSubscription('sub-123')

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.message).toBe('Base URL not configured')
    })

    it('should return VALIDATION_ERROR when subscriptionId is empty', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const result = await deleteEventSubscription('')

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toBe('Subscription ID is required')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should delete event subscription successfully', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: true
      })

      const result = await deleteEventSubscription('sub-123')

      expect(result.error).toBeNull()
      expect(result.data).toBeUndefined()
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v3.0/eventSubscriptions/sub-123',
        expect.objectContaining({
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer test-token'
          }
        })
      )
    })

    it('should encode subscriptionId with special characters', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: true
      })

      await deleteEventSubscription('sub/123')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v3.0/eventSubscriptions/sub%2F123',
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
        json: () => Promise.resolve({ message: 'Subscription not found' })
      })

      const result = await deleteEventSubscription('nonexistent')

      expect(result.error?.code).toBe('NOT_FOUND')
      expect(result.error?.status).toBe(404)
    })

    it('should handle network errors', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockRejectedValueOnce(new Error('Connection reset'))

      const result = await deleteEventSubscription('sub-123')

      expect(result.error?.code).toBe('NETWORK_ERROR')
      expect(result.error?.message).toContain('Connection reset')
    })
  })

  describe('connectToEventSubscription', () => {
    it('should return AUTH_REQUIRED when not authenticated', () => {
      const result = connectToEventSubscription(
        'https://api.c001.eagleeyenetworks.com/sse/eventSubscriptions/sub-123',
        { onEvent: vi.fn() }
      )

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return AUTH_REQUIRED when token is not available', () => {
      const authStore = useAuthStore()
      authStore.setBaseUrl('https://api.example.com')
      // token not set

      const result = connectToEventSubscription(
        'https://api.c001.eagleeyenetworks.com/sse/eventSubscriptions/sub-123',
        { onEvent: vi.fn() }
      )

      expect(result.error?.code).toBe('AUTH_REQUIRED')
    })

    it('should return VALIDATION_ERROR when sseUrl is empty', () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const result = connectToEventSubscription('', { onEvent: vi.fn() })

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toBe('SSE URL is required')
    })

    it('should return VALIDATION_ERROR for invalid URL format', () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const result = connectToEventSubscription('not-a-valid-url', { onEvent: vi.fn() })

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toBe('Invalid SSE URL format')
    })

    it('should return VALIDATION_ERROR for untrusted SSE URL domain', () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const result = connectToEventSubscription(
        'https://malicious-site.com/sse/events',
        { onEvent: vi.fn() }
      )

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toContain('SSE URL domain not allowed')
    })

    it('should return SSE connection object on success', () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      // Mock successful fetch that never resolves (simulating SSE connection)
      mockFetch.mockReturnValueOnce(new Promise(() => {}))

      const result = connectToEventSubscription(
        'https://api.c001.eagleeyenetworks.com/sse/eventSubscriptions/sub-123',
        { onEvent: vi.fn() }
      )

      expect(result.error).toBeNull()
      expect(result.data).toBeDefined()
      expect(typeof result.data?.close).toBe('function')
      expect(result.data?.status).toBe('connecting')

      // Clean up
      result.data?.close()
    })

    it('should call onStatusChange callback', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const onStatusChange = vi.fn()

      // Mock successful fetch that never resolves
      mockFetch.mockReturnValueOnce(new Promise(() => {}))

      const result = connectToEventSubscription(
        'https://api.c001.eagleeyenetworks.com/sse/eventSubscriptions/sub-123',
        { onEvent: vi.fn(), onStatusChange }
      )

      // Initial status change should be 'connecting'
      expect(onStatusChange).toHaveBeenCalledWith('connecting')

      // Clean up
      result.data?.close()

      // After close, status should be 'disconnected'
      expect(onStatusChange).toHaveBeenCalledWith('disconnected')
    })

    it('should use correct headers for SSE request', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      // Mock successful fetch that never resolves
      mockFetch.mockReturnValueOnce(new Promise(() => {}))

      const result = connectToEventSubscription(
        'https://api.c001.eagleeyenetworks.com/sse/eventSubscriptions/sub-123',
        { onEvent: vi.fn() }
      )

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.c001.eagleeyenetworks.com/sse/eventSubscriptions/sub-123',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Accept': 'text/event-stream',
            'Authorization': 'Bearer test-token'
          }
        })
      )

      // Clean up
      result.data?.close()
    })

    it('should handle connection errors', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const onError = vi.fn()
      const onStatusChange = vi.fn()

      // Mock a failed fetch
      mockFetch.mockRejectedValueOnce(new Error('Connection failed'))

      const result = connectToEventSubscription(
        'https://api.c001.eagleeyenetworks.com/sse/eventSubscriptions/sub-123',
        { onEvent: vi.fn(), onError, onStatusChange }
      )

      // Give time for the async connection to fail
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(onError).toHaveBeenCalled()
      expect(onStatusChange).toHaveBeenCalledWith('error')

      // Clean up
      result.data?.close()
    })
  })
})
