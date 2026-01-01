import { useAuthStore } from '../auth/store'
import { success, failure } from '../types'
import type { Result, ListFeedsParams, ListFeedsResult } from '../types'
import { debug } from '../utils/debug'

/**
 * List feeds with optional filtering and pagination.
 *
 * @remarks
 * Fetches a list of feeds from `/api/v3.0/feeds`. Feeds represent live or
 * recorded streams from devices (cameras, speakers). Use the `include` parameter
 * to request specific streaming URLs.
 *
 * A single device can have multiple feeds (main, preview, talkdown) with
 * different quality levels and purposes.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listfeeds).
 *
 * @param params - Optional filtering and pagination parameters
 * @returns A Result containing a list of feeds or an error
 *
 * @example
 * ```typescript
 * import { listFeeds } from 'een-api-toolkit'
 * import type { Feed } from 'een-api-toolkit'
 *
 * // Get all feeds
 * const { data, error } = await listFeeds()
 * if (data) {
 *   console.log(`Found ${data.results.length} feeds`)
 * }
 *
 * // Get feeds for a specific camera with streaming URLs
 * const { data: cameraFeeds } = await listFeeds({
 *   deviceId: 'camera-123',
 *   include: ['hlsUrl', 'multipartUrl']
 * })
 *
 * // Get preview feeds for multiple cameras
 * const { data: previewFeeds } = await listFeeds({
 *   deviceId__in: ['camera-1', 'camera-2'],
 *   type: 'preview',
 *   include: ['hlsUrl']
 * })
 *
 * // Paginate through all feeds
 * let allFeeds: Feed[] = []
 * let pageToken: string | undefined
 * do {
 *   const { data, error } = await listFeeds({ pageSize: 100, pageToken })
 *   if (error) break
 *   allFeeds.push(...data.results)
 *   pageToken = data.nextPageToken
 * } while (pageToken)
 * ```
 *
 * @category Feeds
 */
export async function listFeeds(params?: ListFeedsParams): Promise<Result<ListFeedsResult>> {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return failure('AUTH_REQUIRED', 'Authentication required')
  }

  if (!authStore.baseUrl) {
    return failure('AUTH_REQUIRED', 'Base URL not configured')
  }

  const queryParams = new URLSearchParams()

  // Pagination
  if (typeof params?.pageSize === 'number') {
    queryParams.append('pageSize', String(params.pageSize))
  }
  if (params?.pageToken) {
    queryParams.append('pageToken', params.pageToken)
  }

  // Device filters
  if (params?.deviceId) {
    queryParams.append('deviceId', params.deviceId)
  }
  if (params?.deviceId__in && params.deviceId__in.length > 0) {
    queryParams.append('deviceId__in', params.deviceId__in.join(','))
  }

  // Type filter
  if (params?.type) {
    queryParams.append('type', params.type)
  }

  // Include URL fields
  if (params?.include && params.include.length > 0) {
    queryParams.append('include', params.include.join(','))
  }

  const queryString = queryParams.toString()
  const url = `${authStore.baseUrl}/api/v3.0/feeds${queryString ? `?${queryString}` : ''}`
  debug('Fetching feeds:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      signal: params?.signal
    })

    if (!response.ok) {
      return handleErrorResponse(response)
    }

    const data = await response.json() as ListFeedsResult
    debug('Feeds fetched:', data.results?.length ?? 0, 'feeds')

    return success(data)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to fetch feeds: ${String(err)}`)
  }
}

/**
 * Handle error responses from the API.
 * @internal
 */
async function handleErrorResponse<T>(response: Response): Promise<Result<T>> {
  const status = response.status

  let apiMessage: string | undefined
  try {
    const errorData = await response.json()
    apiMessage = errorData.message ?? errorData.error
  } catch (parseError) {
    debug('Failed to parse error response JSON:', parseError)
  }

  switch (status) {
    case 401:
      return failure('AUTH_REQUIRED', apiMessage || 'Authentication failed', status)
    case 403:
      return failure('FORBIDDEN', apiMessage || 'Access denied', status)
    case 404:
      return failure('NOT_FOUND', apiMessage || 'Not found', status)
    case 429:
      return failure('RATE_LIMITED', apiMessage || 'Rate limited', status)
    case 503:
      return failure('SERVICE_UNAVAILABLE', apiMessage || 'Service unavailable', status)
    default:
      return failure('API_ERROR', apiMessage || response.statusText || 'API error', status)
  }
}
