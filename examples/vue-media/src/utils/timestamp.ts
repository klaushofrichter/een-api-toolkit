/**
 * Shared timestamp utilities for vue-media example
 */

/**
 * Convert a datetime-local input value to EEN API timestamp format.
 * The EEN API requires format like: 2025-12-30T07:57:37.000+00:00
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
 * Format timestamp using locale string (browser default format)
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
 * Format timestamp in YYYY-MM-DD HH:mm:ss AM/PM format
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
 * Format timestamp in EEN API format: YYYY-MM-DDTHH:mm:ss.sss+00:00
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
 * Format duration between two timestamps in human-readable format
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
 * Format time difference in human-readable format
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
