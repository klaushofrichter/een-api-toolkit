import { success, failure } from '../types'
import type {
  Result,
  PaginatedResult,
  MediaInterval,
  ListMediaParams,
  GetLiveImageParams,
  GetRecordedImageParams,
  LiveImageResult,
  RecordedImageResult,
  MediaSessionResponse,
  MediaSessionResult
} from '../types'
import { requireAuth, authHeaders, handleErrorResponse } from '../utils/api'
import { debug, redactUrl } from '../utils/debug'
import { isAllowedEenHostname } from '../utils/hostname'

/** Default timeout for media requests in milliseconds */
const DEFAULT_TIMEOUT_MS = 30000

/**
 * Create an AbortController with a timeout.
 * @internal
 */
function createTimeoutController(timeoutMs: number = DEFAULT_TIMEOUT_MS): { controller: AbortController; timeoutId: ReturnType<typeof setTimeout> } {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  return { controller, timeoutId }
}

/**
 * Convert ArrayBuffer to base64 string.
 *
 * @remarks
 * **Memory Considerations**: This function loads the entire image into memory
 * as a string. For typical camera preview images (<500KB), this is efficient.
 * For larger images (>2MB), consider streaming or chunked processing in the
 * consuming application. Base64 encoding adds ~33% size overhead.
 *
 * @internal
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  // Convert each chunk with a single String.fromCharCode(...chunk) call.
  // Chunking guards against engine argument-count limits: 8192 spread
  // arguments is safely under the limit, while converting the whole buffer
  // in one call could exceed it for large images.
  const chunkSize = 8192
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.byteLength))
    binary += String.fromCharCode(...chunk)
  }
  // Use btoa in browser, Buffer in Node.js
  if (typeof btoa === 'function') {
    return btoa(binary)
  }
  return Buffer.from(binary, 'binary').toString('base64')
}

/**
 * List media intervals (recording periods) for a device.
 *
 * @remarks
 * Fetches a paginated list of time intervals for which recordings exist.
 * Use this to find available recordings for a camera.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listmedia).
 *
 * @param params - Required parameters including deviceId, type, mediaType, and startTimestamp
 * @returns A Result containing a paginated list of media intervals or an error
 *
 * @example
 * ```typescript
 * import { listMedia } from 'een-api-toolkit'
 *
 * // Get video recordings from the last hour
 * const { data, error } = await listMedia({
 *   deviceId: 'camera-123',
 *   type: 'preview',
 *   mediaType: 'video',
 *   startTimestamp: new Date(Date.now() - 3600000).toISOString()
 * })
 *
 * if (data) {
 *   console.log(`Found ${data.results.length} recording intervals`)
 *   data.results.forEach(interval => {
 *     console.log(`${interval.startTimestamp} - ${interval.endTimestamp}`)
 *   })
 * }
 * ```
 *
 * @category Media
 */
