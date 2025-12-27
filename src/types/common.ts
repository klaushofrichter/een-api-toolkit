/**
 * Error codes returned by the toolkit
 */
export type ErrorCode =
  | 'AUTH_REQUIRED'
  | 'AUTH_FAILED'
  | 'TOKEN_EXPIRED'
  | 'API_ERROR'
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'FORBIDDEN'
  | 'RATE_LIMITED'
  | 'UNKNOWN_ERROR'

/**
 * Error object returned when an operation fails
 */
export interface EenError {
  code: ErrorCode
  message: string
  status?: number
  details?: unknown
}

/**
 * Result type for all API operations - never throws
 */
export type Result<T> =
  | { data: T; error: null }
  | { data: null; error: EenError }

/**
 * Pagination parameters for list operations
 */
export interface PaginationParams {
  pageSize?: number
  pageToken?: string
}

/**
 * Paginated response from list operations
 */
export interface PaginatedResult<T> {
  results: T[]
  nextPageToken?: string
  prevPageToken?: string
  totalSize?: number
}

/**
 * Configuration for initializing the toolkit
 */
export interface EenToolkitConfig {
  proxyUrl?: string
  clientId?: string
  debug?: boolean
}

/**
 * Helper to create a success result
 */
export function success<T>(data: T): Result<T> {
  return { data, error: null }
}

/**
 * Helper to create an error result
 */
export function failure<T>(code: ErrorCode, message: string, status?: number, details?: unknown): Result<T> {
  return { data: null, error: { code, message, status, details } }
}
