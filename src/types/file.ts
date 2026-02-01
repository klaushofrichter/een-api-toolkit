/**
 * File type/category from EEN API v3.0.
 *
 * @remarks
 * Indicates the type of content in the file.
 *
 * @category Files
 */
export type FileType = 'export' | 'upload' | 'snapshot' | 'other'

/**
 * Valid include field names for the Files API.
 *
 * @remarks
 * These fields can be requested via the `include` parameter to get additional
 * file metadata that is not returned by default.
 *
 * @example
 * ```typescript
 * const { data } = await listFiles({
 *   include: ['size', 'createTimestamp', 'tags', 'metadata']
 * })
 * ```
 *
 * @category Files
 */
export type FileIncludeField =
  | 'accountId'       // Account ID this file belongs to
  | 'publicShare'     // Public share information
  | 'notes'           // File notes/description
  | 'createTimestamp' // When the file was created
  | 'updateTimestamp' // When the file was last updated
  | 'size'            // File size in bytes
  | 'metadata'        // Additional metadata
  | 'tags'            // Tags for categorization
  | 'childCount'      // Number of child files (for directories)
  | 'details'         // Additional details

/**
 * File entity from EEN API v3.0.
 *
 * @remarks
 * Represents a file stored in the Eagle Eye Networks platform.
 * Files can be exports, uploads, or snapshots.
 *
 * @example
 * ```typescript
 * import { listFiles, type EenFile } from 'een-api-toolkit'
 *
 * const { data, error } = await listFiles({ type__in: ['export'] })
 * if (data) {
 *   data.results.forEach((file: EenFile) => {
 *     console.log(`${file.name}: ${file.size} bytes`)
 *   })
 * }
 * ```
 *
 * @category Files
 */
export interface EenFile {
  /** Unique identifier for the file */
  id: string
  /** Display name of the file */
  name: string
  /** MIME type from API (e.g., 'video/mp4', 'application/directory') */
  mimeType?: string
  /** Directory path */
  directory?: string

  // Fields available via include parameter:

  /** ID of the account this file belongs to (requires include=accountId) */
  accountId?: string
  /** Public share information (requires include=publicShare) */
  publicShare?: unknown
  /** File notes/description (requires include=notes) */
  notes?: string
  /** ISO 8601 timestamp when the file was created (requires include=createTimestamp) */
  createTimestamp?: string
  /** ISO 8601 timestamp when the file was last updated (requires include=updateTimestamp) */
  updateTimestamp?: string
  /** File size in bytes (requires include=size) */
  size?: number
  /** Additional metadata (requires include=metadata) */
  metadata?: Record<string, unknown>
  /** Tags for categorization (requires include=tags) */
  tags?: string[]
  /** Number of child files for directories (requires include=childCount) */
  childCount?: number
  /** Additional file details (requires include=details) */
  details?: Record<string, unknown>

  // Other optional fields:

  /** Original filename */
  filename?: string
  /** MIME content type (e.g., 'video/mp4', 'image/jpeg') */
  contentType?: string
  /** Type/category of the file */
  type?: FileType
  /** ID of the job that created this file (for exports) */
  jobId?: string
  /** ID of the camera this file relates to */
  cameraId?: string
  /** Description or notes about the file */
  description?: string
  /** ISO 8601 timestamp when the file expires (if applicable) */
  expirationTimestamp?: string
}

/**
 * Parameters for listing files.
 *
 * @remarks
 * Supports filtering by type, camera, and time range.
 *
 * @example
 * ```typescript
 * import { listFiles } from 'een-api-toolkit'
 *
 * // Get export files
 * const { data } = await listFiles({
 *   type__in: ['export'],
 *   pageSize: 50
 * })
 *
 * // Get files for a specific camera
 * const { data: cameraFiles } = await listFiles({
 *   cameraId: 'camera-123'
 * })
 * ```
 *
 * @category Files
 */
export interface ListFilesParams {
  /** Number of results per page (default: 100, max: 1000) */
  pageSize?: number
  /** Token for fetching a specific page */
  pageToken?: string
  /**
   * Additional fields to include in the response.
   * Valid values: accountId, publicShare, notes, createTimestamp,
   * updateTimestamp, size, metadata, tags, childCount, details
   */
  include?: FileIncludeField[]
  /** Filter by file types (any match) */
  type__in?: FileType[]
  /** Filter by camera ID */
  cameraId?: string
  /** Filter by camera IDs (any match) */
  cameraId__in?: string[]
  /** Filter by job ID */
  jobId?: string
  /** Filter by files created after this timestamp (ISO 8601) */
  createTimestamp__gte?: string
  /** Filter by files created before this timestamp (ISO 8601) */
  createTimestamp__lte?: string
  /** Filter by tags (all must match) */
  tags__contains?: string[]
  /** Full-text search query */
  q?: string
  /** Fields to sort by (prefix with - for descending) */
  sort?: string[]
}

/**
 * Parameters for getting a single file.
 *
 * @remarks
 * Use to fetch file metadata before downloading.
 *
 * @category Files
 */
export interface GetFileParams {
  /**
   * Additional fields to include in the response.
   * Valid values: accountId, publicShare, notes, createTimestamp,
   * updateTimestamp, size, metadata, tags, childCount, details
   */
  include?: FileIncludeField[]
}

/**
 * Parameters for adding/uploading a file.
 *
 * @remarks
 * Creates a new file entry. The actual file content may be uploaded
 * separately or referenced by URL.
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
 * ```
 *
 * @category Files
 */
export interface CreateFileParams {
  /** Display name for the file */
  name: string
  /** Type/category of the file */
  type?: FileType
  /** Original filename */
  filename?: string
  /** Description or notes about the file */
  description?: string
  /** Tags for categorization */
  tags?: string[]
  /** Related camera ID */
  cameraId?: string
}

/**
 * Result from downloading a file.
 *
 * @remarks
 * Contains the binary file data as a Blob along with metadata.
 *
 * @example
 * ```typescript
 * import { downloadFile } from 'een-api-toolkit'
 *
 * const { data, error } = await downloadFile('file-123')
 *
 * if (data) {
 *   // Create download link
 *   const url = URL.createObjectURL(data.blob)
 *   const a = document.createElement('a')
 *   a.href = url
 *   a.download = data.filename
 *   a.click()
 *   URL.revokeObjectURL(url)
 * }
 * ```
 *
 * @category Files
 */
export interface DownloadFileResult {
  /** Binary file data */
  blob: Blob
  /** Filename from Content-Disposition header */
  filename: string
  /** MIME content type from Content-Type header */
  contentType: string
  /** File size in bytes */
  size: number
}
