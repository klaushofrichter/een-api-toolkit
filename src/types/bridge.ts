/**
 * Bridge status values from EEN API v3.0.
 *
 * @remarks
 * Indicates the current operational state of a bridge.
 *
 * @category Bridges
 */
export type BridgeStatus =
  | 'online'
  | 'offline'
  | 'error'
  | 'idle'
  | 'registered'
  | 'attaching'
  | 'initializing'

/**
 * Device information for a bridge.
 *
 * @remarks
 * Contains hardware and firmware details about the physical bridge device.
 *
 * @category Bridges
 */
export interface BridgeDeviceInfo {
  /** Bridge manufacturer */
  make?: string
  /** Bridge model */
  model?: string
  /** Firmware version */
  firmwareVersion?: string
  /** Serial number */
  serialNumber?: string
  /** Hardware version */
  hardwareVersion?: string
}

/**
 * Network information for a bridge.
 *
 * @remarks
 * Contains network connectivity details for the bridge.
 *
 * @category Bridges
 */
export interface BridgeNetworkInfo {
  /** Local IP address of the bridge */
  localIpAddress?: string
  /** Public IP address of the bridge */
  publicIpAddress?: string
  /** MAC address */
  macAddress?: string
  /** Subnet mask */
  subnetMask?: string
  /** Default gateway */
  gateway?: string
  /** DNS servers */
  dnsServers?: string[]
}

/**
 * Bridge position/location data.
 *
 * @remarks
 * Physical location of the bridge.
 *
 * @category Bridges
 */
export interface BridgeDevicePosition {
  /** Latitude coordinate */
  latitude?: number
  /** Longitude coordinate */
  longitude?: number
  /** Altitude in meters */
  altitude?: number
  /** Floor level */
  floor?: number
  /** Direction bridge is facing (0-360 degrees) */
  azimuth?: number
}

/**
 * Bridge entity from EEN API v3.0.
 *
 * @remarks
 * Represents a bridge in the Eagle Eye Networks platform. Bridges are
 * physical devices that connect cameras to the cloud. They aggregate
 * video streams from multiple cameras and provide network connectivity.
 *
 * For more details on bridge management, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listbridges).
 *
 * @example
 * ```typescript
 * import { getBridges, type Bridge } from 'een-api-toolkit'
 *
 * const { data, error } = await getBridges({ include: ['status'] })
 * if (data) {
 *   data.results.forEach((bridge: Bridge) => {
 *     console.log(`${bridge.name}: ${bridge.status}`)
 *   })
 * }
 * ```
 *
 * @category Bridges
 */
export interface Bridge {
  /** Unique identifier for the bridge */
  id: string
  /** Display name of the bridge */
  name: string
  /** ID of the account this bridge belongs to */
  accountId: string
  /** ID of the location where the bridge is installed */
  locationId?: string | null
  /** Globally unique identifier */
  guid?: string
  /** Timezone of the bridge location (IANA timezone name) */
  timezone?: string
  /**
   * Current status of the bridge.
   *
   * @remarks
   * The API may return status as either a string or an object
   * depending on the `include` parameters.
   */
  status?: BridgeStatus | { connectionStatus?: BridgeStatus }
  /** Tags assigned to this bridge for organization */
  tags?: string[]
  /** Device information (make, model, firmware) */
  deviceInfo?: BridgeDeviceInfo
  /** Network information (IP addresses, MAC) */
  networkInfo?: BridgeNetworkInfo
  /** Physical position of the bridge */
  devicePosition?: BridgeDevicePosition
  /** Number of cameras connected to this bridge */
  cameraCount?: number
  /** ISO 8601 timestamp when the bridge was created */
  createdAt?: string
  /** ISO 8601 timestamp when the bridge was last updated */
  updatedAt?: string
}

/**
 * Parameters for listing bridges.
 *
 * @remarks
 * Supports filtering options matching the EEN API v3.0.
 * All array parameters are sent as comma-separated values.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listbridges).
 *
 * @example
 * ```typescript
 * import { getBridges } from 'een-api-toolkit'
 *
 * // Get online bridges with pagination
 * const { data } = await getBridges({
 *   pageSize: 50,
 *   status__in: ['online'],
 *   include: ['deviceInfo', 'networkInfo']
 * })
 *
 * // Filter by location
 * const { data: filtered } = await getBridges({
 *   locationId__in: ['loc-123']
 * })
 * ```
 *
 * @category Bridges
 */
export interface ListBridgesParams {
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

  // Location filters
  /** Filter by location IDs */
  locationId__in?: string[]

  // Tag filters
  /** Filter by tags (all tags must be present) */
  tags__contains?: string[]
  /** Filter by tags (any tag must be present) */
  tags__any?: string[]

  // Name filters
  /** Filter by exact name */
  name?: string
  /** Filter by name containing substring (case-insensitive) */
  name__contains?: string
  /** Filter by exact names (any match) */
  name__in?: string[]

  // ID filters
  /** Filter by bridge IDs */
  id__in?: string[]
  /** Exclude bridge IDs */
  id__notIn?: string[]

  // Search
  /** Full-text search query */
  q?: string
  /** Minimum search relevance score */
  qRelevance__gte?: number

  // Status filters
  /** Filter by status values (any match) */
  status__in?: BridgeStatus[]
  /** Filter by status not equal to */
  status__ne?: BridgeStatus
}

/**
 * Parameters for getting a single bridge.
 *
 * @remarks
 * Valid include values: account, status, locationSummary, deviceAddress,
 * timeZone, notes, tags, devicePosition, networkInfo, deviceInfo,
 * effectivePermissions, firmware
 *
 * @example
 * ```typescript
 * import { getBridge } from 'een-api-toolkit'
 *
 * const { data } = await getBridge('bridge-123', {
 *   include: ['deviceInfo', 'status', 'networkInfo']
 * })
 * ```
 *
 * @category Bridges
 */
export interface GetBridgeParams {
  /**
   * Additional fields to include in the response.
   * Valid values: account, status, locationSummary, deviceAddress,
   * timeZone, notes, tags, devicePosition, networkInfo, deviceInfo,
   * effectivePermissions, firmware
   */
  include?: string[]
}
