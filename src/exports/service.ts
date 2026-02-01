import { useAuthStore } from '../auth/store'
import { success, failure } from '../types'
import type { Result, CreateExportParams, ExportJobResponse } from '../types'
import { debug } from '../utils/debug'

/**
 * Create a new export job.
 *
 * @remarks
 * Creates an asynchronous job to export video or images from a camera.
 * The job is queued and processed in the background. Use `getJob()` to
 * poll for completion.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/createexport).
 *
 * @param params - Export job parameters
 * @returns A Result containing the created job or an error
 *
 * @example
 * ```typescript
 * import { createExportJob, getJob, formatTimestamp } from 'een-api-toolkit'
 *
 * // Create an export job
 * const startTime = new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
 * const endTime = new Date()
 *
 * const { data: job, error } = await createExportJob({
 *   name: 'Security Incident Export',
 *   type: 'video',
 *   cameraId: 'camera-123',
 *   startTimestamp: formatTimestamp(startTime.toISOString()),
 *   endTimestamp: formatTimestamp(endTime.toISOString())
 * })
 *
 * if (error) {
 *   console.error('Failed to create export:', error.message)
 *   return
 * }
 *
 * // Poll for completion
 * let completed = false
 * while (!completed) {
 *   await new Promise(r => setTimeout(r, 2000)) // Wait 2 seconds
 *   const { data: status } = await getJob(job.id)
 *   if (status?.state === 'success') {
 *     const fileUrl = status.result?.intervals?.[0]?.files?.[0]?.url
 *     const fileId = fileUrl?.substring(fileUrl.lastIndexOf('/') + 1)
 *     console.log('Export complete! File ID:', fileId)
 *     completed = true
 *   } else if (status?.state === 'failure') {
 *     console.error('Export failed:', status.error)
 *     completed = true
 *   } else {
 *     console.log('Progress:', status?.progress || 0, '%')
 *   }
 * }
 * ```
 *
 * @category Exports
 */
export async function createExportJob(params: CreateExportParams): Promise<Result<ExportJobResponse>> {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return failure('AUTH_REQUIRED', 'Authentication required')
  }

  if (!authStore.baseUrl) {
    return failure('AUTH_REQUIRED', 'Base URL not configured')
  }

  // Validate required parameters
  if (!params.cameraId) {
    return failure('VALIDATION_ERROR', 'Camera ID is required')
  }

  if (!params.type) {
    return failure('VALIDATION_ERROR', 'Export type is required')
  }

  if (!params.startTimestamp) {
    return failure('VALIDATION_ERROR', 'Start timestamp is required')
  }

  if (!params.endTimestamp) {
    return failure('VALIDATION_ERROR', 'End timestamp is required')
  }

  const url = `${authStore.baseUrl}/api/v3.0/exports`
  debug('Creating export job:', url)

  // Validate playbackMultiplier for timeLapse and bundle types
  if ((params.type === 'timeLapse' || params.type === 'bundle') && !params.playbackMultiplier) {
    return failure('VALIDATION_ERROR', 'Playback multiplier is required for timeLapse and bundle exports')
  }

  if (params.playbackMultiplier !== undefined) {
    if (params.playbackMultiplier < 1 || params.playbackMultiplier > 48) {
      return failure('VALIDATION_ERROR', 'Playback multiplier must be between 1 and 48')
    }
  }

  // Build request body according to EEN API v3.0 structure
  // API requires: deviceId, type, info{name, directory}, period{}
  const info: Record<string, unknown> = {
    name: params.name || `Export-${Date.now()}`,
    directory: params.directory || '/'
  }

  if (params.notes) {
    info.notes = params.notes
  }

  if (params.tags && params.tags.length > 0) {
    info.tags = params.tags
  }

  const period: Record<string, unknown> = {
    startTimestamp: params.startTimestamp,
    endTimestamp: params.endTimestamp
  }

  const body: Record<string, unknown> = {
    deviceId: params.cameraId,  // API uses deviceId, not cameraId
    type: params.type,
    info,
    period
  }

  // playbackMultiplier is required for timeLapse and bundle
  if (params.playbackMultiplier !== undefined) {
    body.playbackMultiplier = params.playbackMultiplier
  }

  if (params.autoDelete !== undefined) {
    body.autoDelete = params.autoDelete
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

    const data = await response.json() as ExportJobResponse
    debug('Export job created:', data.id)

    return success(data)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to create export job: ${String(err)}`)
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
