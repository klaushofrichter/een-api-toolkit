import { useAuthStore } from '../auth/store'
import { success, failure } from '../types'
import type { Result, PtzPosition, PtzMove, PtzSettings, PtzSettingsUpdate } from '../types'
import { debug } from '../utils/debug'

/**
 * Get the current PTZ position of a camera.
 *
 * @remarks
 * Fetches the current pan, tilt, and zoom coordinates from
 * `/api/v3.0/cameras/{cameraId}/ptz/position`.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/getptzposition).
 *
 * @param cameraId - The unique identifier of the PTZ camera
 * @returns A Result containing the current PTZ position or an error
 *
 * @example
 * ```typescript
 * import { getPtzPosition } from 'een-api-toolkit'
 *
 * const { data, error } = await getPtzPosition('camera-123')
 * if (data) {
 *   console.log(`Pan: ${data.x}, Tilt: ${data.y}, Zoom: ${data.z}`)
 * }
 * ```
 *
 * @category PTZ
 */
export async function getPtzPosition(cameraId: string): Promise<Result<PtzPosition>> {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return failure('AUTH_REQUIRED', 'Authentication required')
  }

  if (!authStore.baseUrl) {
    return failure('AUTH_REQUIRED', 'Base URL not configured')
  }

  if (!cameraId) {
    return failure('VALIDATION_ERROR', 'Camera ID is required')
  }

  const url = `${authStore.baseUrl}/api/v3.0/cameras/${encodeURIComponent(cameraId)}/ptz/position`
  debug('Fetching PTZ position:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      }
    })

    if (!response.ok) {
      return handleErrorResponse(response)
    }

    const data = await response.json() as PtzPosition
    debug('PTZ position fetched for:', cameraId)

    return success(data)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to fetch PTZ position: ${String(err)}`)
  }
}

/**
 * Move a PTZ camera to a new position.
 *
 * @remarks
 * Sends a movement command to a PTZ camera via
 * `PUT /api/v3.0/cameras/{cameraId}/ptz/position`.
 * Supports three move types: absolute position, relative direction, and center-on.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/updateptzposition).
 *
 * @param cameraId - The unique identifier of the PTZ camera
 * @param move - The movement command (position, direction, or centerOn)
 * @returns A Result containing void on success or an error
 *
 * @example
 * ```typescript
 * import { movePtz } from 'een-api-toolkit'
 *
 * // Move to absolute position
 * await movePtz('camera-123', { moveType: 'position', x: 0.5, y: -0.3, z: 2.0 })
 *
 * // Move in a direction
 * await movePtz('camera-123', { moveType: 'direction', direction: ['left'], stepSize: 'medium' })
 *
 * // Center on a point in the frame
 * await movePtz('camera-123', { moveType: 'centerOn', relativeX: 0.75, relativeY: 0.5 })
 * ```
 *
 * @category PTZ
 */
export async function movePtz(cameraId: string, move: PtzMove): Promise<Result<void>> {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return failure('AUTH_REQUIRED', 'Authentication required')
  }

  if (!authStore.baseUrl) {
    return failure('AUTH_REQUIRED', 'Base URL not configured')
  }

  if (!cameraId) {
    return failure('VALIDATION_ERROR', 'Camera ID is required')
  }

  const url = `${authStore.baseUrl}/api/v3.0/cameras/${encodeURIComponent(cameraId)}/ptz/position`
  debug('Moving PTZ camera:', url, 'move:', move)

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(move)
    })

    if (!response.ok) {
      return handleErrorResponse(response)
    }

    debug('PTZ move sent for:', cameraId)

    return success(undefined as void)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to move PTZ camera: ${String(err)}`)
  }
}

