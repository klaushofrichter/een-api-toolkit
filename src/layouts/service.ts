import { success, failure } from '../types'
import type {
  Result,
  PaginatedResult,
  Layout,
  ListLayoutsParams,
  GetLayoutParams,
  CreateLayoutParams,
  UpdateLayoutParams
} from '../types'
import { requireAuth, authHeaders, handleErrorResponse } from '../utils/api'
import { debug } from '../utils/debug'

/**
 * List layouts with optional pagination and filtering.
 *
 * @remarks
 * Fetches a paginated list of layouts from `/api/v3.0/layouts`. Supports
 * filtering options for name, search, and more.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listlayouts).
 *
 * @param params - Optional pagination and filtering parameters
 * @returns A Result containing a paginated list of layouts or an error
 *
 * @example
 * ```typescript
 * import { getLayouts } from 'een-api-toolkit'
 *
 * // Basic usage
 * const { data, error } = await getLayouts()
 * if (data) {
 *   console.log(`Found ${data.results.length} layouts`)
 * }
 *
 * // With filters
 * const { data } = await getLayouts({
 *   pageSize: 50,
 *   include: ['resourceCounts', 'effectivePermissions']
 * })
 *
 * // Fetch all layouts
 * let allLayouts: Layout[] = []
 * let pageToken: string | undefined
 * do {
 *   const { data, error } = await getLayouts({ pageSize: 100, pageToken })
 *   if (error) break
 *   allLayouts.push(...data.results)
 *   pageToken = data.nextPageToken
 * } while (pageToken)
 * ```
 *
 * @category Layouts
 */
export async function getLayouts(params?: ListLayoutsParams): Promise<Result<PaginatedResult<Layout>>> {
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

  // Name filters
  if (params?.name) {
    queryParams.append('name', params.name)
  }
  if (params?.name__in && params.name__in.length > 0) {
    queryParams.append('name__in', params.name__in.join(','))
  }
  if (params?.name__contains) {
    queryParams.append('name__contains', params.name__contains)
  }

  // ID filters
  if (params?.id__in && params.id__in.length > 0) {
    queryParams.append('id__in', params.id__in.join(','))
  }

  // Bridge filter
  if (params?.['layoutPanes.cameras.bridgeId']) {
    queryParams.append('layoutPanes.cameras.bridgeId', params['layoutPanes.cameras.bridgeId'])
  }

  // Search
  if (params?.q) {
    queryParams.append('q', params.q)
  }
  if (typeof params?.qRelevance__gte === 'number') {
    queryParams.append('qRelevance__gte', String(params.qRelevance__gte))
  }

  const queryString = queryParams.toString()
  const url = `${baseUrl}/api/v3.0/layouts${queryString ? `?${queryString}` : ''}`
  debug('Fetching layouts:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: authHeaders(authStore.token)
    })

    if (!response.ok) {
      return handleErrorResponse(response)
    }

    const data = await response.json() as PaginatedResult<Layout>
    debug('Layouts fetched:', data.results?.length ?? 0, 'layouts')

    return success(data)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to fetch layouts: ${String(err)}`)
  }
}

/**
 * Get a specific layout by ID.
 *
 * @remarks
 * Fetches a single layout from `/api/v3.0/layouts/{layoutId}`. Use the `include`
 * parameter to request additional fields.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/getlayout).
 *
 * @param layoutId - The unique identifier of the layout to fetch
 * @param params - Optional parameters (e.g., include additional fields)
 * @returns A Result containing the layout or an error
 *
 * @example
 * ```typescript
 * import { getLayout } from 'een-api-toolkit'
 *
 * const { data, error } = await getLayout('layout-123')
 *
 * if (error) {
 *   if (error.code === 'NOT_FOUND') {
 *     console.log('Layout not found')
 *   }
 *   return
 * }
 *
 * console.log(`Layout: ${data.name} (${data.panes.length} panes)`)
 *
 * // With additional fields
 * const { data: layoutWithDetails } = await getLayout('layout-123', {
 *   include: ['effectivePermissions', 'resourceStatusCounts']
 * })
 * ```
 *
 * @category Layouts
 */
export async function getLayout(layoutId: string, params?: GetLayoutParams): Promise<Result<Layout>> {
  const auth = requireAuth()
  if (!auth.ok) return auth.result
  const { authStore, baseUrl } = auth

  if (!layoutId) {
    return failure('VALIDATION_ERROR', 'Layout ID is required')
  }

  const queryParams = new URLSearchParams()

  if (params?.include && params.include.length > 0) {
    queryParams.append('include', params.include.join(','))
  }

  const queryString = queryParams.toString()
  const url = `${baseUrl}/api/v3.0/layouts/${encodeURIComponent(layoutId)}${queryString ? `?${queryString}` : ''}`
  debug('Fetching layout:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: authHeaders(authStore.token)
    })

    if (!response.ok) {
      return handleErrorResponse(response)
    }

    const data = await response.json() as Layout
    debug('Layout fetched:', data.name)

    return success(data)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to fetch layout: ${String(err)}`)
  }
}

