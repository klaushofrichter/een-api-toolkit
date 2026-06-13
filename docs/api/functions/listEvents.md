[**EEN API Toolkit v0.3.109**](../README.md)

***

[EEN API Toolkit](../README.md) / listEvents

# Function: listEvents()

> **listEvents**(`params`): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`Event`](../interfaces/Event.md)\>\>\>

Defined in: [events/service.ts:66](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/events/service.ts#L66)

List events with required filters and optional pagination.

## Parameters

### params

[`ListEventsParams`](../interfaces/ListEventsParams.md)

Required and optional filtering parameters

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`Event`](../interfaces/Event.md)\>\>\>

A Result containing a paginated list of events or an error

## Remarks

Fetches a paginated list of events from `/api/v3.0/events`. The `actor`,
`type__in`, and `startTimestamp__gte` parameters are required.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listevents).

## Example

```typescript
import { listEvents } from 'een-api-toolkit'

// Get motion events from a camera in the last hour
const { data, error } = await listEvents({
  actor: 'camera:100d4c41',
  type__in: ['een.motionDetectionEvent.v1'],
  startTimestamp__gte: new Date(Date.now() - 3600000).toISOString()
})

if (data) {
  console.log(`Found ${data.results.length} events`)
  data.results.forEach(event => {
    console.log(`${event.type} at ${event.startTimestamp}`)
  })
}

// Fetch all events with pagination
let allEvents: Event[] = []
let pageToken: string | undefined
do {
  const { data, error } = await listEvents({
    actor: 'camera:100d4c41',
    type__in: ['een.motionDetectionEvent.v1'],
    startTimestamp__gte: new Date(Date.now() - 86400000).toISOString(),
    pageSize: 100,
    pageToken
  })
  if (error) break
  allEvents.push(...data.results)
  pageToken = data.nextPageToken
} while (pageToken)
```
