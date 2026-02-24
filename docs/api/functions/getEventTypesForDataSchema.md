[**EEN API Toolkit v0.3.101**](../README.md)

***

[EEN API Toolkit](../README.md) / getEventTypesForDataSchema

# Function: getEventTypesForDataSchema()

> **getEventTypesForDataSchema**(`schema`): `string`[]

Defined in: [events/dataSchemas.ts:689](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/events/dataSchemas.ts#L689)

Get all known event types that have the specified data schema.

## Parameters

### schema

`string`

The data schema name (without "data." prefix)

## Returns

`string`[]

Array of event type identifiers that support the schema

## Remarks

Returns an array of event types that include the specified data schema.
Useful for finding which event types support a particular data feature.

## Example

```typescript
import { getEventTypesForDataSchema } from 'een-api-toolkit'

const eventTypes = getEventTypesForDataSchema('een.objectDetection.v1')
// ['een.motionDetectionEvent.v1', 'een.personDetectionEvent.v1', ...]
```
