/**
 * Error codes returned by the toolkit.
 *
 * @remarks
 * All API functions return a {@link Result} type that contains either data or an error.
 * The error code helps you determine how to handle the failure.
 *
 * @category Types
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
  | 'SERVICE_UNAVAILABLE'
  | 'UNKNOWN_ERROR'

/**
 * Error object returned when an operation fails.
 *
 * @remarks
 * Contains structured error information including a machine-readable code,
 * human-readable message, and optional HTTP status code.
 *
 * @example
 * ```typescript
 * const { error } = await getUsers()
 * if (error) {
 *   console.error(`${error.code}: ${error.message}`)
 *   if (error.status === 401) {
 *     redirectToLogin()
 *   }
 * }
 * ```
 *
 * @category Types
 */
export interface EenError {
  /** Machine-readable error code for programmatic handling */
  code: ErrorCode
  /** Human-readable error message */
  message: string
  /** HTTP status code if the error came from an API response */
  status?: number
  /** Additional error details (varies by error type) */
  details?: unknown
}

/**
 * Result type for all API operations - functions never throw exceptions.
 *
 * @remarks
 * This is a discriminated union type. When `error` is `null`, `data` contains
 * the successful result. When `error` is not `null`, `data` is `null`.
 * TypeScript will narrow the type correctly after checking for errors.
 *
 * @example
 * ```typescript
 * const { data, error } = await getUsers()
 *
 * if (error) {
 *   // TypeScript knows: data is null, error is EenError
 *   console.error(error.message)
 *   return
 * }
 *
 * // TypeScript knows: data is not null, error is null
 * console.log(data.results)
 * ```
 *
 * @typeParam T - The type of the data on success
 * @category Types
 */
export type Result<T> =
  | { data: T; error: null }
  | { data: null; error: EenError }

/**
 * Pagination parameters for list operations.
 *
 * @remarks
 * Most list APIs in the EEN platform support pagination. Use `pageSize` to
 * control how many results are returned, and `pageToken` to fetch subsequent pages.
 *
 * @example
 * ```typescript
 * // First page
 * const { data } = await getUsers({ pageSize: 50 })
 *
 * // Next page (if available)
 * if (data.nextPageToken) {
 *   const { data: page2 } = await getUsers({
 *     pageSize: 50,
 *     pageToken: data.nextPageToken
 *   })
 * }
 * ```
 *
 * @category Types
 */
export interface PaginationParams {
  /** Number of results per page (default varies by endpoint, typically 100) */
  pageSize?: number
  /** Token for fetching a specific page (from previous response's nextPageToken) */
  pageToken?: string
}

/**
 * Paginated response from list operations.
 *
 * @remarks
 * Contains the results array and optional pagination tokens for navigating
 * through large result sets.
 *
 * @typeParam T - The type of items in the results array
 * @category Types
 */
export interface PaginatedResult<T> {
  /** Array of items for this page */
  results: T[]
  /** Token to fetch the next page (undefined if no more pages) */
  nextPageToken?: string
  /** Token to fetch the previous page (undefined if on first page) */
  prevPageToken?: string
  /** Total number of items across all pages (may not be provided by all endpoints) */
  totalSize?: number
}

/**
 * Storage strategy options for token persistence.
 *
 * @remarks
 * Different storage strategies offer different security/convenience tradeoffs:
 *
 * - **localStorage**: Tokens persist across browser sessions. Most convenient but
 *   vulnerable to XSS attacks since JavaScript can access localStorage.
 *
 * - **sessionStorage**: Tokens persist within a single tab session. Cleared when
 *   the tab is closed. Each tab has isolated storage, so opening a new tab
 *   requires re-authentication.
 *
 * - **memory**: Tokens are only kept in memory (Pinia store). Most secure as
 *   tokens are never written to disk, but any page refresh requires re-authentication.
 *
 * @category Configuration
 */
export type StorageStrategy = 'localStorage' | 'sessionStorage' | 'memory'

/**
 * Configuration for initializing the toolkit.
 *
 * @remarks
 * Pass this to {@link initEenToolkit} to configure the library. All options
 * can also be set via environment variables (VITE_PROXY_URL, VITE_EEN_CLIENT_ID,
 * VITE_REDIRECT_URI, VITE_DEBUG).
 *
 * @example
 * ```typescript
 * import { initEenToolkit } from 'een-api-toolkit'
 *
 * initEenToolkit({
 *   proxyUrl: 'https://your-proxy.workers.dev',
 *   clientId: 'your-een-client-id',
 *   redirectUri: 'http://localhost:5173/callback',
 *   storageStrategy: 'sessionStorage', // More secure than default
 *   debug: true
 * })
 * ```
 *
 * @category Configuration
 */
export interface EenToolkitConfig {
  /** URL of the OAuth proxy server (required for API calls) */
  proxyUrl?: string
  /** EEN OAuth client ID (required for authentication) */
  clientId?: string
  /** OAuth redirect URI (default: http://127.0.0.1:3333) */
  redirectUri?: string
  /**
   * Storage strategy for token persistence (default: 'localStorage').
   *
   * Security vs convenience tradeoffs:
   * - 'localStorage': Persists across sessions, vulnerable to XSS
   * - 'sessionStorage': Per-tab isolation, cleared on tab close
   * - 'memory': Most secure, lost on page refresh
   */
  storageStrategy?: StorageStrategy
  /** Enable debug logging to console */
  debug?: boolean
}

/**
 * Helper to create a success result.
 *
 * @param data - The successful result data
 * @returns A Result object with data and null error
 *
 * @internal
 */
export function success<T>(data: T): Result<T> {
  return { data, error: null }
}

/**
 * Helper to create an error result.
 *
 * @param code - The error code
 * @param message - Human-readable error message
 * @param status - Optional HTTP status code
 * @param details - Optional additional error details
 * @returns A Result object with null data and error
 *
 * @internal
 */
export function failure<T>(code: ErrorCode, message: string, status?: number, details?: unknown): Result<T> {
  return { data: null, error: { code, message, status, details } }
}
