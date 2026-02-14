[**EEN API Toolkit v0.3.79**](../README.md)

***

[EEN API Toolkit](../README.md) / getDataSchemasForEventType

# Function: getDataSchemasForEventType()

> **getDataSchemasForEventType**(`eventType`): readonly `string`[]

Defined in: [events/dataSchemas.ts:598](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/events/dataSchemas.ts#L598)

Get the data schemas supported by a specific event type.

## Parameters

### eventType

`string`

The event type identifier (e.g., "een.personDetectionEvent.v1")

## Returns

readonly `string`[]

Array of data schema names (without "data." prefix)

## Remarks

Returns an array of data schema names for the given event type.
If the event type is not recognized, returns an empty array.

## Example

```typescript
import { getDataSchemasForEventType } from 'een-api-toolkit'

const schemas = getDataSchemasForEventType('een.personDetectionEvent.v1')
// ['een.objectDetection.v1', 'een.personAttributes.v1', ...]
```