export async function listMedia(params: ListMediaParams): Promise<Result<PaginatedResult<MediaInterval>>> {
  const auth = requireAuth()
  if (!auth.ok) return auth.result
  const { authStore, baseUrl } = auth

  // Validate required parameters
  if (!params.deviceId) {
    return failure('VALIDATION_ERROR', 'Device ID is required')
  }
  if (!params.type) {
    return failure('VALIDATION_ERROR', 'Stream type is required (preview or main)')
  }
  if (!params.mediaType) {
    return failure('VALIDATION_ERROR', 'Media type is required (video or image)')
  }
  if (!params.startTimestamp) {
    return failure('VALIDATION_ERROR', 'Start timestamp is required')
  }

  const queryParams = new URLSearchParams()

  // Required parameters
  queryParams.append('deviceId', params.deviceId)
  queryParams.append('type', params.type)
  queryParams.append('mediaType', params.mediaType)
  queryParams.append('startTimestamp__gte', params.startTimestamp)

  // Optional parameters
  if (params.endTimestamp) {
    queryParams.append('endTimestamp__lte', params.endTimestamp)
  }
  if (typeof params.coalesce === 'boolean') {
    queryParams.append('coalesce', String(params.coalesce))
  }
  if (params.include && params.include.length > 0) {
    queryParams.append('include', params.include.join(','))
  }
  if (params.pageToken) {
    queryParams.append('pageToken', params.pageToken)
  }
  if (typeof params.pageSize === 'number') {
    queryParams.append('pageSize', String(params.pageSize))
  }

  const url = `${baseUrl}/api/v3.0/media?${queryParams.toString()}`
  debug('Fetching media intervals:', url)

  const { controller, timeoutId } = createTimeoutController()

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: authHeaders(authStore.token),
      signal: controller.signal
    })

    if (!response.ok) {
      return handleErrorResponse(response)
    }

    const data = await response.json() as PaginatedResult<MediaInterval>
    debug('Media intervals fetched:', data.results?.length ?? 0, 'intervals')

    return success(data)
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return failure('NETWORK_ERROR', 'Request timed out')
    }
    return failure('NETWORK_ERROR', `Failed to fetch media intervals: ${String(err)}`)
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Get a live image from a camera.
 *
 * @remarks
 * Fetches a new live image from the specified camera. This call waits until
 * a new image is available from the device. The image is returned as a
 * base64 data URL that can be used directly in an HTML img element.
 *
 * Note: Live images only support the 'preview' stream type.
 *
 * **Memory Considerations**: Images are loaded into memory and base64 encoded,
 * adding ~33% size overhead. Typical preview images are <500KB. For high-frequency
 * polling, consider implementing error backoff and limiting concurrent requests.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/getliveimage).
 *
 * @param params - Parameters including the required deviceId
 * @returns A Result containing the live image data or an error
 *
 * @example
 * ```typescript
 * import { getLiveImage } from 'een-api-toolkit'
 *
 * const { data, error } = await getLiveImage({ deviceId: 'camera-123' })
 *
 * if (data) {
 *   // Display in an img element
 *   document.getElementById('cameraImage').src = data.imageData
 *   console.log('Image timestamp:', data.timestamp)
 * }
 *
 * // Continuously update the image with proper error handling
 * let isRunning = true
 * async function refreshLoop() {
 *   const imgElement = document.getElementById('cameraImage') as HTMLImageElement
 *   while (isRunning) {
 *     const { data, error } = await getLiveImage({ deviceId: 'camera-123' })
 *     if (error) {
 *       console.error('Refresh failed:', error.message)
 *       break // Stop on error
 *     }
 *     if (data) {
 *       imgElement.src = data.imageData
 *     }
 *     await new Promise(r => setTimeout(r, 1000))
 *   }
 * }
 * // Call refreshLoop() to start, set isRunning = false to stop
 * ```
 *
 * @category Media
 */
export async function getLiveImage(params: GetLiveImageParams): Promise<Result<LiveImageResult>> {
  const auth = requireAuth()
  if (!auth.ok) return auth.result
  const { authStore, baseUrl } = auth

  if (!params.deviceId) {
    return failure('VALIDATION_ERROR', 'Device ID is required')
  }

  // Live images only support 'preview' type (enforced by TypeScript)
  const type = params.type ?? 'preview'

  const queryParams = new URLSearchParams()
  queryParams.append('deviceId', params.deviceId)
  queryParams.append('type', type)

  const url = `${baseUrl}/api/v3.0/media/liveImage.jpeg?${queryParams.toString()}`
  debug('Fetching live image:', url)

  const { controller, timeoutId } = createTimeoutController()

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { ...authHeaders(authStore.token), 'Accept': 'image/jpeg' },
      signal: controller.signal
    })

    // Get headers before checking response.ok
    const timestamp = response.headers.get('X-Een-Timestamp')
    const prevToken = response.headers.get('X-Een-PrevToken')

    if (!response.ok) {
      return handleErrorResponse(response)
    }

    // Get image as base64
    const arrayBuffer = await response.arrayBuffer()
    const base64 = arrayBufferToBase64(arrayBuffer)
    const imageData = `data:image/jpeg;base64,${base64}`

    debug('Live image fetched, timestamp:', timestamp)

    return success({
      imageData,
      timestamp,
      prevToken
    })
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return failure('NETWORK_ERROR', 'Request timed out')
    }
    return failure('NETWORK_ERROR', `Failed to fetch live image: ${String(err)}`)
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Get a recorded image from a camera.
 *
 * @remarks
 * Fetches a recorded image from the specified camera at a specific timestamp.
 * You can specify the desired timestamp using various operators (exact, gte, lte, etc.)
 * or use a pageToken from a previous request to navigate through images.
 *
 * The image is returned as a base64 data URL that can be used directly in an HTML img element.
 *
 * Note: The 'main' type is rate-limited and requires an actual recording at the timestamp.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/getrecordedimage).
 *
 * @param params - Parameters including deviceId/pageToken and timestamp options
 * @returns A Result containing the recorded image data or an error
 *
 * @example
 * ```typescript
 * import { getRecordedImage } from 'een-api-toolkit'
 *
 * // Get image at or after a specific time
 * const { data, error } = await getRecordedImage({
 *   deviceId: 'camera-123',
 *   type: 'preview',
 *   timestamp__gte: '2024-01-15T10:00:00.000Z'
 * })
 *
 * if (data) {
 *   imgElement.src = data.imageData
 *   console.log('Actual timestamp:', data.timestamp)
 *
 *   // Get the next image using the token
 *   if (data.nextToken) {
 *     const { data: nextImage } = await getRecordedImage({
 *       pageToken: data.nextToken
 *     })
 *   }
 * }
 * ```
 *
 * @category Media
 */
