[**EEN API Toolkit v0.3.110**](../README.md)

***

[EEN API Toolkit](../README.md) / eventTypeHasDataSchemas

# Function: eventTypeHasDataSchemas()

> **eventTypeHasDataSchemas**(`eventType`): `boolean`

Defined in: [events/dataSchemas.ts:694](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/events/dataSchemas.ts#L694)

Check if an event type has any associated data schemas.

## Parameters

### eventType

`string`

The event type identifier

## Returns

`boolean`

True if the event type has data schemas, false otherwise

## Remarks

Returns true if the event type has at least one associated data schema.
Useful for determining whether to include the `include` parameter in API calls.

## Example

```typescript
import { eventTypeHasDataSchemas } from 'een-api-toolkit'

if (eventTypeHasDataSchemas('een.personDetectionEvent.v1')) {
  // Include data schemas in the API call
}
```
