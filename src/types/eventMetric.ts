/**
 * Actor types for event metrics in the EEN API v3.0.
 *
 * @remarks
 * Represents the type of entity that generated or is associated with a metric.
 * Common actor types include cameras, bridges, and users.
 *
 * @category Event Metrics
 */
export type MetricActorType =
  | 'bridge'
  | 'camera'
  | 'speaker'
  | 'account'
  | 'user'
  | 'layout'
  | 'job'

/**
 * A single metric data point as [timestamp_ms, value].
 *
 * @remarks
 * Event metrics return time-series data as arrays of [timestamp, value] pairs.
 * The timestamp is in milliseconds since Unix epoch, and the value represents
 * the count or measurement at that point in time.
 *
 * @example
 * ```typescript
 * // Data point: January 1, 2024 at midnight with a count of 5
 * const dataPoint: MetricDataPoint = [1704067200000, 5]
 * ```
 *
 * @category Event Metrics
 */
export type MetricDataPoint = [number, number]

/**
 * Event metric entity from EEN API v3.0.
 *
 * @remarks
 * Represents a time-series metric for events in the Eagle Eye Networks platform.
 * Event metrics provide aggregated counts over time, useful for visualizing
 * event frequency in charts and dashboards.
 *
 * For more details on event metrics, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listmetrics).
 *
 * @example
 * ```typescript
 * import { getEventMetrics, type EventMetric } from 'een-api-toolkit'
 *
 * const { data, error } = await getEventMetrics({
 *   actor: 'camera:100d4c41',
 *   eventType: 'een.motionDetectionEvent.v1'
 * })
 * if (data) {
 *   data.forEach((metric: EventMetric) => {
 *     console.log(`${metric.eventType}: ${metric.dataPoints.length} data points`)
 *     metric.dataPoints.forEach(([timestamp, count]) => {
 *       console.log(`  ${new Date(timestamp).toISOString()}: ${count}`)
 *     })
 *   })
 * }
 * ```
 *
 * @category Event Metrics
 */
export interface EventMetric {
  /** Event type identifier (e.g., "een.motionDetectionEvent.v1") */
  eventType: string
  /** ID of the actor (device/entity) for this metric */
  actorId: string
  /** Type of actor for this metric */
  actorType: MetricActorType
  /** Metric target (typically "count") */
  target: string
  /** Array of [timestamp_ms, value] data points */
  dataPoints: MetricDataPoint[]
  /** Additional properties that may be included */
  [key: string]: unknown
}

/**
 * Parameters for fetching event metrics.
 *
 * @remarks
 * Supports filtering metrics by actor, event type, and time range. The `actor`
 * and `eventType` parameters are required. If timestamps are not provided,
 * defaults to the last 7 days.
 *
 * For more details, see the
 * [EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listmetrics).
 *
 * @example
 * ```typescript
 * import { getEventMetrics } from 'een-api-toolkit'
 *
 * // Get motion event metrics for a camera over the last 24 hours
 * const { data } = await getEventMetrics({
 *   actor: 'camera:100d4c41',
 *   eventType: 'een.motionDetectionEvent.v1',
 *   timestamp__gte: new Date(Date.now() - 86400000).toISOString(),
 *   timestamp__lte: new Date().toISOString(),
 *   aggregateByMinutes: 60  // Hourly buckets
 * })
 *
 * // With default time range (last 7 days) and aggregation (60 minutes)
 * const { data: weekData } = await getEventMetrics({
 *   actor: 'camera:100d4c41',
 *   eventType: 'een.motionDetectionEvent.v1'
 * })
 * ```
 *
 * @category Event Metrics
 */
export interface GetEventMetricsParams {
  /** Actor to get metrics for (format: "type:id", e.g., "camera:100d4c41") */
  actor: string
  /** Event type to get metrics for (e.g., "een.motionDetectionEvent.v1") */
  eventType: string
  /** ISO 8601 timestamp - metrics starting at or after this time (defaults to 7 days ago) */
  timestamp__gte?: string
  /** ISO 8601 timestamp - metrics ending before this time (defaults to now) */
  timestamp__lte?: string
  /** Aggregation bucket size in minutes (default: 60) */
  aggregateByMinutes?: number
}
