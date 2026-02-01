[**EEN API Toolkit v0.3.48**](../README.md)

***

[EEN API Toolkit](../README.md) / listEventFieldValues

# Function: listEventFieldValues()

> **listEventFieldValues**(`params`): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`EventFieldValues`](../interfaces/EventFieldValues.md)\>\>

Defined in: [src/events/service.ts:348](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/events/service.ts#L348)

List available event field values for a specific actor.

## Parameters

### params

[`ListEventFieldValuesParams`](../interfaces/ListEventFieldValuesParams.md)

Parameters including the actor to query

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`EventFieldValues`](../interfaces/EventFieldValues.md)\>\>

A Result containing available field values or an error

## Remarks

Fetches available event types for a specific actor from
`/api/v3.0/events:listFieldValues`. This is useful for building filter UIs
to know which event types are available for a camera or other device.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listeventfieldvalues).

## Example

```typescript
import { listEventFieldValues } from 'een-api-toolkit'

const { data, error } = await listEventFieldValues({
  actor: 'camera:100d4c41'
})

if (data) {
  console.log('Available event types:', data.type)
  // Use these types to filter the listEvents call
}
```
