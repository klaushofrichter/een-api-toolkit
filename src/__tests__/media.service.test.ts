import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { listMedia, getLiveImage, getRecordedImage, getMediaSession, initMediaSession } from '../media/service'
import { useAuthStore } from '../auth/store'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock btoa for Node.js environment
global.btoa = (str: string) => Buffer.from(str, 'binary').toString('base64')

/**
 * Create a mock Headers object that conforms to the Headers interface.
 * This is more realistic than using Map directly.
 */
function createMockHeaders(headers: Record<string, string>) {
  const entries = Object.entries(headers)
  return {
    get: (name: string) => headers[name] ?? null,
    has: (name: string) => name in headers,
    forEach: (callback: (value: string, key: string) => void) => {
      entries.forEach(([key, value]) => callback(value, key))
    },
    entries: () => entries[Symbol.iterator](),
    keys: () => Object.keys(headers)[Symbol.iterator](),
    values: () => Object.values(headers)[Symbol.iterator](),
    append: () => {},
    delete: () => {},
    set: () => {},
    getSetCookie: () => [] as string[],
    [Symbol.iterator]: () => entries[Symbol.iterator]()
  }
}

describe('Media service functions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('listMedia', () => {
    const validParams = {
      deviceId: 'camera-123',
      type: 'preview' as const,
      mediaType: 'video' as const,
      startTimestamp: '2024-01-15T10:00:00.000Z'
    }

    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await listMedia(validParams)

      expect(result.error).not.toBeNull()
      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.data).toBeNull()
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return AUTH_REQUIRED when baseUrl is not set', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)

      const result = await listMedia(validParams)

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.message).toBe('Base URL not configured')
    })

    it('should return VALIDATION_ERROR when deviceId is missing', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const result = await listMedia({ ...validParams, deviceId: '' })

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toContain('Device ID')
    })

    it('should return VALIDATION_ERROR when type is missing', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const result = await listMedia({ ...validParams, type: '' as 'preview' })

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toContain('Stream type')
    })

    it('should return VALIDATION_ERROR when mediaType is missing', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const result = await listMedia({ ...validParams, mediaType: '' as 'video' })

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toContain('Media type')
    })

    it('should return VALIDATION_ERROR when startTimestamp is missing', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const result = await listMedia({ ...validParams, startTimestamp: '' })

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toContain('Start timestamp')
    })

    it('should fetch media intervals successfully', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const mockResponse = {
        results: [
          {
            type: 'preview',
            deviceId: 'camera-123',
            mediaType: 'video',
            startTimestamp: '2024-01-15T10:00:00.000Z',
            endTimestamp: '2024-01-15T11:00:00.000Z'
          }
        ],
        nextPageToken: 'next-token'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await listMedia(validParams)

      expect(result.error).toBeNull()
      expect(result.data?.results).toHaveLength(1)
      expect(result.data?.nextPageToken).toBe('next-token')
    })

    it('should include all parameters in request URL', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      })

      await listMedia({
        ...validParams,
        endTimestamp: '2024-01-15T12:00:00.000Z',
        coalesce: false,
        include: ['flvUrl', 'hlsUrl'],
        pageSize: 50,
        pageToken: 'page-123'
      })

      const call = mockFetch.mock.calls[0]
      const url = call?.[0] as string
      expect(url).toContain('deviceId=camera-123')
      expect(url).toContain('type=preview')
      expect(url).toContain('mediaType=video')
      expect(url).toContain('startTimestamp__gte=')
      expect(url).toContain('endTimestamp__lte=')
      expect(url).toContain('coalesce=false')
      expect(url).toContain('include=flvUrl%2ChlsUrl')
      expect(url).toContain('pageSize=50')
      expect(url).toContain('pageToken=page-123')
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

      const result = await listMedia(validParams)

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.status).toBe(401)
    })

    it('should handle 404 error', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ message: 'Device not found' })
      })

      const result = await listMedia(validParams)

      expect(result.error?.code).toBe('NOT_FOUND')
      expect(result.error?.status).toBe(404)
    })

    it('should handle network error', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await listMedia(validParams)

      expect(result.error?.code).toBe('NETWORK_ERROR')
      expect(result.error?.message).toContain('Network error')
    })
  })

  describe('getLiveImage', () => {
    const mockImageData = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]).buffer

    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await getLiveImage({ deviceId: 'camera-123' })

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return AUTH_REQUIRED when baseUrl is not set', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)

      const result = await getLiveImage({ deviceId: 'camera-123' })

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.message).toBe('Base URL not configured')
    })

    it('should return VALIDATION_ERROR when deviceId is missing', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const result = await getLiveImage({ deviceId: '' })

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toContain('Device ID')
    })

    it('should enforce preview type through TypeScript', async () => {
      // This test verifies that the type parameter only accepts 'preview' or undefined
      // The validation is enforced at compile time by TypeScript, not runtime
      // Passing invalid values like 'main' would cause a TypeScript error

      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      // Valid: type is optional and defaults to 'preview'
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: createMockHeaders({
          'X-Een-Timestamp': '2024-01-15T10:00:00.000Z'
        }),
        arrayBuffer: () => Promise.resolve(new Uint8Array([0xFF, 0xD8]).buffer)
      })

      const result = await getLiveImage({ deviceId: 'camera-123' }) // type defaults to 'preview'

      expect(result.error).toBeNull()
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('type=preview'),
        expect.any(Object)
      )
    })

    it('should fetch live image successfully', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: createMockHeaders({
          'X-Een-Timestamp': '2024-01-15T10:00:00.000Z',
          'X-Een-PrevToken': 'prev-token-123'
        }),
        arrayBuffer: () => Promise.resolve(mockImageData)
      })

      const result = await getLiveImage({ deviceId: 'camera-123' })

      expect(result.error).toBeNull()
      expect(result.data?.imageData).toMatch(/^data:image\/jpeg;base64,/)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v3.0/media/liveImage.jpeg?deviceId=camera-123&type=preview',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Accept': 'image/jpeg',
            'Authorization': 'Bearer test-token'
          }
        })
      )
    })

    it('should handle 403 error', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        headers: createMockHeaders({}),
        json: () => Promise.resolve({ message: 'Access denied' })
      })

      const result = await getLiveImage({ deviceId: 'camera-123' })

      expect(result.error?.code).toBe('FORBIDDEN')
      expect(result.error?.status).toBe(403)
    })

    it('should handle 503 service unavailable', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        headers: createMockHeaders({}),
        json: () => Promise.resolve({ message: 'Camera offline' })
      })

      const result = await getLiveImage({ deviceId: 'camera-123' })

      expect(result.error?.code).toBe('SERVICE_UNAVAILABLE')
      expect(result.error?.status).toBe(503)
    })
  })

  describe('getRecordedImage', () => {
    const mockImageData = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]).buffer

    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await getRecordedImage({ deviceId: 'camera-123', timestamp__gte: '2024-01-15T10:00:00.000Z' })

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return VALIDATION_ERROR when neither deviceId nor pageToken provided', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const result = await getRecordedImage({})

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toContain('deviceId or pageToken')
    })

    it('should return VALIDATION_ERROR when no timestamp provided without pageToken', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const result = await getRecordedImage({ deviceId: 'camera-123' })

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toContain('timestamp')
    })

    it('should return VALIDATION_ERROR when overlay requested without overlayId', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const result = await getRecordedImage({
        deviceId: 'camera-123',
        timestamp__gte: '2024-01-15T10:00:00.000Z',
        include: ['overlaySvgHeader']
      })

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toContain('overlayId')
    })

    it('should fetch recorded image with timestamp__gte', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: createMockHeaders({
          'X-Een-Timestamp': '2024-01-15T10:00:00.000Z',
          'X-Een-NextToken': 'next-token',
          'X-Een-PrevToken': 'prev-token'
        }),
        arrayBuffer: () => Promise.resolve(mockImageData)
      })

      const result = await getRecordedImage({
        deviceId: 'camera-123',
        type: 'preview',
        timestamp__gte: '2024-01-15T10:00:00.000Z'
      })

      expect(result.error).toBeNull()
      expect(result.data?.imageData).toMatch(/^data:image\/jpeg;base64,/)

      const call = mockFetch.mock.calls[0]
      const url = call?.[0] as string
      expect(url).toContain('deviceId=camera-123')
      expect(url).toContain('type=preview')
      expect(url).toContain('timestamp__gte=')
    })

    it('should fetch recorded image with pageToken only', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: createMockHeaders({
          'X-Een-Timestamp': '2024-01-15T10:00:01.000Z',
          'X-Een-NextToken': 'next-token-2'
        }),
        arrayBuffer: () => Promise.resolve(mockImageData)
      })

      const result = await getRecordedImage({ pageToken: 'page-token-123' })

      expect(result.error).toBeNull()

      const call = mockFetch.mock.calls[0]
      const url = call?.[0] as string
      expect(url).toContain('pageToken=page-token-123')
      expect(url).not.toContain('deviceId')
    })

    it('should include all timestamp parameters', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: createMockHeaders({}),
        arrayBuffer: () => Promise.resolve(mockImageData)
      })

      await getRecordedImage({
        deviceId: 'camera-123',
        timestamp__lt: '2024-01-15T10:00:00.000Z'
      })

      const call = mockFetch.mock.calls[0]
      const url = call?.[0] as string
      expect(url).toContain('timestamp__lt=')
    })

    it('should include size parameters', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: createMockHeaders({}),
        arrayBuffer: () => Promise.resolve(mockImageData)
      })

      await getRecordedImage({
        deviceId: 'camera-123',
        timestamp__gte: '2024-01-15T10:00:00.000Z',
        targetWidth: 1920,
        targetHeight: 1080
      })

      const call = mockFetch.mock.calls[0]
      const url = call?.[0] as string
      expect(url).toContain('targetWidth=1920')
      expect(url).toContain('targetHeight=1080')
    })

    it('should handle 404 error for missing recording', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: createMockHeaders({}),
        json: () => Promise.resolve({ message: 'No recording at timestamp' })
      })

      const result = await getRecordedImage({
        deviceId: 'camera-123',
        timestamp: '2024-01-15T10:00:00.000Z'
      })

      expect(result.error?.code).toBe('NOT_FOUND')
      expect(result.error?.status).toBe(404)
    })

    it('should handle 429 rate limit', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        headers: createMockHeaders({}),
        json: () => Promise.resolve({ message: 'Rate limited' })
      })

      const result = await getRecordedImage({
        deviceId: 'camera-123',
        type: 'main',
        timestamp__gte: '2024-01-15T10:00:00.000Z'
      })

      expect(result.error?.code).toBe('RATE_LIMITED')
      expect(result.error?.status).toBe(429)
    })

    it('should handle network error', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockRejectedValueOnce(new Error('Connection refused'))

      const result = await getRecordedImage({
        deviceId: 'camera-123',
        timestamp__gte: '2024-01-15T10:00:00.000Z'
      })

      expect(result.error?.code).toBe('NETWORK_ERROR')
      expect(result.error?.message).toContain('Connection refused')
    })
  })

  describe('getMediaSession', () => {
    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await getMediaSession()

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return AUTH_REQUIRED when baseUrl is not set', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)

      const result = await getMediaSession()

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.message).toBe('Base URL not configured')
    })

    it('should fetch media session URL successfully', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const mockResponse = {
        url: 'https://media.eagleeyenetworks.com/session/abc123'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await getMediaSession()

      expect(result.error).toBeNull()
      expect(result.data?.url).toBe('https://media.eagleeyenetworks.com/session/abc123')
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v3.0/media/session',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer test-token'
          }
        })
      )
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

      const result = await getMediaSession()

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.status).toBe(401)
    })

    it('should handle 403 error', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: () => Promise.resolve({ message: 'Access denied' })
      })

      const result = await getMediaSession()

      expect(result.error?.code).toBe('FORBIDDEN')
      expect(result.error?.status).toBe(403)
    })

    it('should handle network error', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await getMediaSession()

      expect(result.error?.code).toBe('NETWORK_ERROR')
      expect(result.error?.message).toContain('Network error')
    })
  })

  describe('initMediaSession', () => {
    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await initMediaSession()

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should reject session URL from untrusted domain', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ url: 'https://evil.example.com/session/abc123' })
      })

      const result = await initMediaSession()

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toContain('Session URL domain not allowed')
    })

    it('should accept session URL from een.cloud domain', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ url: 'https://media.een.cloud/session/abc123' })
      })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200
      })

      const result = await initMediaSession()

      expect(result.error).toBeNull()
      expect(result.data?.success).toBe(true)
    })

    it('should complete two-step initialization successfully', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      // First call: get session URL
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ url: 'https://media.eagleeyenetworks.com/session/abc123' })
      })

      // Second call: set the cookie
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200
      })

      const result = await initMediaSession()

      expect(result.error).toBeNull()
      expect(result.data?.success).toBe(true)
      expect(result.data?.sessionUrl).toBe('https://media.eagleeyenetworks.com/session/abc123')

      // Verify both calls were made
      expect(mockFetch).toHaveBeenCalledTimes(2)

      // First call should be to media/session
      expect(mockFetch.mock.calls[0]![0]).toBe('https://api.example.com/api/v3.0/media/session')

      // Second call should be to the session URL with credentials
      expect(mockFetch.mock.calls[1]![0]).toBe('https://media.eagleeyenetworks.com/session/abc123')
      expect(mockFetch.mock.calls[1]![1]).toMatchObject({
        credentials: 'include'
      })
    })

    it('should handle 204 No Content response from session URL', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ url: 'https://media.eagleeyenetworks.com/session/abc123' })
      })

      // 204 No Content is a valid success response
      mockFetch.mockResolvedValueOnce({
        ok: false, // ok is false for 204
        status: 204
      })

      const result = await initMediaSession()

      expect(result.error).toBeNull()
      expect(result.data?.success).toBe(true)
    })

    it('should propagate error from getMediaSession', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({ message: 'Invalid token' })
      })

      const result = await initMediaSession()

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.message).toContain('Failed to get media session')
    })

    it('should handle error when setting cookie', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ url: 'https://media.eagleeyenetworks.com/session/abc123' })
      })

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({ message: 'Session creation failed' })
      })

      const result = await initMediaSession()

      expect(result.error?.code).toBe('API_ERROR')
      expect(result.error?.message).toContain('Failed to set media session cookie')
    })

    it('should handle missing URL in session response', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}) // No URL in response
      })

      const result = await initMediaSession()

      expect(result.error?.code).toBe('API_ERROR')
      expect(result.error?.message).toContain('No session URL returned')
    })

    it('should handle network error when setting cookie', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ url: 'https://media.eagleeyenetworks.com/session/abc123' })
      })

      mockFetch.mockRejectedValueOnce(new Error('Connection refused'))

      const result = await initMediaSession()

      expect(result.error?.code).toBe('NETWORK_ERROR')
      expect(result.error?.message).toContain('Connection refused')
    })
  })
})