/**
 * Create a new layout.
 *
 * @remarks
 * Creates a layout via `POST /api/v3.0/layouts`. Name and settings are required.
 * Panes can be added during creation or later via `updateLayout()`.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/createlayout).
 *
 * @param params - The layout configuration
 * @returns A Result containing the created layout or an error
 *
 * @example
 * ```typescript
 * import { createLayout } from 'een-api-toolkit'
 *
 * const { data, error } = await createLayout({
 *   name: 'Main Lobby View',
 *   settings: {
 *     showCameraBorder: true,
 *     showCameraName: true,
 *     cameraAspectRatio: '16x9',
 *     paneColumns: 3
 *   },
 *   panes: [
 *     { id: 1, name: 'Entrance', type: 'preview', size: 1, cameraId: 'cam-123' },
 *     { id: 2, name: 'Lobby', type: 'preview', size: 2, cameraId: 'cam-456' }
 *   ]
 * })
 *
 * if (data) {
 *   console.log(`Created layout: ${data.id}`)
 * }
 * ```
 *
 * @category Layouts
 */
export async function createLayout(params: CreateLayoutParams): Promise<Result<Layout>> {
  const auth = requireAuth()
  if (!auth.ok) return auth.result
  const { authStore, baseUrl } = auth

  if (!params.name) {
    return failure('VALIDATION_ERROR', 'Layout name is required')
  }

  if (!params.settings) {
    return failure('VALIDATION_ERROR', 'Layout settings are required')
  }

  const url = `${baseUrl}/api/v3.0/layouts`
  debug('Creating layout:', params.name)

  const body: Record<string, unknown> = {
    name: params.name,
    settings: params.settings
  }

  if (params.panes) {
    body.panes = params.panes
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { ...authHeaders(authStore.token), 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      return handleErrorResponse(response)
    }

    const data = await response.json() as Layout
    debug('Layout created:', data.id, data.name)

    return success(data)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to create layout: ${String(err)}`)
  }
}

/**
 * Update an existing layout.
 *
 * @remarks
 * Updates a layout via `PATCH /api/v3.0/layouts/{layoutId}`. Only provided
 * fields will be updated. Returns void on success (204 No Content).
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/updatelayout).
 *
 * @param layoutId - The unique identifier of the layout to update
 * @param params - The fields to update
 * @returns A Result containing void on success or an error
 *
 * @example
 * ```typescript
 * import { updateLayout } from 'een-api-toolkit'
 *
 * // Update name only
 * const { error } = await updateLayout('layout-123', {
 *   name: 'Updated Layout Name'
 * })
 *
 * // Update settings
 * const { error } = await updateLayout('layout-123', {
 *   settings: {
 *     paneColumns: 4,
 *     showCameraName: false
 *   }
 * })
 *
 * // Replace panes
 * const { error } = await updateLayout('layout-123', {
 *   panes: [
 *     { id: 1, name: 'New Pane', type: 'preview', size: 1, cameraId: 'cam-789' }
 *   ]
 * })
 *
 * if (error) {
 *   console.error('Update failed:', error.message)
 * }
 * ```
 *
 * @category Layouts
 */
export async function updateLayout(layoutId: string, params: UpdateLayoutParams): Promise<Result<void>> {
  const auth = requireAuth()
  if (!auth.ok) return auth.result
  const { authStore, baseUrl } = auth

  if (!layoutId) {
    return failure('VALIDATION_ERROR', 'Layout ID is required')
  }

  if (params.name === undefined && params.settings === undefined && params.panes === undefined) {
    return failure('VALIDATION_ERROR', 'At least one field (name, settings, or panes) must be provided for update')
  }

  const url = `${baseUrl}/api/v3.0/layouts/${encodeURIComponent(layoutId)}`
  debug('Updating layout:', layoutId)

  const body: Record<string, unknown> = {}

  if (params.name !== undefined) {
    body.name = params.name
  }
  if (params.settings !== undefined) {
    body.settings = params.settings
  }
  if (params.panes !== undefined) {
    body.panes = params.panes
  }

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: { ...authHeaders(authStore.token), 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      return handleErrorResponse(response)
    }

    debug('Layout updated:', layoutId)

    return success(undefined)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to update layout: ${String(err)}`)
  }
}

/**
 * Delete a layout.
 *
 * @remarks
 * Deletes a layout via `DELETE /api/v3.0/layouts/{layoutId}`.
 * Returns void on success (204 No Content).
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/deletelayout).
 *
 * @param layoutId - The unique identifier of the layout to delete
 * @returns A Result containing void on success or an error
 *
 * @example
 * ```typescript
 * import { deleteLayout } from 'een-api-toolkit'
 *
 * const { error } = await deleteLayout('layout-123')
 *
 * if (error) {
 *   if (error.code === 'NOT_FOUND') {
 *     console.log('Layout already deleted')
 *   } else {
 *     console.error('Delete failed:', error.message)
 *   }
 * } else {
 *   console.log('Layout deleted successfully')
 * }
 * ```
 *
 * @category Layouts
 */
export async function deleteLayout(layoutId: string): Promise<Result<void>> {
  const auth = requireAuth()
  if (!auth.ok) return auth.result
  const { authStore, baseUrl } = auth

  if (!layoutId) {
    return failure('VALIDATION_ERROR', 'Layout ID is required')
  }

  const url = `${baseUrl}/api/v3.0/layouts/${encodeURIComponent(layoutId)}`
  debug('Deleting layout:', layoutId)

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: authHeaders(authStore.token)
    })

    if (!response.ok) {
      return handleErrorResponse(response)
    }

    debug('Layout deleted:', layoutId)

    return success(undefined)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to delete layout: ${String(err)}`)
  }
}
