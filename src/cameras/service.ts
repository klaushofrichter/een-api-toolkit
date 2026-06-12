import { success, failure } from '../types'
import type { Result, PaginatedResult, Camera, ListCamerasParams, GetCameraParams, CameraSettings, GetCameraSettingsParams } from '../types'
import { requireAuth, authHeaders, handleErrorResponse } from '../utils/api'
import { debug } from '../utils/debug'

/**
 * List cameras with optional pagination and filtering.
 *
 * @remarks
 * Fetches a paginated list of cameras from `/api/v3.0/cameras`. Supports
 * extensive filtering options for location, status, tags, and more.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listcameras).
 *
 * @param params - Optional pagination and filtering parameters
 * @returns A Result containing a paginated list of cameras or an error
 *
 * @example
 * ```typescript
 * import { getCameras } from 'een-api-toolkit'
 *
 * // Basic usage
 * const { data, error } = await getCameras()
 * if (data) {
 *   console.log(`Found ${data.results.length} cameras`)
 * }
 *
 * // With filters
 * const { data } = await getCameras({
 *   pageSize: 50,
 *   status__in: ['online'],
 *   include: ['deviceInfo', 'streamUrls']
 * })
 *
 * // Fetch all cameras
 * let allCameras: Camera[] = []
 * let pageToken: string | undefined
 * do {
 *   const { data, error } = await getCameras({ pageSize: 100, pageToken })
 *   if (error) break
 *   allCameras.push(...data.results)
 *   pageToken = data.nextPageToken
 * } while (pageToken)
 * ```
 *
 * @category Cameras
 */
export async function getCameras(params?: ListCamerasParams): Promise<Result<PaginatedResult<Camera>>> {
  const auth = requireAuth()
  if (!auth.ok) return auth.result
  const { authStore, baseUrl } = auth

  const queryParams = new URLSearchParams()

  // Pagination
  if (params?.pageSize) {
    queryParams.append('pageSize', String(params.pageSize))
  }
  if (params?.pageToken) {
    queryParams.append('pageToken', params.pageToken)
  }

  // Include/Sort
  if (params?.include && params.include.length > 0) {
    queryParams.append('include', params.include.join(','))
  }
  if (params?.sort && params.sort.length > 0) {
    queryParams.append('sort', params.sort.join(','))
  }

  // Location/Bridge filters
  if (params?.locationId__in && params.locationId__in.length > 0) {
    queryParams.append('locationId__in', params.locationId__in.join(','))
  }
  if (params?.bridgeId__in && params.bridgeId__in.length > 0) {
    queryParams.append('bridgeId__in', params.bridgeId__in.join(','))
  }

  // Multi-camera filters
  if (params?.multiCameraId) {
    queryParams.append('multiCameraId', params.multiCameraId)
  }
  if (params?.multiCameraId__ne) {
    queryParams.append('multiCameraId__ne', params.multiCameraId__ne)
  }
  if (params?.multiCameraId__in && params.multiCameraId__in.length > 0) {
    queryParams.append('multiCameraId__in', params.multiCameraId__in.join(','))
  }

  // Tag/Package filters
  if (params?.tags__contains && params.tags__contains.length > 0) {
    queryParams.append('tags__contains', params.tags__contains.join(','))
  }
  if (params?.tags__any && params.tags__any.length > 0) {
    queryParams.append('tags__any', params.tags__any.join(','))
  }
  if (params?.packages__contains && params.packages__contains.length > 0) {
    queryParams.append('packages__contains', params.packages__contains.join(','))
  }

  // Name filters
  if (params?.name) {
    queryParams.append('name', params.name)
  }
  if (params?.name__contains) {
    queryParams.append('name__contains', params.name__contains)
  }
  if (params?.name__in && params.name__in.length > 0) {
    queryParams.append('name__in', params.name__in.join(','))
  }

  // ID filters
  if (params?.id__in && params.id__in.length > 0) {
    queryParams.append('id__in', params.id__in.join(','))
  }
  if (params?.id__notIn && params.id__notIn.length > 0) {
    queryParams.append('id__notIn', params.id__notIn.join(','))
  }
  if (params?.id__contains) {
    queryParams.append('id__contains', params.id__contains)
  }

  // Layout filter
  if (params?.layoutId) {
    queryParams.append('layoutId', params.layoutId)
  }

  // Share filters (use API nested field syntax)
  if (typeof params?.shared === 'boolean') {
    queryParams.append('shareDetails.shared', String(params.shared))
  }
  if (params?.sharedCameraAccount) {
    queryParams.append('shareDetails.accountId', params.sharedCameraAccount)
  }
  if (typeof params?.firstResponder === 'boolean') {
    queryParams.append('shareDetails.firstResponder', String(params.firstResponder))
  }

  // Device filters
  if (typeof params?.directToCloud === 'boolean') {
    queryParams.append('deviceInfo.directToCloud', String(params.directToCloud))
  }

  // Speaker filter
  if (params?.speakerId__in && params.speakerId__in.length > 0) {
    queryParams.append('speakerId__in', params.speakerId__in.join(','))
  }

  // Search
  if (params?.q) {
    queryParams.append('q', params.q)
  }
  if (typeof params?.qRelevance__gte === 'number') {
    queryParams.append('qRelevance__gte', String(params.qRelevance__gte))
  }

  // Analytics filter
  if (params?.enabledAnalytics__contains && params.enabledAnalytics__contains.length > 0) {
    queryParams.append('enabledAnalytics__contains', params.enabledAnalytics__contains.join(','))
  }

  // Status filters
  if (params?.status__in && params.status__in.length > 0) {
    queryParams.append('status__in', params.status__in.join(','))
  }
  if (params?.status__ne) {
    queryParams.append('status__ne', params.status__ne)
  }

  const queryString = queryParams.toString()
  const url = `${baseUrl}/api/v3.0/cameras${queryString ? `?${queryString}` : ''}`
  debug('Fetching cameras:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: authHeaders(authStore.token)
    })

    if (!response.ok) {
      return handleErrorResponse(response)
    }

    const data = await response.json() as PaginatedResult<Camera>
    debug('Cameras fetched:', data.results?.length ?? 0, 'cameras')

    return success(data)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to fetch cameras: ${String(err)}`)
  }
}

/**
 * Get a specific camera by ID.
 *
 * @remarks
 * Fetches a single camera from `/api/v3.0/cameras/{cameraId}`. Use the `include`
 * parameter to request additional fields.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/getcamera).
 *
 * @param cameraId - The unique identifier of the camera to fetch
 * @param params - Optional parameters (e.g., include additional fields)
 * @returns A Result containing the camera or an error
 *
 * @example
 * ```typescript
 * import { getCamera } from 'een-api-toolkit'
 *
 * const { data, error } = await getCamera('camera-123')
 *
 * if (error) {
 *   if (error.code === 'NOT_FOUND') {
 *     console.log('Camera not found')
 *   }
 *   return
 * }
 *
 * console.log(`Camera: ${data.name} (${data.status})`)
 *
 * // With additional fields
 * const { data: cameraWithDetails } = await getCamera('camera-123', {
 *   include: ['deviceInfo', 'streamUrls', 'shareDetails']
 * })
 * ```
 *
 * @category Cameras
 */
export async function getCamera(cameraId: string, params?: GetCameraParams): Promise<Result<Camera>> {
  const auth = requireAuth()
  if (!auth.ok) return auth.result
  const { authStore, baseUrl } = auth

  if (!cameraId) {
    return failure('VALIDATION_ERROR', 'Camera ID is required')
  }

  const queryParams = new URLSearchParams()

  if (params?.include && params.include.length > 0) {
    queryParams.append('include', params.include.join(','))
  }

  const queryString = queryParams.toString()
  const url = `${baseUrl}/api/v3.0/cameras/${encodeURIComponent(cameraId)}${queryString ? `?${queryString}` : ''}`
  debug('Fetching camera:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: authHeaders(authStore.token)
    })

    if (!response.ok) {
      return handleErrorResponse(response)
    }

    const data = await response.json() as Camera
    debug('Camera fetched:', data.name)

    return success(data)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to fetch camera: ${String(err)}`)
  }
}

