import { useAuthStore } from '../auth/store'
import { success, failure } from '../types'
import type { Result, PaginatedResult, User, UserProfile, ListUsersParams, GetUserParams } from '../types'
import { debug } from '../utils/debug'

/**
 * Get the current authenticated user's profile.
 *
 * @remarks
 * Fetches the profile of the currently authenticated user from `/api/v3.0/users/self`.
 * The result is also stored in the auth store for easy access via `useAuthStore().userProfile`.
 *
 * @returns A Result containing the user profile or an error
 *
 * @example
 * ```typescript
 * import { getCurrentUser } from 'een-api-toolkit'
 *
 * const { data, error } = await getCurrentUser()
 *
 * if (error) {
 *   if (error.code === 'AUTH_REQUIRED') {
 *     router.push('/login')
 *   }
 *   return
 * }
 *
 * console.log(`Welcome, ${data.firstName} ${data.lastName}`)
 * ```
 *
 * @category Users
 */
export async function getCurrentUser(): Promise<Result<UserProfile>> {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return failure('AUTH_REQUIRED', 'Authentication required')
  }

  if (!authStore.baseUrl) {
    return failure('AUTH_REQUIRED', 'Base URL not configured')
  }

  const url = `${authStore.baseUrl}/api/v3.0/users/self`
  debug('Fetching current user:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      }
    })

    if (!response.ok) {
      return handleErrorResponse(response)
    }

    const data = await response.json() as UserProfile
    debug('Current user fetched:', data.email)

    // Update profile in store
    authStore.setUserProfile(data)

    return success(data)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to fetch current user: ${String(err)}`)
  }
}

/**
 * List users with optional pagination and filtering.
 *
 * @remarks
 * Fetches a paginated list of users from `/api/v3.0/users`. Use the `pageSize`
 * parameter to control how many results are returned per page, and `pageToken`
 * to navigate to subsequent pages.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listusers).
 *
 * @param params - Optional pagination and filtering parameters
 * @returns A Result containing a paginated list of users or an error
 *
 * @example
 * ```typescript
 * import { getUsers } from 'een-api-toolkit'
 *
 * // Basic usage
 * const { data, error } = await getUsers()
 * if (data) {
 *   console.log(`Found ${data.results.length} users`)
 * }
 *
 * // With pagination
 * const { data } = await getUsers({ pageSize: 50 })
 * if (data?.nextPageToken) {
 *   const { data: page2 } = await getUsers({
 *     pageSize: 50,
 *     pageToken: data.nextPageToken
 *   })
 * }
 *
 * // Fetch all users
 * let allUsers: User[] = []
 * let pageToken: string | undefined
 * do {
 *   const { data, error } = await getUsers({ pageSize: 100, pageToken })
 *   if (error) break
 *   allUsers.push(...data.results)
 *   pageToken = data.nextPageToken
 * } while (pageToken)
 * ```
 *
 * @category Users
 */
export async function getUsers(params?: ListUsersParams): Promise<Result<PaginatedResult<User>>> {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return failure('AUTH_REQUIRED', 'Authentication required')
  }

  if (!authStore.baseUrl) {
    return failure('AUTH_REQUIRED', 'Base URL not configured')
  }

  const queryParams = new URLSearchParams()

  if (params?.pageSize) {
    queryParams.append('pageSize', String(params.pageSize))
  }
  if (params?.pageToken) {
    queryParams.append('pageToken', params.pageToken)
  }
  if (params?.include && params.include.length > 0) {
    queryParams.append('include', params.include.join(','))
  }

  const queryString = queryParams.toString()
  const url = `${authStore.baseUrl}/api/v3.0/users${queryString ? `?${queryString}` : ''}`
  debug('Fetching users:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      }
    })

    if (!response.ok) {
      return handleErrorResponse(response)
    }

    const data = await response.json() as PaginatedResult<User>
    debug('Users fetched:', data.results?.length ?? 0, 'users')

    return success(data)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to fetch users: ${String(err)}`)
  }
}

/**
 * Get a specific user by ID.
 *
 * @remarks
 * Fetches a single user from `/api/v3.0/users/{userId}`. Use the `include`
 * parameter to request additional fields like permissions.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/getuser).
 *
 * @param userId - The unique identifier of the user to fetch
 * @param params - Optional parameters (e.g., include additional fields)
 * @returns A Result containing the user or an error
 *
 * @example
 * ```typescript
 * import { getUser } from 'een-api-toolkit'
 *
 * const { data, error } = await getUser('user-123')
 *
 * if (error) {
 *   if (error.code === 'NOT_FOUND') {
 *     console.log('User not found')
 *   }
 *   return
 * }
 *
 * console.log(`User: ${data.firstName} ${data.lastName}`)
 *
 * // With permissions
 * const { data: userWithPerms } = await getUser('user-123', {
 *   include: ['permissions']
 * })
 * console.log('Permissions:', userWithPerms?.permissions)
 * ```
 *
 * @category Users
 */
export async function getUser(userId: string, params?: GetUserParams): Promise<Result<User>> {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return failure('AUTH_REQUIRED', 'Authentication required')
  }

  if (!authStore.baseUrl) {
    return failure('AUTH_REQUIRED', 'Base URL not configured')
  }

  if (!userId) {
    return failure('VALIDATION_ERROR', 'User ID is required')
  }

  const queryParams = new URLSearchParams()

  if (params?.include && params.include.length > 0) {
    queryParams.append('include', params.include.join(','))
  }

  const queryString = queryParams.toString()
  const url = `${authStore.baseUrl}/api/v3.0/users/${encodeURIComponent(userId)}${queryString ? `?${queryString}` : ''}`
  debug('Fetching user:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      }
    })

    if (!response.ok) {
      return handleErrorResponse(response)
    }

    const data = await response.json() as User
    debug('User fetched:', data.email)

    return success(data)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to fetch user: ${String(err)}`)
  }
}

/**
 * Handle error responses from the API.
 * @internal
 */
async function handleErrorResponse<T>(response: Response): Promise<Result<T>> {
  const status = response.status

  let message: string
  try {
    const errorData = await response.json()
    message = errorData.message ?? errorData.error ?? response.statusText
  } catch {
    message = response.statusText || 'Unknown error'
  }

  switch (status) {
    case 401:
      return failure('AUTH_REQUIRED', `Authentication failed: ${message}`, status)
    case 403:
      return failure('FORBIDDEN', `Access denied: ${message}`, status)
    case 404:
      return failure('NOT_FOUND', `Not found: ${message}`, status)
    case 429:
      return failure('RATE_LIMITED', `Rate limited: ${message}`, status)
    default:
      return failure('API_ERROR', `API error: ${message}`, status)
  }
}
