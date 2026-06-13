import { success, failure } from '../types'
import type { Result, PaginatedResult, Download, ListDownloadsParams, GetDownloadParams, DownloadDownloadResult } from '../types'
import { requireAuth, authHeaders, handleErrorResponse } from '../utils/api'
import { downloadBlob } from '../utils/download'
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
  const url = `${baseUrl}/api/v3.0/downloads${queryString ? `?${queryString}` : ''}`
  debug('Fetching downloads:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: authHeaders(authStore.token)
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
  const auth = requireAuth()
  if (!auth.ok) return auth.result
  const { authStore, baseUrl } = auth

  if (!downloadId) {
    return failure('VALIDATION_ERROR', 'Download ID is required')
  }

  const queryParams = new URLSearchParams()

  if (params?.include && params.include.length > 0) {
    queryParams.append('include', params.include.join(','))
  }

  const queryString = queryParams.toString()
  const url = `${baseUrl}/api/v3.0/downloads/${encodeURIComponent(downloadId)}${queryString ? `?${queryString}` : ''}`
  debug('Fetching download:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: authHeaders(authStore.token)
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
  const auth = requireAuth()
  if (!auth.ok) return auth.result
  const { authStore, baseUrl } = auth

  if (!downloadId) {
    return failure('VALIDATION_ERROR', 'Download ID is required')
  }

  const url = `${baseUrl}/api/v3.0/downloads/${encodeURIComponent(downloadId)}:download`
  debug('Downloading:', url)

  const result = await downloadBlob(url, authStore.token, 'Failed to download: ')
  if (result.error) {
    return result
  }

  debug('Downloaded:', result.data.filename, result.data.blob.size, 'bytes')

  return result
}
