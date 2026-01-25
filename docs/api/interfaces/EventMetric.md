[**EEN API Toolkit v0.3.42**](../README.md)

***

[EEN API Toolkit](../README.md) / EventMetric

# Interface: EventMetric

Defined in: [src/types/eventMetric.ts:68](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventMetric.ts#L68)

Event metric entity from EEN API v3.0.

## Remarks

Represents a time-series metric for events in the Eagle Eye Networks platform.
Event metrics provide aggregated counts over time, useful for visualizing
event frequency in charts and dashboards.

For more details on event metrics, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listmetrics).

## Example

```typescript
import { getEventMetrics, type EventMetric } from 'een-api-toolkit'

const { data, error } = await getEventMetrics({
  actor: 'camera:100d4c41',
  eventType: 'een.motionDetectionEvent.v1'
})
if (data) {
  data.forEach((metric: EventMetric) => {
    console.log(`${metric.eventType}: ${metric.dataPoints.length} data points`)
    metric.dataPoints.forEach(([timestamp, count]) => {
      console.log(`  ${new Date(timestamp).toISOString()}: ${count}`)
    })
  })
}
```

## Indexable

\[`key`: `string`\]: `unknown`

Additional properties that may be included

## Properties

### eventType

> **eventType**: `string`

Defined in: [src/types/eventMetric.ts:70](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventMetric.ts#L70)

Event type identifier (e.g., "een.motionDetectionEvent.v1")

***

### actorId

> **actorId**: `string`

Defined in: [src/types/eventMetric.ts:72](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventMetric.ts#L72)

ID of the actor (device/entity) for this metric

***

### actorType

> **actorType**: [`MetricActorType`](../type-aliases/MetricActorType.md)

Defined in: [src/types/eventMetric.ts:74](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventMetric.ts#L74)

Type of actor for this metric

***

### target

> **target**: `string`

Defined in: [src/types/eventMetric.ts:76](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventMetric.ts#L76)

Metric target (typically "count")

***

### dataPoints

> **dataPoints**: [`MetricDataPoint`](../type-aliases/MetricDataPoint.md)[]

Defined in: [src/types/eventMetric.ts:78](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventMetric.ts#L78)

Array of [timestamp_ms, value] data points
