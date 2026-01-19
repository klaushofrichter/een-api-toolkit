/**
 * Subscription lifecycle type.
 *
 * @remarks
 * - `temporary`: Removed when deleted or when no client uses it for timeToLiveSeconds
 * - `persistent`: Remains active indefinitely until explicitly deleted
 *
 * @category EventSubscriptions
 */
export type EventSubscriptionLifecycle = 'temporary' | 'persistent'

/**
 * Delivery type for event subscriptions.
 *
 * @remarks
 * - `serverSentEvents.v1`: Connect via SSE to receive events in real-time
 * - `webhook.v1`: Events are pushed to a client-provided URL
 *
 * @category EventSubscriptions
 */
export type EventSubscriptionDeliveryType = 'serverSentEvents.v1' | 'webhook.v1'

/**
 * Event subscription configuration.
 *
 * @remarks
 * Contains lifecycle and TTL settings for the subscription.
 * This is read-only and set by the server based on delivery type.
 *
 * @category EventSubscriptions
 */
export interface EventSubscriptionConfig {
  /** Subscription lifecycle type */
  lifeCycle: EventSubscriptionLifecycle
  /** Time-to-live in seconds for temporary subscriptions */
  timeToLiveSeconds?: number
}

/**
 * SSE delivery configuration.
 *
 * @remarks
 * Configuration for Server-Sent Events delivery type.
 * The `sseUrl` is provided by the server after subscription creation.
 *
 * @category EventSubscriptions
 */
export interface SSEDeliveryConfig {
  /** Delivery type identifier */
  type: 'serverSentEvents.v1'
  /** URL to connect for receiving SSE events (read-only, provided by server) */
  sseUrl?: string
}

/**
 * Webhook delivery configuration.
 *
 * @remarks
 * Configuration for webhook delivery type.
 * The `secret` is provided by the server for signature verification.
 *
 * @category EventSubscriptions
 */
export interface WebhookDeliveryConfig {
  /** Delivery type identifier */
  type: 'webhook.v1'
  /** Base64 encoded secret for signature verification (read-only) */
  secret?: string
}

/**
 * Delivery configuration (union type).
 *
 * @remarks
 * Describes how events will be delivered to the subscriber.
 *
 * @category EventSubscriptions
 */
export type DeliveryConfig = SSEDeliveryConfig | WebhookDeliveryConfig

/**
 * Event type filter for subscriptions.
 *
 * @remarks
 * Specifies which event types should trigger the subscription.
 * Use `listEventTypes()` to get available event type IDs.
 *
 * @example
 * ```typescript
 * const typeFilter: EventTypeFilter = {
 *   id: 'een.motionDetectionEvent.v1'
 * }
 * ```
 *
 * @category EventSubscriptions
 */
export interface EventTypeFilter {
  /** Event type identifier (e.g., "een.motionDetectionEvent.v1") */
  id: string
}

/**
 * Filter for event subscriptions.
 *
 * @remarks
 * A filter defines which events will be delivered. Events must match
 * all conditions within a filter to be delivered. The subscription
 * receives events matching any of its filters.
 *
 * @category EventSubscriptions
 */
export interface EventSubscriptionFilter {
  /** Unique filter ID within the subscription */
  id: string
  /** List of actors to filter (format: "type:id", e.g., "camera:100d4c41") */
  actors: string[]
  /** List of event types to filter */
  types: EventTypeFilter[]
}

/**
 * Filter creation parameters.
 *
 * @remarks
 * Used when creating filters inline with a subscription.
 *
 * @example
 * ```typescript
 * const filter: FilterCreate = {
 *   actors: ['camera:100d4c41'],
 *   types: [{ id: 'een.motionDetectionEvent.v1' }]
 * }
 * ```
 *
 * @category EventSubscriptions
 */
export interface FilterCreate {
  /** List of actors to filter (format: "type:id", e.g., "camera:100d4c41") */
  actors: string[]
  /** List of event types to filter */
  types: EventTypeFilter[]
}

/**
 * Event subscription entity from EEN API v3.0.
 *
 * @remarks
 * Represents an event subscription in the Eagle Eye Networks platform.
 * Subscriptions allow receiving real-time events via SSE or webhooks.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listeventsubscriptions).
 *
 * @example
 * ```typescript
 * import { listEventSubscriptions, type EventSubscription } from 'een-api-toolkit'
 *
 * const { data, error } = await listEventSubscriptions()
 * if (data) {
 *   data.results.forEach((sub: EventSubscription) => {
 *     console.log(`Subscription ${sub.id}: ${sub.deliveryConfig.type}`)
 *     if (sub.deliveryConfig.type === 'serverSentEvents.v1') {
 *       console.log(`  SSE URL: ${sub.deliveryConfig.sseUrl}`)
 *     }
 *   })
 * }
 * ```
 *
 * @category EventSubscriptions
 */
export interface EventSubscription {
  /** Unique identifier for the subscription */
  id: string
  /** Subscription configuration (lifecycle, TTL) */
  subscriptionConfig?: EventSubscriptionConfig
  /** Delivery configuration (SSE or webhook) */
  deliveryConfig: DeliveryConfig
}

/**
 * SSE delivery configuration for creation.
 *
 * @remarks
 * Used when creating a subscription with SSE delivery.
 *
 * @category EventSubscriptions
 */
