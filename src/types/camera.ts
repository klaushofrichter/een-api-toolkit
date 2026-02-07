/**
 * Camera status values from EEN API v3.0.
 *
 * @remarks
 * Indicates the current operational state of a camera.
 *
 * @category Cameras
 */
export type CameraStatus =
  | 'online'
  | 'offline'
  | 'deviceOffline'
  | 'bridgeOffline'
  | 'invalidCredentials'
  | 'error'
  | 'streaming'
  | 'registered'
  | 'attaching'
  | 'initializing'

/**
 * Device information for a camera.
 *
 * @remarks
 * Contains hardware and firmware details about the physical camera device.
 *
 * @category Cameras
 */
export interface CameraDeviceInfo {
  /** Camera manufacturer (e.g., "Axis", "Hikvision") */
  make?: string
  /** Camera model */
  model?: string
  /** Firmware version */
  firmwareVersion?: string
  /** Whether camera connects directly to cloud (no bridge) */
  directToCloud?: boolean
  /** Serial number */
  serialNumber?: string
  /** Resolution capabilities */
  resolution?: string
  /** Camera type (e.g., "IP", "Analog") */
  type?: string
}

/**
 * Share details for shared cameras.
 *
 * @remarks
 * Contains information about camera sharing between accounts.
 *
 * @category Cameras
 */
export interface CameraShareDetails {
  /** Whether the camera is shared */
  shared?: boolean
  /** Account ID of the sharing account */
  accountId?: string
  /** Whether shared for first responder access */
  firstResponder?: boolean
  /** Permissions granted to the share recipient */
  permissions?: string[]
}

/**
 * Stream URLs for camera media.
 *
 * @remarks
 * Contains URLs for accessing various camera stream formats.
 *
 * @category Cameras
 */
export interface CameraStreamUrls {
  /** HLS stream URL */
  hls?: string
  /** RTSP stream URL */
  rtsp?: string
  /** WebRTC stream URL */
  webrtc?: string
  /** JPEG snapshot URL */
  jpeg?: string
}

/**
 * RTSP connection settings for RTSP-based cameras.
 *
 * @remarks
 * Configuration for cameras that connect via RTSP protocol.
 *
 * @category Cameras
 */
export interface CameraRtspConnectionSettings {
  /** RTSP URL for the camera stream */
  url?: string
  /** Username for RTSP authentication */
  username?: string
  /** Password for RTSP authentication (write-only, not returned in responses) */
  password?: string
  /** Transport protocol (tcp, udp) */
  transport?: 'tcp' | 'udp'
}

/**
 * Camera position/location data.
 *
 * @remarks
 * Physical location and orientation of the camera.
 *
 * @category Cameras
 */
export interface CameraDevicePosition {
  /** Latitude coordinate */
  latitude?: number
  /** Longitude coordinate */
  longitude?: number
  /** Altitude in meters */
  altitude?: number
  /** Floor level */
  floor?: number
  /** Direction camera is facing (0-360 degrees) */
  azimuth?: number
}

/**
 * Recording modes for a camera.
 *
 * @remarks
 * Indicates which recording modes are enabled for the camera.
 *
 * @category Cameras
 */
export interface CameraRecordingModes {
  /** Whether continuous recording is enabled */
  continuous?: boolean
  /** Whether motion-triggered recording is enabled */
  motion?: boolean
  /** Whether scheduled recording is enabled */
  scheduled?: boolean
}

/**
 * Camera entity from EEN API v3.0.
 *
 * @remarks
 * Represents a camera in the Eagle Eye Networks platform. Cameras can be
 * connected via bridges or directly to the cloud. They have various
 * properties including status, device info, and stream URLs.
 *
 * For more details on camera management, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listcameras).
 *
 * @example
 * ```typescript
 * import { getCameras, type Camera } from 'een-api-toolkit'
 *
 * const { data, error } = await getCameras({ status__in: ['online'] })
 * if (data) {
 *   data.results.forEach((camera: Camera) => {
 *     console.log(`${camera.name}: ${camera.status}`)
 *   })
 * }
 * ```
 *
 * @category Cameras
 */