export async function getRecordedImage(params: GetRecordedImageParams): Promise<Result<RecordedImageResult>> {
  const auth = requireAuth()
  if (!auth.ok) return auth.result
  const { authStore, baseUrl } = auth

  // Validate: either deviceId or pageToken is required
  if (!params.deviceId && !params.pageToken) {
    return failure('VALIDATION_ERROR', 'Either deviceId or pageToken is required')
  }

  // If not using pageToken, validate at least one timestamp parameter
  if (!params.pageToken) {
    const hasTimestamp = params.timestamp__lt || params.timestamp__lte ||
                         params.timestamp || params.timestamp__gte || params.timestamp__gt
    if (!hasTimestamp) {
      return failure('VALIDATION_ERROR', 'At least one timestamp parameter is required')
    }
  }

  // Validate overlay requirements
  if (params.include?.includes('overlaySvgHeader') &&
      (!params.overlayId__in || params.overlayId__in.length === 0)) {
    return failure('VALIDATION_ERROR', 'At least one overlayId must be provided when requesting overlay headers')
  }

  const queryParams = new URLSearchParams()

  // Add parameters
  if (params.deviceId) {
    queryParams.append('deviceId', params.deviceId)
  }
  if (params.pageToken) {
    queryParams.append('pageToken', params.pageToken)
  }
  if (params.type) {
    queryParams.append('type', params.type)
  }

  // Timestamp parameters
  if (params.timestamp__lt) {
    queryParams.append('timestamp__lt', params.timestamp__lt)
  }
  if (params.timestamp__lte) {
    queryParams.append('timestamp__lte', params.timestamp__lte)
  }
  if (params.timestamp) {
    queryParams.append('timestamp', params.timestamp)
  }
  if (params.timestamp__gte) {
    queryParams.append('timestamp__gte', params.timestamp__gte)
  }
  if (params.timestamp__gt) {
    queryParams.append('timestamp__gt', params.timestamp__gt)
  }

  // Overlay parameters
  if (params.overlayId__in && params.overlayId__in.length > 0) {
    queryParams.append('overlayId__in', params.overlayId__in.join(','))
  }
  if (params.include && params.include.length > 0) {
    queryParams.append('include', params.include.join(','))
  }

  // Size parameters
  if (typeof params.targetWidth === 'number') {
    queryParams.append('targetWidth', String(params.targetWidth))
  }
  if (typeof params.targetHeight === 'number') {
    queryParams.append('targetHeight', String(params.targetHeight))
  }

  const url = `${baseUrl}/api/v3.0/media/recordedImage.jpeg?${queryParams.toString()}`
  debug('Fetching recorded image:', url)

  const { controller, timeoutId } = createTimeoutController()

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { ...authHeaders(authStore.token), 'Accept': 'image/jpeg' },
      signal: controller.signal
    })

    // Get headers before checking response.ok
    const timestamp = response.headers.get('X-Een-Timestamp')
    const nextToken = response.headers.get('X-Een-NextToken')
    const prevToken = response.headers.get('X-Een-PrevToken')
    const overlaySvg = response.headers.get('X-Een-OverlaySvg')

    if (!response.ok) {
      return handleErrorResponse(response)
    }

    // Get image as base64
    const arrayBuffer = await response.arrayBuffer()
    const base64 = arrayBufferToBase64(arrayBuffer)
    const imageData = `data:image/jpeg;base64,${base64}`

    debug('Recorded image fetched, timestamp:', timestamp)

    return success({
      imageData,
      timestamp,
      nextToken,
      prevToken,
      overlaySvg
    })
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return failure('NETWORK_ERROR', 'Request timed out')
    }
    return failure('NETWORK_ERROR', `Failed to fetch recorded image: ${String(err)}`)
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Get the media session URL for setting cookies.
 *
 * @remarks
 * Fetches the URL needed to set the media session cookie. The returned URL
 * must be called separately (with credentials included) to actually set the
 * cookie. This is the first step in the two-step media session initialization
 * process.
 *
 * For most use cases, prefer using {@link initMediaSession} which handles
 * both steps automatically.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/docs/watch-live-video).
 *
 * @returns A Result containing the media session URL or an error
 *
 * @example
 * ```typescript
 * import { getMediaSession } from 'een-api-toolkit'
 *
 * // Get the session URL (step 1)
 * const { data, error } = await getMediaSession()
 *
 * if (data) {
 *   console.log('Session URL:', data.url)
 *   // Now call data.url with credentials: 'include' to set the cookie
 * }
 * ```
 *
 * @category Media
 */