export interface SSEDeliveryConfigCreate {
  /** Delivery type identifier */
  type: 'serverSentEvents.v1'
}

/**
 * Webhook delivery configuration for creation.
 *
 * @remarks
 * Used when creating a subscription with webhook delivery.
 *
 * @category EventSubscriptions
 */
export interface WebhookDeliveryConfigCreate {
  /** Delivery type identifier */
  type: 'webhook.v1'
  /** HTTPS URL where webhook events will be sent */
  webhookUrl: string
  /** Email address of technical contact */
  technicalContactEmail: string
  /** Name of technical contact */
  technicalContactName: string
}

/**
 * Delivery configuration for creation (union type).
 *
 * @category EventSubscriptions
 */
export type DeliveryConfigCreate = SSEDeliveryConfigCreate | WebhookDeliveryConfigCreate

/**
 * Parameters for creating an event subscription.
 *
 * @remarks
 * Creates a new subscription with the specified delivery type and filters.
 * For SSE subscriptions, use `connectToEventSubscription()` to start receiving events.
 *
 * @example
 * ```typescript
 * import { createEventSubscription } from 'een-api-toolkit'
 *
 * // Create an SSE subscription for motion events from a camera
 * const { data, error } = await createEventSubscription({
 *   deliveryConfig: { type: 'serverSentEvents.v1' },
 *   filters: [{
 *     actors: ['camera:100d4c41'],
 *     types: [{ id: 'een.motionDetectionEvent.v1' }]
 *   }]
 * })
 *
 * if (data) {
 *   console.log(`Created subscription: ${data.id}`)
 *   // For SSE subscriptions, connect to the sseUrl
 *   if (data.deliveryConfig.type === 'serverSentEvents.v1') {
 *     console.log(`SSE URL: ${data.deliveryConfig.sseUrl}`)
 *   }
 * }
 * ```
 *
 * @category EventSubscriptions
 */
export interface CreateEventSubscriptionParams {
  /** Delivery configuration */
  deliveryConfig: DeliveryConfigCreate
  /** List of filters for the subscription */
  filters: FilterCreate[]
}

/**
 * Parameters for listing event subscriptions.
 *
 * @remarks
 * Supports pagination via pageSize and pageToken.
 *
 * @example
 * ```typescript
 * import { listEventSubscriptions } from 'een-api-toolkit'
 *
 * // Get first page
 * const { data } = await listEventSubscriptions({ pageSize: 10 })
 *
 * // Get next page
 * if (data?.nextPageToken) {
 *   const { data: page2 } = await listEventSubscriptions({
 *     pageSize: 10,
 *     pageToken: data.nextPageToken
 *   })
 * }
 * ```
 *
 * @category EventSubscriptions
 */
export interface ListEventSubscriptionsParams {
  /** Number of results per page */
  pageSize?: number
  /** Token for fetching a specific page */
  pageToken?: string
}

/**
 * SSE connection status.
 *
 * @category EventSubscriptions
 */
export type SSEConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

/**
 * SSE connection handle.
 *
 * @remarks
 * Returned by `connectToEventSubscription()`. Use `close()` to disconnect
 * and `status` to check the current connection state.
 *
 * @example
 * ```typescript
 * const { data: connection } = connectToEventSubscription(sseUrl, {
 *   onEvent: (event) => console.log('Event:', event),
 *   onStatusChange: (status) => console.log('Status:', status)
 * })
 *
 * // Later, disconnect
 * if (connection) {
 *   connection.close()
 * }
 * ```
 *
 * @category EventSubscriptions
 */
export interface SSEConnection {
  /** Close the SSE connection */
  close: () => void
  /** Current connection status */
  status: SSEConnectionStatus
}

/**
 * Options for connecting to an SSE event subscription.
 *
 * @category EventSubscriptions
 */
export interface SSEConnectionOptions {
  /** Callback when an event is received */
  onEvent: (event: SSEEvent) => void
  /** Callback when an error occurs */
  onError?: (error: Error) => void
  /** Callback when connection status changes */
  onStatusChange?: (status: SSEConnectionStatus) => void
}

/**
 * Event received via SSE.
 *
 * @remarks
 * This is the event payload delivered through the SSE connection.
 * The structure matches the Event type from the events API.
 *
 * @category EventSubscriptions
 */
export interface SSEEvent {
  /** Unique identifier for the event */
  id: string
  /** ISO 8601 timestamp when the event started */
  startTimestamp: string
  /** ISO 8601 timestamp when the event ended (null for point-in-time events) */
  endTimestamp?: string | null
  /** Whether this is a span event (has duration) or point-in-time event */
  span?: boolean
  /** ID of the account this event belongs to */
  accountId?: string
  /** ID of the actor (device/entity) that generated the event */
  actorId: string
  /** Account ID of the actor */
  actorAccountId?: string
  /** Type of actor that generated the event */
  actorType?: string
  /** ID of the entity that created the event */
  creatorId?: string
  /** Event type identifier (e.g., "een.motionDetectionEvent.v1") */
  type: string
  /** List of data schema types included in this event */
  dataSchemas?: string[]
  /** Event data objects (varies by event type) */
  data?: Array<{
    type: string
    creatorId?: string
    [key: string]: unknown
  }>
}
