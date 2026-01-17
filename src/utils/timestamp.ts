/**
 * Convert ISO 8601 timestamp from Z format to +00:00 format.
 *
 * @remarks
 * The EEN API requires timestamps in +00:00 format, not Z format.
 * This function converts timestamps like `2024-01-01T00:00:00.000Z`
 * to `2024-01-01T00:00:00.000+00:00`.
 *
 * @param timestamp - ISO 8601 timestamp string
 * @returns Timestamp in +00:00 format
 *
 * @example
 * ```typescript
 * formatTimestamp('2024-01-01T00:00:00.000Z')
 * // Returns: '2024-01-01T00:00:00.000+00:00'
 *
 * formatTimestamp(new Date().toISOString())
 * // Returns: timestamp with +00:00 suffix
 * ```
 *
 * @category Utilities
 */
export function formatTimestamp(timestamp: string): string {
  // If already in +00:00 format, return as-is
  if (timestamp.endsWith('+00:00')) {
    return timestamp
  }
  // Convert Z to +00:00
  if (timestamp.endsWith('Z')) {
    return timestamp.replace('Z', '+00:00')
  }
  // Return original if format is not recognized
  return timestamp
}