/**
 * Get operational settings for a specific camera.
 *
 * @remarks
 * Fetches camera settings from `/api/v3.0/cameras/{cameraId}/settings`.
 * Returns retention, audio, video, operating, and other settings.
 * Use the `include` parameter to request additional data like JSON Schema
 * or proposed values.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/getcamerasettings).
 *
 * @param cameraId - The unique identifier of the camera
 * @param params - Optional parameters (e.g., include schema or proposedValues)
 * @returns A Result containing the camera settings or an error
 *
 * @example
 * ```typescript
 * import { getCameraSettings } from 'een-api-toolkit'
 *
 * // Basic usage
 * const { data, error } = await getCameraSettings('camera-123')
 * if (data) {
 *   console.log('Retention:', data.data.retention?.cloudDays, 'days')
 * }
 *
 * // With schema and proposed values
 * const { data: settings } = await getCameraSettings('camera-123', {
 *   include: ['schema', 'proposedValues']
 * })
 * ```
 *
 * @category Cameras
 */
export async function getCameraSettings(cameraId: string, params?: GetCameraSettingsParams): Promise<Result<CameraSettings>> {
  const auth = requireAuth()
  if (!auth.ok) return auth.result
  const { authStore, baseUrl } = auth

  if (!cameraId) {
    return failure('VALIDATION_ERROR', 'Camera ID is required')
  }

  const queryParams = new URLSearchParams()

  if (params?.include && params.include.length > 0) {
    queryParams.append('include', params.include.join(','))
  }

  const queryString = queryParams.toString()
  const url = `${baseUrl}/api/v3.0/cameras/${encodeURIComponent(cameraId)}/settings${queryString ? `?${queryString}` : ''}`
  debug('Fetching camera settings:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: authHeaders(authStore.token)
    })

    if (!response.ok) {
      return handleErrorResponse(response)
    }

    const data = await response.json() as CameraSettings
    debug('Camera settings fetched for:', cameraId)

    return success(data)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to fetch camera settings: ${String(err)}`)
  }
}

