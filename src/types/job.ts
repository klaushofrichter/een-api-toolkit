/**
 * Job states from EEN API v3.0.
 *
 * @remarks
 * Indicates the current state of an asynchronous job.
 *
 * @category Jobs
 */
export type JobState = 'pending' | 'started' | 'success' | 'failure' | 'revoked'

/**
 * File info within a job result interval.
 *
 * @category Jobs
 */
export interface JobResultFile {
  /** File name */
  name: string
  /** File path/directory */
  path?: string
  /** File size in bytes */
  size?: number
  /** Start timestamp of the file content */
  startTimestamp?: string
  /** End timestamp of the file content */
  endTimestamp?: string
  /** URL to download/access the file */
  url?: string
  /** File checksum */
  checksum?: string
}

/**
 * Interval within a job result.
 *
 * @category Jobs
 */
export interface JobResultInterval {
  /** Start of this interval */
  startTimestamp?: string
  /** End of this interval */
  endTimestamp?: string
  /** State of this interval */
  state?: string
  /** Files produced in this interval */
  files?: JobResultFile[]
  /** Error for this interval */
  error?: string | null
}

/**
 * Job result structure.
 *
 * @category Jobs
 */
export interface JobResult {
  /** Overall result state */
  state?: string
  /** Error details if failed */
  error?: string | null
  /** Result intervals (each may contain files) */
  intervals?: JobResultInterval[]
}

/**
 * Original request stored in job arguments.
 *
 * @category Jobs
 */
export interface JobOriginalRequest {
  /** Export type */
  type?: string
  /** Name given to the export */
  name?: string
  /** Target directory */
  directory?: string
  /** Start timestamp of requested period */
  startTimestamp?: string
  /** End timestamp of requested period */
  endTimestamp?: string
  /** Additional notes */
  notes?: string | null
  /** Tags for the export */
  tags?: string[] | null
}

/**
 * Job arguments structure.
 *
 * @category Jobs
 */
export interface JobArguments {
  /** Device ID the job operates on */
  deviceId?: string
  /** Original request parameters */
  originalRequest?: JobOriginalRequest
}

/**
 * Job entity from EEN API v3.0.
 *
 * @remarks
 * Represents an asynchronous job in the Eagle Eye Networks platform.
 * Jobs are used for long-running operations like video exports.
 *
 * Note: Some fields like name and timestamps are nested in the `arguments`
 * and `result` objects. Use helper properties or access them directly:
 * - Name: `job.arguments?.originalRequest?.name`
 * - Request timestamps: `job.arguments?.originalRequest?.startTimestamp/endTimestamp`
 * - Result files: `job.result?.intervals?.[0]?.files`
 *
 * @example
 * ```typescript
 * import { listJobs, type Job } from 'een-api-toolkit'
 *
 * const { data, error } = await listJobs({ state__in: ['pending', 'started'] })
 * if (data) {
 *   data.results.forEach((job: Job) => {
 *     const name = job.arguments?.originalRequest?.name || job.id
 *     console.log(`${name}: ${job.state}`)
 *   })
 * }
 * ```
 *
 * @category Jobs
 */
export interface Job {
  /** Unique identifier for the job */
  id: string
  /** Namespace of the job (e.g., 'media') */
  namespace?: string
  /** Type of job (e.g., 'media.export') */
  type: string
  /** ID of the user who created the job */
  userId: string
  /** Current state of the job */
  state: JobState
  /** Detailed state information */
  detailedState?: string | null
  /** Progress as a decimal (0-1). Multiply by 100 for percentage. */
  progress?: number
  /** Error details if the job failed */
  error?: string | null
  /** Job arguments including the original request */
  arguments?: JobArguments
  /** Job result including output files */
  result?: JobResult
  /** ISO 8601 timestamp when the job was created */
  createTimestamp: string
  /** ISO 8601 timestamp when the job was last updated */
  updateTimestamp?: string
  /** ISO 8601 timestamp when the job is scheduled to expire */
  expireTimestamp?: string
  /** ISO 8601 timestamp when the job is scheduled to run */
  scheduleTimestamp?: string | null
}

/**
 * Parameters for listing jobs.
 *
 * @remarks
 * Supports filtering by state, type, and time range.
 *
 * @example
 * ```typescript
 * import { listJobs } from 'een-api-toolkit'
 *
 * // Get pending and started jobs
 * const { data } = await listJobs({
 *   state__in: ['pending', 'started'],
 *   pageSize: 50
 * })
 *
 * // Get export jobs
 * const { data: exports } = await listJobs({
 *   type: 'export'
 * })
 * ```
 *
 * @category Jobs
 */
export interface ListJobsParams {
  /** Number of results per page (default: 100, max: 1000) */
  pageSize?: number
  /** Token for fetching a specific page */
  pageToken?: string
  /** Filter by job states (any match) */
  state__in?: JobState[]
  /** Filter by job type */
  type?: string
  /** Filter by job types (any match) */
  type__in?: string[]
  /** Filter by jobs created after this timestamp (ISO 8601) */
  createTimestamp__gte?: string
  /** Filter by jobs created before this timestamp (ISO 8601) */
  createTimestamp__lte?: string
  /** Filter by user ID */
  userId?: string
  /** Fields to sort by (prefix with - for descending) */
  sort?: string[]
}

/**
 * Parameters for getting a single job.
 *
 * @remarks
 * Use to fetch a specific job by ID, typically for polling job status.
 *
 * @example
 * ```typescript
 * import { getJob } from 'een-api-toolkit'
 *
 * // Poll for job completion
 * const { data, error } = await getJob('job-123')
 * if (data?.state === 'success') {
 *   const fileUrl = data.result?.intervals?.[0]?.files?.[0]?.url
 *   const fileId = fileUrl?.substring(fileUrl.lastIndexOf('/') + 1)
 *   console.log('Job completed! File ID:', fileId)
 * }
 * ```
 *
 * @category Jobs
 */
export interface GetJobParams {
  /** Additional fields to include in the response */
  include?: string[]
}
