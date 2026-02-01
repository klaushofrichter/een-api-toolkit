import { useAuthStore } from '../auth/store'
import { success, failure } from '../types'
import type { Result, PaginatedResult, EenFile, ListFilesParams, GetFileParams, CreateFileParams, DownloadFileResult } from '../types'
import { debug } from '../utils/debug'

/**
 * List files with optional pagination and filtering.
 *
 * @remarks
 * Fetches a paginated list of files from `/api/v3.0/files`. Supports
 * filtering by type, camera, and time range.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listfiles).
 *
 * @param params - Optional pagination and filtering parameters
 * @returns A Result containing a paginated list of files or an error
 *
 * @example
 * ```typescript
 * import { listFiles } from 'een-api-toolkit'
 *
 * // Basic usage
 * const { data, error } = await listFiles()
 * if (data) {
 *   console.log(`Found ${data.results.length} files`)
 * }
 *
 * // Filter by type
 * const { data } = await listFiles({
 *   type__in: ['export'],
 *   pageSize: 50
 * })
 *
 * // Files for a specific camera
 * const { data: cameraFiles } = await listFiles({
 *   cameraId: 'camera-123'
 * })
 * ```
 *
 * @category Files
 */
export async function listFiles(params?: ListFilesParams): Promise<Result<PaginatedResult<EenFile>>> {
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

  // Include additional fields
  if (params?.include && params.include.length > 0) {
    queryParams.append('include', params.include.join(','))
  }

  // Type filter
  if (params?.type__in && params.type__in.length > 0) {
    queryParams.append('type__in', params.type__in.join(','))
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

  // Time filters
  if (params?.createTimestamp__gte) {
    queryParams.append('createTimestamp__gte', params.createTimestamp__gte)
  }
  if (params?.createTimestamp__lte) {
    queryParams.append('createTimestamp__lte', params.createTimestamp__lte)
  }

  // Tags filter
  if (params?.tags__contains && params.tags__contains.length > 0) {
    queryParams.append('tags__contains', params.tags__contains.join(','))
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
  const url = `${authStore.baseUrl}/api/v3.0/files${queryString ? `?${queryString}` : ''}`
  debug('Fetching files:', url)

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

    const data = await response.json() as PaginatedResult<EenFile>
    debug('Files fetched:', data.results?.length ?? 0, 'files')

    return success(data)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to fetch files: ${String(err)}`)
  }
}

/**
 * Get a specific file by ID.
 *
 * @remarks
 * Fetches a single file's metadata from `/api/v3.0/files/{fileId}`.
 * Use this to get file details before downloading.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/getfile).
 *
 * @param fileId - The unique identifier of the file to fetch
 * @param params - Optional parameters (e.g., include additional fields)
 * @returns A Result containing the file or an error
 *
 * @example
 * ```typescript
 * import { getFile } from 'een-api-toolkit'
 *
 * const { data, error } = await getFile('file-123')
 *
 * if (error) {
 *   if (error.code === 'NOT_FOUND') {
 *     console.log('File not found')
 *   }
 *   return
 * }
 *
 * console.log(`File: ${data.name} (${data.size} bytes)`)
 * ```
 *
 * @category Files
 */
export async function getFile(fileId: string, params?: GetFileParams): Promise<Result<EenFile>> {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return failure('AUTH_REQUIRED', 'Authentication required')
  }

  if (!authStore.baseUrl) {
    return failure('AUTH_REQUIRED', 'Base URL not configured')
  }

  if (!fileId) {
    return failure('VALIDATION_ERROR', 'File ID is required')
  }

  const queryParams = new URLSearchParams()

  if (params?.include && params.include.length > 0) {
    queryParams.append('include', params.include.join(','))
  }

  const queryString = queryParams.toString()
  const url = `${authStore.baseUrl}/api/v3.0/files/${encodeURIComponent(fileId)}${queryString ? `?${queryString}` : ''}`
  debug('Fetching file:', url)

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

    const data = await response.json() as EenFile
    debug('File fetched:', data.name)

    return success(data)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to fetch file: ${String(err)}`)
  }
}

