import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { listDownloads, getDownload, downloadDownload } from '../downloads/service'
import { useAuthStore } from '../auth/store'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('Downloads service functions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('listDownloads', () => {
    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await listDownloads()

      expect(result.error).not.toBeNull()
      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.data).toBeNull()
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return AUTH_REQUIRED when baseUrl is not set', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      // baseUrl not set

      const result = await listDownloads()

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.message).toBe('Base URL not configured')
    })

    it('should fetch downloads successfully', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const mockResponse = {
        results: [
          { id: 'dl-1', name: 'Download 1', status: 'available' },
          { id: 'dl-2', name: 'Download 2', status: 'expired' }
        ],
        nextPageToken: 'next-token-456',
        totalSize: 50
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await listDownloads()

      expect(result.error).toBeNull()
      expect(result.data?.results).toHaveLength(2)
      expect(result.data?.nextPageToken).toBe('next-token-456')
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v3.0/downloads',
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

      await listDownloads({ pageSize: 100, pageToken: 'page-xyz' })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v3.0/downloads?pageSize=100&pageToken=page-xyz',
        expect.any(Object)
      )
    })

    it('should include status filter in request', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      })

      await listDownloads({ status__in: ['available', 'pending'] })

      const call = mockFetch.mock.calls[0]
      expect(call).toBeDefined()
      const url = call![0] as string
      expect(url).toContain('status__in=available%2Cpending')
    })

    it('should include camera filter in request', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      })

      await listDownloads({ cameraId: 'camera-123' })

      const call = mockFetch.mock.calls[0]
      expect(call).toBeDefined()
      const url = call![0] as string
      expect(url).toContain('cameraId=camera-123')
    })

    it('should include job and file filters in request', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      })

      await listDownloads({ jobId: 'job-123', fileId: 'file-456' })

      const call = mockFetch.mock.calls[0]
      expect(call).toBeDefined()
      const url = call![0] as string
      expect(url).toContain('jobId=job-123')
      expect(url).toContain('fileId=file-456')
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

      const result = await listDownloads()

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.status).toBe(401)
    })

    it('should handle network errors', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockRejectedValueOnce(new Error('Connection refused'))

      const result = await listDownloads()

      expect(result.error?.code).toBe('NETWORK_ERROR')
      expect(result.error?.message).toContain('Connection refused')
    })
  })

  describe('getDownload', () => {
    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await getDownload('dl-123')

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return AUTH_REQUIRED when baseUrl is not set', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      // baseUrl not set

      const result = await getDownload('dl-123')

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.message).toBe('Base URL not configured')
    })

    it('should return VALIDATION_ERROR when downloadId is empty', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const result = await getDownload('')

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toBe('Download ID is required')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should fetch download by ID successfully', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const mockDownload = {
        id: 'dl-123',
        accountId: 'acc-456',
        name: 'Test Download',
        status: 'available',
        contentType: 'video/mp4',
        sizeBytes: 1024000,
        createTimestamp: '2024-01-01T00:00:00.000+00:00'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDownload)
      })

      const result = await getDownload('dl-123')

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockDownload)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v3.0/downloads/dl-123',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer test-token'
          }
        })
      )
    })

    it('should encode downloadId with special characters', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'dl/123' })
      })

      await getDownload('dl/123')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v3.0/downloads/dl%2F123',
        expect.any(Object)
      )
    })

    it('should include include parameter in request', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'dl-123' })
      })

      await getDownload('dl-123', { include: ['details'] })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v3.0/downloads/dl-123?include=details',
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
        json: () => Promise.resolve({ message: 'Download not found' })
      })

      const result = await getDownload('nonexistent')

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

      const result = await getDownload('dl-123')

      expect(result.error?.code).toBe('FORBIDDEN')
      expect(result.error?.status).toBe(403)
    })
  })

  describe('downloadDownload', () => {
    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await downloadDownload('dl-123')

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return VALIDATION_ERROR when downloadId is empty', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const result = await downloadDownload('')

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toBe('Download ID is required')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should download file successfully', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const mockBlob = new Blob(['test content'], { type: 'video/mp4' })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
        headers: new Headers({
          'Content-Type': 'video/mp4',
          'Content-Disposition': 'attachment; filename="export.mp4"'
        })
      })

      const result = await downloadDownload('dl-123')

      expect(result.error).toBeNull()
      expect(result.data?.blob).toBeInstanceOf(Blob)
      expect(result.data?.filename).toBe('export.mp4')
      expect(result.data?.contentType).toBe('video/mp4')
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v3.0/downloads/dl-123:download',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Authorization': 'Bearer test-token'
          }
        })
      )
    })

    it('should use default filename when Content-Disposition is missing', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const mockBlob = new Blob(['test content'])

      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
        headers: new Headers({
          'Content-Type': 'application/octet-stream'
        })
      })

      const result = await downloadDownload('dl-123')

      expect(result.error).toBeNull()
      expect(result.data?.filename).toBe('download')
    })

    it('should handle 404 not found error', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ message: 'Download not found' })
      })

      const result = await downloadDownload('nonexistent')

      expect(result.error?.code).toBe('NOT_FOUND')
      expect(result.error?.status).toBe(404)
    })

    it('should handle network errors', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockRejectedValueOnce(new Error('Download failed'))

      const result = await downloadDownload('dl-123')

      expect(result.error?.code).toBe('NETWORK_ERROR')
      expect(result.error?.message).toContain('Download failed')
    })
  })
})
