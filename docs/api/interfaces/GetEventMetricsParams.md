[**EEN API Toolkit v0.3.96**](../README.md)

***

[EEN API Toolkit](../README.md) / GetEventMetricsParams

# Interface: GetEventMetricsParams

Defined in: [types/eventMetric.ts:116](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventMetric.ts#L116)

Parameters for fetching event metrics.

## Remarks

Supports filtering metrics by actor, event type, and time range. The `actor`
and `eventType` parameters are required. If timestamps are not provided,
defaults to the last 7 days.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listmetrics).

## Example

```typescript
import { getEventMetrics } from 'een-api-toolkit'

// Get motion event metrics for a camera over the last 24 hours
const { data } = await getEventMetrics({
  actor: 'camera:100d4c41',
  eventType: 'een.motionDetectionEvent.v1',
  timestamp__gte: new Date(Date.now() - 86400000).toISOString(),
  timestamp__lte: new Date().toISOString(),
  aggregateByMinutes: 60  // Hourly buckets
})

// With default time range (last 7 days) and aggregation (60 minutes)
const { data: weekData } = await getEventMetrics({
  actor: 'camera:100d4c41',
  eventType: 'een.motionDetectionEvent.v1'
})
```

## Properties

### actor

> **actor**: `string`

Defined in: [types/eventMetric.ts:118](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventMetric.ts#L118)

Actor to get metrics for (format: "type:id", e.g., "camera:100d4c41")

***

### eventType

> **eventType**: `string`

Defined in: [types/eventMetric.ts:120](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventMetric.ts#L120)

Event type to get metrics for (e.g., "een.motionDetectionEvent.v1")

***

### timestamp\_\_gte?

> `optional` **timestamp\_\_gte**: `string`

Defined in: [types/eventMetric.ts:122](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventMetric.ts#L122)

ISO 8601 timestamp - metrics starting at or after this time (defaults to 7 days ago)

***

### timestamp\_\_lte?

> `optional` **timestamp\_\_lte**: `string`

Defined in: [types/eventMetric.ts:124](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventMetric.ts#L124)

ISO 8601 timestamp - metrics ending before this time (defaults to now)

***

### aggregateByMinutes?

> `optional` **aggregateByMinutes**: `number`

Defined in: [types/eventMetric.ts:126](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventMetric.ts#L126)

Aggregation bucket size in minutes (default: 60)
