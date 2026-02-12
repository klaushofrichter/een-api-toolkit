import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { getLayouts, getLayout, createLayout, updateLayout, deleteLayout } from '../layouts/service'
import { useAuthStore } from '../auth/store'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('Layout service functions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('getLayouts', () => {
    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await getLayouts()

      expect(result.error).not.toBeNull()
      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.data).toBeNull()
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return AUTH_REQUIRED when baseUrl is not set', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      // baseUrl not set

      const result = await getLayouts()

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.message).toBe('Base URL not configured')
    })

    it('should fetch layouts successfully', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      const mockResponse = {
        results: [
          {
            id: 'layout-1',
            name: 'Main Lobby',
            accountId: 'account-123',
            panes: [],
            settings: {
              showCameraBorder: true,
              showCameraName: true,
              cameraAspectRatio: '16x9',
              paneColumns: 3
            }
          },
          {
            id: 'layout-2',
            name: 'Entrance',
            accountId: 'account-123',
            panes: [],
            settings: {
              showCameraBorder: false,
              showCameraName: true,
              cameraAspectRatio: '4x3',
              paneColumns: 2
            }
          }
        ],
        nextPageToken: 'next-token-123',
        totalSize: 100
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await getLayouts()

      expect(result.error).toBeNull()
      expect(result.data?.results).toHaveLength(2)
      expect(result.data?.nextPageToken).toBe('next-token-123')
    })

    it('should include pagination parameters in request', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      })

      await getLayouts({ pageSize: 50, pageToken: 'page-token-xyz' })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.c001.eagleeyenetworks.com/api/v3.0/layouts?pageSize=50&pageToken=page-token-xyz',
        expect.any(Object)
      )
    })

    it('should include include parameter in request', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      })

      await getLayouts({ include: ['effectivePermissions', 'resourceCounts'] })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.c001.eagleeyenetworks.com/api/v3.0/layouts?include=effectivePermissions%2CresourceCounts',
        expect.any(Object)
      )
    })

    it('should include filter parameters in request', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      })

      await getLayouts({ name__contains: 'lobby', q: 'entrance' })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.c001.eagleeyenetworks.com/api/v3.0/layouts?name__contains=lobby&q=entrance',
        expect.any(Object)
      )
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

      const result = await getLayouts()

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.status).toBe(401)
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

      const result = await getLayouts()

      expect(result.error?.code).toBe('FORBIDDEN')
      expect(result.error?.status).toBe(403)
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

      const result = await getLayouts()

      expect(result.error?.code).toBe('RATE_LIMITED')
      expect(result.error?.status).toBe(429)
    })

    it('should handle network errors', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockRejectedValueOnce(new Error('Network failure'))

      const result = await getLayouts()

      expect(result.error?.code).toBe('NETWORK_ERROR')
      expect(result.error?.message).toContain('Network failure')
    })
  })

  describe('getLayout', () => {
    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await getLayout('layout-123')

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return VALIDATION_ERROR when layoutId is empty', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      const result = await getLayout('')

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toBe('Layout ID is required')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should fetch layout by ID successfully', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      const mockLayout = {
        id: 'layout-123',
        name: 'Main Lobby',
        accountId: 'account-123',
        panes: [
          { id: 1, name: 'Camera 1', type: 'preview', size: 1, cameraId: 'cam-1' }
        ],
        settings: {
          showCameraBorder: true,
          showCameraName: true,
          cameraAspectRatio: '16x9',
          paneColumns: 3
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockLayout)
      })

      const result = await getLayout('layout-123')

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockLayout)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.c001.eagleeyenetworks.com/api/v3.0/layouts/layout-123',
        expect.any(Object)
      )
    })

    it('should encode layoutId with special characters', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'layout/123' })
      })

      await getLayout('layout/123')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.c001.eagleeyenetworks.com/api/v3.0/layouts/layout%2F123',
        expect.any(Object)
      )
    })

    it('should include include parameter in request', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'layout-123' })
      })

      await getLayout('layout-123', { include: ['effectivePermissions'] })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.c001.eagleeyenetworks.com/api/v3.0/layouts/layout-123?include=effectivePermissions',
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
        json: () => Promise.resolve({ message: 'Layout not found' })
      })

      const result = await getLayout('nonexistent')

      expect(result.error?.code).toBe('NOT_FOUND')
      expect(result.error?.status).toBe(404)
    })
  })

  describe('createLayout', () => {
    const validParams = {
      name: 'Test Layout',
      settings: {
        showCameraBorder: true,
        showCameraName: true,
        cameraAspectRatio: '16x9' as const,
        paneColumns: 3
      }
    }

    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await createLayout(validParams)

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return VALIDATION_ERROR when name is missing', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      const result = await createLayout({ name: '', settings: validParams.settings })

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toBe('Layout name is required')
    })

    it('should return VALIDATION_ERROR when settings is missing', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      const result = await createLayout({ name: 'Test', settings: undefined as unknown as typeof validParams.settings })

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toBe('Layout settings are required')
    })

    it('should create layout successfully', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      const createdLayout = {
        id: 'layout-new',
        name: validParams.name,
        accountId: 'account-123',
        panes: [],
        settings: validParams.settings
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(createdLayout)
      })

      const result = await createLayout(validParams)

      expect(result.error).toBeNull()
      expect(result.data).toEqual(createdLayout)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.c001.eagleeyenetworks.com/api/v3.0/layouts',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          },
          body: JSON.stringify({
            name: validParams.name,
            settings: validParams.settings
          })
        })
      )
    })

    it('should create layout with panes', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      const paramsWithPanes = {
        ...validParams,
        panes: [
          { id: 1, name: 'Camera 1', type: 'preview' as const, size: 1 as const, cameraId: 'cam-1' }
        ]
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'layout-new', ...paramsWithPanes })
      })

      await createLayout(paramsWithPanes)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.c001.eagleeyenetworks.com/api/v3.0/layouts',
        expect.objectContaining({
          body: JSON.stringify({
            name: paramsWithPanes.name,
            settings: paramsWithPanes.settings,
            panes: paramsWithPanes.panes
          })
        })
      )
    })

    it('should handle 400 bad request error', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({ message: 'Invalid settings' })
      })

      const result = await createLayout(validParams)

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.status).toBe(400)
    })

    it('should handle 403 forbidden error', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: () => Promise.resolve({ message: 'Cannot create layouts' })
      })

      const result = await createLayout(validParams)

      expect(result.error?.code).toBe('FORBIDDEN')
      expect(result.error?.status).toBe(403)
    })
  })

  describe('updateLayout', () => {
    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await updateLayout('layout-123', { name: 'Updated' })

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return VALIDATION_ERROR when layoutId is empty', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      const result = await updateLayout('', { name: 'Updated' })

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toBe('Layout ID is required')
    })

    it('should return VALIDATION_ERROR when no fields are provided', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      const result = await updateLayout('layout-123', {})

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toBe('At least one field (name, settings, or panes) must be provided for update')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should update layout name successfully', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204
      })

      const result = await updateLayout('layout-123', { name: 'Updated Name' })

      expect(result.error).toBeNull()
      expect(result.data).toBeUndefined()
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.c001.eagleeyenetworks.com/api/v3.0/layouts/layout-123',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ name: 'Updated Name' })
        })
      )
    })

    it('should update layout settings', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204
      })

      await updateLayout('layout-123', { settings: { paneColumns: 4 } })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.c001.eagleeyenetworks.com/api/v3.0/layouts/layout-123',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ settings: { paneColumns: 4 } })
        })
      )
    })

    it('should update layout panes', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      const newPanes = [
        { id: 1, name: 'New Pane', type: 'preview' as const, size: 1 as const, cameraId: 'cam-new' }
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204
      })

      await updateLayout('layout-123', { panes: newPanes })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.c001.eagleeyenetworks.com/api/v3.0/layouts/layout-123',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ panes: newPanes })
        })
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
        json: () => Promise.resolve({ message: 'Layout not found' })
      })

      const result = await updateLayout('nonexistent', { name: 'Updated' })

      expect(result.error?.code).toBe('NOT_FOUND')
      expect(result.error?.status).toBe(404)
    })
  })

  describe('deleteLayout', () => {
    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await deleteLayout('layout-123')

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return VALIDATION_ERROR when layoutId is empty', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      const result = await deleteLayout('')

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toBe('Layout ID is required')
    })

    it('should delete layout successfully', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204
      })

      const result = await deleteLayout('layout-123')

      expect(result.error).toBeNull()
      expect(result.data).toBeUndefined()
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.c001.eagleeyenetworks.com/api/v3.0/layouts/layout-123',
        expect.objectContaining({
          method: 'DELETE',
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
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ message: 'Layout not found' })
      })

      const result = await deleteLayout('nonexistent')

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
        json: () => Promise.resolve({ message: 'Cannot delete layout' })
      })

      const result = await deleteLayout('layout-123')

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
        json: () => Promise.resolve({ message: 'Server error' })
      })

      const result = await deleteLayout('layout-123')

      expect(result.error?.code).toBe('API_ERROR')
      expect(result.error?.status).toBe(500)
    })

    it('should handle non-JSON error response', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 502,
        statusText: 'Bad Gateway',
        json: () => Promise.reject(new Error('Invalid JSON'))
      })

      const result = await deleteLayout('layout-123')

      expect(result.error?.code).toBe('API_ERROR')
      expect(result.error?.message).toContain('Bad Gateway')
    })
  })
})
