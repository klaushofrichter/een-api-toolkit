import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { listFiles, getFile, addFile, downloadFile, deleteFile } from '../files/service'
import { useAuthStore } from '../auth/store'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('Files service functions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('listFiles', () => {
    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await listFiles()

      expect(result.error).not.toBeNull()
      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.data).toBeNull()
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return AUTH_REQUIRED when baseUrl is not set', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      // baseUrl not set

      const result = await listFiles()

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.message).toBe('Base URL not configured')
    })

    it('should fetch files successfully', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const mockResponse = {
        results: [
          { id: 'file-1', name: 'Export 1', size: 1000 },
          { id: 'file-2', name: 'Export 2', size: 2000 }
        ],
        nextPageToken: 'next-token-456',
        totalSize: 50
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await listFiles()

      expect(result.error).toBeNull()
      expect(result.data?.results).toHaveLength(2)
      expect(result.data?.nextPageToken).toBe('next-token-456')
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v3.0/files',
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

      await listFiles({ pageSize: 100, pageToken: 'page-xyz' })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v3.0/files?pageSize=100&pageToken=page-xyz',
        expect.any(Object)
      )
    })

    it('should include type filter in request', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      })

      await listFiles({ type__in: ['export', 'upload'] })

      const call = mockFetch.mock.calls[0]
      expect(call).toBeDefined()
      const url = call![0] as string
      expect(url).toContain('type__in=export%2Cupload')
    })

    it('should include camera filter in request', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      })

      await listFiles({ cameraId: 'camera-123' })

      const call = mockFetch.mock.calls[0]
      expect(call).toBeDefined()
      const url = call![0] as string
      expect(url).toContain('cameraId=camera-123')
    })

    it('should include search query in request', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      })

      await listFiles({ q: 'incident report' })

      const call = mockFetch.mock.calls[0]
      expect(call).toBeDefined()
      const url = call![0] as string
      expect(url).toContain('q=incident+report')
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

      const result = await listFiles()

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.status).toBe(401)
    })

    it('should handle network errors', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockRejectedValueOnce(new Error('Connection refused'))

      const result = await listFiles()

      expect(result.error?.code).toBe('NETWORK_ERROR')
      expect(result.error?.message).toContain('Connection refused')
    })
  })

  describe('getFile', () => {
    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await getFile('file-123')

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return VALIDATION_ERROR when fileId is empty', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const result = await getFile('')

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toBe('File ID is required')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should fetch file by ID successfully', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const mockFile = {
        id: 'file-123',
        accountId: 'acc-456',
        name: 'Test Export',
        filename: 'export.mp4',
        contentType: 'video/mp4',
        size: 1024000,
        type: 'export',
        createTimestamp: '2024-01-01T00:00:00.000+00:00'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockFile)
      })

      const result = await getFile('file-123')

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockFile)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v3.0/files/file-123',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer test-token'
          }
        })
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
        json: () => Promise.resolve({ message: 'File not found' })
      })

      const result = await getFile('nonexistent')

      expect(result.error?.code).toBe('NOT_FOUND')
      expect(result.error?.status).toBe(404)
    })
  })

  describe('addFile', () => {
    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await addFile({ name: 'Test' })

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return VALIDATION_ERROR when name is missing', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const result = await addFile({ name: '' })

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toBe('File name is required')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should create file successfully', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const mockResponse = {
        id: 'file-123',
        accountId: 'acc-456',
        name: 'Test File',
        createTimestamp: '2024-01-01T00:00:00.000+00:00'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await addFile({
        name: 'Test File',
        type: 'upload',
        description: 'A test file'
      })

      expect(result.error).toBeNull()
      expect(result.data?.id).toBe('file-123')
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v3.0/files',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          }
        })
      )
    })

    it('should include optional parameters in request body', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'file-123' })
      })

      await addFile({
        name: 'Test File',
        type: 'upload',
        filename: 'test.txt',
        description: 'A test file',
        tags: ['tag1', 'tag2'],
        cameraId: 'camera-123'
      })

      const call = mockFetch.mock.calls[0]
      expect(call).toBeDefined()
      const body = JSON.parse(call![1].body as string)
      expect(body.name).toBe('Test File')
      expect(body.type).toBe('upload')
      expect(body.filename).toBe('test.txt')
      expect(body.description).toBe('A test file')
      expect(body.tags).toEqual(['tag1', 'tag2'])
      expect(body.cameraId).toBe('camera-123')
    })
  })

  describe('downloadFile', () => {
    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await downloadFile('file-123')

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return VALIDATION_ERROR when fileId is empty', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const result = await downloadFile('')

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toBe('File ID is required')
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

      const result = await downloadFile('file-123')

      expect(result.error).toBeNull()
      expect(result.data?.blob).toBeInstanceOf(Blob)
      expect(result.data?.filename).toBe('export.mp4')
      expect(result.data?.contentType).toBe('video/mp4')
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v3.0/files/file-123:download',
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

      const result = await downloadFile('file-123')

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
        json: () => Promise.resolve({ message: 'File not found' })
      })

      const result = await downloadFile('nonexistent')

      expect(result.error?.code).toBe('NOT_FOUND')
      expect(result.error?.status).toBe(404)
    })

    it('should handle network errors', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockRejectedValueOnce(new Error('Download failed'))

      const result = await downloadFile('file-123')

      expect(result.error?.code).toBe('NETWORK_ERROR')
      expect(result.error?.message).toContain('Download failed')
    })
  })

  describe('deleteFile', () => {
    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await deleteFile('file-123')

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return AUTH_REQUIRED when baseUrl is not set', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      // baseUrl not set

      const result = await deleteFile('file-123')

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.message).toBe('Base URL not configured')
    })

    it('should return VALIDATION_ERROR when fileId is empty', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      const result = await deleteFile('')

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toBe('File ID is required')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should delete file successfully with 200 response', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200
      })

      const result = await deleteFile('file-123')

      expect(result.error).toBeNull()
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v3.0/files/file-123',
        expect.objectContaining({
          method: 'DELETE',
          headers: {
            'Authorization': 'Bearer test-token'
          }
        })
      )
    })

    it('should encode fileId with special characters', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200
      })

      await deleteFile('file/123')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v3.0/files/file%2F123',
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
        json: () => Promise.resolve({ message: 'File not found' })
      })

      const result = await deleteFile('nonexistent')

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

      const result = await deleteFile('file-123')

      expect(result.error?.code).toBe('FORBIDDEN')
      expect(result.error?.status).toBe(403)
    })

    it('should handle network errors', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.example.com')

      mockFetch.mockRejectedValueOnce(new Error('Connection reset'))

      const result = await deleteFile('file-123')

      expect(result.error?.code).toBe('NETWORK_ERROR')
      expect(result.error?.message).toContain('Connection reset')
    })
  })
})