/**
 * Add/create a new file entry.
 *
 * @remarks
 * Creates a new file entry from `/api/v3.0/files`. The actual file content
 * may be uploaded separately or referenced by URL.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/createfile).
 *
 * @param params - File creation parameters
 * @returns A Result containing the created file or an error
 *
 * @example
 * ```typescript
 * import { addFile } from 'een-api-toolkit'
 *
 * const { data, error } = await addFile({
 *   name: 'Incident Report',
 *   type: 'upload',
 *   description: 'Security incident documentation'
 * })
 *
 * if (data) {
 *   console.log('File created:', data.id)
 * }
 * ```
 *
 * @category Files
 */
export async function addFile(params: CreateFileParams): Promise<Result<EenFile>> {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return failure('AUTH_REQUIRED', 'Authentication required')
  }

  if (!authStore.baseUrl) {
    return failure('AUTH_REQUIRED', 'Base URL not configured')
  }

  if (!params.name) {
    return failure('VALIDATION_ERROR', 'File name is required')
  }

  const url = `${authStore.baseUrl}/api/v3.0/files`
  debug('Creating file:', url)

  // Build request body
  const body: Record<string, unknown> = {
    name: params.name
  }

  if (params.type) {
    body.type = params.type
  }

  if (params.filename) {
    body.filename = params.filename
  }

  if (params.description) {
    body.description = params.description
  }

  if (params.tags && params.tags.length > 0) {
    body.tags = params.tags
  }

  if (params.cameraId) {
    body.cameraId = params.cameraId
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      return handleErrorResponse(response)
    }

    const data = await response.json() as EenFile
    debug('File created:', data.id)

    return success(data)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to create file: ${String(err)}`)
  }
}

/**
 * Download a file's binary content.
 *
 * @remarks
 * Downloads the actual file content from `/api/v3.0/files/{fileId}:download`.
 * Returns a Blob that can be used to create a download link or process the file.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/downloadfile).
 *
 * @param fileId - The unique identifier of the file to download
 * @returns A Result containing the download result with blob, filename, and metadata
 *
 * @example
 * ```typescript
 * import { downloadFile } from 'een-api-toolkit'
 *
 * const { data, error } = await downloadFile('file-123')
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
 * @category Files
 */
export async function downloadFile(fileId: string): Promise<Result<DownloadFileResult>> {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return failure('AUTH_REQUIRED', 'Authentication required')
  }

  if (!authStore.baseUrl) {
    return failure('AUTH_REQUIRED', 'Base URL not configured')
  }

  if (!fileId) {
    return failure('VALIDATION_ERROR', 'File ID is required')
  }

  const url = `${authStore.baseUrl}/api/v3.0/files/${encodeURIComponent(fileId)}:download`
  debug('Downloading file:', url)

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

    const result: DownloadFileResult = {
      blob,
      filename,
      contentType,
      size: blob.size
    }

    debug('File downloaded:', filename, blob.size, 'bytes')

    return success(result)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to download file: ${String(err)}`)
  }
}

/**
 * Delete (recycle) a file by ID.
 *
 * @remarks
 * Moves a file to the recycle bin (trash) via DELETE `/api/v3.0/files/{fileId}`.
 * This does not permanently delete the file - it can be recovered from trash.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/deletefile).
 *
 * @param fileId - The unique identifier of the file to delete
 * @returns A Result indicating success or an error
 *
 * @example
 * ```typescript
 * import { deleteFile } from 'een-api-toolkit'
 *
 * async function recycleFile(fileId: string) {
 *   const { error } = await deleteFile(fileId)
 *
 *   if (error) {
 *     if (error.code === 'NOT_FOUND') {
 *       console.log('File not found or already deleted')
 *     } else {
 *       console.error('Failed to delete file:', error.message)
 *     }
 *     return false
 *   }
 *
 *   console.log('File moved to trash')
 *   return true
 * }
 * ```
 *
 * @category Files
 */
export async function deleteFile(fileId: string): Promise<Result<void>> {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return failure('AUTH_REQUIRED', 'Authentication required')
  }

  if (!authStore.baseUrl) {
    return failure('AUTH_REQUIRED', 'Base URL not configured')
  }

  if (!fileId) {
    return failure('VALIDATION_ERROR', 'File ID is required')
  }

  const url = `${authStore.baseUrl}/api/v3.0/files/${encodeURIComponent(fileId)}`
  debug('Deleting file:', url)

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })

    if (!response.ok) {
      return handleErrorResponse(response)
    }

    debug('File deleted (recycled):', fileId)

    return success(undefined as void)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to delete file: ${String(err)}`)
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
