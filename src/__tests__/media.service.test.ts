import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { listMedia, getLiveImage, getRecordedImage } from '../media/service'
import { useAuthStore } from '../auth/store'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock btoa for Node.js environment
global.btoa = (str: string) => Buffer.from(str, 'binary').toString('base64')

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

    it('should return VALIDATION_ERROR when type is not preview', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      // @ts-expect-error - Testing invalid type
      const result = await getLiveImage({ deviceId: 'camera-123', type: 'main' })

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toContain('preview')
    })

    it('should fetch live image successfully', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Map([
          ['X-Een-Timestamp', '2024-01-15T10:00:00.000Z'],
          ['X-Een-PrevToken', 'prev-token-123']
        ]),
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
        headers: new Map(),
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
        headers: new Map(),
        json: () => Promise.resolve({ message: 'Camera offline' })
      })

      const result = await getLiveImage({ deviceId: 'camera-123' })

      expect(result.error?.code).toBe('API_ERROR')
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
        headers: new Map([
          ['X-Een-Timestamp', '2024-01-15T10:00:00.000Z'],
          ['X-Een-NextToken', 'next-token'],
          ['X-Een-PrevToken', 'prev-token']
        ]),
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
        headers: new Map([
          ['X-Een-Timestamp', '2024-01-15T10:00:01.000Z'],
          ['X-Een-NextToken', 'next-token-2']
        ]),
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
        headers: new Map(),
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
        headers: new Map(),
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
        headers: new Map(),
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
        headers: new Map(),
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
})
