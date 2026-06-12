import { success, failure } from '../types'
import type {
  Result,
  PaginatedResult,
  Event,
  EventType,
  EventFieldValues,
  ListEventsParams,
  GetEventParams,
  ListEventTypesParams,
  ListEventFieldValuesParams
} from '../types'
import { requireAuth, authHeaders, handleErrorResponse } from '../utils/api'
import { debug, formatTimestamp } from '../utils'

/**
 * List events with required filters and optional pagination.
 *
 * @remarks
 * Fetches a paginated list of events from `/api/v3.0/events`. The `actor`,
 * `type__in`, and `startTimestamp__gte` parameters are required.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listevents).
 *
 * @param params - Required and optional filtering parameters
 * @returns A Result containing a paginated list of events or an error
 *
 * @example
 * ```typescript
 * import { listEvents } from 'een-api-toolkit'
 *
 * // Get motion events from a camera in the last hour
 * const { data, error } = await listEvents({
 *   actor: 'camera:100d4c41',
 *   type__in: ['een.motionDetectionEvent.v1'],
 *   startTimestamp__gte: new Date(Date.now() - 3600000).toISOString()
 * })
 *
 * if (data) {
 *   console.log(`Found ${data.results.length} events`)
 *   data.results.forEach(event => {
 *     console.log(`${event.type} at ${event.startTimestamp}`)
 *   })
 * }
 *
 * // Fetch all events with pagination
 * let allEvents: Event[] = []
 * let pageToken: string | undefined
 * do {
 *   const { data, error } = await listEvents({
 *     actor: 'camera:100d4c41',
 *     type__in: ['een.motionDetectionEvent.v1'],
 *     startTimestamp__gte: new Date(Date.now() - 86400000).toISOString(),
 *     pageSize: 100,
 *     pageToken
 *   })
 *   if (error) break
 *   allEvents.push(...data.results)
 *   pageToken = data.nextPageToken
 * } while (pageToken)
 * ```
 *
 * @category Events
 */
export async function listEvents(params: ListEventsParams): Promise<Result<PaginatedResult<Event>>> {
  const auth = requireAuth()
  if (!auth.ok) return auth.result
  const { authStore, baseUrl } = auth

  // Validate required parameters
  if (!params.actor) {
    return failure('VALIDATION_ERROR', 'actor parameter is required')
  }

  if (!params.type__in || params.type__in.length === 0) {
    return failure('VALIDATION_ERROR', 'type__in parameter is required and must not be empty')
  }

  if (!params.startTimestamp__gte) {
    return failure('VALIDATION_ERROR', 'startTimestamp__gte parameter is required')
  }

  const queryParams = new URLSearchParams()

  // Required filters
  queryParams.append('actor', params.actor)
  queryParams.append('type__in', params.type__in.join(','))
  queryParams.append('startTimestamp__gte', formatTimestamp(params.startTimestamp__gte))

  // Pagination
  if (params.pageSize) {
    queryParams.append('pageSize', String(params.pageSize))
  }
  if (params.pageToken) {
    queryParams.append('pageToken', params.pageToken)
  }

  // Optional time filters
  if (params.startTimestamp__lte) {
    queryParams.append('startTimestamp__lte', formatTimestamp(params.startTimestamp__lte))
  }
  if (params.endTimestamp__gte) {
    queryParams.append('endTimestamp__gte', formatTimestamp(params.endTimestamp__gte))
  }
  if (params.endTimestamp__lte) {
    queryParams.append('endTimestamp__lte', formatTimestamp(params.endTimestamp__lte))
  }

  // Sort
  if (params.sort) {
    queryParams.append('sort', params.sort)
  }

  // Include
  if (params.include && params.include.length > 0) {
    queryParams.append('include', params.include.join(','))
  }

  const queryString = queryParams.toString()
  const url = `${baseUrl}/api/v3.0/events${queryString ? `?${queryString}` : ''}`
  debug('Fetching events:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: authHeaders(authStore.token)
    })

    if (!response.ok) {
      return handleErrorResponse(response)
    }

    const data = await response.json() as PaginatedResult<Event>
    debug('Events fetched:', data.results?.length ?? 0, 'events')

    return success(data)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to fetch events: ${String(err)}`)
  }
}

/**
 * Get a specific event by ID.
 *
 * @remarks
 * Fetches a single event from `/api/v3.0/events/{eventId}`. Use the `include`
 * parameter to request additional data schemas.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/getevent).
 *
 * @param eventId - The unique identifier of the event to fetch
 * @param params - Optional parameters (e.g., include additional data schemas)
 * @returns A Result containing the event or an error
 *
 * @example
 * ```typescript
 * import { getEvent } from 'een-api-toolkit'
 *
 * const { data, error } = await getEvent('event-123')
 *
 * if (error) {
 *   if (error.code === 'NOT_FOUND') {
 *     console.log('Event not found')
 *   }
 *   return
 * }
 *
 * console.log(`Event: ${data.type} at ${data.startTimestamp}`)
 *
 * // With additional data schemas
 * const { data: eventWithData } = await getEvent('event-123', {
 *   include: ['data.een.objectDetection.v1', 'data.een.fullFrameImageUrl.v1']
 * })
 * ```
 *
 * @category Events
 */
export async function getEvent(eventId: string, params?: GetEventParams): Promise<Result<Event>> {
  const auth = requireAuth()
  if (!auth.ok) return auth.result
  const { authStore, baseUrl } = auth

  if (!eventId) {
    return failure('VALIDATION_ERROR', 'Event ID is required')
  }

  const queryParams = new URLSearchParams()

  if (params?.include && params.include.length > 0) {
    queryParams.append('include', params.include.join(','))
  }

  const queryString = queryParams.toString()
  const url = `${baseUrl}/api/v3.0/events/${encodeURIComponent(eventId)}${queryString ? `?${queryString}` : ''}`
  debug('Fetching event:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: authHeaders(authStore.token)
    })

    if (!response.ok) {
      return handleErrorResponse(response)
    }

    const data = await response.json() as Event
    debug('Event fetched:', data.id)

    return success(data)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to fetch event: ${String(err)}`)
  }
}