export interface Camera {
  /** Unique identifier for the camera */
  id: string
  /** Display name of the camera */
  name: string
  /** ID of the account this camera belongs to */
  accountId: string
  /** ID of the bridge this camera is connected to (null for direct-to-cloud) */
  bridgeId?: string | null
  /** ID of the location where the camera is installed */
  locationId?: string | null
  /** Globally unique identifier */
  guid?: string
  /** MAC address of the camera */
  macAddress?: string
  /** IP address of the camera on the local network */
  ipAddress?: string
  /** Timezone of the camera location (IANA timezone name) */
  timezone?: string
  /**
   * Current status of the camera.
   *
   * @remarks
   * The API may return status as either a string (`CameraStatus`) or an object
   * with a `connectionStatus` property, depending on the `include` parameters.
   *
   * Use the helper function to safely extract the status string:
   * ```typescript
   * function getStatusString(status?: CameraStatus | { connectionStatus?: CameraStatus }): CameraStatus | undefined {
   *   if (!status) return undefined
   *   if (typeof status === 'string') return status
   *   return status.connectionStatus
   * }
   * ```
   *
   * Or use optional chaining with type guards:
   * ```typescript
   * const statusValue = typeof camera.status === 'string'
   *   ? camera.status
   *   : camera.status?.connectionStatus
   * ```
   */
  status?: CameraStatus | { connectionStatus?: CameraStatus }
  /** Tags assigned to this camera for organization */
  tags?: string[]
  /** Feature packages enabled for this camera */
  packages?: string[]
  /** ID of multi-camera group if part of one */
  multiCameraId?: string | null
  /** ID of associated speaker device */
  speakerId?: string | null
  /** Device information (make, model, firmware) */
  deviceInfo?: CameraDeviceInfo
  /** Share details if camera is shared */
  shareDetails?: CameraShareDetails
  /** Stream URLs for accessing camera media */
  streamUrls?: CameraStreamUrls
  /** RTSP connection settings */
  rtspConnectionSettings?: CameraRtspConnectionSettings
  /** Physical position of the camera */
  devicePosition?: CameraDevicePosition
  /** List of enabled analytics on this camera */
  enabledAnalytics?: string[]
  /** Recording mode settings */
  recordingModes?: CameraRecordingModes
  /** ISO 8601 timestamp when the camera was created */
  createdAt?: string
  /** ISO 8601 timestamp when the camera was last updated */
  updatedAt?: string
}

/**
 * Parameters for listing cameras.
 *
 * @remarks
 * Supports extensive filtering options matching the EEN API v3.0.
 * All array parameters are sent as comma-separated values.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listcameras).
 *
 * @example
 * ```typescript
 * import { getCameras } from 'een-api-toolkit'
 *
 * // Get online cameras with pagination
 * const { data } = await getCameras({
 *   pageSize: 50,
 *   status__in: ['online', 'streaming'],
 *   include: ['deviceInfo', 'streamUrls']
 * })
 *
 * // Search cameras by name
 * const { data: searchResults } = await getCameras({
 *   q: 'front door',
 *   qRelevance__gte: 0.5
 * })
 *
 * // Filter by location and tags
 * const { data: filtered } = await getCameras({
 *   locationId__in: ['loc-123'],
 *   tags__contains: ['security', 'entrance']
 * })
 * ```
 *
 * @category Cameras
 */
export interface ListCamerasParams {
  // Pagination
  /** Number of results per page (default: 100, max: 1000) */
  pageSize?: number
  /** Token for fetching a specific page */
  pageToken?: string

  // Include/Sort
  /** Additional fields to include in the response */
  include?: string[]
  /** Fields to sort by (prefix with - for descending) */
  sort?: string[]

  // Location/Bridge filters
  /** Filter by location IDs */
  locationId__in?: string[]
  /** Filter by bridge IDs */
  bridgeId__in?: string[]

  // Multi-camera filters
  /** Filter by exact multi-camera ID */
  multiCameraId?: string
  /** Filter by multi-camera ID not equal to */
  multiCameraId__ne?: string
  /** Filter by multi-camera IDs (any match) */
  multiCameraId__in?: string[]

  // Tag/Package filters
  /** Filter by tags (all tags must be present) */
  tags__contains?: string[]
  /** Filter by tags (any tag must be present) */
  tags__any?: string[]
  /** Filter by packages (all must be present) */
  packages__contains?: string[]

  // Name filters
  /** Filter by exact name */
  name?: string
  /** Filter by name containing substring (case-insensitive) */
  name__contains?: string
  /** Filter by exact names (any match) */
  name__in?: string[]

  // ID filters
  /** Filter by camera IDs */
  id__in?: string[]
  /** Exclude camera IDs */
  id__notIn?: string[]
  /** Filter by ID containing substring */
  id__contains?: string

  // Layout filter
  /** Filter by layout ID */
  layoutId?: string

  // Share filters (nested field syntax in API: shareDetails.*)
  /** Filter by shared status. Maps to `shareDetails.shared` in the API query. */
  shared?: boolean
  /** Filter by sharing account ID. Maps to `shareDetails.accountId` in the API query. */
  sharedCameraAccount?: string
  /** Filter by first responder sharing. Maps to `shareDetails.firstResponder` in the API query. */
  firstResponder?: boolean

