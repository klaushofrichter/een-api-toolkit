/**
 * User entity from EEN API v3.0.
 *
 * @remarks
 * Represents a user in the Eagle Eye Networks platform. Users belong to accounts
 * and have various permissions that control their access to cameras and features.
 *
 * For more details on user management, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/getusers).
 *
 * @category Users
 */
export interface User {
  /** Unique identifier for the user */
  id: string
  /** User's email address (used for login) */
  email: string
  /** User's first name */
  firstName: string
  /** User's last name */
  lastName: string
  /** ID of the account this user belongs to */
  accountId?: string
  /** User's timezone (IANA timezone name, e.g., "America/Los_Angeles") */
  timeZone?: string
  /** User's preferred language (ISO 639-1 code, e.g., "en") */
  language?: string
  /** User's phone number */
  phone?: string
  /** User's mobile phone number */
  mobilePhone?: string
  /** List of permission strings assigned to this user */
  permissions?: string[]
  /** ISO 8601 timestamp of the user's last login */
  lastLogin?: string
  /** Whether the user account is active */
  isActive?: boolean
  /** ISO 8601 timestamp when the user was created */
  createdAt?: string
  /** ISO 8601 timestamp when the user was last updated */
  updatedAt?: string
}

/**
 * Current authenticated user profile.
 *
 * @remarks
 * A subset of user information returned for the currently authenticated user.
 * This is returned by {@link getCurrentUser} and stored in the auth store.
 *
 * @category Users
 */
export interface UserProfile {
  /** Unique identifier for the user */
  id: string
  /** User's email address */
  email: string
  /** User's first name */
  firstName: string
  /** User's last name */
  lastName: string
  /** ID of the account this user belongs to */
  accountId?: string
  /** User's timezone */
  timeZone?: string
  /** User's preferred language */
  language?: string
}

/**
 * Parameters for listing users.
 *
 * @remarks
 * Extends basic pagination with user-specific options like the `include`
 * parameter for requesting additional user data.
 *
 * @example
 * ```typescript
 * // Get users with permissions included
 * const { data } = await getUsers({
 *   pageSize: 50,
 *   include: ['permissions']
 * })
 * ```
 *
 * @category Users
 */
export interface ListUsersParams {
  /** Number of results per page (default: 100, max: 1000) */
  pageSize?: number
  /** Token for fetching a specific page */
  pageToken?: string
  /** Additional fields to include in the response (e.g., ['permissions']) */
  include?: string[]
}

/**
 * Parameters for getting a single user.
 *
 * @example
 * ```typescript
 * const { data } = await getUser('user-id', {
 *   include: ['permissions']
 * })
 * ```
 *
 * @category Users
 */
export interface GetUserParams {
  /** Additional fields to include in the response */
  include?: string[]
}