/**
 * Get PTZ settings for a camera, including presets and automation mode.
 *
 * @remarks
 * Fetches PTZ configuration from `/api/v3.0/cameras/{cameraId}/ptz/settings`.
 * Returns presets, home preset, automation mode, and auto-start delay.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/getptzsettings).
 *
 * @param cameraId - The unique identifier of the PTZ camera
 * @returns A Result containing the PTZ settings or an error
 *
 * @example
 * ```typescript
 * import { getPtzSettings } from 'een-api-toolkit'
 *
 * const { data, error } = await getPtzSettings('camera-123')
 * if (data) {
 *   console.log('Mode:', data.mode)
 *   console.log('Presets:', data.presets.length)
 *   console.log('Home:', data.homePreset)
 * }
 * ```
 *
 * @category PTZ
 */
export async function getPtzSettings(cameraId: string): Promise<Result<PtzSettings>> {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return failure('AUTH_REQUIRED', 'Authentication required')
  }

  if (!authStore.baseUrl) {
    return failure('AUTH_REQUIRED', 'Base URL not configured')
  }

  if (!cameraId) {
    return failure('VALIDATION_ERROR', 'Camera ID is required')
  }

  const url = `${authStore.baseUrl}/api/v3.0/cameras/${encodeURIComponent(cameraId)}/ptz/settings`
  debug('Fetching PTZ settings:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      }
    })

    if (!response.ok) {
      return handleErrorResponse(response)
    }

    const data = await response.json() as PtzSettings
    debug('PTZ settings fetched for:', cameraId)

    return success(data)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to fetch PTZ settings: ${String(err)}`)
  }
}

/**
 * Update PTZ settings for a camera (partial update).
 *
 * @remarks
 * Updates PTZ configuration via `PATCH /api/v3.0/cameras/{cameraId}/ptz/settings`.
 * Only provided fields are updated; omitted fields retain their current values.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/updateptzsettings).
 *
 * @param cameraId - The unique identifier of the PTZ camera
 * @param settings - The settings fields to update
 * @returns A Result containing void on success or an error
 *
 * @example
 * ```typescript
 * import { updatePtzSettings } from 'een-api-toolkit'
 *
 * // Change mode to tour
 * await updatePtzSettings('camera-123', { mode: 'tour' })
 *
 * // Add a preset and set it as home
 * await updatePtzSettings('camera-123', {
 *   presets: [
 *     { name: 'Entrance', position: { x: 0, y: 0, z: 1 }, timeAtPreset: 10 }
 *   ],
 *   homePreset: 'Entrance'
 * })
 * ```
 *
 * @category PTZ
 */
export async function updatePtzSettings(cameraId: string, settings: PtzSettingsUpdate): Promise<Result<void>> {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return failure('AUTH_REQUIRED', 'Authentication required')
  }

  if (!authStore.baseUrl) {
    return failure('AUTH_REQUIRED', 'Base URL not configured')
  }

  if (!cameraId) {
    return failure('VALIDATION_ERROR', 'Camera ID is required')
  }

  const url = `${authStore.baseUrl}/api/v3.0/cameras/${encodeURIComponent(cameraId)}/ptz/settings`
  debug('Updating PTZ settings:', url)

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(settings)
    })

    if (!response.ok) {
      return handleErrorResponse(response)
    }

    debug('PTZ settings updated for:', cameraId)

    return success(undefined as void)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to update PTZ settings: ${String(err)}`)
  }
}

/**
 * Handle error responses from the API.
 * @internal
 */
async function handleErrorResponse<T>(response: Response): Promise<Result<T>> {
  const status = response.status

  let message: string
  try {
    const errorData = await response.json()
    message = errorData.message ?? errorData.error ?? response.statusText
  } catch (parseError) {
    debug('Failed to parse error response JSON:', parseError)
    message = response.statusText || 'Unknown error'
  }

  switch (status) {
    case 401:
      return failure('AUTH_REQUIRED', `Authentication failed: ${message}`, status)
    case 403:
      return failure('FORBIDDEN', `Access denied: ${message}`, status)
    case 404:
      return failure('NOT_FOUND', `Not found: ${message}`, status)
    case 429:
      return failure('RATE_LIMITED', `Rate limited: ${message}`, status)
    default:
      return failure('API_ERROR', `API error: ${message}`, status)
  }
}