  // Device filters (nested field syntax in API: deviceInfo.*)
  /** Filter by direct-to-cloud connection. Maps to `deviceInfo.directToCloud` in the API query. */
  directToCloud?: boolean

  // Speaker filter
  /** Filter by speaker IDs */
  speakerId__in?: string[]

  // Search
  /** Full-text search query */
  q?: string
  /** Minimum search relevance score */
  qRelevance__gte?: number

  // Analytics filter
  /** Filter by enabled analytics (all must be present) */
  enabledAnalytics__contains?: string[]

  // Status filters
  /** Filter by status values (any match) */
  status__in?: CameraStatus[]
  /** Filter by status not equal to */
  status__ne?: CameraStatus
}

/**
 * Parameters for getting a single camera.
 *
 * @remarks
 * Valid include values: bridge, account, status, locationSummary, deviceAddress,
 * timeZone, notes, tags, devicePosition, networkInfo, deviceInfo, effectivePermissions,
 * firmware, shareDetails, visibleByBridges, capabilities, analog, packages,
 * dewarpConfig, adminCredentials, publicSafetySharing, enabledAnalytics
 *
 * @example
 * ```typescript
 * import { getCamera } from 'een-api-toolkit'
 *
 * const { data } = await getCamera('camera-123', {
 *   include: ['deviceInfo', 'status', 'shareDetails']
 * })
 * ```
 *
 * @category Cameras
 */
export interface GetCameraParams {
  /**
   * Additional fields to include in the response.
   * Valid values: bridge, account, status, locationSummary, deviceAddress,
   * timeZone, notes, tags, devicePosition, networkInfo, deviceInfo,
   * effectivePermissions, firmware, shareDetails, visibleByBridges,
   * capabilities, analog, packages, dewarpConfig, adminCredentials,
   * publicSafetySharing, enabledAnalytics
   */
  include?: string[]
}

/**
 * Valid include values for the camera settings endpoint.
 *
 * @remarks
 * - `schema` - Returns the JSON Schema describing all settings fields
 * - `proposedValues` - Returns proposed/recommended values for settings
 *
 * @category Cameras
 */
export type CameraSettingsInclude = 'schema' | 'proposedValues'

/**
 * Parameters for getting camera settings.
 *
 * @remarks
 * Controls what additional data is returned with camera settings.
 *
 * @example
 * ```typescript
 * import { getCameraSettings } from 'een-api-toolkit'
 *
 * const { data } = await getCameraSettings('camera-123', {
 *   include: ['schema', 'proposedValues']
 * })
 * ```
 *
 * @category Cameras
 */
export interface GetCameraSettingsParams {
  /** Additional data to include: 'schema' and/or 'proposedValues' */
  include?: CameraSettingsInclude[]
}

/**
 * Camera retention settings.
 *
 * @remarks
 * Controls how long video data is retained in cloud and on-premise storage.
 *
 * @category Cameras
 */
export interface CameraSettingsRetention {
  /** Number of days to retain recordings in cloud */
  cloudDays?: number
  /** Whether cloud stores only preview (lower resolution) video */
  cloudPreviewOnly?: boolean
  /** Minimum days to retain on the bridge */
  minimumOnPremiseDays?: number
  /** Maximum days to retain on the bridge */
  maximumOnPremiseDays?: number
  /** Number of days to always record (regardless of motion) */
  alwaysRecordingDays?: number
}

/**
 * Camera audio settings.
 *
 * @remarks
 * Controls microphone and audio input configuration.
 *
 * @category Cameras
 */
export interface CameraSettingsAudio {
  /** Whether the microphone is enabled */
  microphoneEnabled?: boolean
  /** Audio input source identifier */
  inputSourceId?: string
}

/**
 * Camera preview video settings.
 *
 * @remarks
 * Configuration for the lower-resolution preview stream.
 *
 * @category Cameras
 */
export interface CameraSettingsPreviewVideo {
  /** Transmit mode (e.g., "always", "event") */
  transmitMode?: string
  /** Resolution of the preview stream */
  resolution?: string
  /** Interval between preview frames in milliseconds */
  intervalMs?: number
  /** Quality setting for preview stream */
  quality?: string
  /** List of supported resolutions */
  supportedResolutions?: string[]
}

/**
 * Camera main video settings.
 *
 * @remarks
 * Configuration for the full-resolution main stream.
 *
 * @category Cameras
 */
