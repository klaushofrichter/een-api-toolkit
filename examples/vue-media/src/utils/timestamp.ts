/**
 * Shared timestamp utilities for vue-media example
 *
 * @remarks
 * These utilities handle timestamp conversion and formatting for the vue-media example app.
 * All functions that accept timestamp strings expect ISO 8601 format (e.g., "2025-12-30T07:57:37.000+00:00").
 *
 * **Timezone Behavior:**
 * - `toApiTimestamp`: Converts local datetime-local input to ISO 8601 with the browser's local timezone offset.
 *   The datetime-local HTML input provides values without timezone info, so we use the browser's timezone.
 * - `formatTimestampLocale`: Displays timestamps in the browser's locale and timezone.
 * - `formatTimestampDisplay`: Displays timestamps in local timezone with YYYY-MM-DD HH:mm:ss AM/PM format.
 * - `formatTimestampUtc`: Converts to UTC for API communication.
 *
 * @example
 * ```typescript
 * import { toApiTimestamp, formatTimestampDisplay } from '../utils/timestamp'
 *
 * // Convert datetime-local input to API format
 * const apiTs = toApiTimestamp('2025-12-30T07:57:37')
 * // Returns: "2025-12-30T07:57:37.000-08:00" (if browser is in PST)
 *
 * // Format for display
 * const display = formatTimestampDisplay('2025-12-30T15:57:37.000+00:00')
 * // Returns: "2025-12-30 07:57:37 AM" (if browser is in PST)
 * ```
 */

/**
 * Convert a datetime-local input value to EEN API timestamp format.
 *
 * @remarks
 * The HTML datetime-local input returns values like "2025-12-30T07:57:37" without timezone info.
 * This function interprets the value as local time and adds the browser's timezone offset.
 * The EEN API requires format: YYYY-MM-DDTHH:mm:ss.sss±HH:mm
 *
 * **Timezone Note:** The input is parsed as local time using `new Date(string)`.
 * The output includes the browser's current timezone offset, ensuring the API
 * receives the correct absolute time regardless of the user's timezone.
 *
 * @param dateTimeLocalValue - Value from datetime-local input (e.g., "2025-12-30T07:57:37")
 * @returns ISO 8601 timestamp with timezone offset (e.g., "2025-12-30T07:57:37.000-08:00")
 *
 * @example
 * ```typescript
 * const timestamp = toApiTimestamp('2025-12-30T07:57:37')
 * // In PST (-08:00): "2025-12-30T07:57:37.000-08:00"
 * // In EST (-05:00): "2025-12-30T07:57:37.000-05:00"
 * ```
 */
export function toApiTimestamp(dateTimeLocalValue: string): string {
  const date = new Date(dateTimeLocalValue)

  const offsetMinutes = date.getTimezoneOffset()
  const offsetSign = offsetMinutes <= 0 ? '+' : '-'
  const offsetHours = String(Math.floor(Math.abs(offsetMinutes) / 60)).padStart(2, '0')
  const offsetMins = String(Math.abs(offsetMinutes) % 60).padStart(2, '0')
  const offset = `${offsetSign}${offsetHours}:${offsetMins}`

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000${offset}`
}

/**
 * Format timestamp using locale string (browser default format).
 *
 * @remarks
 * Uses the browser's locale settings to format the timestamp.
 * The timestamp is converted to the browser's local timezone for display.
 *
 * @param timestamp - ISO 8601 timestamp string or null
 * @returns Locale-formatted string (e.g., "12/30/2025, 07:57:37 AM" in en-US) or "N/A" if null
 *
 * @example
 * ```typescript
 * formatTimestampLocale('2025-12-30T15:57:37.000+00:00')
 * // In en-US, PST: "12/30/2025, 07:57:37 AM"
 * ```
 */
export function formatTimestampLocale(timestamp: string | null): string {
  if (!timestamp) return 'N/A'
  try {
    return new Date(timestamp).toLocaleString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch {
    return timestamp
  }
}

/**
 * Format timestamp in YYYY-MM-DD HH:mm:ss AM/PM format.
 *
 * @remarks
 * Provides a consistent display format across all locales.
 * The timestamp is converted to the browser's local timezone.
 *
 * @param timestamp - ISO 8601 timestamp string or null
 * @returns Formatted string (e.g., "2025-12-30 07:57:37 AM") or "N/A" if null
 *
 * @example
 * ```typescript
 * formatTimestampDisplay('2025-12-30T15:57:37.000+00:00')
 * // In PST: "2025-12-30 07:57:37 AM"
 * ```
 */
export function formatTimestampDisplay(timestamp: string | null): string {
  if (!timestamp) return 'N/A'
  try {
    const date = new Date(timestamp)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    let hours = date.getHours()
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12
    if (hours === 0) hours = 12
    const hoursStr = String(hours).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hoursStr}:${minutes}:${seconds} ${ampm}`
  } catch {
    return timestamp
  }
}

