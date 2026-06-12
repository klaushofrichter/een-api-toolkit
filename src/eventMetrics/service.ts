import { success, failure } from '../types'
import type {
  Result,
  EventMetric,
  GetEventMetricsParams
} from '../types'
import { requireAuth, authHeaders, handleErrorResponse } from '../utils/api'
import { debug, formatTimestamp } from '../utils'

/**
 * Get event metrics (time-series data) for a specific actor and event type.
 *
 * @remarks
 * Fetches time-series metric data from `/api/v3.0/eventMetrics`. The `actor` and
 * `eventType` parameters are required. Returns an array of EventMetric objects
 * containing data points over time.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listmetrics).
 *
 * @param params - Required and optional filtering parameters
 * @returns A Result containing an array of event metrics or an error
 *
 * @example
 * ```typescript
 * import { getEventMetrics } from 'een-api-toolkit'
 *
 * // Get motion event metrics for a camera (last 7 days by default)
 * const { data, error } = await getEventMetrics({
 *   actor: 'camera:100d4c41',
 *   eventType: 'een.motionDetectionEvent.v1'
 * })
 *
 * if (data) {
 *   data.forEach(metric => {
 *     console.log(`${metric.eventType}: ${metric.dataPoints.length} data points`)
 *     metric.dataPoints.forEach(([timestamp, count]) => {
 *       console.log(`  ${new Date(timestamp).toISOString()}: ${count}`)
 *     })
 *   })
 * }
 *
 * // With custom time range and aggregation
 * const { data: hourlyData } = await getEventMetrics({
 *   actor: 'camera:100d4c41',
 *   eventType: 'een.motionDetectionEvent.v1',
 *   timestamp__gte: new Date(Date.now() - 86400000).toISOString(),
 *   timestamp__lte: new Date().toISOString(),
 *   aggregateByMinutes: 60
 * })
 * ```
 *
 * @category Event Metrics
 */
export async function getEventMetrics(params: GetEventMetricsParams): Promise<Result<EventMetric[]>> {
  const auth = requireAuth()
  if (!auth.ok) return auth.result
  const { authStore, baseUrl } = auth

  // Validate required parameters
  if (!params.actor) {
    return failure('VALIDATION_ERROR', 'actor parameter is required')
  }

  if (!params.eventType) {
    return failure('VALIDATION_ERROR', 'eventType parameter is required')
  }

  const queryParams = new URLSearchParams()

  // Required parameters
  queryParams.append('actor', params.actor)
  queryParams.append('eventType', params.eventType)

  // Optional time filters
  if (params.timestamp__gte) {
    queryParams.append('timestamp__gte', formatTimestamp(params.timestamp__gte))
  }
  if (params.timestamp__lte) {
    queryParams.append('timestamp__lte', formatTimestamp(params.timestamp__lte))
  }

  // Optional aggregation
  if (params.aggregateByMinutes !== undefined) {
    queryParams.append('aggregateByMinutes', String(params.aggregateByMinutes))
  }

  const queryString = queryParams.toString()
  const url = `${baseUrl}/api/v3.0/eventMetrics${queryString ? `?${queryString}` : ''}`
  debug('Fetching event metrics:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: authHeaders(authStore.token)
    })

    if (!response.ok) {
      return handleErrorResponse(response)
    }

    const data = await response.json() as EventMetric[]
    debug('Event metrics fetched:', data.length, 'metrics')

    return success(data)
  } catch (err) {
    return failure('NETWORK_ERROR', `Failed to fetch event metrics: ${String(err)}`)
  }
}
