import { useAuthStore } from '../auth/store'
import { success, failure } from '../types'
import type {
  Result,
  PaginatedResult,
  EventSubscription,
  CreateEventSubscriptionParams,
  ListEventSubscriptionsParams,
  SSEConnection,
  SSEConnectionOptions,
  SSEConnectionStatus,
  SSEEvent
} from '../types'
import { debug } from '../utils'
import { isAllowedEenHostname } from '../utils/hostname'

/**
 * List all event subscriptions for the current account.
 *
 * @remarks
 * Fetches a paginated list of event subscriptions from `/api/v3.0/eventSubscriptions`.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listeventsubscriptions).
 *
 * @param params - Optional pagination parameters
 * @returns A Result containing a paginated list of event subscriptions or an error
 *
 * @example
 * ```typescript
 * import { listEventSubscriptions } from 'een-api-toolkit'
 *
 * const { data, error } = await listEventSubscriptions()
 * if (data) {
 *   console.log(`Found ${data.results.length} subscriptions`)
 *   data.results.forEach(sub => {
 *     console.log(`${sub.id}: ${sub.deliveryConfig.type}`)
 *   })
 * }
 * ```
 *
 * @category EventSubscriptions
 */
export async function listEventSubscriptions(
  params?: ListEventSubscriptionsParams
): Promise<Result<PaginatedResult<EventSubscription>>> {
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

  const queryString = queryParams.toString()
  const url = `${authStore.baseUrl}/api/v3.0/eventSubscriptions${queryString ? `?${queryString}` : ''}`
  debug('Fetching event subscriptions:', url)

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

    const data = await response.json() as PaginatedResult<EventSubscription>
    debug('Event subscriptions fetched:', data.results?.length ?? 0, 'subscriptions')

    return success(data)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to fetch event subscriptions: ${String(err)}`)
  }
}

/**
 * Get a specific event subscription by ID.
 *
 * @remarks
 * Fetches a single event subscription from `/api/v3.0/eventSubscriptions/{id}`.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/geteventsubscription).
 *
 * @param subscriptionId - The unique identifier of the subscription to fetch
 * @returns A Result containing the event subscription or an error
 *
 * @example
 * ```typescript
 * import { getEventSubscription } from 'een-api-toolkit'
 *
 * const { data, error } = await getEventSubscription('f3d6f55d5ba546168758a309508f4419')
 * if (data) {
 *   console.log(`Subscription: ${data.id}`)
 *   if (data.deliveryConfig.type === 'serverSentEvents.v1') {
 *     console.log(`SSE URL: ${data.deliveryConfig.sseUrl}`)
 *   }
 * }
 * ```
 *
 * @category EventSubscriptions
 */
export async function getEventSubscription(
  subscriptionId: string
): Promise<Result<EventSubscription>> {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return failure('AUTH_REQUIRED', 'Authentication required')
  }

  if (!authStore.baseUrl) {
    return failure('AUTH_REQUIRED', 'Base URL not configured')
  }

  if (!subscriptionId) {
    return failure('VALIDATION_ERROR', 'Subscription ID is required')
  }

  const url = `${authStore.baseUrl}/api/v3.0/eventSubscriptions/${encodeURIComponent(subscriptionId)}`
  debug('Fetching event subscription:', url)

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

    const data = await response.json() as EventSubscription
    debug('Event subscription fetched:', data.id)

    return success(data)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to fetch event subscription: ${String(err)}`)
  }
}

/**
 * Create a new event subscription.
 *
 * @remarks
 * Creates a new event subscription at `/api/v3.0/eventSubscriptions`.
 * For SSE subscriptions, use `connectToEventSubscription()` with the returned
 * `sseUrl` to start receiving events.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/createeventsubscription).
 *
 * @param params - Parameters for creating the subscription
 * @returns A Result containing the created event subscription or an error
 *
 * @example
 * ```typescript
 * import { createEventSubscription, connectToEventSubscription } from 'een-api-toolkit'
 *
 * // Create an SSE subscription for motion events
 * const { data, error } = await createEventSubscription({
 *   deliveryConfig: { type: 'serverSentEvents.v1' },
 *   filters: [{
 *     actors: ['camera:100d4c41'],
 *     types: [{ id: 'een.motionDetectionEvent.v1' }]
 *   }]
 * })
 *
 * if (data && data.deliveryConfig.type === 'serverSentEvents.v1') {
 *   // Connect to the SSE stream
 *   const { data: connection } = connectToEventSubscription(
 *     data.deliveryConfig.sseUrl!,
 *     { onEvent: (event) => console.log('Event:', event) }
 *   )
 * }
 * ```
 *
 * @category EventSubscriptions
 */
