/**
 * Camera status counts for layout resource summaries.
 *
 * @remarks
 * Used in resourceStatusCounts to show aggregated camera statuses.
 *
 * @category Layouts
 */
export interface CameraStatusCounts {
  /** Number of online cameras */
  online?: number
  /** Number of offline cameras */
  offline?: number
  /** Number of cameras in error state */
  error?: number
  /** Number of cameras with other statuses */
  other?: number
}

/**
 * Permissions for layout operations.
 *
 * @remarks
 * Indicates what actions the current user can perform on a layout.
 *
 * @category Layouts
 */
export interface LayoutPermissions {
  /** Whether the user can read the layout */
  read?: boolean
  /** Whether the user can edit the layout */
  edit?: boolean
  /** Whether the user can delete the layout */
  delete?: boolean
}

/**
 * Layout pane type values.
 *
 * @remarks
 * Defines how the pane displays camera content.
 *
 * @category Layouts
 */
export type LayoutPaneType = 'preview' | 'compositePreview'

/**
 * Layout pane size values.
 *
 * @remarks
 * Controls how much space the pane takes in the grid.
 * - 1: Normal size (1x1)
 * - 2: Medium size (2x2)
 * - 3: Large size (3x3)
 *
 * @category Layouts
 */
export type LayoutPaneSize = 1 | 2 | 3

/**
 * Camera aspect ratio values for layout settings.
 *
 * @category Layouts
 */
export type CameraAspectRatio = '16x9' | '4x3'

/**
 * A single pane within a layout.
 *
 * @remarks
 * Represents one camera view position in the layout grid.
 *
 * @category Layouts
 */
export interface LayoutPane {
  /** Unique identifier for the pane within the layout */
  id: number
  /** Display name for the pane */
  name: string
  /** Type of preview to display */
  type: LayoutPaneType
  /** Size of the pane in the grid (1-3) */
  size: LayoutPaneSize
  /** ID of the camera to display in this pane */
  cameraId: string
  /** ID of composite preview if using compositePreview type */
  compositeId?: string | null
}

/**
 * Layout display settings.
 *
 * @remarks
 * Controls how cameras are displayed within the layout.
 *
 * @category Layouts
 */
export interface LayoutSettings {
  /** Whether to show borders around camera panes */
  showCameraBorder: boolean
  /** Whether to show camera names as overlays */
  showCameraName: boolean
  /** Aspect ratio for camera displays */
  cameraAspectRatio: CameraAspectRatio
  /** Number of columns in the layout grid (1-6) */
  paneColumns: number
}

/**
 * Layout entity from EEN API v3.0.
 *
 * @remarks
 * Represents a layout (grouping of cameras) in the Eagle Eye Networks platform.
 * Layouts organize multiple camera views into a grid for monitoring.
 *
 * For more details on layout management, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listlayouts).
 *
 * @example
 * ```typescript
 * import { getLayouts, type Layout } from 'een-api-toolkit'
 *
 * const { data, error } = await getLayouts()
 * if (data) {
 *   data.results.forEach((layout: Layout) => {
 *     console.log(`${layout.name}: ${layout.panes.length} cameras`)
 *   })
 * }
 * ```
 *
 * @category Layouts
 */
export interface Layout {
  /** Unique identifier for the layout */
  id: string
  /** Display name of the layout */
  name: string
  /** ID of the account this layout belongs to */
  accountId: string
  /** Array of panes (camera positions) in the layout */
  panes: LayoutPane[]
  /** Display settings for the layout */
  settings: LayoutSettings
  /** Permissions the current user has on this layout (optional, via include) */
  effectivePermissions?: LayoutPermissions
  /** Count of resources in the layout (optional, via include) */
  resourceCounts?: {
    cameras?: number
  }
  /** Status counts of cameras in the layout (optional, via include) */
  resourceStatusCounts?: {
    cameras?: CameraStatusCounts
  }
  /** Search relevance score when using q parameter */
  qRelevance?: number
}

/**
 * Valid include options for listing layouts.
 *
 * @category Layouts
 */
export type ListLayoutsInclude =
  | 'effectivePermissions'
  | 'resourceCounts'
  | 'resourceStatusCounts'
  | 'qRelevance'

/**
 * Valid sort options for listing layouts.
 *
 * @category Layouts
 */
export type ListLayoutsSort =
  | '+name'
  | '-name'
  | '+rotationOrder'
  | '+qRelevance'
  | '-qRelevance'

