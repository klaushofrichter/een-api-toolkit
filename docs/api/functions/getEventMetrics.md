[**EEN API Toolkit v0.3.88**](../README.md)

***

[EEN API Toolkit](../README.md) / getEventMetrics

# Function: getEventMetrics()

> **getEventMetrics**(`params`): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`EventMetric`](../interfaces/EventMetric.md)[]\>\>

Defined in: [eventMetrics/service.ts:55](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/eventMetrics/service.ts#L55)

Get event metrics (time-series data) for a specific actor and event type.

## Parameters

### params

[`GetEventMetricsParams`](../interfaces/GetEventMetricsParams.md)

Required and optional filtering parameters

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`EventMetric`](../interfaces/EventMetric.md)[]\>\>

A Result containing an array of event metrics or an error

## Remarks

Fetches time-series metric data from `/api/v3.0/eventMetrics`. The `actor` and
`eventType` parameters are required. Returns an array of EventMetric objects
containing data points over time.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listmetrics).

## Example

```typescript
import { getEventMetrics } from 'een-api-toolkit'

// Get motion event metrics for a camera (last 7 days by default)
const { data, error } = await getEventMetrics({
  actor: 'camera:100d4c41',
  eventType: 'een.motionDetectionEvent.v1'
})

if (data) {
  data.forEach(metric => {
    console.log(`${metric.eventType}: ${metric.dataPoints.length} data points`)
    metric.dataPoints.forEach(([timestamp, count]) => {
      console.log(`  ${new Date(timestamp).toISOString()}: ${count}`)
    })
  })
}

// With custom time range and aggregation
const { data: hourlyData } = await getEventMetrics({
  actor: 'camera:100d4c41',
  eventType: 'een.motionDetectionEvent.v1',
  timestamp__gte: new Date(Date.now() - 86400000).toISOString(),
  timestamp__lte: new Date().toISOString(),
  aggregateByMinutes: 60
})
```