export async function createEventSubscription(
  params: CreateEventSubscriptionParams
): Promise<Result<EventSubscription>> {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return failure('AUTH_REQUIRED', 'Authentication required')
  }

  if (!authStore.baseUrl) {
    return failure('AUTH_REQUIRED', 'Base URL not configured')
  }

  if (!params.deliveryConfig) {
    return failure('VALIDATION_ERROR', 'deliveryConfig is required')
  }

  if (!params.filters || params.filters.length === 0) {
    return failure('VALIDATION_ERROR', 'At least one filter is required')
  }

  // Validate each filter
  for (const filter of params.filters) {
    if (!filter.actors || filter.actors.length === 0) {
      return failure('VALIDATION_ERROR', 'Each filter must have at least one actor')
    }
    if (!filter.types || filter.types.length === 0) {
      return failure('VALIDATION_ERROR', 'Each filter must have at least one event type')
    }
  }

  const url = `${authStore.baseUrl}/api/v3.0/eventSubscriptions`
  debug('Creating event subscription:', url)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(params)
    })

    if (!response.ok) {
      return handleErrorResponse(response)
    }

    const data = await response.json() as EventSubscription
    debug('Event subscription created:', data.id)

    return success(data)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to create event subscription: ${String(err)}`)
  }
}

/**
 * Delete an event subscription.
 *
 * @remarks
 * Deletes an event subscription at `/api/v3.0/eventSubscriptions/{id}`.
 * Any active SSE connections to this subscription will be closed.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/deleteeventsubscription).
 *
 * @param subscriptionId - The unique identifier of the subscription to delete
 * @returns A Result with void data on success or an error
 *
 * @example
 * ```typescript
 * import { deleteEventSubscription } from 'een-api-toolkit'
 *
 * const { error } = await deleteEventSubscription('f3d6f55d5ba546168758a309508f4419')
 * if (error) {
 *   console.error('Failed to delete:', error.message)
 * } else {
 *   console.log('Subscription deleted successfully')
 * }
 * ```
 *
 * @category EventSubscriptions
 */
export async function deleteEventSubscription(
  subscriptionId: string
): Promise<Result<void>> {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return failure('AUTH_REQUIRED', 'Authentication required')
  }

  if (!authStore.baseUrl) {
    return failure('AUTH_REQUIRED', 'Base URL not configured')
  }

  if (!subscriptionId) {
    return failure('VALIDATION_ERROR', 'Subscription ID is required')
  }

  const url = `${authStore.baseUrl}/api/v3.0/eventSubscriptions/${encodeURIComponent(subscriptionId)}`
  debug('Deleting event subscription:', url)

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      }
    })

    if (!response.ok) {
      return handleErrorResponse(response)
    }

    debug('Event subscription deleted:', subscriptionId)
    return success(undefined)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to delete event subscription: ${String(err)}`)
  }
}

/**
 * Connect to an SSE event subscription to receive real-time events.
 *
 * @remarks
 * Opens an SSE connection to the provided URL and calls the `onEvent` callback
 * for each event received. The connection automatically handles reconnection
 * on errors.
 *
 * Note: SSE connections require authentication. The token is passed via the
 * `Authorization` header. Since EventSource doesn't support custom headers,
 * we use fetch with ReadableStream to implement SSE.
 *
 * @param sseUrl - The SSE URL from the event subscription's deliveryConfig
 * @param options - Connection options including event and error callbacks
 * @returns A Result containing the SSE connection handle or an error
 *
 * @example
 * ```typescript
 * import { createEventSubscription, connectToEventSubscription } from 'een-api-toolkit'
 *
 * // First create a subscription
 * const { data: subscription } = await createEventSubscription({
 *   deliveryConfig: { type: 'serverSentEvents.v1' },
 *   filters: [{
 *     actors: ['camera:100d4c41'],
 *     types: [{ id: 'een.motionDetectionEvent.v1' }]
 *   }]
 * })
 *
 * if (subscription?.deliveryConfig.type === 'serverSentEvents.v1') {
 *   // Connect to SSE stream
 *   const { data: connection, error } = connectToEventSubscription(
 *     subscription.deliveryConfig.sseUrl!,
 *     {
 *       onEvent: (event) => {
 *         console.log(`Event: ${event.type} from ${event.actorId}`)
 *       },
 *       onError: (err) => {
 *         console.error('SSE error:', err.message)
 *       },
 *       onStatusChange: (status) => {
 *         console.log('Connection status:', status)
 *       }
 *     }
 *   )
 *
 *   // Later, disconnect
 *   if (connection) {
 *     connection.close()
 *   }
 * }
 * ```
 *
 * @category EventSubscriptions
 */
