import type { Job } from './job'

/**
 * Export types supported by the EEN API v3.0.
 *
 * @remarks
 * Different export types produce different output formats.
 *
 * - `bundle`: ZIP archive containing video clips and images
 * - `timeLapse`: Time-lapse video from multiple frames
 * - `video`: Single video file export
 *
 * @category Exports
 */
export type ExportType = 'bundle' | 'timeLapse' | 'video'

/**
 * Parameters for creating an export job.
 *
 * @remarks
 * Creates an asynchronous job that exports video or images from a camera.
 * The job progresses through states: pending → started → success/failure.
 *
 * @example
 * ```typescript
 * import { createExportJob, formatTimestamp } from 'een-api-toolkit'
 *
 * const startTime = new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
 * const endTime = new Date()
 *
 * const { data, error } = await createExportJob({
 *   name: 'Security Incident Export',
 *   type: 'video',
 *   cameraId: 'camera-123',
 *   startTimestamp: formatTimestamp(startTime.toISOString()),
 *   endTimestamp: formatTimestamp(endTime.toISOString())
 * })
 *
 * if (data) {
 *   console.log('Export job created:', data.id)
 *   // Poll getJob() to track progress
 * }
 * ```
 *
 * @category Exports
 */
export interface CreateExportParams {
  /** Display name for the export job */
  name?: string
  /** Type of export to create */
  type: ExportType
  /** Camera ID to export from */
  cameraId: string
  /** Start timestamp for the export (ISO 8601 format with +00:00 timezone) */
  startTimestamp: string
  /** End timestamp for the export (ISO 8601 format with +00:00 timezone) */
  endTimestamp: string
  /**
   * Playback multiplier for time lapse video (required for timeLapse and bundle types).
   * Value must be between 1 and 48.
   * For example, a value of 10 means 10 minutes of recording becomes 1 minute of playback.
   */
  playbackMultiplier?: number
  /** If true, export is auto-deleted after 2 weeks (default: false) */
  autoDelete?: boolean
  /** Directory path in archive to save the export (default: '/') */
  directory?: string
  /** Notes/description for the export */
  notes?: string
  /** Tags for categorization */
  tags?: string[]
}

/**
 * Response from creating an export job.
 *
 * @remarks
 * Returns the created job with its initial state. Use `getJob()` to poll
 * for completion.
 *
 * @category Exports
 */
export type ExportJobResponse = Job
