/**
 * Camera utility functions for working with camera data.
 *
 * @module utils/camera
 */

import type { CameraStatus } from '../types/camera.js'

/**
 * Extract the status string from a Camera's status field.
 *
 * @remarks
 * The EEN API may return camera status as either:
 * - A string directly: `"online"`
 * - An object with connectionStatus: `{ connectionStatus: "online" }`
 *
 * This depends on the `include` parameters used in the API request.
 * This utility safely extracts the status string from either format.
 *
 * @param status - The camera status field value
 * @returns The status string, or undefined if no status is present
 *
 * @example
 * ```typescript
 * import { getCameraStatusString, type Camera } from 'een-api-toolkit'
 *
 * function displayCameraStatus(camera: Camera) {
 *   const status = getCameraStatusString(camera.status)
 *   console.log(`Camera ${camera.name} is ${status || 'unknown'}`)
 * }
 * ```
 *
 * @category Utilities
 */
export function getCameraStatusString(
  status?: CameraStatus | { connectionStatus?: CameraStatus }
): CameraStatus | undefined {
  if (!status) return undefined
  if (typeof status === 'string') return status
  return status.connectionStatus
}

/**
 * TypeScript type guard to check if a status value is an object with connectionStatus.
 *
 * @remarks
 * Use this type guard to help TypeScript narrow the camera status type when
 * you need to handle both string and object formats differently.
 *
 * **Implementation Note:** This function returns true for ANY non-null object to match
 * the EEN API's flexible response format. The API may return different object structures
 * depending on the `include` parameters, so we intentionally use a broad check rather than
 * validating specific properties like `'connectionStatus' in status`.
 *
 * @param status - The camera status field value
 * @returns True if status is an object (not a string), false otherwise
 *
 * @example
 * ```typescript
 * import { isStatusObject, type Camera } from 'een-api-toolkit'
 *
 * function processCameraStatus(camera: Camera) {
 *   if (isStatusObject(camera.status)) {
 *     // TypeScript knows camera.status is { connectionStatus?: CameraStatus }
 *     console.log('Status object:', camera.status.connectionStatus)
 *   } else {
 *     // TypeScript knows camera.status is CameraStatus | undefined
 *     console.log('Status string:', camera.status)
 *   }
 * }
 * ```
 *
 * @category Utilities
 */
export function isStatusObject(
  status?: CameraStatus | { connectionStatus?: CameraStatus }
): status is { connectionStatus?: CameraStatus } {
  return typeof status === 'object' && status !== null
}
