/**
 * User entity from EEN API v3.0
 */
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  accountId?: string
  timeZone?: string
  language?: string
  phone?: string
  mobilePhone?: string
  permissions?: string[]
  lastLogin?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

/**
 * Current authenticated user profile
 */
export interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  accountId?: string
  timeZone?: string
  language?: string
}

/**
 * Parameters for listing users
 */
export interface ListUsersParams {
  pageSize?: number
  pageToken?: string
  include?: string[]
}

/**
 * Parameters for getting a single user
 */
export interface GetUserParams {
  include?: string[]
}
