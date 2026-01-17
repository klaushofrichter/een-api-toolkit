/**
 * Action taken for an alert.
 *
 * @remarks
 * Represents an action that was triggered by an alert, such as sending an email
 * notification or executing a webhook.
 *
 * @category Alerts
 */
export interface AlertAction {
  /** Name of the action */
  name: string
  /** Type of action (e.g., "email", "webhook", "push") */
  type: string
  /** Whether the action executed successfully */
  success: boolean
  /** ISO 8601 timestamp when the action was executed */
  timestamp: string
  /** Current status of the action */
  status?: AlertActionStatus
}

/**
 * Alert entity from EEN API v3.0.
 *
 * @remarks
 * Represents an alert in the Eagle Eye Networks platform. Alerts are generated
 * when events match configured rules and can trigger various actions like
 * notifications.
 *
 * For more details on alerts, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listalerts).
 *
 * @example
 * ```typescript
 * import { listAlerts, type Alert } from 'een-api-toolkit'
 *
 * const { data, error } = await listAlerts({
 *   actorId__in: ['100d4c41'],
 *   timestamp__gte: new Date(Date.now() - 3600000).toISOString()
 * })
 * if (data) {
 *   data.results.forEach((alert: Alert) => {
 *     console.log(`${alert.alertType} at ${alert.timestamp}`)
 *   })
 * }
 * ```
 *
 * @category Alerts
 */
export interface Alert {
  /** Unique identifier for the alert */
  id: string
  /** ISO 8601 timestamp when the alert was triggered */
  timestamp: string
  /** ISO 8601 timestamp when the alert was created in the system */
  createTimestamp: string
  /** ID of the entity that created the alert */
  creatorId: string
  /** Type of alert (e.g., "een.motionDetectionAlert.v1") */
  alertType: string
  /** Human-readable name of the alert */
  alertName?: string
  /** Category of the alert */
  category?: string
  /** ID of the service rule that triggered this alert */
  serviceRuleId?: string
  /** Event type that triggered this alert */
  eventType?: string
  /** ID of the actor (device/entity) that generated the alert */
  actorId: string
  /** Type of actor that generated the alert */
  actorType: string
  /** Account ID of the actor */
  actorAccountId: string
  /** Human-readable name of the actor */
  actorName?: string
  /** ID of the rule that triggered this alert */
  ruleId?: string
  /** ID of the event that triggered this alert */
  eventId?: string
  /** ID of the location associated with this alert */
  locationId?: string
  /** Human-readable name of the location */
  locationName?: string
  /** Priority level (0-20, where higher is more important) */
  priority?: number
  /** List of data schema types included in this alert */
  dataSchemas?: string[]
  /** Alert data objects (varies by alert type) */
  data?: Record<string, unknown>
  /** Actions executed for this alert */
  actions?: Record<string, AlertAction>
  /** Human-readable description of the alert */
  description?: string
}

/**
 * Alert type definition from EEN API v3.0.
 *
 * @remarks
 * Describes a type of alert available in the system. Used to understand
 * what alert types can be filtered for when listing alerts.
 *
 * @category Alerts
 */
export interface AlertType {
  /** Alert type identifier (e.g., "een.motionDetectionAlert.v1") */
  type: string
  /** Human-readable description of the alert type */
  description: string
}

/**
 * Fields that can be included in alert responses.
 *
 * @category Alerts
 */
export type AlertInclude = 'data' | 'actions' | 'dataSchemas' | 'description'

/**
 * Sort options for alert listing.
 *
 * @category Alerts
 */
export type AlertSort = '+timestamp' | '-timestamp'

/**
 * Status of an alert action.
 *
 * @category Alerts
 */
export type AlertActionStatus =
  | 'fired'
  | 'success'
  | 'partialSuccess'
  | 'silenced'
  | 'failed'
  | 'internalError'

/**
 * Parameters for listing alerts.
 *
 * @remarks
 * Supports filtering alerts by various criteria including time range, actor,
 * alert type, and more. Supports pagination and sorting.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listalerts).
 *
 * @example
 * ```typescript
 * import { listAlerts } from 'een-api-toolkit'
 *
 * // Get recent alerts from a specific camera
 * const { data } = await listAlerts({
 *   actorId__in: ['100d4c41'],
 *   timestamp__gte: new Date(Date.now() - 3600000).toISOString(),
 *   pageSize: 50,
 *   include: ['data', 'actions'],
 *   sort: ['-timestamp']
 * })
 *
 * // Fetch next page
 * if (data?.nextPageToken) {
 *   const { data: page2 } = await listAlerts({
 *     actorId__in: ['100d4c41'],
 *     timestamp__gte: new Date(Date.now() - 3600000).toISOString(),
 *     pageToken: data.nextPageToken
 *   })
 * }
 * ```
 *
 * @category Alerts
 */
export interface ListAlertsParams {
  // Pagination
  /** Number of results per page (default: 100) */
  pageSize?: number
  /** Token for fetching a specific page */
  pageToken?: string

  // Time filters
  /** ISO 8601 timestamp - alerts at or before this time */
  timestamp__lte?: string
  /** ISO 8601 timestamp - alerts at or after this time */
  timestamp__gte?: string

  // Entity filters
  /** Filter by creator ID */
  creatorId?: string
  /** Filter by alert types (e.g., ["een.motionDetectionAlert.v1"]) */
  alertType__in?: string[]
  /** Filter by actor IDs */
  actorId__in?: string[]
  /** Filter by actor types */
  actorType__in?: string[]
  /** Filter by actor account ID */
  actorAccountId?: string

  // Rule filters
  /** Filter by rule ID */
  ruleId?: string
  /** Filter by rule IDs */
  ruleId__in?: string[]

  // Event and location filters
  /** Filter by event ID */
  eventId?: string
  /** Filter by location IDs */
  locationId__in?: string[]

  // Priority filters
  /** Minimum priority level (inclusive) */
  priority__gte?: number
  /** Maximum priority level (inclusive) */
  priority__lte?: number

  // Other filters
  /** Include alerts that are invalid */
  showInvalidAlerts?: boolean
  /** Filter by alert action IDs */
  alertActionId__in?: string[]
  /** Filter by alert action statuses */
  alertActionStatus__in?: AlertActionStatus[]

  // Response options
  /** Fields to include in response */
  include?: AlertInclude[]
  /** Sort order for results */
  sort?: AlertSort[]
  /** Language code for localized descriptions */
  language?: string
}

/**
 * Parameters for getting a single alert by ID.
 *
 * @remarks
 * Supports including additional fields in the response.
 *
 * @example
 * ```typescript
 * import { getAlert } from 'een-api-toolkit'
 *
 * const { data } = await getAlert('alert-123', {
 *   include: ['data', 'actions', 'description']
 * })
 * ```
 *
 * @category Alerts
 */
export interface GetAlertParams {
  /** Fields to include in response */
  include?: AlertInclude[]
}

/**
 * Parameters for listing alert types.
 *
 * @remarks
 * Supports pagination for listing all available alert types.
 *
 * @example
 * ```typescript
 * import { listAlertTypes } from 'een-api-toolkit'
 *
 * const { data } = await listAlertTypes({ pageSize: 50 })
 * if (data) {
 *   data.results.forEach(alertType => {
 *     console.log(`${alertType.type}: ${alertType.description}`)
 *   })
 * }
 * ```
 *
 * @category Alerts
 */
export interface ListAlertTypesParams {
  /** Number of results per page */
  pageSize?: number
  /** Token for fetching a specific page */
  pageToken?: string
}
