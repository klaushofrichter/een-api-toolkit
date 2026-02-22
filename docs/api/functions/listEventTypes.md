[**EEN API Toolkit v0.3.94**](../README.md)

***

[EEN API Toolkit](../README.md) / listEventTypes

# Function: listEventTypes()

> **listEventTypes**(`params?`): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`EventType`](../interfaces/EventType.md)\>\>\>

Defined in: [events/service.ts:266](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/events/service.ts#L266)

List all available event types.

## Parameters

### params?

[`ListEventTypesParams`](../interfaces/ListEventTypesParams.md)

Optional pagination and language parameters

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`EventType`](../interfaces/EventType.md)\>\>\>

A Result containing a paginated list of event types or an error

## Remarks

Fetches a paginated list of event types from `/api/v3.0/eventTypes`. Event types
describe the different kinds of events that can be generated in the system.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listeventtypes).

## Example

```typescript
import { listEventTypes } from 'een-api-toolkit'

const { data, error } = await listEventTypes()
if (data) {
  data.results.forEach(eventType => {
    console.log(`${eventType.name}: ${eventType.description}`)
  })
}

// With language parameter
const { data: localizedTypes } = await listEventTypes({ language: 'de' })
```
