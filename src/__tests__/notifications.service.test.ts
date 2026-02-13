import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { listNotifications, getNotification } from '../notifications/service'
import { useAuthStore } from '../auth/store'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('Notifications service functions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('listNotifications', () => {
    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await listNotifications()

      expect(result.error).not.toBeNull()
      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.data).toBeNull()
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return AUTH_REQUIRED when baseUrl is not set', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      // baseUrl not set

      const result = await listNotifications()

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.message).toBe('Base URL not configured')
    })

    it('should fetch notifications successfully without params', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      const mockResponse = {
        results: [
          {
            id: 'notification-1',
            timestamp: '2024-01-01T00:00:00.000Z',
            createTimestamp: '2024-01-01T00:00:00.000Z',
            actorId: '100d4c41',
            actorType: 'camera',
            actorAccountId: 'acc-123',
            userId: 'user-123',
            accountId: 'acc-123',
            read: false,
            status: 'delivered',
            category: 'video',
            notificationActions: ['email'],
            dataSchemas: [],
            data: {}
          }
        ],
        nextPageToken: 'next-token-123',
        totalSize: 50
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await listNotifications()

      expect(result.error).toBeNull()
      expect(result.data?.results).toHaveLength(1)
      expect(result.data?.nextPageToken).toBe('next-token-123')
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.c001.eagleeyenetworks.com/api/v3.0/notifications',
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

      await listNotifications({ pageSize: 50, pageToken: 'page-xyz' })

      const call = mockFetch.mock.calls[0]
      expect(call).toBeDefined()
      const url = call![0] as string
      expect(url).toContain('pageSize=50')
      expect(url).toContain('pageToken=page-xyz')
    })

    it('should include time filter parameters', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      })

      await listNotifications({
        timestamp__gte: '2024-01-01T00:00:00.000Z',
        timestamp__lte: '2024-01-02T00:00:00.000Z'
      })

      const call = mockFetch.mock.calls[0]
      expect(call).toBeDefined()
      const url = call![0] as string
      expect(url).toContain('timestamp__gte=')
      expect(url).toContain('timestamp__lte=')
    })

    it('should include entity filter parameters', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      })

      await listNotifications({
        actorId: '100d4c41',
        actorType: 'camera',
        alertType: 'een.motionDetectionAlert.v1'
      })

      const call = mockFetch.mock.calls[0]
      expect(call).toBeDefined()
      const url = call![0] as string
      expect(url).toContain('actorId=100d4c41')
      expect(url).toContain('actorType=camera')
      expect(url).toContain('alertType=een.motionDetectionAlert.v1')
    })

    it('should include category and status filters', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      })

      await listNotifications({
        category: 'video',
        status: 'delivered'
      })

      const call = mockFetch.mock.calls[0]
      expect(call).toBeDefined()
      const url = call![0] as string
      expect(url).toContain('category=video')
      expect(url).toContain('status=delivered')
    })

    it('should include read filter', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      })

      await listNotifications({ read: false })

      const call = mockFetch.mock.calls[0]
      expect(call).toBeDefined()
      const url = call![0] as string
      expect(url).toContain('read=false')
    })

    it('should include sort parameter', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      })

      await listNotifications({ sort: ['-timestamp'] })

      const call = mockFetch.mock.calls[0]
      expect(call).toBeDefined()
      const url = call![0] as string
      expect(url).toContain('sort=-timestamp')
    })

    it('should include language parameter', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      })

      await listNotifications({ language: 'de' })

      const call = mockFetch.mock.calls[0]
      expect(call).toBeDefined()
      const url = call![0] as string
      expect(url).toContain('language=de')
    })

    it('should include includeV1Notifications parameter', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      })

      await listNotifications({ includeV1Notifications: true })

      const call = mockFetch.mock.calls[0]
      expect(call).toBeDefined()
      const url = call![0] as string
      expect(url).toContain('includeV1Notifications=true')
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

      const result = await listNotifications()

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

      const result = await listNotifications()

      expect(result.error?.code).toBe('RATE_LIMITED')
      expect(result.error?.status).toBe(429)
    })

    it('should handle network errors', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockRejectedValueOnce(new Error('Connection refused'))

      const result = await listNotifications()

      expect(result.error?.code).toBe('NETWORK_ERROR')
      expect(result.error?.message).toContain('Connection refused')
    })
  })

  describe('getNotification', () => {
    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await getNotification('notification-123')

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return AUTH_REQUIRED when baseUrl is not set', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      // baseUrl not set

      const result = await getNotification('notification-123')

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.message).toBe('Base URL not configured')
    })

    it('should return VALIDATION_ERROR when notificationId is empty', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      const result = await getNotification('')

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toBe('Notification ID is required')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should fetch notification by ID successfully', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      const mockNotification = {
        id: 'notification-123',
        timestamp: '2024-01-01T00:00:00.000Z',
        createTimestamp: '2024-01-01T00:00:00.000Z',
        actorId: '100d4c41',
        actorType: 'camera',
        actorAccountId: 'acc-123',
        userId: 'user-123',
        accountId: 'acc-123',
        read: false,
        status: 'delivered',
        category: 'video',
        description: 'Motion detected',
        notificationActions: ['email'],
        dataSchemas: [],
        data: {}
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockNotification)
      })

      const result = await getNotification('notification-123')

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockNotification)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.c001.eagleeyenetworks.com/api/v3.0/notifications/notification-123',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer test-token'
          }
        })
      )
    })

    it('should encode notificationId with special characters', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'notification/123' })
      })

      await getNotification('notification/123')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.c001.eagleeyenetworks.com/api/v3.0/notifications/notification%2F123',
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
        json: () => Promise.resolve({ message: 'Notification not found' })
      })

      const result = await getNotification('nonexistent')

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

      const result = await getNotification('notification-123')

      expect(result.error?.code).toBe('FORBIDDEN')
      expect(result.error?.status).toBe(403)
    })

    it('should handle network errors', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockRejectedValueOnce(new Error('DNS resolution failed'))

      const result = await getNotification('notification-123')

      expect(result.error?.code).toBe('NETWORK_ERROR')
      expect(result.error?.message).toContain('DNS resolution failed')
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

      const result = await getNotification('notification-123')

      expect(result.error?.code).toBe('API_ERROR')
      expect(result.error?.message).toContain('Internal Server Error')
    })
  })
})
