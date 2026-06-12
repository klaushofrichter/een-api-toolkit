import { success, failure } from '../types'
import type { Result, PaginatedResult, Bridge, ListBridgesParams, GetBridgeParams } from '../types'
import { requireAuth, authHeaders, handleErrorResponse } from '../utils/api'
import { debug } from '../utils/debug'

/**
 * List bridges with optional pagination and filtering.
 *
 * @remarks
 * Fetches a paginated list of bridges from `/api/v3.0/bridges`. Supports
 * filtering options for location, status, tags, and more.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listbridges).
 *
 * @param params - Optional pagination and filtering parameters
 * @returns A Result containing a paginated list of bridges or an error
 *
 * @example
 * ```typescript
 * import { getBridges } from 'een-api-toolkit'
 *
 * // Basic usage
 * const { data, error } = await getBridges()
 * if (data) {
 *   console.log(`Found ${data.results.length} bridges`)
 * }
 *
 * // With filters
 * const { data } = await getBridges({
 *   pageSize: 50,
 *   status__in: ['online'],
 *   include: ['deviceInfo', 'networkInfo']
 * })
 *
 * // Fetch all bridges
 * let allBridges: Bridge[] = []
 * let pageToken: string | undefined
 * do {
 *   const { data, error } = await getBridges({ pageSize: 100, pageToken })
 *   if (error) break
 *   allBridges.push(...data.results)
 *   pageToken = data.nextPageToken
 * } while (pageToken)
 * ```
 *
 * @category Bridges
 */
export async function getBridges(params?: ListBridgesParams): Promise<Result<PaginatedResult<Bridge>>> {
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

  // Location filters
  if (params?.locationId__in && params.locationId__in.length > 0) {
    queryParams.append('locationId__in', params.locationId__in.join(','))
  }

  // Tag filters
  if (params?.tags__contains && params.tags__contains.length > 0) {
    queryParams.append('tags__contains', params.tags__contains.join(','))
  }
  if (params?.tags__any && params.tags__any.length > 0) {
    queryParams.append('tags__any', params.tags__any.join(','))
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

  // Search
  if (params?.q) {
    queryParams.append('q', params.q)
  }
  if (typeof params?.qRelevance__gte === 'number') {
    queryParams.append('qRelevance__gte', String(params.qRelevance__gte))
  }

  // Status filters
  if (params?.status__in && params.status__in.length > 0) {
    queryParams.append('status__in', params.status__in.join(','))
  }
  if (params?.status__ne) {
    queryParams.append('status__ne', params.status__ne)
  }

  const queryString = queryParams.toString()
  const url = `${baseUrl}/api/v3.0/bridges${queryString ? `?${queryString}` : ''}`
  debug('Fetching bridges:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: authHeaders(authStore.token)
    })

    if (!response.ok) {
      return handleErrorResponse(response)
    }

    const data = await response.json() as PaginatedResult<Bridge>
    debug('Bridges fetched:', data.results?.length ?? 0, 'bridges')

    return success(data)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to fetch bridges: ${String(err)}`)
  }
}

/**
 * Get a specific bridge by ID.
 *
 * @remarks
 * Fetches a single bridge from `/api/v3.0/bridges/{bridgeId}`. Use the `include`
 * parameter to request additional fields.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/getbridge).
 *
 * @param bridgeId - The unique identifier of the bridge to fetch
 * @param params - Optional parameters (e.g., include additional fields)
 * @returns A Result containing the bridge or an error
 *
 * @example
 * ```typescript
 * import { getBridge } from 'een-api-toolkit'
 *
 * const { data, error } = await getBridge('bridge-123')
 *
 * if (error) {
 *   if (error.code === 'NOT_FOUND') {
 *     console.log('Bridge not found')
 *   }
 *   return
 * }
 *
 * console.log(`Bridge: ${data.name} (${data.status})`)
 *
 * // With additional fields
 * const { data: bridgeWithDetails } = await getBridge('bridge-123', {
 *   include: ['deviceInfo', 'networkInfo', 'status']
 * })
 * ```
 *
 * @category Bridges
 */
export async function getBridge(bridgeId: string, params?: GetBridgeParams): Promise<Result<Bridge>> {
  const auth = requireAuth()
  if (!auth.ok) return auth.result
  const { authStore, baseUrl } = auth

  if (!bridgeId) {
    return failure('VALIDATION_ERROR', 'Bridge ID is required')
  }

  const queryParams = new URLSearchParams()

  if (params?.include && params.include.length > 0) {
    queryParams.append('include', params.include.join(','))
  }

  const queryString = queryParams.toString()
  const url = `${baseUrl}/api/v3.0/bridges/${encodeURIComponent(bridgeId)}${queryString ? `?${queryString}` : ''}`
  debug('Fetching bridge:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: authHeaders(authStore.token)
    })

    if (!response.ok) {
      return handleErrorResponse(response)
    }

    const data = await response.json() as Bridge
    debug('Bridge fetched:', data.name)

    return success(data)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to fetch bridge: ${String(err)}`)
  }
}

