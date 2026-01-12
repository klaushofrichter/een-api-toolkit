/**
 * Media type values from EEN API v3.0.
 *
 * @remarks
 * Indicates the type of media content.
 *
 * @category Media
 */
export type MediaType = 'video' | 'image'

/**
 * Stream type values from EEN API v3.0.
 *
 * @remarks
 * Indicates the quality/type of the media stream.
 * - `preview`: Low resolution, low framerate stream
 * - `main`: High resolution stream
 *
 * @category Media
 */
export type MediaStreamType = 'preview' | 'main'

/**
 * Media interval from EEN API v3.0.
 *
 * @remarks
 * Represents a time interval for which recordings exist.
 *
 * @category Media
 */
export interface MediaInterval {
  /** Stream type (preview or main) */
  type: MediaStreamType
  /** The device ID that generated the media */
  deviceId: string
  /** Type of media contained (video or image) */
  mediaType: MediaType
  /** Start time of the media interval (ISO 8601) */
  startTimestamp: string
  /** End time of the media interval (ISO 8601) */
  endTimestamp: string
  /** Flash video URL (if requested via include) */
  flvUrl?: string | null
  /** RTSP URL (if requested via include) */
  rtspUrl?: string
  /** RTSPS URL (if requested via include) */
  rtspsUrl?: string
  /** HLS URL (if requested via include) */
  hlsUrl?: string | null
  /** Multipart URL (if requested via include) */
  multipartUrl?: string
  /** MP4 URL (if requested via include) */
  mp4Url?: string | null
  /** WebSocket live URL (if requested via include) */
  wsLiveUrl?: string
}

/**
 * Parameters for listing media intervals.
 *
 * @remarks
 * Used to query recording intervals for a device.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listmedia).
 *
 * @example
 * ```typescript
 * import { listMedia } from 'een-api-toolkit'
 *
 * // Get video recordings from the last hour
 * const { data } = await listMedia({
 *   deviceId: 'camera-123',
 *   type: 'preview',
 *   mediaType: 'video',
 *   startTimestamp: new Date(Date.now() - 3600000).toISOString()
 * })
 * ```
 *
 * @category Media
 */
export interface ListMediaParams {
  /** The ID of the device (camera) - required */
  deviceId: string
  /** Stream type (preview or main) - required */
  type: MediaStreamType
  /** Media type (video or image) - required */
  mediaType: MediaType
  /** Minimum timestamp from which to list recordings (ISO 8601) - required */
  startTimestamp: string
  /** Maximum timestamp until which to list recordings (ISO 8601) */
  endTimestamp?: string
  /** If true, coalesce connected intervals into a single interval (default: true) */
  coalesce?: boolean
  /**
   * Additional fields to include in the response.
   * Valid values: flvUrl, rtspUrl, rtspsUrl, hlsUrl, multipartUrl, mp4Url, wsLiveUrl
   */
  include?: string[]
  /** Token for fetching a specific page */
  pageToken?: string
  /** Number of results per page */
  pageSize?: number
}

/**
 * Parameters for getting a live image.
 *
 * @remarks
 * Used to fetch a live image from a camera.
 * Note: Live images only support 'preview' type.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/getliveimage).
 *
 * @example
 * ```typescript
 * import { getLiveImage } from 'een-api-toolkit'
 *
 * const { data } = await getLiveImage({
 *   deviceId: 'camera-123',
 *   type: 'preview'
 * })
 *
 * if (data) {
 *   // Display the image in an <img> element
 *   imgElement.src = data.imageData
 * }
 * ```
 *
 * @category Media
 */
export interface GetLiveImageParams {
  /** The ID of the device (camera) - required */
  deviceId: string
  /** Stream type - only 'preview' is supported for live images */
  type?: 'preview'
}

/**
 * Result of getting a live image.
 *
 * @remarks
 * Contains the image data as a base64 data URL and metadata from response headers.
 *
 * @category Media
 */
export interface LiveImageResult {
  /** Base64 encoded image data URL (data:image/jpeg;base64,...) */
  imageData: string
  /** Timestamp of the image (from X-Een-Timestamp header) */
  timestamp: string | null
  /** Token to fetch the previous image (from X-Een-PrevToken header) */
  prevToken: string | null
}

/**
 * Parameters for getting a recorded image.
 *
 * @remarks
 * Used to fetch a recorded image from a camera at a specific timestamp.
 * Either deviceId with a timestamp parameter, or pageToken is required.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/getrecordedimage).
 *
 * @example
 * ```typescript
 * import { getRecordedImage } from 'een-api-toolkit'
 *
 * // Get image at or after a specific time
 * const { data } = await getRecordedImage({
 *   deviceId: 'camera-123',
 *   type: 'preview',
 *   timestamp__gte: '2024-01-15T10:00:00.000Z'
 * })
 * ```
 *
 * @category Media
 */
export interface GetRecordedImageParams {
  /** The ID of the device (camera) - required unless using pageToken */
  deviceId?: string
  /** Token from previous request to fetch next/previous image */
  pageToken?: string
  /** Stream type (preview or main) */
  type?: MediaStreamType
  /** Return first image with timestamp less than this value */
  timestamp__lt?: string
  /** Return first image with timestamp less than or equal to this value */
  timestamp__lte?: string
  /** Return image at this exact timestamp */
  timestamp?: string
  /** Return first image with timestamp greater than or equal to this value */
  timestamp__gte?: string
  /** Return first image with timestamp greater than this value */
  timestamp__gt?: string
  /** List of overlay IDs to include */
  overlayId__in?: string[]
  /**
   * Include options for overlays.
   * Valid values: overlayEmbedded, overlaySvgHeader
   */
  include?: string[]
  /** Target width for the returned image (32-7680) */
  targetWidth?: number
  /** Target height for the returned image (32-4320) */
  targetHeight?: number
}

/**
 * Result of getting a recorded image.
 *
 * @remarks
 * Contains the image data as a base64 data URL and metadata from response headers.
 *
 * @category Media
 */
export interface RecordedImageResult {
  /** Base64 encoded image data URL (data:image/jpeg;base64,...) */
  imageData: string
  /** Timestamp of the image (from X-Een-Timestamp header) */
  timestamp: string | null
  /** Token to fetch the next image (from X-Een-NextToken header) */
  nextToken: string | null
  /** Token to fetch the previous image (from X-Een-PrevToken header) */
  prevToken: string | null
  /** SVG overlay data (from X-Een-OverlaySvg header, if requested) */
  overlaySvg: string | null
}

/**
 * Response from the media session endpoint.
 *
 * @remarks
 * Contains the URL to call to set the media session cookie.
 * The session cookie enables media playback in browsers without
 * passing the Bearer token in every request.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/docs/watch-live-video).
 *
 * @category Media
 */
export interface MediaSessionResponse {
  /** URL to call to set the media session cookie */
  url: string
}

/**
 * Result of initializing a media session.
 *
 * @remarks
 * Indicates whether the media session was successfully initialized.
 * When successful, the browser will have a session cookie set that
 * allows media playback without explicit authorization headers.
 *
 * @category Media
 */
export interface MediaSessionResult {
  /** Whether the session was successfully initialized */
  success: boolean
  /** The session URL that was called (for debugging) */
  sessionUrl: string
}
