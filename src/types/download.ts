import type { DownloadFileResult } from './file'

/**
 * Download status from EEN API v3.0.
 *
 * @remarks
 * Indicates the availability status of a download.
 *
 * @category Downloads
 */
export type DownloadStatus = 'available' | 'expired' | 'pending' | 'error'

/**
 * Download entity from EEN API v3.0.
 *
 * @remarks
 * Represents a downloadable item in the Eagle Eye Networks platform.
 * Downloads may expire after a certain time period.
 *
 * @example
 * ```typescript
 * import { listDownloads, type Download } from 'een-api-toolkit'
 *
 * const { data, error } = await listDownloads({ status__in: ['available'] })
 * if (data) {
 *   data.results.forEach((download: Download) => {
 *     console.log(`${download.name}: ${download.status}`)
 *   })
 * }
 * ```
 *
 * @category Downloads
 */
export interface Download {
  /** Unique identifier for the download */
  id: string
  /** ID of the account this download belongs to */
  accountId: string
  /** Display name of the download */
  name: string
  /** Current status of the download */
  status: DownloadStatus
  /** MIME content type (e.g., 'video/mp4') */
  contentType?: string
  /** File size in bytes */
  sizeBytes?: number
  /** ID of the related file */
  fileId?: string
  /** ID of the job that created this download */
  jobId?: string
  /** ID of the camera this download relates to */
  cameraId?: string
  /** Description or notes */
  description?: string
  /** ISO 8601 timestamp when the download was created */
  createTimestamp: string
  /** ISO 8601 timestamp when the download expires */
  expirationTimestamp?: string
  /** Download URL (may be pre-signed) */
  downloadUrl?: string
}

/**
 * Parameters for listing downloads.
 *
 * @remarks
 * Supports filtering by status, camera, and time range.
 *
 * @example
 * ```typescript
 * import { listDownloads } from 'een-api-toolkit'
 *
 * // Get available downloads
 * const { data } = await listDownloads({
 *   status__in: ['available'],
 *   pageSize: 50
 * })
 * ```
 *
 * @category Downloads
 */
export interface ListDownloadsParams {
  /** Number of results per page (default: 100, max: 1000) */
  pageSize?: number
  /** Token for fetching a specific page */
  pageToken?: string
  /** Filter by download status (any match) */
  status__in?: DownloadStatus[]
  /** Filter by camera ID */
  cameraId?: string
  /** Filter by camera IDs (any match) */
  cameraId__in?: string[]
  /** Filter by job ID */
  jobId?: string
  /** Filter by file ID */
  fileId?: string
  /** Filter by downloads created after this timestamp (ISO 8601) */
  createTimestamp__gte?: string
  /** Filter by downloads created before this timestamp (ISO 8601) */
  createTimestamp__lte?: string
  /** Full-text search query */
  q?: string
  /** Fields to sort by (prefix with - for descending) */
  sort?: string[]
}

/**
 * Parameters for getting a single download.
 *
 * @remarks
 * Use to fetch download metadata and URL before downloading.
 *
 * @category Downloads
 */
export interface GetDownloadParams {
  /** Additional fields to include in the response */
  include?: string[]
}

/**
 * Result from downloading via the downloads endpoint.
 *
 * @remarks
 * Reuses the same structure as file downloads.
 *
 * @category Downloads
 */
export type DownloadDownloadResult = DownloadFileResult