export interface CameraSettingsMainVideo {
  /** Transmit mode (e.g., "always", "event") */
  transmitMode?: string
  /** Resolution of the main stream */
  resolution?: string
  /** Quality setting for main stream */
  quality?: string
  /** Bitrate factor in kbps */
  kbpsFactor?: number
  /** Capture mode */
  captureMode?: string
  /** List of supported resolutions */
  supportedResolutions?: string[]
}

/**
 * Camera analog video settings.
 *
 * @remarks
 * Settings specific to analog cameras connected via encoders.
 *
 * @category Cameras
 */
export interface CameraSettingsAnalog {
  /** Video standard (e.g., "NTSC", "PAL") */
  videoStandard?: string
  /** Whether bad signal protection is enabled */
  badSignalProtection?: boolean
  /** Whether a bad signal has been detected */
  badSignalDetected?: boolean
}

/**
 * Scheduled override for camera operating settings.
 *
 * @remarks
 * Allows the camera to be turned on/off on a schedule.
 *
 * @category Cameras
 */
export interface CameraSettingsScheduledOverride {
  /** Whether the scheduled override is active */
  on?: boolean
  /** Schedule definition */
  schedule?: string
}

/**
 * Camera operating settings.
 *
 * @remarks
 * Controls whether the camera is on or off, with optional scheduled overrides.
 *
 * @category Cameras
 */
export interface CameraSettingsOperating {
  /** Whether the camera is currently on */
  on?: boolean
  /** Optional scheduled override for on/off state */
  scheduledOverride?: CameraSettingsScheduledOverride | null
}

/**
 * Camera talkdown (two-way audio) settings.
 *
 * @remarks
 * Configuration for cameras with speaker/talkdown capability.
 *
 * @category Cameras
 */
export interface CameraSettingsTalkdown {
  /** Communication protocol for talkdown */
  protocol?: string
  /** Audio mode for talkdown */
  audioMode?: string
  /** SIP credentials for talkdown, if applicable */
  sipCredentials?: object
}

/**
 * Camera credentials settings.
 *
 * @remarks
 * Credentials used to authenticate with the camera device.
 *
 * @category Cameras
 */
export interface CameraSettingsCredentials {
  /** Username for camera authentication */
  username?: string
  /** Password for camera authentication (write-only, may not be returned) */
  password?: string
}

/**
 * Aggregated camera settings data.
 *
 * @remarks
 * Contains all operational settings for a camera, including retention,
 * audio, video, analog, operating, and talkdown settings.
 *
 * @example
 * ```typescript
 * import { getCameraSettings, type CameraSettingsData } from 'een-api-toolkit'
 *
 * const { data } = await getCameraSettings('camera-123')
 * if (data) {
 *   console.log('Timezone:', data.data.timeZone)
 *   console.log('Retention cloud days:', data.data.retention?.cloudDays)
 * }
 * ```
 *
 * @category Cameras
 */
export interface CameraSettingsData {
  /** Camera timezone (IANA timezone name) */
  timeZone?: string
  /** RTSP connection settings */
  rtsp?: CameraRtspConnectionSettings
  /** Camera device credentials */
  credentials?: CameraSettingsCredentials
  /** Retention settings */
  retention?: CameraSettingsRetention
  /** Audio settings */
  audio?: CameraSettingsAudio
  /** Preview video stream settings */
  previewVideo?: CameraSettingsPreviewVideo
  /** Main video stream settings */
  mainVideo?: CameraSettingsMainVideo
  /** Analog video settings */
  analog?: CameraSettingsAnalog
  /** Operating on/off settings */
  operatingSettings?: CameraSettingsOperating
  /** Talkdown (two-way audio) settings */
  talkdown?: CameraSettingsTalkdown
}

/**
 * Top-level camera settings response from EEN API v3.0.
 *
 * @remarks
 * The response wraps `CameraSettingsData` in a `data` property.
 * Optionally includes `schema` (JSON Schema) and `proposedValues`
 * when requested via the `include` query parameter.
 *
 * @example
 * ```typescript
 * import { getCameraSettings, type CameraSettings } from 'een-api-toolkit'
 *
 * const { data, error } = await getCameraSettings('camera-123', {
 *   include: ['schema', 'proposedValues']
 * })
 * if (data) {
 *   console.log('Settings:', data.data)
 *   console.log('Schema:', data.schema)
 *   console.log('Proposed values:', data.proposedValues)
 * }
 * ```
 *
 * @category Cameras
 */
export interface CameraSettings {
  /** The camera settings data */
  data: CameraSettingsData
  /** JSON Schema describing all settings fields (when include contains 'schema') */
  schema?: object
  /** Proposed/recommended values (when include contains 'proposedValues') */
  proposedValues?: object
}
