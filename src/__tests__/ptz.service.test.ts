import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { getPtzPosition, movePtz, getPtzSettings, updatePtzSettings } from '../ptz/service'
import { useAuthStore } from '../auth/store'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('PTZ service functions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // =========================================================================
  // getPtzPosition
  // =========================================================================

  describe('getPtzPosition', () => {
    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await getPtzPosition('cam-123')

      expect(result.error).not.toBeNull()
      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.data).toBeNull()
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return AUTH_REQUIRED when baseUrl is not set', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)

      const result = await getPtzPosition('cam-123')

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.message).toBe('Base URL not configured')
    })

    it('should return VALIDATION_ERROR when cameraId is empty', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      const result = await getPtzPosition('')

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(result.error?.message).toBe('Camera ID is required')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should fetch PTZ position successfully', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      const mockPosition = { x: 0.5, y: -0.3, z: 2.0 }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPosition)
      })

      const result = await getPtzPosition('cam-123')

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockPosition)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.c001.eagleeyenetworks.com/api/v3.0/cameras/cam-123/ptz/position',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer test-token'
          }
        })
      )
    })

    it('should encode cameraId with special characters', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ x: 0, y: 0, z: 1 })
      })

      await getPtzPosition('cam/123')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.c001.eagleeyenetworks.com/api/v3.0/cameras/cam%2F123/ptz/position',
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

      const result = await getPtzPosition('cam-123')

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

      const result = await getPtzPosition('cam-123')

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
        json: () => Promise.resolve({ message: 'Camera not found' })
      })

      const result = await getPtzPosition('nonexistent')

      expect(result.error?.code).toBe('NOT_FOUND')
      expect(result.error?.status).toBe(404)
    })

    it('should handle 500 error', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({ error: 'Server failure' })
      })

      const result = await getPtzPosition('cam-123')

      expect(result.error?.code).toBe('API_ERROR')
      expect(result.error?.status).toBe(500)
      expect(result.error?.message).toContain('Server failure')
    })

    it('should handle network errors', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockRejectedValueOnce(new Error('Connection refused'))

      const result = await getPtzPosition('cam-123')

      expect(result.error?.code).toBe('NETWORK_ERROR')
      expect(result.error?.message).toContain('Connection refused')
    })

    it('should handle non-JSON error response', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        json: () => Promise.reject(new Error('Invalid JSON'))
      })

      const result = await getPtzPosition('cam-123')

      expect(result.error?.code).toBe('API_ERROR')
      expect(result.error?.message).toContain('Service Unavailable')
    })
  })

  // =========================================================================
  // movePtz
  // =========================================================================

  describe('movePtz', () => {
    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await movePtz('cam-123', { moveType: 'position', x: 0, y: 0, z: 1 })

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return AUTH_REQUIRED when baseUrl is not set', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)

      const result = await movePtz('cam-123', { moveType: 'position', x: 0 })

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.message).toBe('Base URL not configured')
    })

    it('should return VALIDATION_ERROR when cameraId is empty', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      const result = await movePtz('', { moveType: 'position', x: 0 })

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should send position move successfully', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204
      })

      const move = { moveType: 'position' as const, x: 0.5, y: -0.3, z: 2.0 }
      const result = await movePtz('cam-123', move)

      expect(result.error).toBeNull()
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.c001.eagleeyenetworks.com/api/v3.0/cameras/cam-123/ptz/position',
        expect.objectContaining({
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          },
          body: JSON.stringify(move)
        })
      )
    })

    it('should send direction move successfully', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204
      })

      const move = { moveType: 'direction' as const, direction: ['up' as const, 'left' as const], stepSize: 'medium' as const }
      const result = await movePtz('cam-123', move)

      expect(result.error).toBeNull()
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.c001.eagleeyenetworks.com/api/v3.0/cameras/cam-123/ptz/position',
        expect.objectContaining({
          body: JSON.stringify(move)
        })
      )
    })

    it('should send centerOn move successfully', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204
      })

      const move = { moveType: 'centerOn' as const, relativeX: 0.75, relativeY: 0.5 }
      const result = await movePtz('cam-123', move)

      expect(result.error).toBeNull()
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.c001.eagleeyenetworks.com/api/v3.0/cameras/cam-123/ptz/position',
        expect.objectContaining({
          body: JSON.stringify(move)
        })
      )
    })

    it('should handle 401 error on move', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({ message: 'Token expired' })
      })

      const result = await movePtz('cam-123', { moveType: 'position', x: 0 })

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.status).toBe(401)
    })

    it('should handle 404 error on move', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ message: 'Camera not found' })
      })

      const result = await movePtz('nonexistent', { moveType: 'position', x: 0 })

      expect(result.error?.code).toBe('NOT_FOUND')
      expect(result.error?.status).toBe(404)
    })

    it('should handle network errors on move', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockRejectedValueOnce(new Error('Network timeout'))

      const result = await movePtz('cam-123', { moveType: 'position', x: 0 })

      expect(result.error?.code).toBe('NETWORK_ERROR')
      expect(result.error?.message).toContain('Network timeout')
    })
  })

  // =========================================================================
  // getPtzSettings
  // =========================================================================

  describe('getPtzSettings', () => {
    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await getPtzSettings('cam-123')

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return AUTH_REQUIRED when baseUrl is not set', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)

      const result = await getPtzSettings('cam-123')

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.message).toBe('Base URL not configured')
    })

    it('should return VALIDATION_ERROR when cameraId is empty', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      const result = await getPtzSettings('')

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should fetch PTZ settings successfully', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      const mockSettings = {
        presets: [
          { name: 'Entrance', position: { x: 0, y: 0, z: 1 }, timeAtPreset: 10 },
          { name: 'Parking', position: { x: 0.5, y: -0.2, z: 3 }, timeAtPreset: 15 }
        ],
        homePreset: 'Entrance',
        mode: 'homeReturn',
        autoStartDelay: 30
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSettings)
      })

      const result = await getPtzSettings('cam-123')

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockSettings)
      expect(result.data?.presets).toHaveLength(2)
      expect(result.data?.homePreset).toBe('Entrance')
      expect(result.data?.mode).toBe('homeReturn')
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.c001.eagleeyenetworks.com/api/v3.0/cameras/cam-123/ptz/settings',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer test-token'
          }
        })
      )
    })

    it('should handle empty presets', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      const mockSettings = {
        presets: [],
        homePreset: null,
        mode: 'manualOnly',
        autoStartDelay: 0
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSettings)
      })

      const result = await getPtzSettings('cam-123')

      expect(result.error).toBeNull()
      expect(result.data?.presets).toHaveLength(0)
      expect(result.data?.homePreset).toBeNull()
    })

    it('should handle 404 error', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ message: 'Camera not found or PTZ not supported' })
      })

      const result = await getPtzSettings('cam-123')

      expect(result.error?.code).toBe('NOT_FOUND')
      expect(result.error?.status).toBe(404)
    })

    it('should handle network errors', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockRejectedValueOnce(new Error('Connection reset'))

      const result = await getPtzSettings('cam-123')

      expect(result.error?.code).toBe('NETWORK_ERROR')
      expect(result.error?.message).toContain('Connection reset')
    })
  })

  // =========================================================================
  // updatePtzSettings
  // =========================================================================

  describe('updatePtzSettings', () => {
    it('should return AUTH_REQUIRED when not authenticated', async () => {
      const result = await updatePtzSettings('cam-123', { mode: 'tour' })

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return AUTH_REQUIRED when baseUrl is not set', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)

      const result = await updatePtzSettings('cam-123', { mode: 'tour' })

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.message).toBe('Base URL not configured')
    })

    it('should return VALIDATION_ERROR when cameraId is empty', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      const result = await updatePtzSettings('', { mode: 'tour' })

      expect(result.error?.code).toBe('VALIDATION_ERROR')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should update mode successfully', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204
      })

      const settings = { mode: 'tour' as const }
      const result = await updatePtzSettings('cam-123', settings)

      expect(result.error).toBeNull()
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.c001.eagleeyenetworks.com/api/v3.0/cameras/cam-123/ptz/settings',
        expect.objectContaining({
          method: 'PATCH',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          },
          body: JSON.stringify(settings)
        })
      )
    })

    it('should update presets and home preset successfully', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204
      })

      const settings = {
        presets: [
          { name: 'Gate', position: { x: 0.1, y: 0, z: 2 }, timeAtPreset: 20 }
        ],
        homePreset: 'Gate'
      }

      const result = await updatePtzSettings('cam-123', settings)

      expect(result.error).toBeNull()
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify(settings)
        })
      )
    })

    it('should update autoStartDelay successfully', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204
      })

      const settings = { autoStartDelay: 60 }
      const result = await updatePtzSettings('cam-123', settings)

      expect(result.error).toBeNull()
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify(settings)
        })
      )
    })

    it('should handle 401 error on update', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({ message: 'Token expired' })
      })

      const result = await updatePtzSettings('cam-123', { mode: 'tour' })

      expect(result.error?.code).toBe('AUTH_REQUIRED')
      expect(result.error?.status).toBe(401)
    })

    it('should handle 403 error on update', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: () => Promise.resolve({ message: 'Insufficient permissions' })
      })

      const result = await updatePtzSettings('cam-123', { mode: 'tour' })

      expect(result.error?.code).toBe('FORBIDDEN')
      expect(result.error?.status).toBe(403)
    })

    it('should handle 404 error on update', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ message: 'Camera not found' })
      })

      const result = await updatePtzSettings('nonexistent', { mode: 'tour' })

      expect(result.error?.code).toBe('NOT_FOUND')
      expect(result.error?.status).toBe(404)
    })

    it('should handle network errors on update', async () => {
      const authStore = useAuthStore()
      authStore.setToken('test-token', 3600)
      authStore.setBaseUrl('https://api.c001.eagleeyenetworks.com')

      mockFetch.mockRejectedValueOnce(new Error('DNS resolution failed'))

      const result = await updatePtzSettings('cam-123', { mode: 'tour' })

      expect(result.error?.code).toBe('NETWORK_ERROR')
      expect(result.error?.message).toContain('DNS resolution failed')
    })
  })
})
