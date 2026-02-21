/**
 * Pan/Tilt/Zoom position coordinates for movement commands.
 *
 * @remarks
 * Used when specifying target positions in movement commands.
 * Values are optional since you may want to move only one axis at a time.
 *
 * @category PTZ
 */
export interface PtzPosition {
  /** Pan position (horizontal rotation) */
  x?: number
  /** Tilt position (vertical rotation) */
  y?: number
  /** Zoom level */
  z?: number
}

/**
 * PTZ position as returned by the API (all fields present).
 *
 * @remarks
 * When reading the current camera position via `getPtzPosition()`, the API
 * always returns all three coordinates. This type extends `PtzPosition` with
 * required fields for type safety at response sites.
 *
 * @category PTZ
 */
export interface PtzPositionResponse {
  /** Pan position (horizontal rotation) */
  x: number
  /** Tilt position (vertical rotation) */
  y: number
  /** Zoom level */
  z: number
}

/**
 * Types of PTZ movement commands.
 *
 * @remarks
 * - `position` - Move to absolute coordinates (x, y, z)
 * - `direction` - Move in relative directions (up, down, left, right, in, out)
 * - `centerOn` - Center the camera view on a point in the current frame
 *
 * @category PTZ
 */
export type PtzMoveType = 'position' | 'direction' | 'centerOn'

/**
 * Directional movement options for PTZ cameras.
 *
 * @category PTZ
 */
export type PtzDirection = 'up' | 'down' | 'left' | 'right' | 'in' | 'out'

/**
 * Step size for directional movements.
 *
 * @category PTZ
 */
export type PtzStepSize = 'small' | 'medium' | 'large'

/**
 * Move to absolute PTZ coordinates.
 *
 * @remarks
 * Moves the camera to specific x, y, z position values.
 * At least one coordinate (x, y, or z) should be provided for a meaningful move.
 *
 * @example
 * ```typescript
 * const move: PtzPositionMove = {
 *   moveType: 'position',
 *   x: 0.5,
 *   y: -0.3,
 *   z: 2.0
 * }
 * ```
 *
 * @category PTZ
 */
export interface PtzPositionMove {
  /** Must be 'position' */
  moveType: 'position'
  /** Target pan position */
  x?: number
  /** Target tilt position */
  y?: number
  /** Target zoom level */
  z?: number
}

/**
 * Move in a relative direction with optional step size.
 *
 * @remarks
 * Moves the camera in one or more directions relative to its current position.
 * Multiple directions can be combined (e.g., up + left for diagonal movement).
 *
 * @example
 * ```typescript
 * const move: PtzDirectionMove = {
 *   moveType: 'direction',
 *   direction: ['up', 'left'],
 *   stepSize: 'medium'
 * }
 * ```
 *
 * @category PTZ
 */
export interface PtzDirectionMove {
  /** Must be 'direction' */
  moveType: 'direction'
  /** One or more directions to move */
  direction: PtzDirection[]
  /** Size of each movement step (default: medium) */
  stepSize?: PtzStepSize
}

/**
 * Center the camera on a point in the current frame.
 *
 * @remarks
 * Uses relative coordinates within the current video frame
 * to center the camera on a specific point. Useful for click-to-center
 * functionality in video players.
 * Both `relativeX` and `relativeY` must be in the range 0.0 to 1.0,
 * where (0.0, 0.0) is the top-left corner and (1.0, 1.0) is the bottom-right.
 *
 * @example
 * ```typescript
 * // Center on the middle-right area of the frame
 * const move: PtzCenterOnMove = {
 *   moveType: 'centerOn',
 *   relativeX: 0.75,
 *   relativeY: 0.5
 * }
 * ```
 *
 * @category PTZ
 */
export interface PtzCenterOnMove {
  /** Must be 'centerOn' */
  moveType: 'centerOn'
  /** Horizontal position in frame (0.0 = left, 1.0 = right) */
  relativeX: number
  /** Vertical position in frame (0.0 = top, 1.0 = bottom) */
  relativeY: number
}

/**
 * Discriminated union of all PTZ move types.
 *
 * @remarks
 * Use the `moveType` field to discriminate between the three movement types.
 *
 * @example
 * ```typescript
 * import { movePtz, type PtzMove } from 'een-api-toolkit'
 *
 * // Position move
 * await movePtz('camera-id', { moveType: 'position', x: 0.5, y: 0.0, z: 1.0 })
 *
 * // Direction move
 * await movePtz('camera-id', { moveType: 'direction', direction: ['left'], stepSize: 'small' })
 *
 * // Center-on move
 * await movePtz('camera-id', { moveType: 'centerOn', relativeX: 0.5, relativeY: 0.5 })
 * ```
 *
 * @category PTZ
 */
export type PtzMove = PtzPositionMove | PtzDirectionMove | PtzCenterOnMove

/**
 * A saved PTZ preset position.
 *
 * @remarks
 * Presets allow quick navigation to saved camera positions.
 *
 * @category PTZ
 */
export interface PtzPreset {
  /** Human-readable name for this preset */
  name: string
  /** The saved position coordinates (always has x, y, z from the API) */
  position: PtzPositionResponse
  /** Time the camera stays at this preset (in seconds) during tour mode */
  timeAtPreset: number
}

/**
 * PTZ automation mode.
 *
 * @remarks
 * - `homeReturn` - Camera returns to the home preset after a period of inactivity
 * - `tour` - Camera cycles through presets automatically
 * - `manualOnly` - No automatic movement; camera stays where positioned
 *
 * @category PTZ
 */
export type PtzMode = 'homeReturn' | 'tour' | 'manualOnly'

/**
 * PTZ camera settings including presets and automation mode.
 *
 * @remarks
 * Contains the full PTZ configuration for a camera: saved presets,
 * the designated home preset, automation mode, and auto-start delay.
 *
 * @example
 * ```typescript
 * import { getPtzSettings } from 'een-api-toolkit'
 *
 * const { data, error } = await getPtzSettings('camera-id')
 * if (data) {
 *   console.log('Mode:', data.mode)
 *   console.log('Presets:', data.presets.map(p => p.name))
 *   console.log('Home preset:', data.homePreset)
 * }
 * ```
 *
 * @category PTZ
 */
export interface PtzSettings {
  /** Array of saved preset positions */
  presets: PtzPreset[]
  /** Name of the home preset, or null if none is set */
  homePreset: string | null
  /** Automation mode controlling automatic camera movement */
  mode: PtzMode
  /** Seconds of inactivity before automatic movement begins */
  autoStartDelay: number
}

/**
 * Parameters for updating PTZ settings (all fields optional).
 *
 * @remarks
 * Used with `updatePtzSettings()` to partially update PTZ configuration.
 * Only provided fields are updated; omitted fields retain their current values.
 *
 * @example
 * ```typescript
 * import { updatePtzSettings } from 'een-api-toolkit'
 *
 * // Change mode only
 * await updatePtzSettings('camera-id', { mode: 'tour' })
 *
 * // Update presets and home preset
 * await updatePtzSettings('camera-id', {
 *   presets: [{ name: 'Entrance', position: { x: 0, y: 0, z: 1 }, timeAtPreset: 10 }],
 *   homePreset: 'Entrance'
 * })
 * ```
 *
 * @category PTZ
 */
export interface PtzSettingsUpdate {
  /** Updated array of preset positions */
  presets?: PtzPreset[]
  /** Updated home preset name */
  homePreset?: string | null
  /** Updated automation mode */
  mode?: PtzMode
  /** Updated auto-start delay in seconds */
  autoStartDelay?: number
}
