/**
 * Categories of notifications in the EEN platform.
 *
 * @category Notifications
 */
export type NotificationCategory =
  | 'health'
  | 'video'
  | 'operational'
  | 'audit'
  | 'job'
  | 'security'
  | 'sharing'

/**
 * Status of a notification delivery.
 *
 * @category Notifications
 */
export type NotificationStatus =
  | 'pending'
  | 'bounced'
  | 'dropped'
  | 'deferred'
  | 'delivered'
  | 'sent'
  | 'outsideUsersSchedule'
  | 'notificationsDisabled'
  | 'noNotificationActions'
  | 'sendingFailed'
  | 'throttled'
  | 'unableToGetSettings'

/**
 * Notification entity from EEN API v3.0.
 *
 * @remarks
 * Represents a notification in the Eagle Eye Networks platform. Notifications
 * are sent to users based on alerts and system events through various channels
 * like email, push notifications, etc.
 *
 * For more details on notifications, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listnotifications).
 *
 * @example
 * ```typescript
 * import { listNotifications, type Notification } from 'een-api-toolkit'
 *
 * const { data, error } = await listNotifications({
 *   actorId: '100d4c41',
 *   timestamp__gte: new Date(Date.now() - 3600000).toISOString()
 * })
 * if (data) {
 *   data.results.forEach((notification: Notification) => {
 *     console.log(`${notification.category}: ${notification.description}`)
 *   })
 * }
 * ```
 *
 * @category Notifications
 */
export interface Notification {
  /** Unique identifier for the notification */
  id: string
  /** ISO 8601 timestamp of the notification event */
  timestamp: string
  /** ISO 8601 timestamp when the notification was created in the system */
  createTimestamp: string
  /** ISO 8601 timestamp when the notification was sent */
  sentTimestamp?: string
  /** ID of the alert that triggered this notification (null if not alert-based) */
  alertId?: string | null
  /** Type of alert that triggered this notification */
  alertType?: string
  /** ID of the actor (device/entity) associated with this notification */
  actorId: string
  /** Human-readable name of the actor */
  actorName?: string
  /** Type of actor associated with this notification */
  actorType: string
  /** Account ID of the actor */
  actorAccountId: string
  /** ID of the user this notification was sent to */
  userId: string
  /** ID of the account this notification belongs to */
  accountId: string
  /** Whether the notification has been read by the user */
  read: boolean
  /** Current delivery status of the notification */
  status: NotificationStatus
  /** Category of the notification */
  category: NotificationCategory
  /** Human-readable description of the notification */
  description?: string
  /** Actions that were taken for this notification */
  notificationActions: string[]
  /** List of data schema types included in this notification */
  dataSchemas: string[]
  /** Notification data objects (varies by notification type) */
  data: Record<string, unknown>
}

/**
 * Parameters for listing notifications.
 *
 * @remarks
 * Supports filtering notifications by various criteria including time range,
 * actor, alert type, category, and more. Supports pagination and sorting.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listnotifications).
 *
 * @example
 * ```typescript
 * import { listNotifications } from 'een-api-toolkit'
 *
 * // Get recent notifications for a specific camera
 * const { data } = await listNotifications({
 *   actorId: '100d4c41',
 *   timestamp__gte: new Date(Date.now() - 3600000).toISOString(),
 *   pageSize: 50,
 *   sort: ['-timestamp']
 * })
 *
 * // Get unread notifications
 * const { data: unread } = await listNotifications({
 *   read: false,
 *   category: 'video'
 * })
 *
 * // Fetch next page
 * if (data?.nextPageToken) {
 *   const { data: page2 } = await listNotifications({
 *     actorId: '100d4c41',
 *     timestamp__gte: new Date(Date.now() - 3600000).toISOString(),
 *     pageToken: data.nextPageToken
 *   })
 * }
 * ```
 *
 * @category Notifications
 */
export interface ListNotificationsParams {
  // Pagination
  /** Number of results per page (default: 100) */
  pageSize?: number
  /** Token for fetching a specific page */
  pageToken?: string

  // Time filters
  /** ISO 8601 timestamp - notifications at or before this time */
  timestamp__lte?: string
  /** ISO 8601 timestamp - notifications at or after this time */
  timestamp__gte?: string

  // Entity filters
  /** Filter by alert ID */
  alertId?: string
  /** Filter by alert type */
  alertType?: string
  /** Filter by actor ID */
  actorId?: string
  /** Filter by actor type */
  actorType?: string
  /** Filter by actor account ID */
  actorAccountId?: string

  // Category and status filters
  /** Filter by notification category */
  category?: NotificationCategory
  /** Filter by user ID */
  userId?: string
  /** Filter by read status */
  read?: boolean
  /** Filter by delivery status */
  status?: NotificationStatus

  // Other options
  /** Include legacy v1 notifications */
  includeV1Notifications?: boolean

  // Response options
  /** Sort order for results */
  sort?: ('+timestamp' | '-timestamp')[]
  /** Language code for localized descriptions */
  language?: string
}