/**
 * Parameters for listing layouts.
 *
 * @remarks
 * Supports extensive filtering options matching the EEN API v3.0.
 * All array parameters are sent as comma-separated values.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listlayouts).
 *
 * @example
 * ```typescript
 * import { getLayouts } from 'een-api-toolkit'
 *
 * // Get layouts with pagination
 * const { data } = await getLayouts({
 *   pageSize: 50,
 *   include: ['resourceCounts', 'effectivePermissions']
 * })
 *
 * // Search layouts by name
 * const { data: searchResults } = await getLayouts({
 *   q: 'lobby',
 *   qRelevance__gte: 0.5
 * })
 *
 * // Filter by name
 * const { data: filtered } = await getLayouts({
 *   name__contains: 'entrance'
 * })
 * ```
 *
 * @category Layouts
 */
export interface ListLayoutsParams {
  // Pagination
  /** Number of results per page (default: 100, max: 1000) */
  pageSize?: number
  /** Token for fetching a specific page */
  pageToken?: string

  // Include/Sort
  /** Additional fields to include in the response */
  include?: ListLayoutsInclude[]
  /** Fields to sort by (prefix with - for descending, + for ascending) */
  sort?: ListLayoutsSort[]

  // Name filters
  /** Filter by exact name */
  name?: string
  /** Filter by names (any match) */
  name__in?: string[]
  /** Filter by name containing substring (case-insensitive) */
  name__contains?: string

  // ID filters
  /** Filter by layout IDs */
  id__in?: string[]

  // Bridge filter (filter layouts containing cameras on a specific bridge)
  /** Filter by bridge ID of cameras in layout panes */
  'layoutPanes.cameras.bridgeId'?: string

  // Search
  /** Full-text search query */
  q?: string
  /** Minimum search relevance score (0.0 to 1.0) */
  qRelevance__gte?: number
}

/**
 * Valid include options for getting a single layout.
 *
 * @category Layouts
 */
export type GetLayoutInclude =
  | 'effectivePermissions'
  | 'resourceCounts'
  | 'resourceStatusCounts'

/**
 * Parameters for getting a single layout.
 *
 * @remarks
 * Controls which additional fields to include in the response.
 *
 * @example
 * ```typescript
 * import { getLayout } from 'een-api-toolkit'
 *
 * const { data } = await getLayout('layout-123', {
 *   include: ['effectivePermissions', 'resourceStatusCounts']
 * })
 * ```
 *
 * @category Layouts
 */
export interface GetLayoutParams {
  /** Additional fields to include in the response */
  include?: GetLayoutInclude[]
}

/**
 * Parameters for creating a new layout.
 *
 * @remarks
 * Name and settings are required. Panes can be added during creation
 * or later via update.
 *
 * @example
 * ```typescript
 * import { createLayout } from 'een-api-toolkit'
 *
 * const { data, error } = await createLayout({
 *   name: 'Main Lobby View',
 *   settings: {
 *     showCameraBorder: true,
 *     showCameraName: true,
 *     cameraAspectRatio: '16x9',
 *     paneColumns: 3
 *   },
 *   panes: [
 *     { id: 1, name: 'Entrance', type: 'preview', size: 1, cameraId: 'cam-123' },
 *     { id: 2, name: 'Lobby', type: 'preview', size: 2, cameraId: 'cam-456' }
 *   ]
 * })
 * ```
 *
 * @category Layouts
 */
export interface CreateLayoutParams {
  /** Display name for the layout (required) */
  name: string
  /** Display settings for the layout (required) */
  settings: LayoutSettings
  /** Initial panes to add to the layout (optional) */
  panes?: LayoutPane[]
}

/**
 * Parameters for updating an existing layout.
 *
 * @remarks
 * All fields are optional. Only provided fields will be updated.
 * For settings, you can provide partial updates.
 *
 * @example
 * ```typescript
 * import { updateLayout } from 'een-api-toolkit'
 *
 * // Update name only
 * const { error } = await updateLayout('layout-123', {
 *   name: 'Updated Layout Name'
 * })
 *
 * // Update settings
 * const { error } = await updateLayout('layout-123', {
 *   settings: {
 *     paneColumns: 4,
 *     showCameraName: false
 *   }
 * })
 *
 * // Replace panes
 * const { error } = await updateLayout('layout-123', {
 *   panes: [
 *     { id: 1, name: 'New Pane', type: 'preview', size: 1, cameraId: 'cam-789' }
 *   ]
 * })
 * ```
 *
 * @category Layouts
 */
export interface UpdateLayoutParams {
  /** New display name for the layout */
  name?: string
  /** Updated display settings (partial update supported) */
  settings?: Partial<LayoutSettings>
  /** New panes array (replaces existing panes) */
  panes?: LayoutPane[]
}
