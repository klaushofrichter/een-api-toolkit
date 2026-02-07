[**EEN API Toolkit v0.3.63**](../README.md)

***

[EEN API Toolkit](../README.md) / getAllKnownEventTypes

# Function: getAllKnownEventTypes()

> **getAllKnownEventTypes**(): `string`[]

Defined in: [src/events/dataSchemas.ts:750](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/events/dataSchemas.ts#L750)

Get all known event types.

## Returns

`string`[]

Array of all known event type identifiers

## Remarks

Returns an array of all event type identifiers defined in the mapping.

## Example

```typescript
import { getAllKnownEventTypes } from 'een-api-toolkit'

const allTypes = getAllKnownEventTypes()
// ['een.motionDetectionEvent.v1', 'een.personDetectionEvent.v1', ...]
```
