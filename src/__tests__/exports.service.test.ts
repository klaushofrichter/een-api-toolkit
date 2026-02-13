import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { createExportJob } from '../exports/service'
import { useAuthStore } from '../auth/store'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('Export service functions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('createExportJob', () => {
    const validParams = {
      type: 'video' as const,
      cameraId: 'camera-123',
      startTimestamp: '2024-01-01T00:00:00.000+00:00',
      endTimestamp: '2024-01-01T01:00:00.000+00:00'
    }

    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await createExportJob(validParams)

      expect(result.error).not.toBeNull()
      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.data).toBeNull()
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return AUTH_REQUIRED when baseUrl is not set', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      // baseUrl not set

      const result = await createExportJob(validParams)

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.message).toBe('Base URL not configured')
    })

    it('should return VALIDATION_ERROR when cameraId is missing', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      const result = await createExportJob({
        ...validParams,
        cameraId: ''
      })

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toBe('Camera ID is required')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return VALIDATION_ERROR when type is missing', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      const result = await createExportJob({
        ...validParams,
        type: '' as 'video'
      })

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toBe('Export type is required')
    })

    it('should return VALIDATION_ERROR when startTimestamp is missing', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      const result = await createExportJob({
        ...validParams,
        startTimestamp: ''
      })

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toBe('Start timestamp is required')
    })

    it('should return VALIDATION_ERROR when endTimestamp is missing', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      const result = await createExportJob({
        ...validParams,
        endTimestamp: ''
      })

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toBe('End timestamp is required')
    })

    it('should return VALIDATION_ERROR when timeLapse export missing playbackMultiplier', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      const result = await createExportJob({
        ...validParams,
        type: 'timeLapse'
      })

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toBe('Playback multiplier is required for timeLapse and bundle exports')
    })

    it('should return VALIDATION_ERROR when bundle export missing playbackMultiplier', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      const result = await createExportJob({
        ...validParams,
        type: 'bundle'
      })

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toBe('Playback multiplier is required for timeLapse and bundle exports')
    })

    it('should return VALIDATION_ERROR when playbackMultiplier is out of range', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      const result = await createExportJob({
        ...validParams,
        type: 'timeLapse',
        playbackMultiplier: 100
      })

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toBe('Playback multiplier must be between 1 and 48')
    })

    it('should create export job successfully', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      const mockResponse = {
        id: 'job-123',
        accountId: 'acc-456',
        userId: 'user-789',
        name: 'Export',
        type: 'export',
        state: 'pending',
        createTimestamp: '2024-01-01T00:00:00.000+00:00'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await createExportJob(validParams)

      expect(result.error).toBeNull()
      expect(result.data?.id).toBe('job-123')
      expect(result.data?.state).toBe('pending')
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.c001.eagleeyenetworks.com/api/v3.0/exports',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          },
          body: expect.any(String)
        })
      )
    })

    it('should include optional parameters in request body', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'job-123' })
      })

      await createExportJob({
        ...validParams,
        type: 'timeLapse',
        name: 'Test Export',
        playbackMultiplier: 10,
        autoDelete: true,
        directory: '/exports',
        notes: 'Test notes',
        tags: ['test', 'export']
      })

      const call = mockFetch.mock.calls[0]
      expect(call).toBeDefined()
      const body = JSON.parse(call![1].body as string)
      // Name is nested in info object per API v3.0 structure
      expect(body.info.name).toBe('Test Export')
      expect(body.info.directory).toBe('/exports')
      expect(body.info.notes).toBe('Test notes')
      expect(body.info.tags).toEqual(['test', 'export'])
      expect(body.playbackMultiplier).toBe(10)
      expect(body.autoDelete).toBe(true)
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

      const result = await createExportJob(validParams)

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

      const result = await createExportJob(validParams)

      expect(result.error?.code).toBe('FORBIDDEN')
      expect(result.error?.status).toBe(403)
    })

    it('should handle network errors', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockRejectedValueOnce(new Error('Connection refused'))

      const result = await createExportJob(validParams)

      expect(result.error?.code).toBe('NETWORK_ERROR')
      expect(result.error?.message).toContain('Connection refused')
    })
  })
})
