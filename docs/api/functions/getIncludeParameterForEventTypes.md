[**EEN API Toolkit v0.3.103**](../README.md)

***

[EEN API Toolkit](../README.md) / getIncludeParameterForEventTypes

# Function: getIncludeParameterForEventTypes()

> **getIncludeParameterForEventTypes**(`eventTypes`): `string`[]

Defined in: [events/dataSchemas.ts:660](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/events/dataSchemas.ts#L660)

Get the include parameter values for multiple event types.

## Parameters

### eventTypes

`string`[]

Array of event type identifiers

## Returns

`string`[]

Array of include parameter values (with "data." prefix), deduplicated

## Remarks

Combines all data schemas from the specified event types, removes duplicates,
and returns them with the required "data." prefix for use in the `include` parameter.

## Example

```typescript
import { getIncludeParameterForEventTypes, listEvents } from 'een-api-toolkit'

const selectedTypes = ['een.personDetectionEvent.v1', 'een.vehicleDetectionEvent.v1']
const includeValues = getIncludeParameterForEventTypes(selectedTypes)

// Use in API call
const result = await listEvents({
  actor: `camera:${cameraId}`,
  type__in: selectedTypes,
  startTimestamp__gte: startTime,
  include: includeValues
})
```
