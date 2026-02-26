[**EEN API Toolkit v0.3.103**](../README.md)

***

[EEN API Toolkit](../README.md) / getAllDataSchemas

# Function: getAllDataSchemas()

> **getAllDataSchemas**(): `string`[]

Defined in: [events/dataSchemas.ts:750](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/events/dataSchemas.ts#L750)

Get all unique data schemas across all event types.

## Returns

`string`[]

Array of all unique data schema names

## Remarks

Returns a deduplicated array of all data schema names defined in the mapping.
Useful for understanding the complete set of available data schemas.

## Example

```typescript
import { getAllDataSchemas } from 'een-api-toolkit'

const allSchemas = getAllDataSchemas()
// ['een.objectDetection.v1', 'een.fullFrameImageUrl.v1', ...]
```
