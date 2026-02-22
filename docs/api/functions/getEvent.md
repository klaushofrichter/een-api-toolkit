[**EEN API Toolkit v0.3.93**](../README.md)

***

[EEN API Toolkit](../README.md) / getEvent

# Function: getEvent()

> **getEvent**(`eventId`, `params?`): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`Event`](../interfaces/Event.md)\>\>

Defined in: [events/service.ts:189](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/events/service.ts#L189)

Get a specific event by ID.

## Parameters

### eventId

`string`

The unique identifier of the event to fetch

### params?

[`GetEventParams`](../interfaces/GetEventParams.md)

Optional parameters (e.g., include additional data schemas)

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`Event`](../interfaces/Event.md)\>\>

A Result containing the event or an error

## Remarks

Fetches a single event from `/api/v3.0/events/{eventId}`. Use the `include`
parameter to request additional data schemas.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/getevent).

## Example

```typescript
import { getEvent } from 'een-api-toolkit'

const { data, error } = await getEvent('event-123')

if (error) {
  if (error.code === 'NOT_FOUND') {
    console.log('Event not found')
  }
  return
}

console.log(`Event: ${data.type} at ${data.startTimestamp}`)

// With additional data schemas
const { data: eventWithData } = await getEvent('event-123', {
  include: ['data.een.objectDetection.v1', 'data.een.fullFrameImageUrl.v1']
})
```
