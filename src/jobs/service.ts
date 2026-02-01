import { useAuthStore } from '../auth/store'
import { success, failure } from '../types'
import type { Result, PaginatedResult, Job, ListJobsParams, GetJobParams } from '../types'
import { debug } from '../utils/debug'

/**
 * List jobs with optional pagination and filtering.
 *
 * @remarks
 * Fetches a paginated list of jobs from `/api/v3.0/jobs`. Supports
 * filtering by state, type, and time range.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listjobs).
 *
 * @param params - Optional pagination and filtering parameters
 * @returns A Result containing a paginated list of jobs or an error
 *
 * @example
 * ```typescript
 * import { listJobs } from 'een-api-toolkit'
 *
 * // Basic usage
 * const { data, error } = await listJobs()
 * if (data) {
 *   console.log(`Found ${data.results.length} jobs`)
 * }
 *
 * // Filter by state
 * const { data } = await listJobs({
 *   state__in: ['pending', 'started'],
 *   pageSize: 50
 * })
 *
 * // Get export jobs only
 * const { data: exports } = await listJobs({
 *   type: 'export'
 * })
 * ```
 *
 * @category Jobs
 */
export async function listJobs(params?: ListJobsParams): Promise<Result<PaginatedResult<Job>>> {
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

  // State filter
  if (params?.state__in && params.state__in.length > 0) {
    queryParams.append('state__in', params.state__in.join(','))
  }

  // Type filters
  if (params?.type) {
    queryParams.append('type', params.type)
  }
  if (params?.type__in && params.type__in.length > 0) {
    queryParams.append('type__in', params.type__in.join(','))
  }

  // Time filters
  if (params?.createTimestamp__gte) {
    queryParams.append('createTimestamp__gte', params.createTimestamp__gte)
  }
  if (params?.createTimestamp__lte) {
    queryParams.append('createTimestamp__lte', params.createTimestamp__lte)
  }

  // User filter
  if (params?.userId) {
    queryParams.append('userId', params.userId)
  }

  // Sort
  if (params?.sort && params.sort.length > 0) {
    queryParams.append('sort', params.sort.join(','))
  }

  const queryString = queryParams.toString()
  const url = `${authStore.baseUrl}/api/v3.0/jobs${queryString ? `?${queryString}` : ''}`
  debug('Fetching jobs:', url)

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

    const data = await response.json() as PaginatedResult<Job>
    debug('Jobs fetched:', data.results?.length ?? 0, 'jobs')

    return success(data)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to fetch jobs: ${String(err)}`)
  }
}

/**
 * Get a specific job by ID.
 *
 * @remarks
 * Fetches a single job from `/api/v3.0/jobs/{jobId}`. Use this to poll
 * for job completion after creating an export.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/getjob).
 *
 * @param jobId - The unique identifier of the job to fetch
 * @param params - Optional parameters (e.g., include additional fields)
 * @returns A Result containing the job or an error
 *
 * @example
 * ```typescript
 * import { getJob } from 'een-api-toolkit'
 *
 * const { data, error } = await getJob('job-123')
 *
 * if (error) {
 *   if (error.code === 'NOT_FOUND') {
 *     console.log('Job not found')
 *   }
 *   return
 * }
 *
 * console.log(`Job state: ${data.state}`)
 * if (data.state === 'started') {
 *   console.log(`Progress: ${data.progress}%`)
 * }
 * if (data.state === 'success') {
 *   console.log(`File ID: ${data.fileId}`)
 * }
 * ```
 *
 * @category Jobs
 */
export async function getJob(jobId: string, params?: GetJobParams): Promise<Result<Job>> {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return failure('AUTH_REQUIRED', 'Authentication required')
  }

  if (!authStore.baseUrl) {
    return failure('AUTH_REQUIRED', 'Base URL not configured')
  }

  if (!jobId) {
    return failure('VALIDATION_ERROR', 'Job ID is required')
  }

  const queryParams = new URLSearchParams()

  if (params?.include && params.include.length > 0) {
    queryParams.append('include', params.include.join(','))
  }

  const queryString = queryParams.toString()
  const url = `${authStore.baseUrl}/api/v3.0/jobs/${encodeURIComponent(jobId)}${queryString ? `?${queryString}` : ''}`
  debug('Fetching job:', url)

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

    const data = await response.json() as Job
    debug('Job fetched:', data.arguments?.originalRequest?.name || data.id, 'state:', data.state)

    return success(data)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to fetch job: ${String(err)}`)
  }
}

/**
 * Delete (revoke) a job by ID.
 *
 * @remarks
 * Deletes a job from `/api/v3.0/jobs/{jobId}` regardless of its state.
 * This can be used to:
 * - Cancel a **pending** job before it starts processing
 * - Revoke a **started** job to stop processing
 * - Remove a **completed** job record
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/deletejob).
 *
 * @param jobId - The unique identifier of the job to delete
 * @returns A Result with void data on success, or an error
 *
 * @example
 * ```typescript
 * import { deleteJob } from 'een-api-toolkit'
 *
 * // Cancel a pending export job
 * const { error } = await deleteJob('job-123')
 *
 * if (error) {
 *   if (error.code === 'NOT_FOUND') {
 *     console.log('Job not found or already deleted')
 *   } else {
 *     console.error('Failed to delete job:', error.message)
 *   }
 *   return
 * }
 *
 * console.log('Job successfully revoked')
 * ```
 *
 * @category Jobs
 */
export async function deleteJob(jobId: string): Promise<Result<void>> {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return failure('AUTH_REQUIRED', 'Authentication required')
  }

  if (!authStore.baseUrl) {
    return failure('AUTH_REQUIRED', 'Base URL not configured')
  }

  if (!jobId) {
    return failure('VALIDATION_ERROR', 'Job ID is required')
  }

  const url = `${authStore.baseUrl}/api/v3.0/jobs/${encodeURIComponent(jobId)}`
  debug('Deleting job:', url)

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

    // 204 No Content is expected on success
    debug('Job deleted:', jobId)

    return success(undefined as void)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to delete job: ${String(err)}`)
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