export async function getMediaSession(): Promise<Result<MediaSessionResponse>> {
  const auth = requireAuth()
  if (!auth.ok) return auth.result
  const { authStore, baseUrl } = auth

  const url = `${baseUrl}/api/v3.0/media/session`
  debug('Fetching media session:', url)

  const { controller, timeoutId } = createTimeoutController()

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: authHeaders(authStore.token),
      signal: controller.signal
    })

    if (!response.ok) {
      return handleErrorResponse(response)
    }

    const data = await response.json() as MediaSessionResponse
    debug('Media session URL received:', redactUrl(data.url))

    return success(data)
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return failure('NETWORK_ERROR', 'Request timed out')
    }
    return failure('NETWORK_ERROR', `Failed to fetch media session: ${String(err)}`)
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Initialize the media session by setting the session cookie.
 *
 * @remarks
 * This function handles the two-step process of setting up a media session:
 * 1. Fetches the session URL from `/api/v3.0/media/session`
 * 2. Calls that URL with credentials to set the session cookie
 *
 * Once the session cookie is set, the browser can access media streams
 * (like multipart preview URLs) without explicit Authorization headers.
 * This is required for using media URLs directly in HTML elements like
 * `<img>` or `<video>`.
 *
 * **Important**: This function must be called in a browser environment
 * where cookies can be set. It uses `credentials: 'include'` to ensure
 * the cookie is stored.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/docs/watch-live-video).
 *
 * @returns A Result containing the session result or an error
 *
 * @example
 * ```typescript
 * import { initMediaSession, listFeeds } from 'een-api-toolkit'
 *
 * // Initialize the media session (do this once after login)
 * const { data, error } = await initMediaSession()
 *
 * if (error) {
 *   console.error('Failed to init media session:', error.message)
 *   return
 * }
 *
 * // Now you can use multipart URLs directly in <img> elements
 * const { data: feeds } = await listFeeds({
 *   deviceId: 'camera-123',
 *   include: ['multipartUrl']
 * })
 *
 * if (feeds?.results[0]?.multipartUrl) {
 *   // This works because the session cookie is set
 *   imgElement.src = feeds.results[0].multipartUrl
 * }
 * ```
 *
 * @category Media
 */
export async function initMediaSession(): Promise<Result<MediaSessionResult>> {
  const auth = requireAuth()
  if (!auth.ok) return auth.result
  const { authStore } = auth

  // Step 1: Get the media session URL
  const sessionResult = await getMediaSession()

  if (sessionResult.error) {
    return failure(
      sessionResult.error.code,
      `Failed to get media session: ${sessionResult.error.message}`,
      sessionResult.error.status
    )
  }

  if (!sessionResult.data?.url) {
    return failure('API_ERROR', 'No session URL returned from media session endpoint')
  }

  const sessionUrl = sessionResult.data.url
  debug('Calling session URL to set cookie:', redactUrl(sessionUrl))

  // Validate session URL domain to prevent SSRF attacks
  // Session URLs should only come from trusted EEN domains
  try {
    const sessionUrlObj = new URL(sessionUrl)
    if (!isAllowedEenHostname(sessionUrlObj.hostname)) {
      return failure('VALIDATION_ERROR', `Session URL domain not allowed: ${sessionUrlObj.hostname}`)
    }
  } catch {
    return failure('VALIDATION_ERROR', 'Invalid session URL format')
  }

  const { controller, timeoutId } = createTimeoutController()

  try {
    // Step 2: Call the session URL to set the cookie
    const response = await fetch(sessionUrl, {
      method: 'GET',
      credentials: 'include', // Critical: include cookies in the request/response
      headers: { ...authHeaders(authStore.token), 'Accept': '*/*' },
      signal: controller.signal
    })

    // The session endpoint typically returns 204 No Content on success
    // but may also return 200 OK; both are in the response.ok range
    if (!response.ok) {
      return handleErrorResponse(response)
    }

    debug('Media session cookie set successfully')

    return success({
      success: true,
      sessionUrl
    })
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return failure('NETWORK_ERROR', 'Request timed out while setting session cookie')
    }
    return failure('NETWORK_ERROR', `Failed to set media session cookie: ${String(err)}`)
  } finally {
    clearTimeout(timeoutId)
  }
}
