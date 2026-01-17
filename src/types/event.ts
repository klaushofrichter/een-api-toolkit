/**
 * Actor types for events in the EEN API v3.0.
 *
 * @remarks
 * Represents the type of entity that generated or is associated with an event.
 * Common actor types include cameras, bridges, and users.
 *
 * @category Events
 */
export type ActorType =
  | 'bridge'
  | 'camera'
  | 'speaker'
  | 'account'
  | 'user'
  | 'layout'
  | 'job'
  | 'measurement'
  | 'sensor'
  | 'gateway'

/**
 * Event data object within an event.
 *
 * @remarks
 * Event data is polymorphic - different event types have different data schemas.
 * The `type` field indicates the schema, and additional properties contain
 * the actual event data. Common schemas include:
 * - `een.objectDetection.v1` - Object detection results
 * - `een.fullFrameImageUrl.v1` - Full frame image URL
 * - `een.croppedFrameImageUrl.v1` - Cropped frame image URL
 *
 * @category Events
 */
export interface EventData {
  /** Data schema type (e.g., "een.objectDetection.v1") */
  type: string
  /** ID of the entity that created this data */
  creatorId: string
  /** Additional properties vary by event type */
  [key: string]: unknown
}

/**
 * Event entity from EEN API v3.0.
 *
 * @remarks
 * Represents an event in the Eagle Eye Networks platform. Events are generated
 * by various actors (cameras, bridges, etc.) and can include data like motion
 * detection, object detection, and more.
 *
 * For more details on events, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listevents).
 *
 * @example
 * ```typescript
 * import { listEvents, type Event } from 'een-api-toolkit'
 *
 * const { data, error } = await listEvents({
 *   actor: 'camera:100d4c41',
 *   type__in: ['een.motionDetectionEvent.v1'],
 *   startTimestamp__gte: new Date(Date.now() - 3600000).toISOString()
 * })
 * if (data) {
 *   data.results.forEach((event: Event) => {
 *     console.log(`${event.type} at ${event.startTimestamp}`)
 *   })
 * }
 * ```
 *
 * @category Events
 */
export interface Event {
  /** Unique identifier for the event */
  id: string
  /** ISO 8601 timestamp when the event started */
  startTimestamp: string
  /** ISO 8601 timestamp when the event ended (null for point-in-time events) */
  endTimestamp?: string | null
  /** Whether this is a span event (has duration) or point-in-time event */
  span: boolean
  /** ID of the account this event belongs to */
  accountId: string
  /** ID of the actor (device/entity) that generated the event */
  actorId: string
  /** Account ID of the actor */
  actorAccountId: string
  /** Type of actor that generated the event */
  actorType: ActorType
  /** ID of the entity that created the event */
  creatorId: string
  /** Event type identifier (e.g., "een.motionDetectionEvent.v1") */
  type: string
  /** List of data schema types included in this event */
  dataSchemas: string[]
  /** Event data objects (varies by event type) */
  data: EventData[]
}

/**
 * Event type definition from EEN API v3.0.
 *
 * @remarks
 * Describes a type of event available in the system. Used to understand
 * what event types can be filtered for when listing events.
 *
 * @category Events
 */
export interface EventType {
  /** Event type identifier (e.g., "een.motionDetectionEvent.v1") */
  type: string
  /** Human-readable name of the event type */
  name: string
  /** Description of the event type */
  description: string
}

/**
 * Parameters for listing events.
 *
 * @remarks
 * Supports filtering events by actor, type, and time range. The `actor`, `type__in`,
 * and `startTimestamp__gte` parameters are required.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listevents).
 *
 * @example
 * ```typescript
 * import { listEvents } from 'een-api-toolkit'
 *
 * // Get motion events from a camera in the last hour
 * const { data } = await listEvents({
 *   actor: 'camera:100d4c41',
 *   type__in: ['een.motionDetectionEvent.v1'],
 *   startTimestamp__gte: new Date(Date.now() - 3600000).toISOString(),
 *   pageSize: 50,
 *   include: ['data.een.objectDetection.v1']
 * })
 *
 * // Fetch next page
 * if (data?.nextPageToken) {
 *   const { data: page2 } = await listEvents({
 *     actor: 'camera:100d4c41',
 *     type__in: ['een.motionDetectionEvent.v1'],
 *     startTimestamp__gte: new Date(Date.now() - 3600000).toISOString(),
 *     pageToken: data.nextPageToken
 *   })
 * }
 * ```
 *
 * @category Events
 */
export interface ListEventsParams {
  // Pagination
  /** Number of results per page (default: 100) */
  pageSize?: number
  /** Token for fetching a specific page */
  pageToken?: string

  // Required filters
  /** Actor to filter by (format: "type:id", e.g., "camera:100d4c41") */
  actor: string
  /** Event types to include (e.g., ["een.motionDetectionEvent.v1"]) */
  type__in: string[]
  /** ISO 8601 timestamp - events starting at or after this time */
  startTimestamp__gte: string

  // Optional time filters
  /** ISO 8601 timestamp - events starting before this time */
  startTimestamp__lte?: string
  /** ISO 8601 timestamp - events ending at or after this time */
  endTimestamp__gte?: string
  /** ISO 8601 timestamp - events ending before this time */
  endTimestamp__lte?: string

  // Sort
  /** Sort order for results */
  sort?: '+startTimestamp' | '-startTimestamp'

  // Include data schemas
  /** Data schemas to include (e.g., ["data.een.objectDetection.v1"]) */
  include?: string[]
}

/**
 * Parameters for getting a single event by ID.
 *
 * @remarks
 * Supports including additional data schemas in the response.
 *
 * @example
 * ```typescript
 * import { getEvent } from 'een-api-toolkit'
 *
 * const { data } = await getEvent('event-123', {
 *   include: ['data.een.objectDetection.v1', 'data.een.fullFrameImageUrl.v1']
 * })
 * ```
 *
 * @category Events
 */
export interface GetEventParams {
  /** Data schemas to include in the response */
  include?: string[]
}

/**
 * Parameters for listing event types.
 *
 * @remarks
 * Supports pagination and language localization.
 *
 * @example
 * ```typescript
 * import { listEventTypes } from 'een-api-toolkit'
 *
 * const { data } = await listEventTypes({ language: 'en' })
 * if (data) {
 *   data.results.forEach(eventType => {
 *     console.log(`${eventType.name}: ${eventType.description}`)
 *   })
 * }
 * ```
 *
 * @category Events
 */
export interface ListEventTypesParams {
  /** Number of results per page */
  pageSize?: number
  /** Token for fetching a specific page */
  pageToken?: string
  /** Language code for localized names/descriptions (e.g., "en", "de") */
  language?: string
}

/**
 * Parameters for listing available event field values.
 *
 * @remarks
 * Used to discover what event types are available for a specific actor.
 * This is useful for building filter UIs.
 *
 * @example
 * ```typescript
 * import { listEventFieldValues } from 'een-api-toolkit'
 *
 * const { data } = await listEventFieldValues({ actor: 'camera:100d4c41' })
 * if (data) {
 *   console.log('Available event types:', data.type)
 * }
 * ```
 *
 * @category Events
 */
export interface ListEventFieldValuesParams {
  /** Actor to get field values for (format: "type:id", e.g., "camera:100d4c41") */
  actor: string
}

/**
 * Available event field values for an actor.
 *
 * @remarks
 * Contains the event types available for the specified actor. Use this
 * to know which event types can be filtered for when listing events.
 *
 * @category Events
 */
export interface EventFieldValues {
  /** Available event types for the actor */
  type: string[]
}
