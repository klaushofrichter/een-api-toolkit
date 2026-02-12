[**EEN API Toolkit v0.3.75**](../README.md)

***

[EEN API Toolkit](../README.md) / ListEventsParams

# Interface: ListEventsParams

Defined in: [types/event.ts:154](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/event.ts#L154)

Parameters for listing events.

## Remarks

Supports filtering events by actor, type, and time range. The `actor`, `type__in`,
and `startTimestamp__gte` parameters are required.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listevents).

## Example

```typescript
import { listEvents } from 'een-api-toolkit'

// Get motion events from a camera in the last hour
const { data } = await listEvents({
  actor: 'camera:100d4c41',
  type__in: ['een.motionDetectionEvent.v1'],
  startTimestamp__gte: new Date(Date.now() - 3600000).toISOString(),
  pageSize: 50,
  include: ['data.een.objectDetection.v1']
})

// Fetch next page
if (data?.nextPageToken) {
  const { data: page2 } = await listEvents({
    actor: 'camera:100d4c41',
    type__in: ['een.motionDetectionEvent.v1'],
    startTimestamp__gte: new Date(Date.now() - 3600000).toISOString(),
    pageToken: data.nextPageToken
  })
}
```

## Properties

### pageSize?

> `optional` **pageSize**: `number`

Defined in: [types/event.ts:157](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/event.ts#L157)

Number of results per page (default: 100)

***

### pageToken?

> `optional` **pageToken**: `string`

Defined in: [types/event.ts:159](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/event.ts#L159)

Token for fetching a specific page

***

### actor

> **actor**: `string`

Defined in: [types/event.ts:163](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/event.ts#L163)

Actor to filter by (format: "type:id", e.g., "camera:100d4c41")

***

### type\_\_in

> **type\_\_in**: `string`[]

Defined in: [types/event.ts:165](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/event.ts#L165)

Event types to include (e.g., ["een.motionDetectionEvent.v1"])

***

### startTimestamp\_\_gte

> **startTimestamp\_\_gte**: `string`

Defined in: [types/event.ts:167](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/event.ts#L167)

ISO 8601 timestamp - events starting at or after this time

***

### startTimestamp\_\_lte?

> `optional` **startTimestamp\_\_lte**: `string`

Defined in: [types/event.ts:171](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/event.ts#L171)

ISO 8601 timestamp - events starting before this time

***

### endTimestamp\_\_gte?

> `optional` **endTimestamp\_\_gte**: `string`

Defined in: [types/event.ts:173](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/event.ts#L173)

ISO 8601 timestamp - events ending at or after this time

***

### endTimestamp\_\_lte?

> `optional` **endTimestamp\_\_lte**: `string`

Defined in: [types/event.ts:175](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/event.ts#L175)

ISO 8601 timestamp - events ending before this time

***

### sort?

> `optional` **sort**: `"+startTimestamp"` \| `"-startTimestamp"`

Defined in: [types/event.ts:179](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/event.ts#L179)

Sort order for results

***

### include?

> `optional` **include**: `string`[]

Defined in: [types/event.ts:183](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/event.ts#L183)

Data schemas to include (e.g., ["data.een.objectDetection.v1"])