/**
 * Format timestamp in EEN API format (UTC).
 *
 * @remarks
 * Converts the timestamp to UTC and formats it in the EEN API expected format.
 * Useful for displaying the exact timestamp that would be used in API calls.
 *
 * @param timestamp - ISO 8601 timestamp string or null
 * @returns UTC timestamp in EEN format (e.g., "2025-12-30T15:57:37.000+00:00") or "N/A" if null
 *
 * @example
 * ```typescript
 * formatTimestampUtc('2025-12-30T07:57:37.000-08:00')
 * // Returns: "2025-12-30T15:57:37.000+00:00"
 * ```
 */
export function formatTimestampUtc(timestamp: string | null): string {
  if (!timestamp) return 'N/A'
  try {
    return new Date(timestamp).toISOString().replace('Z', '+00:00')
  } catch {
    return timestamp
  }
}

/**
 * Format duration between two timestamps in human-readable format.
 *
 * @remarks
 * Calculates the difference between two timestamps and formats it as
 * "X minutes and Y seconds" or just "Y seconds" if under a minute.
 *
 * @param startTimestamp - Start time as ISO 8601 string or null
 * @param endTimestamp - End time as ISO 8601 string or null
 * @returns Human-readable duration (e.g., "5 minutes and 30 seconds") or "N/A" if invalid
 *
 * @example
 * ```typescript
 * formatDuration('2025-12-30T07:57:00.000+00:00', '2025-12-30T08:02:30.000+00:00')
 * // Returns: "5 minutes and 30 seconds"
 *
 * formatDuration('2025-12-30T07:57:00.000+00:00', '2025-12-30T07:57:45.000+00:00')
 * // Returns: "45 seconds"
 * ```
 */
export function formatDuration(startTimestamp: string | null, endTimestamp: string | null): string {
  if (!startTimestamp || !endTimestamp) return 'N/A'
  try {
    const start = new Date(startTimestamp).getTime()
    const end = new Date(endTimestamp).getTime()
    const durationMs = end - start
    const totalSeconds = Math.floor(durationMs / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    const minWord = minutes === 1 ? 'minute' : 'minutes'
    const secWord = seconds === 1 ? 'second' : 'seconds'
    if (minutes === 0) {
      return `${seconds} ${secWord}`
    }
    return `${minutes} ${minWord} and ${seconds} ${secWord}`
  } catch {
    return 'N/A'
  }
}

/**
 * Format time difference in human-readable format.
 *
 * @remarks
 * Converts a millisecond difference to a human-readable format.
 * Always uses absolute value, so the result is always positive.
 *
 * @param diffMs - Time difference in milliseconds (can be positive or negative)
 * @returns Human-readable duration (e.g., "5 minutes and 30 seconds")
 *
 * @example
 * ```typescript
 * formatTimeDiff(330000)  // 5.5 minutes
 * // Returns: "5 minutes and 30 seconds"
 *
 * formatTimeDiff(-45000)  // negative 45 seconds
 * // Returns: "45 seconds"
 * ```
 */
export function formatTimeDiff(diffMs: number): string {
  const totalSeconds = Math.floor(Math.abs(diffMs) / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const minWord = minutes === 1 ? 'minute' : 'minutes'
  const secWord = seconds === 1 ? 'second' : 'seconds'
  if (minutes === 0) {
    return `${seconds} ${secWord}`
  }
  return `${minutes} ${minWord} and ${seconds} ${secWord}`
}

/**
 * Format a Date to datetime-local input format.
 *
 * @remarks
 * Converts a Date object to the format required by HTML datetime-local inputs.
 * The output format is YYYY-MM-DDTHH:mm:ss (local time, no timezone info).
 * This is the inverse of what toApiTimestamp expects as input.
 *
 * @param date - Date object to format
 * @returns Formatted string in datetime-local format (e.g., "2025-12-30T07:57:37")
 *
 * @example
 * ```typescript
 * const now = new Date()
 * const formatted = formatDateTimeLocal(now)
 * // Returns: "2025-12-30T07:57:37" (in local timezone)
 *
 * // Use with datetime-local input
 * document.querySelector('input[type="datetime-local"]').value = formatted
 * ```
 */
export function formatDateTimeLocal(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}