/**
 * List all available event types.
 *
 * @remarks
 * Fetches a paginated list of event types from `/api/v3.0/eventTypes`. Event types
 * describe the different kinds of events that can be generated in the system.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listeventtypes).
 *
 * @param params - Optional pagination and language parameters
 * @returns A Result containing a paginated list of event types or an error
 *
 * @example
 * ```typescript
 * import { listEventTypes } from 'een-api-toolkit'
 *
 * const { data, error } = await listEventTypes()
 * if (data) {
 *   data.results.forEach(eventType => {
 *     console.log(`${eventType.name}: ${eventType.description}`)
 *   })
 * }
 *
 * // With language parameter
 * const { data: localizedTypes } = await listEventTypes({ language: 'de' })
 * ```
 *
 * @category Events
 */
export async function listEventTypes(params?: ListEventTypesParams): Promise<Result<PaginatedResult<EventType>>> {
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

  // Language
  if (params?.language) {
    queryParams.append('language', params.language)
  }

  const queryString = queryParams.toString()
  const url = `${baseUrl}/api/v3.0/eventTypes${queryString ? `?${queryString}` : ''}`
  debug('Fetching event types:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: authHeaders(authStore.token)
    })

    if (!response.ok) {
      return handleErrorResponse(response)
    }

    const data = await response.json() as PaginatedResult<EventType>
    debug('Event types fetched:', data.results?.length ?? 0, 'types')

    return success(data)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to fetch event types: ${String(err)}`)
  }
}

/**
 * List available event field values for a specific actor.
 *
 * @remarks
 * Fetches available event types for a specific actor from
 * `/api/v3.0/events:listFieldValues`. This is useful for building filter UIs
 * to know which event types are available for a camera or other device.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listeventfieldvalues).
 *
 * @param params - Parameters including the actor to query
 * @returns A Result containing available field values or an error
 *
 * @example
 * ```typescript
 * import { listEventFieldValues } from 'een-api-toolkit'
 *
 * const { data, error } = await listEventFieldValues({
 *   actor: 'camera:100d4c41'
 * })
 *
 * if (data) {
 *   console.log('Available event types:', data.type)
 *   // Use these types to filter the listEvents call
 * }
 * ```
 *
 * @category Events
 */
export async function listEventFieldValues(params: ListEventFieldValuesParams): Promise<Result<EventFieldValues>> {
  const auth = requireAuth()
  if (!auth.ok) return auth.result
  const { authStore, baseUrl } = auth

  // Validate required parameter
  if (!params.actor) {
    return failure('VALIDATION_ERROR', 'actor parameter is required')
  }

  const queryParams = new URLSearchParams()
  queryParams.append('actor', params.actor)

  const queryString = queryParams.toString()
  const url = `${baseUrl}/api/v3.0/events:listFieldValues${queryString ? `?${queryString}` : ''}`
  debug('Fetching event field values:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: authHeaders(authStore.token)
    })

    if (!response.ok) {
      return handleErrorResponse(response)
    }

    const data = await response.json() as EventFieldValues
    debug('Event field values fetched:', data.type?.length ?? 0, 'types')

    return success(data)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to fetch event field values: ${String(err)}`)
  }
}
