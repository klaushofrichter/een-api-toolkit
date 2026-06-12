import { success, failure } from '../types'
import type {
  Result,
  PaginatedResult,
  Notification,
  ListNotificationsParams
} from '../types'
import { requireAuth, authHeaders, handleErrorResponse } from '../utils/api'
import { debug, formatTimestamp } from '../utils'

/**
 * List notifications with optional filters and pagination.
 *
 * @remarks
 * Fetches a paginated list of notifications from `/api/v3.0/notifications`. Supports
 * various filters including time range, actor, alert type, category, and more.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listnotifications).
 *
 * @param params - Optional filtering and pagination parameters
 * @returns A Result containing a paginated list of notifications or an error
 *
 * @example
 * ```typescript
 * import { listNotifications } from 'een-api-toolkit'
 *
 * // Get recent notifications for a specific camera
 * const { data, error } = await listNotifications({
 *   actorId: '100d4c41',
 *   timestamp__gte: new Date(Date.now() - 3600000).toISOString(),
 *   pageSize: 50
 * })
 *
 * if (data) {
 *   console.log(`Found ${data.results.length} notifications`)
 *   data.results.forEach(notification => {
 *     console.log(`${notification.category}: ${notification.description}`)
 *   })
 * }
 *
 * // Get unread notifications
 * const { data: unread } = await listNotifications({
 *   read: false,
 *   category: 'video'
 * })
 *
 * // Fetch all notifications with pagination
 * let allNotifications: Notification[] = []
 * let pageToken: string | undefined
 * do {
 *   const { data, error } = await listNotifications({
 *     timestamp__gte: new Date(Date.now() - 86400000).toISOString(),
 *     pageSize: 100,
 *     pageToken
 *   })
 *   if (error) break
 *   allNotifications.push(...data.results)
 *   pageToken = data.nextPageToken
 * } while (pageToken)
 * ```
 *
 * @category Notifications
 */
export async function listNotifications(params?: ListNotificationsParams): Promise<Result<PaginatedResult<Notification>>> {
  const auth = requireAuth()
  if (!auth.ok) return auth.result
  const { authStore, baseUrl } = auth

  const queryParams = new URLSearchParams()

  // Pagination
  if (params?.pageSize) {
    queryParams.append('pageSize', String(params.pageSize))
  }
  if (params?.pageToken) {
    queryParams.append('pageToken', params.pageToken)
  }

  // Time filters
  if (params?.timestamp__lte) {
    queryParams.append('timestamp__lte', formatTimestamp(params.timestamp__lte))
  }
  if (params?.timestamp__gte) {
    queryParams.append('timestamp__gte', formatTimestamp(params.timestamp__gte))
  }

  // Entity filters
  if (params?.alertId) {
    queryParams.append('alertId', params.alertId)
  }
  if (params?.alertType) {
    queryParams.append('alertType', params.alertType)
  }
  if (params?.actorId) {
    queryParams.append('actorId', params.actorId)
  }
  if (params?.actorType) {
    queryParams.append('actorType', params.actorType)
  }
  if (params?.actorAccountId) {
    queryParams.append('actorAccountId', params.actorAccountId)
  }

  // Category and status filters
  if (params?.category) {
    queryParams.append('category', params.category)
  }
  if (params?.userId) {
    queryParams.append('userId', params.userId)
  }
  if (params?.read !== undefined) {
    queryParams.append('read', String(params.read))
  }
  if (params?.status) {
    queryParams.append('status', params.status)
  }

  // Other options
  if (params?.includeV1Notifications !== undefined) {
    queryParams.append('includeV1Notifications', String(params.includeV1Notifications))
  }

  // Response options
  if (params?.sort && params.sort.length > 0) {
    queryParams.append('sort', params.sort.join(','))
  }
  if (params?.language) {
    queryParams.append('language', params.language)
  }

  const queryString = queryParams.toString()
  const url = `${baseUrl}/api/v3.0/notifications${queryString ? `?${queryString}` : ''}`
  debug('Fetching notifications:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: authHeaders(authStore.token)
    })

    if (!response.ok) {
      return handleErrorResponse(response)
    }

    const data = await response.json() as PaginatedResult<Notification>
    debug('Notifications fetched:', data.results?.length ?? 0, 'notifications')

    return success(data)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to fetch notifications: ${String(err)}`)
  }
}

/**
 * Get a specific notification by ID.
 *
 * @remarks
 * Fetches a single notification from `/api/v3.0/notifications/{notificationId}`.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/getnotification).
 *
 * @param notificationId - The unique identifier of the notification to fetch
 * @returns A Result containing the notification or an error
 *
 * @example
 * ```typescript
 * import { getNotification } from 'een-api-toolkit'
 *
 * const { data, error } = await getNotification('notification-123')
 *
 * if (error) {
 *   if (error.code === 'NOT_FOUND') {
 *     console.log('Notification not found')
 *   }
 *   return
 * }
 *
 * console.log(`Notification: ${data.category} - ${data.description}`)
 * console.log(`Read: ${data.read}`)
 * ```
 *
 * @category Notifications
 */
export async function getNotification(notificationId: string): Promise<Result<Notification>> {
  const auth = requireAuth()
  if (!auth.ok) return auth.result
  const { authStore, baseUrl } = auth

  if (!notificationId) {
    return failure('VALIDATION_ERROR', 'Notification ID is required')
  }

  const url = `${baseUrl}/api/v3.0/notifications/${encodeURIComponent(notificationId)}`
  debug('Fetching notification:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: authHeaders(authStore.token)
    })

    if (!response.ok) {
      return handleErrorResponse(response)
    }

    const data = await response.json() as Notification
    debug('Notification fetched:', data.id)

    return success(data)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to fetch notification: ${String(err)}`)
  }
}