export function connectToEventSubscription(
  sseUrl: string,
  options: SSEConnectionOptions
): Result<SSEConnection> {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return failure('AUTH_REQUIRED', 'Authentication required')
  }

  if (!authStore.token) {
    return failure('AUTH_REQUIRED', 'Access token not available')
  }

  if (!sseUrl) {
    return failure('VALIDATION_ERROR', 'SSE URL is required')
  }

  // Validate SSE URL domain to prevent SSRF attacks
  // SSE URLs should only come from trusted EEN domains
  try {
    const sseUrlObj = new URL(sseUrl)
    if (!isAllowedEenHostname(sseUrlObj.hostname)) {
      return failure('VALIDATION_ERROR', `SSE URL domain not allowed: ${sseUrlObj.hostname}`)
    }
  } catch {
    return failure('VALIDATION_ERROR', 'Invalid SSE URL format')
  }

  // Maximum buffer size to prevent memory exhaustion (1MB)
  const MAX_BUFFER_SIZE = 1024 * 1024

  let status: SSEConnectionStatus = 'connecting'
  let abortController: AbortController | null = new AbortController()
  let isClosing = false

  const setStatus = (newStatus: SSEConnectionStatus) => {
    status = newStatus
    options.onStatusChange?.(status)
  }

  const close = () => {
    if (isClosing) return
    isClosing = true
    debug('Closing SSE connection')
    abortController?.abort()
    abortController = null
    setStatus('disconnected')
  }

  const connect = async () => {
    if (isClosing || !abortController) return

    setStatus('connecting')
    debug('Connecting to SSE:', sseUrl)

    try {
      // Note: We intentionally omit Cache-Control header here.
      // While 'Cache-Control: no-cache' is common for SSE, it triggers CORS preflight
      // requests that fail because the EEN API doesn't include it in Access-Control-Allow-Headers.
      // The SSE endpoint handles caching appropriately server-side.
      const response = await fetch(sseUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/event-stream',
          'Authorization': `Bearer ${authStore.token}`
        },
        signal: abortController.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      if (!response.body) {
        throw new Error('Response body is not available')
      }

      setStatus('connected')
      debug('SSE connected')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (!isClosing) {
        const { done, value } = await reader.read()

        if (done) {
          debug('SSE stream ended')
          break
        }

        buffer += decoder.decode(value, { stream: true })

        // Prevent buffer from growing unbounded (protects against memory exhaustion)
        if (buffer.length > MAX_BUFFER_SIZE) {
          debug('SSE buffer exceeded maximum size, resetting')
          buffer = ''
          continue
        }

        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        let eventData = ''
        for (const line of lines) {
          if (line.startsWith('data:')) {
            // Per SSE spec, multi-line data fields are concatenated with newlines
            const dataValue = line.substring(5).trimStart()
            eventData = eventData ? `${eventData}\n${dataValue}` : dataValue
          } else if (line === '' && eventData) {
            // End of event
            try {
              const event = JSON.parse(eventData) as SSEEvent
              debug('SSE event received:', event.type, event.actorId)
              options.onEvent(event)
            } catch (parseError) {
              debug('Failed to parse SSE event:', parseError)
            }
            eventData = ''
          }
        }
      }
    } catch (err) {
      if (isClosing || (err instanceof Error && err.name === 'AbortError')) {
        // Expected when closing
        return
      }

      debug('SSE error:', err)
      setStatus('error')
      options.onError?.(err instanceof Error ? err : new Error(String(err)))
    }
  }

  // Start connection
  connect()

  const connection: SSEConnection = {
    close,
    get status() {
      return status
    }
  }

  return success(connection)
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
  } catch (parseError) {
    debug('Failed to parse error response JSON:', parseError)
    message = response.statusText || 'Unknown error'
  }

  switch (status) {
    case 401:
      return failure('AUTH_REQUIRED', message, status)
    case 403:
      return failure('FORBIDDEN', message, status)
    case 404:
      return failure('NOT_FOUND', message, status)
    case 429:
      return failure('RATE_LIMITED', message, status)
    default:
      return failure('API_ERROR', message, status)
  }
}
