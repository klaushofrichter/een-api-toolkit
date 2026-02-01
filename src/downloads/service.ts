import { useAuthStore } from '../auth/store'
import { success, failure } from '../types'
import type { Result, PaginatedResult, Download, ListDownloadsParams, GetDownloadParams, DownloadDownloadResult } from '../types'
import { debug } from '../utils/debug'

/**
 * List downloads with optional pagination and filtering.
 *
 * @remarks
 * Fetches a paginated list of downloads from `/api/v3.0/downloads`. Supports
 * filtering by status, camera, and time range.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listdownloads).
 *
 * @param params - Optional pagination and filtering parameters
 * @returns A Result containing a paginated list of downloads or an error
 *
 * @example
 * ```typescript
 * import { listDownloads } from 'een-api-toolkit'
 *
 * // Basic usage
 * const { data, error } = await listDownloads()
 * if (data) {
 *   console.log(`Found ${data.results.length} downloads`)
 * }
 *
 * // Filter by status
 * const { data } = await listDownloads({
 *   status__in: ['available'],
 *   pageSize: 50
 * })
 * ```
 *
 * @category Downloads
 */
export async function listDownloads(params?: ListDownloadsParams): Promise<Result<PaginatedResult<Download>>> {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return failure('AUTH_REQUIRED', 'Authentication required')
  }

  if (!authStore.baseUrl) {
    return failure('AUTH_REQUIRED', 'Base URL not configured')
  }

  const queryParams = new URLSearchParams()

  // Pagination
  if (params?.pageSize) {
    queryParams.append('pageSize', String(params.pageSize))
  }
  if (params?.pageToken) {
    queryParams.append('pageToken', params.pageToken)
  }

  // Status filter
  if (params?.status__in && params.status__in.length > 0) {
    queryParams.append('status__in', params.status__in.join(','))
  }

  // Camera filters
  if (params?.cameraId) {
    queryParams.append('cameraId', params.cameraId)
  }
  if (params?.cameraId__in && params.cameraId__in.length > 0) {
    queryParams.append('cameraId__in', params.cameraId__in.join(','))
  }

  // Job filter
  if (params?.jobId) {
    queryParams.append('jobId', params.jobId)
  }

  // File filter
  if (params?.fileId) {
    queryParams.append('fileId', params.fileId)
  }

  // Time filters
  if (params?.createTimestamp__gte) {
    queryParams.append('createTimestamp__gte', params.createTimestamp__gte)
  }
  if (params?.createTimestamp__lte) {
    queryParams.append('createTimestamp__lte', params.createTimestamp__lte)
  }

  // Search
  if (params?.q) {
    queryParams.append('q', params.q)
  }

  // Sort
  if (params?.sort && params.sort.length > 0) {
    queryParams.append('sort', params.sort.join(','))
  }

  const queryString = queryParams.toString()
  const url = `${authStore.baseUrl}/api/v3.0/downloads${queryString ? `?${queryString}` : ''}`
  debug('Fetching downloads:', url)

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

    const data = await response.json() as PaginatedResult<Download>
    debug('Downloads fetched:', data.results?.length ?? 0, 'downloads')

    return success(data)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to fetch downloads: ${String(err)}`)
  }
}

/**
 * Get a specific download by ID.
 *
 * @remarks
 * Fetches a single download's metadata from `/api/v3.0/downloads/{downloadId}`.
 * Use this to get download details before downloading.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/getdownload).
 *
 * @param downloadId - The unique identifier of the download to fetch
 * @param params - Optional parameters (e.g., include additional fields)
 * @returns A Result containing the download or an error
 *
 * @example
 * ```typescript
 * import { getDownload } from 'een-api-toolkit'
 *
 * const { data, error } = await getDownload('download-123')
 *
 * if (error) {
 *   if (error.code === 'NOT_FOUND') {
 *     console.log('Download not found')
 *   }
 *   return
 * }
 *
 * console.log(`Download: ${data.name} (${data.status})`)
 * if (data.status === 'available') {
 *   console.log(`Size: ${data.sizeBytes} bytes`)
 * }
 * ```
 *
 * @category Downloads
 */
export async function getDownload(downloadId: string, params?: GetDownloadParams): Promise<Result<Download>> {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return failure('AUTH_REQUIRED', 'Authentication required')
  }

  if (!authStore.baseUrl) {
    return failure('AUTH_REQUIRED', 'Base URL not configured')
  }

  if (!downloadId) {
    return failure('VALIDATION_ERROR', 'Download ID is required')
  }

  const queryParams = new URLSearchParams()

  if (params?.include && params.include.length > 0) {
    queryParams.append('include', params.include.join(','))
  }

  const queryString = queryParams.toString()
  const url = `${authStore.baseUrl}/api/v3.0/downloads/${encodeURIComponent(downloadId)}${queryString ? `?${queryString}` : ''}`
  debug('Fetching download:', url)

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

    const data = await response.json() as Download
    debug('Download fetched:', data.name, 'status:', data.status)

    return success(data)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to fetch download: ${String(err)}`)
  }
}

/**
 * Download the binary content of a download entry.
 *
 * @remarks
 * Downloads the actual file content from `/api/v3.0/downloads/{downloadId}:download`.
 * Returns a Blob that can be used to create a download link or process the file.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/downloaddownload).
 *
 * @param downloadId - The unique identifier of the download to fetch
 * @returns A Result containing the download result with blob, filename, and metadata
 *
 * @example
 * ```typescript
 * import { downloadDownload } from 'een-api-toolkit'
 *
 * const { data, error } = await downloadDownload('download-123')
 *
 * if (error) {
 *   console.error('Download failed:', error.message)
 *   return
 * }
 *
 * // Create download link
 * const url = URL.createObjectURL(data.blob)
 * const a = document.createElement('a')
 * a.href = url
 * a.download = data.filename
 * a.click()
 * URL.revokeObjectURL(url)
 *
 * console.log(`Downloaded: ${data.filename} (${data.size} bytes)`)
 * ```
 *
 * @category Downloads
 */
export async function downloadDownload(downloadId: string): Promise<Result<DownloadDownloadResult>> {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return failure('AUTH_REQUIRED', 'Authentication required')
  }

  if (!authStore.baseUrl) {
    return failure('AUTH_REQUIRED', 'Base URL not configured')
  }

  if (!downloadId) {
    return failure('VALIDATION_ERROR', 'Download ID is required')
  }

  const url = `${authStore.baseUrl}/api/v3.0/downloads/${encodeURIComponent(downloadId)}:download`
  debug('Downloading:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })

    if (!response.ok) {
      return handleErrorResponse(response)
    }

    // Get the blob data
    const blob = await response.blob()

    // Parse filename from Content-Disposition header
    const contentDisposition = response.headers.get('Content-Disposition')
    let filename = 'download'
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '')
      }
    }

    // Get content type
    const contentType = response.headers.get('Content-Type') || 'application/octet-stream'

    const result: DownloadDownloadResult = {
      blob,
      filename,
      contentType,
      size: blob.size
    }

    debug('Downloaded:', filename, blob.size, 'bytes')

    return success(result)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to download: ${String(err)}`)
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
  } catch {
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
